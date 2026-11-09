import React, { useState, useMemo, useEffect } from 'react';
import {
  Wallet,
  Receipt as ReceiptIcon,
  TrendingUp,
  Percent,
  PiggyBank,
  PlusCircle,
  Calendar,
  ChevronRight,
  CreditCard,
  Coins,
  ArrowUpRight,
  Sparkles,
  Target,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  X,
  Plus,
} from 'lucide-react';
import { Receipt, Language, ExpenseCategory, CategoryDefinition } from '../types';
import { translations } from '../utils/translations';
import { formatAmount, formatFullJalali, toPersianDigits, PERSIAN_MONTHS } from '../utils/jalali';
import { getCategoryMeta, getCategoryLabel } from '../utils/categoryTheme';

interface DashboardViewProps {
  receipts: Receipt[];
  categories: CategoryDefinition[];
  onOpenAddCategoryModal: () => void;
  selectedMonth: string; // "ALL" or "YYYY-MM"
  setSelectedMonth: (m: string) => void;
  lang: Language;
  usePersianDigits: boolean;
  onOpenScanModal: () => void;
  onViewReceipt: (r: Receipt) => void;
  onNavigateToTab: (tab: 'dashboard' | 'receipts' | 'scan' | 'reports' | 'settings') => void;
  onLoadDemoData: () => void;
}

const DEFAULT_CATEGORY_BUDGETS: Record<string, number> = {
  groceries: 2000000,
  dining: 1000000,
  shopping: 3000000,
  transport: 500000,
  utilities: 400000,
  health: 600000,
  entertainment: 800000,
  work: 500000,
  other: 400000,
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  receipts,
  categories,
  onOpenAddCategoryModal,
  selectedMonth,
  setSelectedMonth,
  lang,
  usePersianDigits,
  onOpenScanModal,
  onViewReceipt,
  onNavigateToTab,
  onLoadDemoData,
}) => {
  const t = translations[lang];

  // Category Budgets State
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('boodjam_budgets_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved budgets', e);
    }
    return DEFAULT_CATEGORY_BUDGETS;
  });

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudgets, setEditingBudgets] = useState<Record<string, number>>(categoryBudgets);

  // Keep editingBudgets in sync if categoryBudgets updates externally
  useEffect(() => {
    setEditingBudgets(categoryBudgets);
  }, [categoryBudgets]);

  // Sync budgets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('boodjam_budgets_v1', JSON.stringify(categoryBudgets));
    } catch (e) {
      console.error('Failed to save budgets', e);
    }
  }, [categoryBudgets]);

  // Distinct available months in receipts
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    receipts.forEach((r) => {
      if (r.date && r.date.length >= 7) {
        set.add(r.date.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [receipts]);

  // Filtered receipts by selected month
  const filteredReceipts = useMemo(() => {
    if (selectedMonth === 'ALL') return receipts;
    return receipts.filter((r) => r.date && r.date.startsWith(selectedMonth));
  }, [receipts, selectedMonth]);

  // Calculations for current selection
  const totalAmount = useMemo(() => {
    return filteredReceipts.reduce((sum, r) => sum + (r.total || 0), 0);
  }, [filteredReceipts]);

  const totalTax = useMemo(() => {
    return filteredReceipts.reduce((sum, r) => sum + (r.tax || 0), 0);
  }, [filteredReceipts]);

  const avgReceipt = useMemo(() => {
    return filteredReceipts.length > 0 ? totalAmount / filteredReceipts.length : 0;
  }, [filteredReceipts, totalAmount]);

  // Spending by category map
  const categorySpendingMap = useMemo(() => {
    const map: Partial<Record<string, { total: number; count: number }>> = {};
    filteredReceipts.forEach((r) => {
      const cat = r.category || 'other';
      if (!map[cat]) map[cat] = { total: 0, count: 0 };
      map[cat]!.total += r.total || 0;
      map[cat]!.count += 1;
    });
    return map;
  }, [filteredReceipts]);

  // Spending by category sorted list
  const categoryStats = useMemo(() => {
    const entries = Object.entries(categorySpendingMap)
      .filter((entry): entry is [string, { total: number; count: number }] => entry[1] !== undefined)
      .map(([catKey, data]) => ({
        category: catKey,
        total: data.total,
        count: data.count,
        percentage: totalAmount > 0 ? (data.total / totalAmount) * 100 : 0,
      }));

    return entries.sort((a, b) => b.total - a.total);
  }, [categorySpendingMap, totalAmount]);

  // Top category
  const topCategory = categoryStats[0] || null;

  // Daily Spending distribution (for the month)
  const dailySpending = useMemo(() => {
    const dayMap: Record<string, number> = {};
    filteredReceipts.forEach((r) => {
      const day = r.date ? r.date.slice(8, 10) : '01';
      dayMap[day] = (dayMap[day] || 0) + (r.total || 0);
    });

    const sortedDays = Object.entries(dayMap).sort(([a], [b]) => parseInt(a, 10) - parseInt(b, 10));
    const maxDayTotal = Math.max(...Object.values(dayMap), 1);

    return { days: sortedDays, maxTotal: maxDayTotal };
  }, [filteredReceipts]);

  // Payment method breakdown
  const paymentMethodStats = useMemo(() => {
    const map: Record<string, number> = {};
    filteredReceipts.forEach((r) => {
      const method = r.paymentMethod || (lang === 'fa' ? 'کارت بانکی' : 'Card');
      map[method] = (map[method] || 0) + (r.total || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredReceipts, lang]);

  // Primary currency
  const primaryCurrency = filteredReceipts[0]?.currency || 'IRT';

  // Overall Budget Calculations
  const allCategoryKeys = useMemo(() => {
    return categories.map((c) => c.id);
  }, [categories]);

  const totalBudgetGoal = useMemo(() => {
    return Object.values(categoryBudgets).reduce((sum, v) => sum + (v || 0), 0);
  }, [categoryBudgets]);

  const overallBudgetPercentage = totalBudgetGoal > 0 ? (totalAmount / totalBudgetGoal) * 100 : 0;
  const overallRemainingBudget = Math.max(0, totalBudgetGoal - totalAmount);
  const isOverallOverBudget = totalAmount > totalBudgetGoal;

  // Save budget changes
  const handleSaveBudgets = () => {
    setCategoryBudgets(editingBudgets);
    setIsBudgetModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header & Month Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{t.dashboard}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {filteredReceipts.length} {t.receipts}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.appTagline}</p>
        </div>

        {/* Month Selector & Quick Actions */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="ALL">{t.allTime}</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m === '2026-11' ? (lang === 'fa' ? 'آبان ۱۴۰۵ (جاری)' : 'November 2026 (Current)') : m}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenScanModal}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.scanReceipt}</span>
          </button>
        </div>
      </div>

      {/* Empty State Banner if no receipts */}
      {receipts.length === 0 && (
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-200 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t.noReceiptsYet}</h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">{t.noReceiptsDesc}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenScanModal}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              {t.scanNewReceipt}
            </button>
            <button
              onClick={onLoadDemoData}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs sm:text-sm font-bold transition-all"
            >
              {t.loadDemoData}
            </button>
          </div>
        </div>
      )}

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Monthly Spending */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">{t.totalSpending}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatAmount(totalAmount, primaryCurrency, usePersianDigits, lang)}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>
              {selectedMonth === 'ALL'
                ? t.allTime
                : `${filteredReceipts.length} ${lang === 'fa' ? 'فاکتور ثبت شده' : 'receipts'}`}
            </span>
          </p>
        </div>

        {/* Receipts Count */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">{t.receiptCount}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ReceiptIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            {usePersianDigits ? toPersianDigits(filteredReceipts.length) : filteredReceipts.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {lang === 'fa' ? 'فاکتور پردازش شده با OCR' : 'Scanned receipts processed'}
          </p>
        </div>

        {/* Average Receipt */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">{t.averageReceipt}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            {formatAmount(avgReceipt, primaryCurrency, usePersianDigits, lang)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {lang === 'fa' ? 'میانگین هر تراکنش' : 'Average expense ticket'}
          </p>
        </div>

        {/* Top Spending Category */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-purple-300 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">{t.topCategory}</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-xl font-black text-slate-900 truncate">
            {topCategory ? getCategoryLabel(topCategory.category, categories, lang) : '—'}
          </div>
          <p className="text-[11px] text-purple-700 font-bold mt-1">
            {topCategory
              ? `${usePersianDigits ? toPersianDigits(topCategory.percentage.toFixed(0)) : topCategory.percentage.toFixed(0)}٪ ${lang === 'fa' ? 'از کل مخارج' : 'of monthly spend'}`
              : '—'}
          </p>
        </div>
      </div>

      {/* FEATURE: Monthly Category Budgets & Spending Progress Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        {/* Section Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-900">
                  {t.monthlyBudgetGoals}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isOverallOverBudget
                      ? 'bg-rose-100 text-rose-800'
                      : overallBudgetPercentage > 80
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isOverallOverBudget
                    ? t.overBudget
                    : overallBudgetPercentage > 80
                      ? t.nearLimit
                      : t.onTrack}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{t.setCategoryBudgetsDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Quick Add Category CTA */}
            <button
              onClick={onOpenAddCategoryModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? 'افزودن دسته جدید' : 'New Category'}</span>
            </button>

            {/* Manage Category Budgets Button */}
            <button
              onClick={() => {
                setEditingBudgets(categoryBudgets);
                setIsBudgetModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all shadow-2xs"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.manageBudgets}</span>
            </button>
          </div>
        </div>

        {/* Overall Total Budget Summary Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200/90 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-800 text-sm">
                {lang === 'fa' ? 'مجموع کل بودجه ماهانه:' : 'Total Monthly Budget Goal:'}
              </span>
              <span className="font-black text-emerald-700 text-sm">
                {formatAmount(totalBudgetGoal, primaryCurrency, usePersianDigits, lang)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-500">
                {lang === 'fa' ? 'مصرف شده:' : 'Spent:'}{' '}
                <strong className="text-slate-900">
                  {formatAmount(totalAmount, primaryCurrency, usePersianDigits, lang)}
                </strong>
              </span>
              <span>•</span>
              <span className={isOverallOverBudget ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                {isOverallOverBudget
                  ? `${formatAmount(totalAmount - totalBudgetGoal, primaryCurrency, usePersianDigits, lang)} ${t.overBudget}`
                  : `${formatAmount(overallRemainingBudget, primaryCurrency, usePersianDigits, lang)} ${t.remainingBudget}`}
              </span>
            </div>
          </div>

          {/* Master Progress Bar */}
          <div className="space-y-1">
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isOverallOverBudget
                    ? 'bg-gradient-to-r from-rose-500 to-red-600'
                    : overallBudgetPercentage > 80
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                }`}
                style={{ width: `${Math.min(overallBudgetPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-bold text-slate-400">
              <span>0%</span>
              <span
                className={
                  isOverallOverBudget
                    ? 'text-rose-600 font-black'
                    : overallBudgetPercentage > 80
                      ? 'text-amber-600 font-black'
                      : 'text-emerald-700 font-black'
                }
              >
                {usePersianDigits
                  ? `${toPersianDigits(overallBudgetPercentage.toFixed(1))}٪`
                  : `${overallBudgetPercentage.toFixed(1)}%`}
              </span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Category Budget Progress Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {allCategoryKeys.map((catKey) => {
            const meta = getCategoryMeta(catKey, categories);
            const IconComp = meta.icon;
            const budgetGoal = categoryBudgets[catKey] || 0;
            const spent = categorySpendingMap[catKey]?.total || 0;
            const ratio = budgetGoal > 0 ? (spent / budgetGoal) * 100 : 0;
            const isOver = spent > budgetGoal && budgetGoal > 0;
            const isNear = ratio >= 75 && !isOver;
            const remaining = Math.max(0, budgetGoal - spent);
            const catLabel = getCategoryLabel(catKey, categories, lang);
            const catDef = categories.find((c) => c.id === catKey);

            return (
              <div
                key={catKey}
                className={`p-4 rounded-xl border transition-all duration-200 relative group ${
                  isOver
                    ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                    : isNear
                      ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header: Icon + Name + Percentage Badge */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${meta.color}15`,
                        borderColor: `${meta.color}35`,
                        color: meta.color,
                      }}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-800">{catLabel}</span>
                      {catDef?.isCustom && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-bold">
                          {lang === 'fa' ? 'سفارشی' : 'Custom'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                        isOver
                          ? 'bg-rose-100 text-rose-700 font-bold'
                          : isNear
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {budgetGoal > 0
                        ? usePersianDigits
                          ? `${toPersianDigits(ratio.toFixed(0))}٪`
                          : `${ratio.toFixed(0)}%`
                        : t.noBudgetSet}
                    </span>
                    <button
                      onClick={() => {
                        setEditingBudgets(categoryBudgets);
                        setIsBudgetModalOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-emerald-700 transition-opacity"
                      title={t.manageBudgets}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amount Details: Actual vs Goal */}
                <div className="flex items-baseline justify-between text-xs mb-1.5">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t.budgetUsed}</span>
                    <span className="font-extrabold text-slate-900">
                      {formatAmount(spent, primaryCurrency, usePersianDigits, lang)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">{t.budgetGoal}</span>
                    <span className="font-bold text-slate-600">
                      {budgetGoal > 0
                        ? formatAmount(budgetGoal, primaryCurrency, usePersianDigits, lang)
                        : '—'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar Comparing Actual vs Set Budget */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? 'bg-rose-500'
                        : isNear
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${budgetGoal > 0 ? Math.min(ratio, 100) : 0}%`,
                    }}
                  />
                </div>

                {/* Remaining or Over-budget footer note */}
                <div className="flex items-center justify-between text-[10px] font-semibold">
                  {isOver ? (
                    <span className="text-rose-600 flex items-center gap-1 font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>
                        {formatAmount(spent - budgetGoal, primaryCurrency, usePersianDigits, lang)}{' '}
                        {t.overBudget}
                      </span>
                    </span>
                  ) : budgetGoal > 0 ? (
                    <span className="text-slate-500">
                      <span>{t.remainingBudget}:</span>{' '}
                      <strong className="text-emerald-700">
                        {formatAmount(remaining, primaryCurrency, usePersianDigits, lang)}
                      </strong>
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">{t.noBudgetSet}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Charts & Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">{t.spendingByCategory}</h3>
              <p className="text-xs text-slate-500">
                {lang === 'fa'
                  ? 'تفکیک مخارج به تفکیک دسته‌های استاندارد و سفارشی'
                  : 'Automated expense categorization distribution'}
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('reports')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>{t.reportsExport}</span>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>

          {categoryStats.length > 0 ? (
            <div className="space-y-3.5">
              {categoryStats.map((item) => {
                const meta = getCategoryMeta(item.category, categories);
                const IconComponent = meta.icon;
                const catLabel = getCategoryLabel(item.category, categories, lang);
                return (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center border"
                          style={{
                            backgroundColor: `${meta.color}15`,
                            borderColor: `${meta.color}35`,
                            color: meta.color,
                          }}
                        >
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-slate-800">{catLabel}</span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          ({usePersianDigits ? toPersianDigits(item.count) : item.count}{' '}
                          {lang === 'fa' ? 'رسید' : 'receipts'})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-slate-900">
                          {formatAmount(item.total, primaryCurrency, usePersianDigits, lang)}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 mx-1.5">
                          {usePersianDigits
                            ? `${toPersianDigits(item.percentage.toFixed(1))}٪`
                            : `${item.percentage.toFixed(1)}%`}
                        </span>
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(item.percentage, 3)}%`,
                          backgroundColor: meta.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              {lang === 'fa' ? 'اطلاعاتی برای این ماه ثبت نشده است' : 'No data recorded for this period'}
            </div>
          )}
        </div>

        {/* Daily Spending Trend (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{t.dailySpendingTrend}</h3>
                <p className="text-xs text-slate-500">
                  {lang === 'fa' ? 'میزان مخارج در روزهای مختلف ماه' : 'Day-by-day expense timeline'}
                </p>
              </div>
            </div>

            {dailySpending.days.length > 0 ? (
              <div className="pt-6 pb-2">
                <div className="h-36 flex items-end gap-1 sm:gap-2 justify-between">
                  {dailySpending.days.map(([day, amount]) => {
                    const heightPercent = Math.max((amount / dailySpending.maxTotal) * 100, 8);
                    return (
                      <div
                        key={day}
                        className="flex-1 flex flex-col items-center gap-1.5 group relative"
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg">
                          {formatAmount(amount, primaryCurrency, usePersianDigits, lang)}
                        </div>
                        {/* Bar */}
                        <div
                          className="w-full max-w-[20px] bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-md group-hover:brightness-110 transition-all duration-300"
                          style={{ height: `${heightPercent}%` }}
                        />
                        {/* Day Label */}
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-900">
                          {usePersianDigits ? toPersianDigits(day) : day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                {lang === 'fa' ? 'هیچ پرداختی در این ماه ثبت نشده' : 'No expenses in this month'}
              </div>
            )}
          </div>

          {/* Payment Methods Footer */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t.paymentMethods}</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {paymentMethodStats.map(([method, amount]) => (
                <div
                  key={method}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5"
                >
                  <span>{method}</span>
                  <span className="font-extrabold text-slate-900">
                    {formatAmount(amount, primaryCurrency, usePersianDigits, lang)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Receipts Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-slate-900">{t.recentReceipts}</h3>
            <span className="text-xs text-slate-400 font-semibold">
              ({Math.min(filteredReceipts.length, 5)} {t.receipts})
            </span>
          </div>
          <button
            onClick={() => onNavigateToTab('receipts')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>{t.viewAll}</span>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>

        {filteredReceipts.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredReceipts.slice(0, 5).map((r) => {
              const meta = getCategoryMeta(r.category, categories);
              const IconComp = meta.icon;
              const catLabel = getCategoryLabel(r.category, categories, lang);
              return (
                <div
                  key={r.id}
                  onClick={() => onViewReceipt(r)}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-50/80 rounded-xl cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${meta.color}15`,
                        borderColor: `${meta.color}35`,
                        color: meta.color,
                      }}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {r.merchant}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="font-medium">
                          {r.jalaliDate || formatFullJalali(r.date, usePersianDigits)}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-slate-600">
                          {catLabel}
                        </span>
                        {r.paymentMethod && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline text-slate-400">{r.paymentMethod}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-sm sm:text-base text-slate-900">
                      {formatAmount(r.total, r.currency, usePersianDigits, lang)}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {r.items?.length
                        ? `${usePersianDigits ? toPersianDigits(r.items.length) : r.items.length} ${lang === 'fa' ? 'قلم کالا' : 'items'}`
                        : r.referenceNumber
                          ? `Ref: ${r.referenceNumber.slice(-4)}`
                          : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">{t.noReceiptsFound}</div>
        )}
      </div>

      {/* Budget Goals Management Modal */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">{t.manageBudgets}</h3>
                  <p className="text-xs text-slate-500">{t.setCategoryBudgetsDesc}</p>
                </div>
              </div>
              <button
                onClick={() => setIsBudgetModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Category Budgets Inputs */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
              {/* Button to add new custom category right inside budget modal */}
              <button
                type="button"
                onClick={() => {
                  setIsBudgetModalOpen(false);
                  onOpenAddCategoryModal();
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'fa' ? '+ ایجاد دسته‌بندی هزینه جدید' : '+ Create New Cost Category'}</span>
              </button>

              {allCategoryKeys.map((catKey) => {
                const meta = getCategoryMeta(catKey, categories);
                const IconComp = meta.icon;
                const currentVal = editingBudgets[catKey] ?? 0;
                const catDef = categories.find((c) => c.id === catKey);

                return (
                  <div
                    key={catKey}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${meta.color}15`,
                          borderColor: `${meta.color}35`,
                          color: meta.color,
                        }}
                      >
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>{getCategoryLabel(catKey, categories, lang)}</span>
                          {catDef?.isCustom && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-bold">
                              {lang === 'fa' ? 'سفارشی' : 'Custom'}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {lang === 'fa' ? 'سقف مجاز هزینه ماهانه' : 'Monthly spending cap'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step={50000}
                        value={currentVal || ''}
                        onChange={(e) => {
                          const val = Math.max(0, parseFloat(e.target.value) || 0);
                          setEditingBudgets({ ...editingBudgets, [catKey]: val });
                        }}
                        placeholder="0"
                        className="w-36 px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-bold text-slate-900 text-left rtl:text-right bg-white"
                      />
                      <span className="text-xs font-bold text-slate-500 w-12">
                        {lang === 'fa' ? 'تومان' : primaryCurrency}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setIsBudgetModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                {t.cancel}
              </button>

              <button
                onClick={handleSaveBudgets}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.saveBudgets}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

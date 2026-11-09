import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  FileText,
  FileCode,
  Printer,
  Calendar,
  CheckCircle2,
  Download,
  Share2,
  PieChart,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Receipt, Language, ExpenseCategory, CategoryDefinition } from '../types';
import { translations } from '../utils/translations';
import { formatAmount, formatFullJalali, toPersianDigits } from '../utils/jalali';
import { exportToExcel, exportToCSV, exportToPDF } from '../utils/exportUtils';
import { getCategoryLabel } from '../utils/categoryTheme';

interface ReportsExportViewProps {
  receipts: Receipt[];
  categories: CategoryDefinition[];
  lang: Language;
  usePersianDigits: boolean;
}

export const ReportsExportView: React.FC<ReportsExportViewProps> = ({
  receipts,
  categories,
  lang,
  usePersianDigits,
}) => {
  const t = translations[lang];

  // Distinct months
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    receipts.forEach((r) => {
      if (r.date && r.date.length >= 7) {
        set.add(r.date.slice(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [receipts]);

  const [selectedRange, setSelectedRange] = useState<string>(
    availableMonths[0] || 'ALL'
  );
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Filtered receipts
  const filteredReceipts = useMemo(() => {
    if (selectedRange === 'ALL') return receipts;
    return receipts.filter((r) => r.date && r.date.startsWith(selectedRange));
  }, [receipts, selectedRange]);

  // Period label
  const periodLabel = useMemo(() => {
    if (selectedRange === 'ALL') return lang === 'fa' ? 'تمام ماه‌ها (کل هزینه‌ها)' : 'All Time';
    if (selectedRange === '2026-11') return lang === 'fa' ? 'آبان ۱۴۰۵ (نوامبر ۲۰۲۶)' : 'November 2026';
    if (selectedRange === '2026-10') return lang === 'fa' ? 'مهر ۱۴۰۵ (اکتبر ۲۰۲۶)' : 'October 2026';
    return selectedRange;
  }, [selectedRange, lang]);

  // Aggregate metrics
  const totalAmount = useMemo(
    () => filteredReceipts.reduce((sum, r) => sum + (r.total || 0), 0),
    [filteredReceipts]
  );
  const totalTax = useMemo(
    () => filteredReceipts.reduce((sum, r) => sum + (r.tax || 0), 0),
    [filteredReceipts]
  );
  const primaryCurrency = filteredReceipts[0]?.currency || 'IRT';

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Partial<Record<ExpenseCategory, { total: number; count: number }>> = {};
    filteredReceipts.forEach((r) => {
      const cat = r.category || 'other';
      if (!map[cat]) map[cat] = { total: 0, count: 0 };
      map[cat]!.total += r.total || 0;
      map[cat]!.count += 1;
    });

    return Object.entries(map)
      .filter((entry): entry is [string, { total: number; count: number }] => entry[1] !== undefined)
      .map(([k, v]) => ({
        category: k as ExpenseCategory,
        total: v.total,
        count: v.count,
        percentage: totalAmount > 0 ? (v.total / totalAmount) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredReceipts, totalAmount]);

  // Trigger feedback banner
  const triggerSuccess = (formatName: string) => {
    setDownloadSuccessMessage(
      lang === 'fa'
        ? `گزارش در قالب ${formatName} با موفقیت آماده و دانلود شد.`
        : `Report in ${formatName} format successfully generated & downloaded.`
    );
    setTimeout(() => setDownloadSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            <span>{t.exportTitle}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.exportSubtitle}</p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="bg-transparent text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">{t.allTime}</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {m === '2026-11' ? (lang === 'fa' ? 'آبان ۱۴۰۵ (نوامبر ۲۰۲۶)' : 'November 2026') : m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Success Notification */}
      {downloadSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{downloadSuccessMessage}</span>
        </div>
      )}

      {/* Export Format Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Modern Excel (.xlsx) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-sm text-slate-900">{t.exportExcelXlsx}</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'fa'
                ? 'فایل چندبرگه‌ای شامل خلاصه عملکرد، فهرست کامل فاکتورها و ریز اقلام خریداری شده'
                : 'Multi-sheet workbook with Summary, full transactions log, and itemized lines.'}
            </p>
          </div>
          <button
            onClick={() => {
              exportToExcel(filteredReceipts, periodLabel, lang, 'xlsx', categories);
              triggerSuccess('Excel (.xlsx)');
            }}
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'fa' ? 'دریافت فایل XLSX' : 'Download .xlsx'}</span>
          </button>
        </div>

        {/* Legacy Excel (.xls) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-sm text-slate-900">{t.exportExcelXls}</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800">
                BIFF8
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'fa'
                ? 'فرمت سازگار با سیستم‌های مالی و حسابداری قدیمی، نرم‌افزارهای شرکتی و اکسل ۹۷-۲۰۰۴'
                : 'Compatible with legacy accounting software and older Microsoft Excel 97-2004.'}
            </p>
          </div>
          <button
            onClick={() => {
              exportToExcel(filteredReceipts, periodLabel, lang, 'xls', categories);
              triggerSuccess('MS Excel (.xls)');
            }}
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'fa' ? 'دریافت فایل XLS' : 'Download .xls'}</span>
          </button>
        </div>

        {/* CSV Format */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileCode className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-sm text-slate-900">{t.exportCsv}</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                UTF-8
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'fa'
                ? 'فایل استاندارد CSV با امضای یونیکد BOM جهت جلوگیری از بهم‌ریختگی حروف فارسی در اکسل'
                : 'Comma-separated values with UTF-8 BOM encoding for seamless Excel import.'}
            </p>
          </div>
          <button
            onClick={() => {
              exportToCSV(filteredReceipts, periodLabel, lang, categories);
              triggerSuccess('CSV');
            }}
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'fa' ? 'دریافت فایل CSV' : 'Download .csv'}</span>
          </button>
        </div>

        {/* PDF Document */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-sm text-slate-900">{t.exportPdf}</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                A4
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'fa'
                ? 'سند چاپی شکیل به همراه جداول مالی، سرفصل مخارج و لیست فاکتورها'
                : 'Formatted formal PDF document ready for accounting or tax archiving.'}
            </p>
          </div>
          <button
            onClick={() => {
              exportToPDF(filteredReceipts, periodLabel, lang, categories);
              triggerSuccess('PDF');
            }}
            className="mt-4 w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>{lang === 'fa' ? 'دریافت گزارش PDF' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Report Preview Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              {lang === 'fa' ? 'پیش‌نمایش داده‌های گزارش' : 'Report Data Preview'} ({periodLabel})
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'fa'
                ? 'محتویاتی که در فایل‌های خروجی درج و محاسبه خواهند شد'
                : 'Summary calculations that will be embedded into exported workbooks'}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t.printReport}</span>
          </button>
        </div>

        {/* Snapshot Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">{t.totalSpending}</span>
            <span className="text-base sm:text-lg font-black text-slate-900">
              {formatAmount(totalAmount, primaryCurrency, usePersianDigits, lang)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">{t.receiptCount}</span>
            <span className="text-base sm:text-lg font-black text-slate-900">
              {usePersianDigits ? toPersianDigits(filteredReceipts.length) : filteredReceipts.length}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">{t.totalTax}</span>
            <span className="text-base sm:text-lg font-black text-slate-900">
              {formatAmount(totalTax, primaryCurrency, usePersianDigits, lang)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 block mb-1">{t.averageReceipt}</span>
            <span className="text-base sm:text-lg font-black text-slate-900">
              {formatAmount(
                filteredReceipts.length ? totalAmount / filteredReceipts.length : 0,
                primaryCurrency,
                usePersianDigits,
                lang
              )}
            </span>
          </div>
        </div>

        {/* Category Breakdown Table Preview */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
            {t.spendingByCategory}
          </h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="py-2.5 px-3 text-left rtl:text-right">{t.category}</th>
                  <th className="py-2.5 px-3 text-center">{t.receiptCount}</th>
                  <th className="py-2.5 px-3 text-right rtl:text-left">{t.amount}</th>
                  <th className="py-2.5 px-3 text-right rtl:text-left">{lang === 'fa' ? 'سهم از کل' : 'Share'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryBreakdown.map((row) => (
                  <tr key={row.category} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {getCategoryLabel(row.category, categories, lang)}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-500">
                      {usePersianDigits ? toPersianDigits(row.count) : row.count}
                    </td>
                    <td className="py-2.5 px-3 text-right rtl:text-left font-bold text-slate-900">
                      {formatAmount(row.total, primaryCurrency, usePersianDigits, lang)}
                    </td>
                    <td className="py-2.5 px-3 text-right rtl:text-left font-semibold text-slate-500">
                      {usePersianDigits
                        ? `${toPersianDigits(row.percentage.toFixed(1))}٪`
                        : `${row.percentage.toFixed(1)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

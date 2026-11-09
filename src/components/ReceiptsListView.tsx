import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Calendar,
  CreditCard,
  Hash,
  Download,
  Plus,
  ArrowUpDown,
  Tag,
  Receipt as ReceiptIcon,
  X,
  Printer,
  Edit2,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Receipt, Language, ExpenseCategory, CategoryDefinition } from '../types';
import { translations } from '../utils/translations';
import { formatAmount, formatFullJalali, toPersianDigits } from '../utils/jalali';
import { getCategoryMeta, getCategoryLabel } from '../utils/categoryTheme';

interface ReceiptsListViewProps {
  receipts: Receipt[];
  categories: CategoryDefinition[];
  onOpenAddCategoryModal: () => void;
  onDeleteReceipt: (id: string) => void;
  onEditReceipt: (receipt: Receipt) => void;
  onOpenScanModal: () => void;
  lang: Language;
  usePersianDigits: boolean;
  selectedReceiptForView: Receipt | null;
  setSelectedReceiptForView: (r: Receipt | null) => void;
}

export const ReceiptsListView: React.FC<ReceiptsListViewProps> = ({
  receipts,
  categories,
  onOpenAddCategoryModal,
  onDeleteReceipt,
  onEditReceipt,
  onOpenScanModal,
  lang,
  usePersianDigits,
  selectedReceiptForView,
  setSelectedReceiptForView,
}) => {
  const t = translations[lang];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>(
    'date-desc'
  );
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);

  // Available Currencies
  const availableCurrencies = useMemo(() => {
    const set = new Set<string>();
    receipts.forEach((r) => set.add(r.currency || 'IRT'));
    return Array.from(set);
  }, [receipts]);

  // Filtered & Sorted receipts
  const filteredReceipts = useMemo(() => {
    return receipts
      .filter((r) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchMerchant = r.merchant.toLowerCase().includes(q);
          const matchNotes = (r.notes || '').toLowerCase().includes(q);
          const matchRef = (r.referenceNumber || '').toLowerCase().includes(q);
          const matchItems = (r.items || []).some((it) => it.name.toLowerCase().includes(q));
          if (!matchMerchant && !matchNotes && !matchRef && !matchItems) return false;
        }

        // Category filter
        if (selectedCategory !== 'ALL' && r.category !== selectedCategory) {
          return false;
        }

        // Currency filter
        if (selectedCurrency !== 'ALL' && (r.currency || 'IRT') !== selectedCurrency) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortOrder === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortOrder === 'amount-desc') {
          return (b.total || 0) - (a.total || 0);
        }
        if (sortOrder === 'amount-asc') {
          return (a.total || 0) - (b.total || 0);
        }
        return 0;
      });
  }, [receipts, searchQuery, selectedCategory, selectedCurrency, sortOrder]);

  return (
    <div className="space-y-5">
      {/* Search & Filter Header Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchReceipts}
              className="w-full pl-9 pr-4 py-2 rtl:pl-4 rtl:pr-9 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rtl:right-auto rtl:left-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick CTA: Scan */}
          <button
            onClick={onOpenScanModal}
            className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.scanReceipt}</span>
          </button>
        </div>

        {/* Filter Pills / Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">{t.allCategories}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {lang === 'fa' ? c.labelFa : c.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* Currency Filter */}
          {availableCurrencies.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <span className="text-slate-500 font-bold">$</span>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">{t.allCurrencies}</option>
                {availableCurrencies.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Order */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 ml-auto rtl:ml-0 rtl:mr-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="date-desc">
                {lang === 'fa' ? 'جدیدترین تاریخ' : 'Date: Newest First'}
              </option>
              <option value="date-asc">{lang === 'fa' ? 'قدیمی‌ترین تاریخ' : 'Date: Oldest First'}</option>
              <option value="amount-desc">
                {lang === 'fa' ? 'بیشترین مبلغ' : 'Amount: High to Low'}
              </option>
              <option value="amount-asc">
                {lang === 'fa' ? 'کمترین مبلغ' : 'Amount: Low to High'}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Receipts Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredReceipts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">{t.merchant}</th>
                  <th className="py-3 px-4">{t.category}</th>
                  <th className="py-3 px-4">{t.date}</th>
                  <th className="py-3 px-4">{t.amount}</th>
                  <th className="py-3 px-4 hidden md:table-cell">{t.paymentMethod}</th>
                  <th className="py-3 px-4 text-center">{lang === 'fa' ? 'عملیات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredReceipts.map((r) => {
                  const meta = getCategoryMeta(r.category, categories);
                  const IconComp = meta.icon;
                  const catLabel = getCategoryLabel(r.category, categories, lang);
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedReceiptForView(r)}
                    >
                      {/* Merchant & Thumb */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {r.imageUrl ? (
                            <img
                              src={r.imageUrl}
                              alt="thumb"
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                              <ReceiptIcon className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {r.merchant}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium truncate max-w-[200px]">
                              {r.notes ||
                                (r.items?.length
                                  ? `${r.items.map((i) => i.name).slice(0, 2).join('، ')}...`
                                  : '')}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
                          style={{
                            backgroundColor: `${meta.color}15`,
                            borderColor: `${meta.color}35`,
                            color: meta.color,
                          }}
                        >
                          <IconComp className="w-3 h-3" />
                          <span>{catLabel}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-semibold text-slate-800">
                          {r.jalaliDate || formatFullJalali(r.date, usePersianDigits)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{r.date}</div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {formatAmount(r.total, r.currency, usePersianDigits, lang)}
                        </div>
                        {r.tax ? (
                          <div className="text-[10px] text-slate-400">
                            {lang === 'fa' ? 'مالیات:' : 'Tax:'}{' '}
                            {formatAmount(r.tax, r.currency, usePersianDigits, lang)}
                          </div>
                        ) : null}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 hidden md:table-cell text-slate-600">
                        <div className="flex items-center gap-1 text-xs">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[120px]">
                            {r.paymentMethod || (lang === 'fa' ? 'کارت بانکی' : 'Card')}
                          </span>
                        </div>
                        {r.referenceNumber && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Ref: {r.referenceNumber.slice(-6)}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedReceiptForView(r)}
                            title={t.viewReceiptDetails}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditReceipt(r)}
                            title={t.editReceipt}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidateId(r.id)}
                            title={t.deleteReceipt}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">{t.noReceiptsFound}</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {lang === 'fa'
                ? 'فاکتوری متناسب با فیلترهای انتخابی یافت نشد.'
                : 'No receipts match your search filters.'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidateId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">{t.confirmDelete}</h4>
              <p className="text-xs text-slate-500 mt-1">{t.deleteWarning}</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteCandidateId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  onDeleteReceipt(deleteCandidateId);
                  setDeleteCandidateId(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30"
              >
                {t.deleteReceipt}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Details Inspect Modal */}
      {selectedReceiptForView && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <ReceiptIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    {selectedReceiptForView.merchant}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedReceiptForView.jalaliDate || selectedReceiptForView.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                  title="Print"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedReceiptForView(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6">
              {/* Total & Category Highlight */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 gap-3">
                <div>
                  <span className="text-xs font-bold text-emerald-800">{t.amount}</span>
                  <div className="text-2xl font-black text-emerald-950 mt-0.5">
                    {formatAmount(
                      selectedReceiptForView.total,
                      selectedReceiptForView.currency,
                      usePersianDigits,
                      lang
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-emerald-800 border border-emerald-200">
                    {getCategoryLabel(selectedReceiptForView.category, categories, lang)}
                  </span>
                  {selectedReceiptForView.confidenceScore && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                      OCR: {selectedReceiptForView.confidenceScore}%
                    </span>
                  )}
                </div>
              </div>

              {/* Scanned Image Preview if exists */}
              {selectedReceiptForView.imageUrl && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                  <span className="text-xs font-bold text-slate-600 block mb-2">{t.receiptImage}</span>
                  <img
                    src={selectedReceiptForView.imageUrl}
                    alt="Receipt visual"
                    className="max-h-72 mx-auto object-contain rounded-lg shadow-xs"
                  />
                </div>
              )}

              {/* Key Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block mb-1">{t.date}</span>
                  <span className="font-bold text-slate-800">{selectedReceiptForView.date}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block mb-1">{t.jalaliDate}</span>
                  <span className="font-bold text-slate-800">
                    {selectedReceiptForView.jalaliDate || formatFullJalali(selectedReceiptForView.date, usePersianDigits)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block mb-1">{t.time}</span>
                  <span className="font-bold text-slate-800">{selectedReceiptForView.time || '—'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block mb-1">{t.paymentMethod}</span>
                  <span className="font-bold text-slate-800">
                    {selectedReceiptForView.paymentMethod || '—'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block mb-1">{t.referenceNumber}</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {selectedReceiptForView.referenceNumber || '—'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block mb-1">{t.tax}</span>
                  <span className="font-bold text-slate-800">
                    {formatAmount(selectedReceiptForView.tax || 0, selectedReceiptForView.currency, usePersianDigits, lang)}
                  </span>
                </div>
              </div>

              {/* Line Items Table */}
              {selectedReceiptForView.items && selectedReceiptForView.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {t.lineItems}
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                        <tr>
                          <th className="py-2 px-3 text-left rtl:text-right">{t.itemName}</th>
                          <th className="py-2 px-3 text-center">{t.quantity}</th>
                          <th className="py-2 px-3 text-right rtl:text-left">{t.totalPrice}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedReceiptForView.items.map((it, idx) => (
                          <tr key={it.id || idx}>
                            <td className="py-2 px-3 font-medium text-slate-800">{it.name}</td>
                            <td className="py-2 px-3 text-center text-slate-500">
                              {usePersianDigits ? toPersianDigits(it.quantity || 1) : it.quantity || 1}
                            </td>
                            <td className="py-2 px-3 text-right rtl:text-left font-bold text-slate-900">
                              {formatAmount(it.totalPrice, selectedReceiptForView.currency, usePersianDigits, lang)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedReceiptForView.notes && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                  <span className="font-bold text-amber-900 block mb-0.5">{t.notes}:</span>
                  <p className="text-amber-800">{selectedReceiptForView.notes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  onEditReceipt(selectedReceiptForView);
                  setSelectedReceiptForView(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{t.editReceipt}</span>
              </button>

              <button
                onClick={() => setSelectedReceiptForView(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

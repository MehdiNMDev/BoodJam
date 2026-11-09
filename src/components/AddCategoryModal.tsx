import React, { useState } from 'react';
import { X, Plus, Check, Sparkles, Tag } from 'lucide-react';
import { CategoryDefinition, Language } from '../types';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from '../utils/categoryTheme';
import { translations } from '../utils/translations';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (category: CategoryDefinition, initialBudget?: number) => void;
  lang: Language;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onAddCategory,
  lang,
}) => {
  const t = translations[lang];

  const [labelFa, setLabelFa] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [selectedColor, setSelectedColor] = useState('#10b981');
  const [initialBudget, setInitialBudget] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!labelFa.trim() && !labelEn.trim()) {
      setError(
        lang === 'fa'
          ? 'لطفاً نام دسته‌بندی را وارد نمایید.'
          : 'Please enter a category name.'
      );
      return;
    }

    const trimmedFa = labelFa.trim() || labelEn.trim();
    const trimmedEn = labelEn.trim() || labelFa.trim();
    const id = 'custom_' + Date.now();

    const newCategory: CategoryDefinition = {
      id,
      labelFa: trimmedFa,
      labelEn: trimmedEn,
      color: selectedColor,
      iconName: selectedIcon,
      isCustom: true,
      defaultBudget: typeof initialBudget === 'number' ? initialBudget : 0,
    };

    onAddCategory(newCategory, typeof initialBudget === 'number' ? initialBudget : 0);
    // Reset form
    setLabelFa('');
    setLabelEn('');
    setSelectedIcon('Tag');
    setSelectedColor('#10b981');
    setInitialBudget('');
    setError(null);
    onClose();
  };

  const SelectedIconComponent = AVAILABLE_ICONS[selectedIcon] || Tag;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">
                {lang === 'fa' ? 'افزودن دسته‌بندی هزینه جدید' : 'Add New Expense Category'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'fa' ? 'دسته‌بندی‌های شخصی‌سازی شده برای کنترل دقیق‌تر مخارج' : 'Custom category for tracking specific expenses'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
              {error}
            </div>
          )}

          {/* Live Preview Badge */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {lang === 'fa' ? 'پیش‌نمایش دسته:' : 'Live Preview:'}
            </span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: selectedColor }}
              >
                <SelectedIconComponent className="w-3 h-3" />
              </div>
              <span className="text-xs font-black text-slate-800">
                {labelFa || labelEn || (lang === 'fa' ? 'نام دسته جدید' : 'Category Name')}
              </span>
            </div>
          </div>

          {/* Title Inputs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'fa' ? 'نام دسته‌بندی (فارسی)' : 'Category Name (Farsi)'}
            </label>
            <input
              type="text"
              required
              value={labelFa}
              onChange={(e) => setLabelFa(e.target.value)}
              placeholder={lang === 'fa' ? 'مثال: اجاره خانه، شهریه دانشگاه، باشگاه، هدیه' : 'e.g. اجاره خانه'}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'fa' ? 'نام انگلیسی (اختیاری)' : 'Category Name (English)'}
            </label>
            <input
              type="text"
              value={labelEn}
              onChange={(e) => setLabelEn(e.target.value)}
              placeholder="e.g. Rent, Education, Fitness, Gifts"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {lang === 'fa' ? 'انتخاب آیکون' : 'Choose Icon'}
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 max-h-36 overflow-y-auto">
              {Object.entries(AVAILABLE_ICONS).map(([name, IconComp]) => {
                const isSelected = selectedIcon === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedIcon(name)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                        : 'bg-white text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {lang === 'fa' ? 'انتخاب رنگ' : 'Choose Color'}
            </label>
            <div className="flex flex-wrap gap-2.5 p-2 rounded-xl border border-slate-200 bg-slate-50">
              {AVAILABLE_COLORS.map((col) => {
                const isSelected = selectedColor === col;
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setSelectedColor(col)}
                    className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                      isSelected ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: col }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default Monthly Budget (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'fa' ? 'سقف بودجه ماهانه اولیه (تومان / اختیاری)' : 'Initial Monthly Budget Goal (Optional)'}
            </label>
            <input
              type="number"
              step={50000}
              value={initialBudget}
              onChange={(e) =>
                setInitialBudget(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)
              }
              placeholder="e.g. 1,500,000"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm font-bold text-emerald-700"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'fa' ? 'افزودن دسته‌بندی' : 'Add Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

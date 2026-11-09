import React, { useRef } from 'react';
import {
  Settings as SettingsIcon,
  Globe,
  Hash,
  Calendar,
  DollarSign,
  ShieldCheck,
  Database,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Tag,
  Plus,
  Trash2,
  UserCheck,
  Heart,
  Lock,
  Unlock,
  KeyRound,
  FileKey,
  ShieldAlert,
  ServerOff,
  Cpu,
  EyeOff,
} from 'lucide-react';
import { Language, Receipt, CategoryDefinition } from '../types';
import { translations } from '../utils/translations';
import { getCategoryMeta, getCategoryLabel } from '../utils/categoryTheme';

interface SettingsViewProps {
  lang: Language;
  setLang: (lang: Language) => void;
  usePersianDigits: boolean;
  setUsePersianDigits: (val: boolean) => void;
  receipts: Receipt[];
  categories: CategoryDefinition[];
  onOpenAddCategoryModal: () => void;
  onDeleteCustomCategory: (id: string) => void;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
  onImportBackup: (receipts: Receipt[]) => void;
  hasPin: boolean;
  onOpenPinModal: () => void;
  onLockNow: () => void;
  onOpenEncryptedBackupModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  lang,
  setLang,
  usePersianDigits,
  setUsePersianDigits,
  receipts,
  categories,
  onOpenAddCategoryModal,
  onDeleteCustomCategory,
  onLoadDemoData,
  onClearAllData,
  onImportBackup,
  hasPin,
  onOpenPinModal,
  onLockNow,
  onOpenEncryptedBackupModal,
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(receipts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `boodjam_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportBackup(parsed);
          alert(lang === 'fa' ? 'فایل پشتیبان با موفقیت بازیابی شد.' : 'Backup successfully restored.');
        }
      } catch (err) {
        alert(lang === 'fa' ? 'فایل نامعتبر است.' : 'Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Household Profile & App Avatar Card */}
      <div className="bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 p-5 sm:p-6 rounded-2xl border border-emerald-100 shadow-xs flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-emerald-500/30 shadow-lg bg-white shrink-0 p-1">
          <img
            src="/src/assets/images/couple_money_avatar_1794234293836.jpg"
            alt="Family Budget Avatar"
            className="w-full h-full object-cover rounded-xl"
          />
          <span className="absolute bottom-2 right-2 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
        </div>

        <div className="text-center sm:text-right flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {lang === 'fa' ? 'مهدی و همراه (بودجه خانوار)' : 'Mehdi & Family (Household Budget)'}
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              <span>{lang === 'fa' ? 'حساب فعال' : 'Active Account'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {lang === 'fa'
              ? 'مدیریت و برنامه‌ریزی یکپارچه هزینه‌ها و بودجه‌بندی ماهانه مشترک'
              : 'Managing joint household finances and monthly category budgets'}
          </p>
        </div>
      </div>

      {/* FEATURE: Cost Categories Management Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                {lang === 'fa' ? 'دسته‌بندی‌های هزینه (پیش‌فرض و سفارشی)' : 'Cost Categories Manager'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'fa'
                  ? 'مشاهده، تفکیک و افزودن دسته‌بندی‌های جدید به برنامه'
                  : 'View, customize, and add new expense categories'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenAddCategoryModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 self-start sm:self-center"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{lang === 'fa' ? 'افزودن دسته‌بندی جدید' : 'Add New Category'}</span>
          </button>
        </div>

        {/* Categories Grid List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {categories.map((cat) => {
            const meta = getCategoryMeta(cat.id, categories);
            const IconComp = meta.icon;
            const isCustom = Boolean(cat.isCustom);

            return (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
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
                    <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                      <span>{lang === 'fa' ? cat.labelFa : cat.labelEn}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          isCustom
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {isCustom ? (lang === 'fa' ? 'سفارشی' : 'Custom') : (lang === 'fa' ? 'سیستمی' : 'Default')}
                      </span>
                    </div>
                    {cat.labelEn && cat.labelFa && (
                      <span className="text-[10px] text-slate-400">
                        {lang === 'fa' ? cat.labelEn : cat.labelFa}
                      </span>
                    )}
                  </div>
                </div>

                {isCustom && (
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          lang === 'fa'
                            ? `آیا از حذف دسته‌بندی «${cat.labelFa}» اطمینان دارید؟`
                            : `Are you sure you want to delete category "${cat.labelEn}"?`
                        )
                      ) {
                        onDeleteCustomCategory(cat.id);
                      }
                    }}
                    title={lang === 'fa' ? 'حذف این دسته' : 'Delete category'}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Language & Localization Settings */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'fa' ? 'تنظیمات زبان و نمایش' : 'Language & Display'}</span>
        </h3>

        {/* Language Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <div>
            <div className="font-bold text-sm text-slate-800">{t.languageToggle}</div>
            <div className="text-xs text-slate-500">
              {lang === 'fa' ? 'تغییر بین زبان فارسی و انگلیسی' : 'Switch between Farsi and English'}
            </div>
          </div>
          <div className="flex rounded-xl bg-slate-200 p-1 text-xs font-bold">
            <button
              onClick={() => setLang('fa')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                lang === 'fa' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              فارسی (RTL)
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                lang === 'en' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
              }`}
            >
              English (LTR)
            </button>
          </div>
        </div>

        {/* Persian Digits Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
          <div>
            <div className="font-bold text-sm text-slate-800">{t.persianDigitsToggle}</div>
            <div className="text-xs text-slate-500">{t.persianDigitsDesc}</div>
          </div>
          <button
            onClick={() => setUsePersianDigits(!usePersianDigits)}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              usePersianDigits ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                usePersianDigits ? (lang === 'fa' ? '-translate-x-6' : 'translate-x-6') : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Calendar Info */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
          <div>
            <div className="font-bold text-sm text-slate-800">{t.preferredCalendar}</div>
            <div className="text-xs text-slate-500">
              {lang === 'fa' ? 'پشتیبانی توأمان از تاریخ هجری شمسی و میلادی' : 'Supports dual Jalali and Gregorian dates'}
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
            {t.solarHijri}
          </span>
        </div>
      </div>

      {/* FEATURE: Zero External Access & Security Vault Section */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                {lang === 'fa' ? 'امنیت، محرمانگی و عدم دسترسی خارجی' : 'Security & Zero External Access'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'fa'
                  ? 'حفاظت حداکثری از اطلاعات مالی، فاکتورها و سوابق شما'
                  : 'Guaranteed local isolation, ephemeral processing, and zero telemetry'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold self-start sm:self-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'fa' ? 'ایزولاسیون کامل فعال' : 'Zero External Leakage'}</span>
          </div>
        </div>

        {/* 4 Security Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <ServerOff className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">
                {lang === 'fa' ? 'ذخیره‌سازی کاملاً محلی (Local-Only)' : 'Local-Only Storage Sandbox'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                {lang === 'fa'
                  ? 'کلیه رسیدها و بودجه‌ها فقط در مرورگر شما ذخیره شده و هیچ داده‌ای در سرورهای خارجی ذخیره نمی‌شود.'
                  : 'All financial data is stored securely on your device. Zero external cloud tracking.'}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">
                {lang === 'fa' ? 'پردازش موقت OCR در رم (Ephemeral)' : 'Ephemeral Memory-Only OCR'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                {lang === 'fa'
                  ? 'تصاویر فاکتور فقط در حافظه رم موقت هوش مصنوعی پردازش شده و پس از استخراج بلافاصله پاکسازی می‌شوند.'
                  : 'Receipt images are processed purely in-memory and wiped immediately after extraction.'}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
              <FileKey className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">
                {lang === 'fa' ? 'رمزنگاری سخت‌افزاری AES-GCM' : 'Hardware AES-GCM 256-bit'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                {lang === 'fa'
                  ? 'امکان خروجی پشتیبان‌های رمزنگاری شده با کلمه عبور اختصاصی با استاندارد نظامی Web Crypto.'
                  : 'Export encrypted backups protected with PBKDF2 key derivation and AES-GCM.'}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <EyeOff className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">
                {lang === 'fa' ? 'حریم خصوصی چندنفره (Screen Shield)' : 'Screen & Shared Device Shield'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                {lang === 'fa'
                  ? 'جلوگیری از مشاهده اطلاعات حساس و مبالغ توسط افراد دیگر هنگام استفاده مشترک از رایانه یا گوشی.'
                  : 'Prevent unauthorized eyes on your finances with PIN screen lock.'}
              </div>
            </div>
          </div>
        </div>

        {/* PIN Security Controls */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-slate-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                <span>{lang === 'fa' ? 'قفل امنیتی پین (PIN Privacy Lock)' : 'PIN Privacy Lock'}</span>
                <span
                  className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                    hasPin ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {hasPin ? (lang === 'fa' ? 'فعال' : 'Active') : (lang === 'fa' ? 'غیرفعال' : 'Disabled')}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {lang === 'fa'
                  ? 'رمز عددی ۴ الی ۸ رقمی جهت جلوگیری از دسترسی دیگران به برنامه'
                  : 'Require 4-8 digit passcode to view budget and receipts'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {hasPin && (
              <button
                onClick={onLockNow}
                className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{lang === 'fa' ? 'قفل فوری' : 'Lock Now'}</span>
              </button>
            )}

            <button
              onClick={onOpenPinModal}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>
                {hasPin
                  ? lang === 'fa'
                    ? 'مدیریت و تغییر پین'
                    : 'Manage PIN'
                  : lang === 'fa'
                  ? 'فعال‌سازی قفل پین'
                  : 'Enable PIN'}
              </span>
            </button>
          </div>
        </div>

        {/* Encrypted & Standard Backup Actions */}
        <div className="pt-2 space-y-2.5">
          <div className="font-bold text-xs text-slate-700 uppercase tracking-wider">
            {lang === 'fa' ? 'عملیات پشتیبان‌گیری و بازیابی امن' : 'Backup & Recovery Actions'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Encrypted Vault Backup */}
            <button
              onClick={onOpenEncryptedBackupModal}
              className="p-3.5 rounded-xl border border-purple-200 hover:border-purple-500 bg-purple-50/30 hover:bg-purple-50/70 text-right rtl:text-right ltr:text-left transition-all flex items-center gap-3 shadow-2xs group"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileKey className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                  <span>{lang === 'fa' ? 'پشتیبان رمزنگاری‌شده (AES-256)' : 'Encrypted Vault (.enc)'}</span>
                  <span className="text-[9px] bg-purple-200 text-purple-800 px-1.5 rounded font-black">
                    PRO
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {lang === 'fa'
                    ? 'خروجی یا بازیابی فایل محافظت‌شده با کلمه عبور'
                    : 'Export or import password-protected backup'}
                </div>
              </div>
            </button>

            {/* Standard JSON Backup */}
            <button
              onClick={handleExportBackup}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50/20 text-right rtl:text-right ltr:text-left transition-all flex items-center gap-3 shadow-2xs"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-800">
                  {lang === 'fa' ? 'دانلود فایل متنی (JSON)' : 'Export JSON Backup'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {receipts.length} {lang === 'fa' ? 'فاکتور ثبت شده در حافظه' : 'receipts stored'}
                </div>
              </div>
            </button>

            {/* Import JSON */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 text-right rtl:text-right ltr:text-left transition-all flex items-center gap-3 shadow-2xs"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-800">
                  {lang === 'fa' ? 'بازیابی از فایل JSON' : 'Restore from JSON File'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {lang === 'fa' ? 'بارگذاری نسخه پشتیبان عادی' : 'Upload regular JSON backup'}
                </div>
              </div>
            </button>

            {/* Load Demo Data */}
            <button
              onClick={onLoadDemoData}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 text-right rtl:text-right ltr:text-left transition-all flex items-center gap-3 shadow-2xs"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-800">{t.loadDemoData}</div>
                <div className="text-[11px] text-slate-400">
                  {lang === 'fa' ? 'فاکتورهای نمونه معتبر با اقلام تفکیکی' : 'Sample receipts with authentic data'}
                </div>
              </div>
            </button>
          </div>

          {/* Secure Wipe Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (
                  confirm(
                    lang === 'fa'
                      ? 'هشدار امنیتی: آیا از پاکسازی و امحای کامل و غیرقابل بازگشت تمامی داده‌های محلی، فاکتورها و سوابق اطمینان دارید؟'
                      : 'Security Warning: Are you sure you want to permanently erase all local receipts and data?'
                  )
                ) {
                  onClearAllData();
                }
              }}
              className="w-full p-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>
                {lang === 'fa'
                  ? 'امحای امن تمامی داده‌ها (Secure Wipe & Reset)'
                  : 'Secure Wipe All Data (Permanent Reset)'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

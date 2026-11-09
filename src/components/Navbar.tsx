import React from 'react';
import {
  ReceiptText,
  LayoutDashboard,
  Scan,
  FileSpreadsheet,
  Settings as SettingsIcon,
  Globe,
  Camera,
  Hash,
  Lock,
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface NavbarProps {
  currentTab: 'dashboard' | 'receipts' | 'scan' | 'reports' | 'settings';
  setCurrentTab: (tab: 'dashboard' | 'receipts' | 'scan' | 'reports' | 'settings') => void;
  lang: Language;
  setLang: (lang: Language) => void;
  usePersianDigits: boolean;
  setUsePersianDigits: (val: boolean) => void;
  onOpenScanModal: () => void;
  hasPin?: boolean;
  onLockNow?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  usePersianDigits,
  setUsePersianDigits,
  onOpenScanModal,
  hasPin,
  onLockNow,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-emerald-500/40 shadow-md group-hover:scale-105 transition-transform bg-white shrink-0 p-0.5">
                <img
                  src="/src/assets/images/couple_money_avatar_1794234293836.jpg"
                  alt="بودجم - Boodjam"
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent font-black text-xl tracking-tight">
                    {lang === 'fa' ? 'بودجم' : 'Boodjam'}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    OCR AI
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  {lang === 'fa' ? 'مدیریت هوشمند بودجه و هزینه‌ها' : 'Smart Budget & Expense Tracker'}
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t.dashboard}</span>
            </button>

            <button
              onClick={() => setCurrentTab('receipts')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentTab === 'receipts'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ReceiptText className="w-4 h-4" />
              <span>{t.receipts}</span>
            </button>

            <button
              onClick={() => setCurrentTab('reports')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentTab === 'reports'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t.reportsExport}</span>
            </button>

            <button
              onClick={() => setCurrentTab('settings')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentTab === 'settings'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>{t.settings}</span>
            </button>
          </nav>

          {/* Actions: Scan CTA + Language & Digits Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Persian Digits Quick Switcher */}
            <button
              onClick={() => setUsePersianDigits(!usePersianDigits)}
              title={lang === 'fa' ? 'تغییر نمایش ارقام فارسی / لاتین' : 'Toggle Persian / Latin Digits'}
              className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                usePersianDigits
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>{usePersianDigits ? '۱۲۳' : '123'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'fa' ? 'en' : 'fa')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
              title="تغییر زبان / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'fa' ? 'English' : 'فارسی'}</span>
            </button>

            {/* Scan Receipt Primary CTA */}
            <button
              onClick={onOpenScanModal}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Scan className="w-4 h-4 animate-pulse" />
              <span className="hidden sm:inline">{t.scanReceipt}</span>
              <span className="sm:hidden">{lang === 'fa' ? 'اسکن' : 'Scan'}</span>
            </button>

            {/* Quick Lock Button */}
            {hasPin && onLockNow && (
              <button
                onClick={onLockNow}
                title={lang === 'fa' ? 'قفل فوری برنامه' : 'Lock App Immediately'}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs active:scale-95"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden xl:inline">{lang === 'fa' ? 'قفل فوری' : 'Lock'}</span>
              </button>
            )}

            {/* Couple Budget Avatar */}
            <div
              onClick={() => setCurrentTab('settings')}
              title={lang === 'fa' ? 'مدیریت بودجه خانواده و حریم خصوصی' : 'Household Budget Profile & Privacy'}
              className="hidden sm:flex items-center pl-1 rtl:pl-0 rtl:pr-1 border-l rtl:border-l-0 rtl:border-r border-slate-200 cursor-pointer group"
            >
              <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-emerald-500/40 shadow-xs group-hover:ring-emerald-600 transition-all">
                <img
                  src="/src/assets/images/couple_money_avatar_1794234293836.jpg"
                  alt="Household Profile"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around border-t border-slate-100 py-2">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[11px] font-semibold ${
              currentTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span>{t.dashboard}</span>
          </button>

          <button
            onClick={() => setCurrentTab('receipts')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[11px] font-semibold ${
              currentTab === 'receipts' ? 'text-emerald-600' : 'text-slate-500'
            }`}
          >
            <ReceiptText className="w-4 h-4 mb-0.5" />
            <span>{t.receipts}</span>
          </button>

          <button
            onClick={() => setCurrentTab('reports')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[11px] font-semibold ${
              currentTab === 'reports' ? 'text-emerald-600' : 'text-slate-500'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 mb-0.5" />
            <span>{t.reportsExport}</span>
          </button>

          <button
            onClick={() => setCurrentTab('settings')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-[11px] font-semibold ${
              currentTab === 'settings' ? 'text-emerald-600' : 'text-slate-500'
            }`}
          >
            <SettingsIcon className="w-4 h-4 mb-0.5" />
            <span>{t.settings}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

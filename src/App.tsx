/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ReceiptsListView } from './components/ReceiptsListView';
import { ReportsExportView } from './components/ReportsExportView';
import { SettingsView } from './components/SettingsView';
import { ScanModal } from './components/ScanModal';
import { Receipt, Language, CategoryDefinition } from './types';
import { INITIAL_SAMPLE_RECEIPTS } from './data/sampleReceipts';
import { translations } from './utils/translations';
import { DEFAULT_CATEGORIES } from './utils/categoryTheme';
import { AddCategoryModal } from './components/AddCategoryModal';
import { SecurityLockModal } from './components/SecurityLockModal';
import { EncryptedBackupModal } from './components/EncryptedBackupModal';
import { LockScreen } from './components/LockScreen';
import { hashPasscode } from './utils/cryptoSecurity';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const STORAGE_KEY_RECEIPTS = 'residscan_receipts_v1';
const STORAGE_KEY_LANG = 'residscan_lang_v1';
const STORAGE_KEY_DIGITS = 'residscan_digits_v1';
const STORAGE_KEY_CUSTOM_CATEGORIES = 'boodjam_custom_categories_v1';
const STORAGE_KEY_BUDGETS = 'boodjam_budgets_v1';
const STORAGE_KEY_PIN_HASH = 'boodjam_security_pin_hash_v1';
const STORAGE_KEY_IS_LOCKED = 'boodjam_app_is_locked_v1';

export default function App() {
  // Language & Localization state - Default to 'fa' (Farsi) as requested
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG);
    return saved === 'en' ? 'en' : 'fa';
  });

  const [usePersianDigits, setUsePersianDigits] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DIGITS);
    return saved ? saved === 'true' : true;
  });

  // Security & PIN Lock State
  const [pinHash, setPinHash] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_PIN_HASH);
  });

  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const hasPin = Boolean(localStorage.getItem(STORAGE_KEY_PIN_HASH));
    const wasLocked = localStorage.getItem(STORAGE_KEY_IS_LOCKED);
    // Lock on initial startup if a PIN has been configured
    return hasPin && wasLocked !== 'false';
  });

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'receipts' | 'scan' | 'reports' | 'settings'>(
    'dashboard'
  );

  // Month filter for Dashboard
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');

  // Categories State (Default categories + user-added custom categories)
  const [categories, setCategories] = useState<CategoryDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const defaultIds = new Set(DEFAULT_CATEGORIES.map((c) => c.id));
          const custom = parsed.filter((c: CategoryDefinition) => !defaultIds.has(c.id));
          return [...DEFAULT_CATEGORIES, ...custom];
        }
      }
    } catch (e) {
      console.error('Error loading custom categories:', e);
    }
    return DEFAULT_CATEGORIES;
  });

  // Receipts State
  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECEIPTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading receipts from storage:', e);
    }
    return INITIAL_SAMPLE_RECEIPTS;
  });

  // Modal states
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState<boolean>(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  const [isEncryptedBackupModalOpen, setIsEncryptedBackupModalOpen] = useState<boolean>(false);
  const [selectedReceiptForView, setSelectedReceiptForView] = useState<Receipt | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync isLocked to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_IS_LOCKED, String(isLocked));
  }, [isLocked]);

  // Sync receipts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECEIPTS, JSON.stringify(receipts));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [receipts]);

  // Sync custom categories to localStorage
  useEffect(() => {
    try {
      const customOnly = categories.filter((c) => c.isCustom);
      localStorage.setItem(STORAGE_KEY_CUSTOM_CATEGORIES, JSON.stringify(customOnly));
    } catch (e) {
      console.error('Failed to save custom categories:', e);
    }
  }, [categories]);

  // Sync language and dir attribute
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANG, lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
  }, [lang]);

  // Sync digits preference
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DIGITS, String(usePersianDigits));
  }, [usePersianDigits]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add Custom Category
  const handleAddCategory = (newCat: CategoryDefinition, initialBudget?: number) => {
    setCategories((prev) => {
      if (prev.some((c) => c.id === newCat.id)) return prev;
      return [...prev, newCat];
    });

    if (initialBudget && initialBudget > 0) {
      try {
        const savedBudgets = localStorage.getItem(STORAGE_KEY_BUDGETS);
        const parsedBudgets = savedBudgets ? JSON.parse(savedBudgets) : {};
        parsedBudgets[newCat.id] = initialBudget;
        localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(parsedBudgets));
      } catch (e) {
        console.error('Failed to save category budget:', e);
      }
    }

    showToast(
      lang === 'fa'
        ? `دسته‌بندی «${newCat.labelFa}» با موفقیت افزوده شد.`
        : `Category "${newCat.labelEn}" added successfully.`
    );
  };

  // Delete Custom Category
  const handleDeleteCustomCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    showToast(
      lang === 'fa'
        ? 'دسته‌بندی سفارشی حذف شد.'
        : 'Custom category removed.'
    );
  };

  // Security PIN Handlers
  const handleSetPin = (newHash: string) => {
    localStorage.setItem(STORAGE_KEY_PIN_HASH, newHash);
    setPinHash(newHash);
    showToast(
      lang === 'fa'
        ? 'قفل امنیتی پین با موفقیت فعال گردید.'
        : 'PIN privacy lock enabled successfully.'
    );
  };

  const handleRemovePin = () => {
    localStorage.removeItem(STORAGE_KEY_PIN_HASH);
    localStorage.removeItem(STORAGE_KEY_IS_LOCKED);
    setPinHash(null);
    setIsLocked(false);
    showToast(
      lang === 'fa'
        ? 'قفل امنیتی پین غیرفعال شد.'
        : 'PIN privacy lock disabled.'
    );
  };

  const verifyCurrentPin = async (enteredPin: string): Promise<boolean> => {
    if (!pinHash) return true;
    const hashed = await hashPasscode(enteredPin);
    return hashed === pinHash;
  };

  const handleUnlock = async (enteredPin: string): Promise<boolean> => {
    const ok = await verifyCurrentPin(enteredPin);
    if (ok) {
      setIsLocked(false);
      showToast(
        lang === 'fa' ? 'خوش آمدید! قفل برنامه باز شد.' : 'Welcome back! Unlocked.'
      );
      return true;
    }
    return false;
  };

  const handleLockNow = () => {
    if (pinHash) {
      setIsLocked(true);
      showToast(lang === 'fa' ? 'برنامه قفل شد.' : 'App locked.');
    }
  };

  const handleImportRestoredData = (
    restoredReceipts: Receipt[],
    restoredCategories?: CategoryDefinition[]
  ) => {
    setReceipts(restoredReceipts);
    if (restoredCategories && restoredCategories.length > 0) {
      setCategories((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const toAdd = restoredCategories.filter((c) => !existingIds.has(c.id));
        return [...prev, ...toAdd];
      });
    }
    showToast(
      lang === 'fa'
        ? `${restoredReceipts.length} فاکتور از گاوصندوق رمزنگاری‌شده بازیابی گردید.`
        : `${restoredReceipts.length} receipts restored from encrypted vault.`
    );
  };

  // Add / Save Receipt
  const handleSaveReceipt = (newReceipt: Receipt) => {
    setReceipts((prev) => {
      const existingIdx = prev.findIndex((r) => r.id === newReceipt.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = newReceipt;
        return updated;
      }
      return [newReceipt, ...prev];
    });

    showToast(
      lang === 'fa'
        ? `رسید «${newReceipt.merchant}» با موفقیت ذخیره شد.`
        : `Receipt "${newReceipt.merchant}" saved successfully.`
    );
  };

  // Delete Receipt
  const handleDeleteReceipt = (id: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
    showToast(lang === 'fa' ? 'فاکتور حذف شد.' : 'Receipt deleted.');
  };

  // Edit Receipt (opens modal populated)
  const handleEditReceipt = (receipt: Receipt) => {
    setSelectedReceiptForView(null);
    setIsScanModalOpen(true);
  };

  // Reset to demo data
  const handleLoadDemoData = () => {
    setReceipts(INITIAL_SAMPLE_RECEIPTS);
    showToast(lang === 'fa' ? 'فاکتورهای نمونه بارگذاری شدند.' : 'Sample receipts loaded.');
  };

  // Clear all data
  const handleClearAllData = () => {
    setReceipts([]);
    localStorage.removeItem(STORAGE_KEY_RECEIPTS);
    showToast(lang === 'fa' ? 'کلیه فاکتورها پاک شدند.' : 'All receipts cleared.');
  };

  // Import Backup
  const handleImportBackup = (imported: Receipt[]) => {
    setReceipts(imported);
    showToast(
      lang === 'fa'
        ? `${imported.length} فاکتور بازیابی گردید.`
        : `${imported.length} receipts restored.`
    );
  };

  const t = translations[lang];

  return (
    <div
      className={`min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans transition-all duration-150`}
      dir={lang === 'fa' ? 'rtl' : 'ltr'}
    >
      {/* Full Screen PIN Privacy Lock Overlay if App is Locked */}
      {isLocked && (
        <LockScreen
          lang={lang}
          onUnlock={handleUnlock}
          onEmergencyWipe={() => {
            if (
              confirm(
                lang === 'fa'
                  ? 'آیا از پاکسازی اضطراری کل برنامه اطمینان دارید؟'
                  : 'Emergency wipe all data?'
              )
            ) {
              handleClearAllData();
              handleRemovePin();
            }
          }}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 left-6 sm:left-auto z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        usePersianDigits={usePersianDigits}
        setUsePersianDigits={setUsePersianDigits}
        onOpenScanModal={() => setIsScanModalOpen(true)}
        hasPin={Boolean(pinHash)}
        onLockNow={handleLockNow}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            receipts={receipts}
            categories={categories}
            onOpenAddCategoryModal={() => setIsAddCategoryModalOpen(true)}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            lang={lang}
            usePersianDigits={usePersianDigits}
            onOpenScanModal={() => setIsScanModalOpen(true)}
            onViewReceipt={(r) => setSelectedReceiptForView(r)}
            onNavigateToTab={setCurrentTab}
            onLoadDemoData={handleLoadDemoData}
          />
        )}

        {currentTab === 'receipts' && (
          <ReceiptsListView
            receipts={receipts}
            categories={categories}
            onOpenAddCategoryModal={() => setIsAddCategoryModalOpen(true)}
            onDeleteReceipt={handleDeleteReceipt}
            onEditReceipt={handleEditReceipt}
            onOpenScanModal={() => setIsScanModalOpen(true)}
            lang={lang}
            usePersianDigits={usePersianDigits}
            selectedReceiptForView={selectedReceiptForView}
            setSelectedReceiptForView={setSelectedReceiptForView}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsExportView
            receipts={receipts}
            categories={categories}
            lang={lang}
            usePersianDigits={usePersianDigits}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            lang={lang}
            setLang={setLang}
            usePersianDigits={usePersianDigits}
            setUsePersianDigits={setUsePersianDigits}
            receipts={receipts}
            categories={categories}
            onOpenAddCategoryModal={() => setIsAddCategoryModalOpen(true)}
            onDeleteCustomCategory={handleDeleteCustomCategory}
            onLoadDemoData={handleLoadDemoData}
            onClearAllData={handleClearAllData}
            onImportBackup={handleImportBackup}
            hasPin={Boolean(pinHash)}
            onOpenPinModal={() => setIsPinModalOpen(true)}
            onLockNow={handleLockNow}
            onOpenEncryptedBackupModal={() => setIsEncryptedBackupModalOpen(true)}
          />
        )}
      </main>

      {/* Receipt OCR Scan Modal */}
      <ScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onSaveReceipt={handleSaveReceipt}
        lang={lang}
        usePersianDigits={usePersianDigits}
        categories={categories}
        onOpenAddCategoryModal={() => setIsAddCategoryModalOpen(true)}
      />

      {/* Add Custom Category Modal */}
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onAddCategory={handleAddCategory}
        lang={lang}
      />

      {/* PIN Security Management Modal */}
      <SecurityLockModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        lang={lang}
        hasPin={Boolean(pinHash)}
        onSetPin={handleSetPin}
        onRemovePin={handleRemovePin}
        verifyCurrentPin={verifyCurrentPin}
      />

      {/* Encrypted Vault Backup Modal */}
      <EncryptedBackupModal
        isOpen={isEncryptedBackupModalOpen}
        onClose={() => setIsEncryptedBackupModalOpen(false)}
        lang={lang}
        receipts={receipts}
        categories={categories}
        onImportRestoredData={handleImportRestoredData}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">
              {lang === 'fa' ? 'بودجم (Boodjam)' : 'Boodjam'}
            </span>
            <span>—</span>
            <span>{t.appTagline}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Excel .xlsx / .xls</span>
            <span>•</span>
            <span>CSV</span>
            <span>•</span>
            <span>PDF</span>
            <span>•</span>
            <span>فارسی (Jalali & RTL)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

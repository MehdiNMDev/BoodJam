import React, { useState, useRef } from 'react';
import { ShieldCheck, Lock, Download, Upload, AlertCircle, CheckCircle2, X, FileKey } from 'lucide-react';
import { Language, Receipt, CategoryDefinition } from '../types';
import { encryptData, decryptData } from '../utils/cryptoSecurity';

interface EncryptedBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  receipts: Receipt[];
  categories: CategoryDefinition[];
  onImportRestoredData: (restoredReceipts: Receipt[], restoredCategories?: CategoryDefinition[]) => void;
}

export const EncryptedBackupModal: React.FC<EncryptedBackupModalProps> = ({
  isOpen,
  onClose,
  lang,
  receipts,
  categories,
  onImportRestoredData,
}) => {
  const [tab, setTab] = useState<'export' | 'import'>('export');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password.length < 6) {
      setError(
        lang === 'fa'
          ? 'کلمه عبور جهت رمزنگاری باید حداقل ۶ کاراکتر باشد.'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        lang === 'fa' ? 'تکرار کلمه عبور همخوانی ندارد.' : 'Passwords do not match.'
      );
      return;
    }

    try {
      setIsProcessing(true);
      const payload = {
        app: 'boodjam',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        receipts,
        categories: categories.filter((c) => c.isCustom),
      };

      const encryptedCipher = await encryptData(payload, password);

      const blob = new Blob([encryptedCipher], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `boodjam_secure_vault_${new Date().toISOString().slice(0, 10)}.boodjam.enc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(
        lang === 'fa'
          ? 'فایل پشتیبان رمزنگاری‌شده AES-256 با موفقیت دانلود شد.'
          : 'Encrypted backup downloaded successfully.'
      );
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(
        lang === 'fa'
          ? 'خطا در رمزنگاری فایل پشتیبان.'
          : 'Error encrypting backup file.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedFile) {
      setError(lang === 'fa' ? 'لطفاً فایل پشتیبان را انتخاب کنید.' : 'Please select a backup file.');
      return;
    }

    if (!password) {
      setError(lang === 'fa' ? 'کلمه عبور فایل را وارد کنید.' : 'Please enter the password.');
      return;
    }

    try {
      setIsProcessing(true);
      const fileContent = await selectedFile.text();
      const decrypted = await decryptData(fileContent, password);

      if (!decrypted || !Array.isArray(decrypted.receipts)) {
        throw new Error('Invalid structure');
      }

      onImportRestoredData(decrypted.receipts, decrypted.categories);
      setSuccess(
        lang === 'fa'
          ? `تعداد ${decrypted.receipts.length} فاکتور با موفقیت رمزگشایی و بازیابی شد.`
          : `Successfully decrypted and restored ${decrypted.receipts.length} receipts.`
      );
      setPassword('');
      setSelectedFile(null);
    } catch (err: any) {
      setError(
        lang === 'fa'
          ? 'رمز عبور نادرست است یا ساختار فایل رمزنگاری معتبر نمی‌باشد.'
          : 'Incorrect password or invalid encrypted file.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <FileKey className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">
                {lang === 'fa' ? 'پشتیبان‌گیری رمزنگاری‌شده (AES-GCM)' : 'Encrypted Vault Backup'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'fa'
                  ? 'خروجی و ورود امن داده‌ها بدون امکان دسترسی غیرمجاز'
                  : 'Zero unauthorized access with military-grade 256-bit encryption'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-4 pb-0">
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              onClick={() => {
                setTab('export');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'export' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? 'ایجاد پشتیبان رمزدار' : 'Export Encrypted'}</span>
            </button>
            <button
              onClick={() => {
                setTab('import');
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'import' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{lang === 'fa' ? 'بازیابی پشتیبان رمزدار' : 'Restore Encrypted'}</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {tab === 'export' ? (
            <form onSubmit={handleExport} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-xs text-purple-900 leading-relaxed">
                {lang === 'fa'
                  ? 'فایل خروجی با الگوریتم استاندارد AES-256-GCM رمزنگاری خواهد شد. تنها کسی که کلمه عبور را داشته باشد می‌تواند به محتوای این فایل دسترسی پیدا کند.'
                  : 'Backup will be encrypted with AES-256-GCM. Without this password, nobody can open or read your receipts.'}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'fa' ? 'کلمه عبور جهت رمزنگاری فایل' : 'Encryption Password'}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'fa' ? 'تکرار کلمه عبور' : 'Confirm Password'}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-sm font-semibold"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {lang === 'fa' ? 'بستن' : 'Close'}
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/30 flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>{lang === 'fa' ? 'دانلود فایل رمزدار' : 'Export File'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleImport} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'fa' ? 'انتخاب فایل رمزنگاری شده (.boodjam.enc)' : 'Select Encrypted File (.boodjam.enc)'}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".enc,.boodjam.enc"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setSelectedFile(f);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-100 file:text-purple-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'fa' ? 'کلمه عبور جهت رمزگشایی' : 'Decryption Password'}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-sm font-semibold"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {lang === 'fa' ? 'بستن' : 'Close'}
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/30 flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>{lang === 'fa' ? 'رمزگشایی و بازیابی' : 'Decrypt & Restore'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

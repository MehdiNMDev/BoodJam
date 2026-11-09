import React, { useState } from 'react';
import { Shield, Lock, Unlock, KeyRound, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Language } from '../types';
import { hashPasscode } from '../utils/cryptoSecurity';

interface SecurityLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  hasPin: boolean;
  onSetPin: (hashedPin: string) => void;
  onRemovePin: () => void;
  verifyCurrentPin: (enteredPin: string) => Promise<boolean>;
}

export const SecurityLockModal: React.FC<SecurityLockModalProps> = ({
  isOpen,
  onClose,
  lang,
  hasPin,
  onSetPin,
  onRemovePin,
  verifyCurrentPin,
}) => {
  const [mode, setMode] = useState<'create' | 'remove' | 'change'>('create');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleCreateOrChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPin.length < 4 || newPin.length > 8) {
      setError(
        lang === 'fa'
          ? 'رمز عبور (PIN) باید بین ۴ تا ۸ رقم باشد.'
          : 'PIN must be between 4 and 8 digits.'
      );
      return;
    }

    if (newPin !== confirmPin) {
      setError(
        lang === 'fa' ? 'تکرار پین با پین وارد شده مطابقت ندارد.' : 'PINs do not match.'
      );
      return;
    }

    if (hasPin) {
      setIsVerifying(true);
      const isOk = await verifyCurrentPin(currentPin);
      setIsVerifying(false);
      if (!isOk) {
        setError(lang === 'fa' ? 'رمز پین فعلی نادرست است.' : 'Current PIN is incorrect.');
        return;
      }
    }

    const hashed = await hashPasscode(newPin);
    onSetPin(hashed);
    onClose();
  };

  const handleRemove = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);
    const isOk = await verifyCurrentPin(currentPin);
    setIsVerifying(false);
    if (!isOk) {
      setError(lang === 'fa' ? 'رمز پین فعلی نادرست است.' : 'Current PIN is incorrect.');
      return;
    }

    onRemovePin();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">
                {lang === 'fa' ? 'تنظیم قفل امنیتی پین (PIN Lock)' : 'Set PIN Privacy Lock'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'fa'
                  ? 'محافظت از اطلاعات مالی و فاکتورها در برابر دسترسی افراد دیگر'
                  : 'Protect financial receipts with local PIN passcode'}
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

        {/* Content */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {hasPin && (
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold mb-3">
              <button
                type="button"
                onClick={() => {
                  setMode('change');
                  setError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  mode !== 'remove' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
                }`}
              >
                {lang === 'fa' ? 'تغییر پین' : 'Change PIN'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('remove');
                  setError(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  mode === 'remove' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                {lang === 'fa' ? 'غیرفعال‌سازی قفل' : 'Disable Lock'}
              </button>
            </div>
          )}

          {mode === 'remove' ? (
            <form onSubmit={handleRemove} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'fa' ? 'رمز پین فعلی برای تأیید' : 'Current PIN for verification'}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  required
                  maxLength={8}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center tracking-widest text-lg font-bold"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {lang === 'fa' ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {lang === 'fa' ? 'غیرفعال‌سازی قفل' : 'Disable PIN Lock'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateOrChange} className="space-y-3.5">
              {hasPin && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'fa' ? 'رمز پین فعلی' : 'Current PIN'}
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    required
                    maxLength={8}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="••••"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center tracking-widest text-base font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'fa' ? 'رمز پین جدید (۴ الی ۸ رقم)' : 'New PIN (4 to 8 digits)'}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  required
                  maxLength={8}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center tracking-widest text-base font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {lang === 'fa' ? 'تکرار پین جدید' : 'Confirm New PIN'}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  required
                  maxLength={8}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center tracking-widest text-base font-bold"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {lang === 'fa' ? 'انصراف' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30"
                >
                  {lang === 'fa' ? 'ذخیره و فعال‌سازی' : 'Save & Enable'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

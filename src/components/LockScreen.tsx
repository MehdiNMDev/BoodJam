import React, { useState } from 'react';
import { Lock, ShieldCheck, Delete, ArrowRight, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface LockScreenProps {
  lang: Language;
  onUnlock: (pin: string) => Promise<boolean>;
  onEmergencyWipe?: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ lang, onUnlock }) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleKeyPress = (num: string) => {
    if (enteredPin.length < 8) {
      const nextPin = enteredPin + num;
      setEnteredPin(nextPin);
      setErrorMsg(null);
    }
  };

  const handleDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleSubmit = async (pinToSubmit?: string) => {
    const pin = pinToSubmit || enteredPin;
    if (!pin) return;
    setIsVerifying(true);
    const success = await onUnlock(pin);
    setIsVerifying(false);
    if (!success) {
      setErrorMsg(
        lang === 'fa' ? 'رمز پین وارد شده اشتباه است.' : 'Incorrect PIN. Please try again.'
      );
      setEnteredPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 text-white select-none">
      <div className="w-full max-w-xs flex flex-col items-center text-center space-y-6">
        {/* Avatar / App Brand Icon */}
        <div className="relative w-20 h-20 rounded-3xl overflow-hidden ring-4 ring-emerald-500/40 shadow-2xl p-0.5 bg-white">
          <img
            src="/src/assets/images/couple_money_avatar_1794234293836.jpg"
            alt="بودجم"
            className="w-full h-full object-cover rounded-[22px]"
          />
          <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
            <Lock className="w-8 h-8 text-emerald-400 drop-shadow-md" />
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white mb-1">
            {lang === 'fa' ? 'بودجم قفل است' : 'Boodjam is Locked'}
          </h1>
          <p className="text-xs text-slate-400">
            {lang === 'fa'
              ? 'جهت مشاهده فاکتورها و اطلاعات مالی، رمز پین خود را وارد کنید.'
              : 'Enter your secure PIN to access receipts and finances'}
          </p>
        </div>

        {/* PIN Indicators Dots */}
        <div className="flex items-center gap-3 py-2">
          {Array.from({ length: Math.max(4, enteredPin.length) }).map((_, idx) => {
            const isFilled = idx < enteredPin.length;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-emerald-400 scale-125 shadow-md shadow-emerald-500/50'
                    : 'bg-slate-700 border border-slate-600'
                }`}
              />
            );
          })}
        </div>

        {/* Error Feedback */}
        {errorMsg && (
          <div className="text-xs text-rose-400 font-bold bg-rose-950/50 border border-rose-900 px-3 py-1.5 rounded-xl animate-shake">
            {errorMsg}
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="w-16 h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-emerald-600 active:scale-95 text-xl font-bold text-white transition-all shadow-md flex items-center justify-center mx-auto"
            >
              {digit}
            </button>
          ))}

          {/* Clear / Backspace */}
          <button
            type="button"
            onClick={handleDelete}
            className="w-16 h-16 rounded-2xl bg-slate-800/40 hover:bg-slate-700/60 active:scale-95 text-xs font-bold text-slate-300 transition-all flex items-center justify-center mx-auto"
            title="پاک کردن"
          >
            <Delete className="w-5 h-5" />
          </button>

          {/* Zero */}
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-emerald-600 active:scale-95 text-xl font-bold text-white transition-all shadow-md flex items-center justify-center mx-auto"
          >
            0
          </button>

          {/* Submit / Unlock */}
          <button
            type="button"
            disabled={enteredPin.length < 4 || isVerifying}
            onClick={() => handleSubmit()}
            className={`w-16 h-16 rounded-2xl transition-all shadow-md flex items-center justify-center mx-auto ${
              enteredPin.length >= 4
                ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-emerald-600/30'
                : 'bg-slate-800/20 text-slate-600 cursor-not-allowed'
            }`}
          >
            <ArrowRight className="w-6 h-6 rtl:rotate-180" />
          </button>
        </div>

        {/* Bottom Trust Badge */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-4">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>
            {lang === 'fa'
              ? 'داده‌ها صرفاً روی این دستگاه به صورت ایزوله رمزنگاری شده‌اند'
              : 'Zero external cloud access. Fully isolated on-device storage'}
          </span>
        </div>
      </div>
    </div>
  );
};

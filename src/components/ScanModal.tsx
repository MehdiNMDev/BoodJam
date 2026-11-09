import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Camera,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  Store,
  CreditCard,
  Hash,
  Eye,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { Receipt, ReceiptItem, ExpenseCategory, Language, CategoryDefinition } from '../types';
import { translations } from '../utils/translations';
import { formatAmount, getJalaliDateString, toPersianDigits } from '../utils/jalali';
import { getCategoryLabel } from '../utils/categoryTheme';
import {
  SAMPLE_RECEIPT_1_IMAGE,
  SAMPLE_RECEIPT_2_IMAGE,
  SAMPLE_RECEIPT_3_IMAGE,
} from '../data/sampleReceipts';

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveReceipt: (receipt: Receipt) => void;
  lang: Language;
  usePersianDigits: boolean;
  categories: CategoryDefinition[];
  onOpenAddCategoryModal: () => void;
}

export const ScanModal: React.FC<ScanModalProps> = ({
  isOpen,
  onClose,
  onSaveReceipt,
  lang,
  usePersianDigits,
  categories,
  onOpenAddCategoryModal,
}) => {
  const t = translations[lang];

  // Source selection: 'upload' | 'camera' | 'sample'
  const [activeSource, setActiveSource] = useState<'upload' | 'camera' | 'sample'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Camera stream refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Extracted Receipt Form State
  const [receiptData, setReceiptData] = useState<Partial<Receipt> | null>(null);
  const [rawTextVisible, setRawTextVisible] = useState<boolean>(false);

  // Clean up camera on unmount or tab switch
  useEffect(() => {
    if (activeSource !== 'camera' && streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, [activeSource]);

  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setSelectedImage(null);
      setReceiptData(null);
      setErrorMsg(null);
      setIsScanning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Start Camera
  const startCamera = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setErrorMsg(
        lang === 'fa'
          ? 'دسترسی به دوربین برقرار نشد. لطفا مجوز دوربین را بررسی یا تصویر را آپلود کنید.'
          : 'Unable to access camera. Please check permissions or upload an image.'
      );
    }
  };

  // Capture Photo from Camera
  const captureFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setSelectedImage(dataUrl);

      // Stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      runOCR(dataUrl);
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSelectedImage(dataUrl);
      runOCR(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setSelectedImage(dataUrl);
        runOCR(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run Gemini OCR extraction via backend endpoint
  const runOCR = async (imageDataUrl: string, samplePresetKey?: string) => {
    setIsScanning(true);
    setErrorMsg(null);
    setScanStep(1);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 700);

    try {
      const response = await fetch('/api/ocr-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          mimeType: imageDataUrl.includes('image/svg+xml') ? 'image/svg+xml' : 'image/jpeg',
          languageHint: lang,
        }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'OCR processing failed');
      }

      const resData = await response.json();
      const extracted = resData.data;

      const today = new Date().toISOString().split('T')[0];
      const parsedReceipt: Partial<Receipt> = {
        id: 'rcpt-' + Date.now(),
        merchant: extracted.merchant || (lang === 'fa' ? 'فروشگاه نامشخص' : 'Unknown Merchant'),
        date: extracted.date || today,
        jalaliDate: extracted.jalaliDate || getJalaliDateString(extracted.date || today),
        time: extracted.time || new Date().toTimeString().slice(0, 5),
        total: Number(extracted.total) || 0,
        currency: extracted.currency || 'IRT',
        currencyLabel: extracted.currencyLabel || (extracted.currency === 'USD' ? '$' : 'تومان'),
        category: (extracted.merchantCategorySuggestion as ExpenseCategory) || 'groceries',
        subtotal: extracted.subtotal,
        tax: extracted.tax || 0,
        discount: extracted.discount || 0,
        tip: extracted.tip || 0,
        paymentMethod: extracted.paymentMethod || (lang === 'fa' ? 'کارت بانکی' : 'Card'),
        referenceNumber: extracted.referenceNumber || '',
        cardLast4: extracted.cardLast4 || '',
        items: (extracted.items || []).map((it: any, idx: number) => ({
          id: `item-${idx + 1}`,
          name: it.name,
          quantity: it.quantity || 1,
          unitPrice: it.unitPrice || it.totalPrice,
          totalPrice: it.totalPrice,
        })),
        imageUrl: imageDataUrl,
        notes: extracted.notes || '',
        detectedLanguage: extracted.detectedLanguage || 'fa',
        confidenceScore: extracted.confidenceScore || 95,
        rawText: extracted.rawText || '',
        createdAt: new Date().toISOString(),
      };

      setReceiptData(parsedReceipt);
    } catch (err: any) {
      console.error('Scan Error:', err);
      // Fallback for preset samples if offline or API key pending
      if (samplePresetKey === 'hyperstar') {
        const today = new Date().toISOString().split('T')[0];
        setReceiptData({
          id: 'rcpt-' + Date.now(),
          merchant: 'هایپراستار باکری (Hyperstar)',
          date: today,
          jalaliDate: getJalaliDateString(today),
          time: '۱۸:۳۰',
          total: 420000,
          currency: 'IRT',
          currencyLabel: 'تومان',
          category: 'groceries',
          subtotal: 385320,
          tax: 34680,
          paymentMethod: 'کارت بانکی (پوز ملت)',
          referenceNumber: '۹۸۴۷۱۶۲۵۳۴',
          imageUrl: SAMPLE_RECEIPT_1_IMAGE,
          items: [
            { id: '1', name: 'شیر پرچرب کاله', quantity: 2, unitPrice: 45000, totalPrice: 90000 },
            { id: '2', name: 'پنیر سفید روزانه', quantity: 1, unitPrice: 85000, totalPrice: 85000 },
            { id: '3', name: 'تخم مرغ ۲۰ عددی', quantity: 1, unitPrice: 135000, totalPrice: 135000 },
            { id: '4', name: 'روغن سرخ کردنی بهار', quantity: 1, unitPrice: 110000, totalPrice: 110000 },
          ],
          notes: 'خرید هفتگی مواد غذایی',
          rawText: 'فروشگاه زنجیره‌ای هایپراستار - شعبه باکری\nشیر پرچرب کاله ۲ عدد ۹۰,۰۰۰ تومان...',
          detectedLanguage: 'fa',
          createdAt: new Date().toISOString(),
        });
      } else if (samplePresetKey === 'chamran') {
        const today = new Date().toISOString().split('T')[0];
        setReceiptData({
          id: 'rcpt-' + Date.now(),
          merchant: 'کافه رستوران چمران',
          date: today,
          jalaliDate: getJalaliDateString(today),
          time: '۲۱:۱۰',
          total: 407000,
          currency: 'IRT',
          currencyLabel: 'تومان',
          category: 'dining',
          subtotal: 370000,
          tax: 37000,
          paymentMethod: 'دستگاه پوز سامان',
          referenceNumber: '۳۱۷۸۹۵۲۴۱۰',
          imageUrl: SAMPLE_RECEIPT_2_IMAGE,
          items: [
            { id: '1', name: 'اسپرسو دوبل ۱۰۰٪ عربیکا', quantity: 2, unitPrice: 80000, totalPrice: 160000 },
            { id: '2', name: 'چیز کیک سن سباستین', quantity: 1, unitPrice: 180000, totalPrice: 180000 },
            { id: '3', name: 'آب معدنی بزرگ', quantity: 1, unitPrice: 30000, totalPrice: 30000 },
          ],
          rawText: 'کافه چمران\nشماره میز: ۱۲\nاسپرسو ۱۶۰,۰۰۰\nچیزکیک ۱۸۰,۰۰۰\nآب معدنی ۳۰,۰۰۰\nجمع کل: ۴۰۷,۰۰۰ تومان',
          detectedLanguage: 'fa',
          createdAt: new Date().toISOString(),
        });
      } else if (samplePresetKey === 'starbucks') {
        const today = new Date().toISOString().split('T')[0];
        setReceiptData({
          id: 'rcpt-' + Date.now(),
          merchant: 'Starbucks Coffee #1084',
          date: today,
          jalaliDate: getJalaliDateString(today),
          time: '08:24',
          total: 11.69,
          currency: 'USD',
          currencyLabel: '$',
          category: 'dining',
          subtotal: 10.7,
          tax: 0.99,
          paymentMethod: 'Apple Pay / Visa',
          referenceNumber: 'AUTH-9921',
          imageUrl: SAMPLE_RECEIPT_3_IMAGE,
          items: [
            { id: '1', name: 'Caramel Macchiato Grande', quantity: 1, unitPrice: 6.25, totalPrice: 6.25 },
            { id: '2', name: 'Butter Croissant Warm', quantity: 1, unitPrice: 4.45, totalPrice: 4.45 },
          ],
          rawText: 'STARBUCKS STORE 1084\n1 Caramel Macchiato $6.25\n1 Butter Croissant $4.45\nTax: $0.99\nTotal: $11.69',
          detectedLanguage: 'en',
          createdAt: new Date().toISOString(),
        });
      } else {
        setErrorMsg(
          err?.message ||
            (lang === 'fa'
              ? 'خطا در اسکن رسید. لطفا مجدد تلاش کنید یا اطلاعات را دستی بررسی نمایید.'
              : 'Failed to scan receipt. Please retry or enter manually.')
        );
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Add Item to Line Items
  const handleAddItem = () => {
    if (!receiptData) return;
    const currentItems = receiptData.items || [];
    setReceiptData({
      ...receiptData,
      items: [
        ...currentItems,
        {
          id: 'item-' + Date.now(),
          name: '',
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
        },
      ],
    });
  };

  // Remove Item
  const handleRemoveItem = (idx: number) => {
    if (!receiptData?.items) return;
    const updated = receiptData.items.filter((_, i) => i !== idx);
    setReceiptData({ ...receiptData, items: updated });
  };

  // Update item field
  const handleItemChange = (idx: number, field: keyof ReceiptItem, val: any) => {
    if (!receiptData?.items) return;
    const updated = [...receiptData.items];
    updated[idx] = { ...updated[idx], [field]: val };
    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(val) : updated[idx].quantity || 1;
      const u = field === 'unitPrice' ? Number(val) : updated[idx].unitPrice || 0;
      updated[idx].totalPrice = q * u;
    }
    setReceiptData({ ...receiptData, items: updated });
  };

  // Save Final Receipt
  const handleSave = () => {
    if (!receiptData?.merchant || receiptData.total === undefined) {
      alert(lang === 'fa' ? 'نام فروشگاه و مبلغ کل الزامی است' : 'Merchant and Total amount are required');
      return;
    }

    const finalReceipt: Receipt = {
      id: receiptData.id || 'rcpt-' + Date.now(),
      merchant: receiptData.merchant,
      date: receiptData.date || new Date().toISOString().split('T')[0],
      jalaliDate: receiptData.jalaliDate || getJalaliDateString(receiptData.date || ''),
      time: receiptData.time || '',
      total: Number(receiptData.total) || 0,
      currency: receiptData.currency || 'IRT',
      currencyLabel: receiptData.currencyLabel,
      category: receiptData.category || 'other',
      subtotal: receiptData.subtotal,
      tax: receiptData.tax,
      discount: receiptData.discount,
      tip: receiptData.tip,
      paymentMethod: receiptData.paymentMethod,
      referenceNumber: receiptData.referenceNumber,
      cardLast4: receiptData.cardLast4,
      items: receiptData.items || [],
      imageUrl: receiptData.imageUrl,
      notes: receiptData.notes,
      detectedLanguage: receiptData.detectedLanguage,
      confidenceScore: receiptData.confidenceScore,
      rawText: receiptData.rawText,
      createdAt: receiptData.createdAt || new Date().toISOString(),
    };

    onSaveReceipt(finalReceipt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">{t.scanNewReceipt}</h3>
              <p className="text-xs text-slate-500">{t.uploadDesc}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!receiptData ? (
            /* Stage 1: Capture or Select Receipt */
            <div className="space-y-6">
              {/* Source Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">
                <button
                  onClick={() => setActiveSource('upload')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeSource === 'upload'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>{t.chooseFile}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveSource('camera');
                    startCamera();
                  }}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeSource === 'camera'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>{t.useCamera}</span>
                </button>

                <button
                  onClick={() => setActiveSource('sample')}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeSource === 'sample'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{lang === 'fa' ? 'فاکتورهای نمونه' : 'Demo Receipts'}</span>
                </button>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{errorMsg}</p>
                    <button
                      onClick={() => {
                        // Fallback manual entry
                        const today = new Date().toISOString().split('T')[0];
                        setReceiptData({
                          id: 'rcpt-' + Date.now(),
                          merchant: '',
                          date: today,
                          jalaliDate: getJalaliDateString(today),
                          total: 0,
                          currency: 'IRT',
                          category: 'groceries',
                          items: [],
                          createdAt: new Date().toISOString(),
                        });
                      }}
                      className="mt-1.5 text-xs font-bold underline text-rose-800 hover:text-rose-900"
                    >
                      {lang === 'fa' ? 'یا ثبت دستی فاکتور را ادامه دهید' : 'Or switch to manual entry'}
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Tab */}
              {activeSource === 'upload' && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mb-1">{t.dragDropText}</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {lang === 'fa'
                      ? 'پشتیبانی از عکس فاکتور، رسید کارتخوان، فیش رستوران، قبض آب/برق (JPG، PNG، WEBP)'
                      : 'Supports receipt photos, POS slips, grocery bills, utility invoices (JPG, PNG, WEBP)'}
                  </p>
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    {t.chooseFile}
                  </button>
                </div>
              )}

              {/* Camera Tab */}
              {activeSource === 'camera' && (
                <div className="space-y-4">
                  <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-4/3 max-h-[400px] flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Viewfinder Receipt Overlay */}
                    <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                      <div className="flex justify-between">
                        <span className="w-4 h-4 border-t-2 border-l-2 border-emerald-400"></span>
                        <span className="w-4 h-4 border-t-2 border-r-2 border-emerald-400"></span>
                      </div>
                      <p className="text-center text-xs font-bold text-emerald-300 bg-slate-900/60 backdrop-blur-xs py-1 px-3 rounded-full mx-auto">
                        {lang === 'fa' ? 'رسید را داخل کادر قرار دهید' : 'Align receipt inside frame'}
                      </p>
                      <div className="flex justify-between">
                        <span className="w-4 h-4 border-b-2 border-l-2 border-emerald-400"></span>
                        <span className="w-4 h-4 border-b-2 border-r-2 border-emerald-400"></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3">
                    <button
                      onClick={captureFromCamera}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-600/30 active:scale-95 transition-all text-sm"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{t.capturePhoto}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Sample Receipts Tab */}
              {activeSource === 'sample' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">{t.sampleNotice}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        setSelectedImage(SAMPLE_RECEIPT_1_IMAGE);
                        runOCR(SAMPLE_RECEIPT_1_IMAGE, 'hyperstar');
                      }}
                      className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 text-right group transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 font-bold text-xs">
                        ۱
                      </div>
                      <h5 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                        {t.sampleIranianReceipt1}
                      </h5>
                      <p className="text-xs text-slate-500 mt-1">
                        {lang === 'fa' ? '۴۲۰,۰۰۰ تومان - مواد غذایی' : '420,000 Toman - Groceries'}
                      </p>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedImage(SAMPLE_RECEIPT_2_IMAGE);
                        runOCR(SAMPLE_RECEIPT_2_IMAGE, 'chamran');
                      }}
                      className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 text-right group transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2 font-bold text-xs">
                        ۲
                      </div>
                      <h5 className="font-bold text-sm text-slate-900 group-hover:text-amber-700">
                        {t.sampleIranianReceipt2}
                      </h5>
                      <p className="text-xs text-slate-500 mt-1">
                        {lang === 'fa' ? '۴۰۷,۰۰۰ تومان - کافه و رستوران' : '407,000 Toman - Cafe & Dining'}
                      </p>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedImage(SAMPLE_RECEIPT_3_IMAGE);
                        runOCR(SAMPLE_RECEIPT_3_IMAGE, 'starbucks');
                      }}
                      className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 text-right group transition-all"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2 font-bold text-xs">
                        ۳
                      </div>
                      <h5 className="font-bold text-sm text-slate-900 group-hover:text-blue-700">
                        {t.sampleUsReceipt}
                      </h5>
                      <p className="text-xs text-slate-500 mt-1">$11.69 - Starbucks Coffee</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Scanning Overlay Animation */}
              {isScanning && (
                <div className="rounded-2xl bg-emerald-950/90 text-white p-6 text-center space-y-4">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30 animate-ping"></div>
                    <div className="relative w-20 h-20 rounded-full bg-emerald-600/30 flex items-center justify-center text-emerald-400 border border-emerald-400/40">
                      <Sparkles className="w-10 h-10 animate-spin" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-emerald-200">{t.processingOCR}</h4>
                    <p className="text-xs text-emerald-400 mt-1">
                      {scanStep === 1 && t.ocrStep1}
                      {scanStep === 2 && t.ocrStep2}
                      {scanStep === 3 && t.ocrStep3}
                      {scanStep >= 4 && t.ocrStep4}
                    </p>
                  </div>
                  {/* Progress Step Bar */}
                  <div className="max-w-xs mx-auto flex items-center gap-1.5 justify-center">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          step <= scanStep ? 'bg-emerald-400' : 'bg-emerald-900'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Stage 2: Review, Verify & Edit Extracted Receipt Data */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Image Preview & Scan Summary */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>{t.receiptImage}</span>
                    </span>
                    <button
                      onClick={() => {
                        setReceiptData(null);
                        setSelectedImage(null);
                      }}
                      className="text-xs text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{lang === 'fa' ? 'اسکن مجدد' : 'Rescan'}</span>
                    </button>
                  </div>
                  {receiptData.imageUrl ? (
                    <div className="max-h-[340px] overflow-hidden rounded-lg border border-slate-200 bg-white flex items-center justify-center p-2">
                      <img
                        src={receiptData.imageUrl}
                        alt="Scanned receipt"
                        className="max-h-[320px] w-auto object-contain rounded"
                      />
                    </div>
                  ) : (
                    <div className="h-44 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                      {t.noImage}
                    </div>
                  )}
                </div>

                {/* OCR Metadata Badge */}
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-emerald-900">{t.ocrSuccess}</span>
                  </div>
                  <span className="font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    {usePersianDigits
                      ? `${toPersianDigits(receiptData.confidenceScore || 98)}٪`
                      : `${receiptData.confidenceScore || 98}%`}{' '}
                    {lang === 'fa' ? 'دقت' : 'Accuracy'}
                  </span>
                </div>

                {/* Raw OCR Text Expandable */}
                {receiptData.rawText && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setRawTextVisible(!rawTextVisible)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 flex items-center justify-between hover:bg-slate-100"
                    >
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>{t.rawOcrText}</span>
                      </span>
                      <span>{rawTextVisible ? '▲' : '▼'}</span>
                    </button>
                    {rawTextVisible && (
                      <pre className="p-3 text-[11px] font-mono text-slate-600 bg-white max-h-40 overflow-y-auto whitespace-pre-wrap dir-ltr">
                        {receiptData.rawText}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Editable Fields Form */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Merchant Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.merchant}</span>
                    </label>
                    <input
                      type="text"
                      value={receiptData.merchant || ''}
                      onChange={(e) => setReceiptData({ ...receiptData, merchant: e.target.value })}
                      placeholder={t.merchantPlaceholder}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold text-slate-900"
                    />
                  </div>

                  {/* Total Amount */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.amount}</span>
                    </label>
                    <input
                      type="number"
                      value={receiptData.total ?? ''}
                      onChange={(e) =>
                        setReceiptData({ ...receiptData, total: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-emerald-700"
                    />
                  </div>

                  {/* Currency */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.currency}</span>
                    </label>
                    <select
                      value={receiptData.currency || 'IRT'}
                      onChange={(e) =>
                        setReceiptData({
                          ...receiptData,
                          currency: e.target.value,
                          currencyLabel: e.target.value === 'IRT' ? 'تومان' : e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold bg-white"
                    >
                      <option value="IRT">تومان ایران (IRT / Toman)</option>
                      <option value="IRR">ریال ایران (IRR / Rial)</option>
                      <option value="USD">دلار آمریکا (USD $)</option>
                      <option value="EUR">یورو اروپا (EUR €)</option>
                      <option value="GBP">پوند انگلیس (GBP £)</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t.category}</span>
                      </label>
                      <button
                        type="button"
                        onClick={onOpenAddCategoryModal}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>{lang === 'fa' ? 'افزودن دسته جدید' : 'New Category'}</span>
                      </button>
                    </div>
                    <select
                      value={receiptData.category || 'groceries'}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          onOpenAddCategoryModal();
                        } else {
                          setReceiptData({ ...receiptData, category: e.target.value as ExpenseCategory });
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {lang === 'fa' ? c.labelFa : c.labelEn}
                        </option>
                      ))}
                      <option value="__NEW__">
                        {lang === 'fa' ? '+ افزودن دسته‌بندی جدید...' : '+ Add new category...'}
                      </option>
                    </select>
                  </div>

                  {/* Gregorian Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.date}</span>
                    </label>
                    <input
                      type="date"
                      value={receiptData.date || ''}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setReceiptData({
                          ...receiptData,
                          date: newDate,
                          jalaliDate: getJalaliDateString(newDate),
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>

                  {/* Jalali Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.jalaliDate}</span>
                    </label>
                    <input
                      type="text"
                      value={receiptData.jalaliDate || ''}
                      onChange={(e) => setReceiptData({ ...receiptData, jalaliDate: e.target.value })}
                      placeholder="۱۴۰۳/۰۸/۱۸"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.time}</span>
                    </label>
                    <input
                      type="text"
                      value={receiptData.time || ''}
                      onChange={(e) => setReceiptData({ ...receiptData, time: e.target.value })}
                      placeholder="14:30"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.paymentMethod}</span>
                    </label>
                    <input
                      type="text"
                      value={receiptData.paymentMethod || ''}
                      onChange={(e) => setReceiptData({ ...receiptData, paymentMethod: e.target.value })}
                      placeholder={lang === 'fa' ? 'کارت بانکی / نقدی' : 'Card / Cash'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>

                  {/* Reference / Tracking Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.referenceNumber}</span>
                    </label>
                    <input
                      type="text"
                      value={receiptData.referenceNumber || ''}
                      onChange={(e) => setReceiptData({ ...receiptData, referenceNumber: e.target.value })}
                      placeholder="۹۸۴۷۱۶۲۵۳۴"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>

                  {/* Tax / VAT */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <span>{t.tax}</span>
                    </label>
                    <input
                      type="number"
                      value={receiptData.tax ?? 0}
                      onChange={(e) =>
                        setReceiptData({ ...receiptData, tax: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>

                {/* Line Items Editor */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">{t.lineItems}</span>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-xs text-emerald-700 font-bold hover:bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.addItem}</span>
                    </button>
                  </div>

                  {receiptData.items && receiptData.items.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {receiptData.items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                        >
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                            placeholder={t.itemName}
                            className="flex-1 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs"
                          />
                          <input
                            type="number"
                            value={item.quantity || 1}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            placeholder={t.quantity}
                            className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs text-center"
                          />
                          <input
                            type="number"
                            value={item.totalPrice}
                            onChange={(e) => handleItemChange(idx, 'totalPrice', parseFloat(e.target.value) || 0)}
                            placeholder={t.totalPrice}
                            className="w-24 px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-1">
                      {lang === 'fa' ? 'هیچ قلم کالایی تفکیک نشده است.' : 'No itemized lines recorded.'}
                    </p>
                  )}
                </div>

                {/* Notes Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.notes}</label>
                  <textarea
                    rows={2}
                    value={receiptData.notes || ''}
                    onChange={(e) => setReceiptData({ ...receiptData, notes: e.target.value })}
                    placeholder={t.notesPlaceholder}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {t.cancel}
          </button>

          {receiptData && (
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

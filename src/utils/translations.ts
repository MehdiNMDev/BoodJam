import { ExpenseCategory, Language } from '../types';

export interface Translations {
  appName: string;
  appTagline: string;
  dashboard: string;
  receipts: string;
  scanReceipt: string;
  reportsExport: string;
  settings: string;
  totalSpending: string;
  receiptCount: string;
  averageReceipt: string;
  totalTax: string;
  topCategory: string;
  monthOverMonth: string;
  spendingByCategory: string;
  dailySpendingTrend: string;
  paymentMethods: string;
  currencyBreakdown: string;
  recentReceipts: string;
  viewAll: string;
  scanNewReceipt: string;
  uploadOrCapture: string;
  uploadDesc: string;
  dragDropText: string;
  chooseFile: string;
  useCamera: string;
  capturePhoto: string;
  stopCamera: string;
  switchCamera: string;
  trySampleReceipts: string;
  sampleIranianReceipt1: string;
  sampleIranianReceipt2: string;
  sampleUsReceipt: string;
  processingOCR: string;
  ocrStep1: string;
  ocrStep2: string;
  ocrStep3: string;
  ocrStep4: string;
  ocrSuccess: string;
  ocrError: string;
  manualAdd: string;
  editReceipt: string;
  deleteReceipt: string;
  confirmDelete: string;
  deleteWarning: string;
  cancel: string;
  save: string;
  saving: string;
  merchant: string;
  merchantPlaceholder: string;
  amount: string;
  currency: string;
  date: string;
  jalaliDate: string;
  time: string;
  category: string;
  paymentMethod: string;
  referenceNumber: string;
  cardLast4: string;
  tax: string;
  tip: string;
  discount: string;
  subtotal: string;
  notes: string;
  notesPlaceholder: string;
  lineItems: string;
  addItem: string;
  itemName: string;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
  rawOcrText: string;
  showRawText: string;
  exportTitle: string;
  exportSubtitle: string;
  exportExcelXlsx: string;
  exportExcelXls: string;
  exportCsv: string;
  exportPdf: string;
  printReport: string;
  exportSuccess: string;
  exportRange: string;
  currentMonth: string;
  allTime: string;
  selectedMonth: string;
  searchReceipts: string;
  allCategories: string;
  allCurrencies: string;
  noReceiptsFound: string;
  noReceiptsYet: string;
  noReceiptsDesc: string;
  filterByMonth: string;
  viewReceiptDetails: string;
  receiptImage: string;
  noImage: string;
  languageToggle: string;
  persianDigitsToggle: string;
  persianDigitsDesc: string;
  preferredCalendar: string;
  solarHijri: string;
  gregorian: string;
  defaultCurrency: string;
  privacyNotice: string;
  categories: Record<ExpenseCategory, string>;
  paymentMethodNames: {
    card: string;
    cash: string;
    pos: string;
    online: string;
    transfer: string;
    other: string;
  };
  sampleNotice: string;
  loadDemoData: string;
  clearAllData: string;
  resetConfirm: string;
  monthlyBudgetGoals: string;
  manageBudgets: string;
  totalBudget: string;
  remainingBudget: string;
  budgetUsed: string;
  overBudget: string;
  onTrack: string;
  nearLimit: string;
  budgetGoal: string;
  saveBudgets: string;
  setCategoryBudgetsDesc: string;
  budgetVsActual: string;
  noBudgetSet: string;
}

export const translations: Record<Language, Translations> = {
  fa: {
    appName: 'بودجم',
    appTagline: 'اسکن هوشمند فاکتورها، بودجه‌بندی ماهانه و رهگیری مخارج',
    dashboard: 'داشبورد مالی',
    receipts: 'فهرست فاکتورها',
    scanReceipt: 'اسکن فاکتور / رسید',
    reportsExport: 'گزارش و خروجی',
    settings: 'تنظیمات',
    totalSpending: 'کل هزینه‌های ماه',
    receiptCount: 'تعداد فاکتورها',
    averageReceipt: 'میانگین هر خرید',
    totalTax: 'مالیات بر ارزش افزوده',
    topCategory: 'بیشترین سهم هزینه',
    monthOverMonth: 'نسبت به ماه گذشته',
    spendingByCategory: 'تفکیک هزینه‌ها بر اساس دسته‌بندی',
    dailySpendingTrend: 'نمودار مخارج روزانه این ماه',
    paymentMethods: 'روش‌های پرداخت',
    currencyBreakdown: 'تفکیک بر اساس ارز',
    recentReceipts: 'آخرین فاکتورهای ثبت شده',
    viewAll: 'مشاهده همه',
    scanNewReceipt: 'اسکن فاکتور جدید با هوش مصنوعی',
    uploadOrCapture: 'تصویر رسید یا قبض را آپلود کرده یا با دوربین عکاسی کنید',
    uploadDesc: 'پشتیبانی از انواع فرمت‌های تصویری رسیدهای فروشگاهی، کارتخوان‌های بانکی، رستوران‌ها و سوپرمارکت‌ها',
    dragDropText: 'فایل عکس فاکتور را اینجا بکشید یا کلیک کنید',
    chooseFile: 'انتخاب تصویر فاکتور',
    useCamera: 'استفاده از دوربین زنده',
    capturePhoto: 'ثبت عکس رسید',
    stopCamera: 'بستن دوربین',
    switchCamera: 'تغییر دوربین',
    trySampleReceipts: 'یا فاکتورهای نمونه را امتحان کنید:',
    sampleIranianReceipt1: 'رسید هایپراستار (تومان)',
    sampleIranianReceipt2: 'رسید کافه چمران (تومان)',
    sampleUsReceipt: 'رسید خرید استارباکس (دلار)',
    processingOCR: 'در حال پردازش هوشمند تصویر با فناوری OCR...',
    ocrStep1: 'بهینه‌سازی کیفیت و کنتراست تصویر...',
    ocrStep2: 'شناسایی و استخراج متون فارسی و ارقام...',
    ocrStep3: 'تفکیک اقلام، نام فروشگاه، مبالغ و تاریخ...',
    ocrStep4: 'دسته‌بندی خودکار هزینه...',
    ocrSuccess: 'فاکتور با موفقیت اسکن و شناسایی شد!',
    ocrError: 'خطا در اسکن تصویر. لطفا تصویر واضح‌تری انتخاب کنید یا دستی وارد نمایید.',
    manualAdd: 'ثبت دستی فاکتور',
    editReceipt: 'ویرایش فاکتور',
    deleteReceipt: 'حذف فاکتور',
    confirmDelete: 'آیا از حذف این فاکتور مطمئن هستید؟',
    deleteWarning: 'این عملیات غیرقابل بازگشت است.',
    cancel: 'انصراف',
    save: 'ذخیره فاکتور',
    saving: 'در حال ذخیره...',
    merchant: 'نام فروشگاه / کسب‌وکار',
    merchantPlaceholder: 'مثال: سوپرمارکت افق کوروش، رستوران البرز',
    amount: 'مبلغ کل',
    currency: 'واحد پول',
    date: 'تاریخ میلادی',
    jalaliDate: 'تاریخ شمسی',
    time: 'ساعت خرید',
    category: 'دسته‌بندی هزینه',
    paymentMethod: 'روش پرداخت',
    referenceNumber: 'شماره پیگیری / کد رهگیری',
    cardLast4: '۴ رقم آخر کارت',
    tax: 'مالیات / ارزش افزوده',
    tip: 'انعام / حق سرویس',
    discount: 'تخفیف',
    subtotal: 'مبلغ پایه (بدون مالیات)',
    notes: 'یادداشت یا توضیحات',
    notesPlaceholder: 'توضیحات تکمیلی درباره این خرید...',
    lineItems: 'اقلام و ریز فاکتور',
    addItem: 'افزودن قلم کالا',
    itemName: 'نام کالا یا خدمت',
    quantity: 'تعداد',
    unitPrice: 'قیمت واحد',
    totalPrice: 'قیمت کل',
    rawOcrText: 'متن استخراج‌شده خام (OCR)',
    showRawText: 'مشاهده متن کامل خوانده‌شده',
    exportTitle: 'خروجی گزارش‌های هزینه‌کرد ماهانه',
    exportSubtitle: 'دریافت خروجی در فرمت‌های استاندارد مایکروسافت اکسل (.xlsx و .xls)، فایل CSV و سند PDF',
    exportExcelXlsx: 'خروجی اکسل مدرن (Excel .xlsx)',
    exportExcelXls: 'خروجی اکسل سازگار (MS Excel .xls)',
    exportCsv: 'خروجی فایل داده CSV (UTF-8)',
    exportPdf: 'دریافت گزارش سندی PDF',
    printReport: 'نسخه چاپی / چاپ مستقیم',
    exportSuccess: 'فایل با موفقیت صادر و دانلود شد.',
    exportRange: 'بازه گزارش',
    currentMonth: 'ماه جاری',
    allTime: 'تمام ماه‌ها (کل هزینه‌ها)',
    selectedMonth: 'ماه انتخاب‌شده',
    searchReceipts: 'جستجو در نام فروشگاه یا اقلام خرید...',
    allCategories: 'همه دسته‌بندی‌ها',
    allCurrencies: 'همه ارزها',
    noReceiptsFound: 'هیچ فاکتوری با این مشخصات یافت نشد.',
    noReceiptsYet: 'هنوز هیچ فاکتوری ثبت نشده است',
    noReceiptsDesc: 'برای شروع، اولین فاکتور یا قبض خود را اسکن کنید یا از دکمه بارگذاری داده‌های نمونه استفاده نمایید.',
    filterByMonth: 'فیلتر بر اساس ماه',
    viewReceiptDetails: 'جزئیات فاکتور',
    receiptImage: 'تصویر فاکتور اسکن‌شده',
    noImage: 'تصویری پیوست نشده است',
    languageToggle: 'زبان برنامه',
    persianDigitsToggle: 'نمایش اعداد به فرمت فارسی (۱۲۳۴۵۶۷۸۹۰)',
    persianDigitsDesc: 'ارقام مبالغ و تاریخ‌ها به صورت ارقام فارسی نمایش داده شوند',
    preferredCalendar: 'تقویم پیش‌فرض',
    solarHijri: 'تقویم هجری شمسی (جلالی)',
    gregorian: 'تقویم میلادی',
    defaultCurrency: 'ارز پیش‌فرض',
    privacyNotice: 'تمامی اطلاعات و تصاویر فاکتورهای شما به صورت محلی در مرورگر شما ذخیره و محافظت می‌شوند.',
    categories: {
      groceries: 'سوپرمارکت و مواد غذایی',
      dining: 'رستوران، کافه و فست‌فود',
      shopping: 'پوشاک و خرید روزمره',
      transport: 'حمل و نقل، بنزین و تاکسی',
      utilities: 'قبوض آب، برق، گاز و اینترنت',
      health: 'درمان، داروخانه و پزشکی',
      entertainment: 'تفریح، سفر و سرگرمی',
      work: 'تجهیزات اداری و آموزش',
      other: 'سایر مخارج',
    },
    paymentMethodNames: {
      card: 'کارت بانکی',
      cash: 'وجه نقد',
      pos: 'دستگاه پوز',
      online: 'درگاه آنلاین',
      transfer: 'کارت به کارت / شبا',
      other: 'سایر',
    },
    sampleNotice: 'با داده‌های دمو می‌توانید عملکرد گزارش‌ها و خروجی‌های اکسل و پی‌دی‌اف را آزمایش کنید.',
    loadDemoData: 'بارگذاری فاکتورهای نمونه ایرانی و بین‌المللی',
    clearAllData: 'پاکسازی تمام داده‌ها',
    resetConfirm: 'آیا مایل به حذف تمام فاکتورها هستید؟',
    monthlyBudgetGoals: 'سقف بودجه‌بندی ماهانه',
    manageBudgets: 'تنظیم سقف بودجه دسته‌ها',
    totalBudget: 'سقف کل بودجه',
    remainingBudget: 'باقی‌مانده بودجه',
    budgetUsed: 'مصرف شده',
    overBudget: 'مازاد بر بودجه',
    onTrack: 'در محدوده مجاز',
    nearLimit: 'نزدیک به سقف بودجه',
    budgetGoal: 'سقف بودجه',
    saveBudgets: 'ذخیره سقف بودجه‌ها',
    setCategoryBudgetsDesc: 'تعیین حداکثر سقف مجاز مخارج در هر ماه برای کنترل بهتر هزینه‌ها',
    budgetVsActual: 'مقایسه مخارج واقعی با سقف بودجه',
    noBudgetSet: 'بودجه‌ای تعیین نشده',
  },
  en: {
    appName: 'Boodjam (بودجم)',
    appTagline: 'Smart OCR receipt scanning, monthly category budgeting & expense tracking',
    dashboard: 'Financial Dashboard',
    receipts: 'Receipts List',
    scanReceipt: 'Scan Receipt',
    reportsExport: 'Reports & Export',
    settings: 'Settings',
    totalSpending: 'Total Monthly Spend',
    receiptCount: 'Total Receipts',
    averageReceipt: 'Average Expense',
    totalTax: 'Total VAT / Tax',
    topCategory: 'Top Spending Category',
    monthOverMonth: 'vs Previous Month',
    spendingByCategory: 'Spending by Category',
    dailySpendingTrend: 'Daily Spending Trend',
    paymentMethods: 'Payment Methods',
    currencyBreakdown: 'Currency Breakdown',
    recentReceipts: 'Recent Receipts',
    viewAll: 'View All',
    scanNewReceipt: 'Scan Receipt with AI OCR',
    uploadOrCapture: 'Upload receipt image or capture directly with your camera',
    uploadDesc: 'Supports supermarket receipts, POS slips, cafe bills, invoices in English and Farsi',
    dragDropText: 'Drag & drop your receipt image here, or browse',
    chooseFile: 'Browse Receipt Image',
    useCamera: 'Use Live Camera',
    capturePhoto: 'Capture Photo',
    stopCamera: 'Stop Camera',
    switchCamera: 'Switch Camera',
    trySampleReceipts: 'Or test instant OCR with sample receipts:',
    sampleIranianReceipt1: 'Hyperstar Grocery (Tomans)',
    sampleIranianReceipt2: 'Chamran Cafe (Tomans)',
    sampleUsReceipt: 'Starbucks Coffee (USD)',
    processingOCR: 'Processing receipt with Gemini Multimodal OCR...',
    ocrStep1: 'Enhancing image clarity & orientation...',
    ocrStep2: 'Detecting Persian/English characters & numbers...',
    ocrStep3: 'Extracting merchant, items, totals & date...',
    ocrStep4: 'Categorizing expense category...',
    ocrSuccess: 'Receipt successfully scanned & parsed!',
    ocrError: 'Failed to process receipt. Please upload a clear photo or enter manually.',
    manualAdd: 'Manual Entry',
    editReceipt: 'Edit Receipt',
    deleteReceipt: 'Delete Receipt',
    confirmDelete: 'Are you sure you want to delete this receipt?',
    deleteWarning: 'This action cannot be undone.',
    cancel: 'Cancel',
    save: 'Save Receipt',
    saving: 'Saving...',
    merchant: 'Merchant / Store Name',
    merchantPlaceholder: 'e.g. Costco, Whole Foods, Ofogh Koorosh',
    amount: 'Total Amount',
    currency: 'Currency',
    date: 'Date (Gregorian)',
    jalaliDate: 'Date (Solar Hijri / Jalali)',
    time: 'Time',
    category: 'Expense Category',
    paymentMethod: 'Payment Method',
    referenceNumber: 'Reference / Tracking #',
    cardLast4: 'Card Last 4 Digits',
    tax: 'VAT / Tax',
    tip: 'Tip / Service Fee',
    discount: 'Discount',
    subtotal: 'Subtotal (Before Tax)',
    notes: 'Notes / Description',
    notesPlaceholder: 'Add any notes about this expense...',
    lineItems: 'Itemized Line Items',
    addItem: 'Add Item',
    itemName: 'Item Name',
    quantity: 'Quantity',
    unitPrice: 'Unit Price',
    totalPrice: 'Total Price',
    rawOcrText: 'Raw OCR Transcribed Text',
    showRawText: 'View raw OCR text',
    exportTitle: 'Export Monthly Spending Reports',
    exportSubtitle: 'Export in Microsoft Excel (.xlsx and legacy .xls), CSV, and PDF formats for seamless accounting integration',
    exportExcelXlsx: 'Export to Excel (.xlsx)',
    exportExcelXls: 'Export to Legacy Excel (.xls)',
    exportCsv: 'Export to CSV (UTF-8)',
    exportPdf: 'Generate PDF Report',
    printReport: 'Print / Browser PDF Preview',
    exportSuccess: 'Report successfully generated & downloaded.',
    exportRange: 'Report Range',
    currentMonth: 'Current Month',
    allTime: 'All Time (Complete History)',
    selectedMonth: 'Selected Month',
    searchReceipts: 'Search receipts by merchant or item name...',
    allCategories: 'All Categories',
    allCurrencies: 'All Currencies',
    noReceiptsFound: 'No receipts match your search.',
    noReceiptsYet: 'No receipts scanned yet',
    noReceiptsDesc: 'Scan your first receipt or load pre-populated sample receipts to see the dashboard in action.',
    filterByMonth: 'Filter by Month',
    viewReceiptDetails: 'Receipt Details',
    receiptImage: 'Receipt Image',
    noImage: 'No image attached',
    languageToggle: 'App Language',
    persianDigitsToggle: 'Display Persian Digits (۱۲۳۴۵۶۷۸۹۰)',
    persianDigitsDesc: 'Format numbers and dates with Persian numerals',
    preferredCalendar: 'Preferred Calendar',
    solarHijri: 'Solar Hijri (Jalali)',
    gregorian: 'Gregorian',
    defaultCurrency: 'Default Currency',
    privacyNotice: 'All your receipt data and images are stored locally in your browser for complete privacy.',
    categories: {
      groceries: 'Groceries & Food',
      dining: 'Dining & Cafes',
      shopping: 'Shopping & Retail',
      transport: 'Transportation & Fuel',
      utilities: 'Utilities & Bills',
      health: 'Healthcare & Medical',
      entertainment: 'Entertainment & Travel',
      work: 'Office & Work',
      other: 'Other Expenses',
    },
    paymentMethodNames: {
      card: 'Debit / Credit Card',
      cash: 'Cash',
      pos: 'POS Terminal',
      online: 'Online Gateway',
      transfer: 'Bank Transfer',
      other: 'Other',
    },
    sampleNotice: 'Explore dashboard features, charts, and Excel/PDF exports with pre-built sample data.',
    loadDemoData: 'Load Sample Receipts (Farsi & English)',
    clearAllData: 'Clear All Receipts',
    resetConfirm: 'Are you sure you want to reset and delete all receipts?',
    monthlyBudgetGoals: 'Monthly Category Budgets',
    manageBudgets: 'Set Budget Goals',
    totalBudget: 'Total Set Budget',
    remainingBudget: 'Remaining Budget',
    budgetUsed: 'Budget Spent',
    overBudget: 'Over Budget',
    onTrack: 'On Track',
    nearLimit: 'Near Budget Limit',
    budgetGoal: 'Budget Goal',
    saveBudgets: 'Save Budget Goals',
    setCategoryBudgetsDesc: 'Define monthly maximum spending limits per category to keep your finances on track',
    budgetVsActual: 'Actual Spending vs Budget Limit',
    noBudgetSet: 'No budget set',
  },
};

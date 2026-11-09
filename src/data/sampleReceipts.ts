import { Receipt } from '../types';

/**
 * Generates an authentic SVG receipt image as a base64 Data URL
 */
function createReceiptSvg(
  merchant: string,
  jalaliDate: string,
  items: { name: string; qty: number; price: string }[],
  totalStr: string,
  currency: string,
  ref: string
): string {
  const itemsSvg = items
    .map(
      (item, idx) => `
    <text x="20" y="${170 + idx * 24}" font-size="12" fill="#1e293b" font-family="sans-serif">${item.name}</text>
    <text x="210" y="${170 + idx * 24}" font-size="11" fill="#64748b" font-family="sans-serif">${item.qty}x</text>
    <text x="280" y="${170 + idx * 24}" font-size="12" font-weight="600" fill="#0f172a" text-anchor="end" font-family="sans-serif">${item.price}</text>
  `
    )
    .join('');

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420">
    <defs>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.12"/>
      </filter>
    </defs>
    <!-- Receipt Paper Background -->
    <rect x="10" y="10" width="280" height="400" rx="6" fill="#ffffff" filter="url(#shadow)" stroke="#e2e8f0" stroke-width="1"/>
    <!-- Top jagged/notch aesthetic -->
    <path d="M10 16 L20 10 L30 16 L40 10 L50 16 L60 10 L70 16 L80 10 L90 16 L100 10 L110 16 L120 10 L130 16 L140 10 L150 16 L160 10 L170 16 L180 10 L190 16 L200 10 L210 16 L220 10 L230 16 L240 10 L250 16 L260 10 L270 16 L280 10 L290 16" stroke="#cbd5e1" fill="none" stroke-width="1.5"/>
    
    <!-- Store Header -->
    <circle cx="150" cy="50" r="16" fill="#10b981" opacity="0.15"/>
    <text x="150" y="55" font-size="14" font-weight="bold" fill="#059669" text-anchor="middle" font-family="sans-serif">RECEIPT</text>
    <text x="150" y="82" font-size="15" font-weight="bold" fill="#0f172a" text-anchor="middle" font-family="sans-serif">${merchant}</text>
    <text x="150" y="102" font-size="11" fill="#64748b" text-anchor="middle" font-family="sans-serif">Date: ${jalaliDate}</text>
    
    <line x1="25" y1="120" x2="275" y2="120" stroke="#cbd5e1" stroke-dasharray="4 3"/>

    <!-- Column labels -->
    <text x="20" y="140" font-size="10" font-weight="bold" fill="#94a3b8" font-family="sans-serif">ITEM / کالا</text>
    <text x="210" y="140" font-size="10" font-weight="bold" fill="#94a3b8" font-family="sans-serif">QTY</text>
    <text x="280" y="140" font-size="10" font-weight="bold" fill="#94a3b8" text-anchor="end" font-family="sans-serif">TOTAL</text>

    <!-- Items list -->
    ${itemsSvg}

    <line x1="25" y1="285" x2="275" y2="285" stroke="#94a3b8" stroke-width="1"/>

    <!-- Total Amount -->
    <text x="25" y="312" font-size="13" font-weight="bold" fill="#0f172a" font-family="sans-serif">TOTAL / جمع کل:</text>
    <text x="275" y="312" font-size="15" font-weight="bold" fill="#059669" text-anchor="end" font-family="sans-serif">${totalStr} ${currency}</text>
    
    <!-- Footer / POS info -->
    <rect x="25" y="335" width="250" height="42" rx="4" fill="#f8fafc" stroke="#f1f5f9"/>
    <text x="35" y="352" font-size="10" fill="#64748b" font-family="sans-serif">Payment: POS Card Terminal</text>
    <text x="35" y="368" font-size="10" fill="#64748b" font-family="sans-serif">RRN / پیگیری: ${ref}</text>

    <!-- Bottom barcode simulation -->
    <line x1="50" y1="392" x2="250" y2="392" stroke="#475569" stroke-width="4" stroke-dasharray="3 2 1 4 2 1 5 1 2 3 4 2 1 3"/>
  </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_RECEIPT_1_IMAGE = createReceiptSvg(
  'هایپراستار باکری (Hyperstar)',
  '۱۴۰۵/۰۸/۱۴',
  [
    { name: 'شیر پرچرب کاله', qty: 2, price: '۹۰,۰۰۰' },
    { name: 'پنیر سفید روزانه', qty: 1, price: '۸۵,۰۰۰' },
    { name: 'تخم مرغ ۲۰ عددی', qty: 1, price: '۱۳۵,۰۰۰' },
    { name: 'روغن سرخ کردنی بهار', qty: 1, price: '۱۱۰,۰۰۰' },
  ],
  '۴۲۰,۰۰۰',
  'تومان',
  '۹۸۴۷۱۶۲۵۳۴'
);

export const SAMPLE_RECEIPT_2_IMAGE = createReceiptSvg(
  'کافه رستوران چمران (Chamran)',
  '۱۴۰۵/۰۸/۱۶',
  [
    { name: 'اسپرسو دوبل', qty: 2, price: '۱۶۰,۰۰۰' },
    { name: 'چیز کیک نوتلا', qty: 1, price: '۱۸۰,۰۰۰' },
    { name: 'آب معدنی بزرگ', qty: 1, price: '۳۰,۰۰۰' },
    { name: 'حق سرویس و مالیات', qty: 1, price: '۳۷,۰۰۰' },
  ],
  '۴۰۷,۰۰۰',
  'تومان',
  '۳۱۷۸۹۵۲۴۱۰'
);

export const SAMPLE_RECEIPT_3_IMAGE = createReceiptSvg(
  'Starbucks Coffee #1084',
  '2026-11-04',
  [
    { name: 'Caramel Macchiato Grande', qty: 1, price: '$6.25' },
    { name: 'Butter Croissant Warm', qty: 1, price: '$4.45' },
    { name: 'State Tax (9.25%)', qty: 1, price: '$0.99' },
  ],
  '$11.69',
  'USD',
  'REF-884920'
);

export const INITIAL_SAMPLE_RECEIPTS: Receipt[] = [
  {
    id: 'rcpt-fa-01',
    merchant: 'هایپراستار باکری (Hyperstar)',
    date: '2026-11-04',
    jalaliDate: '۱۴۰۵/۰۸/۱۴',
    time: '۱۷:۴۵',
    total: 420000,
    currency: 'IRT',
    currencyLabel: 'تومان',
    category: 'groceries',
    subtotal: 385320,
    tax: 34680,
    paymentMethod: 'کارت بانکی (پوز ملت)',
    referenceNumber: '۹۸۴۷۱۶۲۵۳۴',
    cardLast4: '۵۸۹۲',
    imageUrl: SAMPLE_RECEIPT_1_IMAGE,
    notes: 'خرید هفتگی مواد غذایی و لبنیات خانواده',
    detectedLanguage: 'fa',
    confidenceScore: 98,
    createdAt: '2026-11-04T17:45:00Z',
    items: [
      { id: 'it-1', name: 'شیر پرچرب کاله ۱ لیتر', quantity: 2, unitPrice: 45000, totalPrice: 90000 },
      { id: 'it-2', name: 'پنیر سفید روزانه ۵۰۰ گرم', quantity: 1, unitPrice: 85000, totalPrice: 85000 },
      { id: 'it-3', name: 'تخم مرغ ۲۰ عددی تلاونگ', quantity: 1, unitPrice: 135000, totalPrice: 135000 },
      { id: 'it-4', name: 'روغن سرخ کردنی بهار', quantity: 1, unitPrice: 110000, totalPrice: 110000 },
    ],
  },
  {
    id: 'rcpt-fa-02',
    merchant: 'کافه رستوران چمرan',
    date: '2026-11-06',
    jalaliDate: '۱۴۰۵/۰۸/۱۶',
    time: '۲۰:۱۵',
    total: 407000,
    currency: 'IRT',
    currencyLabel: 'تومان',
    category: 'dining',
    subtotal: 370000,
    tax: 37000,
    tip: 0,
    paymentMethod: 'دستگاه پوز سامان',
    referenceNumber: '۳۱۷۸۹۵۲۴۱۰',
    cardLast4: '۶۰۳۷',
    imageUrl: SAMPLE_RECEIPT_2_IMAGE,
    notes: 'جلسه کاری و صرف قهوه و دسر',
    detectedLanguage: 'fa',
    confidenceScore: 97,
    createdAt: '2026-11-06T20:15:00Z',
    items: [
      { id: 'it-5', name: 'اسپرسو دوبل ۱۰۰٪ عربیکا', quantity: 2, unitPrice: 80000, totalPrice: 160000 },
      { id: 'it-6', name: 'چیز کیک سن سباستین', quantity: 1, unitPrice: 180000, totalPrice: 180000 },
      { id: 'it-7', name: 'آب معدنی بزرگ دماوند', quantity: 1, unitPrice: 30000, totalPrice: 30000 },
    ],
  },
  {
    id: 'rcpt-fa-03',
    merchant: 'داروخانه دکتر صبوری',
    date: '2026-11-07',
    jalaliDate: '۱۴۰۵/۰۸/۱۷',
    time: '۱۱:۳۰',
    total: 285000,
    currency: 'IRT',
    currencyLabel: 'تومان',
    category: 'health',
    subtotal: 285000,
    tax: 0,
    paymentMethod: 'کارتخوان بانک پارسیان',
    referenceNumber: '۷۱۵۲۶۴۰۹۸۳',
    cardLast4: '۵۸۹۲',
    notes: 'خرید مکمل‌های ویتامین و داروهای سرماخوردگی',
    detectedLanguage: 'fa',
    confidenceScore: 99,
    createdAt: '2026-11-07T11:30:00Z',
    items: [
      { id: 'it-8', name: 'قرص جوشان ویتامین C ۱۰۰۰', quantity: 2, unitPrice: 65000, totalPrice: 130000 },
      { id: 'it-9', name: 'شربت ضد سرفه گیاهی پروسپان', quantity: 1, unitPrice: 155000, totalPrice: 155000 },
    ],
  },
  {
    id: 'rcpt-fa-04',
    merchant: 'جایگاه سوخت ولنجک (بنزین)',
    date: '2026-11-08',
    jalaliDate: '۱۴۰۵/۰۸/۱۸',
    time: '۰۹:۴۰',
    total: 150000,
    currency: 'IRT',
    currencyLabel: 'تومان',
    category: 'transport',
    paymentMethod: 'کارتخوان جایگاه سوخت',
    referenceNumber: '۴۴۱۵۲۶۳۷۴۸',
    notes: 'بنزین سوپر ۵۰ لیتر',
    detectedLanguage: 'fa',
    confidenceScore: 96,
    createdAt: '2026-11-08T09:40:00Z',
    items: [{ id: 'it-10', name: 'بنزین سوپر', quantity: 50, unitPrice: 3000, totalPrice: 150000 }],
  },
  {
    id: 'rcpt-fa-05',
    merchant: 'فروشگاه پوشاک هاکوپیان',
    date: '2026-10-24',
    jalaliDate: '۱۴۰۵/۰۸/۰۲',
    time: '۱۸:۱۰',
    total: 2850000,
    currency: 'IRT',
    currencyLabel: 'تومان',
    category: 'shopping',
    tax: 256500,
    paymentMethod: 'کارتخوان بانک ملت',
    referenceNumber: '۸۸۱۹۲۳۴۷۱۰',
    notes: 'خرید پیراهن مردانه و کراوات برای مراسم',
    detectedLanguage: 'fa',
    confidenceScore: 99,
    createdAt: '2026-10-24T18:10:00Z',
    items: [
      { id: 'it-11', name: 'پیراهن آستین بلند پنبه‌ای', quantity: 1, unitPrice: 2200000, totalPrice: 2200000 },
      { id: 'it-12', name: 'کراوات ابریشمی طرح دار', quantity: 1, unitPrice: 650000, totalPrice: 650000 },
    ],
  },
  {
    id: 'rcpt-fa-06',
    merchant: 'قبض گاز خانگی (شرکت ملی گاز)',
    date: '2026-10-15',
    jalaliDate: '۱۴۰۵/۰۷/۲۳',
    time: '۱۰:۰۰',
    total: 98000,
    currency: 'IRT',
    currencyLabel: 'تومان',
    category: 'utilities',
    paymentMethod: 'پرداخت آنلاین اینترنتی',
    referenceNumber: '۹۹۲۸۱۷۲۶۳۴',
    notes: 'قبض گاز دوره مهر ماه',
    detectedLanguage: 'fa',
    confidenceScore: 100,
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'rcpt-us-01',
    merchant: 'Starbucks Coffee #1084',
    date: '2026-11-03',
    jalaliDate: '۱۴۰۵/۰۸/۱۳',
    time: '08:24',
    total: 11.69,
    currency: 'USD',
    currencyLabel: '$',
    category: 'dining',
    subtotal: 10.7,
    tax: 0.99,
    paymentMethod: 'Apple Pay / Visa',
    referenceNumber: 'AUTH-9921',
    cardLast4: '4022',
    imageUrl: SAMPLE_RECEIPT_3_IMAGE,
    notes: 'Morning coffee meeting',
    detectedLanguage: 'en',
    confidenceScore: 98,
    createdAt: '2026-11-03T08:24:00Z',
    items: [
      { id: 'it-13', name: 'Caramel Macchiato Grande', quantity: 1, unitPrice: 6.25, totalPrice: 6.25 },
      { id: 'it-14', name: 'Butter Croissant Warm', quantity: 1, unitPrice: 4.45, totalPrice: 4.45 },
    ],
  },
];

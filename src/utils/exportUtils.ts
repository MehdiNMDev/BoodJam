import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { Receipt, Language, ExpenseCategory, CategoryDefinition } from '../types';
import { formatAmount, getJalaliDateString, toPersianDigits } from './jalali';
import { translations } from './translations';
import { getCategoryLabel } from './categoryTheme';

/**
 * Generates and downloads an Excel workbook (.xlsx or .xls)
 */
export function exportToExcel(
  receipts: Receipt[],
  periodLabel: string,
  lang: Language = 'fa',
  format: 'xlsx' | 'xls' = 'xlsx',
  categories?: CategoryDefinition[]
) {
  const t = translations[lang];
  const isFa = lang === 'fa';

  // 1. Calculate summary metrics
  const totalAmount = receipts.reduce((sum, r) => sum + (r.total || 0), 0);
  const totalTax = receipts.reduce((sum, r) => sum + (r.tax || 0), 0);
  const avgReceipt = receipts.length > 0 ? totalAmount / receipts.length : 0;

  // Category breakdown
  const categoryMap: Partial<Record<ExpenseCategory, { count: number; total: number }>> = {};
  receipts.forEach((r) => {
    const cat = r.category || 'other';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { count: 0, total: 0 };
    }
    categoryMap[cat]!.count += 1;
    categoryMap[cat]!.total += r.total || 0;
  });

  // Currency breakdown
  const currencyMap: Record<string, number> = {};
  receipts.forEach((r) => {
    const curr = r.currency || 'IRT';
    currencyMap[curr] = (currencyMap[curr] || 0) + (r.total || 0);
  });

  // Sheet 1: Summary Sheet
  const summaryData = [
    [isFa ? 'گزارش مخارج و تحلیل هزینه‌های فاکتورها' : 'Expense & Spending Summary Report'],
    [isFa ? 'بازه زمانی گزارش:' : 'Report Period:', periodLabel],
    [isFa ? 'تاریخ تهیه:' : 'Generated Date:', new Date().toLocaleDateString()],
    [],
    [isFa ? 'شاخص‌های کلیدی' : 'Key Metrics'],
    [isFa ? 'کل مبالغ پرداختی:' : 'Total Spending:', totalAmount],
    [isFa ? 'تعداد کل فاکتورها:' : 'Total Receipts:', receipts.length],
    [isFa ? 'میانگین هر فاکتور:' : 'Average per Receipt:', Math.round(avgReceipt)],
    [isFa ? 'کل مالیات / ارزش افزوده:' : 'Total Tax / VAT:', totalTax],
    [],
    [isFa ? 'تفکیک بر اساس دسته‌بندی' : 'Spending by Category'],
    [
      isFa ? 'دسته‌بندی' : 'Category',
      isFa ? 'تعداد فاکتور' : 'Receipt Count',
      isFa ? 'مجموع مبلغ' : 'Total Amount',
      isFa ? 'درصد از کل' : 'Share (%)',
    ],
  ];

  Object.entries(categoryMap).forEach(([catKey, data]) => {
    if (!data) return;
    const catName = getCategoryLabel(catKey, categories, lang);
    const share = totalAmount > 0 ? ((data.total / totalAmount) * 100).toFixed(1) : '0';
    summaryData.push([catName, data.count as any, data.total as any, `${share}%` as any]);
  });

  summaryData.push([]);
  summaryData.push([isFa ? 'تفکیک بر اساس ارزها' : 'Spending by Currency']);
  summaryData.push([isFa ? 'واحد پول' : 'Currency', isFa ? 'مجموع' : 'Total']);
  Object.entries(currencyMap).forEach(([curr, sum]) => {
    summaryData.push([curr, sum as any]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

  // Sheet 2: Receipts Log
  const receiptsData: any[] = [
    [
      isFa ? 'شناسه' : 'ID',
      isFa ? 'نام فروشگاه / پذیرنده' : 'Merchant',
      isFa ? 'دسته‌بندی' : 'Category',
      isFa ? 'مبلغ کل' : 'Total Amount',
      isFa ? 'واحد پول' : 'Currency',
      isFa ? 'تاریخ میلادی' : 'Date (Gregorian)',
      isFa ? 'تاریخ شمسی' : 'Date (Jalali)',
      isFa ? 'ساعت' : 'Time',
      isFa ? 'مالیات' : 'Tax',
      isFa ? 'تخفیف' : 'Discount',
      isFa ? 'روش پرداخت' : 'Payment Method',
      isFa ? 'شماره پیگیری' : 'Reference #',
      isFa ? 'توضیحات' : 'Notes',
    ],
  ];

  receipts.forEach((r, idx) => {
    receiptsData.push([
      idx + 1,
      r.merchant,
      getCategoryLabel(r.category, categories, lang),
      r.total,
      r.currency,
      r.date,
      r.jalaliDate || getJalaliDateString(r.date),
      r.time || '',
      r.tax || 0,
      r.discount || 0,
      r.paymentMethod || '',
      r.referenceNumber || '',
      r.notes || '',
    ]);
  });

  const wsReceipts = XLSX.utils.aoa_to_sheet(receiptsData);

  // Sheet 3: Line Items Breakdown
  const itemsData: any[] = [
    [
      isFa ? 'فروشگاه' : 'Merchant',
      isFa ? 'تاریخ' : 'Date',
      isFa ? 'نام کالا / خدمت' : 'Item Name',
      isFa ? 'تعداد' : 'Quantity',
      isFa ? 'قیمت واحد' : 'Unit Price',
      isFa ? 'قیمت کل' : 'Total Price',
      isFa ? 'ارز' : 'Currency',
    ],
  ];

  receipts.forEach((r) => {
    if (r.items && r.items.length > 0) {
      r.items.forEach((item) => {
        itemsData.push([
          r.merchant,
          r.jalaliDate || r.date,
          item.name,
          item.quantity || 1,
          item.unitPrice || item.totalPrice,
          item.totalPrice,
          r.currency,
        ]);
      });
    } else {
      itemsData.push([
        r.merchant,
        r.jalaliDate || r.date,
        isFa ? 'کل فاکتور (یکجا)' : 'Total Invoice',
        1,
        r.total,
        r.total,
        r.currency,
      ]);
    }
  });

  const wsItems = XLSX.utils.aoa_to_sheet(itemsData);

  // Set column widths for readability
  wsSummary['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
  wsReceipts['!cols'] = [
    { wch: 8 },
    { wch: 28 },
    { wch: 22 },
    { wch: 16 },
    { wch: 10 },
    { wch: 14 },
    { wch: 14 },
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 20 },
    { wch: 30 },
  ];
  wsItems['!cols'] = [
    { wch: 24 },
    { wch: 14 },
    { wch: 30 },
    { wch: 10 },
    { wch: 16 },
    { wch: 16 },
    { wch: 10 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, isFa ? 'خلاصه ماهانه' : 'Summary');
  XLSX.utils.book_append_sheet(wb, wsReceipts, isFa ? 'فهرست رسیدها' : 'Receipts');
  XLSX.utils.book_append_sheet(wb, wsItems, isFa ? 'ریز اقلام' : 'Line Items');

  const safePeriod = periodLabel.replace(/[\/\s:]/g, '_');
  const filename = `Expense_Report_${safePeriod}.${format}`;

  XLSX.writeFile(wb, filename, {
    bookType: format === 'xls' ? 'biff8' : 'xlsx',
  });
}

/**
 * Generates and downloads a CSV file with UTF-8 BOM encoding for Excel compatibility
 */
export function exportToCSV(
  receipts: Receipt[],
  periodLabel: string,
  lang: Language = 'fa',
  categories?: CategoryDefinition[]
) {
  const t = translations[lang];
  const isFa = lang === 'fa';

  const headers = [
    isFa ? 'شناسه' : 'ID',
    isFa ? 'نام فروشگاه' : 'Merchant',
    isFa ? 'دسته‌بندی' : 'Category',
    isFa ? 'مبلغ کل' : 'Total Amount',
    isFa ? 'واحد پول' : 'Currency',
    isFa ? 'تاریخ میلادی' : 'Date (Gregorian)',
    isFa ? 'تاریخ شمسی' : 'Date (Jalali)',
    isFa ? 'ساعت' : 'Time',
    isFa ? 'مالیات' : 'Tax',
    isFa ? 'روش پرداخت' : 'Payment Method',
    isFa ? 'کد رهگیری' : 'Reference #',
    isFa ? 'اقلام' : 'Items',
    isFa ? 'توضیحات' : 'Notes',
  ];

  const rows = receipts.map((r, i) => {
    const itemsSummary = r.items?.map((it) => `${it.name} (${it.totalPrice})`).join('; ') || '';
    return [
      i + 1,
      `"${(r.merchant || '').replace(/"/g, '""')}"`,
      `"${getCategoryLabel(r.category, categories, lang)}"`,
      r.total,
      `"${r.currency || 'IRT'}"`,
      `"${r.date || ''}"`,
      `"${r.jalaliDate || getJalaliDateString(r.date)}"`,
      `"${r.time || ''}"`,
      r.tax || 0,
      `"${(r.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${(r.referenceNumber || '').replace(/"/g, '""')}"`,
      `"${itemsSummary.replace(/"/g, '""')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  // Prepend UTF-8 BOM so Excel opens Persian text correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const safePeriod = periodLabel.replace(/[\/\s:]/g, '_');
  link.setAttribute('download', `Boodjam_Expense_Report_${safePeriod}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a clean PDF document using jsPDF
 */
export function exportToPDF(
  receipts: Receipt[],
  periodLabel: string,
  lang: Language = 'fa',
  categories?: CategoryDefinition[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const isFa = lang === 'fa';
  const t = translations[lang];

  // Header Title
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('Boodjam - Expense & Budget Report', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Period: ${periodLabel} | Generated: ${new Date().toLocaleDateString()}`, 14, 26);

  // Key metrics calculation
  const totalAmount = receipts.reduce((sum, r) => sum + (r.total || 0), 0);
  const totalTax = receipts.reduce((sum, r) => sum + (r.tax || 0), 0);
  const count = receipts.length;
  const avg = count > 0 ? Math.round(totalAmount / count) : 0;

  // Summary box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 32, 182, 26, 3, 3, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('Total Spending', 20, 40);
  doc.text('Total Receipts', 70, 40);
  doc.text('Average / Receipt', 120, 40);
  doc.text('Total Tax / VAT', 160, 40);

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`${totalAmount.toLocaleString()}`, 20, 48);
  doc.text(`${count}`, 70, 48);
  doc.text(`${avg.toLocaleString()}`, 120, 48);
  doc.text(`${totalTax.toLocaleString()}`, 160, 48);

  // Category summary section
  let currentY = 66;
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Category Breakdown', 14, currentY);
  currentY += 6;

  // Category counts
  const categoryMap: Partial<Record<string, number>> = {};
  receipts.forEach((r) => {
    categoryMap[r.category] = (categoryMap[r.category] || 0) + (r.total || 0);
  });

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  Object.entries(categoryMap).forEach(([cat, amount]) => {
    if (typeof amount !== 'number') return;
    const share = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : '0';
    const catName = getCategoryLabel(cat, categories, lang);
    doc.text(`• ${catName}: ${amount.toLocaleString()} (${share}%)`, 18, currentY);
    currentY += 5;
  });

  currentY += 6;
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Itemized Receipts Log', 14, currentY);
  currentY += 8;

  // Table header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, currentY - 5, 182, 8, 'F');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Date', 16, currentY);
  doc.text('Merchant', 44, currentY);
  doc.text('Category', 96, currentY);
  doc.text('Currency', 140, currentY);
  doc.text('Amount', 170, currentY);
  currentY += 7;

  // Table rows
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  receipts.slice(0, 45).forEach((r) => {
    if (currentY > 275) {
      doc.addPage();
      currentY = 20;
    }
    const displayDate = r.jalaliDate || r.date;
    doc.text(String(displayDate), 16, currentY);
    doc.text(String(r.merchant).substring(0, 24), 44, currentY);
    doc.text(String(getCategoryLabel(r.category, categories, lang)).substring(0, 20), 96, currentY);
    doc.text(String(r.currency || 'IRT'), 140, currentY);
    doc.text(Number(r.total || 0).toLocaleString(), 170, currentY);
    currentY += 6;
  });

  const safePeriod = periodLabel.replace(/[\/\s:]/g, '_');
  doc.save(`Boodjam_Report_${safePeriod}.pdf`);
}

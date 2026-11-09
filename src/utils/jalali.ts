/**
 * Jalali (Solar Hijri) calendar utilities and Persian numeral formatters
 */

// Persian digits array
export const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
export const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const GREGORIAN_MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const GREGORIAN_MONTHS_FA = [
  'ژانویه',
  'فوریه',
  'مارس',
  'آوریل',
  'مه',
  'ژوئن',
  'ژوئیه',
  'اوت',
  'سپتامبر',
  'اکتبر',
  'نوامبر',
  'دسامبر',
];

/**
 * Convert standard digits 0-9 to Persian digits ۰-۹
 */
export function toPersianDigits(input: string | number | undefined | null): string {
  if (input === undefined || input === null) return '';
  return String(input).replace(/[0-9]/g, (char) => PERSIAN_DIGITS[parseInt(char, 10)]);
}

/**
 * Convert Persian/Arabic digits to English digits 0-9
 */
export function toEnglishDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

/**
 * Standard Gregorian to Jalali converter algorithm
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy: number;
  if (gy > 1600) {
    jy = 979;
    gy -= 1600;
  } else {
    jy = 0;
    gy -= 621;
  }
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { jy, jm, jd };
}

/**
 * Jalali to Gregorian converter
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  let gy: number;
  if (jy > 979) {
    gy = 1600;
    jy -= 979;
  } else {
    gy = 621;
  }
  let days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * Math.floor(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const gd_m = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  while (gm < 13 && days >= gd_m[gm]) {
    days -= gd_m[gm];
    gm++;
  }
  return { gy, gm, gd: days + 1 };
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into Jalali format
 */
export function getJalaliDateString(isoDateStr: string): string {
  try {
    const parts = isoDateStr.split('T')[0].split('-');
    if (parts.length !== 3) return isoDateStr;
    const gy = parseInt(parts[0], 10);
    const gm = parseInt(parts[1], 10);
    const gd = parseInt(parts[2], 10);
    if (isNaN(gy) || isNaN(gm) || isNaN(gd)) return isoDateStr;
    const { jy, jm, jd } = gregorianToJalali(gy, gm, gd);
    return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
  } catch {
    return isoDateStr;
  }
}

/**
 * Format date display with Persian month name (e.g. "۱۸ آبان ۱۴۰۳")
 */
export function formatFullJalali(isoDateStr: string, usePersianDigits = true): string {
  try {
    const parts = isoDateStr.split('T')[0].split('-');
    if (parts.length !== 3) return isoDateStr;
    const gy = parseInt(parts[0], 10);
    const gm = parseInt(parts[1], 10);
    const gd = parseInt(parts[2], 10);
    const { jy, jm, jd } = gregorianToJalali(gy, gm, gd);
    const monthName = PERSIAN_MONTHS[jm - 1] || '';
    const res = `${jd} ${monthName} ${jy}`;
    return usePersianDigits ? toPersianDigits(res) : res;
  } catch {
    return isoDateStr;
  }
}

/**
 * Format money amount with commas and currency label
 */
export function formatAmount(
  amount: number,
  currency: string = 'IRT',
  usePersianDigits = true,
  lang: 'fa' | 'en' = 'fa'
): string {
  if (isNaN(amount)) return '0';
  const formattedNumber = Math.round(amount).toLocaleString('en-US');
  const numberStr = usePersianDigits ? toPersianDigits(formattedNumber) : formattedNumber;

  switch (currency.toUpperCase()) {
    case 'IRT':
    case 'TOMAN':
      return `${numberStr} ${lang === 'fa' ? 'تومان' : 'Toman'}`;
    case 'IRR':
    case 'RIAL':
      return `${numberStr} ${lang === 'fa' ? 'ریال' : 'Rials'}`;
    case 'USD':
      return lang === 'fa' ? `${numberStr} دلار` : `$${numberStr}`;
    case 'EUR':
      return lang === 'fa' ? `${numberStr} یورو` : `€${numberStr}`;
    case 'GBP':
      return lang === 'fa' ? `${numberStr} پوند` : `£${numberStr}`;
    default:
      return `${numberStr} ${currency}`;
  }
}

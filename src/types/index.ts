export type BuiltinExpenseCategory =
  | 'groceries'
  | 'dining'
  | 'shopping'
  | 'transport'
  | 'utilities'
  | 'health'
  | 'entertainment'
  | 'work'
  | 'other';

export type ExpenseCategory = BuiltinExpenseCategory | string;

export interface CategoryDefinition {
  id: string; // e.g. 'groceries', 'cat-rent'
  labelFa: string;
  labelEn: string;
  color: string; // hex color e.g. '#10b981'
  iconName: string; // key matching AVAILABLE_ICONS e.g. 'Home'
  isCustom?: boolean;
  defaultBudget?: number;
}

export interface ReceiptItem {
  id?: string;
  name: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice: number;
}

export interface Receipt {
  id: string;
  merchant: string;
  date: string; // ISO format: YYYY-MM-DD
  jalaliDate?: string; // Solar Hijri: YYYY/MM/DD
  time?: string; // HH:MM
  total: number;
  currency: 'IRT' | 'IRR' | 'USD' | 'EUR' | 'GBP' | string;
  currencyLabel?: string;
  category: ExpenseCategory;
  subtotal?: number;
  tax?: number;
  discount?: number;
  tip?: number;
  paymentMethod?: string;
  referenceNumber?: string;
  cardLast4?: string;
  items?: ReceiptItem[];
  imageUrl?: string;
  notes?: string;
  detectedLanguage?: 'fa' | 'en' | 'mixed';
  confidenceScore?: number;
  rawText?: string;
  createdAt: string;
}

export type Language = 'fa' | 'en';

export interface MonthlyStats {
  monthKey: string; // "2026-11" or "1405-08"
  monthLabel: string;
  totalAmount: number;
  receiptCount: number;
  averageReceipt: number;
  totalTax: number;
  topCategory: {
    category: ExpenseCategory;
    amount: number;
    percentage: number;
  } | null;
  byCategory: Record<ExpenseCategory, number>;
  byCurrency: Record<string, number>;
  dailySpending: { date: string; amount: number; count: number }[];
}

export type CategoryBudgets = Partial<Record<ExpenseCategory, number>>;

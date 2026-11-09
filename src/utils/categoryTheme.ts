import React from 'react';
import {
  ShoppingCart,
  UtensilsCrossed,
  ShoppingBag,
  Car,
  Lightbulb,
  HeartPulse,
  Film,
  Briefcase,
  Receipt,
  Home,
  GraduationCap,
  Dumbbell,
  Gift,
  Wrench,
  Shield,
  Baby,
  Plane,
  Coffee,
  Smartphone,
  Heart,
  Sparkles,
  BookOpen,
  Music,
  Tag,
  Palette,
} from 'lucide-react';
import { CategoryDefinition, ExpenseCategory, Language } from '../types';

export interface CategoryMeta {
  key: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const AVAILABLE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingCart,
  UtensilsCrossed,
  ShoppingBag,
  Car,
  Lightbulb,
  HeartPulse,
  Film,
  Briefcase,
  Receipt,
  Home,
  GraduationCap,
  Dumbbell,
  Gift,
  Wrench,
  Shield,
  Baby,
  Plane,
  Coffee,
  Smartphone,
  Heart,
  Sparkles,
  BookOpen,
  Music,
  Tag,
  Palette,
};

export const AVAILABLE_COLORS = [
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f43f5e', // rose
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#14b8a6', // teal
  '#64748b', // slate
];

export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'groceries',
    labelFa: 'سوپرمارکت و مواد غذایی',
    labelEn: 'Groceries & Food',
    color: '#10b981',
    iconName: 'ShoppingCart',
    defaultBudget: 2000000,
  },
  {
    id: 'dining',
    labelFa: 'رستوران، کافه و فست‌فود',
    labelEn: 'Dining & Cafes',
    color: '#f59e0b',
    iconName: 'UtensilsCrossed',
    defaultBudget: 1000000,
  },
  {
    id: 'shopping',
    labelFa: 'پوشاک و خرید روزمره',
    labelEn: 'Shopping & Retail',
    color: '#8b5cf6',
    iconName: 'ShoppingBag',
    defaultBudget: 3000000,
  },
  {
    id: 'transport',
    labelFa: 'حمل و نقل، بنزین و تاکسی',
    labelEn: 'Transportation & Fuel',
    color: '#3b82f6',
    iconName: 'Car',
    defaultBudget: 500000,
  },
  {
    id: 'utilities',
    labelFa: 'قبوض آب، برق، گاز و اینترنت',
    labelEn: 'Utilities & Bills',
    color: '#06b6d4',
    iconName: 'Lightbulb',
    defaultBudget: 400000,
  },
  {
    id: 'health',
    labelFa: 'درمان، داروخانه و پزشکی',
    labelEn: 'Healthcare & Medical',
    color: '#ef4444',
    iconName: 'HeartPulse',
    defaultBudget: 600000,
  },
  {
    id: 'entertainment',
    labelFa: 'تفریح، سفر و سرگرمی',
    labelEn: 'Entertainment & Travel',
    color: '#ec4899',
    iconName: 'Film',
    defaultBudget: 800000,
  },
  {
    id: 'work',
    labelFa: 'تجهیزات اداری و کار',
    labelEn: 'Office & Work',
    color: '#6366f1',
    iconName: 'Briefcase',
    defaultBudget: 500000,
  },
  {
    id: 'other',
    labelFa: 'سایر مخارج',
    labelEn: 'Other Expenses',
    color: '#64748b',
    iconName: 'Receipt',
    defaultBudget: 400000,
  },
];

export const CATEGORY_THEMES: Record<string, CategoryMeta> = {
  groceries: {
    key: 'groceries',
    color: '#10b981',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    icon: ShoppingCart,
  },
  dining: {
    key: 'dining',
    color: '#f59e0b',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    icon: UtensilsCrossed,
  },
  shopping: {
    key: 'shopping',
    color: '#8b5cf6',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    icon: ShoppingBag,
  },
  transport: {
    key: 'transport',
    color: '#3b82f6',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    icon: Car,
  },
  utilities: {
    key: 'utilities',
    color: '#06b6d4',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-700',
    icon: Lightbulb,
  },
  health: {
    key: 'health',
    color: '#ef4444',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
    icon: HeartPulse,
  },
  entertainment: {
    key: 'entertainment',
    color: '#ec4899',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    textColor: 'text-pink-700',
    icon: Film,
  },
  work: {
    key: 'work',
    color: '#6366f1',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    icon: Briefcase,
  },
  other: {
    key: 'other',
    color: '#64748b',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-700',
    icon: Receipt,
  },
};

/**
 * Returns CategoryMeta for any category key, supporting custom categories dynamically
 */
export function getCategoryMeta(
  catKey: string,
  allCategories?: CategoryDefinition[]
): CategoryMeta {
  if (CATEGORY_THEMES[catKey]) {
    return CATEGORY_THEMES[catKey];
  }

  // Look in custom categories
  const custom = allCategories?.find((c) => c.id === catKey);
  if (custom) {
    const IconComp = AVAILABLE_ICONS[custom.iconName] || Tag;
    return {
      key: catKey,
      color: custom.color || '#6366f1',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      textColor: 'text-slate-800',
      icon: IconComp,
    };
  }

  return {
    key: catKey,
    color: '#64748b',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-700',
    icon: Tag,
  };
}

/**
 * Returns localized label for category key
 */
export function getCategoryLabel(
  catKey: string,
  allCategories: CategoryDefinition[] | undefined,
  lang: Language = 'fa'
): string {
  const match = allCategories?.find((c) => c.id === catKey);
  if (match) {
    return lang === 'fa' ? match.labelFa : match.labelEn;
  }
  const defaultMatch = DEFAULT_CATEGORIES.find((c) => c.id === catKey);
  if (defaultMatch) {
    return lang === 'fa' ? defaultMatch.labelFa : defaultMatch.labelEn;
  }
  return catKey;
}

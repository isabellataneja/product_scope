import type { Category } from '@/types';

export const CATEGORIES: Category[] = [
  { id: 'general', label: 'General / Account Setup', color: '#FFF3E0', darkColor: '#78350f' },
  { id: 'sla', label: 'SLA & Scheduling', color: '#FFF3E0', darkColor: '#78350f' },
  { id: 'templates', label: 'Templates & Formatting', color: '#E8F5E9', darkColor: '#14532d' },
  { id: 'chartPrep', label: 'Chart Prep', color: '#E8F5E9', darkColor: '#14532d' },
  { id: 'precharting', label: 'Precharting', color: '#FFCDD2', darkColor: '#7f1d1d' },
  { id: 'aiNote', label: 'AI & Note Editing', color: '#E3F2FD', darkColor: '#1e3a5f' },
  { id: 'css', label: 'Clinical Support Services (CSS)', color: '#FFF9C4', darkColor: '#713f12' },
  { id: 'coding', label: 'Coding & Billing', color: '#F3E5F5', darkColor: '#581c87' },
];

export const CATEGORY_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map(c => [c.id, c])
);

import type { ScopeRow } from '@/types';

export const SCOPE_ROWS_STORAGE_KEY = 'product-scope-rows-v1';
export const SCOPE_HISTORY_STORAGE_KEY = 'product-scope-history-v1';
export const SCOPE_HISTORY_MAX = 25;

export interface ScopeHistoryEntry {
  id: string;
  at: string;
  summary: string;
  rows: ScopeRow[];
}

/** Browser-only load */
export function loadRowsFromStorage(): ScopeRow[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SCOPE_ROWS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ScopeRow[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveRowsToStorage(rows: ScopeRow[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SCOPE_ROWS_STORAGE_KEY, JSON.stringify(rows));
  } catch (e) {
    console.warn('Failed to save scope rows to localStorage', e);
  }
}

export function loadHistoryFromStorage(): ScopeHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SCOPE_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScopeHistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function saveHistoryToStorage(entries: ScopeHistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SCOPE_HISTORY_STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.warn('Failed to save scope history (may exceed quota); trimming', e);
    try {
      const half = entries.slice(0, Math.ceil(entries.length / 2));
      localStorage.setItem(SCOPE_HISTORY_STORAGE_KEY, JSON.stringify(half));
    } catch {
      localStorage.removeItem(SCOPE_HISTORY_STORAGE_KEY);
    }
  }
}

export function clearScopeStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SCOPE_ROWS_STORAGE_KEY);
  localStorage.removeItem(SCOPE_HISTORY_STORAGE_KEY);
}

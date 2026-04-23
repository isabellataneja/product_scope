'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { ScopeRow, CellValue } from '@/types';
import baselineRows from '@/data/scopeData.json';
import {
  loadHistoryFromStorage,
  loadRowsFromStorage,
  saveHistoryToStorage,
  saveRowsToStorage,
  SCOPE_HISTORY_MAX,
  type ScopeHistoryEntry,
} from '@/lib/scopePersistence';

const BASELINE = baselineRows as ScopeRow[];

function cloneRows(rows: ScopeRow[]): ScopeRow[] {
  return structuredClone(rows) as ScopeRow[];
}

function rowsLookValid(stored: ScopeRow[], baseline: ScopeRow[]): boolean {
  if (stored.length !== baseline.length) return false;
  const baseIds = new Set(baseline.map(r => r.id));
  for (const r of stored) {
    if (!baseIds.has(r.id)) return false;
  }
  return true;
}

interface ScopeDataContextValue {
  rows: ScopeRow[];
  history: ScopeHistoryEntry[];
  hydrated: boolean;
  updateCell: (rowId: string, field: string, value: CellValue | string) => void;
  revertToEntry: (entry: ScopeHistoryEntry) => void;
  resetToBaseline: () => void;
}

const ScopeDataContext = createContext<ScopeDataContextValue | null>(null);

export function useScopeData(): ScopeDataContextValue {
  const ctx = useContext(ScopeDataContext);
  if (!ctx) {
    throw new Error('useScopeData must be used within ScopeDataProvider');
  }
  return ctx;
}

/** Optional: use in pages that may render outside provider during tests */
export function useScopeDataOptional(): ScopeDataContextValue | null {
  return useContext(ScopeDataContext);
}

function buildChangeSummary(row: ScopeRow | undefined, field: string): string {
  const short = row?.offering ? row.offering.slice(0, 56) + (row.offering.length > 56 ? '…' : '') : row?.id ?? 'Row';
  if (field.startsWith('pl:')) {
    return `${short} · ${field.slice(3)}`;
  }
  return `${short} · ${field}`;
}

export function ScopeDataProvider({ children }: { children: ReactNode }) {
  const [rows, setRows] = useState<ScopeRow[]>(() => cloneRows(BASELINE));
  const [history, setHistory] = useState<ScopeHistoryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const skipNextPersist = useRef(false);

  // Hydrate from localStorage once (client)
  useEffect(() => {
    const stored = loadRowsFromStorage();
    const hist = loadHistoryFromStorage();
    if (stored && rowsLookValid(stored, BASELINE)) {
      skipNextPersist.current = true;
      setRows(cloneRows(stored));
    }
    if (hist.length > 0) {
      const valid = hist.filter(
        e => e.rows && Array.isArray(e.rows) && rowsLookValid(e.rows as ScopeRow[], BASELINE)
      ) as ScopeHistoryEntry[];
      setHistory(valid.slice(0, SCOPE_HISTORY_MAX));
    }
    setHydrated(true);
  }, []);

  // Persist rows whenever they change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return;
    }
    saveRowsToStorage(rows);
  }, [rows, hydrated]);

  // Persist history when it changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    saveHistoryToStorage(history);
  }, [history, hydrated]);

  const updateCell = useCallback((rowId: string, field: string, value: CellValue | string) => {
    setRows(prev => {
      const touched = prev.find(r => r.id === rowId);
      const next = prev.map(row => {
        if (row.id !== rowId) return row;
        const contextFields = [
          'offering', 'currentState', 'additionalInfo', 'siteSpecific',
          'bestPractices', 'deviationCausesDelay', 'templateAdjustment', 'customFormatAdded', 'engBuildRequired',
        ];
        if (field.startsWith('pl:')) {
          const plName = field.slice(3);
          return { ...row, productLines: { ...row.productLines, [plName]: value as CellValue } };
        }
        if (contextFields.includes(field)) {
          return { ...row, [field]: value };
        }
        return { ...row, productLines: { ...row.productLines, [field]: value as CellValue } };
      });

      const entry: ScopeHistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        at: new Date().toISOString(),
        summary: buildChangeSummary(touched, field),
        rows: cloneRows(next),
      };

      setHistory(h => [entry, ...h].slice(0, SCOPE_HISTORY_MAX));
      return next;
    });
  }, []);

  const revertToEntry = useCallback((entry: ScopeHistoryEntry) => {
    if (!entry.rows || !rowsLookValid(entry.rows as ScopeRow[], BASELINE)) return;
    setRows(cloneRows(entry.rows as ScopeRow[]));
    setHistory(prev => {
      const i = prev.findIndex(e => e.id === entry.id);
      if (i < 0) return prev;
      return prev.slice(i);
    });
  }, []);

  const resetToBaseline = useCallback(() => {
    const fresh = cloneRows(BASELINE);
    setRows(fresh);
    setHistory([]);
    saveRowsToStorage(fresh);
    saveHistoryToStorage([]);
  }, []);

  const value = useMemo(
    () => ({
      rows,
      history,
      hydrated,
      updateCell,
      revertToEntry,
      resetToBaseline,
    }),
    [rows, history, hydrated, updateCell, revertToEntry, resetToBaseline]
  );

  return <ScopeDataContext.Provider value={value}>{children}</ScopeDataContext.Provider>;
}

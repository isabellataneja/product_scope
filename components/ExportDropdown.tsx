'use client';

import { useState, useRef, useEffect } from 'react';
import { exportJSON, exportCSV } from '@/lib/utils';
import type { ScopeRow } from '@/types';
import { PRODUCT_LINES } from '@/data/productLines';

interface Props {
  rows: ScopeRow[];
}

export default function ExportDropdown({ rows }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const plNames = PRODUCT_LINES.map(pl => pl.name);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors"
        title="Export data"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => { exportJSON(rows); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-[13px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <span className="text-[10px] font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">JSON</span>
            Export as JSON
          </button>
          <button
            onClick={() => { exportCSV(rows, plNames); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-[13px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <span className="text-[10px] font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">CSV</span>
            Export as CSV
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import { exportJSON, exportCSV } from '@/lib/utils';
import type { ScopeRow } from '@/types';
import { PRODUCT_LINES } from '@/data/productLines';

interface Props {
  rows: ScopeRow[];
}

export default function ExportButtons({ rows }: Props) {
  const plNames = PRODUCT_LINES.map(pl => pl.name);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => exportJSON(rows)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export JSON
      </button>
      <button
        onClick={() => exportCSV(rows, plNames)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export CSV
      </button>
    </div>
  );
}

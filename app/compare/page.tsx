'use client';

import type { ScopeRow } from '@/types';
import rawData from '@/data/scopeData.json';
import { FAMILY_GROUPS } from '@/data/productLines';
import ComparisonTable from '@/components/ComparisonTable';

const rows = rawData as ScopeRow[];

// Only compare families with more than 1 variant
const COMPARISON_FAMILIES = Object.entries(FAMILY_GROUPS).filter(([, pls]) => pls.length > 1);

export default function ComparePage() {
  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Family Comparison</h1>
        <p className="text-[13px] text-gray-500 dark:text-gray-400">
          Side-by-side comparison of product line variants within each family. By default, only rows where variants <strong>differ</strong> are shown.
        </p>
      </div>

      {/* Quick jump nav */}
      <div className="flex items-center gap-2 flex-wrap mb-8 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mr-1">Jump to:</span>
        {COMPARISON_FAMILIES.map(([family]) => (
          <a
            key={family}
            href={`#family-${family.replace(/\s+/g, '-').toLowerCase()}`}
            className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline px-2 py-0.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            {family}
          </a>
        ))}
      </div>

      {COMPARISON_FAMILIES.map(([family, productLines]) => (
        <div
          key={family}
          id={`family-${family.replace(/\s+/g, '-').toLowerCase()}`}
          className="scroll-mt-16"
        >
          <ComparisonTable
            familyName={family}
            productLines={productLines}
            rows={rows}
          />
        </div>
      ))}
    </div>
  );
}

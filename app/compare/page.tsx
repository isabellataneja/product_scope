'use client';

import { useState } from 'react';
import type { ScopeRow } from '@/types';
import rawData from '@/data/scopeData.json';
import { FAMILY_GROUPS, PRODUCT_LINES } from '@/data/productLines';
import ComparisonTable from '@/components/ComparisonTable';
import MultiSelect from '@/components/MultiSelect';

const rows = rawData as ScopeRow[];

const COMPARISON_FAMILIES = Object.entries(FAMILY_GROUPS).filter(([, pls]) => pls.length > 1);

export default function ComparePage() {
  const [customSelected, setCustomSelected] = useState<string[]>([]);
  const [useCustom, setUseCustom] = useState(false);

  // Build the comparison groups to render
  const comparisonGroups: { family: string; pls: string[] }[] = [];

  if (useCustom) {
    if (customSelected.length >= 2) {
      // Group by family if multiple families, otherwise show as one group
      const byFamily: Record<string, string[]> = {};
      for (const plName of customSelected) {
        const pl = PRODUCT_LINES.find(p => p.name === plName);
        const fam = pl?.family ?? 'Custom';
        if (!byFamily[fam]) byFamily[fam] = [];
        byFamily[fam].push(plName);
      }

      // If all from same family, show as one group
      const families = Object.keys(byFamily);
      if (families.length === 1) {
        comparisonGroups.push({ family: families[0], pls: customSelected });
      } else {
        // Cross-family: show as one "Custom Comparison" group
        comparisonGroups.push({ family: 'Custom Comparison', pls: customSelected });
      }
    }
  } else {
    COMPARISON_FAMILIES.forEach(([family, pls]) => {
      comparisonGroups.push({ family, pls });
    });
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Compare Product Lines</h1>
        <p className="text-[14px] text-gray-500 dark:text-gray-400">
          Side-by-side feature comparison. Differences are highlighted by default.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 shadow-sm">
        <div className="flex items-start gap-4 flex-wrap">
          {/* Mode toggle */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex-shrink-0">
            <button
              onClick={() => setUseCustom(false)}
              className={`text-[12px] px-3 py-1.5 rounded-md transition-colors font-medium ${
                !useCustom
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              All families
            </button>
            <button
              onClick={() => setUseCustom(true)}
              className={`text-[12px] px-3 py-1.5 rounded-md transition-colors font-medium ${
                useCustom
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Custom selection
            </button>
          </div>

          {/* Custom multi-select */}
          {useCustom && (
            <div className="flex-1 min-w-0">
              <MultiSelect
                selected={customSelected}
                onChange={setCustomSelected}
                max={5}
              />
              {customSelected.length < 2 && (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">
                  Select at least 2 product lines to compare
                </p>
              )}
            </div>
          )}

          {/* Family jump nav (default mode) */}
          {!useCustom && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-gray-400 dark:text-gray-500">Jump to:</span>
              {COMPARISON_FAMILIES.map(([family]) => (
                <a
                  key={family}
                  href={`#family-${family.replace(/\s+/g, '-').toLowerCase()}`}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline px-2 py-0.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-700"
                >
                  {family}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comparison tables */}
      {comparisonGroups.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <p className="text-[14px] font-medium text-gray-700 dark:text-gray-300">Select product lines to compare</p>
          <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-1">Choose at least 2 product lines from the dropdown above</p>
        </div>
      ) : (
        comparisonGroups.map(({ family, pls }) => (
          <div
            key={family}
            id={`family-${family.replace(/\s+/g, '-').toLowerCase()}`}
            className="scroll-mt-20"
          >
            <ComparisonTable
              familyName={family}
              productLines={pls}
              rows={rows}
            />
          </div>
        ))
      )}
    </div>
  );
}

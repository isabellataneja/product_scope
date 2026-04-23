'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ScopeRow } from '@/types';
import { CATEGORIES } from '@/data/categories';
import ProductLineSidebar from '@/components/ProductLineSidebar';
import FeatureSection from '@/components/FeatureSection';
import ExportDropdown from '@/components/ExportDropdown';
import { useScopeData } from '@/components/ScopeDataProvider';
import EditHistoryPanel from '@/components/EditHistoryPanel';

function MasterSheetInner() {
  const searchParams = useSearchParams();
  const { rows, updateCell } = useScopeData();
  const [selectedPLs, setSelectedPLs] = useState<string[]>(() => {
    const pl = searchParams.get('pl');
    return pl ? [pl] : [];
  });
  const [search, setSearch] = useState('');

  function togglePL(pl: string) {
    setSelectedPLs(prev => {
      if (prev.includes(pl)) return prev.filter(p => p !== pl);
      if (prev.length >= 3) return prev;
      return [...prev, pl];
    });
  }

  const rowsByCategory = CATEGORIES.reduce<Record<string, ScopeRow[]>>((acc, cat) => {
    acc[cat.id] = rows.filter(r => r.category === cat.id);
    return acc;
  }, {});

  const hasSelection = selectedPLs.length > 0;

  const includedCount = selectedPLs.length > 0
    ? rows.filter(r => {
        const v = r.productLines[selectedPLs[0]];
        return v === true || (typeof v === 'string' && v.trim() && v.toLowerCase() !== 'false');
      }).length
    : 0;

  return (
    <div className="flex" style={{ height: 'calc(100vh - 48px)' }}>
      <ProductLineSidebar
        rows={rows}
        selected={selectedPLs}
        onSelect={togglePL}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {hasSelection ? (
              <div className="flex items-center gap-2 flex-wrap">
                {selectedPLs.map((pl, i) => (
                  <div key={pl} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-gray-300 dark:text-gray-600 text-sm">vs</span>}
                    <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-[13px] font-semibold px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700">
                      {pl}
                      <button
                        type="button"
                        onClick={() => togglePL(pl)}
                        className="text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 transition-colors ml-0.5"
                      >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                        </svg>
                      </button>
                    </span>
                  </div>
                ))}
                {selectedPLs.length === 1 && (
                  <span className="text-[12px] text-gray-500 dark:text-gray-400">
                    {includedCount} of {rows.length} features included
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[14px] text-gray-500 dark:text-gray-400">
                ← Select a product line from the sidebar to explore its features
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {hasSelection && selectedPLs.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedPLs([])}
                className="text-[12px] text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Clear comparison
              </button>
            )}
            <EditHistoryPanel />
            <ExportDropdown rows={rows} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!hasSelection ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 pb-20">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">Select a product line</h2>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 max-w-sm">
                  Choose one product line from the sidebar to see its features, or select multiple to compare side-by-side.
                </p>
              </div>
              <div className="flex items-center gap-6 mt-2 text-[12px] text-gray-400 dark:text-gray-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
                  </span>
                  Click to toggle features
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Click offering to expand details
                </span>
              </div>
            </div>
          ) : (
            CATEGORIES.map(cat => (
              <FeatureSection
                key={cat.id}
                category={cat}
                rows={rowsByCategory[cat.id] ?? []}
                selectedPLs={selectedPLs}
                searchQuery={search}
                onCellChange={updateCell}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function MasterSheetContent() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-[calc(100vh-48px)] text-gray-400">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
      </div>
    }>
      <MasterSheetInner />
    </Suspense>
  );
}

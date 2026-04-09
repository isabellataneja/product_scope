'use client';

import { useMemo } from 'react';
import type { ScopeRow } from '@/types';
import { PRODUCT_LINES, FAMILY_GROUPS } from '@/data/productLines';

interface Props {
  rows: ScopeRow[];
  selected: string[];
  onSelect: (pl: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
}

const FAMILY_COLORS: Record<string, { bg: string; dot: string }> = {
  'Live': { bg: 'bg-blue-100 dark:bg-blue-900/30', dot: 'bg-blue-500' },
  'Assist': { bg: 'bg-green-100 dark:bg-green-900/30', dot: 'bg-green-500' },
  'Assist 20 min': { bg: 'bg-emerald-100 dark:bg-emerald-900/30', dot: 'bg-emerald-500' },
  'Ambient': { bg: 'bg-violet-100 dark:bg-violet-900/30', dot: 'bg-violet-500' },
  'Chart Prep': { bg: 'bg-amber-100 dark:bg-amber-900/30', dot: 'bg-amber-500' },
  'Assist Overnight': { bg: 'bg-orange-100 dark:bg-orange-900/30', dot: 'bg-orange-500' },
};

export default function ProductLineSidebar({ rows, selected, onSelect, search, onSearchChange }: Props) {
  // Precompute pricing + feature count per product line
  const plMeta = useMemo(() => {
    const pricingRow = rows.find(r => r.offering.toLowerCase().includes('pricing'));
    return PRODUCT_LINES.reduce<Record<string, { price: string; count: number }>>((acc, pl) => {
      const price = pricingRow ? String(pricingRow.productLines[pl.name] ?? '') : '';
      const count = rows.filter(r => {
        const v = r.productLines[pl.name];
        return v === true || (typeof v === 'string' && v.trim() && v.toLowerCase() !== 'false');
      }).length;
      acc[pl.name] = {
        price: price && price !== 'false' && price !== 'FALSE' ? price : '',
        count,
      };
      return acc;
    }, {});
  }, [rows]);

  const maxSelected = 3;

  return (
    <aside className="w-72 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search offerings..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-[13px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 text-gray-800 dark:text-gray-200"
          />
        </div>
        {selected.length > 0 && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {selected.length} selected (max {maxSelected})
            </span>
            <button
              onClick={() => selected.forEach(s => onSelect(s))}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Product line list */}
      <div className="flex-1 overflow-y-auto py-2">
        {Object.entries(FAMILY_GROUPS).map(([family, pls]) => {
          const colors = FAMILY_COLORS[family] ?? { bg: 'bg-gray-100', dot: 'bg-gray-400' };
          return (
            <div key={family} className="mb-1">
              {/* Family header */}
              <div className="flex items-center gap-2 px-3 py-1.5 mb-0.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
                <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {family}
                </span>
              </div>

              {/* Product lines */}
              {pls.map(plName => {
                const meta = plMeta[plName] ?? { price: '', count: 0 };
                const isSelected = selected.includes(plName);
                const isDisabled = !isSelected && selected.length >= maxSelected;

                return (
                  <button
                    key={plName}
                    onClick={() => !isDisabled && onSelect(plName)}
                    disabled={isDisabled}
                    className={[
                      'w-full text-left px-3 py-2 mx-0 flex items-center gap-2 transition-colors',
                      isSelected
                        ? `${colors.bg} border-l-2 border-blue-500`
                        : isDisabled
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-2 border-transparent',
                    ].join(' ')}
                  >
                    {/* Selection indicator */}
                    <span className={[
                      'w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors',
                      isSelected
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300 dark:border-gray-600',
                    ].join(' ')}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                        </svg>
                      )}
                    </span>

                    {/* Name */}
                    <span className={`flex-1 text-[13px] leading-snug ${isSelected ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                      {plName}
                    </span>

                    {/* Badges */}
                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                      {meta.price && (
                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {meta.price.length > 12 ? meta.price.slice(0, 12) + '…' : meta.price}
                        </span>
                      )}
                      <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
                        {meta.count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-2">
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          Select up to {maxSelected} product lines to compare side-by-side
        </p>
      </div>
    </aside>
  );
}

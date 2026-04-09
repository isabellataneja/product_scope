'use client';

import { useState } from 'react';
import type { ScopeRow, CellValue } from '@/types';
import type { Category } from '@/types';
import OfferingRow from './OfferingRow';

interface Props {
  category: Category;
  rows: ScopeRow[];
  selectedPLs: string[];
  searchQuery: string;
  onCellChange: (rowId: string, field: string, value: CellValue | string) => void;
}

export default function FeatureSection({ category, rows, selectedPLs, searchQuery, onCellChange }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  // Filter by search
  const filteredRows = searchQuery
    ? rows.filter(r => r.offering.toLowerCase().includes(searchQuery.toLowerCase()))
    : rows;

  if (filteredRows.length === 0) return null;

  // Determine "included" based on primary selected PL (first one)
  const primaryPL = selectedPLs[0];

  function isRowIncluded(row: ScopeRow): boolean {
    if (!primaryPL) return true;
    const val = row.productLines[primaryPL];
    return val === true || (typeof val === 'string' && val.trim() !== '' && val.toLowerCase() !== 'false');
  }

  const included = filteredRows.filter(isRowIncluded);
  const excluded = filteredRows.filter(r => !isRowIncluded(r));
  const includedCount = included.length;
  const totalCount = filteredRows.length;
  const pct = totalCount > 0 ? Math.round((includedCount / totalCount) * 100) : 0;

  return (
    <div
      className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-3 shadow-sm"
      style={{ borderLeftColor: category.darkColor, borderLeftWidth: 3 }}
    >
      {/* Section header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        style={{ backgroundColor: category.color + '40' }}
      >
        <svg
          className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${collapsed ? '-rotate-90' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>

        <span className="font-semibold text-[13px] flex-1" style={{ color: category.darkColor }}>
          {category.label}
        </span>

        {/* Stats */}
        {selectedPLs.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              {includedCount} / {totalCount}
            </span>
            <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${pct}%`, backgroundColor: category.darkColor }}
              />
            </div>
            <span className="text-[11px] font-medium w-8 text-right" style={{ color: category.darkColor }}>
              {pct}%
            </span>
          </div>
        )}
      </button>

      {/* Offerings */}
      {!collapsed && (
        <div className="bg-white dark:bg-gray-900 py-1">
          {/* Column headers for multi-compare */}
          {selectedPLs.length > 1 && (
            <div className="flex items-center gap-3 px-4 pb-1 border-b border-gray-100 dark:border-gray-800 mb-1">
              <span className="w-4 flex-shrink-0" />
              <span className="flex-1" />
              <div className="flex items-center gap-2 flex-shrink-0">
                {selectedPLs.map(pl => (
                  <div key={pl} className="w-7 text-center">
                    <span className="text-[9px] text-gray-400 dark:text-gray-500 leading-tight block" title={pl}>
                      {pl.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Included rows */}
          {included.map(row => (
            <OfferingRow
              key={row.id}
              row={row}
              selectedPLs={selectedPLs}
              onCellChange={onCellChange}
              isIncluded={true}
            />
          ))}

          {/* Divider between included/excluded */}
          {excluded.length > 0 && included.length > 0 && (
            <div className="mx-4 my-1.5 border-t border-dashed border-gray-200 dark:border-gray-700" />
          )}

          {/* Excluded rows */}
          {excluded.map(row => (
            <OfferingRow
              key={row.id}
              row={row}
              selectedPLs={selectedPLs}
              onCellChange={onCellChange}
              isIncluded={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

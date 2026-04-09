'use client';

import { useState } from 'react';
import type { ScopeRow, CellValue } from '@/types';
import { CATEGORY_MAP } from '@/data/categories';
import { getDifferingRows, getSharedRows } from '@/lib/utils';

interface Props {
  familyName: string;
  productLines: string[];
  rows: ScopeRow[];
}

function CellPill({ val }: { val: CellValue }) {
  if (val === true) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700/50 whitespace-nowrap">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
        </svg>
        Included
      </span>
    );
  }
  if (val === false || val === '') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-800/50 whitespace-nowrap">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
        </svg>
        Not included
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/50 max-w-[160px] truncate"
      title={String(val)}
    >
      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
      </svg>
      <span className="truncate">{String(val)}</span>
    </span>
  );
}

const FAMILY_HEADER_COLORS: Record<string, string> = {
  'Live': 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
  'Assist': 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
  'Assist 20 min': 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700',
  'Ambient': 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-700',
  'Chart Prep': 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700',
  'Assist Overnight': 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700',
};

export default function ComparisonTable({ familyName, productLines, rows }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [sharedCollapsed, setSharedCollapsed] = useState(true);

  const differingRows = getDifferingRows(rows, productLines);
  const sharedRows = getSharedRows(rows, productLines);
  const sharedWithValues = sharedRows.filter(r => {
    const val = r.productLines[productLines[0]];
    return val === true || (typeof val === 'string' && val.trim() && val.toLowerCase() !== 'false');
  });

  const displayRows = showAll ? rows : differingRows;
  const headerColors = FAMILY_HEADER_COLORS[familyName] ?? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';

  return (
    <div className="mb-8 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Family header */}
      <div className={`px-5 py-4 border-b ${headerColors}`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-[16px] font-bold text-gray-900 dark:text-gray-100">{familyName} Family</h2>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
              {productLines.length} variants compared
            </p>
          </div>

          {/* Summary stats */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-[12px] text-gray-700 dark:text-gray-300">
                <strong>{sharedWithValues.length}</strong> shared
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
              <span className="text-[12px] text-gray-700 dark:text-gray-300">
                <strong>{differingRows.length}</strong> differ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setShowAll(!showAll)}
          className={`text-[12px] px-3 py-1.5 rounded-lg border transition-colors font-medium ${
            !showAll
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          Differences only
        </button>
        <button
          onClick={() => setShowAll(!showAll)}
          className={`text-[12px] px-3 py-1.5 rounded-lg border transition-colors font-medium ${
            showAll
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          All features
        </button>
        <span className="text-[11px] text-gray-400 dark:text-gray-500">
          Showing {displayRows.length} rows
        </span>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 overflow-x-auto">
        {displayRows.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
            </div>
            <p className="text-[14px] font-medium text-gray-700 dark:text-gray-300">All features are identical</p>
            <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-1">
              All {familyName} variants have the same feature set
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-5 py-3 text-[12px] font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 sticky left-0" style={{ minWidth: 240 }}>
                  Feature
                </th>
                {productLines.map(pl => (
                  <th key={pl} className="px-4 py-3 text-[12px] font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 text-center" style={{ minWidth: 160 }}>
                    {pl}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row, idx) => {
                const cat = CATEGORY_MAP[row.category];
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-50 dark:border-gray-800/50 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/30 dark:bg-gray-800/20'} hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors`}
                  >
                    <td className="px-5 py-3 sticky left-0 bg-inherit" style={{ minWidth: 240 }}>
                      <div className="flex items-start gap-2">
                        {cat && (
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                            style={{ backgroundColor: cat.darkColor }}
                          />
                        )}
                        <span className="text-[13px] text-gray-800 dark:text-gray-200 leading-snug">{row.offering}</span>
                      </div>
                    </td>
                    {productLines.map(pl => {
                      const val = row.productLines[pl] ?? false;
                      return (
                        <td key={pl} className="px-4 py-3 text-center" style={{ minWidth: 160 }}>
                          <div className="flex justify-center">
                            <CellPill val={val} />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Shared features collapsible */}
      {sharedWithValues.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setSharedCollapsed(!sharedCollapsed)}
            className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">
                Features included in ALL {productLines.length} variants
              </span>
              <span className="text-[11px] bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                {sharedWithValues.length}
              </span>
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${sharedCollapsed ? '' : 'rotate-180'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {!sharedCollapsed && (
            <div className="bg-white dark:bg-gray-900 px-5 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
              {sharedWithValues.map(row => (
                <div key={row.id} className="flex items-start gap-2 text-[12px] text-gray-600 dark:text-gray-400 py-0.5">
                  <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  {row.offering}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

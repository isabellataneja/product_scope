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

function CellDisplay({ val }: { val: CellValue }) {
  if (val === true) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-green-600 dark:text-green-400 font-bold text-base">✓</span>
      </div>
    );
  }
  if (val === false || val === '') {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-red-400 dark:text-red-500 text-base">—</span>
      </div>
    );
  }
  return (
    <div className="text-[11px] text-gray-700 dark:text-gray-300 leading-snug px-1">
      {String(val)}
    </div>
  );
}

function getCellStyle(val: CellValue): string {
  if (val === true) return 'bg-green-50 dark:bg-green-900/20';
  if (val === false || val === '') return 'bg-red-50/50 dark:bg-red-900/10';
  return 'bg-blue-50 dark:bg-blue-900/10';
}

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

  const familyColors: Record<string, string> = {
    'Live': '#dbeafe',
    'Assist': '#dcfce7',
    'Assist 20 min': '#d1fae5',
    'Ambient': '#ede9fe',
    'Chart Prep': '#fef3c7',
    'Assist Overnight': '#ffedd5',
  };

  const headerBg = familyColors[familyName] ?? '#f3f4f6';

  return (
    <div className="mb-10">
      {/* Section header */}
      <div className="rounded-t-lg px-4 py-3" style={{ backgroundColor: headerBg }}>
        <h2 className="text-[15px] font-bold text-gray-900">{familyName} Family</h2>
        <div className="flex items-center gap-4 mt-1 text-[12px] text-gray-600">
          <span>
            <strong className="text-green-700">{sharedWithValues.length}</strong> features shared across all variants
          </span>
          <span>
            <strong className="text-orange-700">{differingRows.length}</strong> features differ
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-x border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowAll(!showAll)}
          className={`text-[12px] px-3 py-1 rounded border transition-colors ${
            showAll
              ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
              : 'bg-blue-600 border-blue-600 text-white'
          }`}
        >
          {showAll ? 'Show differences only' : 'Show all features'}
        </button>
        <span className="text-[11px] text-gray-500">
          {showAll ? `${rows.length} total rows` : `${differingRows.length} differing rows`}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-b-lg">
        {displayRows.length === 0 ? (
          <div className="p-8 text-center text-[13px] text-gray-500">
            All features are identical across {familyName} variants.
          </div>
        ) : (
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-[#f8f9fa] dark:bg-gray-800">
                <th className="border-b border-r border-gray-200 dark:border-gray-700 text-left px-3 py-2 font-semibold text-gray-700 dark:text-gray-300 sticky left-0 bg-[#f8f9fa] dark:bg-gray-800" style={{ minWidth: 240, maxWidth: 300 }}>
                  Offering
                </th>
                {productLines.map(pl => (
                  <th
                    key={pl}
                    className="border-b border-r border-gray-200 dark:border-gray-700 px-2 py-2 font-semibold text-gray-700 dark:text-gray-300"
                    style={{ minWidth: 100 }}
                  >
                    <div className="text-center leading-snug">{pl}</div>
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
                    className={`border-b border-gray-200 dark:border-gray-700 ${idx % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-800/30'}`}
                  >
                    <td
                      className="border-r border-gray-200 dark:border-gray-700 px-3 py-2 sticky left-0 bg-white dark:bg-gray-900"
                      style={{ minWidth: 240, maxWidth: 300 }}
                    >
                      {cat && (
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-sm mr-1.5 flex-shrink-0 align-middle"
                          style={{ backgroundColor: cat.darkColor }}
                        />
                      )}
                      <span className="text-gray-800 dark:text-gray-200 text-[12px]">{row.offering}</span>
                    </td>
                    {productLines.map(pl => {
                      const val = row.productLines[pl] ?? false;
                      return (
                        <td
                          key={pl}
                          className={`border-r border-gray-200 dark:border-gray-700 text-center align-middle ${getCellStyle(val)}`}
                          style={{ minWidth: 100, height: 36 }}
                        >
                          <CellDisplay val={val} />
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
        <div className="mt-3 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setSharedCollapsed(!sharedCollapsed)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-[12px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span>Features included in ALL variants ({sharedWithValues.length})</span>
            <svg
              className={`w-4 h-4 transition-transform ${sharedCollapsed ? '' : 'rotate-180'}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {!sharedCollapsed && (
            <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
              {sharedWithValues.map(row => (
                <div key={row.id} className="flex items-center gap-1.5 text-[12px] text-gray-700 dark:text-gray-300 py-0.5">
                  <span className="text-green-500 font-bold text-sm">✓</span>
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

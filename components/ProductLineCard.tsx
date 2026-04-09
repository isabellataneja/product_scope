'use client';

import { useState } from 'react';
import type { ScopeRow } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { isTruthy } from '@/lib/utils';

interface Props {
  productLine: string;
  family: string;
  rows: ScopeRow[];
}

export default function ProductLineCard({ productLine, family, rows }: Props) {
  const [expanded, setExpanded] = useState(false);

  const included = rows.filter(row => {
    const val = row.productLines[productLine];
    return isTruthy(val as boolean | string) || (typeof val === 'string' && val.trim() && val.toLowerCase() !== 'false');
  });

  const totalRows = rows.length;
  const pct = Math.round((included.length / totalRows) * 100);

  // Pricing from the row
  const pricingRow = rows.find(r => r.offering.toLowerCase().includes('pricing'));
  const pricing = pricingRow ? pricingRow.productLines[productLine] : null;
  const pricingText = pricing && pricing !== 'false' ? String(pricing) : null;

  // Group included by category
  const byCategory: Record<string, ScopeRow[]> = {};
  for (const row of included) {
    if (!byCategory[row.category]) byCategory[row.category] = [];
    byCategory[row.category].push(row);
  }

  const familyColors: Record<string, string> = {
    'Live': '#dbeafe',
    'Assist': '#dcfce7',
    'Assist 20 min': '#d1fae5',
    'Ambient': '#ede9fe',
    'Chart Prep': '#fef3c7',
    'Assist Overnight': '#ffedd5',
  };

  const headerBg = familyColors[family] ?? '#f3f4f6';

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-shadow hover:shadow-md ${expanded ? 'col-span-full' : ''}`}
    >
      {/* Card header */}
      <div
        className="p-4 cursor-pointer"
        style={{ backgroundColor: headerBg }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-[14px] font-semibold text-gray-900 leading-snug">{productLine}</h3>
            <span className="inline-flex items-center mt-1 text-[11px] px-1.5 py-0.5 rounded bg-white/70 text-gray-600 font-medium">
              {family} Family
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform mt-0.5 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {pricingText && (
          <p className="mt-2 text-[12px] font-medium text-gray-800">
            <span className="text-gray-500">Pricing:</span> {pricingText}
          </p>
        )}

        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-gray-600 mb-1">
            <span>{included.length} of {totalRows} features included</span>
            <span className="font-medium">{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: '#22c55e' }}
            />
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 overflow-auto max-h-[60vh]">
          {CATEGORIES.map(cat => {
            const catRows = byCategory[cat.id];
            if (!catRows || catRows.length === 0) return null;
            return (
              <div key={cat.id} className="mb-4">
                <div
                  className="flex items-center gap-2 px-2 py-1 rounded mb-2"
                  style={{ backgroundColor: cat.color }}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-sm"
                    style={{ backgroundColor: cat.darkColor }}
                  />
                  <h4 className="text-[11px] font-semibold" style={{ color: cat.darkColor }}>
                    {cat.label}
                  </h4>
                  <span className="text-[10px] ml-auto" style={{ color: cat.darkColor }}>
                    {catRows.length}
                  </span>
                </div>
                <ul className="space-y-1">
                  {catRows.map(row => {
                    const val = row.productLines[productLine];
                    const hasText = typeof val === 'string' && val.trim();
                    return (
                      <li key={row.id} className="border-l-2 pl-2 py-0.5" style={{ borderColor: cat.darkColor }}>
                        <span className="text-[12px] text-gray-800 dark:text-gray-200">{row.offering}</span>
                        {hasText && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                            {String(val)}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

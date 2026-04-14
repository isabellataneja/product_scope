'use client';

import { useRouter } from 'next/navigation';
import type { ScopeRow } from '@/types';
import { CATEGORIES } from '@/data/categories';
import DonutChart from './DonutChart';

interface Props {
  productLine: string;
  family: string;
  rows: ScopeRow[];
}

const FAMILY_COLORS: Record<string, { gradient: string; badge: string; badgeText: string; chartColor: string }> = {
  'Live': { gradient: 'from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10', badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200', badgeText: 'border-blue-200 dark:border-blue-700', chartColor: '#3b82f6' },
  'Assist': { gradient: 'from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10', badge: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200', badgeText: 'border-green-200 dark:border-green-700', chartColor: '#22c55e' },
  'Assist 20 min': { gradient: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10', badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200', badgeText: 'border-emerald-200 dark:border-emerald-700', chartColor: '#10b981' },
  'Ambient': { gradient: 'from-violet-50 to-violet-100/50 dark:from-violet-900/20 dark:to-violet-900/10', badge: 'bg-violet-100 dark:bg-violet-900/40 text-violet-800 dark:text-violet-200', badgeText: 'border-violet-200 dark:border-violet-700', chartColor: '#8b5cf6' },
  'Chart Prep': { gradient: 'from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10', badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200', badgeText: 'border-amber-200 dark:border-amber-700', chartColor: '#f59e0b' },
  'Assist Overnight': { gradient: 'from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10', badge: 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200', badgeText: 'border-orange-200 dark:border-orange-700', chartColor: '#f97316' },
};

export default function ProductLineCard({ productLine, family, rows }: Props) {
  const router = useRouter();
  const colors = FAMILY_COLORS[family] ?? { gradient: 'from-gray-50 to-gray-100/50', badge: 'bg-gray-100 text-gray-800', badgeText: 'border-gray-200', chartColor: '#6b7280' };

  function isIncluded(row: ScopeRow): boolean {
    const v = row.productLines[productLine];
    return v === true || (typeof v === 'string' && v.trim() !== '' && v.toLowerCase() !== 'false');
  }

  const totalRows = rows.length;
  const includedRows = rows.filter(isIncluded);
  const pct = Math.round((includedRows.length / totalRows) * 100);

  const pricingRow = rows.find(r => r.offering.toLowerCase().includes('pricing'));
  const pricing = pricingRow ? pricingRow.productLines[productLine] : null;
  const pricingText = pricing && pricing !== 'false' && pricing !== 'FALSE'
    ? String(pricing) : null;

  // Per-category stats
  const catStats = CATEGORIES.map(cat => {
    const catRows = rows.filter(r => r.category === cat.id);
    const catIncluded = catRows.filter(isIncluded).length;
    return { cat, total: catRows.length, included: catIncluded };
  }).filter(s => s.total > 0);

  return (
    <div
      className={`bg-gradient-to-br ${colors.gradient} rounded-xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
      onClick={() => router.push(`/master?pl=${encodeURIComponent(productLine)}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && router.push(`/master?pl=${encodeURIComponent(productLine)}`)}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-bold text-gray-900 dark:text-gray-100 leading-snug mb-1">
            {productLine}
          </h3>
          <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${colors.badge} ${colors.badgeText}`}>
            {family}
          </span>
        </div>
        <DonutChart percentage={pct} size={64} strokeWidth={7} color={colors.chartColor} trackColor="#e5e7eb" />
      </div>

      {/* Pricing */}
      {pricingText && (
        <div className="mb-3 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[12px] text-gray-700 dark:text-gray-300 font-medium truncate">{pricingText}</span>
        </div>
      )}

      {/* Feature count */}
      <div className="text-[12px] text-gray-500 dark:text-gray-400 mb-3">
        <span className="font-semibold text-gray-800 dark:text-gray-200">{includedRows.length}</span> of {totalRows} features
      </div>

      {/* Category breakdown bars */}
      <div className="space-y-1.5">
        {catStats.filter(s => s.included > 0).slice(0, 5).map(({ cat, total, included }) => {
          const catPct = Math.round((included / total) * 100);
          return (
            <div key={cat.id} className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.darkColor }}
              />
              <span className="text-[10px] text-gray-500 dark:text-gray-400 w-28 truncate flex-shrink-0">
                {cat.label}
              </span>
              <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${catPct}%`, backgroundColor: cat.darkColor }}
                />
              </div>
              <span className="text-[10px] text-gray-400 w-7 text-right flex-shrink-0">{included}/{total}</span>
            </div>
          );
        })}
        {catStats.filter(s => s.included > 0).length > 5 && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 pt-0.5">
            +{catStats.filter(s => s.included > 0).length - 5} more categories
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="mt-3 pt-3 border-t border-gray-200/70 dark:border-gray-700/50 flex items-center justify-between">
        <span className="text-[11px] text-gray-400 dark:text-gray-500">Click to explore</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import type { ScopeRow } from '@/types';
import rawData from '@/data/scopeData.json';
import { PRODUCT_LINES } from '@/data/productLines';
import ProductLineCard from '@/components/ProductLineCard';

const rows = rawData as ScopeRow[];

export default function ProductLinesPage() {
  const [search, setSearch] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('all');

  const familySet = new Set(PRODUCT_LINES.map(pl => pl.family));
  const families = Array.from(familySet);

  const filteredPLs = PRODUCT_LINES.filter(pl => {
    const matchSearch = !search || pl.name.toLowerCase().includes(search.toLowerCase());
    const matchFamily = selectedFamily === 'all' || pl.family === selectedFamily;
    return matchSearch && matchFamily;
  });

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Product Line Cards</h1>
        <p className="text-[13px] text-gray-500 dark:text-gray-400">
          Explore all features included in each product line. Click any card to expand.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search product lines..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-[13px] border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-52"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', ...families].map(fam => (
            <button
              key={fam}
              onClick={() => setSelectedFamily(fam)}
              className={`text-[12px] px-3 py-1 rounded-full border transition-colors ${
                selectedFamily === fam
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {fam === 'all' ? 'All Families' : fam}
            </button>
          ))}
        </div>

        <span className="text-[12px] text-gray-500 dark:text-gray-400 ml-auto">
          {filteredPLs.length} product lines
        </span>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPLs.map(pl => (
          <ProductLineCard
            key={pl.name}
            productLine={pl.name}
            family={pl.family}
            rows={rows}
          />
        ))}
      </div>

      {filteredPLs.length === 0 && (
        <div className="py-16 text-center text-[14px] text-gray-500">
          No product lines match your search.
        </div>
      )}
    </div>
  );
}

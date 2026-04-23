'use client';

import { useState } from 'react';
import { PRODUCT_LINES } from '@/data/productLines';
import ProductLineCard from '@/components/ProductLineCard';
import { useScopeData } from '@/components/ScopeDataProvider';

export default function ProductLinesPage() {
  const { rows } = useScopeData();
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
    <div className="max-w-screen-xl mx-auto px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Product Lines</h1>
        <p className="text-[14px] text-gray-500 dark:text-gray-400">
          {PRODUCT_LINES.length} product lines across {families.length} families. Click any card to explore its features.
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
            className="pl-8 pr-3 py-2 text-[13px] border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-sm w-52"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', ...families].map(fam => (
            <button
              key={fam}
              onClick={() => setSelectedFamily(fam)}
              className={`text-[12px] px-3 py-1.5 rounded-full border transition-all ${
                selectedFamily === fam
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300 hover:text-blue-600 bg-white dark:bg-gray-800'
              }`}
            >
              {fam === 'all' ? 'All Families' : fam}
            </button>
          ))}
        </div>

        <span className="text-[12px] text-gray-400 dark:text-gray-500 ml-auto">
          {filteredPLs.length} product lines
        </span>
      </div>

      {/* Cards grid */}
      {filteredPLs.length > 0 ? (
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
      ) : (
        <div className="py-16 text-center text-[14px] text-gray-500">
          No product lines match your search.
        </div>
      )}
    </div>
  );
}

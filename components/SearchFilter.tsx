'use client';

import { CATEGORIES } from '@/data/categories';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
}

export default function SearchFilter({ search, onSearchChange, category, onCategoryChange }: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative">
        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search offerings..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-8 pr-3 py-1.5 text-[13px] border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-56"
        />
      </div>
      <select
        value={category}
        onChange={e => onCategoryChange(e.target.value)}
        className="text-[13px] border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="all">All Categories</option>
        {CATEGORIES.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.label}</option>
        ))}
      </select>
      {(search || (category && category !== 'all')) && (
        <button
          onClick={() => { onSearchChange(''); onCategoryChange('all'); }}
          className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

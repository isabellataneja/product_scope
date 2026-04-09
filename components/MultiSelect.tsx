'use client';

import { useState, useRef, useEffect } from 'react';
import { PRODUCT_LINES } from '@/data/productLines';

interface Props {
  selected: string[];
  onChange: (values: string[]) => void;
  max?: number;
}

const FAMILY_COLORS: Record<string, string> = {
  'Live': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  'Assist': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  'Assist 20 min': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  'Ambient': 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
  'Chart Prep': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  'Assist Overnight': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
};

export default function MultiSelect({ selected, onChange, max = 5 }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function toggle(name: string) {
    if (selected.includes(name)) {
      onChange(selected.filter(s => s !== name));
    } else if (selected.length < max) {
      onChange([...selected, name]);
    }
  }

  const families = Array.from(new Set(PRODUCT_LINES.map(pl => pl.family)));
  const filtered = PRODUCT_LINES.filter(pl =>
    !search || pl.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-[13px] text-gray-700 dark:text-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-sm min-w-[280px] max-w-lg"
      >
        {selected.length === 0 ? (
          <span className="text-gray-400 flex-1 text-left">Select product lines to compare (up to {max})…</span>
        ) : (
          <div className="flex flex-wrap gap-1 flex-1">
            {selected.map(s => (
              <span
                key={s}
                className="inline-flex items-center gap-1 text-[11px] bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full"
              >
                {s}
                <button
                  onClick={e => { e.stopPropagation(); toggle(s); }}
                  className="hover:text-blue-600"
                >
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              className="w-full px-3 py-1.5 text-[13px] bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-gray-200 placeholder-gray-400"
            />
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {families.map(family => {
              const familyPLs = filtered.filter(pl => pl.family === family);
              if (familyPLs.length === 0) return null;
              const fc = FAMILY_COLORS[family] ?? '';
              return (
                <div key={family}>
                  <div className="px-3 py-1 mt-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{family}</span>
                  </div>
                  {familyPLs.map(pl => {
                    const isSelected = selected.includes(pl.name);
                    const isDisabled = !isSelected && selected.length >= max;
                    return (
                      <button
                        key={pl.name}
                        onClick={() => toggle(pl.name)}
                        disabled={isDisabled}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-[13px] transition-colors ${
                          isDisabled
                            ? 'opacity-40 cursor-not-allowed text-gray-500 dark:text-gray-400'
                            : isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-500'}`}>
                          {isSelected && (
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                            </svg>
                          )}
                        </span>
                        <span className="flex-1 text-left">{pl.name}</span>
                        {isSelected && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${fc}`}>selected</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
          {selected.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-2 flex justify-between items-center">
              <span className="text-[11px] text-gray-500 dark:text-gray-400">{selected.length} selected</span>
              <button
                onClick={() => { onChange([]); setOpen(false); }}
                className="text-[11px] text-red-500 hover:text-red-700 dark:hover:text-red-400"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

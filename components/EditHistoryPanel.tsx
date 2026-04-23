'use client';

import { useEffect, useRef, useState } from 'react';
import { useScopeData } from '@/components/ScopeDataProvider';
import type { ScopeHistoryEntry } from '@/lib/scopePersistence';

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function EditHistoryPanel() {
  const { history, revertToEntry, resetToBaseline } = useScopeData();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function handleRevert(entry: ScopeHistoryEntry) {
    revertToEntry(entry);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors"
        title="Edit history — revert to a previous state"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        History
        {history.length > 0 && (
          <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded-full">
            {history.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-[min(100vw-2rem,22rem)] max-h-[min(70vh,28rem)] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg z-[60] flex flex-col">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
            <span className="text-[12px] font-semibold text-gray-800 dark:text-gray-200">Edit history</span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all scope data to the built-in baseline? This clears local edits and history.')) {
                  resetToBaseline();
                  setOpen(false);
                }
              }}
              className="text-[11px] text-red-600 dark:text-red-400 hover:underline"
            >
              Reset to baseline
            </button>
          </div>
          <p className="px-3 py-1.5 text-[10px] text-gray-500 dark:text-gray-400 border-b border-gray-50 dark:border-gray-800">
            Stored in this browser (localStorage). Revert restores the full matrix at that moment.
          </p>
          <div className="overflow-y-auto flex-1 p-2">
            {history.length === 0 ? (
              <p className="text-[12px] text-gray-500 dark:text-gray-400 px-2 py-4 text-center">
                No edits yet. Changes to cells are logged here.
              </p>
            ) : (
              <ul className="space-y-1">
                {history.map((entry, idx) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => handleRevert(entry)}
                      className="w-full text-left px-2 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium text-gray-800 dark:text-gray-200 truncate">
                          {entry.summary}
                        </span>
                        {idx === 0 && (
                          <span className="text-[9px] uppercase tracking-wide text-blue-600 dark:text-blue-400 flex-shrink-0">
                            Latest
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500 dark:text-gray-500">{formatTime(entry.at)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

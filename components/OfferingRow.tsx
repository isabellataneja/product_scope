'use client';

import { useState, useRef } from 'react';
import type { ScopeRow, CellValue } from '@/types';

interface Props {
  row: ScopeRow;
  selectedPLs: string[];
  onCellChange: (rowId: string, field: string, value: CellValue | string) => void;
  isIncluded: boolean;
}

const CONTEXT_FIELDS = [
  { key: 'currentState', label: 'Current State' },
  { key: 'additionalInfo', label: 'Additional Info' },
  { key: 'siteSpecific', label: 'Site Specific' },
  { key: 'bestPractices', label: 'Best Practices' },
  { key: 'deviationCausesDelay', label: 'Causes Delay?' },
  { key: 'templateAdjustment', label: 'Template Adjustment' },
  { key: 'customFormatAdded', label: 'Custom Format' },
  { key: 'engBuildRequired', label: 'Eng Build Required' },
];

export default function OfferingRow({ row, selectedPLs, onCellChange, isIncluded }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const editRef = useRef<HTMLTextAreaElement>(null);

  function startEdit(field: string, currentVal: string) {
    setEditingField(field);
    setEditValue(currentVal);
    setTimeout(() => editRef.current?.focus(), 0);
  }

  function commitEdit(field: string) {
    onCellChange(row.id, field, editValue.trim());
    setEditingField(null);
  }

  function togglePL(plName: string, current: CellValue) {
    if (typeof current === 'boolean') {
      onCellChange(row.id, plName, !current);
    }
  }

  function renderPLCell(plName: string) {
    const val = row.productLines[plName] ?? false;
    const isTrue = val === true;
    const isText = typeof val === 'string' && val.trim() !== '' && val.toLowerCase() !== 'false';

    if (isText) {
      return (
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/20 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          title={String(val)}
          onDoubleClick={() => startEdit(`pl:${plName}`, String(val))}
        >
          <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
          </svg>
          <span className="text-[11px] text-blue-700 dark:text-blue-300 font-medium truncate max-w-[80px]">note</span>
        </div>
      );
    }

    return (
      <button
        onClick={() => togglePL(plName, val)}
        className={[
          'w-7 h-7 rounded-full flex items-center justify-center transition-all',
          isTrue
            ? 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50'
            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
        ].join(' ')}
        title={`Toggle ${plName}`}
      >
        {isTrue ? (
          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        )}
      </button>
    );
  }

  const contextHasContent = CONTEXT_FIELDS.some(f => {
    const v = (row as unknown as Record<string, string>)[f.key];
    return v && v.trim();
  });

  return (
    <div className={`transition-opacity ${!isIncluded ? 'opacity-50' : ''}`}>
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg group">
        {/* Expand toggle (only if has context) */}
        {contextHasContent ? (
          <button
            onClick={() => setExpanded(e => !e)}
            className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        {/* Offering name */}
        <span
          className={`flex-1 text-[13px] leading-snug ${isIncluded ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}
        >
          {row.offering}
        </span>

        {/* PL checkmarks */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {selectedPLs.map(pl => (
            <div key={pl} className="flex flex-col items-center gap-0.5">
              {selectedPLs.length > 1 && (
                <span className="text-[9px] text-gray-400 dark:text-gray-500 truncate max-w-[60px] text-center leading-tight hidden group-first:block">
                  {pl.split(' ')[0]}
                </span>
              )}
              {renderPLCell(pl)}
            </div>
          ))}
        </div>
      </div>

      {/* Expanded detail panel */}
      {expanded && contextHasContent && (
        <div className="mx-4 mb-2 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <dl className="grid grid-cols-1 gap-2">
            {CONTEXT_FIELDS.map(f => {
              const val = (row as unknown as Record<string, string>)[f.key] ?? '';
              if (!val.trim()) return null;
              const isEditing = editingField === f.key;

              return (
                <div key={f.key} className="flex gap-3">
                  <dt className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 w-32 flex-shrink-0 pt-0.5">
                    {f.label}
                  </dt>
                  <dd className="flex-1">
                    {isEditing ? (
                      <textarea
                        ref={editRef}
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Escape') setEditingField(null);
                          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(f.key); }
                        }}
                        onBlur={() => commitEdit(f.key)}
                        className="w-full text-[12px] text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-blue-400 rounded px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                        rows={3}
                      />
                    ) : (
                      <span
                        className="text-[12px] text-gray-700 dark:text-gray-300 leading-snug cursor-text hover:bg-white dark:hover:bg-gray-700 rounded px-1 -mx-1 block whitespace-pre-wrap"
                        onDoubleClick={() => startEdit(f.key, val)}
                        title="Double-click to edit"
                      >
                        {val}
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}

            {/* PL text values if any */}
            {selectedPLs.map(pl => {
              const val = row.productLines[pl];
              if (typeof val !== 'string' || !val.trim() || val.toLowerCase() === 'false') return null;
              const isEditing = editingField === `pl:${pl}`;
              return (
                <div key={pl} className="flex gap-3">
                  <dt className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 w-32 flex-shrink-0 pt-0.5 truncate">
                    {pl}
                  </dt>
                  <dd className="flex-1">
                    {isEditing ? (
                      <textarea
                        ref={editRef}
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Escape') setEditingField(null);
                          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(`pl:${pl}`); }
                        }}
                        onBlur={() => commitEdit(`pl:${pl}`)}
                        className="w-full text-[12px] bg-white dark:bg-gray-700 border border-blue-400 rounded px-2 py-1 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
                        rows={2}
                      />
                    ) : (
                      <span
                        className="text-[12px] text-blue-700 dark:text-blue-300 italic leading-snug cursor-text hover:bg-white dark:hover:bg-gray-700 rounded px-1 -mx-1 block"
                        onDoubleClick={() => startEdit(`pl:${pl}`, val)}
                        title="Double-click to edit"
                      >
                        {val}
                      </span>
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>

          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">Double-click any value to edit</p>
        </div>
      )}
    </div>
  );
}

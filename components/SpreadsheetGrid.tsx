'use client';

import { useState, useRef, useEffect } from 'react';
import type { ScopeRow, CellValue } from '@/types';
import { PRODUCT_LINES, FAMILY_GROUPS } from '@/data/productLines';
import { CATEGORY_MAP } from '@/data/categories';

interface Props {
  rows: ScopeRow[];
  onCellChange: (rowId: string, field: string, value: CellValue | string) => void;
}

const CONTEXT_COLS = [
  { key: 'offering', label: 'Offering', width: 260, sticky: true },
  { key: 'currentState', label: 'Current State', width: 140 },
  { key: 'additionalInfo', label: 'Additional Info', width: 200 },
  { key: 'siteSpecific', label: 'Site Specific', width: 160 },
  { key: 'bestPractices', label: 'Best Practices', width: 160 },
  { key: 'deviationCausesDelay', label: 'Causes Delay?', width: 110 },
  { key: 'templateAdjustment', label: 'Template Adjust', width: 130 },
  { key: 'customFormatAdded', label: 'Custom Format', width: 120 },
  { key: 'engBuildRequired', label: 'Eng Build', width: 100 },
] as const;

export default function SpreadsheetGrid({ rows, onCellChange }: Props) {
  const [editCell, setEditCell] = useState<{ rowId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [collapsedFamilies, setCollapsedFamilies] = useState<Set<string>>(new Set());
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const families = Object.keys(FAMILY_GROUPS);

  const visibleProductLines = PRODUCT_LINES.filter(
    pl => !collapsedFamilies.has(pl.family)
  );

  // Calculate left offsets for sticky context columns
  const contextColOffsets: number[] = [];
  let offset = 0;
  for (const col of CONTEXT_COLS) {
    contextColOffsets.push(offset);
    offset += col.width;
  }
  const totalContextWidth = offset;

  function toggleFamily(family: string) {
    setCollapsedFamilies(prev => {
      const next = new Set(prev);
      if (next.has(family)) next.delete(family);
      else next.add(family);
      return next;
    });
  }

  function startEdit(rowId: string, field: string, currentValue: CellValue) {
    setEditCell({ rowId, field });
    setEditValue(typeof currentValue === 'boolean' ? '' : currentValue);
    setTimeout(() => editRef.current?.focus(), 0);
  }

  function commitEdit() {
    if (!editCell) return;
    const val = editValue.trim();
    if (editCell.field.startsWith('pl:')) {
      const plName = editCell.field.slice(3);
      onCellChange(editCell.rowId, plName, val || false);
    } else {
      onCellChange(editCell.rowId, editCell.field, val);
    }
    setEditCell(null);
  }

  function handlePLCellClick(rowId: string, plName: string, current: CellValue) {
    if (editCell?.rowId === rowId && editCell.field === `pl:${plName}`) return;
    // Single click toggles boolean
    if (typeof current === 'boolean') {
      onCellChange(rowId, plName, !current);
    } else if (typeof current === 'string') {
      // Click on string cell to edit
      startEdit(rowId, `pl:${plName}`, current);
    }
  }

  function handlePLCellDblClick(rowId: string, plName: string, current: CellValue) {
    startEdit(rowId, `pl:${plName}`, current);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setEditCell(null);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitEdit();
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (editCell && editRef.current && !editRef.current.contains(e.target as Node)) {
        commitEdit();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });

  function renderCellValue(val: CellValue) {
    if (val === true) {
      return (
        <span className="text-green-600 dark:text-green-400 font-bold text-base leading-none">✓</span>
      );
    }
    if (val === false || val === '') return null;
    return (
      <span className="text-[11px] text-gray-700 dark:text-gray-300 leading-tight break-words">
        {String(val)}
      </span>
    );
  }

  function getCellBg(val: CellValue, isHovered: boolean): string {
    if (val === true) return isHovered ? '#dcfce7' : '#f0fdf4';
    if (val === false || val === '') return isHovered ? '#f1f5f9' : 'transparent';
    return isHovered ? '#eff6ff' : '#f8faff';
  }

  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* Family toggle controls */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-wrap">
        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Show/hide families:</span>
        {families.map(family => (
          <button
            key={family}
            onClick={() => toggleFamily(family)}
            className={[
              'text-[11px] px-2 py-0.5 rounded border transition-colors',
              collapsedFamilies.has(family)
                ? 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800'
                : 'border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30',
            ].join(' ')}
          >
            {collapsedFamilies.has(family) ? '+ ' : '− '}{family}
          </button>
        ))}
      </div>

      {/* Scrollable grid container */}
      <div ref={containerRef} className="flex-1 overflow-auto relative">
        <table className="border-collapse text-[13px]" style={{ tableLayout: 'fixed', minWidth: totalContextWidth + visibleProductLines.length * 80 }}>
          <colgroup>
            {CONTEXT_COLS.map(col => (
              <col key={col.key} style={{ width: col.width }} />
            ))}
            {visibleProductLines.map(pl => (
              <col key={pl.name} style={{ width: 80 }} />
            ))}
          </colgroup>

          {/* Sticky header */}
          <thead className="sticky top-0 z-20">
            {/* Family group row */}
            <tr>
              {CONTEXT_COLS.map((col, idx) => (
                <th
                  key={col.key}
                  className={`bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${idx === 0 ? 'sticky left-0 z-30' : ''}`}
                  style={{ height: 28 }}
                />
              ))}
              {families.map(family => {
                const familyPLs = FAMILY_GROUPS[family].filter(pl =>
                  !collapsedFamilies.has(family) && visibleProductLines.some(vpl => vpl.name === pl)
                );
                if (familyPLs.length === 0) return null;
                return (
                  <th
                    key={family}
                    colSpan={familyPLs.length}
                    className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[10px] font-semibold text-gray-600 dark:text-gray-300 text-center px-1"
                    style={{ height: 28 }}
                  >
                    {family}
                  </th>
                );
              })}
            </tr>

            {/* Column header row with rotated text */}
            <tr>
              {CONTEXT_COLS.map((col, idx) => (
                <th
                  key={col.key}
                  className={[
                    'bg-[#f8f9fa] dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                    'text-left text-[11px] font-semibold text-gray-600 dark:text-gray-300',
                    'px-2',
                    idx === 0 ? 'sticky left-0 z-30' : '',
                  ].join(' ')}
                  style={{ height: 36, verticalAlign: 'middle' }}
                >
                  {col.label}
                </th>
              ))}
              {visibleProductLines.map(pl => (
                <th
                  key={pl.name}
                  className="bg-[#f8f9fa] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-0"
                  style={{ height: 120, verticalAlign: 'bottom' }}
                >
                  <div
                    className="relative"
                    style={{ height: 120, width: 80 }}
                  >
                    <div
                      className="absolute bottom-4 left-1/2 origin-bottom-left whitespace-nowrap text-[11px] font-medium text-gray-700 dark:text-gray-200"
                      style={{ transform: 'rotate(-45deg) translateX(-50%)' }}
                    >
                      {pl.name}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {rows.map((row) => {
              const cat = CATEGORY_MAP[row.category];
              const catColor = cat?.color ?? '#ffffff';
              const isHovered = hoveredRow === row.id;

              return (
                <tr
                  key={row.id}
                  onMouseEnter={() => setHoveredRow(row.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  className="group"
                  style={{ backgroundColor: isHovered ? '#f8f9fc' : undefined }}
                >
                  {CONTEXT_COLS.map((col, idx) => {
                    const isEditing = editCell?.rowId === row.id && editCell.field === col.key;
                    const value = (row as unknown as Record<string, string>)[col.key] ?? '';

                    return (
                      <td
                        key={col.key}
                        className={[
                          'border border-gray-200 dark:border-gray-700 px-2 py-1 align-top',
                          idx === 0 ? 'sticky left-0 z-10 font-medium' : '',
                          'dark:text-gray-200',
                        ].join(' ')}
                        style={{
                          backgroundColor: idx === 0
                            ? (isHovered ? '#f1f5f9' : catColor)
                            : (isHovered ? '#f8f9fc' : 'white'),
                          minHeight: 32,
                          maxWidth: col.width,
                        }}
                        onDoubleClick={() => startEdit(row.id, col.key, value)}
                      >
                        {isEditing ? (
                          <textarea
                            ref={editRef}
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={commitEdit}
                            className="w-full text-[13px] border-0 outline-none resize-none bg-blue-50 dark:bg-blue-900/20 rounded p-0"
                            rows={3}
                          />
                        ) : (
                          <span className="text-[13px] leading-snug">
                            {idx === 0 ? (
                              <span className="flex items-start gap-1">
                                <span
                                  className="inline-block w-2 h-2 rounded-sm mt-1 flex-shrink-0"
                                  style={{ backgroundColor: cat?.darkColor ?? '#666' }}
                                />
                                {value}
                              </span>
                            ) : (
                              value
                            )}
                          </span>
                        )}
                      </td>
                    );
                  })}

                  {/* Product line cells */}
                  {visibleProductLines.map(pl => {
                    const val = row.productLines[pl.name] ?? false;
                    const isEditing = editCell?.rowId === row.id && editCell.field === `pl:${pl.name}`;
                    const cellBg = getCellBg(val, isHovered);

                    return (
                      <td
                        key={pl.name}
                        className="border border-gray-200 dark:border-gray-700 text-center align-middle cursor-pointer select-none relative"
                        style={{
                          backgroundColor: cellBg,
                          minHeight: 32,
                          height: 32,
                          padding: '2px 4px',
                        }}
                        onClick={() => handlePLCellClick(row.id, pl.name, val)}
                        onDoubleClick={() => handlePLCellDblClick(row.id, pl.name, val)}
                        onMouseEnter={(e) => {
                          if (typeof val === 'string' && val) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({ text: val, x: rect.left, y: rect.bottom + 4 });
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        {isEditing ? (
                          <textarea
                            ref={editRef}
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={commitEdit}
                            className="w-full text-[11px] border-0 outline-none resize-none bg-blue-50 dark:bg-blue-900/20 rounded p-0 text-left"
                            rows={2}
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            {renderCellValue(val)}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 max-w-xs bg-gray-900 text-white text-[11px] px-2 py-1.5 rounded shadow-lg pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.text}
          </div>
        )}
      </div>
    </div>
  );
}

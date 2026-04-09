'use client';

import { useState, useCallback } from 'react';
import type { ScopeRow, CellValue } from '@/types';
import rawData from '@/data/scopeData.json';
import { filterRows } from '@/lib/utils';
import SpreadsheetGrid from '@/components/SpreadsheetGrid';
import SearchFilter from '@/components/SearchFilter';
import ExportButtons from '@/components/ExportButtons';

const initialRows = rawData as ScopeRow[];

export default function MasterSheetPage() {
  const [rows, setRows] = useState<ScopeRow[]>(initialRows);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const handleCellChange = useCallback((rowId: string, field: string, value: CellValue | string) => {
    setRows(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      // Check if field is a product line name (not a context column)
      const contextFields = ['offering', 'currentState', 'additionalInfo', 'siteSpecific',
        'bestPractices', 'deviationCausesDelay', 'templateAdjustment', 'customFormatAdded', 'engBuildRequired'];
      if (contextFields.includes(field)) {
        return { ...row, [field]: value };
      }
      // Product line field
      return {
        ...row,
        productLines: { ...row.productLines, [field]: value as CellValue },
      };
    }));
  }, []);

  const filteredRows = filterRows(rows, search, category);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 48px)' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex-wrap gap-y-2">
        <div className="flex items-center gap-4 flex-wrap">
          <SearchFilter
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
          />
          <span className="text-[12px] text-gray-500 dark:text-gray-400">
            {filteredRows.length} of {rows.length} rows
          </span>
        </div>
        <ExportButtons rows={filteredRows} />
      </div>

      {/* Hints */}
      <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/40 flex items-center gap-4">
        <span className="text-[11px] text-blue-700 dark:text-blue-300">
          <strong>Click</strong> product line cell to toggle ✓/empty &nbsp;·&nbsp;
          <strong>Double-click</strong> any cell to edit text &nbsp;·&nbsp;
          <strong>Enter</strong> to save, <strong>Esc</strong> to cancel
        </span>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-hidden">
        <SpreadsheetGrid rows={filteredRows} onCellChange={handleCellChange} />
      </div>
    </div>
  );
}

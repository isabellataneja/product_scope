import type { ScopeRow, CellValue } from '@/types';

export function isTruthy(val: CellValue): boolean {
  if (typeof val === 'boolean') return val;
  const v = val.trim().toLowerCase();
  return v === 'true' || v === 's' || v === 'd' || v === 'yes' || v === '✓' || v === 'x';
}

export function filterRows(rows: ScopeRow[], search: string, category: string): ScopeRow[] {
  return rows.filter(row => {
    const matchesSearch = !search ||
      row.offering.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || category === 'all' || row.category === category;
    return matchesSearch && matchesCategory;
  });
}

export function exportJSON(rows: ScopeRow[]): void {
  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'scopeData.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(rows: ScopeRow[], productLineNames: string[]): void {
  const contextCols = ['offering', 'category', 'currentState', 'additionalInfo',
    'siteSpecific', 'bestPractices', 'deviationCausesDelay', 'templateAdjustment',
    'customFormatAdded', 'engBuildRequired'];

  const headers = [...contextCols, ...productLineNames];
  const csvRows = [headers.join(',')];

  for (const row of rows) {
    const cells = contextCols.map(col => {
      const val = String((row as unknown as Record<string, unknown>)[col] ?? '');
      return `"${val.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    });

    for (const pl of productLineNames) {
      const val = row.productLines[pl];
      if (typeof val === 'boolean') {
        cells.push(val ? 'TRUE' : 'FALSE');
      } else {
        cells.push(`"${String(val ?? '').replace(/"/g, '""')}"`);
      }
    }

    csvRows.push(cells.join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'scopeData.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function getFeatureCount(row: ScopeRow): number {
  return Object.values(row.productLines).filter(v => v === true || (typeof v === 'string' && v.trim())).length;
}

/** Whether this row is in scope for the product line (boolean true or non-empty string note). */
export function isRowIncludedForProductLine(row: ScopeRow, productLine: string): boolean {
  const val = row.productLines[productLine];
  return val === true || (typeof val === 'string' && val.trim() !== '' && val.trim().toLowerCase() !== 'false');
}

export function getIncludedOfferings(rows: ScopeRow[], productLine: string): ScopeRow[] {
  return rows.filter(row => isRowIncludedForProductLine(row, productLine));
}

/** Included offerings in a single category, sorted by name */
export function getIncludedRowsInCategory(
  rows: ScopeRow[],
  productLine: string,
  categoryId: string
): ScopeRow[] {
  return rows
    .filter(r => r.category === categoryId && isRowIncludedForProductLine(r, productLine))
    .sort((a, b) => a.offering.localeCompare(b.offering));
}

// For comparison: find rows where values differ across a set of product lines
export function getDifferingRows(rows: ScopeRow[], productLines: string[]): ScopeRow[] {
  return rows.filter(row => {
    const values = productLines.map(pl => row.productLines[pl]);
    const firstStr = JSON.stringify(values[0]);
    return values.some(v => JSON.stringify(v) !== firstStr);
  });
}

export function getSharedRows(rows: ScopeRow[], productLines: string[]): ScopeRow[] {
  return rows.filter(row => {
    const values = productLines.map(pl => row.productLines[pl]);
    const firstStr = JSON.stringify(values[0]);
    return values.every(v => JSON.stringify(v) === firstStr);
  });
}

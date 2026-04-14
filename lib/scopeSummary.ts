import type { ScopeRow, CellValue } from '@/types';
import { CATEGORIES } from '@/data/categories';
import { FAMILY_GROUPS, PRODUCT_LINES } from '@/data/productLines';
import { getIncludedOfferings } from '@/lib/utils';

/** Stable string for comparing scope between two product lines */
export function normalizeCellForSignature(val: CellValue | undefined): string {
  if (val === undefined) return '∅';
  if (typeof val === 'boolean') return val ? '1' : '0';
  const t = val.trim();
  if (!t || t.toLowerCase() === 'false') return '0';
  return `T:${t}`;
}

export function getScopeSignature(rows: ScopeRow[], productLine: string): string {
  return rows.map(r => `${r.id}:${normalizeCellForSignature(r.productLines[productLine])}`).join('|');
}

export interface CategoryBreakdown {
  categoryId: string;
  label: string;
  included: number;
  total: number;
}

export interface RedundantGroup {
  names: string[];
  family: string;
  includedCount: number;
}

export interface ProductScopeSummary {
  productLine: string;
  family: string;
  generatedAt: string;
  totalRows: number;
  includedCount: number;
  coveragePct: number;
  /** One-line scope statement */
  scopeStatement: string;
  /** Category coverage */
  categoryBreakdown: CategoryBreakdown[];
  /** Pricing / commercial row text if present */
  pricingNote: string | null;
  /** Groups in the same family with identical full-matrix scope */
  redundancyWithinFamily: RedundantGroup[];
  /** Other product lines (any family) with identical scope signature */
  identicalScopeElsewhere: string[];
  /** Short bullets for the one-pager */
  digestBullets: string[];
}

function findFamily(productLine: string): string {
  return PRODUCT_LINES.find(p => p.name === productLine)?.family ?? 'Unknown';
}

export function buildProductScopeSummary(rows: ScopeRow[], productLine: string): ProductScopeSummary {
  const family = findFamily(productLine);
  const sig = getScopeSignature(rows, productLine);
  const included = getIncludedOfferings(rows, productLine);
  const totalRows = rows.length;
  const includedCount = included.length;
  const coveragePct = totalRows ? Math.round((includedCount / totalRows) * 100) : 0;

  const categoryBreakdown: CategoryBreakdown[] = CATEGORIES.map(cat => {
    const catRows = rows.filter(r => r.category === cat.id);
    const inc = catRows.filter(r => {
      const v = r.productLines[productLine];
      return v === true || (typeof v === 'string' && v.trim() !== '' && v.trim().toLowerCase() !== 'false');
    });
    return {
      categoryId: cat.id,
      label: cat.label,
      included: inc.length,
      total: catRows.length,
    };
  }).filter(c => c.total > 0);

  const pricingRow = rows.find(r => r.offering.toLowerCase().includes('pricing'));
  let pricingNote: string | null = null;
  if (pricingRow) {
    const raw = pricingRow.productLines[productLine];
    if (raw === true) pricingNote = 'Included (see matrix for commercial detail).';
    else if (typeof raw === 'string' && raw.trim() && raw.toLowerCase() !== 'false') {
      pricingNote = raw.trim();
    }
  }

  // Redundancy: same signature within family
  const redundancyWithinFamily: RedundantGroup[] = [];
  const familyMembers = FAMILY_GROUPS[family] ?? [productLine];
  const bySig = new Map<string, string[]>();
  for (const pl of familyMembers) {
    const s = getScopeSignature(rows, pl);
    if (!bySig.has(s)) bySig.set(s, []);
    bySig.get(s)!.push(pl);
  }
  for (const [, names] of Array.from(bySig.entries())) {
    if (names.length < 2) continue;
    const sorted = [...names].sort();
    if (!sorted.includes(productLine)) continue;
    redundancyWithinFamily.push({
      names: sorted,
      family,
      includedCount,
    });
  }

  // Identical scope outside this product's redundancy group
  const identicalScopeElsewhere: string[] = [];
  for (const pl of PRODUCT_LINES.map(p => p.name)) {
    if (pl === productLine) continue;
    if (getScopeSignature(rows, pl) === sig) {
      identicalScopeElsewhere.push(pl);
    }
  }

  const scopeStatement =
    `${productLine} (${family}) includes **${includedCount}** of **${totalRows}** scoped offerings (${coveragePct}% of the matrix), ` +
    `spanning **${categoryBreakdown.filter(c => c.included > 0).length}** capability areas.`;

  const digestBullets: string[] = [];

  const topCats = [...categoryBreakdown]
    .filter(c => c.included > 0)
    .sort((a, b) => b.included / b.total - a.included / a.total)
    .slice(0, 3);
  if (topCats.length) {
    digestBullets.push(
      `Strongest coverage: ${topCats.map(c => `${c.label} (${c.included}/${c.total})`).join(', ')}.`
    );
  }

  if (pricingNote) {
    digestBullets.push(`Commercial / pricing: ${pricingNote.slice(0, 280)}${pricingNote.length > 280 ? '…' : ''}`);
  }

  if (redundancyWithinFamily.length) {
    const g = redundancyWithinFamily[0];
    const others = g.names.filter(n => n !== productLine);
    digestBullets.push(
      `Redundancy: same scope as **${others.join('**, **')}** within **${family}** — consolidate internal messaging where differentiation isn’t intentional.`
    );
  }

  const peers = identicalScopeElsewhere.filter(n => n !== productLine);
  if (peers.length) {
    digestBullets.push(
      `Matrix-identical scope to **${peers.slice(0, 6).join('**, **')}**${peers.length > 6 ? '…' : ''} — align positioning or differentiate explicitly.`
    );
  }

  if (includedCount === 0) {
    digestBullets.push('No inclusions in the current matrix for this line — confirm whether this is intentional.');
  }

  return {
    productLine,
    family,
    generatedAt: new Date().toISOString(),
    totalRows,
    includedCount,
    coveragePct,
    scopeStatement,
    categoryBreakdown,
    pricingNote,
    redundancyWithinFamily,
    identicalScopeElsewhere,
    digestBullets,
  };
}

/** Format summary as plain text for PDF / clipboard */
export function formatSummaryAsText(summary: ProductScopeSummary): string {
  const lines: string[] = [
    `Product scope one-pager — ${summary.productLine}`,
    `Family: ${summary.family} · Generated: ${summary.generatedAt.slice(0, 10)}`,
    '',
    summary.scopeStatement.replace(/\*\*/g, ''),
    '',
    'Digest',
    ...summary.digestBullets.map(b => `• ${b.replace(/\*\*/g, '')}`),
    '',
    'Coverage by category',
    ...summary.categoryBreakdown.map(
      c => `  ${c.label}: ${c.included}/${c.total}`
    ),
  ];
  if (summary.pricingNote) {
    lines.push('', `Pricing note: ${summary.pricingNote}`);
  }
  if (summary.redundancyWithinFamily.length) {
    lines.push('', 'Redundant scope (same family, identical matrix)');
    for (const g of summary.redundancyWithinFamily) {
      lines.push(`  ${g.names.join(' = ')}`);
    }
  }
  if (summary.identicalScopeElsewhere.length) {
    lines.push('', `Other lines with identical scope: ${summary.identicalScopeElsewhere.join(', ')}`);
  }
  return lines.join('\n');
}

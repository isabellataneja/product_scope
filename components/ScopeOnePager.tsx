'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import type { ScopeRow } from '@/types';
import { PRODUCT_LINES } from '@/data/productLines';
import { buildProductScopeSummary, formatSummaryAsText, type ProductScopeSummary } from '@/lib/scopeSummary';
import { getIncludedRowsInCategory } from '@/lib/utils';

interface Props {
  rows: ScopeRow[];
  initialProductLine?: string | null;
}

function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-gray-900 dark:text-gray-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ScopeOnePager({ rows, initialProductLine }: Props) {
  const [selected, setSelected] = useState<string>(() => {
    if (initialProductLine && PRODUCT_LINES.some(p => p.name === initialProductLine)) {
      return initialProductLine;
    }
    return PRODUCT_LINES[0]?.name ?? '';
  });
  const [pdfBusy, setPdfBusy] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set());
  /** During PDF capture: expand all coverage rows + layout tuned for html2canvas */
  const [pdfRendering, setPdfRendering] = useState(false);

  const summary: ProductScopeSummary | null = useMemo(() => {
    if (!selected) return null;
    return buildProductScopeSummary(rows, selected);
  }, [rows, selected]);

  useEffect(() => {
    setExpandedCategories(new Set());
  }, [selected]);

  const categoryIncludedRows = useMemo(() => {
    if (!summary) return new Map<string, ReturnType<typeof getIncludedRowsInCategory>>();
    const map = new Map<string, ReturnType<typeof getIncludedRowsInCategory>>();
    for (const c of summary.categoryBreakdown) {
      map.set(c.categoryId, getIncludedRowsInCategory(rows, selected, c.categoryId));
    }
    return map;
  }, [rows, selected, summary]);

  function toggleCategory(categoryId: string) {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }

  const downloadPdf = useCallback(async () => {
    if (!summary || !printRef.current) return;
    setPdfBusy(true);
    setPdfRendering(true);
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    await new Promise<void>(r => setTimeout(r, 80));
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const el = printRef.current;
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollY: -window.scrollY,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 12;
      const contentW = pageWidth - margin * 2;
      const contentH = pageHeight - margin * 2;

      const srcW = canvas.width;
      const srcH = canvas.height;
      const pdfTotalH = (srcH * contentW) / srcW;

      let yMm = 0;
      let pageIndex = 0;
      while (yMm < pdfTotalH - 0.01) {
        const sliceHmm = Math.min(contentH, pdfTotalH - yMm);
        if (sliceHmm < 0.01) break;
        const srcY = (yMm / pdfTotalH) * srcH;
        const srcSliceH = (sliceHmm / pdfTotalH) * srcH;

        const slice = document.createElement('canvas');
        slice.width = srcW;
        slice.height = Math.ceil(srcSliceH);
        const sctx = slice.getContext('2d');
        if (!sctx) throw new Error('Canvas context unavailable');
        sctx.drawImage(
          canvas,
          0,
          srcY,
          srcW,
          srcSliceH,
          0,
          0,
          srcW,
          srcSliceH
        );
        const sliceData = slice.toDataURL('image/png');
        const slicePdfH = (slice.height * contentW) / srcW;

        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(sliceData, 'PNG', margin, margin, contentW, slicePdfH);
        yMm += sliceHmm;
        pageIndex += 1;
      }

      const safeName = summary.productLine.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 80);
      pdf.save(`scope-one-pager-${safeName}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Could not generate PDF. Try print / Save as PDF instead.');
    } finally {
      setPdfRendering(false);
      setPdfBusy(false);
    }
  }, [summary]);

  const copyText = useCallback(() => {
    if (!summary) return;
    void navigator.clipboard.writeText(formatSummaryAsText(summary));
  }, [summary]);

  return (
    <div className="max-w-3xl mx-auto px-5 py-8 pb-16">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">
          Internal · Product scope
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">One-Pager</h1>
        <p className="text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed">
          Condensed summary from the scope matrix: what this product line includes, where coverage is strongest, and
          where scope overlaps other lines (redundancy). Generated deterministically from live data — no external API.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/master?pl=${encodeURIComponent(selected)}`}
            className="text-[13px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Open full master sheet →
          </Link>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <Link href="/product-lines" className="text-[13px] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            All product lines
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <label htmlFor="pl-select" className="block text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Product line
          </label>
          <select
            id="pl-select"
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="w-full text-[14px] border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            {PRODUCT_LINES.map(pl => (
              <option key={pl.name} value={pl.name}>
                {pl.name} — {pl.family}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadPdf}
            disabled={!summary || pdfBusy}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {pdfBusy ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Building PDF…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </>
            )}
          </button>
          <button
            type="button"
            onClick={copyText}
            disabled={!summary}
            className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-[13px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            Copy text
          </button>
        </div>
      </div>

      {/* Printable one-pager (light theme for PDF) */}
      <div
        ref={printRef}
        id="scope-one-pager-print"
        className="rounded-xl border border-gray-200 bg-white text-gray-900 shadow-sm overflow-hidden"
        style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}
      >
        {summary && (
          <>
            {/* PDF / print: main header only */}
            <div className="px-8 pt-8 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold leading-snug">{summary.productLine}</h2>
              <p className="text-[13px] text-gray-600 mt-1.5 leading-normal">
                Family: <span className="font-medium text-gray-800">{summary.family}</span>
                {' · '}
                <span className="text-gray-500">{summary.includedCount} / {summary.totalRows} offerings · {summary.coveragePct}% coverage</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-2 leading-normal">Generated {summary.generatedAt.slice(0, 10)} · Internal use</p>
            </div>

            {/* Tab strip — content below this tab panel */}
            <div className="px-8 border-b border-gray-200 bg-gray-50/80">
              <div
                className="inline-flex items-center border-b-2 border-blue-600 text-blue-700 -mb-px pt-1 pb-2.5 px-0.5 text-[13px] font-semibold leading-normal"
                aria-current="page"
              >
                One-Pager
              </div>
            </div>

            <div className="px-8 pb-8 pt-6">
              <section className="mb-5">
                <h3 className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2">Scope statement</h3>
                <p className="text-[14px] leading-relaxed text-gray-800">{renderBold(summary.scopeStatement)}</p>
              </section>

              <section className="mb-5">
                <h3 className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2">Digest</h3>
                <ul className="space-y-2 text-[13px] leading-relaxed text-gray-800">
                  {summary.digestBullets.map((b, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-blue-600 flex-shrink-0">•</span>
                      <span>{renderBold(b)}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mb-5">
                <h3 className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2">Coverage by category</h3>
                {!pdfRendering && (
                  <p className="text-[11px] text-gray-500 mb-2">
                    Click a row with included items to expand and see which offerings are in scope.
                  </p>
                )}
                {pdfRendering && (
                  <p className="text-[11px] text-gray-500 mb-2">
                    Included offerings listed under each category.
                  </p>
                )}
                <div className="rounded-lg border border-gray-100 divide-y divide-gray-100 text-[12px]">
                  {summary.categoryBreakdown.map(c => {
                    const includedRows = categoryIncludedRows.get(c.categoryId) ?? [];
                    const canExpand = c.included > 0;
                    const isOpen = pdfRendering
                      ? canExpand
                      : expandedCategories.has(c.categoryId);
                    const panelId = `coverage-panel-${c.categoryId}`;

                    return (
                      <div key={c.categoryId} className="bg-white">
                        <button
                          type="button"
                          id={`coverage-trigger-${c.categoryId}`}
                          aria-expanded={canExpand ? isOpen : false}
                          aria-controls={canExpand ? panelId : undefined}
                          disabled={!canExpand || pdfRendering}
                          onClick={() => canExpand && toggleCategory(c.categoryId)}
                          className={[
                            'w-full flex items-start justify-between gap-3 px-3 py-2.5 text-left min-h-[2.75rem]',
                            canExpand && !pdfRendering
                              ? 'hover:bg-gray-50 cursor-pointer'
                              : 'cursor-default',
                            pdfRendering && canExpand ? 'bg-white' : '',
                          ].join(' ')}
                        >
                          <span className="flex items-start gap-2 min-w-0 flex-1">
                            <span
                              className={[
                                'mt-0.5 flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-400',
                                canExpand ? '' : 'invisible',
                              ].join(' ')}
                              aria-hidden
                            >
                              <svg
                                className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </span>
                            <span
                              className={[
                                'text-gray-800 font-medium leading-normal',
                                pdfRendering ? 'whitespace-normal break-words' : 'truncate',
                              ].join(' ')}
                            >
                              {c.label}
                            </span>
                          </span>
                          <span className="text-gray-600 flex-shrink-0 tabular-nums leading-normal pt-0.5">
                            {c.included}/{c.total}
                          </span>
                        </button>
                        {canExpand && isOpen && (
                          <div
                            id={panelId}
                            role="region"
                            aria-labelledby={`coverage-trigger-${c.categoryId}`}
                            className="px-3 pb-3 pl-10 pr-3"
                          >
                            <ul className="space-y-1.5 text-[11px] text-gray-700 leading-snug border-l-2 border-blue-100 pl-3 ml-0.5">
                              {includedRows.map(row => (
                                <li key={row.id} className="leading-snug">{row.offering}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {summary.pricingNote && (
                <section className="mb-5">
                  <h3 className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2">Pricing / commercial</h3>
                  <p className="text-[12px] leading-relaxed text-gray-800 bg-gray-50 border border-gray-100 rounded-lg p-3">
                    {summary.pricingNote}
                  </p>
                </section>
              )}

              <section>
                <h3 className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2">Redundancy & overlap</h3>
                {summary.redundancyWithinFamily.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {summary.redundancyWithinFamily.map((g, i) => (
                      <p key={i} className="text-[12px] text-gray-800 bg-amber-50 border border-amber-100 rounded-lg p-3">
                        <strong className="text-amber-900">Same scope in family ({g.family}):</strong>{' '}
                        {g.names.join(' · ')}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-gray-600 mb-3">No other line in this family has an identical full-matrix signature.</p>
                )}
                {summary.identicalScopeElsewhere.filter(n => n !== summary.productLine).length > 0 && (
                  <p className="text-[12px] text-gray-800">
                    <strong className="text-gray-700">Matrix-identical elsewhere:</strong>{' '}
                    {summary.identicalScopeElsewhere.filter(n => n !== summary.productLine).join(', ')}
                  </p>
                )}
                {summary.identicalScopeElsewhere.filter(n => n !== summary.productLine).length === 0 && summary.redundancyWithinFamily.length === 0 && (
                  <p className="text-[12px] text-gray-600">Unique scope signature in the current dataset.</p>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

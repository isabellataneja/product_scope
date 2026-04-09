import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Product line name normalization map (CSV header -> canonical name)
const PRODUCT_LINE_MAP = {
  'Live ': 'Live',
  'Live': 'Live',
  'Live w/integration ': 'Live w/integration',
  'Live w/integration': 'Live w/integration',
  'Assist': 'Assist',
  'Assist (with integration)': 'Assist (with integration)',
  'Chart Prep Standalone ': 'Chart Prep Standalone',
  'Chart Prep Standalone': 'Chart Prep Standalone',
  'Assist w/ Chart Prep ': 'Assist w/ Chart Prep',
  'Assist w/ Chart Prep': 'Assist w/ Chart Prep',
  'Assist w/ Chart Prep + integration': 'Assist w/ Chart Prep + integration',
  'Assist 4 hrs ': 'Assist 4 hrs',
  'Assist 4 hrs': 'Assist 4 hrs',
  'Assist +': 'Assist +',
  'Assist + (w/ integration)': 'Assist + (w/ integration)',
  'Assist 20 min ': 'Assist 20 min',
  'Assist 20 min': 'Assist 20 min',
  'Assist 20 min + Chart Prep': 'Assist 20 min + Chart Prep',
  'Assist 20 min + Chart Prep + Integration': 'Assist 20 min + Chart Prep + Integration',
  'Ambient': 'Ambient',
  'Ambient + Integration': 'Ambient + Integration',
  'Upload Add on for Ambient': 'Upload Add on for Ambient',
  'Ambient + Chart Prep ': 'Ambient + Chart Prep',
  'Ambient + Chart Prep': 'Ambient + Chart Prep',
  'Ambient + Chart Prep + Upload': 'Ambient + Chart Prep + Upload',
  'Ambient + Chart Prep + Integration ': 'Ambient + Chart Prep + Integration',
  'Ambient + Chart Prep + Integration': 'Ambient + Chart Prep + Integration',
  'Assist Overnight ***': 'Assist Overnight',
  'Assist Overnight': 'Assist Overnight',
  'Assist Overnight + Chart Prep': 'Assist Overnight + Chart Prep',
  'Assist Overnight + Chart Prep + Integration ': 'Assist Overnight + Chart Prep + Integration',
  'Assist Overnight + Chart Prep + Integration': 'Assist Overnight + Chart Prep + Integration',
  'Assist Overnight w/ Integration ': 'Assist Overnight w/ Integration',
  'Assist Overnight w/ Integration': 'Assist Overnight w/ Integration',
};

// Category assignment based on offering name prefix/content
function getCategory(offering) {
  const o = offering.toLowerCase().trim();
  if (o.startsWith('precharting:')) return 'precharting';
  if (o.startsWith('chart prep:')) return 'chartPrep';
  if (o.startsWith('css:') || o === 'autocoding' || o === 'image assist' || o.startsWith('ped medication')) return 'css';
  if (o === 'ai generated note created from visit conversation' ||
      o.startsWith('combine') || o.startsWith('note edited') ||
      o.startsWith('add ehr template') || o.startsWith('ai studio') ||
      o.startsWith('add ehr macros') || o.startsWith('transcribe') ||
      o.startsWith('add form responses') || o.startsWith('add summarized') ||
      o.startsWith('add medication details') || o.startsWith('add testing result') ||
      o.startsWith('add ros') || o.startsWith('add pe') ||
      o.startsWith('use click') || o.startsWith('select answers') ||
      o === 'assessment and plan' || o.startsWith('regenerating') ||
      o.startsWith('add testing results available') || o.startsWith('adding additional') ||
      o === 'forward notes') return 'aiNote';
  if (o.startsWith('scheduling') || o.startsWith('customizable live') ||
      o.startsWith('assist 20 min sla') || o.startsWith('assist 60 min') ||
      o.startsWith('assist 4 hr') || o.startsWith('assist next day')) return 'sla';
  if (o.startsWith('upload chart prep') || o.startsWith('gold standard') ||
      o.startsWith('mds works live') || o.startsWith('assist: communication') ||
      o.startsWith('synchronous') || o.startsWith('messaging in') ||
      o.startsWith('opening note') || o.startsWith('multiple patients') ||
      o.startsWith('dedicated primary') || o.startsWith('edit ehr templates') ||
      o.startsWith('general text formatting') || o.startsWith('customized text') ||
      o.startsWith('pre-visit summaries') || o === 'schedule prep' ||
      o === 'reminders' || o.startsWith('mark note')) return 'templates';
  // Default: general
  return 'general';
}

// Parse CSV with proper handling of quoted fields (which can contain newlines)
function parseCSV(content) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < content.length) {
    const ch = content[i];
    const nextCh = content[i + 1];

    if (inQuotes) {
      if (ch === '"' && nextCh === '"') {
        currentField += '"';
        i += 2;
      } else if (ch === '"') {
        inQuotes = false;
        i++;
      } else {
        currentField += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ',') {
        currentRow.push(currentField);
        currentField = '';
        i++;
      } else if (ch === '\r' && nextCh === '\n') {
        currentRow.push(currentField);
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        i += 2;
      } else if (ch === '\n') {
        currentRow.push(currentField);
        currentField = '';
        rows.push(currentRow);
        currentRow = [];
        i++;
      } else {
        currentField += ch;
        i++;
      }
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

function parseCellValue(val) {
  const v = val.trim();
  if (v.toUpperCase() === 'TRUE') return true;
  if (v.toUpperCase() === 'FALSE') return false;
  if (v === '') return false;
  // If it's a short value that's basically just a marker, treat as true
  if (v === 'S' || v === 'D' || v === '✓' || v === 'x' || v === 'X') return true;
  return v; // Keep as string
}

const csvPath = '/Users/isabellataneja/Downloads/Product Line Scope Comparison  - Master_Comparison.csv';
const content = readFileSync(csvPath, 'utf8');

const rows = parseCSV(content);
const headerRow = rows[0];

console.log('Header row length:', headerRow.length);
console.log('Product line columns (9 onward):');
for (let i = 9; i < headerRow.length; i++) {
  console.log(`  [${i}]: "${headerRow[i]}"`);
}

// Build product line name mapping from headers
const productLineCols = [];
for (let i = 9; i < headerRow.length; i++) {
  const raw = headerRow[i].trim().replace(/\s+/g, ' ');
  const canonical = PRODUCT_LINE_MAP[raw] || raw;
  productLineCols.push({ index: i, raw, canonical });
}

console.log('\nMapped product lines:');
productLineCols.forEach(pl => console.log(`  "${pl.raw}" -> "${pl.canonical}"`));

// Parse data rows (skip header)
const scopeData = [];
let rowId = 0;

for (let r = 1; r < rows.length; r++) {
  const row = rows[r];
  const offering = row[0]?.trim();
  if (!offering) continue;

  rowId++;
  const productLines = {};
  for (const pl of productLineCols) {
    const val = row[pl.index] || '';
    productLines[pl.canonical] = parseCellValue(val);
  }

  scopeData.push({
    id: `row-${rowId}`,
    offering: offering.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
    category: getCategory(offering),
    currentState: (row[1] || '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim(),
    additionalInfo: (row[2] || '').trim(),
    siteSpecific: (row[3] || '').trim(),
    bestPractices: (row[4] || '').trim(),
    deviationCausesDelay: (row[5] || '').trim(),
    templateAdjustment: (row[6] || '').trim(),
    customFormatAdded: (row[7] || '').trim(),
    engBuildRequired: (row[8] || '').trim(),
    productLines,
  });
}

console.log(`\nParsed ${scopeData.length} rows`);

const outputPath = '/Users/isabellataneja/Desktop/product_scope/data/scopeData.json';
writeFileSync(outputPath, JSON.stringify(scopeData, null, 2));
console.log(`\nWritten to ${outputPath}`);

import type { ProductLine } from '@/types';

export const PRODUCT_LINES: ProductLine[] = [
  { name: 'Live', family: 'Live' },
  { name: 'Live w/integration', family: 'Live' },

  { name: 'Assist', family: 'Assist' },
  { name: 'Assist (with integration)', family: 'Assist' },
  { name: 'Assist w/ Chart Prep', family: 'Assist' },
  { name: 'Assist w/ Chart Prep + integration', family: 'Assist' },
  { name: 'Assist 4 hrs', family: 'Assist' },
  { name: 'Assist +', family: 'Assist' },
  { name: 'Assist + (w/ integration)', family: 'Assist' },

  { name: 'Assist 20 min', family: 'Assist 20 min' },
  { name: 'Assist 20 min + Chart Prep', family: 'Assist 20 min' },
  { name: 'Assist 20 min + Chart Prep + Integration', family: 'Assist 20 min' },

  { name: 'Ambient', family: 'Ambient' },
  { name: 'Ambient + Integration', family: 'Ambient' },
  { name: 'Upload Add on for Ambient', family: 'Ambient' },
  { name: 'Ambient + Chart Prep', family: 'Ambient' },
  { name: 'Ambient + Chart Prep + Upload', family: 'Ambient' },
  { name: 'Ambient + Chart Prep + Integration', family: 'Ambient' },

  { name: 'Chart Prep Standalone', family: 'Chart Prep' },

  { name: 'Assist Overnight', family: 'Assist Overnight' },
  { name: 'Assist Overnight + Chart Prep', family: 'Assist Overnight' },
  { name: 'Assist Overnight + Chart Prep + Integration', family: 'Assist Overnight' },
  { name: 'Assist Overnight w/ Integration', family: 'Assist Overnight' },
];

export const FAMILY_GROUPS: Record<string, string[]> = {
  'Live': ['Live', 'Live w/integration'],
  'Assist': [
    'Assist', 'Assist (with integration)', 'Assist w/ Chart Prep',
    'Assist w/ Chart Prep + integration', 'Assist 4 hrs', 'Assist +', 'Assist + (w/ integration)',
  ],
  'Assist 20 min': [
    'Assist 20 min', 'Assist 20 min + Chart Prep', 'Assist 20 min + Chart Prep + Integration',
  ],
  'Ambient': [
    'Ambient', 'Ambient + Integration', 'Upload Add on for Ambient',
    'Ambient + Chart Prep', 'Ambient + Chart Prep + Upload', 'Ambient + Chart Prep + Integration',
  ],
  'Chart Prep': ['Chart Prep Standalone'],
  'Assist Overnight': [
    'Assist Overnight', 'Assist Overnight + Chart Prep',
    'Assist Overnight + Chart Prep + Integration', 'Assist Overnight w/ Integration',
  ],
};

export type CellValue = boolean | string;

export interface ScopeRow {
  id: string;
  offering: string;
  category: string;
  currentState: string;
  additionalInfo: string;
  siteSpecific: string;
  bestPractices: string;
  deviationCausesDelay: string;
  templateAdjustment: string;
  customFormatAdded: string;
  engBuildRequired: string;
  productLines: Record<string, CellValue>;
}

export interface ProductLine {
  name: string;
  family: string;
}

export interface Category {
  id: string;
  label: string;
  color: string;
  darkColor: string;
}

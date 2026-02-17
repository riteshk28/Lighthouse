export interface MetricScores {
  June: number;
  July: number;
  [key: string]: number; // Allow index access for dynamic updates
}

export interface PageMetrics {
  Performance: MetricScores;
  Accessibility: MetricScores;
  BestPractices: MetricScores;
  SEO: MetricScores;
  LCP: MetricScores;
  TBT: MetricScores;
  INP: MetricScores;
  LoadTime: MetricScores;
}

export interface Dataset {
  [pageName: string]: PageMetrics;
}

export enum ViewMode {
  OVERVIEW = 'OVERVIEW',
  DETAILS = 'DETAILS',
}

export type MetricKey = keyof PageMetrics;

export interface ChartDataPoint {
  subject: string;
  June: number;
  July: number;
  fullMark: number;
}
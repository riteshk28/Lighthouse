import { Dataset } from './types';

export const RAW_DATA: Dataset = {
  'Homepage': {
    Performance: { June: 85, July: 71 },
    Accessibility: { June: 85, July: 92 },
    BestPractices: { June: 74, July: 52 },
    SEO: { June: 85, July: 85 },
    LCP: { June: 2.4, July: 1.8 },
    TBT: { June: 150, July: 120 },
    INP: { June: 220, July: 180 },
    LoadTime: { June: 3.2, July: 2.8 },
  },
  'Landing Page': {
    Performance: { June: 83, July: 63 },
    Accessibility: { June: 92, July: 89 },
    BestPractices: { June: 74, July: 74 },
    SEO: { June: 85, July: 92 },
    LCP: { June: 3.1, July: 2.9 },
    TBT: { June: 280, July: 310 },
    INP: { June: 180, July: 190 },
    LoadTime: { June: 4.5, July: 4.2 },
  },
  'Product': {
    Performance: { June: 57, July: 75 },
    Accessibility: { June: 89, July: 96 },
    BestPractices: { June: 70, July: 52 },
    SEO: { June: 77, July: 85 },
    LCP: { June: 4.2, July: 2.5 },
    TBT: { June: 450, July: 200 },
    INP: { June: 300, July: 150 },
    LoadTime: { June: 5.8, July: 3.1 },
  },
  'Cart': {
    Performance: { June: 25, July: 66 },
    Accessibility: { June: 89, July: 93 },
    BestPractices: { June: 74, July: 52 },
    SEO: { June: 67, July: 85 },
    LCP: { June: 5.5, July: 3.2 },
    TBT: { June: 800, July: 350 },
    INP: { June: 450, July: 280 },
    LoadTime: { June: 7.2, July: 4.5 },
  },
  'Orders': {
    Performance: { June: 65, July: 76 },
    Accessibility: { June: 82, July: 85 },
    BestPractices: { June: 74, July: 52 },
    SEO: { June: 75, July: 75 },
    LCP: { June: 2.8, July: 2.6 },
    TBT: { June: 180, July: 170 },
    INP: { June: 150, July: 140 },
    LoadTime: { June: 3.9, July: 3.5 },
  },
};

export const PAGES = Object.keys(RAW_DATA);
// Order matches the columns in your screenshot: Scores first, then Core Vitals
export const METRICS = [
  'Performance', 
  'Accessibility', 
  'BestPractices', 
  'SEO',
  'LCP',
  'TBT',
  'INP',
  'LoadTime'
];

export const COLORS = {
  June: '#94a3b8', 
  July: '#4f46e5', 
  JuneFill: '#94a3b8',
  JulyFill: '#4f46e5',
};
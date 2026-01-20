import data from '../db/realizedUnrealizedPerformanceSummary.json';

interface RawRealizedUnrealizedPerformanceSummary {
  'Realized & Unrealized Performance Summary': string;
  Header: string;
  'Asset Category': string;
  Symbol: string;
  'Cost Adj.': string;
  'Realized S/T Profit': string;
  'Realized S/T Loss': string;
  'Realized L/T Profit': string;
  'Realized L/T Loss': string;
  'Realized Total': string;
  'Unrealized S/T Profit': string;
  'Unrealized S/T Loss': string;
  'Unrealized L/T Profit': string;
  'Unrealized L/T Loss': string;
  'Unrealized Total': string;
  Total: string;
  Code: string;
}

export interface RealizedUnrealizedPerformanceSummary {
  realizedUnrealizedPerformanceSummary: string;
  header: string;
  assetCategory: string;
  symbol: string;
  costAdj: number;
  realizedSTProfit: number;
  realizedSTLoss: number;
  realizedLTProfit: number;
  realizedLTLoss: number;
  realizedTotal: number;
  unrealizedSTProfit: number;
  unrealizedSTLoss: number;
  unrealizedLTProfit: number;
  unrealizedLTLoss: number;
  unrealizedTotal: number;
  total: number;
  code: string;
}

export const realizedUnrealizedPerformanceSummary: RealizedUnrealizedPerformanceSummary[] = (
  data as RawRealizedUnrealizedPerformanceSummary[]
).map((item) => ({
  realizedUnrealizedPerformanceSummary: item['Realized & Unrealized Performance Summary'],
  header: item['Header'],
  assetCategory: item['Asset Category'],
  symbol: item['Symbol'],
  costAdj: Number(item['Cost Adj.'] || 0),
  realizedSTProfit: Number(item['Realized S/T Profit'] || 0),
  realizedSTLoss: Number(item['Realized S/T Loss'] || 0),
  realizedLTProfit: Number(item['Realized L/T Profit'] || 0),
  realizedLTLoss: Number(item['Realized L/T Loss'] || 0),
  realizedTotal: Number(item['Realized Total'] || 0),
  unrealizedSTProfit: Number(item['Unrealized S/T Profit'] || 0),
  unrealizedSTLoss: Number(item['Unrealized S/T Loss'] || 0),
  unrealizedLTProfit: Number(item['Unrealized L/T Profit'] || 0),
  unrealizedLTLoss: Number(item['Unrealized L/T Loss'] || 0),
  unrealizedTotal: Number(item['Unrealized Total'] || 0),
  total: Number(item['Total'] || 0),
  code: item['Code'],
}));

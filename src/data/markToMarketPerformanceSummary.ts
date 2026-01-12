import data from "../db/markToMarketPerformanceSummary.json";

interface RawMarkToMarketPerformanceSummary {
  "Mark-to-Market Performance Summary": string;
  "Header": string;
  "Asset Category": string;
  "Symbol": string;
  "Prior Quantity": string;
  "Current Quantity": string;
  "Prior Price": string;
  "Current Price": string;
  "Mark-to-Market P/L Position": string;
  "Mark-to-Market P/L Transaction": string;
  "Mark-to-Market P/L Commissions": string;
  "Mark-to-Market P/L Other": string;
  "Mark-to-Market P/L Total": string;
  "Code": string;
}

export interface MarkToMarketPerformanceSummary {
  markToMarketPerformanceSummary: string;
  header: string;
  assetCategory: string;
  symbol: string;
  priorQuantity: number;
  currentQuantity: number;
  priorPrice: number;
  currentPrice: number;
  markToMarketPLPosition: number;
  markToMarketPLTransaction: number;
  markToMarketPLCommissions: number;
  markToMarketPLOther: number;
  markToMarketPLTotal: number;
  code: string;
}

export const markToMarketPerformanceSummary: MarkToMarketPerformanceSummary[] = (data as RawMarkToMarketPerformanceSummary[]).map(item => ({
  markToMarketPerformanceSummary: item["Mark-to-Market Performance Summary"],
  header: item["Header"],
  assetCategory: item["Asset Category"],
  symbol: item["Symbol"],
  priorQuantity: Number(item["Prior Quantity"] || 0),
  currentQuantity: Number(item["Current Quantity"] || 0),
  priorPrice: Number(item["Prior Price"] || 0),
  currentPrice: Number(item["Current Price"] || 0),
  markToMarketPLPosition: Number(item["Mark-to-Market P/L Position"] || 0),
  markToMarketPLTransaction: Number(item["Mark-to-Market P/L Transaction"] || 0),
  markToMarketPLCommissions: Number(item["Mark-to-Market P/L Commissions"] || 0),
  markToMarketPLOther: Number(item["Mark-to-Market P/L Other"] || 0),
  markToMarketPLTotal: Number(item["Mark-to-Market P/L Total"] || 0),
  code: item["Code"],
}));

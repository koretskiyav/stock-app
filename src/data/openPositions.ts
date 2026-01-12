import data from "../db/openPositions.json";

interface RawOpenPositions {
  "Open Positions": string;
  "Header": string;
  "DataDiscriminator": string;
  "Asset Category": string;
  "Currency": string;
  "Symbol": string;
  "Quantity": string;
  "Mult": string;
  "Cost Price": string;
  "Cost Basis": string;
  "Close Price": string;
  "Value": string;
  "Unrealized P/L": string;
  "Code": string;
}

export interface OpenPositions {
  openPositions: string;
  header: string;
  dataDiscriminator: string;
  assetCategory: string;
  currency: string;
  symbol: string;
  quantity: number;
  mult: number;
  costPrice: number;
  costBasis: number;
  closePrice: number;
  value: number;
  unrealizedPL: number;
  code: string;
}

export const openPositions: OpenPositions[] = (data as RawOpenPositions[]).map(item => ({
  openPositions: item["Open Positions"],
  header: item["Header"],
  dataDiscriminator: item["DataDiscriminator"],
  assetCategory: item["Asset Category"],
  currency: item["Currency"],
  symbol: item["Symbol"],
  quantity: Number(item["Quantity"] || 0),
  mult: Number(item["Mult"] || 0),
  costPrice: Number(item["Cost Price"] || 0),
  costBasis: Number(item["Cost Basis"] || 0),
  closePrice: Number(item["Close Price"] || 0),
  value: Number(item["Value"] || 0),
  unrealizedPL: Number(item["Unrealized P/L"] || 0),
  code: item["Code"],
}));

import data from "../db/trades.json";

interface RawTrades {
  "Trades": string;
  "Header": string;
  "DataDiscriminator": string;
  "Asset Category": string;
  "Currency": string;
  "Symbol": string;
  "Date/Time": string;
  "Quantity": string;
  "T-Price": string;
  "C-Price": string;
  "Proceeds": string;
  "Comm/Fee": string;
  "Basis": string;
  "Realized P/L": string;
  "MTM P/L": string;
  "Code": string;
}

export interface Trades {
  trades: string;
  header: string;
  dataDiscriminator: string;
  assetCategory: string;
  currency: string;
  symbol: string;
  dateTime: string;
  quantity: number;
  tPrice: number;
  cPrice: number;
  proceeds: number;
  commFee: number;
  basis: number;
  realizedPL: number;
  mtmPL: number;
  code: string;
}

export const trades: Trades[] = (data as RawTrades[]).map(item => ({
  trades: item["Trades"],
  header: item["Header"],
  dataDiscriminator: item["DataDiscriminator"],
  assetCategory: item["Asset Category"],
  currency: item["Currency"],
  symbol: item["Symbol"],
  dateTime: item["Date/Time"],
  quantity: Number(item["Quantity"] || 0),
  tPrice: Number(item["T-Price"] || 0),
  cPrice: Number(item["C-Price"] || 0),
  proceeds: Number(item["Proceeds"] || 0),
  commFee: Number(item["Comm/Fee"] || 0),
  basis: Number(item["Basis"] || 0),
  realizedPL: Number(item["Realized P/L"] || 0),
  mtmPL: Number(item["MTM P/L"] || 0),
  code: item["Code"],
}));

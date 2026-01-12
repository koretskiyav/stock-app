import tradesData from "../db/trades.json";
import dividendsData from "../db/dividends.json";
import type { Dividend, Trade } from "../types";

interface RawTrade {
  Trades: string;
  Header: string;
  DataDiscriminator?: string;
  "Asset Category": string;
  Currency: string;
  Symbol: string;
  "Date/Time": string;
  Quantity: string;
  "T-Price": string;
  "C-Price": string;
  Proceeds: string;
  "Comm/Fee": string;
  Basis: string;
  "Realized P/L": string;
  "MTM P/L": string;
  Code: string;
}

interface RawDividend {
  Dividends: string;
  Header: string;
  Currency: string;
  Date: string;
  Description: string;
  Amount: string;
}

export const trades: Trade[] = (tradesData as RawTrade[]).map((t) => ({
  currency: t["Currency"],
  symbol: t["Symbol"],
  date: t["Date/Time"],
  quantity: Number(t["Quantity"]),
  tPrice: Number(t["T-Price"]),
  cPrice: Number(t["C-Price"] || 0),
  proceeds: Number(t["Proceeds"]),
  commFee: Number(t["Comm/Fee"]),
  basis: Number(t["Basis"]),
  realizedPL: Number(t["Realized P/L"]),
}));

export const dividends: Dividend[] = (dividendsData as RawDividend[]).map((d) => ({
  currency: d["Currency"],
  date: d["Date"],
  description: d["Description"],
  amount: Number(d["Amount"]),
}));


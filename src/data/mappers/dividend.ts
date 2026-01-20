import type { RawDividend } from "../../db/types";

export interface Dividend {
  dividends: string;
  header: string;
  currency: string;
  date: string;
  description: string;
  amount: number;
  symbol: string;
  perShare: number;
  quantity: number;
}

export const mapDividend = (item: RawDividend): Dividend => {
  // Description example: "AAPL(US0378331005) Cash Dividend USD 0.24 per Share (Ordinary Dividend)"
  const symbolMatch = item.Description.match(/^([A-Z.]+)\(/);
  const symbol = symbolMatch ? symbolMatch[1] : "";

  const divPerShareMatch = item.Description.match(/USD\s+([\d.]+)\s+per Share/);
  const perShare = divPerShareMatch ? parseFloat(divPerShareMatch[1]) : 0;
  
  const amount = Number(item.Amount || 0);
  const rawQuantity = perShare > 0 ? amount / perShare : 0;
  
  // Round to nearest integer to avoid 0.99999 issues, assuming whole shares for dividends
  const quantity = Math.round(rawQuantity);

  return {
    dividends: item.Dividends,
    header: item.Header,
    currency: item.Currency,
    date: item.Date,
    description: item.Description,
    amount,
    symbol,
    perShare,
    quantity,
  };
};

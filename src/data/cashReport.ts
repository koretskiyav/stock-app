import data from "../db/cashReport.json";

interface RawCashReport {
  "Cash Report": string;
  "Header": string;
  "Currency Summary": string;
  "Currency": string;
  "Total": string;
  "Securities": string;
  "Futures": string;
  "field8": string;
}

export interface CashReport {
  cashReport: string;
  header: string;
  currencySummary: string;
  currency: string;
  total: number;
  securities: number;
  futures: number;
  field8: string;
}

export const cashReport: CashReport[] = (data as RawCashReport[]).map(item => ({
  cashReport: item["Cash Report"],
  header: item["Header"],
  currencySummary: item["Currency Summary"],
  currency: item["Currency"],
  total: Number(item["Total"] || 0),
  securities: Number(item["Securities"] || 0),
  futures: Number(item["Futures"] || 0),
  field8: item["field8"],
}));

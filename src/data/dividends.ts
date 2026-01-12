import data from "../db/dividends.json";

interface RawDividends {
  "Dividends": string;
  "Header": string;
  "Currency": string;
  "Date": string;
  "Description": string;
  "Amount": string;
}

export interface Dividends {
  dividends: string;
  header: string;
  currency: string;
  date: string;
  description: string;
  amount: number;
}

export const dividends: Dividends[] = (data as RawDividends[]).map(item => ({
  dividends: item["Dividends"],
  header: item["Header"],
  currency: item["Currency"],
  date: item["Date"],
  description: item["Description"],
  amount: Number(item["Amount"] || 0),
}));

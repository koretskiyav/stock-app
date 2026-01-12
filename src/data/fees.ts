import data from "../db/fees.json";

interface RawFees {
  "Fees": string;
  "Header": string;
  "Subtitle": string;
  "Currency": string;
  "Date": string;
  "Description": string;
  "Amount": string;
}

export interface Fees {
  fees: string;
  header: string;
  subtitle: string;
  currency: string;
  date: string;
  description: string;
  amount: number;
}

export const fees: Fees[] = (data as RawFees[]).map(item => ({
  fees: item["Fees"],
  header: item["Header"],
  subtitle: item["Subtitle"],
  currency: item["Currency"],
  date: item["Date"],
  description: item["Description"],
  amount: Number(item["Amount"] || 0),
}));

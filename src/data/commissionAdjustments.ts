import data from "../db/commissionAdjustments.json";

interface RawCommissionAdjustments {
  "Commission Adjustments": string;
  "Header": string;
  "Currency": string;
  "Date": string;
  "Description": string;
  "Amount": string;
  "Code": string;
}

export interface CommissionAdjustments {
  commissionAdjustments: string;
  header: string;
  currency: string;
  date: string;
  description: string;
  amount: number;
  code: string;
}

export const commissionAdjustments: CommissionAdjustments[] = (data as RawCommissionAdjustments[]).map(item => ({
  commissionAdjustments: item["Commission Adjustments"],
  header: item["Header"],
  currency: item["Currency"],
  date: item["Date"],
  description: item["Description"],
  amount: Number(item["Amount"] || 0),
  code: item["Code"],
}));

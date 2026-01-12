import data from "../db/withholdingTax.json";

interface RawWithholdingTax {
  "Withholding Tax": string;
  "Header": string;
  "Currency": string;
  "Date": string;
  "Description": string;
  "Amount": string;
  "Code": string;
}

export interface WithholdingTax {
  withholdingTax: string;
  header: string;
  currency: string;
  date: string;
  description: string;
  amount: number;
  code: string;
}

export const withholdingTax: WithholdingTax[] = (data as RawWithholdingTax[]).map(item => ({
  withholdingTax: item["Withholding Tax"],
  header: item["Header"],
  currency: item["Currency"],
  date: item["Date"],
  description: item["Description"],
  amount: Number(item["Amount"] || 0),
  code: item["Code"],
}));

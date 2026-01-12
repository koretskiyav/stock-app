import data from "../db/corporateActions.json";

interface RawCorporateActions {
  "Corporate Actions": string;
  "Header": string;
  "Asset Category": string;
  "Currency": string;
  "Report Date": string;
  "Date/Time": string;
  "Description": string;
  "Quantity": string;
  "Proceeds": string;
  "Value": string;
  "Realized P/L": string;
  "Code": string;
}

export interface CorporateActions {
  corporateActions: string;
  header: string;
  assetCategory: string;
  currency: string;
  reportDate: string;
  dateTime: string;
  description: string;
  quantity: number;
  proceeds: number;
  value: number;
  realizedPL: number;
  code: string;
}

export const corporateActions: CorporateActions[] = (data as RawCorporateActions[]).map(item => ({
  corporateActions: item["Corporate Actions"],
  header: item["Header"],
  assetCategory: item["Asset Category"],
  currency: item["Currency"],
  reportDate: item["Report Date"],
  dateTime: item["Date/Time"],
  description: item["Description"],
  quantity: Number(item["Quantity"] || 0),
  proceeds: Number(item["Proceeds"] || 0),
  value: Number(item["Value"] || 0),
  realizedPL: Number(item["Realized P/L"] || 0),
  code: item["Code"],
}));

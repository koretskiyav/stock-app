import data from '../db/changeInDividendAccruals.json';

interface RawChangeInDividendAccruals {
  'Change in Dividend Accruals': string;
  Header: string;
  'Asset Category': string;
  Currency: string;
  Symbol: string;
  Date: string;
  'Ex Date': string;
  'Pay Date': string;
  Quantity: string;
  Tax: string;
  Fee: string;
  'Gross Rate': string;
  'Gross Amount': string;
  'Net Amount': string;
  Code: string;
}

export interface ChangeInDividendAccruals {
  changeInDividendAccruals: string;
  header: string;
  assetCategory: string;
  currency: string;
  symbol: string;
  date: string;
  exDate: string;
  payDate: string;
  quantity: number;
  tax: number;
  fee: number;
  grossRate: number;
  grossAmount: number;
  netAmount: number;
  code: string;
}

export const changeInDividendAccruals: ChangeInDividendAccruals[] = (
  data as RawChangeInDividendAccruals[]
).map((item) => ({
  changeInDividendAccruals: item['Change in Dividend Accruals'],
  header: item['Header'],
  assetCategory: item['Asset Category'],
  currency: item['Currency'],
  symbol: item['Symbol'],
  date: item['Date'],
  exDate: item['Ex Date'],
  payDate: item['Pay Date'],
  quantity: Number(item['Quantity'] || 0),
  tax: Number(item['Tax'] || 0),
  fee: Number(item['Fee'] || 0),
  grossRate: Number(item['Gross Rate'] || 0),
  grossAmount: Number(item['Gross Amount'] || 0),
  netAmount: Number(item['Net Amount'] || 0),
  code: item['Code'],
}));

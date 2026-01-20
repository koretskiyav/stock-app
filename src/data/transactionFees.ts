import data from '../db/transactionFees.json';

interface RawTransactionFees {
  'Transaction Fees': string;
  Header: string;
  'Asset Category': string;
  Currency: string;
  'Date/Time': string;
  Symbol: string;
  Description: string;
  Quantity: string;
  'Trade Price': string;
  Amount: string;
  Code: string;
}

export interface TransactionFees {
  transactionFees: string;
  header: string;
  assetCategory: string;
  currency: string;
  dateTime: string;
  symbol: string;
  description: string;
  quantity: number;
  tradePrice: number;
  amount: number;
  code: string;
}

export const transactionFees: TransactionFees[] = (data as RawTransactionFees[]).map((item) => ({
  transactionFees: item['Transaction Fees'],
  header: item['Header'],
  assetCategory: item['Asset Category'],
  currency: item['Currency'],
  dateTime: item['Date/Time'],
  symbol: item['Symbol'],
  description: item['Description'],
  quantity: Number(item['Quantity'] || 0),
  tradePrice: Number(item['Trade Price'] || 0),
  amount: Number(item['Amount'] || 0),
  code: item['Code'],
}));

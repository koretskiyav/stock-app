import data from '../db/interest.json';

interface RawInterest {
  Interest: string;
  Header: string;
  Currency: string;
  Date: string;
  Description: string;
  Amount: string;
}

export interface Interest {
  interest: string;
  header: string;
  currency: string;
  date: string;
  description: string;
  amount: number;
}

export const interest: Interest[] = (data as RawInterest[]).map((item) => ({
  interest: item['Interest'],
  header: item['Header'],
  currency: item['Currency'],
  date: item['Date'],
  description: item['Description'],
  amount: Number(item['Amount'] || 0),
}));

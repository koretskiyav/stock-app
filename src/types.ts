export interface Trade {
  currency: string;
  symbol: string;
  date: string;
  quantity: number;
  tPrice: number;
  cPrice: number;
  proceeds: number;
  commFee: number;
  basis: number;
  realizedPL: number;
}

export interface Dividend {
  currency: string;
  date: string;
  description: string;
  amount: number;
}

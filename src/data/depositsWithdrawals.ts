import data from "../db/depositsWithdrawals.json";

interface RawDepositsWithdrawals {
  "Deposits & Withdrawals": string;
  "Header": string;
  "Currency": string;
  "Settle Date": string;
  "Description": string;
  "Amount": string;
}

export interface DepositsWithdrawals {
  depositsWithdrawals: string;
  header: string;
  currency: string;
  settleDate: string;
  description: string;
  amount: number;
}

export const depositsWithdrawals: DepositsWithdrawals[] = (data as RawDepositsWithdrawals[]).map(item => ({
  depositsWithdrawals: item["Deposits & Withdrawals"],
  header: item["Header"],
  currency: item["Currency"],
  settleDate: item["Settle Date"],
  description: item["Description"],
  amount: Number(item["Amount"] || 0),
}));

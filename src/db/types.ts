export interface RawTrade {
  Trades: string;
  Header: string;
  DataDiscriminator: string;
  'Asset Category': string;
  Currency: string;
  Symbol: string;
  'Date/Time': string;
  Quantity: string;
  'T-Price': string;
  'C-Price': string;
  Proceeds: string;
  'Comm/Fee': string;
  Basis: string;
  'Realized P/L': string;
  'MTM P/L': string;
  Code: string;
}

export interface RawDividend {
  Dividends: string;
  Header: string;
  Currency: string;
  Date: string;
  Description: string;
  Amount: string;
}

export interface RawCorporateAction {
  'Corporate Actions': string;
  Header: string;
  'Asset Category': string;
  Currency: string;
  'Report Date': string;
  'Date/Time': string;
  Description: string;
  Quantity: string;
  Proceeds: string;
  Value: string;
  'Realized P/L': string;
  Code: string;
}

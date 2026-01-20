import data from '../db/financialInstrumentInformation.json';

interface RawFinancialInstrumentInformation {
  'Financial Instrument Information': string;
  Header: string;
  'Asset Category': string;
  Symbol: string;
  Description: string;
  Conid: string;
  'Security ID': string;
  Underlying: string;
  'Listing Exch': string;
  Multiplier: string;
  Type: string;
  Code: string;
}

export interface FinancialInstrumentInformation {
  financialInstrumentInformation: string;
  header: string;
  assetCategory: string;
  symbol: string;
  description: string;
  conid: number;
  securityId: string;
  underlying: string;
  listingExch: string;
  multiplier: number;
  type: string;
  code: string;
}

export const financialInstrumentInformation: FinancialInstrumentInformation[] = (
  data as RawFinancialInstrumentInformation[]
).map((item) => ({
  financialInstrumentInformation: item['Financial Instrument Information'],
  header: item['Header'],
  assetCategory: item['Asset Category'],
  symbol: item['Symbol'],
  description: item['Description'],
  conid: Number(item['Conid'] || 0),
  securityId: item['Security ID'],
  underlying: item['Underlying'],
  listingExch: item['Listing Exch'],
  multiplier: Number(item['Multiplier'] || 0),
  type: item['Type'],
  code: item['Code'],
}));

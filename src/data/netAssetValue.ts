import data from '../db/netAssetValue.json';

interface RawNetAssetValue {
  'Net Asset Value': string;
  Header: string;
  'Asset Class': string;
  'Prior Total': string;
  'Current Long': string;
  'Current Short': string;
  'Current Total': string;
  Change: string;
}

export interface NetAssetValue {
  netAssetValue: string;
  header: string;
  assetClass: string;
  priorTotal: number;
  currentLong: number;
  currentShort: number;
  currentTotal: number;
  change: number;
}

export const netAssetValue: NetAssetValue[] = (data as RawNetAssetValue[]).map((item) => ({
  netAssetValue: item['Net Asset Value'],
  header: item['Header'],
  assetClass: item['Asset Class'],
  priorTotal: Number(item['Prior Total'] || 0),
  currentLong: Number(item['Current Long'] || 0),
  currentShort: Number(item['Current Short'] || 0),
  currentTotal: Number(item['Current Total'] || 0),
  change: Number(item['Change'] || 0),
}));

import type { RawCorporateAction } from '../../db/types';

export interface CorporateAction {
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

export const mapCorporateAction = (rawCorporateAction: RawCorporateAction): CorporateAction => ({
  corporateActions: rawCorporateAction['Corporate Actions'],
  header: rawCorporateAction['Header'],
  assetCategory: rawCorporateAction['Asset Category'],
  currency: rawCorporateAction['Currency'],
  reportDate: rawCorporateAction['Report Date'],
  dateTime: rawCorporateAction['Date/Time'],
  description: rawCorporateAction['Description'],
  quantity: Number(rawCorporateAction['Quantity'] || 0),
  proceeds: Number(rawCorporateAction['Proceeds'] || 0),
  value: Number(rawCorporateAction['Value'] || 0),
  realizedPL: Number(rawCorporateAction['Realized P/L'] || 0),
  code: rawCorporateAction['Code'],
});

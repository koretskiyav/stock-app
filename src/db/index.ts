import tradesData from './trades.json';
import corporateActionsData from './corporateActions.json';
import dividendsData from './dividends.json';
import type { RawTrade, RawCorporateAction, RawDividend } from './types';

export const rawTrades = tradesData as RawTrade[];
export const rawCorporateActions = corporateActionsData as RawCorporateAction[];
export const rawDividends = dividendsData as RawDividend[];

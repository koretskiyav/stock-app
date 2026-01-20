import type { Trade } from './trade';
import { SPINOFF_REGEX } from '../filters/spinoff';
import type { CorporateAction } from './corporateAction';

export const mapToSpinoffTrade = (action: CorporateAction): Trade | null => {
  const match = action.description.match(SPINOFF_REGEX);
  if (!match || action.quantity === 0) return null;

  return {
    trades: 'Corporate Action',
    header: 'Data',
    dataDiscriminator: 'Spinoff',
    assetCategory: action.assetCategory,
    currency: action.currency,
    symbol: match[1],
    dateTime: action.dateTime,
    quantity: action.quantity,
    tPrice: 0,
    cPrice: 0,
    proceeds: 0,
    commFee: 0,
    basis: 0,
    realizedPL: 0,
    mtmPL: 0,
    code: action.code,
  };
};

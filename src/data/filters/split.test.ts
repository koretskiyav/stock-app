import { describe, it, expect } from 'vitest';
import { isSplitAction } from './split';
import type { CorporateAction } from '../mappers/corporateAction';

describe('isSplitAction', () => {
  const createAction = (description: string): CorporateAction => ({
    corporateActions: 'Corporate Actions',
    header: 'Data',
    assetCategory: 'Stocks',
    currency: 'USD',
    reportDate: '2023-01-01',
    dateTime: '2023-01-01',
    description,
    quantity: 0,
    proceeds: 0,
    value: 0,
    realizedPL: 0,
    code: '',
  });

  it('should return true for valid split descriptions', () => {
    expect(isSplitAction(createAction('AAPL(US0378331005) Split 4 for 1'))).toBe(true);
    expect(isSplitAction(createAction('TSLA(US88160R1014) Split 3 for 1'))).toBe(true);
  });

  it('should return false for other descriptions', () => {
    expect(isSplitAction(createAction('Dividends'))).toBe(false);
    expect(isSplitAction(createAction('Spinoff'))).toBe(false);
  });
});

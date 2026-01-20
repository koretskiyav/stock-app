import { describe, it, expect } from 'vitest';
import { mapToSplit } from './split';
import type { CorporateAction } from './corporateAction';

describe('mapToSplit', () => {
  const createAction = (description: string): CorporateAction => ({
    corporateActions: 'Corporate Actions',
    header: 'Data',
    assetCategory: 'Stocks',
    currency: 'USD',
    reportDate: '2023-01-01',
    dateTime: '2023-01-01, 10:00:00',
    description,
    quantity: 0,
    proceeds: 0,
    value: 0,
    realizedPL: 0,
    code: '',
  });

  it('should extract split ratio correctly', () => {
    const action = createAction('AAPL(US0378331005) Split 4 for 1');
    const result = mapToSplit(action);
    expect(result).toEqual({
      symbol: 'AAPL',
      ratio: 4,
      date: '2023-01-01, 10:00:00',
    });
  });

  it('should return null for invalid split description', () => {
    const action = createAction('Dividends 1.5');
    const result = mapToSplit(action);
    expect(result).toBeNull();
  });

  it('should return null for zero divisor', () => {
    const action = createAction('TEST Split 4 for 0');
    const result = mapToSplit(action);
    expect(result).toBeNull();
  });
});

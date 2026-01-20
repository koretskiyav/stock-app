import { describe, it, expect } from 'vitest';
import { calculateSplits } from './splits';
import type { CorporateAction } from './mappers/corporateAction';

describe('calculateSplits', () => {
  const createAction = (description: string, dateTime: string): CorporateAction => ({
    corporateActions: 'Corporate Actions',
    header: 'Data',
    assetCategory: 'Stocks',
    currency: 'USD',
    reportDate: dateTime.split(',')[0],
    dateTime: dateTime,
    description: description,
    quantity: 0,
    proceeds: 0,
    value: 0,
    realizedPL: 0,
    code: '',
  });

  it('should extract split ratio correctly', () => {
    const actions = [createAction('AAPL(US0378331005) Split 4 for 1', '2020-08-31, 20:25:00')];
    const splitsResult = calculateSplits(actions);
    expect(splitsResult).toHaveLength(1);
    expect(splitsResult[0]).toMatchObject({
      symbol: 'AAPL',
      ratio: 4,
      date: '2020-08-31, 20:25:00',
    });
  });

  it('should de-duplicate identical splits', () => {
    const actions = [
      createAction('AAPL(US0378331005) Split 4 for 1', '2020-08-31, 20:25:00'),
      createAction('AAPL(US0378331005) Split 4 for 1', '2020-08-31, 20:25:00'),
    ];
    const splitsResult = calculateSplits(actions);
    expect(splitsResult).toHaveLength(1);
  });
});

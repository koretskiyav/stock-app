import { describe, it, expect } from 'vitest';
import { calculateSpinoffs } from './spinoffs';
import type { CorporateAction } from './mappers/corporateAction';

describe('calculateSpinoffs', () => {
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

  it('should extract spinoff trades with price 0', () => {
    const actions = [
      createAction(
        'MMM(US88579Y1010) Spinoff  1 for 4 (SOLV, SOLVENTUM CORP-W/I, US83444M1018)',
        '2024-04-01, 20:25:00',
      ),
    ];
    actions[0].quantity = 1.25;

    const spinoffs = calculateSpinoffs(actions);
    expect(spinoffs).toHaveLength(1);
    expect(spinoffs[0]).toMatchObject({
      symbol: 'SOLV',
      quantity: 1.25,
      tPrice: 0,
      dateTime: '2024-04-01, 20:25:00',
    });
  });
});

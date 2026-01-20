import { describe, it, expect } from 'vitest';
import { isSpinoffAction } from './spinoff';
import type { CorporateAction } from '../mappers/corporateAction';

describe('isSpinoffAction', () => {
  const createAction = (header: string, description: string): CorporateAction => ({
    corporateActions: 'Corporate Actions',
    header,
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

  it('should return true for valid spinoff descriptions with Data header', () => {
    expect(
      isSpinoffAction(
        createAction(
          'Data',
          'MMM(US88579Y1010) Spinoff  1 for 4 (SOLV, SOLVENTUM CORP-W/I, US83444M1018)',
        ),
      ),
    ).toBe(true);
  });

  it('should return false if header is not Data', () => {
    expect(
      isSpinoffAction(
        createAction(
          'Header',
          'MMM(US88579Y1010) Spinoff  1 for 4 (SOLV, SOLVENTUM CORP-W/I, US83444M1018)',
        ),
      ),
    ).toBe(false);
  });

  it('should return false for other descriptions', () => {
    expect(isSpinoffAction(createAction('Data', 'Dividends'))).toBe(false);
    expect(isSpinoffAction(createAction('Data', 'AAPL Split 4 for 1'))).toBe(false);
  });
});

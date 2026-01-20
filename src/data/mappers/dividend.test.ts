import { describe, it, expect } from 'vitest';
import { mapDividend } from './dividend';
import type { RawDividend } from '../../db/types';

describe('mapDividend', () => {
  it('should map raw dividend and extract symbol correctly', () => {
    const raw: RawDividend = {
      Dividends: 'Dividends',
      Header: 'Data',
      Currency: 'USD',
      Date: '2023-08-31',
      Description: 'AAPL(US0378331005) Cash Dividend USD 0.24 per Share (Ordinary Dividend)',
      Amount: '100.50',
    };

    const result = mapDividend(raw);

    expect(result).toEqual({
      dividends: 'Dividends',
      header: 'Data',
      currency: 'USD',
      date: '2023-08-31',
      description: 'AAPL(US0378331005) Cash Dividend USD 0.24 per Share (Ordinary Dividend)',
      amount: 100.5,
      symbol: 'AAPL',
      perShare: 0.24,
      quantity: 419, // 100.5 / 0.24 = 418.75 -> rounded to 419
    });
  });

  it('should handle descriptions without standard symbol format', () => {
    const raw: RawDividend = {
      Dividends: 'Dividends',
      Header: 'Data',
      Currency: 'USD',
      Date: '2023-08-31',
      Description: 'Generic Dividend Payment',
      Amount: '50',
    };

    const result = mapDividend(raw);
    expect(result.symbol).toBe('');
  });
});

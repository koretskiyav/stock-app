import { describe, it, expect } from 'vitest';
import { mapTrade } from './trade';
import type { RawTrade } from '../../db/types';

describe('mapTrade', () => {
  it('should map raw trade to trade object correctly', () => {
    const raw: RawTrade = {
      Trades: 'Trade',
      Header: 'Data',
      DataDiscriminator: 'Order',
      'Asset Category': 'Stocks',
      Currency: 'USD',
      Symbol: 'AAPL',
      'Date/Time': '2023-08-31',
      Quantity: '10',
      'T-Price': '150.5',
      'C-Price': '155.0',
      Proceeds: '-1505.0',
      'Comm/Fee': '-1.5',
      Basis: '1506.5',
      'Realized P/L': '0',
      'MTM P/L': '45.0',
      Code: 'C',
    };

    const result = mapTrade(raw);

    expect(result).toEqual({
      trades: 'Trade',
      header: 'Data',
      dataDiscriminator: 'Order',
      assetCategory: 'Stocks',
      currency: 'USD',
      symbol: 'AAPL',
      dateTime: '2023-08-31',
      quantity: 10,
      tPrice: 150.5,
      cPrice: 155.0,
      proceeds: -1505.0,
      commFee: -1.5,
      basis: 1506.5,
      realizedPL: 0,
      mtmPL: 45.0,
      code: 'C',
    });
  });

  it('should handle missing numeric values with 0', () => {
    const raw: Partial<RawTrade> = {
      Symbol: 'AAPL',
    };

    const result = mapTrade(raw as RawTrade);
    expect(result.quantity).toBe(0);
    expect(result.tPrice).toBe(0);
  });
});

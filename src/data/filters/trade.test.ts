import { describe, it, expect } from 'vitest';
import { isStockTrade } from './trade';
import type { Trade } from '../mappers/trade';

describe('isStockTrade', () => {
  const createTrade = (assetCategory: string): Trade => ({
    trades: 'Trade',
    header: 'Data',
    dataDiscriminator: 'Order',
    assetCategory,
    currency: 'USD',
    symbol: 'TEST',
    dateTime: '2023-01-01',
    quantity: 10,
    tPrice: 100,
    cPrice: 100,
    proceeds: -1000,
    commFee: -1,
    basis: 1001,
    realizedPL: 0,
    mtmPL: 0,
    code: 'C',
  });

  it('should return true for Stocks', () => {
    expect(isStockTrade(createTrade('Stocks'))).toBe(true);
  });

  it('should return false for other asset categories', () => {
    expect(isStockTrade(createTrade('Options'))).toBe(false);
    expect(isStockTrade(createTrade('Cash'))).toBe(false);
  });
});

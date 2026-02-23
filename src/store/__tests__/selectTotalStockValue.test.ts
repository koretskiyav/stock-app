import { describe, it, expect } from 'vitest';
import { selectTotalStockValue } from '../selectors';
import { storeBuilder } from './testHelpers';

describe('selectTotalStockValue', () => {
  it('should calculate total stock value correctly', () => {
    const store = storeBuilder()
      .withTrades([
        { symbol: 'AAPL', quantity: 10 },
        { symbol: 'AAPL', quantity: 5 },
        { symbol: 'GOOGL', quantity: 2 },
      ])
      .withQuotes([
        { symbol: 'AAPL', price: 160 },
        { symbol: 'GOOGL', price: 1100 },
      ])
      .build();

    const result = selectTotalStockValue(store.getState());
    expect(result).toBe(4600);
  });

  it('should return 0 when no trades exist', () => {
    const store = storeBuilder().build();
    expect(selectTotalStockValue(store.getState())).toBe(0);
  });

  it('should ignore sold positions', () => {
    const store = storeBuilder()
      .withTrades([
        { symbol: 'AAPL', quantity: 10 },
        { symbol: 'AAPL', quantity: -10 },
      ])
      .withQuotes([{ symbol: 'AAPL', price: 170 }])
      .build();

    expect(selectTotalStockValue(store.getState())).toBe(0);
  });
});

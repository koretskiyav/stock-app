import { describe, it, expect } from 'vitest';
import { selectTotalPortfolioValue } from '../selectors';
import { storeBuilder } from './testHelpers';

describe('selectTotalPortfolioValue', () => {
  it('should calculate total portfolio value (stocks + cash) correctly', () => {
    const store = storeBuilder()
      .withTrades([{ symbol: 'AAPL', quantity: 10 }])
      .withQuotes([{ symbol: 'AAPL', price: 150 }])
      .withCash(1000)
      .build();

    // 10 * 150 + 1000 = 2500
    const result = selectTotalPortfolioValue(store.getState());
    expect(result).toBe(2500);
  });

  it('should return only cash if no stocks are held', () => {
    const store = storeBuilder().withCash(5000).build();
    expect(selectTotalPortfolioValue(store.getState())).toBe(5000);
  });

  it('should return 0 if portfolio is empty', () => {
    const store = storeBuilder().build();
    expect(selectTotalPortfolioValue(store.getState())).toBe(0);
  });
});

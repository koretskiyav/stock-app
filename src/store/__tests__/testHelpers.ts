import { type StoreApi } from 'zustand/vanilla';
import { createAppStore, type AppStore } from '../createAppStore';
import { type StatementsData, type Trade, type Dividend, type Split } from '../../services/parser';
import { type Quote } from '../../services/market';

export const emptyData: StatementsData = {
  trades: [],
  dividends: [],
  splits: [],
  cash: 0,
};

class StoreBuilder {
  private data: StatementsData;
  private quotes: Record<string, Quote>;

  constructor() {
    this.data = { ...emptyData };
    this.quotes = {};
  }

  withTrades(trades: Partial<Trade>[]) {
    this.data.trades = trades.map((t) => ({
      symbol: 'AAPL',
      dateTime: '2024-01-01, 10:00:00',
      quantity: 1,
      tPrice: 150,
      proceeds: 150,
      commFee: 0,
      basis: 150,
      realizedPL: 0,
      ...t,
    })) as Trade[];
    return this;
  }

  withDividends(dividends: Partial<Dividend>[]) {
    this.data.dividends = dividends.map((d) => ({
      date: '2024-01-01',
      amount: 10,
      symbol: 'AAPL',
      perShare: 1,
      quantity: 10,
      ...d,
    })) as Dividend[];
    return this;
  }

  withSplits(splits: Split[]) {
    this.data.splits = [...splits];
    return this;
  }

  withCash(cash: number) {
    this.data.cash = cash;
    return this;
  }

  withQuotes(quotes: Partial<Quote>[]) {
    quotes.forEach((q) => {
      const symbol = q.symbol || 'AAPL';
      this.quotes[symbol] = {
        symbol,
        price: 150,
        previousClose: 145,
        change: 5,
        changePercent: 0.034,
        timestamp: Date.now(),
        ...q,
      };
    });
    return this;
  }

  build(): StoreApi<AppStore> {
    const store = createAppStore(this.data);
    if (Object.keys(this.quotes).length > 0) {
      store.setState({ quotes: { ...this.quotes } });
    }
    return store;
  }
}

export const storeBuilder = () => new StoreBuilder();

export const createTestStore = (partialData: Partial<StatementsData> = {}) => {
  return storeBuilder()
    .withCash(partialData.cash || 0)
    .build();
};

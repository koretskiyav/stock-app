import { type StatementsData } from '../services/parser';
import { fetchPrices } from '../services/fetchPrices';
import { MarketService } from '../services/market';
import { createAppStore, STALE_TIMEOUT_MS } from './createAppStore';

// Helper logic for market symbols
export const getActiveSymbols = (trades: any[]) => {
  if (!trades.length) return [];
  const quantityMap = new Map<string, number>();
  for (const t of trades) {
    quantityMap.set(t.symbol, (quantityMap.get(t.symbol) || 0) + t.quantity);
  }
  return Array.from(quantityMap.entries())
    .filter(([_, qty]) => Math.abs(qty) > 0.0001)
    .map(([symbol]) => symbol);
};

export const getStaleSymbols = (activeSymbols: string[], quotes: Record<string, any>) => {
  const now = Date.now();
  return activeSymbols.filter((symbol) => {
    const quote = quotes[symbol];
    if (!quote || quote.timestamp === undefined) return true;
    return now - quote.timestamp > STALE_TIMEOUT_MS;
  });
};

export const initializeStore = (initialData: StatementsData) => {
  // 1. Create the store
  const store = createAppStore(initialData);

  // 2. Initialize MarketService with initial symbols
  const activeSymbols = getActiveSymbols(initialData.trades);
  const staleSymbols = getStaleSymbols(activeSymbols, store.getState().quotes);
  const market = new MarketService(activeSymbols);

  // 3. Set up market listeners
  market.onPriceChange((symbol, price) => {
    store.getState().updatePrice(symbol, price);
  });

  // 4. Trigger initial connection
  market.listen();

  if (staleSymbols.length > 0) {
    fetchPrices(staleSymbols).then((quotes) => {
      store.setState((state) => ({ quotes: { ...state.quotes, ...quotes } }));
    });
  }

  const cleanup = () => {
    market.destroy();
  };

  return { store, cleanup };
};

import { createStore } from 'zustand/vanilla';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { type Trade, type Dividend, type Split, type StatementsData } from '../services/parser';
import { type Quote } from '../services/market';

export const STALE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export interface AppState {
  trades: Trade[];
  dividends: Dividend[];
  splits: Split[];
  cash: number;
  quotes: Record<string, Quote>;
}

export interface AppActions {
  updatePrice: (symbol: string, price: number) => void;
}

export type AppStore = AppState & AppActions;

export const createAppStore = (initialData: StatementsData) => {
  return createStore<AppStore>()(
    devtools(
      persist(
        (set, get) => ({
          trades: initialData.trades,
          dividends: initialData.dividends,
          splits: initialData.splits,
          cash: initialData.cash || 0,
          quotes: {},

          updatePrice: (symbol: string, price: number) => {
            const state = get();
            const existing = state.quotes[symbol];

            if (
              !existing ||
              existing.price === price ||
              !existing.previousClose ||
              existing.previousClose <= 0
            ) {
              return;
            }

            const updated: Quote = {
              ...existing,
              price,
              change: price - existing.previousClose,
              changePercent: (price - existing.previousClose) / existing.previousClose,
              timestamp: Date.now(),
            };

            set((state) => ({ quotes: { ...state.quotes, [symbol]: updated } }), false, {
              type: 'updatePrice',
              symbol,
              price,
            });
          },
        }),
        {
          name: 'stock-app-storage',
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({ quotes: state.quotes }),
        },
      ),
      {
        name: 'StockAppStore',
        enabled: true,
      },
    ),
  );
};

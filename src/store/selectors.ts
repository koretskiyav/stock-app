import { useAppStore } from './AppStoreProvider';
import { type AppState } from './createAppStore';

export interface Lot {
  buyDate: string;
  quantity: number;
  buyPrice: number;
  costBasis: number;
  currentPrice?: number;
  unrealizedPL?: number;
  sellDate?: string;
  sellPrice?: number;
  realizedPL?: number;
}

export interface TickerSummary {
  symbol: string;
  netQuantity: number;
  realizedPL: number;
  avgBuyPrice: number;
  dividends: number;
  currentPrice?: number;
  marketValue?: number;
  unrealizedPL?: number;
  totalGain?: number;
  portfolioWeight?: number;
  dailyChange?: number;
  dailyChangePercent?: number;
}

export interface PortfolioTotals {
  realizedPL: number;
  marketValue: number;
  unrealizedPL: number;
  dividends: number;
  totalGain: number;
  dailyChange: number;
  dailyChangePercent: number;
}

// --- Base Selectors ---

export const selectTrades = (s: AppState) => s.trades;
export const selectDividends = (s: AppState) => s.dividends;
export const selectSplits = (s: AppState) => s.splits;
export const selectCash = (s: AppState) => s.cash;
export const selectQuotes = (s: AppState) => s.quotes;

// --- Memoization Helper ---

function memoize<State, Args extends any[], T>(
  fn: (s: State, ...args: Args) => T,
): (s: State, ...args: Args) => T {
  let lastState: State | undefined;
  let lastArgs: Args | undefined;
  let lastResult: T | undefined;

  return (s: State, ...args: Args) => {
    if (
      s === lastState &&
      lastArgs &&
      args.length === lastArgs.length &&
      args.every((a, i) => a === lastArgs![i])
    ) {
      return lastResult!;
    }
    lastState = s;
    lastArgs = args;
    lastResult = fn(s, ...args);
    return lastResult;
  };
}

// --- Calculated Selectors ---

/**
 * Aggregates trades and dividends into a base TickerSummary.
 * Includes FIFO average buy price calculation.
 */
export const selectTickerSummaries = memoize((s: AppState): TickerSummary[] => {
  const map = new Map<string, TickerSummary>();
  const lotsMap = new Map<string, { quantity: number; costBasis: number }[]>();

  const sortedTrades = [...s.trades].sort((a, b) => a.dateTime.localeCompare(b.dateTime));

  for (const trade of sortedTrades) {
    if (!map.has(trade.symbol)) {
      map.set(trade.symbol, {
        symbol: trade.symbol,
        netQuantity: 0,
        realizedPL: 0,
        avgBuyPrice: 0,
        dividends: 0,
      });
      lotsMap.set(trade.symbol, []);
    }

    const entry = map.get(trade.symbol)!;
    const lots = lotsMap.get(trade.symbol)!;

    if (trade.quantity > 0) {
      lots.push({
        quantity: trade.quantity,
        costBasis: Math.abs(trade.basis),
      });
    } else if (trade.quantity < 0) {
      let qtyToSell = Math.abs(trade.quantity);
      while (qtyToSell > 0 && lots.length > 0) {
        const oldestLot = lots[0];
        if (oldestLot.quantity <= qtyToSell) {
          qtyToSell -= oldestLot.quantity;
          lots.shift();
        } else {
          const sellRatio = qtyToSell / oldestLot.quantity;
          oldestLot.quantity -= qtyToSell;
          oldestLot.costBasis -= oldestLot.costBasis * sellRatio;
          qtyToSell = 0;
        }
      }
    }

    entry.netQuantity += trade.quantity;
    entry.realizedPL += trade.realizedPL;
  }

  for (const div of s.dividends) {
    if (map.has(div.symbol)) {
      map.get(div.symbol)!.dividends += div.amount;
    }
  }

  const result = Array.from(map.values());

  for (const entry of result) {
    const lots = lotsMap.get(entry.symbol)!;
    if (entry.netQuantity > 0 && lots.length > 0) {
      const remainingCostBasis = lots.reduce((sum, lot) => sum + lot.costBasis, 0);
      const remainingQuantity = lots.reduce((sum, lot) => sum + lot.quantity, 0);
      entry.avgBuyPrice = remainingCostBasis / remainingQuantity;
    } else {
      entry.avgBuyPrice = 0;
    }
  }

  return result.sort((a, b) => a.symbol.localeCompare(b.symbol));
});

export const selectTotalStockValue = (s: AppState) => {
  const quantities = s.trades.reduce(
    (acc, trade) => {
      acc[trade.symbol] = (acc[trade.symbol] || 0) + trade.quantity;
      return acc;
    },
    {} as Record<string, number>,
  );

  return Object.entries(quantities).reduce((total, [symbol, qty]) => {
    const price = s.quotes[symbol]?.price || 0;
    return total + qty * price;
  }, 0);
};

export const selectTotalPortfolioValue = (s: AppState) => {
  return selectTotalStockValue(s) + s.cash;
};

/**
 * Enriches TickerSummaries with real-time market data (unrealized P/L, portfolio weight, etc.)
 */
export const selectEnrichedSummaries = memoize((s: AppState): TickerSummary[] => {
  const baseSummaries = selectTickerSummaries(s);
  const totalPortfolioValue = selectTotalPortfolioValue(s);

  return baseSummaries.map((item) => {
    const quote = s.quotes[item.symbol];
    const currentPrice = quote?.price || 0;
    const marketValue = item.netQuantity * currentPrice;
    const unrealizedPL = marketValue - item.netQuantity * item.avgBuyPrice;
    const totalGain = item.realizedPL + unrealizedPL + item.dividends;

    return {
      ...item,
      currentPrice,
      marketValue,
      unrealizedPL,
      totalGain,
      dailyChange: item.netQuantity * (quote?.change ?? 0),
      dailyChangePercent: quote?.changePercent ?? 0,
      portfolioWeight: totalPortfolioValue > 0 ? marketValue / totalPortfolioValue : 0,
    };
  });
});

/**
 * Aggregates portfolio-wide totals.
 */
export const selectPortfolioTotals = memoize((s: AppState): PortfolioTotals => {
  const data = selectEnrichedSummaries(s);
  const dailyChange = data.reduce((sum, item) => sum + (item.dailyChange || 0), 0);
  const marketValue = data.reduce((sum, item) => sum + (item.marketValue || 0), 0);
  const prevValue = marketValue - dailyChange;

  return {
    realizedPL: data.reduce((sum, item) => sum + item.realizedPL, 0),
    marketValue,
    unrealizedPL: data.reduce((sum, item) => sum + (item.unrealizedPL || 0), 0),
    dividends: data.reduce((sum, item) => sum + (item.dividends || 0), 0),
    totalGain: data.reduce((sum, item) => sum + (item.totalGain || 0), 0),
    dailyChange,
    dailyChangePercent: prevValue > 0 ? dailyChange / prevValue : 0,
  };
});

/**
 * Calculates FIFO lots for a specific symbol including totals.
 */
export const selectTickerLots = memoize(
  (
    s: AppState,
    symbol: string,
  ): {
    openLots: Lot[];
    soldLots: Lot[];
    totals: {
      openQty: number;
      openCostBasis: number;
      openUnrealizedPL: number;
      soldQty: number;
      soldRealizedPL: number;
    };
  } => {
    const trades = s.trades.filter((t) => t.symbol === symbol);
    const currentPrice = s.quotes[symbol]?.price;

    const openLots: Lot[] = [];
    const soldLots: Lot[] = [];

    const sortedTrades = [...trades].sort((a, b) => a.dateTime.localeCompare(b.dateTime));

    for (const trade of sortedTrades) {
      if (trade.quantity > 0) {
        const totalCostBasis = Math.abs(trade.basis);
        openLots.push({
          buyDate: trade.dateTime,
          quantity: trade.quantity,
          buyPrice: totalCostBasis / trade.quantity,
          costBasis: totalCostBasis,
        });
      } else if (trade.quantity < 0) {
        const netProceedsForTrade = trade.proceeds + trade.commFee;
        const netSellPrice = netProceedsForTrade / Math.abs(trade.quantity);
        let qtyToSell = Math.abs(trade.quantity);

        while (qtyToSell > 0 && openLots.length > 0) {
          const oldestLot = openLots[0];
          if (oldestLot.quantity <= qtyToSell) {
            qtyToSell -= oldestLot.quantity;
            const soldLot = openLots.shift()!;
            soldLots.push({
              ...soldLot,
              sellDate: trade.dateTime,
              sellPrice: netSellPrice,
              realizedPL: (netSellPrice - soldLot.buyPrice) * soldLot.quantity,
            });
          } else {
            const sellQty = qtyToSell;
            const sellRatio = sellQty / oldestLot.quantity;

            const soldPart: Lot = {
              buyDate: oldestLot.buyDate,
              quantity: sellQty,
              buyPrice: oldestLot.buyPrice,
              costBasis: oldestLot.costBasis * sellRatio,
              sellDate: trade.dateTime,
              sellPrice: netSellPrice,
              realizedPL: (netSellPrice - oldestLot.buyPrice) * sellQty,
            };
            soldLots.push(soldPart);

            oldestLot.quantity -= sellQty;
            oldestLot.costBasis -= oldestLot.costBasis * sellRatio;
            qtyToSell = 0;
          }
        }
      }
    }

    if (currentPrice !== undefined) {
      openLots.forEach((lot) => {
        lot.currentPrice = currentPrice;
        lot.unrealizedPL = currentPrice * lot.quantity - lot.costBasis;
      });
    }

    return {
      openLots,
      soldLots,
      totals: {
        openQty: openLots.reduce((acc, l) => acc + l.quantity, 0),
        openCostBasis: openLots.reduce((acc, l) => acc + l.costBasis, 0),
        openUnrealizedPL: openLots.reduce((acc, l) => acc + (l.unrealizedPL || 0), 0),
        soldQty: soldLots.reduce((acc, l) => acc + l.quantity, 0),
        soldRealizedPL: soldLots.reduce((acc, l) => acc + (l.realizedPL || 0), 0),
      },
    };
  },
);

/**
 * Aggregates trade and dividend totals for a specific symbol.
 */
export const selectTickerTradeTotals = memoize((s: AppState, symbol: string) => {
  const trades = s.trades.filter((t) => t.symbol === symbol);
  const dividends = s.dividends.filter((d) => d.symbol === symbol);

  return {
    allTradesQty: trades.reduce((acc, t) => acc + Math.abs(t.quantity), 0),
    allTradesProceeds: trades.reduce((acc, t) => acc + t.proceeds, 0),
    allTradesFees: trades.reduce((acc, t) => acc + t.commFee, 0),
    allTradesRealizedPL: trades.reduce((acc, t) => acc + t.realizedPL, 0),
    totalDividends: dividends.reduce((acc, d) => acc + d.amount, 0),
  };
});

// --- Specialized Selector Hooks for performance ---

export const useTrades = () => useAppStore(selectTrades);
export const useDividends = () => useAppStore(selectDividends);
export const useSplits = () => useAppStore(selectSplits);
export const useCash = () => useAppStore(selectCash);
export const useQuotes = () => useAppStore(selectQuotes);
export const useTotalStockValue = () => useAppStore(selectTotalStockValue);
export const useTotalPortfolioValue = () => useAppStore(selectTotalPortfolioValue);
export const useTickerSummaries = () => useAppStore(selectTickerSummaries);
export const useEnrichedSummaries = () => useAppStore(selectEnrichedSummaries);
export const usePortfolioTotals = () => useAppStore(selectPortfolioTotals);

/**
 * Symbol-specific hooks.
 */
export const useTickerLots = (symbol: string) => useAppStore((s) => selectTickerLots(s, symbol));
export const useTickerTradeTotals = (symbol: string) =>
  useAppStore((s) => selectTickerTradeTotals(s, symbol));
export const useTickerSummary = (symbol: string) =>
  useAppStore((s) => selectEnrichedSummaries(s).find((item) => item.symbol === symbol));
export const useSymbolTrades = (symbol: string) =>
  useAppStore((s) => s.trades.filter((t) => t.symbol === symbol));
export const useSymbolDividends = (symbol: string) =>
  useAppStore((s) => s.dividends.filter((d) => d.symbol === symbol));
export const useSymbolSplits = (symbol: string) =>
  useAppStore((s) => s.splits.filter((sl) => sl.symbol === symbol));

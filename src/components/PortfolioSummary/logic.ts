import type { Trade } from '../../data/trades';
import type { Dividend } from '../../data/dividends';

export interface TickerSummary {
  symbol: string;
  buyQuantity: number;
  buySum: number;
  sellQuantity: number;
  sellSum: number;
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

export function calculatePortfolioSummary(
  trades: Trade[],
  dividends: Dividend[] = [],
): TickerSummary[] {
  const map = new Map<string, TickerSummary>();
  const lotsMap = new Map<string, { quantity: number; costBasis: number }[]>();

  // Ensure trades are sorted by date
  const sortedTrades = [...trades].sort((a, b) => a.dateTime.localeCompare(b.dateTime));

  for (const trade of sortedTrades) {
    if (!map.has(trade.symbol)) {
      map.set(trade.symbol, {
        symbol: trade.symbol,
        buyQuantity: 0,
        buySum: 0,
        sellQuantity: 0,
        sellSum: 0,
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
      entry.buyQuantity += trade.quantity;
      entry.buySum += Math.abs(trade.basis);
      // Add new lot: price per share = basis / quantity
      lots.push({
        quantity: trade.quantity,
        costBasis: Math.abs(trade.basis),
      });
    } else if (trade.quantity < 0) {
      entry.sellQuantity += Math.abs(trade.quantity);
      entry.sellSum += Math.abs(trade.basis);

      // FIFO: Remove shares from the oldest lots
      let qtyToSell = Math.abs(trade.quantity);
      while (qtyToSell > 0 && lots.length > 0) {
        const oldestLot = lots[0];
        if (oldestLot.quantity <= qtyToSell) {
          qtyToSell -= oldestLot.quantity;
          lots.shift(); // Remove fully sold lot
        } else {
          // partially sell this lot
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

  for (const div of dividends) {
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
}

export type SortConfig = {
  key: keyof TickerSummary;
  direction: 'asc' | 'desc';
};

export function sortSummary(data: TickerSummary[], sortConfig: SortConfig): TickerSummary[] {
  return [...data].sort((a, b) => {
    const aValue = a[sortConfig.key] ?? 0;
    const bValue = b[sortConfig.key] ?? 0;

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

export function calculateTotals(data: TickerSummary[]) {
  return {
    realizedPL: data.reduce((sum, item) => sum + item.realizedPL, 0),
    marketValue: data.reduce((sum, item) => sum + (item.marketValue || 0), 0),
    unrealizedPL: data.reduce((sum, item) => sum + (item.unrealizedPL || 0), 0),
    dividends: data.reduce((sum, item) => sum + (item.dividends || 0), 0),
    totalGain: data.reduce((sum, item) => sum + (item.totalGain || 0), 0),
    dailyChange: data.reduce((sum, item) => sum + (item.dailyChange || 0), 0),
  };
}

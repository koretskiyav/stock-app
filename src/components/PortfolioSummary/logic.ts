import type { Trades as Trade } from "../../data/trades";

export interface TickerSummary {
  symbol: string;
  buyQuantity: number;
  buySum: number;
  sellQuantity: number;
  sellSum: number;
  netQuantity: number;
  realizedPL: number;
}

export function calculatePortfolioSummary(trades: Trade[]): TickerSummary[] {
  const map = new Map<string, TickerSummary>();

  for (const trade of trades) {
    if (!map.has(trade.symbol)) {
      map.set(trade.symbol, {
        symbol: trade.symbol,
        buyQuantity: 0,
        buySum: 0,
        sellQuantity: 0,
        sellSum: 0,
        netQuantity: 0,
        realizedPL: 0,
      });
    }

    const entry = map.get(trade.symbol)!;

    if (trade.quantity > 0) {
      entry.buyQuantity += trade.quantity;
      entry.buySum += Math.abs(trade.proceeds);
    } else {
      entry.sellQuantity += Math.abs(trade.quantity);
      entry.sellSum += Math.abs(trade.proceeds);
    }

    entry.netQuantity += trade.quantity;
    entry.realizedPL += trade.realizedPL;
  }

  return Array.from(map.values()).sort((a, b) =>
    a.symbol.localeCompare(b.symbol)
  );
}

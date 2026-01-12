import type { Trades as Trade } from "../../data/trades";

export interface TickerSummary {
  symbol: string;
  buyQuantity: number;
  buySum: number;
  sellQuantity: number;
  sellSum: number;
  netQuantity: number;
  realizedPL: number;
  avgBuyPrice: number;
  currentPrice?: number;
  marketValue?: number;
  unrealizedPL?: number;
}

export function calculatePortfolioSummary(trades: Trade[]): TickerSummary[] {
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
        costBasis: Math.abs(trade.basis) 
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

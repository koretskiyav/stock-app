import type { Trade } from '../../data/trades';

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

export function calculateLots(trades: Trade[], currentPrice?: number) {
  const openLots: Lot[] = [];
  const soldLots: Lot[] = [];

  // Sort trades by date to ensure FIFO
  const sortedTrades = [...trades].sort((a, b) => a.dateTime.localeCompare(b.dateTime));

  for (const trade of sortedTrades) {
    if (trade.quantity > 0) {
      // It's a BUY
      // costBasis in IBKR (trade.basis) usually includes commissions for BUYs
      const totalCostBasis = Math.abs(trade.basis);
      openLots.push({
        buyDate: trade.dateTime,
        quantity: trade.quantity,
        buyPrice: totalCostBasis / trade.quantity, // Price adjusted for fees
        costBasis: totalCostBasis,
      });
    } else if (trade.quantity < 0) {
      // It's a SELL
      // Net proceeds for a sell = Proceeds (gross) + Comm/Fee (record is negative)
      const netProceedsForTrade = trade.proceeds + trade.commFee;
      const netSellPrice = netProceedsForTrade / Math.abs(trade.quantity);
      let qtyToSell = Math.abs(trade.quantity);

      while (qtyToSell > 0 && openLots.length > 0) {
        const oldestLot = openLots[0];
        if (oldestLot.quantity <= qtyToSell) {
          // Fully sell this lot
          qtyToSell -= oldestLot.quantity;
          const soldLot = openLots.shift()!;
          soldLots.push({
            ...soldLot,
            sellDate: trade.dateTime,
            sellPrice: netSellPrice,
            // Realized PL = sellQty * (netSellPrice - adjustedBuyPrice)
            realizedPL: (netSellPrice - soldLot.buyPrice) * soldLot.quantity,
          });
        } else {
          // Partially sell this lot
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

  // Calculate unrealized PL for open lots
  if (currentPrice !== undefined) {
    openLots.forEach((lot) => {
      lot.currentPrice = currentPrice;
      // Unrealized PL = (Current Price * Quantity) - Total Cost Basis (which includes buy fee)
      lot.unrealizedPL = currentPrice * lot.quantity - lot.costBasis;
    });
  }

  return { openLots, soldLots };
}

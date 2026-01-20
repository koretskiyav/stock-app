import {
  calculatePortfolioSummary,
  type TickerSummary,
} from '../components/PortfolioSummary/logic';
import { getReportedPrices } from '../data/portfolio';
import type { Trade } from '../data/trades';

import { useMarketPrices } from './useMarketPrices';

import { dividends } from '../data/dividends';

export function usePortfolioSummary(trades: Trade[], cash: number) {
  const baseSummary = calculatePortfolioSummary(trades, dividends);

  const activeSymbols = baseSummary
    .filter((item) => item.netQuantity > 0)
    .map((item) => item.symbol);

  const prices = useMarketPrices(activeSymbols);
  const reportedPrices = getReportedPrices();

  const summary: TickerSummary[] = baseSummary.map((item) => {
    const currentPrice = prices.get(item.symbol) ?? reportedPrices.get(item.symbol) ?? 0;
    const marketValue = item.netQuantity * currentPrice;
    const unrealizedPL = marketValue - item.netQuantity * item.avgBuyPrice;
    const totalGain = item.realizedPL + unrealizedPL + item.dividends;

    return {
      ...item,
      currentPrice,
      marketValue,
      unrealizedPL,
      totalGain,
    };
  });

  const stockValue = summary.reduce((sum, item) => sum + (item.marketValue || 0), 0);
  const totalValue = stockValue + cash;

  return summary.map((item) => ({
    ...item,
    portfolioWeight: totalValue > 0 ? (item.marketValue || 0) / totalValue : 0,
  }));
}

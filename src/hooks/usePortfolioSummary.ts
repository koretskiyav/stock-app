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
    .filter((item) => item.netQuantity !== 0)
    .map((item) => item.symbol);

  const quotes = useMarketPrices(activeSymbols);
  const reportedPrices = getReportedPrices();

  const summary: TickerSummary[] = baseSummary.map((item) => {
    const quote = quotes.get(item.symbol);
    const currentPrice = quote?.price ?? reportedPrices.get(item.symbol) ?? 0;
    const marketValue = item.netQuantity * currentPrice;
    const unrealizedPL = marketValue - item.netQuantity * item.avgBuyPrice;
    const totalGain = item.realizedPL + unrealizedPL + item.dividends;

    const dailyChange = item.netQuantity * (quote?.change ?? 0);
    const dailyChangePercent = quote?.changePercent ?? 0;

    return {
      ...item,
      currentPrice,
      marketValue,
      unrealizedPL,
      totalGain,
      dailyChange,
      dailyChangePercent,
    };
  });

  const stockValue = summary.reduce((sum, item) => sum + (item.marketValue || 0), 0);
  const totalValue = stockValue + cash;

  return summary.map((item) => ({
    ...item,
    portfolioWeight: totalValue > 0 ? (item.marketValue || 0) / totalValue : 0,
  }));
}

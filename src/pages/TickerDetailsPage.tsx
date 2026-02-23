import { useParams } from 'react-router-dom';
import { TickerDetails } from '../components/TickerDetails/TickerDetails';
import {
  useTickerSummary,
  useTickerLots,
  useSymbolTrades,
  useSymbolDividends,
  useSymbolSplits,
  useTickerTradeTotals,
} from '../store/selectors';

export const TickerDetailsPage = () => {
  const { symbol } = useParams<{ symbol: string }>();

  if (!symbol) {
    return <div>Symbol not found</div>;
  }

  const tickerSummary = useTickerSummary(symbol);
  const trades = useSymbolTrades(symbol);
  const dividends = useSymbolDividends(symbol);
  const splits = useSymbolSplits(symbol);
  const { openLots, soldLots, totals: lotTotals } = useTickerLots(symbol);
  const tradeTotals = useTickerTradeTotals(symbol);

  return (
    <TickerDetails
      symbol={symbol}
      backUrl="/"
      trades={trades}
      dividends={dividends}
      splits={splits}
      openLots={openLots}
      soldLots={soldLots}
      summary={tickerSummary}
      lotTotals={lotTotals}
      tradeTotals={tradeTotals}
    />
  );
};

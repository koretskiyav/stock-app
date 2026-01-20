import { useState, useEffect } from 'react';
import { fetchBatchQuotes } from '../services/marketData';

export function useMarketPrices(symbols: string[]) {
  const [prices, setPrices] = useState<Map<string, number>>(new Map());

  const symbolsKey = symbols.join(',');
  useEffect(() => {
    const symbolsArray = symbolsKey.split(',').filter(Boolean);
    if (symbolsArray.length > 0) {
      fetchBatchQuotes(symbolsArray).then(setPrices);
    }
  }, [symbolsKey]);

  return prices;
}

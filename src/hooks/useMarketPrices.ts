import { useState, useEffect } from 'react';
import { fetchBatchQuotes } from '../services/marketData';

export function useMarketPrices(symbols: string[]) {
  const [prices, setPrices] = useState<Map<string, number>>(new Map());

  const symbolsKey = symbols.join(',');
  useEffect(() => {
    if (symbols.length > 0) {
      fetchBatchQuotes(symbols).then(setPrices);
    }
  }, [symbolsKey, symbols]);

  return prices;
}

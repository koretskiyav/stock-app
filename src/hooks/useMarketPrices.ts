import { useState, useEffect } from 'react';
import { fetchBatchQuotes, updateCachedPrice } from '../services/marketData';
import { marketDataStream } from '../services/marketDataStream';

export function useMarketPrices(symbols: string[]) {
  const [prices, setPrices] = useState<Map<string, number>>(new Map());

  const symbolsKey = symbols.join(',');

  useEffect(() => {
    const symbolsArray = symbolsKey.split(',').filter(Boolean);
    if (symbolsArray.length === 0) return;

    // Initial fetch
    fetchBatchQuotes(symbolsArray).then((initialPrices) => {
      setPrices((prev) => {
        const next = new Map(prev);
        initialPrices.forEach((price, symbol) => {
          next.set(symbol, price);
        });
        return next;
      });
    });

    // Subscribe to real-time updates
    const handlePriceUpdate = (symbol: string, price: number) => {
      // Save to cache
      updateCachedPrice(symbol, price);

      setPrices((prev) => {
        const next = new Map(prev);
        next.set(symbol, price);
        return next;
      });
    };

    symbolsArray.forEach((symbol) => {
      marketDataStream.subscribe(symbol, handlePriceUpdate);
    });

    return () => {
      symbolsArray.forEach((symbol) => {
        marketDataStream.unsubscribe(symbol, handlePriceUpdate);
      });
    };
  }, [symbolsKey]);

  return prices;
}

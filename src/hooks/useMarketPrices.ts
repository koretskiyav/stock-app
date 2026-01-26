import { useState, useEffect } from 'react';
import { fetchBatchQuotes, updateCachedPrice, type Quote } from '../services/marketData';
import { marketDataStream } from '../services/marketDataStream';

export function useMarketPrices(symbols: string[]) {
  const [quotes, setQuotes] = useState<Map<string, Quote>>(new Map());

  const symbolsKey = symbols.join(',');

  useEffect(() => {
    const symbolsArray = symbolsKey.split(',').filter(Boolean);
    if (symbolsArray.length === 0) return;

    // Initial fetch
    fetchBatchQuotes(symbolsArray).then((initialQuotes) => {
      setQuotes((prev) => {
        const next = new Map(prev);
        initialQuotes.forEach((quote, symbol) => {
          next.set(symbol, quote);
        });
        return next;
      });
    });

    // Subscribe to real-time updates
    const handlePriceUpdate = (symbol: string, price: number) => {
      // Save to cache and update state
      updateCachedPrice(symbol, price);

      setQuotes((prev) => {
        const next = new Map(prev);
        const existing = next.get(symbol);
        if (existing) {
          const change = price - existing.previousClose;
          const changePercent = (change / existing.previousClose) * 100;
          next.set(symbol, { ...existing, price, change, changePercent });
        } else {
          // If we don't have existing quote, it's safer to not update yet
          // or create a partial one. But fetchBatchQuotes should have run already.
          next.set(symbol, {
            symbol,
            price,
            previousClose: price,
            change: 0,
            changePercent: 0,
          });
        }
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

  return quotes;
}

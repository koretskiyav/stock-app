import { cacheService } from './cacheService';

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

export interface Quote {
  symbol: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
}

/**
 * Fetch a single quote from Finnhub with localStorage caching.
 */
export async function fetchQuote(symbol: string): Promise<Quote | null> {
  // Try to load from cache
  const cached = cacheService.get<Quote>(symbol);
  if (cached) {
    return cached;
  }

  if (!API_KEY || API_KEY === 'your_finnhub_key_here') {
    console.warn('Finnhub API key not set.');
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`);
    if (response.status === 403) {
      console.warn(`Finnhub quote API 403 for ${symbol}. Plan restriction?`);
      return null;
    }
    const data = await response.json();

    if (data.c && data.c !== 0) {
      // Calculate missing fields or normalize
      const change =
        data.d !== null && data.d !== undefined ? data.d : data.pc ? data.c - data.pc : 0;
      const changePercent =
        data.dp !== null && data.dp !== undefined
          ? data.dp / 100
          : data.pc
            ? (data.c - data.pc) / data.pc
            : 0;

      const quote: Quote = {
        symbol,
        price: data.c,
        previousClose: data.pc || data.c - (data.d || 0),
        change,
        changePercent,
      };

      // Store in cache
      cacheService.set(symbol, quote);

      return quote;
    }
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
  }
  return null;
}

/**
 * Fetch batch quotes in parallel.
 */
export async function fetchBatchQuotes(symbols: string[]): Promise<Map<string, Quote>> {
  const result = new Map<string, Quote>();
  if (!API_KEY || symbols.length === 0) return result;

  const promises = symbols.map((s) => fetchQuote(s));
  const quotes = await Promise.all(promises);

  quotes.forEach((q) => {
    if (q) result.set(q.symbol, q);
  });

  return result;
}

/**
 * Get the latest cached price from localStorage, even if expired.
 */
export function getCachedPrice(symbol: string): number | null {
  const cached = cacheService.getLatest<Quote>(symbol);
  return cached?.price ?? null;
}

/**
 * Update the cache with a new price (e.g., from WebSocket).
 */
export function updateCachedPrice(symbol: string, price: number): void {
  cacheService.update<Quote>(symbol, (existing) => {
    if (existing) {
      const change = price - existing.previousClose;
      const changePercent = existing.previousClose !== 0 ? change / existing.previousClose : 0;
      return { ...existing, price, change, changePercent };
    }
    return {
      symbol,
      price,
      previousClose: price,
      change: 0,
      changePercent: 0,
    };
  });
}

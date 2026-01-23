import { cacheService } from './cacheService';

const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;
const BASE_URL = 'https://finnhub.io/api/v1';

export interface Quote {
  symbol: string;
  price: number;
}

export interface Financials {
  peTTM?: number;
  peForward?: number;
  dividendYield?: number;
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
    const data = await response.json();

    if (data.c && data.c !== 0) {
      const quote: Quote = { symbol, price: data.c };

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
 * While this makes multiple HTTP requests, it is grouped in one action.
 * Finnhub's high rate limit (60/min) makes this viable for portfolios.
 */
export async function fetchBatchQuotes(symbols: string[]): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  if (!API_KEY || symbols.length === 0) return result;

  // We fetch in parallel using Promise.all
  // Note: If you have > 30 symbols, we might want to chunk this to avoid bursting.
  const promises = symbols.map((s) => fetchQuote(s));
  const quotes = await Promise.all(promises);

  quotes.forEach((q) => {
    if (q) result.set(q.symbol, q.price);
  });

  return result;
}

/**
 * Fetch basic financials (PE, Forward PE, etc.)
 * Supports your future requirement for fundamental data.
 */
export async function fetchFinancials(symbol: string): Promise<Financials | null> {
  if (!API_KEY) return null;

  try {
    const response = await fetch(
      `${BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${API_KEY}`,
    );
    const data = await response.json();

    if (data.metric) {
      return {
        peTTM: data.metric.peTTM,
        peForward: data.metric.peForwardEmpty ? undefined : data.metric['peForward'], // Finnhub naming can be tricky
        dividendYield: data.metric.dividendYieldIndicatedAnnual,
      };
    }
  } catch (error) {
    console.error(`Error fetching financials for ${symbol}:`, error);
  }
  return null;
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
      return { ...existing, price };
    }
    return { symbol, price };
  });
}

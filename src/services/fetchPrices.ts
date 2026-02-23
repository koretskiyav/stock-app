import { type Quote } from './market';

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

/**
 * Fetches batch quotes for a list of symbols from Finnhub API.
 * This is a standalone utility function decoupled from any class-based state.
 */
export async function fetchPrices(symbols: string[]): Promise<Record<string, Quote>> {
  if (!FINNHUB_KEY) {
    console.warn('[fetchPrices] No Finnhub API key found.');
    return {};
  }

  const freshQuotes: Record<string, Quote> = {};

  console.log(`[fetchPrices] Fetching batch quotes for ${symbols.length} symbols...`);

  for (const symbol of symbols) {
    try {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`,
      );

      if (response.status === 429) {
        console.warn(`[fetchPrices] Rate limit hit for ${symbol}, skipping remaining batch.`);
        break; // Stop batch if rate limited
      }

      const data = await response.json();
      if (data.c && data.pc) {
        freshQuotes[symbol] = {
          symbol,
          price: data.c,
          change: data.d,
          changePercent: (data.dp || 0) / 100,
          previousClose: data.pc,
          timestamp: Date.now(),
        };
      }
    } catch (e) {
      console.error(`[fetchPrices] Failed to fetch quote for ${symbol}`, e);
    }
  }

  return freshQuotes;
}

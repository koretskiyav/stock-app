import { z } from 'zod';
import Papa from 'papaparse';

export const TradeSchema = z.object({
  symbol: z.string(),
  dateTime: z.string(),
  quantity: z.number(),
  tPrice: z.number(),
  proceeds: z.number(),
  commFee: z.number(),
  basis: z.number(),
  realizedPL: z.number(),
});

export type Trade = z.infer<typeof TradeSchema>;

export const DividendSchema = z.object({
  date: z.string(),
  amount: z.number(),
  symbol: z.string(),
  perShare: z.number(),
  quantity: z.number(),
});

export type Dividend = z.infer<typeof DividendSchema>;

export const SplitSchema = z.object({
  symbol: z.string(),
  ratio: z.number(),
  date: z.string(),
});

export type Split = z.infer<typeof SplitSchema>;

export const StatementsDataSchema = z.object({
  trades: z.array(TradeSchema),
  splits: z.array(SplitSchema),
  dividends: z.array(DividendSchema),
  cash: z.number(),
});

export type StatementsData = z.infer<typeof StatementsDataSchema>;

const SPLIT_REGEX = /(.+)\s+Split\s+(\d+)\s+FOR\s+(\d+)\s*/i;
const SPINOFF_REGEX = /^.*\(.*\)\s+Spinoff\s+.*\(([^,]+),/;

const SYMBOL_RENAMES: Record<string, string> = {
  FRC: 'FRCB',
  FB: 'META',
};

export function renameSymbol(symbol: string): string {
  if (!symbol) return '';
  const cleanSymbol = symbol.split('(')[0].trim().toUpperCase();
  return SYMBOL_RENAMES[cleanSymbol] || cleanSymbol;
}

function mapToTrade(item: Record<string, string>): Trade {
  return {
    symbol: renameSymbol(item['Symbol']),
    dateTime: item['Date/Time'],
    quantity: Number(item['Quantity'] || 0),
    tPrice: Number(item['T-Price'] || 0),
    proceeds: Number(item['Proceeds'] || 0),
    commFee: Number(item['Comm/Fee'] || 0),
    basis: Number(item['Basis'] || 0),
    realizedPL: Number(item['Realized P/L'] || 0),
  };
}

function mapToSplit(item: Record<string, string>): Split | null {
  const description = item['Description'] || '';
  const match = description.match(SPLIT_REGEX);
  if (!match) return null;

  // Try to find symbol in parentheses first (e.g., "... (GOOG)")
  const parenMatch = description.match(/\(([^)]+)\)$/);
  const symbol = parenMatch
    ? renameSymbol(parenMatch[1])
    : description.match(/^([A-Z.]+)/)
      ? renameSymbol(description.match(/^([A-Z.]+)/)![1])
      : renameSymbol(match[1].trim());

  const x = parseInt(match[2], 10);
  const y = parseInt(match[3], 10);

  if (isNaN(x) || isNaN(y) || y === 0) return null;

  return {
    symbol,
    ratio: x / y,
    date: item['Date/Time'],
  };
}

function mapToSpinoff(item: Record<string, string>): Trade | null {
  const description = item['Description'] || '';
  const match = description.match(SPINOFF_REGEX);
  const quantity = Number(item['Quantity'] || 0);
  if (!match || quantity === 0) return null;

  return {
    symbol: match[1],
    dateTime: item['Date/Time'],
    quantity: quantity,
    tPrice: 0,
    proceeds: 0,
    commFee: 0,
    basis: 0,
    realizedPL: 0,
  };
}

function mapToDividend(item: Record<string, string>): Dividend {
  const description = item['Description'] || '';
  const symbolMatch = description.match(/^([A-Z.]+)\(/);
  const symbol = symbolMatch ? renameSymbol(symbolMatch[1]) : '';

  const divPerShareMatch = description.match(/USD\s+([\d.]+)\s+per Share/);
  const perShare = divPerShareMatch ? parseFloat(divPerShareMatch[1]) : 0;

  const amount = Number(item['Amount'] || 0);
  const rawQuantity = perShare > 0 ? amount / perShare : 0;
  const quantity = Math.round(rawQuantity);

  return {
    date: item['Date'],
    amount,
    symbol,
    perShare,
    quantity,
  };
}

/**
 * Reads all CSV contents from the statements directory.
 */
export function getAllStatementContents(): string[] {
  // Dynamically import all CSV files from the statements directory using Vite's glob import.
  const csvModules = import.meta.glob('../statements/*.csv', {
    query: '?raw',
    eager: true,
  });

  return Object.values(csvModules).flatMap((module) => {
    const content = typeof module === 'string' ? module : (module as { default: string }).default;
    return content;
  });
}

export function parseStatements(csvContents: string[]): StatementsData {
  const tradesMap = new Map<string, Trade>();
  const splitsMap = new Map<string, Split>();
  const spinoffs: Trade[] = [];
  const dividendsMap = new Map<string, Dividend>();
  let cash = 0;

  for (const content of csvContents) {
    const results = Papa.parse<string[]>(content, {
      skipEmptyLines: 'greedy',
    });

    const rows = results.data;
    const sectionHeaders: Record<string, string[]> = {};

    for (const values of rows) {
      if (values.length < 2) continue;

      const section = values[0];
      const headerType = values[1];

      if (headerType === 'Header') {
        sectionHeaders[section] = values;
        continue;
      }

      if (headerType === 'Data') {
        const headers = sectionHeaders[section];
        if (!headers) continue;

        const data: Record<string, string> = {};
        for (let i = 0; i < headers.length; i++) {
          let header = headers[i];
          if (header === 'T. Price') header = 'T-Price';
          if (header === 'C. Price') header = 'C-Price';
          data[header] = values[i] || '';
        }

        if (
          section === 'Trades' &&
          data['Asset Category'] === 'Stocks' &&
          (data['DataDiscriminator'] === 'Order' || data['DataDiscriminator'] === 'Trade')
        ) {
          const rawTrade = mapToTrade(data);
          const trade = TradeSchema.parse(rawTrade);
          const key = `${trade.symbol}|${trade.dateTime}|${trade.quantity}|${trade.tPrice}`;
          if (!tradesMap.has(key)) {
            tradesMap.set(key, trade);
          }
        } else if (section === 'Corporate Actions') {
          const rawSplit = mapToSplit(data);
          if (rawSplit) {
            const split = SplitSchema.parse(rawSplit);
            const key = `${split.symbol}|${split.date}`;
            if (!splitsMap.has(key)) {
              splitsMap.set(key, split);
            }
          } else {
            const rawSpinoff = mapToSpinoff(data);
            if (rawSpinoff) {
              const spinoff = TradeSchema.parse(rawSpinoff);
              spinoffs.push(spinoff);
            }
          }
        } else if (section === 'Dividends') {
          const rawDiv = mapToDividend(data);
          const div = DividendSchema.parse(rawDiv);
          const key = `${div.symbol}|${div.date}|${div.amount}`;
          if (!dividendsMap.has(key)) {
            dividendsMap.set(key, div);
          }
        } else if (section === 'Net Asset Value' && data['Asset Class'] === 'Cash') {
          cash = Number(data['Current Total'] || 0);
        }
      }
    }
  }

  const tradesArr = Array.from(tradesMap.values());
  const dividendsArr = Array.from(dividendsMap.values());

  const processedTrades = [...tradesArr, ...spinoffs].map((trade) => {
    let adjustedQuantity = trade.quantity;
    let adjustedTPrice = trade.tPrice;

    const relevantSplits = Array.from(splitsMap.values()).filter(
      (s) => s.symbol === trade.symbol && s.date > trade.dateTime,
    );

    for (const split of relevantSplits) {
      adjustedQuantity *= split.ratio;
      adjustedTPrice /= split.ratio;
    }

    return {
      ...trade,
      quantity: adjustedQuantity,
      tPrice: adjustedTPrice,
    };
  });

  return StatementsDataSchema.parse({
    trades: processedTrades,
    splits: Array.from(splitsMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
    dividends: dividendsArr,
    cash,
  });
}

import { corporateActions, type CorporateActions } from "../data/corporateActions";
import type { Trades as Trade } from "../data/trades";

interface Split {
  symbol: string;
  ratio: number;
  date: string;
}

export function getSplits(actions: CorporateActions[] = corporateActions): Split[] {
  const splitsMap = new Map<string, Split>();
  const splitRegex = /^([A-Z.]+)\(.*\)\s+Split\s+(\d+)\s+for\s+(\d+)/;

  for (const action of actions) {
    const match = action.description.match(splitRegex);
    if (match) {
      const symbol = match[1];
      const x = parseInt(match[2], 10);
      const y = parseInt(match[3], 10);
      if (!isNaN(x) && !isNaN(y) && y !== 0) {
        const ratio = x / y;
        const date = action.dateTime;
        // Key by symbol, date, and ratio to avoid duplicates for the same split action
        const key = `${symbol}|${date}|${ratio}`;
        if (!splitsMap.has(key)) {
          splitsMap.set(key, { symbol, ratio, date });
        }
      }
    }
  }

  return Array.from(splitsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getSpinoffTrades(actions: CorporateActions[] = corporateActions): Trade[] {
  const spinoffs: Trade[] = [];
  // Example: MMM(US88579Y1010) Spinoff  1 for 4 (SOLV, SOLVENTUM CORP-W/I, US83444M1018)
  const spinoffRegex = /^.*\(.*\)\s+Spinoff\s+.*\(([^,]+),/;

  for (const action of actions) {
    if (action.header !== "Data") continue;
    
    const match = action.description.match(spinoffRegex);
    if (match) {
      const symbol = match[1];
      if (action.quantity !== 0) {
        spinoffs.push({
          trades: "Corporate Action",
          header: "Data",
          dataDiscriminator: "Spinoff",
          assetCategory: action.assetCategory,
          currency: action.currency,
          symbol: symbol,
          dateTime: action.dateTime,
          quantity: action.quantity,
          tPrice: 0,
          cPrice: 0,
          proceeds: 0,
          commFee: 0,
          basis: 0,
          realizedPL: 0,
          mtmPL: 0,
          code: action.code,
        });
      }
    }
  }

  return spinoffs;
}

export function applySplits(trades: Trade[], splits: Split[] = getSplits()): Trade[] {
  return trades.map((trade) => {
    let adjustedQuantity = trade.quantity;
    let adjustedTPrice = trade.tPrice;
    let adjustedCPrice = trade.cPrice;

    // Filter splits for this symbol that happened AFTER the trade
    const relevantSplits = splits.filter(
      (s) => s.symbol === trade.symbol && s.date > trade.dateTime
    );

    for (const split of relevantSplits) {
      adjustedQuantity *= split.ratio;
      adjustedTPrice /= split.ratio;
      adjustedCPrice /= split.ratio;
    }

    return {
      ...trade,
      quantity: adjustedQuantity,
      tPrice: adjustedTPrice,
      cPrice: adjustedCPrice,
    };
  });
}

import positionsData from "../db/openPositions.json";

interface RawPosition {
  "Symbol": string;
  "Close Price": string;
}

export interface ReportedBalance {
  cash: number;
}

export function getReportedPrices(): Map<string, number> {
  const map = new Map<string, number>();
  const items = positionsData as RawPosition[];
  
  for (const item of items) {
    if (item.Symbol && item["Close Price"]) {
      map.set(item.Symbol, Number(item["Close Price"]));
    }
  }
  
  return map;
}

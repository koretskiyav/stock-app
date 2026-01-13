import navData from "../db/netAssetValue.json";
import positionsData from "../db/openPositions.json";

interface RawNAV {
  "Net Asset Value": string;
  "Header": string;
  "Asset Class": string;
  "Prior Total"?: string;
  "Current Long"?: string;
  "Current Short"?: string;
  "Current Total"?: string;
  "Change"?: string;
}

interface RawPosition {
  "Symbol": string;
  "Close Price": string;
}

export interface ReportedBalance {
  cash: number;
}

export function getLatestCashBalance(): number {
  const items = navData as RawNAV[];
  
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (item["Asset Class"] === "Cash") {
      return Number(item["Current Total"] || 0);
    }
  }

  return 0;
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

import navData from "../db/netAssetValue.json";

interface RawNAV {
  "Asset Class": string;
  "Current Total": string;
}

export function useCashBalance(): number {
  const items = navData as RawNAV[];
  
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (item["Asset Class"] === "Cash") {
      return Number(item["Current Total"] || 0);
    }
  }

  return 0;
}

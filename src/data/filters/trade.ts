import type { Trade } from "../mappers/trade";

export const isStockTrade = (t: Trade): boolean => t.assetCategory === "Stocks";

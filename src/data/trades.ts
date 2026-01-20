import { rawTrades } from "../db";
import { mapTrade, type Trade } from "./mappers/trade";
import { isStockTrade } from "./filters/trade";
import { spinoffTrades } from "./spinoffs";
import { applySplits } from "./modifiers/split";

export type { Trade };

export const trades = rawTrades
  .map(mapTrade)
  .filter(isStockTrade)
  .concat(spinoffTrades)
  .map(applySplits());

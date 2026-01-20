import { rawDividends } from "../db";
import { mapDividend, type Dividend } from "./mappers/dividend";

export type { Dividend };

export const dividends: Dividend[] = rawDividends
  .map(mapDividend)
  .filter(d => d.header === "Data");

import tradesData from "./trades.json";
import corporateActionsData from "./corporateActions.json";
import type { RawTrade, RawCorporateAction } from "./types";

export const rawTrades = tradesData as RawTrade[];
export const rawCorporateActions = corporateActionsData as RawCorporateAction[];

import { corporateActions } from "./corporateActions";
import { isSpinoffAction } from "./filters/spinoff";
import type { Trade } from "./mappers/trade";
import { mapToSpinoffTrade } from "./mappers/spinoff";
import type { CorporateAction } from "./mappers/corporateAction";

export const calculateSpinoffs = (actions: CorporateAction[] = corporateActions): Trade[] => {
  return actions
    .filter(isSpinoffAction)
    .map(mapToSpinoffTrade)
    .filter((t): t is Trade => t !== null);
};

export const spinoffTrades: Trade[] = calculateSpinoffs();

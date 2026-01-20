import { corporateActions } from "./corporateActions";
import { isSplitAction } from "./filters/split";
import type { CorporateAction } from "./mappers/corporateAction";
import { mapToSplit, type Split } from "./mappers/split";

export type { Split };

export const calculateSplits = (actions: CorporateAction[] = corporateActions): Split[] => {
  const splitsMap = new Map<string, Split>();

  for (const action of actions) {
    if (!isSplitAction(action)) continue;

    const split = mapToSplit(action);
    if (split) {
      const key = `${split.symbol}|${split.date}|${split.ratio}`;
      if (!splitsMap.has(key)) {
        splitsMap.set(key, split);
      }
    }
  }

  return Array.from(splitsMap.values()).sort((a, b) => a.date.localeCompare(b.date));
};

export const splits = calculateSplits();

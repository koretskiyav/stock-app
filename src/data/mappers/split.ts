import { SPLIT_REGEX } from "../filters/split";
import type { CorporateAction } from "./corporateAction";

export interface Split {
  symbol: string;
  ratio: number;
  date: string;
}

export const mapToSplit = (action: CorporateAction): Split | null => {
  const match = action.description.match(SPLIT_REGEX);
  if (!match) return null;

  const symbol = match[1];
  const x = parseInt(match[2], 10);
  const y = parseInt(match[3], 10);

  if (isNaN(x) || isNaN(y) || y === 0) return null;

  return {
    symbol,
    ratio: x / y,
    date: action.dateTime,
  };
};

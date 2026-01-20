import type { Trade } from "../mappers/trade";
import type { Split } from "../mappers/split";
import { splits as defaultSplits } from "../splits";

export const applySplits = (splits: Split[] = defaultSplits) => (trade: Trade): Trade => {
  let adjustedQuantity = trade.quantity;
  let adjustedTPrice = trade.tPrice;
  let adjustedCPrice = trade.cPrice;

  // Filter splits for this symbol that happened AFTER the trade
  const relevantSplits = splits.filter(
    (s) => s.symbol === trade.symbol && s.date > trade.dateTime
  );

  for (const split of relevantSplits) {
    adjustedQuantity *= split.ratio;
    adjustedTPrice /= split.ratio;
    adjustedCPrice /= split.ratio;
  }

  return {
    ...trade,
    quantity: adjustedQuantity,
    tPrice: adjustedTPrice,
    cPrice: adjustedCPrice,
  };
};

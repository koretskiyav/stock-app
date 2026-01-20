import { describe, it, expect } from "vitest";
import { applySplits } from "./split";
import type { Trade } from "../mappers/trade";
import type { Split } from "../mappers/split";

describe("applySplits modifier", () => {
  const createTrade = (partial: Partial<Trade>): Trade => ({
    trades: "Trade",
    header: "Data",
    dataDiscriminator: "Order",
    assetCategory: "Stocks",
    currency: "USD",
    symbol: "TSLA",
    dateTime: "2022-01-01",
    quantity: 10,
    tPrice: 900,
    cPrice: 900,
    proceeds: -9000,
    commFee: 0,
    basis: 9000,
    realizedPL: 0,
    mtmPL: 0,
    code: "",
    ...partial,
  });

  const splits: Split[] = [
    { symbol: "TSLA", ratio: 3, date: "2022-08-24" },
  ];

  it("should adjust trade quantity and price if trade is BEFORE split", () => {
    const trade = createTrade({ dateTime: "2022-01-01", quantity: 10, tPrice: 900 });
    const modifier = applySplits(splits);
    const result = modifier(trade);

    expect(result.quantity).toBe(30);
    expect(result.tPrice).toBe(300);
  });

  it("should NOT adjust trade if trade is AFTER split", () => {
    const trade = createTrade({ dateTime: "2022-09-01", quantity: 10, tPrice: 300 });
    const modifier = applySplits(splits);
    const result = modifier(trade);

    expect(result.quantity).toBe(10);
    expect(result.tPrice).toBe(300);
  });

  it("should handle multiple splits iteratively", () => {
    const multiSplits: Split[] = [
      { symbol: "MUL", ratio: 2, date: "2020-06-01" },
      { symbol: "MUL", ratio: 5, date: "2021-01-01" },
    ];
    const trade = createTrade({ symbol: "MUL", dateTime: "2020-01-01", quantity: 10, tPrice: 100 });
    const modifier = applySplits(multiSplits);
    const result = modifier(trade);

    expect(result.quantity).toBe(100); // 10 * 2 * 5
    expect(result.tPrice).toBe(10);   // 100 / 2 / 5
  });
});

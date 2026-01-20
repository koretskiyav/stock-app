// @ts-ignore
import { describe, it, expect } from "vitest";
import { calculatePortfolioSummary } from "./logic";
import type { Trade } from "../../data/trades";

const createTrade = (partial: Partial<Trade>): Trade => ({
  trades: "",
  header: "",
  dataDiscriminator: "",
  assetCategory: "",
  currency: "USD",
  symbol: "TEST",
  dateTime: "2023-01-01",
  quantity: 0,
  tPrice: 0,
  cPrice: 0,
  proceeds: 0,
  commFee: 0,
  basis: 0,
  realizedPL: 0,
  mtmPL: 0,
  code: "",
  ...partial,
});

describe("calculatePortfolioSummary", () => {
  it("should return empty array for empty trades", () => {
    const result = calculatePortfolioSummary([]);
    expect(result).toEqual([]);
  });

  it("should handle a single buy trade", () => {
    const trades = [
      createTrade({
        symbol: "AAPL",
        quantity: 10,
        basis: -1500, // Bought for 1500
        realizedPL: 0,
      }),
    ];
    const result = calculatePortfolioSummary(trades);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      symbol: "AAPL",
      buyQuantity: 10,
      buySum: 1500,
      sellQuantity: 0,
      sellSum: 0,
      netQuantity: 10,
      realizedPL: 0,
      avgBuyPrice: 150,
    });
  });

  it("should handle a single sell trade", () => {
    const trades = [
      createTrade({
        symbol: "AAPL",
        quantity: -5,
        basis: 800, // Sold for 800
        realizedPL: 50,
      }),
    ];
    const result = calculatePortfolioSummary(trades);
    expect(result[0]).toMatchObject({
      symbol: "AAPL",
      buyQuantity: 0,
      buySum: 0,
      sellQuantity: 5,
      sellSum: 800,
      netQuantity: -5,
      realizedPL: 50,
      avgBuyPrice: 0,
    });
  });

  it("should aggregate multiple trades for the same symbol", () => {
    const trades = [
      createTrade({ symbol: "AAPL", dateTime: "2023-01-01", quantity: 10, basis: -1000, realizedPL: 0 }),
      createTrade({ symbol: "AAPL", dateTime: "2023-01-02", quantity: -5, basis: 600, realizedPL: 100 }),
    ];
    const result = calculatePortfolioSummary(trades);
    expect(result[0]).toMatchObject({
      symbol: "AAPL",
      buyQuantity: 10,
      buySum: 1000,
      sellQuantity: 5,
      sellSum: 600,
      netQuantity: 5, // 10 - 5
      realizedPL: 100,
      avgBuyPrice: 100,
    });
  });

  it("should calculate avgBuyPrice using FIFO", () => {
    const trades = [
      // Lot 1: 10 @ $100
      createTrade({ symbol: "AAPL", dateTime: "2023-01-01", quantity: 10, basis: -1000 }),
      // Lot 2: 10 @ $200
      createTrade({ symbol: "AAPL", dateTime: "2023-01-02", quantity: 10, basis: -2000 }),
      // Sell 15: all of Lot 1 (10) and 5 of Lot 2. Remaining: 5 @ $200
      createTrade({ symbol: "AAPL", dateTime: "2023-01-03", quantity: -15, basis: 3000 }),
    ];
    const result = calculatePortfolioSummary(trades);
    expect(result[0]).toMatchObject({
      symbol: "AAPL",
      netQuantity: 5,
      avgBuyPrice: 200, // Remaining 5 shares are from Lot 2
    });
  });

  it("should handle multiple symbols and sort them", () => {
    const trades = [
      createTrade({ symbol: "MSFT", quantity: 10, basis: -500 }),
      createTrade({ symbol: "AAPL", quantity: 10, basis: -1000 }),
    ];
    const result = calculatePortfolioSummary(trades);
    expect(result).toHaveLength(2);
    expect(result[0].symbol).toBe("AAPL");
    expect(result[1].symbol).toBe("MSFT");
  });
});

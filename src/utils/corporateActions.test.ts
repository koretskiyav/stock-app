// @ts-ignore
import { describe, it, expect } from "vitest";
import { applySplits, getSplits, getSpinoffTrades } from "./corporateActions";
import type { Trades as Trade } from "../data/trades";
import type { CorporateActions } from "../data/corporateActions";

const createTrade = (partial: Partial<Trade>): Trade => ({
  trades: "",
  header: "",
  dataDiscriminator: "",
  assetCategory: "Stocks",
  currency: "USD",
  symbol: "TSLA",
  dateTime: "2022-01-01, 10:00:00",
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

const createAction = (description: string, dateTime: string): CorporateActions => ({
  corporateActions: "Corporate Actions",
  header: "Data",
  assetCategory: "Stocks",
  currency: "USD",
  reportDate: dateTime.split(",")[0],
  dateTime: dateTime,
  description: description,
  quantity: 0,
  proceeds: 0,
  value: 0,
  realizedPL: 0,
  code: "",
});

describe("getSplits", () => {
  it("should extract split ratio correctly", () => {
    const actions = [
      createAction("AAPL(US0378331005) Split 4 for 1", "2020-08-31, 20:25:00")
    ];
    const splits = getSplits(actions);
    expect(splits).toHaveLength(1);
    expect(splits[0]).toMatchObject({
      symbol: "AAPL",
      ratio: 4,
      date: "2020-08-31, 20:25:00"
    });
  });

  it("should de-duplicate identical splits", () => {
    const actions = [
      createAction("AAPL(US0378331005) Split 4 for 1", "2020-08-31, 20:25:00"),
      createAction("AAPL(US0378331005) Split 4 for 1", "2020-08-31, 20:25:00")
    ];
    const splits = getSplits(actions);
    expect(splits).toHaveLength(1);
  });
});

describe("getSpinoffTrades", () => {
  it("should extract spinoff trades with price 0", () => {
    const actions = [
      createAction("MMM(US88579Y1010) Spinoff  1 for 4 (SOLV, SOLVENTUM CORP-W/I, US83444M1018)", "2024-04-01, 20:25:00")
    ];
    // Mocking quantity since createAction stub has it as 0
    actions[0].quantity = 1.25;

    const spinoffs = getSpinoffTrades(actions);
    expect(spinoffs).toHaveLength(1);
    expect(spinoffs[0]).toMatchObject({
      symbol: "SOLV",
      quantity: 1.25,
      tPrice: 0,
      dateTime: "2024-04-01, 20:25:00"
    });
  });
});

describe("applySplits", () => {
  it("should apply a single split correctly to trades before the split", () => {
    const trades = [
      createTrade({ symbol: "TSLA", quantity: 10, tPrice: 900, dateTime: "2022-01-01, 00:00:00" }),
      createTrade({ symbol: "TSLA", quantity: 30, tPrice: 300, dateTime: "2022-09-01, 00:00:00" })
    ];
    const splits = [
      { symbol: "TSLA", ratio: 3, date: "2022-08-24, 20:25:00" }
    ];
    
    const adjusted = applySplits(trades, splits);
    
    // First trade should be adjusted
    expect(adjusted[0].quantity).toBe(30);
    expect(adjusted[0].tPrice).toBe(300);
    
    // Second trade should NOT be adjusted
    expect(adjusted[1].quantity).toBe(30);
    expect(adjusted[1].tPrice).toBe(300);
  });

  it("should apply multiple splits iteratively", () => {
    const trades = [
      createTrade({ symbol: "MUL", quantity: 10, tPrice: 100, dateTime: "2020-01-01, 00:00:00" })
    ];
    const splits = [
      { symbol: "MUL", ratio: 2, date: "2020-06-01, 00:00:00" },
      { symbol: "MUL", ratio: 5, date: "2021-01-01, 00:00:00" }
    ];
    
    const adjusted = applySplits(trades, splits);
    
    // 10 * 2 * 5 = 100
    expect(adjusted[0].quantity).toBe(100);
    // 100 / 2 / 5 = 10
    expect(adjusted[0].tPrice).toBe(10);
  });
});

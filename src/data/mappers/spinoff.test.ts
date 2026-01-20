import { describe, it, expect } from "vitest";
import { mapToSpinoffTrade } from "./spinoff";
import type { CorporateAction } from "./corporateAction";

describe("mapToSpinoffTrade", () => {
  const createAction = (description: string, quantity: number): CorporateAction => ({
    corporateActions: "Corporate Actions",
    header: "Data",
    assetCategory: "Stocks",
    currency: "USD",
    reportDate: "2024-04-01",
    dateTime: "2024-04-01, 20:25:00",
    description,
    quantity,
    proceeds: 0,
    value: 0,
    realizedPL: 0,
    code: "SO",
  });

  it("should map spinoff action to trade correctly", () => {
    const action = createAction("MMM(US88579Y1010) Spinoff  1 for 4 (SOLV, SOLVENTUM CORP-W/I, US83444M1018)", 1.25);
    const result = mapToSpinoffTrade(action);

    expect(result).toMatchObject({
      trades: "Corporate Action",
      header: "Data",
      dataDiscriminator: "Spinoff",
      symbol: "SOLV",
      dateTime: "2024-04-01, 20:25:00",
      quantity: 1.25,
      tPrice: 0,
    });
  });

  it("should return null if regex doesn't match", () => {
    const action = createAction("Normal Dividend", 10);
    const result = mapToSpinoffTrade(action);
    expect(result).toBeNull();
  });

  it("should return null if quantity is 0", () => {
    const action = createAction("MMM Spinoff (SOLV)", 0);
    const result = mapToSpinoffTrade(action);
    expect(result).toBeNull();
  });
});

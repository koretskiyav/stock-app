import { describe, it, expect } from "vitest";
import { mapCorporateAction } from "./corporateAction";
import type { RawCorporateAction } from "../../db/types";

describe("mapCorporateAction", () => {
  it("should map raw corporate action correctly", () => {
    const raw: RawCorporateAction = {
      "Corporate Actions": "Corporate Actions",
      "Header": "Data",
      "Asset Category": "Stocks",
      "Currency": "USD",
      "Report Date": "2023-01-01",
      "Date/Time": "2023-01-01, 10:00:00",
      "Description": "Test Action",
      "Quantity": "1.5",
      "Proceeds": "0",
      "Value": "100",
      "Realized P/L": "10",
      "Code": "CA",
    };

    const result = mapCorporateAction(raw);

    expect(result).toEqual({
      corporateActions: "Corporate Actions",
      header: "Data",
      assetCategory: "Stocks",
      currency: "USD",
      reportDate: "2023-01-01",
      dateTime: "2023-01-01, 10:00:00",
      description: "Test Action",
      quantity: 1.5,
      proceeds: 0,
      value: 100,
      realizedPL: 10,
      code: "CA",
    });
  });
});

// @ts-ignore
import { describe, it, expect } from "vitest";
import { formatMoney, formatNumber } from "./format";

describe("formatMoney", () => {
    it("should format USD currency correctly", () => {
        expect(formatMoney(1000)).toBe("$1,000.00");
        expect(formatMoney(1234.56)).toBe("$1,234.56");
        expect(formatMoney(0)).toBe("$0.00");
        expect(formatMoney(-500)).toBe("-$500.00");
    });
});

describe("formatNumber", () => {
    it("should format numbers with commas", () => {
        expect(formatNumber(1000)).toBe("1,000");
        expect(formatNumber(1000000)).toBe("1,000,000");
        expect(formatNumber(1234.56)).toBe("1,234.56"); // Default maxFractionDigits is 3 usually for plain format, but let's see. actually defaults to 3? Intl default is usually 3.
        expect(formatNumber(0)).toBe("0");
    });
});

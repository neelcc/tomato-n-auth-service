import { describe, it, expect } from "vitest";
import { calculateDiscount } from "./src/utils.js";

describe("App", () => {
    it("should work sum", () => {
        const sum = calculateDiscount(2, 2);
        expect(sum).toBe(4);
    });
});

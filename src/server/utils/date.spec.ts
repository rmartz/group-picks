import { describe, expect, it } from "vitest";

import { parseDueDateField } from "./date";

describe("parseDueDateField", () => {
  describe("returns date: undefined for absent or empty values", () => {
    it("returns date: undefined for undefined input", () => {
      const result = parseDueDateField(undefined);
      expect(result).toEqual({ date: undefined });
    });

    it("returns date: undefined for null input", () => {
      const result = parseDueDateField(null);
      expect(result).toEqual({ date: undefined });
    });

    it("returns date: undefined for empty string", () => {
      const result = parseDueDateField("");
      expect(result).toEqual({ date: undefined });
    });
  });

  describe("returns an error for invalid string inputs, or date: undefined for non-string inputs", () => {
    it("returns date: undefined for a non-string value", () => {
      const result = parseDueDateField(20250101);
      expect(result).toEqual({ date: undefined });
    });

    it("returns error for a human-readable date string", () => {
      const result = parseDueDateField("January 15, 2025");
      expect(result).toEqual({ error: "dueDate is invalid" });
    });

    it("returns error for an ISO datetime string", () => {
      const result = parseDueDateField("2025-06-15T12:00:00Z");
      expect(result).toEqual({ error: "dueDate is invalid" });
    });

    it("returns error for an impossible calendar date", () => {
      const result = parseDueDateField("2025-02-31");
      expect(result).toEqual({ error: "dueDate is invalid" });
    });

    it("returns error for a random non-date string", () => {
      const result = parseDueDateField("not-a-date");
      expect(result).toEqual({ error: "dueDate is invalid" });
    });
  });

  describe("returns a parsed Date for a valid YYYY-MM-DD string", () => {
    it("returns the correct Date for a valid date string", () => {
      const result = parseDueDateField("2025-06-15");
      expect("date" in result).toBe(true);
      if ("date" in result) {
        expect(result.date).toEqual(new Date("2025-06-15"));
      }
    });

    it("returns the exact ISO-parsed date value", () => {
      const result = parseDueDateField("2027-12-31");
      expect("date" in result).toBe(true);
      if ("date" in result) {
        expect(result.date?.toISOString().slice(0, 10)).toBe("2027-12-31");
      }
    });
  });
});

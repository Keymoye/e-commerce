import { describe, it, expect } from "vitest";
import { incrementCounter, getCounter, getAllCounters } from "@/lib/metrics";

describe("metrics counters", () => {
  it("increments counters and returns values", () => {
    incrementCounter("test.counter");
    incrementCounter("test.counter", 2);
    expect(getCounter("test.counter")).toBe(3);
    const all = getAllCounters();
    expect(all["test.counter"]).toBe(3);
  });
});

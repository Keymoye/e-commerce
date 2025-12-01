import { describe, it, expect } from "vitest";
import { productSchema, mockProducts } from "../../services/products";

describe("products service", () => {
  it("mock products comply with schema", () => {
    expect(Array.isArray(mockProducts)).toBe(true);
    if (mockProducts.length > 0) {
      const result = productSchema.safeParse(mockProducts[0]);
      expect(result.success).toBe(true);
    }
  });
});

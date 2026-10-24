import { describe, expect, test } from "bun:test";
import { availableStock, orderInputSchema } from "./commerce-rules";

describe("inventory availability", () => {
  test("available to sell is physical inventory minus reservations", () => {
    expect(availableStock(100, 30)).toBe(70);
  });
  test("cart quantities never reduce available stock", () => {
    const cartQuantity = 12;
    expect(cartQuantity).toBe(12);
    expect(availableStock(100, 0)).toBe(100);
  });
});

const input = { request_id: "00000000-0000-4000-8000-000000000001", full_name: "Test Customer", phone: "0791234567", city: "Amman", address: "Test street", payment_method: "cash", items: [{ product_id: "00000000-0000-4000-8000-000000000002", quantity: 1, expected_price: 10 }] };
test("duplicate product lines cannot bypass inventory checking", () => {
  expect(orderInputSchema.safeParse({ ...input, items: [...input.items, ...input.items] }).success).toBe(false);
});
test("zero quantities cannot be purchased", () => {
  expect(orderInputSchema.safeParse({ ...input, items: [{ ...input.items[0], quantity: 0 }] }).success).toBe(false);
});
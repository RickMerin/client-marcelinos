import { describe, expect, it } from "vitest";
import {
  collapseRoomsToLines,
  reconcileRoomsWithInventory,
  roomSelectionsDiffer,
} from "./booking.utils";

describe("collapseRoomsToLines", () => {
  it("merges same layout + same rate into one line", () => {
    const lines = collapseRoomsToLines([
      {
        type: "deluxe",
        price: 2200,
        description: "1 Double Bed and 1 Single Bed",
      },
      {
        type: "deluxe",
        price: 2200,
        description: "1 Double Bed and 1 Single Bed",
      },
    ]);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      room_type: "deluxe",
      quantity: 2,
      unit_price: 2200,
    });
  });

  it("splits distinct per-night rates in the same layout into separate lines", () => {
    const lines = collapseRoomsToLines([
      {
        type: "deluxe",
        price: 2199,
        description: "1 Double Bed and 1 Single Bed",
      },
      {
        type: "deluxe",
        price: 2500,
        description: "1 Double Bed and 1 Single Bed",
      },
    ]);
    expect(lines).toHaveLength(2);
    const prices = lines.map((l) => l.unit_price).sort((a, b) => a - b);
    expect(prices).toEqual([2199, 2500]);
    expect(lines.every((l) => l.quantity === 1)).toBe(true);
  });
});

describe("reconcileRoomsWithInventory", () => {
  it("replaces snapshots with fresh rows by id in order", () => {
    const fresh = [
      { id: 1, type: "standard", price: 1500 },
      { id: 2, type: "deluxe", price: 9999 },
    ];
    const selected = [{ id: 2, type: "deluxe", price: 2000 }];
    const out = reconcileRoomsWithInventory(selected, fresh);
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual(fresh[1]);
  });

  it("drops ids missing from fresh list", () => {
    const out = reconcileRoomsWithInventory(
      [{ id: 99, price: 1 }],
      [{ id: 1, price: 100 }],
    );
    expect(out).toHaveLength(0);
  });
});

describe("roomSelectionsDiffer", () => {
  it("detects price drift", () => {
    const a = [{ id: 1, price: 2000 }];
    const b = [{ id: 1, price: 9100 }];
    expect(roomSelectionsDiffer(a, b)).toBe(true);
  });

  it("returns false for same ids and prices", () => {
    const row = { id: 1, price: 2200 };
    expect(roomSelectionsDiffer([row], [{ ...row }])).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  removeTransfer,
  updateTransfer,
  type PlayerData,
} from "@/app/store/utils";

function makePlayer(
  player_id: number,
  element_type: number,
  selling_price: number
): PlayerData {
  return { player_id, element_type, selling_price } as unknown as PlayerData;
}

function emptyBuckets(): { [key: number]: PlayerData[] } {
  return { 1: [], 2: [], 3: [], 4: [] };
}

describe("updateTransfer (transfersOut bank symmetry)", () => {
  it("add-then-toggle-off nets bank back to start", () => {
    let bank = 100;
    const addToBank = (v: number) => {
      bank += v;
    };
    const removeFromBank = (v: number) => {
      bank -= v;
    };
    const buckets = emptyBuckets();
    const player = makePlayer(42, 3, 55);

    updateTransfer(buckets, player, addToBank, removeFromBank);
    expect(bank).toBe(155);
    expect(buckets[3].length).toBe(1);

    updateTransfer(buckets, player, addToBank, removeFromBank);
    expect(bank).toBe(100);
    expect(buckets[3].length).toBe(0);
  });
});

describe("removeTransfer (transfersIn error-rollback)", () => {
  it("leaves bank untouched when rolling back a transfersIn selection", () => {
    let bank = 100;
    const addToBank = (v: number) => {
      bank += v;
    };
    const removeFromBank = (v: number) => {
      bank -= v;
    };
    const buckets = emptyBuckets();
    const player = makePlayer(42, 3, 55);
    buckets[3].push(player);

    removeTransfer(
      buckets,
      { player_id: 42, element_type: 3, selling_price: 55 },
      addToBank,
      removeFromBank
    );

    expect(buckets[3].length).toBe(0);
    expect(bank).toBe(100);
  });
});

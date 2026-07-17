import { describe, expect, it } from "vitest";
import type { DraftTransfer } from "./types";
import {
  computeFreeTransfers,
  computeTransferCost,
  countTransfersInGameweek,
} from "./transfers";

function transfer(gameweek: number, type: DraftTransfer["type"] = "transfer"): DraftTransfer {
  return {
    in: { data: {} as DraftTransfer["in"]["data"], price: 0 },
    out: { data: {} as DraftTransfer["out"]["data"], price: 0 },
    gameweek,
    type,
  };
}

describe("computeFreeTransfers", () => {
  it("GW1 -> infinite", () => {
    expect(
      computeFreeTransfers({
        currentGameweek: 1,
        draftChanges: [],
        serverTransferCount: 0,
      })
    ).toBe("∞");
  });

  it("GW2 -> 1, regardless of changes", () => {
    expect(
      computeFreeTransfers({
        currentGameweek: 2,
        draftChanges: [],
        serverTransferCount: 0,
      })
    ).toBe(1);
    expect(
      computeFreeTransfers({
        currentGameweek: 2,
        draftChanges: [transfer(1), transfer(1)],
        serverTransferCount: 5,
      })
    ).toBe(1);
  });

  it("fallback branch (no drafts) uses serverTransferCount", () => {
    expect(
      computeFreeTransfers({
        currentGameweek: 3,
        draftChanges: [],
        serverTransferCount: 0,
      })
    ).toBe(2);
  });

  it("draft branch: GW3 with 1 prior in-window -> 1", () => {
    expect(
      computeFreeTransfers({
        currentGameweek: 3,
        draftChanges: [transfer(2)],
        serverTransferCount: 0,
      })
    ).toBe(1);
  });

  it("draft branch: GW3 with 2 prior in-window -> raw 0 -> clamped to 1", () => {
    expect(
      computeFreeTransfers({
        currentGameweek: 3,
        draftChanges: [transfer(2), transfer(2)],
        serverTransferCount: 0,
      })
    ).toBe(1);
  });

  it("draft branch: GW7 with 0 in-window -> raw 6 -> clamped to 5", () => {
    expect(
      computeFreeTransfers({
        currentGameweek: 7,
        draftChanges: [transfer(1)],
        serverTransferCount: 0,
      })
    ).toBe(5);
  });

  it("draft branch: GW4 with 5 prior in-window -> raw -2 -> clamped to 1", () => {
    const changes = [
      transfer(2),
      transfer(2),
      transfer(3),
      transfer(3),
      transfer(3),
    ];
    expect(
      computeFreeTransfers({
        currentGameweek: 4,
        draftChanges: changes,
        serverTransferCount: 0,
      })
    ).toBe(1);
  });

  it("window boundary: cg-5 counts, cg-6 does not, gw==1 excluded, non-transfer excluded", () => {
    const cg = 8;
    const changes = [
      transfer(cg - 6),
      transfer(cg - 5),
      transfer(1),
      transfer(cg - 2, "substitute"),
    ];
    expect(
      computeFreeTransfers({
        currentGameweek: cg,
        draftChanges: changes,
        serverTransferCount: 0,
      })
    ).toBe(5);
  });

  it("window boundary: cg-5 counts, cg-6 does not (raw kept in range to avoid clamp)", () => {
    const cg = 7;
    const inWindow = computeFreeTransfers({
      currentGameweek: cg,
      draftChanges: [transfer(cg - 5), transfer(cg - 5)],
      serverTransferCount: 0,
    });
    const outOfWindow = computeFreeTransfers({
      currentGameweek: cg,
      draftChanges: [transfer(cg - 6), transfer(cg - 6)],
      serverTransferCount: 0,
    });
    expect(inWindow).toBe(4);
    expect(outOfWindow).toBe(5);
  });
});

describe("computeTransferCost", () => {
  it("charges -4 for each transfer beyond the free allowance", () => {
    expect(computeTransferCost(2, 1)).toBe(-4);
    expect(computeTransferCost(3, 1)).toBe(-8);
    expect(computeTransferCost(4, 2)).toBe(-8);
    expect(computeTransferCost(6, 5)).toBe(-4);
  });

  it("is free when within the allowance", () => {
    expect(computeTransferCost(1, 1)).toBe(0);
    expect(computeTransferCost(0, 1)).toBe(0);
    expect(computeTransferCost(2, 5)).toBe(0);
  });

  it("is always free when free transfers are infinite (GW1)", () => {
    expect(computeTransferCost(2, "∞")).toBe(0);
  });
});

describe("countTransfersInGameweek", () => {
  it("counts only type=transfer changes in the given gameweek", () => {
    const changes = [
      transfer(3),
      transfer(3),
      transfer(4),
      transfer(3, "substitute"),
    ];
    expect(countTransfersInGameweek(changes, 3)).toBe(2);
    expect(countTransfersInGameweek(changes, 4)).toBe(1);
    expect(countTransfersInGameweek(changes, 5)).toBe(0);
  });
});

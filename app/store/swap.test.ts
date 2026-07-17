import { describe, expect, it } from "vitest";
import type { FPLGameweekPicksData } from "@/app/api";
import type { DraftTransfer, PlayerData } from "@/app/store/utils";
import { swapPlayers } from "@/app/store";

function makePick(player_id: number, position: number, selling_price: number) {
  return {
    position,
    selling_price,
    fpl_player: {
      player_id,
      element_type: 3,
    },
  } as unknown as FPLGameweekPicksData["data"][number];
}

function makePicks(
  picks: ReturnType<typeof makePick>[],
  bank: number
): FPLGameweekPicksData {
  return {
    data: picks,
    overall: { bank } as FPLGameweekPicksData["overall"],
  };
}

function makePlayer(player_id: number): PlayerData {
  return { player_id } as unknown as PlayerData;
}

function makeTransfer(
  inId: number,
  inPrice: number,
  outId: number,
  outPrice: number,
  type: DraftTransfer["type"] = "transfer"
): DraftTransfer {
  return {
    in: { data: makePlayer(inId), price: inPrice },
    out: { data: makePlayer(outId), price: outPrice },
    gameweek: 2,
    type,
  };
}

describe("swapPlayers", () => {
  it("transfer case: out replaced at its position, bank = old + out.price - in.price, length unchanged", async () => {
    const picks = makePicks(
      [makePick(10, 1, 50), makePick(20, 2, 55), makePick(30, 3, 60)],
      100
    );
    const result = await swapPlayers(picks, makeTransfer(99, 45, 20, 55));

    expect(result.data.length).toBe(3);
    const replaced = result.data.find((p) => p.fpl_player.player_id === 99)!;
    expect(replaced.position).toBe(2);
    expect(result.data.some((p) => p.fpl_player.player_id === 20)).toBe(false);
    expect(result.overall.bank).toBe(110);
  });

  it("position-swap case (both in team): positions exchanged; bank moves by out.price - in.price for arbitrary prices", async () => {
    const picks = makePicks([makePick(10, 1, 50), makePick(20, 12, 55)], 100);
    const result = await swapPlayers(picks, makeTransfer(20, 7, 10, 3));

    const p10 = result.data.find((p) => p.fpl_player.player_id === 10)!;
    const p20 = result.data.find((p) => p.fpl_player.player_id === 20)!;
    expect(p10.position).toBe(12);
    expect(p20.position).toBe(1);
    expect(result.overall.bank).toBe(96);
  });

  it("no-op when out-player absent: returns original data, bank untouched", async () => {
    const picks = makePicks([makePick(10, 1, 50)], 100);
    const result = await swapPlayers(picks, makeTransfer(99, 45, 12345, 55));
    expect(result).toBe(picks);
    expect(result.overall.bank).toBe(100);
  });

  it("immutability: original data array is not mutated", async () => {
    const originalPicks = [makePick(10, 1, 50), makePick(20, 2, 55)];
    const picks = makePicks(originalPicks, 100);
    const snapshotPositions = originalPicks.map((p) => p.position);

    await swapPlayers(picks, makeTransfer(99, 45, 20, 55));

    expect(originalPicks.map((p) => p.position)).toEqual(snapshotPositions);
    expect(picks.overall.bank).toBe(100);
  });
});

import { describe, expect, it } from "vitest";
import type {
  DraftTransfer,
  FPLGameweekPicksData,
  PlayerData,
} from "./types";
import {
  applyDrafts,
  buildInitialGameweekPayload,
  computeNextGameweek,
  resolveGameweekPicks,
  selectBase,
  sumTransferOut,
} from "./gameweek";

describe("computeNextGameweek", () => {
  it("returns 1 when no gameweek has been played yet", () => {
    expect(computeNextGameweek(null)).toBe(1);
  });

  it("returns the next gameweek when mid-season", () => {
    expect(computeNextGameweek(21)).toBe(22);
  });

  it("clamps to 38 when the season is fully played (gameweek 38 already recorded)", () => {
    expect(computeNextGameweek(38)).toBe(38);
  });
});

function basePlayer(id: string, element_type: number, now_value: number) {
  return { id, element_type, now_value };
}

describe("buildInitialGameweekPayload", () => {
  const allPlayers = [
    basePlayer("gk1", 1, 40),
    basePlayer("gk2", 1, 40),
    basePlayer("def1", 2, 50),
    basePlayer("def2", 2, 50),
    basePlayer("def3", 2, 50),
    basePlayer("def4", 2, 50),
    basePlayer("def5", 2, 50),
    basePlayer("mid1", 3, 60),
    basePlayer("mid2", 3, 60),
    basePlayer("mid3", 3, 60),
    basePlayer("mid4", 3, 60),
    basePlayer("mid5", 3, 60),
    basePlayer("fwd1", 4, 70),
    basePlayer("fwd2", 4, 70),
    basePlayer("fwd3", 4, 70),
  ];

  it("returns a plain, directly-consumable object (not a JSON-encoded string)", () => {
    const payload = buildInitialGameweekPayload(allPlayers);

    expect(typeof payload).toBe("object");
    expect(typeof (payload as unknown)).not.toBe("string");
    expect(JSON.parse(JSON.stringify(payload))).toEqual(payload);
  });

  it("produces a 15-player squad with distinct pitch positions 1-15", () => {
    const payload = buildInitialGameweekPayload(allPlayers);

    expect(payload.data.length).toBe(15);
    expect(payload.data.map((p) => p.position).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 15 }, (_, i) => i + 1)
    );
  });
});

function pick(player_id: number, position: number, selling_price: number) {
  return {
    position,
    selling_price,
    fpl_player: { player_id, element_type: 3 },
  } as unknown as FPLGameweekPicksData["data"][number];
}

function picks(
  entries: FPLGameweekPicksData["data"],
  bank: number
): FPLGameweekPicksData {
  return {
    data: entries,
    overall: { bank } as FPLGameweekPicksData["overall"],
  };
}

function emptyTransfersOut(): { [key: number]: PlayerData[] } {
  return { 1: [], 2: [], 3: [], 4: [] };
}

function outPlayer(player_id: number): PlayerData {
  return { player_id } as unknown as PlayerData;
}

function transferDraft(
  outId: number,
  outPrice: number,
  inId: number,
  inPrice: number,
  gameweek: number
): DraftTransfer {
  return {
    in: { data: outPlayer(inId), price: inPrice },
    out: { data: outPlayer(outId), price: outPrice },
    gameweek,
    type: "transfer",
  };
}

describe("resolveGameweekPicks", () => {
  it("selects the fetched data as base and flags setBase when it is non-empty", async () => {
    const parsed = picks([pick(10, 1, 50)], 100);
    const result = await resolveGameweekPicks({
      parsed,
      dbbase: undefined,
      draftChanges: [],
      currentGameweek: 2,
      transfersOut: emptyTransfersOut(),
    });

    expect(result).toBeDefined();
    expect(result!.setBase).toBe(true);
    expect(result!.base).toBe(parsed);
  });

  it("falls back to dbbase and does not flag setBase when fetched data is empty", async () => {
    const dbbase = picks([pick(10, 1, 50)], 100);
    const result = await resolveGameweekPicks({
      parsed: picks([], 0),
      dbbase,
      draftChanges: [],
      currentGameweek: 3,
      transfersOut: emptyTransfersOut(),
    });

    expect(result).toBeDefined();
    expect(result!.setBase).toBe(false);
    expect(result!.base).toBe(dbbase);
  });

  it("only folds draft changes at or before the current gameweek", async () => {
    const parsed = picks([pick(10, 1, 50), pick(20, 2, 55)], 100);
    const result = await resolveGameweekPicks({
      parsed,
      dbbase: undefined,
      draftChanges: [
        transferDraft(20, 55, 99, 45, 2),
        transferDraft(10, 50, 88, 30, 5),
      ],
      currentGameweek: 2,
      transfersOut: emptyTransfersOut(),
    });

    const ids = result!.picks.data.map(
      (p: FPLGameweekPicksData["data"][number]) => p.fpl_player.player_id
    );
    expect(ids).toContain(99);
    expect(ids).not.toContain(88);
    expect(ids).toContain(10);
  });

  it("committedBank excludes remainingTransferOutSum while picks bank includes it", async () => {
    const parsed = picks([pick(10, 1, 50)], 100);
    const transfersOut = emptyTransfersOut();
    transfersOut[3] = [
      { player_id: 77, selling_price: 30 } as unknown as PlayerData,
    ];

    const result = await resolveGameweekPicks({
      parsed,
      dbbase: undefined,
      draftChanges: [],
      currentGameweek: 2,
      transfersOut,
    });

    expect(result!.committedBank).toBe(100);
    expect(result!.picks.overall.bank).toBe(130);
  });

  it("moves committedBank by out.price - in.price for a folded transfer", async () => {
    const parsed = picks([pick(20, 2, 55)], 100);
    const result = await resolveGameweekPicks({
      parsed,
      dbbase: undefined,
      draftChanges: [transferDraft(20, 55, 99, 45, 2)],
      currentGameweek: 2,
      transfersOut: emptyTransfersOut(),
    });

    expect(result!.committedBank).toBe(110);
  });

  it("does not mutate the input parsed object", async () => {
    const parsed = picks([pick(20, 2, 55)], 100);
    await resolveGameweekPicks({
      parsed,
      dbbase: undefined,
      draftChanges: [transferDraft(20, 55, 99, 45, 2)],
      currentGameweek: 2,
      transfersOut: emptyTransfersOut(),
    });

    expect(parsed.overall.bank).toBe(100);
    expect(parsed.data[0].fpl_player.player_id).toBe(20);
  });

  it("returns undefined when there is no base and no fetched data", async () => {
    const result = await resolveGameweekPicks({
      parsed: picks([], 0),
      dbbase: undefined,
      draftChanges: [],
      currentGameweek: 4,
      transfersOut: emptyTransfersOut(),
    });

    expect(result).toBeUndefined();
  });
});

describe("selectBase", () => {
  it("uses non-empty fetched data as base", () => {
    const parsed = picks([pick(10, 1, 50)], 100);
    expect(selectBase(parsed, undefined)).toEqual({ base: parsed, setBase: true });
  });

  it("falls back to dbbase when fetched data is empty", () => {
    const dbbase = picks([pick(10, 1, 50)], 100);
    expect(selectBase(picks([], 0), dbbase)).toEqual({
      base: dbbase,
      setBase: false,
    });
  });
});

describe("sumTransferOut", () => {
  it("sums selling_price across all buckets", () => {
    const buckets = emptyTransfersOut();
    buckets[2] = [{ selling_price: 40 } as unknown as PlayerData];
    buckets[3] = [
      { selling_price: 55 } as unknown as PlayerData,
      { selling_price: 5 } as unknown as PlayerData,
    ];
    expect(sumTransferOut(buckets)).toBe(100);
  });

  it("is zero for empty buckets", () => {
    expect(sumTransferOut(emptyTransfersOut())).toBe(0);
  });
});

describe("applyDrafts", () => {
  it("only folds changes at or before the current gameweek", async () => {
    const base = picks([pick(10, 1, 50), pick(20, 2, 55)], 100);
    const out = await applyDrafts(
      base,
      [transferDraft(20, 55, 99, 45, 2), transferDraft(10, 50, 88, 30, 5)],
      2
    );
    const ids = out.data.map(
      (p: FPLGameweekPicksData["data"][number]) => p.fpl_player.player_id
    );
    expect(ids).toContain(99);
    expect(ids).not.toContain(88);
  });

  it("returns the base unchanged when there are no relevant drafts", async () => {
    const base = picks([pick(10, 1, 50)], 100);
    const out = await applyDrafts(base, [], 2);
    expect(out).toBe(base);
  });
});

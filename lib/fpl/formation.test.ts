import { describe, expect, it } from "vitest";
import type { FPLGameweekPicksData, PlayerData } from "./types";
import { validateSubstitution } from "./formation";

function player(element_type: number): PlayerData {
  return { element_type } as unknown as PlayerData;
}

function picksWith(counts: {
  gk?: number;
  def?: number;
  mid?: number;
  fwd?: number;
}): FPLGameweekPicksData {
  const data: FPLGameweekPicksData["data"] = [];
  let position = 1;
  const add = (element_type: number, n: number) => {
    for (let i = 0; i < n; i++) {
      data.push({
        position: position++,
        fpl_player: { element_type },
      } as unknown as FPLGameweekPicksData["data"][number]);
    }
  };
  add(1, counts.gk ?? 0);
  add(2, counts.def ?? 0);
  add(3, counts.mid ?? 0);
  add(4, counts.fwd ?? 0);
  return { data, overall: {} as FPLGameweekPicksData["overall"] };
}

describe("validateSubstitution", () => {
  it("same-type swap is always valid", () => {
    const picks = picksWith({ gk: 1, def: 4, mid: 4, fwd: 2 });
    expect(validateSubstitution(player(2), player(2), picks).valid).toBe(true);
  });

  it("GK can only be swapped for a GK", () => {
    const picks = picksWith({ gk: 1, def: 4, mid: 4, fwd: 2 });
    const result = validateSubstitution(player(1), player(2), picks);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe(
      "A goalkeeper can be substituted only for another goalkeeper."
    );
    expect(validateSubstitution(player(2), player(1), picks).valid).toBe(false);
  });

  it("keeps a minimum of 3 defenders", () => {
    const withFour = picksWith({ gk: 1, def: 4, mid: 3, fwd: 3 });
    expect(validateSubstitution(player(3), player(2), withFour).valid).toBe(
      true
    );
    const withThree = picksWith({ gk: 1, def: 3, mid: 4, fwd: 3 });
    const result = validateSubstitution(player(3), player(2), withThree);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe(
      "Need a minimum of 3 defenders in playing team."
    );
  });

  it("keeps a minimum of 2 midfielders", () => {
    const withThree = picksWith({ gk: 1, def: 4, mid: 3, fwd: 3 });
    expect(validateSubstitution(player(2), player(3), withThree).valid).toBe(
      true
    );
    const withTwo = picksWith({ gk: 1, def: 5, mid: 2, fwd: 3 });
    const result = validateSubstitution(player(2), player(3), withTwo);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe(
      "Need a minimum of 2 midfielders in playing team."
    );
  });

  it("keeps a minimum of 1 forward", () => {
    const withTwo = picksWith({ gk: 1, def: 4, mid: 4, fwd: 2 });
    expect(validateSubstitution(player(2), player(4), withTwo).valid).toBe(
      true
    );
    const withOne = picksWith({ gk: 1, def: 5, mid: 4, fwd: 1 });
    const result = validateSubstitution(player(2), player(4), withOne);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Need a minimum of 1 forward in playing team.");
  });
});

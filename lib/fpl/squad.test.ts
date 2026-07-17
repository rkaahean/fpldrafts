import { describe, expect, it } from "vitest";
import type {
  DraftTransfer,
  FPLGameweekPicksData,
  PlayerData,
} from "./types";
import {
  bankAfterTransfer,
  checkBudget,
  getNumPlayersByType,
  getSquadCountByType,
  validateMaxPerClub,
  validateSquadComposition,
} from "./squad";

function pick(
  element_type: number,
  position: number,
  team_code: number = 1,
  web_name: string = "Player"
): FPLGameweekPicksData["data"][number] {
  return {
    position,
    fpl_player: { element_type, team_code, web_name },
  } as unknown as FPLGameweekPicksData["data"][number];
}

function picksFrom(
  entries: FPLGameweekPicksData["data"]
): FPLGameweekPicksData {
  return { data: entries, overall: {} as FPLGameweekPicksData["overall"] };
}

function validSquad(): FPLGameweekPicksData {
  const data: FPLGameweekPicksData["data"] = [];
  let pos = 1;
  const add = (element_type: number, n: number) => {
    for (let i = 0; i < n; i++) data.push(pick(element_type, pos++, (pos % 20) + 1));
  };
  add(1, 2);
  add(2, 5);
  add(3, 5);
  add(4, 3);
  return picksFrom(data);
}

function transfer(outPrice: number, inPrice: number): DraftTransfer {
  return {
    in: { data: {} as PlayerData, price: inPrice },
    out: { data: {} as PlayerData, price: outPrice },
    gameweek: 2,
    type: "transfer",
  };
}

describe("bankAfterTransfer", () => {
  it("adds the out price and subtracts the in price", () => {
    expect(bankAfterTransfer(5, transfer(50, 45))).toBe(10);
  });

  it("goes negative on an overspend", () => {
    expect(bankAfterTransfer(10, transfer(40, 55))).toBe(-5);
  });
});

describe("checkBudget", () => {
  it("is valid when the bank is non-negative", () => {
    expect(checkBudget(10).valid).toBe(true);
    expect(checkBudget(0).valid).toBe(true);
  });

  it("is invalid when the bank is negative", () => {
    expect(checkBudget(-5).valid).toBe(false);
  });
});

describe("validateSquadComposition", () => {
  it("accepts an exact 2/5/5/3 squad", () => {
    expect(validateSquadComposition(validSquad()).valid).toBe(true);
  });

  it("rejects a 15-man squad with a wrong distribution (3 GK / 2 FWD)", () => {
    const data: FPLGameweekPicksData["data"] = [];
    let pos = 1;
    const add = (element_type: number, n: number) => {
      for (let i = 0; i < n; i++) data.push(pick(element_type, pos++, pos + 1));
    };
    add(1, 3);
    add(2, 5);
    add(3, 5);
    add(4, 2);
    const result = validateSquadComposition(picksFrom(data));
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("position 1");
  });

  it("rejects a 14-man squad", () => {
    const data = validSquad().data.slice(0, 14);
    expect(validateSquadComposition(picksFrom(data)).valid).toBe(false);
  });
});

describe("validateMaxPerClub", () => {
  it("accepts exactly 3 players from one club", () => {
    const data: FPLGameweekPicksData["data"] = [
      pick(2, 1, 7),
      pick(2, 2, 7),
      pick(2, 3, 7),
      pick(3, 4, 9),
    ];
    expect(validateMaxPerClub(picksFrom(data)).valid).toBe(true);
  });

  it("rejects 4 players from one club and names the offender", () => {
    const data: FPLGameweekPicksData["data"] = [
      pick(2, 1, 7),
      pick(2, 2, 7),
      pick(2, 3, 7),
      pick(2, 4, 7),
    ];
    const result = validateMaxPerClub(picksFrom(data));
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("7");
  });
});

describe("getNumPlayersByType vs getSquadCountByType", () => {
  it("XI-only count excludes the bench; full count includes it", () => {
    const data: FPLGameweekPicksData["data"] = [
      pick(2, 3),
      pick(2, 4),
      pick(2, 13),
    ];
    const picks = picksFrom(data);
    expect(getNumPlayersByType(2, picks)).toBe(2);
    expect(getSquadCountByType(2, picks)).toBe(3);
  });
});

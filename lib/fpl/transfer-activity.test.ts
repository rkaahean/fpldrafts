import { describe, expect, it } from "vitest";
import {
  chipLabel,
  draftTransferActivity,
  selectTransferActivity,
  type TransferActivity,
} from "./transfer-activity";

const historical: TransferActivity[] = [
  {
    out: { id: "out-1", webName: "Salah", team: "LIV" },
    in: { id: "in-1", webName: "Saka", team: "ARS" },
  },
];

describe("draftTransferActivity", () => {
  it("uses transfer pairs for the selected gameweek and excludes substitutions", () => {
    expect(
      draftTransferActivity(
        [
          {
            gameweek: 5,
            type: "transfer",
            out: { data: { id: "out-1", web_name: "Salah", team_name: "LIV" } },
            in: { data: { id: "in-1", web_name: "Saka", team_name: "ARS" } },
          },
          {
            gameweek: 5,
            type: "substitute",
            out: { data: { id: "out-2", web_name: "Raya", team_name: "ARS" } },
            in: { data: { id: "in-2", web_name: "Pope", team_name: "NEW" } },
          },
        ] as any,
        5
      )
    ).toEqual(historical);
  });
});

describe("selectTransferActivity", () => {
  it("uses completed transfers before the next playable gameweek and draft transfers from then on", () => {
    expect(
      selectTransferActivity({
        currentGameweek: 4,
        nextGameweek: 5,
        historical,
        draftChanges: [],
      })
    ).toEqual({ source: "completed", transfers: historical, activeChip: null });

    expect(
      selectTransferActivity({
        currentGameweek: 5,
        nextGameweek: 5,
        historical,
        draftChanges: [],
      })
    ).toEqual({ source: "planned", transfers: [], activeChip: null });

    expect(
      selectTransferActivity({
        currentGameweek: 38,
        nextGameweek: 38,
        seasonComplete: true,
        historical,
        draftChanges: [],
      })
    ).toEqual({ source: "completed", transfers: historical, activeChip: null });
  });

  it("surfaces the active chip for completed transfers", () => {
    expect(
      selectTransferActivity({
        currentGameweek: 4,
        nextGameweek: 5,
        historical,
        draftChanges: [],
        activeChip: "wildcard",
      })
    ).toEqual({ source: "completed", transfers: historical, activeChip: "wildcard" });
  });

  it("never surfaces a chip for planned transfers, even if one is passed in", () => {
    expect(
      selectTransferActivity({
        currentGameweek: 5,
        nextGameweek: 5,
        historical,
        draftChanges: [],
        activeChip: "wildcard",
      })
    ).toEqual({ source: "planned", transfers: [], activeChip: null });
  });
});

describe("chipLabel", () => {
  it("maps each known chip to its display name", () => {
    expect(chipLabel("wildcard")).toBe("Wildcard");
    expect(chipLabel("freehit")).toBe("Free Hit");
    expect(chipLabel("bboost")).toBe("Bench Boost");
    expect(chipLabel("3xc")).toBe("Triple Captain");
  });

  it("returns null for no chip", () => {
    expect(chipLabel(null)).toBeNull();
  });
});

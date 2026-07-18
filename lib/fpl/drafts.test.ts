import { describe, expect, it } from "vitest";
import { draftTransferSummary, formatDraftGameweeks } from "./drafts";

describe("draftTransferSummary", () => {
  it("summarises transfer count, planned gameweeks, and net cost", () => {
    expect(
      draftTransferSummary([
        { gameweek: 3, in_cost: 85, out_cost: 70 },
        { gameweek: 1, in_cost: 60, out_cost: 75 },
        { gameweek: 3, in_cost: 95, out_cost: 80 },
      ])
    ).toEqual({ count: 3, gameweeks: [1, 3], netCost: 15 });
  });
});

describe("formatDraftGameweeks", () => {
  it("labels the planned gameweeks and handles an empty draft", () => {
    expect(formatDraftGameweeks([2, 5])).toBe("GW 2, GW 5");
    expect(formatDraftGameweeks([])).toBe("No transfers");
  });
});

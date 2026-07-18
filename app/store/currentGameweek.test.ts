import { picksStore } from "@/app/store";
import { beforeEach, describe, expect, it } from "vitest";

describe("setCurrentGameweek (season-end clamping)", () => {
  beforeEach(() => {
    picksStore.setState({ currentGameweek: 1 });
  });

  it("clamps a gameweek beyond the season (39, from a fully-played 38-gameweek season) instead of silently rejecting it", () => {
    picksStore.getState().setCurrentGameweek(39);

    expect(picksStore.getState().currentGameweek).toBe(38);
  });

  it("does not leave currentGameweek stuck at a stale value when passed an out-of-range gameweek", () => {
    picksStore.setState({ currentGameweek: 1 });

    picksStore.getState().setCurrentGameweek(39);

    expect(picksStore.getState().currentGameweek).not.toBe(1);
  });
});

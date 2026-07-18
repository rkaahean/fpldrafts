import { describe, expect, it } from "vitest";
import { teamSessionFields, verifiedTeamId } from "./session";

describe("teamSessionFields", () => {
  it("marks a session as linked and retains its FPL team ID", () => {
    expect(teamSessionFields("team-123")).toEqual({
      hasTeam: true,
      team_id: "team-123",
    });
  });

  it("marks a session without a team as unlinked", () => {
    expect(teamSessionFields(undefined)).toEqual({ hasTeam: false });
  });
});

describe("verifiedTeamId", () => {
  it("accepts only the team ID returned by the ownership check", () => {
    expect(verifiedTeamId("team-123", { id: "team-123" })).toBe("team-123");
    expect(verifiedTeamId("team-123", { id: "team-456" })).toBeUndefined();
    expect(verifiedTeamId("team-123", null)).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";
import { clearTeamId, persistSignInToken, persistTeamId } from "./token";

describe("persistSignInToken", () => {
  it("stores the user and Google ID token when a user signs in", () => {
    const token = persistSignInToken(
      { sub: "google-subject" },
      {
        id: "user-1",
        name: "Ada Lovelace",
        email: "ada@example.com",
        image: "https://example.com/ada.png",
      },
      { id_token: "google-id-token" }
    );

    expect(token).toMatchObject({
      sub: "google-subject",
      id: "user-1",
      name: "Ada Lovelace",
      email: "ada@example.com",
      picture: "https://example.com/ada.png",
      accessToken: "google-id-token",
    });
  });

  it("returns the existing token unchanged on later session validations", () => {
    const existingToken = {
      id: "user-1",
      name: "Ada Lovelace",
      email: "ada@example.com",
      picture: "https://example.com/ada.png",
      accessToken: "google-id-token",
    };

    expect(persistSignInToken(existingToken)).toBe(existingToken);
  });
});

describe("persistTeamId", () => {
  it("stores a newly linked team in the signed token", () => {
    expect(persistTeamId({ id: "user-1" }, "team-123")).toEqual({
      id: "user-1",
      team_id: "team-123",
    });
  });

  it("leaves the signed token unchanged when no team update is supplied", () => {
    const token = { id: "user-1", team_id: "team-123" };

    expect(persistTeamId(token, undefined)).toBe(token);
  });
});

describe("clearTeamId", () => {
  it("removes a stale team association from the token", () => {
    expect(clearTeamId({ id: "user-1", team_id: "old-season-team" })).toEqual({
      id: "user-1",
    });
  });
});

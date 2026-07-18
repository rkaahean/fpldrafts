import { describe, expect, it } from "vitest";
import { formatDraftUpdatedAt } from "./columns";

describe("formatDraftUpdatedAt", () => {
  it("formats a JSON-serialized Prisma date without calling Date methods on a string", () => {
    expect(formatDraftUpdatedAt("2026-07-18T12:00:00.000Z")).toBe("Jul 18");
  });
});

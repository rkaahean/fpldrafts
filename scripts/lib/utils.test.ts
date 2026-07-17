import { describe, expect, it } from "vitest";
import { elementTypeToPosition } from "./utils";

describe("elementTypeToPosition", () => {
  it("maps 1 -> GK", () => expect(elementTypeToPosition(1)).toBe("GK"));
  it("maps 2 -> DEF", () => expect(elementTypeToPosition(2)).toBe("DEF"));
  it("maps 3 -> MID", () => expect(elementTypeToPosition(3)).toBe("MID"));
  it("maps 4 -> FWD", () => expect(elementTypeToPosition(4)).toBe("FWD"));
  it("maps unknown -> None", () => {
    expect(elementTypeToPosition(0)).toBe("None");
    expect(elementTypeToPosition(5)).toBe("None");
  });
});

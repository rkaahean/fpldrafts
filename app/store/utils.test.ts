import { describe, expect, it } from "vitest";

describe("app/store/utils", () => {
  it("no longer exports bucket-shaped transfer helpers", async () => {
    const utils = await import("@/app/store/utils");
    expect((utils as any).updateTransfer).toBeUndefined();
    expect((utils as any).removeTransfer).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";
import { runWithConcurrencyLimit } from "./concurrency";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("runWithConcurrencyLimit", () => {
  it("resolves all items when count is less than the limit", async () => {
    const results = await runWithConcurrencyLimit(
      [1, 2, 3],
      10,
      async (item) => item * 2
    );

    expect(results).toEqual([
      { item: 1, status: "fulfilled", value: 2 },
      { item: 2, status: "fulfilled", value: 4 },
      { item: 3, status: "fulfilled", value: 6 },
    ]);
  });

  it("never runs more than the limit concurrently", async () => {
    const items = Array.from({ length: 20 }, (_, i) => i);
    let inFlight = 0;
    let maxInFlight = 0;

    await runWithConcurrencyLimit(items, 3, async (item) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight--;
      return item;
    });

    expect(maxInFlight).toBeLessThanOrEqual(3);
  });

  it("isolates a rejected task without affecting the others", async () => {
    const results = await runWithConcurrencyLimit(
      [1, 2, 3],
      2,
      async (item) => {
        if (item === 2) {
          throw new Error("boom");
        }
        return item;
      }
    );

    expect(results[0]).toEqual({ item: 1, status: "fulfilled", value: 1 });
    expect(results[1].status).toBe("rejected");
    expect((results[1] as { reason: unknown }).reason).toBeInstanceOf(Error);
    expect(results[2]).toEqual({ item: 3, status: "fulfilled", value: 3 });
  });

  it("preserves input order in the returned results regardless of completion order", async () => {
    const { promise: slow, resolve: resolveSlow } = deferred<number>();

    const runPromise = runWithConcurrencyLimit(
      [1, 2],
      2,
      async (item) => (item === 1 ? slow : Promise.resolve(item))
    );

    resolveSlow(1);
    const results = await runPromise;

    expect(results.map((r) => r.item)).toEqual([1, 2]);
  });

  it("handles limit greater than or equal to items length", async () => {
    const results = await runWithConcurrencyLimit([1, 2], 5, async (item) => item);
    expect(results).toHaveLength(2);
  });

  it("handles an empty items array", async () => {
    const results = await runWithConcurrencyLimit(
      [] as number[],
      5,
      async (item) => item
    );
    expect(results).toEqual([]);
  });
});

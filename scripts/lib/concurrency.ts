export type SettledResult<T, R> =
  | { item: T; status: "fulfilled"; value: R }
  | { item: T; status: "rejected"; reason: unknown };

export async function runWithConcurrencyLimit<T, R>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<R>
): Promise<SettledResult<T, R>[]> {
  const results: SettledResult<T, R>[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      const item = items[index];
      try {
        const value = await task(item);
        results[index] = { item, status: "fulfilled", value };
      } catch (reason) {
        results[index] = { item, status: "rejected", reason };
      }
    }
  }

  const workerCount = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

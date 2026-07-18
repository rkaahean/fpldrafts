import { vi } from "vitest";

type Store = Map<string, Record<string, unknown>[]>;

function matches(row: Record<string, unknown>, where: Record<string, unknown> = {}) {
  return Object.entries(where).every(([key, condition]) => {
    if (condition && typeof condition === "object" && "in" in (condition as object)) {
      return (condition as { in: unknown[] }).in.includes(row[key]);
    }
    return row[key] === condition;
  });
}

export function createMockPrisma() {
  const store: Store = new Map();

  const table = (name: string) => {
    if (!store.has(name)) {
      store.set(name, []);
    }
    return store.get(name)!;
  };

  const model = (name: string) => ({
    findMany: vi.fn(
      async ({
        where,
      }: { where?: Record<string, unknown>; orderBy?: unknown } = {}) =>
        table(name).filter((row) => matches(row, where))
    ),
    findFirst: vi.fn(async ({ where }: { where?: Record<string, unknown> } = {}) =>
      table(name).find((row) => matches(row, where)) ?? null
    ),
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
      const row = { id: `mock-${table(name).length + 1}`, ...data };
      table(name).push(row);
      return row;
    }),
    createMany: vi.fn(async ({ data }: { data: Record<string, unknown>[] }) => {
      table(name).push(...data);
      return { count: data.length };
    }),
    upsert: vi.fn(
      async ({
        where,
        create,
        update,
      }: {
        where: Record<string, unknown>;
        create: Record<string, unknown>;
        update: Record<string, unknown>;
      }) => {
        const rows = table(name);
        const whereValue = Object.values(where)[0] as Record<string, unknown>;
        const existing = rows.find((row) => matches(row, whereValue));
        if (existing) {
          Object.assign(existing, update);
          return existing;
        }
        const row = { id: `mock-${rows.length + 1}`, ...create };
        rows.push(row);
        return row;
      }
    ),
    update: vi.fn(
      async ({
        where,
        data,
      }: {
        where: Record<string, unknown>;
        data: Record<string, unknown>;
      }) => {
        const rows = table(name);
        const whereValue = Object.values(where)[0] as Record<string, unknown>;
        const existing = rows.find((row) => matches(row, whereValue));
        if (!existing) {
          throw new Error(`Record not found in ${name}`);
        }
        Object.assign(existing, data);
        return existing;
      }
    ),
    aggregate: vi.fn(
      async ({ where, _max }: { where?: Record<string, unknown>; _max?: Record<string, boolean> } = {}) => {
        const rows = table(name).filter((row) => matches(row, where));
        const field = _max ? Object.keys(_max)[0] : undefined;
        const max = field
          ? rows.reduce<number | null>((acc, row) => {
              const value = row[field] as number | undefined;
              if (value === undefined) return acc;
              return acc === null ? value : Math.max(acc, value);
            }, null)
          : null;
        return { _max: { [field ?? "value"]: max } };
      }
    ),
  });

  const client = {
    fPLTeam: model("FPLTeam"),
    fPLPlayer: model("FPLPlayer"),
    fPLPlayerTeam: model("FPLPlayerTeam"),
    fPLFixtures: model("FPLFixtures"),
    fPLGameweekPicks: model("FPLGameweekPicks"),
    fPLGameweekOverallStats: model("FPLGameweekOverallStats"),
    fPLGameweekPlayerStats: model("FPLGameweekPlayerStats"),
    fPLGameweekTransfers: model("FPLGameweekTransfers"),
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === "function") {
        return arg(client);
      }
      return Promise.all(arg as Promise<unknown>[]);
    }),
    $disconnect: vi.fn(async () => undefined),
    seed(name: string, rows: Record<string, unknown>[]) {
      table(name).push(...rows);
    },
    tableRows(name: string) {
      return table(name);
    },
  };

  return client;
}

export type MockPrisma = ReturnType<typeof createMockPrisma>;

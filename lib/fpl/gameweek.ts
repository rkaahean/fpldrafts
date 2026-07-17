import { swapPlayers } from "./swap";
import type {
  DraftTransfer,
  FPLGameweekPicksData,
  PlayerData,
} from "./types";

export interface ResolveGameweekPicksInput {
  parsed: FPLGameweekPicksData;
  dbbase: FPLGameweekPicksData | undefined;
  draftChanges: DraftTransfer[];
  currentGameweek: number;
  transfersOut: { [key: number]: PlayerData[] };
}

export interface ResolveGameweekPicksResult {
  base: FPLGameweekPicksData | undefined;
  setBase: boolean;
  picks: FPLGameweekPicksData;
  committedBank: number;
}

export function selectBase(
  parsed: FPLGameweekPicksData,
  dbbase: FPLGameweekPicksData | undefined
): { base: FPLGameweekPicksData | undefined; setBase: boolean } {
  if (parsed.data.length > 0) {
    return { base: parsed, setBase: true };
  }
  return { base: dbbase, setBase: false };
}

export function sumTransferOut(transfersOut: {
  [key: number]: PlayerData[];
}): number {
  return Object.values(transfersOut).reduce(
    (total, players) =>
      total +
      players.reduce((sum, player) => sum + (player.selling_price || 0), 0),
    0
  );
}

export async function applyDrafts(
  base: FPLGameweekPicksData,
  draftChanges: DraftTransfer[],
  currentGameweek: number
): Promise<FPLGameweekPicksData> {
  const relevant = draftChanges.filter(
    (draft) => draft.gameweek <= currentGameweek
  );
  let draftData = base;
  for (const draftChange of relevant) {
    draftData = await swapPlayers(draftData, draftChange);
  }
  return draftData;
}

export async function resolveGameweekPicks({
  parsed,
  dbbase,
  draftChanges,
  currentGameweek,
  transfersOut,
}: ResolveGameweekPicksInput): Promise<
  ResolveGameweekPicksResult | undefined
> {
  const { base, setBase } = selectBase(parsed, dbbase);

  if (!base || !base.data || base.data.length === 0) {
    return undefined;
  }

  const draftData = await applyDrafts(base, draftChanges, currentGameweek);

  const committedBank = draftData.overall.bank;
  const displayBank = committedBank + sumTransferOut(transfersOut);

  const picks: FPLGameweekPicksData = {
    data: draftData.data,
    overall: { ...draftData.overall, bank: displayBank },
  };

  return { base, setBase, picks, committedBank };
}

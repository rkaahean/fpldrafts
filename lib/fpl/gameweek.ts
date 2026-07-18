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

export function computeNextGameweek(maxPlayedGameweek: number | null): number {
  const next = maxPlayedGameweek ? maxPlayedGameweek + 1 : 1;
  return Math.min(next, 38);
}

export function buildInitialGameweekPayload(
  allPlayers: {
    id: string;
    element_type: number;
    now_value: number;
    position?: number;
  }[]
): FPLGameweekPicksData {
  const gks = allPlayers
    .filter((player) => player.element_type == 1)
    .slice(0, 2);
  gks[0].position = 1;
  gks[1].position = 12;

  const defs = allPlayers
    .filter((player) => player.element_type == 2)
    .slice(0, 5);
  defs[0].position = 2;
  defs[1].position = 3;
  defs[2].position = 4;
  defs[3].position = 13;
  defs[4].position = 14;

  const mids = allPlayers
    .filter((player) => player.element_type == 3)
    .slice(0, 5);
  mids[0].position = 5;
  mids[1].position = 6;
  mids[2].position = 7;
  mids[3].position = 8;
  mids[4].position = 9;

  const fwds = allPlayers
    .filter((player) => player.element_type == 4)
    .slice(0, 3);
  fwds[0].position = 10;
  fwds[1].position = 11;
  fwds[2].position = 15;

  const selectedPlayers = [gks, defs, mids, fwds].flat();
  const totalValue = selectedPlayers.reduce(
    (sum, player) => sum + player.now_value,
    0
  );

  const playerData = selectedPlayers.map((player) => ({
    position: player.position!,
    fpl_player: {
      player_id: player.id,
      fpl_player_team: {
        home_fixtures: [],
        away_fixtures: [],
      },
      selling_price: player.now_value,
      ...player,
    },
  })) as unknown as FPLGameweekPicksData["data"];

  return {
    data: playerData,
    overall: {
      bank: 1000 - totalValue,
      value: totalValue,
      overall_rank: 0,
      points: 0,
    } as FPLGameweekPicksData["overall"],
    transfers: [],
  };
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

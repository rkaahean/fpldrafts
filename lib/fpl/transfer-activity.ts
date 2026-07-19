import type { DraftTransfer } from "@/app/store/utils";

export type TransferActivity = {
  out: { id: string; webName: string; team: string };
  in: { id: string; webName: string; team: string };
};

export type TransferActivitySource = "completed" | "planned";

export function draftTransferActivity(
  changes: DraftTransfer[],
  gameweek: number
): TransferActivity[] {
  return changes
    .filter(
      (change) => change.gameweek === gameweek && change.type === "transfer"
    )
    .map((change) => ({
      out: {
        id: change.out.data.id,
        webName: change.out.data.web_name,
        team: change.out.data.team_name,
      },
      in: {
        id: change.in.data.id,
        webName: change.in.data.web_name,
        team: change.in.data.team_name,
      },
    }));
}

const CHIP_LABELS: Record<string, string> = {
  wildcard: "Wildcard",
  freehit: "Free Hit",
  bboost: "Bench Boost",
  "3xc": "Triple Captain",
};

export function chipLabel(chip: string | null): string | null {
  if (!chip) {
    return null;
  }
  return CHIP_LABELS[chip] ?? null;
}

export function selectTransferActivity({
  currentGameweek,
  nextGameweek,
  seasonComplete = false,
  historical,
  draftChanges,
  activeChip = null,
}: {
  currentGameweek: number;
  nextGameweek: number;
  seasonComplete?: boolean;
  historical: TransferActivity[];
  draftChanges: DraftTransfer[];
  activeChip?: string | null;
}): {
  source: TransferActivitySource;
  transfers: TransferActivity[];
  activeChip: string | null;
} {
  if (
    currentGameweek < nextGameweek ||
    (seasonComplete && currentGameweek === nextGameweek)
  ) {
    return { source: "completed", transfers: historical, activeChip };
  }

  return {
    source: "planned",
    transfers: draftTransferActivity(draftChanges, currentGameweek),
    activeChip: null,
  };
}

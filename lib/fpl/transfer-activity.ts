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

export function selectTransferActivity({
  currentGameweek,
  nextGameweek,
  historical,
  draftChanges,
}: {
  currentGameweek: number;
  nextGameweek: number;
  historical: TransferActivity[];
  draftChanges: DraftTransfer[];
}): { source: TransferActivitySource; transfers: TransferActivity[] } {
  if (currentGameweek < nextGameweek) {
    return { source: "completed", transfers: historical };
  }

  return {
    source: "planned",
    transfers: draftTransferActivity(draftChanges, currentGameweek),
  };
}

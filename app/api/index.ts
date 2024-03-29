import prisma from "../../lib/db";

export async function getPlayerData(id: number) {
  // get from prisma
  const players = await prisma.fPLPlayer.findMany({
    where: {
      player_id: id,
    },
  });
  return players;
}

export async function getGameweekData(gameweek: number) {
  const picks = await prisma.fPLGameweekPicks.findMany({
    where: {
      gameweek,
    },
  });
  return picks;
}

export async function getGameweekPicksData(gameweek: number) {
  const result = await prisma.fPLGameweekPicks.findMany({
    include: {
      fpl_player: {
        // Include the related FPLPlayer record
        select: {
          player_id: true,
          web_name: true,
          team_code: true,
          element_type: true,
          total_points: true,
          expected_goal_involvements_per_90: true,
          fpl_player_team: {
            select: {
              short_name: true,
              home_fixtures: {
                select: {
                  fpl_team_a: {
                    select: {
                      short_name: true,
                    },
                  },
                  id: true,
                  event: true,
                },
                where: {
                  event: {
                    gte: gameweek,
                  },
                },
              },
              away_fixtures: {
                select: {
                  fpl_team_h: {
                    select: {
                      short_name: true,
                    },
                  },
                  id: true,
                  event: true,
                },
                where: {
                  event: {
                    gte: gameweek,
                  },
                },
              },
            },
          },
        },
      },
    },
    where: {
      gameweek,
    },
  });
  return result;
}
export type FPLGameweekPicksData = Awaited<
  ReturnType<typeof getGameweekPicksData>
>;

export async function getAllPlayerData() {
  // sort by total_points
  const players = await prisma.fPLPlayer.findMany({
    orderBy: {
      total_points: "desc",
    },
  });
  return players;
}

export async function createDraft(request: {
  name: string;
  team_id: string;
  gameweek: number;
  description: string;
  changes: {
    in: number;
    out: number;
    gameweek: number;
  }[];
}) {
  const draft = await prisma.fPLDrafts.create({
    data: {
      name: request.name,
      fpl_team_id: request.team_id,
      base_gameweek: request.gameweek,
      description: request.description,
    },
  });

  const data = request.changes.map((change) => {
    return {
      player_in_id: change.in,
      player_out_id: change.out,
      gameweek: change.gameweek,
      fpl_draft_id: draft.id,
    };
  });

  await prisma.fPLDraftTransfers.createMany({
    data,
  });
}

export async function getAllDrafts() {
  return await prisma.fPLDrafts.findMany();
}

export async function getDraftTransfers(draftId: string) {
  return await prisma.fPLDraftTransfers.findMany({
    where: {
      fpl_draft_id: draftId,
    },
  });
}

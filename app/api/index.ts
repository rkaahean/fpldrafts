import prisma from "../../lib/db";
import { DraftTransfer } from "../store";

export async function getPlayerData(id: number, gameweek: number = 1) {
  // get from prisma
  const players = await prisma.fPLPlayer.findFirst({
    // Include the related FPLPlayer record
    select: {
      player_id: true,
      web_name: true,
      team_code: true,
      element_type: true,
      total_points: true,
      expected_goal_involvements_per_90: true,
      now_value: true,
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
      fpl_gameweek_player_stats: {
        select: {
          value: true,
        },
        where: {
          gameweek,
        },
      },
    },
    where: {
      player_id: id,
    },
  });
  return players;
}

export async function getPlayerStaticData(id: number) {
  return await prisma.fPLPlayer.findFirst({
    select: {
      element_type: true,
      fpl_player_team: {
        select: {
          code: true,
          name: true,
        },
      },
    },
    where: {
      player_id: id,
    },
  });
}

export async function getGameweekData(gameweek: number) {
  const picks = await prisma.fPLGameweekPicks.findMany({
    where: {
      gameweek,
    },
  });
  return picks;
}

/**
 *
 * @param gameweek Gameweek data to fetch
 * @returns
 */
export async function getGameweekOverallData(gameweek: number) {
  return await prisma.fPLGameweekOverallStats.findFirst({
    where: {
      gameweek,
    },
    select: {
      value: true,
      overall_rank: true,
      bank: true,
    },
  });
}

export async function getGameweekPicksData(gameweek: number) {
  const result = await prisma.fPLGameweekPicks.findMany({
    select: {
      position: true,
      fpl_player: {
        // Include the related FPLPlayer record
        select: {
          id: true,
          player_id: true,
          web_name: true,
          team_code: true,
          element_type: true,
          total_points: true,
          expected_goal_involvements_per_90: true,
          now_value: true,
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
          fpl_gameweek_player_stats: {
            select: {
              value: true,
            },
            where: {
              gameweek,
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

export async function getLastTransferValue(team_id: string, player_id: string) {
  return await prisma.fPLGameweekTransfers.findFirst({
    where: {
      in_player_id: player_id,
      fpl_team_id: team_id,
    },
    orderBy: {
      time: "desc",
    },
    select: {
      in_player_cost: true,
    },
  });
}

export async function getPlayerValueByGameweek(
  player_id: string,
  gameweek: number
) {
  return await prisma.fPLGameweekPlayerStats.findFirst({
    where: {
      fpl_player_id: player_id,
      gameweek: gameweek,
    },
    select: {
      value: true,
    },
  });
}
export type FPLGameweekPicksData = {
  data: Awaited<ReturnType<typeof getGameweekPicksData>>;
  overall: NonNullable<Awaited<ReturnType<typeof getGameweekOverallData>>>;
};
export type FPLPlayerData = Pick<
  FPLGameweekPicksData["data"][number],
  "fpl_player"
> & {
  selling_price: number;
  position: number;
};

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
  bank: number;
  changes: DraftTransfer[];
}) {
  const draft = await prisma.fPLDrafts.create({
    data: {
      name: request.name,
      fpl_team_id: request.team_id,
      base_gameweek: request.gameweek,
      description: request.description,
      bank: request.bank,
    },
  });

  const data = request.changes.map((change) => {
    return {
      player_in_id: change.in,
      player_out_id: change.out,
      gameweek: change.gameweek,
      fpl_draft_id: draft.id,
      in_cost: change.in_cost,
      out_cost: change.out_cost,
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

export async function deleteDraft(draftId: string) {
  return await prisma.fPLDrafts.delete({
    where: {
      id: draftId,
    },
  });
}

export async function getAllFixtures() {
  return await prisma.fPLFixtures.findMany({
    select: {
      code: true,
      event: true,
      team_h_id: true,
      team_a_id: true,
      fpl_team_h: {
        select: {
          short_name: true,
        },
      },
      fpl_team_a: {
        select: {
          short_name: true,
        },
      },
    },
    where: {
      event: {
        gte: 34,
      },
    },
    orderBy: {
      event: "asc",
    },
  });
}

export type FPLFixtures = Awaited<ReturnType<typeof getAllFixtures>>[number];
export async function getLatestGameweek() {
  return prisma.fPLGameweekPicks.aggregate({
    _max: {
      gameweek: true,
    },
  });
}

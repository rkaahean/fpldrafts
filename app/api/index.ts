import prisma from "../../lib/db";
import { DraftTransfer } from "../store/utils";

export async function getUserTeamFromEmail(email: string, seasonId: string) {
  const user_data = await prisma.user.findFirst({
    select: {
      id: true,
      fpl_teams: {
        select: {
          id: true,
        },
        where: {
          fpl_season_id: seasonId,
        },
      },
    },
    where: {
      email,
    },
  })!;
  const teamId = user_data!.fpl_teams[0].id!;

  return {
    userId: user_data?.id,
    teamId,
  };
}

export async function getPlayerData(
  id: number,
  gameweek: number = 1,
  season_id: string
) {
  // get from prisma
  const players = await prisma.fPLPlayer.findFirst({
    // Include the related FPLPlayer record
    select: {
      id: true,
      player_id: true,
      web_name: true,
      team_code: true,
      element_type: true,
      total_points: true,
      expected_assists_per_90: true,
      expected_goals_per_90: true,
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
              season_id,
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
              season_id,
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
      season_id,
    },
  });
  return players;
}

export async function getPlayerDataBySeason(
  season_id: string,
  player_filter?: number[]
) {
  // get from prisma
  const players = await prisma.fPLPlayer.findMany({
    // Include the related FPLPlayer record
    select: {
      id: true,
      player_id: true,
      web_name: true,
      team_code: true,
      element_type: true,
      total_points: true,
      expected_assists_per_90: true,
      expected_goals_per_90: true,
      expected_goal_involvements_per_90: true,
      now_value: true,
      goals_scored: true,
      assists: true,
      fpl_player_team: {
        select: {
          short_name: true,
          home_fixtures: {
            where: {
              season_id,
            },
            select: {
              fpl_team_a: {
                select: {
                  short_name: true,
                },
              },
              id: true,
              event: true,
            },
          },
          away_fixtures: {
            where: {
              season_id,
            },
            select: {
              fpl_team_h: {
                select: {
                  short_name: true,
                },
              },
              id: true,
              event: true,
            },
          },
        },
      },
      fpl_gameweek_player_stats: {
        select: {
          value: true,
        },
      },
    },
    where: {
      season_id,
      ...(player_filter && { player_id: { in: player_filter } }),
    },
    orderBy: {
      total_points: "desc",
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

export async function getGameweekPicksData(gameweek: number, team_id: string) {
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
      fpl_team_id: team_id,
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
  data: (Awaited<ReturnType<typeof getGameweekPicksData>>[number] & {
    selling_price: number;
  })[];
  overall: NonNullable<Awaited<ReturnType<typeof getGameweekOverallData>>>;
};
export type FPLPlayerData = Pick<
  FPLGameweekPicksData["data"][number],
  "fpl_player"
> & {
  selling_price: number;
  position: number;
};

export type FPLPlayerData2 = NonNullable<
  Awaited<ReturnType<typeof getPlayerData>>
> & {
  selling_price?: number;
  position?: number;
};

export async function createDraft(request: {
  name: string;
  teamId: string;
  gameweek: number;
  description: string;
  bank: number;
  changes: DraftTransfer[];
}) {
  const draft = await prisma.fPLDrafts.create({
    data: {
      name: request.name,
      fpl_team_id: request.teamId,
      base_gameweek: request.gameweek,
      description: request.description,
      bank: request.bank,
    },
  });

  const data = request.changes.map((change) => {
    return {
      player_in_id: change.in.data.id,
      player_out_id: change.out.data.id,
      gameweek: change.gameweek,
      fpl_draft_id: draft.id,
      in_cost: change.in.price,
      out_cost: change.out.price,
    };
  });

  await prisma.fPLDraftTransfers.createMany({
    data,
  });

  return draft.id;
}

export async function getDraftTransfers(
  draftId: string,
  teamId: string,
  seasonId: string
) {
  return await prisma.fPLDrafts.findUnique({
    select: {
      id: true,
      bank: true,
      name: true,
      description: true,
      base_gameweek: true,
      FPLDraftTransfers: {
        select: {
          gameweek: true,
          in_cost: true,
          in_fpl_player: {
            select: {
              id: true,
              player_id: true,
              web_name: true,
              team_code: true,
              element_type: true,
              total_points: true,
              expected_assists: true,
              expected_assists_per_90: true,
              expected_goals: true,
              expected_goals_per_90: true,
              expected_goal_involvements: true,
              expected_goal_involvements_per_90: true,
              now_value: true,
              goals_scored: true,
              assists: true,
              fpl_player_team: {
                select: {
                  short_name: true,
                  home_fixtures: {
                    where: {
                      season_id: seasonId,
                    },
                    select: {
                      fpl_team_a: {
                        select: {
                          short_name: true,
                        },
                      },
                      id: true,
                      event: true,
                    },
                  },
                  away_fixtures: {
                    where: {
                      season_id: seasonId,
                    },
                    select: {
                      fpl_team_h: {
                        select: {
                          short_name: true,
                        },
                      },
                      id: true,
                      event: true,
                    },
                  },
                },
              },
              fpl_gameweek_player_stats: {
                select: {
                  value: true,
                },
              },
            },
          },
          out_cost: true,
          out_fpl_player: {
            select: {
              id: true,
              player_id: true,
              web_name: true,
              team_code: true,
              element_type: true,
              total_points: true,
              expected_assists: true,
              expected_assists_per_90: true,
              expected_goals: true,
              expected_goals_per_90: true,
              expected_goal_involvements: true,
              expected_goal_involvements_per_90: true,
              now_value: true,
              goals_scored: true,
              assists: true,
              fpl_player_team: {
                select: {
                  short_name: true,
                  home_fixtures: {
                    where: {
                      season_id: seasonId,
                    },
                    select: {
                      fpl_team_a: {
                        select: {
                          short_name: true,
                        },
                      },
                      id: true,
                      event: true,
                    },
                  },
                  away_fixtures: {
                    where: {
                      season_id: seasonId,
                    },
                    select: {
                      fpl_team_h: {
                        select: {
                          short_name: true,
                        },
                      },
                      id: true,
                      event: true,
                    },
                  },
                },
              },
              fpl_gameweek_player_stats: {
                select: {
                  value: true,
                },
              },
            },
          },
        },
      },
    },
    where: {
      id: draftId,
      fpl_team_id: teamId,
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

export async function getAllFixtures(
  gameweek: number,
  count: number,
  seasonId: string
) {
  return await prisma.fPLFixtures.findMany({
    select: {
      code: true,
      event: true,
      team_h_id: true,
      team_a_id: true,
      fpl_team_h: {
        select: {
          short_name: true,
          name: true,
        },
      },
      fpl_team_a: {
        select: {
          short_name: true,
          name: true,
        },
      },
    },
    where: {
      event: {
        gte: gameweek,
        lte: gameweek + count,
      },
      season_id: seasonId,
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

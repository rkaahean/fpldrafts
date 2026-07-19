import { jwtDecode } from "jwt-decode";
import {
  assembleGameweekBaseData,
  assembleGameweekPicks,
  groupFixturesForTeamCodes,
  type GameweekBaseQueryResult,
  type GameweekFixtureRow,
  type GameweekPickRow,
  computeNextGameweek,
} from "@/lib/fpl/gameweek";
import type { TransferActivity } from "@/lib/fpl/transfer-activity";
import type { GameweekTrendPoint } from "@/lib/fpl/gameweek-trends";
import prisma from "../../scripts/lib/db";
import { DraftTransfer } from "../store/utils";
import type { Session } from "next-auth";

export async function getUserTeamFromEmail(email: string, seasonId: string) {
  const team = await prisma.fPLTeam.findFirst({
    select: {
      id: true,
      user_id: true,
    },
    where: {
      fpl_season_id: seasonId,
      user: { email },
    },
  });

  if (!team) {
    throw new Error("No FPL team found for this user and season");
  }

  return {
    userId: team.user_id,
    teamId: team.id,
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
      minutes: true,
      expected_goals: true,
      expected_assists: true,
      expected_goals_conceded: true,
      goals_conceded: true,
      influence: true,
      creativity: true,
      threat: true,
      ict_index: true,
      saves: true,
      yellow_cards: true,
      red_cards: true,
      starts: true,
      selected_by_percent: true,
      points_per_game: true,
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
              team_a_difficulty: true,
              team_h_difficulty: true,
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
              team_a_difficulty: true,
              team_h_difficulty: true,
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
          gameweek: true,
          total_points: true,
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

export async function getPlayerGameweekHistory(
  playerId: number,
  seasonId: string
) {
  return prisma.fPLGameweekPlayerStats.findMany({
    where: {
      fpl_player: { player_id: playerId, season_id: seasonId },
    },
    select: {
      gameweek: true,
      total_points: true,
      value: true,
      expected_goals: true,
      expected_assists: true,
    },
    orderBy: { gameweek: "asc" },
  });
}

export async function getPlayerDataBySeason(
  season_id: string,
  player_filter?: number[],
  currentGameweek?: number,
  lastCompletedGameweek = currentGameweek
    ? Math.max(0, currentGameweek - 1)
    : undefined
) {
  const fixtureWhere = currentGameweek
    ? {
        season_id,
        event: {
          gte: currentGameweek,
          lte: currentGameweek + 4,
        },
      }
    : { season_id };
  const statsWhere = lastCompletedGameweek
    ? {
        gameweek: {
          gte: Math.max(1, lastCompletedGameweek - 4),
          lte: lastCompletedGameweek,
        },
      }
    : undefined;

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
      expected_assists: true,
      expected_assists_per_90: true,
      expected_goals: true,
      expected_goals_per_90: true,
      expected_goal_involvements: true,
      expected_goal_involvements_per_90: true,
      now_value: true,
      goals_scored: true,
      assists: true,
      minutes: true,
      clean_sheets: true,
      saves: true,
      bonus: true,
      bps: true,
      defensive_contribution: true,
      fpl_player_team: {
        select: {
          short_name: true,
          home_fixtures: {
            where: fixtureWhere,
            select: {
              fpl_team_a: {
                select: {
                  short_name: true,
                },
              },
              id: true,
              event: true,
              team_h_difficulty: true,
              team_a_difficulty: true,
            },
          },
          away_fixtures: {
            where: fixtureWhere,
            select: {
              fpl_team_h: {
                select: {
                  short_name: true,
                },
              },
              id: true,
              event: true,
              team_h_difficulty: true,
              team_a_difficulty: true,
            },
          },
        },
      },
      fpl_gameweek_player_stats: {
        where: statsWhere,
        select: {
          value: true,
          gameweek: true,
          total_points: true,
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

export async function getGameweekOverallData(gameweek: number, teamId: string) {
  return await prisma.fPLGameweekOverallStats.findFirst({
    where: {
      gameweek,
      fpl_team_id: teamId,
    },
    select: {
      value: true,
      overall_rank: true,
      bank: true,
      points: true,
    },
  });
}

type GameweekBaseQueryRow = {
  pickRows: GameweekPickRow[];
  fixtureRows: GameweekFixtureRow[];
  overall: GameweekBaseQueryResult["overall"];
  transferCount: number;
  transfers: { in_player_id: string; in_player_cost: number; time: string }[];
  transferActivity: TransferActivity[];
  activeChip: string | null;
  priceStats: { fpl_player_id: string; value: number }[];
  history: GameweekTrendPoint[];
};

export async function getGameweekBaseData(
  gameweek: number,
  teamId: string,
  fromTransferGameweek: number,
  toTransferGameweek: number,
  priceGameweek: number,
  transferActivityGameweek: number,
  recordTiming?: (label: string, durationMs: number) => void
) {
  const startedAt = performance.now();
  const [row] = await prisma.$queryRaw<GameweekBaseQueryRow[]>`
    WITH pick_rows AS (
      SELECT
        pick."position",
        player."id" AS "fpl_player_id",
        player."player_id",
        player."web_name",
        player."team_code",
        player."element_type",
        player."total_points",
        player."expected_goal_involvements_per_90",
        player."now_value",
        player."clean_sheets",
        player."bonus",
        player."bps",
        player."defensive_contribution",
        player."form",
        player."status",
        player."chance_of_playing_next_round",
        player."news",
        player."saves",
        player."influence",
        player."creativity",
        player."threat",
        player."ict_index",
        player."yellow_cards",
        player."red_cards",
        player."starts",
        player."selected_by_percent",
        player."points_per_game",
        player."expected_goals",
        player."expected_assists",
        player."expected_goals_conceded",
        player."goals_conceded",
        player."expected_assists_per_90",
        player."expected_goals_per_90",
        player."saves_per_90",
        player_team."short_name" AS "team_short_name",
        COALESCE(
          array_agg(stat."value") FILTER (WHERE stat."id" IS NOT NULL),
          ARRAY[]::INTEGER[]
        ) AS "stat_values"
      FROM "FPLGameweekPicks" AS pick
      JOIN "FPLPlayer" AS player ON player."id" = pick."fpl_player_id"
      JOIN "FPLPlayerTeam" AS player_team
        ON player_team."code" = player."team_code"
        AND player_team."season_id" = player."season_id"
      LEFT JOIN "FPLGameweekPlayerStats" AS stat
        ON stat."fpl_player_id" = player."id"
        AND stat."gameweek" = ${gameweek}
      WHERE pick."gameweek" = ${gameweek}
        AND pick."fpl_team_id" = ${teamId}
      GROUP BY
        pick."position",
        player."id",
        player."player_id",
        player."web_name",
        player."team_code",
        player."element_type",
        player."total_points",
        player."expected_goal_involvements_per_90",
        player."now_value",
        player."clean_sheets",
        player."bonus",
        player."bps",
        player."defensive_contribution",
        player."form",
        player."status",
        player."chance_of_playing_next_round",
        player."news",
        player."saves",
        player."influence",
        player."creativity",
        player."threat",
        player."ict_index",
        player."yellow_cards",
        player."red_cards",
        player."starts",
        player."selected_by_percent",
        player."points_per_game",
        player."expected_goals",
        player."expected_assists",
        player."expected_goals_conceded",
        player."goals_conceded",
        player."expected_assists_per_90",
        player."expected_goals_per_90",
        player."saves_per_90",
        player_team."short_name"
    ), player_ids AS (
      SELECT "fpl_player_id" FROM pick_rows
    ), fixture_rows AS (
      SELECT
        fixture."id",
        fixture."event",
        fixture."team_h_difficulty",
        fixture."team_a_difficulty",
        home_team."code" AS "home_team_code",
        away_team."code" AS "away_team_code",
        home_team."short_name" AS "home_team_short_name",
        away_team."short_name" AS "away_team_short_name"
      FROM "FPLFixtures" AS fixture
      JOIN "FPLPlayerTeam" AS home_team ON home_team."id" = fixture."team_h_id"
      JOIN "FPLPlayerTeam" AS away_team ON away_team."id" = fixture."team_a_id"
      WHERE fixture."season_id" = ${process.env.FPL_SEASON_ID!}
        AND fixture."event" BETWEEN ${gameweek} AND ${gameweek + 4}
        AND (
          home_team."code" IN (SELECT "team_code" FROM pick_rows)
          OR away_team."code" IN (SELECT "team_code" FROM pick_rows)
        )
    )
    SELECT
      COALESCE(
        (SELECT jsonb_agg(to_jsonb(pick_row) ORDER BY pick_row."position") FROM pick_rows AS pick_row),
        '[]'::jsonb
      ) AS "pickRows",
      COALESCE(
        (SELECT jsonb_agg(to_jsonb(fixture_row) ORDER BY fixture_row."event") FROM fixture_rows AS fixture_row),
        '[]'::jsonb
      ) AS "fixtureRows",
      (
        SELECT to_jsonb(overall_row)
        FROM (
          SELECT "value", "overall_rank", "bank", "points", "total_points"
          FROM "FPLGameweekOverallStats"
          WHERE "gameweek" = ${gameweek}
            AND "fpl_team_id" = ${teamId}
          LIMIT 1
        ) AS overall_row
      ) AS "overall",
      COALESCE(
        (
          SELECT jsonb_agg(to_jsonb(overall_history_row) ORDER BY overall_history_row."gameweek")
          FROM (
            SELECT
              "gameweek",
              "points",
              "total_points",
              "overall_rank",
              "value",
              "bank",
              "event_transfers",
              "event_transfers_cost"
            FROM "FPLGameweekOverallStats"
            WHERE "fpl_team_id" = ${teamId}
              AND "gameweek" <= ${gameweek}
          ) AS overall_history_row
        ),
        '[]'::jsonb
      ) AS "history",
      (
        SELECT COUNT(*)::INTEGER
        FROM "FPLGameweekTransfers"
        WHERE "fpl_team_id" = ${teamId}
          AND "gameweek" BETWEEN ${fromTransferGameweek} AND ${toTransferGameweek}
      ) AS "transferCount",
      COALESCE(
        (
          SELECT jsonb_agg(to_jsonb(transfer_activity_row) ORDER BY transfer_activity_row."time")
          FROM (
            SELECT
              jsonb_build_object(
                'id', out_player."id",
                'webName', out_player."web_name",
                'team', out_team."short_name"
              ) AS "out",
              jsonb_build_object(
                'id', in_player."id",
                'webName', in_player."web_name",
                'team', in_team."short_name"
              ) AS "in",
              transfer."time"
            FROM "FPLGameweekTransfers" AS transfer
            JOIN "FPLPlayer" AS out_player ON out_player."id" = transfer."out_player_id"
            JOIN "FPLPlayer" AS in_player ON in_player."id" = transfer."in_player_id"
            JOIN "FPLPlayerTeam" AS out_team
              ON out_team."code" = out_player."team_code"
              AND out_team."season_id" = out_player."season_id"
            JOIN "FPLPlayerTeam" AS in_team
              ON in_team."code" = in_player."team_code"
              AND in_team."season_id" = in_player."season_id"
            WHERE transfer."fpl_team_id" = ${teamId}
              AND transfer."gameweek" = ${transferActivityGameweek}
          ) AS transfer_activity_row
        ),
        '[]'::jsonb
      ) AS "transferActivity",
      (
        SELECT "active_chip"
        FROM "FPLGameweekOverallStats"
        WHERE "fpl_team_id" = ${teamId}
          AND "gameweek" = ${transferActivityGameweek}
        LIMIT 1
      ) AS "activeChip",
      COALESCE(
        (
          SELECT jsonb_agg(to_jsonb(transfer_row))
          FROM (
            SELECT "in_player_id", "in_player_cost", "time"
            FROM "FPLGameweekTransfers"
            WHERE "fpl_team_id" = ${teamId}
              AND "in_player_id" IN (SELECT "fpl_player_id" FROM player_ids)
          ) AS transfer_row
        ),
        '[]'::jsonb
      ) AS "transfers",
      COALESCE(
        (
          SELECT jsonb_agg(to_jsonb(price_stat_row))
          FROM (
            SELECT "fpl_player_id", "value"
            FROM "FPLGameweekPlayerStats"
            WHERE "gameweek" = ${priceGameweek}
              AND "fpl_player_id" IN (SELECT "fpl_player_id" FROM player_ids)
          ) AS price_stat_row
        ),
        '[]'::jsonb
      ) AS "priceStats"
  `;
  recordTiming?.("combined base query", performance.now() - startedAt);

  return {
    ...assembleGameweekBaseData(row),
    transfers: row.transfers.map((transfer) => ({
      ...transfer,
      time: new Date(transfer.time),
    })),
    transferActivity: row.transferActivity,
    activeChip: row.activeChip,
    priceStats: row.priceStats,
  };
}

export async function getGameweekPicksData(
  gameweek: number,
  team_id: string,
  fixtureRowsPromise: Promise<GameweekFixtureRow[]>,
  recordTiming?: (label: string, durationMs: number) => void
): Promise<FPLGameweekPicksData["data"]> {
  const picksStartedAt = performance.now();
  const pickRows = await prisma.$queryRaw<GameweekPickRow[]>`
    SELECT
      pick."position",
      player."id" AS "fpl_player_id",
      player."player_id",
      player."web_name",
      player."team_code",
      player."element_type",
      player."total_points",
      player."expected_goal_involvements_per_90",
      player."now_value",
      player_team."short_name" AS "team_short_name",
      COALESCE(
        array_agg(stat."value") FILTER (WHERE stat."id" IS NOT NULL),
        ARRAY[]::INTEGER[]
      ) AS "stat_values"
    FROM "FPLGameweekPicks" AS pick
    JOIN "FPLPlayer" AS player ON player."id" = pick."fpl_player_id"
    JOIN "FPLPlayerTeam" AS player_team
      ON player_team."code" = player."team_code"
      AND player_team."season_id" = player."season_id"
    LEFT JOIN "FPLGameweekPlayerStats" AS stat
      ON stat."fpl_player_id" = player."id"
      AND stat."gameweek" = ${gameweek}
    WHERE pick."gameweek" = ${gameweek}
      AND pick."fpl_team_id" = ${team_id}
    GROUP BY
      pick."position",
      player."id",
      player."player_id",
      player."web_name",
      player."team_code",
      player."element_type",
      player."total_points",
      player."expected_goal_involvements_per_90",
      player."now_value",
      player_team."short_name"
    ORDER BY pick."position"
  `;
  recordTiming?.("raw picks query", performance.now() - picksStartedAt);

  const teamCodes = [...new Set(pickRows.map((pick) => pick.team_code))];
  if (teamCodes.length === 0) {
    return [] as FPLGameweekPicksData["data"];
  }

  const fixtureRows = await fixtureRowsPromise;
  const assemblyStartedAt = performance.now();
  const fixturesByTeamCode = groupFixturesForTeamCodes(
    fixtureRows,
    new Set(teamCodes)
  );
  const result = assembleGameweekPicks(pickRows, fixturesByTeamCode);
  recordTiming?.("assemble gameweek picks", performance.now() - assemblyStartedAt);
  return result;
}

export async function getGameweekFixtureRows(
  gameweek: number,
  recordTiming?: (label: string, durationMs: number) => void
): Promise<GameweekFixtureRow[]> {
  const fixturesStartedAt = performance.now();
  const fixtureRows = await prisma.$queryRaw<GameweekFixtureRow[]>`
    SELECT
      fixture."id",
      fixture."event",
      fixture."team_h_difficulty",
      fixture."team_a_difficulty",
      home_team."code" AS "home_team_code",
      away_team."code" AS "away_team_code",
      home_team."short_name" AS "home_team_short_name",
      away_team."short_name" AS "away_team_short_name"
    FROM "FPLFixtures" AS fixture
    JOIN "FPLPlayerTeam" AS home_team ON home_team."id" = fixture."team_h_id"
    JOIN "FPLPlayerTeam" AS away_team ON away_team."id" = fixture."team_a_id"
    WHERE fixture."season_id" = ${process.env.FPL_SEASON_ID!}
      AND fixture."event" BETWEEN ${gameweek} AND ${gameweek + 4}
    ORDER BY fixture."event"
  `;
  recordTiming?.("raw fixtures query", performance.now() - fixturesStartedAt);
  return fixtureRows;
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

export async function getLastTransferValues(
  team_id: string,
  player_ids: string[]
) {
  return await prisma.fPLGameweekTransfers.findMany({
    where: {
      in_player_id: { in: player_ids },
      fpl_team_id: team_id,
    },
    select: {
      in_player_id: true,
      in_player_cost: true,
      time: true,
    },
  });
}

export async function getPlayerValuesByGameweek(
  player_ids: string[],
  gameweek: number
) {
  return await prisma.fPLGameweekPlayerStats.findMany({
    where: {
      fpl_player_id: { in: player_ids },
      gameweek,
    },
    select: {
      fpl_player_id: true,
      value: true,
    },
  });
}

export async function getRecentTransferCount(
  team_id: string,
  fromGameweek: number,
  toGameweek: number
) {
  return prisma.fPLGameweekTransfers.count({
    where: {
      fpl_team_id: team_id,
      gameweek: {
        gte: fromGameweek,
        lte: toGameweek,
      },
    },
  });
}

export type FPLGameweekPickData = {
  position: number;
  selling_price: number;
  fpl_player: {
    id: string;
    player_id: number;
    web_name: string;
    team_code: number;
    element_type: number;
    total_points: number;
    expected_goal_involvements_per_90: number;
    now_value: number;
    clean_sheets: number;
    bonus: number;
    bps: number;
    defensive_contribution: number;
    form: number;
    status: string;
    chance_of_playing_next_round: number | null;
    news: string;
    saves: number;
    influence: number;
    creativity: number;
    threat: number;
    ict_index: number;
    yellow_cards: number;
    red_cards: number;
    starts: number;
    selected_by_percent: number;
    points_per_game: number;
    expected_goals: number;
    expected_assists: number;
    expected_goals_conceded: number;
    goals_conceded: number;
    expected_assists_per_90: number;
    expected_goals_per_90: number;
    saves_per_90: number;
    fpl_player_team: {
      short_name: string;
      home_fixtures: {
        id: string;
        event: number;
        team_h_difficulty: number;
        team_a_difficulty: number;
        fpl_team_a: { short_name: string };
      }[];
      away_fixtures: {
        id: string;
        event: number;
        team_h_difficulty: number;
        team_a_difficulty: number;
        fpl_team_h: { short_name: string };
      }[];
    };
    fpl_gameweek_player_stats: { value: number }[];
  };
};

export type FPLGameweekPicksData = {
  data: FPLGameweekPickData[];
  overall: NonNullable<Awaited<ReturnType<typeof getGameweekOverallData>>>;
  transferCount?: number;
  transferActivity?: TransferActivity[];
  history?: GameweekTrendPoint[];
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
                      team_a_difficulty: true,
                      team_h_difficulty: true,
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
                      team_a_difficulty: true,
                      team_h_difficulty: true,
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
  return await prisma.fPLDrafts.update({
    where: { id: draftId },
    data: { deletedAt: new Date() },
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
      team_h_difficulty: true,
      team_a_difficulty: true,
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

/**
 *
 * @param teamId
 * @returns Latest gameweek so far for given team
 */
export async function getLatestGameweek(teamId: string) {
  return prisma.fPLGameweekPicks.aggregate({
    _max: {
      gameweek: true,
    },
    where: {
      fpl_team_id: teamId,
    },
  });
}

export async function getGameweekStatusForSession(session: Session) {
  if (!session.team_id) {
    return { nextGameweek: 1, seasonComplete: false };
  }

  const maxGameweek = await getLatestGameweek(session.team_id);
  const latestGameweek = maxGameweek._max.gameweek;
  return {
    nextGameweek: computeNextGameweek(latestGameweek),
    seasonComplete: latestGameweek === 38,
  };
}

export async function getNextGameweekForSession(session: Session) {
  const { nextGameweek } = await getGameweekStatusForSession(session);
  return nextGameweek;
}

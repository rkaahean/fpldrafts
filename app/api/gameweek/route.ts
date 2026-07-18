import { auth } from "@/auth/main";
import { buildInitialGameweekPayload } from "@/lib/fpl/gameweek";
import { applySellingPrices } from "@/lib/fpl/pricing";
import { NextRequest, NextResponse } from "next/server";
import {
  FPLPlayerData2,
  getGameweekBaseData,
  getPlayerDataBySeason,
} from "..";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const gameweek = parseInt(searchParams.get("gameweek")!);
  const requestId = crypto.randomUUID().slice(0, 8);
  const routeStartedAt = performance.now();
  const durations = new Map<string, number>();
  const recordTiming = (label: string, durationMs: number) => {
    durations.set(label, durationMs);
    console.info(
      `[gameweek:${gameweek}:${requestId}] ${label}: ${durationMs.toFixed(1)}ms`
    );
  };
  const timed = (label: string) => {
    const startedAt = performance.now();
    return () => recordTiming(label, performance.now() - startedAt);
  };
  const measure = async <T>(label: string, operation: () => Promise<T>) => {
    const end = timed(label);
    try {
      return await operation();
    } finally {
      end();
    }
  };
  const response = (body: object, init?: ResponseInit) => {
    recordTiming("total", performance.now() - routeStartedAt);
    const serverTiming = [...durations]
      .map(([label, duration]) =>
        `${label.replaceAll(" ", "_")};dur=${duration.toFixed(1)}`
      )
      .join(", ");
    return NextResponse.json(body, {
      ...init,
      headers: { "Server-Timing": serverTiming },
    });
  };

  const session = await measure("auth", () => auth());

  // decode token from header
  const jwt = req.headers.get("authorization");
  if (!jwt) {
    return response(
      { error: "Authorization header missing" },
      { status: 401 }
    );
  }
  if (!session?.team_id) {
    return response({ error: "FPL team missing from session" }, { status: 403 });
  }
  const teamId = session.team_id;

  // get team and user from token

  // special basecase
  if (gameweek == 1) {
    // kelleher: 101
    // roefs: 670

    // truffert: 74
    // mukiele: 694
    // van hecke: 151
    // mitchell: 258
    // keane: 295

    // anderson: 517
    // wilson: 329
    // casemiro: 457
    // garner: 303
    // enzo: 237

    // calvert-lewin: 691
    // welbeck: 178
    // richarlison: 597

    const allPlayers: FPLPlayerData2[] = await getPlayerDataBySeason(
      process.env.FPL_SEASON_ID!,
      [101, 670, 74, 694, 151, 258, 295, 517, 329, 457, 303, 237, 691, 178, 597]
    );

    return response(buildInitialGameweekPayload(allPlayers));
  }

  const baseGameweek = gameweek - 1;
  const { overall, data, transferCount, transfers, transferActivity, priceStats } = await measure("gameweek data query", () =>
    getGameweekBaseData(
      baseGameweek,
      teamId,
      gameweek - 5,
      gameweek - 1,
      gameweek,
      gameweek,
      recordTiming
    )
  );

  const responseConstructionStartedAt = performance.now();
  const newData = applySellingPrices(data, transfers, priceStats);

  const body = {
    data: newData,
    overall,
    transferCount,
    transferActivity,
  };
  recordTiming(
    "response construction",
    performance.now() - responseConstructionStartedAt
  );
  return response(body);
}

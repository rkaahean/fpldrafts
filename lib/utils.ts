import { FPLPlayerData } from "@/app/api";
import { PlayerData } from "@/app/store/utils";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function filterData(
  data: FPLPlayerData[],
  position: string
): PlayerData[] {
  return (
    data
      .filter((player) => {
        switch (position) {
          case "DEF":
            return player.fpl_player.element_type == 2 && player.position <= 11;
          case "MID":
            return player.fpl_player.element_type == 3 && player.position <= 11;
          case "FWD":
            return player.fpl_player.element_type == 4 && player.position <= 11;
          case "GK":
            return player.fpl_player.element_type == 1 && player.position <= 11;
          case "subs":
            return player.position > 11;
        }
      })
      .map((player) => FPLPlayerDataToPlayerData(player))
      // sort by position to display in order
      .sort((a, b) => a.position - b.position)
  );
}

export function FPLPlayerDataToPlayerData(player: FPLPlayerData) {
  // console.log("Evaluating player", player);
  const home_fixtures = player.fpl_player.fpl_player_team.home_fixtures;
  const away_fixtures = player.fpl_player.fpl_player_team.away_fixtures;

  const combined: any[] = [];
  home_fixtures.map((fixture) => {
    combined.push({
      id: fixture.id,
      name: fixture.fpl_team_a.short_name,
      event: fixture.event,
      strength: fixture.team_h_difficulty,
    });
  });
  away_fixtures.map((fixture) => {
    combined.push({
      id: fixture.id,
      name: fixture.fpl_team_h.short_name.toLowerCase(),
      event: fixture.event,
      strength: fixture.team_a_difficulty,
    });
  });

  // for events with same value, combine into an array
  // concatentate both, sort by event
  const fixtures = combined.sort((a: any, b: any) => {
    return a.event - b.event;
  });
  return {
    ...player.fpl_player,
    position: player.position,
    team_name: player.fpl_player.fpl_player_team.short_name,
    fixtures: fixtures,
    selling_price: player.selling_price ?? player.fpl_player.now_value,
    element_type: player.fpl_player.element_type,
    now_value: player.fpl_player.now_value,
    fpl_gameweek_player_stats: player.fpl_player.fpl_gameweek_player_stats,
    fpl_player_team: player.fpl_player.fpl_player_team,
  };

  // sort by position to display in order
}

export function elementTypeToPosition(type: number): string {
  switch (type) {
    case 1:
      return "GK";
    case 2:
      return "DEF";
    case 3:
      return "MID";
    case 4:
      return "FWD";
    default:
      return "None";
  }
}

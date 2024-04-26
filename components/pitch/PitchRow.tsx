import { FPLPlayerData } from "@/app/api";
import Player from "./player";

export type PlayerData = {
  player_id: number;
  position: number;
  team_code: number;
  web_name: string;
  expected_goal_involvements_per_90: number;
  total_points: number;
  fixtures: {
    id: string;
    name: string;
    event: number;
  }[];

  selling_price: number;
};

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
      .map((player) => {
        const home_fixtures = player.fpl_player.fpl_player_team.home_fixtures;
        const away_fixtures = player.fpl_player.fpl_player_team.away_fixtures;

        const combined: any[] = [];
        home_fixtures.map((fixture) => {
          combined.push({
            id: fixture.id,
            name: fixture.fpl_team_a.short_name,
            event: fixture.event,
          });
        });
        away_fixtures.map((fixture) => {
          combined.push({
            id: fixture.id,
            name: fixture.fpl_team_h.short_name.toLowerCase(),
            event: fixture.event,
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
        };
      })
      // sort by position to display in order
      .sort((a, b) => a.position - b.position)
  );
}

export default function PitchRow(props: {
  position: string;
  data: PlayerData[];
  gameweek: number;
}) {
  // sort props.data with position == "GK being the first"
  return props.position === "subs" ? (
    <div className="flex flex-row w-full h-1/5 items-center justify-around mt-5 py-2">
      {props.data.map((player) => (
        <Player
          key={player.player_id}
          data={player}
          gameweek={props.gameweek}
          isSubstitute={true}
        />
      ))}
    </div>
  ) : (
    <div className="flex flex-row w-full h-1/5 items-center justify-evenly py-2">
      {props.data.map((player) => (
        <Player
          key={player.player_id}
          data={player}
          gameweek={props.gameweek}
          isSubstitute={false}
        />
      ))}
    </div>
  );
}

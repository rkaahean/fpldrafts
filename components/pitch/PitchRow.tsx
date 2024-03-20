import { FPLGameweekPicksData } from "@/app/api/data";
import Player from "./Player";

export type PlayerData = {
  player_id: number;
  team_code: number;
  web_name: string;
  fixtures: {
    id: string;
    name: string;
    event: number;
  }[];
};

export function filterData(
  data: FPLGameweekPicksData,
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
          player_id: player.fpl_player.player_id,
          position: player.position,
          team_code: player.fpl_player.team_code,
          web_name: player.fpl_player.web_name,
          team_name: player.fpl_player.fpl_player_team.short_name,
          fixtures: fixtures,
        };
      })
      // sort by position to display in order
      .sort((a, b) => a.position - b.position)
  );
}

export default function PitchRow(props: {
  position: "DEF" | "MID" | "FWD" | "GK" | "subs";
  data: PlayerData[];
  gameweek: number;
}) {
  // sort props.data with position == "GK being the first"
  return props.position === "subs" ? (
    <div className="flex flex-row w-full h-1/5 items-center justify-around mt-5 bg-green-50 py-2">
      {props.data.map((player) => (
        <Player
          key={player.web_name}
          data={player}
          gameweek={props.gameweek}
          isSubstitute={true}
        />
      ))}
    </div>
  ) : (
    <div className="flex flex-row w-full h-1/5 items-center justify-evenly py-2">
      {props.data.map((player: any) => (
        <Player
          key={player.web_name}
          data={player}
          gameweek={props.gameweek}
          isSubstitute={false}
        />
      ))}
    </div>
  );
}

import { create } from "zustand";
import { FPLGameweekPicksData } from "../api/data";

interface State {
  data?: FPLGameweekPicksData;
  base?: FPLGameweekPicksData;
  substitutedIn?: number;
  substitutedOut?: number;
  drafts: {
    changes: {
      in: number;
      out: number;
      gameweek: number;
    }[];
  };
  incrementPop: () => void;
  setPicks: (picks: FPLGameweekPicksData) => void;
  setBase: (picks: FPLGameweekPicksData) => void;
  setSubstituteIn: (id: number) => void;
  setSubstituteOut: (id: number) => void;
  makeSubs: (gameweek: number) => void;
}
export const picksStore = create<State>()((set, get) => ({
  drafts: {
    base: [],
    changes: [],
  },
  incrementPop: () => console.log,
  setPicks: (picks: FPLGameweekPicksData) => {
    set({ data: picks });
  },
  setBase: (picks: FPLGameweekPicksData) => {
    set({ base: picks });
  },
  setSubstituteIn: (player_id: number) => {
    /**
     * selects player to be substituted IN, from subs
     */
    set({ substitutedIn: player_id });
  },
  setSubstituteOut: (player_id: number) => {
    /**
     * selects player to be substituted OUT, from starting 11
     */
    set({ substitutedOut: player_id });
  },
  makeSubs: (gameweek: number) => {
    const { data, drafts, substitutedIn, substitutedOut } = get();

    console.log("making subs...", data);
    // if both subs are set
    if (!!substitutedIn && !!substitutedOut) {
      const newData = swapPlayers(data!, substitutedIn, substitutedOut);
      if (drafts && drafts.changes) {
        drafts.changes.push({
          in: substitutedIn,
          out: substitutedOut,
          gameweek,
        });
      } else {
        drafts.changes = [
          {
            in: substitutedIn,
            out: substitutedOut,
            gameweek,
          },
        ];
      }
      // Update the state with the modified data array
      set({
        data: newData,
        substitutedIn: undefined,
        substitutedOut: undefined,
        drafts,
      });
    }
  },
}));

export function swapPlayers(
  data: FPLGameweekPicksData,
  substitutedIn: number,
  substitutedOut: number
): FPLGameweekPicksData {
  const inPlayerIndex = data.findIndex(
    (player) => player.fpl_player.player_id === substitutedIn
  );
  const outPlayerIndex = data.findIndex(
    (player) => player.fpl_player.player_id === substitutedOut
  );

  if (inPlayerIndex === -1 || outPlayerIndex === -1) {
    // One or both players not found, return the original data
    return data;
  }

  const inPlayer = { ...data[inPlayerIndex] }; // Create a new object
  const outPlayer = { ...data[outPlayerIndex] }; // Create a new object

  // console.log("substituting in", inPlayer, "substituting out", outPlayer);

  // Swap the position attribute
  const tempPosition = inPlayer.position;
  inPlayer.position = outPlayer.position;
  outPlayer.position = tempPosition;
  // console.log(
  //   "in position",
  //   inPlayer.fpl_player.web_name,
  //   inPlayer.position,
  //   "out position",
  //   outPlayer.position
  // );

  const newData = [...data]; // Create a new array with the same elements as data

  // Replace the modified elements in the new array
  newData[inPlayerIndex] = inPlayer;
  newData[outPlayerIndex] = outPlayer;

  // console.log("Function data", newData);
  return newData;
}

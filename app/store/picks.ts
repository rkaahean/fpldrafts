import { create } from "zustand";
import { FPLGameweekPicksData } from "../api/data";

interface State {
  data?: FPLGameweekPicksData;
  substitutedIn?: number;
  substitutedOut?: number;
  drafts?: {
    data: FPLGameweekPicksData;
    gameweek: number;
  }[];
  incrementPop: () => void;
  setPicks: (picks: FPLGameweekPicksData) => void;
  setSubstituteIn: (id: number) => void;
  setSubstituteOut: (id: number) => void;
  makeSubs: (gameweek: number) => void;
  updateDraft: (gameweek: number) => {
    data: FPLGameweekPicksData;
    gameweek: number;
  }[];
}
export const picksStore = create<State>()((set, get) => ({
  incrementPop: () => console.log,
  setPicks: (picks: FPLGameweekPicksData) => {
    set({ data: picks });
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
    const { data, substitutedIn, substitutedOut, updateDraft } = get();

    // if both subs are set
    if (!!substitutedIn && !!substitutedOut) {
      console.log("Making subs...");
      const inPlayerIndex = data!.findIndex(
        (player) => player.fpl_player.player_id === substitutedIn
      );
      const outPlayerIndex = data!.findIndex(
        (player) => player.fpl_player.player_id === substitutedOut
      );
      if (inPlayerIndex !== -1 && outPlayerIndex !== -1) {
        const inPlayer = data![inPlayerIndex];
        const outPlayer = data![outPlayerIndex];

        // Swap the position attribute
        const tempPosition = inPlayer.position;
        inPlayer.position = outPlayer.position;
        outPlayer.position = tempPosition;

        const newData = data!.filter(
          (_, index) => index !== inPlayerIndex && index !== outPlayerIndex
        );

        // Add the modified elements to the new array
        newData.splice(inPlayerIndex, 0, inPlayer);
        newData.splice(outPlayerIndex, 0, outPlayer);

        // Update the state with the modified data array
        set({
          data: newData,
          substitutedIn: undefined,
          substitutedOut: undefined,
        });

        const updatedDrafts = updateDraft(gameweek);
        console.log("Saved drafts", updatedDrafts);
      }
    }
  },
  updateDraft: (gameweek: number) => {
    console.log(gameweek);
    const { drafts, data } = get();

    // if object doesn't exist, create it
    let newDrafts = !drafts ? [] : [...drafts];

    // if drafts has gameweek
    const filteredDrafts = newDrafts.filter(
      (draft) => draft.gameweek != gameweek
    );
    filteredDrafts.push({
      data: data!,
      gameweek,
    });
    set({
      drafts: filteredDrafts,
    });
    return filteredDrafts;
  },
}));

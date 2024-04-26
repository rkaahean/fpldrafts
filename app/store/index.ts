import { create } from "zustand";
import { FPLGameweekPicksData, FPLPlayerData } from "../api";

interface DraftState {
  id?: string;
  name?: string;
  description?: string;
  changes: {
    in: number;
    out: number;
    gameweek: number;
  }[];
}
interface State {
  bank: number;
  currentGameweek: number;
  picks?: FPLGameweekPicksData;
  base?: FPLGameweekPicksData;
  substitutedIn?: number;
  substitutedOut?: number;
  drafts: DraftState;
  setBase: (picks: FPLGameweekPicksData) => void;
  setSubstituteIn: (player_id: number, price: number) => void;
  setSubstituteOut: (player_id: number, price: number) => void;
  setCurrentGameweek: (gameweek: number) => void;
  setBank: (bank: number) => void;
  makeSubs: () => Promise<{
    isValid: boolean;
    reason: string;
  }>;
  setDrafts: (drafts: DraftState) => void;
  setPicks: (picks: FPLGameweekPicksData) => void;
}

export const picksStore = create<State>()((set, get) => ({
  bank: 0,
  drafts: {
    changes: [],
  },
  currentGameweek: 34,
  setPicks: (picks: FPLGameweekPicksData) => {
    set({ picks });
  },
  setBase: (picks: FPLGameweekPicksData) => {
    set({ base: picks });
  },
  setBank: (bank: number) => {
    set({ bank });
  },
  setSubstituteIn: (player_id: number, price: number) => {
    /**
     * selects player to be substituted IN, from subs
     */
    const { substitutedIn, bank } = get();
    // already set
    if (substitutedIn == player_id) {
      set({ substitutedIn: undefined });
      set({ bank: bank + price });
    } else {
      set({ substitutedIn: player_id });
      set({ bank: bank - price });
    }
  },
  setSubstituteOut: (player_id: number, price: number) => {
    /**
     * selects player to be substituted OUT, from starting 11
     */
    const { substitutedOut, bank } = get();

    // already set
    if (substitutedOut == player_id) {
      set({ substitutedOut: undefined });
      set({ bank: bank - price });
    } else {
      set({ substitutedOut: player_id });
      set({ bank: bank + price });
    }
  },
  setDrafts: (drafts) => set({ drafts }),
  setCurrentGameweek: (gameweek: number) => {
    if (gameweek <= 38) {
      set({ currentGameweek: gameweek });
    }
  },
  makeSubs: async () => {
    const {
      drafts,
      picks,
      substitutedIn,
      substitutedOut,
      currentGameweek: gameweek,
    } = get();

    const data = picks?.data;
    // if both subs are set
    if (!!substitutedIn && !!substitutedOut) {
      // validate that both substituted in and subtituted out are of same type
      const { isValid, reason } = await fetch("/api/validate", {
        method: "POST",
        body: JSON.stringify({
          picks: data,
          substitutedIn,
          substitutedOut,
        }),
      }).then((res) => res.json());
      console.log(isValid, substitutedIn, substitutedOut);

      if (!isValid) {
        return {
          isValid,
          reason,
        };
      }

      let newDrafts;
      if (drafts && drafts.changes) {
        newDrafts = [...drafts.changes];
        newDrafts.push({
          in: substitutedIn,
          out: substitutedOut,
          gameweek,
        });
      } else {
        newDrafts = [
          {
            in: substitutedIn,
            out: substitutedOut,
            gameweek,
          },
        ];
      }
      // Update the state with the modified data array
      set({
        substitutedIn: undefined,
        substitutedOut: undefined,
        drafts: {
          changes: newDrafts,
        },
      });
    }

    return {
      isValid: true,
      reason: "OK",
    };
  },
}));

/**
 *
 * @param data Current state of the draft
 * @param substitutedIn Player ID to be substituted in
 * @param substitutedOut Player ID to be substituted out
 * @returns Modified gameweek picks data
 */
export async function swapPlayers(
  data: FPLGameweekPicksData,
  substitutedIn: number,
  substitutedOut: number
): Promise<FPLGameweekPicksData> {
  console.log("Swapping player", substitutedIn, substitutedOut, data);
  const inPlayerIndex = data.data.findIndex(
    (player) => player.fpl_player.player_id === substitutedIn
  );
  const outPlayerIndex = data.data.findIndex(
    (player) => player.fpl_player.player_id === substitutedOut
  );

  let inPlayer: FPLPlayerData;
  if (outPlayerIndex === -1) {
    // if index of player substituted out not found, return
    // this means tranferring out a player not in team. BAD!
    return data;
  } else if (inPlayerIndex == -1) {
    // player being bought in is not in team, making a transfer
    const response = await fetch("/api/player", {
      method: "POST",
      body: JSON.stringify({
        id: substitutedIn,
      }),
    }).then((res) => res.json());
    inPlayer = {
      fpl_player: response.data,
      selling_price: -1,
      position: -1,
      id: "1",
    };
    // console.log("New player data loading", inPlayer);
  } else {
    // hapens when players being switched up within the team
    inPlayer = {
      ...data.data[inPlayerIndex],
      selling_price: -1,
      position: -1,
    }; // Create a new object
  }

  const outPlayer = { ...data.data[outPlayerIndex] }; // Create a new object
  // console.log("In", inPlayer, "out", outPlayer);

  if (inPlayer?.position) {
    // Swap the position attribute
    const tempPosition = inPlayer!.position;
    inPlayer!.position = outPlayer.position;
    outPlayer.position = tempPosition;

    const newData = [...data.data]; // Create a new array with the same elements as data

    // Replace the modified elements in the new array
    newData[inPlayerIndex] = inPlayer!;
    newData[outPlayerIndex] = outPlayer;

    return {
      data: newData,
      overall: data.overall,
    };
  } else {
    const newData = [...data.data]; // Create a new array with the same elements as data

    inPlayer!.position = outPlayer.position;
    newData[outPlayerIndex] = inPlayer!;

    return {
      data: newData,
      overall: data.overall,
    };
  }
}

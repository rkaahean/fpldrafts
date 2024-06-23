import { create } from "zustand";
import { FPLGameweekPicksData, FPLPlayerData, getPlayerData } from "../api";

interface DraftState {
  id?: string;
  name?: string;
  description?: string;
  changes: DraftTransfer[];
}

export interface DraftTransfer {
  in: number;
  out: number;
  gameweek: number;
  in_cost: number;
  out_cost: number;
}

interface TransferProps {
  player_id: number;
  value: number;
}
interface State {
  currentGameweek: number;
  picks?: FPLGameweekPicksData;
  base?: FPLGameweekPicksData;
  substitutedIn?: TransferProps;
  substitutedOut?: TransferProps;
  drafts: DraftState;
  transfersIn: { [key: number]: TransferProps[] };
  transfersOut: { [key: number]: TransferProps[] };
  setBase: (picks: FPLGameweekPicksData) => void;
  setSubstituteIn: (player: TransferProps) => void;
  setSubstituteOut: (player: TransferProps) => void;
  setCurrentGameweek: (gameweek: number) => void;
  makeSubs: () => Promise<{
    isValid: boolean;
    reason: string;
  }>;
  makeTransfers: () => Promise<{
    isValid: boolean;
    reason: string;
  }>;
  setDrafts: (drafts: DraftState) => void;
  setPicks: (picks: FPLGameweekPicksData) => void;
  setTransferIn: (players: { [key: number]: TransferProps[] }) => void;
  setTransferOut: (players: { [key: number]: TransferProps[] }) => void;
  resetSubs: () => void;
}

export const picksStore = create<State>()((set, get) => ({
  drafts: {
    changes: [],
  },
  currentGameweek: 36,
  transfersIn: { 1: [], 2: [], 3: [], 4: [] },
  transfersOut: { 1: [], 2: [], 3: [], 4: [] },
  setPicks: (picks: FPLGameweekPicksData) => {
    set({ picks });
  },
  setBase: (picks: FPLGameweekPicksData) => {
    set({ base: picks });
  },
  resetSubs: () => {
    set({
      substitutedIn: undefined,
      substitutedOut: undefined,
    });
  },
  setSubstituteIn: (player: TransferProps) => {
    /**
     * selects player to be substituted IN, from subs
     */

    set({ substitutedIn: player });
    // console.log("VAL", picks?.overall?.bank, player.value);
    // no need to update bank, as the it will be updated in react query
  },
  setSubstituteOut: (player: TransferProps) => {
    /**
     * selects player to be substituted OUT, from starting 11
     */

    const { substitutedOut: current, picks } = get();
    let new_value = picks?.overall?.bank!;
    // already set
    if (current?.player_id == player.player_id) {
      set({ substitutedOut: undefined });
      new_value = new_value - current.value;
    } else if (current) {
      set({ substitutedOut: player });
      new_value = new_value - current.value + player.value;
    } else {
      set({ substitutedOut: player });
      new_value = new_value + player.value;
    }

    set({
      picks: {
        data: picks!.data,
        overall: {
          ...picks!.overall!,
          bank: new_value,
        },
      },
    });
  },
  setTransferIn: (players) => set({ transfersIn: players }),
  setTransferOut: (players) => set({ transfersOut: players }),
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
      const { isValid, reason } = await fetch("/api/validate/substitute", {
        method: "POST",
        body: JSON.stringify({
          picks: data,
          substitutedIn: substitutedIn.player_id,
          substitutedOut: substitutedOut.player_id,
        }),
      }).then((res) => res.json());
      console.log(isValid, substitutedIn, substitutedOut);

      if (!isValid) {
        return {
          isValid,
          reason,
        };
      }

      let newDrafts: DraftTransfer[] = [];
      if (drafts && drafts.changes) {
        newDrafts = [...drafts.changes];
        newDrafts.push({
          in: substitutedIn.player_id,
          out: substitutedOut.player_id,
          gameweek,
          in_cost: substitutedIn.value,
          out_cost: substitutedOut.value,
        });
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
  makeTransfers: async () => {
    const {
      drafts,
      picks,
      transfersIn,
      transfersOut,
      currentGameweek: gameweek,
    } = get();

    const data = picks?.data;
    // if there is atleast one transfer in and out
    Object.keys(transfersIn).forEach((element_type) => {
      const e_type = parseInt(element_type);

      // console.log("Parsing", e_type);
      let newDrafts: DraftTransfer[] = drafts.changes;
      // console.log("Drafts", newDrafts);
      while (
        transfersIn[e_type].length &&
        transfersIn[e_type].length <= transfersOut[e_type].length
      ) {
        const in_transfer = transfersIn[e_type].pop()!;
        const out_transfer = transfersOut[e_type].pop()!;
        // console.log("Popping", in_transfer, out_transfer);
        newDrafts.push({
          in: in_transfer.player_id,
          out: out_transfer.player_id,
          gameweek,
          in_cost: in_transfer.value,
          out_cost: out_transfer.value,
        });
        // console.log("State", transfersIn, transfersOut);
      }
      // otherwise keep transferring elements
      set({
        drafts: {
          changes: newDrafts,
        },
      });
    });

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
  tranfser: DraftTransfer
): Promise<FPLGameweekPicksData> {
  const {
    in: substitutedIn,
    out: substitutedOut,
    in_cost,
    out_cost,
  } = tranfser;
  // console.log("Swapping player", substitutedIn, substitutedOut, data);
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
    const response: {
      data: NonNullable<Awaited<ReturnType<typeof getPlayerData>>>;
    } = await fetch("/api/player", {
      method: "POST",
      body: JSON.stringify({
        id: substitutedIn,
      }),
    }).then((res) => res.json());
    inPlayer = {
      fpl_player: response.data,
    };
    // console.log("New player data loading", inPlayer);
  } else {
    // happens when players being switched up within the team
    inPlayer = {
      ...data.data[inPlayerIndex],
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
      overall: {
        ...data.overall,
        bank: data.overall.bank + out_cost - in_cost,
      },
    };
  }
}

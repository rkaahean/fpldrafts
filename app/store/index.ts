import { create } from "zustand";
import { FPLGameweekPicksData, FPLPlayerData, getPlayerData } from "../api";
import { DraftState, DraftTransfer, PlayerData } from "./utils";

interface State {
  currentGameweek: number;
  picks?: FPLGameweekPicksData;
  base?: FPLGameweekPicksData;
  substitutedIn?: PlayerData;
  substitutedOut?: PlayerData;
  drafts: DraftState;
  transfersIn: { [key: number]: PlayerData[] };
  transfersOut: { [key: number]: PlayerData[] };
  setBase: (picks: FPLGameweekPicksData) => void;
  setSubstituteIn: (player: PlayerData) => void;
  setSubstituteOut: (player: PlayerData) => void;
  setCurrentGameweek: (gameweek: number) => void;
  makeSubs: () => Promise<{
    isValid: boolean;
    reason: string;
  }>;
  makeTransfers: () => Promise<{
    isvalid: boolean;
    reason: string;
  }>;
  setDrafts: (drafts: DraftState) => void;
  setPicks: (picks: FPLGameweekPicksData) => void;
  setTransferIn: (players: { [key: number]: PlayerData[] }) => void;
  setTransferOut: (players: { [key: number]: PlayerData[] }) => void;
  resetSubs: () => void;
  addToBank(value: number): void;
  removeFromBank(value: number): void;
}

const TRANSFER_INIT_VALUE = { 1: [], 2: [], 3: [], 4: [] };

export const picksStore = create<State>()((set, get) => ({
  drafts: {
    changes: [],
  },
  currentGameweek: 36,
  transfersIn: structuredClone(TRANSFER_INIT_VALUE),
  transfersOut: structuredClone(TRANSFER_INIT_VALUE),
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
  addToBank: (value: number) => {
    const { picks } = get();
    set({
      picks: {
        ...picks!,
        overall: {
          ...picks!.overall,
          bank: picks!.overall.bank + value,
        },
      },
    });
  },
  removeFromBank: (value: number) => {
    const { picks } = get();
    set({
      picks: {
        ...picks!,
        overall: {
          ...picks!.overall,
          bank: picks!.overall.bank - value,
        },
      },
    });
  },
  setSubstituteIn: (player: PlayerData) => set({ substitutedIn: player }),
  setSubstituteOut: (player: PlayerData) => set({ substitutedOut: player }),
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
          in: {
            data: substitutedIn,
            price: 0,
          },
          out: {
            data: substitutedOut,
            price: 0,
          },
          gameweek,
        });
      }

      // Update the state with the modified data array
      set({
        substitutedIn: undefined,
        substitutedOut: undefined,
        drafts: {
          changes: newDrafts,
        },
        transfersIn: structuredClone(TRANSFER_INIT_VALUE),
        transfersOut: structuredClone(TRANSFER_INIT_VALUE),
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

    let isvalid = true;
    let reason = "OK";
    // if there is atleast one transfer in and out
    for (let i = 0; i < Object.keys(transfersIn).length; i++) {
      const e_type = parseInt(Object.keys(transfersIn)[i]);

      // if there are transfers of in type, but no transfers of out type
      if (transfersIn[e_type].length > 0 && transfersOut[e_type].length == 0) {
        isvalid = false;
        reason = `Please transfer out a player of ${transfersIn[e_type][0].web_name}'s type`;
        break;
      }

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
          in: {
            data: in_transfer,
            price: in_transfer.selling_price,
          },
          out: {
            data: out_transfer,
            price: out_transfer.selling_price,
          },
          gameweek,
        });
      }
      // otherwise keep transferring elements
      set({
        drafts: {
          changes: newDrafts,
        },
      });
    }

    return {
      isvalid,
      reason,
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
  transfer: DraftTransfer
): Promise<FPLGameweekPicksData> {
  const { in: substitutedIn, out: substitutedOut } = transfer;

  const inPlayerIndex = data.data.findIndex(
    (player) => player.fpl_player.player_id === substitutedIn.data.player_id
  );
  const outPlayerIndex = data.data.findIndex(
    (player) => player.fpl_player.player_id === substitutedOut.data.player_id
  );

  if (outPlayerIndex === -1) {
    // If index of player substituted out not found, return
    // this means transferring out a player not in team. BAD!
    return data;
  }

  let inPlayer: FPLPlayerData;
  if (inPlayerIndex === -1) {
    // Player being bought in is not in team, making a transfer
    const response: {
      data: NonNullable<Awaited<ReturnType<typeof getPlayerData>>>;
    } = await fetch("/api/player", {
      method: "POST",
      body: JSON.stringify({
        id: substitutedIn.data.player_id,
      }),
    }).then((res) => res.json());

    inPlayer = {
      fpl_player: response.data,
      position: data.data[outPlayerIndex].position,
      selling_price: response.data.now_value,
    };
    console.log("New player data loading", inPlayer);
  } else {
    // Happens when players being switched up within the team
    inPlayer = {
      ...data.data[inPlayerIndex],
      position: data.data[inPlayerIndex].position,
      selling_price: data.data[inPlayerIndex].selling_price,
    }; // Create a new object
  }

  const outPlayer = { ...data.data[outPlayerIndex] }; // Create a new object
  const newData = [...data.data]; // Create a new array with the same elements as data

  if (inPlayerIndex === -1) {
    // New player is not in the team, so replace the outPlayer with inPlayer
    inPlayer.position = outPlayer.position;
    newData[outPlayerIndex] = inPlayer;
  } else {
    // Swap the position attribute
    const tempPosition = inPlayer.position;
    inPlayer.position = outPlayer.position;
    outPlayer.position = tempPosition;

    // Replace the modified elements in the new array
    newData[inPlayerIndex] = inPlayer;
    newData[outPlayerIndex] = outPlayer;
  }

  return {
    data: newData,
    overall: {
      ...data.overall,
      bank: data.overall.bank + substitutedOut.price - substitutedIn.price,
    },
  };
}

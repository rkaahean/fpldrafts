import { toast } from "@/components/ui/use-toast";
import { elementTypeToPosition } from "@/scripts/lib/utils";
import { create } from "zustand";
import { FPLGameweekPicksData, FPLPlayerData } from "../api";
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
  makeSubs: () => void;
  makeTransfers: () => Promise<{
    isvalid: boolean;
    reason: string;
  }>;
  setDrafts: (drafts: DraftState) => void;
  setPicks: (picks: FPLGameweekPicksData) => void;
  setTransferIn: (players: { [key: number]: PlayerData[] }) => void;
  setTransferOut: (players: { [key: number]: PlayerData[] }) => void;
  resetSubs: () => void;
  resetTransfers: () => void;
  addToBank(value: number): void;
  removeFromBank(value: number): void;
}

const TRANSFER_INIT_VALUE = { 1: [], 2: [], 3: [], 4: [] };

export const picksStore = create<State>()((set, get) => ({
  drafts: {
    changes: [],
  },
  currentGameweek: 1,
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
  resetTransfers: () => {
    set({
      transfersIn: structuredClone(TRANSFER_INIT_VALUE),
      transfersOut: structuredClone(TRANSFER_INIT_VALUE),
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
    if (gameweek >= 1 && gameweek <= 38) {
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
      // Rules of transferring

      // 1. A GK can be swapped out only for a GK.

      // 2. A swap of equal element type is always allowed.

      // 3. The below rules are for when element types are different.

      // 3.1 To swap out a DEF, you must have atleast 4 of them (>= 4)
      // 3.2 To swap out a midfielder, you must have atleast 3 of them (>= 3)
      // 3.3 To swap out a FWD, you must have atleast 2 of them

      // first, get the number of players in each position until the drafts so far.

      let draftTransfers: DraftTransfer[] = [];
      draftTransfers = [...drafts.changes];

      const numDef = getNumPlayersByType(2, picks!);
      const numMid = getNumPlayersByType(3, picks!);
      const numFwd = getNumPlayersByType(4, picks!);

      const [subInType, subOutType] = [
        substitutedIn.element_type,
        substitutedOut.element_type,
      ];

      // Rule 2. A swap of equal element type is always allowed.
      if (subInType != subOutType) {
        // Rule 1. A GK can be swapped out only for a GK.
        if (subInType == 1 || subOutType == 1) {
          toast({
            title: "Cannot substitute player.",
            description:
              "A goalkeeper can be substituted only for another goalkeeper.",
            variant: "destructive",
          });
          set({
            substitutedIn: undefined,
            substitutedOut: undefined,
          });
          return;
        }

        // if subbing out a defender
        if (subOutType == 2 && numDef == 3) {
          toast({
            title: "Cannot substitute player.",
            description: "Need a minimum of 3 defenders in playing team.",
            variant: "destructive",
          });
          set({
            substitutedIn: undefined,
            substitutedOut: undefined,
          });
          return;
        }

        if (subOutType == 3 && numMid == 2) {
          toast({
            title: "Cannot substitute player.",
            description: "Need a minimum of 2 midfielders in playing team.",
            variant: "destructive",
          });
          set({
            substitutedIn: undefined,
            substitutedOut: undefined,
          });
          return;
        }

        if (subOutType == 4 && numFwd == 1) {
          toast({
            title: "Cannot substitute player.",
            description: "Need a minimum of 1 forward in playing team.",
            variant: "destructive",
          });
          set({
            substitutedIn: undefined,
            substitutedOut: undefined,
          });
          return;
        }
      }
      draftTransfers.push({
        in: {
          data: substitutedIn,
          price: 0,
        },
        out: {
          data: substitutedOut,
          price: 0,
        },
        gameweek,
        type: "substitute",
      });

      // Update the state with the modified data array
      set({
        substitutedIn: undefined,
        substitutedOut: undefined,
        drafts: {
          ...drafts,
          changes: draftTransfers,
        },
        // transfersIn: structuredClone(TRANSFER_INIT_VALUE),
        // transfersOut: structuredClone(TRANSFER_INIT_VALUE),
      });
    }
  },
  makeTransfers: async () => {
    const {
      drafts,
      transfersIn,
      transfersOut,
      currentGameweek: gameweek,
    } = get();

    let isvalid = true;
    let reason = "OK";
    // if there is atleast one transfer in and out
    for (let i = 0; i < Object.keys(transfersIn).length; i++) {
      const e_type = parseInt(Object.keys(transfersIn)[i]);

      // if there are transfers of in type, but no transfers of out type
      if (transfersIn[e_type].length > 0 && transfersOut[e_type].length == 0) {
        isvalid = false;
        reason = `Select a ${elementTypeToPosition(
          transfersIn[e_type][0].element_type
        )} in team to transfer in ${transfersIn[e_type][0].web_name}.`;
        break;
      }

      // console.log("Parsing", e_type);
      let newDraftChanges: DraftTransfer[] = drafts.changes;
      // console.log("Drafts", newDrafts);
      while (
        transfersIn[e_type].length &&
        transfersIn[e_type].length <= transfersOut[e_type].length
      ) {
        const in_transfer = transfersIn[e_type].pop()!;
        const out_transfer = transfersOut[e_type].pop()!;
        newDraftChanges.push({
          in: {
            data: in_transfer,
            price: in_transfer.selling_price,
          },
          out: {
            data: out_transfer,
            price: out_transfer.selling_price,
          },
          gameweek,
          type: "transfer",
        });
      }
      // otherwise keep transferring elements
      set({
        drafts: {
          ...drafts,
          changes: newDraftChanges,
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

    inPlayer = {
      fpl_player: substitutedIn.data,
      position: data.data[outPlayerIndex].position,
      selling_price: substitutedIn.price,
    };
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

function getNumPlayersByType(
  element_type: number,
  picks: FPLGameweekPicksData
): number {
  return picks?.data.filter(
    (player) =>
      player.fpl_player.element_type == element_type && player.position <= 11
  ).length!;
}

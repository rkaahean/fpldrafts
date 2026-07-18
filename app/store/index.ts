import { validateSubstitution } from "@/lib/fpl/formation";
import { toast } from "@/components/ui/use-toast";
import { elementTypeToPosition } from "@/scripts/lib/utils";
import { create } from "zustand";
import { FPLGameweekPicksData } from "../api";
import { DraftState, DraftTransfer, PlayerData } from "./utils";

export { swapPlayers } from "@/lib/fpl/swap";

interface State {
  currentGameweek: number;
  picks?: FPLGameweekPicksData;
  committedBank?: number;
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
  setCommittedBank: (bank: number) => void;
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
  setCommittedBank: (bank: number) => {
    set({ committedBank: bank });
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
    set({ currentGameweek: Math.min(Math.max(gameweek, 1), 38) });
  },
  makeSubs: async () => {
    const {
      drafts,
      picks,
      substitutedIn,
      substitutedOut,
      currentGameweek: gameweek,
    } = get();

    if (!!substitutedIn && !!substitutedOut) {
      let draftTransfers: DraftTransfer[] = [];
      draftTransfers = [...drafts.changes];

      const result = validateSubstitution(
        substitutedIn,
        substitutedOut,
        picks!
      );

      if (!result.valid) {
        toast({
          title: "Cannot substitute player.",
          description: result.reason,
          variant: "destructive",
        });
        set({
          substitutedIn: undefined,
          substitutedOut: undefined,
        });
        return;
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

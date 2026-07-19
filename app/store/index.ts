import { validateSubstitution } from "@/lib/fpl/formation";
import { toast } from "@/components/ui/use-toast";
import { FPLPlayerDataToPlayerData } from "@/scripts/lib/utils";
import { create } from "zustand";
import { FPLGameweekPicksData, FPLPlayerData } from "../api";
import { DraftState, DraftTransfer, PlayerData } from "./utils";

export { swapPlayers } from "@/lib/fpl/swap";

export interface TransferSlot {
  id: string;
  out: PlayerData;
  in: PlayerData | null;
}

interface State {
  currentGameweek: number;
  picks?: FPLGameweekPicksData;
  committedBank?: number;
  base?: FPLGameweekPicksData;
  substitutedIn?: PlayerData;
  substitutedOut?: PlayerData;
  drafts: DraftState;
  transferSlots: TransferSlot[];
  activeSlotId: string | null;
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
  markOut: (player: PlayerData) => void;
  markAllOut: () => void;
  setActiveSlot: (id: string | null) => void;
  fillSlot: (slotId: string, inPlayer: PlayerData) => void;
  clearSlotIn: (slotId: string) => void;
  resetSubs: () => void;
  resetTransfers: () => void;
  addToBank(value: number): void;
  removeFromBank(value: number): void;
}

export const picksStore = create<State>()((set, get) => ({
  drafts: {
    changes: [],
  },
  currentGameweek: 1,
  transferSlots: [],
  activeSlotId: null,
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
      transferSlots: [],
      activeSlotId: null,
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
  setActiveSlot: (id) => set({ activeSlotId: id }),
  markOut: (player: PlayerData) => {
    const { transferSlots, activeSlotId, addToBank, removeFromBank } = get();
    const slotId = String(player.player_id);
    const existing = transferSlots.find((slot) => slot.id === slotId);

    if (existing) {
      removeFromBank(existing.out.selling_price);
      if (existing.in) {
        addToBank(existing.in.selling_price);
      }
      set({
        transferSlots: transferSlots.filter((slot) => slot.id !== slotId),
        activeSlotId: activeSlotId === slotId ? null : activeSlotId,
      });
      return;
    }

    addToBank(player.selling_price);
    set({
      transferSlots: [...transferSlots, { id: slotId, out: player, in: null }],
      activeSlotId: slotId,
    });
  },
  markAllOut: () => {
    const { picks, transferSlots, addToBank } = get();
    if (!picks) {
      return;
    }
    const existingById = new Map(transferSlots.map((slot) => [slot.id, slot]));
    let bankDelta = 0;
    const nextSlots: TransferSlot[] = picks.data.map((pick) => {
      const outPlayer = FPLPlayerDataToPlayerData(pick as unknown as FPLPlayerData);
      const slotId = String(outPlayer.player_id);
      const existing = existingById.get(slotId);
      if (!existing) {
        bankDelta += outPlayer.selling_price;
      }
      return {
        id: slotId,
        out: outPlayer,
        in: existing?.in ?? null,
      };
    });
    if (bankDelta !== 0) {
      addToBank(bankDelta);
    }
    set({ transferSlots: nextSlots, activeSlotId: null });
  },
  fillSlot: (slotId: string, inPlayer: PlayerData) => {
    const { transferSlots, addToBank, removeFromBank } = get();
    const slot = transferSlots.find((s) => s.id === slotId);
    if (!slot) {
      return;
    }
    if (slot.in) {
      addToBank(slot.in.selling_price);
    }
    removeFromBank(inPlayer.selling_price);
    set({
      transferSlots: transferSlots.map((s) =>
        s.id === slotId ? { ...s, in: inPlayer } : s
      ),
    });
  },
  clearSlotIn: (slotId: string) => {
    const { transferSlots, addToBank } = get();
    const slot = transferSlots.find((s) => s.id === slotId);
    if (!slot || !slot.in) {
      return;
    }
    addToBank(slot.in.selling_price);
    set({
      transferSlots: transferSlots.map((s) =>
        s.id === slotId ? { ...s, in: null } : s
      ),
    });
  },
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
      });
    }
  },
  makeTransfers: async () => {
    const { drafts, transferSlots, currentGameweek: gameweek } = get();

    const filledSlots = transferSlots.filter((slot) => slot.in != null);

    if (filledSlots.length === 0) {
      return {
        isvalid: false,
        reason: "Select a replacement for at least one player.",
      };
    }

    const newDraftChanges: DraftTransfer[] = [
      ...drafts.changes,
      ...filledSlots.map((slot) => ({
        in: {
          data: slot.in!,
          price: slot.in!.selling_price,
        },
        out: {
          data: slot.out,
          price: slot.out.selling_price,
        },
        gameweek,
        type: "transfer" as const,
      })),
    ];

    const filledIds = new Set(filledSlots.map((slot) => slot.id));

    set({
      drafts: {
        ...drafts,
        changes: newDraftChanges,
      },
      transferSlots: transferSlots.filter((slot) => !filledIds.has(slot.id)),
    });

    return {
      isvalid: true,
      reason: "OK",
    };
  },
}));

import { beforeEach, describe, expect, it } from "vitest";
import { picksStore } from "@/app/store";
import type { PlayerData } from "@/app/store/utils";

function makePlayer(
  player_id: number,
  element_type: number,
  selling_price: number,
  web_name = `Player ${player_id}`
): PlayerData {
  return {
    id: String(player_id),
    player_id,
    element_type,
    selling_price,
    web_name,
  } as unknown as PlayerData;
}

describe("picksStore transfer slots", () => {
  beforeEach(() => {
    picksStore.setState({
      transferSlots: [],
      activeSlotId: null,
      drafts: { changes: [] },
      picks: {
        data: [],
        overall: { bank: 100 } as any,
      } as any,
      currentGameweek: 5,
    });
  });

  it("markOut adds a slot, adjusts bank up, and sets the active slot", () => {
    const player = makePlayer(1, 2, 55);

    picksStore.getState().markOut(player);

    const state = picksStore.getState();
    expect(state.transferSlots).toHaveLength(1);
    expect(state.transferSlots[0].out.player_id).toBe(1);
    expect(state.transferSlots[0].in).toBeNull();
    expect(state.activeSlotId).toBe(state.transferSlots[0].id);
    expect(state.picks!.overall.bank).toBe(155);
  });

  it("markOut on an already-out player removes the slot, reverses bank, and clears active slot", () => {
    const player = makePlayer(1, 2, 55);

    picksStore.getState().markOut(player);
    picksStore.getState().markOut(player);

    const state = picksStore.getState();
    expect(state.transferSlots).toHaveLength(0);
    expect(state.activeSlotId).toBeNull();
    expect(state.picks!.overall.bank).toBe(100);
  });

  it("fillSlot sets the in player on the targeted slot only", () => {
    const out1 = makePlayer(1, 2, 50);
    const out2 = makePlayer(2, 2, 60);
    picksStore.getState().markOut(out1);
    picksStore.getState().markOut(out2);

    const slot1Id = picksStore
      .getState()
      .transferSlots.find((s) => s.out.player_id === 1)!.id;
    const inPlayer = makePlayer(10, 2, 70);

    picksStore.getState().fillSlot(slot1Id, inPlayer);

    const state = picksStore.getState();
    const slot1 = state.transferSlots.find((s) => s.id === slot1Id)!;
    const slot2 = state.transferSlots.find((s) => s.out.player_id === 2)!;
    expect(slot1.in?.player_id).toBe(10);
    expect(slot2.in).toBeNull();
  });

  it("clearSlotIn unassigns the in player without removing the slot", () => {
    const out1 = makePlayer(1, 2, 50);
    picksStore.getState().markOut(out1);
    const slotId = picksStore.getState().transferSlots[0].id;
    picksStore.getState().fillSlot(slotId, makePlayer(10, 2, 70));

    picksStore.getState().clearSlotIn(slotId);

    const state = picksStore.getState();
    expect(state.transferSlots).toHaveLength(1);
    expect(state.transferSlots[0].in).toBeNull();
  });

  it("pairs out and in players by explicit slot identity, regardless of fill order", () => {
    const outA = makePlayer(1, 2, 50, "A");
    const outB = makePlayer(2, 2, 60, "B");
    picksStore.getState().markOut(outA);
    picksStore.getState().markOut(outB);

    const slotA = picksStore
      .getState()
      .transferSlots.find((s) => s.out.player_id === 1)!;
    const slotB = picksStore
      .getState()
      .transferSlots.find((s) => s.out.player_id === 2)!;

    const inX = makePlayer(10, 2, 55, "X");
    const inY = makePlayer(20, 2, 65, "Y");

    // fill B first, then A -- order-independent pairing must still be correct
    picksStore.getState().fillSlot(slotB.id, inX);
    picksStore.getState().fillSlot(slotA.id, inY);

    picksStore.getState().makeTransfers();

    const changes = picksStore.getState().drafts.changes;
    expect(changes).toHaveLength(2);

    const pairForA = changes.find((c) => c.out.data.player_id === 1)!;
    const pairForB = changes.find((c) => c.out.data.player_id === 2)!;

    expect(pairForA.in.data.player_id).toBe(20);
    expect(pairForB.in.data.player_id).toBe(10);
  });

  it("commits only filled slots, leaving unfilled slots pending", () => {
    const outA = makePlayer(1, 2, 50);
    const outB = makePlayer(2, 2, 60);
    picksStore.getState().markOut(outA);
    picksStore.getState().markOut(outB);
    const slotA = picksStore
      .getState()
      .transferSlots.find((s) => s.out.player_id === 1)!;

    picksStore.getState().fillSlot(slotA.id, makePlayer(10, 2, 55));

    picksStore.getState().makeTransfers();

    const state = picksStore.getState();
    expect(state.drafts.changes).toHaveLength(1);
    expect(state.transferSlots).toHaveLength(1);
    expect(state.transferSlots[0].out.player_id).toBe(2);
  });

  it("returns invalid when makeTransfers is called with no filled slots", async () => {
    picksStore.getState().markOut(makePlayer(1, 2, 50));

    const result = await picksStore.getState().makeTransfers();

    expect(result.isvalid).toBe(false);
  });

  it("resetTransfers clears all slots and the active slot", () => {
    picksStore.getState().markOut(makePlayer(1, 2, 50));

    picksStore.getState().resetTransfers();

    const state = picksStore.getState();
    expect(state.transferSlots).toHaveLength(0);
    expect(state.activeSlotId).toBeNull();
  });
});

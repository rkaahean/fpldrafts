import { PlayerData } from "@/components/pitch/pitchrow";

export interface DraftState {
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

export interface TransferProps {
  player_id: number;
  value: number;
}

export function updateTransfer(
  transfers: { [key: number]: TransferProps[] },
  data: PlayerData,
  addToBank: (amount: number) => void,
  removeFromBank: (amount: number) => void
) {
  /**
   * A function to handle adding a transfer and related side effects.
   */

  const isAlreadyTransferred =
    transfers[data.element_type].filter(
      (transfer) => transfer.player_id == data.player_id
    ).length > 0;

  if (!isAlreadyTransferred) {
    transfers[data.element_type].push({
      player_id: data.player_id,
      value: data.selling_price,
    });

    addToBank(data.selling_price);
  }
  // if already selected, remove from state
  else {
    // since transfer out is being removed, player is being added back
    removeFromBank(data.selling_price);
    transfers[data.element_type] = transfers[data.element_type].filter(
      (transfer) => transfer.player_id != data.player_id
    );
  }
}

export function removeTransfer(
  transfers: { [key: number]: TransferProps[] },
  data: PlayerData,
  addToBank: (amount: number) => void,
  removeFromBank: (amount: number) => void
) {
  /**
   * A function to handle adding a transfer and related side effects.
   */

  const isAlreadyTransferred =
    transfers[data.element_type].filter(
      (transfer) => transfer.player_id == data.player_id
    ).length > 0;

  if (isAlreadyTransferred) {
    // since transfer out is being removed, player is being added back
    removeFromBank(data.selling_price);
    transfers[data.element_type] = transfers[data.element_type].filter(
      (transfer) => transfer.player_id != data.player_id
    );
  }
}

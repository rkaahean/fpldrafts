export interface DraftState {
  id?: string;
  name?: string;
  description?: string;
  bank?: number;
  changes: DraftTransfer[];
}

export type PlayerData = {
  id: string;
  player_id: number;
  position: number;
  team_code: number;
  web_name: string;
  expected_goal_involvements_per_90: number;
  total_points: number;
  element_type: number;
  fixtures: {
    id: string;
    name: string;
    event: number;
    strength?: number;
  }[];
  selling_price: number;
  now_value: number;
  fpl_gameweek_player_stats: any;
  fpl_player_team: any;
};

export interface DraftTransfer {
  in: {
    data: PlayerData;
    price: number;
  };
  out: {
    data: PlayerData;
    price: number;
  };
  gameweek: number;
  type: "substitute" | "transfer";
}

export function updateTransfer(
  transfers: { [key: number]: PlayerData[] },
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
    transfers[data.element_type].push(data);

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
  transfers: { [key: number]: PlayerData[] },
  data: Pick<PlayerData, "player_id" | "element_type" | "selling_price">,
  addToBank?: (amount: number) => void,
  removeFromBank?: (amount: number) => void
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
    // removeFromBank(data.selling_price);
    transfers[data.element_type] = transfers[data.element_type].filter(
      (transfer) => transfer.player_id != data.player_id
    );
  }

  return transfers;
}

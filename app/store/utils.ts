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
  team_name: string;
  web_name: string;
  expected_goal_involvements_per_90: number;
  total_points: number;
  element_type: number;
  fixtures: {
    id: string;
    name: string;
    event: number;
    strength?: number;
    location: "H" | "A";
  }[];
  selling_price: number;
  now_value: number;
  fpl_gameweek_player_stats: any;
  fpl_player_team: any;
  clean_sheets?: number;
  bonus?: number;
  bps?: number;
  defensive_contribution?: number;
  form?: number;
  status?: string;
  chance_of_playing_next_round?: number | null;
  news?: string;
  expected_goals?: number;
  expected_assists?: number;
  expected_goals_conceded?: number;
  goals_conceded?: number;
  influence?: number;
  creativity?: number;
  threat?: number;
  ict_index?: number;
  saves?: number;
  yellow_cards?: number;
  red_cards?: number;
  starts?: number;
  selected_by_percent?: number;
  points_per_game?: number;
  expected_assists_per_90?: number;
  expected_goals_per_90?: number;
  saves_per_90?: number;
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

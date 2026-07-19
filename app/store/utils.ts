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


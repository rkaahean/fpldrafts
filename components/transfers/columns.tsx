"use client";

import { picksStore } from "@/app/store";
import { removeTransfer } from "@/app/store/utils";
import {
  recentForm,
  upcomingFixtures,
  type UpcomingFixture,
} from "@/lib/fpl/player-insights";
import { FPLPlayerDataToPlayerData, getFixtureIntensityClass } from "@/scripts/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { DataType, priceFilter, teamFilter } from "./table";

export function MetricHeader({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <abbr title={description} className="cursor-help no-underline">
      {label}
    </abbr>
  );
}

export function PlayerIdentity({ name, team }: { name: string; team: string }) {
  return (
    <div
      data-testid="player-identity"
      className="flex min-h-8 flex-col justify-center leading-tight"
    >
      <span className="font-semibold text-foreground">{name}</span>
      <span className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {team}
      </span>
    </div>
  );
}

function PlayerForm({
  stats,
}: {
  stats: { gameweek: number; total_points: number }[];
}) {
  const form = recentForm(stats);
  return (
    <div className="leading-tight">
      <div className="font-semibold">{form.points}</div>
      <div className="text-[10px] text-muted-foreground">
        last {form.games} GW{form.games === 1 ? "" : "s"}
      </div>
    </div>
  );
}

function PlayerFixtures({
  homeFixtures,
  awayFixtures,
}: {
  homeFixtures: any[];
  awayFixtures: any[];
}) {
  const currentGameweek = picksStore((state) => state.currentGameweek);
  const fixtures: UpcomingFixture[] = [
    ...homeFixtures.map((fixture) => ({
      event: fixture.event,
      opponent: fixture.fpl_team_a.short_name,
      difficulty: fixture.team_h_difficulty,
      isHome: true,
    })),
    ...awayFixtures.map((fixture) => ({
      event: fixture.event,
      opponent: fixture.fpl_team_h.short_name,
      difficulty: fixture.team_a_difficulty,
      isHome: false,
    })),
  ];

  return (
    <div className="flex gap-1">
      {upcomingFixtures(fixtures, currentGameweek).map((fixture) => (
        <span
          key={`${fixture.event}-${fixture.opponent}`}
          className={`${getFixtureIntensityClass(
            fixture.difficulty
          )} rounded px-1.5 py-1 text-[10px] font-semibold`}
          title={`GW ${fixture.event}: ${fixture.isHome ? "vs" : "@"} ${fixture.opponent}`}
        >
          {fixture.isHome ? fixture.opponent : fixture.opponent.toLowerCase()}
        </span>
      ))}
    </div>
  );
}

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<DataType>[] = [
  {
    id: "team_crest",
    cell: ({ row }) => {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-md border bg-background/50 p-1">
          <Image
            src={`https://resources.premierleague.com/premierleague/badges/t${row.original.team_code}.png`}
            alt={`${row.original.fpl_player_team.short_name} crest`}
            width={24}
            height={24}
            className="h-6 w-6 object-contain"
            priority
          />
        </div>
      );
    },
  },
  {
    accessorKey: "web_name",
    header: "Name",
    cell: ({ row }) => (
      <PlayerIdentity
        name={row.original.web_name}
        team={row.original.fpl_player_team.short_name}
      />
    ),
  },
  {
    id: "now_value",
    accessorKey: "now_value",
    header: "£",
    cell: ({ row }) => row.original.now_value / 10,
    filterFn: priceFilter,
  },
  {
    id: "form",
    header: "Form",
    cell: ({ row }) => (
      <PlayerForm stats={row.original.fpl_gameweek_player_stats} />
    ),
  },
  {
    id: "team_code",
    accessorKey: "team_code",
    header: "team_code",
    filterFn: teamFilter,
  },
  {
    accessorKey: "total_points",
    header: ({ column }) => {
      return (
        <button
          title="Season points"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <MetricHeader label="Pts" description="Season points" />
        </button>
      );
    },
  },
  {
    id: "fixtures",
    header: "Upcoming",
    cell: ({ row }) => (
      <PlayerFixtures
        homeFixtures={row.original.fpl_player_team.home_fixtures}
        awayFixtures={row.original.fpl_player_team.away_fixtures}
      />
    ),
  },
  {
    accessorKey: "expected_goal_involvements_per_90",
    header: ({ column }) => {
      return (
        <button
          title="Expected goal involvements per 90 minutes"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <MetricHeader
            label="xGI/90"
            description="Expected goal involvements per 90 minutes"
          />
        </button>
      );
    },
  },
  {
    id: "goal_contributions",
    header: () => (
      <MetricHeader label="G+A" description="Goals and assists" />
    ),
    cell: ({ row }) => row.original.goals_scored + row.original.assists,
  },
  {
    accessorKey: "expected_goals_per_90",
    header: ({ column }) => {
      return (
        <button
          title="Expected goals per 90 minutes"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <MetricHeader
            label="xG/90"
            description="Expected goals per 90 minutes"
          />
        </button>
      );
    },
  },
  {
    accessorKey: "expected_assists_per_90",
    header: ({ column }) => {
      return (
        <button
          title="Expected assists per 90 minutes"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <MetricHeader
            label="xA/90"
            description="Expected assists per 90 minutes"
          />
        </button>
      );
    },
  },
  {
    accessorKey: "expected_goal_involvements",
    header: ({ column }) => (
      <button
        title="Expected goal involvements"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <MetricHeader
          label="xGI"
          description="Expected goal involvements"
        />
      </button>
    ),
    cell: ({ row }) => row.original.expected_goal_involvements.toFixed(2),
  },
  {
    accessorKey: "expected_goals",
    header: ({ column }) => (
      <button
        title="Expected goals"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <MetricHeader label="xG" description="Expected goals" />
      </button>
    ),
    cell: ({ row }) => row.original.expected_goals.toFixed(2),
  },
  {
    accessorKey: "expected_assists",
    header: ({ column }) => (
      <button
        title="Expected assists"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <MetricHeader label="xA" description="Expected assists" />
      </button>
    ),
    cell: ({ row }) => row.original.expected_assists.toFixed(2),
  },
  {
    accessorKey: "minutes",
    header: ({ column }) => {
      return (
        <button
          title="Minutes played"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <MetricHeader label="Mins" description="Minutes played" />
        </button>
      );
    },
  },
  {
    id: "is_in_team",
  },
  {
    id: "player_add",
    cell: ({ row, table }) => {
      const transfersIn = picksStore((store) => store.transfersIn);
      const setTransferIn = picksStore((store) => store.setTransferIn);

      const makeTransfers = picksStore((store) => store.makeTransfers);

      const isSelectedForTransfer =
        transfersIn[row.original.element_type].filter(
          (transfer) => transfer.player_id == row.original.player_id
        ).length > 0;

      return (
        <Button
        variant="secondary"
        size="table"
        disabled={row.original.is_in_team}
        className="h-8 min-w-14 rounded-md px-3 text-xs font-semibold"
          onClick={async () => {
            table.getColumn("web_name")?.setFilterValue("");
            const formatted = FPLPlayerDataToPlayerData({
              position: 1,
              fpl_player: row.original,
              selling_price: row.original.now_value,
            });
            // if not already selected, push into state
            if (!isSelectedForTransfer) {
              transfersIn[row.original.element_type].push({
                id: row.original.id,
                player_id: row.original.player_id,
                selling_price: row.original.now_value,
                web_name: row.original.web_name,
                // made up
                team_name: formatted.team_name,
                position: 1,
                team_code: row.original.team_code,
                expected_goal_involvements_per_90:
                  row.original.expected_goal_involvements_per_90,
                total_points: row.original.total_points,
                element_type: row.original.element_type,
                now_value: row.original.now_value,
                fpl_gameweek_player_stats:
                  row.original.fpl_gameweek_player_stats,
                fpl_player_team: row.original.fpl_player_team,
                fixtures: formatted.fixtures,
              });
            }
            // if already selected, remove from state
            else {
              transfersIn[row.original.element_type] = transfersIn[
                row.original.element_type
              ].filter(
                (transfer) => transfer.player_id != row.original.player_id
              );
              setTransferIn(transfersIn);
              return;
            }

            const { isvalid, reason } = await makeTransfers();
            if (!isvalid) {
              // remove the transfer in as it is invalid
              const newTransfers = removeTransfer(transfersIn, {
                player_id: row.original.player_id,
                element_type: row.original.element_type,
                selling_price: row.original.now_value,
              });
              setTransferIn(newTransfers);
              toast({
                title: "Cannot make transfer.",
                description: reason,
                variant: "destructive",
              });
            }
          }}
        >
          Add
          {/* <PlusIcon className="w-[14px] h-[14px] 2xl:w-6 2xl:h-6 text-accent hover:text-primary transition-all hover:bg-accent rounded-full" /> */}
        </Button>
      );
    },
  },
  {
    accessorKey: "element_type",
    header: "element_type",
    filterFn: "equalsString",
  },
];

const MINI_COLUMN_IDS = new Set([
  "team_crest",
  "web_name",
  "now_value",
  "form",
  "fixtures",
  "expected_goal_involvements_per_90",
  "player_add",
]);

export const miniColumns = columns.filter((column) => {
  const columnId = "accessorKey" in column ? column.accessorKey : column.id;
  return typeof columnId === "string" && MINI_COLUMN_IDS.has(columnId);
});

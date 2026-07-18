"use client";

import { picksStore } from "@/app/store";

import { columns, miniColumns } from "./columns";
import { DataTable } from "./table";

export default function ClientTable(
  props: any & { showAdvancedFilters?: boolean }
) {
  const picksSelectors = picksStore((state) => ({
    picks: state.picks!,
  }));

  const { picks } = picksSelectors;

  let filteredData;
  if (picks) {
    filteredData = props.data.map((player: any) => {
      return {
        ...player,
        is_in_team:
          picks.data.filter(
            (pick) => pick.fpl_player.player_id == player.player_id
          ).length != 0,
      };
    });
  } else {
    filteredData = props.data.map((player: any) => {
      return {
        ...player,
        is_in_team: true,
      };
    });
  }

  return (
    <div
      className={
        props.showAdvancedFilters === false ? "w-full" : "h-full min-h-0 w-full"
      }
    >
      <DataTable
        columns={props.compact ? miniColumns : columns}
        data={filteredData}
        name="players"
        showAdvancedFilters={props.showAdvancedFilters}
        fillContainer={props.showAdvancedFilters !== false}
        compact={props.compact}
      />
    </div>
  );
}

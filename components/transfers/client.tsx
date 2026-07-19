"use client";

import { picksStore } from "@/app/store";
import { useMemo } from "react";

import { columns, miniColumns } from "./columns";
import { DataTable } from "./table";

export default function ClientTable(
  props: any & { showAdvancedFilters?: boolean }
) {
  const picksSelectors = picksStore((state) => ({
    picks: state.picks!,
  }));

  const { picks } = picksSelectors;

  const filteredData = useMemo(() => {
    const playerIds = new Set(
      picks?.data.map((pick) => pick.fpl_player.player_id) ?? []
    );
    return props.data.map((player: any) => ({
      ...player,
      is_in_team: picks ? playerIds.has(player.player_id) : true,
    }));
  }, [picks, props.data]);

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

"use client";

import { picksStore } from "@/app/store";
import { DataTable } from "../ui/data-table";
import { columns } from "./columns";

export default function ClientTable(props: any) {
  const picksSelectors = picksStore((state) => ({
    picks: state.picks!,
  }));

  const { picks } = picksSelectors;

  console.log(picks);

  let filteredData;
  if (picks) {
    filteredData = props.data.filter(
      (player: any) =>
        picks.data.filter(
          (pick) => pick.fpl_player.player_id == player.player_id
        ).length == 0
    );
  } else {
    filteredData = props.data;
  }

  return (
    <DataTable
      columns={columns}
      data={filteredData}
      name="players"
      isFilterable
      isPaginated
    />
  );
}

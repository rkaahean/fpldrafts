"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { DraftsData, columns } from "./columns";
import { DataTable } from "./table";

export default function Drafts() {
  const { data: session } = useSession();

  const { data } = useQuery({
    queryKey: ["draftsget"],
    queryFn: async () => {
      const response: { data: DraftsData[] } = await fetch("/api/drafts/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId: session!.team_id,
        }),
      }).then((res) => res.json());

      return response;
    },
  });

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-1/3">
      <div className="text-sm font-black">Drafts</div>
      <DataTable
        columns={columns}
        data={data.data!}
        name="drafts"
        isFilterable={false}
      />
    </div>
  );
}

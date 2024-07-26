"use client";

import { useQuery } from "@tanstack/react-query";
import Heading from "../text/heading";
import { DraftsData, columns } from "./columns";
import { DataTable } from "./table";

export default function Drafts(props: { teamId: string }) {
  // const { data: session, status } = useSession();

  // console.log("Drafts session", session, status);
  const { data } = useQuery({
    queryKey: ["draftsget"],
    queryFn: async () => {
      const response: { data: DraftsData[] } = await fetch("/api/drafts/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId: props.teamId,
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
      <Heading text={"Drafts"} />

      <DataTable
        columns={columns}
        data={data.data!}
        name="drafts"
        isFilterable={false}
      />
    </div>
  );
}

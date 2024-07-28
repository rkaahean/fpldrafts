"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Heading from "../../text/heading";
import { Skeleton } from "../../ui/skeleton";
import { DraftsData, columns } from "./columns";
import { DataTable } from "./table";

export default function Drafts() {
  const { data: session, status } = useSession();

  // console.log("Drafts session", session, status);
  const { data } = useQuery({
    queryKey: ["draftsget"],
    enabled: !!session,
    queryFn: async () => {
      const response: { data: DraftsData[] } = await fetch("/api/drafts/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer: ${session?.accessToken}`,
        },
      }).then((res) => res.json());

      return response;
    },
  });

  if (!data) {
    return (
      <div className="flex flex-col h-full w-full">
        <Heading text={"Drafts"} />
        <Skeleton className="w-full h-full rounded-md flex flex-col items-center justify-center">
          <Loader2 className="mr-2 h-12 w-12 animate-spin" />
        </Skeleton>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Heading text={"Drafts"} />
      <DataTable
        columns={columns}
        data={data.data!}
        name="drafts"
        isFilterable={false}
        isPaginated={true}
      />
    </div>
  );
}

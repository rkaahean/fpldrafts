"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "../../ui/card";
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
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }).then((res) => res.json());

      return response;
    },
  });

  if (!data) {
    return (
      <Card className="flex h-full min-h-0 flex-col overflow-hidden">
        <CardHeader className="border-b px-4 py-3" />
        <CardContent className="flex min-h-0 flex-1 items-center justify-center p-4">
        <Skeleton className="flex h-full w-full flex-col items-center justify-center rounded-md">
          <Loader2 className="mr-2 h-12 w-12 animate-spin" />
        </Skeleton>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full min-h-0">
      <DataTable
        columns={columns}
        data={data.data!}
        name="drafts"
        isFilterable
        isPaginated={true}
        filterColumnId="name"
      />
    </div>
  );
}

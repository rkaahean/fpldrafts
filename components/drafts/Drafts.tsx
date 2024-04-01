import prisma from "@/lib/db";
import { unstable_cache } from "next/cache";
import { DataTable } from "../ui/data-table";
import { columns } from "./columns";

const getData = unstable_cache(
  async () => {
    const data = await prisma.fPLDrafts.findMany();
    return data;
  },
  ["drafts"],
  {
    tags: ["drafts"],
  }
);
export default async function Drafts() {
  // const { data, isFetching } = useQuery({
  //   queryKey: ["drafts"],
  //   queryFn: async () => {
  //     const drafts = await fetch("/drafts/all", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     }).then((res) => res.json());
  //     return drafts.data;
  //   },
  // });

  // if (isFetching) {
  //   return <div>Loading...</div>;
  // }
  const drafts = await getData();

  return (
    <div className="flex flex-col h-full">
      <div className="text-md font-semibold">Drafts</div>
      <DataTable
        columns={columns}
        data={drafts!}
        name="drafts"
        isFilterable={false}
      />
    </div>
  );
}

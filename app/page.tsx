import { auth } from "@/auth/main";
import Drafts from "@/components/drafts/table/overview";
import Fixtures from "@/components/fixtures/table";
import Navbar from "@/components/navbar/main";
import Team from "@/components/pitch/team";
import Selector from "@/components/transfers/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  // if there's no session, or there's no access token
  if (!session || (session && !session.accessToken)) {
    redirect("/landing");
  } else if (!session.hasTeam) {
    redirect("/link");
  }
  return (
    <div className="flex flex-col lg:flex-row lg:h-screen">
      <Navbar image={session.user!.image!} />
      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-2 w-full h-fit lg:h-screen">
        <div className="lg:col-span-1 lg:max-h-screen gap-1 py-2 lg:pl-1 lg:pr-2">
          <div className="h-fit lg:h-full relative lg:overflow-scroll">
            <Selector />
          </div>
          {/* <PlayerComparison /> */}
        </div>
        <div className="lg:col-span-1 h-full py-2">
          <div className="flex flex-col h-full gap-2">
            <div className="h-[30vh] lg:h-1/3">
              <Drafts />
            </div>
            <div className="h-[80vh] lg:h-2/3">
              <Fixtures />
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 py-2 px-2 lg:pr-2 lg:h-screen">
          <Team />
        </div>
      </div>
    </div>
  );
}

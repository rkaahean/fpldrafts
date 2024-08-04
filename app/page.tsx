import { auth } from "@/auth/main";
import Drafts from "@/components/drafts/table/overview";
import Fixtures from "@/components/fixtures/server";
import DeviceWrapper from "@/components/home/main";
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

  const mobileContent = (
    <div className="flex flex-col bg-grainy px-4 gap-4">
      <Navbar image={session.user!.image!} />
      <Team />
      <Selector />
      <Drafts />
      <Fixtures />
    </div>
  );

  const desktopContent = (
    <div className="flex flex-row h-screen bg-grainy">
      <Navbar image={session.user!.image!} />
      <div className="grid grid-cols-4 gap-2 w-full h-fit">
        <div className="col-span-1 min-h-screen gap-1 py-2 pl-1 pr-2">
          <Selector />

          {/* <div className="h-fit lg:h-full relative lg:overflow-scroll">
              <Selector />
            </div> */}
          {/* <PlayerComparison /> */}
        </div>
        <div className="col-span-1 h-full py-2">
          <div className="flex flex-col h-full gap-2">
            <div className="h-1/3">
              <Drafts />
            </div>
            <div className="h-2/3">
              <Fixtures />
            </div>
          </div>
        </div>
        <div className="col-span-2 py-2 px-2 pr-2 h-screen">
          <Team />
        </div>
      </div>
    </div>
  );

  return (
    <DeviceWrapper
      mobileContent={mobileContent}
      desktopContent={desktopContent}
    />
  );
}

// export function isMobileServer(): boolean {
//   const headersList = headers();
//   const userAgent = headersList.get("user-agent") || "";

//   const parser = new UAParser(userAgent);
//   const result = parser.getResult();
//   const isMobile = result.device.type === "mobile";

//   return isMobile;
// }

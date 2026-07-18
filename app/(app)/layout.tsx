import { auth } from "@/auth/main";
import DeviceWrapper from "@/components/home/main";
import Navbar from "@/components/navbar/main";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  if (!session || (session && !session.accessToken)) {
    redirect("/landing");
  } else if (!session.hasTeam) {
    redirect("/link");
  }

  const mobileContent = (
    <div className="flex flex-col bg-grainy px-4 gap-4">
      <Navbar image={session.user!.image!} />
      <div className="flex flex-col gap-8">{children}</div>
    </div>
  );

  const desktopContent = (
    <div className="flex flex-col h-screen bg-grainy max-w-screen">
      <div className="flex-shrink-0 border-b">
        <Navbar image={session.user!.image!} />
      </div>
      <div className="flex-grow py-2 px-2 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
        {children}
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

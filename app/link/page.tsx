import { auth } from "@/auth/main";
import TeamLinkComponent from "./client";
import { redirect } from "next/navigation";

export default async function TeamLink() {
  const session = await auth();

  // if there's no session, or there's no access token
  if (!session || (session && !session.accessToken)) {
    redirect("/landing");
  } else if (session.hasTeam) {
    redirect("/");
  }

  return <TeamLinkComponent />;
}

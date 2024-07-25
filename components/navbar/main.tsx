"use client";

import { ExitIcon } from "@radix-ui/react-icons";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

export default function Navbar() {
  const { data: session, status } = useSession();

  if (status === "loading") return;
  if ((status === "authenticated" && !session) || status == "unauthenticated") {
    redirect("/landing");
  }

  console.log("Navbar", session, status);

  return (
    <div className="flex flex-col w-12 px-0 h-screen py-5 items-center gap-5 bg-bgsecondary">
      <Avatar>
        <AvatarImage src={session!.user!.image!} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Button
        variant="link"
        onClick={() => {
          signOut({ redirect: false });
          redirect("/landing");
        }}
      >
        <ExitIcon width={20} height={20}></ExitIcon>
      </Button>
    </div>
  );
}

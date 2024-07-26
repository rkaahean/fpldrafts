"use client";

import { ExitIcon } from "@radix-ui/react-icons";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

export default function Navbar(props: { image: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-col h-screen py-5 items-center gap-5 pl-2">
      <Avatar>
        <AvatarImage src={props.image} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Button
        variant="link"
        onClick={() => {
          signOut({ redirect: false });
          router.push("/landing");
        }}
      >
        <ExitIcon width={20} height={20}></ExitIcon>
      </Button>
    </div>
  );
}

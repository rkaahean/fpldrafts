"use client";

import { ExitIcon } from "@radix-ui/react-icons";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

export default function Navbar(props: { image: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-row lg:flex-col py-2 justify-center lg:items-center gap-5 pl-2">
      <Avatar>
        <AvatarImage src={props.image} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Button
        variant="link"
        onClick={async () => {
          await signOut();
          router.push("/landing");
        }}
      >
        <ExitIcon width={20} height={20}></ExitIcon>
      </Button>
    </div>
  );
}

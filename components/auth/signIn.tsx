"use client";

import { signIn } from "next-auth/react";
import { Icons } from "../icons";
import { Button } from "../ui/button";

export default function SignIn() {
  return (
    <Button
      onClick={async () => {
        await signIn("google", {
          callbackUrl: `/`,
        });
      }}
      className="bg-foreground hover:bg-foreground h-12 w-full"
      variant="ghost"
    >
      <div className="flex flex-row gap-2 items-center justify-center">
        <Icons.google className="bg-background" />
        <div className="text-black text-sm">Continue with Google</div>
      </div>
    </Button>
  );
}

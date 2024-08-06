"use client";

import { signIn } from "next-auth/react";
import { Button } from "./button";

export default function Header() {
  return (
    <div className="flex flex-row w-full justify-end py-2 px-4 gap-4">
      <Button variant="outline">
        <a>About</a>
      </Button>

      <Button
        onClick={async () => {
          await signIn("google", {
            callbackUrl: `/`,
          });
        }}
        variant="outline"
      >
        Sign In
      </Button>
    </div>
  );
}

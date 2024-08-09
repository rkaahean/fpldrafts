"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { Button } from "./button";

export default function Header() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // or a loading indicator

  return (
    <div className="flex flex-row w-full justify-end py-2 px-4 gap-4">
      <Button variant="outline">
        <a>About</a>
      </Button>

      {!isMobile && (
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
      )}
    </div>
  );
}

"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { Icons } from "../icons";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export default function SignIn() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // or a loading indicator
  if (isMobile) {
    return (
      <Card className="w-full border-0 bg-destructive text-destructive-foreground">
        <CardHeader>
          <CardTitle className="text-xl">
            <div>
              <div>Not available on mobile</div>
            </div>
          </CardTitle>
          <CardDescription className="text-sm">
            FPL drafts for mobile is a work in progress. Try accessing this page
            from a web-browser.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  return (
    <div className="w-full max-w-md lg:max-w-lg">
      <Card className="w-full border-0 bg-background">
        <CardHeader>
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription className="text-sm">
            An account helps store your FPL drafts. This has nothing to do with
            the actual FPL account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col w-full gap-4">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

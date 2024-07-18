"use client";

import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GoogleIcon from "@mui/icons-material/Google";

export default function SignIn() {
  return (
    <main className="grid grid-cols-2 min-h-screen min-w-screen">
      <div className="col-span-1">Hi</div>
      <div className="col-span-1 w-full flex flex-col min-h-screen items-center justify-center">
        <div className="w-1/2 flex flex-col gap-5">
          <div>
            <div className="text-xl font-bold">Create an account</div>
            <div className="text-muted-foreground italic">
              An account helps store your FPL drafts. This has nothing to do
              with the actual FPL account.
            </div>
          </div>

          <Button
            onClick={() => signIn("google")}
            className="bg-foreground hover:bg-foreground h-10"
            variant="ghost"
          >
            <GoogleIcon className="text-background" />
          </Button>

          <div>
            <Label htmlFor="teamid">Team ID</Label>
            <Input
              id="teamid"
              placeholder="Your FPL team ID"
              className="h-10"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

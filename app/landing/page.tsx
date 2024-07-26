"use client";

import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import GoogleIcon from "@mui/icons-material/Google";

export default function SignIn() {
  return (
    <main className="grid grid-cols-2 min-h-screen min-w-screen">
      <div className="col-span-1 bg-bgsecondary"></div>
      <div className="col-span-1 w-full flex flex-col min-h-screen items-center justify-center">
        <div className="w-1/2 flex flex-col gap-5">
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Create an account. </CardTitle>
              <CardDescription>
                An account helps store your FPL drafts. This has nothing to do
                with the actual FPL account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col w-full gap-1">
                <Label htmlFor="signin">Authenticate</Label>
                <Button
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                  className="bg-foreground hover:bg-foreground h-10"
                  variant="ghost"
                >
                  <GoogleIcon className="text-background" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

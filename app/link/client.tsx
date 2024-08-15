"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TeamLinkComponent() {
  const router = useRouter();
  const [teamNumber, setTeamNumber] = useState("");

  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(false);
  if (status == "loading") {
    return (
      <div className="flex h-screen w-screen flex-row items-center justify-center">
        <Loader2 className="mr-2 h-12 w-12 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col h-[80vh] w-screen items-center justify-center"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 40,
      }}
    >
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Enter your team id.</CardTitle>
          <CardDescription>
            Get the number from the Gameweek History page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="teamid">Team Id</Label>
                <Input
                  id="teamid"
                  // placeholder="44421"
                  onChange={(e) => setTeamNumber(e.target.value)}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            disabled={teamNumber.length == 0}
            onClick={async () => {
              if (isNaN(parseInt(teamNumber))) {
                toast({
                  title: "Enter a number.",
                  variant: "destructive",
                });
                return;
              }
              setLoading(true);
              await fetch("/api/link", {
                method: "POST",
                headers: {
                  "Content-type": "application/json",
                },
                body: JSON.stringify({
                  teamNumber,
                  userId: session!.user?.id,
                }),
              })
                .then((res) => res.json())
                .then(() => new Promise((resolve) => setTimeout(resolve, 2000)))
                .then(() => setLoading(false))
                .then(() => router.push("/"));
            }}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Link Team"
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

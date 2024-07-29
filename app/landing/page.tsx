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
import {
  CalendarIcon,
  FileInputIcon,
  LayoutListIcon,
  PoundSterlingIcon,
  SaveIcon,
  UserRoundIcon,
} from "lucide-react";

export default function SignIn() {
  const features = [
    {
      icon: <SaveIcon />,
      title: "Save Drafts",
      description: "Store and revisit multiple team selections.",
    },
    {
      icon: <PoundSterlingIcon />,
      title: "Completely Free",
      description: "No hidden costs or premium features.",
    },
    {
      icon: <CalendarIcon />,
      title: "Fixture Planning",
      description: "Plan transfers based on upcoming matches.",
    },
    {
      icon: <UserRoundIcon />,
      title: "(Coming Soon) Player Comparisons",
      description: "Compare stats and form of different players.",
    },
    {
      icon: <LayoutListIcon />,
      title: "(Coming Soon) Draft Comparisons",
      description: "Analyze strengths of different team setups.",
    },
  ];

  return (
    <main className="grid grid-cols-2 min-h-screen min-w-screen">
      <div className="col-span-1 bg-bgsecondary">
        <div className="flex flex-col items-center justify-center min-h-screen tracking-tight gap-16">
          <div>
            <div className="text-3xl font-semibold">
              Welcome to FPL Planner.
            </div>
            <CardDescription className="text-md">
              A free tool to plan your FPL drafts.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-5">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-row gap-5">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-content flex flex-col">
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
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
                  onClick={async () => {
                    await signIn("google", {
                      callbackUrl: `/`,
                    });
                  }}
                  className="bg-foreground hover:bg-foreground h-10"
                  variant="ghost"
                >
                  <FileInputIcon className="text-background" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

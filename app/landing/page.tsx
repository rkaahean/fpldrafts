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
import {
  CalendarIcon,
  LayoutListIcon,
  PoundSterlingIcon,
  SaveIcon,
  UserRoundIcon,
} from "lucide-react";

import { Icons } from "@/components/icons/";

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
    <main className="flex flex-col lg:grid lg:grid-cols-2 min-h-screen min-w-screen">
      <div className="bg-bgsecondary pt-8 px-4 lg:px-8 lg:min-h-screen">
        <div className="flex flex-col items-center justify-center lg:min-h-screen tracking-tight gap-8 lg:gap-16">
          <div className="text-center lg:text-left">
            <h1 className="text-2xl lg:text-3xl font-semibold">
              Welcome to FPL Planner.
            </h1>
            <CardDescription className="text-sm lg:text-md">
              A free tool to plan your FPL drafts.
            </CardDescription>
          </div>
          <div className="flex flex-col w-full max-w-md items-center">
            <div className="flex gap-6 flex-col">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-row gap-4 items-start">
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-content flex flex-col">
                    <h3 className="feature-title font-medium">
                      {feature.title}
                    </h3>
                    <p className="feature-description text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col items-center justify-center px-4 lg:p-8 lg:min-h-screen bg-bgsecondary flex-grow">
        <div className="w-full max-w-md lg:max-w-lg">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl">Create an account</CardTitle>
              <CardDescription className="text-sm">
                An account helps store your FPL drafts. This has nothing to do
                with the actual FPL account.
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
                    <div className="text-black text-sm">
                      Continue with Google
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

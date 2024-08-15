import { auth } from "@/auth/main";
import SignIn from "@/components/auth/signIn";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  CalendarIcon,
  LayoutListIcon,
  PoundSterlingIcon,
  SaveIcon,
  UserRoundIcon,
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function Landing() {
  const session = await auth();

  if (session && session.hasTeam) {
    redirect("/");
  } else if (session) {
    redirect("/link");
  }
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
    <main className="flex flex-col min-h-screen min-w-screen bg-background gap-8 items-center">
      <div className="px-4">
        <div className="flex flex-col items-center justify-center tracking-tight gap-8">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-8xl font-semibold">
              Welcome to FPL drafts.
            </h1>
            <div className="text-sm lg:text-lg text-muted-foreground">
              A free tool to plan to plan and structure your FPL strategy.
            </div>
          </div>
          <div className="flex flex-col w-full max-w-md items-center bg-player py-8 px-4 border-1 border-bgsecondary rounded-lg">
            <div className="flex gap-6 flex-col">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-row gap-8 items-start text-black"
                >
                  <div className="feature-icon w-8 h-8">{feature.icon}</div>
                  <div className="feature-content flex flex-col">
                    <h3 className="feature-title font-normal text-md lg:text-xl tracking-tighter">
                      {feature.title}
                    </h3>
                    <p className="feature-description text-black/50 text-xs lg:text-base">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <SignIn />

      <div className="w-full lg:w-1/2 text-primary mb-8 px-4 lg:p-0">
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>How many drafts can you create?</AccordionTrigger>
            <AccordionContent>
              As many as you wish. There&apos;s no limit.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>
              Why do you need my google sign in?
            </AccordionTrigger>
            <AccordionContent>
              When you save a draft, it needs an account for the draft to be
              linked with. This has nothing to do with your actual FPL account.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>
              Is having an account mandatory for accessing the app?
            </AccordionTrigger>
            <AccordionContent>
              I&apos;m working on a demo mode where you can try out the app, and
              sign in if you chose to later on. In the future, there will be a
              local only mode to save drafts.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>
              What&apos;s the reason for needing my team ID?
            </AccordionTrigger>
            <AccordionContent>
              The app will automatically pull in your latest gameweek data. This
              data is public on the FPL website.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
  );
}

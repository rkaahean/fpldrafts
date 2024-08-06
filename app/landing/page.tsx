import { auth } from "@/auth/main";
import SignIn from "@/components/auth/signIn";
import Footer from "@/components/ui/footer";
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
    <main className="flex flex-col min-h-screen min-w-screen bg-background gap-2">
      <div className="pt-8 px-4">
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
      <div className="w-full flex flex-col items-center justify-center px-4">
        <SignIn />
      </div>
      <Footer />
    </main>
  );
}

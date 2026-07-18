"use client";

import { cn } from "@/scripts/lib/utils";
import { CalendarDays, Home, ListChecks, LogOut, Users } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/fixtures", label: "Fixtures", icon: CalendarDays },
  { href: "/players", label: "Players", icon: Users },
  { href: "/drafts", label: "Drafts", icon: ListChecks },
];

export default function Navbar(props: { image: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex flex-row lg:flex-col py-2 justify-between lg:justify-start lg:h-full lg:items-center gap-5 pl-2 lg:pr-2">
      <div className="flex flex-row lg:flex-col items-center gap-5">
        <Avatar>
          <AvatarImage src={props.image} alt="profile_image" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <nav className="flex flex-row lg:flex-col items-center gap-1 lg:gap-3">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Button
                key={href}
                variant="ghost"
                size="icon"
                asChild
                className={cn(
                  "lg:w-full lg:justify-start lg:gap-2 lg:px-2",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
                title={label}
              >
                <Link href={href}>
                  <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                  <span className="hidden lg:inline text-sm">{label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
      <Button
        variant="link"
        onClick={async () => {
          await signOut();
          router.push("/landing");
        }}
      >
        <LogOut width={20} height={20} />
      </Button>
    </div>
  );
}

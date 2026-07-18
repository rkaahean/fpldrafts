import { signIn } from "@/auth/main";

import { isOnMobile } from "@/scripts/lib/serverUtils";
import Link from "next/link";
import { Button } from "./button";

export default async function Header() {
  const isMobile = await isOnMobile();

  return (
    <div className="flex flex-row w-full justify-end py-2 px-4 gap-4">
      <Button variant="outline" asChild>
        <Link href="/">Home</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/about">About</Link>
      </Button>

      {!isMobile && (
        <form
          action={async () => {
            "use server";
            await signIn("google", {
              redirectTo: "/",
            });
          }}
        >
          <Button variant="outline">Sign In</Button>
        </form>
      )}
    </div>
  );
}

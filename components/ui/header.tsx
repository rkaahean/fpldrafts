import { signIn } from "@/auth/main";

import { isOnMobile } from "@/lib/serverUtils";
import { Button } from "./button";

export default function Header() {
  const isMobile = isOnMobile();

  return (
    <div className="flex flex-row w-full justify-end py-2 px-4 gap-4">
      <Button variant="outline">
        <a href="/">Home</a>
      </Button>
      <Button variant="outline">
        <a href="/about">About</a>
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

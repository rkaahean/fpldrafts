import { signIn } from "@/auth/main";
import { headers } from "next/headers";
import { Button } from "./button";

export default function Header() {
  const h = headers();
  const isMobile =
    h.get("User-Agent")?.includes("iOS") ||
    h.get("User-Agent")?.includes("Android");

  return (
    <div className="flex flex-row w-full justify-end py-2 px-4 gap-4">
      <Button variant="outline">
        <a>About</a>
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

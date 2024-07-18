"use client";

import { signIn } from "@/auth/main";

import GoogleIcon from "@mui/icons-material/Google";

export default function GoogleSignIn() {
  return (
    <form
      className="bg-foreground w-full"
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      <GoogleIcon />
    </form>
  );
}

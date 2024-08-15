import { headers } from "next/headers";

export function isOnMobile() {
  const h = headers();
  const isMobile =
    h.get("User-Agent")?.includes("iOS") ||
    h.get("User-Agent")?.includes("Android");
  return isMobile && process.env.NODE_ENV == "production";
}

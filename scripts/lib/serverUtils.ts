import { headers } from "next/headers";

export async function isOnMobile() {
  const h = await headers();
  const isMobile =
    h.get("User-Agent")?.includes("iOS") ||
    h.get("User-Agent")?.includes("Android");
  return isMobile && process.env.MOBILE_FEATURES == "on";
}

"use client";

import { ReactNode, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";

export default function DeviceWrapper({
  children,
  mobileContent,
  desktopContent,
}: {
  children?: ReactNode;
  mobileContent: ReactNode;
  desktopContent: ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log("IS mobile", isMobile); // This will only log on the client
  }, []);

  if (!isClient) return null; // or a loading indicator

  return isMobile ? mobileContent : desktopContent;
}

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen w-screen flex-row items-center justify-center">
      <Loader2 className="mr-2 h-12 w-12 animate-spin" />
    </div>
  );
}

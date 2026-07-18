import { Code2, Mail } from "lucide-react";

export default function Footer() {
  return (
    <div className="relative 2xl:absolute bottom-0 flex flex-col w-full items-center mb-4 gap-4">
      <div className="contact text-primary flex flex-row w-full items-center justify-center gap-8">
        <a href="mailto:ranjan31051997@gmail.com?subject=FPL%20Drafts%20Feedback">
          <Mail className="w-4 h-4 2xl:h-8 2xl:w-8" />
        </a>
        <a href="https://github.com/rkaahean/fpldrafts" target="blank">
          <Code2 className="w-4 h-4 2xl:h-8 2xl:w-8" />
        </a>
      </div>
      <div className="text-muted-foreground text-xs 2xl:text-base">
        © 2024 fpldrafts.com
      </div>
    </div>
  );
}

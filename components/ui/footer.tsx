import { EnvelopeClosedIcon, GitHubLogoIcon } from "@radix-ui/react-icons";

export default function Footer() {
  return (
    <div className="flex flex-col w-full items-center">
      <div className="contact text-primary flex flex-row w-full items-center justify-center gap-8 mb-4">
        <a href="mailto:ranjan31051997@gmail.com?subject=FPL%20Drafts%20Feedback">
          <EnvelopeClosedIcon className="w-4 h-4" />
        </a>
        <a href="https://github.com/rkaahean/fpldrafts" target="blank">
          <GitHubLogoIcon className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

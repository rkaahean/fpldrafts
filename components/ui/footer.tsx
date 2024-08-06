import { EnvelopeClosedIcon, GitHubLogoIcon } from "@radix-ui/react-icons";

export default function Footer() {
  return (
    <div className="flex flex-col w-full items-center">
      <div className="contact text-primary flex flex-row w-full items-center justify-center gap-4">
        <button>
          <EnvelopeClosedIcon />
        </button>
        <button>
          <GitHubLogoIcon />
        </button>
      </div>
    </div>
  );
}

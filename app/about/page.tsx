import Image from "next/image";
import DraftImage from "../../public/about/drafts.png";
import PlayerImage from "../../public/about/player.png";

export default function About() {
  return (
    <div className="flex flex-col text-primary h-fit items-center gap-8">
      <div className="drafts flex flex-col gap-2 lg:gap-4 w-2/3">
        <div className="text-2xl lg:text-7xl font-semibold tracking-tight">
          Unlimited planning
        </div>
        <div className="flex flex-col lg:flex-row w-full justify-start lg:justify-between gap-2">
          <div className="w-60 h-44 lg:w-[480px] lg:h-[360px]">
            <Image src={DraftImage} alt="Draft Image" />
          </div>
          <div className="w-full lg:w-1/2 text-base lg:text-lg text-muted-foreground">
            There&apos;s{" "}
            <span className="text-highlight font-semibold">no restriction</span>{" "}
            on the number of drafts. Create multiple drafts each gameweek to
            plan for different scenarios.
            <br />
            <br />
            Load and delete drafts as you please. The possibilites are endless!
          </div>
        </div>
      </div>

      <div className="player lex flex-col gap-2 lg:gap-4 w-2/3">
        <div className="text-2xl lg:text-7xl font-semibold tracking-tight">
          Detailed player stats
        </div>
        <div className="flex flex-col lg:flex-row w-full justify-start lg:justify-between gap-2">
          <div className="w-full lg:w-1/2 text-base lg:text-lg text-muted-foreground">
            See upcoming fixtures + other player stats.
            <br />
            <br />
            Load and delete drafts as you please. The possibilites are endless!
          </div>
          <div className="w-32 h-32 lg:w-[480px] lg:h-[360px]">
            <Image src={PlayerImage} alt="Draft Image" />
          </div>
        </div>
      </div>
    </div>
  );
}

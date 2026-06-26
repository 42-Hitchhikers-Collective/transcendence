import { cn } from "@/shared/lib/utils";
import type { GameHistory } from "@/app/auth/mockProfiles";
import { OpponentsList } from "./OpponentsList";
import { HandThumbDownIcon, TrophyIcon } from "@heroicons/react/24/solid";

type HistoryCardProps = {
  game: GameHistory;
};

type ResultViewModel = {
  icon: typeof TrophyIcon | typeof HandThumbDownIcon;
  iconStyle: string;
  title: "Won" | "Lost";
  bgStyle: string;
  titleStyle: string;
};

export function HistoryCard({ game }: HistoryCardProps) {
  const RESULT_VIEW_BY_RESULT: Record<GameHistory["result"], ResultViewModel> =
    {
      win: {
        icon: TrophyIcon,
        iconStyle: " text-white bg-green-500",
        title: "Won",
        bgStyle: "bg-green-50 border-green-200",
        titleStyle: "text-start text-[clamp(1.1rem,2.2vw,1.8rem)] min-[450px]:text-[clamp(1.6rem,3vw,2.3rem)] lg:text-[clamp(1.1rem,2.2vw,1.8rem)] font-bold text-green-500",
      },
      loss: {
        icon: HandThumbDownIcon,
        iconStyle: " text-white bg-red-500",
        title: "Lost",
        bgStyle: "bg-red-50 border-red-200",
        titleStyle: "text-start text-[clamp(1.1rem,2.2vw,1.8rem)] min-[450px]:text-[clamp(1.6rem,3vw,2.3rem)] lg:text-[clamp(1.1rem,2.2vw,1.8rem)] font-bold text-red-500",
      },
    };

  const resultView = RESULT_VIEW_BY_RESULT[game.result];
  const ResultIcon = resultView.icon;

  return (
    <div
      className={cn(
        // ── Always 2-column layout — icon column stays beside text at every size ──
        "grid grid-cols-[1fr_4fr] min-h-[clamp(7rem,10vw,11rem)] min-[450px]:min-h-[clamp(10rem,14vw,15rem)] lg:min-h-[clamp(7rem,10vw,11rem)] mb-[clamp(0.5rem,0.8vw,0.75rem)] rounded-xl border bg-white shadow-sm relative px-[clamp(0.75rem,1.5vw,1.5rem)] min-[450px]:px-[clamp(1.25rem,2vw,2rem)] lg:px-[clamp(0.75rem,1.5vw,1.5rem)]",
        resultView.bgStyle,
      )}
    >
      <div>
        <ResultIcon
          className={cn(
            "content-start h-[clamp(3.5rem,5.5vw,5.5rem)] min-[450px]:h-[clamp(5rem,7vw,7rem)] lg:h-[clamp(3.5rem,5.5vw,5.5rem)] w-[clamp(2.5rem,4.5vw,4.5rem)] min-[450px]:w-[clamp(3.5rem,5.5vw,5.5rem)] lg:w-[clamp(2.5rem,4.5vw,4.5rem)] shrink-0 [clip-path:polygon(0_0,100%_0,100%_100%,50%_82%,0_100%)] p-[clamp(0.75rem,1.2vw,1.25rem)] min-[450px]:p-[clamp(1rem,1.5vw,1.5rem)] lg:p-[clamp(0.75rem,1.2vw,1.25rem)] pb-[clamp(1rem,1.5vw,1.5rem)] min-[450px]:pb-[clamp(1.5rem,2vw,2rem)] lg:pb-[clamp(1rem,1.5vw,1.5rem)]",
            resultView.iconStyle,
          )}
        />
      </div>
      <div className="flex flex-col items-end py-[clamp(0.5rem,1vw,1rem)] min-[450px]:py-[clamp(0.75rem,1.5vw,1.5rem)] lg:py-[clamp(0.5rem,1vw,1rem)]">
        <MatchResult resultView={resultView} game={game} />
        <OpponentsList opponent={game.opponents} />
      </div>

    </div>
  );
}

const formatMatchDate = (value: string) =>
  new Date(value)
    .toLocaleString([], {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(",", " ");

function MatchResult({
  resultView,
  game,
}: {
  resultView: ResultViewModel;
  game: GameHistory;
}) {
  return (
    <div className="w-full ">
      <div className="pb-[clamp(0.5rem,1vw,1rem)] min-[450px]:pb-[clamp(0.75rem,1.5vw,1.5rem)] lg:pb-[clamp(0.5rem,1vw,1rem)]">
        <p className="text-[clamp(0.6rem,1vw,1rem)] min-[450px]:text-[clamp(0.85rem,1.5vw,1.3rem)] lg:text-[clamp(0.6rem,1vw,1rem)] text-end font-medium">{formatMatchDate(game.date)}</p>
        <h1 className={resultView.titleStyle}>{resultView.title}</h1>
        <h3 className="text-[clamp(0.85rem,1.3vw,1.25rem)] min-[450px]:text-[clamp(1.1rem,1.8vw,1.6rem)] lg:text-[clamp(0.85rem,1.3vw,1.25rem)] text-start">
          In the{" "}
          <span className="font-extrabold">
            "{game.roomName || "Unnamed Room"}"
          </span>
        </h3>
      </div>
    </div>
  );
}

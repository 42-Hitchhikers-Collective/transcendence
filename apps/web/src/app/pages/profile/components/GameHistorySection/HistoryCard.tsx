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
        titleStyle: "text-start text-2xl font-bold text-green-500",
      },
      loss: {
        icon: HandThumbDownIcon,
        iconStyle: " text-white bg-red-500",
        title: "Lost",
        bgStyle: "bg-red-50 border-red-200",
        titleStyle: "text-start text-2xl font-bold text-red-500",
      },
    };

  const resultView = RESULT_VIEW_BY_RESULT[game.result];
  const ResultIcon = resultView.icon;

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_4fr] min-h-40 mb-3 rounded-xl border bg-white shadow-sm relative  px-6",
        resultView.bgStyle,
      )}
    >
      <div>
        <ResultIcon
          className={cn(
            "content-start  h-20 w-16 shrink-0 [clip-path:polygon(0_0,100%_0,100%_100%,50%_82%,0_100%)] p-4 pb-5 size-15 ",
            resultView.iconStyle,
          )}
        />
      </div>
      <div className="flex flex-col items-end py-4">
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
      <div className="pb-4">
        <p className="text-xs text-end">{formatMatchDate(game.date)}</p>
        <h1 className={resultView.titleStyle}>{resultView.title}</h1>
        <h3 className="text-base text-start">
          In the{" "}
          <span className="font-extrabold">
            "{game.roomName || "Unnamed Room"}"
          </span>
        </h3>
      </div>
    </div>
  );
}

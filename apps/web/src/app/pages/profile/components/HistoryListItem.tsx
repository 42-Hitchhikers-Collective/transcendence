import { Trophy, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatedTooltip } from "@/shared/components/ui/animated-tooltip";
import { cn } from "@/shared/lib/utils";
import type { GameHistory } from "@/features/profile/mockData/mockProfiles";

type GameHistoryItemProps = {
  game: GameHistory;
};

type ResultViewModel = {
  icon: LucideIcon;
  iconStyle: string;
  title: "WINNER" | "LOSER";
  titleStyle: string;
};

export function GameHistoryItem({ game }: GameHistoryItemProps) {
  const RESULT_VIEW_BY_RESULT: Record<GameHistory["result"], ResultViewModel> =
    {
      win: {
        icon: Trophy,
        iconStyle: " text-green-500 bg-green-500/10",
        title: "WINNER",
        titleStyle: "text-start text-4xl font-bold text-green-500",
      },
      loss: {
        icon: XCircle,
        iconStyle: " text-red-500 bg-red-500/10",
        title: "LOSER",
        titleStyle: "text-start text-4xl font-bold text-red-500",
      },
    };

  const resultView = RESULT_VIEW_BY_RESULT[game.result];
  const ResultIcon = resultView.icon;

  return (
    <div className="grid grid-cols-[1fr_4fr] rounded-lg bg-muted min-h-40 m-4">
      <div>
        <ResultIcon
          className={cn(
            "mx-4 h-20 w-16 shrink-0 [clip-path:polygon(0_0,100%_0,100%_100%,50%_82%,0_100%)] flex items-center justify-center p-2 pb-4 size-15",
            resultView.iconStyle,
          )}
        />
      </div>
      <div className="flex flex-col items-end pr-8  py-4">
        <MatchResult resultView={resultView} game={game} />
        <AnimatedTooltip items={game.opponents} />
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
    <div className="w-full p-0">
      <p className="text-sm text-end">{formatMatchDate(game.date)}</p>
      <div className="py-4">
        <h1 className={resultView.titleStyle}>{resultView.title}</h1>
        <h3 className="text-sm text-start">
          In the{" "}
          <span className="font-extrabold">
            "{game.roomName || "Unnamed Room"}"
          </span>
        </h3>
      </div>
    </div>
  );
}

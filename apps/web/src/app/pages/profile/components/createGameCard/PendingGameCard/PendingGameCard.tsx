import PendingGameTimer from "./PendingGameTimer";

type PendingGameCardProps = {
  activeRoomName: string;
  onRejoin: () => void;
  onLeave: () => void;
};

export default function PendingGameCard({
  activeRoomName,
  onRejoin,
  onLeave,
}: PendingGameCardProps) {
  const { timeLeft, isRunning, start } = PendingGameTimer(30_000);

  return (
    <div
      ref={(el) => {
        if (el && !isRunning) start();
      }}
      className="relative h-full overflow-hidden rounded-2xl border border-rose-200 bg-linear-to-br from-rose-50 via-white to-amber-50 p-[clamp(1rem,3vw,3rem)] min-[450px]:p-[clamp(1.5rem,4vw,4rem)] lg:p-[clamp(1rem,3vw,3rem)] shadow-sm"
    >
      <div className="absolute -right-6 -top-6 md:-right-8 md:-top-8 lg:-right-10 lg:-top-10 h-24 w-24 md:h-32 md:w-32 lg:h-40 lg:w-40 rounded-full bg-rose-200/40 blur-2xl" />
      <div className="absolute -bottom-8 -left-6 md:-bottom-12 md:-left-8 lg:-bottom-16 lg:-left-10 h-28 w-28 md:h-36 md:w-36 lg:h-48 lg:w-48 rounded-full bg-amber-200/40 blur-2xl" />

      <div className="relative flex h-full flex-col items-center justify-center gap-[clamp(1rem,1.8vw,2rem)] min-[450px]:gap-[clamp(1.5rem,2.5vw,3rem)] lg:gap-[clamp(1rem,1.8vw,2rem)] text-center">
        <div className="space-y-[clamp(0.5rem,0.8vw,0.75rem)] min-[450px]:space-y-[clamp(0.75rem,1.2vw,1.25rem)] lg:space-y-[clamp(0.5rem,0.8vw,0.75rem)]">
          <h3 className="text-[clamp(1.5rem,5vw,3rem)] min-[450px]:text-[clamp(2rem,6vw,4rem)] lg:text-[clamp(1.5rem,5vw,3rem)] font-extrabold tracking-tight text-slate-900">
            Aren't you forgetting something?
          </h3>

          <p className="mx-auto max-w-xl text-[clamp(0.85rem,1.2vw,1.125rem)] min-[450px]:text-[clamp(1rem,1.5vw,1.3rem)] lg:text-[clamp(0.85rem,1.2vw,1.125rem)] text-slate-600">
            Your friends are waiting for you in room "
            <span className="text-rose-500">{activeRoomName}</span>" ! <br />
            You won&apos;t be able to join or create a new room until you
            leave this one for good, decide quickly or you will be kicked out by default after 30 seconds of inactivity!
          </p>
          {/* <p className="text-[clamp(1rem,1.5vw,1.5rem)] font-bold text-rose-500 tabular-nums">
            {Math.ceil(timeLeft / 1000)}s
          </p> */}
          <div className="mx-auto size-[clamp(2rem,4vw,3rem)] animate-spin rounded-full border-[3px] border-rose-200 border-t-rose-500" />
        </div>

        <div className="flex flex-row items-center justify-center gap-[clamp(0.5rem,1vw,1rem)] min-[450px]:gap-[clamp(0.75rem,1.5vw,1.5rem)] lg:gap-[clamp(0.5rem,1vw,1rem)] py-[clamp(1rem,2vw,2rem)] min-[450px]:py-[clamp(1.5rem,3vw,3rem)] lg:py-[clamp(1rem,2vw,2rem)]">
          <button
            type="button"
            onClick={onRejoin}
            className="h-[clamp(2.5rem,3.2vw,3.5rem)] min-[450px]:h-[clamp(3rem,4.5vw,4.5rem)] lg:h-[clamp(2.5rem,3.2vw,3.5rem)] px-[clamp(1.5rem,2vw,2rem)] min-[450px]:px-[clamp(2rem,3vw,3rem)] lg:px-[clamp(1.5rem,2vw,2rem)] text-[clamp(0.85rem,1.2vw,1.125rem)] min-[450px]:text-[clamp(1rem,1.4vw,1.3rem)] lg:text-[clamp(0.85rem,1.2vw,1.125rem)] rounded-lg bg-emerald-500 font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Rejoin room
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="h-[clamp(2.5rem,3.2vw,3.5rem)] min-[450px]:h-[clamp(3rem,4.5vw,4.5rem)] lg:h-[clamp(2.5rem,3.2vw,3.5rem)] px-[clamp(1.5rem,2vw,2rem)] min-[450px]:px-[clamp(2rem,3vw,3rem)] lg:px-[clamp(1.5rem,2vw,2rem)] text-[clamp(0.85rem,1.2vw,1.125rem)] min-[450px]:text-[clamp(1rem,1.4vw,1.3rem)] lg:text-[clamp(0.85rem,1.2vw,1.125rem)] rounded-lg bg-rose-500 font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Leave room
          </button>
        </div>
      </div>
    </div>
  );
}

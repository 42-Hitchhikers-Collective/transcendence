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
      className="relative h-full overflow-hidden rounded-2xl border border-rose-200 bg-linear-to-br from-rose-50 via-white to-amber-50 p-12 shadow-sm"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-200/40 blur-2xl" />
      <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-amber-200/40 blur-2xl" />

      <div className="relative flex h-full flex-col items-center justify-center gap-6 text-center">
        <div className="space-y-3">
          <h3 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Aren't you forgetting something?
          </h3>
          <p>{timeLeft / 1000}s</p>
          <p className="mx-auto max-w-xl text-lg text-slate-600">
            Your friends are waiting for you in room "
            <span className="text-rose-500">{activeRoomName}</span>" ! <br />
            You won&apos;t be able to join or create a new room until you
            leave this one for good, decide wisely...
          </p>
        </div>

        <div className="flex flex-row items-center justify-center gap-4 py-10">
          <button
            type="button"
            onClick={onRejoin}
            className="h-12 rounded-lg bg-emerald-500 px-8 text-lg font-semibold text-white hover:opacity-90"
          >
            Rejoin room
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="h-12 rounded-lg bg-rose-500 px-8 text-lg font-semibold text-white hover:opacity-90"
          >
            Leave room
          </button>
        </div>
      </div>
    </div>
  );
}

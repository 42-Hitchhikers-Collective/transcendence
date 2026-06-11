type StartGameProps = {
  onStart: () => void;
  error: string | null;
};

export default function StartGame({ onStart, error }: StartGameProps) {
  return (
    <div className="relative h-full overflow-hidden rounded-2xl border bg-linear-to-br from-rose-50 via-white to-amber-50 p-12">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-rose-200/40 blur-2xl" />
      <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-amber-200/40 blur-2xl" />

      <div className="relative flex h-full flex-col items-center justify-center gap-8 p-24">
        <button
          type="button"
          onClick={onStart}
          className="h-14 rounded-lg bg-rose-500 px-8 text-lg font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Start the game for everyone
        </button>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </div>
  );
}

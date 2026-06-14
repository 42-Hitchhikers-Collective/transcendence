import background from "@/assets/backgrounds/unocards_gemini.png";

export default function GamePageError({ roomError }: { roomError: string }) {
  return (
    <div className="relative flex h-screen items-center justify-center bg-neutral-950">
      {/* Dark grayscale background layer */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(100%) brightness(0.3)",
        }}
      />

      {/* Card */}
      <div className="relative z-10 overflow-hidden rounded-2xl border border-slate-200/10 bg-neutral-950 p-12 shadow-sm text-center">
        <div className="rounded-full bg-rose-200/40 blur-2xl" />
        <div className="rounded-full bg-amber-200/40 blur-2xl" />
        <div className="space-y-4">
          <p className="text-4xl font-semibold text-rose-700">An error occured!</p>
          <p className="text-white mb-10 text-1xl">{roomError}</p>
          <a
            href="/profile"
            className="inline-block rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-500 transition"
          >
            Back to Profile
          </a>
        </div>
      </div>
    </div>
  );
}

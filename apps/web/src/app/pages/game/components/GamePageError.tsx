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
      <div className="relative z-10 overflow-hidden rounded-2xl border border-slate-200/10 bg-neutral-950 p-[clamp(1.5rem,5vw,3.5rem)] shadow-sm text-center">
        <div className="rounded-full bg-rose-200/40 blur-2xl" />
        <div className="rounded-full bg-amber-200/40 blur-2xl" />
        <div className="space-y-4">
          <p className="text-[clamp(1.5rem,4vw,3rem)] font-semibold text-rose-700">An error occured!</p>
          <p className="text-white mb-[clamp(1rem,2.5vw,2.5rem)] text-[clamp(0.8rem,1.2vw,1.25rem)]">{roomError}</p>
          <a
            href="/"
            className="inline-block rounded-lg bg-rose-600 px-[clamp(0.75rem,1.5vw,1.25rem)] py-[clamp(0.4rem,0.8vw,0.6rem)] text-[clamp(0.7rem,1vw,0.875rem)] font-semibold text-white hover:bg-rose-500 transition"
          >
            Back to Profile
          </a>
        </div>
      </div>
    </div>
  );
}

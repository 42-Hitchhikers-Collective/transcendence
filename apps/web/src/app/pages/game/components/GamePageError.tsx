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
      <div className="relative z-10 overflow-hidden rounded-2xl border border-slate-200/10 bg-neutral-950 p-6 md:p-10 lg:p-14 shadow-sm text-center">
        <div className="rounded-full bg-rose-200/40 blur-2xl" />
        <div className="rounded-full bg-amber-200/40 blur-2xl" />
        <div className="space-y-4">
          <p className="text-2xl md:text-4xl lg:text-5xl font-semibold text-rose-700">An error occured!</p>
          <p className="text-white mb-4 md:mb-8 lg:mb-10 text-sm md:text-base">{roomError}</p>
          <a
            href="/"
            className="inline-block rounded-lg bg-rose-600 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base font-semibold text-white hover:bg-rose-500 transition"
          >
            Back to Profile
          </a>
        </div>
      </div>
    </div>
  );
}

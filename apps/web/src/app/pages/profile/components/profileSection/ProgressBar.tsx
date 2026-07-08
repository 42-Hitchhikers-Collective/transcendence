import { useState, useEffect } from "react"; 
interface ProgressBarProps {
  wins: number;
  losses: number;
}

export const ProgressBar = ({ wins, losses }: ProgressBarProps) => {
  const total = wins + losses;
  const winTarget = total > 0 ? (wins / total) * 100 : 0;
  const [winProgress, setWinProgress] = useState(0);

  useEffect(() => {
    setWinProgress(0);
    const t = window.setTimeout(() => setWinProgress(winTarget), 40);
    return () => window.clearTimeout(t);
  }, [wins, losses]);

  return (
    <div className=" ">
      <h1 className="text-[clamp(0.85rem,1.1vw,1.125rem)] font-bold text-gray-900 mb-[clamp(0.25rem,0.5vw,0.5rem)] text-start">Winning rate</h1>
      <div className="relative w-full h-[clamp(0.7rem,1.2vw,1.5rem)] bg-rose-800/10 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-in-out bg-gradient-to-r from-cyan-400 via-emerald-400 to-green-400"
          style={{
            width: `${winProgress}%`,
          }}
        />
        <div className="absolute right-[clamp(0.4rem,0.7vw,0.75rem)] top-1/2 -translate-y-1/2 text-[clamp(0.7rem,0.9vw,0.875rem)] font-bold text-gray-900">
          {Math.round(winProgress)}%
        </div>
      </div>
    </div>
  );
};
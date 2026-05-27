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
      <h1 className="text-lg  font-bold text-gray-900 mb-2 text-start ">Winning rate</h1>
      <div className="relative w-full h-4 md:h-6 bg-rose-800/10 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-in-out bg-gradient-to-r from-cyan-400 via-emerald-400 to-green-400"
          style={{
            width: `${winProgress}%`,
          }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-900">
          {Math.round(winProgress)}%
        </div>
      </div>
    </div>
  );
};
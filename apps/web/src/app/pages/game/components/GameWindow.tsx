import StartGame from "../components/StartGame";
import PhaserGame from "@/gameCanvas/PhaserGame";
import { useEffect } from "react";


type GameWindowProps = {
  gameStarted: boolean;
  onStart: () => void;
  error: string | null;
};

export default function GameWindow({ gameStarted, onStart, error }: GameWindowProps) {

  useEffect(() => {
    console.warn(`GAME WINDOW - gameStarted: ${gameStarted}, error: ${error}`);
  }, [gameStarted, error]);

  return gameStarted ? (
    <PhaserGame />
  ) : (
    <StartGame onStart={onStart} error={error} />
  );
}
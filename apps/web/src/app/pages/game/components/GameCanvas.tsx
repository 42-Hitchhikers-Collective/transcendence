import { useEffect } from "react";
import PhaserGame from "@/gameCanvas/PhaserGame";
import { socket } from "@/socket/Socket";

type GameCanvasProps = {
  gameStarted: boolean;
  players: string[];
};

export default function GameCanvas({ gameStarted, players }: GameCanvasProps) {
  useEffect(() => {
    console.log(`[GameCanvas] gameStarted changed: ${gameStarted}`);
    console.log(`[GameCanvas] Players changed: ${players}`);    
    socket.emit("canvas_start", ()=>{console.error("EMITTTT")}); // trigger game canvas to refresh with the latest room state whenever gameStarted or players changes to keep the game canvas in sync with the latest room state (e.g. new player joins, game starts, etc)
    // 
  }, [gameStarted, players]);

  return <PhaserGame />;
}

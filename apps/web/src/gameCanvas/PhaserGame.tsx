import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { Boot } from "./scenes/Boot.ts";
import { Preloader } from "./scenes/Preloader.ts";
import { GameScene } from "./scenes/GameScene.ts";
import { EventBus } from "../events/EventBus.ts";
import { socket } from "@/socket/Socket";

export default function PhaserGame() {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 1200,
      height: 900,
      parent: gameRef.current,
      scene: [Boot, Preloader, GameScene],
      // Jess added this to scale the canvas to the website
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const game = new Phaser.Game(config);

    // socket.on("room_state", (roomState) => {
    //   console.log(`[PhaserGame] Received room_state`);
    //   EventBus.emit("ROOM_STATE", roomState);
    // });

    return () => {
      game.destroy(true);
    };
  }, []);

  console.warn(`[PhaserGame] MOUNTED`);

  return (
    <div
      ref={gameRef}
      // Jess added this to scale the canvas to the website
      className="w-full max-h-[75vh] overflow-hidden rounded-xl"
    />
  );
}

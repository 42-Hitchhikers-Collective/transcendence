import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { Boot } from "./scenes/Boot.ts";
import { Preloader } from "./scenes/Preloader.ts";
import { GameScene } from "./scenes/GameScene.ts";

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

    console.log(`[PhaserGame] Component Mounted`);

    return () => {
      game.destroy(true);
    };
  }, []);


  return (
    <div
      ref={gameRef}
      // Jess added this to scale the canvas to the website
      className="w-full max-h-[75vh] overflow-hidden rounded-xl"
    />
  );
}

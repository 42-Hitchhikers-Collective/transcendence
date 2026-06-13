import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { Boot } from "./scenes/Boot.ts";
import { Preloader } from "./scenes/Preloader.ts";
import { GameScene } from "./scenes/GameScene.ts";

export default function PhaserGame() {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = gameRef.current;
    const config = {
      type: Phaser.AUTO,
      parent: container, //neeeded for responsive scaling to work properly
      scene: [Boot, Preloader, GameScene],
      scale: {
        mode: Phaser.Scale.RESIZE,   // canvas matches parent div exactly
        // autoCenter: Phaser.Scale.CENTER_BOTH,
        // width: container?.clientWidth || 800,
        // height: container?.clientHeight || 1000,
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
      // className="h-full w-full overflow-hidden rounded-xl"
    />
  );
}

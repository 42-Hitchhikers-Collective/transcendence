import { useEffect, useRef } from "react";
import Phaser, { Physics } from "phaser";
import { Boot } from "./scenes/Boot.ts";
import { Preloader } from "./scenes/Preloader.ts";
import { GameScene } from "./scenes/GameScene.ts";

export default function PhaserGame() {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 1200,
      height: 1200,
      parent: gameRef.current,
      scene: [Boot, Preloader, GameScene],

    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef} />;
}

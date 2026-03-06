import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { Boot } from "./scenes/Boot.js";
import { Preloader } from "./scenes/Preloader";
import { Game } from "./scenes/Game";

export default function PhaserGame() {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      scene: [Boot, Preloader, Game],
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef} />;
}
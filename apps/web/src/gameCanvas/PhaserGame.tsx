import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { Boot } from "./scenes/Boot.ts";
import { Preloader } from "./scenes/Preloader.ts";
import { GameScene } from "./scenes/GameScene.ts";

export default function PhaserGame() {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = gameRef.current;
    if (!container) return; // Safety check, should never happen

    const config = {
      type: Phaser.AUTO,
      parent: container, //JESS: attached Phaser to the div container
      scene: [Boot, Preloader, GameScene],
      audio: {
        noAudio: true, // disable audio to prevent AudioContext suspend/resume errors on navigation
      },
      scale: {
        mode: Phaser.Scale.FIT, // JESS: use FIT mode to maintain aspect ratio and fit the game within the container
        autoCenter: Phaser.Scale.CENTER_BOTH, // JESS: center the game both horizontally and vertically within the container
        width: 1000,
        height: 800,
      },
    };

    const game = new Phaser.Game(config);

    game.canvas.style.borderRadius = "16px"; // JESS: add rounded corners to the game canvas to match the container's rounded corners
    const h = container?.clientHeight ?? 0; // JESS: get the height of the container to set the game canvas height, ensuring it fills the container vertically
    console.log(
      `[PhaserGame] Canvas: ${game.canvas.width}×${game.canvas.height}`,
    );

    return () => {
      game.destroy(true);
    };
  }, []);

    return <div ref={gameRef} className="overflow-hidden" />;
}

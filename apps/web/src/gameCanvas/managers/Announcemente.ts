import { CARDS, SCREEN } from "./Layouts.ts";
import { passTurn } from "../../network/gameNetwork";

export class Announcement {
  constructor(private scene: Phaser.Scene) {}

  uno() {
    const sprite = this.scene.add.image(
      SCREEN.WIDTH / 2,
      SCREEN.HEIGHT / 2,
      "uno",
    );
    sprite.setDepth(9999);

    sprite.setScale(CARDS.SCALE);

    this.scene.tweens.add({
      targets: sprite,
      scale: 2,
      alpha: 1,
      duration: 4000,
      ease: "Back.Out",
      onComplete: () => {
        sprite.destroy();
      },
    });
    passTurn();
  }

  announceError(text: string) {
      const txt = this.scene.add.text(
        500,
        400,
        `${text}`,
        {
          fontSize: "36px",
          color: "#ff4444",
          fontStyle: "bold",
          stroke: "#000",
          strokeThickness: 4,
        },
      );
      txt.setOrigin(0.5);
      txt.setDepth(9000);
      this.scene.tweens.add({
        targets: txt,
        alpha: 0,
        y: 350,
        duration: 2000,
        onComplete: () => txt.destroy(),
      });
    
  }
}

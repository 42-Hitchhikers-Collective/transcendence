import { CARDS, SCREEN } from "./Layouts.ts";
import { passTurn } from "../../network/gameNetwork";

export class Announcement {

  constructor(private scene: Phaser.Scene) {}

  uno() {
    const sprite = this.scene.add.image(
      SCREEN.WIDTH / 2,
      SCREEN.HEIGHT / 2,
      "uno"
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
}

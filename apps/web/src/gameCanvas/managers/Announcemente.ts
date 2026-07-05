import { CARDS, SCREEN } from "./Layouts.ts";
import { passTurn } from "../../network/gameNetwork";

export class Announcement {
  // Phaser scene reference — class field instead of constructor param
  // because 'private' in constructor is not allowed with erasableSyntaxOnly
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // Race condition guard: when navigating away from the game, Phaser destroys
  // the scene, but socket events like 'uno' or 'error' may still fire.
  // Without this guard, this.scene.add.* throws "Cannot read properties of null".
  private isSceneAlive(): boolean {
    return !!(this.scene && (this.scene as any).sys?.game);
  }

  uno() {
    if (!this.isSceneAlive()) return; // JESS: added guard to prevent console errors when navigating away from the game scene (scene is destroyed but the render function is still called by the socket event, which causes errors in the console)
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

  error(text: string) {
    if (!this.isSceneAlive()) return; // JESS: added guard to prevent console errors when navigating away from the game scene (scene is destroyed but the render function is still called by the socket event, which causes errors in the console)
    if (text == "first_draw") {
      const txt = this.scene.add.text(
        500,
        400,
        "Draw card first or play same type",
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
}

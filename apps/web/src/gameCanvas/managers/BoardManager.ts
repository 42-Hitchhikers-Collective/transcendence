import { CARDS, PLAYER, SCREEN } from "./Layouts.ts";

export class BoardManager {
  private pile!: Phaser.GameObjects.Zone;
  private boardContainer!: Phaser.GameObjects.Container;

  constructor(private scene: Phaser.Scene) {}

  create(): {
    pile: Phaser.GameObjects.Zone;
    boardContainer: Phaser.GameObjects.Container;
  } {
    this.boardContainer = this.scene.add.container(0, 0);

    /* ---- JESS ---- */
    const bg = this.scene.add.image(500, 400, "background"); //  adds a background image to the game scene, centered at (500, 400) with the key "background"
    bg.setDisplaySize(1000, 800); //  scales the background image to fit the game scene dimensions (1000x800)
    bg.setDepth(0); //  sets the rendering depth of the background image to -1, ensuring it is rendered behind all other game objects
    this.boardContainer.add(bg); //  adds the background image to the boardContainer, which is the main container for all game objects in the scene
    /* ------------------- */

    this.pile = this.scene.add
      .zone(SCREEN.WIDTH / 2 - 50, SCREEN.HEIGHT / 2, 60, 85) // JESS - creates an invisible interactive zone representing the discard pile, centered at (SCREEN.WIDTH / 2 - 50, SCREEN.HEIGHT / 2) with dimensions 60x85
      .setRectangleDropZone(120, 160);

    //const g = this.scene.add.graphics();
    //g.lineStyle(4, 0xffffff);
    //g.strokeRectShape(this.pile.getBounds());

    return {
      pile: this.pile,
      boardContainer: this.boardContainer,
    };
  }

  getPile(): Phaser.GameObjects.Zone {
    return this.pile;
  }

  getBoardContainer(): Phaser.GameObjects.Container {
    return this.boardContainer;
  }
}

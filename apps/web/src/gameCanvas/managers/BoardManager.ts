import { CARDS, PLAYER, SCREEN } from "./Layouts.ts";

export class BoardManager {
  private pile!: Phaser.GameObjects.Zone;
  private boardContainer!: Phaser.GameObjects.Container;
  private scene: Phaser.Scene; // JESS: Phaser scene reference — class field instead of constructor param because 'private' in constructor is not allowed with erasableSyntaxOnly

  constructor(scene: Phaser.Scene) { // JESS: we need a reference to the Phaser scene to be able to add sprites and text to it
    this.scene = scene; // JESS: we need a reference to the Phaser scene to be able to add sprites and text to it
  }

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


    // ____________ JESS____________________
    // Added Visible drop zone border that has same size and position as played card
    // Card is rendered at (SCREEN.WIDTH/2 - 50, SCREEN.HEIGHT/2) at 0.55 scale
    // Standard UNO card PNG (~140×218) scaled = ~77×120
    const cardW = 95;
    const cardH = 145;
    const cardX = SCREEN.WIDTH / 2 - 50 - cardW / 2;
    const cardY = SCREEN.HEIGHT / 2 - cardH / 2;
    const g = this.scene.add.graphics();
    g.lineStyle(2, 0x4fffdf, 0.8);
    g.strokeRect(cardX, cardY, cardW, cardH);
    g.setDepth(1); // renders on top of the card (makes sure that the border is visible in case it doesnt move around as the card is played)

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

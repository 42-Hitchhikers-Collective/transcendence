import { CARDS, PLAYER, SCREEN } from "./Layouts.ts";

export class BoardManager {
  private pile!: Phaser.GameObjects.Zone;
  private boardContainer!: Phaser.GameObjects.Container;

  constructor(private scene: Phaser.Scene) {}

  create(): { pile: Phaser.GameObjects.Zone; boardContainer: Phaser.GameObjects.Container } {
    this.scene.add.image(500, 400, "background").setScale(0.5);

    this.boardContainer = this.scene.add.container(0, 0);

    this.pile = this.scene.add
      .zone(SCREEN.WIDTH / 2 - 50 , SCREEN.HEIGHT / 2, 60, 85)
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

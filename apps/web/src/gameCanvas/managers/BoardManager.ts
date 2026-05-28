import { drawCard } from "../../network/gameNetwork";

export class BoardManager {
  private pile!: Phaser.GameObjects.Zone;
  private boardContainer!: Phaser.GameObjects.Container;
  private drawCardButton!: Phaser.GameObjects.Container;

  constructor(private scene: Phaser.Scene) {}

  create(): { pile: Phaser.GameObjects.Zone; boardContainer: Phaser.GameObjects.Container } {
    this.scene.add.image(500, 400, "background").setScale(0.5);

    this.boardContainer = this.scene.add.container(0, 0);

    this.pile = this.scene.add
      .zone(500, 350, 120, 160)
      .setRectangleDropZone(120, 160);

    const g = this.scene.add.graphics();
    g.lineStyle(4, 0xffffff);
    g.strokeRectShape(this.pile.getBounds());

    this.createDrawCardButton();

    return {
      pile: this.pile,
      boardContainer: this.boardContainer,
    };
  }

  private createDrawCardButton() {
    this.drawCardButton = this.scene.add.container(500, 430);

    const buttonBg = this.scene.add.rectangle(0, 0, 100, 40, 0x4a90e2).setInteractive();
    buttonBg.setStrokeStyle(2, 0xffffff);

    const buttonText = this.scene.add.text(0, 0, "Draw Card", {
      fontSize: "14px",
      color: "#fff",
      align: "center",
    });
    buttonText.setOrigin(0.5);

    buttonBg.on("pointerdown", () => {
      drawCard();
      buttonBg.setFillStyle(0x3a80d2);
    });

    buttonBg.on("pointerup", () => {
      buttonBg.setFillStyle(0x4a90e2);
    });

    buttonBg.on("pointerover", () => {
      this.scene.input.setDefaultCursor("pointer");
      buttonBg.setFillStyle(0x3a80d2);
    });

    buttonBg.on("pointerout", () => {
      this.scene.input.setDefaultCursor("default");
      buttonBg.setFillStyle(0x4a90e2);
    });

    this.drawCardButton.add([buttonBg, buttonText]);
  }

  getPile(): Phaser.GameObjects.Zone {
    return this.pile;
  }

  getBoardContainer(): Phaser.GameObjects.Container {
    return this.boardContainer;
  }
}

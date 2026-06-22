import { selectWildColor, passTurn } from "../../network/gameNetwork";

interface ColorButton {
  color: "red" | "blue" | "green" | "yellow";
  hex: number;
}

export class UIManager {
  private wildColorContainer: Phaser.GameObjects.Container | null = null;
  private passTurnContainer: Phaser.GameObjects.Container | null = null;

  constructor(private scene: Phaser.Scene) {}

  showWildColorButtons() {
    this.hideWildColorButtons();

    this.wildColorContainer = this.scene.add.container(500, 290); // JESS: I improved the position of the wild color buttons

    const colors: ColorButton[] = [
      { color: "red", hex: 0xff0000 },
      { color: "green", hex: 0x00ff00 },
      { color: "blue", hex: 0x0000ff },
      { color: "yellow", hex: 0xffff00 },
    ];

    const startX = -150;
    const spacing = 100;

    colors.forEach((item, index) => {
      const x = startX + index * spacing;
      const y = 0;

      const button = this.scene.add
        .rectangle(x, y, 80, 60, item.hex)
        .setInteractive();
      button.setStrokeStyle(3, 0xffffff);

      const label = this.scene.add.text(x, y, item.color.toUpperCase(), {
        fontSize: "12px",
        color: "#000",
        align: "center",
      });
      label.setOrigin(0.5);

      button.on("pointerdown", () => {
        selectWildColor(item.color);
        this.hideWildColorButtons();
      });

      this.wildColorContainer!.add([button, label]);
    });
  }

  hideWildColorButtons() {
    if (this.wildColorContainer) {
      this.wildColorContainer.destroy(true);
      this.wildColorContainer = null;
    }
  }

  showPassTurnButtons() {
    if (this.passTurnContainer) {
      return;
    }
    this.passTurnContainer = this.scene.add.container(500, 520); // JESS: I improved the position of the pass turn button, to make it more obvious

    const button = this.scene.add
      .rectangle(0, 0, 140, 60, 0x444444)
      .setInteractive();

    button.setStrokeStyle(3, 0xffffff);

    const label = this.scene.add.text(0, 0, "PASS TURN", {
      fontSize: "16px",
      color: "#ffffff",
      align: "center",
    });

    label.setOrigin(0.5);

    button.on("pointerdown", () => {
      passTurn();
      this.hidePassTurnButtons();
    });

    this.passTurnContainer.add([button, label]);
  }

  hidePassTurnButtons() {
    if (this.passTurnContainer) {
      this.passTurnContainer.destroy(true);
      this.passTurnContainer = null;
    }
  }

  hideAll() {
    this.hideWildColorButtons();
    this.hidePassTurnButtons();
  }
}

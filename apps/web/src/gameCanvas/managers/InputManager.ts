import { playCard } from "../../network/gameNetwork";

export class InputManager {
  private pile!: Phaser.GameObjects.Zone;

  constructor(
    private scene: Phaser.Scene,
    pile: Phaser.GameObjects.Zone,
  ) {
    this.pile = pile;
  }

  setup() {
    this.scene.input.on("drag", this.onDrag, this);
    this.scene.input.on("drop", this.onDrop, this);
    this.scene.input.on("dragend", this.onDragEnd, this);
  }

  private onDrag(
    _: Phaser.Input.Pointer,
    obj: Phaser.GameObjects.Image,
    x: number,
    y: number,
  ) {
    obj.x = x;
    obj.y = y;
  }

  private onDrop(
    _: Phaser.Input.Pointer,
    obj: Phaser.GameObjects.Image,
    zone: Phaser.GameObjects.Zone,
  ) {
    if (zone !== this.pile) {
      this.resetCard(obj);
      return;
    }

    const cardIndex = obj.getData("cardIndex");
    playCard(cardIndex);
    obj.disableInteractive();
  }

  private onDragEnd(
    _: Phaser.Input.Pointer,
    obj: Phaser.GameObjects.Image,
    dropped: boolean,
  ) {
    if (!dropped) {
      this.resetCard(obj);
    }
  }

  private resetCard(obj: Phaser.GameObjects.Image) {
    this.scene.tweens.add({
      targets: obj,
      x: obj.input?.dragStartX,
      y: obj.input?.dragStartY,
      duration: 150,
    });
  }
}

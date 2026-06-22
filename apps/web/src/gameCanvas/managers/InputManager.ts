import { playCard } from "../../network/gameNetwork";
import { EventBus } from "../../events/EventBus";

export class InputManager {
  private pile!: Phaser.GameObjects.Zone;
  private canPlay = false; // JESS: WE NEED A FLAG THAT GUARDS OTHER PLAYERS TO INTERACT WITH THE GAME WHEN IT'S NOT THEIR TURN OE THE GAME WILL BEHAVE UNEXPECTEDLY

  constructor(
    private scene: Phaser.Scene,
    pile: Phaser.GameObjects.Zone,
  ) {
    this.pile = pile;
  }

  // JESS: ADDED THIS FUNCTION AS A GUARD THAT DISABLES OTHER PLAYERS TO SEND GAME EVENTS WHEN THEY INTERACT WITH THE GAME BUT IT'S NOT THEIR TURN
  setCanPlay(flag: boolean) {
    this.canPlay = flag;
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
    // JESS: ADDED A DISPLAY MESSAGE TO SHOW WHEN THE USER NOT IN TURN INTERACTS WITH THE GAME TO EXPLAIN WHY NOTHING HAPPENS
    if (!this.canPlay) {
      this.resetCard(obj);
      EventBus.emit("not_turn", { message: "❌ Wait for your turn ❌" });
      return;
    }
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

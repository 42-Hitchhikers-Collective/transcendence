import { playCard } from "../../network/gameNetwork";
import { EventBus } from "../../events/EventBus";

export class InputManager {
  private pile!: Phaser.GameObjects.Zone;
  private canPlay = false; //JESS: we need a flag to disable the discard pile when it's not the player's turn, or it will create unexpected behaviors in the game scene

  private lastClickedCard?: Phaser.GameObjects.Image;
  private lastClickTime = 0;
  private readonly DOUBLE_CLICK_DELAY = 300;
  // Phaser scene reference — class field because 'private' in constructor
  // is not allowed with erasableSyntaxOnly
  private scene: Phaser.Scene;

  constructor(
    scene: Phaser.Scene, // JESS: we need a reference to the Phaser scene to be able to add sprites and text to it
    pile: Phaser.GameObjects.Zone,
  ) {
    this.scene = scene; // JESS: we need a reference to the Phaser scene to be able to add sprites and text to it
    this.pile = pile;
  }

  // Race condition guard: Phaser input events (drag/drop) keep firing during
  // scene teardown. Without this, this.scene.tweens.add() throws
  // "Cannot read properties of null" because the tween manager is destroyed.
  private isSceneAlive(): boolean {
    return !!(this.scene && (this.scene as any).sys?.game);
  }

  setCanPlay(flag: boolean) {
    this.canPlay = flag;
  }

  setup() {
    this.scene.input.on("drag", this.onDrag, this);
    this.scene.input.on("drop", this.onDrop, this);
    this.scene.input.on("dragend", this.onDragEnd, this);
    this.scene.input.on("gameobjectdown", this.helenclick, this);
  }

  private onDrag(
    _: Phaser.Input.Pointer,
    obj: Phaser.GameObjects.Image,
    x: number,
    y: number,
  ) {
    if (!this.isSceneAlive()) return; // JESS: added guard to prevent console errors when navigating away from the game scene (scene is destroyed but the render function is still called by the socket event, which causes errors in the console)
    obj.x = x;
    obj.y = y;
  }

  private onDrop(
    _: Phaser.Input.Pointer,
    obj: Phaser.GameObjects.Image,
    zone: Phaser.GameObjects.Zone,
  ) {
    if (!this.isSceneAlive()) return; // JESS: added guard to prevent console errors when navigating away from the game scene (scene is destroyed but the render function is still called by the socket event, which causes errors in the console)
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

  private helenclick(
    pointer: Phaser.Input.Pointer,
    obj: Phaser.GameObjects.GameObject,
  ) {
    if (!this.isSceneAlive()) return;

    if (!(obj instanceof Phaser.GameObjects.Image)) return;

    const now = pointer.downTime;

    if (
      this.lastClickedCard === obj &&
      now - this.lastClickTime < this.DOUBLE_CLICK_DELAY
    ) {
      this.lastClickedCard = undefined;
      this.playCardFromDoubleClick(obj);
      return;
    }

    this.lastClickedCard = obj;
    this.lastClickTime = now;
  }

  private playCardFromDoubleClick(obj: Phaser.GameObjects.Image) {
    if (!this.canPlay) {
      EventBus.emit("not_turn", { message: "❌ Wait for your turn ❌" });
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
    if (!this.isSceneAlive()) return; // JESS: added guard to prevent console errors when navigating away from the game scene (scene is destroyed but the render function is still called by the socket event, which causes errors in the console)
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

import type { FrontendRoom, FrontendPlayer } from "../types/roomTypes";
import { CARDS, SCREEN } from "./Layouts.ts";
import { drawCard } from "../../network/gameNetwork";
import { EventBus } from "../../events/EventBus";

type Position = { x: number; y: number; p: "v" | "h" };

export class RenderManager {
  private playerContainers = new Map<string, Phaser.GameObjects.Container>();
  private myPlayerId: string = "";
  private boardContainer!: Phaser.GameObjects.Container;
  private drawPileSprite: Phaser.GameObjects.Image | null = null;
  private pendingDrawText: Phaser.GameObjects.Text | null = null;
  private canDraw = false; // JESS: we need a flag to disable the draw pile when it's not the player's turn, or it will create unexpected behaviors in the game scene

  private scene: Phaser.Scene; // JESS Phaser scene reference — class field instead of constructor param because 'private' in constructor is not allowed with erasableSyntaxOnly

  constructor(
    scene: Phaser.Scene, //JESS: we need a reference to the Phaser scene to be able to add sprites and text to it
    boardContainer: Phaser.GameObjects.Container,
  ) {
    this.scene = scene; //JESS: we need a reference to the Phaser scene to be able to add sprites and text to it
    this.boardContainer = boardContainer;
  }

  setMyPlayerId(id: string) {
    this.myPlayerId = id;
  }

  setCanDraw(canDraw: boolean) {
    this.canDraw = canDraw; // JESS: added flag to disable the draw pile when it's not the player's turn, or it will create unexpected behaviors in the game scene
    if (!this.drawPileSprite) return;
    if (canDraw) {
      // this.drawPileSprite.setInteractive(); // JESS: this is not needed
      this.drawPileSprite.setAlpha(1);
    } else {
      // this.drawPileSprite.disableInteractive(); // JESS: this is not needed
      this.drawPileSprite.setAlpha(0.4); // JESS: we just need set alpha
    }
  }

  // this.scene.add.* on a destroyed scene throws "can't access property 'add'".
  render(room: FrontendRoom) {
    if (!this.scene || !(this.scene as any).sys?.game) return; // JESS: added guard to prevent console errors when navigating away from the game scene (scene is destroyed but the render function is still called by the socket event, which causes errors in the console)

    this.clearPlayers();

    const positions = this.getPlayerPositions(room.players.length);

    this.renderDiscardPile(room);
    this.renderDrawPile();
    this.renderText(room.cardsToDraw);

    const startIndex = room.players.findIndex(
      (player) => player.id === this.myPlayerId,
    );
    if (startIndex === -1) {
      console.error("Player not found");
      return;
    }

    for (let i = 0; i < room.players.length; i++) {
      this.renderPlayer(
        room.players[(i + startIndex) % room.players.length],
        positions[i],
        room.current_turn,
      );
    }
    this.renderCurrentColor(room.game?.currentColor);
  }

  private currentColorText: Phaser.GameObjects.Text | null = null;
  private currentColorCircle: Phaser.GameObjects.Graphics | null = null;

  private renderCurrentColor(color: string | undefined) {
    this.currentColorText?.destroy();
    this.currentColorCircle?.destroy();

    let currentColor = 0xffffff;

    if (color === "red") currentColor = 0xff0000;
    else if (color === "blue") currentColor = 0x0000ff;
    else if (color === "green") currentColor = 0x00ff00;
    else if (color === "yellow") currentColor = 0xffff00;

    // Texto
    this.currentColorText = this.scene.add
      .text(SCREEN.WIDTH / 2, SCREEN.HEIGHT / 2 - 100, "Current Color", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.currentColorCircle = this.scene.add.graphics();

    this.currentColorCircle.fillStyle(currentColor, 1);
    this.currentColorCircle.fillCircle(
      SCREEN.WIDTH / 2 + 110,
      SCREEN.HEIGHT / 2 - 100,
      10,
    );
  }

  private renderText(numberOfCards: number | undefined) { // JESS: undefined was added to the type because when the game starts, the number of cards to draw is undefined, and we need to handle that case
    this.pendingDrawText?.destroy();
    if (!numberOfCards) return; // JESS: if numberOfCards is undefined or 0, we don't need to render the text

    this.pendingDrawText = this.scene.add.text(
      SCREEN.WIDTH / 2,
      SCREEN.HEIGHT / 2 + 100,
      `Cards to draw ${numberOfCards.toString()}`,
      {
        fontSize: "24px",
        color: "#ffffff",
      },
    );
    this.pendingDrawText.setOrigin(0.5);
  }

  private renderDiscardPile(room: FrontendRoom) {
    if (!room.game?.discardTopCard) return; // JESS: if discardTopCard is undefined, we don't need to render the discard pile

    const sprite = this.scene.add.image(
      SCREEN.WIDTH / 2 - 50, // x
      SCREEN.HEIGHT / 2, // y
      `${room.game?.discardTopCard.value}_${room.game?.discardTopCard.color}`,
    );
    sprite.setDepth(0);

    sprite.setScale(CARDS.SCALE);
    sprite.setInteractive();
  }

  private renderDrawPile() {
    const sprite = this.scene.add.image(
      SCREEN.WIDTH / 2 + 50, // x
      SCREEN.HEIGHT / 2, // y
      `back`,
    );

    sprite.setScale(CARDS.SCALE);
    sprite.setInteractive();
    sprite.on("pointerdown", () => {
      //JESS: added guard to prevent players to draw cards when it's not their turn, or it will create unexpected behaviors in the game scene
      if (!this.canDraw) {
        EventBus.emit("not_turn", { message: "It's not your turn yet" });
        return;
      }
      drawCard();
    });
    this.drawPileSprite = sprite; // JESS: we store the draw pile sprite in a variable to be able to disable it when it's not the player's turn
  }

  private renderPlayer(
    player: FrontendPlayer,
    pos: Position,
    current_turn: string | undefined,
  ) {
    const container = this.scene.add.container(0, 0);

    this.playerContainers.set(player.id, container);
    this.boardContainer.add(container);

    let color = "#ffffff";
    if (current_turn === player.id) color = "#22c55e";

    const nameX =
      pos.p === "v" ? (pos.x < 500 ? pos.x + 80 : pos.x - 80) : pos.x;

    const nameY = pos.p === "v" ? pos.y : pos.y < 200 ? pos.y + 80 : pos.y - 80;

    const title = this.scene.add.text(nameX, nameY, player.userName, {
      fontSize: "24px",
      color: color,
    });

    title.setOrigin(0.5);
    title.setDepth(1000);

    if (pos.p === "v") title.setAngle(pos.x < 500 ? 90 : -90);

    // Reduce spacing when there are more than 20 cards
    const cardCount = player.cards?.length ?? player.cardCount;

    const spacing = cardCount > 20 ? Math.max(15, 40 - (cardCount - 5)) : 40;

    const isMe = player.id === this.myPlayerId;

    if (isMe && player.cards) {
      let offsetX = -((player.cards.length - 1) * spacing) / 2;

      player.cards.forEach((card, cardIndex) => {
        const sprite = this.scene.add.image(
          pos.x + offsetX,
          pos.y,
          `${card.value}_${card.color}`,
        );

        sprite.setScale(CARDS.SCALE);
        sprite.setData("cardIndex", cardIndex);
        sprite.setInteractive();
        sprite.setDepth(9998);

        this.scene.input.setDraggable(sprite);

        container.add(sprite);

        offsetX += spacing;
      });
    } else {
      let offsetX = 0;
      let offsetY = 0;

      if (pos.p === "h") {
        offsetX = -((player.cardCount - 1) * spacing) / 2;
      }

      if (pos.p === "v") {
        offsetY = -((player.cardCount - 1) * spacing) / 2;
      }

      for (let i = 0; i < player.cardCount; i++) {
        const sprite = this.scene.add.image(
          pos.x + offsetX,
          pos.y + offsetY,
          "back",
        );

        sprite.setScale(CARDS.SCALE);

        container.add(sprite);

        if (pos.p === "h") offsetX += spacing;
        if (pos.p === "v") offsetY += spacing;
      }
    }

    container.add(title);
  }

  private clearPlayers() {
    this.playerContainers.forEach((c) => c.destroy(true));
    this.playerContainers.clear();
  }

  private getPlayerPositions(count: number): Position[] {
    const cx = SCREEN.WIDTH / 2; // JESS: center x is the same for all players, but the y position is different based on the number of players and their position (top, left, right, bottom)
    const cy = SCREEN.HEIGHT / 2; // JESS: center y is the same for all players, but the x position is different based on the number of players and their position (top, left, right, bottom)
    switch (count) {
      case 1:
        return [{ x: cx, y: 710, p: "h" }]; // JESS: Keep this position
      case 2:
        return [
          { x: cx, y: 710, p: "h" }, // JESS: Keep this position
          { x: cx, y: 90, p: "h" }, // JESS: Keep this position
        ];
      case 3:
        return [
          { x: cx, y: 710, p: "h" }, // JESS: Keep this position
          { x: 60, y: cy, p: "v" }, // JESS: Keep this position
          { x: 940, y: cy, p: "v" }, // JESS: Keep this position
        ];
      case 4:
        return [
          { x: cx, y: 710, p: "h" }, // JESS: Keep this position
          { x: 60, y: cy, p: "v" }, // JESS: Keep this position
          { x: cx, y: 120, p: "h" }, // JESS: Keep this position
          { x: 940, y: cy, p: "v" }, // JESS: Keep this position
        ];

      default:
        return [];
    }
  }
}

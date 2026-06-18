import type { FrontendRoom, FrontendPlayer } from "../types/roomTypes";
import { CARDS, PLAYER, SCREEN } from "./Layouts.ts";
import { drawCard } from "../../network/gameNetwork";

type Position = { x: number; y: number; p: "v" | "h" };

export class RenderManager {
  private playerContainers = new Map<string, Phaser.GameObjects.Container>();
  private myPlayerId: string = "";
  private boardContainer!: Phaser.GameObjects.Container;

  constructor(
    private scene: Phaser.Scene,
    boardContainer: Phaser.GameObjects.Container,
  ) {
    this.boardContainer = boardContainer;
    this.scene = scene;
  }

  setMyPlayerId(id: string) {
    this.myPlayerId = id;
  }

  render(room: FrontendRoom) {
    this.clearPlayers();

    const orderedPlayers = this.reorderPlayersWithObserverAtBottom(
      room.players,
    );
    const positions = this.getPlayerPositions(orderedPlayers.length);

    this.renderDiscardPile(room);
    this.renderDrawPile();
    
    orderedPlayers.forEach((player, i) => {
      this.renderPlayer(player, positions[i], room.current_turn);
    });

  }

  private renderDiscardPile(room: FrontendRoom) {
    const sprite = this.scene.add.image(
      SCREEN.WIDTH / 2 - 50, // x
      SCREEN.HEIGHT / 2, // y
      `${room.game?.discardTopCard.value}_${room.game?.discardTopCard.color}`,
    );

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
      drawCard();
    });
  }

  private reorderPlayersWithObserverAtBottom(
    players: FrontendPlayer[],
  ): FrontendPlayer[] {
    const observer = players.find((p) => p.isTheObserver);
    if (!observer) return players;

    const others = players.filter((p) => !p.isTheObserver);
    return [...others, observer];
  }

  private renderPlayer(
    player: FrontendPlayer,
    pos: Position,
    current_turn: string,
  ) {
    const container = this.scene.add.container(0, 0);

    this.playerContainers.set(player.id, container);
    this.boardContainer.add(container);

    let color = "#c31919"
    if (current_turn == player.id) color = " #119632";

    const title = this.scene.add.text(pos.x - 40, pos.y + 80, player.userName, {
      fontSize: "24px",
      color: color,
    });

    container.add(title);

    const isMe = player.id === this.myPlayerId;
    if (isMe && player.cards) {
      let offsetX = -(player.cards.length * 20);

      player.cards.forEach((card, cardIndex) => {
        const sprite = this.scene.add.image(
          pos.x + offsetX,
          pos.y,
          `${card.value}_${card.color}`,
        );

        sprite.setScale(CARDS.SCALE);
        sprite.setData("cardIndex", cardIndex);
        sprite.setInteractive();
        this.scene.input.setDraggable(sprite);

        container.add(sprite);
        offsetX += 40;
      });
    } else {
      let offsetX = 0;
      let offsetY = 0;
      if (pos.p == "h") offsetX = -(player.cardCount * 20);
      if (pos.p == "v") offsetY = -(player.cardCount * 20);
      for (let i = 0; i < player.cardCount; i++) {
        const sprite = this.scene.add.image(
          pos.x + offsetX,
          pos.y + offsetY,
          `back`,
        );
        sprite.setScale(0.3);
        container.add(sprite);
        if (pos.p == "h") offsetX += 40;
        if (pos.p == "v") offsetY += 40;
      }
    }
  }

  private clearPlayers() {
    this.playerContainers.forEach((c) => c.destroy(true));
    this.playerContainers.clear();
  }

  private getPlayerPositions(count: number): Position[] {
    const centerX = 500;

    switch (count) {
      case 1:
        return [{ x: SCREEN.WIDTH / 2, y: 650, p: "h" }];

      case 2:
        return [
          { x: SCREEN.WIDTH / 2, y: 150, p: "h" }, // top
          { x: SCREEN.WIDTH / 2, y: 650, p: "h" }, // observer
        ];

      case 3:
        return [
          { x: 200, y: SCREEN.HEIGHT / 2, p: "v" }, // left
          { x: 800, y: SCREEN.HEIGHT / 2, p: "v" }, // right
          { x: SCREEN.WIDTH / 2, y: 650, p: "h" }, // observer
        ];

      case 4:
        return [
          { x: centerX, y: 100, p: "h" }, // top
          { x: 200, y: SCREEN.HEIGHT / 2, p: "v" }, // left
          { x: 800, y: SCREEN.HEIGHT / 2, p: "v" }, // right
          { x: centerX, y: 650, p: "h" }, // observer
        ];

      default:
        // fallback circular
        return [];
    }
  }
}

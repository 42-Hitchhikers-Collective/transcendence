import type { FrontendRoom, FrontendPlayer } from "../types/roomTypes";
import { CARDS, PLAYER, SCREEN } from "./Layouts.ts"

type Position = { x: number; y: number };

export class RenderManager {
  private playerContainers = new Map<string, Phaser.GameObjects.Container>();
  private myPlayerId: string = "";
  private boardContainer!: Phaser.GameObjects.Container;

  constructor(
    private scene: Phaser.Scene,
    boardContainer: Phaser.GameObjects.Container,
  ) {
    this.boardContainer = boardContainer;
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

    orderedPlayers.forEach((player, i) => {
      this.renderPlayer(player, positions[i]);
    });

    this.renderPile(room);
    this.renderDrawPile();
  }

  private renderPile(room: FrontendRoom) {
    const sprite = this.scene.add.image(
      (SCREEN.WIDTH / 2) - 50 ,   // x
      SCREEN.HEIGHT / 2,          // y
      `${room.game?.discardTopCard.value}_${room.game?.discardTopCard.color}`,
    );

    sprite.setScale(CARDS.SCALE);
    sprite.setInteractive();
  }

  private renderDrawPile() {
    const sprite = this.scene.add.image(
      (SCREEN.WIDTH / 2) + 50 ,   // x
      SCREEN.HEIGHT / 2,          // y
      `back`);

    sprite.setScale(CARDS.SCALE);
    sprite.setInteractive();
  }

  private reorderPlayersWithObserverAtBottom(
    players: FrontendPlayer[],
  ): FrontendPlayer[] {
    const observer = players.find((p) => p.isTheObserver);
    if (!observer) return players;

    const others = players.filter((p) => !p.isTheObserver);
    return [...others, observer];
  }

  private renderPlayer(player: FrontendPlayer, pos: Position) {
    const container = this.scene.add.container(0, 0);

    this.playerContainers.set(player.id, container);
    this.boardContainer.add(container);

    const title = this.scene.add.text(
      pos.x - 40,
      pos.y - 120,
      player.userName,
      {
        fontSize: "24px",
        color: "#fff",
      },
    );

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
      let offsetX = -(player.cardCount * 20);
      for (let i = 0; i < player.cardCount; i++) {
        const sprite = this.scene.add.image(pos.x + offsetX, pos.y, `back`);
        sprite.setScale(0.3);
        container.add(sprite);
        offsetX += 40;
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
      return [
        { x: SCREEN.WIDTH / 2, y: 650 },
      ];

    case 2:
      return [
        { x: SCREEN.WIDTH / 2, y: 150 }, // top
        { x: SCREEN.WIDTH / 2, y: 650 }, // observer
      ];

    case 3:
      return [
        { x: 200, y: SCREEN.HEIGHT / 2 }, // left
        { x: 800, y: SCREEN.HEIGHT / 2 }, // right
        { x: SCREEN.WIDTH, y: 650 }, // observer
      ];

    case 4:
      return [
        { x: centerX, y: 100 }, // top
        { x: 200, y: SCREEN.HEIGHT / 2 }, // left
        { x: 800, y: SCREEN.HEIGHT / 2 }, // right
        { x: centerX, y: 650 }, // observer
      ];

    default:
      // fallback circular
      return [];
  }
}
}

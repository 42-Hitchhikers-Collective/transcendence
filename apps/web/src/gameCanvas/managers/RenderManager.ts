import type { FrontendRoom, FrontendPlayer } from "../types/roomTypes";

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
  }

  private renderPile(room: FrontendRoom) {
    const sprite = this.scene.add.image(
      300,
      300,
      `${room.game?.discardTopCard.value}_${room.game?.discardTopCard.color}`,
    );

    sprite.setScale(0.3);
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

        sprite.setScale(0.3);
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
    const cx = 500;
    const cy = 400;
    const r = 250;

    const res: Position[] = [];

    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + Math.PI;

      res.push({
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r,
      });
    }

    return res;
  }
}

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

    let color = "#ffffff"; // JESS: white has to be the default color for the names
    if (current_turn === player.id) color = "#22c55e"; // JESS: green is the color for the player that has to play (like on the website graphics)

    const nameX = pos.p === "v" ? (pos.x < 500 ? pos.x + 80 : pos.x - 80) : pos.x; // JESS: added for vertical players, the name is displayed on the right for the left player and on the left for the right player
    const nameY = pos.p === "v" ? pos.y : pos.y < 200 ? pos.y + 80 : pos.y - 80; // JESS: added for horizontal players, the name is displayed below for the top player and above for the bottom player
    const title = this.scene.add.text(nameX, nameY, player.userName, { // JESS: considers different name position for each player
      fontSize: "24px",
      color: color,
    });
    title.setOrigin(0.5); // JESS: centers the name text on its position
    title.setDepth(10); // JESS: ensures that the name is always displayed above the cards
    if (pos.p === "v") title.setAngle(pos.x < 500 ? 90 : -90); // JESS: rotates names of L and R player toward center

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
      if (pos.p === "h") offsetX = -(player.cardCount * 20); // JESS: for horizontal players, cards are centered on the position, so we need to offset them to the left by half of the total width of the cards
      if (pos.p === "v") offsetY = -(player.cardCount * 20); // JESS: for vertical players, cards are centered on the position, so we need to offset them to the top by half of the total height of the cards
      for (let i = 0; i < player.cardCount; i++) {
        const sprite = this.scene.add.image(
          pos.x + offsetX,
          pos.y + offsetY,
          `back`,
        );
        sprite.setScale(CARDS.SCALE); // JESS: we use the same scale for the back of the cards to keep the same size as the front cards
        container.add(sprite);
        if (pos.p === "h") offsetX += 40; // JESS: for horizontal players, cards are displayed from left to right, so we increase the x offset
        if (pos.p === "v") offsetY += 40;   // JESS: for vertical players, cards are displayed from top to bottom, so we increase the y offset
      }
    }
    container.add(title); // JESS: we add the name title to the player container to ensure it moves with the cards if needed
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
          { x: cx, y: 90, p: "h" }, // JESS: Keep this position  
          { x: cx, y: 710, p: "h" }, // JESS: Keep this position  
        ];
      case 3:
        return [
          { x: 60, y: cy, p: "v" }, // JESS: Keep this position 
          { x: 940, y: cy, p: "v" }, // JESS: Keep this position 
          { x: cx, y: 710, p: "h" }, // JESS: Keep this position 
        ];
      case 4:
        return [
          { x: cx, y: 120, p: "h" }, // JESS: Keep this position 
          { x: 60, y: cy, p: "v" }, // JESS: Keep this position 
          { x: 940, y: cy, p: "v" }, // JESS: Keep this position 
          { x: cx, y: 710, p: "h" }, // JESS: Keep this position 
        ];

      default:
        return [];
    }
  }
}

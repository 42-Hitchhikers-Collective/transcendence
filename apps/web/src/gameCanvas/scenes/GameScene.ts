import { Scene } from "phaser";
import { EventBus } from "../../events/EventBus";
import { Table } from "../../../../api/src/gamelogic/Table";
import { Player } from "../../../../api/src/gamelogic/Player";
import { playCard } from "../../network/gameNetwork";

type Position = { x: number; y: number };

export class GameScene extends Scene {
  private table!: Table;
  private myPlayerId!: string;

  private pile!: Phaser.GameObjects.Zone;
  private boardContainer!: Phaser.GameObjects.Container;

  private playerContainers = new Map<string, Phaser.GameObjects.Container>();

  constructor() {
    super("Game");
  }

  // =========================
  // INIT
  // =========================

  init(data: { table: Table; myPlayerId: string }) {
    this.table = data.table;
    this.myPlayerId = data.myPlayerId;
  }

  create() {
    this.createBoard();
    this.setupInput();

    EventBus.on("ROOM_STATE", this.onRoomState, this);

    EventBus.on("SOCKET_ERROR", this.onSocketError, this);

    this.render(this.table);

    this.events.once("shutdown", () => {
      EventBus.off("ROOM_STATE", this.onRoomState, this);

      EventBus.off("SOCKET_ERROR", this.onSocketError, this);
    });
  }

  private onRoomState(table: Table) {
    this.table = table;
    this.render(table);
  }

  private onSocketError(err: { message: string }) {
    console.error(err.message);
  }

  // =========================
  // BOARD
  // =========================

  private createBoard() {
    this.add.image(500, 400, "background").setScale(0.5);

    this.boardContainer = this.add.container(0, 0);

    this.pile = this.add
      .zone(500, 350, 120, 160)
      .setRectangleDropZone(120, 160);

    const g = this.add.graphics();
    g.lineStyle(4, 0xffffff);
    g.strokeRectShape(this.pile.getBounds());
  }

  // =========================
  // RENDER
  // =========================

  private render(table: Table) {
    this.clearPlayers();

    const positions = this.getPlayerPositions(table.players.length);

    table.players.forEach((player, i) => {
      this.renderPlayer(player, positions[i]);
    });
  }

  private renderPlayer(player: Player, pos: Position) {
    const container = this.add.container(0, 0);

    this.playerContainers.set(player.id, container);
    this.boardContainer.add(container);

    const title = this.add.text(pos.x - 40, pos.y - 120, player.username, {
      fontSize: "24px",
      color: "#fff",
    });

    container.add(title);

    let offsetX = -(player.hand.length * 20);

    for (const card of player.hand) {
      const isMe = player.id === this.myPlayerId;

      const sprite = this.add.image(
        pos.x + offsetX,
        pos.y,
        isMe ? card.getKey() : "back",
      );

      sprite.setScale(0.3);
      sprite.setData("cardId", card.id);

      if (isMe) {
        sprite.setInteractive();
        this.input.setDraggable(sprite);
      }

      container.add(sprite);

      offsetX += 40;
    }
  }

  // =========================
  // INPUT
  // =========================

  private setupInput() {
    this.input.on("drag", this.onDrag, this);
    this.input.on("drop", this.onDrop, this);
    this.input.on("dragend", this.onDragEnd, this);
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

    const cardId = obj.getData("cardId");

    // 👉 SOLO SOCKET DIRECTO
    playCard(cardId);

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
    this.tweens.add({
      targets: obj,
      x: obj.input?.dragStartX,
      y: obj.input?.dragStartY,
      duration: 150,
    });
  }

  // =========================
  // CLEANUP
  // =========================

  private clearPlayers() {
    this.playerContainers.forEach((c) => c.destroy(true));
    this.playerContainers.clear();
  }

  // =========================
  // POSITIONS
  // =========================

  private getPlayerPositions(count: number): Position[] {
    const cx = 500;
    const cy = 400;
    const r = 250;

    const res: Position[] = [];

    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;

      res.push({
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r,
      });
    }

    return res;
  }
}

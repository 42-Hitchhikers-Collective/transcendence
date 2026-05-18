import { Scene } from "phaser";
import { EventBus } from "../../events/EventBus";
import { Table } from "../../../../api/src/gamelogic/Table";
import { Player } from "../../../../api/src/gamelogic/Player";
import { playCard, selectWildColor, drawCard } from "../../network/gameNetwork";

type Position = { x: number; y: number };

export class GameScene extends Scene {
  private table!: Table;
  private myPlayerId!: string;

  private pile!: Phaser.GameObjects.Zone;
  private boardContainer!: Phaser.GameObjects.Container;
  private drawCardButton!: Phaser.GameObjects.Container;

  private playerContainers = new Map<string, Phaser.GameObjects.Container>();
  private wildColorContainer: Phaser.GameObjects.Container | null = null;

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
    
    // Check if a wild card was just played
    if (table.lastCard && table.lastCard.color === "wild") {
      this.showWildColorButtons();
    } else {
      this.hideWildColorButtons();
    }
    
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

    // Create Draw Card Button
    this.drawCardButton = this.add.container(500, 430);

    const buttonBg = this.add.rectangle(0, 0, 100, 40, 0x4a90e2).setInteractive();
    buttonBg.setStrokeStyle(2, 0xffffff);

    const buttonText = this.add.text(0, 0, "Draw Card", {
      fontSize: "14px",
      color: "#fff",
      align: "center",
    });
    buttonText.setOrigin(0.5);

    const buttonPass = this.add.text(0, 0, "Pass Turn", {
      fontSize: "14px",
      color: "#fff",
      align: "center",
    });
    buttonPass.setOrigin(0.5);

    buttonBg.on("pointerdown", () => {
      drawCard();
      buttonBg.setFillStyle(0x3a80d2);
    });

    buttonBg.on("pointerup", () => {
      buttonBg.setFillStyle(0x4a90e2);
    });

    buttonBg.on("pointerover", () => {
      this.input.setDefaultCursor("pointer");
      buttonBg.setFillStyle(0x3a80d2);
    });

    buttonBg.on("pointerout", () => {
      this.input.setDefaultCursor("default");
      buttonBg.setFillStyle(0x4a90e2);
    });

    this.drawCardButton.add([buttonBg, buttonText]);
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
  // WILD COLOR SELECTION
  // =========================

  private showWildColorButtons() {
    // Hide existing buttons first
    this.hideWildColorButtons();

    // Create container for color buttons
    this.wildColorContainer = this.add.container(500, 200);

    const colors: Array<{
      color: "red" | "blue" | "green" | "yellow";
      hex: number;
    }> = [
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

      // Create button background
      const button = this.add.rectangle(x, y, 80, 60, item.hex).setInteractive();
      button.setStrokeStyle(3, 0xffffff);

      // Create button label
      const label = this.add.text(x, y, item.color.toUpperCase(), {
        fontSize: "12px",
        color: "#000",
        align: "center",
      });
      label.setOrigin(0.5);

      // Add click handler
      button.on("pointerdown", () => {
        selectWildColor(item.color);
        this.hideWildColorButtons();
      });

      // Add to container
      this.wildColorContainer!.add([button, label]);
    });
  }

  private hideWildColorButtons() {
    if (this.wildColorContainer) {
      this.wildColorContainer.destroy(true);
      this.wildColorContainer = null;
    }
  }

  // =========================
  // CLEANUP
  // =========================

  private clearPlayers() {
    this.playerContainers.forEach((c) => c.destroy(true));
    this.playerContainers.clear();
    this.hideWildColorButtons();
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

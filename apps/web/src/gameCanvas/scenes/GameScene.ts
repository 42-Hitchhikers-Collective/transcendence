import { Scene } from "phaser";
import { EventBus } from "../../events/EventBus";
import type { FrontendRoom, FrontendPlayer } from "../types/roomTypes";
import { playCard, selectWildColor, drawCard, passTurn } from "../../network/gameNetwork";

type Position = { x: number; y: number };

export class GameScene extends Scene {
  private pile!: Phaser.GameObjects.Zone;
  private boardContainer!: Phaser.GameObjects.Container;
  private drawCardButton!: Phaser.GameObjects.Container;
  private room!: FrontendRoom;
  private myPlayerId: string = "";

  private playerContainers = new Map<string, Phaser.GameObjects.Container>();
  private wildColorContainer: Phaser.GameObjects.Container | null = null;
  private passTurnContainer: Phaser.GameObjects.Container | null = null;

  constructor() {
    super("Game");
  }

  // =========================
  // INIT
  // =========================

  init() {
  }

  create() {
    this.createBoard();
    this.setupInput();

    EventBus.on("ROOM_STATE", this.onRoomState, this);
    EventBus.on("COLOR", this.onRoomState, this);
    EventBus.on("PASS_TURN", this.onRoomState, this);

    EventBus.on("SOCKET_ERROR", this.onSocketError, this);

    this.events.once("shutdown", () => {
      EventBus.off("ROOM_STATE", this.onRoomState, this);
      EventBus.off("COLOR", this.selectColor, this);
      EventBus.off("PASS_TURN", this.selectColor, this);

      EventBus.off("SOCKET_ERROR", this.onSocketError, this);
    });
  }

  private passTurnPermission(room: FrontendRoom)
  {
    const observer = room.players.find(p => p.isTheObserver);
    this.room = room;
    if (observer)
      this.showPassTurnButtons();
  }

  private onRoomState(room: FrontendRoom) {
    this.room = room;

    if (!this.myPlayerId) {
      const observer = room.players.find(p => p.isTheObserver);
      if (observer) this.myPlayerId = observer.id;
    }
    
    if (room.game && room.game.discardTopCard.color === "wild") {
      this.showPassTurnButtons();
    } else {
      this.hidePassTurnButtons();
    }
    
    this.render(room);
  }

  private selectColor(room: FrontendRoom)
  {
    const observer = room.players.find(p => p.isTheObserver);
    this.room = room;
    this.render(room);
    if (observer)
      this.showWildColorButtons();
  }

  private onSocketError(err: { message: string }) {
    console.error(err.message);
  }


  private createBoard() {
    this.add.image(500, 400, "background").setScale(0.5);

    this.boardContainer = this.add.container(0, 0);

    this.pile = this.add
      .zone(500, 350, 120, 160)
      .setRectangleDropZone(120, 160);

    const g = this.add.graphics();
    g.lineStyle(4, 0xffffff);
    g.strokeRectShape(this.pile.getBounds());

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


  private render(room: FrontendRoom) {
    this.clearPlayers();

    const orderedPlayers = this.reorderPlayersWithObserverAtBottom(room.players);
    const positions = this.getPlayerPositions(orderedPlayers.length);

    orderedPlayers.forEach((player, i) => {
      this.renderPlayer(player, positions[i]);
    });
  }

  private reorderPlayersWithObserverAtBottom(players: FrontendPlayer[]): FrontendPlayer[] {
    const observer = players.find(p => p.isTheObserver);
    if (!observer) return players;
    
    const others = players.filter(p => !p.isTheObserver);
    return [...others, observer];
  }

  private renderPlayer(player: FrontendPlayer, pos: Position) {
    const container = this.add.container(0, 0);

    this.playerContainers.set(player.id, container);
    this.boardContainer.add(container);

    const title = this.add.text(pos.x - 40, pos.y - 120, player.userName, {
      fontSize: "24px",
      color: "#fff",
    });

    container.add(title);

    const isMe = player.id === this.myPlayerId;
    if (isMe && player.cards) {
      let offsetX = -(player.cards.length * 20);

      player.cards.forEach((card, cardIndex) => {
        const sprite = this.add.image(
          pos.x + offsetX,
          pos.y,
          `${card.color}_${card.value}`,
        );

        sprite.setScale(0.3);
        sprite.setData("cardIndex", cardIndex);
        sprite.setInteractive();
        this.input.setDraggable(sprite);

        container.add(sprite);

        offsetX += 40;
      });
    } else {
      const cardCountText = this.add.text(pos.x, pos.y + 30, `🎴 ${player.cardCount}`, {
        fontSize: "16px",
        color: "#fff",
        align: "center",
      });
      cardCountText.setOrigin(0.5);
      container.add(cardCountText);
    }
  }


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
    this.tweens.add({
      targets: obj,
      x: obj.input?.dragStartX,
      y: obj.input?.dragStartY,
      duration: 150,
    });
  }


  private showWildColorButtons() {

    this.hideWildColorButtons();


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


      const button = this.add.rectangle(x, y, 80, 60, item.hex).setInteractive();
      button.setStrokeStyle(3, 0xffffff);


      const label = this.add.text(x, y, item.color.toUpperCase(), {
        fontSize: "12px",
        color: "#000",
        align: "center",
      });
      label.setOrigin(0.5);


      button.on("pointerdown", () => {
        selectWildColor(item.color);
        this.hideWildColorButtons();
      });


      this.wildColorContainer!.add([button, label]);
    });
  }

  private hideWildColorButtons() {
    if (this.wildColorContainer) {
      this.wildColorContainer.destroy(true);
      this.wildColorContainer = null;
    }
  }

  private showPassTurnButtons() {

    this.hidePassTurnButtons();


    this.passTurnContainer = this.add.container(700, 200);

    const colors: Array<{
      color: "red" | "blue" | "green" | "yellow";
      hex: number;
    }> = [
      { color: "red", hex: 0xff0000 },
    ];

    const startX = -150;
    const spacing = 100;

    colors.forEach((item, index) => {
      const x = startX + index * spacing;
      const y = 0;


      const button = this.add.rectangle(x, y, 80, 60, item.hex).setInteractive();
      button.setStrokeStyle(3, 0xffffff);


      const label = this.add.text(x, y, item.color.toUpperCase(), {
        fontSize: "12px",
        color: "#000",
        align: "center",hideWildColorButtons
      });
      label.setOrigin(0.5);

      // Add click handler
      button.on("pointerdown", () => {
        passTurn();
        this.hidePassTurnButtons();
      });

      this.wildColorContainer!.add([button, label]);
    });
  }

    private hidePassTurnButtons() {
    if (this.passTurnContainer) {
      this.passTurnContainer.destroy(true);
      this.passTurnContainer = null;
    }
  }



  private clearPlayers() {
    this.playerContainers.forEach((c) => c.destroy(true));
    this.playerContainers.clear();
    this.hideWildColorButtons();
  }


  private getPlayerPositions(count: number): Position[] {
    const cx = 500;
    const cy = 400;
    const r = 250;

    const res: Position[] = [];

    for (let i = 0; i < count; i++) {
      // The last player (observer) is always at the bottom (angle π/2)
      const a = (i / count) * Math.PI * 2 + Math.PI;

      res.push({
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r,
      });
    }

    return res;
  }
}

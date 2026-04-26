import { Scene } from "phaser";
import { Game } from "../models/Game";
import { Card } from "../models/Card";
import { Player } from "../models/Player";
import { GameEngine } from "../models/GameEngine";

export class GameScene extends Scene {
  CurrentGame!: Game;
  pile!: Phaser.GameObjects.Zone;
  rules!: GameEngine;
  player!: Player;

  constructor() {
    super("Game");
  }

  init(data: { rivals?: Player[]; user?: Player }) {
    const rivals = data?.rivals ?? this.xdel_add_player();
    const user = data?.user ?? new Player("0", "You");

    this.add.image(400, 400, "background").setScale(0.5);

    this.rules = new GameEngine();
    this.CurrentGame = new Game(1, rivals, user);

    this.pile = this.add
      .zone(500, 550, 100, 150)
      .setRectangleDropZone(100, 150);

    this.renderHands();

    this.player =
      this.CurrentGame.room.players[this.CurrentGame.room.turnIndex];
    const g = this.add.graphics();
    g.lineStyle(4, 0xffffff);
    g.strokeRect(325, 275, 100, 150);
  }

  create() {
    this.input.on("drag", (_, obj: any, x: number, y: number) => {
      obj.x = x;
      obj.y = y;
    });

    this.input.on("drop", (_, obj: any, zone: any) => {
      if (zone !== this.pile) return;

      const card = obj.getData("card") as Card;

      const success = this.rules.processMove(
        this.CurrentGame.room,
        this.player.id,
        card
      );

      if (success) {
        this.add.image(550, 330, card.getKey()).setScale(0.3);
        obj.destroy();
        this.player =
          this.CurrentGame.room.players[this.CurrentGame.room.turnIndex];
      } else {
        obj.x = obj.getData("startX");
        obj.y = obj.getData("startY");
      }
    });
  }

  // 🔥 POSICIONES SEGÚN CANTIDAD DE JUGADORES
  getPlayerPositions(count: number) {
    const centerX = 500;
    const centerY = 400;

    if (count === 2) {
      return [
        { x: centerX, y: 650 }, // abajo (user)
        { x: centerX, y: 150 }, // arriba
      ];
    }

    if (count === 3) {
      return [
        { x: centerX, y: 650 }, // abajo
        { x: 200, y: 150 }, // arriba izquierda
        { x: 800, y: 150 }, // arriba derecha
      ];
    }

    if (count === 4) {
      return [
        { x: centerX, y: 650 }, // abajo
        { x: centerX, y: 150 }, // arriba
        { x: 150, y: centerY }, // izquierda
        { x: 850, y: centerY }, // derecha
      ];
    }

    // fallback → distribución circular
    return this.getCircularPositions(count);
  }

  // 🔄 OPCIÓN DINÁMICA (para cualquier número)
  getCircularPositions(count: number) {
    const centerX = 500;
    const centerY = 400;
    const radius = 250;

    const positions = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;

      positions.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    }

    return positions;
  }

  renderHands() {
    const players = this.CurrentGame.room.players;
    const positions = this.getPlayerPositions(players.length);

    players.forEach((player, index) => {
      const pos = positions[index];

      // centra las cartas respecto al jugador
      let offsetX = -(player.hand.length * 20);

      for (const card of player.hand) {
        const x = pos.x + offsetX;
        const y = pos.y;

        const sprite = this.add.image(x, y, card.getKey()).setScale(0.3);

        sprite.setInteractive();
        this.input.setDraggable(sprite);

        sprite.setData("card", card);
        sprite.setData("player", player);
        sprite.setData("startX", x);
        sprite.setData("startY", y);

        offsetX += 40;
      }
    });
  }

  xdel_add_player(): Player[] {
    const player_a = new Player("1", "Beta");
    const player_b = new Player("2", "Gamma");

    return [player_a, player_b];
  }
}

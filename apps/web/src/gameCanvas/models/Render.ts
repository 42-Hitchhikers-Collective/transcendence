import { Scene } from "phaser";
import { Room } from "./Table";
import { Card } from "./Card";
import { Player } from "./Player";

export class Render extends Scene {
  private pile!: Phaser.GameObjects.Zone;
  private gameContainer!: Phaser.GameObjects.Container;

  rendergame(user: string, room: Room)
  {
    this.createBoard();
    this.renderHands(user, room);
  }

  createBoard() {
    this.add.image(400, 400, "background").setScale(0.5);

    this.gameContainer = this.add.container(0, 0);

    this.pile = this.add
      .zone(300, 300, 100, 150)
      .setRectangleDropZone(300, 300);

    this.drawZone(this.pile);
  }

  drawZone(zone: Phaser.GameObjects.Zone) {
    const g = this.add.graphics();
    g.lineStyle(4, 0xffffff);
    g.strokeRectShape(zone.getBounds());
    return g;
  }

  // RENDER

  renderHands(user: string, room: Room) {
    const players = room.players;
    const positions = this.getPlayerPositions(players.length);
    const userPlayer = players.find(player => player.id === user)
    const indexUser = players.findIndex(player => player.id === user)

    const orderedPlayers = [
    ...players.slice(indexUser),
    ...players.slice(0, indexUser),
  ];

    orderedPlayers.forEach((player, index) => {
      let pos = positions[index];
      if (player != userPlayer)
          pos = positions[index + 1];
      else 
        pos = positions[0];

      this.renderPlayerInfo(player, pos);
      this.renderPlayerCards(player, pos, room, userPlayer);
    });
  }

  renderPlayerInfo(player: Player, pos: { x: number; y: number }) {
    this.gameContainer.add(
      this.add.text(pos.x - 40, pos.y - 120, player.username, {
        fontSize: "24px",
        color: "#ab4242",
        fontFamily: "Arial",
      }),
    );

    this.add.text(pos.x - 20, pos.y - 100, player.id, {
      fontSize: "24px",
      color: "#ab4242",
      fontFamily: "Arial",
    });
  }

  renderPlayerCards(player: Player, pos: { x: number; y: number },  room: Room, userPlayer?: Player) {
    let offsetX = -(player.hand.length * 20);

    for (const card of player.hand) {
      const x = pos.x + offsetX;
      const y = pos.y;

      const sprite = this.createCardSprite(card, x, y, room, userPlayer);
      this.gameContainer.add(sprite);

      offsetX += 40;
    }
  }

  createCardSprite(card: Card, x: number, y: number, room: Room, userPlayer?: Player) {
    let sprite;
    if (userPlayer == room.players[room.turnIndex]) {
      sprite = this.add.image(x, y, card.getKey()).setScale(0.3);
      sprite.setInteractive();
      this.input.setDraggable(sprite);
    } else {
      sprite = this.add.image(x, y, "back").setScale(0.3);
    }

    sprite.setData("card", card);
    sprite.setData("player", userPlayer);
    sprite.setData("startX", x);
    sprite.setData("startY", y);

    return sprite;
  }

  //LAYOUT

  getPlayerPositions(count: number) {
    const centerX = 500;
    const centerY = 400;

    const layouts: Record<number, () => { x: number; y: number }[]> = {
      2: () => [
        { x: centerX, y: 650 },
        { x: centerX, y: 150 },
      ],
      3: () => [
        { x: centerX, y: 650 },
        { x: 200, y: 150 },
        { x: 800, y: 150 },
      ],
      4: () => [
        { x: centerX, y: 650 },
        { x: centerX, y: 150 },
        { x: 150, y: centerY },
        { x: 850, y: centerY },
      ],
    };

    return layouts[count]?.() ?? this.getCircularPositions(count);
  }

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


  createPlayers(num: number): Player[] {
    if (num == 1) return [new Player("1", "Beta")];
    if (num == 2) {
      return [new Player("1", "Beta"), new Player("2", "Gamma")];
    }
    if (num == 3) {
      return [
        new Player("1", "Beta"),
        new Player("2", "Gamma"),
        new Player("3", "Alpha"),
      ];
    }
    return [];
  }

  rerender(user: string, room: Room) {
    this.gameContainer.removeAll(true);
    this.renderHands(user, room);
  }

}
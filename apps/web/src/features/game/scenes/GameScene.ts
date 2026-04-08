import { Scene } from "phaser";
import { Game } from "../models/Game";
import { Card } from "../models/Card";
import { Player } from "../models/Player";

export class GameScene extends Scene {
  CurrentGame: Game;
  players: Player[] = [];
  pile!: Phaser.GameObjects.Zone;

  constructor() {
    super("Game"); // excecutes the construct scene from Phaser

    this.xdel_add_player();

    this.CurrentGame = new Game(1, this.players, this.players[0]);
  }

  create() {
    // Crear pile
    let cardSprite;
    this.pile = this.add
      .zone(550, 375, 100, 150)
      .setRectangleDropZone(100, 150);

    const pileGraphics = this.add.graphics();
    pileGraphics.lineStyle(2, 0xffffff);
    pileGraphics.strokeRect(500, 300, 50, 75);

    // eventos globales
    this.input.on(
      "drag",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Image,
        dragX: number,
        dragY: number,
      ) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
      },
    );

    this.input.on(
      "drop",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Image,
        dropZone: Phaser.GameObjects.Zone,
      ) => {
        const card = gameObject.getData("card") as Card;

        const topCard =
          this.CurrentGame.room.discardPile[
            this.CurrentGame.room.discardPile.length - 1
          ];

        if (
          !topCard ||
          card.color === topCard.color ||
          card.value === topCard.value
        ) {
          console.log("Valid Card:", card.color, card.value);

          this.CurrentGame.room.discardPile.push(card);
          this.CurrentGame.room.currentColor = card.color;

          cardSprite = this.add
          .image(550, 330, card.getKey())
          .setScale(0.3);

          gameObject.destroy();
          

        } else {
          console.log("Invalid Card");

          const startX = gameObject.getData("startX");
          const startY = gameObject.getData("startY");


          gameObject.x = startX;
          gameObject.y = startY;
        }
      },
    );

    let startY = 75;

    for (const user of this.CurrentGame.players) {
      let startX = 75;

      for (const card of user.hand) {
        const cardSprite = this.add
          .image(startX, startY, card.getKey())
          .setScale(0.3);

        cardSprite.setInteractive();
        this.input.setDraggable(cardSprite);

        cardSprite.setData("card", card);
        cardSprite.setData("player", user);
        console.log("Loaded Card:", card.getKey());

        startX += 70;
      }

      startY += 120;
    }
    // primera carta
  }

  spawnCard() {
    const card = this.CurrentGame.room.drawPile.pop();
    if (!card) return;

    console.log("Carta cargada:", card.getKey());

    const cardSprite = this.add.image(500, 400, card.getKey()).setScale(1);

    cardSprite.setInteractive();
    this.input.setDraggable(cardSprite);

    const startX = cardSprite.x;
    const startY = cardSprite.y;

    this.input.once(
      "dragend",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Image,
        dropped: boolean,
      ) => {
        if (!dropped) {
          gameObject.x = startX;
          gameObject.y = startY;
        }
      },
    );
  }

  xdel_add_player() {
    let player_a = new Player(1, "Beta");
    this.players.push(player_a);
    let player_b = new Player(2, "Gamma");
    this.players.push(player_b);
  }
}

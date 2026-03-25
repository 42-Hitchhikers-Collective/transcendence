import { Scene } from "phaser";
import { Game } from "../models/Game";
import { Player } from "../models/Player";
import type { C } from "node_modules/react-router/dist/development/index-react-server-client-EzWJGpN_.d.mts";

export class GameScene extends Scene {
  CurrentGame: Game;
  players: Player[] = [];

  pile!: Phaser.GameObjects.Zone;

  constructor() {
    super("Game"); // excecutes the construct scene from Phaser

    this.xdel_add_player();

    this.CurrentGame = new Game(1, this.players);
  }

  create() {
    // Crear pile
    this.pile = this.add
      .zone(540, 210, 120, 180)
      .setRectangleDropZone(300, 180);

    const pileGraphics = this.add.graphics();
    pileGraphics.lineStyle(2, 0xffffff);
    pileGraphics.strokeRect(540, 210, 120, 180);

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
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;

        gameObject.disableInteractive();

        // aparece nueva carta
        this.spawnCard();
      },
    );

    let startY = 75;

    for (const user of this.CurrentGame.players) {
      let startX = 75;

      for (const card of user.hand) {
        const cardSprite = this.add
          .image(startX, startY, card.getKey())
          .setScale(.3);

        cardSprite.setInteractive();
        this.input.setDraggable(cardSprite);
        console.log("Carta cargada:", card.getKey());

        startX += 70; // siguiente carta a la derecha
      }

      startY += 120; // siguiente jugador más abajo
    }
    // primera carta
    this.spawnCard();
  }

  spawnCard() {
    const card = this.CurrentGame.table.drawPile.pop();
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

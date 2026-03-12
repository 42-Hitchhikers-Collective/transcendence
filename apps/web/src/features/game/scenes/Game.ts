import { Scene } from "phaser";
import { Card } from "../models/Card";

export class Game extends Scene {
  deck: Card[] = [];
  pile!: Phaser.GameObjects.Zone;

  constructor() {
    super("Game");
  }

  create() {
    this.createDeck();

    // Crear pile
    this.pile = this.add.zone(600, 300, 120, 180).setRectangleDropZone(120, 180);

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
        dragY: number
      ) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
      }
    );

    this.input.on(
      "drop",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Image,
        dropZone: Phaser.GameObjects.Zone
      ) => {
        gameObject.x = dropZone.x;
        gameObject.y = dropZone.y;

        gameObject.disableInteractive();

        // aparece nueva carta
        this.spawnCard();
      }
    );

    // primera carta
    this.spawnCard();
  }

  spawnCard() {
    const card = this.deck.pop();
    if (!card) return;

    console.log("Carta cargada:", card.getKey());

    const cardSprite = this.add.image(400, 300, card.getKey()).setScale(1);

    cardSprite.setInteractive();
    this.input.setDraggable(cardSprite);

    const startX = cardSprite.x;
    const startY = cardSprite.y;

    this.input.once(
      "dragend",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Image,
        dropped: boolean
      ) => {
        if (!dropped) {
          gameObject.x = startX;
          gameObject.y = startY;
        }
      }
    );
  }

  private createDeck() {
    let id = 0;

    const colors = ["red", "blue", "green", "yellow"] as const;
    const numbers = [0,1,2,3,4,5,6,7,8,9] as const;

    for (const color of colors) {
      for (const value of numbers) {
        this.deck.push(new Card(id++, color, value));
      }
    }

    Phaser.Utils.Array.Shuffle(this.deck);
  }
}
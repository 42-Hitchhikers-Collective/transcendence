import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  preload() {
    this.loadCardAssets();
  }

  create() {
    this.scene.start("Game");
  }

  private loadCardAssets() {
    const colors = ["red", "blue", "green", "yellow"];

    const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "skip", "reverse", "2plus"];

    // cartas normales
    for (const color of colors) {
      for (const value of values) {
        const key = `${value}_${color}`;

        this.load.image(key, `assets/game_assets/cards/${color}/${key}.png`);
      }
    }

    // cartas wild
    this.load.image("4_plus_wild", "assets/game_assets/cards/wild/4plus.png");

    this.load.image(
      "color_wild",
      "assets/game_assets/cards/wild/wild_card.png",
    );

    // carta trasera
    this.load.image("back", "assets/game_assets/cards/back/card_back.png");
  }
}

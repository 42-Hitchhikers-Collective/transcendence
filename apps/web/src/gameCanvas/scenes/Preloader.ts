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
    const cardAssets = "../../../public/assets/game_assets/cards/";
    const tableAssets = "../../../public/assets/game_assets/table/";

    const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "skip", "reverse", "2plus"];

    for (const color of colors) {
      for (const value of values) {
        const key = `${value}_${color}`;

        this.load.image(key, `${cardAssets}${color}/${key}.png`);

      }
    }

    this.load.image("4plus_wild", `${cardAssets}wild/4plus_wild.png`);

    this.load.image(
      "color_wild",
      `${cardAssets}wild/wild_card.png`,
    );

    this.load.image("background", `${tableAssets}table.jpeg`);

    this.load.image("back", `${cardAssets}back/card_back.png`);
  }
}

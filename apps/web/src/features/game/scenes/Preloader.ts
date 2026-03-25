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
    const colors = ["red", "blue", "green", "yellow", "wild"];
    const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "skip", "reverse", "2plus"];
    const specials = ["wild"];
    const numbers = ["4plus", "color"];

    for (const color of colors) {
      for (const value of numbers) {
        const key = `${value}_${color}`;
        this.load.image(key, `assets/game_assets/cards/${color}/${key}.png`);
      }

      // cartas especiales (skip, reverse, draw2)
      //for (const special of specials) {
      //  const key = `${color}_${special}`;
      //  this.load.image(key, `assets/cards/${key}.png`);
      //}
    }

    // cartas globales
    //this.load.image("wild", "assets/cards/wild.png");
    this.load.image("back", "assets/game_assets/cards/back/card_back.png");
  }
}

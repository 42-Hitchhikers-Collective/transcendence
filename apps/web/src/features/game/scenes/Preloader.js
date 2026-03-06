import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  preload() {
    this.load.setPath("assets/game_assets/cards_individual");

    this.load.image("card", "blue/0_blue.png");
  }

  create() {
    this.scene.start("Game");
  }
}

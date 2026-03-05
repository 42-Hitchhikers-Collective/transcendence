import { Scene } from "phaser";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  preload() {
    this.load.setPath("../");

    this.load.image("card", "uno_logo.png");
  }

  create() {
    this.scene.start("Game");
  }
}

import { Scene } from "phaser";
import { AssetLoader } from "../managers/AssetLoader";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  preload() {
    const assetLoader = new AssetLoader(this);
    assetLoader.loadCardAssets();
  }

  create() {
    this.scene.start("Game");
  }
}

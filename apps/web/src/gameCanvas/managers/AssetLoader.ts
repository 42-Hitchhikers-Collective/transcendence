export class AssetLoader {
  private scene: Phaser.Scene;
  private cardAssets = "../../../public/assets/game_assets/cards/";
  private tableAssets = "../../../public/assets/game_assets/table/";

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  loadCardAssets() {
    const colors = ["red", "blue", "green", "yellow"];
    const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "skip", "reverse", "2plus"];

    // Load colored cards
    for (const color of colors) {
      for (const value of values) {
        const key = `${value}_${color}`;
        this.scene.load.image(key, `${this.cardAssets}${color}/${key}.png`);
      }
    }

    // Load wild cards
    this.scene.load.image("4plus_wild", `${this.cardAssets}wild/4plus_wild.png`);
    this.scene.load.image("color_wild", `${this.cardAssets}wild/wild_card.png`);

    // Load table and card back
    this.scene.load.image("background", `${this.tableAssets}table.jpeg`);
    this.scene.load.image("back", `${this.cardAssets}back/card_back.png`);
  }
}

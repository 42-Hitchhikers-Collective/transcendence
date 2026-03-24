import { Card } from "./Card"

export class Deck {
  cards: Card[] = [];

  constructor() {
    this.createDeck();
  }

  private createDeck() {
    let id = 0;

    const colors = ["red", "blue", "green", "yellow"] as const;
    const numbers = [0,1,2,3,4,5,6,7,8,9] as const;

    for (const color of colors) {

      this.cards.push(new Card(id++, color, 0));

      for (const value of numbers) {
        this.cards.push(new Card(id++, color, value));
        this.cards.push(new Card(id++, color, value));
      }

      const specials = ["skip", "reverse", "2plus"] as const;

      for (const value of specials) {
        this.cards.push(new Card(id++, color, value));
        this.cards.push(new Card(id++, color, value));
      }
    }

    for (let i = 0; i < 4; i++) {
      this.cards.push(new Card(id++, "wild", "color"));
      this.cards.push(new Card(id++, "wild", "4_plus"));
    }

    Phaser.Utils.Array.Shuffle(this.cards);
  }

  get_card()
  {
    return (this.cards.pop())
  }
}

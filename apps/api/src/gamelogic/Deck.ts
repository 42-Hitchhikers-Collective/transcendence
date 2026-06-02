import { Card } from "./Card"

export class Deck {
  cards: Card[] = [];

  constructor() {
    this.createDeck();
  }

  private createDeck() {
    let id = 0;

    const colors = ["red", "blue", "green", "yellow"] as const;
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
    const specials = ["skip", "reverse", "2plus"] as const;

    for (const color of colors) {
      this.cards.push(new Card(id++, color, 0));

      for (const value of numbers) {
        this.cards.push(new Card(id++, color, value));
        this.cards.push(new Card(id++, color, value));
      }

      for (const value of specials) {
        this.cards.push(new Card(id++, color, value));
        this.cards.push(new Card(id++, color, value));
      }
    }

    for (let i = 0; i < 4; i++) {
      this.cards.push(new Card(id++, "wild", "color"));
      this.cards.push(new Card(id++, "wild", "4plus"));
    }

    this.shuffle(this.cards);
  }

  shuffle = <T>(array: T[]): void => {
    array.sort(() => Math.random() - 0.5);
  }

  get_card() {
    return (this.cards.pop())
  }
}



export class Card {
  id: number;
  color: "red" | "blue" | "green" | "yellow" | "wild";
  value: | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | "skip" | "reverse" | "2plus" | "4plus" | "color";

  constructor(
    id: number,
    color: "red" | "blue" | "green" | "yellow" | "wild",
    value: | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | "skip" | "reverse" | "2plus" | "4plus" | "color",
  ) {
    this.id = id;
    this.color = color;
    this.value = value;
  }

  getKey(): string {
    return `${this.value}_${this.color}`;
  }

}



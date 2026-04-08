import { Card } from "./Card";
import { Deck } from "./Deck";
import { Player } from "./Player";

export class Room {
  gameID: number;
  players: Player[];
  currentTurn: number;
  direction: 1 | -1;
  drawPile: Card[];
  discardPile: Card[];
  currentColor: "null" | "red" | "blue" | "green" | "yellow" | "wild";

  constructor(gameID: number, players: Player[])
   {
    this.gameID = gameID;
    this.players = players;

    this.currentTurn = 0;
    this.direction = 1;

    const deck = new Deck();

    this.drawPile = deck.cards;
    this.discardPile = [];
    this.currentColor = "null";

    this.dealCards();


  }
    private dealCards() {
    for (const player of this.players) {
      for (let i = 0; i < 7; i++) {
        const card = this.drawPile.pop();
        if (card) player.hand.push(card);
      }
    }
    }
}
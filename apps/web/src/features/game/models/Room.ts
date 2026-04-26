import { Card } from "./Card";
import { Deck } from "./Deck";
import { Player } from "./Player";

export class Room {
  gameID: number;
  players: Player[];
  user: Player;
  n_player: number;
  turnIndex: number;
  currentPlayer: string;
  direction: 1 | -1;
  drawPile: Card[];
  discardPile: Card[];
  currentColor: null | "red" | "blue" | "green" | "yellow" | "wild";

  constructor(gameID: number, rivals: Player[], user: Player) {
    this.gameID = gameID;
    this.players = [...rivals, user];
    this.user = user;

    this.n_player = this.players.length;
    const randomIndex = Math.floor(Math.random() * this.players.length);
    console.log("Random Index Generated: ", randomIndex);
    console.log("Player Lenght: ", this.players.length);
    this.turnIndex = randomIndex;
    this.currentPlayer = this.players[randomIndex].id;
    this.direction = 1;

    const deck = new Deck();

    this.drawPile = deck.cards;
    this.discardPile = [];
    this.currentColor = null;

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
  shuffleDiscardPile() {
    if (this.discardPile.length <= 1) return;

    const topCard = this.discardPile.pop(); // guardar la última

    while (this.discardPile.length > 0) {
      const card = this.discardPile.pop();
      if (card) this.drawPile.push(card);
    }

    Phaser.Utils.Array.Shuffle(this.drawPile);

    if (topCard) this.discardPile.push(topCard); // devolver la carta visible
  }
}

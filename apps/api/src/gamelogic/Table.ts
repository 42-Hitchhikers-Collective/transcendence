import { Card } from "./Card";
import { Deck } from "./Deck";
import { Player } from "./Player";

export class Table {
  gameID: number;
  players: Player[];

  turnIndex: number;
  direction: 1 | -1;

  pendingDraw: number;
  draw: number;

  drawPile: Card[];
  discardPile: Card[] | undefined;

  playerPlayed: boolean;

  currentColor: "red" | "blue" | "green" | "yellow" | "wild" | null;

  uno: boolean;
  color: boolean;
  skip: boolean;
  finish: boolean;

  constructor(gameID: number, rivals: Player[]) {
    this.gameID = gameID;

    this.players = rivals;

    this.turnIndex = Math.floor(Math.random() * this.players.length);

    this.direction = 1;

    this.pendingDraw = 0;

    this.draw = 1;

    this.playerPlayed = false;

    const deck = new Deck();

    this.drawPile = deck.cards;
    this.discardPile = [];
    
    
    this.color = false;
    this.uno = false;
    this.finish = false;
    this.skip = false;
    this.discardPile.push(this.initialCard());
    this.currentColor = this.discardPile[this.discardPile.length - 1].color;

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

  initialCard() {
    let card = this.drawPile.pop();

    while (card?.value === "4plus" || card?.value === "2plus" || card?.value === "color"
    ) {
      this.drawPile.unshift(card);
      card = this.drawPile.pop();
    }

    return card;
  }

  getHand(playerId: string): Card[] | null {
    const player = this.players.find((p) => p.id === playerId);
    return player?.hand ?? null;
  }

  getCardCount(playerId: string): number | undefined {
    const player = this.players.find((p) => p.id === playerId);
    return player?.hand.length;
  }

  changeColor(color: "red" | "blue" | "green" | "yellow") {
    this.currentColor = color;
    this.color = false;
  }

  getPlayerPlayed() {
    return this.playerPlayed;
  }
}

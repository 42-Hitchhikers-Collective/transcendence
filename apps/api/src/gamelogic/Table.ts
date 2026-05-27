import { Card } from "./Card";
import { Deck } from "./Deck";
import { Player } from "./Player";

export class Table {
  gameID: number;
  players: Player[];

  n_player: number;

  turnIndex: number;
  direction: 1 | -1;

  pendingDraw: number;
  draw: number;

  drawPile: Card[];
  discardPile: Card[];

  currentColor: null | "red" | "blue" | "green" | "yellow";
  passTurn: boolean;

  lastCard: Card | null;
  event: "uno" | "color" | "finished";

  // ============================================================
  //  initializer
  // ============================================================

  constructor(gameID: number, rivals: Player[]) {
    this.gameID = gameID;

    this.players = rivals;

    this.n_player = this.players.length;

    this.turnIndex = Math.floor(Math.random() * this.players.length);

    this.direction = 1;

    this.pendingDraw = 0;

    this.draw = 1;

    this.lastCard = null;

    const deck = new Deck();

    this.drawPile = deck.cards;
    this.discardPile = [];
    this.passTurn = false;
    this.event = null;

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
    this.setEventNext();
  }


}


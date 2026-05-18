import { Card } from "./Card";
import { Deck } from "./Deck";
import { Player } from "./Player";

export class Table {
  gameID: number;
  players: Player[];

  user: Player;

  n_player: number;

  turnIndex: number;
  direction: 1 | -1;

  pendingDraw: number;

  drawPile: Card[];
  discardPile: Card[];

  currentColor: null | "red" | "blue" | "green" | "yellow" | "wild";
  pass_turn: boolean;

  lastCard: Card | null;

  constructor(gameID: number, rivals: Player[], user: Player) {
    this.gameID = gameID;

    this.players = [...rivals, user];
    this.user = user;

    this.n_player = this.players.length;

    this.turnIndex = Math.floor(Math.random() * this.players.length);

    this.direction = 1;

    this.pendingDraw = 0;

    this.lastCard = null;

    const deck = new Deck();

    this.drawPile = deck.cards;
    this.discardPile = [];
    this.pass_turn = false;

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

  getHand(playerId: string) {
    const player = this.players.find((p) => p.id === playerId);
    return player?.hand ?? null;
  }
  getCardCount(playerId: string) {
    const player = this.players.find((p) => p.id === playerId);
    return player?.hand.length;
  }

  drawCards(player: Player, amount: number) {
    for (let i = 0; i < amount; i++) {
      let card = this.drawPile.pop();

      if (!card) {
        this.shuffleDiscardPile();
        card = this.drawPile.pop();
      }

      if (card) {
        player.hand.push(card);
      }
    }
  }
  changeColor(color: "red" | "blue" | "green" | "yellow" | "wild") {
    this.currentColor = color;
  }
}

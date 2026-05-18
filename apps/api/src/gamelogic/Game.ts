import { Player } from "./Player";
import { Table } from "./Table";
import { GameEngine } from "./GameEngine";
import { Card } from "./Card";

export class Game {
  public gameId: number;

  public winner: Player | null;

  public timestampStart: number;
  public timestampEnd: number | null;

  public isFinished: boolean;
  public playerDisconnected: boolean;

  public players: Player[];

  public table: Table;

  public rules: GameEngine;

  constructor(
    users: Map<string, string>[],
  ) {
    this.gameId = Date.now();

    this.winner = null;

    this.timestampStart = Date.now();
    this.timestampEnd = null;

    this.isFinished = false;
    this.playerDisconnected = false;

    this.players = this.createPlayers(users);

    this.rules = new GameEngine();

    this.table = new Table(
      this.gameId,
      this.players,
    );
  }

  private createPlayers(
    users: Map<string, string>[]
  ): Player[] {
    const players: Player[] = [];

    for (const userMap of users) {
      for (const [playerId, username] of userMap) {
        const player = new Player(
          playerId,
          username
        );

        players.push(player);
      }
    }

    return players;
  }

  public finishGame(winner: Player) {
    this.winner = winner;

    this.isFinished = true;

    this.timestampEnd = Date.now();
  }

  public interruptGame() {
    this.playerDisconnected = true;

    this.isFinished = true;

    this.timestampEnd = Date.now();
  }

  playCard(playerId: string, card: Card): boolean {
    if (!this.rules.playCard(this.table, playerId, card))
      return false;
    return true;
    //const player = this.table.players.find((p) => p.id === playerId);
    //if (!player) return;
    //
    //const index = player.hand.findIndex((c) => c.id === card.id);
    //
    //if (index === -1) {
    //  console.warn("Card not found in hand", card);
    //  return;
    //}
    //
    //const [playedCard] = player.hand.splice(index, 1);
    //
    //this.table.discardPile.push(playedCard);
    //this.table.currentColor = playedCard.color;
  }
  playCard2(playerId: string, card: Card): boolean {
    if (!this.rules.playCard(this.table, playerId, card))
      return false;
    this.rules.advance(this.table);
    return true;
    //const player = this.table.players.find((p) => p.id === playerId);
    //if (!player) return;
    //
    //const index = player.hand.findIndex((c) => c.id === card.id);
    //
    //if (index === -1) {
    //  console.warn("Card not found in hand", card);
    //  return;
    //}
    //
    //const [playedCard] = player.hand.splice(index, 1);
    //
    //this.table.discardPile.push(playedCard);
    //this.table.currentColor = playedCard.color;
  }

  drawCard(playerId: string): boolean {
    const player = this.table.players.find((p) => p.id === playerId);

    if (!player) return false;

    let card = this.table.drawPile.pop();

    if (!card) {
      this.table.shuffleDiscardPile();
      card = this.table.drawPile.pop();
    }

    if (!card) return false;

    player.hand.push(card);

    return true;
  }
}
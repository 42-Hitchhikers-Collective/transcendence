import { Player } from "./Player";
import { Table } from "./Table";
import { GameEngine } from "./GameEngine";

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
    myPlayer: Player
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
      myPlayer
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
}

import { Player } from "./Player";
import { Table } from "./Table";
import { GameMaster } from "./GameMaster";
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

  public gameMaster: GameMaster;

  constructor(users: Map<string, string>[],) {
    this.gameId = Date.now();

    this.winner = null;

    this.timestampStart = Date.now();
    this.timestampEnd = null;

    this.isFinished = false;
    this.playerDisconnected = false;

    this.players = this.createPlayers(users);

    this.gameMaster = new GameMaster();

    this.table = new Table(
      this.gameId,
      this.players,
    );
  }

  private createPlayers(users: Map<string, string>[]): Player[] {
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

  public playCard(playerId: string, card: Card): boolean {
    if (!this.gameMaster.playCard(this.table, playerId, card))
      return false;
    return true;
  }


  public drawCard(playerId: string): boolean {
    if (!this.gameMaster.drawCard(this.table, playerId))
      return false;
    return true;
  }

  private setEventNext()  {
    this.table.event = null;
    this.table.passTurn = true;
  }

  public changeColor(color: "red" | "blue" | "green" | "yellow") {
    this.table.currentColor = color;
    this.setEventNext();
  }

  public passTurn(playerId: string)
  {
      return this.gameMaster.advanceTurn(this.table, playerId);
  }

  public checkEvent(table: Table): "uno" | "color" | "finished" | "next" | null {
    return (table.event);
  }
}
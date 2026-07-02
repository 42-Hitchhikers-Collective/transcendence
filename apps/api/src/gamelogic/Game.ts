import { Player } from "./Player";
import { Table } from "./Table";
import { GameMaster } from "./GameMaster";
import { Card } from "./Card";

type Event = { color: boolean; uno: boolean; finish: boolean };

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

  constructor(users: Map<string, string>[]) {
    this.gameId = Date.now();

    this.winner = null;

    this.timestampStart = Date.now();
    this.timestampEnd = null;

    this.isFinished = false;
    this.playerDisconnected = false;

    this.players = this.createPlayers(users);

    this.gameMaster = new GameMaster();

    this.table = new Table(this.gameId, this.players);
  }

  private createPlayers(users: Map<string, string>[]): Player[] {
    const players: Player[] = [];

    for (const userMap of users) {
      for (const [playerId, username] of userMap) {
        const player = new Player(playerId, username);
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
    if (!this.gameMaster.playCard(this.table, playerId, card)) return false;
    return true;
  }

  public drawCard(playerId: string): boolean {
    if (!this.gameMaster.drawCard(this.table, playerId)) return false;
    return true;
  }

  public changeColor(color: "red" | "blue" | "green" | "yellow") {
    this.table.currentColor = color;
    this.table.color = false;
  }

  public playerPassBotton(playerId: string) {
    if (this.table.draw != 0 || this.table.color) return false;
    this.passTurn(playerId);
  }

  public passTurn(playerId: string) {
    return this.gameMaster.advanceTurn(this.table, playerId);
  }

  public checkEvent(): Event {
    return {
      color: this.table.color,
      uno: this.table.uno,
      finish: this.table.finish,
    };
  }

  public playerLeft(playerID: string) : boolean {

    if (this.gameMaster.playerLeftGame(playerID, this.table))
      return true;
    return false;
  }

  // cardsToDraw, used in dataToFrontend to display the cards that user needs to draw
  public cardsToDraw()
  {
    if (this.table.pendingDraw == 0)
      return this.table.draw;
    return this.table.pendingDraw;
  }
}

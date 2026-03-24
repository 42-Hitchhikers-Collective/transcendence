
import { Player } from "./Player";
import { Table } from "./Table"

export class Game {
    gameId: number;
    players: Player[];
    winner: Player | null;
    duration: number;
    timestamp: number;
    finalState: boolean;
    table: Table;

    constructor (gameId: number, players: Player[])
    {
        this.gameId = gameId;
        this.players = players;
        this.winner = null;
        this.duration = 0;
        this.timestamp = 0; //current time
        this.finalState = false; // not finished
        this.table = new Table(gameId, players);
        
    }
}

import { Player } from "./Player";
import { Table } from "./Table"
import { GameEngine } from "./GameEngine";


export class Game {
    gameId: number;
    winner: Player | null;
    timestamp_start: number;
    timestamp_end: number;
    finalState: boolean;
    userleft: boolean;
    players: Player [];
    table: Table;
    rules: GameEngine;

    constructor (users: Map<string, string>[], my_player: Player)
    {
        this.gameId = 0;
        this.winner = null;
        this.timestamp_start = 0;
        this.timestamp_end = 0; //current time
        this.finalState = false; // not finished
        this.userleft = false;  // we interrupt the game if is true

        // Create a Player array with the Map<playerId, username>
        this.players = this.create_players(users);

        this.table = new Table(this.gameId, this.players, my_player);
    }

    private create_players(users: Map<string, string>[])
    {}
}


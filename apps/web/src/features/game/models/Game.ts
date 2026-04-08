
import { Player } from "./Player";
import { Room } from "./Room"

export class Game {
    gameId: number;
    my_players: Player;
    players: Player[];
    winner: Player | null;
    timestamp_start: number;
    timestamp_end: number;
    finalState: boolean;
    userleft: boolean;
    room: Room;

    constructor (gameId: number, players: Player[], my_player: Player)
    {
        this.gameId = gameId;
        this.players = players;
        this.my_players = my_player;
        this.winner = null;
        this.timestamp_start = 0;
        this.timestamp_end = 0; //current time
        this.finalState = false; // not finished
        this.userleft = false;  // we interrupt the game if is true
        this.room = new Room(gameId, players);
    }

        
    // constructor (players: Player[], room: Room)
    // {
    //     this.gameId = gameId;
    //     this.players = players;
    //     this.winner = null;
    //     this.timestamp_start = 0;
    //     this.timestamp_end = 0; //current time
    //     this.finalState = false; // not finished
    //     this.userleft = false;  // we interrupt the game if is true
    //     this.room = new Room(players);
    // }
}
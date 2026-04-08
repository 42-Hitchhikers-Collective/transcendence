import { Card } from "./Card"

export class Player {
  id: number;
  username: string;
  hand: Card[]
  //avatar: let
  //socket: string

  constructor(id: number, username: string) {
    this.id = id;
    this.username = username;
    this.hand = [];
    
  }
}

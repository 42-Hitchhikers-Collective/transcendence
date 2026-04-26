import { Card } from "./Card"

export class Player {
  id: string;
  username: string;
  hand: Card[] = [];
  isReady: boolean = false;
  isHost: boolean = false;

  constructor(id: string, username: string) {
    this.id = id;
    this.username = username;
  }
}

import { Card } from "./Card"

export class Player {
  id: string;
  username: string;
  hand: Card[] = [];

  constructor(id: string, username: string) {
    this.id = id;
    this.username = username;
  }

  
}


import { CardTitle } from "@/shared/components/ui/card";
import { Card } from "./Card"
import { Room } from "./Room"

export class RuleEngine {
  validateMove(room: Room, playerId: string, card: Card): boolean {
    if (!this.isPlayerTurn(room, playerId)) return false;
    if (!this.isCardPlayable(room, card)) return false;
    return true;
  }

  private isPlayerTurn(room: Room, playerId: string): boolean {
    console.log("Current Player: ", room.currentPlayer, " Player: ", playerId);
    return room.players[room.turnIndex].id === playerId;
  }

  private isCardPlayable(room: Room, card: Card): boolean {
    console.log("Dale vieja");
    const top = room.discardPile.at(-1);
    console.log("Top Card: ", top?.color, " Player: ", card.color);
    if (!top)
      return true;

    return (
      card.color === room.currentColor ||
      card.value === top?.value ||
      card.color === "wild"
    );
  }
}

export class CardEffectResolver {
  applyEffect(room: Room, card: Card) {
    switch (card.value) {
      case "reverse":
        this.reverse(room);
        break;
      case "skip":
        this.skip(room);
        break;
      case "2plus":
        this.drawCards(room, 2);
        break;
      case "4plus":
        this.drawCards(room, 4);
        break;
    }
  }

  private reverse(room: Room) {
    room.direction *= -1;
  }

  private skip(room: Room) {
    room.turnIndex += room.direction;
  }

  private drawCards(room: Room, amount: number) {
  const next = this.getNextPlayer(room);

  for (let i = 0; i < amount; i++) {
    let card = room.drawPile.pop();

    if (!card) {
      room.shuffleDiscardPile();
      card = room.drawPile.pop();
    }

    if (card) {
      next.hand.push(card);
    }
  }
}

  private getNextPlayer(room: Room) {
    const next = (room.turnIndex + room.direction + room.n_player) % room.n_player;
    console.log("getNextPlayer: ", next);
    const player = room.players[next];
    console.log("getNextPlayer ID: ", player.id);
    return player;
} 

}

export class TurnManager {
  advanceTurn(room: Room) {
    room.turnIndex =
      (room.turnIndex + room.direction + room.players.length) %
      room.players.length;
    console.log("Current Turn Index: ", room.turnIndex);
  }

  getCurrentPlayer(room: Room) {
    return room.players[room.turnIndex];
  }
}
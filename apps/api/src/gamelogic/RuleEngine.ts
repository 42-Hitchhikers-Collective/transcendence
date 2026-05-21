import { Card } from "./Card.ts"
import { Table } from "./Table.ts"
import { Player } from "./Player.ts"

export class RuleEngine {
  
  validateMove(table: Table, playerId: string, card: Card): boolean {
    if (!this.isPlayerTurn(table, playerId)) return false;
    if (!this.isCardPlayable(table, card)) return false;
    return true;
  }

  private isPlayerTurn(table: Table, playerId: string): boolean {
    return table.players[table.turnIndex].id === playerId;
  }

  private isCardPlayable(table: Table, card: Card): boolean {
    const top = table.discardPile.at(-1);
    console.log("Top Card: ", top?.color, " Player: ", card.color);
    if (!top)
      return true;

    return (
      card.color === table.currentColor ||
      card.value === top?.value ||
      card.color === "wild"
    )
  }
}

export class CardEffectResolver {
  applyEffect(table: Table, card: Card): void {
    switch (card.value) {
      case "reverse":
        this.reverse(table);
        break;
      case "skip":
        this.skip(table);
        break;
      case "2plus":
        table.pendingDraw += 2;
        break;
      case "4plus":
        table.pendingDraw += 4;
        break;
    }
    //if (card.color == "wild")
      // BROADCAST COLOR
  }

  private reverse(table: Table): void {
    table.direction *= -1;
  }

  private skip(table: Table): void {
    table.turnIndex =
      (table.turnIndex + table.direction + table.players.length) %
      table.players.length;
  }

  private drawCards(table: Table, amount: number): void {
    const next = this.getNextPlayer(table);

    for (let i = 0; i < amount; i++) {
      let card = table.drawPile.pop();

      if (!card) {
        table.shuffleDiscardPile();
        card = table.drawPile.pop();
      }
      if (card) {
        next.hand.push(card);
      }
    }
  }

  private getNextPlayer(table: Table): Player {
    const next = (table.turnIndex + table.direction + table.players.length) %
      table.players.length;
    console.log("getNextPlayer: ", next);
    const player = table.players[next];
    console.log("getNextPlayer ID: ", player.id);
    return player;
  }
}

export class TurnManager {
  advanceTurn(table: Table): void {
    table.turnIndex =
      (table.turnIndex + table.direction + table.players.length) %
      table.players.length;
    console.log("Current Turn Index: ", table.turnIndex);
  }

  getCurrentPlayer(table: Table): Player {
    return table.players[table.turnIndex];
  }
}

export class WinConditionchecker {
  lastCard(table: Table, player: Player): boolean {
    return player.hand.length === 1;
  }
}
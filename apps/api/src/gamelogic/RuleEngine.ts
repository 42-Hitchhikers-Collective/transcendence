import { Card } from "./Card.ts"
import { Table } from "./Table.ts"

export class RuleEngine {
  validateMove(table: Table, playerId: string, card: Card): boolean {
    if (!this.isPlayerTurn(table, playerId)) return false;
    if (!this.isCardPlayable(table, card)) return false;
    return true;
  }

  private isPlayerTurn(table: Table, playerId: string): boolean {
    console.log("Current Player: ", table.players[table.turnIndex], " Player: ", playerId);
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
  applyEffect(table: Table, card: Card) {
    switch (card.value) {
      case "reverse":
        this.reverse(table);
        break;
      case "skip":
        this.skip(table);
        break;
      case "2plus":
        table.plus += 2;
        break;
      case "4plus":
        table.plus += 4;
        break;
    }
  }

  private reverse(table: Table) {
    table.direction *= -1;
  }

  private skip(table: Table) {
    table.turnIndex += table.direction;
  }

  private drawCards(table: Table, amount: number) {
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

  private getNextPlayer(table: Table) {
    const next = (table.turnIndex + table.direction + table.n_player) % table.n_player;
    console.log("getNextPlayer: ", next);
    const player = table.players[next];
    console.log("getNextPlayer ID: ", player.id);
    return player;
} 

}

export class TurnManager {
  advanceTurn(table: Table) {
    table.turnIndex =
      (table.turnIndex + table.direction + table.players.length) %
      table.players.length;
    console.log("Current Turn Index: ", table.turnIndex);
  }

  getCurrentPlayer(table: Table) {
    return table.players[table.turnIndex];
  }
}
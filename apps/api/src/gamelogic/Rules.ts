import { Table } from "./Table.ts";
import { Card } from "./Card.ts";
import { Player } from "./Player.ts"

export class Rules {

  playCard(table: Table, playerId: string, card: Card): boolean {
    const player = table.players.find((p) => p.id === playerId);
    if (!player) return false;

    const index = player.hand.findIndex((c) => c.id === card.id);

    if (index === -1) {
      console.warn("Card not found in hand", card);
      return false;
    }

    const [playedCard] = player.hand.splice(index, 1);

    table.discardPile.push(playedCard);
    table.currentColor = playedCard.color;
    return true;
  }

  advance(table: Table): void {
    this.advanceTurn(table);
  }


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
  }

  private reverse(table: Table): void {
    table.direction *= -1;
  }

  private skip(table: Table): void {
    table.turnIndex =
      (table.turnIndex + table.direction + table.players.length) %
      table.players.length;
  }

  drawCards(table: Table, amount: number): void {
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
    const player = table.players[next];
    return player;
  }

  advanceTurn(table: Table): void {
    table.turnIndex =
      (table.turnIndex + table.direction + table.players.length) %
      table.players.length;
  }

  getCurrentPlayer(table: Table): Player {
    return table.players[table.turnIndex];
  }

  uno(player: Player): boolean {
    return player.hand.length === 1;
  }

  noCard(player: Player): boolean {
    return player.hand.length === 0;
  }
}

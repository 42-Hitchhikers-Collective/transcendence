import { Card } from "./Card.ts";
import { Table } from "./Table.ts";
import { Player } from "./Player.ts";
import { msgResult } from "../gameManager/types.ts";
import { randomInt } from "node:crypto";

export class GameMaster {
  playCard(table: Table, playerId: string, card: Card): msgResult {
    let player = table.players.find((p) => p.id === playerId);
    if (!player) {
      return {
        success: false,
        error: "Player not found",
      };
    }

    let res = this.validateMove(table, playerId, card);
    if (!res.success) {
      console.log(`Error: ${res.error}`);
      return res;
    }

    const index = player.hand.findIndex((c) => c.id === card.id);
    if (index === -1) {
      return { success: false, error: "Card not found" };
    }

    const [playedCard] = player.hand.splice(index, 1);

    table.discardPile.push(playedCard);

    this.eventUpdate(table, player);
    this.applyEffect(table, playedCard);

    table.draw = 0;
    table.playerPlayed = true;

    return { success: true, msg: "" };
  }

  drawCard(table: Table, playerId: string): boolean {
    if (table.playerPlayed) return false;

    const player = table.players.find((p) => p.id === playerId);
    if (!this.isPlayerTurn(table, playerId)) return false;

    if (table.pendingDraw == 0 && table.draw == 0) return false;

    if (table.playerPlayed)
      return false;

    let amount = table.pendingDraw;
    if (amount == 0) amount = table.draw;

    for (let i = 0; i < amount; i++) {
      let card = table.drawPile.pop();

      if (!card) {
        this.reuseDiscardPile(table);
        card = table.drawPile.pop();
      }
      if (card) {
        player.hand.push(card);
      }
    }
    table.pendingDraw = 0;
    table.draw = 0;
    return true;
  }

  // ============================================================

  public applyEffect(table: Table, card: Card): void {
    if (card.color == "wild") table.color = true;
    else table.currentColor = card.color;

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
    table.skip = true;
  }

  // ============================================================

  private validateMove(table: Table, playerId: string, card: Card): msgResult {
    if (table.playerPlayed)
      return { success: false, error: "You just played a card" };
    
    if (!this.isPlayerTurn(table, playerId)) {
      console.log("validateMove: false, not your turn");
      return { success: false, error: "Is not your turn" };
    }
    if (!this.pendingCards(table, card))
      return { success: false, error: "Draw cards first" };
    if (!this.isCardPlayable(table, card))
      return { success: false, error: "Card not playable" };


    return { success: true, msg: "" };
  }

  private isPlayerTurn(table: Table, playerId: string): boolean {
    return table.players[table.turnIndex].id === playerId;
  }

  private isCardPlayable(table: Table, card: Card): boolean {
    const top = table.discardPile.at(-1);
    if (!top) return true;

    return (
      card.color === table.currentColor ||
      card.value === top?.value ||
      card.color === "wild"
    );
  }

  private pendingCards(table: Table, card: Card): boolean {
    if (table.pendingDraw == 0) return true;
    if (
      table.pendingDraw != 0 &&
      (card.value == "4plus" || card.value == "2plus")
    )
      return true;

    return false;
  }

  // ============================================================
  // HELPERS & GETTERS
  // ============================================================

  advanceTurn(table: Table, playerId: string): boolean {
    const player = table.players.find((p) => p.id === playerId);

    if (!player || table.draw != 0) return false;

    if (table.color == true) return false;

    let skip = 0;
    if (table.skip) skip = 1 * table.direction;

    table.turnIndex =
      (table.turnIndex + table.direction + skip + table.players.length) %
      table.players.length;

    this.newTurnStats(table);
    return true;
  }

  /*
   * Reset the conditon for a new player
   * */
  private newTurnStats(table: Table) {
    table.draw = 1;
    table.color = false;
    table.skip = false;
    table.uno = false;
    table.playerPlayed = false;
  }

  getCurrentPlayer(table: Table): Player {
    return table.players[table.turnIndex];
  }

  private eventUpdate(table: Table, player: Player) {
    if (player.hand.length === 1) table.uno = true;
    else if (player.hand.length === 0) table.finish = true;
  }

  /* *
   * When there are no more cards in the draw pile,
   * it keeps the last one from discard pile,
   * shuffle the rest and use them as draw pile.
   * */
  private reuseDiscardPile(table: Table) {
    if (table.discardPile.length <= 1) return;

    const topCard = table.discardPile.pop();

    while (table.discardPile.length > 0) {
      const card = table.discardPile.pop();
      if (card) table.drawPile.push(card);
    }

    this.shuffle(table.drawPile);

    if (topCard) table.discardPile.push(topCard);
  }

  shuffle = <T>(array: T[]): void => {
    array.sort(() => Math.random() - 0.5);
  };

  public playerLeftGame(playerId: string, table: Table): boolean {
    const player = table.players.find((p) => p.id === playerId);
    if (!player) {
      return false;
    }

    this.returnCards(playerId, table);

    this.removePlayer(table.players, player, table);

    return true;
  }

  private removePlayer(players: Player[], player: Player, table: Table) {
    const index = players.indexOf(player);
    const CurrentTurn = this.getCurrentPlayer(table);

    if (index !== -1) {
      players.splice(index, 1);
    }

    if (CurrentTurn == player) {
      this.forcePassTurn(table);
      if (table.color) {
        const colors = ["red", "yellow", "blue", "green"] as const;
        table.currentColor = colors[Math.floor(Math.random() * colors.length)];
      }
      this.newTurnStats(table);
    } else {
      table.turnIndex = players.indexOf(CurrentTurn);
    }
  }

  private returnCards(playerId: string, table: Table) {
    const cards = table.getHand(playerId) || [];

    for (const card of cards) {
      table.drawPile.push(card);
    }

    // table.setHand(playerId, []); // set to null?

    this.shuffle(table.drawPile);
  }

  private forcePassTurn(table: Table) {
    table.turnIndex =
      (table.turnIndex + table.direction + table.players.length) %
      table.players.length;
  }
}

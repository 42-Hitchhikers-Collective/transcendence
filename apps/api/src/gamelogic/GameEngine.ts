import { CardEffectResolver, RuleEngine, TurnManager } from "./RuleEngine";
import { Table } from "./Table";
import { Card } from "./Card.ts";

export class GameEngine {
  private rules: RuleEngine;
  private effects: CardEffectResolver;
  private turns: TurnManager;
  //private wincheck: WinConditionchecker

  constructor() {
    this.rules = new RuleEngine();
    this.effects = new CardEffectResolver();
    this.turns = new TurnManager();
    //this.wincheck = new WinConditionchecker()
  }

  processMove(table: Table, playerId: string, card: Card) {
    console.log("Player ProcessMove: ", playerId);
    if (!this.rules.validateMove(table, playerId, card)) {
      console.log("Invalid move ");
      return false;
    }
    console.log("Valid move ");
    this.playCard(table, playerId, card);
    this.effects.applyEffect(table, card);
    this.turns.advanceTurn(table);

    return true;
  }

  private playCard(Table: Table, playerId: string, card: Card) {
    const player = Table.players.find((p) => p.id === playerId);
    if (!player) return;

    const index = player.hand.findIndex((c) => c.id === card.id);

    if (index === -1) {
      console.warn("Card not found in hand", card);
      return;
    }

    const [playedCard] = player.hand.splice(index, 1);

    Table.discardPile.push(playedCard);
    Table.currentColor = playedCard.color;
  }
}

import { CardEffectResolver, RuleEngine, TurnManager } from "./RuleEngine"
import { Room } from "./Room"
import { Card } from "./Card"


export class GameEngine {
    private rules: RuleEngine
    private effects: CardEffectResolver
    private turns: TurnManager
    //private wincheck: WinConditionchecker

    constructor() {
        this.rules = new RuleEngine()
        this.effects = new CardEffectResolver()
        this.turns = new TurnManager()
        //this.wincheck = new WinConditionchecker()
    }

    processMove(room: Room, playerId: string, card: Card) {
    if (!this.rules.validateMove(room, playerId, card)) {
      console.log("Invalid move ", playerId);
      return false;
    }

    this.playCard(room, playerId, card);
    this.effects.applyEffect(room, card);
    this.turns.advanceTurn(room);

    return true;
  }

    private playCard(room: Room, playerId: string, card: Card) {
        const player = room.players.find(p => p.id === playerId);
        if (!player) return;

        const index = player.hand.findIndex(
          c => c.color === card.color && c.value === card.value
        );
    
        if (index !== -1) {
          const [playedCard] = player.hand.splice(index, 1);
          room.discardPile.push(playedCard);
          room.currentColor = playedCard.color;
        }
    }
}
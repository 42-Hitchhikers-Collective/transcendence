import { Card } from "./Card.ts"
import { Table } from "./Table.ts"
import { Player } from "./Player.ts"

export class GameMaster {

	playCard(table: Table, playerId: string, card: Card): boolean {
		const player = table.players.find((p) => p.id === playerId);
		if (!player) return false;

		if (!this.validateMove(table, playerId, card)) {
			console.log("ERROR: validateMove");
			return false;
		}

		const index = player.hand.findIndex((c) => c.id === card.id);
		if (index === -1) {
			console.warn("Card not found in hand", card);
			return false;
		}

		const [playedCard] = player.hand.splice(index, 1);

		table.discardPile.push(playedCard);
		if (playedCard.color != "wild")
			table.currentColor = playedCard.color;

		this.applyEffect(table, playedCard);

		if (this.uno(player))
			table.event = "uno";

		if (this.noCard(player))
			table.event = "finished";
		table.draw = 0;
		return true;
	}

	drawCard(table: Table, playerId: string): boolean {
		const player = table.players.find((p) => p.id === playerId);
		if (!this.isPlayerTurn(table, playerId) || !player) return false;

		let amount = table.pendingDraw;
		if (amount == 0)
			amount = table.draw;

		if (table.pendingDraw == 0 || table.draw == 0)
			return false;

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

	private applyEffect(table: Table, card: Card): void {
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
		if (card.color == "wild")
			table.event = "color";
	}

	private reverse(table: Table): void {
		table.direction *= -1;
	}

	private skip(table: Table): void {
		table.turnIndex =
			(table.turnIndex + table.direction + table.players.length) %
			table.players.length;
	}

	// ============================================================

	private validateMove(table: Table, playerId: string, card: Card): boolean {
		if (!this.isPlayerTurn(table, playerId)) return false;
		if (!this.isCardPlayable(table, card)) return false;
		if (!this.pendingCards(table, card)) return false;
		return true;
	}

	private isPlayerTurn(table: Table, playerId: string): boolean {
		return table.players[table.turnIndex].id === playerId;
	}

	private isCardPlayable(table: Table, card: Card): boolean {
		const top = table.discardPile.at(-1);
		if (!top)
			return true;

		return (
			card.color === table.currentColor ||
			card.value === top?.value ||
			card.color === "wild"
		)
	}

	private pendingCards(table: Table, card: Card): boolean {
		if (table.pendingDraw == 0)
			return true;
		if (table.pendingDraw != 0 && (card.value == "4plus" || card.value == "2plus"))
			return true;

		return false;
	}

	// ============================================================
	// HELPERS & GETTERS
	// ============================================================

	advanceTurn(table: Table, playerId: string): boolean {
		const player = table.players.find((p) => p.id === playerId);
		if (!player || table.draw == 0) return false;

		table.turnIndex =
			(table.turnIndex + table.direction + table.players.length) %
			table.players.length;

		this.newTurnStats(table)
		return true;
	}

	/**
	* Reset the conditon for a new player
	*/
	newTurnStats(table: Table)
	{
		table.draw = 1;
		table.passTurn = false;
		table.event = null;
	}

	getCurrentPlayer(table: Table): Player {
		return table.players[table.turnIndex];
	}

	private uno(player: Player): boolean {
		return player.hand.length === 1;
	}

	private noCard(player: Player): boolean {
		return player.hand.length === 0;
	}


	/**
	* When there are no more cards in the draw pile,
	* it keeps the last one from discard pile,
	* shuffle the rest and use them as draw pile.
	*/
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
	}
}
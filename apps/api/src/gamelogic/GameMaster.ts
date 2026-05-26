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
		//if (this.uno(table, player))
		// emit("uno")
		//if (this.noCard(player))
		// emit("win")
		return true;
	}

	validateMove(table: Table, playerId: string, card: Card): boolean {
		if (!this.isPlayerTurn(table, playerId)) return false;
		if (!this.isCardPlayable(table, card)) return false;
		if (!this.pendingCards(table, card)) return false;
		return true;
	}
	pendingCards(table: Table, card: Card): boolean {
		if (table.pendingDraw == 0)
			return true;
		if (table.pendingDraw != 0 && (card.value == "4plus" || card.value == "2plus"))
			return true;

		return false;
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

	advance(table: Table): void {
		this.advanceTurn(table);
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
		//if (card.color == "wild")
		// SEND SIGNAL TO FRONTEND TO SELECT COLOR
		// emit(wild_card)
	}

	private reverse(table: Table): void {
		table.direction *= -1;
	}

	private skip(table: Table): void {
		table.turnIndex =
			(table.turnIndex + table.direction + table.players.length) %
			table.players.length;
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
				table.reuseDiscardPile();
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

	advanceTurn(table: Table): void {
		table.turnIndex =
			(table.turnIndex + table.direction + table.players.length) %
			table.players.length;

		table.draw = 1;
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
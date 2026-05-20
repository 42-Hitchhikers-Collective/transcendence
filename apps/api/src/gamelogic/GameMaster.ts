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
		table.currentColor = playedCard.color;
		//if (this.uno(table, player))
			// emitir signal;
		//if (this.noCard(player))
			// winning signal
		return true;
	}

	validateMove(table: Table, playerId: string, card: Card): boolean {
		if (!this.isPlayerTurn(table, playerId)) return false;
		if (!this.isCardPlayable(table, card)) return false;
		if ()
		return true;
	}
	pendingCards(tabe: Table, card: Card) : boolean
	{
		if (card ==)
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
		// SEND SIGNAL TO FRONTEND
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

	private advanceTurn(table: Table): void {
		table.turnIndex =
			(table.turnIndex + table.direction + table.players.length) %
			table.players.length;
		console.log("Current Turn Index: ", table.turnIndex);
	}

	getCurrentPlayer(table: Table): Player {
		return table.players[table.turnIndex];
	}

	uno(table: Table,player: Player): boolean {
		if (table.pendingDraw == 0)
			return player.hand.length === 1;
	}

	noCard(player: Player): boolean {
		return player.hand.length === 0;
	}
}
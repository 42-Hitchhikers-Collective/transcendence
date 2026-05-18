TO DO



2. Wild Color Selection (gameEvents.ts)
The selectWildColor method currently bypasses the formal structure relying on any: (room.game as any).table.currentColor = color.
Action: You need to coordinate with Gabriel to formally add selectWildColor(playerId: string, color: string) to the GameInstance interface in types.ts so you don't directly mutate his engine's state and bypass the authoritative server contract.



3. Game End & Win Condition Detection
Currently, when a user plays a card or draws, there is no logic to check if they won the game, and the room state never transitions to "finished".
Action: Agree with Gabriel on a mechanism for knowing the game is over. Should playCard() return a result indicating a winner ({ winnerId: '...' }), or will you call something like room.game.getWinner()? Then, update gameEvents.ts to cleanly broadcast the win and transition room.state = 'finished'.


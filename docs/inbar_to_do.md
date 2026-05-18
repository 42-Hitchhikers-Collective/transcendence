TO DO

Action: Based on our previous memory, Gabriel requires a Map<string, string> mapping playerId -> username. You will need to construct this from room.players before instantiating his engine so he knows the participants and count.


2. Wild Color Selection (gameEvents.ts)
The selectWildColor method currently bypasses the formal structure relying on any: (room.game as any).table.currentColor = color.
Action: You need to coordinate with Gabriel to formally add selectWildColor(playerId: string, color: string) to the GameInstance interface in types.ts so you don't directly mutate his engine's state and bypass the authoritative server contract.



3. Game End & Win Condition Detection
Currently, when a user plays a card or draws, there is no logic to check if they won the game, and the room state never transitions to "finished".
Action: Agree with Gabriel on a mechanism for knowing the game is over. Should playCard() return a result indicating a winner ({ winnerId: '...' }), or will you call something like room.game.getWinner()? Then, update gameEvents.ts to cleanly broadcast the win and transition room.state = 'finished'.



4. Name alignment for contracts
Your implementation uses getFrontendRoom() / FrontendRoom, while some documentation may refer to SanitizedRoom.
Action: Make sure Gabriel knows the data shape he shouldn't expect SanitizedRoom if you're serving him FrontendRoom structures. The naming doesn't matter as long as the types match up on his Phaser components!


Confirm the dataToFrontend.ts structures match what his UI is expecting (cards array for local player, card counts only for opponents).
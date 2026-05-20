TO DO


Check dissconnection logic





2. select wild color - another function is needed


3. Game End & Win Condition Detection
Currently, when a user plays a card or draws, there is no logic to check if they won the game, and the room state never transitions to "finished".
Action: Agree with Gabriel on a mechanism for knowing the game is over. Should playCard() return a result indicating a winner ({ winnerId: '...' }), or will you call something like room.game.getWinner()? Then, update gameEvents.ts to cleanly broadcast the win and transition room.state = 'finished'.




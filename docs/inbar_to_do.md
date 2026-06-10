TO DO


- Check dissconnection logic



- Game End & Win Condition Detection
Currently, when a user plays a card or draws, there is no logic to check if they won the game, and the room state never transitions to "finished".
Action: Agree with Gabriel on a mechanism for knowing the game is over. Should playCard() return a result indicating a winner ({ winnerId: '...' }), or will you call something like room.game.getWinner()? Then, update gameEvents.ts to cleanly broadcast the win and transition room.state = 'finished'.


check logs:
docker compose logs -f api | cat -n


send db finish game details
which details?



when a player is in a room, then leaves the website, the drop timer will start and -- ? 
check if player returns to room in time / doesnt


player in room
leaves web
returns to web
---> counter ends in 0, player would be removed from room but UI stays on drop msg


player in room
leaves web
stays out of web
---> timer expires and user kicks out of room - good
*but doesnt clear from online players - not good



DONE

polish frontend data "user request"~

edge case - player cant create or join a room if already in a room



- create room - no leave and no join
- join room: if already in the same room return false


- listen to "user_drop" - waiting for the user to come back to the room page
- a function for a timeout of 30s. when its 0 emit "leave_room"
- cancel drop timer on socket.join room


- socket on "room_state" / "player_state"  
room_state:


- send "game_state" to gabriel which will contain only the game state of players


- start game emit about if game started or not





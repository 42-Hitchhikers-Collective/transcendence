// Called when a game starts. Creates a RUNNING Game record and returns its id.
// Store the returned id on room.gameDbId so it can be passed to finalizeGame/abortGame later.
export async function createGameRecord(prisma: any, roomName?: string, lobbyId?: string): Promise<string> {
  const game = await prisma.game.create({
    data: {
      status: "RUNNING",
      roomName: roomName ?? null,
      lobbyId: lobbyId ?? null,
    },
    select: { id: true },
  });
  return game.id;
}

// Called when a game ends normally (a player empties their hand).
// Pass the winnerId and the full playerIds list — placement is assigned here.
// Marks the game FINISHED and writes one GamePlayer row per participant.
export async function finalizeGame(
  prisma: any,
  gameId: string,
  winnerId: string,
  playerIds: string[]
): Promise<void> {
  await prisma.game.update({
    where: { id: gameId },
    data: { status: "FINISHED", endedAt: new Date() },
  });

  await prisma.gamePlayer.createMany({
    data: playerIds.map((userId) => ({
      gameId,
      userId,
      placement: userId === winnerId ? 1 : 2,
    })),
    skipDuplicates: true,
  });
}

// Called when a game is interrupted (player disconnects, room closes mid-game).
// Marks the game ABORTED so it is excluded from stats and leaderboard.
export async function abortGame(prisma: any, gameId: string): Promise<void> {
  await prisma.game.update({
    where: { id: gameId },
    data: { status: "ABORTED", endedAt: new Date() },
  });
}

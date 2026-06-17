export async function friendRoutes(app: any) {
    // Send a friend request
    app.post("/requests", { preHandler: [app.auth] }, async (request: any, reply: any) => {
        const payload = request.user as { sub?: string };
        if (!payload.sub) return reply.code(401).send({ error: "unauthorized" });

        const { targetId } = request.body as { targetId: string };

        if (targetId === payload.sub)
            return reply.code(400).send({ error: "cannot add yourself" });

        const existing = await app.prisma.friendRequest.findFirst({
            where: { fromUserId: payload.sub, toUserId: targetId },
        });
        if (existing) return reply.code(409).send({ error: "request already sent" });

        const req = await app.prisma.friendRequest.create({
            data: { fromUserId: payload.sub, toUserId: targetId },
        });

        return reply.code(201).send({ request: req });
    });

    // Get incoming friend requests
    app.get("/requests", { preHandler: [app.auth] }, async (request: any, reply: any) => {
        const payload = request.user as { sub?: string };
        if (!payload.sub) return reply.code(401).send({ error: "unauthorized" });

        const requests = await app.prisma.friendRequest.findMany({
            where: { toUserId: payload.sub },
            include: {
                fromUser: {
                    select: {
                        id: true,
                        profile: { select: { username: true, avatarUrl: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return { requests };
    });

    // Accept a friend request
    app.patch("/requests/:id/accept", { preHandler: [app.auth] }, async (request: any, reply: any) => {
        const payload = request.user as { sub?: string };
        if (!payload.sub) return reply.code(401).send({ error: "unauthorized" });

        const { id } = request.params as { id: string };

        const friendRequest = await app.prisma.friendRequest.findUnique({ where: { id } });
        if (!friendRequest) return reply.code(404).send({ error: "request not found" });
        if (friendRequest.toUserId !== payload.sub) return reply.code(403).send({ error: "forbidden" });

        const [userAId, userBId] = [friendRequest.fromUserId, friendRequest.toUserId].sort();

        await app.prisma.$transaction([
            app.prisma.friendship.create({ data: { userAId, userBId } }),
            app.prisma.friendRequest.delete({ where: { id } }),
        ]);

        return { ok: true };
    });

    // Decline a friend request
    app.patch("/requests/:id/decline", { preHandler: [app.auth] }, async (request: any, reply: any) => {
        const payload = request.user as { sub?: string };
        if (!payload.sub) return reply.code(401).send({ error: "unauthorized" });

        const { id } = request.params as { id: string };

        const friendRequest = await app.prisma.friendRequest.findUnique({ where: { id } });
        if (!friendRequest) return reply.code(404).send({ error: "request not found" });
        if (friendRequest.toUserId !== payload.sub) return reply.code(403).send({ error: "forbidden" });

        await app.prisma.friendRequest.delete({ where: { id } });

        return { ok: true };
    });

    // Get friends list
    app.get("/", { preHandler: [app.auth] }, async (request: any, reply: any) => {
        const payload = request.user as { sub?: string };
        if (!payload.sub) return reply.code(401).send({ error: "unauthorized" });

        const friendships = await app.prisma.friendship.findMany({
            where: {
                OR: [{ userAId: payload.sub }, { userBId: payload.sub }],
            },
            include: {
                userA: { select: { id: true, profile: { select: { username: true, avatarUrl: true } } } },
                userB: { select: { id: true, profile: { select: { username: true, avatarUrl: true } } } },
            },
        });

        const friends = friendships.map((f: any) => {
            const friend = f.userAId === payload.sub ? f.userB : f.userA;
            return {
                id: friend.id,
                username: friend.profile?.username ?? "Player",
                avatarUrl: friend.profile?.avatarUrl ?? null,
                isOnline: false, // TODO: replace with onlineUsers.has(friend.id) once ilazar adds src/socket/presence.ts
                since: f.createdAt,
            };
        });

        return { friends };
    });

    // Remove a friend
    app.delete("/:friendId", { preHandler: [app.auth] }, async (request: any, reply: any) => {
        const payload = request.user as { sub?: string };
        if (!payload.sub) return reply.code(401).send({ error: "unauthorized" });

        const { friendId } = request.params as { friendId: string };
        const [userAId, userBId] = [payload.sub, friendId].sort();

        const friendship = await app.prisma.friendship.findUnique({
            where: { userAId_userBId: { userAId, userBId } },
        });
        if (!friendship) return reply.code(404).send({ error: "friendship not found" });

        await app.prisma.friendship.delete({
            where: { userAId_userBId: { userAId, userBId } },
        });

        return { ok: true };
    });
}

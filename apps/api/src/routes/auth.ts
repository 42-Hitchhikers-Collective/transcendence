import { setRefreshCookie, clearRefreshCookie, getRefreshCookie } from "../auth/cookies";
import * as AuthService from "../services/auth.service";

export async function authRoutes(app: any) {
  app.post(
    "/register",
    {
      // Keep register simple for now: no RL here (avoids test flakiness).
      // If you want RL later, add:
      // config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        body: {
          type: "object",
          required: ["email", "password", "displayName"],
          additionalProperties: false,
          properties: {
            email: { type: "string", minLength: 3 },
            password: { type: "string", minLength: 6 },
            displayName: { type: "string", minLength: 1 },
          },
        },
      },
    },
    async (request: any, reply: any) => {
      const body = request.body as { email: string; password: string; displayName: string };

      const result = await AuthService.registerUser(app, body);
      if (!result.ok) return reply.code(409).send({ error: "email already in use" });

      return reply.code(201).send({ user: result.user });
    }
  );

  app.post(
    "/login",
    {
      config: {
        // High enough so Phase 1 never trips it, but still protects against abuse.
        rateLimit: {
          max: 50,
          timeWindow: "1 minute",
        },
      },
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          additionalProperties: false,
          properties: {
            email: { type: "string", minLength: 3 },
            password: { type: "string", minLength: 6 },
          },
        },
      },
    },
    async (request: any, reply: any) => {
      const body = request.body as { email: string; password: string };

      const result = await AuthService.loginUser(app, body);
      if (!result.ok) return reply.code(401).send({ error: "invalid credentials" });

      const token = await reply.jwtSign({ sub: result.userId }, { expiresIn: "15m" });
      setRefreshCookie(reply, result.refreshRaw);
      return reply.send({ token });
    }
  );

  app.post(
    "/refresh",
    {
      config: {
        // Optional: protect refresh from hammering
        rateLimit: {
          max: 60,
          timeWindow: "1 minute",
        },
      },
    },
    async (request: any, reply: any) => {
      const raw = getRefreshCookie(request);
      if (!raw) return reply.code(401).send({ error: "missing_refresh_token" });

      const result = await AuthService.rotateRefreshToken(app, raw);
      if (!result.ok) {
        clearRefreshCookie(reply);
        return reply.code(401).send({ error: "invalid_refresh_token" });
      }

      const token = await reply.jwtSign({ sub: result.userId }, { expiresIn: "15m" });
      setRefreshCookie(reply, result.refreshRaw);
      return reply.send({ token });
    }
  );

  app.post(
    "/logout",
    {
      config: {
        rateLimit: {
          max: 60,
          timeWindow: "1 minute",
        },
      },
    },
    async (request: any, reply: any) => {
      const raw = getRefreshCookie(request);
      await AuthService.logoutRefreshToken(app, raw);
      clearRefreshCookie(reply);
      return reply.send({ ok: true });
    }
  );

  app.post(
    "/logout-all",
    {
      preHandler: [app.auth],
      config: {
        rateLimit: {
          max: 20,
          timeWindow: "1 minute",
        },
      },
    },
    async (request: any, reply: any) => {
      const payload = request.user as { sub?: string };
      if (!payload.sub) return reply.code(401).send({ error: "unauthorized" });

      await AuthService.logoutAllRefreshTokens(app, payload.sub);
      clearRefreshCookie(reply);
      return reply.send({ ok: true });
    }
  );
}
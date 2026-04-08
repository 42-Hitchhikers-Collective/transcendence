import { setRefreshCookie, clearRefreshCookie, getRefreshCookie } from "../auth/cookies";
import * as AuthService from "../services/auth.service";

export async function authRoutes(app: any) {
  app.post(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password", "userName"],
          additionalProperties: false,
          properties: {
            email: {
              type: "string",
              minLength: 6,
              pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
            },
            password: { type: "string", minLength: 6 },
            userName: { type: "string", minLength: 1 },
          },
        },
      },
    },
    async (request: any, reply: any) => {
      const body = request.body as { email: string; password: string; userName: string };

      try {
        const result = await AuthService.registerUser(app, body);
        if (!result.ok) {
          if (result.error === "email_in_use")    return reply.code(409).send({ error: "email already in use" });
          if (result.error === "username_in_use") return reply.code(409).send({ error: "username already in use" });
          return reply.code(500).send({ error: "registration failed" });
        }
        return reply.code(201).send({ user: result.user });
      } catch (err) {
        app.log.error(err);
        return reply.code(500).send({ error: "internal server error" });
      }
    }
  );

  app.post(
    "/login",
    {
      config: {
        rateLimit: { max: 10, timeWindow: "1 minute" },
      },
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          additionalProperties: false,
          properties: {
            email: {
              type: "string",
              minLength: 6,
              pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
            },
            password: { type: "string", minLength: 6 },
          },
        },
      },
    },
    async (request: any, reply: any) => {
      const body = request.body as { email: string; password: string };

      const result = await AuthService.loginUser(app, body);
      if (!result.ok) return reply.code(401).send({ error: "invalid credentials" });

      const token = await reply.jwtSign(
        { sub: result.userId },
        { expiresIn: "15m" }
      );

      setRefreshCookie(reply, result.refreshRaw);
      return reply.send({ token });
    }
  );

  app.post(
    "/logout",
    {
      config: {
        rateLimit: { max: 10, timeWindow: "1 minute" },
      },
    },
    async (request: any, reply: any) => {
      const raw = getRefreshCookie(request);
      await AuthService.logoutRefreshToken(app, raw);
      clearRefreshCookie(reply);
      return reply.send({ ok: true });
    }
  );
}

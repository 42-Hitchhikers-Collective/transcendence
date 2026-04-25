import * as AuthService from "../services/auth.service";

export async function authRoutes(app: any) {
  app.post(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password", "username"],
          additionalProperties: false,
          properties: {
            email: {
              type: "string",
              minLength: 6,
              pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
            },
            password: { type: "string", minLength: 8, pattern: "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).+$" },
            username: { type: "string", minLength: 1 },
          },
        },
      },
    },
    async (request: any, reply: any) => {
      const body = request.body as { email: string; password: string; username: string };

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

      const token = await reply.jwtSign({ sub: result.userId });
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
    async (_request: any, reply: any) => {
      return reply.send({ ok: true });
    }
  );
}

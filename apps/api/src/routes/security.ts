import * as Security from "../services/security.service";

function exposeDevTokens(): boolean {
  // return (process.env.EXPOSE_DEV_TOKENS || "true") === "true";
  return (process.env.EXPOSE_DEV_TOKENS || "false") === "true";
}

export async function securityRoutes(app: any) {
  // Email verification request (authenticated)
  app.post(
    "/email/verify/request",
    {
      preHandler: [app.auth],
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
    },
    async (request: any, reply: any) => {
      const payload = request.user as { sub?: string };
      if (!payload.sub) return reply.code(401).send({ error: "unauthorized" });

      const { raw } = await Security.createEmailVerifyToken(app, payload.sub);

      if (exposeDevTokens()) return reply.send({ ok: true, token: raw });
      return reply.send({ ok: true });
    }
  );

  // Email verification confirm (public)
  app.post(
    "/email/verify/confirm",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      schema: {
        body: {
          type: "object",
          required: ["token"],
          additionalProperties: false,
          properties: {
            token: { type: "string", minLength: 10 },
          },
        },
      },
    },
    async (request: any, reply: any) => {
      const body = request.body as { token: string };

      const r = await Security.confirmEmailVerifyToken(app, body.token);
      if (!r.ok) return reply.code(400).send({ error: "invalid_or_expired_token" });

      return reply.send({ ok: true });
    }
  );

  // Password reset request (public; returns ok always)
  app.post(
    "/password-reset/request",
    {
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
      schema: {
        body: {
          type: "object",
          required: ["email"],
          additionalProperties: false,
          properties: {
            email: { type: "string", minLength: 3 },
          },
        },
      },
    },
    async (request: any, reply: any) => {
      const body = request.body as { email: string };

      const r = await Security.createPasswordResetToken(app, body.email);

      // prevent user enumeration: always ok
      if (exposeDevTokens() && r.raw) return reply.send({ ok: true, token: r.raw });
      return reply.send({ ok: true });
    }
  );

  // Password reset confirm (public)
  app.post(
    "/password-reset/confirm",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      schema: {
        body: {
          type: "object",
          required: ["token", "newPassword"],
          additionalProperties: false,
          properties: {
            token: { type: "string", minLength: 10 },
            newPassword: { type: "string", minLength: 6 },
          },
        },
      },
    },
    async (request: any, reply: any) => {
      const body = request.body as { token: string; newPassword: string };

      const r = await Security.confirmPasswordReset(app, body.token, body.newPassword);
      if (!r.ok) return reply.code(400).send({ error: "invalid_or_expired_token" });

      return reply.send({ ok: true });
    }
  );
}
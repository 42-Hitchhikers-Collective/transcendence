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
            username: { type: "string", minLength: 1, maxLength: 20, pattern: "^[a-zA-Z0-9_\\-.]+$" }, // only allow alphanumeric, underscore, hyphen, and dot characters in usernames to prevent XSS attacks
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

      const token = await reply.jwtSign({ sub: result.userId }, // liks the userId to the token so that we can identify the user later
           { expiresIn: "7d" } // sets the token to expire in 7 days to match with the cookie expiration time (maxAge) we set in the auth plugin
          );
      reply.setCookie("token", token, {
        httpOnly: true, // means that the cookie will not be accessible via JavaScript, which is what we want for security (prevents XSS attacks)
        secure: true, // cookie will only be sent over HTTPS (prevents XSS attacks)
        sameSite: "strict", // cookie will not be sent in cross-site requests (prevents CSRF)
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // deletest the cookie after 1 week (in seconds) we can change to 1 hour (3600 seconds) or 1 day (86400 seconds) or test with 1 minute (60 seconds) for testing purposes
      });
      return reply.send({ ok: true });
    }
  );

  app.post(
    "/logout",
    async (_request: any, reply: any) => {
      reply.clearCookie("token", { path: "/" }); // sets the token to an empty value to logout
      return reply.send({ ok: true });
    }
  );
}

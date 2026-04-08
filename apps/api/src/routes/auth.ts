import { setRefreshCookie, clearRefreshCookie, getRefreshCookie } from "../auth/cookies";
import * as AuthService from "../services/auth.service";

export async function authRoutes(app: any) {
  app.post(
    "/register",
    {
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
      // JESS: Added try-catch, keeping this for now until merging updated code from /backend-architecture
      try{
        const result = await AuthService.registerUser(app, body);
        if (!result.ok) {
          // 1. Log the actual result to your backend terminal
          console.error("[Register Error] Service failed. Full result:", result);
          
          // 2. Extract the real status code and error message if your service provides it.
          // If not, we leave a generic one for fallback that are used if they are undefined.
          const errorMessage = result.error || "Registration failed for unknown reason";
          const statusCode = result.statusCode || 400; 
          
          // 3. Send the real error message and status code back to the client for better debugging, if undefined the generic ones will be used.
          return reply.code(statusCode).send({ error: errorMessage });
        }
        return reply.code(201).send({ user: result.user });
      }
      catch (err: any) {
       // 4. Catch any fatal crashes inside AuthService that you weren't handling
        console.error("[Register Exception] Unhandled crash:", err.message || err);
        return reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  app.post(
    "/login",
    {
      config: {
        rateLimit: { max: 50, timeWindow: "1 minute" },
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

      const token = await reply.jwtSign(
        { sub: result.userId, roles: result.roles },
        { expiresIn: "15m" }
      );

      setRefreshCookie(reply, result.refreshRaw);
      return reply.send({ token });
    }
  );

  app.post(
    "/refresh",
    {
      config: {
        rateLimit: { max: 60, timeWindow: "1 minute" },
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

      const token = await reply.jwtSign(
        { sub: result.userId, roles: result.roles },
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
        rateLimit: { max: 60, timeWindow: "1 minute" },
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
        rateLimit: { max: 20, timeWindow: "1 minute" },
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
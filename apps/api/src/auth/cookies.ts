const REFRESH_COOKIE = "refresh_token";

export function setRefreshCookie(reply: any, token: string) {
  reply.setCookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearRefreshCookie(reply: any) {
  reply.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
}

export function getRefreshCookie(request: any): string | null {
  const t = request.cookies?.[REFRESH_COOKIE];
  if (!t) return null;
  return t;
}
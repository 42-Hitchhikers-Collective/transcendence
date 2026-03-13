export const SOCKET_EVENTS = {
  HELLO: "hello",
  PING: "ping",
  PONG: "pong",

  PRESENCE_ONLINE: "presence:online",
  PRESENCE_OFFLINE: "presence:offline",

  NOTIFY: "notify",
  NOTIFY_SELF: "notify:self",
} as const;
export type GameHistory = {
  id: string;
  result: "win" | "loss";
  roomName: string;
  opponents: { id: string; username: string; avatar: string }[];
  date: string;
};

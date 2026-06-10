export type FrontendPlayer = {
  id: string;
  userName: string;
  isTheObserver: boolean;
  isReady: boolean;
  cardCount: number;
  cards?: { color: string; value: string }[];
};

export type FrontendRoom = {
  id: string;
  state: "waiting" | "playing" | "finished";
  players: FrontendPlayer[];
  current_turn: string | undefined;
  game?: {
    currentPlayerId: string;
    discardTopCard: { color: string; value: string };
    drawPileCount: number;
  };
};

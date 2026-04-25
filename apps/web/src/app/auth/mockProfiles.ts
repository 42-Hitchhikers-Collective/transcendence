/* 
- This file contains sample user profiles data samples that can be tested on the frontend.
- This is common practice in frontend development and used so frontend developers can focus on building user interfaces without waiting for backend integration.
- The data coming fron mock is only temporary, once the backend is ready, the mock data and related code can be removed.
*/
export interface Opponent {
  id: number;
  username: string;
  avatar: string;
}

export interface GameHistory {
  id: number;
  result: "win" | "loss";
  roomName: string;
  opponents: Opponent[];
  date: string;
}

export interface UserProfile {
  id: number;
  username: string;
  password: string;
  email: string;
  dob: string;
  avatar: string;
  isOnline: boolean;
  stats: {
    wins: number;
    losses: number;
  };
  history: GameHistory[];
}

export const mockProfiles: UserProfile[] = [
  {
    id: 1,
    username: "user01",
    password: "pass01",
    email: "user01@example.com",
    dob: "1995-03-15",
    avatar: "https://i.pravatar.cc/300?img=5",
    stats: { wins: 10, losses: 5 },
    isOnline: true,
    history: [
      {
        id: 1,
        result: "win",
        roomName: "The big shot tournament",
        opponents: [
          { id: 2, username: "user02", avatar: "https://i.pravatar.cc/300?img=8" },
          { id: 3, username: "user03", avatar: "https://i.pravatar.cc/300?img=11" },
        ],
        date: "2026-03-11",
      },
      {
        id: 2,
        result: "loss",
        roomName: "Shy match",
        opponents: [{ id: 7, username: "user07", avatar: "https://i.pravatar.cc/300?img=30" }],
        date: "2026-03-10",
      },
      {
        id: 3,
        result: "win",
        roomName: "Make it triple",
        opponents: [
          { id: 2, username: "user02", avatar: "https://i.pravatar.cc/300?img=12" },
          { id: 3, username: "user03", avatar: "https://i.pravatar.cc/300?img=13" },
        ],
        date: "2026-03-09",
      },
      {
        id: 4,
        result: "win",
        roomName: "one on one",
        opponents: [{ id: 8, username: "user08", avatar: "https://i.pravatar.cc/300?img=8" }],
        date: "2026-03-08",
      },
      {
        id: 5,
        result: "loss",
        roomName: "Hardcore Battle",
        opponents: [
          { id: 6, username: "user06", avatar: "https://i.pravatar.cc/300?img=11" },
          { id: 7, username: "user07", avatar: "https://i.pravatar.cc/300?img=30" },
          { id: 4, username: "user04", avatar: "https://i.pravatar.cc/300?img=14" },
        ],
        date: "2026-03-07",
      },
    ],
  },
  {
    id: 2,
    username: "user02",
    password: "pass02",
    email: "user02@example.com",
    dob: "1998-07-22",
    avatar: "https://i.pravatar.cc/300?img=8",
    isOnline: false,
    stats: { wins: 8, losses: 10 },
    history: [],
  },
  {
    id: 3,
    username: "user03",
    password: "pass03",
    email: "user03@example.com",
    dob: "2000-01-10",
    avatar: "https://i.pravatar.cc/300?img=11",
    isOnline: true,
    stats: { wins: 20, losses: 3 },
    history: [],
  },
  {
    id: 4,
    username: "user04",
    password: "pass04",
    email: "user04@example.com",
    dob: "2000-01-10",
    avatar: "https://i.pravatar.cc/300?img=30",
    isOnline: false,
    stats: { wins: 1, losses: 20 },
    history: [],
  },
  {
    id: 5,
    username: "user05",
    password: "pass05",
    email: "user05@example.com",
    dob: "1997-09-03",
    avatar: "https://i.pravatar.cc/300?img=21",
    isOnline: true,
    stats: { wins: 14, losses: 9 },
    history: [],
  },
  {
    id: 6,
    username: "user06",
    password: "pass06",
    email: "user06@example.com",
    dob: "1996-12-27",
    avatar: "https://i.pravatar.cc/300?img=17",
    isOnline: false,
    stats: { wins: 6, losses: 11 },
    history: [],
  },
  {
    id: 7,
    username: "user07",
    password: "pass07",
    email: "user07@example.com",
    dob: "1999-04-18",
    avatar: "https://i.pravatar.cc/300?img=30",
    isOnline: true,
    stats: { wins: 18, losses: 4 },
    history: [],
  },
];

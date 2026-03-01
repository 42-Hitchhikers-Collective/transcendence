export interface UserProfile {
  id: number;
  username: string;
  password: string;
  name: string;
  email: string;
  dob: string;
  avatar: string;
  stats: {
    wins: number;
    losses: number;
  };
}

export const mockProfiles: UserProfile[] = [
  {
    id: 1,
    username: "user1",
    password: "pass1",
    name: "Jenny Carter",
    email: "jess@example.com",
    dob: "1995-03-15",
    avatar: "https://i.pravatar.cc/300?img=5",
    stats: { wins: 12, losses: 5 },
  },
  {
    id: 2,
    username: "user2",
    password: "pass2",
    name: "Alex Morgan",
    email: "alex@example.com",
    dob: "1998-07-22",
    avatar: "https://i.pravatar.cc/300?img=8",
    stats: { wins: 8, losses: 10 },
  },
  {
    id: 3,
    username: "user3",
    password: "pass3",
    name: "Sam Wilson",
    email: "sam@example.com",
    dob: "2000-01-10",
    avatar: "https://i.pravatar.cc/300?img=11",
    stats: { wins: 20, losses: 3 },
  },
  {
    id: 4,
    username: "user4",
    password: "pass4",
    name: "Sandra Lee",
    email: "sandra@example.com",
    dob: "2000-01-10",
    avatar: "https://i.pravatar.cc/300?img=30",
    stats: { wins: 1, losses: 20 },
  },
];

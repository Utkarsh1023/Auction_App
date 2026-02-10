export interface Player {
  name: string;
  reg: string;
  year: string;
  basePrice: number;
  sold: boolean;
}

export interface Team {
  name: string;
  captain: string;
  purse: number;
  squad: { name: string; year: string; bid: number }[];
}

export interface HistoryEntry {
  sport: string;
  date: string;
  playersCount: number;
  teamsCount: number;
  players: Player[];
  teams: Team[];
  auctionData: string;
}

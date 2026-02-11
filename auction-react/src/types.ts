export interface Player {
  name: string;
  reg: string;
  year: string;
  gender: 'Male' | 'Female';
  basePrice: number;
  sold: boolean;
}

export interface Team {
  name: string;
  captain: string;
  gender: 'Male' | 'Female';
  purse: number;
  squad: { name: string; year: string; gender: 'Male' | 'Female'; bid: number }[];
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

export type Tier = 'unranked' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface Student {
  id: string;
  name: string;
  grade: number;
  classNum: number;
  studentNum: number;
  gender?: 'M' | 'F';
  rp: number;
  initialRP: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  currentStreak: number; // positive for win streak, negative for lose streak
  highestStreak: number;
  lastPlayedAt?: string;
  opponentHistory: string[]; // Recent student IDs played against
  defeatHistory: string[]; // IDs of players this student lost to recently
  victoryHistory: string[]; // IDs of players this student beat recently
}

export interface MatchResultTeam {
  studentIds: string[];
  names: string[];
  score: number;
}

export interface RPChangeDetail {
  studentId: string;
  name: string;
  previousRP: number;
  newRP: number;
  delta: number;
  previousTier: Tier;
  newTier: Tier;
  breakdown: {
    base: number;
    bonuses: { label: string; amount: number }[];
    penalties: { label: string; amount: number }[];
  };
}

export interface Match {
  id: string;
  timestamp: string; // ISO string
  sport: string;
  mode: '1v1' | '2v2';
  teamA: MatchResultTeam;
  teamB: MatchResultTeam;
  winner: 'teamA' | 'teamB';
  rpChanges: RPChangeDetail[];
  date: string; // YYYY-MM-DD
}

export interface QueueItem {
  id: string;
  teamA: string[]; // student IDs
  teamB: string[]; // student IDs
  courtNumber?: number;
  status: 'waiting' | 'in_progress' | 'completed';
  createdAt: string;
}

export interface TierThresholds {
  silver: number;
  gold: number;
  platinum: number;
  diamond: number;
}

export interface TierSettings {
  name: string;
  unrankedMatchCount: number;
  thresholds: TierThresholds;
  // Win / Loss base points per tier
  basePoints: {
    bronze: { win: number; loss: number };
    silver: { win: number; loss: number };
    gold: { win: number; loss: number };
    platinum: { win: number; loss: number };
    diamond: { win: number; loss: number };
  };
  bonuses: {
    firstWinToday: number;
    newMatch: number;
    underdog: [number, number, number]; // 1, 2, 3 tier gap
    revenge: number;
    streak: number; // 3+ win streak (disabled for plat+)
    closeMatch: { 1: number; 2: number; 3: number }; // margin 1, 2, 3
    defeatComfort: number; // For silver or below on 2+ lose streak
    tenacity: [number, number, number]; // escape 3, 4, 5+ lose streak
    carry: { platinum: number; diamond: number };
  };
  penalties: {
    arrogance: { gold: number; platinum: number; diamond: number }; // lose to >= 2 tier below
    crushingDefeat: [number, number, number]; // 10+ pt margin
    championWeight: { platinum: number; diamond: number };
    swampStreak: { gold: number; diamond: number }; // 3+ lose streak
  };
}

export interface League {
  id: string;
  schoolName: string;
  sportName: string;
  leagueName: string;
  seasonName: string;
  createdAt: string;
  students: Student[];
  matches: Match[];
  queue: QueueItem[];
  absentStudentIds: string[];
  settings: TierSettings;
}

export interface AwardItem {
  id: string;
  title: string;
  studentName: string;
  gradeClassNum: string;
  description: string;
  badgeBg: string;
  badgeColor: string;
  icon: string;
}

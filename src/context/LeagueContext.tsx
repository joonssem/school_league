import React, { createContext, useContext, useState, useEffect } from 'react';
import { League, QueueItem, Match, TierSettings } from '../types/league';
import { createInitialMockLeague } from '../utils/mockData';
import { parseRosterText, createStudentsFromParsed } from '../utils/rosterParser';
import { calculateMatchRP, DEFAULT_TIER_SETTINGS, TIER_PRESETS } from '../utils/ratingEngine';
import { generateFullRound1v1, generateFullRound2v2, generateSingleMatch, MatchmakingMode } from '../utils/queueEngine';

const STORAGE_KEY = 'school_league_current_data_v1';

interface LeagueContextType {
  league: League;
  activeTab: 'queue' | 'ranking' | 'classroom' | 'highlights' | 'settings';
  setActiveTab: (tab: 'queue' | 'ranking' | 'classroom' | 'highlights' | 'settings') => void;
  matchmakingMode: MatchmakingMode;
  setMatchmakingMode: (mode: MatchmakingMode) => void;
  scoringQueueItem: QueueItem | null;
  setScoringQueueItem: (item: QueueItem | null) => void;
  isFreeMatchModalOpen: boolean;
  setIsFreeMatchModalOpen: (open: boolean) => void;
  isRosterModalOpen: boolean;
  setIsRosterModalOpen: (open: boolean) => void;
  isCreateLeagueModalOpen: boolean;
  setIsCreateLeagueModalOpen: (open: boolean) => void;

  // Actions
  toggleAbsent: (studentId: string) => void;
  generateRound: (isDoubles?: boolean) => void;
  addOneMatch: (isDoubles?: boolean) => void;
  removeQueueItem: (queueId: string) => void;
  clearQueue: () => void;
  submitMatchResult: (
    queueItemId: string | null,
    teamAIds: string[],
    teamBIds: string[],
    scoreA: number,
    scoreB: number
  ) => void;
  createNewLeague: (
    schoolName: string,
    sportName: string,
    leagueName: string,
    seasonName: string,
    rosterText: string,
    presetKey: keyof typeof TIER_PRESETS
  ) => void;
  importRoster: (rosterText: string) => void;
  updateSettings: (newSettings: Partial<TierSettings>) => void;
  resetToSampleData: () => void;
  exportLeagueJson: () => string;
  importLeagueJson: (jsonStr: string) => boolean;
}

const LeagueContext = createContext<LeagueContextType | null>(null);

export const LeagueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [league, setLeague] = useState<League>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved league', e);
    }
    return createInitialMockLeague();
  });

  const [activeTab, setActiveTab] = useState<'queue' | 'ranking' | 'classroom' | 'highlights' | 'settings'>('queue');
  const [matchmakingMode, setMatchmakingMode] = useState<MatchmakingMode>('balance');
  const [scoringQueueItem, setScoringQueueItem] = useState<QueueItem | null>(null);
  const [isFreeMatchModalOpen, setIsFreeMatchModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [isCreateLeagueModalOpen, setIsCreateLeagueModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(league));
    } catch (e) {
      console.error('Failed to save league to localStorage', e);
    }
  }, [league]);

  const toggleAbsent = (studentId: string) => {
    setLeague(prev => {
      const isAbsent = prev.absentStudentIds.includes(studentId);
      const updated = isAbsent
        ? prev.absentStudentIds.filter(id => id !== studentId)
        : [...prev.absentStudentIds, studentId];
      return { ...prev, absentStudentIds: updated };
    });
  };

  const getAvailableStudents = () => {
    const queuedStudentIds = new Set<string>();
    league.queue.forEach(q => {
      q.teamA.forEach(id => queuedStudentIds.add(id));
      q.teamB.forEach(id => queuedStudentIds.add(id));
    });

    return league.students.filter(
      s => !league.absentStudentIds.includes(s.id) && !queuedStudentIds.has(s.id)
    );
  };

  const generateRound = (isDoubles = false) => {
    const available = getAvailableStudents();
    if (isDoubles) {
      const { newQueueItems } = generateFullRound2v2(available, matchmakingMode, league.queue.length);
      setLeague(prev => ({ ...prev, queue: [...prev.queue, ...newQueueItems] }));
    } else {
      const { newQueueItems } = generateFullRound1v1(available, matchmakingMode, league.queue.length);
      setLeague(prev => ({ ...prev, queue: [...prev.queue, ...newQueueItems] }));
    }
  };

  const addOneMatch = (isDoubles = false) => {
    const available = getAvailableStudents();
    const item = generateSingleMatch(available, matchmakingMode, isDoubles, league.queue.length);
    if (item) {
      setLeague(prev => ({ ...prev, queue: [...prev.queue, item] }));
    }
  };

  const removeQueueItem = (queueId: string) => {
    setLeague(prev => ({
      ...prev,
      queue: prev.queue.filter(q => q.id !== queueId)
    }));
  };

  const clearQueue = () => {
    setLeague(prev => ({ ...prev, queue: [] }));
  };

  const submitMatchResult = (
    queueItemId: string | null,
    teamAIds: string[],
    teamBIds: string[],
    scoreA: number,
    scoreB: number
  ) => {
    const teamAStudents = league.students.filter(s => teamAIds.includes(s.id));
    const teamBStudents = league.students.filter(s => teamBIds.includes(s.id));

    if (teamAStudents.length === 0 || teamBStudents.length === 0) return;

    const winner: 'teamA' | 'teamB' = scoreA >= scoreB ? 'teamA' : 'teamB';
    const todayStr = new Date().toISOString().split('T')[0];
    const todayMatches = league.matches.filter(m => m.date === todayStr);

    // Compute RP changes
    const rpChanges = calculateMatchRP({
      teamAStudents,
      teamBStudents,
      scoreA,
      scoreB,
      winner,
      pastTodayMatches: todayMatches,
      settings: league.settings
    });

    const newMatch: Match = {
      id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      sport: league.sportName,
      mode: teamAIds.length > 1 ? '2v2' : '1v1',
      date: todayStr,
      teamA: {
        studentIds: teamAIds,
        names: teamAStudents.map(s => s.name),
        score: scoreA
      },
      teamB: {
        studentIds: teamBIds,
        names: teamBStudents.map(s => s.name),
        score: scoreB
      },
      winner,
      rpChanges
    };

    // Update students state
    const studentMap = new Map(league.students.map(s => [s.id, { ...s }]));

    // Apply RP changes and update streak / stats
    rpChanges.forEach(change => {
      const student = studentMap.get(change.studentId);
      if (!student) return;

      student.rp = change.newRP;
      student.matchesPlayed += 1;

      const isWon =
        (winner === 'teamA' && teamAIds.includes(student.id)) ||
        (winner === 'teamB' && teamBIds.includes(student.id));

      if (isWon) {
        student.wins += 1;
        student.currentStreak = student.currentStreak > 0 ? student.currentStreak + 1 : 1;
        if (student.currentStreak > student.highestStreak) {
          student.highestStreak = student.currentStreak;
        }
        // Record defeated opponents
        const defeatedIds = winner === 'teamA' ? teamBIds : teamAIds;
        student.victoryHistory.push(...defeatedIds);
      } else {
        student.losses += 1;
        student.currentStreak = student.currentStreak < 0 ? student.currentStreak - 1 : -1;
        // Record winners who beat this student
        const victorsIds = winner === 'teamA' ? teamAIds : teamBIds;
        student.defeatHistory.push(...victorsIds);
      }

      // Record opponent history
      const currentOpponents = teamAIds.includes(student.id) ? teamBIds : teamAIds;
      student.opponentHistory.push(...currentOpponents);
      student.lastPlayedAt = new Date().toISOString();
    });

    setLeague(prev => ({
      ...prev,
      students: Array.from(studentMap.values()),
      matches: [newMatch, ...prev.matches],
      queue: queueItemId ? prev.queue.filter(q => q.id !== queueItemId) : prev.queue
    }));
  };

  const createNewLeague = (
    schoolName: string,
    sportName: string,
    leagueName: string,
    seasonName: string,
    rosterText: string,
    presetKey: keyof typeof TIER_PRESETS
  ) => {
    const parsed = parseRosterText(rosterText);
    const students = createStudentsFromParsed(parsed);

    const preset = TIER_PRESETS[presetKey];
    const settings: TierSettings = {
      ...DEFAULT_TIER_SETTINGS,
      thresholds: preset.thresholds,
      name: preset.label
    };

    const newLeague: League = {
      id: `league_${Date.now()}`,
      schoolName: schoolName.trim() || '우리학교',
      sportName: sportName.trim() || '배드민턴',
      leagueName: leagueName.trim() || `${sportName} 교실리그`,
      seasonName: seasonName.trim() || '2026학년도 리그',
      createdAt: new Date().toISOString(),
      students,
      matches: [],
      queue: [],
      absentStudentIds: [],
      settings
    };

    setLeague(newLeague);
    setActiveTab('queue');
  };

  const importRoster = (rosterText: string) => {
    const parsed = parseRosterText(rosterText);
    const newStudents = createStudentsFromParsed(parsed);
    setLeague(prev => ({
      ...prev,
      students: [...prev.students, ...newStudents]
    }));
  };

  const updateSettings = (newSettings: Partial<TierSettings>) => {
    setLeague(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  };

  const resetToSampleData = () => {
    const initial = createInitialMockLeague();
    setLeague(initial);
  };

  const exportLeagueJson = () => {
    return JSON.stringify(league, null, 2);
  };

  const importLeagueJson = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.students && parsed.settings) {
        setLeague(parsed);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  return (
    <LeagueContext.Provider
      value={{
        league,
        activeTab,
        setActiveTab,
        matchmakingMode,
        setMatchmakingMode,
        scoringQueueItem,
        setScoringQueueItem,
        isFreeMatchModalOpen,
        setIsFreeMatchModalOpen,
        isRosterModalOpen,
        setIsRosterModalOpen,
        isCreateLeagueModalOpen,
        setIsCreateLeagueModalOpen,
        toggleAbsent,
        generateRound,
        addOneMatch,
        removeQueueItem,
        clearQueue,
        submitMatchResult,
        createNewLeague,
        importRoster,
        updateSettings,
        resetToSampleData,
        exportLeagueJson,
        importLeagueJson
      }}
    >
      {children}
    </LeagueContext.Provider>
  );
};

export const useLeague = () => {
  const context = useContext(LeagueContext);
  if (!context) throw new Error('useLeague must be used within LeagueProvider');
  return context;
};

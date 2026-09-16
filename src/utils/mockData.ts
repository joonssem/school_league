// [안내] 본 파일의 학생 명단은 기능 동작 테스트를 위한 100% 가상의 모의 데이터(더미 데이터)입니다.
import { League } from '../types/league';
import { DEFAULT_TIER_SETTINGS } from './ratingEngine';

export const SAMPLE_NEIS_ROSTER = `5 2 1 강민준 남
5 2 2 김도윤 남
5 2 3 김서준 남
5 2 4 김시우 남
5 2 5 김하준 남
5 2 6 박서진 남
5 2 7 박유준 남
5 2 8 이도현 남
5 2 9 이지호 남
5 2 10 정예준 남
5 2 11 고은서 여
5 2 12 김다은 여
5 2 13 김민서 여
5 2 14 김서윤 여
5 2 15 김서현 여
5 2 16 박서아 여
5 2 17 박지우 여
5 2 18 배수아 여
5 2 19 윤채원 여
5 2 20 최하윤 여`;

export function createInitialMockLeague(): League {
  const sampleStudents = [
    { id: 'std_1', name: '강민준', grade: 5, classNum: 2, studentNum: 1, gender: 'M' as const, rp: 1160, initialRP: 1000, matchesPlayed: 6, wins: 5, losses: 1, currentStreak: 3, highestStreak: 3, opponentHistory: ['std_2', 'std_4', 'std_8', 'std_10', 'std_3', 'std_5'], defeatHistory: ['std_2'], victoryHistory: ['std_4', 'std_8', 'std_10', 'std_3', 'std_5'] },
    { id: 'std_2', name: '김도윤', grade: 5, classNum: 2, studentNum: 2, gender: 'M' as const, rp: 1220, initialRP: 1000, matchesPlayed: 7, wins: 6, losses: 1, currentStreak: 2, highestStreak: 4, opponentHistory: ['std_1', 'std_3', 'std_5', 'std_7', 'std_9', 'std_11'], defeatHistory: ['std_3'], victoryHistory: ['std_1', 'std_5', 'std_7', 'std_9', 'std_11'] },
    { id: 'std_3', name: '김서준', grade: 5, classNum: 2, studentNum: 3, gender: 'M' as const, rp: 1080, initialRP: 1000, matchesPlayed: 5, wins: 3, losses: 2, currentStreak: -1, highestStreak: 2, opponentHistory: ['std_2', 'std_4', 'std_6', 'std_1'], defeatHistory: ['std_1'], victoryHistory: ['std_2', 'std_4', 'std_6'] },
    { id: 'std_4', name: '김시우', grade: 5, classNum: 2, studentNum: 4, gender: 'M' as const, rp: 950, initialRP: 1000, matchesPlayed: 4, wins: 2, losses: 2, currentStreak: 1, highestStreak: 1, opponentHistory: ['std_1', 'std_3', 'std_7'], defeatHistory: ['std_1'], victoryHistory: ['std_7'] },
    { id: 'std_5', name: '김하준', grade: 5, classNum: 2, studentNum: 5, gender: 'M' as const, rp: 1020, initialRP: 1000, matchesPlayed: 4, wins: 2, losses: 2, currentStreak: -1, highestStreak: 2, opponentHistory: ['std_1', 'std_2', 'std_8'], defeatHistory: ['std_1', 'std_2'], victoryHistory: ['std_8'] },
    { id: 'std_6', name: '박서진', grade: 5, classNum: 2, studentNum: 6, gender: 'M' as const, rp: 990, initialRP: 1000, matchesPlayed: 3, wins: 1, losses: 2, currentStreak: 1, highestStreak: 1, opponentHistory: ['std_3', 'std_9'], defeatHistory: ['std_3'], victoryHistory: ['std_9'] },
    { id: 'std_7', name: '박유준', grade: 5, classNum: 2, studentNum: 7, gender: 'M' as const, rp: 890, initialRP: 1000, matchesPlayed: 4, wins: 1, losses: 3, currentStreak: -2, highestStreak: 1, opponentHistory: ['std_2', 'std_4', 'std_10'], defeatHistory: ['std_2', 'std_4'], victoryHistory: ['std_10'] },
    { id: 'std_8', name: '이도현', grade: 5, classNum: 2, studentNum: 8, gender: 'M' as const, rp: 940, initialRP: 1000, matchesPlayed: 4, wins: 1, losses: 3, currentStreak: -1, highestStreak: 1, opponentHistory: ['std_1', 'std_5', 'std_11'], defeatHistory: ['std_1', 'std_5'], victoryHistory: ['std_11'] },
    { id: 'std_9', name: '이지호', grade: 5, classNum: 2, studentNum: 9, gender: 'M' as const, rp: 1010, initialRP: 1000, matchesPlayed: 3, wins: 1, losses: 2, currentStreak: -1, highestStreak: 1, opponentHistory: ['std_2', 'std_6'], defeatHistory: ['std_2', 'std_6'], victoryHistory: [] },
    { id: 'std_10', name: '정예준', grade: 5, classNum: 2, studentNum: 10, gender: 'M' as const, rp: 1050, initialRP: 1000, matchesPlayed: 4, wins: 2, losses: 2, currentStreak: 1, highestStreak: 1, opponentHistory: ['std_1', 'std_7'], defeatHistory: ['std_1', 'std_7'], victoryHistory: [] },
    { id: 'std_11', name: '고은서', grade: 5, classNum: 2, studentNum: 11, gender: 'F' as const, rp: 1180, initialRP: 1000, matchesPlayed: 5, wins: 4, losses: 1, currentStreak: 3, highestStreak: 3, opponentHistory: ['std_2', 'std_8', 'std_12', 'std_14'], defeatHistory: ['std_2'], victoryHistory: ['std_8', 'std_12', 'std_14'] },
    { id: 'std_12', name: '김다은', grade: 5, classNum: 2, studentNum: 12, gender: 'F' as const, rp: 1000, initialRP: 1000, matchesPlayed: 3, wins: 1, losses: 2, currentStreak: -1, highestStreak: 1, opponentHistory: ['std_11', 'std_13'], defeatHistory: ['std_11'], victoryHistory: ['std_13'] },
    { id: 'std_13', name: '김민서', grade: 5, classNum: 2, studentNum: 13, gender: 'F' as const, rp: 970, initialRP: 1000, matchesPlayed: 2, wins: 1, losses: 1, currentStreak: -1, highestStreak: 1, opponentHistory: ['std_12'], defeatHistory: ['std_12'], victoryHistory: [] },
    { id: 'std_14', name: '김서윤', grade: 5, classNum: 2, studentNum: 14, gender: 'F' as const, rp: 1040, initialRP: 1000, matchesPlayed: 2, wins: 1, losses: 1, currentStreak: 1, highestStreak: 1, opponentHistory: ['std_11'], defeatHistory: ['std_11'], victoryHistory: [] },
    { id: 'std_15', name: '김서현', grade: 5, classNum: 2, studentNum: 15, gender: 'F' as const, rp: 1000, initialRP: 1000, matchesPlayed: 1, wins: 0, losses: 1, currentStreak: -1, highestStreak: 0, opponentHistory: [], defeatHistory: [], victoryHistory: [] },
    { id: 'std_16', name: '박서아', grade: 5, classNum: 2, studentNum: 16, gender: 'F' as const, rp: 1000, initialRP: 1000, matchesPlayed: 0, wins: 0, losses: 0, currentStreak: 0, highestStreak: 0, opponentHistory: [], defeatHistory: [], victoryHistory: [] },
    { id: 'std_17', name: '박지우', grade: 5, classNum: 2, studentNum: 17, gender: 'F' as const, rp: 1000, initialRP: 1000, matchesPlayed: 0, wins: 0, losses: 0, currentStreak: 0, highestStreak: 0, opponentHistory: [], defeatHistory: [], victoryHistory: [] },
    { id: 'std_18', name: '배수아', grade: 5, classNum: 2, studentNum: 18, gender: 'F' as const, rp: 1000, initialRP: 1000, matchesPlayed: 0, wins: 0, losses: 0, currentStreak: 0, highestStreak: 0, opponentHistory: [], defeatHistory: [], victoryHistory: [] },
    { id: 'std_19', name: '윤채원', grade: 5, classNum: 2, studentNum: 19, gender: 'F' as const, rp: 1000, initialRP: 1000, matchesPlayed: 0, wins: 0, losses: 0, currentStreak: 0, highestStreak: 0, opponentHistory: [], defeatHistory: [], victoryHistory: [] },
    { id: 'std_20', name: '최하윤', grade: 5, classNum: 2, studentNum: 20, gender: 'F' as const, rp: 1000, initialRP: 1000, matchesPlayed: 0, wins: 0, losses: 0, currentStreak: 0, highestStreak: 0, opponentHistory: [], defeatHistory: [], victoryHistory: [] }
  ];

  return {
    id: 'league_sample_badminton',
    schoolName: '꿈사랑초등학교',
    sportName: '배드민턴',
    leagueName: '5학년 2반 배드민턴 교실리그',
    seasonName: '2026학년도 1학기',
    createdAt: new Date().toISOString(),
    students: sampleStudents,
    matches: [
      {
        id: 'match_1',
        timestamp: new Date().toISOString(),
        sport: '배드민턴',
        mode: '1v1',
        date: new Date().toISOString().split('T')[0],
        teamA: { studentIds: ['std_1'], names: ['강민준'], score: 11 },
        teamB: { studentIds: ['std_4'], names: ['김시우'], score: 7 },
        winner: 'teamA',
        rpChanges: [
          {
            studentId: 'std_1',
            name: '강민준',
            previousRP: 1130,
            newRP: 1160,
            delta: 30,
            previousTier: 'gold',
            newTier: 'gold',
            breakdown: {
              base: 16,
              bonuses: [
                { label: '오늘의 첫 승', amount: 12 },
                { label: '신규 매치', amount: 5 }
              ],
              penalties: []
            }
          },
          {
            studentId: 'std_4',
            name: '김시우',
            previousRP: 960,
            newRP: 950,
            delta: -10,
            previousTier: 'silver',
            newTier: 'silver',
            breakdown: {
              base: -10,
              bonuses: [],
              penalties: []
            }
          }
        ]
      },
      {
        id: 'match_2',
        timestamp: new Date().toISOString(),
        sport: '배드민턴',
        mode: '1v1',
        date: new Date().toISOString().split('T')[0],
        teamA: { studentIds: ['std_2'], names: ['김도윤'], score: 12 },
        teamB: { studentIds: ['std_3'], names: ['김서준'], score: 10 },
        winner: 'teamA',
        rpChanges: [
          {
            studentId: 'std_2',
            name: '김도윤',
            previousRP: 1195,
            newRP: 1220,
            delta: 25,
            previousTier: 'gold',
            newTier: 'platinum',
            breakdown: {
              base: 16,
              bonuses: [
                { label: '2점차 명승부', amount: 5 },
                { label: '연승 행진', amount: 8 }
              ],
              penalties: []
            }
          },
          {
            studentId: 'std_3',
            name: '김서준',
            previousRP: 1088,
            newRP: 1080,
            delta: -8,
            previousTier: 'silver',
            newTier: 'silver',
            breakdown: {
              base: -10,
              bonuses: [{ label: '2점차 분전 보너스', amount: 2 }],
              penalties: []
            }
          }
        ]
      }
    ],
    queue: [
      {
        id: 'q_1',
        teamA: ['std_6'],
        teamB: ['std_7'],
        courtNumber: 1,
        status: 'waiting',
        createdAt: new Date().toISOString()
      },
      {
        id: 'q_2',
        teamA: ['std_8'],
        teamB: ['std_9'],
        courtNumber: 2,
        status: 'waiting',
        createdAt: new Date().toISOString()
      },
      {
        id: 'q_3',
        teamA: ['std_11'],
        teamB: ['std_12'],
        courtNumber: 3,
        status: 'waiting',
        createdAt: new Date().toISOString()
      }
    ],
    absentStudentIds: ['std_15'],
    settings: DEFAULT_TIER_SETTINGS
  };
}

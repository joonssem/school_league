import { Student, QueueItem } from '../types/league';

export type MatchmakingMode = 'diversity' | 'balance' | 'skill';

/**
 * 두 학생 간의 매칭 적합도 점수 계산 (낮을수록 더 우선 매칭)
 */
function calculatePairCost(
  s1: Student,
  s2: Student,
  mode: MatchmakingMode
): number {
  const rpDiff = Math.abs(s1.rp - s2.rp);

  // 최근 5경기 내 상대한 적이 있는지
  const s1Recent = s1.opponentHistory.slice(-5);
  const s2Recent = s2.opponentHistory.slice(-5);
  const recentEncounterCount =
    (s1Recent.filter(id => id === s2.id).length + s2Recent.filter(id => id === s1.id).length);

  // 전체 상대 횟수
  const totalEncounterCount =
    s1.opponentHistory.filter(id => id === s2.id).length;

  if (mode === 'diversity') {
    // 다양성 모드: 안 만난 상대 최우선 (RP 차이는 아주 작은 가중치만)
    return recentEncounterCount * 5000 + totalEncounterCount * 1000 + rpDiff * 0.1;
  } else if (mode === 'skill') {
    // 실력 모드: RP 차이 최소화 우선
    return rpDiff * 10 + recentEncounterCount * 100;
  } else {
    // 밸런스 모드: 안 만난 상대 + 비슷한 실력 절충
    return recentEncounterCount * 3000 + totalEncounterCount * 500 + rpDiff;
  }
}

/**
 * 1:1 대진 "한 바퀴" 생성:
 * 대기 중인 모든 학생이 공평하게 1회씩 경기하도록 대진 편성
 */
export function generateFullRound1v1(
  availableStudents: Student[],
  mode: MatchmakingMode = 'balance',
  existingQueueCount = 0
): { newQueueItems: QueueItem[]; benchedStudent?: Student } {
  if (availableStudents.length < 2) {
    return { newQueueItems: [] };
  }

  // Shuffle initially to break ties randomly
  const pool = [...availableStudents].sort(() => Math.random() - 0.5);
  const matchedPairs: [Student, Student][] = [];

  let benchedStudent: Student | undefined;
  // If odd count, bench the student who played the most matches or random
  if (pool.length % 2 !== 0) {
    pool.sort((a, b) => b.matchesPlayed - a.matchesPlayed);
    benchedStudent = pool.shift();
  }

  // Greedy minimum-cost matching
  const remaining = [...pool];
  while (remaining.length >= 2) {
    const s1 = remaining.shift()!;
    let bestIndex = 0;
    let bestCost = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const s2 = remaining[i];
      const cost = calculatePairCost(s1, s2, mode);
      if (cost < bestCost) {
        bestCost = cost;
        bestIndex = i;
      }
    }

    const s2 = remaining.splice(bestIndex, 1)[0];
    matchedPairs.push([s1, s2]);
  }

  const newQueueItems: QueueItem[] = matchedPairs.map((pair, idx) => ({
    id: `queue_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
    teamA: [pair[0].id],
    teamB: [pair[1].id],
    courtNumber: existingQueueCount + idx + 1,
    status: 'waiting',
    createdAt: new Date().toISOString()
  }));

  return { newQueueItems, benchedStudent };
}

/**
 * 2:2 복식 "한 바퀴" 생성:
 * 4명씩 묶어 팀A(2명) vs 팀B(2명) 편성
 */
export function generateFullRound2v2(
  availableStudents: Student[],
  _mode: MatchmakingMode = 'balance',
  existingQueueCount = 0
): { newQueueItems: QueueItem[]; benchedStudents: Student[] } {
  if (availableStudents.length < 4) {
    return { newQueueItems: [], benchedStudents: availableStudents };
  }

  const pool = [...availableStudents].sort(() => Math.random() - 0.5);
  const remainder = pool.length % 4;
  let benchedStudents: Student[] = [];

  if (remainder > 0) {
    pool.sort((a, b) => b.matchesPlayed - a.matchesPlayed);
    benchedStudents = pool.splice(0, remainder);
  }

  const newQueueItems: QueueItem[] = [];
  let court = existingQueueCount + 1;

  while (pool.length >= 4) {
    // Pick 4 students
    const group = pool.splice(0, 4);

    // Group balance: arrange 4 students so team average RP is balanced
    group.sort((a, b) => b.rp - a.rp); // s0, s1, s2, s3 (highest to lowest)
    // Team A: s0 + s3 (highest + lowest), Team B: s1 + s2 (middle two)
    const teamA = [group[0].id, group[3].id];
    const teamB = [group[1].id, group[2].id];

    newQueueItems.push({
      id: `queue_${Date.now()}_${court}_${Math.random().toString(36).substring(2, 6)}`,
      teamA,
      teamB,
      courtNumber: court++,
      status: 'waiting',
      createdAt: new Date().toISOString()
    });
  }

  return { newQueueItems, benchedStudents };
}

/**
 * +1 경기 단일 추가 생성
 */
export function generateSingleMatch(
  availableStudents: Student[],
  mode: MatchmakingMode = 'balance',
  isDoubles = false,
  existingQueueCount = 0
): QueueItem | null {
  const needed = isDoubles ? 4 : 2;
  if (availableStudents.length < needed) return null;

  if (!isDoubles) {
    // 1v1: find the pair with least cost
    let bestPair: [Student, Student] | null = null;
    let bestCost = Infinity;

    for (let i = 0; i < availableStudents.length; i++) {
      for (let j = i + 1; j < availableStudents.length; j++) {
        const cost = calculatePairCost(availableStudents[i], availableStudents[j], mode);
        if (cost < bestCost) {
          bestCost = cost;
          bestPair = [availableStudents[i], availableStudents[j]];
        }
      }
    }

    if (!bestPair) return null;

    return {
      id: `queue_${Date.now()}_single_${Math.random().toString(36).substring(2, 6)}`,
      teamA: [bestPair[0].id],
      teamB: [bestPair[1].id],
      courtNumber: existingQueueCount + 1,
      status: 'waiting',
      createdAt: new Date().toISOString()
    };
  } else {
    // 2v2: pick 4 students who played the least matches
    const sorted = [...availableStudents].sort((a, b) => a.matchesPlayed - b.matchesPlayed);
    const four = sorted.slice(0, 4).sort((a, b) => b.rp - a.rp);

    return {
      id: `queue_${Date.now()}_single_2v2_${Math.random().toString(36).substring(2, 6)}`,
      teamA: [four[0].id, four[3].id],
      teamB: [four[1].id, four[2].id],
      courtNumber: existingQueueCount + 1,
      status: 'waiting',
      createdAt: new Date().toISOString()
    };
  }
}

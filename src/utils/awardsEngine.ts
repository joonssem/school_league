import { Student, Match, AwardItem } from '../types/league';

export function calculateHighlights(
  todayMatches: Match[],
  allStudents: Student[]
): AwardItem[] {
  if (todayMatches.length === 0) return [];

  const awards: AwardItem[] = [];
  const awardedStudentIds = new Set<string>();

  // Map student stats for today
  interface StudentTodayStats {
    student: Student;
    matchesCount: number;
    wins: number;
    losses: number;
    rpGain: number;
    opponents: Set<string>;
    biggestUnderdogWinDiff: number;
    hasBrokeLosingStreak: boolean;
    shutoutWin: boolean;
    closestMatchDiff: number;
  }

  const statsMap = new Map<string, StudentTodayStats>();

  allStudents.forEach(s => {
    statsMap.set(s.id, {
      student: s,
      matchesCount: 0,
      wins: 0,
      losses: 0,
      rpGain: 0,
      opponents: new Set(),
      biggestUnderdogWinDiff: 0,
      hasBrokeLosingStreak: false,
      shutoutWin: false,
      closestMatchDiff: Infinity
    });
  });

  todayMatches.forEach(m => {
    const isTeamAWon = m.winner === 'teamA';
    const winTeam = isTeamAWon ? m.teamA : m.teamB;
    const loseTeam = isTeamAWon ? m.teamB : m.teamA;
    const diff = Math.abs(winTeam.score - loseTeam.score);

    // Track RP change
    m.rpChanges.forEach(change => {
      const stat = statsMap.get(change.studentId);
      if (stat) {
        stat.rpGain += change.delta;
      }
    });

    // Track Wins/Matches for winning team
    winTeam.studentIds.forEach(id => {
      const stat = statsMap.get(id);
      if (stat) {
        stat.matchesCount += 1;
        stat.wins += 1;
        loseTeam.studentIds.forEach(oppId => stat.opponents.add(oppId));
        if (loseTeam.score === 0) stat.shutoutWin = true;
        if (diff < stat.closestMatchDiff) stat.closestMatchDiff = diff;
      }
    });

    // Track Losses/Matches for losing team
    loseTeam.studentIds.forEach(id => {
      const stat = statsMap.get(id);
      if (stat) {
        stat.matchesCount += 1;
        stat.losses += 1;
        winTeam.studentIds.forEach(oppId => stat.opponents.add(oppId));
        if (diff < stat.closestMatchDiff) stat.closestMatchDiff = diff;
      }
    });
  });

  const activeStats = Array.from(statsMap.values()).filter(st => st.matchesCount > 0);

  // Helper to pick candidate not yet awarded
  function pickBest(
    predicate: (a: StudentTodayStats, b: StudentTodayStats) => number,
    filterFn?: (st: StudentTodayStats) => boolean
  ): StudentTodayStats | null {
    const filtered = activeStats.filter(st => (filterFn ? filterFn(st) : true));
    if (filtered.length === 0) return null;

    // Prefer un-awarded
    const unawarded = filtered.filter(st => !awardedStudentIds.has(st.student.id));
    const pool = unawarded.length > 0 ? unawarded : filtered;
    return [...pool].sort(predicate)[0] || null;
  }

  // 1. 친구 넓히기 상 (가장 다양한 상대와 겨룬 학생)
  const diversityKing = pickBest(
    (a, b) => b.opponents.size - a.opponents.size,
    st => st.opponents.size >= 2
  );
  if (diversityKing) {
    awardedStudentIds.add(diversityKing.student.id);
    awards.push({
      id: 'award_diversity',
      title: '🤝 친구 넓히기 상',
      studentName: diversityKing.student.name,
      gradeClassNum: `${diversityKing.student.grade}-${diversityKing.student.classNum}`,
      description: `오늘 ${diversityKing.opponents.size}명의 다양한 친구들과 멋진 승부를 펼쳤습니다!`,
      badgeBg: 'bg-emerald-100',
      badgeColor: 'text-emerald-800',
      icon: 'Users'
    });
  }

  // 2. RP 급상승 상 (성장왕)
  const growthKing = pickBest(
    (a, b) => b.rpGain - a.rpGain,
    st => st.rpGain > 15
  );
  if (growthKing) {
    awardedStudentIds.add(growthKing.student.id);
    awards.push({
      id: 'award_growth',
      title: '🚀 오늘의 성장왕',
      studentName: growthKing.student.name,
      gradeClassNum: `${growthKing.student.grade}-${growthKing.student.classNum}`,
      description: `오늘 하루 동안 무려 +${growthKing.rpGain} RP를 획득하며 눈부시게 성장했습니다!`,
      badgeBg: 'bg-amber-100',
      badgeColor: 'text-amber-800',
      icon: 'TrendingUp'
    });
  }

  // 3. 깜짝 승리 상 (가장 높은 RP 차이를 극복한 언더독)
  // Let's find matches where winner had lower starting RP
  let bestUnderdogMatch: { winner: Student; gap: number } | null = null;
  todayMatches.forEach(m => {
    const isTeamAWon = m.winner === 'teamA';
    const winStudents = isTeamAWon ? m.teamA.studentIds : m.teamB.studentIds;
    const loseStudents = isTeamAWon ? m.teamB.studentIds : m.teamA.studentIds;

    const winStudentObj = allStudents.find(s => s.id === winStudents[0]);
    const loseStudentObj = allStudents.find(s => s.id === loseStudents[0]);

    if (winStudentObj && loseStudentObj && loseStudentObj.rp > winStudentObj.rp) {
      const gap = loseStudentObj.rp - winStudentObj.rp;
      if (!bestUnderdogMatch || gap > bestUnderdogMatch.gap) {
        bestUnderdogMatch = { winner: winStudentObj, gap };
      }
    }
  });

  if (bestUnderdogMatch && (bestUnderdogMatch as any).gap >= 50) {
    const winStd = (bestUnderdogMatch as any).winner as Student;
    awardedStudentIds.add(winStd.id);
    awards.push({
      id: 'award_underdog',
      title: '⚡ 자이언트 킬러 (깜짝 승리)',
      studentName: winStd.name,
      gradeClassNum: `${winStd.grade}-${winStd.classNum}`,
      description: `강한 상대를 만나도 위축되지 않고 멋진 역전승을 일궈냈습니다!`,
      badgeBg: 'bg-indigo-100',
      badgeColor: 'text-indigo-800',
      icon: 'Zap'
    });
  }

  // 4. 열정 출전왕 (최다 경기 참여)
  const passionKing = pickBest(
    (a, b) => b.matchesCount - a.matchesCount,
    st => st.matchesCount >= 2
  );
  if (passionKing) {
    awardedStudentIds.add(passionKing.student.id);
    awards.push({
      id: 'award_passion',
      title: '🔥 오늘의 열정왕',
      studentName: passionKing.student.name,
      gradeClassNum: `${passionKing.student.grade}-${passionKing.student.classNum}`,
      description: `오늘 총 ${passionKing.matchesCount}경기에 출전하며 지치지 않는 열정을 보여주었습니다!`,
      badgeBg: 'bg-rose-100',
      badgeColor: 'text-rose-800',
      icon: 'Flame'
    });
  }

  // 5. 명경기 주인공 (1점 차 초접전 경기)
  const closeMatch = todayMatches.find(m => Math.abs(m.teamA.score - m.teamB.score) === 1);
  if (closeMatch) {
    const p1 = allStudents.find(s => s.id === closeMatch.teamA.studentIds[0]);
    const p2 = allStudents.find(s => s.id === closeMatch.teamB.studentIds[0]);
    if (p1 && p2) {
      awards.push({
        id: 'award_thriller',
        title: '🏅 최고의 명승부 듀오',
        studentName: `${p1.name} & ${p2.name}`,
        gradeClassNum: `${p1.grade}-${p1.classNum}`,
        description: `${closeMatch.teamA.score} : ${closeMatch.teamB.score}의 손에 땀을 쥐는 1점 차 접전으로 관중을 열광시켰습니다!`,
        badgeBg: 'bg-purple-100',
        badgeColor: 'text-purple-800',
        icon: 'Award'
      });
    }
  }

  // 6. 오늘의 전승 (2경기 이상 출전하여 전승)
  const undefeated = activeStats.find(
    st => st.matchesCount >= 2 && st.losses === 0 && !awardedStudentIds.has(st.student.id)
  );
  if (undefeated) {
    awardedStudentIds.add(undefeated.student.id);
    awards.push({
      id: 'award_undefeated',
      title: '👑 무패의 챔피언',
      studentName: undefeated.student.name,
      gradeClassNum: `${undefeated.student.grade}-${undefeated.student.classNum}`,
      description: `오늘 치른 ${undefeated.matchesCount}경기에서 단 한 번도 패하지 않았습니다!`,
      badgeBg: 'bg-yellow-100',
      badgeColor: 'text-yellow-800',
      icon: 'Crown'
    });
  }

  return awards;
}

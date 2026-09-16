import { Student, Tier, TierSettings, RPChangeDetail, Match } from '../types/league';

export const DEFAULT_TIER_SETTINGS: TierSettings = {
  name: '표준 프리셋',
  unrankedMatchCount: 3,
  thresholds: {
    silver: 870,
    gold: 1120,
    platinum: 1400,
    diamond: 1720
  },
  basePoints: {
    bronze: { win: 24, loss: -6 },
    silver: { win: 20, loss: -10 },
    gold: { win: 16, loss: -16 },
    platinum: { win: 13, loss: -21 },
    diamond: { win: 11, loss: -27 }
  },
  bonuses: {
    firstWinToday: 12,
    newMatch: 5,
    underdog: [6, 12, 20],
    revenge: 8,
    streak: 8,
    closeMatch: { 1: 10, 2: 5, 3: 2 },
    defeatComfort: 4,
    tenacity: [8, 12, 16],
    carry: { platinum: 5, diamond: 7 }
  },
  penalties: {
    arrogance: { gold: 10, platinum: 18, diamond: 25 },
    crushingDefeat: [6, 9, 12],
    championWeight: { platinum: 4, diamond: 8 },
    swampStreak: { gold: 4, diamond: 13 }
  }
};

export const TIER_PRESETS = {
  short: {
    label: '단기·촘촘 (1개월)',
    thresholds: { silver: 900, gold: 1050, platinum: 1200, diamond: 1380 }
  },
  standard: {
    label: '표준 (약 2개월, 권장)',
    thresholds: { silver: 870, gold: 1120, platinum: 1400, diamond: 1720 }
  },
  long: {
    label: '장기·넓게 (한 학기)',
    thresholds: { silver: 850, gold: 1200, platinum: 1650, diamond: 2200 }
  },
  fine: {
    label: '정규분포·정밀 (스포츠클럽)',
    thresholds: { silver: 880, gold: 1100, platinum: 1350, diamond: 1600 }
  }
};

export const TIER_NAMES: Record<Tier, string> = {
  unranked: '언랭크',
  bronze: '브론즈',
  silver: '실버',
  gold: '골드',
  platinum: '플래티넘',
  diamond: '다이아'
};

export const TIER_COLORS: Record<Tier, { bg: string; text: string; border: string; badge: string }> = {
  unranked: { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-300', badge: '#78716c' },
  bronze: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-400', badge: '#b45309' },
  silver: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-400', badge: '#64748b' },
  gold: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-400', badge: '#eab308' },
  platinum: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-400', badge: '#10b981' },
  diamond: { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-400', badge: '#06b6d4' }
};

export function getTierLevel(tier: Tier): number {
  switch (tier) {
    case 'bronze': return 1;
    case 'silver': return 2;
    case 'gold': return 3;
    case 'platinum': return 4;
    case 'diamond': return 5;
    default: return 1; // unranked defaults to bronze level for calculations
  }
}

export function getStudentTier(student: Student, settings = DEFAULT_TIER_SETTINGS): Tier {
  if (student.matchesPlayed < settings.unrankedMatchCount) {
    return 'unranked';
  }
  const { rp } = student;
  const { thresholds } = settings;

  if (rp >= thresholds.diamond) return 'diamond';
  if (rp >= thresholds.platinum) return 'platinum';
  if (rp >= thresholds.gold) return 'gold';
  if (rp >= thresholds.silver) return 'silver';
  return 'bronze';
}

export function getNextTierInfo(student: Student, settings = DEFAULT_TIER_SETTINGS): { nextTier: string; pointsNeeded: number } | null {
  const currentTier = getStudentTier(student, settings);
  const { thresholds } = settings;

  if (currentTier === 'unranked') {
    const matchesLeft = settings.unrankedMatchCount - student.matchesPlayed;
    return { nextTier: '배치 완료', pointsNeeded: matchesLeft };
  }
  if (currentTier === 'bronze') {
    return { nextTier: '실버', pointsNeeded: Math.max(0, thresholds.silver - student.rp) };
  }
  if (currentTier === 'silver') {
    return { nextTier: '골드', pointsNeeded: Math.max(0, thresholds.gold - student.rp) };
  }
  if (currentTier === 'gold') {
    return { nextTier: '플래티넘', pointsNeeded: Math.max(0, thresholds.platinum - student.rp) };
  }
  if (currentTier === 'platinum') {
    return { nextTier: '다이아', pointsNeeded: Math.max(0, thresholds.diamond - student.rp) };
  }
  return null; // Diamond is top tier
}

export interface MatchCalculationContext {
  teamAStudents: Student[];
  teamBStudents: Student[];
  scoreA: number;
  scoreB: number;
  winner: 'teamA' | 'teamB';
  pastTodayMatches: Match[];
  settings?: TierSettings;
}

/**
 * 계산 엔진: 교육적 고려사항이 반영된 승패 점수 및 보너스/패널티 산출
 */
export function calculateMatchRP(context: MatchCalculationContext): RPChangeDetail[] {
  const { teamAStudents, teamBStudents, scoreA, scoreB, winner, pastTodayMatches } = context;
  const settings = context.settings || DEFAULT_TIER_SETTINGS;

  const isTeamAWinner = winner === 'teamA';
  const winningStudents = isTeamAWinner ? teamAStudents : teamBStudents;
  const losingStudents = isTeamAWinner ? teamBStudents : teamAStudents;

  const winScore = isTeamAWinner ? scoreA : scoreB;
  const loseScore = isTeamAWinner ? scoreB : scoreA;
  const scoreDiff = Math.abs(winScore - loseScore);

  // Helper to check if a student had won today before this match
  const hadWonToday = (studentId: string): boolean => {
    return pastTodayMatches.some(m => {
      const isWonA = m.winner === 'teamA' && m.teamA.studentIds.includes(studentId);
      const isWonB = m.winner === 'teamB' && m.teamB.studentIds.includes(studentId);
      return isWonA || isWonB;
    });
  };

  const results: RPChangeDetail[] = [];

  // Average tier level of teams
  const avgWinningTierLevel =
    winningStudents.reduce((sum, s) => sum + getTierLevel(getStudentTier(s, settings)), 0) / winningStudents.length;
  const avgLosingTierLevel =
    losingStudents.reduce((sum, s) => sum + getTierLevel(getStudentTier(s, settings)), 0) / losingStudents.length;

  // Process Winners
  winningStudents.forEach((student, idx) => {
    const prevRP = student.rp;
    const prevTier = getStudentTier(student, settings);
    const tierKey = prevTier === 'unranked' ? 'bronze' : prevTier;
    const baseWin = settings.basePoints[tierKey].win;

    const bonuses: { label: string; amount: number }[] = [];
    const penalties: { label: string; amount: number }[] = [];

    // 1. 오늘의 첫 승 보너스
    if (!hadWonToday(student.id)) {
      bonuses.push({ label: '오늘의 첫 승', amount: settings.bonuses.firstWinToday });
    }

    // 2. 신규 매치 보너스 (상대 팀원 중 최근 5경기 미대결 상대가 있을 때)
    const opponentIds = losingStudents.map(o => o.id);
    const recentOpponents = student.opponentHistory.slice(-5);
    const hasNewOpponent = opponentIds.some(id => !recentOpponents.includes(id));
    if (hasNewOpponent) {
      bonuses.push({ label: '신규 매치', amount: settings.bonuses.newMatch });
    }

    // 3. 언더독 격파 (상대 평균 티어가 나보다 높을 때)
    const myTierLevel = getTierLevel(prevTier);
    const tierGap = Math.round(avgLosingTierLevel - myTierLevel);
    if (tierGap >= 3) {
      bonuses.push({ label: '대이변 언더독', amount: settings.bonuses.underdog[2] });
    } else if (tierGap === 2) {
      bonuses.push({ label: '언더독 2단계 격파', amount: settings.bonuses.underdog[1] });
    } else if (tierGap === 1) {
      bonuses.push({ label: '언더독 승리', amount: settings.bonuses.underdog[0] });
    }

    // 4. 복수 성공 (최근 진 상대에게 설욕)
    const canRevenge = opponentIds.some(id => student.defeatHistory.slice(-5).includes(id));
    if (canRevenge) {
      bonuses.push({ label: '복수 성공', amount: settings.bonuses.revenge });
    }

    // 5. 연승 보너스 (3연승부터, 플래티넘 이상 비활성화 - 양민학살 방지)
    if (student.currentStreak >= 2) { // will become 3+ with this win
      if (myTierLevel <= 3) {
        bonuses.push({ label: '연승 행진', amount: settings.bonuses.streak });
      } else {
        // 상위 연승
        bonuses.push({ label: '상위 연승', amount: 5 });
      }
    }

    // 6. 명승부 보너스 (1~3점 차 접전 승리)
    if (scoreDiff === 1) {
      bonuses.push({ label: '1점차 명승부', amount: settings.bonuses.closeMatch[1] });
    } else if (scoreDiff === 2) {
      bonuses.push({ label: '2점차 명승부', amount: settings.bonuses.closeMatch[2] });
    } else if (scoreDiff === 3) {
      bonuses.push({ label: '3점차 명승부', amount: settings.bonuses.closeMatch[3] });
    }

    // 7. 불굴의 의지 (연패 탈출)
    if (student.currentStreak <= -5) {
      bonuses.push({ label: '불굴의 의지 (5연패 탈출)', amount: settings.bonuses.tenacity[2] });
    } else if (student.currentStreak === -4) {
      bonuses.push({ label: '불굴의 의지 (4연패 탈출)', amount: settings.bonuses.tenacity[1] });
    } else if (student.currentStreak === -3) {
      bonuses.push({ label: '불굴의 의지 (3연패 탈출)', amount: settings.bonuses.tenacity[0] });
    }

    // 8. 복식 캐리 보너스 (2:2 경기에서 상위 플레이어가 1티어 이상 낮은 짝과 승리)
    if (winningStudents.length === 2) {
      const partner = winningStudents[1 - idx];
      const partnerTierLevel = getTierLevel(getStudentTier(partner, settings));
      if (myTierLevel >= 4 && myTierLevel - partnerTierLevel >= 1) {
        const carryAmount = prevTier === 'diamond' ? settings.bonuses.carry.diamond : settings.bonuses.carry.platinum;
        bonuses.push({ label: '후배 견인 (캐리)', amount: carryAmount });
      }
    }

    const totalDelta = baseWin + bonuses.reduce((a, b) => a + b.amount, 0);
    const newRP = prevRP + totalDelta;
    const newTier = getStudentTier({ ...student, rp: newRP, matchesPlayed: student.matchesPlayed + 1 }, settings);

    results.push({
      studentId: student.id,
      name: student.name,
      previousRP: prevRP,
      newRP,
      delta: totalDelta,
      previousTier: prevTier,
      newTier,
      breakdown: { base: baseWin, bonuses, penalties }
    });
  });

  // Process Losers
  losingStudents.forEach((student) => {
    const prevRP = student.rp;
    const prevTier = getStudentTier(student, settings);
    const tierKey = prevTier === 'unranked' ? 'bronze' : prevTier;
    const baseLoss = settings.basePoints[tierKey].loss; // negative number

    const bonuses: { label: string; amount: number }[] = [];
    const penalties: { label: string; amount: number }[] = [];

    const myTierLevel = getTierLevel(prevTier);

    // 1. 접전 패배 위로금 (1~3점 차 접전은 진 쪽도 보상)
    if (scoreDiff === 1) {
      bonuses.push({ label: '1점차 분전 보너스', amount: 4 });
    } else if (scoreDiff === 2) {
      bonuses.push({ label: '2점차 분전 보너스', amount: 2 });
    }

    // 2. 패배 위로 (2연패 중인 실버 이하는 패배 위로금 지급)
    if (myTierLevel <= 2 && student.currentStreak <= -2) {
      bonuses.push({ label: '패배 위로금', amount: settings.bonuses.defeatComfort });
    }

    // 3. 신규 매치 보너스 (진 쪽도 다양한 상대와 붙으면 보너스)
    const opponentIds = winningStudents.map(o => o.id);
    const recentOpponents = student.opponentHistory.slice(-5);
    const hasNewOpponent = opponentIds.some(id => !recentOpponents.includes(id));
    if (hasNewOpponent) {
      bonuses.push({ label: '신규 매치 참여', amount: settings.bonuses.newMatch });
    }

    // --- 패널티 (골드 이상 상위권에만 적용) ---
    if (myTierLevel >= 3) {
      // 4. 오만함의 대가 (2티어 이상 하위에게 패배 시 감점)
      const tierGap = myTierLevel - Math.round(avgWinningTierLevel);
      if (tierGap >= 2) {
        let arrogancePenalty = 0;
        if (prevTier === 'gold') arrogancePenalty = settings.penalties.arrogance.gold;
        else if (prevTier === 'platinum') arrogancePenalty = settings.penalties.arrogance.platinum;
        else if (prevTier === 'diamond') arrogancePenalty = settings.penalties.arrogance.diamond;

        penalties.push({ label: '하위 티어 패배 감점', amount: -arrogancePenalty });
      }

      // 5. 굴욕적 완패 (10점 차 이상 대패)
      if (scoreDiff >= 10) {
        const idx = Math.min(2, myTierLevel - 3);
        penalties.push({ label: '10점차 완패 감점', amount: -settings.penalties.crushingDefeat[idx] });
      }

      // 6. 챔피언의 무게 (플래티넘/다이아는 기본 패배 시 추가 무게)
      if (prevTier === 'platinum') {
        penalties.push({ label: '플래티넘의 무게', amount: -settings.penalties.championWeight.platinum });
      } else if (prevTier === 'diamond') {
        penalties.push({ label: '다이아의 무게', amount: -settings.penalties.championWeight.diamond });
      }

      // 7. 늪 (연패 누적 감점)
      if (student.currentStreak <= -2) {
        if (prevTier === 'gold') {
          penalties.push({ label: '늪 (연패 추가 감점)', amount: -settings.penalties.swampStreak.gold });
        } else if (prevTier === 'diamond') {
          penalties.push({ label: '늪 (다이아 연패 감점)', amount: -settings.penalties.swampStreak.diamond });
        }
      }
    }

    const bonusSum = bonuses.reduce((a, b) => a + b.amount, 0);
    const penaltySum = penalties.reduce((a, b) => a + b.amount, 0);
    const totalDelta = baseLoss + bonusSum + penaltySum;

    // Minimum RP 500 safety floor
    const newRP = Math.max(500, prevRP + totalDelta);
    const newTier = getStudentTier({ ...student, rp: newRP, matchesPlayed: student.matchesPlayed + 1 }, settings);

    results.push({
      studentId: student.id,
      name: student.name,
      previousRP: prevRP,
      newRP,
      delta: totalDelta,
      previousTier: prevTier,
      newTier,
      breakdown: { base: baseLoss, bonuses, penalties }
    });
  });

  return results;
}

import React, { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Student, Tier } from '../types/league';
import { getStudentTier, getNextTierInfo, TIER_COLORS, TIER_NAMES } from '../utils/ratingEngine';
import { Shield, Sparkles, Maximize, Minimize, Trophy, Flame } from 'lucide-react';

export const ClassroomDisplayView: React.FC = () => {
  const { league } = useLeague();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Name Masking helper: "강민준" -> "강○준", "김도윤" -> "김○윤", "김민" -> "김○"
  const maskName = (name: string): string => {
    if (!name) return '';
    if (name.length <= 1) return name;
    if (name.length === 2) return `${name[0]}○`;
    return `${name[0]}${'○'.repeat(name.length - 2)}${name[name.length - 1]}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Group students by tier
  const tierOrder: Tier[] = ['diamond', 'platinum', 'gold', 'silver', 'bronze', 'unranked'];

  const studentsByTier: Record<Tier, Student[]> = {
    diamond: [],
    platinum: [],
    gold: [],
    silver: [],
    bronze: [],
    unranked: []
  };

  league.students.forEach(s => {
    const tier = getStudentTier(s, league.settings);
    studentsByTier[tier].push(s);
  });

  // Sort each tier group by RP descending
  tierOrder.forEach(t => {
    studentsByTier[t].sort((a, b) => b.rp - a.rp);
  });

  return (
    <div className={`space-y-5 ${isFullscreen ? 'p-6 bg-[#FFF7EC] min-h-screen' : ''}`}>
      {/* Top Banner Notice */}
      <div className="bg-[#FFFDF8] rounded-3xl border-2 border-[#EAD9BE] p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="px-3 py-1 rounded-full bg-[#E1F6EF] text-[#1c8f6f] text-xs font-bold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> 전자칠판 전용 읽기 모드
            </span>
            <span className="text-xs text-[#7A6A56]">
              조작 버튼 비활성화 · 개인정보 보호 이름 마스킹
            </span>
          </div>
          <h2 className="font-hand font-bold text-3xl sm:text-4xl text-[#2E2A26]">
            {league.leagueName} — 우리들의 도전 등급
          </h2>
          <p className="text-sm text-[#7A6A56]">
            등수는 없습니다. 각자의 속도에 맞춰 다음 등급으로 한 걸음씩 올라가 봐요! 🏃‍♂️
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleFullscreen}
            className="touch-btn px-4 py-2.5 rounded-2xl bg-white border border-[#EAD9BE] text-[#2E2A26] font-bold text-sm flex items-center gap-2 hover:bg-[#FBEEDA] shadow-xs"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            <span>{isFullscreen ? '전체화면 종료' : '칠판 전체화면'}</span>
          </button>
        </div>
      </div>

      {/* Tier Category Cards */}
      <div className="space-y-6">
        {tierOrder.map(tier => {
          const students = studentsByTier[tier];
          if (students.length === 0) return null;
          const colors = TIER_COLORS[tier];

          return (
            <div
              key={tier}
              className="bg-[#FFFDF8] rounded-3xl border-2 border-[#EAD9BE] overflow-hidden shadow-xs"
            >
              {/* Tier Header Bar */}
              <div className={`px-5 py-3.5 flex items-center justify-between border-b border-[#EAD9BE] ${colors.bg}`}>
                <div className="flex items-center gap-2.5">
                  <Trophy className={`w-5 h-5 ${colors.text}`} />
                  <h3 className={`font-hand font-bold text-2xl ${colors.text}`}>
                    {TIER_NAMES[tier]} 리그
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/80 font-bold text-[#2E2A26]">
                    {students.length}명
                  </span>
                </div>
                <span className="text-xs font-medium text-[#7A6A56]">
                  {tier === 'unranked' ? '배치 진행 중' : `기준: ${league.settings.thresholds[tier as keyof typeof league.settings.thresholds] || 0} RP 이상`}
                </span>
              </div>

              {/* Student Grid */}
              <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {students.map(student => {
                  const nextInfo = getNextTierInfo(student, league.settings);
                  const isWinStreak = student.currentStreak >= 2;

                  return (
                    <div
                      key={student.id}
                      className="bg-white rounded-2xl border border-[#EAD9BE] p-3.5 flex items-center justify-between gap-3 shadow-2xs hover:border-[#F2A33C] transition-all"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-[#2E2A26] tracking-wide">
                            {maskName(student.name)}
                          </span>
                          <span className="text-xs text-stone-400 font-medium">
                            {student.studentNum}번
                          </span>
                          {isWinStreak && (
                            <span className="flex items-center gap-0.5 text-[11px] px-1.5 py-0.2 rounded-md bg-orange-100 text-orange-700 font-bold">
                              <Flame className="w-3 h-3 fill-orange-500" /> {student.currentStreak}연승
                            </span>
                          )}
                        </div>

                        {/* Next Tier Progress Bar / Target */}
                        {nextInfo ? (
                          <div className="text-xs text-[#7A6A56] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#F2A33C]" />
                            <span>
                              다음 <b>{nextInfo.nextTier}</b>까지{' '}
                              <b className="text-[#C77A2C]">
                                {tier === 'unranked' ? `${nextInfo.pointsNeeded}경기` : `${nextInfo.pointsNeeded}점`}
                              </b>
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-[#1c8f6f] font-bold">
                            ✨ 최고 등급 달성!
                          </div>
                        )}
                      </div>

                      {/* Current RP Badge */}
                      <div className="text-right shrink-0">
                        <span className="text-base font-extrabold text-[#2E2A26] font-mono">
                          {tier === 'unranked' ? '???' : student.rp}
                        </span>
                        <div className="text-[10px] text-stone-400">
                          {student.wins}승 {student.losses}패
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

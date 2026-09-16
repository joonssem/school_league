import React, { useEffect } from 'react';
import { useLeague } from '../context/LeagueContext';
import { calculateHighlights } from '../utils/awardsEngine';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Award, Users, TrendingUp, Zap, Flame, Crown } from 'lucide-react';

export const HighlightsView: React.FC = () => {
  const { league } = useLeague();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMatches = league.matches.filter(m => m.date === todayStr);

  const awards = calculateHighlights(todayMatches, league.students);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  useEffect(() => {
    if (awards.length > 0) {
      triggerConfetti();
    }
  }, [awards.length]);

  const getAwardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users': return <Users className="w-6 h-6 text-emerald-600" />;
      case 'TrendingUp': return <TrendingUp className="w-6 h-6 text-amber-600" />;
      case 'Zap': return <Zap className="w-6 h-6 text-indigo-600" />;
      case 'Flame': return <Flame className="w-6 h-6 text-rose-600" />;
      case 'Crown': return <Crown className="w-6 h-6 text-yellow-600" />;
      default: return <Award className="w-6 h-6 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-[#FFFDF8] rounded-3xl border-2 border-[#EAD9BE] p-5 sm:p-7 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBEEDA] text-[#C77A2C] text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" /> 수업 마무리 5분 하이라이트
          </div>
          <h2 className="font-hand font-bold text-3xl sm:text-4xl text-[#2E2A26]">
            오늘의 빛나는 선수들 🏆
          </h2>
          <p className="text-sm text-[#7A6A56]">
            오늘 치러진 경기 기록을 바탕으로 모든 분야에서 활약한 친구들을 골고루 시상합니다!
          </p>
        </div>

        <button
          onClick={triggerConfetti}
          className="touch-btn px-5 py-3 rounded-2xl bg-[#F2A33C] text-white font-bold text-base flex items-center gap-2 shadow-md hover:bg-[#C77A2C] active:scale-95"
        >
          <Sparkles className="w-5 h-5" />
          <span>축하 폭죽 터뜨리기 🎉</span>
        </button>
      </div>

      {/* Awards Grid */}
      {awards.length === 0 ? (
        <div className="bg-[#FFFDF8] rounded-3xl border-2 border-dashed border-[#EAD9BE] p-10 text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF7EC] flex items-center justify-center text-[#C77A2C]">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="font-hand font-bold text-2xl text-[#2E2A26]">
            오늘 진행된 경기 결과가 아직 없습니다.
          </h3>
          <p className="text-sm text-[#7A6A56] max-w-md mx-auto">
            [대기열 & 경기] 탭에서 경기를 치르고 점수를 입력하면, 자동으로 오늘의 주인공들이 선정됩니다!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {awards.map(award => (
            <div
              key={award.id}
              className="bg-[#FFFDF8] rounded-3xl border-2 border-[#EAD9BE] p-5 shadow-sm hover:border-[#F2A33C] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-hand font-bold text-xl text-[#2E2A26]">
                    {award.title}
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-white border border-[#EAD9BE] flex items-center justify-center shadow-2xs">
                    {getAwardIcon(award.icon)}
                  </div>
                </div>

                <div className="my-3 py-2 px-3.5 rounded-2xl bg-[#FFF7EC] border border-[#EAD9BE]">
                  <div className="text-2xl font-extrabold text-[#2E2A26] flex items-center gap-2">
                    <span>{award.studentName}</span>
                    <span className="text-xs font-normal text-[#7A6A56] px-2 py-0.5 rounded-full bg-white border border-[#EAD9BE]">
                      {award.gradeClassNum}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[#7A6A56] leading-relaxed">
                  {award.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F4ECE1] text-[11px] text-stone-400 text-right">
                독점 방지 공정 시상 적용됨 ✨
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

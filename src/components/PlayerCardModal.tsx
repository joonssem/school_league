import React from 'react';
import { Student, League } from '../types/league';
import { getStudentTier, getNextTierInfo, TIER_COLORS, TIER_NAMES } from '../utils/ratingEngine';
import { X, Trophy, Flame, Calendar } from 'lucide-react';

interface PlayerCardModalProps {
  student: Student;
  league: League;
  onClose: () => void;
}

export const PlayerCardModal: React.FC<PlayerCardModalProps> = ({
  student,
  league,
  onClose
}) => {
  const tier = getStudentTier(student, league.settings);
  const colors = TIER_COLORS[tier];
  const nextInfo = getNextTierInfo(student, league.settings);
  const winRate = student.matchesPlayed > 0
    ? Math.round((student.wins / student.matchesPlayed) * 100)
    : 0;

  // Find recent matches involving this student
  const studentMatches = league.matches
    .filter(m => m.teamA.studentIds.includes(student.id) || m.teamB.studentIds.includes(student.id))
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FFFDF8] w-full max-w-lg rounded-3xl border-2 border-[#EAD9BE] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-150">
        {/* Modal Top Card Header */}
        <div className={`p-6 border-b border-[#EAD9BE] ${colors.bg} relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-stone-600 shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#EAD9BE] flex items-center justify-center text-2xl font-bold shadow-xs">
              {student.name.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-hand font-bold text-3xl text-[#2E2A26]">
                  {student.name}
                </h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold bg-white/90 ${colors.text}`}>
                  {TIER_NAMES[tier]}
                </span>
              </div>
              <p className="text-xs text-[#7A6A56] mt-0.5">
                {student.grade}학년 {student.classNum}반 {student.studentNum}번 · {student.gender === 'M' ? '남학생' : student.gender === 'F' ? '여학생' : '학생'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[75dvh]">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#FFF7EC] p-3 rounded-2xl border border-[#EAD9BE] text-center">
              <span className="text-xs text-[#7A6A56] block">현재 RP</span>
              <span className="text-2xl font-extrabold text-[#C77A2C] font-mono">{student.rp}</span>
            </div>
            <div className="bg-[#FFF7EC] p-3 rounded-2xl border border-[#EAD9BE] text-center">
              <span className="text-xs text-[#7A6A56] block">통산 승률</span>
              <span className="text-2xl font-extrabold text-[#2E2A26] font-mono">{winRate}%</span>
            </div>
            <div className="bg-[#FFF7EC] p-3 rounded-2xl border border-[#EAD9BE] text-center">
              <span className="text-xs text-[#7A6A56] block">전적</span>
              <span className="text-lg font-bold text-[#2E2A26] mt-0.5 block">
                {student.wins}승 {student.losses}패
              </span>
            </div>
          </div>

          {/* Streaks & Next Goal */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#EAD9BE] space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#7A6A56] flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" /> 현재 연승/연패:
              </span>
              <span className="font-bold">
                {student.currentStreak > 0
                  ? `🔥 ${student.currentStreak}연승 중`
                  : student.currentStreak < 0
                  ? `💧 ${Math.abs(student.currentStreak)}연패 중`
                  : '-'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-[#7A6A56] flex items-center gap-1">
                <Trophy className="w-4 h-4 text-amber-500" /> 최다 연승 기록:
              </span>
              <span className="font-bold">{student.highestStreak}연승</span>
            </div>

            {nextInfo && (
              <div className="pt-2 border-t border-[#F4ECE1] flex items-center justify-between text-sm">
                <span className="text-[#7A6A56]">다음 등급 목표:</span>
                <span className="font-bold text-[#C77A2C]">
                  {nextInfo.nextTier}까지 {nextInfo.pointsNeeded}{tier === 'unranked' ? '경기' : '점'}
                </span>
              </div>
            )}
          </div>

          {/* Recent 5 Matches */}
          <div className="space-y-2">
            <h4 className="font-hand font-bold text-xl text-[#2E2A26] flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#C77A2C]" /> 최근 5경기 전적
            </h4>
            {studentMatches.length === 0 ? (
              <p className="text-xs text-stone-400 p-3 bg-stone-50 rounded-xl text-center">
                아직 진행된 경기 기록이 없습니다.
              </p>
            ) : (
              <div className="space-y-1.5">
                {studentMatches.map(m => {
                  const isA = m.teamA.studentIds.includes(student.id);
                  const isWin = (isA && m.winner === 'teamA') || (!isA && m.winner === 'teamB');
                  const oppTeam = isA ? m.teamB : m.teamA;
                  const myScore = isA ? m.teamA.score : m.teamB.score;
                  const oppScore = isA ? m.teamB.score : m.teamA.score;

                  return (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-xl bg-white border border-[#EAD9BE] flex items-center justify-between text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                          isWin ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isWin ? '승리' : '패배'}
                        </span>
                        <span className="font-medium text-[#2E2A26]">
                          vs {oppTeam.names.join(', ')}
                        </span>
                      </div>
                      <div className="font-mono font-bold text-[#7A6A56]">
                        {myScore} : {oppScore}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Teacher's Consultation Guide Tip */}
          <div className="p-3 bg-[#E1F6EF] rounded-2xl border border-[#A2E2CD] text-xs text-[#1c8f6f]">
            💡 <b>교사 상담 팁</b>: 상대한 친구 수({new Set(student.opponentHistory).size}명)와 연패 후 재도전 기록을 바탕으로 학생의 교우관계 및 체육 수업 참여 태도를 긍정적으로 상담할 수 있습니다.
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FFF7EC] border-t border-[#EAD9BE] flex justify-end">
          <button
            onClick={onClose}
            className="touch-btn px-6 py-2.5 rounded-2xl bg-[#2E2A26] text-white font-bold text-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

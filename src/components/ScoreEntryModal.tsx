import React, { useState, useEffect } from 'react';
import { useLeague } from '../context/LeagueContext';
import { QueueItem, Student } from '../types/league';
import { getStudentTier, TIER_COLORS, TIER_NAMES } from '../utils/ratingEngine';
import { X, Delete, Check, RotateCcw, ArrowRight } from 'lucide-react';

interface ScoreEntryModalProps {
  queueItem: QueueItem | null;
  onClose: () => void;
  // If free match, allow picking students manually
  isFreeMatch?: boolean;
}

export const ScoreEntryModal: React.FC<ScoreEntryModalProps> = ({
  queueItem,
  onClose,
  isFreeMatch = false
}) => {
  const { league, submitMatchResult } = useLeague();

  const [teamAIds, setTeamAIds] = useState<string[]>(queueItem ? queueItem.teamA : []);
  const [teamBIds, setTeamBIds] = useState<string[]>(queueItem ? queueItem.teamB : []);
  const [scoreA, setScoreA] = useState<string>('0');
  const [scoreB, setScoreB] = useState<string>('0');
  const [activeSide, setActiveSide] = useState<'A' | 'B'>('A');

  useEffect(() => {
    if (queueItem) {
      setTeamAIds(queueItem.teamA);
      setTeamBIds(queueItem.teamB);
      setScoreA('0');
      setScoreB('0');
      setActiveSide('A');
    }
  }, [queueItem]);

  const teamAStudents = league.students.filter(s => teamAIds.includes(s.id));
  const teamBStudents = league.students.filter(s => teamBIds.includes(s.id));

  const numA = parseInt(scoreA, 10) || 0;
  const numB = parseInt(scoreB, 10) || 0;

  const handleKeyPress = (val: string) => {
    if (activeSide === 'A') {
      if (val === 'C') setScoreA('0');
      else if (val === 'DEL') setScoreA(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      else setScoreA(prev => prev === '0' ? val : (prev + val).slice(0, 3));
    } else {
      if (val === 'C') setScoreB('0');
      else if (val === 'DEL') setScoreB(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      else setScoreB(prev => prev === '0' ? val : (prev + val).slice(0, 3));
    }
  };

  const setQuickScore = (side: 'A' | 'B', targetScore: number) => {
    if (side === 'A') setScoreA(targetScore.toString());
    else setScoreB(targetScore.toString());
  };

  const handleSave = () => {
    if (teamAIds.length === 0 || teamBIds.length === 0) {
      alert('양 팀 선수를 모두 지정해야 합니다.');
      return;
    }
    submitMatchResult(
      queueItem ? queueItem.id : null,
      teamAIds,
      teamBIds,
      numA,
      numB
    );
    onClose();
  };

  const renderStudentBadge = (student: Student) => {
    const tier = getStudentTier(student, league.settings);
    const colors = TIER_COLORS[tier];
    return (
      <div key={student.id} className="flex items-center gap-1.5 bg-[#FFFDF8] px-3 py-1.5 rounded-xl border border-[#EAD9BE] shadow-xs">
        <span className="font-bold text-base text-[#2E2A26]">{student.name}</span>
        <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${colors.bg} ${colors.text}`}>
          {TIER_NAMES[tier]} ({student.rp})
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FFF7EC] w-full max-w-xl rounded-3xl border-2 border-[#EAD9BE] shadow-2xl overflow-hidden flex flex-col max-h-[95dvh] animate-in fade-in zoom-in duration-150">
        {/* Modal Header */}
        <div className="bg-[#FFFDF8] px-5 py-3.5 border-b border-[#EAD9BE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F2A33C]" />
            <h3 className="font-hand font-bold text-2xl text-[#2E2A26]">
              {queueItem ? `코트 ${queueItem.courtNumber || 1} 경기 결과 입력` : '자유 대진 결과 입력'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-stone-200/60 flex items-center justify-center text-[#7A6A56]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Free match student pickers if no queue item */}
          {isFreeMatch && (
            <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-2xl border border-[#EAD9BE]">
              <div>
                <label className="text-xs font-bold text-[#7A6A56] mb-1 block">A팀 선수 선택</label>
                <select
                  value={teamAIds[0] || ''}
                  onChange={e => setTeamAIds(e.target.value ? [e.target.value] : [])}
                  className="w-full p-2.5 rounded-xl border border-[#EAD9BE] bg-[#FFFDF8] text-base font-medium"
                >
                  <option value="">선수 선택...</option>
                  {league.students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.studentNum}번)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#7A6A56] mb-1 block">B팀 선수 선택</label>
                <select
                  value={teamBIds[0] || ''}
                  onChange={e => setTeamBIds(e.target.value ? [e.target.value] : [])}
                  className="w-full p-2.5 rounded-xl border border-[#EAD9BE] bg-[#FFFDF8] text-base font-medium"
                >
                  <option value="">선수 선택...</option>
                  {league.students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.studentNum}번)</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Score Boards (Team A vs Team B) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 items-center">
            {/* Team A Board */}
            <div
              onClick={() => setActiveSide('A')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center ${
                activeSide === 'A'
                  ? 'border-[#F2A33C] bg-white ring-4 ring-[#F2A33C]/20 shadow-md'
                  : 'border-[#EAD9BE] bg-white/70 hover:bg-white'
              }`}
            >
              <div className="flex flex-wrap gap-1 justify-center mb-2">
                {teamAStudents.length > 0 ? (
                  teamAStudents.map(renderStudentBadge)
                ) : (
                  <span className="text-sm text-stone-400">선수 미지정</span>
                )}
              </div>
              <div className="text-5xl sm:text-6xl font-extrabold text-[#2E2A26] font-mono tracking-tight py-2">
                {scoreA}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold mt-1 ${
                numA > numB ? 'bg-[#3CC9A0] text-white' : 'bg-stone-100 text-stone-500'
              }`}>
                {numA > numB ? '👑 리드 중' : 'A팀'}
              </span>
            </div>

            {/* Team B Board */}
            <div
              onClick={() => setActiveSide('B')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center ${
                activeSide === 'B'
                  ? 'border-[#F2A33C] bg-white ring-4 ring-[#F2A33C]/20 shadow-md'
                  : 'border-[#EAD9BE] bg-white/70 hover:bg-white'
              }`}
            >
              <div className="flex flex-wrap gap-1 justify-center mb-2">
                {teamBStudents.length > 0 ? (
                  teamBStudents.map(renderStudentBadge)
                ) : (
                  <span className="text-sm text-stone-400">선수 미지정</span>
                )}
              </div>
              <div className="text-5xl sm:text-6xl font-extrabold text-[#2E2A26] font-mono tracking-tight py-2">
                {scoreB}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold mt-1 ${
                numB > numA ? 'bg-[#3CC9A0] text-white' : 'bg-stone-100 text-stone-500'
              }`}>
                {numB > numA ? '👑 리드 중' : 'B팀'}
              </span>
            </div>
          </div>

          {/* Quick Point Increments */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs text-[#7A6A56] font-medium mr-1">
              현재 입력 대상: <b className="text-[#C77A2C]">{activeSide}팀</b>
            </span>
            <button
              onClick={() => {
                const cur = activeSide === 'A' ? numA : numB;
                setQuickScore(activeSide, cur + 1);
              }}
              className="touch-btn text-xs px-2.5 py-1 rounded-lg bg-white border border-[#EAD9BE] font-bold text-[#2E2A26]"
            >
              +1점
            </button>
            <button
              onClick={() => setQuickScore(activeSide, 11)}
              className="touch-btn text-xs px-2.5 py-1 rounded-lg bg-[#FBEEDA] border border-[#EAD9BE] font-bold text-[#C77A2C]"
            >
              11점 승리
            </button>
            <button
              onClick={() => setQuickScore(activeSide, 15)}
              className="touch-btn text-xs px-2.5 py-1 rounded-lg bg-[#FBEEDA] border border-[#EAD9BE] font-bold text-[#C77A2C]"
            >
              15점 승리
            </button>
            <button
              onClick={() => setQuickScore(activeSide, 21)}
              className="touch-btn text-xs px-2.5 py-1 rounded-lg bg-[#FBEEDA] border border-[#EAD9BE] font-bold text-[#C77A2C]"
            >
              21점 승리
            </button>
            <button
              onClick={() => setActiveSide(prev => prev === 'A' ? 'B' : 'A')}
              className="touch-btn text-xs px-2.5 py-1 rounded-lg bg-[#E1F6EF] text-[#1c8f6f] border border-[#A2E2CD] font-bold flex items-center gap-1"
            >
              반대팀 입력 <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* iPad Optimized Touch Numeric Keypad */}
          <div className="bg-white p-3 rounded-2xl border border-[#EAD9BE] shadow-xs">
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num.toString())}
                  className="touch-btn h-14 sm:h-16 rounded-xl bg-[#FFFDF8] border border-[#EAD9BE] text-2xl sm:text-3xl font-bold text-[#2E2A26] flex items-center justify-center hover:bg-[#FBEEDA] active:bg-[#F2A33C] active:text-white"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleKeyPress('C')}
                className="touch-btn h-14 sm:h-16 rounded-xl bg-stone-100 border border-stone-300 text-stone-600 font-bold text-lg sm:text-xl flex items-center justify-center active:bg-stone-200"
              >
                <RotateCcw className="w-5 h-5 mr-1" /> C
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="touch-btn h-14 sm:h-16 rounded-xl bg-[#FFFDF8] border border-[#EAD9BE] text-2xl sm:text-3xl font-bold text-[#2E2A26] flex items-center justify-center hover:bg-[#FBEEDA] active:bg-[#F2A33C] active:text-white"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('DEL')}
                className="touch-btn h-14 sm:h-16 rounded-xl bg-stone-100 border border-stone-300 text-stone-600 font-bold text-lg sm:text-xl flex items-center justify-center active:bg-stone-200"
              >
                <Delete className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#FFFDF8] p-4 border-t border-[#EAD9BE] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="touch-btn px-4 py-3 rounded-2xl border border-stone-300 text-stone-600 font-medium hover:bg-stone-100 min-h-[52px]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={numA === numB}
            className={`touch-btn flex-1 py-3 px-6 rounded-2xl font-bold text-lg sm:text-xl flex items-center justify-center gap-2 shadow-md min-h-[52px] ${
              numA === numB
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-[#F2A33C] text-white hover:bg-[#C77A2C] active:scale-95'
            }`}
          >
            <Check className="w-6 h-6" />
            <span>{numA === numB ? '동점은 불가 (승자 결정 필요)' : '경기 결과 저장하기'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

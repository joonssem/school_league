import React, { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Student } from '../types/league';
import { getStudentTier, TIER_COLORS, TIER_NAMES } from '../utils/ratingEngine';
import { ScoreEntryModal } from './ScoreEntryModal';
import {
  Users,
  Play,
  Plus,
  Trash2,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  History,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export const QueueView: React.FC = () => {
  const {
    league,
    matchmakingMode,
    setMatchmakingMode,
    scoringQueueItem,
    setScoringQueueItem,
    toggleAbsent,
    generateRound,
    addOneMatch,
    removeQueueItem,
    clearQueue
  } = useLeague();

  const [selectedClassFilter, setSelectedClassFilter] = useState<number | 'all'>('all');
  const [isDoubles, setIsDoubles] = useState(false);
  const [showRecentMatches, setShowRecentMatches] = useState(false);

  // Extract distinct classes
  const distinctClasses = Array.from(new Set(league.students.map(s => s.classNum))).sort();

  // Filter students by selected class
  const filteredStudents = selectedClassFilter === 'all'
    ? league.students
    : league.students.filter(s => s.classNum === selectedClassFilter);

  const presentCount = filteredStudents.filter(s => !league.absentStudentIds.includes(s.id)).length;
  const absentCount = filteredStudents.filter(s => league.absentStudentIds.includes(s.id)).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayMatches = league.matches.filter(m => m.date === todayStr);

  const renderStudentChip = (student: Student) => {
    const isAbsent = league.absentStudentIds.includes(student.id);
    const tier = getStudentTier(student, league.settings);
    const colors = TIER_COLORS[tier];

    return (
      <button
        key={student.id}
        onClick={() => toggleAbsent(student.id)}
        className={`touch-btn text-xs sm:text-sm px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
          isAbsent
            ? 'bg-stone-100 text-stone-400 border-stone-300 line-through opacity-60'
            : 'bg-white border-[#EAD9BE] text-[#2E2A26] hover:border-[#F2A33C] shadow-2xs'
        }`}
        title={isAbsent ? '결석 (누르면 출석)' : '출석 (누르면 결석 처리)'}
      >
        <span className="font-semibold">{student.studentNum}. {student.name}</span>
        {!isAbsent && (
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${colors.bg} ${colors.text}`}>
            {student.rp}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Attendance & Class Selector Banner */}
      <section className="bg-[#FFFDF8] rounded-3xl border border-[#EAD9BE] p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-[#F4ECE1]">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C77A2C]" />
            <h2 className="font-hand font-bold text-xl sm:text-2xl text-[#2E2A26]">
              출석 및 참여 관리
            </h2>
            <span className="text-xs text-[#7A6A56]">
              (안 온 학생을 탭하면 대진에서 제외됩니다)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs text-[#7A6A56] font-medium bg-[#FFF7EC] px-3 py-1.5 rounded-xl border border-[#EAD9BE]">
              출석 <b className="text-[#1c8f6f]">{presentCount}</b>명 / 결석 <b className="text-[#E8938A]">{absentCount}</b>명
            </div>

            {distinctClasses.length > 1 && (
              <div className="flex items-center gap-1 bg-[#FFF7EC] p-1 rounded-xl border border-[#EAD9BE]">
                <button
                  onClick={() => setSelectedClassFilter('all')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                    selectedClassFilter === 'all'
                      ? 'bg-[#F2A33C] text-white shadow-xs'
                      : 'text-[#7A6A56] hover:bg-stone-200/50'
                  }`}
                >
                  전체
                </button>
                {distinctClasses.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedClassFilter(c)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${
                      selectedClassFilter === c
                        ? 'bg-[#F2A33C] text-white shadow-xs'
                        : 'text-[#7A6A56] hover:bg-stone-200/50'
                    }`}
                  >
                    {c}반
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Student Chips */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-36 overflow-y-auto pr-1">
          {filteredStudents.map(renderStudentChip)}
        </div>
      </section>

      {/* 2. Queue Generation & Mode Control Bar */}
      <section className="bg-[#FFFDF8] rounded-3xl border border-[#EAD9BE] p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Matchmaking Mode Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-[#7A6A56] mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> 대진 방식:
            </span>
            {[
              { mode: 'balance' as const, label: '⚖️ 밸런스', desc: '골고루 + 실력' },
              { mode: 'diversity' as const, label: '🤝 다양성', desc: '안 만난 친구 우선' },
              { mode: 'skill' as const, label: '🎯 실력', desc: 'RP 비슷한 매칭' }
            ].map(item => (
              <button
                key={item.mode}
                onClick={() => setMatchmakingMode(item.mode)}
                className={`touch-btn text-xs sm:text-sm px-3 py-1.5 rounded-xl border transition-all ${
                  matchmakingMode === item.mode
                    ? 'bg-[#2E2A26] text-white border-[#2E2A26] shadow-xs'
                    : 'bg-[#FFF7EC] text-[#7A6A56] border-[#EAD9BE] hover:bg-[#FBEEDA]'
                }`}
                title={item.desc}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => setIsDoubles(prev => !prev)}
              className={`touch-btn text-xs sm:text-sm px-2.5 py-1.5 rounded-xl border transition-all ml-1 ${
                isDoubles
                  ? 'bg-[#3CC9A0] text-white border-[#2fb28d] font-bold'
                  : 'bg-[#FFF7EC] text-[#7A6A56] border-[#EAD9BE]'
              }`}
            >
              {isDoubles ? '🏸 2:2 복식 모드 ON' : '1:1 단식 모드'}
            </button>
          </div>

          {/* Action Generation Buttons (Big touch targets for iPad) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => generateRound(isDoubles)}
              className="touch-btn flex-1 sm:flex-none text-base sm:text-lg px-5 py-2.5 rounded-2xl bg-[#F2A33C] text-white font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#C77A2C] min-h-[48px]"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>한 바퀴 (전원 배정)</span>
            </button>

            <button
              onClick={() => addOneMatch(isDoubles)}
              className="touch-btn text-sm sm:text-base px-4 py-2.5 rounded-2xl bg-[#FFF7EC] border-2 border-[#EAD9BE] text-[#2E2A26] font-bold flex items-center gap-1.5 hover:bg-[#FBEEDA] min-h-[48px]"
            >
              <Plus className="w-4 h-4" />
              <span>+1경기</span>
            </button>

            {league.queue.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('대기열을 모두 비우시겠습니까?')) clearQueue();
                }}
                className="touch-btn p-2.5 rounded-2xl bg-stone-100 text-stone-500 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 min-h-[48px]"
                title="대기열 비우기"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. Waiting Queue List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-hand font-bold text-2xl text-[#2E2A26] flex items-center gap-2">
            <span>진행 대기열</span>
            <span className="text-sm px-2.5 py-0.5 rounded-full bg-[#F2A33C] text-white font-bold font-sans">
              {league.queue.length}경기
            </span>
          </h3>
          <span className="text-xs text-[#7A6A56]">
            경기가 끝나면 오른쪽 화살표( &gt; )를 눌러 점수를 입력하세요
          </span>
        </div>

        {league.queue.length === 0 ? (
          <div className="bg-[#FFFDF8] rounded-3xl border-2 border-dashed border-[#EAD9BE] p-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#FFF7EC] flex items-center justify-center text-[#C77A2C]">
              <Sparkles className="w-7 h-7" />
            </div>
            <h4 className="font-hand font-bold text-2xl text-[#2E2A26]">
              대기열이 비어 있습니다!
            </h4>
            <p className="text-sm text-[#7A6A56] max-w-md mx-auto">
              상단의 <b>[한 바퀴]</b> 버튼을 누르면 놀고 있는 모든 아이들에게 공평하게 1경기씩 대진표가 짜여집니다.
            </p>
            <button
              onClick={() => generateRound(isDoubles)}
              className="touch-btn inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#F2A33C] text-white font-bold text-base shadow-sm hover:bg-[#C77A2C]"
            >
              <Play className="w-4 h-4 fill-white" />
              지금 한 바퀴 대진표 짜기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {league.queue.map((item, idx) => {
              const teamAStudents = league.students.filter(s => item.teamA.includes(s.id));
              const teamBStudents = league.students.filter(s => item.teamB.includes(s.id));

              return (
                <div
                  key={item.id}
                  className="bg-[#FFFDF8] rounded-3xl border-2 border-[#EAD9BE] p-4 flex items-center justify-between gap-3 shadow-xs hover:border-[#F2A33C] transition-all"
                >
                  {/* Left: Court Badge & Teams */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF7EC] border border-[#EAD9BE] flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] text-[#7A6A56] font-medium leading-none">코트</span>
                      <span className="text-xl font-extrabold text-[#C77A2C] leading-tight">
                        {item.courtNumber || (idx + 1)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      {/* Team A */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {teamAStudents.map(s => {
                          const tier = getStudentTier(s, league.settings);
                          const colors = TIER_COLORS[tier];
                          return (
                            <span key={s.id} className="text-sm sm:text-base font-bold text-[#2E2A26] flex items-center gap-1">
                              {s.name}
                              <span className={`text-[10px] px-1 py-0.2 rounded font-semibold ${colors.bg} ${colors.text}`}>
                                {TIER_NAMES[tier]}
                              </span>
                            </span>
                          );
                        })}
                      </div>

                      <div className="text-xs font-bold text-[#C77A2C] tracking-widest pl-1">
                        VS
                      </div>

                      {/* Team B */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {teamBStudents.map(s => {
                          const tier = getStudentTier(s, league.settings);
                          const colors = TIER_COLORS[tier];
                          return (
                            <span key={s.id} className="text-sm sm:text-base font-bold text-[#2E2A26] flex items-center gap-1">
                              {s.name}
                              <span className={`text-[10px] px-1 py-0.2 rounded font-semibold ${colors.bg} ${colors.text}`}>
                                {TIER_NAMES[tier]}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => removeQueueItem(item.id)}
                      className="touch-btn p-2 rounded-xl text-stone-400 hover:text-rose-500 hover:bg-stone-100"
                      title="경기 취소"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Big Right Arrow to Open Score Modal */}
                    <button
                      onClick={() => setScoringQueueItem(item)}
                      className="touch-btn h-14 sm:h-16 px-4 sm:px-5 rounded-2xl bg-[#F2A33C] text-white flex items-center justify-center gap-1 shadow-sm hover:bg-[#C77A2C] active:scale-95"
                      title="점수 입력하기"
                    >
                      <span className="font-bold text-sm sm:text-base hidden sm:inline">점수입력</span>
                      <ChevronRight className="w-6 h-6 stroke-[3]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Today's Matches History Accordion */}
      {todayMatches.length > 0 && (
        <section className="bg-[#FFFDF8] rounded-3xl border border-[#EAD9BE] p-4 sm:p-5 shadow-xs">
          <button
            onClick={() => setShowRecentMatches(prev => !prev)}
            className="w-full flex items-center justify-between text-left font-hand font-bold text-xl sm:text-2xl text-[#2E2A26]"
          >
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#C77A2C]" />
              <span>오늘 완료된 경기 ({todayMatches.length}경기)</span>
            </div>
            <span className="text-xs font-sans text-[#7A6A56] font-normal underline">
              {showRecentMatches ? '접기' : '상세보기'}
            </span>
          </button>

          {showRecentMatches && (
            <div className="mt-4 space-y-2.5 pt-3 border-t border-[#F4ECE1]">
              {todayMatches.map(m => {
                return (
                  <div
                    key={m.id}
                    className="p-3 rounded-2xl bg-[#FFF7EC] border border-[#EAD9BE] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-[#EAD9BE] text-[#7A6A56] font-medium">
                        {m.mode}
                      </span>
                      <div className="text-sm sm:text-base font-bold text-[#2E2A26]">
                        <span className={m.winner === 'teamA' ? 'text-[#C77A2C]' : 'text-[#7A6A56]'}>
                          {m.teamA.names.join(', ')} ({m.teamA.score})
                        </span>
                        <span className="mx-2 text-stone-400">vs</span>
                        <span className={m.winner === 'teamB' ? 'text-[#C77A2C]' : 'text-[#7A6A56]'}>
                          {m.teamB.names.join(', ')} ({m.teamB.score})
                        </span>
                      </div>
                    </div>

                    {/* RP deltas */}
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      {m.rpChanges.map(change => (
                        <span
                          key={change.studentId}
                          className={`px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5 ${
                            change.delta >= 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {change.name}
                          {change.delta >= 0 ? (
                            <><TrendingUp className="w-3 h-3" /> +{change.delta}</>
                          ) : (
                            <><TrendingDown className="w-3 h-3" /> {change.delta}</>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Modal for scoring */}
      {scoringQueueItem && (
        <ScoreEntryModal
          queueItem={scoringQueueItem}
          onClose={() => setScoringQueueItem(null)}
        />
      )}
    </div>
  );
};

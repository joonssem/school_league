import React, { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { Student, Tier } from '../types/league';
import { getStudentTier, TIER_COLORS, TIER_NAMES } from '../utils/ratingEngine';
import { PlayerCardModal } from './PlayerCardModal';
import { Trophy, Search, Flame, ArrowUpDown, ChevronRight } from 'lucide-react';

export const RankingView: React.FC = () => {
  const { league } = useLeague();
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<number | 'all'>('all');
  const [tierFilter, setTierFilter] = useState<Tier | 'all'>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [sortBy, setSortBy] = useState<'rp' | 'num' | 'wins' | 'winrate'>('rp');

  const distinctClasses = Array.from(new Set(league.students.map(s => s.classNum))).sort();

  // Filter students
  const filtered = league.students.filter(student => {
    if (searchQuery && !student.name.includes(searchQuery)) return false;
    if (classFilter !== 'all' && student.classNum !== classFilter) return false;
    if (tierFilter !== 'all' && getStudentTier(student, league.settings) !== tierFilter) return false;
    return true;
  });

  // Sort students
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'rp') return b.rp - a.rp;
    if (sortBy === 'num') return a.studentNum - b.studentNum;
    if (sortBy === 'wins') return b.wins - a.wins;
    if (sortBy === 'winrate') {
      const rateA = a.matchesPlayed > 0 ? a.wins / a.matchesPlayed : 0;
      const rateB = b.matchesPlayed > 0 ? b.wins / b.matchesPlayed : 0;
      return rateB - rateA;
    }
    return 0;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Filter Bar */}
      <section className="bg-[#FFFDF8] rounded-3xl border border-[#EAD9BE] p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#F2A33C]" />
            <h2 className="font-hand font-bold text-2xl sm:text-3xl text-[#2E2A26]">
              전체 랭킹 및 선수 명단
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FBEEDA] text-[#C77A2C] font-bold">
              총 {league.students.length}명
            </span>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="학생 이름 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#EAD9BE] text-sm focus:outline-none focus:border-[#F2A33C]"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-[#F4ECE1]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-[#7A6A56] mr-1">반 필터:</span>
            <button
              onClick={() => setClassFilter('all')}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                classFilter === 'all' ? 'bg-[#2E2A26] text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              전체
            </button>
            {distinctClasses.map(c => (
              <button
                key={c}
                onClick={() => setClassFilter(c)}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                  classFilter === c ? 'bg-[#2E2A26] text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {c}반
              </button>
            ))}

            <span className="text-xs font-bold text-[#7A6A56] ml-2 mr-1">티어 필터:</span>
            <button
              onClick={() => setTierFilter('all')}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                tierFilter === 'all' ? 'bg-[#F2A33C] text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              전체
            </button>
            {(['diamond', 'platinum', 'gold', 'silver', 'bronze', 'unranked'] as Tier[]).map(t => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                  tierFilter === t ? 'bg-[#F2A33C] text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {TIER_NAMES[t]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-[#7A6A56] mr-1 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> 정렬:
            </span>
            {[
              { key: 'rp' as const, label: 'RP 높은순' },
              { key: 'wins' as const, label: '최다 승리순' },
              { key: 'winrate' as const, label: '승률순' },
              { key: 'num' as const, label: '번호순' }
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setSortBy(item.key)}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                  sortBy === item.key ? 'bg-[#F2A33C] text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Student List Table / Card View */}
      <section className="bg-[#FFFDF8] rounded-3xl border border-[#EAD9BE] overflow-hidden shadow-xs">
        <div className="divide-y divide-[#F4ECE1]">
          {sorted.length === 0 ? (
            <div className="p-8 text-center text-[#7A6A56]">
              검색 조건에 맞는 학생이 없습니다.
            </div>
          ) : (
            sorted.map((student, idx) => {
              const tier = getStudentTier(student, league.settings);
              const colors = TIER_COLORS[tier];
              const winRate = student.matchesPlayed > 0
                ? Math.round((student.wins / student.matchesPlayed) * 100)
                : 0;

              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-[#FFF7EC] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Number */}
                    <span className="w-8 text-center font-mono font-bold text-sm text-stone-400 group-hover:text-[#C77A2C]">
                      {idx + 1}
                    </span>

                    {/* Student Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base sm:text-lg text-[#2E2A26]">
                          {student.name}
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${colors.bg} ${colors.text}`}>
                          {TIER_NAMES[tier]}
                        </span>
                        {student.currentStreak >= 2 && (
                          <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded bg-orange-100 text-orange-700 font-bold">
                            <Flame className="w-3 h-3 fill-orange-500" /> {student.currentStreak}연승
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#7A6A56] mt-0.5">
                        {student.grade}학년 {student.classNum}반 {student.studentNum}번 · 총 {student.matchesPlayed}경기 ({student.wins}승 {student.losses}패)
                      </div>
                    </div>
                  </div>

                  {/* Right Side Stats */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-[#7A6A56]">승률</div>
                      <div className="font-mono font-bold text-sm text-[#2E2A26]">{winRate}%</div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-[#7A6A56]">RP</div>
                      <div className="font-mono font-extrabold text-lg text-[#C77A2C] leading-none">
                        {tier === 'unranked' ? '배치 중' : student.rp}
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-[#F2A33C] transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <PlayerCardModal
          student={selectedStudent}
          league={league}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

import React from 'react';
import { useLeague } from '../context/LeagueContext';
import { Trophy, Monitor, Sparkles, Settings, PlusCircle, UserPlus, PlayCircle } from 'lucide-react';

interface TabItem {
  id: 'queue' | 'ranking' | 'classroom' | 'highlights' | 'settings';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  highlight?: boolean;
}

export const Header: React.FC = () => {
  const {
    league,
    activeTab,
    setActiveTab,
    setIsCreateLeagueModalOpen,
    setIsRosterModalOpen,
    setIsFreeMatchModalOpen
  } = useLeague();

  const tabs: TabItem[] = [
    { id: 'queue', label: '대기열 & 경기', icon: PlayCircle, count: league.queue.length },
    { id: 'ranking', label: '랭킹 · 티어', icon: Trophy },
    { id: 'classroom', label: '교실 화면 (전자칠판)', icon: Monitor, highlight: true },
    { id: 'highlights', label: '오늘의 하이라이트', icon: Sparkles },
    { id: 'settings', label: '설정 · 관리', icon: Settings }
  ];

  return (
    <header className="bg-[#FFFDF8] border-b border-[#EAD9BE] sticky top-0 z-30 shadow-xs safe-top">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#F4ECE1]">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-[#F2A33C] text-white flex items-center justify-center shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-hand font-bold text-2xl text-[#2E2A26] leading-none">
                  교실 리그
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FBEEDA] text-[#C77A2C] font-medium">
                  {league.sportName}
                </span>
                <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  {league.schoolName}
                </span>
              </div>
              <p className="text-xs text-[#7A6A56] mt-0.5">
                {league.leagueName} · <span className="text-[#C77A2C] font-medium">{league.seasonName}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons for iPad Teachers */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsFreeMatchModalOpen(true)}
              className="touch-btn text-xs sm:text-sm px-3 py-1.5 rounded-xl bg-[#FFF7EC] border border-[#EAD9BE] text-[#2E2A26] font-medium flex items-center gap-1.5 hover:bg-[#FBEEDA]"
              title="자유 대진 점수 입력"
            >
              <PlayCircle className="w-4 h-4 text-[#F2A33C]" />
              <span className="hidden md:inline">자유 대진</span>
            </button>
            <button
              onClick={() => setIsRosterModalOpen(true)}
              className="touch-btn text-xs sm:text-sm px-3 py-1.5 rounded-xl bg-[#FFF7EC] border border-[#EAD9BE] text-[#2E2A26] font-medium flex items-center gap-1.5 hover:bg-[#FBEEDA]"
              title="나이스 명단 추가"
            >
              <UserPlus className="w-4 h-4 text-[#3CC9A0]" />
              <span className="hidden md:inline">명단 관리</span>
            </button>
            <button
              onClick={() => setIsCreateLeagueModalOpen(true)}
              className="touch-btn text-xs sm:text-sm px-3 py-1.5 rounded-xl bg-[#F2A33C] text-white font-medium flex items-center gap-1.5 shadow-xs hover:bg-[#C77A2C]"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">새 리그</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Optimized for iPad touch) */}
        <nav className="flex items-center gap-1.5 sm:gap-3 pt-2 overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`touch-btn flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap min-h-[44px] ${
                  isActive
                    ? 'bg-[#2E2A26] text-white shadow-xs'
                    : tab.highlight
                    ? 'bg-[#E1F6EF] text-[#1c8f6f] border border-[#A2E2CD]'
                    : 'text-[#7A6A56] hover:bg-[#FBEEDA] hover:text-[#2E2A26]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F2A33C]' : ''}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`ml-1 text-xs px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-[#F2A33C] text-white' : 'bg-[#F2A33C] text-white'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

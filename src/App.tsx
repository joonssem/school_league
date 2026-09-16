import React from 'react';
import { LeagueProvider, useLeague } from './context/LeagueContext';
import { Header } from './components/Header';
import { QueueView } from './components/QueueView';
import { RankingView } from './components/RankingView';
import { ClassroomDisplayView } from './components/ClassroomDisplayView';
import { HighlightsView } from './components/HighlightsView';
import { SettingsView } from './components/SettingsView';
import { CreateLeagueModal } from './components/CreateLeagueModal';
import { RosterPasteModal } from './components/RosterPasteModal';
import { ScoreEntryModal } from './components/ScoreEntryModal';

const MainContent: React.FC = () => {
  const {
    activeTab,
    isFreeMatchModalOpen,
    setIsFreeMatchModalOpen
  } = useLeague();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF7EC] text-[#2E2A26]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 safe-left safe-right safe-bottom">
        {activeTab === 'queue' && <QueueView />}
        {activeTab === 'ranking' && <RankingView />}
        {activeTab === 'classroom' && <ClassroomDisplayView />}
        {activeTab === 'highlights' && <HighlightsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Modals */}
      <CreateLeagueModal />
      <RosterPasteModal />

      {/* Free Match Score Modal */}
      {isFreeMatchModalOpen && (
        <ScoreEntryModal
          queueItem={null}
          isFreeMatch={true}
          onClose={() => setIsFreeMatchModalOpen(false)}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <LeagueProvider>
      <MainContent />
    </LeagueProvider>
  );
}

export default App;

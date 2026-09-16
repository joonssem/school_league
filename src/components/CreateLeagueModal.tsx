import React, { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { TIER_PRESETS } from '../utils/ratingEngine';
import { SAMPLE_NEIS_ROSTER } from '../utils/mockData';
import { parseRosterText } from '../utils/rosterParser';
import { X, PlusCircle, Sparkles, Check } from 'lucide-react';

export const CreateLeagueModal: React.FC = () => {
  const { isCreateLeagueModalOpen, setIsCreateLeagueModalOpen, createNewLeague } = useLeague();

  const [schoolName, setSchoolName] = useState('행복초등학교');
  const [sportName, setSportName] = useState('배드민턴');
  const [leagueName, setLeagueName] = useState('5학년 2반 배드민턴 교실리그');
  const [seasonName, setSeasonName] = useState('2026학년도 1학기');
  const [presetKey, setPresetKey] = useState<keyof typeof TIER_PRESETS>('standard');
  const [rosterText, setRosterText] = useState(SAMPLE_NEIS_ROSTER);

  if (!isCreateLeagueModalOpen) return null;

  const parsedStudents = parseRosterText(rosterText);

  const sportsOptions = ['배드민턴', '탁구', '피클볼', '테니스', '컬링', '알까기', '팔씨름'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedStudents.length < 2) {
      alert('최소 2명 이상의 학생 명단을 입력해야 합니다.');
      return;
    }
    createNewLeague(
      schoolName,
      sportName,
      leagueName,
      seasonName,
      rosterText,
      presetKey
    );
    setIsCreateLeagueModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FFFDF8] w-full max-w-2xl rounded-3xl border-2 border-[#EAD9BE] shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-[#FFF7EC] px-6 py-4 border-b border-[#EAD9BE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-[#F2A33C]" />
            <h3 className="font-hand font-bold text-2xl sm:text-3xl text-[#2E2A26]">
              새 교실 리그 개설하기
            </h3>
          </div>
          <button
            onClick={() => setIsCreateLeagueModalOpen(false)}
            className="w-10 h-10 rounded-full hover:bg-stone-200/60 flex items-center justify-center text-[#7A6A56]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* School & Sport */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#7A6A56] mb-1 block">학교 이름</label>
              <input
                type="text"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                placeholder="예: 서울초등학교"
                className="w-full p-2.5 rounded-xl border border-[#EAD9BE] bg-white text-base font-medium focus:outline-none focus:border-[#F2A33C]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#7A6A56] mb-1 block">종목</label>
              <input
                type="text"
                value={sportName}
                onChange={e => setSportName(e.target.value)}
                placeholder="종목 직접 입력 또는 아래 선택"
                className="w-full p-2.5 rounded-xl border border-[#EAD9BE] bg-white text-base font-medium focus:outline-none focus:border-[#F2A33C]"
                required
              />
            </div>
          </div>

          {/* Quick Sport Selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-[#7A6A56] mr-1">추천 종목:</span>
            {sportsOptions.map(sport => (
              <button
                type="button"
                key={sport}
                onClick={() => {
                  setSportName(sport);
                  setLeagueName(`${schoolName} ${sport} 리그`);
                }}
                className={`touch-btn text-xs px-2.5 py-1 rounded-lg border ${
                  sportName === sport
                    ? 'bg-[#F2A33C] text-white border-[#F2A33C]'
                    : 'bg-white border-[#EAD9BE] text-[#7A6A56] hover:bg-[#FBEEDA]'
                }`}
              >
                {sport}
              </button>
            ))}
          </div>

          {/* League & Season Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#7A6A56] mb-1 block">리그 이름</label>
              <input
                type="text"
                value={leagueName}
                onChange={e => setLeagueName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#EAD9BE] bg-white text-base font-medium focus:outline-none focus:border-[#F2A33C]"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#7A6A56] mb-1 block">시즌 / 학기</label>
              <input
                type="text"
                value={seasonName}
                onChange={e => setSeasonName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#EAD9BE] bg-white text-base font-medium focus:outline-none focus:border-[#F2A33C]"
                required
              />
            </div>
          </div>

          {/* Roster Paste Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#7A6A56] flex items-center gap-1">
                <span>나이스(NEIS) 출석부 명단 붙여넣기</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E1F6EF] text-[#1c8f6f] font-bold">
                  {parsedStudents.length}명 인식됨
                </span>
              </label>
              <button
                type="button"
                onClick={() => setRosterText(SAMPLE_NEIS_ROSTER)}
                className="text-xs text-[#C77A2C] font-bold hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> 샘플 명단 채우기
              </button>
            </div>
            <textarea
              rows={5}
              value={rosterText}
              onChange={e => setRosterText(e.target.value)}
              placeholder="나이스 출석부에서 복사한 내용을 그대로 붙여넣으세요. (예: 5 2 15 홍길동 또는 15 홍길동)"
              className="w-full p-3 rounded-2xl bg-white border border-[#EAD9BE] text-sm font-mono focus:outline-none focus:border-[#F2A33C]"
              required
            />
            <p className="text-[11px] text-[#7A6A56]">
              * "5 2 15 홍길동" 또는 "15 홍길동" 형식으로 엑셀/나이스에서 복사하여 그대로 넣으시면 학년·반·번호를 자동 분리합니다.
            </p>
          </div>

          {/* Tier Preset Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#7A6A56]">리그 운영 성향 프리셋</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(TIER_PRESETS) as (keyof typeof TIER_PRESETS)[]).map(k => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setPresetKey(k)}
                  className={`touch-btn p-2.5 rounded-xl border text-left text-xs ${
                    presetKey === k
                      ? 'border-[#F2A33C] bg-[#FFF7EC] font-bold text-[#2E2A26]'
                      : 'border-[#EAD9BE] bg-white text-[#7A6A56]'
                  }`}
                >
                  {TIER_PRESETS[k].label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-[#F4ECE1] flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateLeagueModalOpen(false)}
              className="touch-btn px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              className="touch-btn px-6 py-2.5 rounded-xl bg-[#F2A33C] text-white font-bold text-base shadow-sm hover:bg-[#C77A2C] flex items-center gap-1.5"
            >
              <Check className="w-5 h-5" />
              <span>리그 개설하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

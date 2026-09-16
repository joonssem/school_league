import React, { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { parseRosterText } from '../utils/rosterParser';
import { X, UserPlus, Check, Sparkles } from 'lucide-react';
import { SAMPLE_NEIS_ROSTER } from '../utils/mockData';

export const RosterPasteModal: React.FC = () => {
  const { isRosterModalOpen, setIsRosterModalOpen, importRoster } = useLeague();
  const [text, setText] = useState('');

  if (!isRosterModalOpen) return null;

  const parsed = parseRosterText(text);

  const handleAdd = () => {
    if (parsed.length === 0) {
      alert('추가할 학생 명단을 입력해 주세요.');
      return;
    }
    importRoster(text);
    setText('');
    setIsRosterModalOpen(false);
    alert(`${parsed.length}명의 학생이 성공적으로 추가되었습니다!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs">
      <div className="bg-[#FFFDF8] w-full max-w-xl rounded-3xl border-2 border-[#EAD9BE] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-150">
        <div className="bg-[#FFF7EC] px-6 py-4 border-b border-[#EAD9BE] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#3CC9A0]" />
            <h3 className="font-hand font-bold text-2xl text-[#2E2A26]">
              학생 명단 추가하기
            </h3>
          </div>
          <button
            onClick={() => setIsRosterModalOpen(false)}
            className="w-9 h-9 rounded-full hover:bg-stone-200/60 flex items-center justify-center text-[#7A6A56]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#7A6A56]">
              나이스 출석부 텍스트 붙여넣기 ({parsed.length}명 인식됨)
            </label>
            <button
              onClick={() => setText(SAMPLE_NEIS_ROSTER)}
              className="text-xs text-[#C77A2C] font-bold hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> 샘플 복사
            </button>
          </div>

          <textarea
            rows={7}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="나이스 또는 엑셀에서 복사한 학생 명단을 붙여넣으세요... (예: 5 2 21 박서준 남)"
            className="w-full p-3 rounded-2xl bg-white border border-[#EAD9BE] text-sm font-mono focus:outline-none focus:border-[#3CC9A0]"
          />

          <p className="text-xs text-[#7A6A56]">
            기존 리그의 점수나 대진 기록은 보존되며, 새로운 학생들만 1000 RP(언랭크)로 추가됩니다.
          </p>

          <div className="pt-3 border-t border-[#F4ECE1] flex justify-end gap-2">
            <button
              onClick={() => setIsRosterModalOpen(false)}
              className="touch-btn px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 font-medium"
            >
              취소
            </button>
            <button
              onClick={handleAdd}
              disabled={parsed.length === 0}
              className={`touch-btn px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-1.5 ${
                parsed.length > 0
                  ? 'bg-[#3CC9A0] text-white hover:bg-[#2fb28d]'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{parsed.length}명 추가하기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

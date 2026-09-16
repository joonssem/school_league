import React, { useState } from 'react';
import { useLeague } from '../context/LeagueContext';
import { TIER_PRESETS } from '../utils/ratingEngine';
import { Sliders, Database, Download, Upload, RotateCcw, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    league,
    updateSettings,
    resetToSampleData,
    exportLeagueJson,
    importLeagueJson
  } = useLeague();

  const [jsonInput, setJsonInput] = useState('');

  const handlePresetChange = (key: keyof typeof TIER_PRESETS) => {
    const preset = TIER_PRESETS[key];
    updateSettings({
      thresholds: preset.thresholds,
      name: preset.label
    });
  };

  const handleDownload = () => {
    const dataStr = exportLeagueJson();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `school_league_${league.sportName}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!jsonInput.trim()) {
      alert('복원할 JSON 데이터를 붙여넣어 주세요.');
      return;
    }
    const success = importLeagueJson(jsonInput);
    if (success) {
      alert('리그 데이터를 성공적으로 복원했습니다!');
      setJsonInput('');
    } else {
      alert('올바른 JSON 데이터 형식이 아닙니다.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. League Basic Info & Tier Preset */}
      <section className="bg-[#FFFDF8] rounded-3xl border border-[#EAD9BE] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F4ECE1]">
          <Sliders className="w-5 h-5 text-[#C77A2C]" />
          <h3 className="font-hand font-bold text-2xl text-[#2E2A26]">
            티어 및 레이팅 프리셋 설정
          </h3>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-[#7A6A56] block">
            운영 기간별 티어 기준 프리셋:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(TIER_PRESETS) as (keyof typeof TIER_PRESETS)[]).map(key => {
              const preset = TIER_PRESETS[key];
              const isSelected =
                league.settings.thresholds.silver === preset.thresholds.silver &&
                league.settings.thresholds.diamond === preset.thresholds.diamond;

              return (
                <button
                  key={key}
                  onClick={() => handlePresetChange(key)}
                  className={`touch-btn p-3.5 rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-[#F2A33C] bg-[#FFF7EC] ring-2 ring-[#F2A33C]/20'
                      : 'border-[#EAD9BE] bg-white hover:border-[#F2A33C]'
                  }`}
                >
                  <div className="font-bold text-base text-[#2E2A26] flex items-center justify-between">
                    <span>{preset.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#F2A33C]" />}
                  </div>
                  <div className="text-xs text-[#7A6A56] mt-1 space-x-2">
                    <span>실버 {preset.thresholds.silver}</span>
                    <span>골드 {preset.thresholds.gold}</span>
                    <span>플래 {preset.thresholds.platinum}</span>
                    <span>다이아 {preset.thresholds.diamond}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 text-xs text-[#7A6A56]">
          * 모든 학생은 <b>1000 RP</b>에서 시작하며, 초기 {league.settings.unrankedMatchCount}경기 동안은 언랭크(배치고사)로 점수와 등급이 비공개됩니다.
        </div>
      </section>

      {/* 2. Backup & Data Management */}
      <section className="bg-[#FFFDF8] rounded-3xl border border-[#EAD9BE] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F4ECE1]">
          <Database className="w-5 h-5 text-[#C77A2C]" />
          <h3 className="font-hand font-bold text-2xl text-[#2E2A26]">
            데이터 백업 및 다른 아이패드로 복사
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-[#FFF7EC] border border-[#EAD9BE] flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-base text-[#2E2A26] flex items-center gap-1.5">
                <Download className="w-4 h-4 text-[#C77A2C]" /> 리그 파일 다운로드 (백업)
              </h4>
              <p className="text-xs text-[#7A6A56] mt-1">
                현재 리그의 학생 명단, 경기 기록, RP 데이터를 JSON 파일로 안전하게 기기에 저장합니다.
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="touch-btn py-2.5 px-4 rounded-xl bg-[#F2A33C] text-white font-bold text-sm shadow-xs hover:bg-[#C77A2C] flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" /> 백업 파일 다운로드
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#EAD9BE] flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-base text-[#2E2A26] flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-stone-500" /> 샘플 데이터 초기화
              </h4>
              <p className="text-xs text-[#7A6A56] mt-1">
                처음 체험용 20명 학생과 모의 경기 기록으로 즉시 되돌립니다.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('샘플 데이터로 초기화하시겠습니까? 현재 변경사항은 덮어씌워집니다.')) {
                  resetToSampleData();
                }
              }}
              className="touch-btn py-2.5 px-4 rounded-xl bg-stone-100 text-stone-700 font-bold text-sm hover:bg-stone-200 flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> 샘플 데이터로 복구
            </button>
          </div>
        </div>

        {/* JSON String Import Box */}
        <div className="pt-2 space-y-2">
          <label className="text-xs font-bold text-[#7A6A56]">
            다른 기기에서 보낸 JSON 텍스트 복원하기:
          </label>
          <textarea
            rows={3}
            placeholder="이곳에 JSON 데이터를 붙여넣고 아래 [복원하기] 버튼을 누르세요..."
            value={jsonInput}
            onChange={e => setJsonInput(e.target.value)}
            className="w-full p-3 rounded-2xl bg-white border border-[#EAD9BE] text-xs font-mono focus:outline-none focus:border-[#F2A33C]"
          />
          <button
            onClick={handleImport}
            className="touch-btn px-4 py-2 rounded-xl bg-[#2E2A26] text-white font-bold text-xs flex items-center gap-1"
          >
            <Upload className="w-3.5 h-3.5" /> 데이터 복원 적용
          </button>
        </div>
      </section>
    </div>
  );
};

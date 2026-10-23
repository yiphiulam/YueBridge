import React from 'react';
import {
  Flame,
  Heart,
  Volume2,
  VolumeX,
  Compass,
  Sparkles,
  Globe2,
} from 'lucide-react';
import { UserStats, TabType, DiasporaCountry } from '../types';
import { sound } from '../utils/audio';

interface HeaderProps {
  stats: UserStats;
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onToggleSound: () => void;
  onOpenRefillModal: () => void;
  onChangeCountry: (country: DiasporaCountry) => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  currentTab,
  onSelectTab,
  onToggleSound,
  onOpenRefillModal,
  onChangeCountry,
}) => {
  const tabs = [
    { id: 'learn', label: '學習地圖', labelEn: 'Skill Map', icon: '🗺️' },
    { id: 'dialogue', label: '情境 AI 對話', labelEn: 'AI Dialogue', icon: '🎙️' },
    { id: 'tone_lab', label: '九聲六調道場', labelEn: 'Tone Dojo', icon: '🎵' },
    { id: 'vocab_bridge', label: '英粵生字橋', labelEn: 'Vocab Bridge', icon: '🌉' },
    { id: 'research', label: '系統架構與成果', labelEn: 'EdTech Model', icon: '📊' },
  ];

  const countries: Array<{ code: DiasporaCountry; flag: string; name: string }> = [
    { code: 'uk', flag: '🇬🇧', name: '英國 UK' },
    { code: 'canada', flag: '🇨🇦', name: '加拿大 CA' },
    { code: 'usa', flag: '🇺🇸', name: '美國 US' },
    { code: 'australia', flag: '🇦🇺', name: '澳洲 AU' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Diaspora Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onSelectTab('learn');
              }}
              className="flex items-center gap-2 group text-left"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <span className="text-xl">🐮</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                    YueBridge <span className="text-orange-500">粵聲同行</span>
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 text-orange-700">
                    雙語離散傳承
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                  AI 情境化口語 · 動態英粵切換 · 聲調微修正
                </p>
              </div>
            </button>
          </div>

          {/* Gamified Stats Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Country Selector */}
            <div className="relative flex items-center bg-slate-100/90 rounded-full px-2 py-1 text-xs border border-slate-200">
              <Globe2 className="w-3.5 h-3.5 text-slate-500 mr-1 hidden sm:block" />
              <select
                value={stats.diasporaCountry}
                onChange={(e) => {
                  sound.playClick();
                  onChangeCountry(e.target.value as DiasporaCountry);
                }}
                className="bg-transparent font-bold text-slate-700 text-xs focus:outline-hidden cursor-pointer pr-1"
                title="切換海外離散生活所在地"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Streak */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 font-bold text-xs sm:text-sm cursor-default"
              title={`連續學習 ${stats.streak} 天`}
            >
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-bounce" />
              <span>{stats.streak}</span>
            </div>

            {/* Canto Coins (菠蘿包/粵幣) */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-bold text-xs sm:text-sm"
              title="粵幣 (Canto Coins)"
            >
              <span className="text-sm">🍍</span>
              <span>{stats.cantoCoins}</span>
            </div>

            {/* Hearts */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenRefillModal();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs sm:text-sm hover:bg-rose-100 transition-colors"
              title="能量愛心，點擊補充"
            >
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>
                {stats.hearts}/{stats.maxHearts}
              </span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-full border transition-colors ${
                stats.soundEnabled
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  : 'bg-rose-50 text-rose-400 border-rose-200'
              }`}
              title={stats.soundEnabled ? '音效已開啟' : '靜音中'}
            >
              {stats.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 mt-2 pt-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playClick();
                  onSelectTab(tab.id as TabType);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30 scale-102'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] hidden md:inline font-semibold ${
                    isActive ? 'text-orange-100' : 'text-slate-400'
                  }`}
                >
                  {tab.labelEn}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

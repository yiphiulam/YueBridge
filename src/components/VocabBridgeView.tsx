import React, { useState } from 'react';
import {
  Search,
  Volume2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { VocabularyBridgeCard } from '../types';
import { vocabularyBridgeData } from '../data/mockData';
import { sound } from '../utils/audio';

export const VocabBridgeView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [vocabList, setVocabList] = useState<VocabularyBridgeCard[]>(vocabularyBridgeData);
  const [playingVocabId, setPlayingVocabId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: '全部 (All)' },
    { id: '學校校園', label: '🎒 學校校園' },
    { id: '超市生活', label: '🛒 超市生活' },
    { id: '西方節慶', label: '🎃 西方節慶' },
    { id: '家庭長輩', label: '👵🏼 家庭長輩' },
    { id: '飲茶美食', label: '🥟 飲茶美食' },
  ];

  const filtered = vocabList.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cantonese.includes(searchTerm) ||
      item.jyutping.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggleMastered = (id: string) => {
    sound.playClick();
    setVocabList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, mastered: !item.mastered } : item
      )
    );
  };

  const handleSpeak = (id: string, text: string, jyutping?: string) => {
    sound.playClick();
    setPlayingVocabId(id);
    sound.speakCantonese(text, jyutping, () => {
      setPlayingVocabId(null);
    });
  };

  const masteredCount = vocabList.filter((v) => v.mastered).length;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-sm mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🌉</span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                英粵詞彙轉換橋樑 (Vocabulary Bridge)
              </h1>
            </div>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              專為海外學童整理的高頻生活借字表。遇到只記得英文的日常生字，一鍵查詢道地口語廣東話與粵拼！
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-white/20 backdrop-blur-xs text-xs font-bold flex items-center gap-2">
            <span>📚 已掌握字詞：</span>
            <span className="text-amber-300 font-extrabold text-sm">
              {masteredCount} / {vocabList.length}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-5">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋英文 (e.g. lunchbox, scooter) 或廣東話/粵拼..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between shadow-2xs hover:shadow-sm ${
              item.mastered ? 'border-emerald-200/90 bg-emerald-50/20' : 'border-slate-200'
            }`}
          >
            <div>
              {/* Header: English -> Cantonese */}
              <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                <div>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold font-mono">
                    {item.english}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-lg font-black text-slate-900">
                      {item.cantonese}
                    </span>
                    <span className="text-xs font-mono font-bold text-orange-600">
                      ({item.jyutping})
                    </span>
                  </div>
                </div>

                {/* Speaker button */}
                <button
                  onClick={() => handleSpeak(item.id, item.cantonese, item.jyutping)}
                  className={`p-2 rounded-xl transition-all ${
                    playingVocabId === item.id
                      ? 'bg-orange-500 text-white shadow-xs animate-pulse'
                      : 'bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600'
                  }`}
                  title="聆聽道地粵語發音"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Context Tag */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-3">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                <span>{item.diasporaContext}</span>
              </div>

              {/* Example Sentence */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3">
                <p className="text-xs font-bold text-slate-800 leading-relaxed">
                  {item.exampleSentence}
                </p>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  {item.exampleJyutping}
                </p>
                <p className="text-[11px] text-slate-500 italic mt-1 border-t border-slate-200/60 pt-1">
                  🇬🇧 {item.exampleSentenceEn}
                </p>
              </div>
            </div>

            {/* Bottom Actions: Mastered Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-[11px] font-semibold text-slate-400">
                調值：第 {item.toneNumber} 聲
              </span>
              <button
                onClick={() => handleToggleMastered(item.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs transition-colors ${
                  item.mastered
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${item.mastered ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.mastered ? '已掌握' : '標記已會'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <span className="text-4xl">🔍</span>
          <h3 className="text-base font-bold text-slate-800 mt-2">找不到相關詞彙</h3>
          <p className="text-xs text-slate-500 mt-1">
            可以嘗試輸入英文單字如 "cereal", "scooter", 或切換分類。
          </p>
        </div>
      )}
    </div>
  );
};

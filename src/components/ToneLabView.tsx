import React, { useState, useMemo } from 'react';
import {
  Volume2,
  Sparkles,
  HelpCircle,
  Award,
  Music,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  Info,
  Flame,
  Layers,
  Mic,
} from 'lucide-react';
import { ToneDetail, NineToneMnemonic } from '../types';
import {
  tonesData,
  nineToneMnemonicsData,
  toneSandhiData,
} from '../data/mockData';
import { sound } from '../utils/audio';

interface ToneLabViewProps {
  initialTargetWord?: string;
  onAddXp?: (xp: number) => void;
}

export const ToneLabView: React.FC<ToneLabViewProps> = ({
  initialTargetWord,
  onAddXp,
}) => {
  // Navigation inside Tone Lab
  const [activeSubTab, setActiveSubTab] = useState<'tones_system' | 'mnemonics' | 'sandhi_checked' | 'minimal_pairs'>('tones_system');

  // Selected tone (1 - 9)
  const [selectedToneNum, setSelectedToneNum] = useState<number>(1);
  const selectedTone = tonesData.find((t) => t.toneNumber === selectedToneNum) || tonesData[0];

  // System view mode: 9 tones (traditional phonology) vs 6 tones (pure pitch contours)
  const [systemMode, setSystemMode] = useState<'nine_tones' | 'six_tones'>('nine_tones');

  // Active playing indicator
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  // Mnemonic Jukebox state
  const [activeMnemonicIndex, setActiveMnemonicIndex] = useState(0);
  const activeMnemonic = nineToneMnemonicsData[activeMnemonicIndex];
  const [activeCharIndex, setActiveCharIndex] = useState<number | null>(null);

  // Minimal Pairs Challenge State
  const [quizScore, setQuizScore] = useState(0);
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Minimal Pairs Data
  const minimalPairs = [
    {
      id: 1,
      targetWord: '買',
      jyutping: 'maai5',
      tone: 5,
      meaning: 'To Buy (去超市買餸)',
      confusingWord: '賣',
      confusingJyutping: 'maai6',
      confusingTone: 6,
      confusingMeaning: 'To Sell (店舖老闆賣嘢)',
      question: '你去超市選購零食畀錢，廣東話應該講「___嘢」？',
      correctChoice: '買 (maai5, 第5聲低升)',
      explanation: '「買」(maai5) 是第5聲陽上調（低升調向上揚）；「賣」(maai6) 是第6聲陽去調（低平調沉穩）！',
    },
    {
      id: 2,
      targetWord: '湯',
      jyutping: 'tong1',
      tone: 1,
      meaning: 'Soup (老火靚湯)',
      confusingWord: '糖',
      confusingJyutping: 'tong4',
      confusingTone: 4,
      confusingMeaning: 'Sugar (白砂糖/糖果)',
      question: '媽咪煲咗好滋潤嘅老火靚湯，廣東話係第幾聲？',
      correctChoice: '湯 (tong1, 第1聲高平)',
      explanation: '老火「湯」(tong1) 是第1聲陰平調（高平調 55）；甜甜嘅「糖」(tong4) 是第4聲陽平調（低沉調 21）。',
    },
    {
      id: 3,
      targetWord: '餃',
      jyutping: 'gaau2',
      tone: 2,
      meaning: 'Dumpling (蝦餃/水餃)',
      confusingWord: '教',
      confusingJyutping: 'gaau3',
      confusingTone: 3,
      confusingMeaning: 'To Teach (教書)',
      question: '去茶樓飲茶必叫嘅點心「蝦___」，那個字讀第2聲？',
      correctChoice: '餃 (gaau2, 第2聲高升)',
      explanation: '「餃」(gaau2) 是第2聲陰上調（高升調 35/25）；「教」(gaau3) 是第3聲陰去調（中平調 33）。',
    },
    {
      id: 4,
      targetWord: '試',
      jyutping: 'si3',
      tone: 3,
      meaning: 'Try / Exam (試下/考試)',
      confusingWord: '事',
      confusingJyutping: 'si6',
      confusingTone: 6,
      confusingMeaning: 'Matter (做事/發生咗事)',
      question: '「唔緊要，你試下講多次啦！」這裡的「試」是第幾聲？',
      correctChoice: '試 (si3, 第3聲中平)',
      explanation: '「試」(si3) 是第3聲陰去調（中平調 33）；「事」(si6) 是第6聲陽去調（低平調 22）。',
    },
  ];

  const currentPair = minimalPairs[quizQuestionIndex % minimalPairs.length];

  // Randomize order of choices (A vs B) for each question index so correct answer is NOT always A
  const randomizedChoices = useMemo(() => {
    const choices = [
      {
        tone: currentPair.tone,
        word: currentPair.targetWord,
        jyutping: currentPair.jyutping,
        meaning: currentPair.meaning,
      },
      {
        tone: currentPair.confusingTone,
        word: currentPair.confusingWord,
        jyutping: currentPair.confusingJyutping,
        meaning: currentPair.confusingMeaning,
      },
    ];
    return Math.random() < 0.5 ? choices : [choices[1], choices[0]];
  }, [quizQuestionIndex, currentPair]);

  // Play audio helper with active state and optional jyutping
  const handlePlayWord = (word: string, jyutping?: string) => {
    sound.playClick();
    setPlayingWord(word);
    sound.speakCantonese(word, jyutping, () => {
      setPlayingWord(null);
    });
  };

  // Play sample word directly with zh-HK-HiuMaanNeural (without artificial synth beep)
  const handlePlayToneContour = (toneNum: number, sampleWord: string, jyutping?: string) => {
    sound.playClick();
    const word = sampleWord.split(' ')[0].replace(/[^一-龥]/g, '') || sampleWord.trim();
    setPlayingWord(word);
    sound.speakCantonese(word, jyutping, () => {
      setPlayingWord(null);
    });
  };

  // Play pure pitch curve
  const handlePlayPureContour = (toneNum: number) => {
    sound.playClick();
    sound.playTonePitchContour(toneNum <= 6 ? toneNum : toneNum === 7 ? 1 : toneNum === 8 ? 3 : 6);
  };

  // Play full mnemonic sentence
  const handlePlayMnemonicSentence = (sentence: string) => {
    sound.playClick();
    setPlayingWord(sentence);
    sound.speakCantonese(sentence, () => {
      setPlayingWord(null);
      setActiveCharIndex(null);
    });
  };

  // Play mnemonic single character with step animation
  const handlePlayMnemonicChar = (char: string, jyutping: string, idx: number) => {
    sound.playClick();
    setActiveCharIndex(idx);
    setPlayingWord(char);
    sound.speakCantonese(char, jyutping, () => {
      setPlayingWord(null);
    });
  };

  // Minimal pairs quiz handling
  const handleAnswerQuiz = (chosenTone: number) => {
    if (chosenTone === currentPair.tone) {
      sound.playSuccess();
      setQuizScore((prev) => prev + 1);
      onAddXp?.(20);
      setFeedback({
        isCorrect: true,
        text: `答得好！${currentPair.explanation}`,
      });
    } else {
      sound.playError();
      setFeedback({
        isCorrect: false,
        text: `哎呀，差少少！${currentPair.explanation}`,
      });
    }
  };

  const handleNextQuiz = () => {
    sound.playClick();
    setFeedback(null);
    setQuizQuestionIndex((prev) => prev + 1);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 rounded-3xl p-5 sm:p-6 text-white shadow-md mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold text-teal-100 mb-2">
              <span>漢語音韻學 × 現代語言學調值系統</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              <span>🎵</span>
              <span>九聲六調道場 (Cantonese Tone Dojo)</span>
            </h1>
            <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              全面解密標準粵語聲調體系：理解「調值（抑揚）」與「頓挫（入聲 -p/-t/-k 韻尾）」，掌握經典九聲口訣與聲調微修正！
            </p>
          </div>

          <div className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-xs text-xs font-bold flex items-center gap-2 self-start sm:self-auto shadow-xs">
            <span>🏆 道場練耳積分：</span>
            <span className="text-amber-300 font-black text-sm">{quizScore * 20} XP</span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="bg-white rounded-2xl p-1.5 shadow-xs border border-slate-200 mb-5 flex items-center gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('tones_system');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSubTab === 'tones_system'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>📊</span>
          <span>標準九聲六調系統表</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('mnemonics');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSubTab === 'mnemonics'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🍲</span>
          <span>經典九聲口訣點播台</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('sandhi_checked');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSubTab === 'sandhi_checked'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>⚡</span>
          <span>入聲頓挫與變調實驗室</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveSubTab('minimal_pairs');
          }}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeSubTab === 'minimal_pairs'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>⚔️</span>
          <span>易混淆字詞對決 (Minimal Pairs)</span>
        </button>
      </div>

      {/* SUB-TAB 1: Tones System Grid & Pitch Visualizer */}
      {activeSubTab === 'tones_system' && (
        <div className="space-y-5">
          {/* Theory Card: 9 Tones vs 6 Tones */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-950 leading-relaxed shadow-xs">
            <div className="flex items-center gap-2 mb-1.5 font-black text-amber-900 text-sm">
              <Info className="w-4 h-4 text-amber-600" />
              <span>語言學「六調值」vs 漢語音韻學「九聲調」之計算原理：</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
                <span className="font-black text-slate-900 block mb-0.5">
                  1. 語言學分析（純調值・六聲調）：
                </span>
                <p className="text-slate-600">
                  以「音高/調值（抑揚）」為唯一標準。香港語言學學會粵拼（LSHK）以 1 至 6 標調。
                  上陰入 (fat1) 調值同陰平 (55)；下陰入 (faat3) 調值同陰去 (33)；陽入 (fat6) 調值同陽去 (22)。不計頓挫即為「六調」。
                </p>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60">
                <span className="font-black text-slate-900 block mb-0.5">
                  2. 漢語音韻學（抑揚＋頓挫・九聲調）：
                </span>
                <p className="text-slate-600">
                  承繼北宋《廣韻》平上去入四聲分陰陽。因入聲帶塞音輔音韻尾（-p, -t, -k）發音急促頓挫，故分為 9 個聲調。黃錫凌拼音與教育學院拼音方案以數字 1 至 9 標調。
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Tone Buttons (1 to 9) */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  標準粵語九聲調總表 (Standard Cantonese 9 Tones)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  點擊任一聲調即可聆聽真人示範發音、音高曲線與調值分析
                </p>
              </div>

              {/* Filter: Show 9 Tones vs Group by 6 Contours */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setSystemMode('nine_tones')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    systemMode === 'nine_tones'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  九聲完整排列 (1-9)
                </button>
                <button
                  onClick={() => setSystemMode('six_tones')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    systemMode === 'six_tones'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  六調值歸併視角 (1-6)
                </button>
              </div>
            </div>

            {/* Grid of Tones */}
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
              {tonesData.map((t) => {
                const isSelected = selectedToneNum === t.toneNumber;
                const isCheckedTone = t.toneNumber >= 7;
                const primaryChar = t.sampleWord.split(' ')[0].replace(/[^一-龥]/g, '');

                return (
                  <button
                    key={t.toneNumber}
                    onClick={() => {
                      sound.playClick();
                      setSelectedToneNum(t.toneNumber);
                      handlePlayWord(primaryChar, t.jyutping);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-700 shadow-md scale-102 ring-2 ring-teal-400/40'
                        : isCheckedTone
                        ? 'bg-amber-50/70 border-amber-200 text-amber-900 hover:bg-amber-100'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                    title={`點擊切換並試聽第 ${t.toneNumber} 聲「${primaryChar}」`}
                  >
                    <span className="text-[10px] font-bold opacity-80">
                      第 {t.toneNumber} 聲
                    </span>
                    <span className="text-lg font-black my-1">
                      {primaryChar}
                    </span>
                    <span className="text-xs font-bold">{t.nameTraditional}</span>
                    <span className="text-[10px] font-mono mt-1 opacity-90 px-1.5 py-0.5 rounded-md bg-black/10">
                      {t.pitchContour}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Selected Tone Detail Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-black">
                    第 {selectedTone.toneNumber} 聲 · {selectedTone.nameTraditional}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    {selectedTone.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-mono font-bold">
                    調值：{selectedTone.pitchContour}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-mono font-bold">
                    IPA：{selectedTone.ipa}
                  </span>
                </div>

                <div className="mt-3 flex items-center flex-wrap gap-2">
                  <span className="text-xs font-bold text-slate-600">標準漢字例字（點擊試聽）：</span>
                  {selectedTone.sampleWord.split('/').map((item, idx) => {
                    const match = item.trim().match(/^([一-龥])\s*(?:\((.*?)\))?/);
                    const char = match ? match[1] : item.trim().split(' ')[0];
                    const jp = match && match[2] ? match[2] : selectedTone.jyutping;
                    const isPlaying = playingWord === char;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePlayWord(char, jp)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-sm font-bold transition-all shadow-xs cursor-pointer ${
                          isPlaying
                            ? 'bg-orange-500 text-white border-orange-600 shadow-sm animate-pulse'
                            : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border-teal-200'
                        }`}
                        title={`點擊試聽「${char}」標準香港粵語發音 (${jp})`}
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'text-white' : 'text-teal-600'}`} />
                        <span className="text-base font-black">{char}</span>
                        <span className="text-xs font-mono opacity-85">({jp})</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  字義：{selectedTone.meaningZh} ({selectedTone.meaningEn})
                </p>
              </div>

              {/* Sound Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlayPureContour(selectedTone.toneNumber)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="聆聽純音調音高曲線"
                >
                  <Music className="w-4 h-4 text-teal-600" />
                  <span>純音高</span>
                </button>

                <button
                  onClick={() => handlePlayToneContour(selectedTone.toneNumber, selectedTone.sampleWord, selectedTone.jyutping)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all ${
                    playingWord === selectedTone.sampleWord.split(' ')[0]
                      ? 'bg-orange-500 text-white animate-pulse'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                  title="朗讀真人廣東話原音示範"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>
                    {playingWord === selectedTone.sampleWord.split(' ')[0] ? '朗讀中...' : '粵語示範發音'}
                  </span>
                </button>
              </div>
            </div>

            {/* Visual Pitch Scale Graph */}
            <div className="my-5 bg-slate-900 rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-bold">趙元任 5 度制聲調圖 (Chao Pitch Scale)</span>
                <span className="font-mono text-teal-300 font-bold">
                  {selectedTone.nameEnglish} · {selectedTone.type}
                </span>
              </div>

              {/* Graph Container */}
              <div className="h-40 w-full relative">
                {[5, 4, 3, 2, 1].map((level, idx) => (
                  <div
                    key={level}
                    className="absolute w-full flex items-center border-b border-slate-800 text-[10px] text-slate-500"
                    style={{ top: `${idx * 26}px` }}
                  >
                    <span className="w-5 font-bold font-mono">{level}</span>
                    <span className="text-[9px] text-slate-600 ml-1">
                      {level === 5 ? '高音 (5)' : level === 3 ? '中音 (3)' : level === 1 ? '低音 (1)' : ''}
                    </span>
                  </div>
                ))}

                {/* SVG Curve dynamically rendered */}
                <svg className="w-full h-full absolute inset-0 pl-14 pr-8 overflow-visible pointer-events-none">
                  {/* Tone 1: 55 High Level */}
                  {selectedTone.toneNumber === 1 && (
                    <line x1="8%" y1="12" x2="92%" y2="12" stroke="#2dd4bf" strokeWidth="6" strokeLinecap="round" />
                  )}
                  {/* Tone 2: 35 High Rising */}
                  {selectedTone.toneNumber === 2 && (
                    <path d="M 60 62 Q 180 48 300 12" fill="none" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
                  )}
                  {/* Tone 3: 33 Mid Level */}
                  {selectedTone.toneNumber === 3 && (
                    <line x1="8%" y1="62" x2="92%" y2="62" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
                  )}
                  {/* Tone 4: 21 Low Falling */}
                  {selectedTone.toneNumber === 4 && (
                    <path d="M 60 88 Q 180 102 300 122" fill="none" stroke="#f43f5e" strokeWidth="6" strokeLinecap="round" />
                  )}
                  {/* Tone 5: 23 Low Rising */}
                  {selectedTone.toneNumber === 5 && (
                    <path d="M 60 115 Q 180 100 300 62" fill="none" stroke="#a855f7" strokeWidth="6" strokeLinecap="round" />
                  )}
                  {/* Tone 6: 22 Low Level */}
                  {selectedTone.toneNumber === 6 && (
                    <line x1="8%" y1="92" x2="92%" y2="92" stroke="#ec4899" strokeWidth="6" strokeLinecap="round" />
                  )}
                  {/* Tone 7: 上陰入 (5) - Checked High short stop */}
                  {selectedTone.toneNumber === 7 && (
                    <g>
                      <line x1="8%" y1="12" x2="42%" y2="12" stroke="#2dd4bf" strokeWidth="7" strokeLinecap="round" />
                      <line x1="42%" y1="4" x2="42%" y2="20" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
                    </g>
                  )}
                  {/* Tone 8: 下陰入 (3) - Checked Mid short stop */}
                  {selectedTone.toneNumber === 8 && (
                    <g>
                      <line x1="8%" y1="62" x2="42%" y2="62" stroke="#f59e0b" strokeWidth="7" strokeLinecap="round" />
                      <line x1="42%" y1="54" x2="42%" y2="70" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
                    </g>
                  )}
                  {/* Tone 9: 陽入 (2) - Checked Low short stop */}
                  {selectedTone.toneNumber === 9 && (
                    <g>
                      <line x1="8%" y1="92" x2="42%" y2="92" stroke="#ec4899" strokeWidth="7" strokeLinecap="round" />
                      <line x1="42%" y1="84" x2="42%" y2="100" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
                    </g>
                  )}
                </svg>
              </div>

              {/* Mnemonic and Coda Tag */}
              <div className="mt-3 bg-slate-800/80 rounded-xl p-3 border border-slate-700 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">💡</span>
                  <span className="text-slate-300">
                    <strong className="text-teal-300">發音訣竅：</strong> {selectedTone.kidFriendlyMnemonic}
                  </span>
                </div>
                {selectedTone.codaType && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-700 text-amber-300 text-[10px] font-mono font-bold whitespace-nowrap">
                    韻尾性質：{selectedTone.codaType}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Classic 9-Tone Mnemonics (口訣點唱機) */}
      {activeSubTab === 'mnemonics' && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-black text-slate-900">
                  經典九聲口訣集 (Nine-Tone Mnemonics Jukebox)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  一句九個字，剛好涵蓋 1 至 9 所有聲調！點擊任意字聽發音，或點擊整句欣賞港式韻律！
                </p>
              </div>

              {/* Selector Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
                {nineToneMnemonicsData.map((m, idx) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      sound.playClick();
                      setActiveMnemonicIndex(idx);
                      setActiveCharIndex(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      activeMnemonicIndex === idx
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {m.category}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Mnemonic Showcase Card */}
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 rounded-2xl p-5 mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[11px] font-black">
                    {activeMnemonic.category} · {activeMnemonic.title}
                  </span>
                  <p className="text-xs text-teal-900 mt-1 font-medium">
                    {activeMnemonic.explanation}
                  </p>
                </div>

                {/* Play Full Sentence Button */}
                <button
                  onClick={() => handlePlayMnemonicSentence(activeMnemonic.sentence)}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all shrink-0 ${
                    playingWord === activeMnemonic.sentence
                      ? 'bg-orange-500 text-white animate-pulse'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>
                    {playingWord === activeMnemonic.sentence ? '朗讀整句中...' : '整句原音連讀'}
                  </span>
                </button>
              </div>

              {/* 9 Characters Interactive Board */}
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 sm:gap-3">
                {activeMnemonic.characters.map((ch, idx) => {
                  const isChecked = ch.toneNumber >= 7;
                  const isPlayingThis = playingWord === ch.char || activeCharIndex === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => handlePlayMnemonicChar(ch.char, ch.jyutping, idx)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                        isPlayingThis
                          ? 'bg-teal-600 text-white border-teal-700 shadow-md scale-105 ring-2 ring-teal-400'
                          : isChecked
                          ? 'bg-amber-100/90 border-amber-300 text-amber-950 hover:bg-amber-200'
                          : 'bg-white border-slate-200 text-slate-900 hover:bg-teal-50 hover:border-teal-300'
                      }`}
                    >
                      <span className="text-[10px] font-black opacity-80">
                        {ch.toneNumber}. {ch.toneName}
                      </span>
                      <span className="text-2xl sm:text-3xl font-black my-1">
                        {ch.char}
                      </span>
                      <span className="text-[11px] font-mono font-bold">
                        {ch.jyutping}
                      </span>
                      <span className="text-[10px] font-mono opacity-75 mt-0.5">
                        調值 {ch.pitchContour}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Other Mnemonic Variants Quick List */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>民間其他趣味九聲口訣一覽 (點擊即刻切換試聽)：</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {nineToneMnemonicsData.map((m, idx) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      sound.playClick();
                      setActiveMnemonicIndex(idx);
                      setActiveCharIndex(null);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      activeMnemonicIndex === idx
                        ? 'border-teal-500 bg-teal-50/60 ring-1 ring-teal-400'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-black text-slate-900">{m.sentence}</span>
                      <span className="text-[10px] font-bold text-slate-400">{m.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{m.title}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Checked Tones & Tone Sandhi Lab (入聲與變調實驗室) */}
      {activeSubTab === 'sandhi_checked' && (
        <div className="space-y-5">
          {/* Explanation 1: The Nature of Checked Tones (-p, -t, -k) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200">
            <h2 className="text-base font-black text-slate-900 mb-2 flex items-center gap-2">
              <span>🛑</span>
              <span>入聲（促聲）頓挫的本質：-p, -t, -k 塞音韻尾</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              在現代語言學調值上，入聲其實沒有新發明出第 7、8、9 個音高。上陰入調值同陰平（高平 55/5），下陰入調值同陰去（中平 33/3），陽入調值同陽去（低平 22/2）。
              入聲之所以聽起來短促、戛然而止，秘密在於其結尾由塞音韻尾閉合，氣流被瞬間截斷（頓挫）：
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-black font-mono">
                    -p 雙唇閉合音
                  </span>
                  <Volume2
                    onClick={() => handlePlayWord('鴨')}
                    className="w-4 h-4 text-slate-400 hover:text-rose-600 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-700 font-bold">例字：十 (sap6), 鴨 (aap3), 盒 (hap6)</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  發音要領：雙唇在發音結束時迅速閉攏，不噴氣，阻斷氣流！
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-black font-mono">
                    -t 舌尖抵齒音
                  </span>
                  <Volume2
                    onClick={() => handlePlayWord('八')}
                    className="w-4 h-4 text-slate-400 hover:text-blue-600 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-700 font-bold">例字：八 (baat3), 七 (cat1), 襪 (mat6)</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  發音要領：舌尖抵住上齒齦，阻絕氣流，短促俐落！
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-black font-mono">
                    -k 舌根閉顎音
                  </span>
                  <Volume2
                    onClick={() => handlePlayWord('六')}
                    className="w-4 h-4 text-slate-400 hover:text-emerald-600 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-700 font-bold">例字：六 (luk6), 百 (baak3), 食 (sik6)</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  發音要領：舌根後縮緊貼軟顎，瞬間停止出聲！
                </p>
              </div>
            </div>
          </div>

          {/* Explanation 2: Beyond 9 Tones (超出九聲調：變調專區) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200">
            <h2 className="text-base font-black text-slate-900 mb-2 flex items-center gap-2">
              <span>✨</span>
              <span>超出九聲調：口語變調與情感色彩 (Tone Sandhi)</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              粵語口語中存在細緻的變調現象。加上變調，粵語甚至可被算作十一聲至十三聲！來聽聽最常見的三大變調：
            </p>

            <div className="space-y-3">
              {toneSandhiData.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-black text-slate-900">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">口語自然音變</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">{item.description}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    {item.exampleWords.map((ex, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePlayWord(ex.word)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                          playingWord === ex.word
                            ? 'bg-teal-600 text-white border-teal-700 animate-pulse'
                            : 'bg-white border-slate-200 text-slate-800 hover:bg-teal-50 hover:border-teal-300'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{ex.word}</span>
                        <span className="text-[10px] text-teal-600 font-mono">({ex.reading})</span>
                        <span className="text-[10px] text-slate-400">· {ex.note}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Minimal Pairs Arena (雙語二代混淆字詞對決) */}
      {activeSubTab === 'minimal_pairs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Interactive Minimal Pairs Quiz */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚔️</span>
                <h3 className="font-black text-slate-900 text-sm">
                  易混淆字詞微修正 (Minimal Pairs)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                實戰練耳 · 題號 #{quizQuestionIndex + 1}
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              海外二代最常見的錯誤，是把「買 maai5」說成「賣 maai6」，或者「湯 tong1」說成「糖 tong4」。試下分辨它們！
            </p>

            {/* Quiz Question Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-4">
              <p className="text-sm font-black text-slate-900 mb-3">
                {currentPair.question}
              </p>

              {/* Choices */}
              <div className="space-y-2.5">
                {randomizedChoices.map((choice, cIdx) => {
                  const letter = cIdx === 0 ? 'A' : 'B';
                  return (
                    <div
                      key={cIdx}
                      role="button"
                      tabIndex={0}
                      onClick={() => !feedback && handleAnswerQuiz(choice.tone)}
                      onKeyDown={(e) => {
                        if (!feedback && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleAnswerQuiz(choice.tone);
                        }
                      }}
                      className={`w-full text-left p-3.5 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-xs font-bold text-slate-800 transition-all flex items-center justify-between group shadow-2xs select-none ${
                        feedback ? 'cursor-default' : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          letter === 'A' ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {letter}
                        </span>
                        <span>
                          {choice.word} ({choice.jyutping}, 第 {choice.tone} 聲)
                        </span>
                        <span className="text-[10px] text-slate-400">· {choice.meaning}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayWord(choice.word, choice.jyutping);
                        }}
                        className="p-1 rounded-md hover:bg-teal-100 text-slate-400 group-hover:text-teal-600 transition-colors"
                        title="聽讀音"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`mt-4 p-3.5 rounded-xl text-xs font-bold flex items-start gap-2.5 ${
                    feedback.isCorrect
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {feedback.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p>{feedback.text}</p>
                    <button
                      onClick={handleNextQuiz}
                      className="mt-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      下一題 ➡️
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Instant AB Audio Comparison Station */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
                <span>🎧</span>
                <span>即時連聽對比台 (Instant A/B Ear Check)</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                雙語兒童只要反覆連聽這兩組字，大腦就能迅速建立清晰的音高分界神經路徑：
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handlePlayWord(currentPair.targetWord, currentPair.jyutping)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    playingWord === currentPair.targetWord
                      ? 'bg-teal-600 text-white border-teal-700 shadow-md animate-pulse'
                      : 'bg-teal-50 border-teal-200 text-teal-900 hover:bg-teal-100'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold opacity-80">詞彙 A (第 {currentPair.tone} 聲)</span>
                    <h4 className="text-2xl font-black mt-0.5">{currentPair.targetWord}</h4>
                    <p className="text-xs font-mono font-bold">{currentPair.jyutping}</p>
                  </div>
                  <Volume2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handlePlayWord(currentPair.confusingWord, currentPair.confusingJyutping)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    playingWord === currentPair.confusingWord
                      ? 'bg-orange-500 text-white border-orange-600 shadow-md animate-pulse'
                      : 'bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-100'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold opacity-80">詞彙 B (第 {currentPair.confusingTone} 聲)</span>
                    <h4 className="text-2xl font-black mt-0.5">{currentPair.confusingWord}</h4>
                    <p className="text-xs font-mono font-bold">{currentPair.confusingJyutping}</p>
                  </div>
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              💡 <strong>提示：</strong>第 5 聲 (maai5) 是由低向高爬坡升音；第 6 聲 (maai6) 是沉在底部不變調。
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

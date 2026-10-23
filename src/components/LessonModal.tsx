import React, { useState, useMemo } from 'react';
import {
  X,
  Volume2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Award,
  Star,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LessonNode, QuizQuestion } from '../types';
import { sound } from '../utils/audio';

interface LessonModalProps {
  node: LessonNode;
  onClose: () => void;
  onComplete: (xpGained: number, coinsGained: number) => void;
}

// Fisher-Yates array shuffling algorithm
function shuffleOptions<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const defaultQuestions: QuizQuestion[] = [
  {
    id: 'default-q1',
    question: '在學校午餐時間打開飯盒，想向同學介紹自己帶咗三文治同蘋果，最自然地道的廣東話應該點講？',
    questionEn: 'How to naturally say what is in your lunchbox to a friend in colloquial Cantonese?',
    codeSwitchedPrompt: 'My lunchbox has sandwiches and apples today!',
    bridgingTip: '廣東話口語稱 lunchbox 為「飯盒」(faan6 hap6)，三文治讀作 (saam1 man4 zi6)。',
    options: [
      {
        text: '我今日個飯盒有三文治同蘋果呀！',
        jyutping: 'ngo5 gam1 jat6 go3 faan6 hap6 jau5 saam1 man4 zi6 tung4 ping4 gwo2 aa3!',
        isCorrect: true,
        explanation: '完全正確！道地香港口語用「飯盒」，句末加上「呀」親切自然！',
      },
      {
        text: '我今天帶了蘋果三明治。',
        jyutping: 'ngo5 gam1 tin1 daai3 liu5 ping4 gwo2 saam1 ming4 zi6.',
        isCorrect: false,
        explanation: '這是書面語／國語用法（今天、三明治），廣東話日常對話不這樣說喔！',
      },
      {
        text: '我個 lunchbox 今日有 sandwich 同 apple。',
        jyutping: 'ngo5 go3 lunchbox gam1 jat6 jau5 sandwich tung4 apple.',
        isCorrect: false,
        explanation: '雖然海外日常容易中英混用，但核心詞彙要學會轉化成廣東話喔！',
      },
    ],
  },
  {
    id: 'default-q2',
    question: '朋友邀請你小息一齊踩「scooter」，廣東話「scooter」係乜嘢？',
    questionEn: 'What is "scooter" in colloquial Cantonese?',
    codeSwitchedPrompt: 'Let’s ride our scooters together at recess!',
    bridgingTip: '海外學童最愛的 scooter，廣東話講「滑板車」(waat6 baan2 ce1)。',
    options: [
      {
        text: '滑板車 (waat6 baan2 ce1)',
        jyutping: 'waat6 baan2 ce1',
        isCorrect: true,
        explanation: '正確！「踩滑板車」是海外小朋友放學最常講的句子！',
      },
      {
        text: '大火車 (daai6 fo2 ce1)',
        jyutping: 'daai6 fo2 ce1',
        isCorrect: false,
        explanation: '大火車是 train 喔！',
      },
    ],
  },
];

export const LessonModal: React.FC<LessonModalProps> = ({
  node,
  onClose,
  onComplete,
}) => {
  // Randomize answer choices order so the correct answer is NOT always option 1 / A
  const questions = useMemo<QuizQuestion[]>(() => {
    const rawQuestions: QuizQuestion[] =
      node.questions && node.questions.length > 0 ? node.questions : defaultQuestions;

    return rawQuestions.map((q) => ({
      ...q,
      options: shuffleOptions(q.options),
    }));
  }, [node]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  const currentQ = questions[currentIndex];
  const progressPct = ((currentIndex + 1) / questions.length) * 100;

  const handleSelectOption = (idx: number) => {
    if (isAnswerChecked) return;
    sound.playClick();
    setSelectedOptionIndex(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOptionIndex === null) return;
    setIsAnswerChecked(true);

    const isCorrect = currentQ.options[selectedOptionIndex].isCorrect;
    if (isCorrect) {
      sound.playSuccess();
      setCorrectAnswersCount((prev) => prev + 1);
    } else {
      sound.playError();
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerChecked(false);
    } else {
      // Finished all questions!
      setIsFinished(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleFinishLesson = () => {
    sound.playLevelUp();
    onComplete(node.xpReward, node.coinsReward);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header & Progress */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress Bar */}
          <div className="flex-1 mx-2">
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500 font-mono">
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-5">
          {!isFinished ? (
            <div>
              {/* Context Tag */}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
                  {node.title}
                </span>
                <span className="text-xs text-slate-400">雙語情境挑戰</span>
              </div>

              {/* Code-switched diaspora prompt */}
              {currentQ.codeSwitchedPrompt && (
                <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 mb-3 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 text-sm font-bold">
                    🇬🇧
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-blue-800 block">
                      海外日常表達 (Everyday English):
                    </span>
                    <p className="text-xs font-bold text-blue-950 mt-0.5 italic">
                      "{currentQ.codeSwitchedPrompt}"
                    </p>
                  </div>
                </div>
              )}

              {/* Question */}
              <h3 className="text-base font-black text-slate-900 leading-snug mb-1">
                {currentQ.question}
              </h3>
              <p className="text-xs text-slate-500 font-mono mb-4">
                {currentQ.questionEn}
              </p>

              {/* Options List */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOptionIndex === idx;
                  let cardStyle = 'border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 bg-white text-slate-800';

                  if (isSelected && !isAnswerChecked) {
                    cardStyle = 'border-orange-500 bg-orange-50/80 text-orange-950 ring-2 ring-orange-500/20';
                  } else if (isAnswerChecked) {
                    if (opt.isCorrect) {
                      cardStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20';
                    } else if (isSelected && !opt.isCorrect) {
                      cardStyle = 'border-rose-500 bg-rose-50 text-rose-950 ring-2 ring-rose-500/20';
                    } else {
                      cardStyle = 'border-slate-200 opacity-60 bg-slate-50 text-slate-400';
                    }
                  }

                  return (
                    <div
                      key={idx}
                      role="button"
                      tabIndex={0}
                      onClick={() => !isAnswerChecked && handleSelectOption(idx)}
                      onKeyDown={(e) => {
                        if (!isAnswerChecked && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleSelectOption(idx);
                        }
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-start justify-between gap-3 cursor-pointer select-none ${cardStyle}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-black">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="font-black text-sm">{opt.text}</span>
                        </div>
                        {opt.jyutping && (
                          <p className="text-xs font-mono text-slate-500 mt-1 pl-7">
                            {opt.jyutping}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.speakCantonese(opt.text, opt.jyutping);
                        }}
                        className="p-1.5 text-slate-400 hover:text-orange-500 rounded-lg hover:bg-white transition-colors"
                        title="朗讀發音"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Explanation after checking */}
              {isAnswerChecked && selectedOptionIndex !== null && (
                <div
                  className={`mt-4 p-3.5 rounded-2xl text-xs font-bold leading-relaxed flex items-start gap-2.5 ${
                    currentQ.options[selectedOptionIndex].isCorrect
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-rose-50 text-rose-900 border border-rose-200'
                  }`}
                >
                  {currentQ.options[selectedOptionIndex].isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p>{currentQ.options[selectedOptionIndex].explanation}</p>
                    {currentQ.bridgingTip && (
                      <p className="mt-1 text-[11px] font-normal text-slate-600 border-t border-slate-200/60 pt-1">
                        💡 雙語提示：{currentQ.bridgingTip}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Celebration Screen when finished */
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-4xl mx-auto shadow-inner mb-4">
                🎉
              </div>
              <h2 className="text-xl font-black text-slate-900">
                太棒了！關卡圓滿完成！
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                你成功突破了海外情境雙語轉換關卡！
              </p>

              {/* Rewards */}
              <div className="flex items-center justify-center gap-4 my-6">
                <div className="px-4 py-2 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 font-extrabold text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>+{node.xpReward} 經驗值</span>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 font-extrabold text-sm flex items-center gap-1.5">
                  <span>🍍</span>
                  <span>+{node.coinsReward} 粵幣</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-600 mb-2">
                <p className="font-bold text-slate-800">🐮 牛牛教練贈言：</p>
                <p className="mt-0.5">
                  「學廣東話最重要是好玩無壓力，開口講多幾次，語感就會自然形成！哞～」
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          {!isFinished ? (
            !isAnswerChecked ? (
              <button
                onClick={handleCheckAnswer}
                disabled={selectedOptionIndex === null}
                className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-extrabold text-sm shadow-md shadow-orange-500/20 transition-all"
              >
                檢查答案 (Check)
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>繼續前進 (Continue)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )
          ) : (
            <button
              onClick={handleFinishLesson}
              className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 transition-all"
            >
              領取獎勵並返回地圖 ✨
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

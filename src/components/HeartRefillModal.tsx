import React from 'react';
import { X, Heart, Sparkles, Volume2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeartRefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHearts: number;
  maxHearts: number;
  cantoCoins: number;
  onRefillWithCoins: () => void;
  onPracticeForHeart: () => void;
}

export const HeartRefillModal: React.FC<HeartRefillModalProps> = ({
  isOpen,
  onClose,
  currentHearts,
  maxHearts,
  cantoCoins,
  onRefillWithCoins,
  onPracticeForHeart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 p-5 text-center">
        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Heart Icon */}
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-3">
          <Heart className="w-8 h-8 fill-rose-500 text-rose-500 animate-pulse" />
        </div>

        <h3 className="text-lg font-black text-slate-900">
          補充學習愛心 (Hearts)
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          保持愛心滿格，在日常探索與情境對話中勇往直前！
        </p>

        {/* Options */}
        <div className="space-y-3">
          <button
            onClick={() => {
              if (cantoCoins >= 30) {
                sound.playSuccess();
                onRefillWithCoins();
              }
            }}
            disabled={cantoCoins < 30}
            className="w-full p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs flex items-center justify-between transition-all disabled:opacity-50"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🍍</span>
              <div className="text-left">
                <p className="font-black text-sm text-slate-800">使用 30 粵幣補滿愛心</p>
                <p className="text-[10px] text-slate-500">擁有 {cantoCoins} 粵幣</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-amber-950 font-black text-xs">
              補滿 +5
            </span>
          </button>

          <button
            onClick={() => {
              sound.playSuccess();
              onPracticeForHeart();
            }}
            className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🐮</span>
              <div className="text-left">
                <p className="font-black text-sm text-slate-800">跟牛牛練習 1 句口語</p>
                <p className="text-[10px] text-slate-500">免消耗代幣，免費回復愛心</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-rose-500 text-white font-black text-xs">
              +1 ❤️
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

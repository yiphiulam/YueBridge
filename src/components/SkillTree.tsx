import React from 'react';
import {
  Star,
  Lock,
  CheckCircle2,
  Sparkles,
  Play,
  Volume2,
  BookOpen,
  ArrowRight,
  Flame,
  MessageSquare,
  Music,
} from 'lucide-react';
import { LearningUnit, LessonNode } from '../types';
import { sound } from '../utils/audio';

interface SkillTreeProps {
  units: LearningUnit[];
  onSelectNode: (node: LessonNode) => void;
  onOpenScenarioDirectly: (scenarioId: string) => void;
  onOpenToneDojoDirectly: (word?: string) => void;
}

export const SkillTree: React.FC<SkillTreeProps> = ({
  units,
  onSelectNode,
  onOpenScenarioDirectly,
  onOpenToneDojoDirectly,
}) => {
  const getNodeIcon = (type: LessonNode['type']) => {
    switch (type) {
      case 'code_switch_challenge':
        return '🌉';
      case 'scenario_chat':
        return '🎙️';
      case 'tone_dojo':
        return '🎵';
      case 'listening_quiz':
        return '🎧';
      default:
        return '⭐';
    }
  };

  const getNodeTypeNameZh = (type: LessonNode['type']) => {
    switch (type) {
      case 'code_switch_challenge':
        return '雙語切換挑戰';
      case 'scenario_chat':
        return '情境對話闖關';
      case 'tone_dojo':
        return '聲調聽力挑戰';
      case 'listening_quiz':
        return '生活聽力測驗';
      default:
        return '冒險關卡';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-10">
      {units.map((unit, unitIdx) => (
        <div key={unit.id} className="relative">
          {/* Unit Header Card */}
          <div
            className={`rounded-3xl p-5 bg-gradient-to-r ${unit.themeColor} text-white shadow-md relative overflow-hidden mb-8`}
          >
            {/* Background flag watermark */}
            <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 pointer-events-none select-none">
              {unit.flag}
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black tracking-wide">
                  UNIT {unit.id} · {unit.flag}
                </span>
                <span className="text-xs font-medium text-white/90">
                  {unit.nodes.filter((n) => n.status === 'completed').length}/{unit.nodes.length} 完成
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {unit.title}
              </h2>
              <p className="text-xs text-white/80 font-mono mt-0.5">{unit.titleEn}</p>

              <p className="text-xs text-white/90 mt-2.5 leading-relaxed bg-black/10 rounded-xl p-2.5">
                {unit.description}
              </p>
            </div>
          </div>

          {/* Stepping Path Nodes (Duolingo Curved Journey) */}
          <div className="flex flex-col items-center space-y-6 relative">
            {unit.nodes.map((node, nodeIdx) => {
              const isCompleted = node.status === 'completed';
              const isUnlocked = node.status === 'unlocked';

              // Alternate horizontal offset to create zigzag path
              const xOffsets = ['translate-x-0', '-translate-x-10 sm:-translate-x-14', 'translate-x-10 sm:translate-x-14', 'translate-x-0'];
              const offsetClass = xOffsets[nodeIdx % xOffsets.length];

              return (
                <div
                  key={node.id}
                  className={`flex flex-col items-center ${offsetClass} transition-transform duration-300 relative group`}
                >
                  {/* The Interactive Node Button - All nodes can be challenged freely */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      onSelectNode(node);
                    }}
                    className={`w-20 h-20 rounded-full flex flex-col items-center justify-center relative transition-all duration-300 shadow-md cursor-pointer ${
                      isCompleted
                        ? 'bg-amber-400 border-4 border-amber-500 hover:scale-105 active:scale-95'
                        : isUnlocked
                        ? 'bg-orange-500 border-4 border-orange-600 hover:scale-110 active:scale-95 animate-pulse'
                        : 'bg-emerald-500 border-4 border-emerald-600 hover:scale-105 active:scale-95'
                    }`}
                    title={`挑戰：${node.title}`}
                  >
                    <span className="text-2xl drop-shadow-xs">{getNodeIcon(node.type)}</span>
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mt-0.5">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-2.5 h-2.5 ${
                            s <= node.stars
                              ? 'text-yellow-100 fill-yellow-200'
                              : 'text-black/20 fill-black/10'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Ping ring for current active unlocked node */}
                    {isUnlocked && (
                      <span className="absolute -inset-1 rounded-full border-2 border-orange-400 animate-ping pointer-events-none opacity-60" />
                    )}
                  </button>

                  {/* Title Label Under Node */}
                  <div className="mt-2 text-center max-w-[170px]">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {getNodeTypeNameZh(node.type)}
                    </span>
                    <p className="text-xs font-black text-slate-800 mt-1 line-clamp-2 leading-tight">
                      {node.title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      +{node.xpReward} XP
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

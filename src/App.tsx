import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  TabType,
  UserStats,
  LearningUnit,
  LessonNode,
  DiasporaCountry,
} from './types';
import {
  initialStats,
  unitsData,
  getTodayDateString,
  getUnitsForCountry,
} from './data/mockData';
import { Header } from './components/Header';
import { SkillTree } from './components/SkillTree';
import { LiveDialogueView } from './components/LiveDialogueView';
import { ToneLabView } from './components/ToneLabView';
import { VocabBridgeView } from './components/VocabBridgeView';
import { ResearchInsightView } from './components/ResearchInsightView';
import { LessonModal } from './components/LessonModal';
import { HeartRefillModal } from './components/HeartRefillModal';
import { sound } from './utils/audio';

export default function App() {
  const [stats, setStats] = useState<UserStats>(initialStats);
  const [units, setUnits] = useState<LearningUnit[]>(unitsData);
  const [currentTab, setCurrentTab] = useState<TabType>('learn');

  // Selected scenario ID if navigated directly from Skill Tree
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('school_lunch');
  const [targetToneWord, setTargetToneWord] = useState<string>('買');

  // Modals state
  const [activeLessonNode, setActiveLessonNode] = useState<LessonNode | null>(null);
  const [isHeartRefillOpen, setIsHeartRefillOpen] = useState(false);

  // Welcome banner on first load
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);

  // Toggle sound
  const handleToggleSound = () => {
    const nextVal = !stats.soundEnabled;
    sound.enabled = nextVal;
    setStats((prev) => ({ ...prev, soundEnabled: nextVal }));
    if (nextVal) sound.playClick();
  };

  // Change diaspora country
  const handleChangeCountry = (country: DiasporaCountry) => {
    const names: Record<DiasporaCountry, string> = {
      uk: '英國 (UK)',
      canada: '加拿大 (Canada)',
      usa: '美國 (US)',
      australia: '澳洲 (Australia)',
    };
    setStats((prev) => ({
      ...prev,
      diasporaCountry: country,
      countryNameZh: names[country],
    }));

    // Dynamically regenerate all units and challenges tailored to the selected country!
    setUnits((prevUnits) => {
      // Preserve progress (completed status & stars)
      const progressMap = new Map<string, { status: 'completed' | 'unlocked' | 'locked'; stars: number }>();
      prevUnits.forEach((u) => {
        u.nodes.forEach((n) => {
          progressMap.set(n.id, { status: n.status, stars: n.stars });
        });
      });

      const newUnits = getUnitsForCountry(country);
      return newUnits.map((u) => ({
        ...u,
        nodes: u.nodes.map((n) => {
          const saved = progressMap.get(n.id);
          if (saved) {
            return {
              ...n,
              status: saved.status,
              stars: saved.stars,
            };
          }
          return n;
        }),
      }));
    });
  };

  // Add XP and handle level up
  const handleAddXp = (amount: number) => {
    setStats((prev) => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newNextXp = prev.nextLevelXp;

      if (newXp >= newNextXp) {
        newLevel += 1;
        newXp -= newNextXp;
        newNextXp = Math.round(newNextXp * 1.35);
        sound.playLevelUp();
        confetti({
          particleCount: 60,
          spread: 80,
          origin: { y: 0.5 },
        });
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        nextLevelXp: newNextXp,
        tonesPracticed: prev.tonesPracticed + 1,
      };
    });
  };

  // Complete a lesson node from SkillTree
  const handleCompleteLessonNode = (xpGained: number, coinsGained: number) => {
    handleAddXp(xpGained);
    setStats((prev) => ({
      ...prev,
      cantoCoins: prev.cantoCoins + coinsGained,
      codeSwitchedWordsLearned: prev.codeSwitchedWordsLearned + 2,
    }));

    if (activeLessonNode) {
      setUnits((prevUnits) => {
        const currentUnitIdx = prevUnits.findIndex((u) => u.id === activeLessonNode.unitId);
        const currentUnit = prevUnits[currentUnitIdx];
        const currentNodeIdx = currentUnit ? currentUnit.nodes.findIndex((n) => n.id === activeLessonNode.id) : -1;
        const isLastNodeInUnit = currentUnit && currentNodeIdx === currentUnit.nodes.length - 1;

        return prevUnits.map((u, uIdx) => {
          if (u.id === activeLessonNode.unitId) {
            const updatedNodes = u.nodes.map((n, idx) => {
              if (n.id === activeLessonNode.id) {
                return { ...n, status: 'completed' as const, stars: 3 };
              }
              if (idx === currentNodeIdx + 1 && n.status === 'locked') {
                return { ...n, status: 'unlocked' as const };
              }
              return n;
            });
            return { ...u, nodes: updatedNodes };
          }

          // If finished last node of previous unit, unlock first node of next unit
          if (isLastNodeInUnit && uIdx === currentUnitIdx + 1 && u.nodes.length > 0) {
            const updatedNodes = u.nodes.map((n, idx) =>
              idx === 0 && n.status === 'locked' ? { ...n, status: 'unlocked' as const } : n
            );
            return { ...u, nodes: updatedNodes };
          }

          return u;
        });
      });
    }

    setActiveLessonNode(null);
  };

  // Heart refill handlers
  const handleRefillWithCoins = () => {
    if (stats.cantoCoins < 30) return;
    setStats((prev) => ({
      ...prev,
      cantoCoins: prev.cantoCoins - 30,
      hearts: prev.maxHearts,
    }));
    setIsHeartRefillOpen(false);
  };

  const handlePracticeForHeart = () => {
    setStats((prev) => ({
      ...prev,
      hearts: Math.min(prev.maxHearts, prev.hearts + 1),
    }));
    setIsHeartRefillOpen(false);
  };

  // Direct navigation helpers from SkillTree
  const handleOpenScenarioDirectly = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    setCurrentTab('dialogue');
  };

  const handleOpenToneDojoDirectly = (word?: string) => {
    if (word) setTargetToneWord(word);
    setCurrentTab('tone_lab');
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col font-sans text-slate-800 selection:bg-orange-500/20 selection:text-orange-950">
      {/* Global Header */}
      <Header
        stats={stats}
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onToggleSound={handleToggleSound}
        onOpenRefillModal={() => setIsHeartRefillOpen(true)}
        onChangeCountry={handleChangeCountry}
      />

      {/* Main Body Content based on Tab */}
      <main className="flex-1 w-full">
        {/* Welcome Notification Banner on First Visit */}
        {showWelcomeBanner && (
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white px-4 py-2.5 shadow-sm">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg">🐮</span>
                <span>
                  <strong>歡迎來到 YueBridge 粵聲同行！</strong>專為海外雙語港人二代設計：支援自由<strong>英粵混講（Code-switching）</strong>，AI 角色自然理解並提供道地粵語口語引導！
                </span>
              </div>
              <button
                onClick={() => setShowWelcomeBanner(false)}
                className="px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold shrink-0 transition-colors"
              >
                我知道了 ✕
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Gamified Diaspora Skill Tree */}
        {currentTab === 'learn' && (
          <div className="py-4">
            <div className="max-w-2xl mx-auto px-4 mb-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-black mb-1">
                <span>📍 當前生活地：{stats.countryNameZh}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                海外情境闖關學習地圖
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                點擊節點開啟英粵轉換闖關、聲調微修正或情境 AI 實戰！
              </p>
            </div>

            <SkillTree
              units={units}
              onSelectNode={(node) => setActiveLessonNode(node)}
              onOpenScenarioDirectly={handleOpenScenarioDirectly}
              onOpenToneDojoDirectly={handleOpenToneDojoDirectly}
            />
          </div>
        )}

        {/* Tab 2: AI Spoken Dialogue Sandbox */}
        {currentTab === 'dialogue' && (
          <LiveDialogueView
            initialScenarioId={selectedScenarioId}
            onOpenToneDojoWithWord={(word) => {
              setTargetToneWord(word);
              setCurrentTab('tone_lab');
            }}
            onAddXp={handleAddXp}
          />
        )}

        {/* Tab 3: Nine Tones Dojo & Minimal Pairs Lab */}
        {currentTab === 'tone_lab' && (
          <ToneLabView
            initialTargetWord={targetToneWord}
            onAddXp={handleAddXp}
          />
        )}

        {/* Tab 4: English to Cantonese Vocabulary Bridge */}
        {currentTab === 'vocab_bridge' && <VocabBridgeView />}

        {/* Tab 5: EdTech Research & System Architecture Insights */}
        {currentTab === 'research' && <ResearchInsightView />}
      </main>

      {/* Interactive Lesson Modal */}
      {activeLessonNode && (
        <LessonModal
          node={activeLessonNode}
          onClose={() => setActiveLessonNode(null)}
          onComplete={handleCompleteLessonNode}
        />
      )}

      {/* Heart Refill Modal */}
      <HeartRefillModal
        isOpen={isHeartRefillOpen}
        onClose={() => setIsHeartRefillOpen(false)}
        currentHearts={stats.hearts}
        maxHearts={stats.maxHearts}
        cantoCoins={stats.cantoCoins}
        onRefillWithCoins={handleRefillWithCoins}
        onPracticeForHeart={handlePracticeForHeart}
      />
    </div>
  );
}

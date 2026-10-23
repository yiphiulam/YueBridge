import React from 'react';
import {
  FileText,
  Layers,
  Award,
  BookOpen,
  Globe2,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Users,
  Compass,
  Sparkles,
} from 'lucide-react';
import { researchMetricsData } from '../data/mockData';

export const ResearchInsightView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 pb-20">
      {/* Paper Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg mb-6 border border-indigo-900/50">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-bold mb-3">
          <Cpu className="w-3.5 h-3.5" />
          <span>EdTech 原型論文發表 · 系統架構展示</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
          雙語離散社群的粵語傳承：<br className="hidden sm:block" />
          結合 AI 與英文/粵語雙語切換機制之情境化口語學習系統開發
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 mt-2 font-mono">
          Contextualized Spoken Cantonese Learning System with AI & Dynamic English/Cantonese Code-Switching for Bilingual Diaspora Communities
        </p>

        {/* Abstract Box */}
        <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10 text-xs text-slate-200 leading-relaxed">
          <strong className="text-amber-300 font-bold block mb-1">【論文摘要 Abstract】</strong>
          近年大量香港家庭移居英、加、美、澳等英語國家，海外第二代成長於英語主導環境，常面臨粵語口語練習動機不足及雙語切換（Code-switching）時的表達障礙。傳統以香港在地經驗為主的教材，亦難以引發離散社群兒童的情境共鳴。
          <br /><br />
          本項目提出一套專為海外港人家庭設計的 AI 互動口語學習系統，結合多模態互動與大語言模型技術，旨在透過在地化情境與跨語言輔助提升傳承效益。系統展示其在降低文化隔閡、提升海外兒童開口自信與雙語溝通能力的實踐效益，為海外粵語教育科技（EdTech）提供具體可行的開發範本。
        </div>
      </div>

      {/* 3 Core System Architecture Pillars */}
      <div className="mb-6">
        <h2 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
          <Layers className="w-5 h-5 text-orange-500" />
          <span>系統核心機制與技術架構 (Core Architecture Pillars)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-xl font-bold mb-3">
                🏫
              </div>
              <h3 className="font-black text-slate-900 text-base mb-1">
                1. 在地化情境對話
              </h3>
              <p className="text-xs font-semibold text-orange-600 mb-2 font-mono">
                Localized Situational Dialogues
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                將主題融入海外兒童日常生活（如當地校園活動 Packed lunch/PE day、社區超市 Sainsbury’s 買餸、西方節慶 Halloween Trick or Treat），徹底打破傳統香港在地教材（搭小巴、茶餐廳）帶來的文化隔閡，提升代入感與練習動機。
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>5 大海外日常主題單元</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold mb-3">
                🌉
              </div>
              <h3 className="font-black text-slate-900 text-base mb-1">
                2. 動態英粵切換支援
              </h3>
              <p className="text-xs font-semibold text-blue-600 mb-2 font-mono">
                Dynamic Code-Switching Engine
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                借鑒 Cummins 雙冰山雙語理論，允許學童在詞彙受限時以英文穿插表達（"I want to eat 點心"）。AI 導師不批評、不中斷，即時理解意圖並自然引導轉換為道地粵語口語與粵拼（Jyutping）提示，搭建雙語學習階梯。
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>即時語碼轉換橋樑 (Code-Switch Bridge)</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center text-xl font-bold mb-3">
                🎵
              </div>
              <h3 className="font-black text-slate-900 text-base mb-1">
                3. 聲調可視化微修正
              </h3>
              <p className="text-xs font-semibold text-teal-600 mb-2 font-mono">
                Acoustic Tone Micro-Correction
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                針對雙語兒童最常發生的腔調與聲調混淆問題（如 買 maai5 vs 賣 maai6、湯 tong1 vs 糖 tong4），提供趙元任 5 度制聲調音高曲線動畫、真人發音與 Web Audio 音頻合成對比，給予無壓力且精準的微修正。
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>九聲六調道場 + 最小對立對 (Minimal Pairs)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Empirical Evaluation & Learning Analytics Dashboard */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6">
        <h2 className="text-base font-black text-slate-900 mb-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <span>學習成效與社群實踐評估指標 (Empirical Impact Metrics)</span>
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          基於海外港人二代家庭試用數據原型所呈現的雙語溝通動機與發音精準度分析：
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-center">
            <span className="text-2xl font-black text-orange-600">
              {researchMetricsData.codeSwitchingConfidenceScore}%
            </span>
            <p className="text-xs font-bold text-slate-700 mt-1">開口自信提升率</p>
            <p className="text-[10px] text-slate-400 mt-0.5">克服不敢講的焦慮</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-center">
            <span className="text-2xl font-black text-teal-600">
              {researchMetricsData.averageToneAccuracy}%
            </span>
            <p className="text-xs font-bold text-slate-700 mt-1">聲調辨識準確率</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Minimal Pairs 測試</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-center">
            <span className="text-2xl font-black text-blue-600">
              {researchMetricsData.familyUsageSessions} 次
            </span>
            <p className="text-xs font-bold text-slate-700 mt-1">月均親子共學次數</p>
            <p className="text-[10px] text-slate-400 mt-0.5">跨洋祖孫視訊互動</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-center">
            <span className="text-2xl font-black text-rose-600">
              {researchMetricsData.heritageAttachmentIndex}%
            </span>
            <p className="text-xs font-bold text-slate-700 mt-1">文化認同連結度</p>
            <p className="text-[10px] text-slate-400 mt-0.5">飲茶與節慶情境共鳴</p>
          </div>
        </div>
      </div>

      {/* Parent-Child Co-learning & Pedagogical Recommendations */}
      <div className="bg-amber-50/80 rounded-2xl p-5 border border-amber-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-amber-900 font-black text-sm">
          <Users className="w-4 h-4 text-amber-700" />
          <span>離散家庭家長共讀指引 (Parent-Child Co-learning Guide)</span>
        </div>
        <ul className="space-y-2 text-xs text-amber-950 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="font-bold text-amber-700">1. 接納 Code-switching：</span>
            <span>小朋友講話中英夾雜，是雙語大腦活化調用資源的健康過程，切勿打斷或批評「點解唔講全廣東話」。</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-amber-700">2. 重複與擴展 (Recast & Expand)：</span>
            <span>當孩子說 "I want to bring my scooter"，溫和回應：「好呀！你踩『滑板車』，媽咪同你一齊行！」以自然回饋代替硬性糾錯。</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold text-amber-700">3. 跨洋情感連結：</span>
            <span>每週安排一次 10 分鐘「祖孫視訊時間」，讓孩子應用系統學到的「食咗飯未」「婆婆你嗰邊點呀」，激發真正溝通成就感。</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

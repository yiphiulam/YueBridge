import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  ArrowRight,
  Info,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Headphones,
  Music,
  HelpCircle,
} from 'lucide-react';
import { ScenarioDefinition, ChatMessage, CodeSwitchItem, ToneCoachingItem } from '../types';
import { scenariosData } from '../data/mockData';
import { sound } from '../utils/audio';

interface LiveDialogueViewProps {
  initialScenarioId?: string;
  onOpenToneDojoWithWord?: (word: string) => void;
  onAddXp?: (xp: number) => void;
}

export const LiveDialogueView: React.FC<LiveDialogueViewProps> = ({
  initialScenarioId,
  onOpenToneDojoWithWord,
  onAddXp,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioDefinition>(() => {
    const found = scenariosData.find((s) => s.id === initialScenarioId);
    return found || scenariosData[0];
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-1',
      sender: 'assistant',
      text:
        selectedScenario.id === 'school_lunch'
          ? 'Hello！今日你帶咗咩 lunchbox 呀？有冇好嘢食同我 share 呀？'
          : selectedScenario.id === 'supermarket_sainsburys'
          ? '哈囉！今日嚟超市買餸，你想推車仔定係幫手搵生果呀？'
          : selectedScenario.id === 'video_call_grandma'
          ? '乖孫呀！婆婆喺香港好掛住你呀，今日你嗰邊有冇落雨呀？'
          : '哈囉！想食咩點心呀？熱辣辣蝦餃燒賣啱啱出籠喇！',
      jyutping:
        selectedScenario.id === 'school_lunch'
          ? 'Hello! gam1 jat6 nei5 daai3 zo2 me1 lunchbox aa3? jau5 mou5 hou2 je5 sik6 tung4 ngo5 share aa3?'
          : 'haa1 lo3! gam1 jat6 lai4 ciu1 si5 maai5 sung3, nei5 soeng2 teoi1 ce1 zai2 ding6 hai6 bong1 sau2 wan2 saang1 gwo2 aa3?',
      englishTranslation:
        selectedScenario.id === 'school_lunch'
          ? 'Hello! What lunchbox did you bring today? Any delicious food to share with me?'
          : 'Hello! Shopping at the supermarket today, do you want to push the cart or help find fruit?',
      suggestedReplies: [
        {
          canto: '我帶咗三文治同 apple！',
          en: 'I brought sandwiches and apple!',
          jyutping: 'ngo5 daai3 zo2 saam1 man4 zi6 tung4 apple!',
        },
        {
          canto: '聽日係 PE day，我要著波鞋。',
          en: 'Tomorrow is PE day, I must wear trainers.',
          jyutping: 'ting1 jat6 hai6 PE day, ngo5 jiu3 zoek3 bo1 haai4.',
        },
      ],
      coachMooEncouragement: '隨意講！就算唔記得某個廣東話字，直接講英文就得，牛牛會幫你搭起雙語橋樑！哞～',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [playingAudioText, setPlayingAudioText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API for voice recording
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        // Allows both Cantonese and English input
        recog.lang = 'zh-HK';

        recog.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputVal(transcript);
          setIsRecording(false);
        };

        recog.onerror = () => {
          setIsRecording(false);
        };

        recog.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recog;
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleScenarioChange = (scenario: ScenarioDefinition) => {
    sound.playClick();
    setSelectedScenario(scenario);
    setMessages([
      {
        id: `init-${scenario.id}`,
        sender: 'assistant',
        text:
          scenario.id === 'school_lunch'
            ? 'Hello！今日你帶咗咩 lunchbox 呀？有冇好嘢食同我 share 呀？'
            : scenario.id === 'supermarket_sainsburys'
            ? '哈囉！今日嚟超市買餸，你想推車仔定係幫手搵生果呀？'
            : scenario.id === 'video_call_grandma'
            ? '乖孫呀！婆婆喺香港好掛住你呀，今日你嗰邊有冇落雨呀？'
            : scenario.id === 'dimsum_yumcha'
            ? '熱辣辣蝦餃燒賣牛肉腸！小朋友，你想食咩點心呀？'
            : '萬聖節快樂！小朋友，你今日扮緊邊個角色嚟敲門呀？',
        jyutping: 'nei5 hou2 aa3! ngo5 dei6 jat1 cai4 gong2 gwong2 dung1 waa2 laa1!',
        englishTranslation: scenario.introStory,
        suggestedReplies: scenario.sampleUserPrompts.map((p) => ({
          canto: p.mixed,
          en: p.english,
          jyutping: p.cantoneseEquivalent,
        })),
        coachMooEncouragement: '歡迎嚟到新情境！用最自在的方式講，中英夾雜最自然！哞～',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleToggleRecord = () => {
    if (!speechSupported) {
      alert('您的瀏覽器暫未支援語音辨識，請使用文字輸入或點擊推薦詞泡！');
      return;
    }
    sound.playClick();
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        setIsRecording(false);
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputVal).trim();
    if (!text || isLoading) return;

    sound.playClick();
    setInputVal('');
    setIsRecording(false);

    // Append user message
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          scenarioId: selectedScenario.id,
          character: selectedScenario.partnerName,
        }),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();

      sound.playSuccess();
      onAddXp?.(15);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply_cantonese || '你講得好好呀！我聽得好明白！',
        jyutping: data.jyutping,
        englishTranslation: data.english_translation,
        codeSwitchBreakdown: data.code_switch_breakdown,
        toneCoaching: data.tone_coaching,
        coachMooEncouragement: data.coach_moo_encouragement,
        suggestedReplies: data.suggested_replies,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      sound.playError();
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: '好嘢！海外雙語小朋友好勇敢開口，我聽得好清楚！',
        jyutping: 'hou2 je5! hoi2 ngoi6 soeng1 jyu5 siu2 pang4 jau5 hou2 jung5 gam2 hoi1 hau2!',
        englishTranslation: 'Awesome! Overseas bilingual kids are brave to speak up, I understood clearly!',
        coachMooEncouragement: '開口講就贏咗一大步！繼續試下講多句！哞～',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakText = (cantoText: string, jyutping?: string) => {
    sound.playClick();
    setPlayingAudioText(cantoText);
    sound.speakCantonese(cantoText, jyutping, () => {
      setPlayingAudioText(null);
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 pb-20">
      {/* Top Scenario Switcher */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedScenario.icon}</span>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {selectedScenario.title}
              </h2>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-orange-100 text-orange-700">
                {selectedScenario.countryBadge}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              對話夥伴：<span className="font-bold text-slate-700">{selectedScenario.partnerName}</span> ({selectedScenario.partnerRole})
            </p>
          </div>

          {/* Quick Scenario Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
            {scenariosData.map((s) => (
              <button
                key={s.id}
                onClick={() => handleScenarioChange(s)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedScenario.id === s.id
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Diaspora Context Hint Banner */}
        <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 font-bold">
            💡
          </div>
          <div>
            <p className="font-bold">
              海外二代英粵切換（Code-switching）無壓力模式：
            </p>
            <p className="text-amber-800/90 mt-0.5">
              遇到想講但唔識嘅廣東話字，直接夾雜英文（如 "I want to eat 點心", "Tomorrow is PE day"），AI 會即時接住你的話題，並提供自然粵語口語轉換建議！
            </p>
          </div>
        </div>
      </div>

      {/* Main Dialogue Box */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 flex flex-col h-[560px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-xs ${
                    isUser
                      ? 'bg-blue-500 text-white'
                      : 'bg-gradient-to-tr from-amber-400 to-orange-400 text-white'
                  }`}
                >
                  {isUser ? '🎒' : selectedScenario.partnerAvatar}
                </div>

                {/* Message Body */}
                <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Chat Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-xs relative ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    {/* Speaker Header */}
                    {!isUser && (
                      <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-slate-200/60">
                        <span className="text-xs font-black text-orange-600">
                          {selectedScenario.partnerName}
                        </span>
                        <button
                          onClick={() => handleSpeakText(msg.text, msg.jyutping)}
                          className={`flex items-center gap-1 text-[11px] font-bold transition-all px-2.5 py-0.5 rounded-full border ${
                            playingAudioText === msg.text
                              ? 'bg-orange-500 text-white border-orange-600 shadow-xs animate-pulse'
                              : 'text-slate-600 hover:text-orange-600 bg-white border-slate-200 hover:border-orange-300'
                          }`}
                          title="聽道地原音廣東話發音 (Listen in Cantonese)"
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${playingAudioText === msg.text ? 'text-white' : 'text-orange-500'}`} />
                          <span>{playingAudioText === msg.text ? '粵語朗讀中...' : '粵語朗讀'}</span>
                        </button>
                      </div>
                    )}

                    {/* Main text */}
                    <p className={`text-base font-bold leading-relaxed ${isUser ? 'text-white' : 'text-slate-900'}`}>
                      {msg.text}
                    </p>

                    {/* Jyutping romanization for assistant */}
                    {!isUser && msg.jyutping && (
                      <p className="text-xs font-medium text-slate-500 font-mono mt-1 select-all">
                        {msg.jyutping}
                      </p>
                    )}

                    {/* English translation */}
                    {!isUser && msg.englishTranslation && (
                      <p className="text-xs text-slate-600 mt-1.5 italic bg-amber-50/60 rounded-md p-1.5 border border-amber-100">
                        🇬🇧 {msg.englishTranslation}
                      </p>
                    )}
                  </div>

                  {/* Code-Switching Breakdown Bridge (語碼轉換橋樑) */}
                  {!isUser && msg.codeSwitchBreakdown && msg.codeSwitchBreakdown.length > 0 && (
                    <div className="mt-2.5 w-full bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-3 shadow-xs">
                      <div className="flex items-center gap-1.5 mb-2 text-xs font-black text-orange-800">
                        <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                        <span>雙語切換橋樑 (Code-Switching Bridge)：</span>
                      </div>
                      <div className="space-y-2">
                        {msg.codeSwitchBreakdown.map((cs, idx) => (
                          <div
                            key={idx}
                            className="bg-white/90 rounded-lg p-2.5 border border-orange-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md text-xs border border-blue-200">
                                {cs.original_en}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <div>
                                <span className="font-black text-slate-900 text-sm">
                                  {cs.cantonese}
                                </span>
                                <span className="text-xs text-orange-600 font-mono font-bold ml-1.5">
                                  ({cs.jyutping})
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleSpeakText(cs.cantonese, cs.jyutping)}
                              className={`p-1.5 rounded-lg transition-all ${
                                playingAudioText === cs.cantonese
                                  ? 'bg-orange-500 text-white animate-pulse shadow-xs'
                                  : 'text-slate-500 hover:text-orange-600 hover:bg-orange-50'
                              }`}
                              title="聽粵語單字發音"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {msg.codeSwitchBreakdown[0]?.tip && (
                        <p className="text-[11px] text-orange-700/90 font-medium mt-1.5">
                          💡 {msg.codeSwitchBreakdown[0].tip}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Tone Coaching Micro-Correction Card */}
                  {!isUser && msg.toneCoaching && (
                    <div className="mt-2 w-full bg-teal-50/90 border border-teal-200 rounded-xl p-3 shadow-xs">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-black text-teal-900">
                          <Music className="w-3.5 h-3.5 text-teal-600" />
                          <span>九聲六調微修正：</span>
                          <span className="font-bold text-teal-700 font-mono">
                            {msg.toneCoaching.word} ({msg.toneCoaching.jyutping})
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                          Tone {msg.toneCoaching.tone_numbers}
                        </span>
                      </div>
                      <p className="text-xs text-teal-800 font-medium leading-relaxed">
                        {msg.toneCoaching.feedback}
                      </p>
                      {onOpenToneDojoWithWord && (
                        <button
                          onClick={() => onOpenToneDojoWithWord(msg.toneCoaching?.word || '')}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-white/80 px-2.5 py-1 rounded-lg border border-teal-200 shadow-2xs"
                        >
                          <span>前往道場練習音高曲線</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Mascot Cheer */}
                  {!isUser && msg.coachMooEncouragement && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-50/80 px-3 py-1.5 rounded-full border border-amber-200">
                      <span className="text-sm">🐮</span>
                      <span>{msg.coachMooEncouragement}</span>
                    </div>
                  )}

                  {/* Timestamp */}
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 items-center text-slate-500 text-xs font-bold animate-pulse p-2">
              <div className="w-9 h-9 rounded-2xl bg-orange-100 flex items-center justify-center text-lg">
                🐮
              </div>
              <div className="bg-slate-100 rounded-xl px-4 py-2 text-slate-600">
                牛牛正在分析英粵切換並生成地道回覆...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length > 0 &&
          messages[messages.length - 1].suggestedReplies &&
          messages[messages.length - 1].suggestedReplies!.length > 0 && (
            <div className="px-4 py-2 bg-slate-50/90 border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                💡 試下咁答：
              </span>
              {messages[messages.length - 1].suggestedReplies!.map((rep, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(rep.canto)}
                  className="px-3 py-1 rounded-full bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-xs font-bold text-slate-700 whitespace-nowrap transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <span>{rep.canto}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({rep.en})</span>
                </button>
              ))}
            </div>
          )}

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          {/* Mic Button */}
          <button
            onClick={handleToggleRecord}
            className={`p-3 rounded-xl transition-all flex items-center justify-center shrink-0 ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            title={isRecording ? '錄音中，點擊停止' : '用語音說廣東話 (支援英粵混講)'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={
                isRecording
                  ? '正在聆聽... 請開口說話 (可英粵混講)'
                  : '輸入廣東話或英文，例如 "I want to eat 點心"...'
              }
              className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputVal.trim() || isLoading}
            className="p-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:pointer-events-none text-white transition-all shadow-md shadow-orange-500/20 shrink-0"
            title="發送對話"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

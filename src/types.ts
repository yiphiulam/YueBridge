// Types for YueBridge (粵聲同行) - Diaspora Cantonese Learning System

export type TabType = 'learn' | 'dialogue' | 'tone_lab' | 'vocab_bridge' | 'research';

export type DiasporaCountry = 'uk' | 'canada' | 'usa' | 'australia';

export interface UserStats {
  name: string;
  avatar: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  streak: number;
  cantoCoins: number;
  hearts: number;
  maxHearts: number;
  soundEnabled: boolean;
  diasporaCountry: DiasporaCountry;
  countryNameZh: string;
  totalConversations: number;
  codeSwitchedWordsLearned: number;
  tonesPracticed: number;
  completedToday: boolean;
  lastCompletedDate: string;
}

export type LessonType = 'scenario_chat' | 'code_switch_challenge' | 'tone_dojo' | 'listening_quiz';

export interface QuizOption {
  text: string;
  jyutping: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  questionEn: string;
  targetTone?: number;
  codeSwitchedPrompt?: string; // e.g. "I want to take my scooter to the park"
  audioText?: string;
  options: QuizOption[];
  bridgingTip?: string; // e.g. "scooter 喺廣東話口語係講『滑板車』(waat6 baan2 ce1)"
}

export interface LessonNode {
  id: string;
  unitId: number;
  title: string;
  titleEn: string;
  type: LessonType;
  status: 'locked' | 'unlocked' | 'completed';
  stars: number; // 0 - 3
  xpReward: number;
  coinsReward: number;
  scenarioId?: string;
  questions?: QuizQuestion[];
  toneTargetWord?: string;
}

export interface LearningUnit {
  id: number;
  title: string;
  titleEn: string;
  flag: string;
  themeColor: string; // e.g. 'bg-emerald-500'
  accentColor: string;
  description: string;
  diasporaContext?: string;
  nodes: LessonNode[];
}

export interface CodeSwitchItem {
  original_en: string;
  cantonese: string;
  jyutping: string;
  tip: string;
}

export interface ToneCoachingItem {
  word: string;
  jyutping: string;
  tone_numbers: string;
  feedback: string;
}

export interface SuggestedReply {
  canto: string;
  en: string;
  jyutping: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'coach_moo';
  text: string;
  jyutping?: string;
  englishTranslation?: string;
  codeSwitchBreakdown?: CodeSwitchItem[];
  toneCoaching?: ToneCoachingItem;
  suggestedReplies?: SuggestedReply[];
  coachMooEncouragement?: string;
  timestamp: string;
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  titleEn: string;
  icon: string;
  category: 'school' | 'community' | 'family' | 'festival' | 'food';
  countryBadge: string;
  partnerName: string;
  partnerRole: string;
  partnerAvatar: string;
  scenarioSetting: string;
  introStory: string;
  sampleUserPrompts: Array<{
    mixed: string;
    english: string;
    cantoneseEquivalent: string;
  }>;
  commonCodeSwitches: Array<{
    en: string;
    canto: string;
    jyutping: string;
    tip: string;
  }>;
  keyTonePractice: {
    word: string;
    jyutping: string;
    toneNumber: number;
    tip: string;
  };
}

export interface ToneDetail {
  toneNumber: number; // 1 - 9
  toneId6: number; // 1 - 6 for LSHK 6 tones mapping
  nameTraditional: string; // 陰平、陰上、陰去、陽平、陽上、陽去、上陰入、下陰入、陽入
  nameEnglish: string;
  type: '舒聲 (平上去)' | '促聲 (入聲 -p/-t/-k)';
  pitchContour: string; // e.g. '55', '35', '33', '21', '23', '22', '5', '3', '2'
  pitchShape: 'high-flat' | 'high-rising' | 'mid-flat' | 'low-falling' | 'low-rising' | 'low-flat' | 'checked-high' | 'checked-mid' | 'checked-low';
  ipa: string; // e.g. ˥, ˧˥, ˧, ˨˩, ˨˧, ˨
  jyutpingNum: string; // e.g. '1', '7 (或 1)', '8 (或 3)', '9 (或 6)'
  eduNum: string; // 教院拼音 1 - 9
  sampleWord: string;
  jyutping: string;
  meaningEn: string;
  meaningZh: string;
  codaType?: '舒聲韻尾' | '-p 閉唇塞音' | '-t 抵齒塞音' | '-k 閉顎塞音';
  kidFriendlyMnemonic: string;
  audioSimFreq: number; // For Web Audio API tone synthesis
}

export interface NineToneMnemonic {
  id: string;
  category: '美食飲食' | '數字諧音' | '財富生活' | '幽默生動' | '傳統歷史';
  title: string;
  sentence: string; // 9 characters
  characters: Array<{
    char: string;
    toneNumber: number; // 1 - 9
    toneName: string;
    jyutping: string;
    pitchContour: string;
  }>;
  explanation: string;
}

export interface VocabularyBridgeCard {
  id: string;
  english: string;
  cantonese: string;
  jyutping: string;
  category: '學校校園' | '超市生活' | '西方節慶' | '家庭長輩' | '飲茶美食' | '情緒表達';
  toneNumber: number;
  diasporaContext: string;
  exampleSentence: string;
  exampleSentenceEn: string;
  exampleJyutping: string;
  mastered?: boolean;
}

export interface MooCostume {
  headwear?: string;
  outfit?: string;
  handheld?: string;
  footwear?: string;
}

export interface ResearchMetric {
  codeSwitchingConfidenceScore: number; // e.g. 84%
  averageToneAccuracy: number; // e.g. 79%
  familyUsageSessions: number; // e.g. 14 sessions
  heritageAttachmentIndex: number; // e.g. 91%
}

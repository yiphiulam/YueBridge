import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// Initialize Google GenAI SDK if API key exists
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with key, using fallback responses:', err);
  }
}

// Fallback response generator with diaspora context
function generateDiasporaFallback(message: string, scenarioId: string, character: string) {
  const lowerMsg = message.toLowerCase();
  
  // Extract common English words kids use
  const codeSwitches: Array<{ original_en: string; cantonese: string; jyutping: string; tip: string }> = [];
  
  if (lowerMsg.includes('lunchbox') || lowerMsg.includes('lunch box')) {
    codeSwitches.push({ original_en: 'lunchbox', cantonese: '飯盒', jyutping: 'faan6 hap6', tip: '口語講「帶飯盒」或者「食lunch」，廣東話「飯盒」發音第6聲要低沈。' });
  }
  if (lowerMsg.includes('sports day') || lowerMsg.includes('pe')) {
    codeSwitches.push({ original_en: 'sports day / PE', cantonese: '運動會 / 體育堂', jyutping: 'wan6 dung6 wui2 / tai2 juk6 tong4', tip: '學校做運動叫「上體育堂」，全校賽跑就叫「運動會」。' });
  }
  if (lowerMsg.includes('recess') || lowerMsg.includes('break time')) {
    codeSwitches.push({ original_en: 'recess / break time', cantonese: '小息', jyutping: 'siu2 sik1', tip: '香港同廣東話學校習慣叫「小息」，「息」係第1聲短促音。' });
  }
  if (lowerMsg.includes('playground') || lowerMsg.includes('park')) {
    codeSwitches.push({ original_en: 'playground / park', cantonese: '遊樂場 / 公園', jyutping: 'jau4 lok6 coeng4 / gung1 jyun2', tip: '去有滑梯秋千嘅地方，通常同爹哋媽咪講「去公園玩」或者「去遊樂場」。' });
  }
  if (lowerMsg.includes('supermarket') || lowerMsg.includes('groceries')) {
    codeSwitches.push({ original_en: 'supermarket', cantonese: '超級市場 / 超市', jyutping: 'ciu1 kap1 si5 coeng4 / ciu1 si5', tip: '平日簡稱「去超市買餸」，「買餸」代表買餸菜。' });
  }
  if (lowerMsg.includes('dim sum') || lowerMsg.includes('dumpling') || lowerMsg.includes('siu mai')) {
    codeSwitches.push({ original_en: 'dim sum', cantonese: '點心 / 飲茶', jyutping: 'dim2 sam1 / jam2 caa4', tip: '同公公婆婆去食點心，廣東話習慣成個活動叫「去飲茶」。' });
  }
  if (lowerMsg.includes('halloween') || lowerMsg.includes('trick or treat')) {
    codeSwitches.push({ original_en: 'Halloween / Trick or treat', cantonese: '萬聖節 / 扮鬼扮馬攞糖', jyutping: 'maan6 sing3 zit3', tip: 'Trick or treat 可以同長輩講「去敲門要糖糖食」，好生動！' });
  }
  if (lowerMsg.includes('scooter') || lowerMsg.includes('bike')) {
    codeSwitches.push({ original_en: 'scooter / bike', cantonese: '滑板車 / 單車', jyutping: 'waat6 baan2 ce1 / daan1 ce1', tip: '踩 scooter 廣東話叫「踩滑板車」，個「踩」字讀 caai2。' });
  }
  if (lowerMsg.includes('apple') || lowerMsg.includes('banana') || lowerMsg.includes('fruit')) {
    codeSwitches.push({ original_en: 'apple / fruit', cantonese: '蘋果 / 生果', jyutping: 'ping4 gwo2 / saang1 gwo2', tip: '廣東話稱 fruits 為「生果」，蘋果嘅「果」讀第2聲。' });
  }

  // If no specific match, create a general code switch helper
  if (codeSwitches.length === 0) {
    codeSwitches.push({
      original_en: 'Bilingual expression',
      cantonese: '廣東話地道表達',
      jyutping: 'gwong2 dung1 waa2',
      tip: '海外雙語小朋友好叻呀！英文諗到嘅字，牛牛一齊教你轉做廣東話！'
    });
  }

  // Tailored responses per scenario
  let replyCanto = '你講得好好呀！我聽得好明白！';
  let jyutping = 'nei5 gong2 dak1 hou2 hou2 aa3! ngo5 teng1 dak1 hou2 ming4 baak6!';
  let englishTrans = 'You said that really well! I understood completely!';
  let toneCoaching = {
    word: '講得好',
    jyutping: 'gong2 dak1 hou2',
    tone_numbers: '2 - 1 - 2',
    feedback: '「講」(gong2) 同「好」(hou2) 都係第2聲高升調，好似爬小山丘咁，尾音輕輕向上挑！'
  };

  if (scenarioId === 'school_lunch' || scenarioId === 'school_life') {
    replyCanto = '嘩，好正呀！喺英國/海外返學，同同學仔 share 飯盒真係好開心！你最鍾意食乜嘢？';
    jyutping = 'waa3, hou2 zeng3 aa3! hai2 jing1 gwok3 faan1 hok6, tung4 tung4 hok6 zai2 share faan6 hap6 zan1 hai6 hou2 hoi1 sam1! nei5 zeoi3 zung1 ji3 sik6 mat1 je5?';
    englishTrans = 'Wow, that sounds great! Going to school overseas and sharing lunchboxes with classmates is so fun! What do you like to eat most?';
    toneCoaching = {
      word: '飯盒',
      jyutping: 'faan6 hap6',
      tone_numbers: '6 - 6',
      feedback: '「飯」(faan6) 同「盒」(hap6) 都係第6聲低沈調，喉嚨放鬆、音調沉穩，唔好拉高喔！'
    };
  } else if (scenarioId === 'supermarket_sainsburys' || scenarioId === 'supermarket') {
    replyCanto = '收到！超市好多好食嘅嘢喎，我哋一齊去生果區同零食架睇下有冇得買啦！';
    jyutping = 'sau1 dou2! ciu1 si5 hou2 do1 hou2 sik6 ge3 je5 wo3, ngo5 dei6 jat1 cai4 heoi3 saang1 gwo2 keoi1 tung4 ling4 sik6 gaa2 tai2 haa5 jau5 mou5 dak1 maai5 laa1!';
    englishTrans = 'Got it! The supermarket has so much good food, let us check the fruit aisle and snack shelves to see what we can buy!';
    toneCoaching = {
      word: '買 vs 賣',
      jyutping: 'maai5 (買) vs maai6 (賣)',
      tone_numbers: '5 (低升) vs 6 (低平)',
      feedback: '海外雙語小朋友最易混淆：去超市「買嘢」係第5聲 (maai5，向上揚)；如果是老闆「賣嘢」先係第6聲 (maai6，沉低)！'
    };
  } else if (scenarioId === 'video_call_grandma' || scenarioId === 'family') {
    replyCanto = '乖孫呀！婆婆喺香港見到你視訊好開心！你嗰邊天氣凍唔凍呀？今日有冇着多件褸？';
    jyutping = 'gwaai1 syun1 aa3! po4 po2 hai2 hoeng1 gong2 gin3 dou2 nei5 si6 seon3 hou2 hoi1 sam1! nei5 go2 bin1 tin1 hei3 dung3 m4 dung3 aa3? gam1 jat6 jau5 mou5 zoek3 do1 gin6 lau1?';
    englishTrans = 'Good grandchild! Grandma is so happy to see you on video call from Hong Kong! Is the weather cold over there? Did you put on an extra coat today?';
    toneCoaching = {
      word: '婆婆',
      jyutping: 'po4 po2',
      tone_numbers: '4 - 2',
      feedback: '第一個「婆」係第4聲低沉調 (po4)，第二個「婆」通常變調讀第2聲高升 (po2)，聽落好親切！'
    };
  } else if (scenarioId === 'dimsum_yumcha') {
    replyCanto = '飲茶真係一流！一陣等點心推車嚟，你想食蝦餃、燒賣定係叉燒包先呀？';
    jyutping = 'jam2 caa4 zan1 hai6 jat1 lau4! jat1 zan6 dang2 dim2 sam1 teoi1 ce1 lai4, nei5 soeng2 sik6 haa1 gaau2, siu1 maai2 ding6 hai6 caa1 siu1 baau1 sin1 aa3?';
    englishTrans = 'Yum Cha is truly top-tier! In a moment when the dim sum cart comes, do you want to eat har gow, siu mai, or char siu bao first?';
    toneCoaching = {
      word: '蝦餃',
      jyutping: 'haa1 gaau2',
      tone_numbers: '1 - 2',
      feedback: '「蝦」係第1聲 (haa1，高平調像吹哨子)，「餃」係第2聲 (gaau2，高升調向上彈)！'
    };
  }

  return {
    reply_cantonese: replyCanto,
    jyutping: jyutping,
    english_translation: englishTrans,
    code_switch_breakdown: codeSwitches,
    tone_coaching: toneCoaching,
    coach_moo_encouragement: '牛牛教練超欣賞你！用英文 mix 廣東話好自然，繼續講，語感就會越嚟越勁！哞～',
    suggested_replies: [
      { canto: '我都好鍾意！', en: 'I really like it too!', jyutping: 'ngo5 dou1 hou2 zung1 ji3!' },
      { canto: '等我再諗諗先～', en: 'Let me think a bit first~', jyutping: 'dang2 ngo5 zoi3 lam2 lam2 sin1~' }
    ]
  };
}

// API Route: Contextual Spoken Dialogue with Gemini LLM & Dynamic Code-Switching
app.post('/api/chat', async (req, res) => {
  try {
    const { message, scenarioId, character, history } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!aiClient) {
      // Return rich diaspora fallback if API key is not present
      const fallback = generateDiasporaFallback(message, scenarioId || 'general', character || 'Coach Moo');
      return res.json(fallback);
    }

    // Call Gemini 3.8 Flash
    const systemPrompt = `You are "Coach Moo" (牛牛教練), a friendly, culturally attuned, and encouraging Cantonese language mentor for bilingual diaspora children (living in UK, Canada, US, Australia) aged 6-16.
Key mission:
1. Accept and celebrate "Code-Switching": overseas kids frequently mix English and Cantonese words (e.g. "I want to eat 點心", "Teacher says tomorrow is sports day, 我要帶乜嘢?"). NEVER judge or penalize them.
2. Reply in natural, colloquial spoken Cantonese (廣東話口語，切勿使用書面語或普通話句式！如使用：乜嘢、點解、喺度、食咗、好正、同學仔、一齊、買餸).
3. Identify every English word or mixed phrase the child used. Map it to authentic spoken Cantonese and provide Jyutping romanization with actionable micro-tips.
4. Provide a "Tone Coaching" tip for one notable tone distinction or common diaspora confusion (e.g. 買 maai5 vs 賣 maai6, 湯 tong1 vs 糖 tong4, 試 si3 vs 事 si6, high tone 1 vs low tone 4, high rising 2 vs low rising 5).
5. Output STRICT JSON format only.

Scenario Context: ${scenarioId || 'Everyday diaspora life'}
Character interacting: ${character || 'Toby / Friend'}

Expected JSON structure:
{
  "reply_cantonese": "natural spoken Cantonese reply",
  "jyutping": "jyutping for the reply with tone numbers 1-6",
  "english_translation": "kid-friendly English translation of the reply",
  "code_switch_breakdown": [
    {
      "original_en": "word in English used by user",
      "cantonese": "spoken Cantonese equivalent",
      "jyutping": "jyutping with tone",
      "tip": "brief bilingual learning tip for diaspora children"
    }
  ],
  "tone_coaching": {
    "word": "word or minimal pair",
    "jyutping": "romanization",
    "tone_numbers": "e.g. 2 - 1",
    "feedback": "encouraging explanation of the pitch contour and how to pronounce correctly"
  },
  "coach_moo_encouragement": "warm 1-2 sentence mascot cheer from Coach Moo with occasional playful bovine touch (e.g. 哞～)",
  "suggested_replies": [
    { "canto": "廣東話建議回答", "en": "English hint", "jyutping": "jyutping" }
  ]
}`;

    const promptText = `User input (may be English, Cantonese, or Code-switched): "${message}".
Please analyze, converse naturally in Cantonese as ${character || 'Toby'}, provide code-switching conversion bridges and tone coaching, and return the JSON.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text || '';
    try {
      const parsed = JSON.parse(text);
      return res.json(parsed);
    } catch {
      // If parsing fails, use fallback
      const fallback = generateDiasporaFallback(message, scenarioId || 'general', character || 'Coach Moo');
      return res.json(fallback);
    }
  } catch (error) {
    console.error('Error in /api/chat:', error);
    // Graceful fallback on network/rate-limit error
    const fallback = generateDiasporaFallback(req.body.message || '', req.body.scenarioId || 'general', req.body.character || 'Coach Moo');
    return res.json(fallback);
  }
});

// API Route: Tone Coach Specific Evaluator
app.post('/api/tone-coach', async (req, res) => {
  try {
    const { targetWord, userPinyinOrTone } = req.body;
    
    const toneDatabase: Record<string, any> = {
      '買': { word: '買', tone: 5, jyutping: 'maai5', name: '陽上 (Low Rising 23)', pitch: '23', tip: '音調從低沉處往上揚，似英文懷疑時講 "huh?"' },
      '賣': { word: '賣', tone: 6, jyutping: 'maai6', name: '陽去 (Low Level 22)', pitch: '22', tip: '音調保持低沉平穩，喉嚨徹底放鬆。' },
      '湯': { word: '湯', tone: 1, jyutping: 'tong1', name: '陰平 (High Level 55)', pitch: '55', tip: '音調高而平，好似唱 Do-Re-Mi 嘅高音 So！' },
      '糖': { word: '糖', tone: 4, jyutping: 'tong4', name: '陽平 (Low Falling 21)', pitch: '21', tip: '音調從低處再向下滑落，嘆氣咁嘆「唉～」' },
      '師': { word: '師', tone: 1, jyutping: 'si1', name: '陰平 (High Level 55)', pitch: '55', tip: '第1聲高平，像「醫生」的「醫」' },
      '史': { word: '史', tone: 2, jyutping: 'si2', name: '陰上 (High Rising 25)', pitch: '25', tip: '第2聲高升，像英文問句尾音 "really?"' },
      '市': { word: '市', tone: 5, jyutping: 'si5', name: '陽上 (Low Rising 23)', pitch: '23', tip: '第5聲低升，從低音稍微提一提' },
      '事': { word: '事', tone: 6, jyutping: 'si6', name: '陽去 (Low Level 22)', pitch: '22', tip: '第6聲低平，喉嚨放低不變調' },
    };

    const match = toneDatabase[targetWord] || {
      word: targetWord || '廣東話',
      tone: 2,
      jyutping: 'gwong2',
      name: '聲調微調整',
      pitch: '25',
      tip: '留意聲調高低起伏，配合粵拼練習，雙語耳朵最靈敏！'
    };

    return res.json({
      success: true,
      data: match
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process tone' });
  }
});

import { EdgeTTS } from 'node-edge-tts';
import fs from 'fs';
import os from 'os';

// In-memory TTS audio cache for instant playback
const ttsCache = new Map<string, { buffer: Buffer; mimeType: string }>();

// Neural Cantonese Edge TTS instance (Hong Kong authentic voice, studio quality, zero static)
const edgeTTSInstance = new EdgeTTS({ voice: 'zh-HK-HiuMaanNeural', lang: 'zh-HK' });

async function generateEdgeTTSCantonese(text: string): Promise<Buffer | null> {
  const tmpFile = path.join(os.tmpdir(), `canto_${Date.now()}_${Math.random().toString(36).slice(2)}.mp3`);
  try {
    await edgeTTSInstance.ttsPromise(text, tmpFile);
    if (fs.existsSync(tmpFile)) {
      const buffer = fs.readFileSync(tmpFile);
      fs.unlinkSync(tmpFile);
      return buffer;
    }
    return null;
  } catch (err) {
    console.warn('EdgeTTS error for text:', text, err);
    try {
      if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
    } catch {}
    return null;
  }
}

// Helper: Create standard RIFF WAV header for PCM data
function createWavHeader(dataLength: number, sampleRate = 11025, channels = 1, bitsPerSample = 8): Buffer {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), 28);
  header.writeUInt16LE(channels * (bitsPerSample / 8), 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);
  return header;
}

// Syllable cache to avoid repeated network calls
const syllableCache = new Map<string, Buffer>();

async function fetchCantoneseSyllableWav(syllable: string): Promise<Buffer | null> {
  const cleanSyllable = syllable.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (!cleanSyllable) return null;
  if (syllableCache.has(cleanSyllable)) {
    return syllableCache.get(cleanSyllable)!;
  }

  const url = `https://humanum.arts.cuhk.edu.hk/Lexis/lexi-can/sound/${cleanSyllable}.wav`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuf = await res.arrayBuffer();
    const buf = Buffer.from(arrayBuf);
    syllableCache.set(cleanSyllable, buf);
    return buf;
  } catch (err) {
    console.warn(`Failed to fetch Cantonese syllable ${cleanSyllable}:`, err);
    return null;
  }
}

// Concatenate multiple 11025Hz 8-bit mono CUHK syllables
function concatenateCantoneseWavs(wavBuffers: Buffer[]): Buffer | null {
  if (wavBuffers.length === 0) return null;
  if (wavBuffers.length === 1) return wavBuffers[0];

  const pcmChunks: Buffer[] = [];
  const silence = Buffer.alloc(320, 128); // 8-bit PCM unsigned silence (~29ms gap)

  for (let i = 0; i < wavBuffers.length; i++) {
    const wav = wavBuffers[i];
    if (wav.length > 44) {
      pcmChunks.push(wav.subarray(44));
      if (i < wavBuffers.length - 1) {
        pcmChunks.push(silence);
      }
    }
  }

  const totalData = Buffer.concat(pcmChunks);
  const header = createWavHeader(totalData.length, 11025, 1, 8);
  return Buffer.concat([header, totalData]);
}

// Authoritative Cantonese Jyutping Dictionary mapping for high-frequency words and user recordings
const CANTONESE_WORD_MAP: Record<string, string[]> = {
  // User uploaded words
  '擦膠': ['caat3', 'gaau1'],
  '小息': ['siu2', 'sik1'],
  '企好': ['kei2', 'hou2'],
  '食': ['sik6'],
  '有': ['jau5'],
  '你睇我識唔識': ['nei5', 'tai2', 'ngo5', 'sik1', 'm4', 'sik1'],
  '你識唔識': ['nei5', 'sik1', 'm4', 'sik1'],
  '睇': ['tai2'],
  '識': ['sik1'],
  '唔識': ['m4', 'sik1'],
  
  // 9 Tones & Minimal Pairs
  '分': ['fan1'],
  '粉': ['fan2'],
  '訓': ['fan3'],
  '焚': ['fan4'],
  '憤': ['fan5'],
  '份': ['fan6'],
  '忽': ['fat1'],
  '發': ['faat3'],
  '佛': ['fat6'],
  '詩': ['si1'],
  '史': ['si2'],
  '試': ['si3'],
  '時': ['si4'],
  '市': ['si5'],
  '事': ['si6'],
  '買': ['maai5'],
  '賣': ['maai6'],
  '湯': ['tong1'],
  '糖': ['tong4'],
  '餃': ['gaau2'],
  '蝦': ['haa1'],
  '教': ['gaau3'],
  '蝦餃': ['haa1', 'gaau2'],
  '燒賣': ['siu1', 'maai2'],
  '腸粉': ['coeng4', 'fan2'],
  '點心': ['dim2', 'sam1'],
  '飲茶': ['jam2', 'caa4'],
  '飯盒': ['faan6', 'hap6'],
  '運動會': ['wan6', 'dung6', 'wui2'],
  '體育堂': ['tai2', 'juk6', 'tong4'],
  '遊樂場': ['jau4', 'lok6', 'coeng4'],
  '公園': ['gung1', 'jyun2'],
  '超市': ['ciu1', 'si5'],
  '超級市場': ['ciu1', 'kap1', 'si5', 'coeng4'],
  '買餸': ['maai5', 'sung3'],
  '滑板車': ['waat6', 'baan2', 'ce1'],
  '單車': ['daan1', 'ce1'],
  '蘋果': ['ping4', 'gwo2'],
  '生果': ['saang1', 'gwo2'],
  '手推車': ['sau2', 'teoi1', 'ce1'],
  '車仔': ['ce1', 'zai2'],
  '收銀處': ['sau1', 'ngan4', 'cyu3'],
  '畀錢': ['bei2', 'cin2'],
  '薯片': ['syu4', 'pin2'],
  '粟米片': ['suk1', 'mai5', 'pin3'],
  '婆婆': ['po4', 'po2'],
  '姐姐': ['ze4', 'ze2'],
  '落雨': ['lok6', 'jyu5'],
  '落雪': ['lok6', 'syut3'],
  '功課': ['gung1', 'fo3'],
  '放假': ['fong3', 'gaa3'],
  '暑假': ['syu2', 'gaa3'],
  '茶壺': ['caa4', 'wu2'],
  '滾水': ['gwan2', 'seoi2'],
  '月光': ['jyut6', 'gwong1'],
  '曹操': ['cou4', 'cou1'],
  '蝴蝶': ['wu4', 'dip2'],
  '切片': ['cit3', 'pin2'],
  '食糖果': ['sik6', 'tong2'],

  // Nine Tone Mnemonics
  '三碗細牛腩麵餿夾辣': ['saam1', 'wun2', 'sai3', 'ngau4', 'naam5', 'min6', 'suk1', 'gaap3', 'laat6'],
  '三九四零五二七八六': ['saam1', 'gau2', 'sei3', 'ling4', 'ng5', 'ji6', 'cat1', 'baat3', 'luk6'],
  '千幾個無有萬億百十': ['cin1', 'gei2', 'go3', 'mou4', 'jau5', 'maan6', 'jik1', 'baak3', 'sap6'],
  '張仔要同我哋織隻襪': ['zoeng1', 'zai2', 'jiu3', 'tung4', 'ngo5', 'dei6', 'zik1', 'zek3', 'mat6'],
  '風水到時我哋必發達': ['fung1', 'seoi2', 'dou3', 'si4', 'ngo5', 'dei6', 'bit1', 'faat3', 'daat6'],
  '周口店河姆渡骨甲集': ['zau1', 'hau2', 'dim3', 'ho4', 'mou5', 'dou6', 'gwat1', 'gaap3', 'zaap6'],

  // Single characters
  '三': ['saam1'],
  '碗': ['wun2'],
  '細': ['sai3'],
  '牛': ['ngau4'],
  '腩': ['naam5'],
  '麵': ['min6'],
  '餿': ['suk1'],
  '夾': ['gaap3'],
  '辣': ['laat6'],
  '九': ['gau2'],
  '四': ['sei3'],
  '零': ['ling4'],
  '五': ['ng5'],
  '二': ['ji6'],
  '七': ['cat1'],
  '八': ['baat3'],
  '六': ['luk6'],
  '千': ['cin1'],
  '幾': ['gei2'],
  '個': ['go3'],
  '無': ['mou4'],
  '萬': ['maan6'],
  '億': ['jik1'],
  '百': ['baak3'],
  '十': ['sap6'],
  '張': ['zoeng1'],
  '仔': ['zai2'],
  '要': ['jiu3'],
  '同': ['tung4'],
  '我': ['ngo5'],
  '哋': ['dei6'],
  '織': ['zik1'],
  '隻': ['zek3'],
  '襪': ['mat6'],
  '風': ['fung1'],
  '水': ['seoi2'],
  '到': ['dou3'],
  '必': ['bit1'],
  '達': ['daat6'],
  '骨': ['gwat1'],
  '甲': ['gaap3'],
  '集': ['zaap6'],
  '鴨': ['aap3'],
  '盒': ['hap6'],
};

// API Route: Exclusive Authentic Hong Kong Cantonese TTS (zh-HK-HiuMaanNeural)
app.get('/api/tts', async (req, res) => {
  try {
    const rawText = (req.query.text as string || '').trim();
    const explicitJyutping = (req.query.jyutping as string || '').trim();

    if (!rawText && !explicitJyutping) {
      return res.status(400).json({ error: 'Text or jyutping query parameter is required' });
    }

    // Clean text: strip parenthetical notes, brackets, and ensure slashes "/" or "／" are NEVER pronounced as "slash" or "斜線"
    let cleanText = rawText
      .replace(/[\(（][^()（）]*[\)）]/g, '')
      .replace(/\[[^\[\]]*\]/g, '')
      .replace(/[\/／\\]+/g, ' ') // DO NOT PRONOUNCE "/" or "／"!
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText && rawText) {
      cleanText = rawText.split(/[\(（]/)[0].replace(/[\/／\\]+/g, ' ').trim();
    }

    let textToSpeak = cleanText || rawText || explicitJyutping;
    textToSpeak = textToSpeak.replace(/[\/／\\]+/g, ' ').replace(/\s+/g, ' ').trim();
    const cacheKey = `hiumaan__${textToSpeak}`;

    if (ttsCache.has(cacheKey)) {
      const cached = ttsCache.get(cacheKey)!;
      res.set({
        'Content-Type': cached.mimeType,
        'Cache-Control': 'public, max-age=86400',
        'Accept-Ranges': 'bytes',
      });
      return res.send(cached.buffer);
    }

    // Strictly generate voice with Microsoft Edge zh-HK-HiuMaanNeural (曉曼・標準香港粵語)
    const mp3Buffer = await generateEdgeTTSCantonese(textToSpeak);
    if (mp3Buffer && mp3Buffer.length > 0) {
      ttsCache.set(cacheKey, { buffer: mp3Buffer, mimeType: 'audio/mpeg' });
      res.set({
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
        'Accept-Ranges': 'bytes',
      });
      return res.send(mp3Buffer);
    }

    return res.status(500).json({ error: 'Failed to generate Cantonese speech' });
  } catch (error) {
    console.error('Error serving Cantonese TTS audio:', error);
    return res.status(500).json({ error: 'Failed to stream Cantonese TTS' });
  }
});

// Setup Vite in Dev or Static files in Prod
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`YueBridge Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

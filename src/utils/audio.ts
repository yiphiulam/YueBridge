// Synthesizes pleasant gamified sounds and Cantonese pronunciation & tone pitch contours via Web Audio API & Web Speech API

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  playClick() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Joyful major chord progression (Duolingo chime)
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch {}
  }

  playError() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  playLevelUp() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const melody = [523.25, 659.25, 783.99, 987.77, 1046.5];
      melody.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.18, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.5);
      });
    } catch {}
  }

  // Play Cantonese tone acoustic pitch curve
  playTonePitchContour(toneNumber: number) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.05);

      switch (toneNumber) {
        case 1: // 陰平 (55) High Flat ~ 340Hz
          osc.frequency.setValueAtTime(340, now);
          osc.frequency.setValueAtTime(340, now + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          break;
        case 2: // 陰上 (25) High Rising ~ 210Hz -> 330Hz
          osc.frequency.setValueAtTime(210, now);
          osc.frequency.exponentialRampToValueAtTime(330, now + 0.38);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
          break;
        case 3: // 陰去 (33) Mid Flat ~ 260Hz
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.setValueAtTime(260, now + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          break;
        case 4: // 陽平 (21) Low Falling ~ 190Hz -> 140Hz
          osc.frequency.setValueAtTime(190, now);
          osc.frequency.exponentialRampToValueAtTime(140, now + 0.38);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
          break;
        case 5: // 陽上 (23) Low Rising ~ 160Hz -> 230Hz
          osc.frequency.setValueAtTime(160, now);
          osc.frequency.exponentialRampToValueAtTime(230, now + 0.38);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
          break;
        case 6: // 陽去 (22) Low Flat ~ 180Hz
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.setValueAtTime(180, now + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
          break;
        default:
          osc.frequency.setValueAtTime(250, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.48);
    } catch {}
  }

  private currentAudio: HTMLAudioElement | null = null;

  // Authentic Cantonese Speech Pronunciation (Primary: Server-side native Cantonese audio stream; Secondary: Native Cantonese Web Speech API only)
  speakCantonese(text: string, jyutpingOrOnEnd?: string | (() => void), maybeOnEnd?: () => void) {
    let jyutping = '';
    let onEnd: (() => void) | undefined;

    if (typeof jyutpingOrOnEnd === 'function') {
      onEnd = jyutpingOrOnEnd;
    } else if (typeof jyutpingOrOnEnd === 'string') {
      jyutping = jyutpingOrOnEnd;
      onEnd = maybeOnEnd;
    }

    if (!this.enabled || !text) {
      onEnd?.();
      return;
    }

    // Clean text: strip parentheticals, notes, and remove "/" or "／" so they are NEVER spoken
    let cleanText = text
      .replace(/[\(（][^()（）]*[\)）]/g, '')
      .replace(/\[[^\[\]]*\]/g, '')
      .replace(/[\/／\\]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      cleanText = text.replace(/[\/／\\]+/g, ' ').trim();
    }

    // Stop any existing playing audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    try {
      // 1. Primary: Server-side native Hong Kong Cantonese audio stream
      const queryParams = new URLSearchParams({ text: cleanText });
      if (jyutping) {
        queryParams.set('jyutping', jyutping);
      }

      const audioUrl = `/api/tts?${queryParams.toString()}`;
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.onended = () => {
        this.currentAudio = null;
        onEnd?.();
      };

      audio.onerror = () => {
        this.speakFallbackWebSpeech(cleanText, onEnd);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          this.speakFallbackWebSpeech(cleanText, onEnd);
        });
      }
    } catch {
      this.speakFallbackWebSpeech(cleanText, onEnd);
    }
  }

  // Fallback to client browser Web Speech API ONLY if authentic Cantonese voice exists
  private speakFallbackWebSpeech(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const voices = window.speechSynthesis.getVoices();
      const hkVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === 'zh-hk' ||
          v.lang.toLowerCase() === 'yue-hant-hk' ||
          v.lang.toLowerCase().includes('yue') ||
          v.name.toLowerCase().includes('hong kong') ||
          v.name.toLowerCase().includes('cantonese') ||
          v.name.toLowerCase().includes('sin-ji') ||
          v.name.toLowerCase().includes('hiujing')
      );

      // STRICT PROTECTION: If no Cantonese voice exists on the client system,
      // DO NOT speak Mandarin (國語)!
      if (!hkVoice) {
        console.warn('No authentic Cantonese voice available on device; skipping Mandarin fallback');
        onEnd?.();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.88;
      utterance.pitch = 1.05;
      utterance.voice = hkVoice;
      utterance.lang = hkVoice.lang;

      utterance.onend = () => onEnd?.();
      utterance.onerror = () => onEnd?.();

      window.speechSynthesis.speak(utterance);
    } catch {
      onEnd?.();
    }
  }
}

export const sound = new SoundEngine();

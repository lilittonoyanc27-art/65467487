/**
 * Spanish Text-To-Speech and Speech Recognition Engine for Tigrito Español
 */

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedVoices = voices;
      resolve(voices);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
    };

    // Fallback timeout in case onvoiceschanged does not fire
    setTimeout(() => {
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
    }, 300);
  });
}

// Preload voices early
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  dialect?: 'es-ES' | 'es-419';
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: string) => void;
}

export async function speakSpanish(text: string, options: SpeakOptions = {}): Promise<boolean> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onError?.('Ваш браузер не поддерживает синтез речи (SpeechSynthesis).');
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const voices = cachedVoices.length > 0 ? cachedVoices : await loadVoices();
  const dialect = options.dialect || 'es-ES';

  // Find optimal Spanish voice
  let selectedVoice: SpeechSynthesisVoice | null = null;

  if (dialect === 'es-ES') {
    selectedVoice = voices.find(v => v.lang === 'es-ES' || v.lang.startsWith('es-ES')) || null;
  } else {
    // Latin America preference (es-MX, es-US, es-AR, es-CO, etc.)
    selectedVoice = voices.find(v => (v.lang.startsWith('es-') && v.lang !== 'es-ES')) || null;
  }

  // Fallback to any Spanish voice
  if (!selectedVoice) {
    selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith('es')) || null;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = dialect === 'es-419' ? 'es-MX' : 'es-ES';
  utterance.rate = options.rate ?? 0.88; // Slightly measured pace for phonetics learners
  utterance.pitch = options.pitch ?? 1.05; // Slightly warm/friendly tone for Tigrito

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  return new Promise((resolve) => {
    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onend = () => {
      options.onEnd?.();
      resolve(true);
    };

    utterance.onerror = (e) => {
      // Chrome often fires 'interrupted' or 'canceled' when quickly clicking, which is harmless
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        options.onError?.(`Ошибка воспроизведения: ${e.error}`);
      }
      options.onEnd?.();
      resolve(false);
    };

    window.speechSynthesis.speak(utterance);
  });
}

/** Check if speech recognition is supported in browser */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export interface RecognitionResult {
  transcript: string;
  isMatch: boolean;
  similarity: number;
}

/** Normalized distance check for spoken Spanish */
function calculateSimilarity(s1: string, s2: string): number {
  const clean = (s: string) => 
    s.toLowerCase()
     .normalize('NFD')
     .replace(/[\u0300-\u036f]/g, '') // remove diacritics
     .replace(/[^a-z0-9]/g, '');

  const a = clean(s1);
  const b = clean(s2);

  if (a === b) return 1.0;
  if (!a || !b) return 0;
  if (b.includes(a) || a.includes(b)) return 0.85;

  // Simple Levenshtein distance
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const dist = matrix[b.length][a.length];
  const maxLen = Math.max(a.length, b.length);
  return Math.max(0, 1 - dist / maxLen);
}

/** Listen to the user speaking and match against target word */
export function listenForSpanishWord(
  targetWord: string,
  timeoutMs: number = 6000
): Promise<RecognitionResult> {
  return new Promise((resolve, reject) => {
    if (!isSpeechRecognitionSupported()) {
      reject(new Error('Распознавание речи не поддерживается браузером.'));
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    };
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRec) {
      reject(new Error('API не обнаружено.'));
      return;
    }

    const recognition = new SpeechRec();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    let hasResolved = false;

    const timer = setTimeout(() => {
      if (!hasResolved) {
        hasResolved = true;
        recognition.stop();
        resolve({
          transcript: '',
          isMatch: false,
          similarity: 0,
        });
      }
    }, timeoutMs);

    recognition.onresult = (event: any) => {
      clearTimeout(timer);
      if (hasResolved) return;
      hasResolved = true;

      let bestTranscript = '';
      let maxSim = 0;

      for (let i = 0; i < event.results[0].length; i++) {
        const alt = event.results[0][i].transcript.trim();
        const sim = calculateSimilarity(alt, targetWord);
        if (sim > maxSim) {
          maxSim = sim;
          bestTranscript = alt;
        }
      }

      resolve({
        transcript: bestTranscript || event.results[0][0]?.transcript || '',
        isMatch: maxSim >= 0.7,
        similarity: maxSim,
      });
    };

    recognition.onerror = (event: any) => {
      clearTimeout(timer);
      if (!hasResolved) {
        hasResolved = true;
        reject(new Error(`Ошибка микрофона: ${event.error || 'неизвестно'}`));
      }
    };

    recognition.onend = () => {
      clearTimeout(timer);
      if (!hasResolved) {
        hasResolved = true;
        resolve({
          transcript: '',
          isMatch: false,
          similarity: 0,
        });
      }
    };

    try {
      recognition.start();
    } catch (e: any) {
      clearTimeout(timer);
      reject(e);
    }
  });
}

export type TigritoEmotion = 
  | 'happy' 
  | 'thinking' 
  | 'dance' 
  | 'surprise' 
  | 'clap' 
  | 'sleep' 
  | 'cheer';

export type ExerciseType = 
  | 'listen-choice'    // 🎧 Игра 1
  | 'build-word'       // 🔤 Игра 2
  | 'help-tigrito'     // 🐯 Игра 3
  | 'listen-syllables' // 🎵 Игра 4
  | 'find-sound'       // 🎯 Игра 5
  | 'word-treasure'    // 💎 Игра 6
  | 'repeat-me'        // 🎤 Игра 7
  | 'speed-challenge'; // ⚡ Игра 8

export interface BaseExercise {
  id: string;
  type: ExerciseType;
  title: string;
  instructionRu: string;
  instructionEs?: string;
  phoneticTipRu?: string;
  soundTarget?: string; // target phoneme or word
}

export interface ListenChoiceExercise extends BaseExercise {
  type: 'listen-choice';
  audioWord: string;
  audioTextToSpeak?: string;
  options: {
    id: string;
    text: string;
    subtext?: string;
    isCorrect: boolean;
  }[];
  explanationRu: string;
}

export interface BuildWordExercise extends BaseExercise {
  type: 'build-word';
  targetWord: string;
  letters: string[]; // scrambled
  translationRu: string;
  emojiOrImage: string;
  phoneticBreakdown: string;
  explanationRu: string;
}

export interface HelpTigritoExercise extends BaseExercise {
  type: 'help-tigrito';
  riverStepIndex: number;
  totalSteps: number;
  questionRu: string;
  questionEs?: string;
  audioPrompt?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanationRu: string;
}

export interface ListenSyllablesExercise extends BaseExercise {
  type: 'listen-syllables';
  fullWord: string;
  translationRu: string;
  syllables: string[]; // in correct order
  shuffledSyllables: string[];
  explanationRu: string;
}

export interface FindSoundExercise extends BaseExercise {
  type: 'find-sound';
  ruleDescriptionRu: string;
  words: {
    id: string;
    word: string;
    pronunciationNoteRu: string;
    isOddOneOut: boolean;
  }[];
  explanationRu: string;
}

export interface WordTreasureExercise extends BaseExercise {
  type: 'word-treasure';
  riddleRu: string;
  chestRewardCoins: number;
  options: {
    id: string;
    text: string;
    subtext?: string;
    isCorrect: boolean;
  }[];
  explanationRu: string;
}

export interface RepeatMeExercise extends BaseExercise {
  type: 'repeat-me';
  spanishWord: string;
  russianTranslation: string;
  phoneticTranscription: string; // e.g. [ˈpe.ro]
  russianPhoneticGuide: string;  // e.g. "пэ́-ро (короткое вибрирующее Р)"
  tipRu: string;
}

export interface SpeedChallengeExercise extends BaseExercise {
  type: 'speed-challenge';
  fastQuestions: {
    id: string;
    prompt: string;
    audioWord?: string;
    options: string[];
    correctIndex: number;
    explanationRu: string;
  }[];
}

export type Exercise = 
  | ListenChoiceExercise
  | BuildWordExercise
  | HelpTigritoExercise
  | ListenSyllablesExercise
  | FindSoundExercise
  | WordTreasureExercise
  | RepeatMeExercise
  | SpeedChallengeExercise;

export interface Level {
  id: string;
  worldId: number;
  titleRu: string;
  titleEs: string;
  descriptionRu: string;
  icon: string;
  targetSounds: string[];
  theoryRu?: {
    summary: string;
    rules: { title: string; content: string; exampleEs: string; exampleRu: string; audioWord?: string }[];
  };
  exercises: Exercise[];
}

export interface World {
  id: number;
  titleEs: string;
  titleRu: string;
  descriptionRu: string;
  tagline: string;
  accentColor: string;
  badgeEmoji: string;
  themeClass: string;
  levels: Level[];
}

export interface Accessory {
  id: string;
  nameRu: string;
  nameEs: string;
  descriptionRu: string;
  category: 'hat' | 'glasses' | 'neck' | 'badge';
  cost: number;
  icon: string;
}

export interface TrickySoundItem {
  id: string;
  word: string;
  translationRu: string;
  targetRule: string;
  phoneticGuideRu: string;
  mistakeCount: number;
  lastMistakeDate: string;
}

export interface DailyQuest {
  id: string;
  titleRu: string;
  target: number;
  progress: number;
  completed: boolean;
  rewardCoins: number;
  rewardXp: number;
}

export interface Achievement {
  id: string;
  titleRu: string;
  descRu: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserProgress {
  xp: number;
  coins: number;
  hearts: number;
  maxHearts: number;
  streakDays: number;
  lastActiveDate: string;
  unlockedWorld: number; // Highest unlocked world (1..10)
  completedLevels: Record<string, { stars: number; score: number }>;
  equippedAccessory: string;
  ownedAccessories: string[];
  trickySounds: TrickySoundItem[];
  soundEnabled: boolean;
  dialect: 'es-ES' | 'es-419'; // Spain distinction vs Latin American seseo
  dailyQuests: DailyQuest[];
  achievements: Achievement[];
}

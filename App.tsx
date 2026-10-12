/**
 * 🐯 TIGRITO ESPAÑOL — Волшебный мир испанской фонетики
 * Full interactive Spanish phonetics learning application for Russian speakers.
 */

import React, { useState, useEffect } from 'react';
import { 
  UserProgress, 
  Level, 
  Exercise, 
  Accessory, 
  TrickySoundItem 
} from './types';
import { 
  WORLDS_DATA, 
  INITIAL_DAILY_QUESTS, 
  INITIAL_ACHIEVEMENTS, 
  ACCESSORIES_CATALOG 
} from './data';
import { Tigrito } from './tigrito';
import { WorldMap } from './WorldMap';
import { MiniGameRenderer } from './MiniGames';
import { ShopModal } from './ShopModal';
import { TrickySoundsModal } from './TrickySoundsModal';
import { AchievementsModal } from './AchievementsModal';
import { PhoneticsGuideModal } from './PhoneticsGuideModal';
import { ConfettiEffect } from './confetti';
import { 
  playTapSound, 
  playSuccessSound, 
  playVictorySound, 
  playStarSound, 
  setSoundEnabled, 
  getSoundEnabled 
} from './sound';
import { speakSpanish } from './speech';
import { 
  Volume2, 
  VolumeX, 
  Flame, 
  Heart, 
  Coins, 
  Zap, 
  Compass, 
  BookOpen, 
  Trophy, 
  Sparkles, 
  ArrowLeft, 
  Star, 
  Home, 
  HelpCircle 
} from 'lucide-react';

const STORAGE_KEY = 'tigrito_espanol_progress_v1';

const DEFAULT_USER_PROGRESS: UserProgress = {
  xp: 0,
  coins: 50,
  hearts: 5,
  maxHearts: 5,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  unlockedWorld: 1,
  completedLevels: {},
  equippedAccessory: 'none',
  ownedAccessories: ['none'],
  trickySounds: [],
  soundEnabled: true,
  dialect: 'es-ES',
  dailyQuests: INITIAL_DAILY_QUESTS,
  achievements: INITIAL_ACHIEVEMENTS,
};

export default function App() {
  // Load progress from localStorage
  const [progress, setProgress] = useState<UserProgress>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...DEFAULT_USER_PROGRESS, ...parsed };
        }
      } catch (e) {
        console.error('Failed to load saved progress', e);
      }
    }
    return DEFAULT_USER_PROGRESS;
  });

  // Navigation states
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'map' | 'level' | 'level-completed'>('welcome');
  const [activeLevel, setActiveLevel] = useState<Level | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [mistakesInCurrentLevel, setMistakesInCurrentLevel] = useState(0);

  // Active Modals
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isTrickySoundsOpen, setIsTrickySoundsOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isHeartModalOpen, setIsHeartModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (e) {
        console.error('Failed to save progress', e);
      }
    }
  }, [progress]);

  // Sync sound setting with audio engine
  useEffect(() => {
    setSoundEnabled(progress.soundEnabled);
  }, [progress.soundEnabled]);

  // Toggle sound effects
  const toggleSound = () => {
    const nextVal = !progress.soundEnabled;
    setProgress(prev => ({ ...prev, soundEnabled: nextVal }));
    setSoundEnabled(nextVal);
  };

  // Toggle Dialect (Spain vs Latin America)
  const toggleDialect = () => {
    playTapSound();
    setProgress(prev => ({
      ...prev,
      dialect: prev.dialect === 'es-ES' ? 'es-419' : 'es-ES',
    }));
  };

  // Start playing a specific level
  const handleSelectLevel = (level: Level) => {
    setActiveLevel(level);
    setExerciseIndex(0);
    setMistakesInCurrentLevel(0);
    setCurrentScreen('level');
  };

  // Process user's answer during a level
  const handleAnswer = (
    isCorrect: boolean, 
    exerciseId: string, 
    mistakeDetails?: { word: string; rule: string; explanation: string }
  ) => {
    if (!isCorrect) {
      setMistakesInCurrentLevel(prev => prev + 1);

      // Decrement heart if available
      setProgress(prev => {
        const nextHearts = Math.max(0, prev.hearts - 1);
        let updatedTricky = [...prev.trickySounds];

        if (mistakeDetails) {
          const existingIdx = updatedTricky.findIndex(t => t.word === mistakeDetails.word);
          if (existingIdx >= 0) {
            updatedTricky[existingIdx].mistakeCount += 1;
            updatedTricky[existingIdx].lastMistakeDate = new Date().toISOString();
          } else {
            updatedTricky.push({
              id: 'tricky_' + Date.now(),
              word: mistakeDetails.word,
              translationRu: mistakeDetails.rule,
              targetRule: mistakeDetails.rule,
              phoneticGuideRu: mistakeDetails.explanation,
              mistakeCount: 1,
              lastMistakeDate: new Date().toISOString(),
            });
          }
        }

        return {
          ...prev,
          hearts: nextHearts,
          trickySounds: updatedTricky,
        };
      });
    } else {
      // Award progress XP
      setProgress(prev => {
        // Update quest progress
        const updatedQuests = prev.dailyQuests.map(q => {
          if (q.id === 'quest_listen_words') {
            return { ...q, progress: Math.min(q.target, q.progress + 1) };
          }
          return q;
        });

        return {
          ...prev,
          xp: prev.xp + 10,
          dailyQuests: updatedQuests,
        };
      });
    }
  };

  // Move to next exercise or finish level
  const handleNextExercise = () => {
    if (!activeLevel) return;

    if (exerciseIndex + 1 < activeLevel.exercises.length) {
      setExerciseIndex(prev => prev + 1);
    } else {
      // LEVEL COMPLETED!
      finishLevel();
    }
  };

  // Calculate stars and awards upon finishing level
  const finishLevel = () => {
    if (!activeLevel) return;

    // Stars rating: 0 mistakes = 3 stars, 1-2 mistakes = 2 stars, 3+ = 1 star
    let starsEarned = 3;
    if (mistakesInCurrentLevel >= 3) starsEarned = 1;
    else if (mistakesInCurrentLevel >= 1) starsEarned = 2;

    const coinsEarned = 20 + starsEarned * 10;
    const xpEarned = 40 + starsEarned * 15;

    setShowConfetti(true);
    playVictorySound();

    setProgress(prev => {
      // Determine if next world unlocks
      let nextUnlockedWorld = prev.unlockedWorld;
      if (activeLevel.worldId === prev.unlockedWorld) {
        const currentWorld = WORLDS_DATA.find(w => w.id === activeLevel.worldId);
        const isLastLevelOfWorld = currentWorld && currentWorld.levels[currentWorld.levels.length - 1].id === activeLevel.id;
        if (isLastLevelOfWorld && prev.unlockedWorld < 10) {
          nextUnlockedWorld = prev.unlockedWorld + 1;
        }
      }

      // Update quests
      const updatedQuests = prev.dailyQuests.map(q => {
        if (q.id === 'quest_play_levels') {
          return { ...q, progress: Math.min(q.target, q.progress + 1) };
        }
        return q;
      });

      // Update achievements
      const updatedAchievements = prev.achievements.map(a => {
        if (a.id === 'first_steps') {
          return { ...a, progress: 1, unlocked: true };
        }
        if (a.id === 'perfectionist' && mistakesInCurrentLevel === 0) {
          return { ...a, progress: 1, unlocked: true };
        }
        if (a.id === 'vowel_master' && activeLevel.worldId === 1 && starsEarned === 3) {
          return { ...a, progress: 1, unlocked: true };
        }
        if (a.id === 'rr_champion' && activeLevel.worldId === 6) {
          return { ...a, progress: 1, unlocked: true };
        }
        return a;
      });

      return {
        ...prev,
        coins: prev.coins + coinsEarned,
        xp: prev.xp + xpEarned,
        unlockedWorld: nextUnlockedWorld,
        completedLevels: {
          ...prev.completedLevels,
          [activeLevel.id]: {
            stars: Math.max(starsEarned, prev.completedLevels[activeLevel.id]?.stars || 0),
            score: Math.max(100 - mistakesInCurrentLevel * 10, prev.completedLevels[activeLevel.id]?.score || 0),
          },
        },
        dailyQuests: updatedQuests,
        achievements: updatedAchievements,
      };
    });

    setCurrentScreen('level-completed');
  };

  // Shop accessory purchase & equip
  const handleBuyAccessory = (acc: Accessory) => {
    setProgress(prev => ({
      ...prev,
      coins: prev.coins - acc.cost,
      ownedAccessories: [...prev.ownedAccessories, acc.id],
      equippedAccessory: acc.id,
      achievements: prev.achievements.map(a => {
        if (a.id === 'stylist_tigri') return { ...a, progress: 1, unlocked: true };
        return a;
      }),
    }));
  };

  const handleEquipAccessory = (accId: string) => {
    setProgress(prev => ({
      ...prev,
      equippedAccessory: accId,
    }));
  };

  // Tricky sounds clear
  const handleClearTrickySound = (id: string) => {
    setProgress(prev => ({
      ...prev,
      trickySounds: prev.trickySounds.filter(t => t.id !== id),
    }));
  };

  // Claim Daily Quest reward
  const handleClaimQuest = (questId: string) => {
    setProgress(prev => {
      const quest = prev.dailyQuests.find(q => q.id === questId);
      if (!quest) return prev;

      return {
        ...prev,
        coins: prev.coins + quest.rewardCoins,
        xp: prev.xp + quest.rewardXp,
        dailyQuests: prev.dailyQuests.map(q => 
          q.id === questId ? { ...q, completed: true } : q
        ),
      };
    });
  };

  // Refill hearts with coins or practice
  const handleRefillHearts = () => {
    if (progress.coins >= 30) {
      playSuccessSound();
      setProgress(prev => ({
        ...prev,
        coins: prev.coins - 30,
        hearts: prev.maxHearts,
      }));
      setIsHeartModalOpen(false);
    }
  };

  const currentExercise = activeLevel?.exercises[exerciseIndex];

  return (
    <div className="min-h-screen bg-juicy-fiesta text-[#2D2A26] flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Decorative juicy ambient light orbs (orange, yellow, tropical green) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-left vibrant orange glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#FF8A00]/30 to-[#FF6262]/20 blur-3xl animate-pulse [animation-duration:6s]" />
        {/* Top-right sunny yellow glow */}
        <div className="absolute top-10 -right-20 w-[440px] h-[440px] rounded-full bg-gradient-to-bl from-[#FFD447]/40 to-[#FDE047]/30 blur-3xl" />
        {/* Center-left lime/tropical green glow */}
        <div className="absolute top-1/2 -left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[#22C55E]/25 to-[#86EFAC]/30 blur-3xl" />
        {/* Bottom-right lush emerald glow */}
        <div className="absolute -bottom-20 -right-20 w-[480px] h-[480px] rounded-full bg-gradient-to-tl from-[#10B981]/30 to-[#4ADE80]/30 blur-3xl" />
        {/* Bottom-left juicy golden amber */}
        <div className="absolute bottom-10 left-1/4 w-[360px] h-[360px] rounded-full bg-gradient-to-r from-[#F59E0B]/25 to-[#84CC16]/25 blur-3xl" />
      </div>

      {/* Confetti canvas for level completion */}
      <ConfettiEffect
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-[#FFD447]/60 px-3 sm:px-6 py-2.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Brand Logo & Mascot */}
          <div 
            onClick={() => {
              playTapSound();
              setCurrentScreen('welcome');
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#FFF2D6] border-2 border-[#FFD447] flex items-center justify-center text-2xl group-hover:scale-105 transition-transform shadow-xs">
              🐯
            </div>
            <div>
              <div className="text-base sm:text-lg font-black tracking-tight leading-none text-[#FF8A00] flex items-center gap-1">
                <span>Tigrito</span>
                <span className="text-[#2D2A26]">Español</span>
              </div>
              <div className="text-[10px] sm:text-xs font-bold text-[#8C7A64] leading-tight">
                Испанская фонетика
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-1.5 sm:gap-4">
            {/* Dialect Switcher */}
            <button
              onClick={toggleDialect}
              className="px-2 sm:px-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-bold flex items-center gap-1 transition-colors"
              title="Переключить вариант испанского (Испания / Латинская Америка)"
            >
              <span>{progress.dialect === 'es-ES' ? '🇪🇸 Испания' : '🌎 Лат. Америка'}</span>
            </button>

            {/* Streak */}
            <div 
              className="flex items-center gap-1 text-xs sm:text-sm font-black text-[#D46B00] bg-orange-50 px-2.5 py-1 rounded-xl border border-orange-200"
              title="Дней подряд"
            >
              <Flame className="w-4 h-4 fill-[#FF8A00] text-[#FF8A00]" />
              <span>{progress.streakDays}</span>
            </div>

            {/* Hearts */}
            <button
              onClick={() => {
                playTapSound();
                setIsHeartModalOpen(true);
              }}
              className="flex items-center gap-1 text-xs sm:text-sm font-black text-[#D93B3B] bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200 hover:bg-rose-100 transition-colors"
              title="Жизни"
            >
              <Heart className="w-4 h-4 fill-[#FF6262] text-[#FF6262]" />
              <span>{progress.hearts}</span>
            </button>

            {/* Coins */}
            <button
              onClick={() => {
                playTapSound();
                setIsShopOpen(true);
              }}
              className="flex items-center gap-1 text-xs sm:text-sm font-black text-[#522E00] bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors"
              title="Монеты"
            >
              <Coins className="w-4 h-4 text-[#FF8A00]" />
              <span>{progress.coins}</span>
            </button>

            {/* XP */}
            <div 
              className="hidden md:flex items-center gap-1 text-xs sm:text-sm font-black text-[#5434B3] bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-200"
              title="Очки опыта"
            >
              <Zap className="w-4 h-4 text-[#7755D9]" />
              <span>{progress.xp} XP</span>
            </div>

            {/* Sound toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors"
              title={progress.soundEnabled ? 'Выключить звук' : 'Включить звук'}
            >
              {progress.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-500" />}
            </button>
          </div>
        </div>
      </header>

      {/* QUICK FLOATING ACCESS BAR (Bottom on mobile, sticky icons on desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t-2 border-[#FFD447]/60 py-2 px-4 flex items-center justify-around sm:justify-center sm:gap-6 shadow-lg">
        <button
          onClick={() => {
            playTapSound();
            setCurrentScreen('map');
          }}
          className={`flex flex-col sm:flex-row items-center gap-1 text-xs font-black px-3 py-1.5 rounded-xl transition-all ${
            currentScreen === 'map' ? 'bg-[#FFF2D6] text-[#FF8A00]' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Compass className="w-5 h-5 text-[#FF8A00]" />
          <span>Карта</span>
        </button>

        <button
          onClick={() => {
            playTapSound();
            setIsTrickySoundsOpen(true);
          }}
          className="flex flex-col sm:flex-row items-center gap-1 text-xs font-black px-3 py-1.5 rounded-xl text-stone-600 hover:text-stone-900 relative transition-all"
        >
          <div className="relative">
            <span className="text-lg">🎯</span>
            {progress.trickySounds.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#FF6262] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {progress.trickySounds.length}
              </span>
            )}
          </div>
          <span>Трудные звуки</span>
        </button>

        <button
          onClick={() => {
            playTapSound();
            setIsGuideOpen(true);
          }}
          className="flex flex-col sm:flex-row items-center gap-1 text-xs font-black px-3 py-1.5 rounded-xl text-stone-600 hover:text-stone-900 transition-all"
        >
          <BookOpen className="w-5 h-5 text-[#46DCC8]" />
          <span>Справочник</span>
        </button>

        <button
          onClick={() => {
            playTapSound();
            setIsShopOpen(true);
          }}
          className="flex flex-col sm:flex-row items-center gap-1 text-xs font-black px-3 py-1.5 rounded-xl text-stone-600 hover:text-stone-900 transition-all"
        >
          <span className="text-lg">🎩</span>
          <span>Гардероб</span>
        </button>

        <button
          onClick={() => {
            playTapSound();
            setIsAchievementsOpen(true);
          }}
          className="flex flex-col sm:flex-row items-center gap-1 text-xs font-black px-3 py-1.5 rounded-xl text-stone-600 hover:text-stone-900 transition-all"
        >
          <Trophy className="w-5 h-5 text-[#7755D9]" />
          <span>Задания</span>
        </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 pb-20 pt-4 flex flex-col items-center justify-start relative z-10">
        {/* ================= SCREEN 1: WELCOME SCREEN ================= */}
        {currentScreen === 'welcome' && (
          <div className="w-full max-w-2xl mx-auto px-4 py-8 flex flex-col items-center text-center">
            {/* Friendly Greeting Tigrito */}
            <div className="mb-6">
              <Tigrito
                emotion="happy"
                accessory={progress.equippedAccessory}
                size="xl"
                interactive={true}
                speechBubbleEs="¡Hola, amigo! Soy Tigrito."
                speechBubbleRu="Привет, друг! Я Тигри."
                onTigritoClick={() => {
                  speakSpanish('¡Hola, amigo! Soy Tigrito. ¡Vamos a aprender español jugando!');
                }}
              />
            </div>

            {/* Greeting copy specified in brief */}
            <div className="bg-white/90 backdrop-blur-sm border-2 border-[#FFD447] rounded-3xl p-6 sm:p-8 shadow-lg max-w-lg w-full mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-[#FF8A00] leading-tight mb-2">
                «¡Hola, amigo! Soy Tigrito. ¡Vamos a aprender español jugando!»
              </h1>
              <p className="text-sm sm:text-base text-[#574E3E] font-medium leading-relaxed mb-6">
                «Привет, друг! Я Тигри. Давай учить испанский играя!»
              </p>

              <div className="grid grid-cols-2 gap-3 text-left mb-6 text-xs text-[#736550] bg-[#FFF8E9] p-4 rounded-2xl border border-[#EADBBD]">
                <div className="flex items-center gap-2">
                  <span>🏝️</span>
                  <span>10 игровых миров</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🎧</span>
                  <span>Чистая озвучка</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🎮</span>
                  <span>8 мини-игр</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👑</span>
                  <span>Награды и гардероб</span>
                </div>
              </div>

              {/* Main Adventure Start CTA Button */}
              <button
                onClick={() => {
                  playTapSound();
                  speakSpanish('¡Vamos a jugar!');
                  setCurrentScreen('map');
                }}
                className="w-full py-4 px-6 rounded-2xl font-black text-lg sm:text-xl btn-3d btn-3d-orange shadow-lg flex items-center justify-center gap-3"
              >
                <Sparkles className="w-6 h-6" />
                <span>¡Vamos a jugar! — Начать приключение</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= SCREEN 2: ADVENTURE WORLD MAP ================= */}
        {currentScreen === 'map' && (
          <WorldMap
            worlds={WORLDS_DATA}
            userProgress={progress}
            onSelectLevel={handleSelectLevel}
            accessory={progress.equippedAccessory}
            dialect={progress.dialect}
          />
        )}

        {/* ================= SCREEN 3: ACTIVE LEVEL PLAY ================= */}
        {currentScreen === 'level' && activeLevel && currentExercise && (
          <div className="w-full max-w-3xl mx-auto px-4 py-4 flex flex-col items-center">
            {/* Level Play Top Header */}
            <div className="w-full flex items-center justify-between gap-3 mb-6">
              <button
                onClick={() => {
                  playTapSound();
                  setCurrentScreen('map');
                }}
                className="w-10 h-10 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors shadow-xs"
                title="Назад к карте"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              {/* Progress bar */}
              <div className="flex-1 bg-stone-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-[#FF8A00] h-full transition-all duration-300"
                  style={{
                    width: `${((exerciseIndex + 1) / activeLevel.exercises.length) * 100}%`,
                  }}
                />
              </div>

              <div className="text-xs font-black text-[#5C503F] shrink-0 bg-white px-3 py-1.5 rounded-xl border border-stone-200">
                {exerciseIndex + 1} / {activeLevel.exercises.length}
              </div>
            </div>

            {/* Check hearts zero condition */}
            {progress.hearts <= 0 ? (
              <div className="w-full bg-white rounded-3xl p-8 border-3 border-[#FF6262] text-center shadow-lg my-8">
                <span className="text-5xl mb-3 block">💔</span>
                <h3 className="text-xl font-black text-[#2D2A26] mb-1">Закончились сердечки!</h3>
                <p className="text-xs text-[#7A6F5C] mb-6">
                  Не переживай! Ты можешь восстановить жизни за 30 монет или передохнуть.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleRefillHearts}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl font-black btn-3d btn-3d-orange"
                  >
                    Восстановить за 30 🪙
                  </button>
                  <button
                    onClick={() => setCurrentScreen('map')}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl font-bold btn-3d btn-3d-neutral"
                  >
                    Вернуться к карте
                  </button>
                </div>
              </div>
            ) : (
              <MiniGameRenderer
                exercise={currentExercise}
                dialect={progress.dialect}
                accessory={progress.equippedAccessory}
                onAnswer={handleAnswer}
                onNext={handleNextExercise}
              />
            )}
          </div>
        )}

        {/* ================= SCREEN 4: LEVEL COMPLETED CELEBRATION ================= */}
        {currentScreen === 'level-completed' && activeLevel && (
          <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center text-center">
            <div className="mb-4">
              <Tigrito
                emotion="cheer"
                accessory={progress.equippedAccessory}
                size="lg"
                speechBubbleEs="¡Fantástico!"
                speechBubbleRu="Ты молодец!"
              />
            </div>

            <div className="bg-white rounded-3xl border-3 border-[#FFD447] p-6 sm:p-8 shadow-xl w-full">
              <h2 className="text-2xl sm:text-3xl font-black text-[#2D2A26] mb-1">
                Уровень пройден!
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#FF8A00] mb-6">
                {activeLevel.titleRu}
              </p>

              {/* 3 Stars display */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {[1, 2, 3].map((s) => {
                  const earned = s <= (progress.completedLevels[activeLevel.id]?.stars || 1);
                  return (
                    <div
                      key={s}
                      className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                        earned
                          ? 'bg-[#FFF3D6] border-[#FFD447] scale-110 shadow-sm'
                          : 'bg-stone-100 border-stone-200 opacity-40'
                      }`}
                    >
                      <Star
                        className={`w-8 h-8 ${
                          earned ? 'text-[#FFD447] fill-[#FFD447]' : 'text-stone-300'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Rewards Summary */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-[#FFF3D6] rounded-2xl border border-[#FFD447] flex items-center justify-center gap-2">
                  <Coins className="w-5 h-5 text-[#FF8A00]" />
                  <span className="font-black text-base text-[#522E00]">+35 монет</span>
                </div>
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 text-[#7755D9]" />
                  <span className="font-black text-base text-[#5434B3]">+55 XP</span>
                </div>
              </div>

              {/* Continue CTA */}
              <button
                onClick={() => {
                  playTapSound();
                  setCurrentScreen('map');
                }}
                className="w-full py-4 rounded-2xl font-black text-lg btn-3d btn-3d-orange shadow-md"
              >
                Продолжить приключение
              </button>
            </div>
          </div>
        )}
      </main>

      {/* HEART REFILL MODAL */}
      {isHeartModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-3 border-[#FF6262] max-w-sm w-full p-6 text-center shadow-2xl relative">
            <span className="text-5xl mb-2 block">❤️</span>
            <h3 className="text-xl font-black text-[#2D2A26] mb-1">Жизни Тигри</h3>
            <p className="text-xs text-[#7A6F5C] mb-6">
              У тебя {progress.hearts} из {progress.maxHearts} сердечек. Каждая ошибка отнимает 1 жизнь.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleRefillHearts}
                className="w-full py-3.5 rounded-2xl font-black text-sm btn-3d btn-3d-orange flex items-center justify-center gap-2"
              >
                <Coins className="w-4 h-4" />
                <span>Восстановить до максимума (30 🪙)</span>
              </button>
              <button
                onClick={() => setIsHeartModalOpen(false)}
                className="w-full py-3 rounded-2xl font-bold text-xs btn-3d btn-3d-neutral"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCESSORIES SHOP MODAL */}
      {isShopOpen && (
        <ShopModal
          userProgress={progress}
          onClose={() => setIsShopOpen(false)}
          onEquipAccessory={handleEquipAccessory}
          onBuyAccessory={handleBuyAccessory}
        />
      )}

      {/* TRICKY SOUNDS MODAL */}
      {isTrickySoundsOpen && (
        <TrickySoundsModal
          trickySounds={progress.trickySounds}
          dialect={progress.dialect}
          onClose={() => setIsTrickySoundsOpen(false)}
          onClearSound={handleClearTrickySound}
          onPracticeAll={() => {
            setIsTrickySoundsOpen(false);
            // Open quick guide or level 1
            setCurrentScreen('map');
          }}
        />
      )}

      {/* ACHIEVEMENTS & QUESTS MODAL */}
      {isAchievementsOpen && (
        <AchievementsModal
          userProgress={progress}
          onClose={() => setIsAchievementsOpen(false)}
          onClaimQuest={handleClaimQuest}
        />
      )}

      {/* PHONETICS GUIDE MODAL */}
      {isGuideOpen && (
        <PhoneticsGuideModal
          dialect={progress.dialect}
          onClose={() => setIsGuideOpen(false)}
        />
      )}
    </div>
  );
}

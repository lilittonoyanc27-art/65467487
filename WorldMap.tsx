import React, { useState } from 'react';
import { World, Level, UserProgress } from './types';
import { Tigrito } from './tigrito';
import { 
  Star, 
  Lock, 
  CheckCircle, 
  Volume2, 
  BookOpen, 
  Play, 
  Sparkles, 
  X,
  Compass
} from 'lucide-react';
import { speakSpanish } from './speech';
import { playTapSound } from './sound';

interface WorldMapProps {
  worlds: World[];
  userProgress: UserProgress;
  onSelectLevel: (level: Level) => void;
  accessory: string;
  dialect: 'es-ES' | 'es-419';
}

export const WorldMap: React.FC<WorldMapProps> = ({
  worlds,
  userProgress,
  onSelectLevel,
  accessory,
  dialect,
}) => {
  const [selectedLevelForPreview, setSelectedLevelForPreview] = useState<Level | null>(null);

  // Check if a level is unlocked
  const isLevelUnlocked = (worldId: number, levelIdx: number) => {
    if (worldId < userProgress.unlockedWorld) return true;
    if (worldId > userProgress.unlockedWorld) return false;
    // Current world
    if (levelIdx === 0) return true;
    // Check if previous level in this world is completed
    const currentWorld = worlds.find(w => w.id === worldId);
    if (!currentWorld) return false;
    const prevLevel = currentWorld.levels[levelIdx - 1];
    return !!userProgress.completedLevels[prevLevel.id];
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Map Header banner */}
      <div className="text-center mb-8 bg-white/85 backdrop-blur-md p-6 rounded-3xl border-2 border-white/80 shadow-md">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD447]/40 border border-[#FFD447] text-[#7A4E00] text-xs sm:text-sm font-extrabold uppercase tracking-wider mb-2">
          <Compass className="w-4 h-4 text-[#FF8A00]" />
          <span>Mundo de los sonidos — Карта приключений</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-[#2D2A26] tracking-tight">
          Изучай звуки испанского вместе с Тигри!
        </h1>
        <p className="text-xs sm:text-sm text-[#736752] mt-1 max-w-md mx-auto">
          Пройди все 10 миров от чистых гласных до королевского замка тигрёнка
        </p>
      </div>

      {/* Worlds vertical winding path */}
      <div className="space-y-12 relative">
        {worlds.map((world, wIdx) => {
          const isWorldUnlocked = world.id <= userProgress.unlockedWorld;
          const isCurrentActiveWorld = world.id === userProgress.unlockedWorld;

          return (
            <div 
              key={world.id}
              className={`relative rounded-3xl p-5 sm:p-7 border-3 transition-all ${
                isWorldUnlocked
                  ? `bg-gradient-to-b ${world.themeClass} shadow-md`
                  : 'bg-stone-100/90 border-stone-200 opacity-65'
              }`}
            >
              {/* World Island Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-black/5 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2.5 bg-white/80 rounded-2xl shadow-sm border border-black/5">
                    {world.badgeEmoji}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-[#FF8A00]">
                        Мир {world.id}
                      </span>
                      {!isWorldUnlocked && (
                        <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1 bg-gray-200 px-2 py-0.5 rounded-md">
                          <Lock className="w-3 h-3" /> Закрыт
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#2D2A26]">
                      {world.titleRu}
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold text-[#FF8A00]">
                      {world.titleEs}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-medium text-[#6B5E4A] max-w-xs sm:text-right">
                  {world.tagline}
                </div>
              </div>

              {/* Levels Path inside this world */}
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-4 relative">
                {world.levels.map((level, lIdx) => {
                  const unlocked = isLevelUnlocked(world.id, lIdx);
                  const completedData = userProgress.completedLevels[level.id];
                  const stars = completedData ? completedData.stars : 0;
                  const isCurrentTigritoSpot = isCurrentActiveWorld && unlocked && !completedData;

                  return (
                    <div key={level.id} className="relative flex flex-col items-center">
                      {/* Tigrito mascot indicator standing on current active level */}
                      {isCurrentTigritoSpot && (
                        <div className="absolute -top-16 z-20 pointer-events-none animate-bounce [animation-duration:1.5s]">
                          <Tigrito
                            emotion="happy"
                            accessory={accessory}
                            size="sm"
                            speechBubbleEs="¡Aquí!"
                            speechBubbleRu="Сюда!"
                            interactive={false}
                          />
                        </div>
                      )}

                      {/* Level Step Button */}
                      <button
                        onClick={() => {
                          if (!unlocked) return;
                          playTapSound();
                          setSelectedLevelForPreview(level);
                        }}
                        disabled={!unlocked}
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-3 flex flex-col items-center justify-center relative transition-all btn-3d shadow-md ${
                          unlocked
                            ? completedData
                              ? 'bg-[#2BC4B0] border-[#189887] text-white hover:scale-105'
                              : 'bg-[#FF8A00] border-[#D46B00] text-white hover:scale-105 animate-pulse'
                            : 'bg-stone-200 border-stone-300 text-stone-400 cursor-not-allowed'
                        }`}
                        title={level.titleRu}
                      >
                        {unlocked ? (
                          <>
                            <span className="text-2xl sm:text-3xl mb-0.5">{level.icon}</span>
                            <span className="text-[11px] font-black uppercase tracking-wider">
                              Ур. {lIdx + 1}
                            </span>
                          </>
                        ) : (
                          <Lock className="w-8 h-8 text-stone-400" />
                        )}

                        {/* Stars earned badge */}
                        {unlocked && (
                          <div className="absolute -bottom-3 flex items-center gap-0.5 bg-white/95 px-2 py-0.5 rounded-full border border-stone-200 shadow-sm">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= stars
                                    ? 'text-[#FFD447] fill-[#FFD447]'
                                    : 'text-stone-300'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </button>

                      <div className="mt-4 text-center max-w-[110px]">
                        <span className="text-xs font-bold text-[#3B3224] line-clamp-1">
                          {level.titleRu}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Level Preview & Theory Modal */}
      {selectedLevelForPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFDF9] rounded-3xl border-3 border-[#FFD447] max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setSelectedLevelForPreview(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Level Icon & Title */}
            <div className="flex items-center gap-3.5 mb-4">
              <span className="text-4xl p-2 bg-[#FFF3D6] rounded-2xl border border-[#FFD447]">
                {selectedLevelForPreview.icon}
              </span>
              <div>
                <span className="text-xs font-extrabold uppercase text-[#FF8A00] tracking-wider">
                  Подготовка к уровню
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#2D2A26]">
                  {selectedLevelForPreview.titleRu}
                </h3>
                <p className="text-xs font-semibold text-[#736856]">
                  {selectedLevelForPreview.titleEs}
                </p>
              </div>
            </div>

            <p className="text-sm text-[#4A4031] mb-5 leading-relaxed bg-[#FFF8E9] p-3.5 rounded-2xl border border-[#EADBBD]">
              {selectedLevelForPreview.descriptionRu}
            </p>

            {/* Theory & Phonetics Guide Cards */}
            {selectedLevelForPreview.theoryRu && (
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[#7755D9] tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Правило произношения:</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm text-xs sm:text-sm text-[#3D3325]">
                  <p className="font-semibold mb-2">
                    {selectedLevelForPreview.theoryRu.summary}
                  </p>
                  {selectedLevelForPreview.theoryRu.rules.map((r, idx) => (
                    <div key={idx} className="mt-3 pt-3 border-t border-stone-100">
                      <div className="font-bold text-[#FF8A00] mb-0.5">{r.title}</div>
                      <p className="text-xs text-[#5C503D]">{r.content}</p>
                      <div className="mt-2 flex items-center justify-between bg-[#FFF3D6] px-3 py-1.5 rounded-xl">
                        <span className="font-bold text-xs text-[#522E00]">
                          🇪🇸 {r.exampleEs} — 🇷🇺 {r.exampleRu}
                        </span>
                        {r.audioWord && (
                          <button
                            onClick={() => speakSpanish(r.audioWord!, { dialect })}
                            className="p-1 rounded-lg bg-white text-[#FF8A00] hover:scale-110 shadow-xs"
                            title="Послушать пример"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Start Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const lvl = selectedLevelForPreview;
                  setSelectedLevelForPreview(null);
                  onSelectLevel(lvl);
                }}
                className="w-full py-4 rounded-2xl font-black text-lg btn-3d btn-3d-orange flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>¡Vamos a jugar! — Начать</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { UserProgress } from './types';
import { Trophy, CheckCircle2, Flame, Star, Coins, Zap, X } from 'lucide-react';
import { playSuccessSound } from './sound';

interface AchievementsModalProps {
  userProgress: UserProgress;
  onClose: () => void;
  onClaimQuest: (questId: string) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  userProgress,
  onClose,
  onClaimQuest,
}) => {
  const totalStars = Object.values(userProgress.completedLevels).reduce((acc, curr) => acc + curr.stars, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFDF7] rounded-3xl border-3 border-[#FFD447] max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl p-2 bg-[#FFF2D6] rounded-2xl">🏆</span>
            <div>
              <h2 className="text-xl font-black text-[#2D2A26]">Достижения и Задания</h2>
              <p className="text-xs text-[#736856]">Твой прогресс и награды в мире фонетики</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-2 my-4">
          <div className="p-3 bg-[#FFF3D6] rounded-2xl border border-[#FFD447] text-center">
            <div className="flex items-center justify-center text-[#FF8A00] mb-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div className="font-black text-sm text-[#522E00]">{userProgress.xp}</div>
            <div className="text-[10px] text-[#786438] font-bold">Опыт (XP)</div>
          </div>

          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-center">
            <div className="flex items-center justify-center text-amber-500 mb-0.5">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div className="font-black text-sm text-[#522E00]">{totalStars}</div>
            <div className="text-[10px] text-[#786438] font-bold">Звёзды</div>
          </div>

          <div className="p-3 bg-orange-50 rounded-2xl border border-orange-200 text-center">
            <div className="flex items-center justify-center text-orange-500 mb-0.5">
              <Flame className="w-4 h-4 fill-orange-500" />
            </div>
            <div className="font-black text-sm text-[#522E00]">{userProgress.streakDays} дн.</div>
            <div className="text-[10px] text-[#786438] font-bold">Серия</div>
          </div>

          <div className="p-3 bg-yellow-50 rounded-2xl border border-yellow-200 text-center">
            <div className="flex items-center justify-center text-yellow-600 mb-0.5">
              <Coins className="w-4 h-4" />
            </div>
            <div className="font-black text-sm text-[#522E00]">{userProgress.coins}</div>
            <div className="text-[10px] text-[#786438] font-bold">Монеты</div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 pr-1 space-y-6">
          {/* Daily Quests Section */}
          <div>
            <h3 className="text-xs font-black uppercase text-[#FF8A00] tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>📅 Ежедневные задания</span>
            </h3>
            <div className="space-y-2.5">
              {userProgress.dailyQuests.map((quest) => {
                const canClaim = quest.progress >= quest.target && !quest.completed;

                return (
                  <div
                    key={quest.id}
                    className="p-3.5 bg-white rounded-2xl border-2 border-stone-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs sm:text-sm font-bold text-[#2D2A26]">
                          {quest.titleRu}
                        </span>
                        <span className="text-xs font-bold text-[#8C7D67]">
                          {quest.progress} / {quest.target}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#FF8A00] h-full transition-all duration-300"
                          style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {quest.completed ? (
                        <span className="text-xs font-bold text-[#2BC4B0] flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Выполнено
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (canClaim) {
                              playSuccessSound();
                              onClaimQuest(quest.id);
                            }
                          }}
                          disabled={!canClaim}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all btn-3d ${
                            canClaim ? 'btn-3d-orange' : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          }`}
                        >
                          +{quest.rewardCoins} 🪙
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badges Section */}
          <div>
            <h3 className="text-xs font-black uppercase text-[#7755D9] tracking-wider mb-2.5 flex items-center gap-1.5">
              <span>🎖️ Значки достижений</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {userProgress.achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                    ach.unlocked
                      ? 'bg-white border-[#2BC4B0] shadow-xs'
                      : 'bg-stone-50 border-stone-200 opacity-60'
                  }`}
                >
                  <span className="text-3xl p-1 bg-[#FFF8E9] rounded-xl">{ach.icon}</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-[#2D2A26]">
                      {ach.titleRu}
                    </h4>
                    <p className="text-[11px] text-[#7A6D5B] leading-tight mt-0.5">
                      {ach.descRu}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

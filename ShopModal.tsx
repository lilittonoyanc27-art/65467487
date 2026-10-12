import React, { useState } from 'react';
import { Accessory, UserProgress } from './types';
import { ACCESSORIES_CATALOG } from './data';
import { Tigrito } from './tigrito';
import { Coins, Check, Lock, Sparkles, X } from 'lucide-react';
import { playSuccessSound, playTapSound, playErrorSound } from './sound';

interface ShopModalProps {
  userProgress: UserProgress;
  onClose: () => void;
  onEquipAccessory: (accId: string) => void;
  onBuyAccessory: (accessory: Accessory) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  userProgress,
  onClose,
  onEquipAccessory,
  onBuyAccessory,
}) => {
  const [previewAccessoryId, setPreviewAccessoryId] = useState<string>(userProgress.equippedAccessory);

  const handleSelect = (acc: Accessory) => {
    playTapSound();
    setPreviewAccessoryId(acc.id);
  };

  const handleAction = (acc: Accessory) => {
    const isOwned = userProgress.ownedAccessories.includes(acc.id);

    if (isOwned) {
      playTapSound();
      onEquipAccessory(acc.id);
    } else {
      if (userProgress.coins >= acc.cost) {
        playSuccessSound();
        onBuyAccessory(acc);
      } else {
        playErrorSound();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFDF7] rounded-3xl border-3 border-[#FFD447] max-w-xl w-full p-6 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎩</span>
            <div>
              <h2 className="text-xl font-black text-[#2D2A26]">Гардероб Тигри</h2>
              <p className="text-xs text-[#736856]">Выбирай стильные аксессуары за заработанные монеты</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#FFF2D6] px-3.5 py-1.5 rounded-full border border-[#FFD447]">
              <Coins className="w-4 h-4 text-[#FF8A00]" />
              <span className="font-black text-sm text-[#522E00]">{userProgress.coins}</span>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Tigrito Preview with selected accessory */}
        <div className="my-4 py-3 bg-[#FFF3D6]/40 rounded-2xl border border-[#FFD447]/50 flex flex-col items-center justify-center relative">
          <Tigrito
            emotion="happy"
            accessory={previewAccessoryId}
            size="md"
            interactive={true}
          />
          <div className="text-xs font-bold text-[#8C6D2B] mt-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FF8A00]" />
            <span>Примерка в реальном времени</span>
          </div>
        </div>

        {/* Accessories Grid */}
        <div className="overflow-y-auto flex-1 pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACCESSORIES_CATALOG.map((acc) => {
            const isOwned = userProgress.ownedAccessories.includes(acc.id);
            const isEquipped = userProgress.equippedAccessory === acc.id;
            const isSelectedForPreview = previewAccessoryId === acc.id;
            const canAfford = userProgress.coins >= acc.cost;

            return (
              <div
                key={acc.id}
                onClick={() => handleSelect(acc)}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  isSelectedForPreview
                    ? 'border-[#FF8A00] bg-[#FFF8E9] shadow-md'
                    : 'border-stone-200 bg-white hover:border-[#FFD447]'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl p-1.5 bg-[#FFF2D6] rounded-xl">{acc.icon}</span>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#2D2A26] leading-tight">
                      {acc.nameRu}
                    </h3>
                    <p className="text-[11px] text-[#786E5E]">{acc.descriptionRu}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-1">
                  {isOwned ? (
                    <span className="text-xs font-bold text-[#2BC4B0] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> В коллекции
                    </span>
                  ) : (
                    <div className="flex items-center gap-1 text-xs font-black text-[#522E00]">
                      <Coins className="w-3.5 h-3.5 text-[#FF8A00]" />
                      <span>{acc.cost} монет</span>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(acc);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all btn-3d ${
                      isEquipped
                        ? 'bg-stone-200 text-stone-500 cursor-default'
                        : isOwned
                        ? 'btn-3d-turquoise'
                        : canAfford
                        ? 'btn-3d-orange'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    {isEquipped
                      ? 'Надето'
                      : isOwned
                      ? 'Надеть'
                      : canAfford
                      ? 'Купить'
                      : 'Не хватает'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

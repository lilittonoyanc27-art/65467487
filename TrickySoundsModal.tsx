import React, { useState } from 'react';
import { TrickySoundItem } from './types';
import { Volume2, CheckCircle2, RotateCcw, X, AlertCircle } from 'lucide-react';
import { speakSpanish } from './speech';
import { playSuccessSound, playTapSound } from './sound';

interface TrickySoundsModalProps {
  trickySounds: TrickySoundItem[];
  dialect: 'es-ES' | 'es-419';
  onClose: () => void;
  onClearSound: (id: string) => void;
  onPracticeAll: () => void;
}

export const TrickySoundsModal: React.FC<TrickySoundsModalProps> = ({
  trickySounds,
  dialect,
  onClose,
  onClearSound,
  onPracticeAll,
}) => {
  const [activePracticeWord, setActivePracticeWord] = useState<string | null>(null);

  const handleSpeak = (word: string) => {
    playTapSound();
    setActivePracticeWord(word);
    speakSpanish(word, {
      dialect,
      onEnd: () => setActivePracticeWord(null),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFDF7] rounded-3xl border-3 border-[#FF6262] max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl p-2 bg-red-100 rounded-2xl">🎯</span>
            <div>
              <h2 className="text-xl font-black text-[#2D2A26]">Мои трудные звуки</h2>
              <p className="text-xs text-[#736856]">
                Слова и правила, в которых возникали сомнения
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list or empty state */}
        <div className="my-4 overflow-y-auto flex-1 pr-1 space-y-3">
          {trickySounds.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <span className="text-5xl mb-3">🌟</span>
              <h3 className="text-lg font-black text-[#2D2A26] mb-1">
                Список чист! Ты говоришь безупречно!
              </h3>
              <p className="text-xs text-[#7A6F5C] max-w-xs">
                Когда ты допустишь неточность на любом уровне, Тигри автоматически сохранит слово сюда для удобного повторения.
              </p>
            </div>
          ) : (
            trickySounds.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white rounded-2xl border-2 border-stone-200 hover:border-[#FF6262] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-[#FF8A00] tracking-wide">
                      {item.word}
                    </span>
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                      Ошибок: {item.mistakeCount}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#574B39] mt-0.5">
                    {item.translationRu}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2 text-xs text-[#7A6D5A]">
                    <AlertCircle className="w-3.5 h-3.5 text-[#FF8A00] shrink-0" />
                    <span>{item.phoneticGuideRu}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSpeak(item.word)}
                    className={`p-2.5 rounded-xl border border-stone-200 hover:bg-[#FFF3D6] text-[#FF8A00] transition-colors ${
                      activePracticeWord === item.word ? 'bg-[#FFD447]' : 'bg-stone-50'
                    }`}
                    title="Послушать"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => {
                      playSuccessSound();
                      onClearSound(item.id);
                    }}
                    className="p-2.5 rounded-xl border border-stone-200 hover:bg-[#E7F9F5] text-[#2BC4B0] transition-colors"
                    title="Я запомнил! Убрать из трудных"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {trickySounds.length > 0 && (
          <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={() => {
                playTapSound();
                onPracticeAll();
              }}
              className="w-full py-3.5 rounded-2xl font-black text-sm btn-3d btn-3d-orange flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Пройти блиц-тренировку сложных слов</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

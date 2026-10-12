import React, { useState } from 'react';
import { Volume2, X, Sparkles, BookOpen } from 'lucide-react';
import { speakSpanish } from './speech';
import { playTapSound } from './sound';

interface PhoneticsGuideModalProps {
  dialect: 'es-ES' | 'es-419';
  onClose: () => void;
}

interface SoundCard {
  letter: string;
  ipa: string;
  ruleRu: string;
  exampleEs: string;
  exampleRu: string;
  comparisonWithRussian: string;
}

export const PhoneticsGuideModal: React.FC<PhoneticsGuideModalProps> = ({
  dialect,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'vocales' | 'cz' | 'gj' | 'special'>('vocales');

  const soundData: Record<string, SoundCard[]> = {
    vocales: [
      {
        letter: 'A',
        ipa: '[a]',
        ruleRu: 'Открытый, ясный гласный',
        exampleEs: 'casa',
        exampleRu: 'дом',
        comparisonWithRussian: 'Как русский [а] под ударением, всегда отчётливо.',
      },
      {
        letter: 'E',
        ipa: '[e]',
        ruleRu: 'Широкий полуоткрытый',
        exampleEs: 'mesa',
        exampleRu: 'стол',
        comparisonWithRussian: 'Ближе к русскому [э] в слове «это», не смягчает согласные сильно.',
      },
      {
        letter: 'I',
        ipa: '[i]',
        ruleRu: 'Напряжённый закрытый',
        exampleEs: 'isla',
        exampleRu: 'остров',
        comparisonWithRussian: 'Как русский [и], но более острый и напряжённый.',
      },
      {
        letter: 'O',
        ipa: '[o]',
        ruleRu: 'ЧИСТЫЙ звук О — без редукции!',
        exampleEs: 'mono',
        exampleRu: 'обезьяна',
        comparisonWithRussian: 'Внимание! Никогда не превращается в [а] в безударной позиции.',
      },
      {
        letter: 'U',
        ipa: '[u]',
        ruleRu: 'Закрытый губной',
        exampleEs: 'luna',
        exampleRu: 'луна',
        comparisonWithRussian: 'Как русский [у]. Не читается в сочетаниях que, qui, gue, gui!',
      },
    ],
    cz: [
      {
        letter: 'CA, CO, CU',
        ipa: '[k]',
        ruleRu: 'Звук [к] перед гласными A, O, U',
        exampleEs: 'café, copa, cuna',
        exampleRu: 'кофе, кубок, колыбель',
        comparisonWithRussian: 'Твёрдый русский звук [к].',
      },
      {
        letter: 'QUE, QUI',
        ipa: '[ke], [ki]',
        ruleRu: 'Звук [к] перед E и I (буква U немая!)',
        exampleEs: 'queso, quince',
        exampleRu: 'сыр, пятнадцать',
        comparisonWithRussian: 'Звучит [ке], [ки]. Буква U здесь не произносится!',
      },
      {
        letter: 'CE, CI',
        ipa: '[θ] (ESP) / [s] (LAT)',
        ruleRu: 'Межзубный [θ] в Испании или [с] в Америке',
        exampleEs: 'cero, cielo',
        exampleRu: 'ноль, небо',
        comparisonWithRussian: 'В Испании: язык между зубами (как th в think). В Латинской Америке: чистое [с].',
      },
      {
        letter: 'ZA, ZO, ZU',
        ipa: '[θ] (ESP) / [s] (LAT)',
        ruleRu: 'Буква Z звучит аналогично CE/CI',
        exampleEs: 'zapato, zorro, zumo',
        exampleRu: 'ботинок, лиса, сок',
        comparisonWithRussian: 'В испанском НЕТ звука [з]! Z никогда не читается как русское [з].',
      },
    ],
    gj: [
      {
        letter: 'GA, GO, GU',
        ipa: '[g]',
        ruleRu: 'Звук [г] перед гласными A, O, U',
        exampleEs: 'gato, gota, gusto',
        exampleRu: 'кот, капля, вкус',
        comparisonWithRussian: 'Обычный звонкий звук [г].',
      },
      {
        letter: 'GUE, GUI',
        ipa: '[ge], [gi]',
        ruleRu: 'Звук [г] перед E и I (буква U немая)',
        exampleEs: 'guerra, guitarra',
        exampleRu: 'война, гитара',
        comparisonWithRussian: 'Читается [гэ], [ги]. Буква U сохраняет твёрдость G.',
      },
      {
        letter: 'GÜE, GÜI',
        ipa: '[gwe], [gwi]',
        ruleRu: 'Две точки (diéresis) возвращают голос букве U!',
        exampleEs: 'pingüino, bilingüe',
        exampleRu: 'пингвин, двуязычный',
        comparisonWithRussian: 'Благодаря точкам звучит [гуэ], [гуи]!',
      },
      {
        letter: 'GE, GI & J',
        ipa: '[x]',
        ruleRu: 'Сильный горловой звук [х]',
        exampleEs: 'gente, jirafa, ojo',
        exampleRu: 'люди, жираф, глаз',
        comparisonWithRussian: 'Глубже русского [х], с энергичным напором воздуха.',
      },
    ],
    special: [
      {
        letter: 'B и V',
        ipa: '[b] / [β]',
        ruleRu: 'Абсолютно одинаковый звук!',
        exampleEs: 'vaca, boca',
        exampleRu: 'корова, рот',
        comparisonWithRussian: 'Русского прикусывания губы зубами нет! Только смыкание обеих губ.',
      },
      {
        letter: 'Ñ',
        ipa: '[ɲ]',
        ruleRu: 'Символ испанского языка',
        exampleEs: 'niño, España',
        exampleRu: 'мальчик, Испания',
        comparisonWithRussian: 'Похоже на мягкое русское [нь] в слове «конь», спинка языка у нёба.',
      },
      {
        letter: 'LL / Y',
        ipa: '[ʎ] / [ʝ]',
        ruleRu: 'Мягкий палатальный звук',
        exampleEs: 'lluvia, playa',
        exampleRu: 'дождь, пляж',
        comparisonWithRussian: 'Звучит как мягкое русское [й] или лёгкое [ль].',
      },
      {
        letter: 'R vs RR',
        ipa: '[ɾ] vs [r]',
        ruleRu: 'Одиночный тап против раскатистого ролла',
        exampleEs: 'pero (но) vs perro (собака)',
        exampleRu: 'pero vs perro',
        comparisonWithRussian: 'Один удар кончиком языка в pero, мощная вибрация в perro!',
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FFFDF7] rounded-3xl border-3 border-[#46DCC8] max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl p-2 bg-teal-100 rounded-2xl">📖</span>
            <div>
              <h2 className="text-xl font-black text-[#2D2A26]">Фонетический справочник</h2>
              <p className="text-xs text-[#736856]">Все правила произношения испанских букв</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl my-4 overflow-x-auto">
          {[
            { id: 'vocales', label: 'Гласные (A,E,I,O,U)' },
            { id: 'cz', label: 'C, Z, QU' },
            { id: 'gj', label: 'G, GU, GÜ, J' },
            { id: 'special', label: 'B/V, Ñ, LL, RR' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                playTapSound();
                setActiveTab(tab.id as any);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-[#FF8A00] shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sound Cards List */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3">
          {soundData[activeTab].map((card, idx) => (
            <div
              key={idx}
              className="p-4 bg-white rounded-2xl border-2 border-stone-200 hover:border-[#46DCC8] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-[#FF8A00]">
                    {card.letter}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#7755D9] bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    {card.ipa}
                  </span>
                </div>
                <div className="text-xs font-bold text-[#2D2A26] mt-1">{card.ruleRu}</div>
                <p className="text-xs text-[#7A6D5B] mt-0.5 leading-relaxed">
                  {card.comparisonWithRussian}
                </p>
                <div className="mt-2 text-xs font-semibold text-[#522E00] bg-[#FFF2D6] px-2.5 py-1 rounded-lg inline-block">
                  Пример: 🇪🇸 <span className="font-bold">{card.exampleEs}</span> ({card.exampleRu})
                </div>
              </div>

              <button
                onClick={() => speakSpanish(card.exampleEs, { dialect })}
                className="shrink-0 p-3 rounded-xl bg-[#FFF8E9] border border-[#FFD447] text-[#FF8A00] hover:bg-[#FFD447] hover:text-[#522E00] transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="Послушать произношение"
              >
                <Volume2 className="w-4 h-4" />
                <span className="sm:hidden">Слушать</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

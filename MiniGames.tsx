import React, { useState, useEffect } from 'react';
import { 
  Exercise, 
  ListenChoiceExercise, 
  BuildWordExercise, 
  HelpTigritoExercise, 
  ListenSyllablesExercise, 
  FindSoundExercise, 
  WordTreasureExercise, 
  RepeatMeExercise, 
  SpeedChallengeExercise,
  TigritoEmotion 
} from './types';
import { Tigrito } from './tigrito';
import { speakSpanish, listenForSpanishWord, isSpeechRecognitionSupported } from './speech';
import { 
  playSuccessSound, 
  playErrorSound, 
  playTapSound, 
  playStepSound, 
  playChestSound, 
  playClapSound 
} from './sound';
import { 
  Volume2, 
  Mic, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  ArrowRight, 
  Lightbulb, 
  HelpCircle,
  Coins,
  Smile
} from 'lucide-react';

interface MiniGameProps {
  exercise: Exercise;
  dialect: 'es-ES' | 'es-419';
  accessory: string;
  onAnswer: (isCorrect: boolean, exerciseId: string, mistakeDetails?: { word: string; rule: string; explanation: string }) => void;
  onNext: () => void;
}

export const MiniGameRenderer: React.FC<MiniGameProps> = ({
  exercise,
  dialect,
  accessory,
  onAnswer,
  onNext,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<TigritoEmotion>('happy');
  const [speechFeedback, setSpeechFeedback] = useState<{ ru: string; es?: string }>({ ru: 'Слушай внимательно!' });

  // Reset state when exercise changes
  useEffect(() => {
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setIsAnswerCorrect(null);
    setCurrentEmotion('happy');
    setSpeechFeedback({ ru: exercise.instructionRu });

    // Auto-play audio if applicable
    if (exercise.type === 'listen-choice') {
      const ex = exercise as ListenChoiceExercise;
      speakSpanish(ex.audioTextToSpeak || ex.audioWord, { dialect });
    } else if (exercise.type === 'repeat-me') {
      const ex = exercise as RepeatMeExercise;
      speakSpanish(ex.spanishWord, { dialect });
    }
  }, [exercise.id, dialect]);

  // Handle common answer evaluation
  const handleAnswerSubmit = (correct: boolean, explanation: string, mistakeDetails?: { word: string; rule: string; explanation: string }) => {
    setIsSubmitted(true);
    setIsAnswerCorrect(correct);

    if (correct) {
      playSuccessSound();
      setCurrentEmotion('clap');
      setSpeechFeedback({ ru: '¡Excelente! ' + explanation, es: '¡Muy bien!' });
      onAnswer(true, exercise.id);
    } else {
      playErrorSound();
      setCurrentEmotion('thinking');
      setSpeechFeedback({ ru: 'Не переживай! ' + explanation, es: '¡Ánimo!' });
      onAnswer(false, exercise.id, mistakeDetails);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* Tigrito Assistant Header */}
      <div className="w-full flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <Tigrito
            emotion={currentEmotion}
            accessory={accessory}
            size="sm"
            interactive={true}
            onTigritoClick={() => {
              playClapSound();
              setCurrentEmotion(currentEmotion === 'dance' ? 'happy' : 'dance');
            }}
          />
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-[#FF8A00] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{exercise.title}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#2D2A26] leading-snug">
              {exercise.instructionRu}
            </h2>
          </div>
        </div>

        {exercise.soundTarget && (
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[11px] text-[#8C8270] uppercase font-semibold">Фонема</span>
            <span className="text-lg font-black text-[#7755D9] bg-[#7755D9]/10 px-2.5 py-0.5 rounded-lg">
              [{exercise.soundTarget}]
            </span>
          </div>
        )}
      </div>

      {/* Main Game Card */}
      <div className="w-full bg-white rounded-3xl p-5 sm:p-7 shadow-lg border-2 border-[#FFD447]/40 relative overflow-hidden transition-all">
        {exercise.type === 'listen-choice' && (
          <ListenChoiceGame
            exercise={exercise as ListenChoiceExercise}
            dialect={dialect}
            isSubmitted={isSubmitted}
            selectedOptionId={selectedOptionId}
            onSelectOption={(opt) => {
              if (isSubmitted) return;
              setSelectedOptionId(opt.id);
              playTapSound();
              handleAnswerSubmit(opt.isCorrect, exercise.explanationRu, {
                word: exercise.audioWord,
                rule: 'Различение на слух',
                explanation: exercise.explanationRu,
              });
            }}
          />
        )}

        {exercise.type === 'build-word' && (
          <BuildWordGame
            exercise={exercise as BuildWordExercise}
            dialect={dialect}
            isSubmitted={isSubmitted}
            onSubmit={(correct) => {
              handleAnswerSubmit(correct, exercise.explanationRu, {
                word: (exercise as BuildWordExercise).targetWord,
                rule: 'Правописание и состав слова',
                explanation: exercise.explanationRu,
              });
            }}
          />
        )}

        {exercise.type === 'help-tigrito' && (
          <HelpTigritoGame
            exercise={exercise as HelpTigritoExercise}
            dialect={dialect}
            accessory={accessory}
            isSubmitted={isSubmitted}
            selectedOptionId={selectedOptionId}
            onSelectOption={(opt) => {
              if (isSubmitted) return;
              setSelectedOptionId(opt.id);
              if (opt.isCorrect) playStepSound();
              handleAnswerSubmit(opt.isCorrect, exercise.explanationRu, {
                word: (exercise as HelpTigritoExercise).questionRu,
                rule: 'Фонетическое правило',
                explanation: exercise.explanationRu,
              });
            }}
          />
        )}

        {exercise.type === 'listen-syllables' && (
          <ListenSyllablesGame
            exercise={exercise as ListenSyllablesExercise}
            dialect={dialect}
            isSubmitted={isSubmitted}
            onSubmit={(correct) => {
              handleAnswerSubmit(correct, exercise.explanationRu, {
                word: (exercise as ListenSyllablesExercise).fullWord,
                rule: 'Слоги и соединение звуков',
                explanation: exercise.explanationRu,
              });
            }}
          />
        )}

        {exercise.type === 'find-sound' && (
          <FindSoundGame
            exercise={exercise as FindSoundExercise}
            dialect={dialect}
            isSubmitted={isSubmitted}
            selectedOptionId={selectedOptionId}
            onSelectOption={(word) => {
              if (isSubmitted) return;
              setSelectedOptionId(word.id);
              handleAnswerSubmit(word.isOddOneOut, exercise.explanationRu, {
                word: word.word,
                rule: 'Поиск исключения / смена звука',
                explanation: exercise.explanationRu,
              });
            }}
          />
        )}

        {exercise.type === 'word-treasure' && (
          <WordTreasureGame
            exercise={exercise as WordTreasureExercise}
            dialect={dialect}
            isSubmitted={isSubmitted}
            selectedOptionId={selectedOptionId}
            onSelectOption={(opt) => {
              if (isSubmitted) return;
              setSelectedOptionId(opt.id);
              if (opt.isCorrect) playChestSound();
              handleAnswerSubmit(opt.isCorrect, exercise.explanationRu, {
                word: 'Сундук сокровищ',
                rule: 'Фонетическая загадка',
                explanation: exercise.explanationRu,
              });
            }}
          />
        )}

        {exercise.type === 'repeat-me' && (
          <RepeatMeGame
            exercise={exercise as RepeatMeExercise}
            dialect={dialect}
            isSubmitted={isSubmitted}
            onSubmit={(correct) => {
              handleAnswerSubmit(correct, (exercise as RepeatMeExercise).tipRu, {
                word: (exercise as RepeatMeExercise).spanishWord,
                rule: 'Произношение вслух',
                explanation: (exercise as RepeatMeExercise).tipRu,
              });
            }}
          />
        )}

        {exercise.type === 'speed-challenge' && (
          <SpeedChallengeGame
            exercise={exercise as SpeedChallengeExercise}
            dialect={dialect}
            onComplete={(score, max) => {
              const pass = score >= Math.ceil(max * 0.7);
              handleAnswerSubmit(pass, `Результат блица: ${score} из ${max} верных ответов!`);
            }}
          />
        )}
      </div>

      {/* Post-answer feedback banner and Next button */}
      {isSubmitted && (
        <div className={`w-full mt-4 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 border-2 transition-all ${
          isAnswerCorrect
            ? 'bg-[#E7F9F5] border-[#2BC4B0] text-[#0E685D]'
            : 'bg-[#FFF0F0] border-[#FF6262] text-[#931D1D]'
        }`}>
          <div className="flex items-center gap-3">
            {isAnswerCorrect ? (
              <CheckCircle2 className="w-8 h-8 text-[#2BC4B0] shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-[#FF6262] shrink-0" />
            )}
            <div>
              <p className="font-bold text-base">
                {isAnswerCorrect ? '¡Correcto! Отлично!' : 'Правильный ответ и подсказка:'}
              </p>
              <p className="text-xs sm:text-sm mt-0.5 opacity-90 leading-relaxed">
                {speechFeedback.ru}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playTapSound();
              onNext();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 btn-3d btn-3d-orange shrink-0"
          >
            <span>Следующее задание</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

// ================= MINI-GAME 1: Escucha y elige =================
const ListenChoiceGame: React.FC<{
  exercise: ListenChoiceExercise;
  dialect: 'es-ES' | 'es-419';
  isSubmitted: boolean;
  selectedOptionId: string | null;
  onSelectOption: (opt: ListenChoiceExercise['options'][0]) => void;
}> = ({ exercise, dialect, isSubmitted, selectedOptionId, onSelectOption }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = () => {
    setIsPlaying(true);
    speakSpanish(exercise.audioTextToSpeak || exercise.audioWord, {
      dialect,
      onEnd: () => setIsPlaying(false),
    });
  };

  return (
    <div className="flex flex-col items-center">
      {/* Big Audio speaker button */}
      <button
        onClick={handleSpeak}
        className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1.5 mb-6 transition-all shadow-md btn-3d ${
          isPlaying ? 'bg-[#FF8A00] scale-105' : 'bg-[#FFD447] hover:bg-[#FFC924]'
        }`}
        title="Нажми, чтобы прослушать"
      >
        <Volume2 className={`w-10 h-10 ${isPlaying ? 'text-white animate-pulse' : 'text-[#522E00]'}`} />
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#522E00]">
          {isPlaying ? 'Звучит...' : 'Слушать'}
        </span>
      </button>

      <p className="text-sm text-[#736856] mb-6 text-center">
        Нажми на кнопку выше и выбери, какое именно слово или звук прозвучали:
      </p>

      {/* Options grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
        {exercise.options.map((opt) => {
          let btnStyle = 'bg-[#FFFDF7] border-[#E8DFC8] text-[#2D2A26] hover:border-[#FF8A00]';

          if (isSubmitted) {
            if (opt.isCorrect) {
              btnStyle = 'bg-[#E7F9F5] border-[#2BC4B0] text-[#0E685D] ring-2 ring-[#2BC4B0]';
            } else if (selectedOptionId === opt.id) {
              btnStyle = 'bg-[#FFF0F0] border-[#FF6262] text-[#931D1D] ring-2 ring-[#FF6262]';
            } else {
              btnStyle = 'bg-gray-50 border-gray-200 text-gray-400 opacity-60';
            }
          } else if (selectedOptionId === opt.id) {
            btnStyle = 'bg-[#FFF3D6] border-[#FF8A00] text-[#522E00]';
          }

          return (
            <button
              key={opt.id}
              onClick={() => onSelectOption(opt)}
              disabled={isSubmitted}
              className={`p-4 rounded-2xl border-2 font-bold text-left flex items-center justify-between transition-all btn-3d ${btnStyle}`}
            >
              <div>
                <span className="text-lg font-black tracking-wide block">{opt.text}</span>
                {opt.subtext && (
                  <span className="text-xs font-medium text-[#7A705E] block mt-0.5">
                    {opt.subtext}
                  </span>
                )}
              </div>
              <Volume2
                onClick={(e) => {
                  e.stopPropagation();
                  speakSpanish(opt.text, { dialect });
                }}
                className="w-5 h-5 text-gray-400 hover:text-[#FF8A00] p-0.5"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ================= MINI-GAME 2: Construye la palabra =================
const BuildWordGame: React.FC<{
  exercise: BuildWordExercise;
  dialect: 'es-ES' | 'es-419';
  isSubmitted: boolean;
  onSubmit: (isCorrect: boolean) => void;
}> = ({ exercise, dialect, isSubmitted, onSubmit }) => {
  const [placedLetters, setPlacedLetters] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>(exercise.letters);

  useEffect(() => {
    setPlacedLetters([]);
    setAvailableLetters(exercise.letters);
  }, [exercise.id]);

  const handleAddLetter = (letter: string, index: number) => {
    if (isSubmitted) return;
    playTapSound();
    speakSpanish(letter.toLowerCase(), { dialect, rate: 1.1 });
    const newAvailable = [...availableLetters];
    newAvailable.splice(index, 1);
    const newPlaced = [...placedLetters, letter];

    setPlacedLetters(newPlaced);
    setAvailableLetters(newAvailable);

    // If all letters placed, check word
    if (newPlaced.length === exercise.targetWord.length) {
      const assembledWord = newPlaced.join('');
      const isCorrect = assembledWord.toUpperCase() === exercise.targetWord.toUpperCase();
      onSubmit(isCorrect);
    }
  };

  const handleRemoveLetter = (index: number) => {
    if (isSubmitted) return;
    playTapSound();
    const letter = placedLetters[index];
    const newPlaced = [...placedLetters];
    newPlaced.splice(index, 1);
    setPlacedLetters(newPlaced);
    setAvailableLetters([...availableLetters, letter]);
  };

  const handleReset = () => {
    if (isSubmitted) return;
    playTapSound();
    setPlacedLetters([]);
    setAvailableLetters(exercise.letters);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Picture / Emoji & Meaning */}
      <div className="flex flex-col items-center mb-6">
        <div className="text-6xl mb-2 filter drop-shadow-md select-none">{exercise.emojiOrImage}</div>
        <div className="text-base font-bold text-[#594F3E] bg-[#FFF2D6] px-4 py-1 rounded-full">
          Перевод: <span className="text-[#2D2A26]">{exercise.translationRu}</span>
        </div>
        <div className="text-xs text-[#8A7D69] mt-1 font-mono">{exercise.phoneticBreakdown}</div>
      </div>

      {/* Target Word Slots */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 min-h-[64px]">
        {Array.from({ length: exercise.targetWord.length }).map((_, idx) => {
          const letter = placedLetters[idx];
          return (
            <button
              key={idx}
              onClick={() => letter && handleRemoveLetter(idx)}
              className={`w-12 h-14 sm:w-14 sm:h-16 rounded-xl border-2 flex items-center justify-center font-black text-2xl transition-all ${
                letter
                  ? 'bg-[#FF8A00] border-[#D46B00] text-white shadow-md transform hover:-translate-y-0.5'
                  : 'bg-[#FFF8E9] border-dashed border-[#D6C7A8] text-transparent'
              }`}
            >
              {letter || '_'}
            </button>
          );
        })}
      </div>

      {/* Available Letters Pool */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
        {availableLetters.map((char, idx) => (
          <button
            key={idx}
            onClick={() => handleAddLetter(char, idx)}
            disabled={isSubmitted}
            className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl border-2 font-black text-2xl btn-3d btn-3d-yellow"
          >
            {char}
          </button>
        ))}
      </div>

      {/* Reset letters button */}
      {placedLetters.length > 0 && !isSubmitted && (
        <button
          onClick={handleReset}
          className="text-xs font-bold text-[#A8987E] hover:text-[#FF8A00] flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Сбросить буквы</span>
        </button>
      )}
    </div>
  );
};

// ================= MINI-GAME 3: Ayuda a Tigrito =================
const HelpTigritoGame: React.FC<{
  exercise: HelpTigritoExercise;
  dialect: 'es-ES' | 'es-419';
  accessory: string;
  isSubmitted: boolean;
  selectedOptionId: string | null;
  onSelectOption: (opt: HelpTigritoExercise['options'][0]) => void;
}> = ({ exercise, dialect, accessory, isSubmitted, selectedOptionId, onSelectOption }) => {
  const [tigritoStep, setTigritoStep] = useState(0);

  useEffect(() => {
    if (isSubmitted && selectedOptionId) {
      const selected = exercise.options.find(o => o.id === selectedOptionId);
      if (selected?.isCorrect) {
        setTigritoStep(1);
      }
    }
  }, [isSubmitted, selectedOptionId, exercise.options]);

  return (
    <div className="flex flex-col items-center">
      {/* River stepping stones crossing scene */}
      <div className="w-full bg-[#D4F4FA] border-2 border-[#8DE0EF] rounded-2xl p-4 mb-6 relative overflow-hidden flex items-center justify-between min-h-[140px]">
        {/* Animated water waves background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none flex flex-col justify-around">
          <div className="w-full h-1 bg-[#2BC4B0] animate-pulse" />
          <div className="w-full h-1 bg-[#2BC4B0] animate-pulse [animation-delay:0.5s]" />
          <div className="w-full h-1 bg-[#2BC4B0] animate-pulse [animation-delay:1s]" />
        </div>

        {/* Start Bank */}
        <div className="z-10 flex flex-col items-center">
          <div className="text-xs font-black text-[#0B7285] mb-1">Берег 1</div>
          <div className="w-16 h-12 bg-[#8FD175] border-2 border-[#5C9E42] rounded-xl flex items-center justify-center">
            {tigritoStep === 0 && (
              <Tigrito
                emotion={isSubmitted ? 'happy' : 'thinking'}
                accessory={accessory}
                size="sm"
                interactive={false}
              />
            )}
          </div>
        </div>

        {/* River Lily pads / Stepping stones */}
        <div className="z-10 flex items-center gap-3 sm:gap-6">
          <div className="w-14 h-12 bg-[#38B000] border-2 border-[#206300] rounded-full flex items-center justify-center shadow-md relative">
            <span className="text-xs font-black text-white">🌸 1</span>
            {tigritoStep === 1 && (
              <div className="absolute -top-7">
                <Tigrito
                  emotion="cheer"
                  accessory={accessory}
                  size="sm"
                  interactive={false}
                />
              </div>
            )}
          </div>

          <div className="w-14 h-12 bg-[#38B000]/70 border-2 border-[#206300]/70 rounded-full flex items-center justify-center">
            <span className="text-xs font-black text-white/90">🌸 2</span>
          </div>
        </div>

        {/* Destination Bank with Treasure Flag */}
        <div className="z-10 flex flex-col items-center">
          <div className="text-xs font-black text-[#0B7285] mb-1">Цель 🎯</div>
          <div className="w-16 h-12 bg-[#8FD175] border-2 border-[#5C9E42] rounded-xl flex items-center justify-center font-bold text-lg">
            🏝️
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-black text-[#2D2A26] mb-1">
          {exercise.questionRu}
        </h3>
        {exercise.audioPrompt && (
          <button
            onClick={() => speakSpanish(exercise.audioPrompt!, { dialect })}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF8A00] bg-[#FFF2D6] px-3 py-1 rounded-full mt-2 hover:bg-[#FFE5B0]"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Прослушать: «{exercise.audioPrompt}»</span>
          </button>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3 w-full max-w-lg">
        {exercise.options.map((opt) => {
          let btnStyle = 'bg-white border-[#E5DAC0] text-[#2D2A26] hover:border-[#FF8A00]';

          if (isSubmitted) {
            if (opt.isCorrect) {
              btnStyle = 'bg-[#E7F9F5] border-[#2BC4B0] text-[#0E685D] ring-2 ring-[#2BC4B0]';
            } else if (selectedOptionId === opt.id) {
              btnStyle = 'bg-[#FFF0F0] border-[#FF6262] text-[#931D1D] ring-2 ring-[#FF6262]';
            } else {
              btnStyle = 'bg-gray-50 border-gray-200 text-gray-400 opacity-60';
            }
          }

          return (
            <button
              key={opt.id}
              onClick={() => onSelectOption(opt)}
              disabled={isSubmitted}
              className={`p-3.5 rounded-2xl border-2 font-bold text-left flex items-center justify-between btn-3d ${btnStyle}`}
            >
              <span className="text-sm sm:text-base">{opt.text}</span>
              {isSubmitted && opt.isCorrect && <CheckCircle2 className="w-5 h-5 text-[#2BC4B0] shrink-0" />}
              {isSubmitted && !opt.isCorrect && selectedOptionId === opt.id && <XCircle className="w-5 h-5 text-[#FF6262] shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ================= MINI-GAME 4: Escucha las sílabas =================
const ListenSyllablesGame: React.FC<{
  exercise: ListenSyllablesExercise;
  dialect: 'es-ES' | 'es-419';
  isSubmitted: boolean;
  onSubmit: (isCorrect: boolean) => void;
}> = ({ exercise, dialect, isSubmitted, onSubmit }) => {
  const [orderedSyllables, setOrderedSyllables] = useState<string[]>([]);
  const [availableSyllables, setAvailableSyllables] = useState<string[]>(exercise.shuffledSyllables);

  useEffect(() => {
    setOrderedSyllables([]);
    setAvailableSyllables(exercise.shuffledSyllables);
  }, [exercise.id]);

  const handlePlayWord = () => {
    speakSpanish(exercise.fullWord, { dialect });
  };

  const handleAddSyllable = (syl: string, idx: number) => {
    if (isSubmitted) return;
    playTapSound();
    speakSpanish(syl.toLowerCase(), { dialect });

    const newAvail = [...availableSyllables];
    newAvail.splice(idx, 1);
    const newOrdered = [...orderedSyllables, syl];

    setOrderedSyllables(newOrdered);
    setAvailableSyllables(newAvail);

    if (newOrdered.length === exercise.syllables.length) {
      const isCorrect = newOrdered.join('') === exercise.syllables.join('');
      onSubmit(isCorrect);
    }
  };

  const handleRemoveSyllable = (idx: number) => {
    if (isSubmitted) return;
    playTapSound();
    const syl = orderedSyllables[idx];
    const newOrdered = [...orderedSyllables];
    newOrdered.splice(idx, 1);
    setOrderedSyllables(newOrdered);
    setAvailableSyllables([...availableSyllables, syl]);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Audio Play for Full Word */}
      <button
        onClick={handlePlayWord}
        className="flex items-center gap-2.5 px-6 py-3 rounded-full font-extrabold text-sm mb-6 btn-3d btn-3d-yellow"
      >
        <Volume2 className="w-5 h-5" />
        <span>Слушать целое слово ({exercise.translationRu})</span>
      </button>

      {/* Slot Dropzone */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8 min-h-[58px]">
        {Array.from({ length: exercise.syllables.length }).map((_, idx) => {
          const syl = orderedSyllables[idx];
          return (
            <button
              key={idx}
              onClick={() => syl && handleRemoveSyllable(idx)}
              className={`px-5 py-3 rounded-2xl border-2 font-black text-xl transition-all ${
                syl
                  ? 'bg-[#7755D9] border-[#5434B3] text-white shadow-md'
                  : 'bg-[#FFF8E9] border-dashed border-[#D6C7A8] text-transparent'
              }`}
            >
              {syl || '___'}
            </button>
          );
        })}
      </div>

      {/* Available Syllables */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        {availableSyllables.map((syl, idx) => (
          <button
            key={idx}
            onClick={() => handleAddSyllable(syl, idx)}
            disabled={isSubmitted}
            className="px-5 py-3 rounded-2xl border-2 font-black text-xl btn-3d btn-3d-orange"
          >
            {syl}
          </button>
        ))}
      </div>
    </div>
  );
};

// ================= MINI-GAME 5: Encuentra el sonido =================
const FindSoundGame: React.FC<{
  exercise: FindSoundExercise;
  dialect: 'es-ES' | 'es-419';
  isSubmitted: boolean;
  selectedOptionId: string | null;
  onSelectOption: (word: FindSoundExercise['words'][0]) => void;
}> = ({ exercise, dialect, isSubmitted, selectedOptionId, onSelectOption }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-[#FFF4DC] border border-[#FFD447] rounded-xl px-4 py-2.5 mb-6 text-center max-w-lg">
        <p className="text-xs sm:text-sm font-bold text-[#634E1D] flex items-center justify-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-[#FF8A00]" />
          <span>{exercise.ruleDescriptionRu}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {exercise.words.map((w) => {
          let btnStyle = 'bg-white border-[#E8DFC8] text-[#2D2A26] hover:border-[#FF8A00]';

          if (isSubmitted) {
            if (w.isOddOneOut) {
              btnStyle = 'bg-[#E7F9F5] border-[#2BC4B0] text-[#0E685D] ring-2 ring-[#2BC4B0]';
            } else if (selectedOptionId === w.id) {
              btnStyle = 'bg-[#FFF0F0] border-[#FF6262] text-[#931D1D] ring-2 ring-[#FF6262]';
            } else {
              btnStyle = 'bg-gray-50 border-gray-200 text-gray-400 opacity-60';
            }
          }

          return (
            <div
              key={w.id}
              onClick={() => onSelectOption(w)}
              className={`p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all btn-3d ${btnStyle}`}
            >
              <div>
                <span className="text-xl font-black block tracking-wide">{w.word}</span>
                {isSubmitted && (
                  <span className="text-xs font-semibold text-[#665D4D] block mt-1">
                    {w.pronunciationNoteRu}
                  </span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakSpanish(w.word, { dialect });
                }}
                className="w-9 h-9 rounded-full bg-[#FFF2D6] hover:bg-[#FFE5B0] flex items-center justify-center shrink-0"
              >
                <Volume2 className="w-5 h-5 text-[#FF8A00]" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ================= MINI-GAME 6: El tesoro de las palabras =================
const WordTreasureGame: React.FC<{
  exercise: WordTreasureExercise;
  dialect: 'es-ES' | 'es-419';
  isSubmitted: boolean;
  selectedOptionId: string | null;
  onSelectOption: (opt: WordTreasureExercise['options'][0]) => void;
}> = ({ exercise, dialect, isSubmitted, selectedOptionId, onSelectOption }) => {
  return (
    <div className="flex flex-col items-center">
      {/* Animated Treasure Chest */}
      <div className="mb-6 relative">
        <div className="text-6xl animate-bounce [animation-duration:2s]">
          {isSubmitted ? '✨💎 🎁' : '🧰'}
        </div>
        <div className="flex items-center gap-1 justify-center mt-2 text-xs font-black text-[#D46B00] bg-[#FFF2D6] px-3 py-1 rounded-full">
          <Coins className="w-3.5 h-3.5" />
          <span>Награда: +{exercise.chestRewardCoins} монет</span>
        </div>
      </div>

      <div className="text-center mb-6 max-w-lg">
        <p className="text-base sm:text-lg font-bold text-[#2D2A26]">
          {exercise.riddleRu}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 w-full max-w-lg">
        {exercise.options.map((opt) => {
          let btnStyle = 'bg-white border-[#E8DFC8] text-[#2D2A26] hover:border-[#FFD447]';

          if (isSubmitted) {
            if (opt.isCorrect) {
              btnStyle = 'bg-[#E7F9F5] border-[#2BC4B0] text-[#0E685D] ring-2 ring-[#2BC4B0]';
            } else if (selectedOptionId === opt.id) {
              btnStyle = 'bg-[#FFF0F0] border-[#FF6262] text-[#931D1D] ring-2 ring-[#FF6262]';
            } else {
              btnStyle = 'bg-gray-50 border-gray-200 text-gray-400 opacity-60';
            }
          }

          return (
            <button
              key={opt.id}
              onClick={() => onSelectOption(opt)}
              disabled={isSubmitted}
              className={`p-4 rounded-2xl border-2 font-bold text-left flex items-center justify-between btn-3d ${btnStyle}`}
            >
              <span>{opt.text}</span>
              {isSubmitted && opt.isCorrect && <span className="text-lg">💎</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ================= MINI-GAME 7: Repite conmigo =================
const RepeatMeGame: React.FC<{
  exercise: RepeatMeExercise;
  dialect: 'es-ES' | 'es-419';
  isSubmitted: boolean;
  onSubmit: (isCorrect: boolean) => void;
}> = ({ exercise, dialect, isSubmitted, onSubmit }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognitionText, setRecognitionText] = useState<string | null>(null);
  const [hasMicSupport] = useState(() => isSpeechRecognitionSupported());

  const handlePlayWord = () => {
    speakSpanish(exercise.spanishWord, { dialect });
  };

  const handleStartListening = async () => {
    if (!hasMicSupport) {
      // Direct self-verification fallback
      onSubmit(true);
      return;
    }

    setIsListening(true);
    setRecognitionText('Слушаю вас... Говорите в микрофон!');
    try {
      const res = await listenForSpanishWord(exercise.spanishWord);
      setIsListening(false);
      setRecognitionText(res.transcript ? `Вы сказали: «${res.transcript}»` : 'Звук не распознан, но мы засчитали попытку!');
      onSubmit(res.isMatch || res.similarity >= 0.5);
    } catch {
      setIsListening(false);
      setRecognitionText('Микрофон недоступен, вы можете повторить слово самостоятельно!');
      onSubmit(true);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Target Spanish Word Card */}
      <div className="w-full max-w-md bg-[#FFF8E9] border-2 border-[#FFD447] rounded-3xl p-6 text-center mb-6 shadow-sm">
        <h3 className="text-3xl sm:text-4xl font-black text-[#FF8A00] tracking-wide mb-1">
          {exercise.spanishWord}
        </h3>
        <p className="text-sm font-semibold text-[#665D4D] mb-3">
          {exercise.russianTranslation}
        </p>

        <div className="inline-block bg-white px-3 py-1.5 rounded-xl border border-[#E5DAC0] mb-2 font-mono text-sm text-[#7755D9] font-bold">
          {exercise.phoneticTranscription}
        </div>

        <p className="text-xs text-[#8A7A64] font-medium leading-relaxed">
          {exercise.russianPhoneticGuide}
        </p>

        {/* Listen native speaker button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handlePlayWord}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm btn-3d btn-3d-yellow"
          >
            <Volume2 className="w-4 h-4" />
            <span>Послушать образец</span>
          </button>
        </div>
      </div>

      {/* Phonetic advice tip */}
      <div className="bg-[#E7F9F5] border border-[#2BC4B0] text-[#0E685D] rounded-xl px-4 py-2.5 mb-6 text-xs sm:text-sm text-center max-w-md">
        💡 <span className="font-semibold">{exercise.tipRu}</span>
      </div>

      {/* Microphone or Self-Verification action */}
      {!isSubmitted ? (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleStartListening}
            disabled={isListening}
            className={`px-7 py-3.5 rounded-2xl font-black text-base flex items-center gap-2.5 btn-3d ${
              isListening ? 'bg-[#FF6262] text-white animate-pulse' : 'btn-3d-orange'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span>{isListening ? 'Говорите сейчас...' : 'Повторить в микрофон'}</span>
          </button>

          <button
            onClick={() => {
              playTapSound();
              onSubmit(true);
            }}
            className="px-6 py-3.5 rounded-2xl font-bold text-sm btn-3d btn-3d-neutral flex items-center gap-2 border border-[#DCD3C0]"
          >
            <Smile className="w-4 h-4 text-[#FF8A00]" />
            <span>Я повторил вслух!</span>
          </button>
        </div>
      ) : (
        recognitionText && (
          <p className="text-sm font-semibold text-[#544837] bg-white px-4 py-2 rounded-xl border border-gray-200">
            {recognitionText}
          </p>
        )
      )}
    </div>
  );
};

// ================= MINI-GAME 8: El desafío rápido =================
const SpeedChallengeGame: React.FC<{
  exercise: SpeedChallengeExercise;
  dialect: 'es-ES' | 'es-419';
  onComplete: (score: number, max: number) => void;
}> = ({ exercise, dialect, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQ = exercise.fastQuestions[currentIndex];

  const handlePick = (idx: number) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedIdx(idx);

    const isRight = idx === currentQ.correctIndex;
    if (isRight) {
      playSuccessSound();
      setScore(prev => prev + 1);
    } else {
      playErrorSound();
    }

    setTimeout(() => {
      if (currentIndex + 1 < exercise.fastQuestions.length) {
        setCurrentIndex(prev => prev + 1);
        setIsAnswered(false);
        setSelectedIdx(null);
      } else {
        onComplete(score + (isRight ? 1 : 0), exercise.fastQuestions.length);
      }
    }, 1100);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Progress & Speed Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <span className="text-xs font-black uppercase text-[#FF8A00] tracking-wider">
          Вопрос {currentIndex + 1} из {exercise.fastQuestions.length}
        </span>
        <span className="text-xs font-bold text-[#2BC4B0]">
          Счёт: {score} 🎯
        </span>
      </div>

      <div className="w-full bg-[#FFF2D6] h-2 rounded-full mb-6 overflow-hidden">
        <div 
          className="bg-[#FF8A00] h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / exercise.fastQuestions.length) * 100}%` }}
        />
      </div>

      <h3 className="text-lg font-black text-center text-[#2D2A26] mb-4">
        {currentQ.prompt}
      </h3>

      {currentQ.audioWord && (
        <button
          onClick={() => speakSpanish(currentQ.audioWord!, { dialect })}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs mb-6 btn-3d btn-3d-yellow"
        >
          <Volume2 className="w-4 h-4" />
          <span>Слушать: «{currentQ.audioWord}»</span>
        </button>
      )}

      <div className="grid grid-cols-1 gap-3 w-full max-w-md">
        {currentQ.options.map((opt, idx) => {
          let btnStyle = 'bg-white border-[#E8DFC8] text-[#2D2A26] hover:border-[#FF8A00]';

          if (isAnswered) {
            if (idx === currentQ.correctIndex) {
              btnStyle = 'bg-[#E7F9F5] border-[#2BC4B0] text-[#0E685D]';
            } else if (selectedIdx === idx) {
              btnStyle = 'bg-[#FFF0F0] border-[#FF6262] text-[#931D1D]';
            } else {
              btnStyle = 'opacity-50 border-gray-200';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handlePick(idx)}
              disabled={isAnswered}
              className={`p-3.5 rounded-2xl border-2 font-bold text-left btn-3d ${btnStyle}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

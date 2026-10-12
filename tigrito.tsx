import React from 'react';
import { TigritoEmotion } from './types';
import { Volume2 } from 'lucide-react';
import { speakSpanish } from './speech';

interface TigritoProps {
  emotion?: TigritoEmotion;
  accessory?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  speechBubbleRu?: string;
  speechBubbleEs?: string;
  isAudioPlaying?: boolean;
  onTigritoClick?: () => void;
  className?: string;
  interactive?: boolean;
}

export const Tigrito: React.FC<TigritoProps> = ({
  emotion = 'happy',
  accessory = 'none',
  size = 'md',
  speechBubbleRu,
  speechBubbleEs,
  isAudioPlaying = false,
  onTigritoClick,
  className = '',
  interactive = true,
}) => {
  const sizeMap = {
    sm: { width: 72, height: 72, container: 'w-[72px] h-[72px]' },
    md: { width: 140, height: 140, container: 'w-[140px] h-[140px]' },
    lg: { width: 220, height: 220, container: 'w-[220px] h-[220px]' },
    xl: { width: 290, height: 290, container: 'w-[290px] h-[290px]' },
  };

  const { width, height, container } = sizeMap[size];

  // Animation CSS class based on emotion
  const getMotionClass = () => {
    switch (emotion) {
      case 'happy':
        return 'animate-bounce [animation-duration:1.4s]';
      case 'dance':
        return 'animate-[bounce_0.6s_infinite] rotate-1';
      case 'thinking':
        return 'rotate-[-3deg] transition-transform duration-500';
      case 'surprise':
        return 'scale-105 transition-transform duration-300';
      case 'clap':
        return 'animate-[pulse_0.7s_infinite]';
      case 'sleep':
        return 'opacity-90';
      case 'cheer':
        return 'animate-bounce [animation-duration:0.8s] scale-105';
      default:
        return 'animate-float';
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Speech bubble */}
      {(speechBubbleRu || speechBubbleEs) && (
        <div 
          onClick={() => {
            if (speechBubbleEs) {
              speakSpanish(speechBubbleEs);
            }
          }}
          className={`mb-2 relative bg-white/95 backdrop-blur-sm border-2 border-[#FFD447] text-[#2D2A26] rounded-2xl px-4 py-2.5 shadow-md max-w-xs text-center cursor-pointer hover:border-[#FF8A00] transition-all transform hover:-translate-y-0.5 group`}
        >
          {speechBubbleEs && (
            <div className="flex items-center justify-center gap-1.5 font-bold text-[#FF8A00] text-sm md:text-base">
              <span>{speechBubbleEs}</span>
              <Volume2 className="w-4 h-4 text-[#FF8A00] group-hover:scale-110 transition-transform" />
            </div>
          )}
          {speechBubbleRu && (
            <div className="text-xs md:text-sm text-[#5C5549] mt-0.5 font-medium leading-tight">
              {speechBubbleRu}
            </div>
          )}
          {/* Bubble tail pointing to Tigrito */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-[#FFD447]" />
        </div>
      )}

      {/* Sleep Zzz particles */}
      {emotion === 'sleep' && (
        <div className="absolute -top-4 right-2 text-[#7755D9] font-black text-lg animate-pulse tracking-widest select-none pointer-events-none">
          z Z Z
        </div>
      )}

      {/* Musical notes for dance */}
      {emotion === 'dance' && (
        <div className="absolute -top-3 left-2 text-[#FF6262] font-black text-xl animate-bounce select-none pointer-events-none">
          🎵 ✨
        </div>
      )}

      {/* Sparkles for cheer or clap */}
      {(emotion === 'cheer' || emotion === 'clap') && (
        <div className="absolute -top-3 right-0 text-[#FF8A00] font-black text-lg animate-pulse select-none pointer-events-none">
          ⭐ ✨
        </div>
      )}

      {/* Main Tigrito SVG Character */}
      <div 
        onClick={onTigritoClick}
        className={`${container} ${getMotionClass()} transition-all relative ${interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}
        title="Тигрёнок Тигри"
      >
        <svg
          viewBox="0 0 200 200"
          width={width}
          height={height}
          className="w-full h-full drop-shadow-lg overflow-visible"
        >
          <defs>
            {/* Fur gradient */}
            <radialGradient id="furGrad" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFA633" />
              <stop offset="60%" stopColor="#FF8A00" />
              <stop offset="100%" stopColor="#E06D00" />
            </radialGradient>

            {/* Muzzle gradient */}
            <radialGradient id="muzzleGrad" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FFF2D6" />
            </radialGradient>

            {/* Cheek blush */}
            <radialGradient id="blushGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF7A8A" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FF7A8A" stopOpacity="0" />
            </radialGradient>

            {/* Inner ear */}
            <radialGradient id="earGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFAAB8" />
              <stop offset="100%" stopColor="#F57689" />
            </radialGradient>

            {/* Shiny eye highlight */}
            <radialGradient id="eyeGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#4A3422" />
              <stop offset="80%" stopColor="#22150C" />
              <stop offset="100%" stopColor="#0F0905" />
            </radialGradient>

            {/* Soft ground shadow */}
            <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ground shadow */}
          <ellipse cx="100" cy="188" rx="55" ry="10" fill="url(#shadowGrad)" />

          {/* Tail */}
          <g className="origin-[50px_160px] animate-[pulse_2s_infinite]">
            <path
              d="M 55 155 C 20 160, 10 130, 25 105 C 32 94, 45 98, 40 110 C 28 126, 35 142, 58 143 Z"
              fill="url(#furGrad)"
            />
            {/* Tail stripes */}
            <path d="M 22 125 Q 32 120 28 135" stroke="#4A2500" strokeWidth="4" strokeLinecap="round" />
            <path d="M 23 112 Q 35 110 32 118" stroke="#4A2500" strokeWidth="4" strokeLinecap="round" />
            <circle cx="28" cy="103" r="7" fill="#FFF2D6" />
          </g>

          {/* Body */}
          <ellipse cx="100" cy="150" rx="46" ry="38" fill="url(#furGrad)" />
          {/* Tummy patch */}
          <ellipse cx="100" cy="153" rx="28" ry="24" fill="url(#muzzleGrad)" />
          {/* Belly button */}
          <circle cx="100" cy="160" r="2.5" fill="#E8B07D" />

          {/* Left Ear */}
          <g>
            <path
              d="M 52 50 C 40 18, 70 20, 80 44 Z"
              fill="url(#furGrad)"
            />
            <path
              d="M 57 48 C 50 30, 68 30, 74 46 Z"
              fill="url(#earGrad)"
            />
          </g>

          {/* Right Ear */}
          <g>
            <path
              d="M 148 50 C 160 18, 130 20, 120 44 Z"
              fill="url(#furGrad)"
            />
            <path
              d="M 143 48 C 150 30, 132 30, 126 46 Z"
              fill="url(#earGrad)"
            />
          </g>

          {/* Head */}
          <ellipse cx="100" cy="85" rx="56" ry="50" fill="url(#furGrad)" />

          {/* Head tiger stripes */}
          {/* Top center stripes */}
          <path d="M 100 42 L 100 56" stroke="#4A2500" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M 88 47 L 93 58" stroke="#4A2500" strokeWidth="4" strokeLinecap="round" />
          <path d="M 112 47 L 107 58" stroke="#4A2500" strokeWidth="4" strokeLinecap="round" />

          {/* Cheek stripes left */}
          <path d="M 49 80 Q 64 83 67 85" stroke="#4A2500" strokeWidth="4" strokeLinecap="round" />
          <path d="M 48 93 Q 62 94 65 97" stroke="#4A2500" strokeWidth="4" strokeLinecap="round" />

          {/* Cheek stripes right */}
          <path d="M 151 80 Q 136 83 133 85" stroke="#4A2500" strokeWidth="4" strokeLinecap="round" />
          <path d="M 152 93 Q 138 94 135 97" stroke="#4A2500" strokeWidth="4" strokeLinecap="round" />

          {/* Cheeks Blush */}
          <circle cx="68" cy="98" r="14" fill="url(#blushGrad)" />
          <circle cx="132" cy="98" r="14" fill="url(#blushGrad)" />

          {/* Muzzle (Cream area) */}
          <ellipse cx="100" cy="103" rx="34" ry="24" fill="url(#muzzleGrad)" />

          {/* Cute Nose */}
          <polygon
            points="94,92 106,92 100,99"
            fill="#FF5E7E"
          />

          {/* Mouth line */}
          <path d="M 100 99 L 100 106" stroke="#542800" strokeWidth="2.5" strokeLinecap="round" />

          {/* Mouth expression based on emotion */}
          {emotion === 'surprise' ? (
            <ellipse cx="100" cy="113" rx="8" ry="10" fill="#6B1E00" />
          ) : emotion === 'sleep' ? (
            <path d="M 94 108 Q 100 110 106 108" stroke="#542800" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : emotion === 'thinking' ? (
            <path d="M 94 109 Q 103 106 109 110" stroke="#542800" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : (
            // Joyful open smile with cute pink tongue
            <g>
              <path
                d="M 88 106 Q 100 120 112 106 Z"
                fill="#8C2100"
              />
              <path
                d="M 93 113 Q 100 119 107 113 Q 100 123 93 113 Z"
                fill="#FF7597"
              />
            </g>
          )}

          {/* Whiskers */}
          <g stroke="#9C7753" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
            <line x1="58" y1="104" x2="40" y2="101" />
            <line x1="59" y1="110" x2="42" y2="114" />
            <line x1="142" y1="104" x2="160" y2="101" />
            <line x1="141" y1="110" x2="158" y2="114" />
          </g>

          {/* Eyes */}
          {emotion === 'sleep' ? (
            // Closed happy sleeping eyes
            <g stroke="#4A2500" strokeWidth="3.5" strokeLinecap="round" fill="none">
              <path d="M 72 82 Q 80 88 88 82" />
              <path d="M 112 82 Q 120 88 128 82" />
            </g>
          ) : emotion === 'happy' || emotion === 'cheer' || emotion === 'clap' ? (
            // Big shiny cartoon anime eyes
            <g>
              <ellipse cx="80" cy="80" rx="10" ry="12" fill="url(#eyeGrad)" />
              <ellipse cx="120" cy="80" rx="10" ry="12" fill="url(#eyeGrad)" />
              {/* Eye shine highlights */}
              <circle cx="77" cy="76" r="4.5" fill="#FFFFFF" />
              <circle cx="84" cy="84" r="2" fill="#FFFFFF" />
              <circle cx="117" cy="76" r="4.5" fill="#FFFFFF" />
              <circle cx="124" cy="84" r="2" fill="#FFFFFF" />
            </g>
          ) : (
            // Inquisitive / normal eyes
            <g>
              <circle cx="80" cy="80" r="10" fill="url(#eyeGrad)" />
              <circle cx="120" cy="80" r="10" fill="url(#eyeGrad)" />
              <circle cx="77" cy="77" r="3.5" fill="#FFFFFF" />
              <circle cx="117" cy="77" r="3.5" fill="#FFFFFF" />
            </g>
          )}

          {/* Eyebrows */}
          {emotion === 'thinking' ? (
            <g stroke="#4A2500" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M 72 66 Q 80 62 88 68" />
              <path d="M 112 68 Q 120 62 128 64" />
            </g>
          ) : emotion === 'surprise' ? (
            <g stroke="#4A2500" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M 72 63 Q 80 57 88 63" />
              <path d="M 112 63 Q 120 57 128 63" />
            </g>
          ) : (
            <g stroke="#4A2500" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <path d="M 74 67 Q 81 64 88 67" />
              <path d="M 112 67 Q 119 64 126 67" />
            </g>
          )}

          {/* Paws */}
          {emotion === 'cheer' ? (
            // Raised paws celebrating
            <g>
              <ellipse cx="50" cy="115" rx="12" ry="16" fill="url(#furGrad)" transform="rotate(-30 50 115)" />
              <ellipse cx="150" cy="115" rx="12" ry="16" fill="url(#furGrad)" transform="rotate(30 150 115)" />
              <circle cx="48" cy="110" r="4.5" fill="#FFF2D6" />
              <circle cx="152" cy="110" r="4.5" fill="#FFF2D6" />
            </g>
          ) : emotion === 'clap' ? (
            // Paws clapping in center
            <g className="animate-[pulse_0.4s_infinite]">
              <ellipse cx="88" cy="142" rx="14" ry="12" fill="url(#furGrad)" />
              <ellipse cx="112" cy="142" rx="14" ry="12" fill="url(#furGrad)" />
              {/* Pink paw pads */}
              <circle cx="91" cy="141" r="5" fill="#FF8CA3" />
              <circle cx="109" cy="141" r="5" fill="#FF8CA3" />
            </g>
          ) : emotion === 'thinking' ? (
            // One paw on chin
            <g>
              <ellipse cx="70" cy="155" rx="12" ry="15" fill="url(#furGrad)" />
              <ellipse cx="120" cy="120" rx="14" ry="12" fill="url(#furGrad)" />
              <circle cx="119" cy="119" r="4.5" fill="#FF8CA3" />
            </g>
          ) : (
            // Friendly resting / waving paws
            <g>
              <ellipse cx="64" cy="154" rx="13" ry="15" fill="url(#furGrad)" />
              <ellipse cx="136" cy="154" rx="13" ry="15" fill="url(#furGrad)" />
              {/* Cute paw pads */}
              <circle cx="64" cy="154" r="5" fill="#FF8CA3" />
              <circle cx="60" cy="149" r="2" fill="#FF8CA3" />
              <circle cx="64" cy="147" r="2" fill="#FF8CA3" />
              <circle cx="68" cy="149" r="2" fill="#FF8CA3" />

              <circle cx="136" cy="154" r="5" fill="#FF8CA3" />
              <circle cx="132" cy="149" r="2" fill="#FF8CA3" />
              <circle cx="136" cy="147" r="2" fill="#FF8CA3" />
              <circle cx="140" cy="149" r="2" fill="#FF8CA3" />
            </g>
          )}

          {/* Feet */}
          <ellipse cx="75" cy="182" rx="16" ry="10" fill="url(#furGrad)" />
          <ellipse cx="125" cy="182" rx="16" ry="10" fill="url(#furGrad)" />
          <circle cx="75" cy="182" r="5" fill="#FF8CA3" />
          <circle cx="125" cy="182" r="5" fill="#FF8CA3" />

          {/* ACCESSORIES LAYER */}
          {accessory === 'sombrero' && (
            <g className="drop-shadow-md">
              {/* Wide festive brim */}
              <ellipse cx="100" cy="42" rx="68" ry="16" fill="#F4A261" stroke="#E76F51" strokeWidth="3" />
              {/* Mexican decorative zig-zag pattern */}
              <path d="M 45 42 Q 60 38 75 42 Q 90 38 105 42 Q 120 38 135 42 Q 150 38 155 42" stroke="#2A9D8F" strokeWidth="2.5" fill="none" />
              {/* Hat crown */}
              <path d="M 72 42 L 80 10 Q 100 6 120 10 L 128 42 Z" fill="#E76F51" />
              {/* Hat band */}
              <rect x="74" y="34" width="52" height="7" fill="#E9C46A" rx="2" />
              {/* Pom-poms */}
              <circle cx="48" cy="50" r="3" fill="#E76F51" />
              <circle cx="70" cy="52" r="3" fill="#2A9D8F" />
              <circle cx="100" cy="53" r="3.5" fill="#E9C46A" />
              <circle cx="130" cy="52" r="3" fill="#2A9D8F" />
              <circle cx="152" cy="50" r="3" fill="#E76F51" />
            </g>
          )}

          {accessory === 'glasses_cool' && (
            <g className="drop-shadow-sm">
              {/* Frame */}
              <rect x="62" y="70" width="34" height="20" rx="6" fill="#1A1A1A" stroke="#FFD447" strokeWidth="2" />
              <rect x="104" y="70" width="34" height="20" rx="6" fill="#1A1A1A" stroke="#FFD447" strokeWidth="2" />
              {/* Bridge */}
              <rect x="94" y="76" width="12" height="3" fill="#FFD447" rx="1.5" />
              {/* Glass reflections */}
              <path d="M 66 73 L 78 86" stroke="#46DCC8" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 108 73 L 120 86" stroke="#46DCC8" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {accessory === 'crown' && (
            <g className="drop-shadow-md">
              {/* Royal golden crown */}
              <path
                d="M 68 45 L 64 25 L 82 34 L 100 18 L 118 34 L 136 25 L 132 45 Z"
                fill="#FFD447"
                stroke="#DCA50E"
                strokeWidth="2.5"
              />
              {/* Crown gems */}
              <circle cx="64" cy="24" r="3.5" fill="#FF6262" />
              <circle cx="100" cy="17" r="4.5" fill="#46DCC8" />
              <circle cx="136" cy="24" r="3.5" fill="#7755D9" />
              {/* Base jewels */}
              <circle cx="85" cy="40" r="2.5" fill="#FF6262" />
              <circle cx="100" cy="40" r="3" fill="#46DCC8" />
              <circle cx="115" cy="40" r="2.5" fill="#7755D9" />
            </g>
          )}

          {accessory === 'scarf' && (
            <g className="drop-shadow-sm">
              {/* Cozy winter scarf */}
              <path
                d="M 66 122 C 75 118, 125 118, 134 122 C 140 128, 134 138, 100 138 C 66 138, 60 128, 66 122 Z"
                fill="#FF6262"
                stroke="#D93B3B"
                strokeWidth="2"
              />
              {/* Scarf knot and tail */}
              <path
                d="M 112 132 L 122 165 L 105 165 L 102 135 Z"
                fill="#FF6262"
                stroke="#D93B3B"
                strokeWidth="2"
              />
              {/* Scarf yellow stripes */}
              <rect x="78" y="123" width="8" height="12" fill="#FFD447" rx="1" />
              <rect x="96" y="125" width="8" height="12" fill="#FFD447" rx="1" />
              <rect x="114" y="123" width="8" height="12" fill="#FFD447" rx="1" />
              <rect x="106" y="146" width="15" height="5" fill="#FFD447" rx="1" />
            </g>
          )}

          {accessory === 'headphones' && (
            <g className="drop-shadow-md">
              {/* Headband */}
              <path
                d="M 46 80 C 44 26, 156 26, 154 80"
                stroke="#7755D9"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
              />
              {/* Ear pads */}
              <ellipse cx="46" cy="80" rx="8" ry="16" fill="#46DCC8" stroke="#7755D9" strokeWidth="2.5" />
              <ellipse cx="154" cy="80" rx="8" ry="16" fill="#46DCC8" stroke="#7755D9" strokeWidth="2.5" />
              <ellipse cx="46" cy="80" rx="4" ry="10" fill="#2BC4B0" />
              <ellipse cx="154" cy="80" rx="4" ry="10" fill="#2BC4B0" />
            </g>
          )}

          {accessory === 'flower' && (
            <g className="drop-shadow-sm">
              {/* Tropical flower */}
              <circle cx="138" cy="52" r="7" fill="#FF6262" />
              <circle cx="148" cy="46" r="7" fill="#FF6262" />
              <circle cx="154" cy="56" r="7" fill="#FF6262" />
              <circle cx="146" cy="65" r="7" fill="#FF6262" />
              <circle cx="136" cy="61" r="7" fill="#FF6262" />
              <circle cx="144" cy="56" r="5" fill="#FFD447" />
            </g>
          )}

          {accessory === 'detective' && (
            <g className="drop-shadow-md">
              {/* Detective houndstooth cap */}
              <path
                d="M 60 48 Q 100 24 140 48 L 148 54 Q 100 46 52 54 Z"
                fill="#8D6E63"
                stroke="#5D4037"
                strokeWidth="2"
              />
              <path
                d="M 68 46 Q 100 22 132 46 Z"
                fill="#A1887F"
              />
              {/* Visor */}
              <ellipse cx="100" cy="52" rx="45" ry="8" fill="#5D4037" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

import React from "react";
import { useTranslation } from "../../hooks/useTranslation";

const SIGN_TO_HOUSE: Record<string, number> = {
  'மேஷம்': 1,   'ரிஷபம்': 2,  'மிதுனம்': 3,  'கடகம்': 4,
  'சிம்மம்': 5, 'கன்னி': 6,   'துலாம்': 7,   'விருச்சிகம்': 8,
  'தனுசு': 9,   'மகரம்': 10,  'கும்பம்': 11, 'மீனம்': 12,
  Aries: 1, Taurus: 2, Gemini: 3, Cancer: 4,
  Leo: 5, Virgo: 6, Libra: 7, Scorpio: 8,
  Sagittarius: 9, Capricorn: 10, Aquarius: 11, Pisces: 12,
};

const PLANET_NAME_ALIAS: Record<string, string> = {
  'வியாழன்': 'குரு',
  'வெள்ளி':  'சுக்ரன்',
};

const SKIP_NAMES = new Set(['களத்திரஸ்தானம்', 'var']);

interface BadgeConfig {
  abbr: string;
  bg: string;
  fg: string;
}

const BADGE: Record<string, BadgeConfig> = {
  'சூரியன்':  { abbr: 'சூரி', bg: 'bg-[#FFF9C4]', fg: 'text-[#5D4037]' },
  'சந்திரன்': { abbr: 'சந்',  bg: 'bg-[#E0E0E0]', fg: 'text-[#37474F]' },
  'செவ்வாய்': { abbr: 'செவ்', bg: 'bg-[#FFCCBC]', fg: 'text-[#BF360C]' },
  'புதன்':    { abbr: 'புத',  bg: 'bg-[#C8E6C9]', fg: 'text-[#1B5E20]' },
  'குரு':     { abbr: 'குரு', bg: 'bg-[#FFE082]', fg: 'text-[#E65100]' },
  'சுக்ரன்':  { abbr: 'சு',   bg: 'bg-[#E1F5FE]', fg: 'text-[#01579B]' },
  'சனி':      { abbr: 'சனி',  bg: 'bg-[#283593]', fg: 'text-white' },
  'ராகு':     { abbr: 'ராகு', bg: 'bg-[#388E3C]', fg: 'text-white' },
  'கேது':     { abbr: 'கேது', bg: 'bg-[#757575]', fg: 'text-white' },
  'லக்னம்': { abbr: 'ல', bg: 'bg-[#7E57C2]', fg: 'text-white' },
  Sun:      { abbr: 'Su', bg: 'bg-[#FFF9C4]', fg: 'text-[#5D4037]' },
  Moon:     { abbr: 'Mo', bg: 'bg-[#E0E0E0]', fg: 'text-[#37474F]' },
  Mars:     { abbr: 'Ma', bg: 'bg-[#FFCCBC]', fg: 'text-[#BF360C]' },
  Mercury:  { abbr: 'Me', bg: 'bg-[#C8E6C9]', fg: 'text-[#1B5E20]' },
  Jupiter:  { abbr: 'Ju', bg: 'bg-[#FFE082]', fg: 'text-[#E65100]' },
  Venus:    { abbr: 'Ve', bg: 'bg-[#E1F5FE]', fg: 'text-[#01579B]' },
  Saturn:   { abbr: 'Sa', bg: 'bg-[#283593]', fg: 'text-white' },
  Rahu:     { abbr: 'Ra', bg: 'bg-[#388E3C]', fg: 'text-white' },
  Ketu:     { abbr: 'Ke', bg: 'bg-[#757575]', fg: 'text-white' },
  Ascendant:{ abbr: 'As', bg: 'bg-[#7E57C2]', fg: 'text-white' },
};

function buildBySign(planetsRaw: any) {
  const arr = Array.isArray(planetsRaw)
    ? planetsRaw
    : Object.values(planetsRaw || {}).filter(
        (p: any) => p && typeof p === 'object' && (p.full_name || p.name),
      );

  const bySign: Record<number, string[]> = {};
  arr.forEach((p: any) => {
    const signKey = (p.sign || p.zodiac || '').trim();
    const house = SIGN_TO_HOUSE[signKey];
    if (!house) return;
    const rawName = p.full_name || p.name || '';
    if (SKIP_NAMES.has(rawName) || rawName.toLowerCase() === 'var') return;
    const name = PLANET_NAME_ALIAS[rawName] || rawName;
    bySign[house] = bySign[house] || [];
    bySign[house].push(name);
  });
  return bySign;
}

const SIGN_NAMES_TA: Record<number, string> = {
  1: 'மேஷம்',   2: 'ரிஷபம்',     3: 'மிதுனம்',
  4: 'கடகம்',   5: 'சிம்மம்',    6: 'கன்னி',
  7: 'துலாம்',  8: 'விருச்சிகம்', 9: 'தனுசு',
  10: 'மகரம்', 11: 'கும்பம்',    12: 'மீனம்',
};

const SIGN_NAMES_EN: Record<number, string> = {
  1: 'Aries',  2: 'Taurus',  3: 'Gemini',
  4: 'Cancer', 5: 'Leo',     6: 'Virgo',
  7: 'Libra',  8: 'Scorpio', 9: 'Sagittarius',
  10: 'Capricorn', 11: 'Aquarius', 12: 'Pisces',
};

function PlanetBadge({ name }: { name: string }) {
	console.log('in PlanetBadge', name)
  const s = BADGE[name] || { abbr: name.slice(0, 2), bg: 'bg-gray-700', fg: 'text-white' };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider shadow-sm uppercase ${s.bg} ${s.fg}`}>
      {s.abbr}
    </span>
  );
}

interface HouseCellProps {
  house: number;
  bySign: Record<number, string[]>;
  language: "ta" | "en";
  isLight: boolean;
}

function HouseCell({ house, bySign, language, isLight }: HouseCellProps) {
  const planets = bySign[house] || [];
  const signName = (language === 'en' ? SIGN_NAMES_EN : SIGN_NAMES_TA)[house] || '';
  
  return (
    <div className={`aspect-square border p-1.5 flex flex-col items-center justify-between transition-all duration-300 ${
      isLight 
        ? "bg-[#FCFBF7] border-[#E8DCC4]" 
        : "bg-[#0c0c16]/80 border-gray-700/50"
    }`}>
      <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider ${isLight ? "text-[#1E120A]/70" : "text-amber-500/80"}`}>
        {signName}
      </span>
      <div className="flex flex-wrap gap-1 items-center justify-center py-1">
        {planets.map((name, i) => (
          <PlanetBadge key={i} name={name} />
        ))}
      </div>
      <span className="text-[8px] font-mono opacity-25">{house}</span>
    </div>
  );
}

interface GocharamKattamProps {
  planets: any;
  date: string;
  time: string;
  isLight?: boolean;
}

export default function GocharamKattam({ planets, date, time, isLight = false }: GocharamKattamProps) {
  const { t, language } = useTranslation();
  const bySign = buildBySign(planets);

  // Traditional South Indian 4x4 Grid representation with a merged 2x2 Center.
  // Row 1: 12, 1, 2, 3
  // Row 2: 11, [CENTER], 4
  // Row 3: 10, [CENTER], 5
  // Row 4: 9, 8, 7, 6

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="w-full max-w-[420px] aspect-square relative grid grid-cols-4 grid-rows-4 border border-gray-700/40 rounded-2xl overflow-hidden shadow-2xl">
        {/* Row 1 */}
        <HouseCell house={12} bySign={bySign} language={language} isLight={isLight} />
        <HouseCell house={1} bySign={bySign} language={language} isLight={isLight} />
        <HouseCell house={2} bySign={bySign} language={language} isLight={isLight} />
        <HouseCell house={3} bySign={bySign} language={language} isLight={isLight} />

        {/* Row 2 */}
        <HouseCell house={11} bySign={bySign} language={language} isLight={isLight} />
        {/* Merged 2x2 Center overlay */}
        <div className={`col-span-2 row-span-2 flex flex-col items-center justify-center p-4 border text-center transition-all ${
          isLight 
            ? "bg-[#FAF8F2] border-[#E8DCC4]" 
            : "bg-[#111122] border-gray-700/50"
        }`}>
          <h4 className="text-xs md:text-sm font-serif font-black text-amber-500 uppercase tracking-widest leading-tight">
            {t('gocharam.title')}
          </h4>
          <span className="text-[9px] md:text-xs font-mono font-bold text-gray-400 mt-1.5 block">
            {date} {time}
          </span>
        </div>
        <HouseCell house={4} bySign={bySign} language={language} isLight={isLight} />

        {/* Row 3 */}
        <HouseCell house={10} bySign={bySign} language={language} isLight={isLight} />
        <HouseCell house={5} bySign={bySign} language={language} isLight={isLight} />

        {/* Row 4 */}
        <HouseCell house={9} bySign={bySign} language={language} isLight={isLight} />
        <HouseCell house={8} bySign={bySign} language={language} isLight={isLight} />
        <HouseCell house={7} bySign={bySign} language={language} isLight={isLight} />
        <HouseCell house={6} bySign={bySign} language={language} isLight={isLight} />
      </div>
    </div>
  );
}

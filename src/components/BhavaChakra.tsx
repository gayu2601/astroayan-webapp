import React from 'react';
import {
  SOUTH_INDIAN_LAYOUT,
  RASI_BADGE,
  PLANET_ABBR_TA,
  PLANET_ABBR_EN,
} from './HoroscopeOutputScreen';
import { getBhavaByHouse } from '../../utils/bhavaMath';

interface Planet {
  name: string;
  sign?: string;
  fullDegree: number | string;
}

interface BhavaChakraProps {
  planets: Planet[];
  cusps: number[]; // 12 Bhava Madhya longitudes (sidereal/Lahiri), from the API
  isLight: boolean;
  isTamil: boolean;
}

export default function BhavaChakra({ planets, cusps, isLight, isTamil }: BhavaChakraProps) {
  const bhavaByHouse = React.useMemo(
    () => getBhavaByHouse(planets, cusps),
    [planets, cusps]
  );

  const abbr = isTamil ? PLANET_ABBR_TA : PLANET_ABBR_EN;

  const renderCell = (houseNum: number | null) => {
    if (houseNum === null) return null;
    const items = bhavaByHouse[houseNum] || [];
    return (
      <div
        className={`border p-1 flex flex-col justify-between items-center text-center h-full min-h-[65px] transition-all ${
          isLight
            ? 'border-teal-500/20 bg-white/90 hover:bg-teal-100/40'
            : 'border-teal-500/20 bg-slate-950/80 hover:bg-teal-950/10'
        }`}
      >
        <span
          className={`text-[9px] font-bold leading-none self-end ${
            isLight ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {houseNum}
        </span>
        <div className="flex flex-wrap gap-0.5 justify-center items-center mt-auto mb-auto max-w-full">
          {items.map((p, i) => {
            const s = RASI_BADGE[p.name] || { abbr: p.name.slice(0, 2), bg: '#444', fg: '#fff' };
            return (
              <span
                key={i}
                style={{ backgroundColor: s.bg, color: s.fg }}
                className="text-[9px] font-extrabold px-1 py-0.5 rounded leading-none whitespace-nowrap shadow-sm border border-black/10"
                title={`${p.name} ${p.degree}°`}
              >
                {abbr[p.name] || s.abbr}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  if (!cusps || cusps.length !== 12) {
    return (
      <div className={`text-xs italic p-3 text-center ${isLight ? 'text-[#7A695A]' : 'text-gray-500'}`}>
        {isTamil ? 'பாவக சக்கரம் தரவு கிடைக்கவில்லை' : 'Bhava Chakram cusp data unavailable'}
      </div>
    );
  }

  return (
    <div
      className={`p-4 space-y-4 rounded-xl border transition-all ${
        isLight
          ? 'bg-white/90 border-teal-600/20 shadow-md'
          : 'bg-slate-900/40 border-teal-500/20 backdrop-blur-md'
      }`}
    >
      <h2
        className={`text-xs font-semibold tracking-wider uppercase border-b pb-2 flex items-center gap-1.5 font-sans ${
          isLight ? 'text-teal-700 border-teal-600/20' : 'text-teal-400 border-teal-500/20'
        }`}
      >
        {isTamil ? 'பாவக சக்கரம்' : 'Bhava Chakram'}
      </h2>

      <div
        className={`grid grid-cols-4 grid-rows-4 border rounded-lg overflow-hidden aspect-square w-full max-w-[340px] mx-auto ${
          isLight ? 'border-teal-500/30 bg-teal-50/50 shadow-inner' : 'border-teal-500/30 bg-slate-950'
        }`}
      >
        {renderCell(12)}
        {renderCell(1)}
        {renderCell(2)}
        {renderCell(3)}

        {renderCell(11)}
        <div
          className={`col-span-2 row-span-2 border flex flex-col items-center justify-center text-center p-2 ${
            isLight
              ? 'border-teal-500/30 bg-gradient-to-br from-teal-100/70 to-emerald-100/50'
              : 'border-teal-500/20 bg-slate-950'
          }`}
        >
          <p className={`font-serif text-sm font-extrabold tracking-wide ${isLight ? 'text-teal-900' : 'text-teal-400'}`}>
            {isTamil ? 'பாவக சக்கரம்' : 'Bhava Chakram'}
          </p>
          <p className={`text-[10px] uppercase tracking-wider font-sans mt-1 ${isLight ? 'text-teal-800/80 font-bold' : 'text-teal-400'}`}>
            {isTamil ? 'ஸ்ரீபதி பத்ததி' : 'Sripati Paddhati'}
          </p>
        </div>
        {renderCell(4)}

        {renderCell(10)}
        {renderCell(5)}

        {renderCell(9)}
        {renderCell(8)}
        {renderCell(7)}
        {renderCell(6)}
      </div>
    </div>
  );
}
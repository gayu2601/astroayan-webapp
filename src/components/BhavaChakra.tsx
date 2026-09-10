import React from 'react';
import {
  SOUTH_INDIAN_LAYOUT,
  RASI_BADGE,
  PLANET_ABBR_TA,
  PLANET_ABBR_EN,
  RASI_SIGN_TO_HOUSE,
  getRasiSignNames,
} from './HoroscopeOutputScreen';
import { getBhavaByHouse, getBhavaBoundaries, degreeInRange } from '../../utils/bhavaMath';

interface Planet {
  name: string;
  full_name?: string;
  sign?: string;
  zodiac?: string;
  rasi_no?: number;
  fullDegree: number | string;
}

interface BhavaChakraProps {
  planets: Planet[];
  cusps: number[]; // 12 Bhava Madhya longitudes (sidereal/Lahiri), from the API
  isLight: boolean;
  isTamil: boolean;
  onCellClick?: (houseNum: number, signName: string, rawPlanets: any[]) => void;
}

// ─── Lagna-relative box alignment ──────────────────────────────────────────
// SOUTH_INDIAN_LAYOUT is a fixed-SIGN grid — the box that renders "1" always
// sits in the same physical position (top row, 2nd cell), matching Aries in
// the Rasi chart drawn right next to this one. A Bhava chart's house 1 must
// instead sit in whichever box actually holds the lagna's own sign, so we
// look up the ascendant's rasi_no and rotate every box's label by that
// offset before reading `bhavaByHouse`.
const ASCENDANT_ALIASES = ['Ascendant', 'லக்னம்', 'லக்'];

function getLagnaSignIndex(planets: Planet[]): number | null {
  const asc: any = planets.find(
    (p: any) =>
      ASCENDANT_ALIASES.includes((p.full_name || '').trim()) ||
      ASCENDANT_ALIASES.includes((p.name || '').trim())
  );
  if (!asc) return null;
  if (typeof asc.rasi_no === 'number') return asc.rasi_no;
  const signKey = ((asc.sign || asc.zodiac || '') as string).trim();
  return RASI_SIGN_TO_HOUSE[signKey] ?? null;
}

// Given a box's fixed sign (1 = Aries .. 12 = Pisces) and the lagna's sign,
// returns which house (1 = lagna's own house) that box represents.
const houseForBoxSign = (boxSignIndex: number, lagnaSignIndex: number): number =>
  ((boxSignIndex - lagnaSignIndex + 12) % 12) + 1;

export default function BhavaChakra({ planets, cusps, isLight, isTamil, onCellClick }: BhavaChakraProps) {
  const bhavaByHouse = React.useMemo(
    () => getBhavaByHouse(planets, cusps),
    [planets, cusps]
  );

  // Raw planet lookup keyed by bhava house number (for click detail)
  const rawByHouse = React.useMemo<Record<number, any[]>>(() => {
    if (!Array.isArray(planets) || !cusps || cusps.length !== 12) return {};
    const boundaries = getBhavaBoundaries(cusps);
    const map: Record<number, any[]> = {};
    planets.forEach((p: any) => {
      const deg = typeof p.fullDegree === 'number' ? p.fullDegree : parseFloat(p.fullDegree);
      if (isNaN(deg)) return;
      const idx = boundaries.findIndex((b: any) => degreeInRange(deg, b.start, b.end));
      if (idx === -1) return;
      const house = idx + 1;
      map[house] = map[house] || [];
      map[house].push(p);
    });
    return map;
  }, [planets, cusps]);

  const lagnaSignIndex = React.useMemo(() => getLagnaSignIndex(planets), [planets]);

  const abbr = isTamil ? PLANET_ABBR_TA : PLANET_ABBR_EN;

  const renderCell = (boxSignIndex: number | null) => {
    if (boxSignIndex === null) return null;
    const houseNum = lagnaSignIndex ? houseForBoxSign(boxSignIndex, lagnaSignIndex) : boxSignIndex;
    const items = bhavaByHouse[houseNum] || [];
    const rawPlanets = rawByHouse[houseNum] || [];
    const signName = lagnaSignIndex ? getRasiSignNames(isTamil)[boxSignIndex] || '' : '';
    const hasClickable = rawPlanets.length > 0;
    return (
      <div
        onClick={() => {
          if (hasClickable && onCellClick) {
            onCellClick(houseNum, signName, rawPlanets);
          }
        }}
        className={`border p-1 flex flex-col justify-between items-center text-center h-full min-h-[65px] transition-all ${
          hasClickable && onCellClick ? 'cursor-pointer' : ''
        } ${
          isLight
            ? 'border-teal-500/20 bg-white/90 hover:bg-teal-100/40'
            : 'border-teal-500/20 bg-slate-950/80 hover:bg-teal-950/10'
        }`}
      >
        <div className="w-full flex items-center justify-between">
          {signName && (
            <span
              className={`text-[10px] font-semibold leading-none ${
                isLight ? 'text-teal-700/70' : 'text-teal-400/60'
              }`}
            >
              {signName}
            </span>
          )}
          <span
            className={`text-[9px] font-bold leading-none ml-auto ${
              isLight ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {houseNum}
          </span>
        </div>
        <div className="flex flex-wrap gap-0.5 justify-center items-center mt-auto mb-auto max-w-full">
          {items.map((p, i) => {
            const s = RASI_BADGE[p.name] || { abbr: p.name.slice(0, 2), bg: '#444', fg: '#fff' };
            return (
              <span
                key={i}
                style={{ backgroundColor: s.bg, color: s.fg }}
                className="text-[10px] font-extrabold px-1 py-0.5 rounded leading-none whitespace-nowrap shadow-sm border border-black/10"
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
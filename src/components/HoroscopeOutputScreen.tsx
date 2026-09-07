import React from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../lib/AuthContext';
import { Sparkles, Calendar, Clock, MapPin, ChevronLeft, Award, HelpCircle } from 'lucide-react';
import { formatTo12Hour } from '../../utils/formatTime';
import BhavaChakra from './BhavaChakra';

const PLANET_GLYPHS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄',
  Rahu: '☊', Ketu: '☋', Ascendant: '↑',
};

const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const AVAK_ROWS = [
  { key: 'rashi',          label: 'Rashi'           },
  { key: 'lagna',          label: 'Lagna'           },
  { key: 'nakshatra',      label: 'Nakshatra'       },
  { key: 'nakshatra_pada',      label: 'Nakshatra Pada'       },
  { key: 'nakshatra_lord', label: 'Nakshatra Lord'  },
  { key: 'varna',          label: 'Varna'           },
  { key: 'vashya',         label: 'Vashya'          },
  { key: 'yoni',           label: 'Yoni'            },
  { key: 'gana',           label: 'Gana'            },
  { key: 'nadi',           label: 'Nadi'            },
  { key: 'karan',          label: 'Karan'           },
  { key: 'yoga',           label: 'Yoga'            },
  { key: 'tithi',          label: 'Tithi'           },
];

const AVAK_ROWS_TAMIL = [
  { key: 'rashi',          label: 'ராசி' },
  { key: 'lagna',          label: 'லக்னம்' },
  { key: 'nakshatra',      label: 'நட்சத்திரம்' },
  { key: 'nakshatra_pada', label: 'நட்சத்திர பாதம்' },
  { key: 'nakshatra_lord', label: 'நட்சத்திர அதிபதி' },
  { key: 'varna',          label: 'வர்ணம்' },
  { key: 'vashya',          label: 'வசியம்' },
  { key: 'yoni',           label: 'யோனி' },
  { key: 'gana',           label: 'கணம்' },
  { key: 'nadi',           label: 'நாடி' },
  { key: 'karan',          label: 'கரணம்' },
  { key: 'yoga',           label: 'யோகம்' },
  { key: 'tithi',           label: 'திதி' },
];

const COLOR_SWATCHES: Record<string, string> = {
  Red: '#e05555', Orange: '#e8873a', Yellow: '#f5dd80', Green: '#39e8a0',
  Blue: '#52d8f8', Indigo: '#7c3aed', Violet: '#d4a1ff', Pink: '#ff88be',
  White: '#f0eaff', Gold: '#e8c06a', Coral: '#ff8c55', Teal: '#00c9a0',
  Silver: '#b8b8d0', Brown: '#a0724a', Cream: '#fff3c4', Maroon: '#8b1a1a',
  Ivory: '#fffff0',
};

export const RASI_SIGN_TO_HOUSE: Record<string, number> = {
  Aries: 1, Taurus: 2, Gemini: 3, Cancer: 4,
  Leo: 5, Virgo: 6, Libra: 7, Scorpio: 8,
  Sagittarius: 9, Capricorn: 10, Aquarius: 11, Pisces: 12,
  'மேஷம்': 1, 'ரிஷபம்': 2, 'மிதுனம்': 3, 'கடகம்': 4,
  'சிம்மம்': 5, 'கன்னி': 6, 'துலாம்': 7, 'விருச்சிகம்': 8,
  'தனுசு': 9, 'மகரம்': 10, 'கும்பம்': 11, 'மீனம்': 12,
};

const RASI_SIGN_NAMES_TA: Record<number, string> = {
  1:  'மேஷம்',
  2:  'ரிஷபம்',
  3:  'மிதுனம்',
  4:  'கடகம்',
  5:  'சிம்மம்',
  6:  'கன்னி',
  7:  'துலாம்',
  8:  'விருச்சிகம்',
  9:  'தனுசு',
  10: 'மகரம்',
  11: 'கும்பம்',
  12: 'மீனம்',
};

const RASI_SIGN_NAMES_EN: Record<number, string> = {
  1:  'Aries',
  2:  'Taurus',
  3:  'Gemini',
  4:  'Cancer',
  5:  'Leo',
  6:  'Virgo',
  7:  'Libra',
  8:  'Scorpio',
  9:  'Sagittarius',
  10: 'Capricorn',
  11: 'Aquarius',
  12: 'Pisces',
};

export const getRasiSignNames = (isTamil: boolean): Record<number, string> =>
  isTamil ? RASI_SIGN_NAMES_TA : RASI_SIGN_NAMES_EN;

// ─── Shared "place planets on the fixed South-Indian grid" helper ─────────
// The API already returns `rasi_no` (the planet's absolute sign, 1-12) on
// every planet object, so there is no need to parse a `sign`/`zodiac` string
// through RASI_SIGN_TO_HOUSE to figure out which box it belongs in — that
// indirection was also fragile (it silently breaks if the field is called
// `zodiac` instead of `sign`, or if `name` isn't in the language the badge
// map expects). We bucket by `rasi_no` directly and resolve the badge from
// `full_name`, which the API always sends in English, so the abbreviation
// is correct regardless of what `name` happens to contain.
interface PlacedPlanet { abbr: string; bg: string; fg: string; fullName: string; retro: boolean }

function buildPlanetsByRasi(list: any[]): Record<number, PlacedPlanet[]> {
  const map: Record<number, PlacedPlanet[]> = {};
  if (!Array.isArray(list)) return map;
  list.forEach((p: any) => {
    // rasi_no is authoritative; fall back to a sign-string lookup only for
    // older payloads that don't send it yet.
    const rasiNo: number | undefined =
      p.rasi_no ?? RASI_SIGN_TO_HOUSE[((p.sign || p.zodiac || '') as string).trim()];
    if (!rasiNo) return;
	
	console.log('p', p)

    const fullName = p.full_name || p.name;
    const badge = RASI_BADGE[p.name] || RASI_BADGE[fullName] || {
      abbr: (fullName || p.name || '').slice(0, 2),
      bg: '#444',
      fg: '#fff',
    };

    map[rasiNo] = map[rasiNo] || [];
    map[rasiNo].push({
      abbr: badge.abbr,
      bg: badge.bg,
      fg: badge.fg,
      fullName,
      retro: !!(p.retro ?? p.is_retrograde),
    });
  });
  return map;
}

// ─── Dosha Nirnayam ─────────────────────────────────────────────────────────
// Each planet already carries `house` — its position counted from the
// lagna (1 = lagna's own house) — so the three rules below just read that
// field directly, no sign-math needed.

const DOSHA_PLANET_ALIASES: Record<'mars' | 'rahu' | 'ketu' | 'saturn' | 'moon', string[]> = {
  mars:   ['Mars', 'செவ்வாய்', 'செ'],
  rahu:   ['Rahu', 'ராகு', 'ரா'],
  ketu:   ['Ketu', 'கேது', 'கே'],
  saturn: ['Saturn', 'சனி'],
  moon:   ['Moon', 'சந்திரன்', 'சந்'],
};

function findPlanetHouse(planets: any[], aliases: string[]): number | null {
  const p = planets.find(
    (pl) => aliases.includes((pl?.full_name || '').trim()) || aliases.includes((pl?.name || '').trim())
  );
  return typeof p?.house === 'number' ? p.house : null;
}

export interface DoshaResults {
  chevvai: boolean;
  rahuKetu: boolean;
  punarppu: boolean;
}

// செவ்வாய் தோஷம்: லக்னத்தில் இருந்து 2, 4, 7, 8, 12ல் செவ்வாய் இருந்தால்
// ராகு/கேது தோஷம்: லக்னத்தில் இருந்து 1, 2, 5ல் ராகு அல்லது கேது இருந்தால்
// புணர்ப்பு தோஷம்: சனி-சந்திரன் ஒரே கட்டத்தில், அல்லது சனியில் இருந்து
//                    சந்திரன் 3, 7, 10ல் இருந்தால்
function computeDoshaResults(planets: any[] | undefined): DoshaResults | null {
  if (!Array.isArray(planets)) return null;

  const marsHouse   = findPlanetHouse(planets, DOSHA_PLANET_ALIASES.mars);
  const rahuHouse   = findPlanetHouse(planets, DOSHA_PLANET_ALIASES.rahu);
  const ketuHouse   = findPlanetHouse(planets, DOSHA_PLANET_ALIASES.ketu);
  const saturnHouse = findPlanetHouse(planets, DOSHA_PLANET_ALIASES.saturn);
  const moonHouse   = findPlanetHouse(planets, DOSHA_PLANET_ALIASES.moon);

  if ([marsHouse, rahuHouse, ketuHouse, saturnHouse, moonHouse].some((v) => v == null)) {
    return null;
  }

  const chevvai = [2, 4, 7, 8, 12].includes(marsHouse as number);
  const rahuKetu = [1, 2, 5].includes(rahuHouse as number) || [1, 2, 5].includes(ketuHouse as number);

  const sameKattam = saturnHouse === moonHouse;
  const posFromSaturn = (((moonHouse as number) - (saturnHouse as number) + 12) % 12) + 1;
  const punarppu = sameKattam || [3, 7, 10].includes(posFromSaturn);

  return { chevvai, rahuKetu, punarppu };
}

export const RASI_BADGE: Record<string, { abbr: string; bg: string; fg: string }> = {
  'சூரியன்':  { abbr: 'சூரி', bg: '#FFF176', fg: '#5D4037' },
  'சூ':     { abbr: 'சூரி', bg: '#FFF176', fg: '#5D4037' },

  'சந்திரன்': { abbr: 'சந்', bg: '#E0E0E0', fg: '#37474F' },
  'சந்':      { abbr: 'சந்', bg: '#E0E0E0', fg: '#37474F' },

  'செவ்வாய்': { abbr: 'செவ்', bg: '#FFCCBC', fg: '#BF360C' },
  'செ':     { abbr: 'செவ்', bg: '#FFCCBC', fg: '#BF360C' },

  'புதன்':    { abbr: 'புத', bg: '#C8E6C9', fg: '#1B5E20' },
  'பு':      { abbr: 'புத', bg: '#C8E6C9', fg: '#1B5E20' },

  'குரு':     { abbr: 'குரு', bg: '#FFF9C4', fg: '#F57F17' },
  'கு':     { abbr: 'குரு', bg: '#FFF9C4', fg: '#F57F17' },

  'சுக்கிரன்': { abbr: 'சுக்', bg: '#E1F5FE', fg: '#01579B' },
  'சுக்':      { abbr: 'சுக்', bg: '#E1F5FE', fg: '#01579B' },

  'சனி':      { abbr: 'சனி', bg: '#283593', fg: '#FFFFFF' },

  'ராகு':     { abbr: 'ராகு', bg: '#388E3C', fg: '#FFFFFF' },
  'ரா':     { abbr: 'ராகு', bg: '#388E3C', fg: '#FFFFFF' },

  'கேது':     { abbr: 'கேது', bg: '#757575', fg: '#FFFFFF' },
  'கே':     { abbr: 'கேது', bg: '#757575', fg: '#FFFFFF' },

  'லக்னம்':   { abbr: 'ல', bg: '#7E57C2', fg: '#FFFFFF' },
  'லக்':        { abbr: 'ல', bg: '#7E57C2', fg: '#FFFFFF' },

  'Sun':       { abbr: 'Su', bg: '#FFF176', fg: '#5D4037' },
  'Su':        { abbr: 'Su', bg: '#FFF176', fg: '#5D4037' },

  'Moon':      { abbr: 'Mo', bg: '#E0E0E0', fg: '#37474F' },
  'Mo':        { abbr: 'Mo', bg: '#E0E0E0', fg: '#37474F' },

  'Mars':      { abbr: 'Ma', bg: '#FFCCBC', fg: '#BF360C' },
  'Ma':        { abbr: 'Ma', bg: '#FFCCBC', fg: '#BF360C' },

  'Mercury':   { abbr: 'Me', bg: '#C8E6C9', fg: '#1B5E20' },
  'Me':        { abbr: 'Me', bg: '#C8E6C9', fg: '#1B5E20' },

  'Jupiter':   { abbr: 'Ju', bg: '#FFF9C4', fg: '#F57F17' },
  'Ju':        { abbr: 'Ju', bg: '#FFF9C4', fg: '#F57F17' },

  'Venus':     { abbr: 'Ve', bg: '#E1F5FE', fg: '#01579B' },
  'Ve':        { abbr: 'Ve', bg: '#E1F5FE', fg: '#01579B' },

  'Saturn':    { abbr: 'Sa', bg: '#283593', fg: '#FFFFFF' },
  'Sa':        { abbr: 'Sa', bg: '#283593', fg: '#FFFFFF' },

  'Rahu':      { abbr: 'Ra', bg: '#388E3C', fg: '#FFFFFF' },
  'Ra':        { abbr: 'Ra', bg: '#388E3C', fg: '#FFFFFF' },

  'Ketu':      { abbr: 'Ke', bg: '#757575', fg: '#FFFFFF' },
  'Ke':        { abbr: 'Ke', bg: '#757575', fg: '#FFFFFF' },

  'Ascendant': { abbr: 'As', bg: '#7E57C2', fg: '#FFFFFF' },
  'As':        { abbr: 'As', bg: '#7E57C2', fg: '#FFFFFF' },
};

// ─── Janana & Gochara Oppeedu ─────────────────────────────────────────────────

// South Indian chart layout — house numbers in each grid cell (row-major)
export const SOUTH_INDIAN_LAYOUT: (number | null)[] = [
  12, 1,  2,  3,
  11, null, null, 4,
  10, null, null, 5,
   9, 8,  7,  6,
];

// Planet color for degree text in Janana (birth) cells
const JANANA_PLANET_COLOR: Record<string, string> = {
  Sun:       '#D97706', // amber
  Moon:      '#6B7280', // gray
  Mars:      '#DC2626', // red
  Mercury:   '#16A34A', // green
  Jupiter:   '#CA8A04', // yellow-dark
  Venus:     '#2563EB', // blue
  Saturn:    '#1E3A8A', // dark blue
  Rahu:      '#065F46', // dark green
  Ketu:      '#4B5563', // dark gray
  Ascendant: '#7C3AED', // violet
};

// Planet color for Gochara (transit) cells
const GOCHARA_PLANET_COLOR: Record<string, string> = {
  Sun:       '#F59E0B',
  Moon:      '#9CA3AF',
  Mars:      '#F87171',
  Mercury:   '#34D399',
  Jupiter:   '#FCD34D',
  Venus:     '#60A5FA',
  Saturn:    '#818CF8',
  Rahu:      '#6EE7B7',
  Ketu:      '#D1D5DB',
  Ascendant: '#C4B5FD',
};

// Tamil planet abbreviations used in the reference image
export const PLANET_ABBR_TA: Record<string, string> = {
  // English keys
  Sun:       'சூரி',
  Moon:      'சந்',
  Mars:      'செவ்',
  Mercury:   'புத',
  Jupiter:   'குரு',
  Venus:     'சுக்',
  Saturn:    'சனி',
  Rahu:      'ராகு',
  Ketu:      'கேது',
  Ascendant: 'லக்',

  // Tamil keys
  சூரியன்:    'சூரி',
  சந்திரன்:   'சந்',
  செவ்வாய்:   'செவ்',
  புதன்:      'புத',
  குரு:       'குரு',
  வியாழன்:    'குரு',
  சுக்கிரன்:   'சுக்',
  சனி:        'சனி',
  ராகு:       'ராகு',
  கேது:       'கேது',
  லக்னம்:     'லக்',
};

export const PLANET_ABBR_EN: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me',
  Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa',
  Rahu: 'Ra', Ketu: 'Ke', Ascendant: 'As',
};

function JananaGocharaOppeedu({
  planets,
  gocharaPlanets,
  astroDetails,
  isLight,
  isTamil,
}: {
  planets: any[];
  gocharaPlanets: any[];
  astroDetails: any;
  isLight: boolean;
  isTamil: boolean;
}) {
  const [activeView, setActiveView] = React.useState<'both' | 'janana' | 'gochara'>('both');

	const jananaByRasi = React.useMemo<Record<number, { name: string; degree: string }[]>>(() => {
	  const map: Record<number, { name: string; degree: string }[]> = {};
	  if (!Array.isArray(planets)) return map;
	  planets.forEach((p: any) => {
		  const rasi = Math.floor(parseFloat(p.fullDegree) / 30) + 1;
		  const h = rasi;
		  if (!h || h < 1 || h > 12) return;
		  if (!map[h]) map[h] = [];
		  const deg = p.fullDegree ? parseFloat(p.fullDegree).toFixed(1) : '';
		  map[h].push({ name: p.name, degree: deg });
		});
	  return map;
	}, [planets]);

	// gocharaByHouse → gocharaByRasi
	const gocharaByRasi = React.useMemo<Record<number, { name: string; degree: string }[]>>(() => {
	  const map: Record<number, { name: string; degree: string }[]> = {};
	  if (!Array.isArray(gocharaPlanets)) return map;
	  gocharaPlanets.forEach((p: any) => {
		  const rasi = Math.floor(parseFloat(p.fullDegree) / 30) + 1;
		  const h = rasi;
		  if (!h || h < 1 || h > 12) return;
		  if (!map[h]) map[h] = [];
		  const deg = p.fullDegree ? parseFloat(p.fullDegree).toFixed(1) : '';
		  map[h].push({ name: p.name, degree: deg });
		});
	  return map;
	}, [gocharaPlanets]);

  const showJanana  = activeView === 'both' || activeView === 'janana';
  const showGochara = activeView === 'both' || activeView === 'gochara';

  const abbr = isTamil ? PLANET_ABBR_TA : PLANET_ABBR_EN;

  // A grouped sub-card for one planet set inside a house — carries its own
  // badge ("ஜ"/"கோ") and border language (solid amber vs dashed teal) so the
  // Janana/Gochara distinction reads at a glance, even in a screenshot.
  const renderGroup = (
    items: { name: string; degree: string }[],
    kind: 'janana' | 'gochara'
  ) => {
    if (!items.length) return null;
    const isJanana = kind === 'janana';
    const colorMap = isJanana ? JANANA_PLANET_COLOR : GOCHARA_PLANET_COLOR;

    return (
      <div
        className="rounded-md px-1.5 py-1 flex flex-col gap-0.5 relative"
        style={{
          background: isJanana
            ? isLight ? '#FFFBEB' : 'rgba(217,119,6,0.08)'
            : isLight ? '#F0FDFA' : 'rgba(20,184,166,0.08)',
          borderWidth: 1,
          borderStyle: isJanana ? 'solid' : 'dashed',
          borderColor: isJanana
            ? isLight ? '#FDE68A' : 'rgba(217,119,6,0.4)'
            : isLight ? '#5EEAD4' : 'rgba(45,212,191,0.4)',
        }}
      >
        {items.map((p, i) => (
          <div key={i} className="flex items-baseline gap-1 leading-none">
            <span
              style={{ fontSize: 9, fontWeight: 800, color: colorMap[p.name] || '#888' }}
              className="whitespace-nowrap"
            >
              {abbr[p.name] || p.name.slice(0, 2)}
            </span>
            {p.degree && (
              <span
                style={{ fontSize: 8, fontWeight: 600, color: colorMap[p.name] || '#888', opacity: 0.8 }}
              >
                {p.degree}°
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  // NOTE: cells no longer carry their own `border`. Two adjacent cells each
  // contributing a semi-transparent border used to read as a pale "gap"
  // between kattams. Instead the grid container supplies a solid teal
  // background plus a 1px `gap` (the "mortar"), and each cell is a flush
  // rectangle with no border of its own — giving one crisp hairline between
  // every house instead of a doubled, wider-looking seam.
  const renderCell = (houseNum: number | null) => {
    if (houseNum === null) return null; // center cells handled separately

    const janana  = jananaByRasi[houseNum]  || [];
    const gochara = gocharaByRasi[houseNum] || [];

    return (
      <div
        className="relative flex flex-col justify-start gap-1 p-1 h-full min-h-[68px]"
        style={{ background: isLight ? '#fff' : '#020617' }}
      >
        {/* House number — top-right corner */}
        <span
          className={`absolute top-0.5 right-1 text-[9px] font-bold leading-none ${
            isLight ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {houseNum}
        </span>

        <div className="flex flex-col gap-1.5 mt-3">
          {showJanana && renderGroup(janana, 'janana')}
          {showGochara && renderGroup(gochara, 'gochara')}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`p-4 space-y-4 rounded-xl border transition-all ${
        isLight
          ? 'bg-white/90 border-teal-600/20 shadow-md'
          : 'bg-slate-900/40 border-teal-500/20 backdrop-blur-md'
      }`}
    >
      {/* Section header */}
      <h2
        className={`text-xs font-semibold tracking-wider uppercase border-b pb-2 flex items-center gap-1.5 font-sans ${
          isLight ? 'text-teal-700 border-teal-600/20' : 'text-teal-400 border-teal-500/20'
        }`}
      >
        <span className="text-base leading-none">⚖</span>
        {isTamil ? 'ஜனன & கோச்சார ஒப்பீடு' : 'Janana & Gochara Comparison'}
      </h2>

      {/* 4×4 South Indian grid */}
      <div
        className="grid grid-cols-4 grid-rows-4 rounded-lg overflow-hidden aspect-square w-full max-w-[340px] mx-auto shadow-inner"
        style={{
          gap: 1,
          background: isLight ? '#0D9488' : 'rgba(20,184,166,0.25)',
          border: `1px solid ${isLight ? '#0D9488' : 'rgba(20,184,166,0.25)'}`,
        }}
      >
        {SOUTH_INDIAN_LAYOUT.map((houseNum, idx) => {
          // Center block: indices 5, 6, 9, 10 form the 2×2 centre
          const centerIndices = [5, 6, 9, 10];
          if (centerIndices.includes(idx)) {
            if (idx === 5) {
              // Render the 2×2 center spanning block only once
              return (
                <div
                  key={idx}
                  className="col-span-2 row-span-2 flex flex-col items-center justify-center text-center gap-2 p-2"
                  style={{
                    background: isLight
                      ? 'linear-gradient(135deg, rgba(240,253,250,0.6), rgba(236,253,245,0.4))'
                      : '#020617',
                  }}
                >
                  <p className={`font-serif text-[11px] font-extrabold tracking-wide leading-snug ${isLight ? 'text-teal-900' : 'text-teal-400'}`}>
                    {isTamil ? 'ஜனனம் +' : 'Janana +'}
                    <br />
                    {isTamil ? 'கோச்சாரம்' : 'Gochara'}
                  </p>
                </div>
              );
            }
            return null; // skip indices 6, 9, 10 — covered by col-span-2 row-span-2
          }

          return (
            <div key={idx} className="relative">
              {renderCell(houseNum)}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-[10px]">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-flex items-center justify-center rounded-full font-bold"
            style={{ width: 14, height: 14, fontSize: 7, background: '#F59E0B', color: '#fff' }}
          >
            {isTamil ? 'ஜ' : 'J'}
          </span>
          <span className={isLight ? 'text-[#5C4F43]' : 'text-gray-400'}>
            {isTamil ? 'ஜனன கிரகங்கள் — திடக்கோடு பெட்டி' : 'Birth (Janana) — solid border box'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="inline-flex items-center justify-center rounded-full font-bold"
            style={{ width: 14, height: 14, fontSize: 7, background: '#0D9488', color: '#fff' }}
          >
            {isTamil ? 'கோ' : 'G'}
          </span>
          <span className={isLight ? 'text-[#5C4F43]' : 'text-gray-400'}>
            {isTamil ? 'கோச்சார கிரகங்கள் — புள்ளிக்கோடு பெட்டி' : 'Transit (Gochara) — dashed border box'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface HoroscopeOutputScreenProps {
  name: string;
  date: Date;
  data: any;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  isLight?: boolean;
}

export default function HoroscopeOutputScreen({
  name,
  date,
  data,
  loading,
  error,
  onBack,
  isLight = false,
}: HoroscopeOutputScreenProps) {
  const { t, isTamil } = useTranslation();
  const { language } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="text-4xl text-amber-500 animate-pulse">☽</div>
        <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className={`text-sm font-serif ${isLight ? 'text-[#5C4F43]' : 'text-gray-400'}`}>
          {isTamil ? 'விண்மீன்களைக் கணிக்கிறது…' : 'Reading the stars…'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto space-y-4">
        <div className="text-4xl text-rose-500">✦</div>
        <h3 className={`text-lg font-bold ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>
          {isTamil ? 'ஏதோ தவறு நடந்துவிட்டது' : 'Something went wrong'}
        </h3>
        <p className={`text-xs ${isLight ? 'text-[#7A695A]' : 'text-gray-400'}`}>{error}</p>
        <button
          onClick={onBack}
          className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors shadow-md"
        >
          {t('common.retry') || 'Try Again'}
        </button>
      </div>
    );
  }

  if (!data) return null;

  const {
    astroDetails: astro,
    planets,
    gocharaPlanets,
    housePredictions,
    dashaData,
    lucky,
    bhavaChakra,
	d9Planets
  } = data;
  
  const hasPlanets = planets && planets.length > 0;
  const hasDasha = !!dashaData;
  const hasLucky = !!lucky;

  const doshaResults = React.useMemo(() => computeDoshaResults(planets), [planets]);

  // Render Rasi Chart Builder helper — grouped directly by rasi_no
  const rasiByRasiNo = React.useMemo(() => buildPlanetsByRasi(planets), [planets]);

  const renderRasiCell = (houseNum: number) => {
    const matchedPlanets = rasiByRasiNo[houseNum] || [];
    const rawPlanets = rawPlanetsByRasi[houseNum] || [];
    const signName = getRasiSignNames(isTamil)[houseNum] || '';
    const hasClickable = rawPlanets.length > 0;
    return (
      <div
        onClick={() => {
          if (hasClickable) {
            setSelectedCell({ houseNum, signName, planets: rawPlanets, chartType: 'rasi' });
          }
        }}
        className={`border p-1 flex flex-col justify-between items-center text-center h-full min-h-[65px] transition-all ${
          hasClickable ? 'cursor-pointer' : ''
        } ${
          isLight
            ? 'border-amber-500/20 bg-white/90 hover:bg-amber-100/40'
            : 'border-violet-500/20 bg-slate-950/80 hover:bg-violet-950/10'
        }`}
      >
        <span
          className={`text-[10px] font-bold font-sans tracking-wide leading-none ${
            isLight ? 'text-amber-800' : 'text-amber-500/80'
          }`}
        >
          {signName}
        </span>
        <div className="flex flex-wrap gap-0.5 justify-center items-center mt-auto mb-auto max-w-full">
          {matchedPlanets.map((p, i) => (
            <span
              key={i}
              style={{ backgroundColor: p.bg, color: p.fg }}
              className="text-[9px] font-extrabold px-1 py-0.5 rounded leading-none whitespace-nowrap shadow-sm border border-black/10"
              title={p.fullName}
            >
              {p.abbr}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Render Navamsa (D9) Chart Builder helper — same kattam format as Rasi,
  // sourced from d9Planets and grouped by the same rasi_no-based helper.
  const d9ByRasiNo = React.useMemo(() => buildPlanetsByRasi(d9Planets), [d9Planets]);
  const hasD9 = Array.isArray(d9Planets) && d9Planets.length > 0;

  // ── Kattam cell detail overlay ──────────────────────────────────────────────
  const [selectedCell, setSelectedCell] = React.useState<{
    houseNum: number;
    signName: string;
    planets: any[];
    chartType: 'rasi' | 'd9' | 'bhava';
  } | null>(null);

  // Build a lookup from rasi_no → full planet objects (raw API data)
  const rawPlanetsByRasi = React.useMemo<Record<number, any[]>>(() => {
    const map: Record<number, any[]> = {};
    if (!Array.isArray(planets)) return map;
    planets.forEach((p: any) => {
      const rasiNo: number | undefined =
        p.rasi_no ?? RASI_SIGN_TO_HOUSE[((p.sign || p.zodiac || '') as string).trim()];
      if (!rasiNo) return;
      map[rasiNo] = map[rasiNo] || [];
      map[rasiNo].push(p);
    });
    return map;
  }, [planets]);

  // D9 raw planet lookup by rasi_no
  const rawD9ByRasi = React.useMemo<Record<number, any[]>>(() => {
    const map: Record<number, any[]> = {};
    if (!Array.isArray(d9Planets)) return map;
    d9Planets.forEach((p: any) => {
      const rasiNo: number | undefined =
        p.rasi_no ?? RASI_SIGN_TO_HOUSE[((p.zodiac || p.sign || '') as string).trim()];
      if (!rasiNo) return;
      map[rasiNo] = map[rasiNo] || [];
      map[rasiNo].push(p);
    });
    return map;
  }, [d9Planets]);

  const renderD9Cell = (houseNum: number) => {
    const matchedPlanets = d9ByRasiNo[houseNum] || [];
    const rawPlanets = rawD9ByRasi[houseNum] || [];
    const signName = getRasiSignNames(isTamil)[houseNum] || '';
    const hasClickable = rawPlanets.length > 0;
    return (
      <div
        onClick={() => {
          if (hasClickable) {
            setSelectedCell({ houseNum, signName, planets: rawPlanets, chartType: 'd9' });
          }
        }}
        className={`border p-1 flex flex-col justify-between items-center text-center h-full min-h-[65px] transition-all ${
          hasClickable ? 'cursor-pointer' : ''
        } ${
          isLight
            ? 'border-teal-500/20 bg-white/90 hover:bg-teal-100/40'
            : 'border-teal-500/20 bg-slate-950/80 hover:bg-teal-950/10'
        }`}
      >
        <span
          className={`text-[10px] font-bold font-sans tracking-wide leading-none ${
            isLight ? 'text-teal-800' : 'text-teal-400/80'
          }`}
        >
          {signName}
        </span>
        <div className="flex flex-wrap gap-0.5 justify-center items-center mt-auto mb-auto max-w-full">
          {matchedPlanets.map((p, i) => (
            <span
              key={i}
              style={{ backgroundColor: p.bg, color: p.fg }}
              className="text-[9px] font-extrabold px-1 py-0.5 rounded leading-none whitespace-nowrap shadow-sm border border-black/10"
              title={p.fullName}
            >
              {p.abbr}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Converts a decimal degree where the fractional part represents minutes/seconds
  const normalizeDegree = (val: any) => {
    if (val == null) return '';
    const num = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(num)) return String(val);
    const intPart = Math.floor(num);
    const decPart = parseFloat((num - intPart).toFixed(10)); // avoid float drift
    if (decPart >= 0.60) {
      const newInt = intPart + 1;
      const newDec = (decPart - 0.60).toFixed(2).replace('0.', '');
      return `${newInt}.${newDec}`;
    }
    return num.toFixed(2);
  };

  const formattedDateString = date
	  ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${formatTo12Hour(
		  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
		)}`
	  : '—';

  // ── Section label helper ─────────────────────────────────────────────────
  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className={`text-[11px] font-medium uppercase tracking-[0.08em] mb-1.5 ${isLight ? 'text-[#7A695A]' : 'text-gray-500'}`}>
      {children}
    </p>
  );

  // ── Shared panel wrapper ──────────────────────────────────────────────────
  const panelCls = `rounded-xl border p-3 transition-all ${
    isLight ? 'bg-white/90 border-[rgba(0,0,0,0.08)] shadow-sm' : 'bg-slate-900/40 border-gray-800 backdrop-blur-md'
  }`;

  // ── Shared panel title ────────────────────────────────────────────────────
  const PanelTitle = ({
    children,
    color,
  }: {
    children: React.ReactNode;
    color?: string;
  }) => (
    <div
      className={`text-[11px] font-medium uppercase tracking-[0.06em] flex items-center gap-1.5 border-b pb-1.5 mb-2 ${
        isLight ? 'border-[rgba(0,0,0,0.07)]' : 'border-gray-800/60'
      }`}
      style={{ color: color || (isLight ? '#B45309' : '#FBBF24') }}
    >
      {children}
    </div>
  );

  // ── Shared kattam grid ────────────────────────────────────────────────────
  const kattamGridCls = `grid grid-cols-4 grid-rows-4 aspect-square w-full rounded-md overflow-hidden`;
  const kattamGapStyle = {
    gap: 1,
    background: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.08)',
  };

  return (
    <>
    <div className="space-y-4 max-w-2xl mx-auto pb-12 animate-fade-in">
      {/* ── Back button ── */}
      <button
        onClick={onBack}
        className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
          isLight ? 'text-[#5C4F43] hover:text-[#1E120A]' : 'text-gray-400 hover:text-white'
        }`}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span>{t('common.back') || 'Back'}</span>
      </button>

      {/* ── Profile Header ── */}
      <div
        className={`flex items-center gap-3 rounded-xl p-3 border transition-all ${
          isLight
            ? 'bg-white/90 border-[rgba(0,0,0,0.08)] shadow-sm'
            : 'bg-slate-900/40 border-gray-800 backdrop-blur-md'
        }`}
      >
        <div
          className={`w-[38px] h-[38px] rounded-full flex items-center justify-center font-serif text-lg flex-shrink-0 ${
            isLight
              ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-950 text-amber-400'
          }`}
        >
          {SIGN_GLYPHS[astro?.ascendant_sign] || '✦'}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[15px] font-medium leading-tight ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>
            {name}
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            <span
              className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full border ${
                isLight ? 'bg-white border-[rgba(0,0,0,0.1)] text-[#5C4F43]' : 'bg-slate-950 border-gray-800 text-gray-400'
              }`}
            >
              <Calendar className="w-2.5 h-2.5" />
              {formattedDateString}
            </span>
            {astro?.ascendant_sign && (
              <span className={`inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full border ${
                isLight ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                {astro.ascendant_sign} {isTamil ? 'லக்னம்' : 'Lagna'}
              </span>
            )}
            {astro?.rasi && (
              <span className={`inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full border ${
                isLight ? 'bg-violet-50 border-violet-300 text-violet-800' : 'bg-violet-500/10 border-violet-500/20 text-violet-400'
              }`}>
                {astro.rasi} {isTamil ? 'ராசி' : 'Rasi'}
              </span>
            )}
            {astro?.nakshatra && (
              <span className={`inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full border ${
                isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}>
                {astro.nakshatra}-{astro.nakshatra_pada} {isTamil ? 'நட்சத்திரம்' : 'Star'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 1: Rasi + Navamsa side by side ── */}
      <SectionLabel>{isTamil ? 'கட்டங்கள்' : 'Charts'}</SectionLabel>
      <div className="grid grid-cols-2 gap-2.5">
        {/* Rasi Chart */}
        <div className={panelCls}>
          <PanelTitle color={isLight ? '#B45309' : '#FBBF24'}>
            <Award className="w-3 h-3" />
            {isTamil ? 'ராசி கட்டம்' : 'Rasi chart'}
          </PanelTitle>
          <div className={kattamGridCls} style={kattamGapStyle}>
            {renderRasiCell(12)}
            {renderRasiCell(1)}
            {renderRasiCell(2)}
            {renderRasiCell(3)}
            {renderRasiCell(11)}
            <div
              className={`col-span-2 row-span-2 flex flex-col items-center justify-center text-center p-1 ${
                isLight ? 'bg-amber-50/80' : 'bg-slate-950'
              }`}
            >
              <p className={`text-[9px] font-medium leading-snug ${isLight ? 'text-[#5C4F43]' : 'text-gray-400'}`}>
                {isTamil ? 'ராசி\nகட்டம்' : 'Rasi\nChart'}
              </p>
            </div>
            {renderRasiCell(4)}
            {renderRasiCell(10)}
            {renderRasiCell(5)}
            {renderRasiCell(9)}
            {renderRasiCell(8)}
            {renderRasiCell(7)}
            {renderRasiCell(6)}
          </div>
        </div>

        {/* Navamsa (D9) Chart */}
        {hasD9 ? (
          <div className={panelCls}>
            <PanelTitle color={isLight ? '#0F766E' : '#2DD4BF'}>
              <Award className="w-3 h-3" />
              {isTamil ? 'நவாம்சம்' : 'Navamsa chart'}
            </PanelTitle>
            <div className={kattamGridCls} style={kattamGapStyle}>
              {renderD9Cell(12)}
              {renderD9Cell(1)}
              {renderD9Cell(2)}
              {renderD9Cell(3)}
              {renderD9Cell(11)}
              <div
                className={`col-span-2 row-span-2 flex flex-col items-center justify-center text-center p-1 ${
                  isLight ? 'bg-teal-50/80' : 'bg-slate-950'
                }`}
              >
                <p className={`text-[9px] font-medium leading-snug ${isLight ? 'text-[#5C4F43]' : 'text-gray-400'}`}>
                  {isTamil ? 'நவாம்ச\nகட்டம்' : 'Navamsa\nChart'}
                </p>
              </div>
              {renderD9Cell(4)}
              {renderD9Cell(10)}
              {renderD9Cell(5)}
              {renderD9Cell(9)}
              {renderD9Cell(8)}
              {renderD9Cell(7)}
              {renderD9Cell(6)}
            </div>
          </div>
        ) : (
          <div /> /* empty slot when no D9 data */
        )}
      </div>

      {/* ── Row 2: Bhava Chakra + Janana & Gochara side by side ── */}
      {hasPlanets && (bhavaChakra?.cusps || true) && (
        <>
            {/* Bhava Chakra */}
            {bhavaChakra?.cusps && (
              <div className={panelCls}>
                <BhavaChakra
                  planets={planets}
                  cusps={bhavaChakra.cusps}
                  isLight={isLight}
                  isTamil={isTamil}
                  onCellClick={(houseNum, signName, rawPlanets) =>
                    setSelectedCell({ houseNum, signName, planets: rawPlanets, chartType: 'bhava' })
                  }
                />
              </div>
            )}

            {/* Janana & Gochara */}
            <div className={panelCls}>
              <JananaGocharaOppeedu
                planets={planets}
                gocharaPlanets={gocharaPlanets || []}
                astroDetails={astro}
                isLight={isLight}
                isTamil={isTamil}
              />
            </div>
        </>
      )}

      {/* ── Row 3: Avakahada + Planet Details side by side ── */}
      <SectionLabel>{isTamil ? 'விவரங்கள்' : 'Details'}</SectionLabel>
      <div className="grid grid-cols-2 gap-2.5 items-start">
        {/* Avakahada Chakra */}
        {astro && (
          <div className={panelCls}>
            <PanelTitle color={isLight ? '#B45309' : '#FBBF24'}>
              {isTamil ? 'அவகாஹடா சக்கரம்' : 'Avakahada chakra'}
            </PanelTitle>
            <div className="grid grid-cols-2 gap-1">
              {(isTamil ? AVAK_ROWS_TAMIL : AVAK_ROWS).map(({ key, label }) => {
                const val = astro[key];
                if (!val) return null;
                const isFullWidth = key === 'tithi';
                return (
                  <div
                    key={key}
                    className={`flex flex-col p-1.5 rounded border ${isFullWidth ? 'col-span-2' : ''} ${
                      isLight ? 'bg-[rgba(0,0,0,0.02)] border-[rgba(0,0,0,0.06)]' : 'bg-slate-950/60 border-gray-800/40'
                    }`}
                  >
                    <span className={`text-[9px] uppercase tracking-[0.05em] ${isLight ? 'text-[#7A695A]' : 'text-gray-500'}`}>
                      {label}
                    </span>
                    <span className={`text-[11px] font-medium mt-0.5 ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Dosha Nirnayam — nested under Avakahada */}
            {doshaResults && (
              <div className="mt-3">
                <div className={`text-[10px] font-medium uppercase tracking-[0.06em] flex items-center gap-1 border-t pt-2 mb-1.5 ${
                  isLight ? 'text-amber-700 border-[rgba(0,0,0,0.07)]' : 'text-amber-400 border-gray-800/60'
                }`}>
                  <HelpCircle className="w-3 h-3" />
                  {isTamil ? 'தோஷ நிர்ணயம்' : 'Dosha analysis'}
                </div>
                <div className="space-y-1">
                  {[
                    { label: isTamil ? 'செவ்வாய் தோஷம்' : 'Chevvai Dosham', hit: doshaResults.chevvai },
                    { label: isTamil ? 'ராகு/கேது தோஷம்' : 'Rahu/Ketu Dosham', hit: doshaResults.rahuKetu },
                    { label: isTamil ? 'புணர்ப்பு தோஷம்' : 'Punarppu Dosham', hit: doshaResults.punarppu },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className={`flex items-center justify-between px-2 py-1 rounded border ${
                        isLight ? 'bg-[rgba(0,0,0,0.02)] border-[rgba(0,0,0,0.06)]' : 'bg-slate-950/60 border-gray-800/40'
                      }`}
                    >
                      <span className={`text-[10px] font-medium ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>
                        {row.label}
                      </span>
                      <span className={`text-[10px] font-bold ${
                        row.hit
                          ? isLight ? 'text-rose-700' : 'text-rose-400'
                          : isLight ? 'text-emerald-700' : 'text-emerald-400'
                      }`}>
                        {isTamil ? (row.hit ? 'உண்டு' : 'இல்லை') : row.hit ? 'Yes' : 'No'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Planet Details Table */}
        {hasPlanets && (
          <div className={`${panelCls} overflow-x-auto`}>
            <PanelTitle color={isLight ? '#B45309' : '#FBBF24'}>
              {isTamil ? 'கிரக நிலைகள்' : 'Planet details'}
            </PanelTitle>
            <table className="w-full text-left" style={{ fontSize: 10, borderCollapse: 'collapse' }}>
              <thead>
                <tr className={`border-b text-[8px] uppercase tracking-[0.06em] font-medium ${
                  isLight ? 'border-[rgba(0,0,0,0.08)] text-[#7A695A]' : 'border-gray-800/50 text-gray-500'
                }`}>
                  <th className="py-1">{isTamil ? 'கிரகம்' : 'Planet'}</th>
                  <th className="py-1">{isTamil ? 'ராசி' : 'Sign'}</th>
                  <th className="py-1">{isTamil ? 'நட்சத்திரம்' : 'Nakshatra'}</th>
                  <th className="py-1 text-center">{isTamil ? 'பாதம்' : 'Pada'}</th>
                  <th className="py-1 text-right">{isTamil ? 'பாகை' : 'Degree'}</th>
                </tr>
              </thead>
              <tbody>
                {planets.map((p: any, i: number) => (
                  <tr
                    key={p.full_name || p.name || i}
                    className={`border-b ${isLight ? 'border-[rgba(0,0,0,0.05)]' : 'border-gray-800/30'}`}
                  >
                    <td className={`py-1 ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>
                      <div className="flex items-center gap-1">
                        <span className={`text-[11px] ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
                          {PLANET_GLYPHS[p.full_name] || PLANET_GLYPHS[p.name] || '★'}
                        </span>
                        <span className="font-medium">{p.name}</span>
                        {(p.is_retrograde || p.retro) && (
                          <span className={`text-[7px] font-medium px-0.5 rounded ${
                            isLight ? 'bg-rose-50 text-rose-700' : 'bg-red-950 text-red-400'
                          }`}>R</span>
                        )}
                      </div>
                    </td>
                    <td className={`py-1 ${isLight ? 'text-[#5C4F43]' : 'text-gray-300'}`}>{p.sign || p.zodiac || '—'}</td>
                    <td className={`py-1 font-medium ${isLight ? 'text-amber-800' : 'text-amber-300/90'}`}>{p.nakshatra || '—'}</td>
                    <td className={`py-1 text-center font-medium ${isLight ? 'text-violet-700' : 'text-violet-300'}`}>
                      {p.nakshatra_pada ? `P${p.nakshatra_pada}` : '—'}
                    </td>
                    <td className={`py-1 text-right font-mono font-medium ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                      {normalizeDegree(p.global_degree ?? p.local_degree) || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Row 4: Astrological Characteristics — full width ── */}
      {housePredictions && housePredictions.length > 0 && (
        <>
          <SectionLabel>{isTamil ? 'இயல்புகள்' : 'Characteristics'}</SectionLabel>
          <div className={panelCls}>
            <PanelTitle color={isLight ? '#B45309' : '#FBBF24'}>
              {isTamil ? 'ஜாதக பலன்கள்' : 'Astrological characteristics'}
            </PanelTitle>
            <div className="space-y-1.5">
              {housePredictions.map((h: any, i: number) => {
                if (!h.prediction) return null;
                return (
                  <div
                    key={i}
                    className={`rounded-lg border px-2.5 py-2 text-[10px] leading-relaxed ${
                      isLight
                        ? 'bg-[rgba(0,0,0,0.02)] border-[rgba(0,0,0,0.06)] text-[#2C241E]'
                        : 'bg-slate-950/45 border-gray-800/30 text-gray-200'
                    }`}
                  >
                    {h.prediction.trim()
                      .replace(/^since\s+the\s+\S+\s+lord[^,]*,\s*/i, '')
                      .replace(/^ஜாதகத்தில்[^,]*,\s*/u, '')
                      .replace(/^\d+\s*வது\s*வீட்டின்\s*அதிபதி[^,]*,[^,]*,[^,]*இருப்பதால்,\s*/u, '')}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── Row 5: Dasha + Lucky side by side ── */}
      {(hasDasha || hasLucky) && (
        <>
			{/* Dasha Block */}
            {hasDasha && (() => {
              const fmtDate = (val: string | undefined) => {
                if (!val) return '—';
                const d = new Date(val);
                if (isNaN(d.getTime())) return val;
                return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
              };

              const DASHA_ROWS: { key: string; labelEn: string; labelTa: string; accent: string; bgLight: string; bgDark: string }[] = [
                { key: 'mahadasha',       labelEn: 'தசா',       labelTa: 'தசா',       accent: '#6366f1', bgLight: 'rgba(99,102,241,0.06)',  bgDark: 'rgba(99,102,241,0.08)' },
                { key: 'antardasha',      labelEn: 'புக்தி',    labelTa: 'புக்தி',    accent: '#6366f1', bgLight: 'rgba(99,102,241,0.06)',  bgDark: 'rgba(99,102,241,0.08)' },
                { key: 'paryantardasha',  labelEn: 'அந்தரம்',   labelTa: 'அந்தரம்',   accent: '#10b981', bgLight: 'rgba(16,185,129,0.06)',  bgDark: 'rgba(16,185,129,0.08)' },
                { key: 'Shookshamadasha', labelEn: 'சூட்சுமம்', labelTa: 'சூட்சுமம்', accent: '#f59e0b', bgLight: 'rgba(245,158,11,0.06)',  bgDark: 'rgba(245,158,11,0.08)' },
                { key: 'Pranadasha',      labelEn: 'பிராணம்',   labelTa: 'பிராணம்',   accent: '#ec4899', bgLight: 'rgba(236,72,153,0.06)', bgDark: 'rgba(236,72,153,0.08)' },
              ];

              const PLANET_NAME_TA: Record<string, string> = {
                Sun: 'சூரியன்', Moon: 'சந்திரன்', Mars: 'செவ்வாய்',
                Mercury: 'புதன்', Jupiter: 'குரு', Venus: 'சுக்கிரன்',
                Saturn: 'சனி', Rahu: 'ராகு', Ketu: 'கேது', Ascendant: 'லக்னம்',
              };

              return (
                <div className={panelCls}>
                  <PanelTitle color={isLight ? '#B45309' : '#FBBF24'}>
                    <span className="text-sm leading-none">⏳</span>
                    {isTamil ? 'தசா காலங்கள்' : 'Dasha periods'}
                  </PanelTitle>
                  <div className="space-y-1.5">
                    {DASHA_ROWS.map(({ key, labelEn, labelTa, accent, bgLight, bgDark }) => {
                      const entry = dashaData[key as keyof typeof dashaData] as any;
                      if (!entry?.name) return null;
                      const planetKey = entry.key || entry.name;
                      const displayName = isTamil
                        ? (PLANET_NAME_TA[planetKey] || PLANET_NAME_TA[entry.name] || entry.name)
                        : entry.name;
                      const glyph = PLANET_GLYPHS[planetKey] || PLANET_GLYPHS[entry.name] || '★';
                      const start = fmtDate(entry.start);
                      const end   = fmtDate(entry.end);

                      return (
                        <div
                          key={key}
                          className="flex flex-col rounded-lg px-2.5 py-1.5"
                          style={{
                            background: isLight ? bgLight : bgDark,
                            borderLeft: `3px solid ${accent}`,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-medium uppercase tracking-[0.06em] px-1 py-0.5 rounded ${
                              isLight ? 'bg-white/70 text-[#5C4F43]' : 'bg-slate-800 text-gray-400'
                            }`}>
                              {isTamil ? labelTa : labelEn}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs leading-none" style={{ color: accent }}>{glyph}</span>
                              <span className={`text-xs font-medium ${isLight ? 'text-[#1a0a00]' : 'text-white'}`}>
                                {displayName}
                              </span>
                            </div>
                          </div>
                          <div className={`text-[9px] mt-1 ${isLight ? 'text-[#7A695A]' : 'text-gray-500'}`}>
                            {isTamil ? 'ஆரம்பம்:' : 'Start:'}{' '}
                            <span className={`font-medium ${isLight ? 'text-[#2C241E]' : 'text-gray-300'}`}>{start}</span>
                            {' · '}
                            {isTamil ? 'முடிவு:' : 'End:'}{' '}
                            <span className={`font-medium ${isLight ? 'text-[#2C241E]' : 'text-gray-300'}`}>{end}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            {/* Lucky factors */}
            {hasLucky && (
              <div className={panelCls}>
                <PanelTitle color={isLight ? '#B45309' : '#FBBF24'}>
                  <Sparkles className="w-3 h-3" />
                  {isTamil ? 'அதிர்ஷ்ட காரணிகள்' : 'Lucky factors'}
                </PanelTitle>
                <div className="grid grid-cols-2 gap-2.5">
                  {lucky.numbers?.length > 0 && (
                    <div>
                      <p className={`text-[9px] uppercase tracking-[0.06em] font-medium mb-1.5 ${isLight ? 'text-[#7A695A]' : 'text-gray-500'}`}>
                        {isTamil ? 'எண்கள்' : 'Numbers'}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {lucky.numbers.map((n: any, i: number) => (
                          <span
                            key={i}
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium border ${
                              isLight
                                ? 'bg-violet-50 border-violet-300 text-violet-800'
                                : 'bg-violet-500/10 border-violet-500/20 text-violet-300'
                            }`}
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {lucky.colors?.length > 0 && (
                    <div>
                      <p className={`text-[9px] uppercase tracking-[0.06em] font-medium mb-1.5 ${isLight ? 'text-[#7A695A]' : 'text-gray-500'}`}>
                        {isTamil ? 'நிறங்கள்' : 'Colours'}
                      </p>
                      <div className="space-y-1">
                        {lucky.colors.map((c: any, i: number) => {
                          const norm = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
                          const swatch = COLOR_SWATCHES[norm] || COLOR_SWATCHES[c] || '#888';
                          return (
                            <div
                              key={i}
                              className={`flex items-center gap-1.5 text-[10px] ${
                                isLight ? 'text-[#2C241E]' : 'text-gray-300'
                              }`}
                            >
                              <span
                                style={{ backgroundColor: swatch }}
                                className={`w-2.5 h-2.5 rounded-full border flex-shrink-0 ${
                                  isLight ? 'border-[rgba(0,0,0,0.1)]' : 'border-white/10'
                                }`}
                              />
                              <span>{c}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </>
      )}
    </div>

    {/* ── Kattam cell detail overlay (portal to document.body) ── */}
    {selectedCell && ReactDOM.createPortal(
      <div
        className="fixed z-[9999]"
        style={{ top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)' }}
        onClick={() => setSelectedCell(null)}
      >
        <div
		  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl p-5 space-y-4 ${
			isLight ? 'bg-white' : 'bg-slate-900'
		  }`}
		  onClick={(e) => e.stopPropagation()}
		>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-[10px] uppercase tracking-widest font-bold ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
                {selectedCell.chartType === 'd9'
                  ? (isTamil ? 'நவாம்சம்' : 'Navamsa')
                  : selectedCell.chartType === 'bhava'
                  ? (isTamil ? 'பாவகம்' : 'Bhava')
                  : (isTamil ? 'ராசி' : 'Rasi')}{' '}
                · {isTamil ? 'பாவம்' : 'House'} {selectedCell.houseNum}
              </p>
              <h3 className={`text-lg font-serif font-bold leading-tight ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>
                {selectedCell.signName}
              </h3>
            </div>
            <button
              onClick={() => setSelectedCell(null)}
              className={`text-xl leading-none px-2 py-1 rounded-lg ${isLight ? 'text-gray-400 hover:bg-gray-100' : 'text-gray-500 hover:bg-slate-800'}`}
            >
              ✕
            </button>
          </div>

          {/* Planet cards */}
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {selectedCell.planets.map((p: any, i: number) => {
              const badge = RASI_BADGE[p.full_name || p.name] || RASI_BADGE[p.name];
              const isD9 = selectedCell.chartType === 'd9';
              const sign = p.sign || p.zodiac || '—';
              const localDeg = p.local_degree != null
                ? (typeof p.local_degree === 'number'
                    ? `${p.local_degree.toFixed(2)}°`
                    : p.local_degree)
                : '—';
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-3 space-y-2.5 ${
                    isLight ? 'border-amber-200 bg-amber-50/60' : 'border-violet-500/20 bg-slate-800/60'
                  }`}
                >
                  {/* Planet name row */}
                  <div className="flex items-center gap-2">
                    {badge && (
                      <span
                        style={{ backgroundColor: badge.bg, color: badge.fg }}
                        className="text-[11px] font-extrabold px-2 py-0.5 rounded-md leading-none border border-black/10 shadow-sm"
                      >
                        {badge.abbr}
                      </span>
                    )}
                    <span className={`font-serif font-bold text-sm ${isLight ? 'text-[#1a0a00]' : 'text-white'}`}>
                      {p.full_name || p.name}
                    </span>
                    {(p.is_retrograde || p.retro) && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isLight ? 'bg-rose-100 text-rose-600' : 'bg-rose-900/40 text-rose-400'}`}>
                        ℞
                      </span>
                    )}
                  </div>

                  {/* Detail grid */}
                  <div className={`grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] ${isLight ? 'text-[#5C4F43]' : 'text-gray-400'}`}>
                    <div>
                      <span className={`block text-[9px] uppercase tracking-wider font-semibold mb-0.5 ${isLight ? 'text-amber-600' : 'text-amber-500'}`}>
                        {isTamil ? 'ராசி' : 'Sign'}
                      </span>
                      <span className={`font-medium ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>{sign}</span>
                    </div>
                    {!isD9 && (
                      <div>
                        <span className={`block text-[9px] uppercase tracking-wider font-semibold mb-0.5 ${isLight ? 'text-amber-600' : 'text-amber-500'}`}>
                          {isTamil ? 'ராசி அதிபதி' : 'Sign Lord'}
                        </span>
                        <span className={`font-medium ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>{p.sign_lord || '—'}</span>
                      </div>
                    )}
                    <div>
                      <span className={`block text-[9px] uppercase tracking-wider font-semibold mb-0.5 ${isLight ? 'text-amber-600' : 'text-amber-500'}`}>
                        {isTamil ? 'பாவம்' : 'House'}
                      </span>
                      <span className={`font-medium ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>{p.house != null ? p.house : '—'}</span>
                    </div>
                    <div>
                      <span className={`block text-[9px] uppercase tracking-wider font-semibold mb-0.5 ${isLight ? 'text-amber-600' : 'text-amber-500'}`}>
                        {isTamil ? 'கிரக பாகை' : 'Local Degree'}
                      </span>
                      <span className={`font-medium ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>{localDeg}</span>
                    </div>
                    {!isD9 && (
                      <>
                        <div>
                          <span className={`block text-[9px] uppercase tracking-wider font-semibold mb-0.5 ${isLight ? 'text-amber-600' : 'text-amber-500'}`}>
                            {isTamil ? 'நட்சத்திரம்' : 'Nakshatra'}
                          </span>
                          <span className={`font-medium ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>
                            {p.nakshatra || '—'}
                            {p.nakshatra_pada != null && (
                              <span className={`ml-1 text-[9px] ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                                ({isTamil ? 'பாதம்' : 'Pada'} {p.nakshatra_pada})
                              </span>
                            )}
                          </span>
                        </div>
                        <div>
                          <span className={`block text-[9px] uppercase tracking-wider font-semibold mb-0.5 ${isLight ? 'text-amber-600' : 'text-amber-500'}`}>
                            {isTamil ? 'நட்சத்திர அதிபதி' : 'Nakshatra Lord'}
                          </span>
                          <span className={`font-medium ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>{p.nakshatra_lord || '—'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}
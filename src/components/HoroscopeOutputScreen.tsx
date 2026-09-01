import React from 'react';
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

const RASI_SIGN_TO_HOUSE: Record<string, number> = {
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

const getRasiSignNames = (isTamil: boolean): Record<number, string> =>
  isTamil ? RASI_SIGN_NAMES_TA : RASI_SIGN_NAMES_EN;

export const RASI_BADGE: Record<string, { abbr: string; bg: string; fg: string }> = {
  'சூரியன்':  { abbr: 'சூரி',  bg: '#FFF176', fg: '#5D4037' },
  'சந்திரன்': { abbr: 'சந்',   bg: '#E0E0E0', fg: '#37474F' },
  'செவ்வாய்': { abbr: 'செவ்',  bg: '#FFCCBC', fg: '#BF360C' },
  'புதன்':    { abbr: 'புத',  bg: '#C8E6C9', fg: '#1B5E20' },
  'குரு':     { abbr: 'குரு',  bg: '#FFF9C4', fg: '#F57F17' },
  'சுக்கிரன்':{ abbr: 'சுக்',  bg: '#E1F5FE', fg: '#01579B' },
  'சனி':      { abbr: 'சனி', bg: '#283593', fg: '#FFFFFF' },
  'ராகு':     { abbr: 'ராகு',  bg: '#388E3C', fg: '#FFFFFF' },
  'கேது':     { abbr: 'கேது',  bg: '#757575', fg: '#FFFFFF' },
  'லக்னம்':   { abbr: 'ல',  bg: '#7E57C2', fg: '#FFFFFF' },
  'Sun':      { abbr: 'Su',  bg: '#FFF176', fg: '#5D4037' },
  'Moon':     { abbr: 'Mo',   bg: '#E0E0E0', fg: '#37474F' },
  'Mars':     { abbr: 'Ma',  bg: '#FFCCBC', fg: '#BF360C' },
  'Mercury':  { abbr: 'Me',  bg: '#C8E6C9', fg: '#1B5E20' },
  'Jupiter':  { abbr: 'Ju',  bg: '#FFF9C4', fg: '#F57F17' },
  'Venus':    { abbr: 'Ve',  bg: '#E1F5FE', fg: '#01579B' },
  'Saturn':   { abbr: 'Sa', bg: '#283593', fg: '#FFFFFF' },
  'Rahu':     { abbr: 'Ra',  bg: '#388E3C', fg: '#FFFFFF' },
  'Ketu':     { abbr: 'Ke',  bg: '#757575', fg: '#FFFFFF' },
  'Ascendant':{ abbr: 'As',  bg: '#7E57C2', fg: '#FFFFFF' },
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
        <span
          className="absolute -top-1.5 -left-1.5 rounded-full flex items-center justify-center font-extrabold"
          style={{
            fontSize: 7,
            width: 13,
            height: 13,
            background: isJanana ? '#F59E0B' : '#0D9488',
            color: '#fff',
            border: `1.5px solid ${isLight ? '#fff' : '#0f172a'}`,
          }}
        >
          {isJanana ? (isTamil ? 'ஜ' : 'J') : (isTamil ? 'கோ' : 'G')}
        </span>
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
  } = data;
  console.log(dashaData)

  const hasPlanets = planets && planets.length > 0;
  const hasDasha = !!dashaData;
console.log('hasDasha', hasDasha)
  const hasLucky = !!lucky;

  // Render Rasi Chart Builder helper
  const rasiBySign: Record<number, string[]> = {};
  if (Array.isArray(planets)) {
    planets.forEach((p: any) => {
      const signKey = (p.sign || '').trim();
      const house = RASI_SIGN_TO_HOUSE[signKey];
      if (house) {
        rasiBySign[house] = rasiBySign[house] || [];
        rasiBySign[house].push(p.name);
      }
    });
  }

  const renderRasiCell = (houseNum: number) => {
    const matchedPlanets = rasiBySign[houseNum] || [];
    const signName = getRasiSignNames(isTamil)[houseNum] || '';
    return (
      <div
        className={`border p-1 flex flex-col justify-between items-center text-center h-full min-h-[65px] transition-all ${
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
          {matchedPlanets.map((pName, i) => {
            const s = RASI_BADGE[pName] || { abbr: pName.slice(0, 2), bg: '#444', fg: '#fff' };
            return (
              <span
                key={i}
                style={{ backgroundColor: s.bg, color: s.fg }}
                className="text-[9px] font-extrabold px-1 py-0.5 rounded leading-none whitespace-nowrap shadow-sm border border-black/10"
                title={pName}
              >
                {s.abbr}
              </span>
            );
          })}
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* ── Back button ── */}
      <button
        onClick={onBack}
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
          isLight ? 'text-[#5C4F43] hover:text-[#1E120A]' : 'text-gray-400 hover:text-white'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        <span>{t('common.back') || 'Back'}</span>
      </button>

      {/* ── Profile Header ── */}
      <div
        className={`flex flex-col sm:flex-row items-center gap-4 rounded-xl p-5 border transition-all ${
          isLight
            ? 'bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50/50 border-amber-500/30 shadow-md'
            : 'bg-slate-900/40 border-gray-800 backdrop-blur-md'
        }`}
      >
        <div
          className={`w-14 h-14 rounded-full border flex items-center justify-center font-serif text-2xl flex-shrink-0 ${
            isLight
              ? 'bg-amber-100/80 border-amber-500/30 text-amber-700 shadow-sm'
              : 'bg-slate-950 border-violet-500/30 text-amber-400'
          }`}
        >
          {SIGN_GLYPHS[astro?.ascendant_sign] || '✦'}
        </div>
        <div className="text-center sm:text-left space-y-1.5 flex-1">
          <h1 className={`text-2xl font-serif font-bold tracking-wide ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>
            {name}
          </h1>
          <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
            <span
              className={`px-2.5 py-0.5 border text-[10px] font-medium rounded-full flex items-center gap-1 ${
                isLight ? 'bg-white border-amber-500/20 text-[#5C4F43]' : 'bg-slate-950 border-gray-800 text-gray-400'
              }`}
            >
              <Calendar className="w-3 h-3" />
              {formattedDateString}
            </span>
            {astro?.ascendant_sign && (
              <span
                className={`px-2.5 py-0.5 border text-[10px] font-semibold rounded-full ${
                  isLight ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}
              >
                {astro.ascendant_sign} {isTamil ? 'லக்னம்' : 'Lagna'}
              </span>
            )}
            {astro?.sun_sign && (
              <span
                className={`px-2.5 py-0.5 border text-[10px] font-semibold rounded-full ${
                  isLight ? 'bg-violet-100 border-violet-300 text-violet-900' : 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                }`}
              >
                {astro.sun_sign} {isTamil ? 'ராசி' : 'Rasi'}
              </span>
            )}
            {astro?.nakshatra && (
              <span
                className={`px-2.5 py-0.5 border text-[10px] font-semibold rounded-full ${
                  isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}
              >
                {astro.nakshatra}-{astro.nakshatra_pada} {isTamil ? 'நட்சத்திரம்' : 'Star'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Layout: 2 Columns on Desktop ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Avakahada details + Rasi Chart */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className={`p-4 space-y-4 rounded-xl border transition-all ${
              isLight
                ? 'bg-white/90 border-amber-500/20 shadow-md text-[#2C241E]'
                : 'bg-slate-900/40 border-gray-800 shadow-xl backdrop-blur-md text-white'
            }`}
          >
            <h2
              className={`text-xs font-semibold tracking-wider uppercase border-b pb-2 flex items-center gap-1.5 font-sans ${
                isLight ? 'text-amber-700 border-amber-500/20' : 'text-amber-400 border-gray-800/60'
              }`}
            >
              <Award className="w-4 h-4 text-amber-500" />
              {isTamil ? 'ராசி கட்டம்' : 'Rasi Chart'}
            </h2>

            {/* South Indian 4x4 Grid Birth Chart */}
            <div
              className={`grid grid-cols-4 grid-rows-4 border rounded-lg overflow-hidden aspect-square w-full max-w-[340px] mx-auto ${
                isLight ? 'border-amber-500/30 bg-amber-50/50 shadow-inner' : 'border-violet-500/30 bg-slate-950'
              }`}
            >
              {/* Row 0 */}
              {renderRasiCell(12)}
              {renderRasiCell(1)}
              {renderRasiCell(2)}
              {renderRasiCell(3)}

              {/* Row 1 */}
              {renderRasiCell(11)}
              {/* Spans center col 1 & 2 */}
              <div
                className={`col-span-2 row-span-2 border flex flex-col items-center justify-center text-center p-2 ${
                  isLight
                    ? 'border-amber-500/30 bg-gradient-to-br from-amber-100/70 to-orange-100/50'
                    : 'border-violet-500/20 bg-slate-950'
                }`}
              >
                <p className={`font-serif text-sm font-extrabold tracking-wide ${isLight ? 'text-amber-900' : 'text-amber-400'}`}>
                  {isTamil ? 'ராசி கட்டம்' : 'Rasi Chart'}
                </p>
              </div>
              {renderRasiCell(4)}

              {/* Row 2 */}
              {renderRasiCell(10)}
              {renderRasiCell(5)}

              {/* Row 3 */}
              {renderRasiCell(9)}
              {renderRasiCell(8)}
              {renderRasiCell(7)}
              {renderRasiCell(6)}
            </div>
          </div>

          {/* ── Bhava Chakram ── */}
          {hasPlanets && bhavaChakra?.cusps && (
            <BhavaChakra
              planets={planets}
              cusps={bhavaChakra.cusps}
              isLight={isLight}
              isTamil={isTamil}
            />
          )}

          {/* ── Janana & Gochara Oppeedu ── */}
          {hasPlanets && (
            <JananaGocharaOppeedu
              planets={planets}
              gocharaPlanets={gocharaPlanets || []}
              astroDetails={astro}
              isLight={isLight}
              isTamil={isTamil}
            />
          )}

          {/* Avakahada Chakra / Astrological Details */}
          {astro && (
            <div
              className={`p-4 space-y-3 rounded-xl border transition-all ${
                isLight
                  ? 'bg-white/90 border-amber-500/20 shadow-md'
                  : 'bg-slate-900/40 border-gray-800 backdrop-blur-md'
              }`}
            >
              <h2
                className={`text-xs font-semibold tracking-wider uppercase border-b pb-2 flex items-center gap-1.5 font-sans ${
                  isLight ? 'text-amber-700 border-amber-500/20' : 'text-amber-400 border-gray-800/60'
                }`}
              >
                {isTamil ? 'அவகாஹடா சக்கரம்' : 'Avakahada Chakra'}
              </h2>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(isTamil ? AVAK_ROWS_TAMIL : AVAK_ROWS).map(({ key, label }) => {
				  const val = astro[key];
				  if (!val) return null;

				  return (
					<div
					  key={key}
					  className={`flex flex-col p-2 rounded border ${
						isLight
						  ? 'bg-amber-50/60 border-amber-500/15'
						  : 'bg-slate-950/60 border-gray-800/40'
					  }`}
					>
					  <span
						className={`text-[10px] uppercase tracking-wider font-sans font-bold ${
						  isLight ? 'text-[#7A695A]' : 'text-gray-500'
						}`}
					  >
						{label}
					  </span>

					  <span
						className={`font-semibold mt-0.5 ${
						  isLight ? 'text-[#2C241E]' : 'text-white'
						}`}
					  >
						{val}
					  </span>
					</div>
				  );
				})}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Planetary Positions Table + Predictions + Dasha */}
        <div className="lg:col-span-7 space-y-6">
          {/* Planetary Details Table */}
          {hasPlanets && (
            <div
              className={`p-4 space-y-4 rounded-xl border transition-all overflow-x-auto ${
                isLight
                  ? 'bg-white/90 border-amber-500/20 shadow-md'
                  : 'bg-slate-900/40 border-gray-800 backdrop-blur-md'
              }`}
            >
              <h2
                className={`text-xs font-semibold tracking-wider uppercase border-b pb-2 flex items-center gap-1.5 font-sans ${
                  isLight ? 'text-amber-700 border-amber-500/20' : 'text-amber-400 border-gray-800/60'
                }`}
              >
                {isTamil ? 'கிரக நிலைகள்' : 'Planet Details'}
              </h2>
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr
                    className={`border-b uppercase tracking-wider font-semibold text-[10px] ${
                      isLight ? 'border-amber-500/20 text-[#7A695A]' : 'border-gray-800/50 text-gray-400'
                    }`}
                  >
                    <th className="py-2">{isTamil ? 'கிரகம்' : 'Planet'}</th>
                    <th className="py-2">{isTamil ? 'ராசி' : 'Sign'}</th>
                    <th className="py-2">{isTamil ? 'நட்சத்திரம்' : 'Nakshatra'}</th>
                    <th className="py-2 text-center">{isTamil ? 'பாதம்' : 'Pada'}</th>
                    <th className="py-2 text-right">{isTamil ? 'பாகை' : 'Degree'}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-amber-500/15' : 'divide-gray-800/30'}`}>
                  {planets.map((p: any) => (
                    <tr
                      key={p.name}
                      className={`transition-colors ${
                        isLight ? 'hover:bg-amber-50/60' : 'hover:bg-violet-950/5'
                      }`}
                    >
                      <td className={`py-2.5 font-semibold flex items-center gap-1.5 ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>
                        <span className={`text-sm ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
                          {PLANET_GLYPHS[p.name] || '★'}
                        </span>
                        <span>{p.name}</span>
                        {p.is_retrograde && (
                          <span
                            className={`text-[9px] font-extrabold px-1 rounded uppercase tracking-wider leading-none border ${
                              isLight
                                ? 'bg-rose-100 border-rose-300 text-rose-700'
                                : 'bg-red-950 border-red-500/20 text-red-400'
                            }`}
                          >
                            R
                          </span>
                        )}
                      </td>
                      <td className={`py-2.5 ${isLight ? 'text-[#5C4F43]' : 'text-gray-300'}`}>{p.sign || '—'}</td>
                      <td className={`py-2.5 font-medium ${isLight ? 'text-amber-800' : 'text-amber-300/90'}`}>{p.nakshatra || '—'}</td>
                      <td className={`py-2.5 text-center font-bold ${isLight ? 'text-violet-700' : 'text-violet-300'}`}>
                        {p.nakshatra_pada ? `P${p.nakshatra_pada}` : '—'}
                      </td>
                      <td className={`py-2.5 text-right font-mono font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                        {normalizeDegree(p.global_degree) || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Housepredictions block */}
          {housePredictions && housePredictions.length > 0 && (
            <div
              className={`p-4 space-y-3 rounded-xl border transition-all ${
                isLight
                  ? 'bg-white/90 border-amber-500/20 shadow-md'
                  : 'bg-slate-900/40 border-gray-800 backdrop-blur-md'
              }`}
            >
              <h2
                className={`text-xs font-semibold tracking-wider uppercase border-b pb-2 flex items-center gap-1.5 font-sans ${
                  isLight ? 'text-amber-700 border-amber-500/20' : 'text-amber-400 border-gray-800/60'
                }`}
              >
                {isTamil ? 'ஜாதக பலன்கள்' : 'Astrological Characteristics'}
              </h2>
              <div className="text-xs leading-relaxed font-serif space-y-3 italic">
                {housePredictions.map((h: any, i: number) => {
                  if (!h.prediction) return null;
                  return (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border transition-all ${
                        isLight
                          ? 'bg-amber-50/50 border-amber-500/15 hover:border-amber-500/30'
                          : 'bg-slate-950/45 border-violet-500/5 hover:border-violet-500/10'
                      }`}
                    >
                      <p className={`text-xs leading-relaxed not-italic ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>
                        {h.prediction.trim()
                          .replace(/^since\s+the\s+\S+\s+lord[^,]*,\s*/i, '')
                          .replace(/^ஜாதகத்தில்[^,]*,\s*/u, '')
                          .replace(/^\d+\s*வது\s*வீட்டின்\s*அதிபதி[^,]*,[^,]*,[^,]*இருப்பதால்,\s*/u, '')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dasha Block */}
          {hasDasha && (
			  <div
				className={`p-4 space-y-4 rounded-xl border transition-all ${
				  isLight
					? 'bg-white/90 border-amber-500/20 shadow-md'
					: 'bg-slate-900/40 border-gray-800 backdrop-blur-md'
				}`}
			  >
				<h2
				  className={`text-xs font-semibold tracking-wider uppercase border-b pb-2 flex items-center gap-1.5 font-sans ${
					isLight
					  ? 'text-amber-700 border-amber-500/20'
					  : 'text-amber-400 border-gray-800/60'
				  }`}
				>
				  {isTamil ? 'திசா காலங்கள்' : 'Dasha Periods'}
				</h2>

				<div
				  className={`grid grid-cols-3 border-b pb-2 text-[10px] uppercase font-semibold tracking-wider ${
					isLight
					  ? 'border-amber-500/20 text-[#7A695A]'
					  : 'border-gray-800/50 text-gray-500'
				  }`}
				>
				  <div>{isTamil ? 'காலம்' : 'Period'}</div>
				  <div>{isTamil ? 'பிறப்பில்' : 'At Birth'}</div>
				  <div>{isTamil ? 'தற்போது' : 'Current'}</div>
				</div>

				<div className="space-y-3.5">
				  {[
					{
					  label: isTamil ? 'மகாதிசை' : 'Mahadasha',
					  birth: dashaData.birth?.mahadasha,
					  current: dashaData.current?.mahadasha,
					},
					{
					  label: isTamil ? 'அந்தர்திசை' : 'Antardasha',
					  birth: dashaData.birth?.antardasha,
					  current: dashaData.current?.antardasha,
					},
					{
					  label: isTamil ? 'பிரத்யந்தர திசை' : 'Pratyantara',
					  birth: dashaData.birth?.pratyantara,
					  current: dashaData.current?.pratyantara,
					},
				  ].map((row, i) => {
					const birthEmpty = !row.birth || row.birth === '—';
					const currentEmpty = !row.current || row.current === '—';

					return (
					  <div key={i} className="grid grid-cols-3 items-center text-xs">
						<span
						  className={`font-semibold ${
							isLight ? 'text-[#5C4F43]' : 'text-gray-400'
						  }`}
						>
						  {row.label}
						</span>

						<div className="flex items-center gap-1.5">
						  {!birthEmpty ? (
							<>
							  <span
								className={`text-sm leading-none ${
								  isLight ? 'text-violet-700' : 'text-violet-400'
								}`}
							  >
								{PLANET_GLYPHS[row.birth] || '★'}
							  </span>
							  <span
								className={`text-xs ${
								  isLight
									? 'text-[#2C241E] font-medium'
									: 'text-gray-300'
								}`}
							  >
								{row.birth}
							  </span>
							</>
						  ) : (
							<span
							  className={
								isLight ? 'text-gray-400' : 'text-gray-600'
							  }
							>
							  —
							</span>
						  )}
						</div>

						<div className="flex items-center gap-1.5 font-bold">
						  {!currentEmpty ? (
							<>
							  <span
								className={`text-sm leading-none ${
								  isLight ? 'text-amber-600' : 'text-amber-400'
								}`}
							  >
								{PLANET_GLYPHS[row.current] || '★'}
							  </span>
							  <span
								className={`text-xs ${
								  isLight ? 'text-amber-900' : 'text-amber-300'
								}`}
							  >
								{row.current}
							  </span>
							</>
						  ) : (
							<span
							  className={
								isLight ? 'text-gray-400' : 'text-gray-600'
							  }
							>
							  —
							</span>
						  )}
						</div>
					  </div>
					);
				  })}
				</div>

				{/* Dasha dates info */}
				<div
				  className={`text-[10px] flex flex-col gap-1 border-t pt-3 ${
					isLight
					  ? 'border-amber-500/15 text-[#7A695A]'
					  : 'border-gray-800/30 text-gray-500'
				  }`}
				>
				  {dashaData.birth?.date && (
					<p>
					  {isTamil ? 'பிறப்பு திசை தேதி:' : 'Birth dasha as of:'}{' '}
					  <span
						className={
						  isLight
							? 'text-[#2C241E] font-semibold'
							: 'text-gray-400'
						}
					  >
						{dashaData.birth.date}
					  </span>
					</p>
				  )}

				  {dashaData.current?.date && (
					<p>
					  {isTamil ? 'தற்போதைய திசை தேதி:' : 'Current dasha as of:'}{' '}
					  <span
						className={
						  isLight
							? 'text-[#2C241E] font-semibold'
							: 'text-gray-400'
						}
					  >
						{dashaData.current.date}
					  </span>
					</p>
				  )}
				</div>
			  </div>
			)}

          {/* Lucky factors */}
          {hasLucky && (
            <div
              className={`p-4 space-y-4 rounded-xl border transition-all ${
                isLight
                  ? 'bg-white/90 border-amber-500/20 shadow-md'
                  : 'bg-slate-900/40 border-gray-800 backdrop-blur-md'
              }`}
            >
              <h2
                className={`text-xs font-semibold tracking-wider uppercase border-b pb-2 flex items-center gap-1.5 font-sans ${
                  isLight ? 'text-amber-700 border-amber-500/20' : 'text-amber-400 border-gray-800/60'
                }`}
              >
                {isTamil ? 'அதிர்ஷ்ட காரணிகள்' : 'Lucky Factors'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lucky.numbers?.length > 0 && (
                  <div className="space-y-1.5">
                    <span
                      className={`block text-[10px] uppercase tracking-wider font-bold font-sans ${
                        isLight ? 'text-[#7A695A]' : 'text-gray-500'
                      }`}
                    >
                      Numbers
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {lucky.numbers.map((n: any, i: number) => (
                        <span
                          key={i}
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border ${
                            isLight
                              ? 'bg-violet-100 border-violet-300 text-violet-800'
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
                  <div className="space-y-1.5">
                    <span
                      className={`block text-[10px] uppercase tracking-wider font-bold font-sans ${
                        isLight ? 'text-[#7A695A]' : 'text-gray-500'
                      }`}
                    >
                      Colours
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {lucky.colors.map((c: any, i: number) => {
                        const norm = c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
                        const swatch = COLOR_SWATCHES[norm] || COLOR_SWATCHES[c] || '#888';
                        return (
                          <div
                            key={i}
                            className={`flex items-center gap-1.5 text-xs font-medium ${
                              isLight ? 'text-[#2C241E]' : 'text-gray-300'
                            }`}
                          >
                            <span
                              style={{ backgroundColor: swatch }}
                              className={`w-3.5 h-3.5 rounded-full border shadow-sm ${
                                isLight ? 'border-amber-500/30' : 'border-white/10'
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
        </div>
      </div>
    </div>
  );
}
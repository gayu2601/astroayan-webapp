import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../lib/AuthContext';
import { Sparkles, Calendar, Clock, MapPin, ChevronLeft, Award, HelpCircle } from 'lucide-react';
import { formatTo12Hour } from '../../utils/formatTime';

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

const RASI_BADGE: Record<string, { abbr: string; bg: string; fg: string }> = {
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
    housePredictions,
    dashaData,
    lucky,
  } = data;

  const hasPlanets = planets && planets.length > 0;
  const hasDasha = !!dashaData;
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
                {astro.nakshatra} {isTamil ? 'நட்சத்திரம்' : 'Star'}
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
                <p className={`text-[10px] uppercase tracking-wider font-sans mt-1 ${isLight ? 'text-amber-800/80 font-bold' : 'text-violet-400'}`}>
                  Vedic Kundli
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
                {AVAK_ROWS.map(({ key, label }) => {
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
                      <span className={`font-semibold mt-0.5 ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>
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
                        {normalizeDegree(p.local_degree) || '—'}
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
                  isLight ? 'text-amber-700 border-amber-500/20' : 'text-amber-400 border-gray-800/60'
                }`}
              >
                {isTamil ? 'திசா காலங்கள்' : 'Dasha Periods'}
              </h2>
              <div
                className={`grid grid-cols-3 border-b pb-2 text-[10px] uppercase font-semibold tracking-wider ${
                  isLight ? 'border-amber-500/20 text-[#7A695A]' : 'border-gray-800/50 text-gray-500'
                }`}
              >
                <div>Period</div>
                <div>At Birth</div>
                <div>Current</div>
              </div>
              <div className="space-y-3.5">
                {[
                  { label: 'Mahadasha', birth: dashaData.birth?.mahadasha, current: dashaData.current?.mahadasha },
                  { label: 'Antardasha', birth: dashaData.birth?.antardasha, current: dashaData.current?.antardasha },
                  { label: 'Pratyantara', birth: dashaData.birth?.pratyantara, current: dashaData.current?.pratyantara },
                ].map((row, i) => {
                  const birthEmpty = !row.birth || row.birth === '—';
                  const currentEmpty = !row.current || row.current === '—';
                  return (
                    <div key={i} className="grid grid-cols-3 items-center text-xs">
                      <span className={`font-semibold ${isLight ? 'text-[#5C4F43]' : 'text-gray-400'}`}>{row.label}</span>
                      <div className="flex items-center gap-1.5">
                        {!birthEmpty ? (
                          <>
                            <span className={`text-sm leading-none ${isLight ? 'text-violet-700' : 'text-violet-400'}`}>
                              {PLANET_GLYPHS[row.birth] || '★'}
                            </span>
                            <span className={`text-xs ${isLight ? 'text-[#2C241E] font-medium' : 'text-gray-300'}`}>{row.birth}</span>
                          </>
                        ) : (
                          <span className={isLight ? 'text-gray-400' : 'text-gray-600'}>—</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 font-bold">
                        {!currentEmpty ? (
                          <>
                            <span className={`text-sm leading-none ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
                              {PLANET_GLYPHS[row.current] || '★'}
                            </span>
                            <span className={`text-xs ${isLight ? 'text-amber-900' : 'text-amber-300'}`}>{row.current}</span>
                          </>
                        ) : (
                          <span className={isLight ? 'text-gray-400' : 'text-gray-600'}>—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dasha dates info */}
              <div
                className={`text-[10px] flex flex-col gap-1 border-t pt-3 ${
                  isLight ? 'border-amber-500/15 text-[#7A695A]' : 'border-gray-800/30 text-gray-500'
                }`}
              >
                {dashaData.birth?.date && (
                  <p>
                    Birth dasha as of: <span className={isLight ? 'text-[#2C241E] font-semibold' : 'text-gray-400'}>{dashaData.birth.date}</span>
                  </p>
                )}
                {dashaData.current?.date && (
                  <p>
                    Current dasha as of: <span className={isLight ? 'text-[#2C241E] font-semibold' : 'text-gray-400'}>{dashaData.current.date}</span>
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

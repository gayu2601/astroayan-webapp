import React, { useState, useMemo } from 'react';
import { useNakshatraPorutham } from '../../hooks/useNakshatraPorutham';
import { useTobPorutham } from '../../hooks/useTobPorutham';
import { useTranslation } from '../../hooks/useTranslation';
import { NAKSH_TAMIL } from '../../data/constants';
import { Heart, Star, Clock, AlertCircle, Sparkles, MapPin, CheckCircle, ChevronRight } from 'lucide-react';
import ScreenGuard from './ScreenGuard';

const STAR_OPTIONS = NAKSH_TAMIL.map((n, i) => ({
  label: n,
  value: i,
}));

const RASI_TAMIL_NAMES = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி',
  'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்',
];

const TAMIL_MONTHS = [
  'சித்திரை','வைகாசி','ஆனி','ஆடி','ஆவணி','புரட்டாசி',
  'ஐப்பசி','கார்த்திகை','மார்கழி','தை','மாசி','பங்குனி',
];

const TAMIL_YEAR_NAMES = [
  'பிரபவ','விபவ','சுக்ல','பிரமோதூத','பிரஜோத்பத்தி','ஆங்கீரஸ',
  'ஸ்ரீமுக','பவ','யுவ','தாது','ஈஸ்வர','வெகுதான்ய','பிரமாதி',
  'விக்ரம','விஷு','சித்ராபானu','சுபானு','தாரண','பார்த்திவ','வியய',
  'சர்வஜித்','சர்வதாரி','விரோதி','விகிருதி','கர','நந்தன','விஜய',
  'ஜய','மன்மத','துர்முகி','ஹேவிளம்பி','விளம்பி','விகாரி','சார்வரி',
  'பிலவ','சுபகிருது','சோபகிருது','குரோதி','விஸ்வாவசு','பராபவ',
  'பிலவங்க','கீலக','சௌம்ய','சாதாரண','விரோதகிருது','பரிதாபி',
  'பிரமாதீச','ஆனந்த','ராக்ஷஸ','நள','பிங்கள','காளயுக்தி',
  'சித்தார்த்தி','ரௌத்ரி','துர்மதி','துந்துபி','ருத்ரோத்காரி',
  'ரக்தாக்ஷி','குரோதன','அட்சய',
];

const COLOR_MAPS: Record<string, { bg: string; text: string; border: string }> = {
  good: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-300 dark:border-emerald-500/20' },
  med:  { bg: 'bg-amber-50 dark:bg-amber-950/40',   text: 'text-amber-700 dark:text-amber-400',   border: 'border-amber-300 dark:border-amber-500/20' },
  bad:  { bg: 'bg-red-50 dark:bg-red-950/40',     text: 'text-red-700 dark:text-red-400',     border: 'border-red-300 dark:border-red-500/20' },
};

function getSunLongitude(jd: number) {
  const n = jd - 2451545.0;
  const L = (280.46646 + 0.9856474 * n) % 360;
  const g = ((357.52911 + 0.9856003 * n) % 360) * Math.PI / 180;
  const C = 1.914602 * Math.sin(g) + 0.019993 * Math.sin(2 * g);
  return ((L + C) % 360 + 360) % 360;
}

function calcTamilDate(dateObj: Date | null): string {
  if (!dateObj) return '—';
  try {
    const jd = Math.floor(dateObj.getTime() / 86400000) + 2440588;
    const sunLon = getSunLongitude(jd);
    const monthIdx = Math.floor(sunLon / 30) % 12;
    const dayInMonth = Math.floor(sunLon % 30) + 1;
    const solarYear = dateObj.getFullYear() - 78;
    const adjustedYear = ((solarYear - 1) % 60 + 60) % 60;
    return `${TAMIL_YEAR_NAMES[adjustedYear]} ${TAMIL_MONTHS[monthIdx]} ${dayInMonth}`;
  } catch {
    return '—';
  }
}

function getImportance(key: string) {
  if (['rajju', 'nadi'].includes(key)) return 'Critical';
  if (['dina', 'tara', 'gana', 'yoni', 'rasi', 'bhakoot'].includes(key)) return 'Essential';
  return 'Medium';
}

function importanceBadgeStyle(level: string) {
  switch (level) {
    case 'Critical':
      return 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/20';
    case 'Essential':
      return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-500/20';
    default:
      return 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-500/20';
  }
}

const RASI_BADGE_STYLE: Record<string, { bg: string; text: string }> = {
  'சூரியன்':  { bg: 'bg-yellow-100 dark:bg-yellow-500/20', text: 'text-yellow-700 dark:text-yellow-300' },
  'சந்திரன்': { bg: 'bg-gray-200 dark:bg-gray-500/20', text: 'text-gray-700 dark:text-gray-300' },
  'செவ்வாய்': { bg: 'bg-red-100 dark:bg-red-500/20', text: 'text-red-700 dark:text-red-300' },
  'புதன்':    { bg: 'bg-green-100 dark:bg-green-500/20', text: 'text-green-700 dark:text-green-300' },
  'குரு':     { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-300' },
  'சுக்கிரன்':{ bg: 'bg-pink-100 dark:bg-pink-500/20', text: 'text-pink-700 dark:text-pink-300' },
  'சனி':      { bg: 'bg-violet-100 dark:bg-violet-500/20', text: 'text-violet-700 dark:text-violet-300' },
  'ராகு':     { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300' },
  'கேது':     { bg: 'bg-slate-200 dark:bg-slate-500/20', text: 'text-slate-700 dark:text-slate-300' },
};

function pad(v: number) { return String(v).padStart(2, '0'); }
function formatDate(d: Date) { return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; }
function formatOnlyTime(d: Date) { return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }

async function geocodePlace(place: string) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'PoruthamApp/1.0' } });
  const data = await res.json();
  if (!data?.length) throw new Error(`Location not found: ${place}`);
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

interface SingleKattamProps {
  planets?: any;
  accentClass: string;
  label: string;
}

function SingleKattam({ planets = {}, accentClass, label }: SingleKattamProps) {
  const rasiData: Record<number, string[]> = {};
  Object.values(planets).forEach((p: any) => {
    if (!p.rasi_no) return;
    if (!rasiData[p.rasi_no]) rasiData[p.rasi_no] = [];
    rasiData[p.rasi_no].push(p.name);
  });

  const renderCell = (rasiNo: number | null, index: number) => {
    const isCenter = rasiNo === null;
    const planetNames = rasiNo ? rasiData[rasiNo] || [] : [];
    return (
      <div
        key={index}
        className={`border border-violet-200 dark:border-violet-500/10 p-1 flex flex-col justify-between min-h-[60px] aspect-square text-center ${
          isCenter ? 'bg-violet-50 dark:bg-slate-950/40 col-span-2 row-span-2 flex items-center justify-center' : 'bg-white dark:bg-slate-950/80'
        }`}
      >
        {!isCenter && rasiNo && (
          <>
            <span className="text-[10px] font-sans text-gray-600 dark:text-gray-500 font-semibold">{rasiNo}</span>
            <span className="text-[10px] text-gray-600 dark:text-gray-400 font-bold leading-none">{RASI_TAMIL_NAMES[rasiNo - 1]}</span>
            <div className="flex flex-wrap gap-0.5 justify-center items-center mt-auto mb-auto">
              {planetNames.map((name, i) => {
                const colors = RASI_BADGE_STYLE[name] || { bg: 'bg-violet-100 dark:bg-violet-500/10', text: 'text-violet-700 dark:text-violet-400' };
                return (
                  <span key={i} className={`text-[8px] font-extrabold px-1 py-0.5 rounded leading-none ${colors.bg} ${colors.text}`}>
                    {name}
                  </span>
                );
              })}
            </div>
          </>
        )}
        {isCenter && index === 5 && (
          <div className="text-center">
            <span className={`text-xs font-serif font-extrabold block uppercase tracking-wider ${accentClass}`}>{label}</span>
          </div>
        )}
      </div>
    );
  };

  // Layout Grid representing the outer cells of 4x4
  return (
    <div className="bg-gray-50 dark:bg-slate-900/20 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col items-center w-full max-w-[340px] mx-auto space-y-2">
      <h3 className={`text-sm font-serif font-bold ${accentClass}`}>{label}</h3>
      <div className="grid grid-cols-4 grid-rows-4 border border-violet-200 dark:border-violet-500/20 rounded-lg overflow-hidden bg-white dark:bg-slate-950 aspect-square w-full">
        {/* Row 0 */}
        {renderCell(12, 0)}
        {renderCell(1, 1)}
        {renderCell(2, 2)}
        {renderCell(3, 3)}

        {/* Row 1 */}
        {renderCell(11, 4)}
        {/* Center */}
        {renderCell(null, 5)}
        {renderCell(4, 6)}

        {/* Row 2 */}
        {renderCell(10, 7)}
        {renderCell(5, 8)}

        {/* Row 3 */}
        {renderCell(9, 9)}
        {renderCell(8, 10)}
        {renderCell(7, 11)}
        {renderCell(6, 12)}
      </div>
    </div>
  );
}

export default function Porutham({ isLight = true }: { isLight?: boolean }) {
  const { t, language, isTamil } = useTranslation();
  const [tab, setTab] = useState<'star' | 'time'>('star');
  
  // Star inputs
  const [girlStar, setGirlStar] = useState<number | null>(null);
  const [boyStar, setBoyStar] = useState<number | null>(null);
  
  // TOB inputs
  const [girlDob, setGirlDob] = useState<string>('');
  const [girlTob, setGirlTob] = useState<string>('');
  const [girlPlace, setGirlPlace] = useState<string>('');
  const [boyDob, setBoyDob] = useState<string>('');
  const [boyTob, setBoyTob] = useState<string>('');
  const [boyPlace, setBoyPlace] = useState<string>('');

  const [apiInput, setApiInput] = useState<any>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { porutham: nakshatraPorutham, loading: nakLoading, error: nakError } =
    useNakshatraPorutham(tab === 'star' ? apiInput : null);

  const { porutham: tobPorutham, loading: tobLoading, error: tobError } =
    useTobPorutham(tab === 'time' ? apiInput : null);

  const handleCheck = async () => {
    setLocalError(null);
    if (tab === 'star') {
      if (girlStar === null || boyStar === null) {
        setLocalError(isTamil ? 'பெண் மற்றும் ஆண் நட்சத்திரங்களை தேர்ந்தெடுக்கவும்' : 'Please select both Girl and Boy Nakshatras');
        return;
      }
      setApiInput({
		api_key: '6a0b4e5a-b8d5-5e1a-bd97-6128ad38d349', 
        boy_star: boyStar + 1,
        girl_star: girlStar + 1,
        lang: language,
      });
      return;
    }

    if (!girlDob || !girlTob || !girlPlace || !boyDob || !boyTob || !boyPlace) {
      setLocalError(isTamil ? 'அனைத்து விவரங்களையும் பூர்த்தி செய்யவும்' : 'Please fill all details');
      return;
    }

    setLocalLoading(true);
    try {
      const girlCoords = await geocodePlace(girlPlace);
      const boyCoords = await geocodePlace(boyPlace);
      
      const parsedGirlDob = new Date(`${girlDob}T${girlTob}`);
      const parsedBoyDob = new Date(`${boyDob}T${boyTob}`);

      setApiInput({
		api_key: '6a0b4e5a-b8d5-5e1a-bd97-6128ad38d349',   
        boy_dob: formatDate(parsedBoyDob),
        boy_tob: formatOnlyTime(parsedBoyDob),
        girl_dob: formatDate(parsedGirlDob),
        girl_tob: formatOnlyTime(parsedGirlDob),
        boy_lat: boyCoords.lat,
        boy_lon: boyCoords.lon,
        girl_lat: girlCoords.lat,
        girl_lon: girlCoords.lon,
        boy_tz: -(parsedBoyDob.getTimezoneOffset() / 60),
        girl_tz: -(parsedGirlDob.getTimezoneOffset() / 60),
        lang: language,
      });
    } catch (e: any) {
      setLocalError(e.message);
    } finally {
      setLocalLoading(false);
    }
  };

  const result = tab === 'star' ? nakshatraPorutham : tobPorutham;
  const loading = (tab === 'star' ? nakLoading : tobLoading) || localLoading;
  const error = (tab === 'star' ? nakError : tobError) || localError;
  const score = result?.score || 0;

  const excludedKeys = [
    'score', 'bot_response',
    'boy_planetary_details', 'girl_planetary_details',
    'boy_astro_details', 'girl_astro_details',
  ];

  const rows = result
    ? Object.entries(result)
        .filter(([key]) => !excludedKeys.includes(key))
        .map(([key, value]: any) => ({ key, ...value }))
    : [];

  const verdictColor =
    tab === 'time'
      ? score >= 24 ? 'text-emerald-700 dark:text-emerald-400' : score >= 18 ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400'
      : score >= 7  ? 'text-emerald-700 dark:text-emerald-400' : score >= 5  ? 'text-amber-700 dark:text-amber-400' : 'text-red-700 dark:text-red-400';

  const verdictText =
    tab === 'time'
      ? score >= 24 ? (t('porutham.verdict.excellent') || 'Excellent Match') : score >= 18 ? (t('porutham.verdict.good') || 'Good Match') : (t('porutham.verdict.notRec') || 'Not Recommended')
      : score >= 7  ? (t('porutham.verdict.excellent') || 'Excellent Match') : score >= 5  ? (t('porutham.verdict.good') || 'Good Match') : (t('porutham.verdict.notRec') || 'Not Recommended');

  return (
  <ScreenGuard featureId="porutham_mrg">
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* ── Form Card ── */}
      <div className="bg-white dark:bg-slate-900/40 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xl backdrop-blur-md space-y-5">
        <div className="flex items-center gap-2 text-pink-600 dark:text-pink-500">
          <Heart className="w-5 h-5 fill-pink-500 animate-pulse" />
          <h2 className="text-md font-bold uppercase tracking-wider font-sans">
            {t('porutham.title') || (isTamil ? 'திருமண பொருத்தம்' : 'Marriage Porutham')}
          </h2>
        </div>

        {/* 2-Tab Switcher */}
        <div className="flex bg-gray-100 dark:bg-slate-950/60 p-1 rounded-lg border border-gray-200 dark:border-gray-800 max-w-md">
          <button
            onClick={() => { setTab('star'); setApiInput(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
              tab === 'star' ? 'bg-violet-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t('porutham.tabStar') || (isTamil ? 'நட்சத்திர பொருத்தம்' : 'Star Matching')}
          </button>
          <button
            onClick={() => { setTab('time'); setApiInput(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
              tab === 'time' ? 'bg-violet-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t('porutham.tabTime') || (isTamil ? 'பிறந்த நேர பொருத்தம்' : 'TOB Matching')}
          </button>
        </div>

        {tab === 'star' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider block">
                👩 {t('porutham.girlStar') || 'Girl\'s Star'}
              </label>
              <select
                value={girlStar ?? ''}
                onChange={(e) => setGirlStar(e.target.value === '' ? null : Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm outline-none transition-all"
              >
                <option value="">{isTamil ? '-- தேர்ந்தெடு --' : '-- Select --'}</option>
                {STAR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider block">
                👦 {t('porutham.boyStar') || 'Boy\'s Star'}
              </label>
              <select
                value={boyStar ?? ''}
                onChange={(e) => setBoyStar(e.target.value === '' ? null : Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm outline-none transition-all"
              >
                <option value="">{isTamil ? '-- தேர்ந்தெடு --' : '-- Select --'}</option>
                {STAR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Girl Details */}
            <div className="border-l-2 border-pink-500 pl-3 space-y-3">
              <h3 className="text-xs font-extrabold text-pink-700 dark:text-pink-400 uppercase tracking-wider font-sans">
                👩 {t('porutham.girlDetails') || 'Girl\'s Birth Details'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-600 dark:text-gray-500 uppercase tracking-wider font-bold">Birth Date</span>
                  <input
                    type="date"
                    value={girlDob}
                    onChange={(e) => setGirlDob(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-600 dark:text-gray-500 uppercase tracking-wider font-bold">Birth Time</span>
                  <input
                    type="time"
                    value={girlTob}
                    onChange={(e) => setGirlTob(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-600 dark:text-gray-500 uppercase tracking-wider font-bold">Birth Place</span>
                  <input
                    type="text"
                    value={girlPlace}
                    onChange={(e) => setGirlPlace(e.target.value)}
                    placeholder={t('porutham.girlPlaceLabel') || 'e.g. Chennai, Tamil Nadu'}
                    className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Boy Details */}
            <div className="border-l-2 border-blue-500 pl-3 space-y-3">
              <h3 className="text-xs font-extrabold text-blue-700 dark:text-blue-400 uppercase tracking-wider font-sans">
                👦 {t('porutham.boyDetails') || 'Boy\'s Birth Details'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-600 dark:text-gray-500 uppercase tracking-wider font-bold">Birth Date</span>
                  <input
                    type="date"
                    value={boyDob}
                    onChange={(e) => setBoyDob(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-600 dark:text-gray-500 uppercase tracking-wider font-bold">Birth Time</span>
                  <input
                    type="time"
                    value={boyTob}
                    onChange={(e) => setBoyTob(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-600 dark:text-gray-500 uppercase tracking-wider font-bold">Birth Place</span>
                  <input
                    type="text"
                    value={boyPlace}
                    onChange={(e) => setBoyPlace(e.target.value)}
                    placeholder={t('porutham.boyPlaceLabel') || 'e.g. Madurai, Tamil Nadu'}
                    className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleCheck}
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-semibold text-xs py-2.5 rounded-lg transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-10 mt-4"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{isTamil ? 'பொருத்தம் கணிக்கப்படுகிறது...' : 'Calculating Porutham...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{t('porutham.checkBtn') || (isTamil ? 'பொருத்தம் காண்க' : 'Check Match')}</span>
            </>
          )}
        </button>
      </div>

      {/* ── Error Banner ── */}
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20 rounded-xl p-4 flex items-center gap-2.5 text-xs text-red-700 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Result Block ── */}
      {result && !loading && !error && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Score Card */}
          <div className="bg-white dark:bg-slate-900/40 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-amber-700 dark:text-amber-400 border-b border-gray-200 dark:border-gray-800/60 pb-2 mb-4 font-sans">
              {t('porutham.result') || 'Matching Score & Verdict'}
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Giant Radial/Circle Score Emblem */}
              <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-950 border-4 border-violet-300 dark:border-violet-500/30 flex flex-col items-center justify-center relative shadow-lg">
                <span className="text-2xl font-serif font-black text-amber-600 dark:text-amber-400 leading-none">{score}</span>
                <span className="text-[10px] text-gray-600 dark:text-gray-500 font-sans mt-0.5 font-bold uppercase tracking-wider">
                  / {tab === 'time' ? 36 : 10}
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <h4 className={`text-xl font-extrabold font-serif ${verdictColor}`}>{verdictText}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-sans font-medium">
                  {result.bot_response || (isTamil ? 'திருமணப் பொருத்தம் திருப்திகரமாக உள்ளது' : 'This is a harmonious matching.')}
                </p>
              </div>
            </div>
          </div>

          {/* Porutham Characteristics Table */}
          <div className="bg-white dark:bg-slate-900/40 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-xs font-semibold tracking-wider uppercase text-amber-700 dark:text-amber-400 border-b border-gray-200 dark:border-gray-800/60 pb-2 font-sans">
              {isTamil ? 'பொருத்தங்களின் விவரங்கள்' : '10 Porutham Attributes'}
            </h3>

            <div className="divide-y divide-gray-200 dark:divide-gray-800/40">
              {rows.map((r: any) => {
                const val = r[r.key] || 0;
                const percent = (val / r.full_score) * 100;
                const importance = getImportance(r.key);

                let badgeLabel = t('porutham.noMatch') || 'No Match';
                let tagType = 'bad';

                if (percent >= 75) {
                  badgeLabel = r.key === 'vedha' ? 'No Vedha' : (t('porutham.matches') || 'Matches');
                  tagType = 'good';
                } else if (percent >= 35) {
                  badgeLabel = t('porutham.partial') || 'Partial Match';
                  tagType = 'med';
                }

                const colors = COLOR_MAPS[tagType];

                return (
                  <div key={r.key} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-white font-serif">{r.name}</span>
                        <span className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded ${importanceBadgeStyle(importance)}`}>
                          {importance}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-normal">{r.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold font-mono text-gray-600 dark:text-gray-400">{val} / {r.full_score}</span>
                      <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                        {badgeLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kattam Views (For Time matching only) */}
          {tab === 'time' && result.boy_planetary_details && result.girl_planetary_details && (
            <div className="bg-white dark:bg-slate-900/40 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xl backdrop-blur-md space-y-4">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-amber-700 dark:text-amber-400 border-b border-gray-200 dark:border-gray-800/60 pb-2 font-sans">
                {t('porutham.kattamTitle') || 'Rasi Charts Comparison'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SingleKattam
                  planets={result.girl_planetary_details}
                  accentClass="text-pink-600 dark:text-pink-400"
                  label={t('porutham.kattam.girl') || 'Girl\'s Chart'}
                />
                <SingleKattam
                  planets={result.boy_planetary_details}
                  accentClass="text-blue-600 dark:text-blue-400"
                  label={t('porutham.kattam.boy') || 'Boy\'s Chart'}
                />
              </div>
            </div>
          )}

          {/* Astro Comparison Table (Dasha/Lagna details) */}
          {(result.boy_astro_details || result.girl_astro_details) && (
            <div className="bg-white dark:bg-slate-900/40 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xl backdrop-blur-md space-y-4">
              <h3 className="text-xs font-semibold tracking-wider uppercase text-amber-700 dark:text-amber-400 border-b border-gray-200 dark:border-gray-800/60 pb-2 font-sans">
                {t('porutham.astroTitle') || 'Astrological Comparison'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Girl Details */}
                <div className="bg-pink-50 dark:bg-slate-950/45 border border-pink-200 dark:border-pink-500/10 rounded-lg p-4 space-y-3">
                  <h4 className="text-xs font-extrabold text-pink-700 dark:text-pink-400 border-b border-gray-200 dark:border-gray-800 pb-1 uppercase tracking-wider font-sans">
                    👩 {t('porutham.girlDetails') || 'Girl Details'}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-900/40">
                      <span className="text-gray-600 dark:text-gray-500 font-bold font-sans">Ascendant</span>
                      <span className="text-gray-900 dark:text-white font-medium">{result.girl_astro_details?.ascendant_sign || '—'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-900/40">
                      <span className="text-gray-600 dark:text-gray-500 font-bold font-sans">Rasi (Moon)</span>
                      <span className="text-gray-900 dark:text-white font-medium">{result.girl_astro_details?.rasi || '—'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-900/40">
                      <span className="text-gray-600 dark:text-gray-500 font-bold font-sans">Star</span>
                      <span className="text-amber-700 dark:text-amber-400 font-medium">{result.girl_astro_details?.nakshatra || '—'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-900/40">
                      <span className="text-gray-600 dark:text-gray-500 font-bold font-sans">Birth Dasha</span>
                      <span className="text-violet-700 dark:text-violet-400 font-medium font-mono">{result.girl_astro_details?.birth_dasa || '—'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-900/40">
                      <span className="text-gray-600 dark:text-gray-500 font-bold font-sans">Current Dasha</span>
                      <span className="text-amber-700 dark:text-amber-400 font-medium font-mono">{result.girl_astro_details?.current_dasa || '—'}</span>
                    </div>
                    {result.girl_astro_details?.lucky_gem?.length > 0 && (
                      <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-900/40">
                        <span className="text-gray-600 dark:text-gray-500 font-bold font-sans">Lucky Gemstone</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">{result.girl_astro_details.lucky_gem.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Boy Details */}
                <div className="bg-blue-50 dark:bg-slate-950/45 border border-blue-200 dark:border-blue-500/10 rounded-lg p-4 space-y-3">
                  <h4 className="text-xs font-extrabold text-blue-700 dark:text-blue-400 border-b border-gray-200 dark:border-gray-800 pb-1 uppercase tracking-wider font-sans">
                    👦 {t('porutham.boyDetails') || 'Boy Details'}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-900/40">
                      <span className="text-gray-600 dark:text-gray-500 font-bold font-sans">Ascendant</span>
                      <span className="text-gray-900 dark:text-white font-medium">{result.boy_astro_details?.ascendant_sign || '—'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-900/40">
                      <span className="text-gray-600 dark:text-gray-500 font-bold font-sans">Rasi (Moon)</span>
                      <span className="text-gray-900 dark:text-white font-medium">{result.boy_astro_details?.rasi || '—'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-900/40">
                      <span className="text-gray-600 dark:text-gray-500 font-bold font-sans">Star</span>
                      <span className="text-amber-700 dark:text-amber-400 font-medium">{result.boy_astro_details?.nakshatra || '—'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-900/40">
                      <span className="text-gray-600 dark:text-gray-500 font-bold font-sans">Birth Dasha</span>
                      <span className="text-violet-700 dark:text-violet-400 font-medium font-mono">{result.boy_astro_details?.birth_dasa || '—'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-900/40">
                      <span className="text-gray-600 dark:text-gray-500 font-bold font-sans">Current Dasha</span>
                      <span className="text-amber-700 dark:text-amber-400 font-medium font-mono">{result.boy_astro_details?.current_dasa || '—'}</span>
                    </div>
                    {result.boy_astro_details?.lucky_gem?.length > 0 && (
                      <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-900/40">
                        <span className="text-gray-600 dark:text-gray-500 font-bold font-sans">Lucky Gemstone</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-medium">{result.boy_astro_details.lucky_gem.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
	</ScreenGuard>
  );
}

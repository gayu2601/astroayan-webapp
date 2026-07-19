import React, { useState, useEffect } from 'react';
import { usePanchang } from '../../hooks/usePanchang';
import { useTranslation } from '../../hooks/useTranslation';
import { computeNallaNeram } from '../../data/nallaNeramUtils';
import { Calendar, Sun, Moon, AlertTriangle, Sparkles, ChevronRight, RefreshCw, Compass } from 'lucide-react';
import ScreenGuard from './ScreenGuard';

const FALLBACK_COORDS = { lat: 13.0827, lon: 80.2707 }; // Default to Chennai

const getCoords = (): Promise<{ lat: number; lon: number }> =>
  new Promise((resolve) => {
    const fallback = () => resolve(FALLBACK_COORDS);
    if (typeof window !== 'undefined' && navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        fallback,
        { timeout: 8000, maximumAge: 60000 }
      );
    } else {
      fallback();
    }
  });

function buildInput(d: Date, coords: { lat: number; lon: number }, language: string) {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return {
	api_key: '6a0b4e5a-b8d5-5e1a-bd97-6128ad38d349',  
    date: `${day}/${month}/${year}`,
    time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
    lat: coords.lat,
    lon: coords.lon,
    tz: 5.5, // Standard India timezone fallback or offset
    lang: language,
  };
}

const HORA_STYLES_LIGHT: Record<string, { bg: string; border: string; text: string }> = {
  labam:  { bg: 'bg-emerald-50/50', border: 'border-emerald-200/60', text: 'text-emerald-700' },
  amirt:  { bg: 'bg-teal-50/50', border: 'border-teal-200/60', text: 'text-teal-700' },
  sukam:  { bg: 'bg-pink-50/50', border: 'border-pink-200/60', text: 'text-pink-700' },
  uthi:   { bg: 'bg-amber-50/50', border: 'border-amber-200/60', text: 'text-amber-700' },
  danam:  { bg: 'bg-blue-50/50', border: 'border-blue-200/60', text: 'text-blue-700' },
  soram:  { bg: 'bg-red-50/50', border: 'border-red-200/60', text: 'text-red-700' },
  visham: { bg: 'bg-purple-50/50', border: 'border-purple-200/60', text: 'text-purple-700' },
  rogam:  { bg: 'bg-orange-50/50', border: 'border-orange-200/60', text: 'text-orange-700' },
  sorala: { bg: 'bg-yellow-50/50', border: 'border-yellow-200/60', text: 'text-yellow-700' },
};

const HORA_STYLES_DARK: Record<string, { bg: string; border: string; text: string }> = {
  labam:  { bg: 'bg-emerald-950/40', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  amirt:  { bg: 'bg-teal-950/40', border: 'border-teal-500/20', text: 'text-teal-400' },
  sukam:  { bg: 'bg-pink-950/40', border: 'border-pink-500/20', text: 'text-pink-400' },
  uthi:   { bg: 'bg-amber-950/40', border: 'border-amber-500/20', text: 'text-amber-400' },
  danam:  { bg: 'bg-blue-950/40', border: 'border-blue-500/20', text: 'text-blue-400' },
  soram:  { bg: 'bg-red-950/40', border: 'border-red-500/20', text: 'text-red-400' },
  visham: { bg: 'bg-purple-950/40', border: 'border-purple-500/20', text: 'text-purple-400' },
  rogam:  { bg: 'bg-orange-950/40', border: 'border-orange-500/20', text: 'text-orange-400' },
  sorala: { bg: 'bg-yellow-950/40', border: 'border-yellow-500/20', text: 'text-yellow-400' },
};

const normalizeHoraName = (name = '') => {
  const n = name.toLowerCase().trim();
  if (n.includes('லாபம்') || n.includes('labam')) return 'labam';
  if (n.includes('அமிர்த') || n.includes('amirt')) return 'amirt';
  if (n.includes('சுகம்') || n.includes('sukam')) return 'sukam';
  if (n.includes('உத்தி') || n.includes('uthi')) return 'uthi';
  if (n.includes('dhanam') || n.includes('தனம்') || n.includes('danam')) return 'danam';
  if (n.includes('சோரம்') || n.includes('soram')) return 'soram';
  if (n.includes('விஷம்') || n.includes('visham')) return 'visham';
  if (n.includes('ரோகம்') || n.includes('rogam')) return 'rogam';
  if (n.includes('சோரளா') || n.includes('sorala')) return 'sorala';
  return null;
};

interface PanchangamProps {
  isLight?: boolean;
}

export default function Panchangam({ isLight = false }: PanchangamProps) {
  const { t, language, isTamil } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [coordsLoading, setCoordsLoading] = useState(false);
  const [panchangInput, setPanchangInput] = useState<any>(null);

  const { panchang, gowriNallaNeram, chandrashtama, loading, error, refetch } = usePanchang(panchangInput);

  // Trigger calculation automatically on mount
  useEffect(() => {
    const loadOnMount = async () => {
      setCoordsLoading(true);
      const coords = await getCoords();
      setCoordsLoading(false);
      
      const today = new Date();
      setPanchangInput(buildInput(today, coords, language));
    };
    loadOnMount();
  }, [language]);

  const handleCalculate = async () => {
    if (!selectedDate) return;
    setCoordsLoading(true);
    const coords = await getCoords();
    setCoordsLoading(false);
    
    const [year, month, day] = selectedDate.split('-').map(Number);
    const todayWithTime = new Date();
    const targetDate = new Date(year, month - 1, day, todayWithTime.getHours(), todayWithTime.getMinutes());
    
    setPanchangInput(buildInput(targetDate, coords, language));
  };

  const pan = panchang;
  const adv = pan?.advanced_details;
  const masa = adv?.masa;
  const chandrashtamaStr = chandrashtama || 'None';

  // Auspicious times helper (based on hook's sunrise details)
  const nn = pan && adv?.sun_rise ? computeNallaNeram(adv.sun_rise, new Date(selectedDate).getDay()) : null;

  return (
  <ScreenGuard featureId="panchang">
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* ── Selector Card ── */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 ${
        isLight 
          ? "bg-white/80 border-[#E8DCC4] shadow-sm text-[#1E120A]" 
          : "bg-black/35 border-white/5 text-gray-100 shadow-xl shadow-black/20"
      }`}>
        <div className="flex items-center gap-2 text-amber-500">
          <Sun className="w-5 h-5 animate-spin-slow text-amber-500" />
          <h2 className="text-md font-serif font-black uppercase tracking-wider">
            {t('panchang.title') || (isTamil ? 'தினசரி பஞ்சாங்கம்' : 'Daily Panchang')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mt-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-black uppercase tracking-wider block text-gray-400">
              {t('common.selectDate') || (isTamil ? 'தேதியைத் தேர்ந்தெடுக்கவும்' : 'Select Date')}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-amber-500">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={`w-full border focus:ring-1 focus:ring-amber-500/30 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all ${
                  isLight
                    ? "bg-[#FCFBF7] border-[#E8DCC4] text-[#1E120A] focus:border-amber-500"
                    : "bg-slate-950/60 border-white/10 text-white focus:border-amber-500"
                }`}
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={loading || coordsLoading}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-black text-xs py-3 rounded-xl transition-all shadow-lg shadow-amber-500/10 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-11"
          >
            {(loading || coordsLoading) ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t('panchang.loading') || 'Calculating...'}</span>
              </>
            ) : (
              <>
                <Compass className="w-4 h-4" />
                <span>{t('panchang.btn') || (isTamil ? 'பஞ்சாங்கம் காண்க' : 'Calculate Panchang')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Loader ── */}
      {(loading || coordsLoading) && (
        <div className={`border rounded-2xl p-10 flex flex-col items-center justify-center space-y-3 ${
          isLight ? "bg-white/50 border-[#E8DCC4]/50" : "bg-slate-900/20 border-white/5"
        }`}>
          <RefreshCw className="w-6 h-6 text-amber-500 animate-spin" />
          <p className="text-xs text-gray-400 font-serif">
            {t('panchang.loading') || (isTamil ? 'பஞ்சாங்கம் கணிக்கப்படுகிறது...' : 'Loading Panchang details...')}
          </p>
        </div>
      )}

      {/* ── Error state ── */}
      {error && !loading && !coordsLoading && (
        <div className={`border rounded-2xl p-6 text-center space-y-3 ${
          isLight ? "bg-red-50/50 border-red-200" : "bg-slate-900/30 border-red-500/20"
        }`}>
          <p className="text-xs text-red-500 font-bold">
            {t('common.dataNotFound') || 'Data unavailable'}: {error}
          </p>
          <button
            onClick={handleCalculate}
            className="px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold text-xs rounded-xl transition-all hover:scale-[1.02]"
          >
            {t('common.retry') || 'Try Again'}
          </button>
        </div>
      )}

      {/* ── Results Block ── */}
      {pan && !loading && !error && (
        <div className="space-y-6 animate-fade-in">
          {/* Panchang Header */}
          <div className={`flex flex-wrap items-center justify-between gap-3 border-l-4 rounded-2xl px-5 py-4 border ${
            isLight
              ? "bg-violet-50/70 border-violet-200 border-l-violet-600 text-[#1E120A]"
              : "bg-violet-950/20 border-white/5 border-l-violet-500 text-violet-300"
          }`}>
            <span className="text-md font-serif font-black tracking-wide">
              📅 {pan.date}
            </span>
            {masa?.paksha && (
              <span className={`px-3 py-1 text-xs rounded-full font-bold border ${
                isLight
                  ? "bg-violet-100 border-violet-300/40 text-violet-800"
                  : "bg-violet-500/10 border-violet-500/20 text-violet-300"
              }`}>
                {masa.paksha}
              </span>
            )}
          </div>

          {/* 6 Themed Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Tithi */}
            <div className={`border rounded-2xl p-5 flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 ${
              isLight
                ? "bg-white border-violet-200/80 shadow-sm hover:shadow-md"
                : "bg-black/35 border-violet-500/20 hover:border-violet-500/40"
            }`}>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-violet-500 font-black block mb-1">
                  {t('panchang.tithi') || 'Tithi'}
                </span>
                <h3 className={`text-lg font-serif font-black leading-tight ${isLight ? "text-[#1E120A]" : "text-white"}`}>{pan.tithi?.name}</h3>
              </div>
              <div className={`mt-4 space-y-1 text-xs border-t pt-2 ${isLight ? "border-violet-100" : "border-gray-800/60"}`}>
                <p className={`font-mono text-[11px] font-medium ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>{pan.tithi?.start} – {pan.tithi?.end}</p>
                {pan.tithi?.next_tithi && <p className="text-[10px] text-violet-500 font-bold truncate">→ {pan.tithi.next_tithi}</p>}
              </div>
            </div>

            {/* Vaara */}
            <div className={`border rounded-2xl p-5 flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 ${
              isLight
                ? "bg-white border-amber-200/80 shadow-sm hover:shadow-md"
                : "bg-black/35 border-amber-500/20 hover:border-amber-500/40"
            }`}>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-amber-500 font-black block mb-1">
                  {t('panchang.day') || 'Day'}
                </span>
                <h3 className={`text-lg font-serif font-black leading-tight ${isLight ? "text-[#1E120A]" : "text-white"}`}>{pan.day?.name}</h3>
                {adv?.vaara && <p className="text-xs text-amber-600 font-bold mt-1.5">{adv.vaara}</p>}
              </div>
            </div>

            {/* Nakshatra */}
            <div className={`border rounded-2xl p-5 flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 ${
              isLight
                ? "bg-white border-emerald-200/80 shadow-sm hover:shadow-md"
                : "bg-black/35 border-emerald-500/20 hover:border-emerald-500/40"
            }`}>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-black block mb-1">
                  {t('panchang.nakshatra') || 'Nakshatra'}
                </span>
                <h3 className={`text-lg font-serif font-black leading-tight ${isLight ? "text-[#1E120A]" : "text-white"}`}>{pan.nakshatra?.name}</h3>
              </div>
              <div className={`mt-4 space-y-1 text-xs border-t pt-2 ${isLight ? "border-emerald-100" : "border-gray-800/60"}`}>
                <p className={`font-mono text-[11px] font-medium ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>{pan.nakshatra?.start} – {pan.nakshatra?.end}</p>
                {pan.nakshatra?.next_nakshatra && <p className="text-[10px] text-emerald-500 font-bold truncate">→ {pan.nakshatra.next_nakshatra}</p>}
              </div>
            </div>

            {/* Yoga */}
            <div className={`border rounded-2xl p-5 flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 ${
              isLight
                ? "bg-white border-indigo-200/80 shadow-sm hover:shadow-md"
                : "bg-black/35 border-indigo-500/20 hover:border-indigo-500/40"
            }`}>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-indigo-500 font-black block mb-1">
                  {t('panchang.yoga') || 'Yoga'}
                </span>
                <h3 className={`text-lg font-serif font-black leading-tight ${isLight ? "text-[#1E120A]" : "text-white"}`}>{pan.yoga?.name}</h3>
                {pan.yoga?.meaning && <p className={`text-[11px] leading-normal mt-1.5 font-medium ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>{pan.yoga.meaning} · #{pan.yoga.number}</p>}
              </div>
              <div className={`mt-4 space-y-1 text-xs border-t pt-2 ${isLight ? "border-indigo-100" : "border-gray-800/60"}`}>
                <p className={`font-mono text-[11px] font-medium ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>{pan.yoga?.start} – {pan.yoga?.end}</p>
                {pan.yoga?.next_yoga && <p className="text-[10px] text-indigo-500 font-bold truncate">→ {pan.yoga.next_yoga}</p>}
              </div>
            </div>

            {/* Karana */}
            <div className={`border rounded-2xl p-5 flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 ${
              isLight
                ? "bg-white border-fuchsia-200/80 shadow-sm hover:shadow-md"
                : "bg-black/35 border-fuchsia-500/20 hover:border-fuchsia-500/40"
            }`}>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-fuchsia-500 font-black block mb-1">
                  {t('panchang.karana') || 'Karana'}
                </span>
                <h3 className={`text-lg font-serif font-black leading-tight ${isLight ? "text-[#1E120A]" : "text-white"}`}>{pan.karana?.name}</h3>
              </div>
              <div className={`mt-4 space-y-1 text-xs border-t pt-2 ${isLight ? "border-fuchsia-100" : "border-gray-800/60"}`}>
                <p className={`font-mono text-[11px] font-medium ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>{pan.karana?.start} – {pan.karana?.end}</p>
                {pan.karana?.next_karana && <p className="text-[10px] text-fuchsia-500 font-bold truncate">→ {pan.karana.next_karana}</p>}
              </div>
            </div>

            {/* Tamil Month */}
            <div className={`border rounded-2xl p-5 flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 ${
              isLight
                ? "bg-white border-teal-200/80 shadow-sm hover:shadow-md"
                : "bg-black/35 border-teal-500/20 hover:border-teal-500/40"
            }`}>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-teal-500 font-black block mb-1">
                  {t('panchang.month') || 'Tamil Month'}
                </span>
                <h3 className={`text-lg font-serif font-black leading-tight ${isLight ? "text-[#1E120A]" : "text-white"}`}>{masa?.tamil_month || '—'}</h3>
                {masa?.ritu_tamil && <p className="text-xs text-teal-600 font-bold mt-1.5">{masa.ritu_tamil} · {masa.ayana}</p>}
              </div>
            </div>
          </div>

          {/* Sun & Moon bar */}
          <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 border rounded-2xl p-5 text-xs transition-all duration-300 ${
            isLight
              ? "bg-amber-50/50 border-amber-200 text-[#1E120A]"
              : "bg-black/35 border-amber-500/15 text-amber-200 shadow-lg"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌅</span>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-black block">{t('panchang.sunrise') || 'Sunrise'}</span>
                <span className="font-mono font-black text-sm text-amber-500">{adv?.sun_rise || '—'}</span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-[11px] text-amber-600 font-black italic">
                🌕 {isTamil ? 'பௌர்ணமி' : 'Full Moon'}: {adv?.next_full_moon} &nbsp;·&nbsp; 🌑 {isTamil ? 'அமாவாசை' : 'New Moon'}: {adv?.next_new_moon}
              </p>
            </div>

            <div className="flex items-center gap-3 sm:text-right">
              <div className="sm:text-right">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-black block">{t('panchang.sunset') || 'Sunset'}</span>
                <span className="font-mono font-black text-sm text-amber-500">{adv?.sun_set || '—'}</span>
              </div>
              <span className="text-2xl">🌇</span>
            </div>
          </div>

          {/* Dynamic Nalla Neram (Auspicious Section) */}
          <div className={`border rounded-3xl p-6 space-y-4 shadow-sm transition-all duration-300 ${
            isLight
              ? "bg-emerald-50/40 border-emerald-200"
              : "bg-black/35 border-emerald-500/10 shadow-emerald-500/5"
          }`}>
            <h3 className="text-xs font-black tracking-wider uppercase text-emerald-600 flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-emerald-500 animate-pulse" />
              {t('panchang.auspicious') || 'Auspicious Times'}
            </h3>
            
            <div className="grid grid-cols-3 border-b border-gray-700/10 pb-2 text-[10px] uppercase font-black text-gray-500 tracking-wider">
              <div>{' '}</div>
              <div className="text-center">{t('panchang.nallaTime') || 'Nalla Neram'}</div>
              <div className="text-center">{t('panchang.gowriTime') || 'Gowri Nalla Neram'}</div>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 py-1 items-center">
                <span className="font-black text-gray-500">{t('panchang.morning') || 'Morning'}</span>
                <div className="text-center text-emerald-600 font-black font-mono">{nn?.nallaMorning || '—'}</div>
                <div className="text-center text-amber-600 font-black font-mono">{nn?.gowriMorning || '—'}</div>
              </div>
              <div className="grid grid-cols-3 py-1 items-center">
                <span className="font-black text-gray-500">{t('panchang.evening') || 'Evening'}</span>
                <div className="text-center text-emerald-600 font-black font-mono">{nn?.nallaEvening || '—'}</div>
                <div className="text-center text-amber-600 font-black font-mono">{nn?.gowriEvening || '—'}</div>
              </div>
            </div>

            {adv?.abhijit_muhurta?.start && (
              <div className="flex items-center gap-2.5 border-t border-gray-700/10 pt-4 text-xs">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  isLight
                    ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                }`}>
                  {t('panchang.abhijit') || 'Abhijit Muhurtham'}
                </span>
                <span className={`font-mono font-black ${isLight ? "text-[#1E120A]" : "text-white"}`}>
                  {adv.abhijit_muhurta.start} – {adv.abhijit_muhurta.end}
                </span>
              </div>
            )}
          </div>

          {/* Inauspicious Section */}
          <div className={`border rounded-3xl p-6 space-y-4 shadow-sm transition-all duration-300 ${
            isLight
              ? "bg-red-50/40 border-red-200"
              : "bg-black/35 border-red-500/10 shadow-red-500/5"
          }`}>
            <h3 className="text-xs font-black tracking-wider uppercase text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
              {t('panchang.inauspicious') || 'Inauspicious Times'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Rahukaal */}
              <div className={`flex items-center justify-between p-3.5 rounded-xl border ${
                isLight
                  ? "bg-red-50 border-red-200/60 text-red-900"
                  : "bg-red-950/20 border-red-500/10 text-red-300"
              }`}>
                <span className="text-[10px] uppercase tracking-wider font-black">{t('panchang.rahukaal') || 'Rahu Kalam'}</span>
                <span className="text-xs font-black font-mono">{pan.rahukaal}</span>
              </div>

              {/* Yamakantam */}
              <div className={`flex items-center justify-between p-3.5 rounded-xl border ${
                isLight
                  ? "bg-orange-50 border-orange-200/60 text-orange-900"
                  : "bg-orange-950/20 border-orange-500/10 text-orange-300"
              }`}>
                <span className="text-[10px] uppercase tracking-wider font-black">{t('panchang.yamakantam') || 'Yamakantam'}</span>
                <span className="text-xs font-black font-mono">{pan.yamakanta}</span>
              </div>

              {/* Gulika */}
              <div className={`flex items-center justify-between p-3.5 rounded-xl border ${
                isLight
                  ? "bg-yellow-50 border-yellow-200/60 text-yellow-900"
                  : "bg-yellow-950/20 border-yellow-500/10 text-yellow-300"
              }`}>
                <span className="text-[10px] uppercase tracking-wider font-black">{t('panchang.gulika') || 'Gulika'}</span>
                <span className="text-xs font-black font-mono">{pan.gulika}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-gray-700/10 pt-4 text-xs leading-normal">
              {adv?.disha_shool && (
                <p className={`${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>
                  ⚠️ {t('panchang.soolam') || 'Soolam'}: <span className="text-amber-600 font-black">{adv.disha_shool}</span>
                </p>
              )}
              <p className={`${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>
                ⭐ {t('panchang.chandrashtama') || 'Chandrashtama'}: <span className="text-amber-600 font-black">{chandrashtamaStr}</span>
              </p>
            </div>
          </div>

          {/* Gowri Hora section */}
          {gowriNallaNeram && (
            <div className={`border rounded-3xl p-6 space-y-4 transition-all duration-300 ${
              isLight ? "bg-white border-[#E8DCC4]" : "bg-black/35 border-white/5"
            }`}>
              <h3 className="text-xs font-black tracking-wider uppercase text-amber-500 font-serif">
                {t('panchang.gowriHora') || 'Gowri Horai'}
              </h3>
              
              {/* Day slots */}
              {gowriNallaNeram.daySlots?.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-black">
                    🌅 {t('panchang.day.hora') || 'Daytime Horai'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {gowriNallaNeram.daySlots.map((h: any, i: number) => {
                      const styleType = normalizeHoraName(h.name) || 'labam';
                      const cell = isLight ? HORA_STYLES_LIGHT[styleType] || HORA_STYLES_LIGHT.labam : HORA_STYLES_DARK[styleType] || HORA_STYLES_DARK.labam;
                      return (
                        <div key={`day-${i}`} className={`border p-3 rounded-xl flex flex-col text-center justify-center items-center gap-0.5 ${cell.bg} ${cell.border}`}>
                          <span className={`text-xs font-black leading-none ${cell.text}`}>{h.name}</span>
                          <span className="text-[10px] font-mono text-gray-500 mt-1 leading-none font-bold">{h.timeRange}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Night slots */}
              {gowriNallaNeram.nightSlots?.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-black">
                    🌙 {t('panchang.night.hora') || 'Nighttime Horai'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {gowriNallaNeram.nightSlots.map((h: any, i: number) => {
                      const styleType = normalizeHoraName(h.name) || 'labam';
                      const cell = isLight ? HORA_STYLES_LIGHT[styleType] || HORA_STYLES_LIGHT.labam : HORA_STYLES_DARK[styleType] || HORA_STYLES_DARK.labam;
                      return (
                        <div key={`night-${i}`} className={`border p-3 rounded-xl flex flex-col text-center justify-center items-center gap-0.5 ${cell.bg} ${cell.border}`}>
                          <span className={`text-xs font-black leading-none ${cell.text}`}>{h.name}</span>
                          <span className="text-[10px] font-mono text-gray-500 mt-1 leading-none font-bold">{h.timeRange}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vikram Samvatsar Year bar */}
          {adv?.years?.vikram_samvaat_name && (
            <div className={`border rounded-2xl p-5 flex justify-between items-center text-xs transition-all duration-300 ${
              isLight ? "bg-amber-50/20 border-amber-200" : "bg-black/35 border-white/5"
            }`}>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-black block">
                  {t('panchang.tamilYear') || 'Tamil Year'}
                </span>
                <span className={`font-serif font-black text-md mt-1.5 block ${isLight ? "text-[#1E120A]" : "text-white"}`}>
                  {adv.years.vikram_samvaat_name}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
	</ScreenGuard>
  );
}

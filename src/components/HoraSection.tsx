import React, { useState, useMemo, useEffect } from "react";
import { useHora } from "../../hooks/useHora";
import { useTranslation } from "../../hooks/useTranslation";
import { 
  Clock, 
  MapPin, 
  RefreshCw, 
  AlertCircle, 
  Search, 
  Calendar,
  CheckCircle,
  HelpCircle
} from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import ScreenGuard from './ScreenGuard';

interface HoraSectionProps {
  isLight?: boolean;
}

const FALLBACK_COORDS = { lat: 13.08, lon: 80.27 };

const PLANETA_COLORS: Record<string, string> = {
  "சூரியன்": "#EF9F27", "சூரிய": "#EF9F27", Sun: "#EF9F27",
  "சந்திரன்": "#85B7EB", "சந்திர": "#85B7EB", Moon: "#85B7EB",
  "செவ்வாய்": "#E24B4A", "செவ்வாய் ஹோரை": "#E24B4A", Mars: "#E24B4A",
  "புதன்": "#5DCAA5", "புதன் ஹோரை": "#5DCAA5", Mercury: "#5DCAA5",
  "குரு": "#7F77DD", "குரு ஹோரை": "#7F77DD", Jupiter: "#7F77DD",
  "சுக்கிரன்": "#D4537E", "சுக்கிர": "#D4537E", Venus: "#D4537E",
  "சனி": "#888780", "சனி ஹோரை": "#888780", Saturn: "#888780",
};

const PLANET_NAME_ALIAS: Record<string, { en: string; ta: string }> = {
  Sun: { en: "Sun (Surya)", ta: "சூரியன்" },
  Moon: { en: "Moon (Chandra)", ta: "சந்திரன்" },
  Mars: { en: "Mars (Mangal)", ta: "செவ்வாய்" },
  Mercury: { en: "Mercury (Budha)", ta: "புதன்" },
  Jupiter: { en: "Jupiter (Guru)", ta: "குரு" },
  Venus: { en: "Venus (Shukra)", ta: "சுக்கிரன்" },
  Saturn: { en: "Saturn (Shani)", ta: "சனி" },
  "சூரியன்": { en: "Sun", ta: "சூரியன்" },
  "சந்திரன்": { en: "Moon", ta: "சந்திரன்" },
  "செவ்வாய்": { en: "Mars", ta: "செவ்வாய்" },
  "புதன்": { en: "Mercury", ta: "புதன்" },
  "குரு": { en: "Jupiter", ta: "குரு" },
  "சுக்கிரன்": { en: "Venus", ta: "சுக்கிரன்" },
  "சனி": { en: "Saturn", ta: "சனி" }
};

// Parse legacy date format "செவ்வாய், பிப்ரவரி 14, 2026, அதிகாலை 06:00"
function parseTamilDateTime(str: string): Date | null {
  if (!str) return null;
  const parts = str.trim().split(/\s+/);
  try {
    const TAMIL_MONTHS: Record<string, number> = {
      'ஜனவரி': 0, 'பிப்ரவரி': 1, 'மார்ச்': 2, 'ஏப்ரல்': 3,
      'மே': 4, 'ஜூன்': 5, 'ஜூலை': 6, 'ஆகஸ்ட்': 7,
      'செப்டம்பர்': 8, 'அக்டோபர்': 9, 'நவம்பர்': 10, 'டிசம்பர்': 11,
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    // Find month in parts
    let monthIdx = 0;
    let dayVal = 1;
    let yearVal = new Date().getFullYear();
    let isPm = false;
    let hVal = 0;
    let mVal = 0;

    for (let i = 0; i < parts.length; i++) {
      const clean = parts[i].replace(/,/g, '');
      if (TAMIL_MONTHS[clean] !== undefined) {
        monthIdx = TAMIL_MONTHS[clean];
        if (i + 1 < parts.length) dayVal = parseInt(parts[i+1].replace(/,/g, '')) || 1;
        if (i + 2 < parts.length) yearVal = parseInt(parts[i+2].replace(/,/g, '')) || yearVal;
      }
      if (clean.includes(':')) {
        const tParts = clean.split(':').map(Number);
        hVal = tParts[0] || 0;
        mVal = tParts[1] || 0;
      }
      if (clean === "பிற்பகல்" || clean === "மாலை" || clean === "இரவு" || clean === "நள்ளிரவு" || clean === "PM" || clean === "pm") {
        isPm = true;
      }
    }

    if (isPm && hVal < 12) hVal += 12;
    if (!isPm && hVal === 12) hVal = 0;

    return new Date(yearVal, monthIdx, dayVal, hVal, mVal);
  } catch (_) {
    return null;
  }
}

function formatTime(str: string): string {
  const d = parseTamilDateTime(str);
  if (!d || isNaN(d.getTime())) return str;
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function HoraSection({ isLight = false }: HoraSectionProps) {
  const { t, isTamil } = useTranslation();
  const { language } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [coordsLoading, setCoordsLoading] = useState(false);
  const [coordsStatus, setCoordsStatus] = useState<string | null>(null);

  const [inputState, setInputState] = useState<any>(null);

  // Auto-get coordinates once on mount
  useEffect(() => {
    setCoordsLoading(true);
    setCoordsStatus(isTamil ? "இருப்பிடத்தை கண்டறிகிறது..." : "Locating your position...");
    if (navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setCoordsLoading(false);
          setCoordsStatus(null);
        },
        () => {
          setCoords(FALLBACK_COORDS);
          setCoordsLoading(false);
          setCoordsStatus(null);
        },
        { timeout: 6000, maximumAge: 60_000 }
      );
    } else {
      setCoords(FALLBACK_COORDS);
      setCoordsLoading(false);
      setCoordsStatus(null);
    }
  }, [isTamil]);

  const { hora, loading, error, refetch } = useHora(inputState);

  const handleCalculate = () => {
    if (!selectedDate || !selectedTime) return;
    const finalCoords = coords || FALLBACK_COORDS;
    
    // Parse selected date YYYY-MM-DD
    const dParts = selectedDate.split("-").map(Number);
    const tParts = selectedTime.split(":").map(Number);
    const targetDate = new Date(dParts[0], dParts[1] - 1, dParts[2], tParts[0], tParts[1]);

    const day = String(targetDate.getDate()).padStart(2, '0');
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const year = targetDate.getFullYear();

    setInputState({
      api_key: '6a0b4e5a-b8d5-5e1a-bd97-6128ad38d349',
      date: `${day}/${month}/${year}`,
      time: `${String(targetDate.getHours()).padStart(2, '0')}:${String(targetDate.getMinutes()).padStart(2, '0')}`,
      lat: finalCoords.lat,
      lon: finalCoords.lon,
      tz: 5.5,
      lang: language
    });
  };

  // Trigger calculation automatically when coords are resolved
  useEffect(() => {
    if (coords && !inputState) {
      handleCalculate();
    }
  }, [coords]);

  const sortedHoras = useMemo(() => {
    if (!hora?.horas?.length) return [];
    return [...hora.horas].sort((a: any, b: any) => {
      const da = parseTamilDateTime(a.start);
      const db = parseTamilDateTime(b.start);
      return (da?.getTime() ?? 0) - (db?.getTime() ?? 0);
    });
  }, [hora]);

  const now = new Date();

  return (
  <ScreenGuard featureId="hora">
    <div id="hora-section" className={`p-6 rounded-3xl space-y-6 border transition-all duration-300 ${
      isLight 
        ? "bg-white/80 border-[#E8DCC4] shadow-sm text-[#1E120A]" 
        : "bg-black/35 border-white/5 text-gray-100 shadow-xl shadow-black/20"
    }`}>
      {/* Title */}
      <div className="border-b border-gray-700/25 pb-4">
        <h2 className="text-xl md:text-2xl font-serif font-black text-amber-500 flex items-center gap-2">
          <Clock className="h-6 w-6 text-amber-500 animate-pulse" />
          {t("hora.title")}
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          {isTamil 
            ? "அதிர்ஷ்டம் தரும் முக்கிய ஹோரை நேரங்களை அறிந்து காரியங்களை வெற்றிகரமாக துவங்குங்கள்." 
            : "Hourly predictions based on Vedic Astrology for planning auspicious works."}
        </p>
      </div>

      {/* Controls Container */}
      <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-[#E8DCC4]" : "bg-black/40 border-white/10"} grid grid-cols-1 md:grid-cols-3 gap-4 items-end`}>
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-2 text-gray-400">
            {t("common.selectDate")}
          </label>
          <div className="relative">
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                isLight 
                  ? "bg-[#FCFBF7] border-[#E8DCC4] text-[#1E120A] focus:ring-1 focus:ring-amber-500" 
                  : "bg-black/40 border-white/10 text-white focus:ring-1 focus:ring-amber-500"
              }`}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-2 text-gray-400">
            {isTamil ? "நேரம்" : "Time"}
          </label>
          <input 
            type="time" 
            value={selectedTime} 
            onChange={(e) => setSelectedTime(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              isLight 
                ? "bg-[#FCFBF7] border-[#E8DCC4] text-[#1E120A] focus:ring-1 focus:ring-amber-500" 
                : "bg-black/40 border-white/10 text-white focus:ring-1 focus:ring-amber-500"
            }`}
          />
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading || coordsLoading}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-2 border border-amber-600/20"
        >
          <Search className="h-4 w-4" />
          {t("hora.btn")}
        </button>
      </div>

      {coordsStatus && (
        <p className="text-[10px] text-amber-500 animate-pulse flex items-center gap-1">
          <MapPin className="h-3 w-3 animate-bounce" />
          {coordsStatus}
        </p>
      )}

      {/* States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-amber-500 space-y-3">
          <div className="h-8 w-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-sm font-bold tracking-wide animate-pulse">{t("hora.loading")}</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">{isTamil ? "தகவல் கிடைக்கவில்லை" : "Data Not Found"}</h4>
            <p className="text-xs mt-0.5 text-rose-400/80">{error}</p>
          </div>
        </div>
      )}

      {/* Render Hourly Cards List */}
      {!loading && sortedHoras.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-700/15 pb-2">
            <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">
              {isTamil ? "கிரக ஹோரைகள் பட்டியல்" : "Planetary Hora Table"}
            </h3>
            <span className="text-[10px] text-gray-400 font-bold">
              {isTamil ? "வடிவமைப்பு: தென்னிந்திய முறை" : "Layout: Traditional South Indian"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {sortedHoras.map((h: any, idx: number) => {
              const start = parseTamilDateTime(h.start);
              const end = parseTamilDateTime(h.end);
              const isActive = start && end && now >= start && now < end;

              const dotColor = PLANETA_COLORS[h.hora] || "#888";
              
              const pMeta = PLANET_NAME_ALIAS[h.hora] || { en: h.hora, ta: h.hora };
              const displayPlanet = isTamil ? pMeta.ta : pMeta.en;

              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden ${
                    isActive 
                      ? "bg-amber-500/10 border-amber-500/30 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/25" 
                      : isLight 
                        ? "bg-white border-[#E8DCC4] hover:border-amber-500/20" 
                        : "bg-black/30 border-white/5 hover:border-white/10"
                  }`}
                >
                  {/* Left Column: Planet indicator and Name */}
                  <div className="flex items-center gap-3 md:w-1/4 shrink-0">
                    <span 
                      className="h-3 w-3 rounded-full shrink-0 border border-white/20 block" 
                      style={{ backgroundColor: dotColor }}
                    />
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-serif font-black ${isLight ? "text-[#1E120A]" : "text-white"}`}>
                        {displayPlanet}
                      </h4>
                      {isActive && (
                        <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 animate-pulse">
                          {isTamil ? "இப்போது" : "Active"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Time duration */}
                  <div className="md:w-1/4 shrink-0 text-xs font-bold text-amber-500 font-mono">
                    {formatTime(h.start)} &ndash; {formatTime(h.end)}
                  </div>

                  {/* Right Column: Suitable Benefits */}
                  <div className={`text-xs leading-relaxed font-sans md:w-2/4 ${
                    isActive ? (isLight ? "text-[#1E120A]" : "text-amber-100") : (isLight ? "text-[#5C4F43]" : "text-gray-300")
                  }`}>
                    {h.benefits}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
	</ScreenGuard>
  );
}

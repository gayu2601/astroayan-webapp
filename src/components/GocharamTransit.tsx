import React, { useState, useEffect } from "react";
import { useGochar } from "../../hooks/useGochar";
import { useTranslation } from "../../hooks/useTranslation";
import GocharamKattam from "./GocharamKattam";
import { 
  Sparkles, 
  Clock, 
  MapPin, 
  RefreshCw, 
  AlertCircle, 
  Search,
  Calendar
} from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import ScreenGuard from './ScreenGuard';

interface GocharamTransitProps {
  isLight?: boolean;
}

const FALLBACK_COORDS = { lat: 13.08, lon: 80.27 };

export default function GocharamTransit({ isLight = false }: GocharamTransitProps) {
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

  // Auto locate user location on mount
  useEffect(() => {
    setCoordsLoading(true);
    setCoordsStatus(isTamil ? "இருப்பிடத்தை கண்டறிகிறது..." : "Resolving GPS coordinates...");
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

  const { planets, loading, error, refetch } = useGochar(inputState);

  const handleCalculate = () => {
    if (!selectedDate || !selectedTime) return;
    const finalCoords = coords || FALLBACK_COORDS;

    const dParts = selectedDate.split("-").map(Number);
    const tParts = selectedTime.split(":").map(Number);
    const targetDate = new Date(dParts[0], dParts[1] - 1, dParts[2], tParts[0], tParts[1]);

    const day = String(targetDate.getDate()).padStart(2, '0');
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const year = targetDate.getFullYear();

    setInputState({
      api_key: '6a0b4e5a-b8d5-5e1a-bd97-6128ad38d349',
      dob: `${day}/${month}/${year}`,
      tob: `${String(targetDate.getHours()).padStart(2, '0')}:${String(targetDate.getMinutes()).padStart(2, '0')}`,
      lat: finalCoords.lat,
      lon: finalCoords.lon,
      tz: 5.5,
      lang: language
    });
  };

  // Trigger calculation automatically when coordinates are ready
  useEffect(() => {
    if (coords && !inputState) {
      handleCalculate();
    }
  }, [coords]);

  return (
  <ScreenGuard featureId="gocharam">
    <div id="gocharam-transit-section" className={`p-6 rounded-3xl space-y-6 border transition-all duration-300 ${
      isLight 
        ? "bg-white/80 border-[#E8DCC4] shadow-sm text-[#1E120A]" 
        : "bg-black/35 border-white/5 text-gray-100 shadow-xl shadow-black/20"
    }`}>
      {/* Header title */}
      <div className="border-b border-gray-700/25 pb-4">
        <h2 className="text-xl md:text-2xl font-serif font-black text-amber-500 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
          {t("gocharam.title")}
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          {isTamil 
            ? "இன்றைய கிரகங்களின் அமைப்பினைTraditional தென்னிந்திய கோச்சாரம் கட்டம் மூலம் துல்லியமாக அறியுங்கள்." 
            : "View the live placements and transits of planetary bodies mapped inside the South Indian chart grid."}
        </p>
      </div>

      {/* Date, Time, Action row */}
      <div className={`p-4 rounded-2xl border ${isLight ? "bg-white border-[#E8DCC4]" : "bg-black/40 border-white/10"} grid grid-cols-1 md:grid-cols-3 gap-4 items-end`}>
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-2 text-gray-400">
            {t("common.selectDate")}
          </label>
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
          {t("gocharam.btn")}
        </button>
      </div>

      {coordsStatus && (
        <p className="text-[10px] text-amber-500 animate-pulse flex items-center gap-1">
          <MapPin className="h-3 w-3 animate-bounce" />
          {coordsStatus}
        </p>
      )}

      {/* Loading & Error States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-amber-500 space-y-3">
          <div className="h-8 w-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-sm font-bold tracking-wide animate-pulse">{t("gocharam.loading")}</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">{isTamil ? "பிழை ஏற்பட்டது" : "Error Occurred"}</h4>
            <p className="text-xs mt-0.5 text-rose-400/80">{error}</p>
          </div>
        </div>
      )}

      {/* traditional South Indian Kattam representation */}
      {!loading && planets && inputState && (
        <div className="space-y-6 animate-fade-in flex flex-col items-center">
          <div className="w-full max-w-[450px] p-5 rounded-3xl border bg-black/10 border-white/5 space-y-4">
            <GocharamKattam 
              planets={planets} 
              date={inputState.dob} 
              time={inputState.tob} 
              isLight={isLight}
            />
          </div>
        </div>
      )}
    </div>
	</ScreenGuard>
  );
}

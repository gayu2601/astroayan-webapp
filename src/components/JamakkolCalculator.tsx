import React, { useState, useMemo, useEffect, useRef } from 'react';
import ScreenGuard from './ScreenGuard';

// --- Astro Constants ---
const SIGNS = [
  { nameTa: "மேஷம்", nameEn: "Aries" },
  { nameTa: "ரிஷபம்", nameEn: "Taurus" },
  { nameTa: "மிதுனம்", nameEn: "Gemini" },
  { nameTa: "கடகம்", nameEn: "Cancer" },
  { nameTa: "சிம்மம்", nameEn: "Leo" },
  { nameTa: "கன்னி", nameEn: "Virgo" },
  { nameTa: "துலாம்", nameEn: "Libra" },
  { nameTa: "விருச்சிகம்", nameEn: "Scorpio" },
  { nameTa: "தனுசு", nameEn: "Sagittarius" },
  { nameTa: "மகரம்", nameEn: "Capricorn" },
  { nameTa: "கும்பம்", nameEn: "Aquarius" },
  { nameTa: "மீனம்", nameEn: "Pisces" }
];

const NAKSHATRAS = [
  { ta: "அஸ்வினி", en: "Ashwini" },
  { ta: "பரணி", en: "Bharani" },
  { ta: "கார்த்திகை", en: "Krittika" },
  { ta: "ரோஹிணி", en: "Rohini" },
  { ta: "மிருகசீரிஷம்", en: "Mrigashira" },
  { ta: "திருவாதிரை", en: "Ardra" },
  { ta: "புனர்பூசம்", en: "Punarvasu" },
  { ta: "பூசம்", en: "Pushya" },
  { ta: "ஆயில்யம்", en: "Ashlesha" },
  { ta: "மகம்", en: "Magha" },
  { ta: "பூரம்", en: "Purva Phalguni" },
  { ta: "உத்திரம்", en: "Uttara Phalguni" },
  { ta: "ஹஸ்தம்", en: "Hasta" },
  { ta: "சித்திரை", en: "Chitra" },
  { ta: "சுவாதி", en: "Swati" },
  { ta: "விசாகம்", en: "Vishakha" },
  { ta: "அனுஷம்", en: "Anuradha" },
  { ta: "கேட்டை", en: "Jyeshtha" },
  { ta: "மூலம்", en: "Mula" },
  { ta: "பூராடம்", en: "Purva Ashadha" },
  { ta: "உத்திராடம்", en: "Uttara Ashadha" },
  { ta: "திருவோணம்", en: "Shravana" },
  { ta: "அவிட்டம்", en: "Dhanishta" },
  { ta: "சதயம்", en: "Shatabhisha" },
  { ta: "பூரட்டாதி", en: "Purva Bhadrapada" },
  { ta: "உத்திரட்டாதி", en: "Uttara Bhadrapada" },
  { ta: "ரேவதி", en: "Revati" }
];

// --- Jama Grahas (classical Jamakkol Prasanam planets) ---
const JAMA_PLANETS = [
  { nameTa: "சூரியன்", symbolTa: "சூரி", nameEn: "Sun", symbolEn: "Sun" },
  { nameTa: "செவ்வாய்", symbolTa: "செவ்", nameEn: "Mars", symbolEn: "Mar" },
  { nameTa: "குரு",    symbolTa: "குரு", nameEn: "Jupiter", symbolEn: "Jup" },
  { nameTa: "புதன்",   symbolTa: "புத",  nameEn: "Mercury", symbolEn: "Mer" },
  { nameTa: "சுக்கிரன்",symbolTa: "சுக்", nameEn: "Venus", symbolEn: "Ven" },
  { nameTa: "சனி",     symbolTa: "சனி",  nameEn: "Saturn", symbolEn: "Sat" },
  { nameTa: "சந்திரன்", symbolTa: "சந்",  nameEn: "Moon", symbolEn: "Moo" },
  { nameTa: "பாம்பு (ராகு-கேது)", symbolTa: "பாம்பு", nameEn: "Snake", symbolEn: "Snk" },
];

const JAMA_PLANET_CYCLE = ["Sun", "Mars", "Jupiter", "Mercury", "Venus", "Saturn", "Moon", "Snake"] as const;

const WEEKDAY_LORD_CYCLE_INDEX: Record<number, number> = {
  0: JAMA_PLANET_CYCLE.indexOf("Sun"),     // Sunday
  1: JAMA_PLANET_CYCLE.indexOf("Moon"),    // Monday
  2: JAMA_PLANET_CYCLE.indexOf("Mars"),    // Tuesday
  3: JAMA_PLANET_CYCLE.indexOf("Mercury"), // Wednesday
  4: JAMA_PLANET_CYCLE.indexOf("Jupiter"), // Thursday
  5: JAMA_PLANET_CYCLE.indexOf("Venus"),   // Friday
  6: JAMA_PLANET_CYCLE.indexOf("Saturn"),  // Saturday
};

const JAMAM_SLOT_RASI: number[] = [11, 9, 8, 6, 5, 3, 2, 0];

const GOWRI_MASTER_CYCLE = [
  { nameTa: "தனம்", nameEn: "Dhanam", auspicious: true },
  { nameTa: "சுகம்", nameEn: "Sugam", auspicious: true },
  { nameTa: "சோரம்", nameEn: "Soram", auspicious: false },
  { nameTa: "உத்தி", nameEn: "Uthi", auspicious: true },
  { nameTa: "அமிர்தம்", nameEn: "Amirtham", auspicious: true },
  { nameTa: "விஷம்", nameEn: "Visham", auspicious: false },
  { nameTa: "ரோகம்", nameEn: "Rogam", auspicious: false },
  { nameTa: "லாபம்", nameEn: "Labham", auspicious: true }
];

const SOUTH_INDIAN_GRID_POS: Record<number, { row: number; col: number; bhava: number }> = {
  11: { row: 1, col: 1, bhava: 2 },  // Meenam
  0:  { row: 1, col: 2, bhava: 3 },  // Mesham
  1:  { row: 1, col: 3, bhava: 4 },  // Rishabam
  2:  { row: 1, col: 4, bhava: 5 },  // Mithunam
  10: { row: 2, col: 1, bhava: 1 },  // Kumbam
  3:  { row: 2, col: 4, bhava: 6 },  // Kadagam
  9:  { row: 3, col: 1, bhava: 12 }, // Magaram
  4:  { row: 3, col: 4, bhava: 7 },  // Simmam
  8:  { row: 4, col: 1, bhava: 11 }, // Dhanusu
  7:  { row: 4, col: 2, bhava: 10 }, // Viruchigam
  6:  { row: 4, col: 3, bhava: 9 },  // Thulam
  5:  { row: 4, col: 4, bhava: 8 }   // Kanni
};

/** Calculates Nakshatra and Pada dynamically from total 0-360 longitude degree */
function getNakshatraAndPada(deg360: number, isTa: boolean) {
  const normalizedDeg = (deg360 % 360 + 360) % 360;
  
  const nakshatraLength = 360 / 27;
  const nakIdx = Math.floor(normalizedDeg / nakshatraLength);
  const nakObj = NAKSHATRAS[nakIdx % 27];
  const nakName = isTa ? nakObj.ta : nakObj.en;

  const padaLength = nakshatraLength / 4;
  const degInNak = normalizedDeg % nakshatraLength;
  const pada = Math.floor(degInNak / padaLength) + 1;

  const rasiIdx = Math.floor(normalizedDeg / 30);
  const degInRasi = normalizedDeg % 30;
  const degComponent = Math.floor(degInRasi);
  const minComponent = Math.round((degInRasi - degComponent) * 60);

  return {
    nakshatraName: nakName,
    pada: pada,
    formattedStar: `${nakName} - ${pada}`,
    rasiIndex: rasiIdx,
    rasiDegree: degInRasi,
    formattedDegree: `${degComponent}° ${minComponent < 10 ? '0' : ''}${minComponent}'`,
    totalDegrees: normalizedDeg
  };
}

function toDateTimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface PlaceSuggestion {
  place_id: string;
  description: string;
  lat: number;
  lon: number;
}

async function fetchPlaceSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (!query || query.length < 2) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json', 'User-Agent': 'JamakkolCalculatorApp/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map((item: any) => ({
      place_id: item.place_id?.toString() || Math.random().toString(),
      description: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));
  } catch (e) {
    console.error('Location suggestion error:', e);
    return [];
  }
}

export interface JamakkolCalculatorProps {
  language?: 'ta' | 'en';
  isLight?: boolean;
}

export const JamakkolCalculator: React.FC<JamakkolCalculatorProps> = ({
  language = 'ta',
  isLight = false,
}) => {
  const isTa = language === 'ta';

  // Input Controls State
  const [location, setLocation] = useState<string>("Chennai, Tamil Nadu");
  const [latitude, setLatitude] = useState<string>("13.0827");
  const [longitude, setLongitude] = useState<string>("80.2707");
  const [queryDateTime, setQueryDateTime] = useState<string>(() => toDateTimeLocalValue(new Date()));
  const [sunriseTime, setSunriseTime] = useState<string>("05:57");
  const [sunsetTime, setSunsetTime] = useState<string>("18:17");

  const [activeTab, setActiveTab] = useState<'chart' | 'sphutas' | 'jama' | 'touched'>('chart');

  // API state
  const [apiData, setApiData] = useState<Record<string, any> | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  const [timingParams, setTimingParams] = useState(() => ({
    queryDateTime: toDateTimeLocalValue(new Date()),
    sunriseTime:   "05:57",
    sunsetTime:    "18:17",
    location:      "Chennai, Tamil Nadu",
  }));

  // Location autocomplete state
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loadingPlace, setLoadingPlace] = useState(false);
  const [openPlace, setOpenPlace] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const placeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (placeDropdownRef.current && !placeDropdownRef.current.contains(e.target as Node)) {
        setOpenPlace(false);
        setPlaceSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setLocation(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text) {
      setPlaceSuggestions([]);
      setOpenPlace(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoadingPlace(true);
      const results = await fetchPlaceSuggestions(text);
      setPlaceSuggestions(results);
      setOpenPlace(results.length > 0);
      setLoadingPlace(false);
    }, 400);
  };

  const handleSelectLocation = (item: PlaceSuggestion) => {
    setLocation(item.description);
    setLatitude(item.lat.toFixed(4));
    setLongitude(item.lon.toFixed(4));
    setPlaceSuggestions([]);
    setOpenPlace(false);
  };

  const handleCalculate = async () => {
    setApiError(null);
    setApiData(null);
    setApiLoading(true);
    setTimingParams({ queryDateTime, sunriseTime, sunsetTime, location });

    try {
      const dt    = new Date(queryDateTime);
      const day   = dt.getDate();
      const month = dt.getMonth() + 1;
      const year  = dt.getFullYear();
      const hour  = dt.getHours();
      const min   = dt.getMinutes();

      const dob = `${String(day).padStart(2,'0')}/${String(month).padStart(2,'0')}/${year}`;
      const tob = `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`;

      const params = new URLSearchParams({
        dob,
        tob,
        lat:     latitude,
        lon:     longitude,
        tz:      "5.5",
        lang:    isTa ? "ta" : "en",
        api_key: "6a0b4e5a-b8d5-5e1a-bd97-6128ad38d349",
      });

      const url = `https://api.vedicastroapi.com/v3-json/horoscope/planet-details?${params}`;

      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      const json = await res.json();

      const resp = json?.response ?? json;
      const planets: Record<string, any> = {};
      if (resp && typeof resp === 'object' && !Array.isArray(resp)) {
        Object.keys(resp)
          .filter(k => !isNaN(Number(k)))
          .forEach(k => { planets[k] = resp[k]; });
      }
      setApiData(planets);
    } catch (err: any) {
      setApiError(err.message ?? (isTa ? "கணிப்பு பிழை ஏற்பட்டது" : "API calculation failed"));
    } finally {
      setApiLoading(false);
    }
  };

  // ── Core calculations ─────────────────────────────────────────────────────
  const calculatedData = useMemo(() => {
    const dt = new Date(timingParams.queryDateTime);
    if (isNaN(dt.getTime())) return null;

    const [srH, srM] = timingParams.sunriseTime.split(':').map(Number);
    const [ssH, ssM] = timingParams.sunsetTime.split(':').map(Number);
    const sunriseMins = srH * 60 + srM;
    const sunsetMins  = ssH * 60 + ssM;
    const queryMins   = dt.getHours() * 60 + dt.getMinutes();

    const isDay = queryMins >= sunriseMins && queryMins < sunsetMins;
    const dayDuration   = sunsetMins - sunriseMins;
    const nightDuration = 1440 - dayDuration;

    const tamWeekday = queryMins < sunriseMins
      ? (dt.getDay() + 6) % 7
      : dt.getDay();

    let elapsedMins: number;
    if (isDay) {
      elapsedMins = queryMins - sunriseMins;
    } else {
      elapsedMins = queryMins >= sunsetMins
        ? queryMins - sunsetMins
        : (1440 - sunsetMins) + queryMins;
    }

    const FIXED_DAY_START_MIN   = 6 * 60; // 06:00
    const sinceSixAM            = ((queryMins - FIXED_DAY_START_MIN) % 1440 + 1440) % 1440;
    const classicalIsDay        = sinceSixAM < 720;
    const withinClassicalPeriod = classicalIsDay ? sinceSixAM : sinceSixAM - 720;
    const jamamIndex             = Math.min(7, Math.floor(withinClassicalPeriod / 90));
    const jamamNum               = jamamIndex + 1;
    const elapsedInCurrentJamam  = withinClassicalPeriod - jamamIndex * 90;

    const jamakkolWeekday = queryMins < FIXED_DAY_START_MIN ? (dt.getDay() + 6) % 7 : dt.getDay();

    const GOWRI_DAY_START: Record<number, number> = {
      0: 5, // Sunday
      1: 4, // Monday
      2: 1, // Tuesday
      3: 7, // Wednesday
      4: 0, // Thursday
      5: 2, // Friday
      6: 1, // Saturday
    };
    const gowriPeriodDuration = isDay ? dayDuration / 8 : nightDuration / 8;
    const gowriSlot     = Math.min(7, Math.floor(elapsedMins / gowriPeriodDuration));
    const dayStart      = GOWRI_DAY_START[tamWeekday];
    const gowriBase     = isDay ? dayStart : (dayStart + 4) % 8;
    const gowriIdx      = (gowriBase + gowriSlot) % 8;
    const gowriEntry    = GOWRI_MASTER_CYCLE[gowriIdx];
    const currentGowri  =
      `${gowriEntry.auspicious ? "✅" : "❌"} ${isTa ? gowriEntry.nameTa : gowriEntry.nameEn} (${
        gowriEntry.auspicious ? (isTa ? "சுபம்" : "Auspicious") : (isTa ? "அசுபம்" : "Inauspicious")
      })`;

    const queryMinuteOfHour = dt.getMinutes();
    const aarudamRasiIdx    = Math.floor(queryMinuteOfHour / 5) % 12;
    const aarudamDeg        = aarudamRasiIdx * 30 + (queryMinuteOfHour % 5) * 6;
    const arudamInfo        = getNakshatraAndPada(aarudamDeg, isTa);

    const lagnaGlobalDeg: number | null = apiData?.["0"]?.global_degree ?? null;

    let udayamInfo = null, kavippuInfo = null;
    let maandiInfo = null, yamakandamInfo = null, rahuKaalamInfo = null, mrityuInfo = null;
    let sunInfo = null, moonInfo = null;

    if (lagnaGlobalDeg !== null) {
      const udayamDeg = lagnaGlobalDeg;
      udayamInfo = getNakshatraAndPada(udayamDeg, isTa);

      const sunGlobalDeg  = apiData?.["1"]?.global_degree ?? null;
      const moonGlobalDeg = apiData?.["2"]?.global_degree ?? null;
      if (sunGlobalDeg  !== null) sunInfo  = getNakshatraAndPada(sunGlobalDeg, isTa);
      if (moonGlobalDeg !== null) moonInfo = getNakshatraAndPada(moonGlobalDeg, isTa);

      if (sunInfo) {
        const MESHA_VEEDHI    = [1, 2, 3, 4];
        const RISHABA_VEEDHI  = [11, 0, 5, 6];

        const sunRasi = sunInfo.rasiIndex;
        const veedhiTargetRasi =
          MESHA_VEEDHI.includes(sunRasi)   ? 0 :
          RISHABA_VEEDHI.includes(sunRasi) ? 1 : 2;

        const countFromAarudam = ((veedhiTargetRasi - aarudamRasiIdx + 12) % 12) + 1;
        const kavippuRasiIdx   = udayamInfo ? (udayamInfo.rasiIndex + countFromAarudam - 1) % 12 : null;

        if (kavippuRasiIdx !== null) {
          kavippuInfo = getNakshatraAndPada(kavippuRasiIdx * 30 + 15, isTa);
        }
      }

      const maandiDeg      = (udayamDeg + tamWeekday * 30 + jamamNum * 12) % 360;
      const yamaDeg        = (udayamDeg + 120 + jamamNum * 15) % 360;
      const rahuKaaDeg     = (udayamDeg + 180 + jamamNum * 15) % 360;
      const mrityuDeg      = (udayamDeg + 240) % 360;

      maandiInfo      = getNakshatraAndPada(maandiDeg, isTa);
      yamakandamInfo  = getNakshatraAndPada(yamaDeg, isTa);
      rahuKaalamInfo  = getNakshatraAndPada(rahuKaaDeg, isTa);
      mrityuInfo      = getNakshatraAndPada(mrityuDeg, isTa);
    }

    type JGPos = {
      name: string; symbol: string; eng: string;
      rasiIdx: number; localDeg: number;
      degreeInfo: ReturnType<typeof getNakshatraAndPada>;
    };
    const jamaGrahaPositions: JGPos[] = [];

    const withinSlotDeg = Math.min(29.9, Math.max(0, elapsedInCurrentJamam * 0.5));
    const leadCycleIdx = WEEKDAY_LORD_CYCLE_INDEX[jamakkolWeekday];
    for (let slot = 0; slot < 8; slot++) {
      const planetName = JAMA_PLANET_CYCLE[(leadCycleIdx + slot) % 8];
      const rasiIdx     = JAMAM_SLOT_RASI[slot];
      const jamaPlanet  = JAMA_PLANETS.find(p => p.nameEn === planetName)!;
      const localDeg    = slot === jamamIndex ? withinSlotDeg : 0;
      const globalDeg    = rasiIdx * 30 + localDeg;

      jamaGrahaPositions.push({
        name:       isTa ? jamaPlanet.nameTa : jamaPlanet.nameEn,
        symbol:     isTa ? jamaPlanet.symbolTa : jamaPlanet.symbolEn,
        eng:        jamaPlanet.nameEn,
        rasiIdx,
        localDeg,
        degreeInfo: getNakshatraAndPada(globalDeg, isTa),
      });
    }

    type Touched = { target: string; targetRasi: string; touchingPlanets: string; status: string; type: string };
    const touchedPlanets: Touched[] = [];

    const checkAspects = (label: string, info: ReturnType<typeof getNakshatraAndPada> | null) => {
      if (!info) return;
      const signName = isTa ? SIGNS[info.rasiIndex].nameTa : SIGNS[info.rasiIndex].nameEn;
      jamaGrahaPositions.forEach((jg) => {
        const diff = Math.abs(jg.rasiIdx - info.rasiIndex);
        if (diff === 0) {
          touchedPlanets.push({
            target: `${label} (${signName} ${info.formattedDegree})`,
            targetRasi: signName,
            touchingPlanets: `${jg.name} (${jg.degreeInfo.formattedDegree} - ${isTa ? "உடனுறைவு" : "Conjunction"})`,
            status: jg.eng === "Saturn" || jg.eng === "Snake"
              ? (isTa ? "கவனம் தேவை" : "Caution Advised")
              : (isTa ? "நன்மை / சுப பார்வை" : "Auspicious Conjunction"),
            type: isTa ? "சேர்க்கை (Conjunction)" : "Conjunction"
          });
        } else if (diff === 6) {
          touchedPlanets.push({
            target: `${label} (${signName} ${info.formattedDegree})`,
            targetRasi: signName,
            touchingPlanets: `${jg.name} (${jg.degreeInfo.formattedDegree} - ${isTa ? "சமசப்தம பார்வை" : "7th House Aspect"})`,
            status: isTa ? "நேரடி பார்வை" : "Direct Mutual Aspect",
            type: isTa ? "பார்வை (Aspect)" : "Aspect"
          });
        }
      });
    };

    checkAspects(isTa ? "உதயம்" : "Udayam", udayamInfo);
    checkAspects(isTa ? "ஆருடம்" : "Aarudam", arudamInfo);
    checkAspects(isTa ? "கவிப்பு" : "Kavippu", kavippuInfo);

    const WEEKDAY_NAMES_TA = ["ஞாயிறு","திங்கள்","செவ்வாய்","புதன்","வியாழன்","வெள்ளி","சனி"];
    const WEEKDAY_NAMES_EN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    return {
      jamamNum, tamWeekday,
      tamWeekdayName: isTa ? WEEKDAY_NAMES_TA[jamakkolWeekday] : WEEKDAY_NAMES_EN[jamakkolWeekday],
      currentGowri,
      udayamInfo, arudamInfo, kavippuInfo,
      maandiInfo, yamakandamInfo, rahuKaalamInfo, mrityuInfo,
      sunInfo, moonInfo,
      jamaGrahaPositions,
      touchedPlanets,
      hasApiData: !!apiData,
      formattedDate: dt.toLocaleDateString(isTa ? 'ta-IN' : 'en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      formattedTime: dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  }, [timingParams, apiData, isTa]);

  // Map calculated Sphutas into Chart Grid
  const sphutasInChart = useMemo(() => {
    const map: Record<number, { label: string; degree: string; colorClass: string }[]> = {};
    for (let i = 0; i < 12; i++) map[i] = [];

    if (!calculatedData) return map;

    const { udayamInfo, arudamInfo, kavippuInfo, maandiInfo, yamakandamInfo, rahuKaalamInfo, mrityuInfo } = calculatedData;

    const udayamLabel = isTa ? "உதயம்" : "Udayam";
    const arudamLabel = isTa ? "ஆருடம்" : "Aarudam";
    const kavippuLabel = isTa ? "கவிப்பு" : "Kavippu";
    const maandiLabel = isTa ? "மாந்" : "Maan";
    const yamaLabel = isTa ? "எம" : "Yama";
    const rahuLabel = isTa ? "ரா.கா" : "Rahu";
    const mrityuLabel = isTa ? "மிருத்யு" : "Mrityu";

    if (udayamInfo)     map[udayamInfo.rasiIndex].push({ label: udayamLabel,   degree: udayamInfo.formattedDegree,    colorClass: "text-red-600 font-bold" });
    if (arudamInfo)     map[arudamInfo.rasiIndex].push({ label: arudamLabel,  degree: arudamInfo.formattedDegree,    colorClass: "text-red-700 font-bold" });
    if (kavippuInfo)    map[kavippuInfo.rasiIndex].push({ label: kavippuLabel, degree: kavippuInfo.formattedDegree,  colorClass: "text-red-600 font-semibold" });
    if (maandiInfo)     map[maandiInfo.rasiIndex].push({ label: maandiLabel,    degree: maandiInfo.formattedDegree,    colorClass: "text-red-800 font-semibold" });
    if (yamakandamInfo) map[yamakandamInfo.rasiIndex].push({ label: yamaLabel,   degree: yamakandamInfo.formattedDegree, colorClass: "text-red-800 font-semibold" });
    if (rahuKaalamInfo) map[rahuKaalamInfo.rasiIndex].push({ label: rahuLabel, degree: rahuKaalamInfo.formattedDegree, colorClass: "text-red-800 font-semibold" });
    if (mrityuInfo)     map[mrityuInfo.rasiIndex].push({ label: mrityuLabel, degree: mrityuInfo.formattedDegree,  colorClass: "text-purple-800 font-bold" });

    return map;
  }, [calculatedData, isTa]);

  // Map Jama Grahas into Chart Grid
  const jamaGrahasInChart = useMemo(() => {
    const map: Record<number, { name: string; degree: string }[]> = {};
    for (let i = 0; i < 12; i++) map[i] = [];

    if (!calculatedData) return map;

    calculatedData.jamaGrahaPositions.forEach((jg) => {
      const d = jg.localDeg;
      const deg = Math.floor(d);
      const min = Math.round((d - deg) * 60);
      const degStr = `${deg}° ${min < 10 ? '0' : ''}${min}'`;
      map[jg.rasiIdx].push({ name: jg.symbol, degree: degStr });
    });

    return map;
  }, [calculatedData]);

  return (
    <ScreenGuard featureId="jamakkol">
      <div className={`max-w-4xl mx-auto p-3 sm:p-5 font-sans transition-colors min-h-screen ${
        isLight ? 'bg-[#FFFDF7] text-[#2C241E]' : 'bg-slate-950 text-slate-100'
      }`}>
        
        {/* 1. Input Controls Header */}
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm mb-5 transition-all ${
          isLight
            ? 'bg-white border-amber-500/25 shadow-amber-500/5'
            : 'bg-slate-900/90 border-slate-800 shadow-xl'
        }`}>
          <h2 className={`text-sm sm:text-base font-bold mb-3 flex items-center gap-2 ${
            isLight ? 'text-amber-900' : 'text-amber-400'
          }`}>
            <span>⚙️</span> {isTa ? "இடம் & பிரசன்ன கணிப்பு அளவுருக்கள்" : "Location & Prasnam Calculation Parameters"}
          </h2>

          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3 pb-3 border-b ${
            isLight ? 'border-amber-500/15' : 'border-slate-800'
          }`}>
            <div>
              <label className={`block font-semibold mb-1 ${isLight ? 'text-[#5C4F43]' : 'text-slate-300'}`}>
                {isTa ? "இடம் (ஊர்)" : "Location (Place Name)"}
              </label>
              <div className="relative" ref={placeDropdownRef}>
                <input
                  type="text"
                  value={location}
                  onChange={handleLocationChange}
                  onFocus={() => placeSuggestions.length > 0 && setOpenPlace(true)}
                  autoComplete="off"
                  placeholder={isTa ? "ஊரைத் தேடுங்கள்..." : "Search location..."}
                  className={`w-full p-2 border rounded-md outline-none text-xs ${
                    isLight
                      ? 'border-amber-500/30 bg-amber-50/40 text-[#2C241E] focus:border-amber-500 focus:bg-white'
                      : 'border-slate-700 bg-slate-800 text-white focus:border-amber-500'
                  }`}
                />
                {loadingPlace && (
                  <div className="absolute inset-y-0 right-2 flex items-center">
                    <div className="w-3.5 h-3.5 border-2 border-amber-500/30 border-t-amber-600 rounded-full animate-spin" />
                  </div>
                )}
                {openPlace && placeSuggestions.length > 0 && (
                  <ul className={`absolute z-50 w-full mt-1 rounded-md border shadow-lg overflow-hidden max-h-56 overflow-y-auto ${
                    isLight
                      ? 'bg-white border-amber-500/30 text-slate-800'
                      : 'bg-slate-900 border-slate-700 text-slate-200'
                  }`}>
                    {placeSuggestions.map((item) => (
                      <li
                        key={item.place_id}
                        onClick={() => handleSelectLocation(item)}
                        className={`flex items-start gap-2 px-3 py-2 text-xs cursor-pointer transition-colors ${
                          isLight ? 'hover:bg-amber-50 text-slate-800' : 'hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <span className="mt-0.5">📍</span>
                        <span>{item.description}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div>
              <label className={`block font-semibold mb-1 ${isLight ? 'text-[#5C4F43]' : 'text-slate-300'}`}>
                {isTa ? "அட்சரேகை (Latitude)" : "Latitude"}
              </label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className={`w-full p-2 border rounded-md font-mono outline-none text-xs ${
                  isLight
                    ? 'border-amber-500/30 bg-amber-50/40 text-[#2C241E] focus:border-amber-500'
                    : 'border-slate-700 bg-slate-800 text-white focus:border-amber-500'
                }`}
              />
            </div>
            <div>
              <label className={`block font-semibold mb-1 ${isLight ? 'text-[#5C4F43]' : 'text-slate-300'}`}>
                {isTa ? "தீர்க்கரேகை (Longitude)" : "Longitude"}
              </label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className={`w-full p-2 border rounded-md font-mono outline-none text-xs ${
                  isLight
                    ? 'border-amber-500/30 bg-amber-50/40 text-[#2C241E] focus:border-amber-500'
                    : 'border-slate-700 bg-slate-800 text-white focus:border-amber-500'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
            <div>
              <label className={`block font-semibold mb-1 ${isLight ? 'text-[#5C4F43]' : 'text-slate-300'}`}>
                {isTa ? "தேதி & நேரம்" : "Date & Time"}
              </label>
              <input
                type="datetime-local"
                value={queryDateTime}
                onChange={(e) => setQueryDateTime(e.target.value)}
                className={`w-full p-2 border rounded-md font-mono outline-none text-xs ${
                  isLight
                    ? 'border-amber-500/30 bg-amber-50/40 text-[#2C241E] focus:border-amber-500'
                    : 'border-slate-700 bg-slate-800 text-white focus:border-amber-500'
                }`}
              />
            </div>
            <div>
              <label className={`block font-semibold mb-1 ${isLight ? 'text-[#5C4F43]' : 'text-slate-300'}`}>
                {isTa ? "சூரியோதயம்" : "Sunrise"}
              </label>
              <input
                type="time"
                value={sunriseTime}
                onChange={(e) => setSunriseTime(e.target.value)}
                className={`w-full p-2 border rounded-md font-mono outline-none text-xs ${
                  isLight
                    ? 'border-amber-500/30 bg-amber-50/40 text-[#2C241E] focus:border-amber-500'
                    : 'border-slate-700 bg-slate-800 text-white focus:border-amber-500'
                }`}
              />
            </div>
            <div>
              <label className={`block font-semibold mb-1 ${isLight ? 'text-[#5C4F43]' : 'text-slate-300'}`}>
                {isTa ? "சூரிய அஸ்தமனம்" : "Sunset"}
              </label>
              <input
                type="time"
                value={sunsetTime}
                onChange={(e) => setSunsetTime(e.target.value)}
                className={`w-full p-2 border rounded-md font-mono outline-none text-xs ${
                  isLight
                    ? 'border-amber-500/30 bg-amber-50/40 text-[#2C241E] focus:border-amber-500'
                    : 'border-slate-700 bg-slate-800 text-white focus:border-amber-500'
                }`}
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={apiLoading}
            className={`w-full font-bold py-2.5 px-4 rounded-xl shadow transition-all flex items-center justify-center gap-2 text-sm text-white ${
              apiLoading
                ? 'bg-amber-600/70 cursor-wait'
                : 'bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 active:scale-[0.99]'
            }`}
          >
            {apiLoading ? (
              <><span className="animate-spin">⏳</span> {isTa ? "கணக்கிடுகிறோம்…" : "Calculating…"}</>
            ) : (
              <><span>⚡</span> {isTa ? "கணக்கிடுக (Calculate Jamakkol Chart)" : "Calculate Jamakkol Chart"}</>
            )}
          </button>

          {apiError && (
            <div className={`mt-2 p-2.5 rounded-lg border text-xs ${
              isLight
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-red-950/40 border-red-800 text-red-300'
            }`}>
              ⚠️ {apiError}. {isTa ? "ஜாமம் & கௌரி நிலைகள் காட்டப்படுகின்றன; கிரக நிலைகளுக்கு API தேவை." : "Jamam & Gowri are still computed locally; planet degrees require API."}
            </div>
          )}
        </div>

        {/* 2. Dynamic Gowri Nilai Banner */}
        <div className={`text-center mb-5 p-3 border rounded-xl shadow-xs transition-all ${
          isLight
            ? 'bg-emerald-50/80 border-emerald-300/70 text-emerald-900'
            : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
        }`}>
          <span className="font-bold text-sm sm:text-base">
            {isTa ? "தற்போதைய கௌரி நிலை:" : "Current Gowri Status:"} {calculatedData?.currentGowri}
          </span>
        </div>

        {/* 3. Navigation Tabs */}
        <div className={`flex border-b mb-5 overflow-x-auto gap-1 ${
          isLight ? 'border-amber-500/20' : 'border-slate-800'
        }`}>
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'chart'
                ? isLight
                  ? 'border-amber-700 text-amber-900 font-bold'
                  : 'border-amber-500 text-amber-400 font-bold'
                : isLight
                ? 'border-transparent text-[#7A695A] hover:text-[#2C241E]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🎯 {isTa ? "சக்கரம் (Chart)" : "Chart"}
          </button>
          <button
            onClick={() => setActiveTab('sphutas')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'sphutas'
                ? isLight
                  ? 'border-amber-700 text-amber-900 font-bold'
                  : 'border-amber-500 text-amber-400 font-bold'
                : isLight
                ? 'border-transparent text-[#7A695A] hover:text-[#2C241E]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ★ {isTa ? "பிரசன்ன ஸ்புடங்கள்" : "Prasanna Sphutas"}
          </button>
          <button
            onClick={() => setActiveTab('jama')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'jama'
                ? isLight
                  ? 'border-amber-700 text-amber-900 font-bold'
                  : 'border-amber-500 text-amber-400 font-bold'
                : isLight
                ? 'border-transparent text-[#7A695A] hover:text-[#2C241E]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🪐 {isTa ? "ஜாம கிரக நிலைகள்" : "Jama Graha Positions"}
          </button>
          <button
            onClick={() => setActiveTab('touched')}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'touched'
                ? isLight
                  ? 'border-amber-700 text-amber-900 font-bold'
                  : 'border-amber-500 text-amber-400 font-bold'
                : isLight
                ? 'border-transparent text-[#7A695A] hover:text-[#2C241E]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🤝 {isTa ? "தொடும் கிரகங்கள்" : "Touched Planets"}
          </button>
        </div>

        {/* 4. Chart Display View */}
        {activeTab === 'chart' && (
          <div className="space-y-6">
            <div className={`w-full max-w-[500px] sm:max-w-[560px] mx-auto border-2 rounded-2xl p-3 sm:p-4 shadow-xl transition-all ${
              isLight
                ? 'bg-amber-50/30 border-amber-800/80 shadow-amber-500/10'
                : 'bg-slate-900/90 border-amber-700/80 shadow-2xl'
            }`}>
              
              {/* 4x4 SOUTH INDIAN CHART GRID */}
              <div className={`aspect-square grid grid-cols-4 grid-rows-4 border-2 rounded-xl overflow-hidden shadow-inner ${
                isLight
                  ? 'border-amber-800 bg-white'
                  : 'border-amber-700 bg-slate-950'
              }`}>
                
                {/* CENTER BOX (2x2) */}
                <div className={`col-start-2 col-end-4 row-start-2 row-end-4 border-2 p-2 sm:p-3 flex flex-col items-center justify-between text-center transition-all ${
                  isLight
                    ? 'border-amber-800/50 bg-amber-50/70 text-[#2C241E]'
                    : 'border-amber-700/60 bg-amber-950/30 text-white'
                }`}>
                  <div>
                    <div className={`font-serif font-black text-base sm:text-lg leading-tight ${
                      isLight ? 'text-amber-950' : 'text-amber-200'
                    }`}>
                      {isTa ? "ஜாமக்கோள் பிரசன்னம்" : "Jamakkol Prasanam"}
                    </div>
                    <div className={`text-xs font-semibold mt-0.5 ${
                      isLight ? 'text-blue-900' : 'text-blue-300'
                    }`}>
                      {calculatedData?.formattedDate} {calculatedData?.formattedTime}
                    </div>
                    <div className={`text-xs font-bold ${
                      isLight ? 'text-blue-800' : 'text-blue-400'
                    }`}>
                      {calculatedData?.tamWeekdayName} — {isTa ? "ஜாமம்" : "Jamam"} # {calculatedData?.jamamNum}
                    </div>
                  </div>

                  {/* DYNAMIC SPHUTAS IN CENTER */}
                  <div className="w-full space-y-1 my-auto">
                    {!calculatedData?.hasApiData ? (
                      <div className={`text-[10px] text-center italic py-2 ${
                        isLight ? 'text-slate-500' : 'text-slate-400'
                      }`}>
                        {apiLoading ? (isTa ? "⏳ API கணக்கிடுகிறோம்…" : "⏳ Fetching astronomical data…") : (isTa ? "⚡ கணக்கிடுக அழுத்தவும்" : "⚡ Click Calculate")}
                      </div>
                    ) : (<>
                    <div className={`border rounded-md py-0.5 px-2 flex justify-between items-center text-xs shadow-2xs ${
                      isLight
                        ? 'bg-white/95 border-red-300 text-[#2C241E]'
                        : 'bg-slate-900/90 border-red-800/80 text-slate-100'
                    }`}>
                      <span className={`font-bold ${isLight ? 'text-red-700' : 'text-red-400'}`}>
                        {isTa ? "உதயம்" : "Udayam"}
                      </span>
                      <span className="font-medium">★ {calculatedData?.udayamInfo?.formattedStar}</span>
                    </div>

                    <div className={`border rounded-md py-0.5 px-2 flex justify-between items-center text-xs shadow-2xs ${
                      isLight
                        ? 'bg-white/95 border-red-300 text-[#2C241E]'
                        : 'bg-slate-900/90 border-red-800/80 text-slate-100'
                    }`}>
                      <span className={`font-bold ${isLight ? 'text-red-700' : 'text-red-400'}`}>
                        {isTa ? "ஆருடம்" : "Aarudam"}
                      </span>
                      <span className="font-medium">★ {calculatedData?.arudamInfo?.formattedStar}</span>
                    </div>

                    <div className={`border rounded-md py-0.5 px-2 flex justify-between items-center text-xs shadow-2xs ${
                      isLight
                        ? 'bg-white/95 border-red-300 text-[#2C241E]'
                        : 'bg-slate-900/90 border-red-800/80 text-slate-100'
                    }`}>
                      <span className={`font-bold ${isLight ? 'text-red-700' : 'text-red-400'}`}>
                        {isTa ? "கவிப்பு" : "Kavippu"}
                      </span>
                      <span className="font-medium">★ {calculatedData?.kavippuInfo?.formattedStar}</span>
                    </div>
                    </>)}
                  </div>

                  <div className={`text-[10px] font-medium truncate max-w-full ${
                    isLight ? 'text-[#7A695A]' : 'text-slate-400'
                  }`}>
                    {timingParams.location}
                  </div>
                </div>

                {/* 12 RASI HOUSES */}
                {SIGNS.map((sign, index) => {
                  const pos = SOUTH_INDIAN_GRID_POS[index];
                  const cellSphutas = sphutasInChart[index] || [];
                  const jamaGrahas = jamaGrahasInChart[index] || [];
                  const signName = isTa ? sign.nameTa : sign.nameEn;

                  return (
                    <div
                      key={sign.nameEn}
                      style={{ gridRow: pos.row, gridColumn: pos.col }}
                      className={`border p-1.5 flex flex-col justify-between items-center relative aspect-square overflow-hidden transition-colors ${
                        isLight
                          ? 'border-amber-800/30 bg-white'
                          : 'border-amber-700/40 bg-slate-900/95'
                      }`}
                    >
                      <span className={`text-[9px] sm:text-[10px] font-semibold self-start ${
                        isLight ? 'text-[#7A695A]' : 'text-slate-400'
                      }`}>
                        {signName}
                      </span>

                      <div className="flex flex-col items-center gap-0.5 my-auto text-center w-full">
                        {/* DYNAMIC JAMA GRAHAS */}
                        {jamaGrahas.map((jg, jgIdx) => (
                          <div key={jgIdx} className={`flex flex-col items-center leading-tight font-bold ${
                            isLight ? 'text-blue-800' : 'text-blue-400'
                          }`}>
                            <span className="text-[11px] sm:text-xs">{jg.name}</span>
                            <span className="text-[8px] sm:text-[9px] font-mono">({jg.degree})</span>
                          </div>
                        ))}

                        {/* DYNAMIC PRASANNA SPHUTAS */}
                        {cellSphutas.map((item, i) => (
                          <div key={i} className="flex flex-col items-center leading-tight">
                            <span className={`text-[10px] sm:text-[11px] ${item.colorClass}`}>{item.label}</span>
                            <span className={`text-[8px] sm:text-[9px] font-mono ${
                              isLight ? 'text-slate-600' : 'text-slate-400'
                            }`}>
                              ({item.degree})
                            </span>
                          </div>
                        ))}
                      </div>

                      <span className={`absolute bottom-0.5 right-1 text-[8px] sm:text-[9px] font-bold ${
                        isLight ? 'text-amber-800' : 'text-amber-400'
                      }`}>
                        {pos.bhava}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 5. Dynamic Prasanna Sphutas Tab */}
        {activeTab === 'sphutas' && calculatedData && (
          <div className={`border rounded-2xl overflow-hidden shadow-sm transition-all ${
            isLight
              ? 'bg-white border-amber-500/25'
              : 'bg-slate-900 border-slate-800'
          }`}>
            <div className={`font-bold p-3 text-xs sm:text-sm flex justify-between items-center text-white ${
              isLight ? 'bg-amber-900' : 'bg-amber-950 border-b border-amber-800/60'
            }`}>
              <span>★ {isTa ? "பிரசன்ன ஸ்புடங்கள் (Prasanna Sphutas)" : "Prasanna Sphutas (Divination Points)"}</span>
              <span className="text-xs font-normal opacity-85">{timingParams.location}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b font-bold ${
                    isLight
                      ? 'bg-amber-50/70 border-amber-200 text-[#5C4F43]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}>
                    <th className="p-2.5">{isTa ? "கிரகம் / புள்ளி" : "Point / Graha"}</th>
                    <th className="p-2.5">{isTa ? "ராசி" : "Sign"}</th>
                    <th className="p-2.5">{isTa ? "பாகை" : "Degree"}</th>
                    <th className="p-2.5">{isTa ? "நட்சத்திர பாதம்" : "Star & Pada"}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-amber-500/15' : 'divide-slate-800'}`}>
                  {[
                    { label: isTa ? "Udayam (உதயம்)" : "Udayam (Ascendant)",           info: calculatedData.udayamInfo },
                    { label: isTa ? "Arudam (ஆருடம்)" : "Aarudam",                    info: calculatedData.arudamInfo },
                    { label: isTa ? "Kavippu (கவிப்பு)" : "Kavippu",                  info: calculatedData.kavippuInfo },
                    { label: isTa ? "Maandi (மாந்தி)" : "Maandi",                     info: calculatedData.maandiInfo },
                    { label: isTa ? "Yamakandam (யமகண்டம்)" : "Yamakandam",           info: calculatedData.yamakandamInfo },
                    { label: isTa ? "Rahu Kaalam (ராகு காலம்)" : "Rahu Kaalam",       info: calculatedData.rahuKaalamInfo },
                    { label: isTa ? "Mrityu (மிருத்யு)" : "Mrityu Sphutam",           info: calculatedData.mrityuInfo },
                  ].filter(r => r.info !== null).map((row, idx) => (
                    <tr key={idx} className={isLight ? 'hover:bg-amber-50/50' : 'hover:bg-slate-800/50'}>
                      <td className={`p-2.5 font-semibold ${isLight ? 'text-[#1E120A]' : 'text-slate-100'}`}>
                        {row.label}
                      </td>
                      <td className="p-2.5">
                        {isTa ? SIGNS[row.info!.rasiIndex].nameTa : SIGNS[row.info!.rasiIndex].nameEn}
                      </td>
                      <td className="p-2.5 font-mono">{row.info!.formattedDegree}</td>
                      <td className="p-2.5">{row.info!.formattedStar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Dynamic Jama Graha Nilaigal Tab */}
        {activeTab === 'jama' && calculatedData && (
          <div className={`border rounded-2xl overflow-hidden shadow-sm transition-all ${
            isLight
              ? 'bg-white border-blue-500/25'
              : 'bg-slate-900 border-slate-800'
          }`}>
            <div className={`font-bold p-3 text-xs sm:text-sm flex justify-between items-center text-white ${
              isLight ? 'bg-blue-900' : 'bg-blue-950 border-b border-blue-800/60'
            }`}>
              <span>🪐 {isTa ? "ஜாம கிரக நிலைகள் (Jama Graha Positions)" : "Jama Graha Positions"}</span>
              <span className="text-xs font-normal opacity-85">{isTa ? "ஜாமம்" : "Jamam"} # {calculatedData.jamamNum}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b font-bold ${
                    isLight
                      ? 'bg-blue-50/70 border-blue-200 text-[#5C4F43]'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}>
                    <th className="p-2.5">{isTa ? "ஜாம கிரகம்" : "Jama Planet"}</th>
                    <th className="p-2.5">{isTa ? "குறியீடு" : "Symbol"}</th>
                    <th className="p-2.5">{isTa ? "ராசி (Sign)" : "Sign"}</th>
                    <th className="p-2.5">{isTa ? "பாகை (Degree)" : "Degree"}</th>
                    <th className="p-2.5">{isTa ? "நட்சத்திர பாதம்" : "Star & Pada"}</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-blue-500/15' : 'divide-slate-800'}`}>
                  {calculatedData.jamaGrahaPositions.map((row, idx) => {
                    const d   = row.localDeg;
                    const deg = Math.floor(d);
                    const min = Math.round((d - deg) * 60);
                    const degStr = `${deg}° ${min < 10 ? '0' : ''}${min}'`;
                    return (
                      <tr key={idx} className={isLight ? 'hover:bg-blue-50/50' : 'hover:bg-slate-800/50'}>
                        <td className={`p-2.5 font-bold ${isLight ? 'text-blue-800' : 'text-blue-400'}`}>
                          {row.name}
                        </td>
                        <td className="p-2.5 font-mono font-semibold">{row.symbol}</td>
                        <td className="p-2.5">
                          {isTa ? SIGNS[row.rasiIdx].nameTa : SIGNS[row.rasiIdx].nameEn}
                        </td>
                        <td className="p-2.5 font-mono">{degStr}</td>
                        <td className="p-2.5">{row.degreeInfo.formattedStar}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Dynamic Thodum Grahangal Tab */}
        {activeTab === 'touched' && calculatedData && (
          <div className="space-y-4">
            <div className={`border rounded-2xl overflow-hidden shadow-sm transition-all ${
              isLight
                ? 'bg-white border-indigo-500/25'
                : 'bg-slate-900 border-slate-800'
            }`}>
              <div className={`font-bold p-3 text-xs sm:text-sm text-white ${
                isLight ? 'bg-indigo-900' : 'bg-indigo-950 border-b border-indigo-800/60'
              }`}>
                🤝 {isTa ? "தொடும் கிரகங்கள் பகுப்பாய்வு (Touched Planets Analysis)" : "Touched Planets Analysis"}
              </div>
              <div className="p-4 space-y-3">
                {calculatedData.touchedPlanets.length > 0 ? (
                  calculatedData.touchedPlanets.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                        isLight
                          ? 'border-amber-500/20 bg-amber-50/40'
                          : 'border-slate-800 bg-slate-800/50'
                      }`}
                    >
                      <div>
                        <span className={`text-xs font-bold block ${
                          isLight ? 'text-amber-900' : 'text-amber-400'
                        }`}>
                          {item.target}
                        </span>
                        <span className={`text-xs ${isLight ? 'text-[#374151]' : 'text-slate-300'}`}>
                          {isTa ? "தொடும் கிரகம்: " : "Touching Planet: "}
                          <strong className={isLight ? 'text-blue-800' : 'text-blue-400'}>
                            {item.touchingPlanets}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                          isLight
                            ? 'bg-amber-100 text-amber-950 border-amber-300'
                            : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                        }`}>
                          {item.type}
                        </span>
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                          isLight
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`text-xs italic text-center py-5 ${
                    isLight ? 'text-[#7A695A]' : 'text-slate-400'
                  }`}>
                    {isTa
                      ? "தற்போது தொடும் அல்லது சமசப்தம பார்வையில் நேரடியாக இருக்கும் கிரகங்கள் எதுவுமில்லை."
                      : "No planets are currently in direct conjunction or 7th house aspect."}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </ScreenGuard>
  );
};

export default JamakkolCalculator;

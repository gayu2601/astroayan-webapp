import React, { useState, useMemo } from 'react';
import ScreenGuard from './ScreenGuard';

// --- Astro Constants ---
const TAMIL_SIGNS = [
  { name: "மேஷம்", eng: "Aries" },
  { name: "ரிஷபம்", eng: "Taurus" },
  { name: "மிதுனம்", eng: "Gemini" },
  { name: "கடகம்", eng: "Cancer" },
  { name: "சிம்மம்", eng: "Leo" },
  { name: "கன்னி", eng: "Virgo" },
  { name: "துலாம்", eng: "Libra" },
  { name: "விருச்சிகம்", eng: "Scorpio" },
  { name: "தனுசு", eng: "Sagittarius" },
  { name: "மகரம்", eng: "Capricorn" },
  { name: "கும்பம்", eng: "Aquarius" },
  { name: "மீனம்", eng: "Pisces" }
];

const NAKSHATRAS = [
  "அஸ்வினி", "பரணி", "கார்த்திகை", "ரோஹிணி", "மிருகசீரிஷம்", "திருவாதிரை",
  "புனர்பூசம்", "பூசம்", "ஆயில்யம்", "மகம்", "பூரம்", "உத்திரம்",
  "ஹஸ்தம்", "சித்திரை", "சுவாதி", "விசாகம்", "அனுஷம்", "கேட்டை",
  "மூலம்", "பூராடம்", "உத்திராடம்", "திருவோணம்", "அவிட்டம்", "சதயம்",
  "பூரட்டாதி", "உத்திரட்டாதி", "ரேவதி"
];

// --- Jama Grahas (classical Jamakkol Prasanam planets) ---
// Per "Jamakkol Prasanam" (Tirupur S. GopalaKrishnan), Ch.6 "Configuration of
// Jamakkol Planets": the 9 grahas are reduced to 8 Jamam planets by treating
// Rahu and Ketu as ONE combined entity called "the Snake" (பாம்பு). There is
// no separate Ketu Jama Graha. The fixed cyclic order used to fill the 8
// Jamam slots is exactly: Sun, Mars, Jupiter, Mercury, Venus, Saturn, Moon,
// Snake (verified against the book's weekday table on p.13/26).
const JAMA_PLANETS = [
  { name: "சூரியன்", symbol: "சூரி", eng: "Sun" },
  { name: "செவ்வாய்", symbol: "செவ்", eng: "Mars" },
  { name: "குரு",    symbol: "குரு", eng: "Jupiter" },
  { name: "புதன்",   symbol: "புத",  eng: "Mercury" },
  { name: "சுக்கிரன்",symbol: "சுக்", eng: "Venus" },
  { name: "சனி",     symbol: "சனி",  eng: "Saturn" },
  { name: "சந்திரன்", symbol: "சந்",  eng: "Moon" },
  { name: "பாம்பு (ராகு-கேது)", symbol: "பாம்பு", eng: "Snake" },
];

// The fixed 8-step planet cycle (see comment above). Index arithmetic below
// rotates this array to find which planet occupies which Jamam slot.
const JAMA_PLANET_CYCLE = ["Sun", "Mars", "Jupiter", "Mercury", "Venus", "Saturn", "Moon", "Snake"] as const;

// Which planet in the cycle "leads" (occupies Jamam #1 / the Meena rasi) on
// each weekday — always that day's own ruling planet (0=Sunday..6=Saturday).
const WEEKDAY_LORD_CYCLE_INDEX: Record<number, number> = {
  0: JAMA_PLANET_CYCLE.indexOf("Sun"),     // Sunday
  1: JAMA_PLANET_CYCLE.indexOf("Moon"),    // Monday
  2: JAMA_PLANET_CYCLE.indexOf("Mars"),    // Tuesday
  3: JAMA_PLANET_CYCLE.indexOf("Mercury"), // Wednesday
  4: JAMA_PLANET_CYCLE.indexOf("Jupiter"), // Thursday
  5: JAMA_PLANET_CYCLE.indexOf("Venus"),   // Friday
  6: JAMA_PLANET_CYCLE.indexOf("Saturn"),  // Saturday
};

// The 8 rasis occupied by Jamam #1..#8, common to BOTH day and night (p.25).
// Sequence: Meena, Makara, Dhanusu, Thulam, Kanni, Kataka, Mithuna, Mesha —
// i.e. anticlockwise around the zodiac, skipping the 4 fixed (Sthira) rasis
// Rishabam(1), Simmam(4), Viruchigam(7), Kumbam(10) entirely.
const JAMAM_SLOT_RASI: number[] = [11, 9, 8, 6, 5, 3, 2, 0];

// --- Gowri Nilai (Gowri Panchangam) ---
// The 8 Gowri names always repeat in this FIXED cyclical order (verified against
// published Pambu Panchangam data). Which name lands on the first slot after
// sunrise depends on the weekday - it is NOT simply "jamamIndex % 8" as before.
const GOWRI_MASTER_CYCLE: { name: string; auspicious: boolean }[] = [
  { name: "தனம்", auspicious: true },
  { name: "சுகம்", auspicious: true },
  { name: "சோரம்", auspicious: false },
  { name: "உத்தி", auspicious: true },
  { name: "அமிர்தம்", auspicious: true },
  { name: "விஷம்", auspicious: false },
  { name: "ரோகம்", auspicious: false },
  { name: "லாபம்", auspicious: true }
];

// Index into GOWRI_MASTER_CYCLE that the FIRST daytime slot (right after sunrise)
// starts on, for each weekday (0=Sunday ... 6=Saturday). Derived from the
// standard Rahu Kalam weekday-portion mnemonic (Sun=8th,Mon=2nd,Tue=7th,Wed=5th,
// Thu=6th,Fri=4th,Sat=3rd portion of the day), cross-checked against a real
// published Gowri Panchangam (which shows Rahu Kalam always falls on the
// "விஷம்" slot). The night's first slot always starts 4 positions further
// along the same cycle than the day's first slot.
const WEEKDAY_DAY_GOWRI_START: Record<number, number> = {
  0: 2, // Sunday    -> சோரம்
  1: 4, // Monday    -> அமிர்தம்
  2: 1, // Tuesday   -> சுகம்
  3: 7, // Wednesday -> லாபம்
  4: 0, // Thursday  -> தனம்
  5: 6, // Friday    -> ரோகம்
  6: 5  // Saturday  -> விஷம்
};

// South Indian Chart Grid Mapping (0=Aries ... 11=Pisces)
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

// --- Helper Functions for Precise Calculations ---

/** Calculates Nakshatra and Pada dynamically from total 0-360 longitude degree */
function getNakshatraAndPada(deg360: number) {
  const normalizedDeg = (deg360 % 360 + 360) % 360;
  
  // 360 degrees / 27 Nakshatras = 13.3333 degrees per Nakshatra
  const nakshatraLength = 360 / 27;
  const nakIdx = Math.floor(normalizedDeg / nakshatraLength);
  const nakName = NAKSHATRAS[nakIdx % 27];

  // 13.3333 degrees / 4 Padas = 3.3333 degrees per Pada
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

/**
 * Returns the Sun's ecliptic longitude (0–359.99°) for a given date,
 * derived from published Tamil Sankranti (Rasi-entry) dates.
 *
 * Method:
 *  – Each of the 12 Rasi transitions has a canonical entry date (year-invariant
 *    within ±1 day).  We store them as {month (1-based), day} pairs for the
 *    most common year; the Sun enters Mesham (0°) around 14 Apr, moves ~1°/day.
 *  – We find which rasi the date falls in, then linearly interpolate within
 *    that rasi using days elapsed since entry and the rasi's duration in days
 *    (derived from the gap to the next entry).
 *  – Result is accurate to ≈ ±1° — far better than the flat 15° mid-sign guess.
 *
 * Sankranti dates below are the standard Tamil solar calendar entry dates
 * (IST, common year).  Leap-year shift is handled by normalising to day-of-year.
 */
function getSunLongitudeForDate(date: Date): number {
  // Sankranti entry dates: [month (1-based), day, rasi index 0=Aries]
  // Month/day = approximate date the Sun enters that rasi (Tamil Panchangam standard)
  const SANKRANTI: { month: number; day: number; rasi: number }[] = [
    { month: 4,  day: 14, rasi: 0  }, // Mesham  (Aries)
    { month: 5,  day: 15, rasi: 1  }, // Rishabam (Taurus)
    { month: 6,  day: 15, rasi: 2  }, // Mithunam (Gemini)
    { month: 7,  day: 16, rasi: 3  }, // Kadagam (Cancer)
    { month: 8,  day: 17, rasi: 4  }, // Simmam  (Leo)
    { month: 9,  day: 17, rasi: 5  }, // Kanni   (Virgo)
    { month: 10, day: 18, rasi: 6  }, // Thulam  (Libra)
    { month: 11, day: 17, rasi: 7  }, // Viruchigam (Scorpio)
    { month: 12, day: 16, rasi: 8  }, // Dhanusu (Sagittarius)
    { month: 1,  day: 14, rasi: 9  }, // Magaram (Capricorn)  — next calendar year
    { month: 2,  day: 13, rasi: 10 }, // Kumbam  (Aquarius)
    { month: 3,  day: 15, rasi: 11 }, // Meenam  (Pisces)
  ];

  const year = date.getFullYear();

  // Build absolute Date objects for each sankranti in the current or adjacent year.
  // Magaram (Jan 14) and the two that follow belong to the NEXT year if we're
  // computing for a date in Apr–Dec, or to the CURRENT year if Jan–Mar.
  function sankrantiDate(s: { month: number; day: number; rasi: number }, y: number): Date {
    return new Date(y, s.month - 1, s.day, 0, 0, 0, 0);
  }

  // Collect dates: rasi 9–11 may span a year boundary — generate two years worth
  // and pick the window that contains `date`.
  const candidates: { date: Date; rasi: number }[] = [];
  for (const y of [year - 1, year, year + 1]) {
    for (const s of SANKRANTI) {
      candidates.push({ date: sankrantiDate(s, y), rasi: s.rasi });
    }
  }
  // Sort chronologically
  candidates.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Find the entry whose date is ≤ `date` and whose successor is > `date`
  const ts = date.getTime();
  let entryIdx = 0;
  for (let i = 0; i < candidates.length - 1; i++) {
    if (candidates[i].date.getTime() <= ts && candidates[i + 1].date.getTime() > ts) {
      entryIdx = i;
      break;
    }
  }

  const entry = candidates[entryIdx];
  const next  = candidates[entryIdx + 1];

  const rasiDurationMs  = next.date.getTime() - entry.date.getTime();
  const elapsedMs       = ts - entry.date.getTime();
  const fractionInRasi  = Math.min(1, Math.max(0, elapsedMs / rasiDurationMs));

  // Sun longitude = rasi start (multiples of 30°) + fraction × 30°
  const sunLongitude = entry.rasi * 30 + fractionInRasi * 30;
  return sunLongitude % 360;
}

// NOTE: VedicAstroAPI's real transiting planet degrees are used ONLY for the
// Udayam (Ascendant — the API's own "software calculates it" method, which
// the book explicitly endorses on p.17) and for the Sun's real sidereal
// position (needed for the Veedhi/Kavippu rule below). The 8 Jama Grahas
// themselves are NOT real transiting planets — the book is explicit (Ch.6,
// p.26) that "the planets in the transit are put inside the zodiac squares"
// while "the Jamakkol planets are placed outside the zodiac square" on a
// purely time-and-weekday-driven cycle (see JAMA_PLANET_CYCLE /
// WEEKDAY_LORD_CYCLE_INDEX / JAMAM_SLOT_RASI above). Fetching Rahu/Ketu/etc.
// real degrees and calling them "Jama Grahas" — as this component previously
// did — conflates the two systems.

export const JamakkolCalculator: React.FC = () => {
  // Input Controls State
  const [location, setLocation] = useState<string>("Chennai, Tamil Nadu");
  const [latitude, setLatitude] = useState<string>("13.0827");
  const [longitude, setLongitude] = useState<string>("80.2707");
  const [queryDateTime, setQueryDateTime] = useState<string>("2026-09-05T11:16");
  const [sunriseTime, setSunriseTime] = useState<string>("05:57");
  const [sunsetTime, setSunsetTime] = useState<string>("18:17");

  const [activeTab, setActiveTab] = useState<'chart' | 'sphutas' | 'jama' | 'touched'>('chart');

  // API state
  const [apiData, setApiData] = useState<Record<string, any> | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  // Timing state (committed on Calculate)
  const [timingParams, setTimingParams] = useState({
    queryDateTime: "2026-09-05T11:16",
    sunriseTime:   "05:57",
    sunsetTime:    "18:17",
    location:      "Chennai, Tamil Nadu",
  });

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

      // Match the exact param names and format used by useHoroscope.js
      const dob = `${String(day).padStart(2,'0')}/${String(month).padStart(2,'0')}/${year}`;
      const tob = `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`;

      const params = new URLSearchParams({
        dob,
        tob,
        lat:     latitude,
        lon:     longitude,
        tz:      "5.5",
        lang:    "ta",
        api_key: "6a0b4e5a-b8d5-5e1a-bd97-6128ad38d349",
      });

      const url = `https://api.vedicastroapi.com/v3-json/horoscope/planet-details?${params}`;
      console.log("Jamakkol API:", url);

      const res = await fetch(url, { method: "GET" });
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
      const json = await res.json();
      console.log("Jamakkol API response:", json);

      // Response is { response: { "0": {...lagna}, "1": {...sun}, ... } }
      // Normalise to a plain numeric-keyed object matching our apiData lookups
      const resp = json?.response ?? json;
      const planets: Record<string, any> = {};
      if (resp && typeof resp === 'object' && !Array.isArray(resp)) {
        Object.keys(resp)
          .filter(k => !isNaN(Number(k)))
          .forEach(k => { planets[k] = resp[k]; });
      }
      setApiData(planets);
    } catch (err: any) {
      console.log("Jamakkol API error:", err);
      setApiError(err.message ?? "API call failed");
    } finally {
      setApiLoading(false);
    }
  };

  // ── Core calculations (Jamam, Gowri, Sphutas, Jama Grahas) ──────────────
  const calculatedData = useMemo(() => {
    const dt = new Date(timingParams.queryDateTime);
    if (isNaN(dt.getTime())) return null;

    // Parse sunrise / sunset
    const [srH, srM] = timingParams.sunriseTime.split(':').map(Number);
    const [ssH, ssM] = timingParams.sunsetTime.split(':').map(Number);
    const sunriseMins = srH * 60 + srM;
    const sunsetMins  = ssH * 60 + ssM;
    const queryMins   = dt.getHours() * 60 + dt.getMinutes();

    const isDay = queryMins >= sunriseMins && queryMins < sunsetMins;
    const dayDuration   = sunsetMins - sunriseMins;
    const nightDuration = 1440 - dayDuration;

    // Tamil Panchangam day starts at sunrise.  A time before sunrise still
    // belongs to the *previous* calendar day's weekday.
    const tamWeekday = queryMins < sunriseMins
      ? (dt.getDay() + 6) % 7
      : dt.getDay();

    // Elapsed minutes since start of the current day/night period
    let elapsedMins: number;
    if (isDay) {
      elapsedMins = queryMins - sunriseMins;
    } else {
      elapsedMins = queryMins >= sunsetMins
        ? queryMins - sunsetMins
        : (1440 - sunsetMins) + queryMins;
    }

    // ── True classical Jamam — Ch.5 "Jamakkol Timings" (p.25-26) ─────────
    // IMPORTANT: unlike the Udhaya (which correctly scales with the real
    // local sunrise/sunset — see Method 2 above), the book fixes every
    // Jamam at EXACTLY 90 minutes on a civil clock starting 06:00 (day) /
    // 18:00 (night): "the Jamakkol timings of the rasis are always
    // constant for all the weekdays and they never change" (p.25), and
    // every worked example in the book starts the first Jamam at 06:00
    // regardless of that day's actual sunrise. `gowriPeriodDuration` below
    // (derived from the user's sunrise/sunset inputs) is NOT the classical
    // Jamam — it's kept only because the Gowri Nilai feature (not part of
    // this book) already depends on it. The real Jamam number / Jama Graha
    // placement must come from this fixed 06:00/18:00 clock instead:
    const FIXED_DAY_START_MIN   = 6 * 60; // 06:00, per every example in the book
    const sinceSixAM            = ((queryMins - FIXED_DAY_START_MIN) % 1440 + 1440) % 1440;
    const classicalIsDay        = sinceSixAM < 720; // 06:00-18:00 = day
    const withinClassicalPeriod = classicalIsDay ? sinceSixAM : sinceSixAM - 720;
    const jamamIndex             = Math.min(7, Math.floor(withinClassicalPeriod / 90));
    const jamamNum               = jamamIndex + 1;
    const elapsedInCurrentJamam  = withinClassicalPeriod - jamamIndex * 90; // 0-90 minutes

    // The Jamakkol "day" (for deciding which planet is that day's lord)
    // also turns over at this same fixed 06:00, not at midnight and not at
    // the real local sunrise.
    const jamakkolWeekday = queryMins < FIXED_DAY_START_MIN ? (dt.getDay() + 6) % 7 : dt.getDay();

    // ── 1. Gowri Nilai (separate feature, not part of this book — kept on
    // its own sunrise/sunset-proportional 8-slot division as before) ─────
    // Verified offsets (cross-checked against two reference screenshots):
    //   Friday night Jamam#5  → சோரம் (index 2)
    //   Saturday day  Jamam#4 → அமிர்தம் (index 4)
    const GOWRI_DAY_START: Record<number, number> = {
      0: 5, // Sunday    → விஷம்
      1: 4, // Monday    → அமிர்தம்
      2: 1, // Tuesday   → சுகம்
      3: 7, // Wednesday → லாபம்
      4: 0, // Thursday  → தனம்
      5: 2, // Friday    → சோரம்  (was 6 — FIXED)
      6: 1, // Saturday  → சுகம்  (was 5 — FIXED)
    };
    const gowriPeriodDuration = isDay ? dayDuration / 8 : nightDuration / 8;
    const gowriSlot     = Math.min(7, Math.floor(elapsedMins / gowriPeriodDuration));
    const dayStart      = GOWRI_DAY_START[tamWeekday];
    const gowriBase     = isDay ? dayStart : (dayStart + 4) % 8;
    const gowriIdx      = (gowriBase + gowriSlot) % 8;
    const gowriEntry    = GOWRI_MASTER_CYCLE[gowriIdx];
    const currentGowri  =
      `${gowriEntry.auspicious ? "✅" : "❌"} ${gowriEntry.name} (${gowriEntry.auspicious ? "சுபம்" : "அசுபம்"})`;

    // ── 2. The Aarudam ───────────────────────────────────────────────────
    // Per the book (Ch. "Basics of the Jamakkol Prasanam" → "1. The Aarudam",
    // the author's own simplified method, p.14-15): the Aarudam has NOTHING
    // to do with the Udayam or the Jamam number. It is looked up purely from
    // the MINUTE-OF-THE-HOUR of the query clock time — each successive
    // 5-minute block of the hour maps to the next rasi starting at Mesha for
    // minute 0-5, cycling once through all 12 signs every hour:
    //   00-05 Mesha, 05-10 Rishaba, 10-15 Mithuna, 15-20 Kataka,
    //   20-25 Simha, 25-30 Kanya, 30-35 Thula, 35-40 Virschika,
    //   40-45 Dhanus, 45-50 Makara, 50-55 Kumbha, 55-60 Meena.
    // i.e. rasiIndex = floor(minute / 5). Since 5 minutes spans a full 30°
    // sign, 1 minute = 6° — used below to give the Aarudam a continuous
    // degree (the book itself only ever specifies the rasi, not a finer
    // degree/pada breakdown).
    const queryMinuteOfHour = dt.getMinutes();
    const aarudamRasiIdx    = Math.floor(queryMinuteOfHour / 5) % 12;
    const aarudamDeg        = aarudamRasiIdx * 30 + (queryMinuteOfHour % 5) * 6;
    const arudamInfo        = getNakshatraAndPada(aarudamDeg);

    // ── 3–5. Udayam / Veedhi / Kavippu from API Lagna & Sun ─────────────
    // Udayam = real sidereal Lagna (index "0" in API response). The book
    // explicitly says (p.17) modern practitioners let software calculate
    // this, so using the API's ascendant here is correct.
    // If the API hasn't returned yet we still show Jamam / Gowri / Aarudam.
    const lagnaGlobalDeg: number | null = apiData?.["0"]?.global_degree ?? null;

    let udayamInfo = null, kavippuInfo = null;
    let maandiInfo = null, yamakandamInfo = null, rahuKaalamInfo = null, mrityuInfo = null;
    let sunInfo = null, moonInfo = null;

    if (lagnaGlobalDeg !== null) {
      const udayamDeg = lagnaGlobalDeg;
      udayamInfo = getNakshatraAndPada(udayamDeg);

      // Sun & Moon real positions from API
      const sunGlobalDeg  = apiData?.["1"]?.global_degree ?? null;
      const moonGlobalDeg = apiData?.["2"]?.global_degree ?? null;
      if (sunGlobalDeg  !== null) sunInfo  = getNakshatraAndPada(sunGlobalDeg);
      if (moonGlobalDeg !== null) moonInfo = getNakshatraAndPada(moonGlobalDeg);

      // Kavippu — per Ch. "Basics" → "3. The Veedhi" / "4. The Kavippu"
      // (p.21-24). The transit Sun's rasi decides which of 3 "Veedhi"
      // groups is active; each Veedhi has a reference rasi (Mesha/Rishaba/
      // Mithuna). Count signs from the Aarudam up to that reference rasi
      // (inclusive) = X; then count X signs from the Udayam — that lands on
      // the Kavippu. Worked example on p.24 (Udayam Simha, Aarudam
      // Virschika, transit Sun Makara → Mithuna Veedhi → X=8 → Kavippu
      // Meena) is used to verify this exact formula.
      if (sunInfo) {
        const MESHA_VEEDHI    = [1, 2, 3, 4];   // Rishaba,Mithuna,Kataka,Simha
        const RISHABA_VEEDHI  = [11, 0, 5, 6];  // Meena,Mesha,Kanya,Thula
        const MITHUNA_VEEDHI  = [7, 8, 9, 10];  // Virschika,Dhanus,Makara,Kumbha

        const sunRasi = sunInfo.rasiIndex;
        const veedhiTargetRasi =
          MESHA_VEEDHI.includes(sunRasi)   ? 0 /* Mesha */   :
          RISHABA_VEEDHI.includes(sunRasi) ? 1 /* Rishaba */ :
          2 /* Mithuna */; // MITHUNA_VEEDHI covers the remaining 4 signs

        const countFromAarudam = ((veedhiTargetRasi - aarudamRasiIdx + 12) % 12) + 1;
        const kavippuRasiIdx   = udayamInfo ? (udayamInfo.rasiIndex + countFromAarudam - 1) % 12 : null;

        if (kavippuRasiIdx !== null) {
          // The book only fixes the Kavippu's rasi via counting; no finer
          // degree/pada rule is given, so we place it at the sign's midpoint
          // purely for chart/nakshatra display purposes.
          kavippuInfo = getNakshatraAndPada(kavippuRasiIdx * 30 + 15);
        }
      }

      // ⚠️ The four sphutas below (Maandi, Yamakandam, Rahu Kaalam, Mrityu)
      // are NOT part of the classical Jamakkol Prasanam system described in
      // this book — a full-text search of "Jamakkol Prasanam" (Tirupur S.
      // GopalaKrishnan) turns up no mention of any of them; they appear to
      // be generic Panchangam concepts folded in separately. Their formulas
      // below are left untouched (not verified against this text) — treat
      // them as a supplementary, independent feature rather than part of
      // the Aarudam/Udayam/Veedhi/Kavippu system fixed above.
      const maandiDeg      = (udayamDeg + tamWeekday * 30 + jamamNum * 12) % 360;
      const yamaDeg        = (udayamDeg + 120 + jamamNum * 15) % 360;
      const rahuKaaDeg     = (udayamDeg + 180 + jamamNum * 15) % 360;
      const mrityuDeg      = (udayamDeg + 240) % 360;

      maandiInfo      = getNakshatraAndPada(maandiDeg);
      yamakandamInfo  = getNakshatraAndPada(yamaDeg);
      rahuKaalamInfo  = getNakshatraAndPada(rahuKaaDeg);
      mrityuInfo      = getNakshatraAndPada(mrityuDeg);
    }

    // ── 6. Jama Graha Positions — classical weekday/Jamam table ─────────
    // Per Ch.6 "Configuration of Jamakkol Planets" (p.13, 26): the 8 Jama
    // Grahas are NOT real transiting planets. At any moment they occupy the
    // 8 slots (JAMAM_SLOT_RASI) in the fixed cyclic order JAMA_PLANET_CYCLE,
    // rotated so that the day's own ruling planet leads Jamam #1 (both day
    // and night use the same table — verified against the book's Sun..Sat
    // weekday table on p.13/26). jamamIndex (0-7) is the slot already
    // computed above from elapsed time within the current day/night period.
    type JGPos = {
      name: string; symbol: string; eng: string;
      rasiIdx: number; localDeg: number;
      degreeInfo: ReturnType<typeof getNakshatraAndPada>;
    };
    const jamaGrahaPositions: JGPos[] = [];

    // withinSlotDeg: continuous within-sign degree for the currently-active
    // slot's planet, using elapsedInCurrentJamam computed above from the
    // fixed classical clock (not the sunrise-based Gowri timing).
    const withinSlotDeg = Math.min(29.9, Math.max(0, elapsedInCurrentJamam * 0.5));

    const leadCycleIdx = WEEKDAY_LORD_CYCLE_INDEX[jamakkolWeekday];
    for (let slot = 0; slot < 8; slot++) {
      const planetName = JAMA_PLANET_CYCLE[(leadCycleIdx + slot) % 8];
      const rasiIdx     = JAMAM_SLOT_RASI[slot];
      const jamaPlanet  = JAMA_PLANETS.find(p => p.eng === planetName)!;
      // Only the currently-active slot's planet is "in motion" through its
      // 45°; the rest are shown at the start of their slot's rasi.
      const localDeg    = slot === jamamIndex ? withinSlotDeg : 0;
      const globalDeg    = rasiIdx * 30 + localDeg;

      jamaGrahaPositions.push({
        name:       jamaPlanet.name,
        symbol:     jamaPlanet.symbol,
        eng:        jamaPlanet.eng,
        rasiIdx,
        localDeg,
        degreeInfo: getNakshatraAndPada(globalDeg),
      });
    }

    // ── 7. Thodum Grahangal (Aspect Analysis) ───────────────────────────
    type Touched = { target: string; targetRasi: string; touchingPlanets: string; status: string; type: string };
    const touchedPlanets: Touched[] = [];

    const checkAspects = (label: string, info: ReturnType<typeof getNakshatraAndPada> | null) => {
      if (!info) return;
      jamaGrahaPositions.forEach((jg) => {
        const diff = Math.abs(jg.rasiIdx - info.rasiIndex);
        if (diff === 0) {
          touchedPlanets.push({
            target: `${label} (${TAMIL_SIGNS[info.rasiIndex].name} ${info.formattedDegree})`,
            targetRasi: TAMIL_SIGNS[info.rasiIndex].name,
            touchingPlanets: `${jg.name} (${jg.degreeInfo.formattedDegree} - உடனுறைவு)`,
            status: jg.eng === "Saturn" || jg.eng === "Snake" ? "கவனம் தேவை" : "நன்மை / சுப பார்வை",
            type: "சேர்க்கை (Conjunction)"
          });
        } else if (diff === 6) {
          touchedPlanets.push({
            target: `${label} (${TAMIL_SIGNS[info.rasiIndex].name} ${info.formattedDegree})`,
            targetRasi: TAMIL_SIGNS[info.rasiIndex].name,
            touchingPlanets: `${jg.name} (${jg.degreeInfo.formattedDegree} - சமசப்தம பார்வை)`,
            status: "நேரடி பார்வை",
            type: "பார்வை (Aspect)"
          });
        }
      });
    };

    checkAspects("உதயம்", udayamInfo);
    checkAspects("ஆருடம்", arudamInfo);
    checkAspects("கவிப்பு", kavippuInfo);

    const WEEKDAY_NAMES = ["ஞாயிறு","திங்கள்","செவ்வாய்","புதன்","வியாழன்","வெள்ளி","சனி"];

    return {
      jamamNum, tamWeekday,
      tamWeekdayName: WEEKDAY_NAMES[jamakkolWeekday],
      currentGowri,
      udayamInfo, arudamInfo, kavippuInfo,
      maandiInfo, yamakandamInfo, rahuKaalamInfo, mrityuInfo,
      sunInfo, moonInfo,
      jamaGrahaPositions,
      touchedPlanets,
      hasApiData: !!apiData,
      formattedDate: dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      formattedTime: dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  }, [timingParams, apiData]);

  // Map calculated Sphutas into Chart Grid
  const sphutasInChart = useMemo(() => {
    const map: Record<number, { label: string; degree: string; colorClass: string }[]> = {};
    for (let i = 0; i < 12; i++) map[i] = [];

    if (!calculatedData) return map;

    const { udayamInfo, arudamInfo, kavippuInfo, maandiInfo, yamakandamInfo, rahuKaalamInfo, mrityuInfo } = calculatedData;

    if (udayamInfo)     map[udayamInfo.rasiIndex].push({ label: "உதயம்",   degree: udayamInfo.formattedDegree,    colorClass: "text-red-600 font-bold" });
    if (arudamInfo)     map[arudamInfo.rasiIndex].push({ label: "ஆருடம்",  degree: arudamInfo.formattedDegree,    colorClass: "text-red-700 font-bold" });
    if (kavippuInfo)    map[kavippuInfo.rasiIndex].push({ label: "கவிப்பு", degree: kavippuInfo.formattedDegree,  colorClass: "text-red-600 font-semibold" });
    if (maandiInfo)     map[maandiInfo.rasiIndex].push({ label: "மாந்",    degree: maandiInfo.formattedDegree,    colorClass: "text-red-800 font-semibold" });
    if (yamakandamInfo) map[yamakandamInfo.rasiIndex].push({ label: "எம",   degree: yamakandamInfo.formattedDegree, colorClass: "text-red-800 font-semibold" });
    if (rahuKaalamInfo) map[rahuKaalamInfo.rasiIndex].push({ label: "ரா.கா", degree: rahuKaalamInfo.formattedDegree, colorClass: "text-red-800 font-semibold" });
    if (mrityuInfo)     map[mrityuInfo.rasiIndex].push({ label: "மிருத்யு", degree: mrityuInfo.formattedDegree,  colorClass: "text-purple-800 font-bold" });

    return map;
  }, [calculatedData]);

  // Map Jama Grahas into Chart Grid in Blue
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
    <div className="max-w-4xl mx-auto p-3 sm:p-5 bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 min-h-screen">
      
      {/* 1. Input Controls Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm mb-5">
        <h2 className="text-sm sm:text-base font-bold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
          <span>⚙️</span> இடம் & பிரசன்ன கணிப்பு அளவுருக்கள்
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">இடம் (Place Name)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">அட்சரேகை (Latitude)</label>
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 font-mono outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">தீர்க்கரேகை (Longitude)</label>
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 font-mono outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
          <div>
            <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">தேதி & நேரம்</label>
            <input
              type="datetime-local"
              value={queryDateTime}
              onChange={(e) => setQueryDateTime(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 font-mono outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">சூரியோதயம்</label>
            <input
              type="time"
              value={sunriseTime}
              onChange={(e) => setSunriseTime(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 font-mono outline-none"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-slate-600 dark:text-slate-300">சூரிய அஸ்தமனம்</label>
            <input
              type="time"
              value={sunsetTime}
              onChange={(e) => setSunsetTime(e.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800 font-mono outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={apiLoading}
          className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-amber-400 text-white font-bold py-2.5 px-4 rounded-lg shadow transition-colors flex items-center justify-center gap-2 text-sm"
        >
          {apiLoading ? <><span className="animate-spin">⏳</span> கணக்கிடுகிறோம்…</> : <><span>⚡</span> கணக்கிடுக (Calculate Jamakkol Chart)</>}
        </button>

        {apiError && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-700 rounded text-xs text-red-700 dark:text-red-300">
            ⚠️ VedicAstroAPI error: {apiError}. Jamam &amp; Gowri are still shown; planet positions require the API.
          </div>
        )}
      </div>

      {/* 2. Dynamic Gowri Nilai Banner */}
      <div className="text-center mb-5 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg shadow-sm">
        <span className="text-emerald-800 dark:text-emerald-300 font-bold text-sm sm:text-base">
          தற்போதைய கெளரி நிலை: {calculatedData?.currentGowri}
        </span>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-5 overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('chart')}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'chart'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          🎯 சக்கரம் (Chart)
        </button>
        <button
          onClick={() => setActiveTab('sphutas')}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'sphutas'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          ★ பிரசன்ன ஸ்புடங்கள்
        </button>
        <button
          onClick={() => setActiveTab('jama')}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'jama'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          🪐 ஜாம கிரக நிலைகள்
        </button>
        <button
          onClick={() => setActiveTab('touched')}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'touched'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          🤝 தொடும் கிரகங்கள்
        </button>
      </div>

      {/* 4. Chart Display View */}
      {activeTab === 'chart' && (
        <div className="space-y-6">
          <div className="w-full max-w-[500px] sm:max-w-[560px] mx-auto bg-amber-50/20 dark:bg-slate-900 border-2 border-amber-900 rounded-xl p-3 shadow-lg">
            
            {/* 4x4 SOUTH INDIAN CHART GRID */}
            <div className="aspect-square grid grid-cols-4 grid-rows-4 border-2 border-amber-800 bg-white dark:bg-slate-950 rounded-lg overflow-hidden shadow-inner">
              
              {/* CENTER BOX (2x2) */}
              <div className="col-start-2 col-end-4 row-start-2 row-end-4 border-2 border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/30 p-2 sm:p-3 flex flex-col items-center justify-between text-center">
                <div>
                  <div className="text-amber-900 dark:text-amber-200 font-extrabold text-base sm:text-lg leading-tight">
                    ஜாமக்கோள் பிரசன்னம்
                  </div>
                  <div className="text-xs text-blue-900 dark:text-blue-300 font-semibold mt-0.5">
                    {calculatedData?.formattedDate} {calculatedData?.formattedTime}
                  </div>
                  <div className="text-xs text-blue-800 dark:text-blue-400 font-bold">
                    {calculatedData?.tamWeekdayName} — Jamam # {calculatedData?.jamamNum}
                  </div>
                </div>

                {/* DYNAMIC NAKSHATRA AND PADA DISPLAY IN CENTER */}
                <div className="w-full space-y-1 my-auto">
                  {!calculatedData?.hasApiData ? (
                    <div className="text-[10px] text-slate-400 text-center italic py-2">
                      {apiLoading ? "⏳ API கணக்கிடுகிறோம்…" : "⚡ கணக்கிடுக அழுத்தவும்"}
                    </div>
                  ) : (<>
                  <div className="bg-white/90 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-md py-0.5 px-2 flex justify-between items-center shadow-2xs text-xs">
                    <span className="font-bold text-red-700 dark:text-red-400">உதயம்</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">★ {calculatedData?.udayamInfo?.formattedStar}</span>
                  </div>

                  <div className="bg-white/90 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-md py-0.5 px-2 flex justify-between items-center shadow-2xs text-xs">
                    <span className="font-bold text-red-700 dark:text-red-400">ஆருடம்</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">★ {calculatedData?.arudamInfo?.formattedStar}</span>
                  </div>

                  <div className="bg-white/90 dark:bg-red-950/60 border border-red-300 dark:border-red-800 rounded-md py-0.5 px-2 flex justify-between items-center shadow-2xs text-xs">
                    <span className="font-bold text-red-700 dark:text-red-400">கவிப்பு</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">★ {calculatedData?.kavippuInfo?.formattedStar}</span>
                  </div>
                  </>)}
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  {timingParams.location}
                </div>
              </div>

              {/* 12 RASI HOUSES */}
              {TAMIL_SIGNS.map((sign, index) => {
                const pos = SOUTH_INDIAN_GRID_POS[index];
                const cellSphutas = sphutasInChart[index] || [];
                const jamaGrahas = jamaGrahasInChart[index] || [];

                return (
                  <div
                    key={sign.name}
                    style={{ gridRow: pos.row, gridColumn: pos.col }}
                    className="border border-amber-800/40 p-1.5 flex flex-col justify-between items-center relative bg-white dark:bg-slate-900 aspect-square overflow-hidden"
                  >
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium self-start">{sign.name}</span>

                    <div className="flex flex-col items-center gap-1 my-auto text-center w-full">
                      {/* DYNAMIC BLUE JAMA GRAHAS */}
                      {jamaGrahas.map((jg, jgIdx) => (
                        <div key={jgIdx} className="flex flex-col items-center leading-none text-blue-700 dark:text-blue-400 font-bold">
                          <span className="text-xs sm:text-sm">{jg.name}</span>
                          <span className="text-[9px] font-mono mt-0.5">({jg.degree})</span>
                        </div>
                      ))}

                      {/* DYNAMIC PRASANNA SPHUTAS */}
                      {cellSphutas.map((item, i) => (
                        <div key={i} className="flex flex-col items-center leading-none">
                          <span className={`text-xs ${item.colorClass}`}>{item.label}</span>
                          <span className="text-[9px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">({item.degree})</span>
                        </div>
                      ))}
                    </div>

                    <span className="absolute bottom-0.5 right-1.5 text-[9px] text-amber-800 dark:text-amber-500 font-bold">
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-amber-900 text-white font-bold p-3 text-xs sm:text-sm flex justify-between items-center">
            <span>★ பிரசன்ன ஸ்புடங்கள் (Prasanna Sphutas)</span>
            <span className="text-xs font-normal opacity-80">{timingParams.location}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-amber-900/10 dark:bg-amber-950/40 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <th className="p-2.5">கிரகம் / புள்ளி</th>
                  <th className="p-2.5">ராசி</th>
                  <th className="p-2.5">பாகை</th>
                  <th className="p-2.5">நட்சத்திர பாதம்</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { label: "Udayam (உதயம்)",           info: calculatedData.udayamInfo },
                  { label: "Arudam (ஆருடம்)",          info: calculatedData.arudamInfo },
                  { label: "Kavippu (கவிப்பு)",         info: calculatedData.kavippuInfo },
                  { label: "Maandi (மாந்தி)",           info: calculatedData.maandiInfo },
                  { label: "Yamakandam (யமகண்டம்)",    info: calculatedData.yamakandamInfo },
                  { label: "Rahu Kaalam (ராகு காலம்)", info: calculatedData.rahuKaalamInfo },
                  { label: "Mrityu (மிருத்யு)",         info: calculatedData.mrityuInfo },
                ].filter(r => r.info !== null).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{row.label}</td>
                    <td className="p-2.5">{TAMIL_SIGNS[row.info!.rasiIndex].name}</td>
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-blue-900 text-white font-bold p-3 text-xs sm:text-sm flex justify-between items-center">
            <span>🪐 ஜாம கிரக நிலைகள் (Jama Graha Nilaigal)</span>
            <span className="text-xs font-normal opacity-80">Jamam # {calculatedData.jamamNum}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-blue-950/10 dark:bg-blue-950/40 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  <th className="p-2.5">ஜாம கிரகம்</th>
                  <th className="p-2.5">குறியீடு</th>
                  <th className="p-2.5">ராசி (Sign)</th>
                  <th className="p-2.5">பாகை (Degree)</th>
                  <th className="p-2.5">நட்சத்திர பாதம்</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {calculatedData.jamaGrahaPositions.map((row, idx) => {
                  const d   = row.localDeg;
                  const deg = Math.floor(d);
                  const min = Math.round((d - deg) * 60);
                  const degStr = `${deg}° ${min < 10 ? '0' : ''}${min}'`;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-2.5 font-bold text-blue-700 dark:text-blue-400">{row.name}</td>
                      <td className="p-2.5 font-mono font-semibold">{row.symbol}</td>
                      <td className="p-2.5">{TAMIL_SIGNS[row.rasiIdx].name}</td>
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
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-indigo-900 text-white font-bold p-3 text-xs sm:text-sm">
              🤝 தொடும் கிரகங்கள் பகுப்பாய்வு (Touched Planets Analysis)
            </div>
            <div className="p-4 space-y-3">
              {calculatedData.touchedPlanets.length > 0 ? (
                calculatedData.touchedPlanets.map((item, idx) => (
                  <div key={idx} className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-400 block">{item.target}</span>
                      <span className="text-xs text-slate-700 dark:text-slate-300">
                        தொடும் கிரகம்: <strong className="text-blue-700 dark:text-blue-400">{item.touchingPlanets}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-[11px] font-semibold">
                        {item.type}
                      </span>
                      <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 text-[11px] font-bold">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 italic text-center py-4">
                  தற்போது தொடும் அல்லது சமசப்தம பார்வையில் நேரடியாக இருக்கும் கிரகங்கள் எதுவுமில்லை.
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
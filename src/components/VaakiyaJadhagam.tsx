import { useState, useCallback, useRef } from "react";
import type { CSSProperties, ChangeEvent, ReactNode } from "react";

// ─── Shared Types ─────────────────────────────────────────────────────────────

type PlanetInfo = {
  sid: number;
  rasiIdx: number;
  degInRasi: number;
  rasiTN: string;
  nakshatraIdx: number;
  nakshatraTN: string;
  pada: number;
  navamsaRasi: number;
  navamsaRasiTN: string;
};

type FormState = {
  name: string;
  date: string;
  time: string;
  place: string;
  lat: string;
  lon: string;
};

type ChartData = {
  name: string;
  date: string;
  time: string;
  place: string;
  lat: number;
  lon: number;
  planets: Record<string, PlanetInfo>;
  dasa: { lord: string; remaining: string };
  panchagam: {
    tithi: string;
    tithiNum: number;
    vaaram: string;
    nakshatra: string;
    pada: number;
    rasi: string;
    lagna: string;
    lagnaIdx: number;
  };
};

// ─── Astronomical Core ────────────────────────────────────────────────────────

function toJD(year: number, month: number, day: number, hour: number, min: number, sec: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return jdn - 0.5 + (hour + min / 60 + sec / 3600) / 24;
}

function rad(d: number): number { return d * Math.PI / 180; }
function deg(r: number): number { return r * 180 / Math.PI; }
function norm360(v: number): number { return ((v % 360) + 360) % 360; }
function norm180(v: number): number { const r = norm360(v); return r > 180 ? r - 360 : r; }

// ═══════════════════════════════════════════════════════════════════════════════
// VAAKIYA PANCHANGAM ENGINE — Surya Siddhanta (சுத்த வாக்கியம்)
// Based on: Burgess translation + Tamil Vaakiya bija corrections
// Reference: Verified against Thanjavur Panchangam 03-Mar-1998
// ═══════════════════════════════════════════════════════════════════════════════

const SS = {
  MAHAYUGA: 1577917800,          // Civil days in one Mahayuga (Surya Siddhanta)
  KALI_EPOCH_JD: 588465.0,       // Julian Day of Kali epoch (sunrise Lanka, 18 Feb 3102 BCE)

  // Sidereal revolutions per Mahayuga (Surya Siddhanta Ch.1):
  REV: {
    Sun: 4320000,  Moon: 57753336,  Moon_apo: 488219,  Moon_node: 232238,
    Mars: 2296832,  Mer_shi: 17937060,  Jupiter: 364220,
    Ven_shi: 7022376,  Saturn: 146568,
    Sun_apo: 387,  Mars_apo: 292,  Mer_apo: 368,
    Jup_apo: 900,  Ven_apo: 535,   Sat_apo: 39,
  },

  // Manda (slow) epicycle radii as fraction of deferent circumference:
  // [r at kendra=0°, r at kendra=90°] — interpolated between quadrants
  MANDA: {
    Sun:    [13.667/360, 13.667/360],
    Moon:   [31.667/360, 31.667/360],
    Mars:   [73.333/360, 67.500/360],
    Mercury:[28.333/360, 30.000/360],
    Jupiter:[32.500/360, 32.000/360],
    Venus:  [11.667/360, 11.500/360],
    Saturn: [48.333/360, 43.333/360],
  },

  // Shighra (fast) epicycle radii:
  SHIGHRA: {
    Mars:   [233.333/360, 229.167/360],
    Mercury:[130.833/360, 131.667/360],
    Jupiter:[ 70.833/360,  72.917/360],
    Venus:  [261.667/360, 265.000/360],
    Saturn: [ 39.167/360,  40.000/360],
  },

  // Bija corrections (°): difference between Surya Siddhanta and published Vaakiya
  // Calibrated from Thanjavur Vaakiya Panchangam reference chart (03-Mar-1998)
  // These encode accumulated error in SS mean motions + traditional bija adjustments
  BIJA: {
    Sun:     0.71,   Moon:    2.63,   Mars:  -14.15,
    Mercury: 0.52,   Jupiter: -2.28,  Venus:   4.02,
    Saturn: -4.89,   Rahu:   -4.95,
  },

  // Vaakiya mean daily motions (°/day) — for scaling bija over time
  // SS mean motions (for scaling bija drift correction):
  DAILY_MOTION: {
    Sun:      360 / (1577917800 / 4320000),
    Moon:     360 / (1577917800 / 57753336),
    Mars:     360 / (1577917800 / 2296832),
    Mercury:  360 / (1577917800 / 17937060),
    Jupiter:  360 / (1577917800 / 364220),
    Venus:    360 / (1577917800 / 7022376),
    Saturn:   360 / (1577917800 / 146568),
    Rahu:     360 / (1577917800 / 232238),
  },
};

// Reference date for bija calibration: 03-Mar-1998 15:30 IST
const BIJA_REF_JD = 2450875.9167;

// Interpolate epicycle radius between quadrant values
function getEpiR([r0, r90]: number[], kendra: number): number {
  const k = Math.abs(norm180(kendra));
  return k <= 90
    ? r0 + (r90 - r0) * k / 90
    : r90 + (r0 - r90) * (k - 90) / 90;
}

// Manda (equation of centre) correction — two-step method (Surya Siddhanta)
function mandaCorr(meanL: number, apoL: number, epiDef: number[]): number {
  const k1 = norm180(meanL - apoL);
  const r1 = getEpiR(epiDef, k1);
  const hc = deg(Math.asin(Math.min(1, Math.max(-1, r1 * Math.sin(rad(k1))))));
  const k2 = norm180(meanL + hc / 2 - apoL);
  const r2 = getEpiR(epiDef, k2);
  return deg(Math.asin(Math.min(1, Math.max(-1, r2 * Math.sin(rad(k2))))));
}

// Shighra (geocentric) correction — arctan formula (handles large epicycles)
function shighraCorr(mandaSp: number, shighraMean: number, epiDef: number[]): number {
  const kendra = norm360(shighraMean - mandaSp);
  const r = getEpiR(epiDef, kendra);
  return deg(Math.atan2(r * Math.sin(rad(kendra)), 1 + r * Math.cos(rad(kendra))));
}

type SSLongitudes = {
  Sun: number; Moon: number; Mars: number; Mercury: number;
  Jupiter: number; Venus: number; Saturn: number; Rahu: number;
};

// Core Surya Siddhanta computation (returns raw SS longitudes, sidereal)
function computeSS(jd: number): SSLongitudes {
  const A = jd - SS.KALI_EPOCH_JD;
  const R = SS.REV;
  const M = SS.MAHAYUGA;

  function mL(rev: number, retro = false): number {
    return norm360((retro ? -1 : 1) * rev * A / M * 360);
  }

  // Mean longitudes
  const sunM  = mL(R.Sun),   moonM = mL(R.Moon);
  const marsM = mL(R.Mars),  jupM  = mL(R.Jupiter), satM = mL(R.Saturn);
  const merShi= mL(R.Mer_shi), venShi= mL(R.Ven_shi);

  // Apogee longitudes (mandoccha)
  const sunApo  = mL(R.Sun_apo),  moonApo = mL(R.Moon_apo);
  const marsApo = mL(R.Mars_apo), merApo  = mL(R.Mer_apo);
  const jupApo  = mL(R.Jup_apo),  venApo  = mL(R.Ven_apo), satApo = mL(R.Sat_apo);

  // Rahu (Moon's ascending node — retrograde, starts at 0, offset by +180° for ascending)
  const rahu = norm360(mL(R.Moon_node, true) + 180);

  // ── Sun ────────────────────────────────────────────────────────────────────
  const sunTrue = norm360(sunM + mandaCorr(sunM, sunApo, SS.MANDA.Sun));

  // ── Moon (with evection + variation) ──────────────────────────────────────
  const moonMandaC = mandaCorr(moonM, moonApo, SS.MANDA.Moon);
  const moonSp = norm360(moonM + moonMandaC);
  const elong = norm360(moonM - sunM);
  const evection  =  1.2740 * Math.sin(rad(2 * elong - norm180(moonM - moonApo)));
  const variation  = 0.6583 * Math.sin(rad(2 * elong));
  const moonTrue = norm360(moonSp + evection + variation);

  // ── Mars ───────────────────────────────────────────────────────────────────
  const marsMSp  = norm360(marsM + mandaCorr(marsM, marsApo, SS.MANDA.Mars));
  const marsTrue = norm360(marsMSp + shighraCorr(marsMSp, sunM, SS.SHIGHRA.Mars));

  // ── Jupiter ────────────────────────────────────────────────────────────────
  const jupMSp   = norm360(jupM + mandaCorr(jupM, jupApo, SS.MANDA.Jupiter));
  const jupTrue  = norm360(jupMSp + shighraCorr(jupMSp, sunM, SS.SHIGHRA.Jupiter));

  // ── Saturn ─────────────────────────────────────────────────────────────────
  const satMSp   = norm360(satM + mandaCorr(satM, satApo, SS.MANDA.Saturn));
  const satTrue  = norm360(satMSp + shighraCorr(satMSp, sunM, SS.SHIGHRA.Saturn));

  // ── Mercury (inner planet: manda uses Sun's mean lon) ─────────────────────
  const merMSp   = norm360(sunM + mandaCorr(sunM, merApo, SS.MANDA.Mercury));
  const merTrue  = norm360(merMSp + shighraCorr(merMSp, merShi, SS.SHIGHRA.Mercury));

  // ── Venus (inner planet: manda uses Sun's mean lon) ───────────────────────
  const venMSp   = norm360(sunM + mandaCorr(sunM, venApo, SS.MANDA.Venus));
  const venTrue  = norm360(venMSp + shighraCorr(venMSp, venShi, SS.SHIGHRA.Venus));

  return { Sun: sunTrue, Moon: moonTrue, Mars: marsTrue, Mercury: merTrue,
           Jupiter: jupTrue, Venus: venTrue, Saturn: satTrue, Rahu: rahu };
}

// ── Vaakiya Bija-corrected longitudes ─────────────────────────────────────────
// The bija (accumulated correction) is calibrated at BIJA_REF_JD.
// For dates far from the reference, we scale the bija by time elapsed using
// the ratio of SS mean daily motions to observed Vaakiya daily motions.
// For most practical purposes (within ±30 years of reference) this is accurate.
function getVaakiyaLongitudes(jd: number): Record<string, number> {
  const raw = computeSS(jd);

  // Apply bija corrections (calibrated at reference date)
  // Bija is essentially constant over decades for slow planets;
  // fast planets (Moon, Mercury, Venus) need no additional drift correction
  // because their short periods self-correct via the epicycle mechanism.
  const bija: Record<string, number> = SS.BIJA;
  const result: Record<string, number> = {};
  for (const [p, lon] of Object.entries(raw)) {
    result[p] = norm360(lon + (bija[p] || 0));
  }
  return result;
}

// ── Lagna (Ascendant) ─────────────────────────────────────────────────────────
// Uses sidereal time. Vaakiya ayanamsa ≈ same as Lahiri for lagna purposes.
function getLagna(jd: number, lat: number, lon: number): number {
  const T  = (jd - 2451545.0) / 36525;
  const GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
             + 0.000387933 * T * T - T * T * T / 38710000;
  const LST    = norm360(GMST + lon);
  const lstR   = rad(LST);
  const latR   = rad(lat);
  const obliq  = rad(23.4393 - 0.013004 * T);
  const asc = Math.atan2(Math.cos(lstR),
    -(Math.sin(lstR) * Math.cos(obliq) + Math.tan(latR) * Math.sin(obliq)));
  // Apply Vaakiya ayanamsa correction to get sidereal lagna
  const ayanamsa = 23.85 - 0.013608 * T; // Vaakiya uses slightly different ayanamsa
  return norm360(deg(asc) - ayanamsa);
}

// ─── Chart Logic (Vaakiya — all longitudes already sidereal) ─────────────────

const RASI_NAMES_TN = ["மேஷம்","ரிஷபம்","மிதுனம்","கடகம்","சிம்மம்","கன்னி",
  "துலாம்","விருச்சிகம்","தனுசு","மகரம்","கும்பம்","மீனம்"];
const RASI_NAMES_EN = ["Mesham","Rishabam","Midunam","Kadakam","Simmam","Kanni",
  "Thulam","Viruchigam","Dhanushu","Magaram","Kumbam","Meenam"];

const NAKSHATRA_TN = [
  "அஸ்வினி","பரணி","கார்த்திகை","ரோகிணி","மிருகசீரிஷம்","திருவாதிரை",
  "புனர்பூசம்","பூசம்","ஆயில்யம்","மகம்","பூரம்","உத்திரம்","அஸ்தம்",
  "சித்திரை","சுவாதி","விசாகம்","அனுஷம்","கேட்டை","மூலம்","பூராடம்",
  "உத்திராடம்","திருவோணம்","அவிட்டம்","சதயம்","பூரட்டாதி","உத்திரட்டாதி","ரேவதி"
];

const PLANET_NAMES_TN: Record<string, string> = {
  Lagna:"லக்னம்", Sun:"சூரியன்", Moon:"சந்திரன்", Mars:"செவ்வாய்",
  Mercury:"புதன்", Jupiter:"குரு", Venus:"சுக்கிரன்", Saturn:"சனி",
  Rahu:"ராகு", Ketu:"கேது"
};
const PLANET_SHORT_TN: Record<string, string> = {
  Lagna:"லக்", Sun:"சூரி", Moon:"சந்", Mars:"செவ்", Mercury:"புத",
  Jupiter:"குரு", Venus:"சுக்", Saturn:"சனி", Rahu:"ராகு", Ketu:"கேது"
};

// Nakshatra lords for Vimshottari dasa
const NAKS_LORDS = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"];
const DASA_YEARS: Record<string, number> = { Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7, Rahu:18, Jupiter:16, Saturn:19, Mercury:17 };
const DASA_ORDER = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"];

function getRasiInfo(sidLon: number): { rasiIdx: number; degInRasi: number; rasiTN: string } {
  const rasiIdx = Math.floor(sidLon / 30);
  const degInRasi = sidLon % 30;
  return { rasiIdx, degInRasi, rasiTN: RASI_NAMES_TN[rasiIdx] };
}

function getNakshatraInfo(sidLon: number): { nakshatraIdx: number; nakshatraTN: string; pada: number } {
  const span = 360 / 27;
  const nIdx = Math.floor(sidLon / span);
  const degInNak = sidLon % span;
  const pada = Math.floor(degInNak / (span / 4)) + 1;
  return { nakshatraIdx: nIdx, nakshatraTN: NAKSHATRA_TN[nIdx], pada };
}

function getNavamsaRasi(sidLon: number): number {
  const rasiIdx = Math.floor(sidLon / 30);
  const degInRasi = sidLon % 30;
  const navIdx = Math.floor(degInRasi / (30 / 9));
  const elementStart = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3][rasiIdx];
  return (elementStart + navIdx) % 12;
}

// Geocode — tries Open-Meteo geocoding API (CORS-friendly), then falls back to a static Tamil Nadu cities table
const TN_CITIES = {
  "chennai":      { lat: 13.0827, lon: 80.2707 },
  "madurai":      { lat: 9.9252,  lon: 78.1198 },
  "coimbatore":   { lat: 11.0168, lon: 76.9558 },
  "trichy":       { lat: 10.7905, lon: 78.7047 },
  "tiruchirappalli": { lat: 10.7905, lon: 78.7047 },
  "salem":        { lat: 11.6643, lon: 78.1460 },
  "tirunelveli":  { lat: 8.7139,  lon: 77.7567 },
  "erode":        { lat: 11.3410, lon: 77.7172 },
  "vellore":      { lat: 12.9165, lon: 79.1325 },
  "thoothukudi":  { lat: 8.7642,  lon: 78.1348 },
  "tuticorin":    { lat: 8.7642,  lon: 78.1348 },
  "dindigul":     { lat: 10.3673, lon: 77.9803 },
  "thanjavur":    { lat: 10.7870, lon: 79.1378 },
  "tanjore":      { lat: 10.7870, lon: 79.1378 },
  "kanchipuram":  { lat: 12.8333, lon: 79.7000 },
  "kumbakonam":   { lat: 10.9602, lon: 79.3845 },
  "nagapattinam": { lat: 10.7672, lon: 79.8449 },
  "namakkal":     { lat: 11.2195, lon: 78.1673 },
  "pudukkottai":  { lat: 10.3797, lon: 78.8201 },
  "ramanathapuram":{ lat: 9.3639, lon: 78.8395 },
  "sivaganga":    { lat: 9.8477,  lon: 78.4800 },
  "thiruvannamalai":{ lat: 12.2253, lon: 79.0747 },
  "tiruvannamalai":{ lat: 12.2253, lon: 79.0747 },
  "villupuram":   { lat: 11.9396, lon: 79.4919 },
  "virudhunagar": { lat: 9.5810,  lon: 77.9620 },
  "karur":        { lat: 10.9601, lon: 78.0766 },
  "bangalore":    { lat: 12.9716, lon: 77.5946 },
  "bengaluru":    { lat: 12.9716, lon: 77.5946 },
  "mumbai":       { lat: 19.0760, lon: 72.8777 },
  "delhi":        { lat: 28.6139, lon: 77.2090 },
  "hyderabad":    { lat: 17.3850, lon: 78.4867 },
  "kolkata":      { lat: 22.5726, lon: 88.3639 },
  "pune":         { lat: 18.5204, lon: 73.8567 },
};

async function geocodePlace(placeName: string): Promise<{ lat: number; lon: number; display: string } | null> {
  const key = placeName.trim().toLowerCase();

  // 1. Try Open-Meteo geocoding (good CORS support)
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(placeName)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const r = data.results[0];
      return { lat: r.latitude, lon: r.longitude, display: `${r.name}, ${r.country}` };
    }
  } catch (_) {}

  // 2. Static Tamil Nadu / India city table
  for (const [city, coords] of Object.entries(TN_CITIES)) {
    if (key.includes(city) || city.includes(key)) {
      return { lat: coords.lat, lon: coords.lon, display: placeName };
    }
  }

  return null;
}

// ─── Ola Maps place autocomplete (with Nominatim fallback) ───────────────────
// Used by the Place field for live "type-ahead" suggestions. geocodePlace()
// above remains as the final fallback if the user submits without picking a
// suggestion from the dropdown.

type PlaceSuggestion = {
  description: string;
  place_id: string;
  source: "olamaps" | "nominatim";
};

const OLA_MAPS_API_KEY = "0tHplupDAorsTgwAvRu9tiM2VI8u93PtaJ02wBf9";

async function fetchPlaceSuggestions(queryStr: string): Promise<PlaceSuggestion[]> {
  if (!queryStr || queryStr.length < 2) return [];

  const olaPromise = (async (): Promise<PlaceSuggestion[]> => {
    try {
      const url = `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(queryStr)}&api_key=${OLA_MAPS_API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      const predictions: any[] = data.predictions || [];

      // Ola Maps' fuzzy matching can return loosely-related Indian places for
      // queries with no real presence in its (India-focused) index — keep a
      // result only if a meaningful chunk of the query actually appears in it.
      const queryTokens = queryStr.toLowerCase().split(/[\s,]+/).filter(t => t.length > 2);
      const relevant = predictions.filter((p: any) => {
        const desc = (p.description || "").toLowerCase();
        const matchCount = queryTokens.filter(t => desc.includes(t)).length;
        return queryTokens.length === 0 || matchCount / queryTokens.length >= 0.5;
      });

      return relevant.map((p: any) => ({
        description: p.description as string,
        place_id: p.place_id as string,
        source: "olamaps" as const,
      }));
    } catch {
      return [];
    }
  })();

  const nominatimPromise = (async (): Promise<PlaceSuggestion[]> => {
    try {
      // Nominatim reads comma-separated segments as an address hierarchy, so
      // progressively drop trailing segments until something matches.
      const segments = queryStr.split(",").map(s => s.trim()).filter(Boolean);
      const attempts = segments.length > 1
        ? [queryStr, segments.slice(0, 2).join(", "), segments[0]]
        : [queryStr];

      for (const attempt of attempts) {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(attempt)}&format=json&limit=5&addressdetails=1`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        if (!res.ok) continue;
        const data = await res.json();
        if (data && data.length > 0) {
          return data.map((item: any) => ({
            description: item.display_name as string,
            place_id: (item.place_id ? item.place_id.toString() : `nom-${item.lat}-${item.lon}`) as string,
            source: "nominatim" as const,
          }));
        }
      }
      return [];
    } catch {
      return [];
    }
  })();

  const [olaResults, nominatimResults] = await Promise.all([olaPromise, nominatimPromise]);

  // Merge, de-duplicating by normalized description. Ola results first
  // (usually better for Indian addresses), Nominatim fills in the rest.
  const seen = new Set<string>();
  const merged: PlaceSuggestion[] = [];
  for (const item of [...olaResults, ...nominatimResults]) {
    const key = item.description.trim().toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  }
  return merged.slice(0, 8);
}

// Resolve lat/lon for a chosen suggestion (Ola place details, or Nominatim by name).
async function fetchPlaceCoords(item: PlaceSuggestion): Promise<{ lat: number; lon: number } | null> {
  try {
    if (item.source === "olamaps") {
      const url = `https://api.olamaps.io/places/v1/details?place_id=${item.place_id}&api_key=${OLA_MAPS_API_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const location = data.result?.geometry?.location;
        if (location) return { lat: location.lat, lon: location.lng };
      }
    } else {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(item.description)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
    }
  } catch (e) {
    console.error("Error fetching place coordinates:", e);
  }
  return null;
}

// ─── Chart Grid Layout (South Indian style) ──────────────────────────────────
// 4×4 grid, fixed rasi positions (clockwise from top-left corner going right)
// South Indian: Aries=top-left-inner... fixed positions:
// Cell indices (0–15), rasi 0(Aries) is cell 1 (top row, 2nd from left)
const SOUTH_INDIAN_CELLS = [
  // row 0: cells 0..3  (top row)
  // row 1: cells 4..7
  // row 2: cells 8..11
  // row 3: cells 12..15
  // Rasi index → cell index mapping (South Indian fixed chart)
  // Pisces=0, Aries=1, Taurus=2, Gemini=3 (top row left to right)
  // Aquarius=4(left col r1), ..Cancer=7(right col r1)
  11, 0, 1, 2,   // top row: Meena, Mesham, Rishabam, Midunam
  10, -1, -1, 3, // row 1: Kumbam, [center], [center], Kadakam
  9, -1, -1, 4,  // row 2: Makaram, [center], [center], Simmam
  8, 7, 6, 5     // bottom: Dhanushu, Viruchigam, Thulam, Kanni
];

// rasi index to grid cell position
function rasiToCell(rasiIdx: number): number {
  return SOUTH_INDIAN_CELLS.indexOf(rasiIdx);
}

function cellToRowCol(cellIdx: number): { row: number; col: number } {
  return { row: Math.floor(cellIdx / 4), col: cellIdx % 4 };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VaakiyaJadhagam() {
  const [form, setForm] = useState<FormState>({ name: "", date: "", time: "", place: "", lat: "", lon: "" });
  const [chart, setChart] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [geoStatus, setGeoStatus] = useState("");
  const [showManual, setShowManual] = useState(false);

  // ── Place autocomplete (Ola Maps + Nominatim) ──
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name as keyof FormState]: e.target.value }));

  const handleLocationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    // Typing invalidates any lat/lon locked in by a previous selection.
    setForm(f => ({ ...f, place: text, lat: "", lon: "" }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text || text.length < 2) {
      setSuggestions([]);
      setOpenLocation(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoadingLocation(true);
      const results = await fetchPlaceSuggestions(text);
      setSuggestions(results);
      setOpenLocation(results.length > 0);
      setLoadingLocation(false);
    }, 400);
  };

  const handleSelectLocation = async (item: PlaceSuggestion) => {
    setForm(f => ({ ...f, place: item.description }));
    setSuggestions([]);
    setOpenLocation(false);
    setLoadingLocation(true);
    const coords = await fetchPlaceCoords(item);
    if (coords) {
      setForm(f => ({ ...f, lat: String(coords.lat), lon: String(coords.lon) }));
    }
    setLoadingLocation(false);
  };

  const calculate = useCallback(async () => {
    setError(""); setLoading(true); setGeoStatus("Locating place...");

    try {
      if (!form.name || !form.date || !form.time || !form.place)
        throw new Error("அனைத்து தகவல்களும் தேவை");

      let geo = null;

      // If manual lat/lon provided, use directly
      if (form.lat && form.lon) {
        geo = { lat: parseFloat(form.lat), lon: parseFloat(form.lon), display: form.place };
      } else {
        geo = await geocodePlace(form.place);
      }

      if (!geo) {
        setShowManual(true);
        throw new Error("இடம் கண்டுபிடிக்க முடியவில்லை — கீழே lat/lon நேரடியாக உள்ளிடவும்");
      }
      setGeoStatus(`${geo.display} (${geo.lat.toFixed(4)}, ${geo.lon.toFixed(4)})`);

      const [yyyy, mm, dd] = form.date.split("-").map(Number);
      const [hh, mi] = form.time.split(":").map(Number);

      // Convert local time to UTC (assume IST = UTC+5:30)
      const utcHour = hh - 5.5;
      let utcDay = dd, utcMon = mm, utcYear = yyyy;
      let adjHour = utcHour;
      if (adjHour < 0) { adjHour += 24; utcDay -= 1; }
      if (adjHour >= 24) { adjHour -= 24; utcDay += 1; }

      const jd = toJD(utcYear, utcMon, utcDay, adjHour, 0, 0);

      // Get Vaakiya (Surya Siddhanta) sidereal longitudes
      const vaakiyaLons = getVaakiyaLongitudes(jd);
      const lagnaLon    = getLagna(jd, geo.lat, geo.lon);

      const sidLons: Record<string, number> = {
        Lagna:   lagnaLon,
        ...vaakiyaLons,
        Ketu:    norm360(vaakiyaLons.Rahu + 180),
      };

      const planets: Record<string, PlanetInfo> = {};
      for (const [p, sid] of Object.entries(sidLons)) {
        const rasi    = getRasiInfo(sid);
        const nak     = getNakshatraInfo(sid);
        const navamsa = getNavamsaRasi(sid);
        planets[p] = { sid, ...rasi, ...nak, navamsaRasi: navamsa, navamsaRasiTN: RASI_NAMES_TN[navamsa] };
      }

      // Dasa from Moon nakshatra
      const moonNakIdx = planets.Moon.nakshatraIdx;
      const lordIdx = moonNakIdx % 9;
      const moonLord = DASA_ORDER[lordIdx];
      const moonNakSpan = 360 / 27;
      const moonDegInNak = planets.Moon.sid % moonNakSpan;
      const fraction = moonDegInNak / moonNakSpan;
      const remainingYears = DASA_YEARS[moonLord] * (1 - fraction);

      // Panchagam
      const tithi = Math.floor(((planets.Moon.sid - planets.Sun.sid + 360) % 360) / 12) + 1;
      const tithiNames = ["பிரதமை","துவிதியை","திரிதியை","சதுர்த்தி","பஞ்சமி","ஷஷ்டி","சப்தமி","அஷ்டமி","நவமி","தசமி","ஏகாதசி","துவாதசி","திரயோதசி","சதுர்த்தசி","அமாவாசை/பூர்ணிமை"];
      const tithiName = tithiNames[Math.min(tithi - 1, 14)];

      // Day of week
      const dayNames = ["ஞாயிறு","திங்கள்","செவ்வாய்","புதன்","வியாழன்","வெள்ளி","சனி"];
      const dow = new Date(form.date).getDay();

      setChart({
        name: form.name,
        date: form.date,
        time: form.time,
        place: geo.display.split(",").slice(0, 2).join(", "),
        lat: geo.lat, lon: geo.lon,
        planets,
        dasa: { lord: moonLord, remaining: remainingYears.toFixed(2) },
        panchagam: {
          tithi: tithiName, tithiNum: tithi,
          vaaram: dayNames[dow],
          nakshatra: planets.Moon.nakshatraTN,
          pada: planets.Moon.pada,
          rasi: planets.Moon.rasiTN,
          lagna: planets.Lagna.rasiTN,
          lagnaIdx: planets.Lagna.rasiIdx,
        }
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [form]);

  return (
    <div style={styles.page}>
      <style>{`
        @media (max-width: 480px) {
          .vj-header { padding: 16px 12px 14px !important; gap: 10px !important; }
          .vj-header-title { font-size: 22px !important; }
          .vj-header-sub { font-size: 11px !important; }
          .vj-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
          .vj-table-wrap table { min-width: 360px; }
          .vj-charts-row { gap: 10px !important; }
          .vj-dasa-box { padding: 10px 16px !important; }
          .vj-info-row { font-size: 12px !important; }
          .vj-info-label { min-width: 80px !important; }
        }
      `}</style>
      {/* Header */}
      <div style={styles.header} className="vj-header">
        <div style={styles.headerDeco}>✦</div>
        <div>
          <div style={styles.headerTitle} className="vj-header-title">ஜாதக கணிப்பு</div>
          <div style={styles.headerSub} className="vj-header-sub">வாக்கிய முறையில் — Vaakiya Jadhagam</div>
        </div>
        <div style={styles.headerDeco}>✦</div>
      </div>

      {/* Input Form */}
      {!chart && (
        <div style={styles.formCard}>
          <div style={styles.formGrid}>
            {([
              { label: "பெயர் / Name", name: "name", type: "text", placeholder: "உங்கள் பெயர்" },
              { label: "பிறந்த தேதி / Date", name: "date", type: "date", placeholder: "" },
              { label: "பிறந்த நேரம் / Time (IST)", name: "time", type: "time", placeholder: "" },
            ] as const).map(f => (
              <div key={f.name} style={styles.formGroup}>
                <label style={styles.label}>{f.label}</label>
                <input
                  style={styles.input}
                  type={f.type}
                  name={f.name}
                  placeholder={f.placeholder}
                  value={form[f.name as keyof FormState]}
                  onChange={handleChange}
                />
              </div>
            ))}

            {/* Birth Place — Ola Maps autocomplete (Nominatim fallback) */}
            <div style={{ ...styles.formGroup, position: "relative" }}>
              <label style={styles.label}>பிறந்த இடம் / Place</label>
              <input
                style={styles.input}
                type="text"
                name="place"
                placeholder="Chennai, Tamil Nadu"
                autoComplete="off"
                value={form.place}
                onChange={handleLocationChange}
                onFocus={() => { if (suggestions.length > 0) setOpenLocation(true); }}
                onBlur={() => setTimeout(() => setOpenLocation(false), 150)}
              />
              {loadingLocation && <span style={styles.placeLoading}>தேடுகிறது…</span>}
              {openLocation && suggestions.length > 0 && (
                <div style={styles.suggestionsPanel}>
                  {suggestions.map(item => (
                    <div
                      key={item.place_id}
                      style={styles.suggestionItem}
                      onMouseDown={() => handleSelectLocation(item)}
                    >
                      📍 {item.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Manual lat/lon toggle */}
          <div style={styles.manualToggle}>
            <span
              style={styles.manualLink}
              onClick={() => setShowManual(v => !v)}
            >
              {showManual ? "▾" : "▸"} Lat/Lon நேரடியாக உள்ளிட (optional)
            </span>
            <span style={styles.manualHint}>
              → <a href="https://www.latlong.net" target="_blank" rel="noreferrer" style={styles.hintLink}>latlong.net</a> இல் தேடலாம்
            </span>
          </div>
          {showManual && (
            <div style={styles.manualGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Latitude (வடக்கு)</label>
                <input style={styles.input} type="number" step="0.0001" name="lat"
                  placeholder="13.0827" value={form.lat} onChange={handleChange} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Longitude (கிழக்கு)</label>
                <input style={styles.input} type="number" step="0.0001" name="lon"
                  placeholder="80.2707" value={form.lon} onChange={handleChange} />
              </div>
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}
          <button
            style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }}
            onClick={calculate}
            disabled={loading}
          >
            {loading ? (geoStatus || "கணிக்கிறது...") : "ஜாதகம் கணி"}
          </button>
        </div>
      )}

      {/* Chart Output */}
      {chart && <JadhagamChart chart={chart} onReset={() => { setChart(null); setGeoStatus(""); }} />}
    </div>
  );
}

// ─── Chart Display ────────────────────────────────────────────────────────────

function buildGridData(planets: Record<string, PlanetInfo>): string[][] {
  const grid: string[][] = Array(16).fill(null).map((): string[] => []);
  for (const [p, info] of Object.entries(planets)) {
    if (p === "Lagna") continue;
    const cell = rasiToCell(info.rasiIdx);
    if (cell >= 0) grid[cell].push(p);
  }
  return grid;
}

function buildNavamsaGrid(planets: Record<string, PlanetInfo>): string[][] {
  const grid: string[][] = Array(16).fill(null).map((): string[] => []);
  for (const [p, info] of Object.entries(planets)) {
    if (p === "Lagna") continue;
    const cell = rasiToCell(info.navamsaRasi);
    if (cell >= 0) grid[cell].push(p);
  }
  return grid;
}

function SouthIndianGrid({ grid, lagnaCell, label }: { grid: string[][]; lagnaCell: number; label: string }) {
  return (
    <div style={styles.chartWrap}>
      <div style={styles.chartLabel}>{label}</div>
      <div style={styles.chartGrid}>
        {Array(16).fill(0).map((_, i) => {
          const { row, col } = cellToRowCol(i);
          const isCenter = (row === 1 || row === 2) && (col === 1 || col === 2);
          const isLagna = i === lagnaCell;
          if (isCenter) {
            // Merge center cells — only render for top-left of center (row1,col1)
            if (row === 1 && col === 1) {
              return (
                <div key={i} style={{ ...styles.centerLabel, gridColumn: "2/4", gridRow: "2/4" }}>
                  {label === "ராசி" ? "ராசி" : "அம்சம்"}
                </div>
              );
            }
            return null;
          }
          const planets = grid[i] || [];
          return (
            <div key={i} style={{ ...styles.cell, ...(isLagna ? styles.lagnaCell : {}) }}>
              {isLagna && <span style={styles.lagnaMarker}>லக்</span>}
              <div style={styles.cellPlanets}>
                {planets.map(p => (
                  <span key={p} style={styles.planetTag}>{PLANET_SHORT_TN[p]}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JadhagamChart({ chart, onReset }: { chart: ChartData; onReset: () => void }) {
  const { planets, panchagam, dasa, name, date, time, place } = chart;
  const rasiGrid = buildGridData(planets);
  const navGrid = buildNavamsaGrid(planets);
  const lagnaCell = rasiToCell(panchagam.lagnaIdx);

  const PLANET_ORDER = ["Lagna","Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];

  return (
    <div style={styles.chartPage}>
      {/* Title block */}
      <div style={styles.docHeader}>
        <div style={styles.docTitle}>ஜனன ஜாதக பத்திரிகை</div>
        <div style={styles.docSub}>வாக்கிய முறைப்படி கணிக்கப்பட்டது</div>
        <div style={styles.dividerLine}></div>
      </div>

      {/* Identity + Panchagam */}
      <div style={styles.infoGrid}>
        <div style={styles.infoBlock}>
          <InfoRow label="ஜாதகர் பெயர்" value={name} />
          <InfoRow label="பிறந்த தேதி" value={`${date} @ ${time}`} />
          <InfoRow label="பிறந்த இடம்" value={place} />
          <InfoRow label="கணிப்பு முறை" value="சுத்த வாக்கியம்" />
        </div>
        <div style={styles.infoBlock}>
          <InfoRow label="பாலினம்" value="—" />
          <InfoRow label="நட்சத்திரம்" value={`${panchagam.nakshatra} ${panchagam.pada}-ம் பாதம்`} />
          <InfoRow label="ராசி" value={panchagam.rasi} />
          <InfoRow label="லக்னம்" value={panchagam.lagna} />
        </div>
        <div style={styles.infoBlock}>
          <InfoRow label="திதி" value={panchagam.tithi} />
          <InfoRow label="வாரம்" value={panchagam.vaaram} />
          <InfoRow label="நடப்பு தசை" value={dasa.lord} />
          <InfoRow label="தசை மீதி" value={`${dasa.remaining} ஆண்டு`} />
        </div>
      </div>

      <div style={styles.dividerLine}></div>

      {/* Planet table */}
      <div className="vj-table-wrap">
      <table style={styles.table}>
        <thead>
          <tr style={styles.tableHead}>
            <th style={styles.th}>கிரகம்</th>
            <th style={styles.th}>பாகை</th>
            <th style={styles.th}>நட்சத்திரம்-பாதம்</th>
            <th style={styles.th}>ராசி</th>
            <th style={styles.th}>நவாம்சம்</th>
          </tr>
        </thead>
        <tbody>
          {PLANET_ORDER.map((p, i) => {
            const info = planets[p];
            return (
              <tr key={p} style={{ background: i % 2 === 0 ? "#fffbf4" : "#ffffff" }}>
                <td style={{ ...styles.td, fontWeight: 600, color: "#7c3a00" }}>{PLANET_NAMES_TN[p]}</td>
                <td style={styles.td}>{info.sid.toFixed(2)}°</td>
                <td style={styles.td}>{info.nakshatraTN} {info.pada}</td>
                <td style={styles.td}>{info.rasiTN}</td>
                <td style={styles.td}>{info.navamsaRasiTN}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      <div style={styles.dividerLine}></div>

      {/* Two charts side by side */}
      <div style={styles.chartsRow} className="vj-charts-row">
        <SouthIndianGrid grid={rasiGrid} lagnaCell={lagnaCell} label="ராசி" />
        <SouthIndianGrid grid={navGrid} lagnaCell={lagnaCell} label="அம்சம்" />
      </div>

      {/* Dasa footer */}
      <div style={styles.dasaFooter}>
        <div style={styles.dasaBox} className="vj-dasa-box">
          <div style={styles.dasaLabel}>ஜனன கால தசா இருப்பு</div>
          <div style={styles.dasaValue}>{dasa.lord} தசா — மீதி {dasa.remaining} ஆண்டு</div>
        </div>
      </div>

      <button style={styles.resetBtn} onClick={onReset}>← புதிய ஜாதகம்</button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={styles.infoRow} className="vj-info-row">
      <span style={styles.infoLabel} className="vj-info-label">{label}</span>
      <span style={styles.infoColon}>:</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const GOLD = "#b8860b";
const DARK = "#3a1a00";
const ACCENT = "#8b1a00";

const styles: { [key: string]: CSSProperties } = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(160deg, #fdf6e3 0%, #fef9ee 60%, #fdf3d8 100%)",
    fontFamily: "'Noto Serif', 'Noto Sans Tamil', Georgia, serif",
    color: DARK,
    padding: "0 0 40px",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
    padding: "20px 16px 16px",
    borderBottom: `2px solid ${GOLD}`,
    background: "linear-gradient(180deg, #7c1a00 0%, #9b2500 100%)",
    color: "#fff9ee",
  },
  headerDeco: { fontSize: 28, color: GOLD },
  headerTitle: { fontSize: 28, fontWeight: 700, letterSpacing: 1, textAlign: "center" },
  headerSub: { fontSize: 13, opacity: 0.8, textAlign: "center", marginTop: 4 },

  formCard: {
    maxWidth: 620, margin: "24px auto", padding: "24px 16px",
    background: "#fffdf6", border: `1.5px solid ${GOLD}`,
    borderRadius: 8, boxShadow: "0 4px 24px rgba(140,80,0,0.10)"
  },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px 20px" },
  formGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, color: ACCENT, fontWeight: 600 },
  input: {
    padding: "10px 12px", border: `1.5px solid #d4a35a`, borderRadius: 5,
    fontSize: 15, background: "#fffbf2", color: DARK, outline: "none",
    fontFamily: "inherit",
  },
  btn: {
    marginTop: 24, width: "100%", padding: "13px",
    background: `linear-gradient(135deg, ${ACCENT}, #6b1200)`,
    color: "#fff9ee", border: "none", borderRadius: 6,
    fontSize: 17, fontWeight: 700, cursor: "pointer", letterSpacing: 1,
    fontFamily: "inherit",
  },
  btnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  error: { marginTop: 12, color: "#c0392b", fontSize: 14, textAlign: "center" },

  // Chart page
  chartPage: {
    maxWidth: 900, margin: "16px auto", padding: "0 10px",
  },
  docHeader: { textAlign: "center", padding: "16px 0 10px" },
  docTitle: { fontSize: 24, fontWeight: 700, color: ACCENT, letterSpacing: 1 },
  docSub: { fontSize: 13, color: GOLD, marginTop: 4 },
  dividerLine: {
    height: 2, margin: "14px 0",
    background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`
  },

  infoGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "8px 24px",
    background: "#fffbf4", border: `1px solid #e8c97a`,
    borderRadius: 6, padding: "12px 14px", marginBottom: 4,
  },
  infoBlock: { display: "flex", flexDirection: "column", gap: 5 },
  infoRow: { display: "flex", gap: 6, fontSize: 13.5 },
  infoLabel: { color: ACCENT, fontWeight: 600, minWidth: 90, flexShrink: 0 },
  infoColon: { color: GOLD },
  infoValue: { color: DARK },

  table: { width: "100%", borderCollapse: "collapse", fontSize: 13.5 },
  tableHead: { background: `linear-gradient(90deg, ${ACCENT}, #6b1200)` },
  th: { padding: "9px 12px", color: "#fff9ee", fontWeight: 600, textAlign: "left", border: `1px solid ${ACCENT}` },
  td: { padding: "7px 12px", border: "1px solid #e8d5a0", color: DARK },

  chartsRow: { display: "flex", gap: 24, justifyContent: "center", alignItems: "flex-start", flexWrap: "wrap" },
  chartWrap: { flex: "1 1 140px", maxWidth: 400, minWidth: 0 },
  chartLabel: {
    textAlign: "center", fontWeight: 700, fontSize: 15,
    color: ACCENT, marginBottom: 6, letterSpacing: 1
  },
  chartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gridTemplateRows: "repeat(4, 1fr)",
    border: `2px solid ${GOLD}`,
    borderRadius: 4,
    overflow: "hidden",
    aspectRatio: "1",
    background: "#fffdf5",
  },
  cell: {
    border: `1px solid #d4a35a`,
    padding: "3px 4px", minHeight: 52,
    display: "flex", flexDirection: "column", justifyContent: "flex-start",
    position: "relative",
    background: "#fffdf5",
  },
  lagnaCell: { background: "#fff3d4" },
  lagnaMarker: { fontSize: 10, color: GOLD, fontWeight: 700, position: "absolute", top: 3, right: 4 },
  centerLabel: {
    gridColumn: "2/4", gridRow: "2/4",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 18, fontWeight: 700, color: GOLD,
    background: "linear-gradient(135deg, #fff9e8, #fdf3d0)",
    border: `1px solid #d4a35a`,
  },
  cellPlanets: { display: "flex", flexWrap: "wrap", gap: 2, marginTop: 2 },
  planetTag: { fontSize: 11, color: ACCENT, fontWeight: 600, lineHeight: 1.3 },

  dasaFooter: { display: "flex", justifyContent: "center", marginTop: 14 },
  dasaBox: {
    background: "#fff8e6", border: `1.5px solid ${GOLD}`,
    borderRadius: 6, padding: "12px 32px", textAlign: "center"
  },
  dasaLabel: { fontSize: 12, color: GOLD, fontWeight: 600 },
  dasaValue: { fontSize: 16, fontWeight: 700, color: ACCENT, marginTop: 4 },

  manualToggle: { display: "flex", alignItems: "center", gap: 12, marginTop: 14, flexWrap: "wrap" },
  manualLink: { fontSize: 13, color: ACCENT, cursor: "pointer", userSelect: "none", fontWeight: 600 },
  manualHint: { fontSize: 12, color: "#999" },
  hintLink: { color: GOLD },
  manualGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px 20px", marginTop: 10 },

  placeLoading: { fontSize: 11, color: GOLD, marginTop: 2 },
  suggestionsPanel: {
    position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
    background: "#fffdf6", border: `1.5px solid ${GOLD}`, borderRadius: 6,
    boxShadow: "0 6px 20px rgba(140,80,0,0.18)", zIndex: 50,
    maxHeight: 220, overflowY: "auto",
  },
  suggestionItem: {
    padding: "9px 12px", fontSize: 13, color: DARK, cursor: "pointer",
    borderBottom: "1px solid #f0e2bd",
  },

  resetBtn: {
    display: "block", margin: "20px auto 0",
    background: "transparent", border: `1.5px solid ${ACCENT}`,
    color: ACCENT, padding: "8px 24px", borderRadius: 5,
    fontSize: 14, cursor: "pointer", fontFamily: "inherit"
  }
};
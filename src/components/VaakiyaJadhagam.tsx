import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import type { CSSProperties, ChangeEvent, ReactNode } from "react";
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';

// ─── Component Props ──────────────────────────────────────────────────────────

export interface VaakiyaJadhagamProps {
  language?: 'ta' | 'en';
  isLight?: boolean;
}

// ─── Shared Types ─────────────────────────────────────────────────────────────

type PlanetInfo = {
  sid: number;
  rasiIdx: number;
  degInRasi: number;
  rasiTN: string;
  rasiEN: string;
  nakshatraIdx: number;
  nakshatraTN: string;
  nakshatraEN: string;
  pada: number;
  navamsaRasi: number;
  navamsaRasiTN: string;
  navamsaRasiEN: string;
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
    tithiEn: string;
    tithiNum: number;
    vaaram: string;
    vaaramEn: string;
    nakshatra: string;
    nakshatraEn: string;
    pada: number;
    rasi: string;
    rasiEn: string;
    lagna: string;
    lagnaEn: string;
    lagnaIdx: number;
  };
};

// ─── Astronomical Core ────────────────────────────────────────────────────────

function toJD(year: number, month: number, day: number, hour: number, min: number, sec: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y +
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
  BIJA: {
    Sun:     0.71,   Moon:    2.63,   Mars:  -14.15,
    Mercury: 0.52,   Jupiter: -2.28,  Venus:   4.02,
    Saturn: -4.89,   Rahu:   -4.95,
  },

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

// Interpolate epicycle radius between quadrant values
function getEpiR([r0, r90]: number[], kendra: number): number {
  const k = Math.abs(norm180(kendra));
  return k <= 90
    ? r0 + (r90 - r0) * k / 90
    : r90 + (r0 - r90) * (k - 90) / 90;
}

// Manda (equation of centre) correction
function mandaCorr(meanL: number, apoL: number, epiDef: number[]): number {
  const k1 = norm180(meanL - apoL);
  const r1 = getEpiR(epiDef, k1);
  const hc = deg(Math.asin(Math.min(1, Math.max(-1, r1 * Math.sin(rad(k1))))));
  const k2 = norm180(meanL + hc / 2 - apoL);
  const r2 = getEpiR(epiDef, k2);
  return deg(Math.asin(Math.min(1, Math.max(-1, r2 * Math.sin(rad(k2))))));
}

// Shighra (geocentric) correction
function shighraCorr(mandaSp: number, shighraMean: number, epiDef: number[]): number {
  const kendra = norm360(shighraMean - mandaSp);
  const r = getEpiR(epiDef, kendra);
  return deg(Math.atan2(r * Math.sin(rad(kendra)), 1 + r * Math.cos(rad(kendra))));
}

type SSLongitudes = {
  Sun: number; Moon: number; Mars: number; Mercury: number;
  Jupiter: number; Venus: number; Saturn: number; Rahu: number;
};

// Core Surya Siddhanta computation
function computeSS(jd: number): SSLongitudes {
  const A = jd - SS.KALI_EPOCH_JD;
  const R = SS.REV;
  const M = SS.MAHAYUGA;

  function mL(rev: number, retro = false): number {
    return norm360((retro ? -1 : 1) * rev * A / M * 360);
  }

  const sunM  = mL(R.Sun),   moonM = mL(R.Moon);
  const marsM = mL(R.Mars),  jupM  = mL(R.Jupiter), satM = mL(R.Saturn);
  const merShi= mL(R.Mer_shi), venShi= mL(R.Ven_shi);

  const sunApo  = mL(R.Sun_apo),  moonApo = mL(R.Moon_apo);
  const marsApo = mL(R.Mars_apo), merApo  = mL(R.Mer_apo);
  const jupApo  = mL(R.Jup_apo),  venApo  = mL(R.Ven_apo), satApo = mL(R.Sat_apo);

  const rahu = norm360(mL(R.Moon_node, true) + 180);

  const sunTrue = norm360(sunM + mandaCorr(sunM, sunApo, SS.MANDA.Sun));

  const moonMandaC = mandaCorr(moonM, moonApo, SS.MANDA.Moon);
  const moonSp = norm360(moonM + moonMandaC);
  const elong = norm360(moonM - sunM);
  const evection  =  1.2740 * Math.sin(rad(2 * elong - norm180(moonM - moonApo)));
  const variation  = 0.6583 * Math.sin(rad(2 * elong));
  const moonTrue = norm360(moonSp + evection + variation);

  const marsMSp  = norm360(marsM + mandaCorr(marsM, marsApo, SS.MANDA.Mars));
  const marsTrue = norm360(marsMSp + shighraCorr(marsMSp, sunM, SS.SHIGHRA.Mars));

  const jupMSp   = norm360(jupM + mandaCorr(jupM, jupApo, SS.MANDA.Jupiter));
  const jupTrue  = norm360(jupMSp + shighraCorr(jupMSp, sunM, SS.SHIGHRA.Jupiter));

  const satMSp   = norm360(satM + mandaCorr(satM, satApo, SS.MANDA.Saturn));
  const satTrue  = norm360(satMSp + shighraCorr(satMSp, sunM, SS.SHIGHRA.Saturn));

  const merMSp   = norm360(sunM + mandaCorr(sunM, merApo, SS.MANDA.Mercury));
  const merTrue  = norm360(merMSp + shighraCorr(merMSp, merShi, SS.SHIGHRA.Mercury));

  const venMSp   = norm360(sunM + mandaCorr(sunM, venApo, SS.MANDA.Venus));
  const venTrue  = norm360(venMSp + shighraCorr(venMSp, venShi, SS.SHIGHRA.Venus));

  return { Sun: sunTrue, Moon: moonTrue, Mars: marsTrue, Mercury: merTrue,
           Jupiter: jupTrue, Venus: venTrue, Saturn: satTrue, Rahu: rahu };
}

function getVaakiyaLongitudes(jd: number): Record<string, number> {
  const raw = computeSS(jd);
  const bija: Record<string, number> = SS.BIJA;
  const result: Record<string, number> = {};
  for (const [p, lon] of Object.entries(raw)) {
    result[p] = norm360(lon + (bija[p] || 0));
  }
  return result;
}

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
  const ayanamsa = 23.85 - 0.013608 * T;
  return norm360(deg(asc) - ayanamsa);
}

// ─── Chart Nomenclature ───────────────────────────────────────────────────────

const RASI_NAMES_TN = ["மேஷம்","ரிஷபம்","மிதுனம்","கடகம்","சிம்மம்","கன்னி",
  "துலாம்","விருச்சிகம்","தனுசு","மகரம்","கும்பம்","மீனம்"];
const RASI_NAMES_EN = ["Mesham (Aries)","Rishabam (Taurus)","Mithunam (Gemini)","Kadagam (Cancer)",
  "Simmam (Leo)","Kanni (Virgo)","Thulam (Libra)","Viruchigam (Scorpio)",
  "Dhanusu (Sagittarius)","Makaram (Capricorn)","Kumbam (Aquarius)","Meenam (Pisces)"];

const NAKSHATRA_TN = [
  "அஸ்வினி","பரணி","கார்த்திகை","ரோகிணி","மிருகசீரிஷம்","திருவாதிரை",
  "புனர்பூசம்","பூசம்","ஆயில்யம்","மகம்","பூரம்","உத்திரம்","அஸ்தம்",
  "சித்திரை","சுவாதி","விசாகம்","அனுஷம்","கேட்டை","மூலம்","பூராடம்",
  "உத்திராடம்","திருவோணம்","அவிட்டம்","சதயம்","பூரட்டாதி","உத்திரட்டாதி","ரேவதி"
];
const NAKSHATRA_EN = [
  "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra",
  "Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta",
  "Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha",
  "Uttara Ashadha","Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"
];

const PLANET_NAMES_TN: Record<string, string> = {
  Lagna:"லக்னம்", Sun:"சூரியன்", Moon:"சந்திரன்", Mars:"செவ்வாய்",
  Mercury:"புதன்", Jupiter:"குரு", Venus:"சுக்கிரன்", Saturn:"சனி",
  Rahu:"ராகு", Ketu:"கேது"
};
const PLANET_NAMES_EN: Record<string, string> = {
  Lagna:"Lagna (Ascendant)", Sun:"Sun (Suriyan)", Moon:"Moon (Chandran)", Mars:"Mars (Chevvai)",
  Mercury:"Mercury (Budhan)", Jupiter:"Jupiter (Guru)", Venus:"Venus (Sukran)", Saturn:"Saturn (Sani)",
  Rahu:"Rahu", Ketu:"Ketu"
};

const PLANET_SHORT_TN: Record<string, string> = {
  Lagna:"லக்", Sun:"சூரி", Moon:"சந்", Mars:"செவ்", Mercury:"புத",
  Jupiter:"குரு", Venus:"சுக்", Saturn:"சனி", Rahu:"ராகு", Ketu:"கேது"
};
const PLANET_SHORT_EN: Record<string, string> = {
  Lagna:"Lag", Sun:"Sun", Moon:"Moo", Mars:"Mar", Mercury:"Mer",
  Jupiter:"Jup", Venus:"Ven", Saturn:"Sat", Rahu:"Rah", Ketu:"Ket"
};

const DASA_YEARS: Record<string, number> = { Ketu:7, Venus:20, Sun:6, Moon:10, Mars:7, Rahu:18, Jupiter:16, Saturn:19, Mercury:17 };
const DASA_ORDER = ["Ketu","Venus","Sun","Moon","Mars","Rahu","Jupiter","Saturn","Mercury"];

function getRasiInfo(sidLon: number): { rasiIdx: number; degInRasi: number; rasiTN: string; rasiEN: string } {
  const rasiIdx = Math.floor(sidLon / 30);
  const degInRasi = sidLon % 30;
  return { rasiIdx, degInRasi, rasiTN: RASI_NAMES_TN[rasiIdx], rasiEN: RASI_NAMES_EN[rasiIdx] };
}

function getNakshatraInfo(sidLon: number): { nakshatraIdx: number; nakshatraTN: string; nakshatraEN: string; pada: number } {
  const span = 360 / 27;
  const nIdx = Math.floor(sidLon / span);
  const degInNak = sidLon % span;
  const pada = Math.floor(degInNak / (span / 4)) + 1;
  return { nakshatraIdx: nIdx, nakshatraTN: NAKSHATRA_TN[nIdx], nakshatraEN: NAKSHATRA_EN[nIdx], pada };
}

function getNavamsaRasi(sidLon: number): number {
  const rasiIdx = Math.floor(sidLon / 30);
  const degInRasi = sidLon % 30;
  const navIdx = Math.floor(degInRasi / (30 / 9));
  const elementStart = [0, 9, 6, 3, 0, 9, 6, 3, 0, 9, 6, 3][rasiIdx];
  return (elementStart + navIdx) % 12;
}

// ─── Geocoding ────────────────────────────────────────────────────────────────

const TN_CITIES: Record<string, { lat: number; lon: number }> = {
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
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(placeName)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const r = data.results[0];
      return { lat: r.latitude, lon: r.longitude, display: `${r.name}, ${r.country}` };
    }
  } catch (_) {}

  for (const [city, coords] of Object.entries(TN_CITIES)) {
    if (key.includes(city) || city.includes(key)) {
      return { lat: coords.lat, lon: coords.lon, display: placeName };
    }
  }
  return null;
}

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

// ─── South Indian 4×4 Grid Fixed Rasi Map ────────────────────────────────────

const SOUTH_INDIAN_CELLS = [
  11, 0, 1, 2,   // Meena, Mesham, Rishabam, Mithunam
  10, -1, -1, 3, // Kumbam, [center], [center], Kadagam
  9, -1, -1, 4,  // Makaram, [center], [center], Simmam
  8, 7, 6, 5     // Dhanusu, Viruchigam, Thulam, Kanni
];

function rasiToCell(rasiIdx: number): number {
  return SOUTH_INDIAN_CELLS.indexOf(rasiIdx);
}

function cellToRowCol(cellIdx: number): { row: number; col: number } {
  return { row: Math.floor(cellIdx / 4), col: cellIdx % 4 };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function VaakiyaJadhagam({
  language = 'ta',
  isLight = false,
}: VaakiyaJadhagamProps) {
  const isTa = language === 'ta';
  const { user } = useAuth();

  const [form, setForm] = useState<FormState>({ name: "", date: "", time: "", place: "", lat: "", lon: "" });
  const [chart, setChart] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [geoStatus, setGeoStatus] = useState("");
  const [showManual, setShowManual] = useState(false);

  // 12-hour time picker state (UI only; form.time stays as 24h HH:MM internally)
  const [timeHour, setTimeHour] = useState("12");
  const [timeMinute, setTimeMinute] = useState("00");
  const [timeAmPm, setTimeAmPm] = useState<"AM" | "PM">("AM");

  function ampmTo24h(hour: string, minute: string, ampm: "AM" | "PM"): string {
    let h = parseInt(hour, 10);
    if (ampm === "AM") { if (h === 12) h = 0; }
    else { if (h !== 12) h += 12; }
    return `${String(h).padStart(2, "0")}:${minute.padStart(2, "0")}`;
  }

  function set24hFromPicker(hour: string, minute: string, ampm: "AM" | "PM") {
    setForm(f => ({ ...f, time: ampmTo24h(hour, minute, ampm) }));
  }

  function handleHourChange(e: ChangeEvent<HTMLSelectElement>) {
    setTimeHour(e.target.value);
    set24hFromPicker(e.target.value, timeMinute, timeAmPm);
  }

  function handleMinuteChange(e: ChangeEvent<HTMLSelectElement>) {
    setTimeMinute(e.target.value);
    set24hFromPicker(timeHour, e.target.value, timeAmPm);
  }

  function handleAmPmChange(e: ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value as "AM" | "PM";
    setTimeAmPm(val);
    set24hFromPicker(timeHour, timeMinute, val);
  }

  // Autocomplete
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Saved profiles
  const [savedProfiles, setSavedProfiles] = useState<any[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  useEffect(() => {
    if (user?.id) loadProfiles();
  }, [user]);

  async function loadProfiles() {
    try {
      const { data, error } = await supabase
        .from('horoscope_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });
      if (error) throw error;
      if (data) {
        setSavedProfiles(data.map((r: any) => ({
          id: r.id,
          name: r.name,
          fatherName: r.father_name,
          motherName: r.mother_name,
          dob: r.dob,
          place: r.place,
          lat: r.lat,
          lon: r.lon,
          savedAt: r.saved_at,
        })));
      }
    } catch (e) {
      console.error('Error loading profiles:', e);
    }
  }

  async function handleSaveProfile(overrideName?: string, overrideDob?: string, overridePlace?: string, overrideLat?: number, overrideLon?: number) {
    const nameVal = overrideName ?? form.name;
    const dobVal = overrideDob ?? (form.date && form.time ? `${form.date}T${form.time}` : null);
    const placeVal = overridePlace ?? form.place;
    const latVal = overrideLat ?? (form.lat ? parseFloat(form.lat) : null);
    const lonVal = overrideLon ?? (form.lon ? parseFloat(form.lon) : null);

    if (!nameVal?.trim() || !dobVal || !placeVal?.trim() || !user?.id) return;
    setSaveStatus('saving');

    const isEditingExisting = !!selectedProfile?.id;
    const payload = {
      name: nameVal.trim(),
      dob: dobVal,
      place: placeVal.trim(),
      lat: latVal,
      lon: lonVal,
      savedAt: new Date().toISOString(),
    };

    try {
      if (isEditingExisting) {
        const { error } = await supabase
          .from('horoscope_profiles')
          .update({ name: payload.name, dob: payload.dob, place: payload.place, lat: payload.lat, lon: payload.lon, saved_at: payload.savedAt })
          .eq('id', selectedProfile.id)
          .eq('user_id', user.id);
        if (error) throw error;
        const updated = { ...payload, id: selectedProfile.id };
        setSavedProfiles(prev => prev.map(p => p.id === selectedProfile.id ? updated : p));
        setSelectedProfile(updated);
      } else {
        const { data, error } = await supabase
          .from('horoscope_profiles')
          .insert({ user_id: user.id, name: payload.name, dob: payload.dob, place: payload.place, lat: payload.lat, lon: payload.lon, saved_at: payload.savedAt })
          .select()
          .single();
        if (error) throw error;
        const newProfile = { ...payload, id: data?.id ?? Date.now().toString() };
        setSavedProfiles(prev => [newProfile, ...prev]);
        setSelectedProfile(newProfile);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (e) {
      console.error('Error saving profile:', e);
      setSaveStatus(null);
    }
  }

  function handleLoadProfile(profile: any) {
    const newForm: FormState = { name: profile.name || '', date: '', time: '', place: profile.place || '', lat: '', lon: '' };
    if (profile.dob) {
      const d = new Date(profile.dob);
      if (!isNaN(d.getTime())) {
        newForm.date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const h24 = d.getHours();
        const mins = String(d.getMinutes()).padStart(2, '0');
        newForm.time = `${String(h24).padStart(2, '0')}:${mins}`;
        // Sync 12h picker
        const ampm: "AM" | "PM" = h24 < 12 ? "AM" : "PM";
        const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
        setTimeHour(String(h12));
        setTimeMinute(mins);
        setTimeAmPm(ampm);
      }
    }
    if (typeof profile.lat === 'number') newForm.lat = String(profile.lat);
    if (typeof profile.lon === 'number') newForm.lon = String(profile.lon);
    setForm(newForm);
    setSelectedProfile(profile);
    setDropdownOpen(false);
  }

  async function handleDeleteProfile(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    try {
      const { error } = await supabase.from('horoscope_profiles').delete().eq('id', id);
      if (error) throw error;
      setSavedProfiles(prev => prev.filter(p => p.id !== id));
      if (selectedProfile?.id === id) setSelectedProfile(null);
    } catch (e) {
      console.error('Error deleting profile:', e);
    }
  }

  // ── Palette Theme Tokens ───────────────────────────────────────────────────
  const t = useMemo(() => {
    if (isLight) {
      return {
        pageBg: "linear-gradient(180deg, #FFFDF8 0%, #FAF5EB 100%)",
        textColor: "#1C1917",
        textMuted: "#57534E",
        headerBg: "linear-gradient(180deg, #85222E 0%, #5C121B 100%)",
        headerBorder: "#B45309",
        headerTitle: "#FFFFFF",
        headerSub: "#FDE68A",
        gold: "#B45309",
        goldLight: "#92400E",
        cardBg: "#FFFFFF",
        cardBorder: "#E3D5C0",
        cardShadow: "0 10px 30px rgba(74, 52, 20, 0.07)",
        labelColor: "#853704",
        inputBg: "#FFFFFF",
        inputBorder: "#D8C7B0",
        btnGradient: "linear-gradient(135deg, #85222E, #5C121B)",
        btnText: "#FFFFFF",
        btnShadow: "0 4px 14px rgba(133, 34, 46, 0.25)",
        infoBg: "#FAF5EC",
        infoBorder: "#E3D5C0",
        tableHeadBg: "linear-gradient(90deg, #85222E, #5C121B)",
        tableHeadText: "#FFFFFF",
        tableRowEven: "#FAF5EC",
        tableRowOdd: "#FFFFFF",
        tableBorder: "#E3D5C0",
        gridBorder: "#B45309",
        gridCellBg: "#FFFFFF",
        gridLagnaBg: "#FEF3C7",
        gridLagnaMarker: "#B45309",
        centerLabelBg: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
        centerLabelBorder: "#FCD34D",
        centerLabelText: "#92400E",
        planetTagColor: "#85222E",
        dasaBoxBg: "#FEF3C7",
        dasaBoxBorder: "#FCD34D",
        dasaLabelColor: "#92400E",
        dasaValueColor: "#85222E",
        dropdownBg: "#FFFFFF",
        dropdownBorder: "#D8C7B0",
        dropdownHover: "#FEF3C7",
        divider: "linear-gradient(90deg, transparent, #B45309, transparent)",
        resetBtnBorder: "#85222E",
        resetBtnText: "#85222E",
      };
    }
    return {
      pageBg: "radial-gradient(ellipse at 30% 10%, #20183B 0%, #0E0A1A 60%)",
      textColor: "#F1ECDC",
      textMuted: "#ABA7C6",
      headerBg: "linear-gradient(180deg, #2D1432 0%, #170B1F 100%)",
      headerBorder: "rgba(201, 162, 39, 0.4)",
      headerTitle: "#F5E6A3",
      headerSub: "#ABA7C6",
      gold: "#C9A227",
      goldLight: "#F5E6A3",
      cardBg: "#171228",
      cardBorder: "rgba(201, 162, 39, 0.28)",
      cardShadow: "0 12px 35px rgba(0, 0, 0, 0.45)",
      labelColor: "#E8CE7A",
      inputBg: "#1F1735",
      inputBorder: "rgba(201, 162, 39, 0.25)",
      btnGradient: "linear-gradient(135deg, #C9A227, #996B10)",
      btnText: "#1A1102",
      btnShadow: "0 4px 16px rgba(201, 162, 39, 0.3)",
      infoBg: "#1A142D",
      infoBorder: "rgba(201, 162, 39, 0.25)",
      tableHeadBg: "linear-gradient(90deg, #3B1528, #250B1B)",
      tableHeadText: "#F5E6A3",
      tableRowEven: "#1C1530",
      tableRowOdd: "#171228",
      tableBorder: "rgba(201, 162, 39, 0.18)",
      gridBorder: "#C9A227",
      gridCellBg: "#171228",
      gridLagnaBg: "rgba(201, 162, 39, 0.18)",
      gridLagnaMarker: "#F5E6A3",
      centerLabelBg: "linear-gradient(135deg, rgba(201, 162, 39, 0.22), rgba(201, 162, 39, 0.08))",
      centerLabelBorder: "rgba(201, 162, 39, 0.4)",
      centerLabelText: "#F5E6A3",
      planetTagColor: "#F5E6A3",
      dasaBoxBg: "#1F1735",
      dasaBoxBorder: "#C9A227",
      dasaLabelColor: "#E8CE7A",
      dasaValueColor: "#F5E6A3",
      dropdownBg: "#1F1735",
      dropdownBorder: "rgba(201, 162, 39, 0.35)",
      dropdownHover: "#2A2046",
      divider: "linear-gradient(90deg, transparent, rgba(201, 162, 39, 0.5), transparent)",
      resetBtnBorder: "#C9A227",
      resetBtnText: "#F5E6A3",
    };
  }, [isLight]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name as keyof FormState]: e.target.value }));

  const handleLocationChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
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
    setError("");
    setLoading(true);
    setGeoStatus(isTa ? "இடம் தேடுகிறது..." : "Locating place...");

    try {
      if (!form.name || !form.date || !form.time || !form.place)
        throw new Error(isTa ? "அனைத்து தகவல்களும் தேவை" : "All fields are required");

      let geo = null;

      if (form.lat && form.lon) {
        geo = { lat: parseFloat(form.lat), lon: parseFloat(form.lon), display: form.place };
      } else {
        geo = await geocodePlace(form.place);
      }

      if (!geo) {
        setShowManual(true);
        throw new Error(isTa
          ? "இடம் கண்டுபிடிக்க முடியவில்லை — கீழே lat/lon நேரடியாக உள்ளிடவும்"
          : "Could not find location — please enter lat/lon manually below");
      }
      setGeoStatus(`${geo.display} (${geo.lat.toFixed(4)}, ${geo.lon.toFixed(4)})`);

      // Auto-save profile with resolved coords
      await handleSaveProfile(form.name, `${form.date}T${form.time}`, form.place, geo.lat, geo.lon);

      const [yyyy, mm, dd] = form.date.split("-").map(Number);
      const [hh, mi] = form.time.split(":").map(Number);

      // Convert local time to UTC (IST = UTC+5:30)
      const utcHour = hh - 5.5;
      let utcDay = dd, utcMon = mm, utcYear = yyyy;
      let adjHour = utcHour;
      if (adjHour < 0) { adjHour += 24; utcDay -= 1; }
      if (adjHour >= 24) { adjHour -= 24; utcDay += 1; }

      const jd = toJD(utcYear, utcMon, utcDay, adjHour, 0, 0);

      const vaakiyaLons = getVaakiyaLongitudes(jd);
      const lagnaLon    = getLagna(jd, geo.lat, geo.lon);

      const sidLons: Record<string, number> = {
        Lagna: lagnaLon,
        ...vaakiyaLons,
        Ketu: norm360(vaakiyaLons.Rahu + 180),
      };

      const planets: Record<string, PlanetInfo> = {};
      for (const [p, sid] of Object.entries(sidLons)) {
        const rasi    = getRasiInfo(sid);
        const nak     = getNakshatraInfo(sid);
        const navamsa = getNavamsaRasi(sid);
        planets[p] = {
          sid,
          ...rasi,
          ...nak,
          navamsaRasi: navamsa,
          navamsaRasiTN: RASI_NAMES_TN[navamsa],
          navamsaRasiEN: RASI_NAMES_EN[navamsa],
        };
      }

      // Dasa from Moon nakshatra
      const moonNakIdx = planets.Moon.nakshatraIdx;
      const lordIdx = moonNakIdx % 9;
      const moonLord = DASA_ORDER[lordIdx];
      const moonNakSpan = 360 / 27;
      const moonDegInNak = planets.Moon.sid % moonNakSpan;
      const fraction = moonDegInNak / moonNakSpan;
      const remainingYears = DASA_YEARS[moonLord] * (1 - fraction);

      // Tithi
      const tithi = Math.floor(((planets.Moon.sid - planets.Sun.sid + 360) % 360) / 12) + 1;
      const tithiNamesTN = ["பிரதமை","துவிதியை","திரிதியை","சதுர்த்தி","பஞ்சமி","ஷஷ்டி","சப்தமி","அஷ்டமி","நவமி","தசமி","ஏகாதசி","துவாதசி","திரயோதசி","சதுர்த்தசி","அமாவாசை / பௌர்ணமி"];
      const tithiNamesEN = ["Prathama","Dvitiya","Tritiya","Chaturthi","Panchami","Shasthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dvadashi","Trayodashi","Chaturdashi","Amavasya / Pournami"];
      const tithiIdx = Math.min(tithi - 1, 14);

      // Day of week
      const dayNamesTN = ["ஞாயிறு","திங்கள்","செவ்வாய்","புதன்","வியாழன்","வெள்ளி","சனி"];
      const dayNamesEN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
      const dow = new Date(form.date).getDay();

      setChart({
        name: form.name,
        date: form.date,
        time: form.time,
        place: geo.display.split(",").slice(0, 2).join(", "),
        lat: geo.lat,
        lon: geo.lon,
        planets,
        dasa: { lord: moonLord, remaining: remainingYears.toFixed(2) },
        panchagam: {
          tithi: tithiNamesTN[tithiIdx],
          tithiEn: tithiNamesEN[tithiIdx],
          tithiNum: tithi,
          vaaram: dayNamesTN[dow],
          vaaramEn: dayNamesEN[dow],
          nakshatra: planets.Moon.nakshatraTN,
          nakshatraEn: planets.Moon.nakshatraEN,
          pada: planets.Moon.pada,
          rasi: planets.Moon.rasiTN,
          rasiEn: planets.Moon.rasiEN,
          lagna: planets.Lagna.rasiTN,
          lagnaEn: planets.Lagna.rasiEN,
          lagnaIdx: planets.Lagna.rasiIdx,
        }
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [form, isTa, handleSaveProfile]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: t.pageBg,
        fontFamily: isTa
          ? "'Noto Serif Tamil', 'Noto Sans Tamil', Georgia, serif"
          : "'Inter', system-ui, -apple-system, sans-serif",
        color: t.textColor,
        padding: "0 0 48px",
        transition: "background 0.2s ease, color 0.2s ease",
      }}
    >
      <style>{`
        @media (max-width: 480px) {
          .vj-header { padding: 16px 12px 14px !important; gap: 10px !important; }
          .vj-header-title { font-size: 22px !important; }
          .vj-header-sub { font-size: 11px !important; }
          .vj-table-wrap { overflow-x: auto; }
          .vj-charts-row { gap: 16px !important; }
          .vj-dasa-box { padding: 10px 16px !important; }
          .vj-info-row { font-size: 12px !important; }
          .vj-info-label { min-width: 80px !important; }
          .vj-planet-tag { font-size: 10px !important; }
        }
      `}</style>

      {/* Header */}
      <div
        className="vj-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: "22px 16px 18px",
          borderBottom: `2px solid ${t.headerBorder}`,
          background: t.headerBg,
          color: t.headerTitle,
          boxShadow: "0 4px 15px rgba(0,0,0,0.12)",
        }}
      >
        <div style={{ fontSize: 26, color: t.gold, lineHeight: 1 }}>✦</div>
        <div style={{ textAlign: "center" }}>
          <div
            className="vj-header-title"
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "0.02em",
              color: t.headerTitle,
            }}
          >
            {isTa ? "ஜாதக கணிப்பு" : "Vaakiya Jadhagam Calculator"}
          </div>
          <div
            className="vj-header-sub"
            style={{
              fontSize: 13,
              color: t.headerSub,
              marginTop: 4,
              fontWeight: 500,
              letterSpacing: "0.03em",
            }}
          >
            {isTa
              ? "வாக்கிய பஞ்சாங்க முறைப்படி — Vaakiya Jadhagam"
              : "Classical Suddha Vaakiya System (Surya Siddhanta)"}
          </div>
        </div>
        <div style={{ fontSize: 26, color: t.gold, lineHeight: 1 }}>✦</div>
      </div>

      {/* Input Form */}
      {!chart && (
        <div style={{ maxWidth: 640, margin: "28px auto", width: "92%" }}>

          {/* Saved Profiles Dropdown */}
          {user && savedProfiles.length > 0 && (
            <div style={{ position: "relative", zIndex: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.gold, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                {isTa ? 'சேமிக்கப்பட்ட சுயவிவரங்கள்' : 'Saved Profiles'}
              </div>
              <button
                type="button"
                onClick={() => setDropdownOpen(v => !v)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: t.inputBg,
                  border: `1.5px solid ${t.dropdownBorder}`,
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: t.textColor,
                  cursor: "pointer",
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                  {selectedProfile ? (
                    <>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: t.dasaBoxBg, border: `1px solid ${t.dropdownBorder}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, color: t.gold, fontSize: 13, flexShrink: 0,
                      }}>
                        {selectedProfile.name[0].toUpperCase()}
                      </div>
                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontWeight: 700, color: t.textColor, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selectedProfile.name}</div>
                        <div style={{ fontSize: 11, color: t.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{selectedProfile.place}</div>
                      </div>
                    </>
                  ) : (
                    <span style={{ color: t.textMuted }}>
                      {isTa ? 'ஒரு சுயவிவரத்தைத் தேர்ந்தெடுக்கவும்' : 'Select a Saved Profile'}
                    </span>
                  )}
                </div>
                <span style={{ color: t.gold, fontSize: 12, flexShrink: 0, marginLeft: 8, transform: dropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>▼</span>
              </button>

              {dropdownOpen && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
                  background: t.dropdownBg, border: `1.5px solid ${t.dropdownBorder}`,
                  borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                  maxHeight: 220, overflowY: "auto", zIndex: 50,
                }}>
                  {savedProfiles.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleLoadProfile(p)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "10px 14px", cursor: "pointer", fontSize: 13,
                        background: selectedProfile?.id === p.id ? t.dropdownHover : "transparent",
                        borderBottom: `1px solid ${t.tableBorder}`,
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = t.dropdownHover)}
                      onMouseLeave={e => (e.currentTarget.style.background = selectedProfile?.id === p.id ? t.dropdownHover : "transparent")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: "50%",
                          background: t.dasaBoxBg, border: `1px solid ${t.dropdownBorder}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 800, color: t.gold, fontSize: 12, flexShrink: 0,
                        }}>
                          {p.name[0].toUpperCase()}
                        </div>
                        <div style={{ overflow: "hidden" }}>
                          <div style={{ fontWeight: 700, color: t.textColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: t.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.place}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 8 }}>
                        {selectedProfile?.id === p.id && <span style={{ color: t.gold, fontSize: 14 }}>✓</span>}
                        <button
                          type="button"
                          onClick={e => handleDeleteProfile(e, p.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: 14, padding: "2px 4px", lineHeight: 1 }}
                          title={isTa ? 'அழி' : 'Delete'}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        <div
          style={{
            padding: "28px 22px",
            background: t.cardBg,
            border: `1.5px solid ${t.cardBorder}`,
            borderRadius: 16,
            boxShadow: t.cardShadow,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "16px 20px",
            }}
          >
            {/* Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, color: t.labelColor, fontWeight: 700 }}>
                {isTa ? "பெயர் / Name" : "Name / பெயர்"}
              </label>
              <input
                style={{
                  padding: "10px 12px",
                  border: `1.5px solid ${t.inputBorder}`,
                  borderRadius: 8,
                  fontSize: 14,
                  background: t.inputBg,
                  color: t.textColor,
                  outline: "none",
                  fontFamily: "inherit",
                }}
                type="text"
                name="name"
                placeholder={isTa ? "உங்கள் பெயர்" : "Your Name"}
                value={form.name}
                onChange={handleChange}
              />
            </div>

            {/* Date */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, color: t.labelColor, fontWeight: 700 }}>
                {isTa ? "பிறந்த தேதி / Date" : "Date of Birth / பிறந்த தேதி"}
              </label>
              <input
                style={{
                  padding: "10px 12px",
                  border: `1.5px solid ${t.inputBorder}`,
                  borderRadius: 8,
                  fontSize: 14,
                  background: t.inputBg,
                  color: t.textColor,
                  outline: "none",
                  fontFamily: "inherit",
                }}
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>

            {/* Time — 12h AM/PM picker */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, color: t.labelColor, fontWeight: 700 }}>
                {isTa ? "பிறந்த நேரம் / Time (IST)" : "Birth Time (IST) / நேரம்"}
              </label>
              <div style={{ display: "flex", gap: 6 }}>
                {/* Hour */}
                <select
                  value={timeHour}
                  onChange={handleHourChange}
                  style={{
                    flex: 1,
                    padding: "10px 6px",
                    border: `1.5px solid ${t.inputBorder}`,
                    borderRadius: 8,
                    fontSize: 14,
                    background: t.inputBg,
                    color: t.textColor,
                    outline: "none",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    appearance: "none",
                    textAlign: "center",
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={String(h)}>{String(h).padStart(2, "0")}</option>
                  ))}
                </select>
                <span style={{ display: "flex", alignItems: "center", color: t.gold, fontWeight: 800, fontSize: 16 }}>:</span>
                {/* Minute */}
                <select
                  value={timeMinute}
                  onChange={handleMinuteChange}
                  style={{
                    flex: 1,
                    padding: "10px 6px",
                    border: `1.5px solid ${t.inputBorder}`,
                    borderRadius: 8,
                    fontSize: 14,
                    background: t.inputBg,
                    color: t.textColor,
                    outline: "none",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    appearance: "none",
                    textAlign: "center",
                  }}
                >
                  {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0")).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {/* AM / PM */}
                <select
                  value={timeAmPm}
                  onChange={handleAmPmChange}
                  style={{
                    flex: "0 0 auto",
                    padding: "10px 8px",
                    border: `1.5px solid ${t.inputBorder}`,
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 700,
                    background: t.inputBg,
                    color: t.gold,
                    outline: "none",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    appearance: "none",
                    textAlign: "center",
                  }}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* Birth Place */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative" }}>
              <label style={{ fontSize: 13, color: t.labelColor, fontWeight: 700 }}>
                {isTa ? "பிறந்த இடம் / Place" : "Place of Birth / இடம்"}
              </label>
              <input
                style={{
                  padding: "10px 12px",
                  border: `1.5px solid ${t.inputBorder}`,
                  borderRadius: 8,
                  fontSize: 14,
                  background: t.inputBg,
                  color: t.textColor,
                  outline: "none",
                  fontFamily: "inherit",
                }}
                type="text"
                name="place"
                placeholder={isTa ? "எ.கா: சென்னை, மதுரை, கோவை" : "e.g., Chennai, Madurai, Coimbatore"}
                autoComplete="off"
                value={form.place}
                onChange={handleLocationChange}
                onFocus={() => { if (suggestions.length > 0) setOpenLocation(true); }}
                onBlur={() => setTimeout(() => setOpenLocation(false), 180)}
              />
              {loadingLocation && (
                <span style={{ fontSize: 11, color: t.gold, marginTop: 2, fontWeight: 600 }}>
                  {isTa ? "தேடுகிறது…" : "Searching…"}
                </span>
              )}
              {openLocation && suggestions.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: 4,
                    background: t.dropdownBg,
                    border: `1.5px solid ${t.dropdownBorder}`,
                    borderRadius: 8,
                    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                    zIndex: 50,
                    maxHeight: 220,
                    overflowY: "auto",
                  }}
                >
                  {suggestions.map(item => (
                    <div
                      key={item.place_id}
                      style={{
                        padding: "9px 12px",
                        fontSize: 13,
                        color: t.textColor,
                        cursor: "pointer",
                        borderBottom: `1px solid ${t.tableBorder}`,
                      }}
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 13,
                color: t.labelColor,
                cursor: "pointer",
                userSelect: "none",
                fontWeight: 700,
              }}
              onClick={() => setShowManual(v => !v)}
            >
              {showManual ? "▾" : "▸"}{" "}
              {isTa ? "Lat/Lon நேரடியாக உள்ளிட (விரும்பினால்)" : "Enter Lat/Lon manually (optional)"}
            </span>
            <span style={{ fontSize: 12, color: t.textMuted }}>
              →{" "}
              <a
                href="https://www.latlong.net"
                target="_blank"
                rel="noreferrer"
                style={{ color: t.gold, textDecoration: "underline" }}
              >
                {isTa ? "latlong.net இல் தேடலாம்" : "Find on latlong.net"}
              </a>
            </span>
          </div>
          {showManual && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "12px 20px",
                marginTop: 12,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, color: t.labelColor, fontWeight: 600 }}>
                  {isTa ? "Latitude (வடக்கு)" : "Latitude (North)"}
                </label>
                <input
                  style={{
                    padding: "8px 10px",
                    border: `1.5px solid ${t.inputBorder}`,
                    borderRadius: 6,
                    fontSize: 14,
                    background: t.inputBg,
                    color: t.textColor,
                    outline: "none",
                  }}
                  type="number"
                  step="0.0001"
                  name="lat"
                  placeholder="13.0827"
                  value={form.lat}
                  onChange={handleChange}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 12, color: t.labelColor, fontWeight: 600 }}>
                  {isTa ? "Longitude (கிழக்கு)" : "Longitude (East)"}
                </label>
                <input
                  style={{
                    padding: "8px 10px",
                    border: `1.5px solid ${t.inputBorder}`,
                    borderRadius: 6,
                    fontSize: 14,
                    background: t.inputBg,
                    color: t.textColor,
                    outline: "none",
                  }}
                  type="number"
                  step="0.0001"
                  name="lon"
                  placeholder="80.2707"
                  value={form.lon}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                marginTop: 14,
                color: "#EF4444",
                fontSize: 13,
                textAlign: "center",
                fontWeight: 600,
                background: "rgba(239, 68, 68, 0.1)",
                padding: "8px 12px",
                borderRadius: 6,
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginTop: 22, display: "flex", gap: 12 }}>
            {user && (
              <button
                type="button"
                disabled={!form.name.trim() || !form.date || !form.time || !form.place.trim() || saveStatus === 'saving'}
                onClick={() => handleSaveProfile()}
                style={{
                  flex: 1,
                  padding: "13px",
                  background: "transparent",
                  color: saveStatus === 'saved' ? "#22C55E" : t.gold,
                  border: `1.5px solid ${saveStatus === 'saved' ? "#22C55E" : t.dropdownBorder}`,
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: (!form.name.trim() || !form.date || !form.time || !form.place.trim() || saveStatus === 'saving') ? "not-allowed" : "pointer",
                  letterSpacing: "0.03em",
                  fontFamily: "inherit",
                  opacity: (!form.name.trim() || !form.date || !form.time || !form.place.trim()) ? 0.4 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                {saveStatus === 'saving'
                  ? (isTa ? 'சேமிக்கிறது...' : 'Saving...')
                  : saveStatus === 'saved'
                  ? (isTa ? '✓ சேமிக்கப்பட்டது' : '✓ Saved!')
                  : (isTa ? 'சுயவிவரத்தைச் சேமி' : 'Save Profile')}
              </button>
            )}
            <button
              style={{
                flex: user ? 1.5 : 1,
                padding: "13px",
                background: t.btnGradient,
                color: t.btnText,
                border: "none",
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.03em",
                boxShadow: t.btnShadow,
                opacity: loading ? 0.7 : 1,
                fontFamily: "inherit",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onClick={calculate}
              disabled={loading}
            >
              {loading
                ? geoStatus || (isTa ? "கணிக்கிறது..." : "Calculating...")
                : isTa
                ? "ஜாதகம் கணி"
                : "Calculate Horoscope"}
            </button>
          </div>
        </div>
        </div>
      )}

      {/* Chart Output */}
      {chart && (
        <JadhagamChart
          chart={chart}
          isTa={isTa}
          t={t}
          onReset={() => {
            setChart(null);
            setGeoStatus("");
          }}
        />
      )}
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

function SouthIndianGrid({
  grid,
  lagnaCell,
  label,
  isTa,
  t,
}: {
  grid: string[][];
  lagnaCell: number;
  label: string;
  isTa: boolean;
  t: any;
}) {
  return (
    <div style={{ flex: "1 1 280px", maxWidth: 400, minWidth: 260 }}>
      <div
        style={{
          textAlign: "center",
          fontWeight: 800,
          fontSize: 15,
          color: t.labelColor,
          marginBottom: 8,
          letterSpacing: "0.03em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(4, 1fr)",
          border: `2px solid ${t.gridBorder}`,
          borderRadius: 8,
          overflow: "hidden",
          aspectRatio: "1",
          background: t.gridCellBg,
          boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        }}
      >
        {Array(16).fill(0).map((_, i) => {
          const { row, col } = cellToRowCol(i);
          const isCenter = (row === 1 || row === 2) && (col === 1 || col === 2);
          const isLagna = i === lagnaCell;
          if (isCenter) {
            if (row === 1 && col === 1) {
              return (
                <div
                  key={i}
                  style={{
                    gridColumn: "2/4",
                    gridRow: "2/4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 800,
                    color: t.centerLabelText,
                    background: t.centerLabelBg,
                    border: `1px solid ${t.centerLabelBorder}`,
                    letterSpacing: "0.05em",
                  }}
                >
                  {label.includes("ராசி") || label.includes("Rasi")
                    ? isTa ? "ராசி" : "RASI"
                    : isTa ? "அம்சம்" : "NAVAMSA"}
                </div>
              );
            }
            return null;
          }
          const planets = grid[i] || [];
          return (
            <div
              key={i}
              style={{
                border: `1px solid ${t.tableBorder}`,
                padding: "4px 3px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                position: "relative",
                background: isLagna ? t.gridLagnaBg : t.gridCellBg,
                overflow: "hidden",
              }}
            >
              {isLagna && (
                <span
                  style={{
                    fontSize: 10,
                    color: t.gridLagnaMarker,
                    fontWeight: 800,
                    position: "absolute",
                    top: 2,
                    right: 3,
                  }}
                >
                  {isTa ? "லக்" : "LAG"}
                </span>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 2 }}>
                {planets.map(p => (
                  <span
                    key={p}
                    className="vj-planet-tag"
                    style={{
                      fontSize: 15,
                      color: t.planetTagColor,
                      fontWeight: 700,
                      lineHeight: 1.3,
                      background: isTa ? "transparent" : "rgba(201,162,39,0.08)",
                      padding: isTa ? "0" : "1px 2px",
                      borderRadius: 3,
                    }}
                  >
                    {isTa ? PLANET_SHORT_TN[p] : PLANET_SHORT_EN[p]}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function JadhagamChart({
  chart,
  isTa,
  t,
  onReset,
}: {
  chart: ChartData;
  isTa: boolean;
  t: any;
  onReset: () => void;
}) {
  const { planets, panchagam, dasa, name, date, time, place } = chart;
  const rasiGrid = buildGridData(planets);
  const navGrid = buildNavamsaGrid(planets);
  const lagnaCell = rasiToCell(panchagam.lagnaIdx);

  const PLANET_ORDER = ["Lagna","Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];

  return (
    <div
      style={{
        maxWidth: 880,
        margin: "20px auto",
        padding: "0 14px",
      }}
    >
      {/* Title block */}
      <div style={{ textAlign: "center", padding: "16px 0 10px" }}>
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            color: t.labelColor,
            letterSpacing: "0.02em",
            fontFamily: isTa ? "'Noto Serif Tamil', Georgia, serif" : "inherit",
          }}
        >
          {isTa ? "ஜனன ஜாதக பத்திரிகை" : "Janana Jadhagam (Birth Horoscope)"}
        </div>
        <div style={{ fontSize: 13, color: t.gold, marginTop: 4, fontWeight: 600 }}>
          {isTa
            ? "சுத்த வாக்கிய பஞ்சாங்க முறைப்படி கணிக்கப்பட்டது"
            : "Calculated via Classical Suddha Vaakiya System"}
        </div>
        <div style={{ height: 2, margin: "14px 0", background: t.divider }} />
      </div>

      {/* Identity + Panchagam */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "10px 24px",
          background: t.infoBg,
          border: `1px solid ${t.infoBorder}`,
          borderRadius: 12,
          padding: "16px 18px",
          marginBottom: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <InfoRow isTa={isTa} t={t} label={isTa ? "ஜாதகர் பெயர்" : "Native's Name"} value={name} />
          <InfoRow isTa={isTa} t={t} label={isTa ? "பிறந்த தேதி" : "Date of Birth"} value={(() => {
              const [hStr, mStr] = time.split(":");
              const h24 = parseInt(hStr, 10);
              const ampm = h24 < 12 ? "AM" : "PM";
              const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
              return `${date} @ ${String(h12).padStart(2, "0")}:${mStr} ${ampm}`;
            })()} />
          <InfoRow isTa={isTa} t={t} label={isTa ? "பிறந்த இடம்" : "Birth Place"} value={place} />
          <InfoRow isTa={isTa} t={t} label={isTa ? "கணிப்பு முறை" : "System"} value={isTa ? "சுத்த வாக்கியம்" : "Suddha Vaakiyam"} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <InfoRow
            isTa={isTa}
            t={t}
            label={isTa ? "நட்சத்திரம்" : "Nakshatra"}
            value={isTa ? `${panchagam.nakshatra} (${panchagam.pada}-ம் பாதம்)` : `${panchagam.nakshatraEn} (Pada ${panchagam.pada})`}
          />
          <InfoRow
            isTa={isTa}
            t={t}
            label={isTa ? "ராசி" : "Rasi (Moon Sign)"}
            value={isTa ? panchagam.rasi : panchagam.rasiEn}
          />
          <InfoRow
            isTa={isTa}
            t={t}
            label={isTa ? "லக்னம்" : "Lagna (Ascendant)"}
            value={isTa ? panchagam.lagna : panchagam.lagnaEn}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <InfoRow
            isTa={isTa}
            t={t}
            label={isTa ? "திதி" : "Tithi"}
            value={isTa ? panchagam.tithi : panchagam.tithiEn}
          />
          <InfoRow
            isTa={isTa}
            t={t}
            label={isTa ? "வாரம்" : "Day (Vaaram)"}
            value={isTa ? panchagam.vaaram : panchagam.vaaramEn}
          />
          <InfoRow
            isTa={isTa}
            t={t}
            label={isTa ? "நடப்பு தசை" : "Birth Dasa"}
            value={isTa ? `${PLANET_NAMES_TN[dasa.lord] || dasa.lord} தசை` : `${dasa.lord} Dasa`}
          />
          <InfoRow
            isTa={isTa}
            t={t}
            label={isTa ? "தசை இருப்பு" : "Dasa Balance"}
            value={isTa ? `${dasa.remaining} ஆண்டு` : `${dasa.remaining} Years`}
          />
        </div>
      </div>

      <div style={{ height: 2, margin: "14px 0", background: t.divider }} />

      {/* Planet table */}
      <div className="vj-table-wrap" style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${t.tableBorder}` }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: t.tableHeadBg }}>
              <th style={{ padding: "9px 10px", color: t.tableHeadText, fontWeight: 700, textAlign: "left" }}>
                {isTa ? "கிரகம்" : "Planet"}
              </th>
              <th style={{ padding: "9px 10px", color: t.tableHeadText, fontWeight: 700, textAlign: "left" }}>
                {isTa ? "பாகை" : "Longitude"}
              </th>
              <th style={{ padding: "9px 10px", color: t.tableHeadText, fontWeight: 700, textAlign: "left" }}>
                {isTa ? "நட்சத்திரம்-பாதம்" : "Nakshatra - Pada"}
              </th>
              <th style={{ padding: "9px 10px", color: t.tableHeadText, fontWeight: 700, textAlign: "left" }}>
                {isTa ? "ராசி" : "Rasi"}
              </th>
            </tr>
          </thead>
          <tbody>
            {PLANET_ORDER.map((p, i) => {
              const info = planets[p];
              return (
                <tr key={p} style={{ background: i % 2 === 0 ? t.tableRowEven : t.tableRowOdd }}>
                  <td style={{ padding: "8px 10px", borderTop: `1px solid ${t.tableBorder}`, fontWeight: 700, color: t.labelColor }}>
                    {isTa ? PLANET_NAMES_TN[p] : PLANET_NAMES_EN[p]}
                  </td>
                  <td style={{ padding: "8px 10px", borderTop: `1px solid ${t.tableBorder}`, color: t.textColor }}>
                    {info.sid.toFixed(2)}°
                  </td>
                  <td style={{ padding: "8px 10px", borderTop: `1px solid ${t.tableBorder}`, color: t.textColor }}>
                    {isTa ? `${info.nakshatraTN} ${info.pada}` : `${info.nakshatraEN} ${info.pada}`}
                  </td>
                  <td style={{ padding: "8px 10px", borderTop: `1px solid ${t.tableBorder}`, color: t.textColor }}>
                    {isTa ? info.rasiTN : info.rasiEN}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ height: 2, margin: "18px 0", background: t.divider }} />

      {/* Two charts side by side */}
      <div
        className="vj-charts-row"
        style={{
          display: "flex",
          gap: 24,
          justifyContent: "center",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <SouthIndianGrid
          grid={rasiGrid}
          lagnaCell={lagnaCell}
          label={isTa ? "ராசி சக்கரம்" : "Rasi Chart"}
          isTa={isTa}
          t={t}
        />
        <SouthIndianGrid
          grid={navGrid}
          lagnaCell={lagnaCell}
          label={isTa ? "நவாம்சம் சக்கரம்" : "Navamsa Chart"}
          isTa={isTa}
          t={t}
        />
      </div>

      {/* Dasa footer */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <div
          className="vj-dasa-box"
          style={{
            background: t.dasaBoxBg,
            border: `1.5px solid ${t.dasaBoxBorder}`,
            borderRadius: 12,
            padding: "14px 36px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ fontSize: 13, color: t.dasaLabelColor, fontWeight: 700 }}>
            {isTa ? "ஜனன கால தசா இருப்பு" : "Birth Dasa Balance"}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: t.dasaValueColor, marginTop: 4 }}>
            {isTa
              ? `${PLANET_NAMES_TN[dasa.lord] || dasa.lord} தசா — மீதி ${dasa.remaining} ஆண்டு`
              : `${dasa.lord} Dasa — Balance ${dasa.remaining} Years`}
          </div>
        </div>
      </div>

      <button
        style={{
          display: "block",
          margin: "24px auto 0",
          background: "transparent",
          border: `1.5px solid ${t.resetBtnBorder}`,
          color: t.resetBtnText,
          padding: "9px 26px",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "background 0.15s ease",
        }}
        onClick={onReset}
      >
        {isTa ? "← புதிய ஜாதகம் கணி" : "← New Horoscope"}
      </button>
    </div>
  );
}

function InfoRow({
  label,
  value,
  isTa,
  t,
}: {
  label: string;
  value: ReactNode;
  isTa: boolean;
  t: any;
}) {
  return (
    <div className="vj-info-row" style={{ display: "flex", gap: 6, fontSize: 13.5 }}>
      <span className="vj-info-label" style={{ color: t.labelColor, fontWeight: 700, minWidth: isTa ? 90 : 105, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ color: t.gold, fontWeight: 700 }}>:</span>
      <span style={{ color: t.textColor, fontWeight: 500 }}>{value}</span>
    </div>
  );
}
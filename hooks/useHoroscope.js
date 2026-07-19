import { useState, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = 'https://api.vedicastroapi.com/v3-json';

const API_KEY =
  '6a0b4e5a-b8d5-5e1a-bd97-6128ad38d349';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDob(date) {
  return `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`;
}

function formatTob(date) {
  return `${String(date.hour).padStart(2, '0')}:${String(date.min).padStart(2, '0')}`;
}

function buildParams(input) {
  return {
    dob: formatDob(input),

    tob: formatTob(input),

    lat: input.lat,

    lon: input.lon,

    tz: input.tzone,

    lang: input.lang,

    api_key: API_KEY,
  };
}

function buildChartParams(input) {
  return {
    dob: formatDob(input),

    tob: formatTob(input),

    lat: input.lat,

    lon: input.lon,

    tz: input.tzone,

    lang: input.lang,

    api_key: API_KEY,
	
	div: 'D1',
	
	style: 'south'
  };
}

async function vGet(
  endpoint,
  params = {}
) {
  const query =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        query.append(
          key,
          String(value)
        );
      }
    }
  );

  const url = `${BASE_URL}${endpoint}?${query.toString()}`;

  console.log('REQUEST URL:', url);

  const res = await fetch(url, {
    method: 'GET',
  });

  if (!res.ok) {
    const text = await res
      .text()
      .catch(() => res.statusText);

    throw new Error(
      `[${endpoint}] HTTP ${res.status}: ${text}`
    );
  }
  if(url.includes('chart-image')) {
	return await res.text();
  } else {
	  let resjs = await res.json()
	  console.log(resjs)
	  return resjs;
  }
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

function formatDegree(deg) {
  const d = Math.floor(deg);

  const mFull = (deg - d) * 60;

  const m = Math.floor(mFull);

  return `${String(d).padStart(
    2,
    '0'
  )}°${String(m).padStart(2, '0')}′`;
}
function normalizePlanets(raw) {
  console.log('in normalizePlanets', raw);

  let arr = [];

  // response is numeric-keyed object
  if (
    raw?.response &&
    typeof raw.response === 'object' &&
    !Array.isArray(raw.response)
  ) {

    arr = Object.keys(raw.response)
      .filter(k => !isNaN(Number(k))) // only numeric keys
      .sort((a, b) => Number(a) - Number(b))
      .map(k => raw.response[k]); // FIXED

  } else if (Array.isArray(raw?.response)) {

    arr = raw.response;

  } else if (Array.isArray(raw)) {

    arr = raw;

  }

  console.log('arr', arr);

  return arr.map((p) => ({
    name: p.full_name ?? p.name ?? '',

    sign: p.zodiac ?? '',

    sign_lord: p.zodiac_lord ?? '',

    house: p.house ?? null,

    nakshatra: p.nakshatra ?? '',

    nakshatra_lord: p.nakshatra_lord ?? '',

    nakshatra_pada: p.nakshatra_pada ?? '',

    fullDegree: Number(
      p.global_degree ?? 0
    ),

    local_degree:
      p.local_degree != null
        ? `${Number(p.local_degree).toFixed(2)}°`
        : '—',

    is_retrograde:
      p.retro === true ||
      p.retro === 'true',

    lord_status:
      p.lord_status ?? '',

    basic_avastha:
      p.basic_avastha ?? '',
  }));
}
function normalizeAstroDetails(raw) {
	console.log('in normalizeAstroDetails', raw);
  const d =
    raw?.response ??
    raw ??
    {};

  return d;
}

function normalizeHousePredictions(raw) {
  console.log('in normalizeHousePredictions', raw);

  // raw is the array of 12 house-lord objects from /house_lord endpoint
  const arr = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.response)
    ? raw.response
    : [];

  return arr.map((h) => ({
    house:       h.current_house,           // 1–12
    location:    h.verbal_location ?? '',   // "1st lord is in the 6th house"
    zodiac:      h.current_zodiac  ?? '',
    lord:        h.lord_of_zodiac  ?? '',
    lordHouse:   h.lord_house_location ?? null,
    lordZodiac:  h.lord_zodiac_location ?? '',
    strength:    h.lord_strength   ?? '',   // "Exalted", "Neutral"
    prediction:  h.personalised_prediction ?? '',
  }));
}

function normalizePrediction(raw) {
	console.log('in normalizePrediction', raw);
  const r =
    raw?.response ??
    raw ??
    {};

  return (
    r?.bot_response ??
    r?.prediction ??
    r?.description ??
    ''
  );
}

function normalizeLucky(raw) {
	console.log('in normalizeLucky', raw);
  const r =
    raw?.response ??
    raw ??
    {};

  return {
    numbers:
      r?.lucky_num ??
      [],

    colors:
      r?.lucky_colors ??
      [],
	
	name_start_letter: r?.lucky_name_start ?? ''
  };
}

function normalizeDasha(raw) {
  console.log('in normalizeDasha', raw);

  // raw is the same planets object that also carries dasha keys
  const source = raw?.response ?? raw ?? {};

  function parseDashaString(str) {
    // "Ketu>Ma>Me" → ["Ketu", "Ma", "Me"]
    if (!str || typeof str !== 'string') return [];
    return str.split('>').map(s => s.trim()).filter(s => s && s !== 'undefined');
  }

  // Expand short codes to full planet names
  const SHORT_TO_FULL = {
    Su: 'Sun',   Mo: 'Moon',  Ma: 'Mars',   Me: 'Mercury',
    Ju: 'Jupiter', Ve: 'Venus', Sa: 'Saturn',
    Ra: 'Rahu',  Ke: 'Ketu',  As: 'Ascendant',
    // also handle full names passed through unchanged
    Sun: 'Sun', Moon: 'Moon', Mars: 'Mars', Mercury: 'Mercury',
    Jupiter: 'Jupiter', Venus: 'Venus', Saturn: 'Saturn',
    Rahu: 'Rahu', Ketu: 'Ketu',
  };

  function expand(code) {
    return SHORT_TO_FULL[code] ?? code;
  }

  const birthParts   = parseDashaString(source.birth_dasa);
  const currentParts = parseDashaString(source.current_dasa);

  const birthDate   = source.birth_dasa_time?.trim()   ?? '';
  const currentDate = source.current_dasa_time?.trim() ?? '';

  return {
    birth: birthParts.length > 0 ? {
      mahadasha:   expand(birthParts[0]) ?? '—',
      antardasha:  expand(birthParts[1]) ?? '—',
      pratyantara: expand(birthParts[2]) ?? '—',
      date:        birthDate,
      raw:         source.birth_dasa,
    } : null,

    current: currentParts.length > 0 ? {
      mahadasha:   expand(currentParts[0]) ?? '—',
      antardasha:  expand(currentParts[1]) ?? '—',
      pratyantara: expand(currentParts[2]) ?? '—',
      date:        currentDate,
      raw:         source.current_dasa,
    } : null,
  };
}

// ─── Main Hook ────────────────────────────────────────────────────────────────

export function useHoroscopeData() {
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const fetchHoroscope =
    useCallback(async (input) => {
      setLoading(true);
	  console.log('input', input)

      setError(null);

      try {
        const params =
          buildParams(input);
		const paramsChart = buildChartParams(input)

        const [
          planetsRaw,
          astroRaw,
          charsRaw,
          chartRaw,
        ] =
          await Promise.all([
            vGet(
              '/horoscope/planet-details',
              params
            ),

            vGet(
              '/extended-horoscope/extended-kundli-details',
              params
            ),

            vGet(
              '/horoscope/personal-characteristics',
              params
            ),


            vGet(
              '/horoscope/chart-image',
              paramsChart
            ),
          ]);
		  
		  console.log(planetsRaw, astroRaw, charsRaw, chartRaw)

        setData({
          planets:
            normalizePlanets(
              planetsRaw
            ),

          astroDetails:
            normalizeAstroDetails(
              astroRaw
            ),

          housePredictions: normalizeHousePredictions(charsRaw),
		  dashaData: normalizeDasha(planetsRaw),

			lucky: normalizeLucky(planetsRaw)
        });
      } catch (err) {
        console.log(
          'HOROSCOPE ERROR:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Unknown error'
        );
      } finally {
        setLoading(false);
      }
    }, []);

  return {
    data,
    loading,
    error,
    fetch: fetchHoroscope,
    setData,
  };
}
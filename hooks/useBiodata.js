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

    api_key: '6a0b4e5a-b8d5-5e1a-bd97-6128ad38d349',
  };
}

function buildChartParams(input, chartType) {
  return {
    dob: formatDob(input),

    tob: formatTob(input),

    lat: input.lat,

    lon: input.lon,

    tz: input.tzone,

    lang: input.lang ?? 'en',

    api_key: API_KEY,
	
	div: chartType,
	
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
	  //console.log(resjs)
	  return resjs;
  }
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

function normalizeDasha(raw) {
  //console.log('in normalizeDasha', raw);

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

function normalizeChartSvg(raw, theme = 'light') {
  if (!raw || typeof raw !== 'string') return '';

  const palette = theme === 'light'
    ? { ink: '#2b1810', label: '#9c7a2e', line: '#6b4a3a' }   // PDF report: dark ink + gold labels on cream
    : { ink: '#f0eaff', label: '#c8980f', line: '#4a3a6a' };  // App screen: light ink + gold labels on dark bg

  return raw
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n')
    .replace(/<\?xml[^?]*\?>/i, '')
    .replace(/<!DOCTYPE[^>]*>/i, '')

    // ── Theme colors ──
    .replace(/fill:#1F222E/gi, `fill:${palette.ink}`)
    .replace(/fill\s*:\s*#(?:9[0-9a-f]{5}|8[0-9a-f]{5}|a[0-9a-f]{5}|7[0-9a-f]{5})\b/gi, `fill:${palette.label}`)
    .replace(/fill\s*=\s*"#(?:9[0-9a-f]{5}|8[0-9a-f]{5}|a[0-9a-f]{5}|7[0-9a-f]{5})"/gi, `fill="${palette.label}"`)
    .replace(/fill\s*:\s*(?:gray|grey|darkgray|darkgrey|lightgray|lightgrey)\b/gi, `fill:${palette.label}`)
    .replace(/fill\s*=\s*"(?:gray|grey|darkgray|darkgrey|lightgray|lightgrey)"/gi, `fill="${palette.label}"`)
    .replace(/stroke:#000000/gi, `stroke:${palette.line}`)

    // ── Scale all SVG text dynamically ──
    .replace(/font-size:9\.799999999999999px/gi, 'font-size:20px')
    .replace(/font-size:12\.6px/gi, 'font-size:24px')

    .trim();
}

// Add normalizer
function normalizeKundli(raw) {
	console.log('in normalizeKundli', raw)
  const r = raw?.response ?? {};
  return {
    rasi: r.rasi ?? '',
    nakshatra: r.nakshatra ?? '',
    ascendantSign: r.ascendant_sign ?? ''
  };
}
// ─── Main Hook ────────────────────────────────────────────────────────────────

export function useBiodata() {
  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const fetchBiodata = useCallback(async (input, reportType = 'type1') => {
	  setLoading(true);
	  setError(null);
	  setData(null);
	  console.log('in fetchBiodata')

	  try {
		if (reportType === 'type2') {
		  // Type 2: only kundli details, no charts/dasha
		  const params = buildParams(input);
		  const kundliRaw = await vGet('/extended-horoscope/extended-kundli-details', params);
		  console.log('kundli', kundliRaw)
		  setData({
			dashaData: null,
			rasiChartSvg: null,
			navamsaChartSvg: null,
			kundliData: normalizeKundli(kundliRaw),
		  });
		  return;
		}

		// Type 1: full fetch including kundli
		const params = buildParams(input);
		const paramsChartD1 = buildChartParams(input, 'D1');
		const paramsChartD9 = buildChartParams(input, 'D9');

		const [planetsRaw, chartRasiRaw, chartAmsaRaw, kundliRaw] = await Promise.all([
		  vGet('/horoscope/planet-details', params),
		  vGet('/horoscope/divisional-charts', paramsChartD1),
		  vGet('/horoscope/divisional-charts', paramsChartD9),
		  vGet('/extended-horoscope/extended-kundli-details', params),
		]);
		
		console.log(chartRasiRaw, chartAmsaRaw);

		setData({
		  dashaData: normalizeDasha(planetsRaw),
		  rasiChart: chartRasiRaw.response,
		  navamsaChart: chartAmsaRaw.response,
		  kundliData: normalizeKundli(kundliRaw),
		});
	  } catch (err) {
		setData(null);
		setError(err instanceof Error ? err.message : 'Unknown error');
	  } finally {
		setLoading(false);
	  }
	}, []);

  return {
    data,
    loading,
    error,
    fetch: fetchBiodata,
  };
}
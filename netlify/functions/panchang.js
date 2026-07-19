const { generatePanchangHTML } = require('../shared/panchangLogic');
const { Redis } = require("@upstash/redis");

const ASTRO_BASE = 'https://api.vedicastroapi.com/v3-json';
const redis      = Redis.fromEnv();

// ── Chandrashtama Maps ────────────────────────────────────────────────────────

const CHANDRASHTAMA_MAPS = {
  ta: {
    0:  "உத்திரம் (2,3,4 பாதம்), அஸ்தம், சித்திரை (1,2 பாதம்) [கன்னி ராசி]",
    1:  "சித்திரை (3,4 பாதம்), சுவாதி, விசாகம் (1,2,3 பாதம்) [துலாம் ராசி]",
    2:  "விசாகம் (4ம் பாதம்), அனுஷம், கேட்டை [விருச்சிக ராசி]",
    3:  "மூலம், பூராடம், உத்திராடம் (1ம் பாதம்) [தனுசு ராசி]",
    4:  "உத்திராடம் (2,3,4 பாதம்), திருவோணம், அவிட்டம் (1,2 பாதம்) [மகர ராசி]",
    5:  "அவிட்டம் (3,4 பாதம்), சதயம், பூரட்டாதி (1,2,3 பாதம்) [கும்ப ராசி]",
    6:  "பூரட்டாதி (4ம் பாதம்), உத்திரட்டாதி, ரேவதி [மீன ராசி]",
    7:  "அஸ்வினி, பரணி, கார்த்திகை (1ம் பாதம்) [மேஷ ராசி]",
    8:  "கார்த்திகை (2,3,4 பாதம்), ரோகிணி, மிருகசீரிடம் (1,2 பாதம்) [ரிஷப ராசி]",
    9:  "மிருகசீரிடம் (3,4 பாதம்), திருவாதிரை, புனர்பூசம் (1,2,3 பாதம்) [மிதுன ராசி]",
    10: "புனர்பூசம் (4ம் பாதம்), பூசம், ஆயில்யம் [கடக ராசி]",
    11: "மகம், பூரம், உத்திரம் (1ம் பாதம்) [சிம்ம ராசி]"
  },
  en: {
    0:  "Uttara Phalguni (2,3,4), Hasta, Chitra (1,2) [Virgo Born]",
    1:  "Chitra (3,4), Swati, Vishakha (1,2,3) [Libra Born]",
    2:  "Vishakha (4), Anuradha, Jyeshta [Scorpio Born]",
    3:  "Mula, Purva Ashadha, Uttara Ashadha (1) [Sagittarius Born]",
    4:  "Uttara Ashadha (2,3,4), Shravana, Dhanishta (1,2) [Capricorn Born]",
    5:  "Dhanishta (3,4), Shatabhisha, Purva Bhadrapada (1,2,3) [Aquarius Born]",
    6:  "Purva Bhadrapada (4), Uttara Bhadrapada, Revati [Pisces Born]",
    7:  "Ashwini, Bharani, Krittika (1st Padam) [Aries Born]",
    8:  "Krittika (2,3,4), Rohini, Mrigashasra (1,2) [Taurus Born]",
    9:  "Mrigashasra (3,4), Ardra, Punarvasu (1,2,3) [Gemini Born]",
    10: "Punarvasu (4), Pushya, Ashlesha [Cancer Born]",
    11: "Magha, Purva Phalguni, Uttara Phalguni (1) [Leo Born]"
  }
};

// ── Gowri Panchangam Sequences ────────────────────────────────────────────────

const GOWRI_DAY_SEQUENCES = {
  Sunday:    ['Uthi', 'Amirdha', 'Rogam', 'Laabam', 'Soram', 'Sugam', 'Visham', 'Chorala'],
  Monday:    ['Amirdha', 'Soram', 'Sugam', 'Visham', 'Chorala', 'Uthi', 'Rogam', 'Laabam'],
  Tuesday:   ['Soram', 'Visham', 'Chorala', 'Uthi', 'Rogam', 'Laabam', 'Amirdha', 'Sugam'],
  Wednesday: ['Laabam', 'Sugam', 'Visham', 'Chorala', 'Uthi', 'Rogam', 'Amirdha', 'Soram'],
  Thursday:  ['Sugam', 'Chorala', 'Uthi', 'Rogam', 'Laabam', 'Amirdha', 'Soram', 'Visham'],
  Friday:    ['Chorala', 'Laabam', 'Amirdha', 'Soram', 'Visham', 'Sugam', 'Uthi', 'Rogam'],
  Saturday:  ['Rogam', 'Chorala', 'Uthi', 'Visham', 'Sugam', 'Amirdha', 'Soram', 'Laabam'],
};

const GOWRI_NIGHT_SEQUENCES = {
  Sunday:    ['Sugam', 'Soram', 'Uthi', 'Amirdha', 'Visham', 'Rogam', 'Laabam', 'Dhanam'],
  Monday:    ['Soram', 'Uthi', 'Amirdha', 'Visham', 'Rogam', 'Laabam', 'Dhanam', 'Sugam'],
  Tuesday:   ['Uthi', 'Amirdha', 'Visham', 'Rogam', 'Laabam', 'Dhanam', 'Sugam', 'Soram'],
  Wednesday: ['Amirdha', 'Visham', 'Rogam', 'Laabam', 'Dhanam', 'Sugam', 'Soram', 'Uthi'],
  Thursday:  ['Visham', 'Rogam', 'Laabam', 'Dhanam', 'Sugam', 'Soram', 'Uthi', 'Amirdha'],
  Friday:    ['Rogam', 'Laabam', 'Dhanam', 'Sugam', 'Soram', 'Uthi', 'Amirdha', 'Visham'],
  Saturday:  ['Laabam', 'Dhanam', 'Sugam', 'Soram', 'Uthi', 'Amirdha', 'Visham', 'Rogam'],
};

const GOWRI_NAMES_TA = {
  Uthi:    'உத்தி',
  Amirdha: 'அமிர்த',
  Rogam:   'ரோகம்',
  Laabam:  'லாபம்',
  Soram:   'சோரம்',
  Sugam:   'சுகம்',
  Visham:  'விஷம்',
  Chorala: 'சோரளா',
  Dhanam:  'தனம்',
};

// ── helpers ───────────────────────────────────────────────────────────────────

const astroGet = async (endpoint, params) => {
  const query = new URLSearchParams(params).toString();
  const res   = await fetch(`${ASTRO_BASE}/${endpoint}?${query}`, { method: 'GET' });
  if (!res.ok) throw new Error(`${endpoint} failed: ${res.status}`);
  return res.json();
};

const geocodePlace = async (place) => {
  const url  = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`;
  const res  = await fetch(url, { headers: { 'User-Agent': 'AstroAPI/1.0' } });
  const data = await res.json();
  if (!data?.length) throw new Error(`Cannot geocode place: "${place}"`);
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
};

const calculateTamilNallaNeram = (dayOfWeekName) => {
  const timings = {
    Sunday:    { morning: ["06:30 AM", "07:30 AM"], evening: ["03:00 PM", "04:00 PM"] },
    Monday:    { morning: ["09:30 AM", "10:30 AM"], evening: ["04:30 PM", "05:30 PM"] },
    Tuesday:   { morning: ["10:30 AM", "11:30 AM"], evening: ["03:00 PM", "04:00 PM"] },
    Wednesday: { morning: ["07:30 AM", "08:30 AM"], evening: ["12:00 PM", "01:00 PM"] },
    Thursday:  { morning: ["10:30 AM", "11:30 AM"], evening: ["01:30 PM", "02:30 PM"] },
    Friday:    { morning: ["09:00 AM", "10:00 AM"], evening: ["05:00 PM", "06:00 PM"] },
    Saturday:  { morning: ["07:30 AM", "08:30 AM"], evening: ["04:30 PM", "05:30 PM"] },
  };
  const key = Object.keys(timings).find(k =>
    dayOfWeekName.toLowerCase().includes(k.toLowerCase())
  ) || 'Sunday';
  const formatRange = ([start, end]) => `${start} - ${end}`;
  return {
    morning: [formatRange(timings[key].morning)],
    evening: [formatRange(timings[key].evening)],
  };
};

const calculateOfflineChandrashtamaStars = (input, langCode) => {
  try {
    const { day, month, year, hour, min } = input;
    const isTamil = langCode === 'ta';

    const targetDate = new Date(year, month - 1, day, hour || 12, min || 0);

    const epochTime  = targetDate.getTime();
    const julianDate = (epochTime / 86400000) + 2440587.5;
    const d          = julianDate - 2451545.0;

    const L = 218.316 + 13.176396 * d;
    const M = 134.963 + 13.064993 * d;

    let tropicalLong = L + 6.289 * Math.sin((M * Math.PI) / 180);
    const ayanamsa   = 23.85 + ((targetDate.getFullYear() - 1950) * 0.01397);

    let siderealLong = (tropicalLong - ayanamsa) % 360;
    if (siderealLong < 0) siderealLong += 360;

    const currentRasiIdx = Math.floor(siderealLong / 30) % 12;

    const currentMap = CHANDRASHTAMA_MAPS[langCode] || CHANDRASHTAMA_MAPS['en'];
    return currentMap[currentRasiIdx] ||
      (isTamil ? "கணக்கிட முடியவில்லை" : "Calculation Error");

  } catch (error) {
    console.error("Offline calculation error:", error);
    return langCode === 'ta' ? "கணிப்பதில் பிழை" : "Calculation Error";
  }
};

/**
 * Parses time strings like "06:12 AM" or "18:24" into absolute minutes from midnight
 */
const parseTimeToMinutes = (timeString) => {
  if (!timeString) return 360; // fallback to 6:00 AM
  const cleaned = timeString.trim();
  const match = cleaned.match(/^(\d+):(\d+)\s*(AM|PM)?$/i);
  if (!match) {
    const parts = cleaned.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3];

  if (ampm) {
    if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
  }
  return hours * 60 + minutes;
};

/**
 * Utility to stringify fractional minutes back into human-readable text blocks
 */
const minutesToTimeString = (totalMinutes) => {
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const mins = Math.floor(totalMinutes % 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(displayHours).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`;
};

/**
 * Core dynamic calculator parsing the day duration into 8 specific slices
 */
const calculateDynamicGowriNeram = (sunriseStr, sunsetStr, dayOfWeekName, langCode) => {
  const sunriseMin = parseTimeToMinutes(sunriseStr);
  const sunsetMin = parseTimeToMinutes(sunsetStr);
  const totalDaylight = sunsetMin - sunriseMin;
  const totalNighttime = (1440 - sunsetMin) + sunriseMin; // Wraps into next day sunrise

  const dayInterval = totalDaylight / 8;
  const nightInterval = totalNighttime / 8;

  const key = Object.keys(GOWRI_DAY_SEQUENCES).find(k => 
    dayOfWeekName.toLowerCase().includes(k.toLowerCase())
  ) || "Sunday";
  const isTamil = langCode === 'ta';

  // 8 Day Slots
  const daySlots = GOWRI_DAY_SEQUENCES[key].map((name, i) => {
    const start = sunriseMin + (i * dayInterval);
    const end = sunriseMin + ((i + 1) * dayInterval);
    return {
      name: isTamil ? (GOWRI_NAMES_TA[name] || name) : name,
      timeRange: `${minutesToTimeString(start)} - ${minutesToTimeString(end)}`,
      status: ['Amirdha', 'Uthi', 'Laabam', 'Sugam'].includes(name) ? 'Good' : 'Bad'
    };
  });

  // 8 Night Slots 
  const nightSlots = GOWRI_NIGHT_SEQUENCES[key].map((name, i) => {
    const start = sunsetMin + (i * nightInterval);
    const end = sunsetMin + ((i + 1) * nightInterval);
    return {
      name: isTamil ? (GOWRI_NAMES_TA[name] || name) : name,
      timeRange: `${minutesToTimeString(start)} - ${minutesToTimeString(end)}`,
      status: ['Amirdha', 'Uthi', 'Laabam', 'Sugam'].includes(name) ? 'Good' : 'Bad'
    };
  });

  return { daySlots, nightSlots };
};

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-secret',
};

// ── handler ───────────────────────────────────────────────────────────────────

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: cors,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const totalCalls = await redis.incr("panchang:call_count");
  await redis.lpush("panchang:call_log", new Date().toISOString());

  const clientSecret = event.headers['x-api-secret'];
  if (clientSecret !== process.env.API_SECRET) {
    return {
      statusCode: 401,
      headers: cors,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ error: 'Invalid JSON body' }),
    };
  }

  const required = ['day', 'month', 'year', 'hour', 'min', 'tzone', 'place'];
  const missing  = required.filter(k => body[k] === undefined);
  if (missing.length) {
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ error: `Missing fields: ${missing.join(', ')}` }),
    };
  }

  let coords;
  try {
    coords = await geocodePlace(body.place);
  } catch (err) {
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ error: err.message }),
    };
  }

  const lang = body.lang ?? 'ta';

  const input = {
    day:   body.day,
    month: body.month,
    year:  body.year,
    hour:  String(body.hour).padStart(2, '0'),
    min:   String(body.min).padStart(2, '0'),
    lat:   coords.lat,
    lon:   coords.lon,
    tzone: body.tzone ?? 5.5,
    lang,
  };

  try {
    const { day, month, year, hour, min, tzone, lat, lon } = input;
    const paddedDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    const paddedTime = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

    const baseParams = {
      lat,
      lon,
      tz:      tzone,
      api_key: '6a0b4e5a-b8d5-5e1a-bd97-6128ad38d349',
      lang
    };

    const panchangParams = { ...baseParams, date: paddedDate, time: paddedTime };
    const planetParams   = { ...baseParams, dob:  paddedDate, tob:  paddedTime };

    const current          = new Date(year, month - 1, day);
    const dayNameInEnglish = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(current);
    const standardNallaNeram = calculateTamilNallaNeram(dayNameInEnglish);

    // Run panchang + planets in parallel
    const [panToday, planToday] = await Promise.all([
      astroGet('panchang/panchang',        panchangParams),
      astroGet('horoscope/planet-details', planetParams),
    ]);

    console.log({ panchang: panToday, planets: planToday });

    // Calculate dynamic Gowri Nalla Neram intervals using live API metrics
    const apiSunrise = panToday?.response?.sunrise || "06:00 AM";
    const apiSunset  = panToday?.response?.sunset || "06:30 PM";
    const computedGowriBlocks = calculateDynamicGowriNeram(apiSunrise, apiSunset, dayNameInEnglish, lang);

    // Offline chandrashtama calculation — mirrors usePanchang.js exactly
    const derivedChandrashtamaStars = calculateOfflineChandrashtamaStars(input, lang);

    const dataObj = {
      panchang:          panToday,
      planets:           planToday,
      gowriNallaNeram:   computedGowriBlocks,
      chandrashtama:     derivedChandrashtamaStars,
      standardNallaNeram,
    };

    const html = generatePanchangHTML(dataObj, lang);

    return {
      statusCode: 200,
      headers: { ...cors, 'Content-Type': 'text/html; charset=utf-8' },
      body: html,
    };

  } catch (err) {
    console.error('Error fetching panchang data:', err);
    return {
      statusCode: 502,
      headers: cors,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
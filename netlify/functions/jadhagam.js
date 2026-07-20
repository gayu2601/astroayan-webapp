//jadhagam.js
import { generateReportHTML } from '../shared/reportLogic.js';
import { Redis } from "@upstash/redis";

const ASTRO_BASE = 'https://api.vedicastroapi.com/v3-json';
const redis = Redis.fromEnv();

// ── helpers ───────────────────────────────────────────────────────────────────

const astroGet = async (endpoint, params) => {
  console.log(params);
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${ASTRO_BASE}/${endpoint}?${query}`, { method: 'GET' });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`${endpoint} failed: ${res.status} — ${errBody}`);
  }
  return res.json();
};

const geocodePlace = async (place) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`;
  const res  = await fetch(url, { headers: { 'User-Agent': 'AstroAPI/1.0' } });
  const data = await res.json();
  if (!data?.length) throw new Error(`Cannot geocode place: "${place}"`);
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
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

  const totalCalls = await redis.incr("jadhagam:call_count");
  await redis.lpush("jadhagam:call_log", new Date().toISOString());

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

  const required = ['name', 'dob', 'time', 'place'];
  const missing  = required.filter(k => !body[k]);
  if (missing.length) {
    return {
      statusCode: 400,
      headers: cors,
      body: JSON.stringify({ error: `Missing fields: ${missing.join(', ')}` }),
    };
  }

  try {
    const { name, fatherName = '', motherName = '', dob, time, place } = body;
    const lang = body.lang ?? 'ta';

    const [year, month, day] = dob.split('-').map(Number);
    const [hour, min]        = time.split(':').map(Number);

    const { lat, lon } = await geocodePlace(place);

    const pad = (n) => String(n).padStart(2, '0');

    const birthParams = {
      api_key: '6a0b4e5a-b8d5-5e1a-bd97-6128ad38d349',
      dob:     `${pad(day)}/${pad(month)}/${year}`,
      tob:     `${pad(hour)}:${pad(min)}`,
      lat,
      lon,
      tz:      5.5,
      lang
    };

    const [planets, astro, d1, d9, dashaList, currentDasha] = await Promise.all([
      astroGet('horoscope/planet-details',                birthParams),
      astroGet('extended-horoscope/extended-kundli-details', birthParams),
      astroGet('horoscope/divisional-charts',             { ...birthParams, div: 'D1' }),
      astroGet('horoscope/divisional-charts',             { ...birthParams, div: 'D9' }),
      astroGet('dashas/maha-dasha',                       birthParams),
      astroGet('dashas/current-mahadasha',                birthParams),
    ]);

    console.log(planets, astro, d1, d9, dashaList, currentDasha);

    // Format nadappuDasa based on lang
    const nadappuDasa = lang === 'ta'
      ? {
          text:    `${currentDasha?.response?.order_of_dashas?.major?.name} தசா / ${currentDasha?.response?.order_of_dashas?.minor?.name} புக்தி`,
          endDate: currentDasha?.response?.order_of_dashas?.minor?.end,
        }
      : {
          text:    `${currentDasha?.response?.order_of_dashas?.major?.name} Dasha / ${currentDasha?.response?.order_of_dashas?.minor?.name} Bhukthi`,
          endDate: currentDasha?.response?.order_of_dashas?.minor?.end,
        };

    console.log('nadappuDasa', nadappuDasa);

    const reportPayload = {
      name, fatherName, motherName, birthParams, place,
      planets:      planets.response,
      astro:        astro.response,
      d1Chart:      d1.response,
      d9Chart:      d9.response,
      dashaBalance: dashaList?.response?.dasha_remaining_at_birth,
      dashaPlanet:  dashaList?.response?.mahadasha[0],
      nadappuDasa,
    };

    console.log('reportPayload', reportPayload);

    const html = generateReportHTML(reportPayload, lang);

    return {
      statusCode: 200,
      headers: { ...cors, 'Content-Type': 'text/html; charset=utf-8' },
      body: html,
    };

  } catch (err) {
    console.error('Error generating jadhagam:', err);
    return {
      statusCode: 502,
      headers: cors,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
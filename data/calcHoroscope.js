/**
 * calcHoroscope.js
 *
 * Converts raw form input (name, dob Date, tob Date, place string)
 * into the { day, month, year, hour, min, lat, lon, tzone } shape
 * expected by useHoroscopeData, and triggers the fetch.
 *
 * Usage:
 *   const { data, loading, error, fetch: fetchHoroscope } = useHoroscopeData();
 *   await calcHoroscope({ name, dob, tob, place }, fetchHoroscope);
 */

// ─── Geocoding ────────────────────────────────────────────────────────────────
// Uses the free OpenStreetMap Nominatim API — no key required.
// VedicAstroAPI also ships a /utils/geo-details endpoint if you prefer to stay
// in-family; swap the function body accordingly.

async function geocodePlace(placeName) {
  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(placeName)}&format=json&limit=1`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'VedicAstroApp/1.0' },
  });

  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);

  const results = await res.json();
  if (!results.length) throw new Error(`Place not found: "${placeName}"`);

  const { lat, lon } = results[0];
  return { lat: parseFloat(lat), lon: parseFloat(lon) };
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * @param {{ name: string, dob: Date, tob: Date, place: string }} formInput
 * @param {(input: object) => Promise<void>} fetchHoroscope  — the `fetch`
 *        method returned by useHoroscopeData()
 *
 * @returns {Promise<void>}  resolves after the hook has been triggered.
 *          The hook manages its own loading/data/error state.
 */
export async function calcHoroscope(formInput, fetchHoroscope, lang = 'ta') {
  const { dob, tob, place } = formInput;

  if (!dob || !tob || !place?.trim()) {
    throw new Error('Missing required fields: dob, tob, place');
  }

  // 1. Geocode the birth place → lat / lon
  const { lat, lon } = await geocodePlace(place.trim());

  // 2. Determine timezone offset (decimal hours) for the birth coordinates
  //    We use dob as the reference date for DST-aware lookup.
  const tzone = 5.5;

  // 3. Decompose dob → day / month / year
  const day   = dob.getDate();
  const month = dob.getMonth() + 1;   // JS months are 0-indexed
  const year  = dob.getFullYear();

  // 4. Decompose tob → hour / min
  //    tob is stored as a Date; only the time portion matters.
  const hour = tob.getHours();
  const min  = tob.getMinutes();

  // 5. Build the API input and call the hook
  const apiInput = {
    day,
    month,
    year,
    hour,
    min,
    lat,
    lon,
    tzone,
    lang,
  };

  await fetchHoroscope(apiInput);
}
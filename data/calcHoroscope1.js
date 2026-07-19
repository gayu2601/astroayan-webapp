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
 * @param {(input: object) => Promise<void>} generateAndPrint  — the `fetch`
 *        method returned by useHoroscopeData()
 *
 * @returns {Promise<void>}  resolves after the hook has been triggered.
 *          The hook manages its own loading/data/error state.
 */
// In calcHoroscope1, just pass the raw form values through
export async function calcHoroscope1(formInput, generateAndPrint, lang = 'ta') {
  const { name, fatherName, motherName, dob, tob, place } = formInput;

  const dobStr = dob.toISOString().split('T')[0]; // "YYYY-MM-DD"
  const hours = String(tob.getHours()).padStart(2, '0');
  const mins  = String(tob.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${mins}`;             // "HH:MM"

  await generateAndPrint({
    name,
    fatherName,
    motherName,
    dob: dobStr,
    time: timeStr,
    place,
  }, lang);
}
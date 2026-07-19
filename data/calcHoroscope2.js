/**
 * calcHoroscope2.js
 *
 * Converts raw form input into the shape expected by useBookHoroscope,
 * calls generateReportData, and returns the reportPayload.
 */

// ─── Geocoding ────────────────────────────────────────────────────────────────
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
 * @param {{ name: string, fatherName: string, motherName: string,
 *           dob: Date, tob: Date, place: string }} formInput
 * @param {(formData: object, lang: string) => Promise<object|undefined>} generateReportData
 *        — the function returned by useBookHoroscope()
 * @param {string} lang — 'ta' or 'en'
 *
 * @returns {Promise<object|undefined>} reportPayload ready for BookReportScreen,
 *          or undefined if the API call failed.
 */
export async function calcHoroscope2(formInput, generateReportData, lang = 'ta') {
  const { name, fatherName, motherName, dob, tob, place } = formInput;

  // dob / tob may already be ISO strings (from a DatePicker) or Date objects
  const dobDate = dob instanceof Date ? dob : new Date(dob);
  const tobDate = tob instanceof Date ? tob : new Date(tob);

  const dobStr = dobDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
  const hours = String(tobDate.getHours()).padStart(2, '0');
  const mins = String(tobDate.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${mins}`; // "HH:MM"

  return await generateReportData(
    {
      name,
      fatherName,
      motherName,
      dob: dobStr,
      time: timeStr,
      place,
    },
    lang
  );
}
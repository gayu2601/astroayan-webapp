// ─── Bhava Chakram (Sripati) cusp calculator ───────────────────────────────
//
// We do NOT recompute the Ascendant here — /horoscope/planet-details already
// returns a precise sidereal Ascendant ("As" entry, global_degree) and the
// exact Lahiri ayanamsa used (response.panchang.ayanamsa). We only need to
// derive the 10th cusp (MC) astronomically, then trisect the four quadrants.

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function normalize360(deg) {
  return ((deg % 360) + 360) % 360;
}

function toJulianDay({ year, month, day, hour, min, tzone }) {
  // Convert local clock time -> UT using the numeric tzone offset (e.g. 5.5 for IST)
  let hourUT = hour + min / 60 - tzone;
  let d = day;
  if (hourUT < 0) {
    hourUT += 24;
    d -= 1;
  } else if (hourUT >= 24) {
    hourUT -= 24;
    d += 1;
  }

  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD0 = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
  return JD0 + hourUT / 24;
}

function greenwichSiderealTimeHours(jd) {
  const T = (jd - 2451545.0) / 36525;
  let gst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  return normalize360(gst) / 15; // hours
}

function obliquityOfEcliptic(jd) {
  const T = (jd - 2451545.0) / 36525;
  return (
    23 +
    26 / 60 +
    21.448 / 3600 -
    (46.815 / 3600) * T -
    (0.00059 / 3600) * T * T +
    (0.001813 / 3600) * T * T * T
  );
}

function mcFromRamc(ramcDeg, oblDeg) {
  const ramc = ramcDeg * DEG;
  const obl = oblDeg * DEG;
  const mc = Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(obl)) * RAD;
  return normalize360(mc);
}

function trisect(fromDeg, toDeg) {
  let arc = toDeg - fromDeg;
  if (arc < 0) arc += 360;
  return [normalize360(fromDeg + arc / 3), normalize360(fromDeg + (2 * arc) / 3)];
}

/**
 * @param {object} params
 * @param {number} params.year
 * @param {number} params.month
 * @param {number} params.day
 * @param {number} params.hour
 * @param {number} params.min
 * @param {number} params.lon        birthplace longitude, +E
 * @param {number} params.tzone      numeric UTC offset, e.g. 5.5 for IST
 * @param {number} params.ayanamsa   Lahiri ayanamsa (deg) — from response.panchang.ayanamsa
 * @param {number} params.ascendantDegree  sidereal Ascendant longitude (deg) — from the "As" planet entry
 * @returns {number[] | null} 12 Bhava Madhya (cusp) longitudes, index 0 = house 1,
 *   or null if the inputs aren't ready yet (see guard below).
 */
export function computeBhavaCusps({ year, month, day, hour, min, lon, tzone, ayanamsa, ascendantDegree }) {
  // Guard: every one of these must be a real finite number before we anchor
  // house 1 to it. If ascendantDegree (or anything else) comes in as
  // undefined/NaN — e.g. the "As" planet entry hasn't loaded yet, or a
  // caller does `asPlanet?.fullDegree || 0` — silently treating that as 0
  // means house 1 gets anchored to 0° (Aries), not the real lagna. That is
  // almost certainly the source of the "always starts at Mesham" bug:
  // the chart renders once with defaults before the real Ascendant arrives,
  // and nothing here used to stop it from doing so.
  const inputs = { year, month, day, hour, min, lon, tzone, ayanamsa, ascendantDegree };
  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      console.warn(`computeBhavaCusps: missing/invalid "${key}" (${value}) — refusing to anchor to a default.`);
      return null;
    }
  }

  const jd = toJulianDay({ year, month, day, hour, min, tzone });
  const gstHours = greenwichSiderealTimeHours(jd);
  const lstHours = normalize360(gstHours * 15 + lon) / 15;
  const ramc = normalize360(lstHours * 15);
  const obliquity = obliquityOfEcliptic(jd);

  const mcTropical = mcFromRamc(ramc, obliquity);
  const cusp10 = normalize360(mcTropical - ayanamsa);

  const cusp1 = normalize360(ascendantDegree); // already sidereal, from the API
  const cusp7 = normalize360(cusp1 + 180);
  const cusp4 = normalize360(cusp10 + 180);

  const cusps = new Array(12).fill(0);
  cusps[0] = cusp1;
  cusps[3] = cusp4;
  cusps[6] = cusp7;
  cusps[9] = cusp10;

  [cusps[1], cusps[2]] = trisect(cusp1, cusp4);
  [cusps[4], cusps[5]] = trisect(cusp4, cusp7);
  [cusps[7], cusps[8]] = trisect(cusp7, cusp10);
  [cusps[10], cusps[11]] = trisect(cusp10, cusp1);

  return cusps;
}
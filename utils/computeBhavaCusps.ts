/**
 * Computes the 12 Sripati Bhava Madhya (cusp) longitudes for a birth chart.
 * Runs server-side (Node) — do NOT run this in the RN/web client.
 *
 * Usage:
 *   const cusps = computeBhavaCusps({
 *     dob: '1990-05-14',       // YYYY-MM-DD, local (IST) calendar date
 *     tob: '14:32:00',         // HH:mm:ss, local (IST) clock time
 *     lat: 13.0827,            // birthplace latitude, degrees (+N)
 *     lng: 80.2707,            // birthplace longitude, degrees (+E)
 *     ayanamsa: 23.599288692335666, // Lahiri ayanamsa at birth moment —
 *                                    // reuse the SAME value your ephemeris
 *                                    // API returned for planets, so the
 *                                    // cusps and planets are consistent.
 *   });
 *   // cusps[0] = house 1 Bhava Madhya, cusps[9] = house 10 Bhava Madhya, etc.
 */

interface BhavaCuspInput {
  dob: string;       // 'YYYY-MM-DD'
  tob: string;        // 'HH:mm:ss' (IST, i.e. UTC+5:30)
  lat: number;
  lng: number;
  ayanamsa: number;   // degrees, Lahiri, at birth moment
}

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function toJulianDay(dob: string, tob: string): number {
  const [y, m, d] = dob.split('-').map(Number);
  const [hh, mm, ss] = tob.split(':').map(Number);

  // Convert IST clock time -> UT
  let hourUT = hh + mm / 60 + (ss || 0) / 3600 - 5.5;
  let dayAdj = d;
  let monthAdj = m;
  let yearAdj = y;
  if (hourUT < 0) {
    hourUT += 24;
    dayAdj -= 1; // borrow a day when IST->UT crosses midnight backward
  }

  let yy = yearAdj;
  let mo = monthAdj;
  if (mo <= 2) {
    yy -= 1;
    mo += 12;
  }
  const A = Math.floor(yy / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD0 = Math.floor(365.25 * (yy + 4716)) + Math.floor(30.6001 * (mo + 1)) + dayAdj + B - 1524.5;
  return JD0 + hourUT / 24;
}

function greenwichSiderealTimeHours(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  let gst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000;
  gst = ((gst % 360) + 360) % 360;
  return gst / 15; // hours
}

function obliquityOfEcliptic(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  // Mean obliquity, IAU formula (arcseconds precision is overkill here)
  const eps =
    23 +
    26 / 60 +
    21.448 / 3600 -
    (46.815 / 3600) * T -
    (0.00059 / 3600) * T * T +
    (0.001813 / 3600) * T * T * T;
  return eps; // degrees
}

function normalize360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Tropical MC from RAMC + obliquity, correctly quadrant-resolved. */
function mcFromRamc(ramcDeg: number, oblDeg: number): number {
  const ramc = ramcDeg * DEG;
  const obl = oblDeg * DEG;
  let mc = Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(obl)) * RAD;
  return normalize360(mc);
}

export function computeBhavaCusps(input: BhavaCuspInput): number[] {
  const { dob, tob, lat, lng, ayanamsa } = input;

  const jd = toJulianDay(dob, tob);
  const gstHours = greenwichSiderealTimeHours(jd);
  const lstHours = normalize360(gstHours * 15 + lng) / 15; // east longitude positive
  const ramc = normalize360(lstHours * 15);
  const obliquity = obliquityOfEcliptic(jd);

  // Tropical MC, then sidereal (Lahiri) MC
  const mcTropical = mcFromRamc(ramc, obliquity);
  const cusp10 = normalize360(mcTropical - ayanamsa);

  // Tropical Ascendant from RAMC + obliquity + geographic latitude,
  // then converted to sidereal — needed since we can't assume the
  // caller already has the precise sidereal Ascendant on hand here.
  const ramcRad = ramc * DEG;
  const oblRad = obliquity * DEG;
  const latRad = lat * DEG;
  const ascTropicalRad = Math.atan2(
    Math.cos(ramcRad),
    -Math.sin(ramcRad) * Math.cos(oblRad) - Math.tan(latRad) * Math.sin(oblRad)
  );
  let ascTropical = normalize360(ascTropicalRad * RAD);
  // atan2 form above yields the ecliptic longitude of the Asc directly in
  // most references; normalize into 0-360 and it's already quadrant-correct.
  const cusp1 = normalize360(ascTropical - ayanamsa);

  const cusp7 = normalize360(cusp1 + 180);
  const cusp4 = normalize360(cusp10 + 180);

  const cusps = new Array(12).fill(0);
  cusps[0] = cusp1;   // house 1
  cusps[3] = cusp4;   // house 4
  cusps[6] = cusp7;   // house 7
  cusps[9] = cusp10;  // house 10

  const trisect = (fromDeg: number, toDeg: number): [number, number] => {
    let arc = toDeg - fromDeg;
    if (arc < 0) arc += 360;
    return [normalize360(fromDeg + arc / 3), normalize360(fromDeg + (2 * arc) / 3)];
  };

  [cusps[1], cusps[2]] = trisect(cusp1, cusp4);     // houses 2, 3
  [cusps[4], cusps[5]] = trisect(cusp4, cusp7);     // houses 5, 6
  [cusps[7], cusps[8]] = trisect(cusp7, cusp10);    // houses 8, 9
  [cusps[10], cusps[11]] = trisect(cusp10, cusp1);  // houses 11, 12

  return cusps;
}
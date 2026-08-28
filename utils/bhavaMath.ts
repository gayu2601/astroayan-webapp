/**
 * Sripati Bhava Chakram — client-side helpers.
 *
 * IMPORTANT: this file only buckets planets into houses given 12 already-
 * computed Bhava Madhya (cusp) longitudes. It does NOT compute the cusps
 * themselves — that requires RAMC / sidereal time / obliquity, which
 * should be computed once on the backend (see backend/computeBhavaCusps.ts)
 * and sent down as `bhavaChakra.cusps` in the API payload.
 */

interface PlanetInput {
  name: string;
  fullDegree: number | string;
}

interface BhavaEntry {
  name: string;
  degree: string;
}

/** Midpoint between two longitudes on a 360° circle, going the "short way"
 *  forward from a to b (handles the 360°→0° wraparound). */
function circularMidpoint(a: number, b: number): number {
  let diff = b - a;
  if (diff < 0) diff += 360;
  return (a + diff / 2) % 360;
}

/** Given 12 Bhava Madhya longitudes (in house order 1..12), returns the
 *  12 Bhava Sandhi boundary ranges as [start, end) pairs. Each house's
 *  range is the midpoint between it and its neighboring cusps. */
export function getBhavaBoundaries(cusps: number[]): { start: number; end: number }[] {
  return cusps.map((c, i) => {
    const prev = cusps[(i + 11) % 12];
    const next = cusps[(i + 1) % 12];
    return { start: circularMidpoint(prev, c), end: circularMidpoint(c, next) };
  });
}

/** True if `deg` falls within [start, end), correctly handling ranges
 *  that wrap past 360°/0°. */
export function degreeInRange(deg: number, start: number, end: number): boolean {
  if (start <= end) return deg >= start && deg < end;
  return deg >= start || deg < end;
}

/** Buckets planets into their Bhava (cusp-based) house, 1-indexed.
 *  Returns a map of house number -> planets in that house. */
export function getBhavaByHouse(
  planets: PlanetInput[],
  cusps: number[] | undefined
): Record<number, BhavaEntry[]> {
  const map: Record<number, BhavaEntry[]> = {};
  if (!Array.isArray(planets) || !cusps || cusps.length !== 12) return map;

  const boundaries = getBhavaBoundaries(cusps);

  planets.forEach((p) => {
    const deg = typeof p.fullDegree === 'number' ? p.fullDegree : parseFloat(p.fullDegree);
    if (isNaN(deg)) return;
    const houseIdx = boundaries.findIndex((b) => degreeInRange(deg, b.start, b.end));
    if (houseIdx === -1) return;
    const house = houseIdx + 1;
    if (!map[house]) map[house] = [];
    map[house].push({ name: p.name, degree: deg.toFixed(1) });
  });

  return map;
}
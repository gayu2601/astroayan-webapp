import React, { useState, useMemo } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import {
  Calendar,
  Info,
  Sparkles,
  Coins,
  Clock,
  Briefcase,
  TrendingUp,
  ShoppingBag,
  Store,
  Search,
  XCircle,
  Plane,
  Ban,
} from "lucide-react";
import ScreenGuard from "./ScreenGuard";

interface SubhaMuhurthamTabProps {
  isLight?: boolean;
}

interface MuhurthamDate {
  date: string;
  dayTa: string;
  dayEn: string;
}

interface MonthMuhurtham {
  monthTa: string;
  monthEn: string;
  dates: MuhurthamDate[];
}

const MUHURTHAM_DATA: MonthMuhurtham[] = [
  {
    monthTa: "ஜூலை 2026",
    monthEn: "July 2026",
    dates: [
      { date: "02", dayTa: "வியாழன்", dayEn: "Thursday" },
      { date: "05", dayTa: "ஞாயிறு", dayEn: "Sunday" },
      { date: "12", dayTa: "ஞாயிறு", dayEn: "Sunday" },
    ],
  },
  {
    monthTa: "ஆகஸ்ட் 2026",
    monthEn: "August 2026",
    dates: [
      { date: "23", dayTa: "ஞாயிறு", dayEn: "Sunday" },
      { date: "30", dayTa: "ஞாயிறு", dayEn: "Sunday" },
      { date: "31", dayTa: "திங்கள்", dayEn: "Monday" },
    ],
  },
  {
    monthTa: "செப்டம்பர் 2026",
    monthEn: "September 2026",
    dates: [
      { date: "07", dayTa: "திங்கள்", dayEn: "Monday" },
      { date: "13", dayTa: "ஞாயிறு", dayEn: "Sunday" },
      { date: "17", dayTa: "வியாழன்", dayEn: "Thursday" },
    ],
  },
  {
    monthTa: "அக்டோபர் 2026",
    monthEn: "October 2026",
    dates: [
      { date: "25", dayTa: "ஞாயிறு", dayEn: "Sunday" },
      { date: "30", dayTa: "வெள்ளி", dayEn: "Friday" },
    ],
  },
  {
    monthTa: "நவம்பர் 2026",
    monthEn: "November 2026",
    dates: [
      { date: "01", dayTa: "ஞாயிறு", dayEn: "Sunday" },
      { date: "11", dayTa: "புதன்", dayEn: "Wednesday" },
      { date: "13", dayTa: "வெள்ளி", dayEn: "Friday" },
      { date: "15", dayTa: "ஞாயிறு", dayEn: "Sunday" },
      { date: "16", dayTa: "திங்கள்", dayEn: "Monday" },
      { date: "20", dayTa: "வெள்ளி", dayEn: "Friday" },
      { date: "29", dayTa: "ஞாயிறு", dayEn: "Sunday" },
    ],
  },
  {
    monthTa: "டிசம்பர் 2026",
    monthEn: "December 2026",
    dates: [
      { date: "04", dayTa: "வெள்ளி", dayEn: "Friday" },
      { date: "06", dayTa: "ஞாயிறு", dayEn: "Sunday" },
      { date: "10", dayTa: "வியாழன்", dayEn: "Thursday" },
      { date: "13", dayTa: "ஞாயிறு", dayEn: "Sunday" },
      { date: "14", dayTa: "திங்கள்", dayEn: "Monday" },
    ],
  },
];

const ALL_NAKSHATRAS: Record<number, { tamil: string; english: string }> = {
  0: { tamil: "அஸ்வினி", english: "Ashwini" },
  1: { tamil: "பரணி", english: "Bharani" },
  2: { tamil: "கார்த்திகை", english: "Karthigai" },
  3: { tamil: "ரோஹிணி", english: "Rohini" },
  4: { tamil: "மிருகசீரிஷம்", english: "Mrigasheersham" },
  5: { tamil: "திருவாதிரை", english: "Thiruvathirai" },
  6: { tamil: "புனர்பூசம்", english: "Punarpoosam" },
  7: { tamil: "பூசம்", english: "Poosam" },
  8: { tamil: "ஆயில்யம்", english: "Ailyam" },
  9: { tamil: "மகம்", english: "Magam" },
  10: { tamil: "பூரம்", english: "Pooram" },
  11: { tamil: "உத்திரம்", english: "Uthiram" },
  12: { tamil: "அஸ்தம்", english: "Astham" },
  13: { tamil: "சித்திரை", english: "Chithirai" },
  14: { tamil: "சுவாதி", english: "Swathi" },
  15: { tamil: "விசாகம்", english: "Visakam" },
  16: { tamil: "அனுஷம்", english: "Anusham" },
  17: { tamil: "கேட்டை", english: "Kettai" },
  18: { tamil: "மூலம்", english: "Moolam" },
  19: { tamil: "பூராடம்", english: "Pooradam" },
  20: { tamil: "உத்திராடம்", english: "Uthiradam" },
  21: { tamil: "திருவோணம்", english: "Thiruvonam" },
  22: { tamil: "அவிட்டம்", english: "Avittam" },
  23: { tamil: "சதயம்", english: "Sadhayam" },
  24: { tamil: "பூரட்டாதி", english: "Poorattathi" },
  25: { tamil: "உத்திரட்டாதி", english: "Uthirattathi" },
  26: { tamil: "ரேவதி", english: "Revathi" },
};

const WEEKDAYS = [
  { dayTa: "ஞாயிறு", dayEn: "Sunday" },
  { dayTa: "திங்கள்", dayEn: "Monday" },
  { dayTa: "செவ்வாய்", dayEn: "Tuesday" },
  { dayTa: "புதன்", dayEn: "Wednesday" },
  { dayTa: "வியாழன்", dayEn: "Thursday" },
  { dayTa: "வெள்ளி", dayEn: "Friday" },
  { dayTa: "சனி", dayEn: "Saturday" },
];

interface AuspiciousCategory {
  id: string;
  titleTa: string;
  titleEn: string;
  subtitleTa: string;
  subtitleEn: string;
  icon: React.ElementType;
  targetNakshatras: Set<number>;
  allowedWeekdays?: Set<number>;
}

const CATEGORIES: AuspiciousCategory[] = [
  {
    id: "gold",
    titleTa: "தங்கம் வாங்க உகந்த நாட்கள்",
    titleEn: "Auspicious days to buy gold",
    subtitleTa: "கார்திகை, புனர்பூசம், உத்திரம், விசாகம், பூராடம், உத்திராடம் (ஞாயிறு, செவ்வாய் தவிர)",
    subtitleEn: "Karthigai, Punarpoosam, Uthiram, Visakam, Pooradam, Uthiradam (Excl. Sun & Tue)",
    icon: Coins,
    targetNakshatras: new Set([2, 6, 11, 15, 19, 20]),
    allowedWeekdays: new Set([1, 3, 4, 5, 6]),
  },
  {
    id: "job",
    titleTa: "வேலையில் சேருவதற்கான நல்ல காலம்",
    titleEn: "Auspicious time to join a job",
    subtitleTa: "அஸ்தம், அஸ்வினி, பூசம், மிருகசீரிஷம், ரேவதி, சித்திரை, அனுஷம் (புதன், வியாழன், வெள்ளி, ஞாயிறு)",
    subtitleEn: "Astham, Ashwini, Poosam, Mrigasheersham, Revathi, Chithirai, Anusham (Wed, Thu, Fri, Sun)",
    icon: Briefcase,
    targetNakshatras: new Set([12, 0, 7, 4, 26, 13, 16]),
    allowedWeekdays: new Set([0, 3, 4, 5]),
  },
  {
    id: "investment",
    titleTa: "வங்கி / LIC முதலீடு செய்ய உகந்த நாட்கள்",
    titleEn: "Best days for Bank & LIC Investments",
    subtitleTa: "சுவாதி, பூரட்டாதி, ரேவதி, சித்திரை, அனுஷம், விசாகம், பூசம், திருவோணம், அவிட்டம்",
    subtitleEn: "Swathi, Poorattathi, Revathi, Chithirai, Anusham, Visakam, Poosam, Thiruvonam, Avittam",
    icon: TrendingUp,
    targetNakshatras: new Set([14, 24, 26, 13, 16, 15, 7, 21, 22]),
  },
  {
    id: "shopping",
    titleTa: "பொருட்களை வாங்குவதற்கேற்ற நாட்கள்",
    titleEn: "Auspicious days to buy goods",
    subtitleTa: "ரோஹிணி, அஸ்வினி, சுவாதி, திருவோணம், சித்திரை",
    subtitleEn: "Rohini, Ashwini, Swathi, Thiruvonam, Chithirai",
    icon: ShoppingBag,
    targetNakshatras: new Set([3, 0, 14, 21, 13]),
  },
  {
    id: "shop_opening",
    titleTa: "புதிய கடை திறப்பதற்கு ஏற்ற நாட்கள்",
    titleEn: "Auspicious days for opening a new shop",
    subtitleTa: "பூரம், பூராடம், பூரட்டாதி, விசாகம், கார்த்திகை, ஆயில்யம், பரணி",
    subtitleEn: "Pooram, Pooradam, Poorattathi, Visakam, Karthigai, Ailyam, Bharani",
    icon: Store,
    targetNakshatras: new Set([10, 19, 24, 15, 2, 8, 1]),
  },
];

// ── Static info-only pill data ──

const LOST_ITEM_FOUND_NAKSHATRAS = [
  { ta: "அனுஷம்", en: "Anusham" },
  { ta: "மகம்", en: "Magam" },
  { ta: "சித்திரை", en: "Chithirai" },
  { ta: "கேட்டை", en: "Kettai" },
  { ta: "பூராடம்", en: "Pooradam" },
  { ta: "பரணி", en: "Bharani" },
];

const LOST_ITEM_NOT_FOUND_NAKSHATRAS = [
  { ta: "புனர்பூசம்", en: "Punarpoosam" },
  { ta: "பூராடம்", en: "Pooradam" },
  { ta: "சுவாதி", en: "Swathi" },
  { ta: "மூலம்", en: "Moolam" },
  { ta: "திருவோணம்", en: "Thiruvonam" },
  { ta: "உத்திரட்டாதி", en: "Uthirattathi" },
  { ta: "கார்த்திகை", en: "Karthigai" },
];

const TRAVEL_WEEKDAY_EFFECTS = [
  {
    dayTa: "ஞாயிறு",
    dayEn: "Sunday",
    effectTa: "எவ்விதப் பயனும் கிடைக்காது.",
    effectEn: "No benefit gained from the journey.",
    positive: false,
  },
  {
    dayTa: "திங்கள்",
    dayEn: "Monday",
    effectTa: "தோல்வி ஏற்படும்.",
    effectEn: "Failure may occur.",
    positive: false,
  },
  {
    dayTa: "செவ்வாய்",
    dayEn: "Tuesday",
    effectTa: "உடல்நலம் பாதிக்கப்படும்.",
    effectEn: "Health may be affected.",
    positive: false,
  },
  {
    dayTa: "புதன்",
    dayEn: "Wednesday",
    effectTa: "நன்மை தரும். ஆனால் பொருட்கள் திருட்டு போகும் — பாதுகாப்பாக இருக்கவும்.",
    effectEn: "Beneficial, but beware of theft during travel — stay cautious.",
    positive: true,
  },
  {
    dayTa: "வியாழன்",
    dayEn: "Thursday",
    effectTa: "பலவழிகளில் நன்மை உண்டாகும்.",
    effectEn: "Benefits come in many ways.",
    positive: true,
  },
  {
    dayTa: "வெள்ளி",
    dayEn: "Friday",
    effectTa: "செல்வம் சேரும். பயணம் வெற்றி தரும்.",
    effectEn: "Wealth accumulates. Journey brings success.",
    positive: true,
  },
  {
    dayTa: "சனி",
    dayEn: "Saturday",
    effectTa: "செல்வ இழப்பு ஏற்படும்.",
    effectEn: "Loss of wealth may occur.",
    positive: false,
  },
];

const INAUSPICIOUS_TITHI_MONTHS = [
  {
    monthTa: "ஆகஸ்ட்",
    monthEn: "August",
    tithisTa: "பிரதமை, துவிதியை, திரிதியை திதிகள்",
    tithisEn: "Prathami, Dvithiyai, Thrithiyai Tithis",
  },
  {
    monthTa: "ஏப்ரல்",
    monthEn: "April",
    tithisTa: "துவாதசி திதி",
    tithisEn: "Dwadasi Tithi",
  },
  {
    monthTa: "டிசம்பர்",
    monthEn: "December",
    tithisTa: "சதுர்த்தி, பஞ்சமி, சப்தமி, அஷ்டமி திதிகள்",
    tithisEn: "Chaturthi, Panchami, Saptami, Ashtami Tithis",
  },
  {
    monthTa: "மார்ச்",
    monthEn: "March",
    tithisTa: "அஷ்டமி, நவமி திதிகள்",
    tithisEn: "Ashtami, Navami Tithis",
  },
  {
    monthTa: "ஜனவரி, பிப்ரவரி, மே, நவம்பர்",
    monthEn: "January, February, May, November",
    tithisTa: "தேய்பிறையில் — பஞ்சமி, சஷ்டி, திரிதியை",
    tithisEn: "In Krishna Paksha — Panchami, Shashti, Thrithiyai",
  },
];

/* --- Astronomical Calculation Helpers --- */

function getJulianDay(year: number, month: number, day: number, hour = 0): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const dayFraction = hour / 24.0;
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + dayFraction + b - 1524.5;
}

function getMoonSiderealLongitude(jd: number): number {
  const daysSinceJ2000 = jd - 2451545.0;
  const T = daysSinceJ2000 / 36525;
  let lambdaTropical = (218.3164 + 13.176396 * daysSinceJ2000) % 360;
  if (lambdaTropical < 0) lambdaTropical += 360;
  const ayanamsa = 23.85 + 0.01396 * T;
  let lambdaSidereal = (lambdaTropical - ayanamsa) % 360;
  if (lambdaSidereal < 0) lambdaSidereal += 360;
  return lambdaSidereal;
}

function getNakshatraIndexFromJD(jd: number): number {
  const siderealLong = getMoonSiderealLongitude(jd);
  return Math.floor(siderealLong / (360 / 27));
}

function findNakshatraStartJD(nakIndex: number, approxJD: number): number {
  const targetLong = (nakIndex * (360 / 27)) % 360;
  let low = approxJD - 1.2;
  let high = approxJD + 1.2;
  for (let i = 0; i < 25; i++) {
    const mid = (low + high) / 2;
    const long = getMoonSiderealLongitude(mid);
    const diff = (long - targetLong + 360) % 360;
    if (diff < 180) high = mid;
    else low = mid;
  }
  return low;
}

function formatNakshatraTime(jd: number, midnightJD: number) {
  const elapsedHours = (jd - midnightJD) * 24;
  let dayLabelTa = "";
  let dayLabelEn = "";
  let normHours = elapsedHours;
  if (elapsedHours < 0) {
    dayLabelTa = "முந்நாள் ";
    dayLabelEn = "Prev Day ";
    normHours = elapsedHours + 24;
  } else if (elapsedHours >= 24) {
    dayLabelTa = "மறுநாள் ";
    dayLabelEn = "Next Day ";
    normHours = elapsedHours - 24;
  }
  const h24 = Math.floor(normHours) % 24;
  const m = Math.floor((normHours % 1) * 60);
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const timeStr = `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`;
  return {
    hourOfDay: elapsedHours,
    ta: `${dayLabelTa}${timeStr}`,
    en: `${dayLabelEn}${timeStr}`,
  };
}

export default function SubhaMuhurthamDays({ isLight = true }: SubhaMuhurthamTabProps) {
  const { isTamil } = useTranslation();

  const currentDate = new Date();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("marriage");
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);

  const calculatedCategoryResults = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    return CATEGORIES.map((category) => {
      const results = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(selectedYear, selectedMonth - 1, day);
        const weekdayIndex = date.getDay();

        if (category.allowedWeekdays && !category.allowedWeekdays.has(weekdayIndex)) continue;

        const midnightJD = getJulianDay(selectedYear, selectedMonth, day, 0);
        const sunriseJD = getJulianDay(selectedYear, selectedMonth, day, 6);
        const sunriseNakIndex = getNakshatraIndexFromJD(sunriseJD);

        let targetNakIndex = -1;
        let startJD = 0;
        let endJD = 0;

        if (category.targetNakshatras.has(sunriseNakIndex)) {
          targetNakIndex = sunriseNakIndex;
          startJD = findNakshatraStartJD(targetNakIndex, sunriseJD);
          endJD = findNakshatraStartJD((targetNakIndex + 1) % 27, sunriseJD + 0.5);
        } else {
          const nextNakIndex = (sunriseNakIndex + 1) % 27;
          if (category.targetNakshatras.has(nextNakIndex)) {
            const potentialStartJD = findNakshatraStartJD(nextNakIndex, sunriseJD + 0.5);
            const startHoursToday = (potentialStartJD - midnightJD) * 24;
            if (startHoursToday >= 0 && startHoursToday < 24) {
              targetNakIndex = nextNakIndex;
              startJD = potentialStartJD;
              endJD = findNakshatraStartJD((targetNakIndex + 1) % 27, startJD + 0.8);
            }
          }
        }

        if (targetNakIndex !== -1) {
          const endTimeFormatted = formatNakshatraTime(endJD, midnightJD);
          if (endTimeFormatted.hourOfDay < 10.0) continue;
          const startTimeFormatted = formatNakshatraTime(startJD, midnightJD);

          results.push({
            dateStr: day.toString().padStart(2, "0"),
            dayTa: WEEKDAYS[weekdayIndex].dayTa,
            dayEn: WEEKDAYS[weekdayIndex].dayEn,
            nakshatraTa: ALL_NAKSHATRAS[targetNakIndex]?.tamil,
            nakshatraEn: ALL_NAKSHATRAS[targetNakIndex]?.english,
            startTa: startTimeFormatted.ta,
            startEn: startTimeFormatted.en,
            endTa: endTimeFormatted.ta,
            endEn: endTimeFormatted.en,
          });
        }
      }

      return { category, days: results };
    });
  }, [selectedYear, selectedMonth]);

  const isCalculatorCategory = CATEGORIES.some((c) => c.id === selectedCategoryId);

  const pillBase = (active: boolean) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
      active
        ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/30"
        : isLight
        ? "bg-white border-amber-500/30 text-gray-600 hover:border-amber-500/60 hover:text-gray-900"
        : "bg-black/30 border-white/15 text-gray-400 hover:border-white/30 hover:text-white"
    }`;

  const staticPills = [
    { id: "lost_found", labelTa: "தொலைந்த பொருட்கள்", labelEn: "Lost Items", icon: Search },
    { id: "travel", labelTa: "பயண பலன்கள்", labelEn: "Travel Effects", icon: Plane },
    { id: "inauspicious", labelTa: "நல்லவை செய்ய ஆகாத நாட்கள்", labelEn: "Inauspicious Tithis", icon: Ban },
  ];

  return (
    <ScreenGuard featureId="muhurtham">
      <div className="space-y-8">

        {/* ── Pill Selector Bar ── */}
        <div
          className={`p-4 rounded-2xl border space-y-3 ${
            isLight ? "bg-amber-500/10 border-amber-500/20" : "bg-white/5 border-white/10"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className={`font-serif font-black text-sm ${isLight ? "text-gray-900" : "text-white"}`}>
              {isTamil ? "சுப முகூர்த்த வகைகள்" : "Muhurtham Categories"}
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Marriage pill */}
            <button onClick={() => setSelectedCategoryId("marriage")} className={pillBase(selectedCategoryId === "marriage")}>
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{isTamil ? "திருமண முகூர்த்தம்" : "Marriage Muhurtham"}</span>
            </button>

            {/* Dynamic calculator pills */}
            {CATEGORIES.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={pillBase(selectedCategoryId === category.id)}
                >
                  <IconComponent className="w-3.5 h-3.5 shrink-0" />
                  <span>{isTamil ? category.titleTa : category.titleEn}</span>
                </button>
              );
            })}

            {/* Static info pills */}
            {staticPills.map((pill) => {
              const IconComponent = pill.icon;
              return (
                <button
                  key={pill.id}
                  onClick={() => setSelectedCategoryId(pill.id)}
                  className={pillBase(selectedCategoryId === pill.id)}
                >
                  <IconComponent className="w-3.5 h-3.5 shrink-0" />
                  <span>{isTamil ? pill.labelTa : pill.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 1: Marriage Muhurtham ── */}
        {selectedCategoryId === "marriage" && (
          <div className="space-y-8">
            <div
              className={`p-4 rounded-2xl border text-xs flex gap-3 transition-all ${
                isLight
                  ? "bg-amber-50/40 border-amber-500/15 text-[#5C4F43]"
                  : "bg-white/5 border-white/5 text-gray-300"
              }`}
            >
              <Info className="w-5 h-5 shrink-0 text-amber-500" />
              <div>
                <p className="font-bold mb-1">{isTamil ? "குறிப்பு:" : "Astrological Notice:"}</p>
                <p className="leading-relaxed">
                  {isTamil
                    ? "கீழே கொடுக்கப்பட்டுள்ள தேதிகள் அனைத்தும் 2026 ஆம் ஆண்டிற்கான பொதுவான சுப முகூர்த்த நாட்கள் ஆகும். மணமகன் மற்றும் மணமகளின் பிறந்த நட்சத்திரம் மற்றும் ஜாதக அமைப்புக்கு ஏற்ப துல்லியமான முகூர்த்த நேரத்தை ஜோதிடரிடம் சோதித்து முடிவெடுக்கவும்."
                    : "The dates listed below are general auspicious marriage Muhurthams for 2026. For high-precision Muhurtham tailored to the specific birth charts of the bride and groom, consult our lineage experts."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MUHURTHAM_DATA.map((month, idx) => (
                <div
                  key={idx}
                  className={`rounded-3xl border shadow-lg overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-xl ${
                    isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"
                  }`}
                >
                  <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4.5 h-4.5 text-amber-500" />
                      <h3 className={`font-serif font-black text-sm uppercase tracking-wide ${isLight ? "text-gray-900" : "text-amber-400"}`}>
                        {isTamil ? month.monthTa : month.monthEn}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-500/80 tracking-wider">2026</span>
                  </div>

                  <div className="p-5 space-y-3.5">
                    {month.dates.map((d, dIdx) => (
                      <div
                        key={dIdx}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                          isLight
                            ? "bg-amber-50/30 border-amber-500/10 hover:bg-amber-50/50"
                            : "bg-white/5 border-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-mono font-black text-base shadow-md shadow-amber-500/10 shrink-0">
                          {d.date}
                        </div>
                        <p className={`text-xs font-bold ${isLight ? "text-gray-800" : "text-white"}`}>
                          {isTamil ? d.dayTa : d.dayEn}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className={`px-5 py-3 border-t text-[10px] flex items-center justify-between font-mono ${isLight ? "bg-amber-50/15 border-amber-500/10 text-gray-500" : "bg-black/10 border-white/5 text-gray-400"}`}>
                    <span>{isTamil ? "வளர்பிறை சுப தினங்கள்" : "Valarpirai Auspicious Days"}</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SECTION 2: Dynamic Calculator Categories ── */}
        {isCalculatorCategory && (
          <>
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${isLight ? "bg-amber-500/10 border-amber-500/20" : "bg-white/5 border-white/10"}`}>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-500" />
                <h3 className={`font-serif font-black text-sm ${isLight ? "text-gray-900" : "text-white"}`}>
                  {isTamil ? "நட்சத்திர சுபதின கணக்கீடு" : "Auspicious Days Calculator"}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className={`text-xs font-bold px-3 py-2 rounded-xl border outline-none transition-all ${isLight ? "bg-white border-amber-500/30 text-gray-800 focus:border-amber-500" : "bg-black/50 border-white/20 text-white focus:border-amber-400"}`}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1} className="text-black">
                      {new Date(0, i).toLocaleString(isTamil ? "ta-IN" : "en-US", { month: "long" })}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className={`w-20 text-xs font-bold px-3 py-2 rounded-xl border outline-none transition-all ${isLight ? "bg-white border-amber-500/30 text-gray-800 focus:border-amber-500" : "bg-black/50 border-white/20 text-white focus:border-amber-400"}`}
                />
              </div>
            </div>

            {calculatedCategoryResults
              .filter(({ category }) => category.id === selectedCategoryId)
              .map(({ category, days }) => {
                const IconComponent = category.icon;
                return (
                  <div key={category.id} className={`rounded-3xl border shadow-xl p-6 transition-all ${isLight ? "bg-white border-amber-500/20" : "bg-black/40 border-white/10"}`}>
                    <div className="flex items-center gap-3 pb-6 border-b border-amber-500/15">
                      <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className={`text-lg font-serif font-black ${isLight ? "text-gray-900" : "text-amber-400"}`}>
                          {isTamil ? category.titleTa : category.titleEn}
                        </h2>
                      </div>
                    </div>

                    <div className="pt-6">
                      {days.length === 0 ? (
                        <p className="text-center py-6 text-xs text-gray-500 font-mono">
                          {isTamil ? "இந்த மாதத்தில் பொருத்தமான நாட்கள் இல்லை." : "No matched auspicious days found for this month."}
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {days.map((item, idx) => (
                            <div key={idx} className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${isLight ? "bg-amber-50/30 border-amber-500/15 hover:border-amber-500/40" : "bg-white/5 border-white/10 hover:bg-white/10"}`}>
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-mono font-black text-base shadow-md shadow-amber-500/20 shrink-0">
                                {item.dateStr}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={`text-xs font-bold truncate ${isLight ? "text-gray-900" : "text-white"}`}>
                                  {isTamil ? item.dayTa : item.dayEn}
                                </p>
                                <div className="mt-1.5 space-y-0.5 text-[10px] font-mono text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-emerald-500 shrink-0" />
                                    <span>{isTamil ? "ஆரம்பம்:" : "Start:"} {isTamil ? item.startTa : item.startEn}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                                    <span>{isTamil ? "முடிவு:" : "End:"} {isTamil ? item.endTa : item.endEn}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </>
        )}

        {/* ── SECTION 3: Lost Items ── */}
        {selectedCategoryId === "lost_found" && (
          <div className="space-y-6">
            {/* Found */}
            <div className={`rounded-3xl border shadow-xl p-6 ${isLight ? "bg-white border-amber-500/20" : "bg-black/40 border-white/10"}`}>
              <div className="flex items-center gap-3 pb-5 border-b border-amber-500/15">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h2 className={`text-base font-serif font-black ${isLight ? "text-gray-900" : "text-amber-400"}`}>
                    {isTamil
                      ? "தொலைந்த / திருட்டுப்போன பொருட்கள் கிடைக்கும் நட்சத்திர நாட்கள்"
                      : "Nakshatras when lost/stolen items may be recovered"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isTamil
                      ? "அதிக நாட்களுக்குப் பிறகு, அதிக தூரத்தில் இருந்தும் கிடைக்கும்"
                      : "May be found even after many days or from a great distance"}
                  </p>
                </div>
              </div>
              <div className="pt-5 flex flex-wrap gap-2">
                {LOST_ITEM_FOUND_NAKSHATRAS.map((n, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                    {isTamil ? n.ta : n.en}
                  </span>
                ))}
              </div>
            </div>

            {/* Not Found */}
            <div className={`rounded-3xl border shadow-xl p-6 ${isLight ? "bg-white border-amber-500/20" : "bg-black/40 border-white/10"}`}>
              <div className="flex items-center gap-3 pb-5 border-b border-amber-500/15">
                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <XCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className={`text-base font-serif font-black ${isLight ? "text-gray-900" : "text-amber-400"}`}>
                    {isTamil
                      ? "தொலைந்த / திருட்டுப்போன பொருட்கள் கிடைக்காத நட்சத்திர நாட்கள்"
                      : "Nakshatras when lost/stolen items are unlikely to be recovered"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isTamil ? "இந்த நட்சத்திரங்களில் தொலைந்த பொருட்கள் திரும்பவும் கிடைப்பது அரிது" : "Recovery is rare during these Nakshatras"}
                  </p>
                </div>
              </div>
              <div className="pt-5 flex flex-wrap gap-2">
                {LOST_ITEM_NOT_FOUND_NAKSHATRAS.map((n, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-400 text-xs font-bold">
                    {isTamil ? n.ta : n.en}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 4: Travel Effects ── */}
        {selectedCategoryId === "travel" && (
          <div className={`rounded-3xl border shadow-xl p-6 ${isLight ? "bg-white border-amber-500/20" : "bg-black/40 border-white/10"}`}>
            <div className="flex items-center gap-3 pb-6 border-b border-amber-500/15">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Plane className="w-6 h-6" />
              </div>
              <div>
                <h2 className={`text-lg font-serif font-black ${isLight ? "text-gray-900" : "text-amber-400"}`}>
                  {isTamil ? "கிழமைகளில் பயணம் செய்வதால் ஏற்படும் பலன்கள்" : "Effects of Travel by Weekday"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isTamil ? "எந்த கிழமையில் பயணம் மேற்கொள்வது நல்லது?" : "Which day is favourable for travel?"}
                </p>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              {TRAVEL_WEEKDAY_EFFECTS.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                    item.positive
                      ? isLight
                        ? "bg-emerald-50/40 border-emerald-500/20"
                        : "bg-emerald-500/5 border-emerald-500/15"
                      : isLight
                      ? "bg-rose-50/40 border-rose-500/20"
                      : "bg-rose-500/5 border-rose-500/15"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${item.positive ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}>
                    {isTamil ? item.dayTa.slice(0, 2) : item.dayEn.slice(0, 3)}
                  </div>
                  <div>
                    <p className={`text-xs font-black mb-0.5 ${isLight ? "text-gray-900" : "text-white"}`}>
                      {isTamil ? item.dayTa : item.dayEn}
                    </p>
                    <p className={`text-xs leading-relaxed ${item.positive ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                      {isTamil ? item.effectTa : item.effectEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SECTION 5: Inauspicious Tithis ── */}
        {selectedCategoryId === "inauspicious" && (
          <div className={`rounded-3xl border shadow-xl p-6 ${isLight ? "bg-white border-amber-500/20" : "bg-black/40 border-white/10"}`}>
            <div className="flex items-center gap-3 pb-6 border-b border-amber-500/15">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <h2 className={`text-lg font-serif font-black ${isLight ? "text-gray-900" : "text-amber-400"}`}>
                  {isTamil ? "நல்லவை செய்ய ஆகாத திதி நாட்கள்" : "Inauspicious Tithi Days"}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isTamil ? "இந்த திதிகளில் சுபகாரியங்கள் செய்வதை தவிர்க்கவும்" : "Avoid auspicious activities on these Tithis"}
                </p>
              </div>
            </div>

            <div className="pt-6 space-y-4">
              {INAUSPICIOUS_TITHI_MONTHS.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isLight
                      ? "bg-rose-50/30 border-rose-500/15 hover:border-rose-500/30"
                      : "bg-rose-500/5 border-rose-500/10 hover:bg-rose-500/10"
                  }`}
                >
                  <p className={`text-xs font-black mb-2 ${isLight ? "text-gray-900" : "text-white"}`}>
                    {isTamil ? item.monthTa : item.monthEn}
                  </p>
                  <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed">
                    {isTamil ? item.tithisTa : item.tithisEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </ScreenGuard>
  );
}
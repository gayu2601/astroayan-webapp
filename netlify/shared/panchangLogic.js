/**
 * panchangLogic.js — REWRITTEN
 * - Always receives English API response (lang: 'en')
 * - All Tamil translation handled internally
 * - Times parsed from English strings → always correct AM/PM
 * - Planet abbreviations in Gochara Kattam use proper Tamil short names
 */

// ── UI Labels ─────────────────────────────────────────────────────────────────
const LABELS = {
  ta: {
    title:           'இன்றைய பஞ்சாங்கம்',
    basicInfo:       'அடிப்படை விவரங்கள்',
    panchangElems:   'பஞ்சாங்க அங்கங்கள்',
    subhaMuhurtha:   'முகூர்த்த நேரங்கள்',
    asubhaMuhurtha:  'அசுப நேரங்கள்',
    hora:            'ஹோரா முகூர்த்தம்',
    lagna:           'லக்ன அட்டவணை',
    sunrise:         'சூரிய உதயம்',
    sunset:          'சூரிய அஸ்தமனம்',
    tithi:           'திதி',
    nakshatra:       'நட்சத்திரம்',
    yog:             'யோகம்',
    karan:           'கரணம்',
    element:         'அங்கம்',
    name:            'பெயர்',
    endTime:         'முடிவு நேரம்',
    dayNight:        'பகல்/இரவு',
    time:            'நேரம்',
    planet:          'கிரகம்',
    lagnaCol:        'லக்னம்',
    startTime:       'தொடக்கம்',
    abhijit:         'அபிஜித் முகூர்த்தம்',
    rahukaal:        'ராகு காலம்',
    gulikaal:        'குளிகை காலம்',
    yamghant:        'யமகண்ட காலம்',
    dishaShool:      'திசா சூல்',
    horaDayPeriod:   'பகல்',
    horaNightPeriod: 'இரவு',
    headers:         ['கிரகம்', 'ராசி', 'பாகை', 'நட்சத்திரம்', 'பாதம்'],
    shool:           'சூலம்',
    nallaNeram:      'நல்ல நேரம்',
    gowriNallaNeram: 'கௌரி நல்ல நேரம்',
    chandrashtama:   'சந்திராஷ்டமம்',
    gocharam:        'கோச்சாரம்',
    morning:         'காலை',
    evening:         'மாலை',
    none:            'இல்லை',
  },
  en: {
    title:           'Today Panchang',
    basicInfo:       'Basic Details',
    panchangElems:   'Panchang Elements',
    subhaMuhurtha:   'Subha Muhurtha Timings',
    asubhaMuhurtha:  'Asubha Timings',
    hora:            'Hora Muhurta',
    lagna:           'Lagna Table',
    sunrise:         'Sunrise',
    sunset:          'Sunset',
    tithi:           'Tithi',
    nakshatra:       'Nakshatra',
    yog:             'Yog',
    karan:           'Karan',
    element:         'Element',
    name:            'Name',
    endTime:         'End Time',
    dayNight:        'Day/Night',
    time:            'Time',
    planet:          'Planet',
    lagnaCol:        'Lagna',
    startTime:       'Start Time',
    abhijit:         'Abhijit Muhurta',
    rahukaal:        'Rahu Kaal',
    gulikaal:        'Gulika Kaal',
    yamghant:        'Yamghant Kaal',
    dishaShool:      'Disha Shool',
    horaDayPeriod:   'Day',
    horaNightPeriod: 'Night',
    headers:         ['Planet', 'Sign', 'Deg', 'Nakshatra', 'Padam'],
    shool:           'Soolam',
    nallaNeram:      'Nalla Neram',
    gowriNallaNeram: 'Gowri Nalla Neram',
    chandrashtama:   'Chandrashtamam',
    gocharam:        'Gocharam',
    morning:         'Morning',
    evening:         'Evening',
    none:            'None',
  },
};

// ── Translation Maps (English → Tamil) ───────────────────────────────────────
const TITHI_NAMES = {
  'Pratipada':  'பிரதமை',    'Dwitiya':    'துவிதியை',
  'Tritiya':    'திருதியை',  'Chaturthi':  'சதுர்த்தி',
  'Panchami':   'பஞ்சமி',   'Shashthi':   'சஷ்டி',
  'Saptami':    'சப்தமி',   'Ashtami':    'அஷ்டமி',
  'Navami':     'நவமி',      'Dashami':    'தசமி',
  'Ekadashi':   'ஏகாதசி',   'Dwadashi':   'துவாதசி',
  'Trayodasi':  'திரயோதசி', 'Chaturdasi': 'சதுர்த்தசி',
  'Purnima':    'பௌர்ணமி',  'Amavasya':   'அமாவாசை',
};

const TITHI_TYPES = {
  'Shukla': 'வளர்பிறை',
  'Krishna': 'தேய்பிறை',
};

const NAKSHATRA_NAMES = {
  'Ashwini':            'அசுவினி',       'Bharani':           'பரணி',
  'Krittika':           'கார்த்திகை',    'Rohini':            'ரோகிணி',
  'Mrigashirsha':       'மிருகசீரிடம்',  'Mrigashira':        'மிருகசீரிடம்',  // API alias
  'Ardra':              'திருவாதிரை',    'Punarvasu':         'புனர்பூசம்',
  'Pushya':             'பூசம்',          'Ashlesha':          'ஆயில்யம்',
  'Magha':              'மகம்',           'Purva Phalguni':    'பூரம்',
  'Uttara Phalguni':    'உத்திரம்',       'Hasta':             'அஸ்தம்',
  'Chitra':             'சித்திரை',      'Swati':             'சுவாதி',
  'Visakha':            'விசாகம்',        'Vishakha':          'விசாகம்',       // API alias
  'Anuradha':           'அனுஷம்',         'Jyeshtha':          'கேட்டை',
  'Moola':              'மூலம்',           'Mula':              'மூலம்',         // API alias
  'Purva Ashadha':      'பூராடம்',        'Purvashadha':       'பூராடம்',       // API alias
  'Uttara Ashadha':     'உத்திராடம்',     'Uttarashadha':      'உத்திராடம்',    // API alias
  'Shravana':           'திருவோணம்',     'Shravan':           'திருவோணம்',     // API alias
  'Dhanishta':          'அவிட்டம்',       'Dhanistha':         'அவிட்டம்',      // API alias
  'Shatabhisha':        'சதயம்',          'Shatbhisha':        'சதயம்',         // API alias
  'Purva Bhadrapada':   'பூரட்டாதி',      'Purvabhadra':       'பூரட்டாதி',     // API alias
  'Uttara Bhadrapada':  'உத்திரட்டாதி',   'Uttarabhadra':      'உத்திரட்டாதி',  // API alias
  'Revati':             'ரேவதி',
};

const YOGA_NAMES = {
  'Vishkumbha': 'விஷ்கும்பம்', 'Priti':      'பிரீதி',
  'Ayushman':   'ஆயுஷ்மான்',  'Saubhagya':  'சௌபாக்கியம்',
  'Shobhana':   'சோபனம்',      'Atiganda':   'அதிகண்டம்',
  'Sukarma':    'சுகர்மம்',    'Dhriti':     'திருதி',
  'Shula':      'சூலம்',        'Ganda':      'கண்டம்',
  'Vriddhi':    'வ்ருத்தி',    'Vridhi':     'வ்ருத்தி',    // API alias
  'Dhruva':     'துருவம்',      'Vyaghata':   'வ்யாகாதம்',
  'Harshana':   'ஹர்ஷணம்',    'Vajra':      'வஜ்ரம்',
  'Siddhi':     'சித்தி',       'Vyatipata':  'வ்யதீபாதம்',
  'Variyana':   'வரியான்',      'Parigha':    'பரிகம்',
  'Shiva':      'சிவம்',        'Siddha':     'சித்தம்',
  'Sadhya':     'சாத்யம்',     'Shubha':     'சுபம்',
  'Shukla':     'சுக்லம்',     'Bramha':     'பிரம்மம்',
  'Indra':      'இந்திரம்',    'Vaidhriti':  'வைதிருதி',
  'Sukla':      'சுக்லம்',     // API alias
};

const KARANA_NAMES = {
  'Bava':        'பவம்',        'Balava':      'பாலவம்',
  'Kaulava':     'கௌலவம்',     'Taitila':     'தைதிலம்',
  'Garaja':      'கரஜம்',       'Vanija':      'வணிஜம்',
  'Vishti':      'விஷ்டி',      'Shakuni':     'சகுனி',
  'Chatushpada': 'சதுஷ்பாதம்', 'Naga':        'நாகம்',
  'Kimstughna':  'கிம்ஸ்துக்னம்',
};

const RASHI_NAMES_TA = {
  1: 'மேஷம்',  2: 'ரிஷபம்',     3: 'மிதுனம்',
  4: 'கடகம்',  5: 'சிம்மம்',    6: 'கன்னி',
  7: 'துலாம்', 8: 'விருச்சிகம்', 9: 'தனுசு',
  10: 'மகரம்', 11: 'கும்பம்',   12: 'மீனம்',
};
const RASHI_NAMES_EN = {
  1: 'Aries',     2: 'Taurus',  3: 'Gemini',
  4: 'Cancer',    5: 'Leo',     6: 'Virgo',
  7: 'Libra',     8: 'Scorpio', 9: 'Sagittarius',
  10: 'Capricorn',11: 'Aquarius',12: 'Pisces',
};

const DISHA_SHOOL = {
  'East': 'கிழக்கு', 'West': 'மேற்கு',
  'North': 'வடக்கு', 'South': 'தெற்கு',
  'NE': 'வடகிழக்கு', 'NW': 'வடமேற்கு',
  'SE': 'தென்கிழக்கு', 'SW': 'தென்மேற்கு',
};

// ── Planet config: English key → Tamil full name, Tamil abbr, badge colors ───
const PLANET_CONFIG = {
  'Sun':       { ta: 'சூரியன்',    abbr: 'சூரி', bg: '#FFF176', color: '#B8860B' },
  'Moon':      { ta: 'சந்திரன்',   abbr: 'சந்',  bg: '#E8EAF6', color: '#37474F' },
  'Mars':      { ta: 'செவ்வாய்',   abbr: 'செவ்', bg: '#FFCCBC', color: '#BF360C' },
  'Mercury':   { ta: 'புதன்',      abbr: 'புத',  bg: '#C8E6C9', color: '#1B5E20' },
  'Jupiter':   { ta: 'குரு',       abbr: 'குரு', bg: '#FFF9C4', color: '#E65100' },
  'Venus':     { ta: 'சுக்கிரன்',  abbr: 'சுக்', bg: '#FCE4EC', color: '#880E4F' },
  'Saturn':    { ta: 'சனி',        abbr: 'சனி',  bg: '#283593', color: '#FFFFFF' },
  'Rahu':      { ta: 'ராகு',       abbr: 'ராகு', bg: '#1B5E20', color: '#FFFFFF' },
  'Ketu':      { ta: 'கேது',       abbr: 'கேது', bg: '#4E342E', color: '#FFFFFF' },
  'Ascendant': { ta: 'லக்னம்',    abbr: 'லக்',  bg: '#E8EAF6', color: '#1A237E' },
};

// Normalise any planet name (English full, English variant, Tamil) → PLANET_CONFIG key
const PLANET_NAME_TO_EN = {
  // English variants
  'Sun': 'Sun', 'Moon': 'Moon', 'Mars': 'Mars', 'Mercury': 'Mercury',
  'Jupiter': 'Jupiter', 'Venus': 'Venus', 'Saturn': 'Saturn',
  'Rahu': 'Rahu', 'Ketu': 'Ketu', 'Ascendant': 'Ascendant',
  'Lagna': 'Ascendant', 'Asc': 'Ascendant',
  // Tamil full names
  'சூரியன்': 'Sun',   'சந்திரன்': 'Moon',  'செவ்வாய்': 'Mars',
  'புதன்': 'Mercury', 'குரு': 'Jupiter',    'சுக்கிரன்': 'Venus',
  'சனி': 'Saturn',    'ராகு': 'Rahu',       'கேது': 'Ketu',
  'லக்னம்': 'Ascendant', 'லக்': 'Ascendant',
  // Tamil abbreviations
  'சூரி': 'Sun', 'சந்': 'Moon', 'செவ்': 'Mars', 'புத': 'Mercury',
  'சுக்': 'Venus', 'சனி': 'Saturn', 'ராகு': 'Rahu', 'கேது': 'Ketu', 'லக்': 'Ascendant',
};

// ── Translate helpers ─────────────────────────────────────────────────────────
const tr = (map, val, lang) => {
  if (!val) return '-';
  return lang === 'ta' ? (map[val] || val) : val;
};

const translateNakshatra = (name, lang) => tr(NAKSHATRA_NAMES, name?.trim(), lang);
const translateTithi     = (name, lang) => tr(TITHI_NAMES,    name?.trim(), lang);
const translateTithiType = (type, lang) => tr(TITHI_TYPES,    type?.trim(), lang);
const translateYoga      = (name, lang) => tr(YOGA_NAMES,     name?.trim(), lang);
const translateKarana    = (name, lang) => tr(KARANA_NAMES,   name?.trim(), lang);
const translateDisha     = (val,  lang) => tr(DISHA_SHOOL,    val?.trim(),  lang);

const translatePlanetName = (enName, lang) => {
  if (!enName) return '-';
  if (lang !== 'ta') return enName;
  return PLANET_CONFIG[enName]?.ta || enName;
};

// ── Time Utilities (English API strings only) ─────────────────────────────────

/**
 * Parse English API date string → Date object
 * Handles: "Sun Jul 12 2026 10:05:08 PM"
 *          "Sun Jul 12 2026 1:39:29 AM"
 */
const parseEnglishDateStr = (str, refDateStr) => {
  if (!str || typeof str !== 'string') return null;

  // Full date string with year: "Sun Jul 12 2026 10:05:08 PM"
  if (/\d{4}/.test(str)) {
    const d = new Date(str);
    return isNaN(d.getTime()) ? null : d;
  }

  // Time-only string, with or without seconds/AM-PM:
  // "11:51:55 AM", "05:15 PM", "6:50:42 PM", "06:15" (24hr)
  const timeMatch = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (timeMatch) {
    const [, hh, mm, ss, ampm] = timeMatch;
    let h = parseInt(hh, 10);
    if (ampm) {
      if (/pm/i.test(ampm) && h !== 12) h += 12;
      if (/am/i.test(ampm) && h === 12) h = 0;
    }
    const base = refDateStr ? new Date(refDateStr) : new Date();
    if (isNaN(base.getTime())) return null;
    base.setHours(h, parseInt(mm, 10), ss ? parseInt(ss, 10) : 0, 0);
    return base;
  }

  return null;
};

const fmtTime = (str) => {
  if (!str || typeof str !== 'string') return '-';

  if (/\d{4}/.test(str)) {
    const d = parseEnglishDateStr(str);
    if (d) {
      const h   = d.getHours();
      const h12 = h % 12 || 12;
      const mm  = String(d.getMinutes()).padStart(2, '0');
      return `${String(h12).padStart(2, '0')}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
    }
  }

  const timeMatch = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (timeMatch) {
    const [, hh, mm, , ampm] = timeMatch;
    let h = parseInt(hh, 10);
    if (ampm) {
      if (/pm/i.test(ampm) && h !== 12) h += 12;
      if (/am/i.test(ampm) && h === 12) h = 0;
    }
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${mm} ${h < 12 ? 'AM' : 'PM'}`;
  }

  return '-';
};

const fmt12 = (t) => {
  if (!t) return '-';
  return fmtTime(String(t));
};

/**
 * Tamil period label from 24-hour value
 */
const inferTamilPeriod = (hour) => {
  if (hour >= 0  && hour < 5)  return 'அதிகாலை'; // 12 AM – 4:59 AM
  if (hour >= 5  && hour < 12) return 'காலை';     // 5 AM  – 11:59 AM
  if (hour >= 12 && hour < 16) return 'மதியம்';   // 12 PM – 3:59 PM
  if (hour >= 16 && hour < 18) return 'பிற்பகல்'; // 4 PM  – 5:59 PM
  if (hour >= 18 && hour < 21) return 'மாலை';     // 6 PM  – 8:59 PM
  return 'இரவு';                                    // 9 PM  – 11:59 PM
};

/**
 * English period label from 24-hour value
 */
const inferEnglishPeriod = (hour) => {
  if (hour >= 0  && hour < 5)  return 'Early Morning';
  if (hour >= 5  && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 16) return 'Afternoon';
  if (hour >= 16 && hour < 18) return 'Late Afternoon';
  if (hour >= 18 && hour < 21) return 'Evening';
  return 'Night';
};

/**
 * Format English date string → Tamil relative time
 * e.g. "Sun Jul 12 2026 10:05:08 PM" → "இன்று மாலை 10:05"
 */
const toTamilRelativeTime = (str, todayDateStr) => {
  const dt = parseEnglishDateStr(str, todayDateStr);
  if (!dt) return '-';

  const today = todayDateStr ? new Date(todayDateStr) : new Date();
  today.setHours(0, 0, 0, 0);
  const dtDay = new Date(dt);
  dtDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round((dtDay - today) / 86400000);

  let relLabel =
    diffDays <= -1 ? 'நேற்று' :
    diffDays >= 1  ? 'நாளை'  : 'இன்று';

  const hour = dt.getHours();

  // Panchang convention: 12 AM–5 AM still counts as "today", not "yesterday night"
  if (relLabel === 'நேற்று' && hour >= 0 && hour < 5) {
    relLabel = 'இன்று';
  }

  const h12    = hour % 12 || 12;
  const mm     = String(dt.getMinutes()).padStart(2, '0');
  const period = inferTamilPeriod(hour);

  return `${relLabel} ${period} ${h12}:${mm}`;
};

/**
 * Format English date string → English relative time
 * e.g. "Sun Jul 12 2026 10:05:08 PM" → "Today Evening 10:05 PM"
 */
const toEnglishRelativeTime = (str, todayDateStr) => {
  const dt = parseEnglishDateStr(str, todayDateStr);
  if (!dt) return '-';

  const today = todayDateStr ? new Date(todayDateStr) : new Date();
  today.setHours(0, 0, 0, 0);
  const dtDay = new Date(dt);
  dtDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round((dtDay - today) / 86400000);

  let relLabel =
    diffDays <= -1 ? 'Yesterday' :
    diffDays >= 1  ? 'Tomorrow'  : 'Today';

  const hour = dt.getHours();

  if (relLabel === 'Yesterday' && hour >= 0 && hour < 5) {
    relLabel = 'Today';
  }

  const h12    = hour % 12 || 12;
  const mm     = String(dt.getMinutes()).padStart(2, '0');
  const ampm   = hour < 12 ? 'AM' : 'PM';
  const period = inferEnglishPeriod(hour);

  return `${relLabel} ${period} ${String(h12).padStart(2, '0')}:${mm} ${ampm}`;
};

/**
 * Format a range of two English date strings into:
 *  - Tamil: "இன்று மாலை 10:05 முதல்\nநாளை காலை 6:00 வரை"
 *  - English: "Today Evening 10:05 PM – Tomorrow Morning 06:00 AM"
 */
const fmtRelativeRange = (startStr, endStr, todayDateStr, lang) => {
  if (!startStr && !endStr) return '-';

  if (lang === 'ta') {
    const s = startStr ? toTamilRelativeTime(startStr, todayDateStr) : null;
    const e = endStr   ? toTamilRelativeTime(endStr,   todayDateStr) : null;
    if (s && e) return `${s} முதல்\n${e} வரை`;
    if (e)      return `${e} வரை`;
    return s || '-';
  } else {
    const s = fmtTime(startStr);
    const e = fmtTime(endStr);
    if (s !== '-' && e !== '-') return `${s} – ${e}`;
    return s !== '-' ? s : (e !== '-' ? e : '-');
  }
};

const fmtRange = (obj, lang) => {
  if (!obj) return '-';
  const s = obj.start || obj.start_time;
  const e = obj.end   || obj.end_time;
  return fmtRelativeRange(s, e, null, lang);
};

// ── Tithi type prefix formatting ──────────────────────────────────────────────
const formatTithiName = (name, type, lang) => {
  const tName = translateTithi(name, lang);
  const tType = translateTithiType(type, lang);
  return tType ? `${tType} ${tName}` : tName;
};

// ── Nalla Neram helpers ───────────────────────────────────────────────────────
/**
 * Parses a slot string that may contain Tamil period labels OR English AM/PM times.
 * Tamil input:  "காலை 08:00 - காலை 09:30"
 * English input: "08:00 AM - 09:30 AM"
 * Returns a normalised "HH:MM AM/PM - HH:MM AM/PM" string.
 */
const formatNeramSlot = (slotStr, lang) => {
  if (!slotStr) return '-';

  // Try Tamil period pattern first: "காலை 08:00 - மாலை 05:30"
  const tamilRegex = /(காலை|மாலை)\s*(\d{2}:\d{2}).*?(காலை|மாலை)\s*(\d{2}:\d{2})/;
  const tamilMatch = slotStr.match(tamilRegex);
  if (tamilMatch) {
    const startPeriod = tamilMatch[1] === 'காலை' ? 'AM' : 'PM';
    const endPeriod   = tamilMatch[3] === 'காலை' ? 'AM' : 'PM';
    return `${tamilMatch[2]} ${startPeriod} - ${tamilMatch[4]} ${endPeriod}`;
  }

  // Try English AM/PM pattern: "08:00 AM - 09:30 AM"
  const englishRegex = /(\d{1,2}:\d{2})\s*(AM|PM)?\s*[-–to]+\s*(\d{1,2}:\d{2})\s*(AM|PM)?/i;
  const englishMatch = slotStr.match(englishRegex);
  if (englishMatch) {
    const [, st, sa, et, ea] = englishMatch;
    return `${st}${sa ? ' ' + sa : ''} - ${et}${ea ? ' ' + ea : ''}`;
  }

  return slotStr;
};

// ─────────────────────────────────────────────────────────────────────────────
// Main HTML Generator
// ─────────────────────────────────────────────────────────────────────────────
const generatePanchangHTML = (jsonobj, lang) => {
  console.log('in generatePanchangHTML', jsonobj);

  const pan         = jsonobj?.panchang?.response || jsonobj?.response || jsonobj;
  const todayDateStr = pan?.date || '';
  const adv         = pan?.advanced_details || {};

  const planetsRaw = jsonobj?.planets?.response
                  || jsonobj?.planets
                  || {};

  // Normalise planets array from numeric-keyed object or array
  const planets = Array.isArray(planetsRaw)
    ? planetsRaw
    : Object.entries(planetsRaw)
        .filter(([key, val]) =>
          !isNaN(Number(key)) && val && typeof val === 'object' && val.rasi_no != null
        )
        .map(([, val]) => val);

  const L = LABELS[lang] || LABELS.ta;

  // ── Color palettes ──────────────────────────────────────────────────────────
  const ELEM_COLORS = {
    tithi:         { label: '#E65100', bg: '#FFF3E0' },
    nakshatra:     { label: '#0277BD', bg: '#E3F2FD' },
    rasi:          { label: '#6A1B9A', bg: '#F3E5F5' },
    karan:         { label: '#4E342E', bg: '#EFEBE9' },
    yog:           { label: '#2E7D32', bg: '#E8F5E9' },
    shool:         { label: '#964B00', bg: '#FFEBEE' },
    chandrashtama: { label: '#C62828', bg: '#FFEBEE' },
  };
  const MUHU_COLORS = ['#E65100', '#0277BD', '#2E7D32', '#AD1457', '#6A1B9A'];
  const MUHU_BGS    = ['#FFF3E0', '#E3F2FD', '#E8F5E9', '#FCE4EC', '#F3E5F5'];

  // ── 1. Basic Tiles: Sunrise / Sunset ──────────────────────────────────────
  const basicTiles = [
    { key: 'rasi',  label: L.sunrise, val: fmt12(adv?.sun_rise) },
    { key: 'karan', label: L.sunset,  val: fmt12(adv?.sun_set)  },
  ].map(({ key, label, val }) => {
    const c = ELEM_COLORS[key];
    return `
      <div class="tile" style="background:${c.bg};">
        <div class="tile-lbl" style="color:${c.label};">${label}</div>
        <div class="tile-val" style="font-size:15px;">${val || '-'}</div>
      </div>`;
  }).join('');

  // ── 2. Nalla Neram ────────────────────────────────────────────────────────
  const standardNallaNeram = jsonobj?.standardNallaNeram || null;
  let standardNallaNeramStr = '-';
  if (standardNallaNeram) {
    const lines = [];
    if (standardNallaNeram.morning?.length)
      standardNallaNeram.morning.forEach(slot =>
        lines.push(`${L.morning} - ${formatNeramSlot(slot, lang)}`)
      );
    if (standardNallaNeram.evening?.length)
      standardNallaNeram.evening.forEach(slot =>
        lines.push(`${L.evening} - ${formatNeramSlot(slot, lang)}`)
      );
    standardNallaNeramStr = lines.length > 0 ? lines.join('\n') : L.none;
  }

  // ── 3. Gowri Nalla Neram ──────────────────────────────────────────────────
  const gowriData     = jsonobj?.gowriNallaNeram || { daySlots: [], nightSlots: [] };
  const daySlots      = gowriData.daySlots   || [];
  const nightSlots    = gowriData.nightSlots || [];

  // Match both Tamil and English spellings of the amirdha/amirtha slot name
  const getAmirdhaSlots = (slots) =>
    slots.filter(s => {
      const name = s.name?.trim()?.toLowerCase() || '';
      return name === 'அமிர்த' || name === 'amirdha' || name === 'amirtha' || name === 'amrita';
    });

  const dayAmirdhaList   = getAmirdhaSlots(daySlots);
  const nightAmirdhaList = getAmirdhaSlots(nightSlots);

  let gowriDisplayStr = '-';
  if (dayAmirdhaList.length || nightAmirdhaList.length) {
    const dayLabel   = L.morning;
    const nightLabel = L.evening;
    const noneLabel  = L.none;
    const dayAmirdha   = dayAmirdhaList.length
      ? dayAmirdhaList.map(s => s.timeRange).join(', ') : noneLabel;
    const nightAmirdha = nightAmirdhaList.length
      ? nightAmirdhaList.map(s => s.timeRange).join(', ') : noneLabel;
    gowriDisplayStr = `<div style="font-size:14px;font-weight:800;line-height:1.4;padding:0;">` +
      `<div style="color:#1a1a2e;">${dayLabel}: <span style="color:#AD1457;">${dayAmirdha}</span></div>` +
      `<div style="color:#1a1a2e;">${nightLabel}: <span style="color:#AD1457;">${nightAmirdha}</span></div>` +
      `</div>`;
  }

  // ── 4. Tithi ──────────────────────────────────────────────────────────────
  const tithiDisplayName = formatTithiName(pan?.tithi?.name, pan?.tithi?.type, lang);
  const tithiTime        = fmtRelativeRange(pan?.tithi?.start, pan?.tithi?.end, todayDateStr, lang);

  const tithiDisplayStr = `
    <div style="font-size:14px;font-weight:700;line-height:1.8;white-space:pre-line;padding:6px 0;">
      <div class="tile-lbl" style="color:#E65100;margin-top:-50px">${tithiDisplayName || '-'}</div>
      <div class="tile-val" style="color:#0D47A1;font-size:15px;margin-top:-20px;margin-bottom:-30px">${tithiTime}</div>
    </div>`;

  // ── 5. Abhijit ────────────────────────────────────────────────────────────
  // API may use abhijit_muhurta, abhijit_muhurat, or abhijit at top-level
  const abhijitRaw = adv?.abhijit_muhurta
                  || adv?.abhijit_muhurat
                  || adv?.abhijit
                  || pan?.abhijit_muhurta
                  || pan?.abhijit_muhurat
                  || pan?.abhijit
                  || null;
  const abhijitTime = abhijitRaw
    ? fmtRelativeRange(abhijitRaw.start, abhijitRaw.end, todayDateStr, lang)
    : '-';
  console.log('abhijitRaw', abhijitRaw);

  // ── 6. Subha Tiles ────────────────────────────────────────────────────────
  const subhaTiles = [
    [L.tithi,           tithiDisplayStr],
    [L.abhijit,         abhijitTime],
    [L.nallaNeram,      standardNallaNeramStr],
    [L.gowriNallaNeram, gowriDisplayStr],
  ].map(([label, val], i) => `
    <div class="tile tile--wide" style="background:${MUHU_BGS[i % MUHU_BGS.length]};">
      <div class="tile-lbl" style="color:${MUHU_COLORS[i % MUHU_COLORS.length]};">${label}</div>
      <div class="tile-val" style="white-space:pre-line;margin-top:5px;">${val}</div>
    </div>`
  ).join('');

  // ── 7. Asubha Tiles ───────────────────────────────────────────────────────
  const fmtAsubha = (val, todayDateStr, lang) => {
    if (!val) return '-';

    // Object with start/end
    if (typeof val === 'object' && (val.start || val.start_time)) {
      const s = val.start || val.start_time;
      const e = val.end   || val.end_time;
      return fmtRelativeRange(s, e, todayDateStr, lang);
    }

    // Plain string: "05:04 PM to 06:40 PM"
    if (typeof val === 'string') {
      const match = val.match(/^(.+?)\s+to\s+(.+)$/i);
      if (match) {
        const [, startStr, endStr] = match;
        return fmtRelativeRange(startStr.trim(), endStr.trim(), todayDateStr, lang);
      }
      return val;
    }

    return '-';
  };

  const asubhaTiles = [
    [L.rahukaal, fmtAsubha(pan?.rahukaal, todayDateStr, lang)],
    [L.gulikaal, fmtAsubha(pan?.gulika, todayDateStr, lang)],
    [L.yamghant, fmtAsubha(pan?.yamakanta, todayDateStr, lang)],
  ].map(([label, val], i) => `
    <div class="tile" style="background:${MUHU_BGS[i + 1]};">
      <div class="tile-lbl" style="color:${MUHU_COLORS[i + 1]};">${label}</div>
      <div class="tile-val" style="white-space:pre-line;margin-top:4px;font-size:14px;">${val}</div>
    </div>`
  ).join('');

  // ── 8. Chandrashtama ──────────────────────────────────────────────────────
  const chandrashtama = jsonobj?.chandrashtama || null;
  const chandrashtamaTile = `
    <div class="tile" style="background:${ELEM_COLORS.chandrashtama.bg};">
      <div class="tile-lbl" style="color:${ELEM_COLORS.chandrashtama.label};">${L.chandrashtama}</div>
      <div class="tile-val" style="font-size:12px;white-space:pre-line;">${chandrashtama || '-'}</div>
    </div>`;

  // ── 9. Element Tiles (Nakshatra, Yoga, Karana, Shool) ────────────────────
  const elementTiles = [
    {
      key:   'nakshatra',
      label: L.nakshatra,
      name:  translateNakshatra(pan?.nakshatra?.name, lang),
      start: pan?.nakshatra?.start,
      end:   pan?.nakshatra?.end,
    },
    {
      key:   'yog',
      label: L.yog,
      name:  translateYoga(pan?.yoga?.name, lang),
      start: pan?.yoga?.start,
      end:   pan?.yoga?.end,
    },
    {
      key:   'karan',
      label: L.karan,
      name:  translateKarana(pan?.karana?.name, lang),
      start: pan?.karana?.start,
      end:   pan?.karana?.end,
    },
    {
      key:   'shool',
      label: L.shool,
      name:  translateDisha(adv?.disha_shool, lang),
    },
  ].map(({ key, label, name, start, end }) => {
    const c         = ELEM_COLORS[key];
    const timeRange = start ? fmtRelativeRange(start, end, todayDateStr, lang) : '';
    return `
      <div class="tile tile--elem" style="background:${c.bg};">
        <div class="tile-lbl" style="color:${c.label};">${label}</div>
        <span class="tile-elem" style="color:#B71C1C;">${name || '-'}</span>
        <span class="tile-elem" style="color:#0D47A1;">${timeRange}</span>
      </div>`;
  }).join('');

  // ── 10. Gochara Kattam ────────────────────────────────────────────────────
  // South Indian chart: cell index → rashi number
  const CELL_TO_SIGN = {
    0: 12, 1: 1,  2: 2,  3: 3,
    4: 11,              7: 4,
    8: 10,              11: 5,
    12: 9, 13: 8, 14: 7, 15: 6,
  };
  const CENTER = new Set([5, 6, 9, 10]);

  const SIGN_NAMES = lang === 'ta' ? RASHI_NAMES_TA : RASHI_NAMES_EN;

  // Group planets by rashi — normalise name to English key regardless of what API returns
  const bySign = {};
  planets.forEach(p => {
    const signNo = p.rasi_no;
    if (!signNo) return;

    // Try every possible name field the API might use
    const rawName = (p.full_name || p.name || p.planet_name || '').trim();
    if (!rawName || rawName.toLowerCase() === 'var') return;

    // Normalise to English config key (handles English, Tamil full, Tamil abbr)
    const enKey = PLANET_NAME_TO_EN[rawName] || rawName;

    bySign[signNo] = bySign[signNo] || [];
    // Avoid duplicates
    if (!bySign[signNo].includes(enKey)) bySign[signNo].push(enKey);
  });

  // ── Date formatter for center kattam label ───────────────────────────────
  /**
   * Formats the API date string (e.g. "Sun Jul 13 2025" or "2025-07-13")
   * → Tamil: "13 ஜூலை 2025, ஞாயிறு"
   * → English: "Sunday, 13 July 2025"
   */
  const TAMIL_MONTHS = [
    'ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்',
    'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்',
    'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்',
  ];
  const TAMIL_DAYS = [
    'ஞாயிறு', 'திங்கள்', 'செவ்வாய்',
    'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி',
  ];
  const formatKattamDate = (dateStr, lang) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day   = d.getDate();
    const month = d.getMonth();       // 0-based
    const year  = d.getFullYear();
    const dow   = d.getDay();         // 0 = Sunday
    if (lang === 'ta') {
      return `${day} ${TAMIL_MONTHS[month]} ${year}\n${TAMIL_DAYS[dow]}`;
    }
    const EN_MONTHS = ['January','February','March','April','May','June',
                       'July','August','September','October','November','December'];
    const EN_DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return `${EN_DAYS[dow]}\n${day} ${EN_MONTHS[month]} ${year}`;
  };

  // Badge renderer — shows Tamil or English name based on lang
  const makeBadge = (enName) => {
    const cfg = PLANET_CONFIG[enName];
    if (!cfg) {
      return `<span class="p-badge" style="background:#E0E0E0;color:#333;">${enName.slice(0, 3)}</span>`;
    }
    const taAbbr = enName === 'Ascendant' ? 'ல' : cfg.abbr;
    const label = lang === 'ta' ? taAbbr : enName.slice(0, 2);
    return `<span class="p-badge" style="background:${cfg.bg};color:${cfg.color};">${label}</span>`;
  };

  const centerHTML = `
    <div class="kc-inner">
      <div class="kc-title">${L.gocharam}</div>
      <div class="kc-date" style="white-space:pre-line;">${formatKattamDate(pan?.date, lang)}</div>
    </div>`;

  const cells = Array.from({ length: 16 }, (_, i) => {
    if (CENTER.has(i)) {
      return i === 5 ? `<div class="kc">${centerHTML}</div>` : null;
    }
    const sign   = CELL_TO_SIGN[i];
    const badges = (bySign[sign] || []).map(makeBadge).join('');
    // No sign label shown per requirement
    return `
      <div class="kh">
        <div class="badge-row">${badges}</div>
      </div>`;
  });

  const kattamGrid = cells.filter(Boolean).join('');

  // ── Final HTML ─────────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Mukta:wght@600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: 210mm 297mm; margin: 0; }
    body {
      font-family: 'Mukta', sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      background: #f0f0f0;
    }
    .page-container {
      width: 100%; max-width: 210mm;
      background: #FFFDF0;
      border: 3px solid #FFD700;
      padding: 4mm 5mm;
      display: flex; flex-direction: column; gap: 0;
      overflow: hidden; margin: 0 auto;
    }
    h2 {
      text-align: center; color: #B71C1C;
      font-size: clamp(16px, 4vw, 24px);
      line-height: 1.1;
      border-bottom: 2px solid #FFD700;
      padding-bottom: 2px; margin-bottom: 5px; flex-shrink: 0;
    }
    .section-gap  { height: 10px; flex-shrink: 0; }
    .section-gap1 { height: 5px;  flex-shrink: 0; }
    .tile-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px;
    }
    .tile {
      border-radius: 10px; padding: 6px 8px 5px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      text-align: center; gap: 1px;
    }
    .tile--wide  { grid-column: span 2; }
    .tile--elem  { grid-column: span 1; }
    .tile-lbl {
      font-size: clamp(14px, 2.2vw, 15px);
      font-weight: 700; line-height: 1.2;
    }
    .tile-val {
      font-size: clamp(14px, 2.8vw, 15px);
      font-weight: 800; color: #1a1a2e; line-height: 1.2;
    }
    .tile-elem {
      font-size: clamp(14px, 2.8vw, 15px);
      font-weight: 800; color: #d50000;
    }
    .flex-box { display: flex; gap: 8px; flex-shrink: 0; }
    .flex-box > div { flex: 1; }

    /* ── Kattam ── */
    .kattam-wrapper {
      position: relative;
      display: flex; justify-content: center;
    }
    /*
     * Key trick: fix the grid to a square using a CSS variable --ks (kattam size).
     * Each cell column = --ks/4. Rows are fixed to the same value via grid-auto-rows
     * so content can never push a row taller. Overflow is hidden inside each cell.
     */
    .kattam {
      --ks: min(72vw, 340px);
      --kc: calc(var(--ks) / 4);
      display: grid;
      grid-template-columns: repeat(4, var(--kc));
      grid-template-rows:    repeat(4, var(--kc));
      grid-auto-rows: var(--kc);
      width:  var(--ks);
      height: var(--ks);
      border-top: 1.5px solid #9E9E9E;
      border-left: 1.5px solid #9E9E9E;
      flex-shrink: 0;
    }
    .kh {
      width:  var(--kc);
      height: var(--kc);
      overflow: hidden;
      background: #F8F9FF;
      border-right: 1.5px solid #9E9E9E;
      border-bottom: 1.5px solid #9E9E9E;
      display: flex; flex-direction: column;
      box-sizing: border-box;
    }
    .kc {
      width:  calc(var(--kc) * 2);
      height: calc(var(--kc) * 2);
      overflow: hidden;
      background: #FFFDF0;
      border-right: 1.5px solid #9E9E9E;
      border-bottom: 1.5px solid #9E9E9E;
      grid-column: span 2; grid-row: span 2;
      box-sizing: border-box;
    }
    .sign-label { display: none; }
    .badge-row {
      flex: 1; width: 100%; height: 100%;
      display: flex; flex-wrap: wrap;
      align-content: center; justify-content: center;
      gap: 2px; padding: 3px;
      overflow: hidden;
    }
    .kc-inner {
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: 3px; padding: 4px;
      width: 100%; height: 100%;
      box-sizing: border-box;
    }
    .kc-title {
      font-size: clamp(13px, 2.5vw, 17px);
      font-weight: 800; color: #B71C1C;
    }
    .kc-date {
      font-size: clamp(12px, 1.6vw, 15px);
      font-weight: 700; color: #555;
      text-align: center; line-height: 1.4;
      white-space: pre-line;
    }
    .kattam-wrapper .watermark {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: clamp(28px, 8vw, 44px);
      font-weight: 900;
      color: rgba(183, 28, 28, 0.09);
      white-space: nowrap; pointer-events: none;
      user-select: none; letter-spacing: 4px; z-index: 1;
    }
    .p-badge {
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: 6px;
      padding: 2px 5px;
      min-width: clamp(36px, 6vw, 48px);
      height: clamp(22px, 4vw, 28px);
      font-size: clamp(11px, 1.8vw, 14px);
      font-weight: 800; line-height: 1; text-align: center;
      white-space: nowrap;
    }
    .subam-footer { margin-top: 16px; text-align: center; flex-shrink: 0; }
    .subam-bottom-line {
      width: 60%; height: 1.5px;
      background: linear-gradient(to right, transparent, #B71C1C, transparent);
      margin: 6px auto 0;
    }
    .copyright-text {
      margin-top: 7px;
      font-size: clamp(11px, 2.5vw, 13px);
      color: #888; letter-spacing: 1px;
    }
    @media (max-width: 500px) {
      .flex-box { flex-direction: column; gap: 5px; }
      .kattam { --ks: min(90vw, 300px); }
    }
    @media (max-width: 360px) {
      .page-container { padding-left: 2mm; padding-right: 2mm; }
      .tile { padding: 4px 4px 3px; border-radius: 7px; gap: 0; }
      .kattam { --ks: min(92vw, 280px); }
    }
  </style>
</head>
<body>
  <div class="page-container">
    <h2>${L.title}</h2>
    <div class="flex-box">
      <div>
        <div class="section-gap1"></div>
        <div class="tile-grid">${basicTiles}${elementTiles}</div>
      </div>
      <div>
        <div class="section-gap1"></div>
        <div class="tile-grid">${subhaTiles}</div>
        <div class="section-gap1"></div>
        <div class="tile-grid">${asubhaTiles}${chandrashtamaTile}</div>
      </div>
    </div>
    <div class="section-gap"></div>
    <div class="section-gap1"></div>
    <div class="kattam-wrapper">
      <div class="watermark">AskAstro</div>
      <div class="kattam">${kattamGrid}</div>
    </div>
    <div class="subam-footer">
      <div class="subam-bottom-line"></div>
      <div class="copyright-text">©AskAstro</div>
    </div>
  </div>
</body>
</html>`;
};

module.exports = { generatePanchangHTML };
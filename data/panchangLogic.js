/**
 * panchangLogic.js
 * Shared logic for Daily Panchang Report
 * Variable names aligned with PanchangScreen.js API response structure:
 *   panchang.response  → pan
 *   pan.advanced_details → adv
 *   adv.masa → masa
 *
 * Translation logic: always receives English API response (lang: 'en')
 * All Tamil translation handled internally via maps.
 * Times parsed from English strings → always correct AM/PM.
 */

const LABELS = {
  ta: {
    title:          'பஞ்சாங்கம் வாட்ஸப்பில் பகிர',
    basicInfo:      'அடிப்படை விவரங்கள்',
    panchangElems:  'பஞ்சாங்க அங்கங்கள்',
    subhaMuhurtha: 'முகூர்த்த நேரங்கள்',
    asubhaMuhurtha: 'அசுப நேரங்கள்',
    hora:            'ஹோரா முகூர்த்தம்',
    lagna:          'லக்ன அட்டவணை',
    sunrise:        'சூரிய உதயம்',
    sunset:         'சூரிய அஸ்தமனம்',
    tithi:          'திதி',
    nakshatra:      'நட்சத்திரம்',
    yog:            'யோகம்',
    karan:          'கரணம்',
    element:        'அங்கம்',
    name:           'பெயர்',
    endTime:        'முடிவு நேரம்',
    dayNight:       'பகல்/இரவு',
    time:           'நேரம்',
    planet:         'கிரகம்',
    lagnaCol:       'லக்னம்',
    startTime:      'தொடக்கம்',
    abhijit:        'அபிஜித் முகூர்த்தம்',
    rahukaal:       'ராகு காலம்',
    gulikaal:       'குளிகை காலம்',
    yamghant:       'யமகண்ட காலம்',
    horaDayPeriod:  'பகல்',
    horaNightPeriod:'இரவு',
    headers: ["கிரகம்", "ராசி", "பாகை", "நட்சத்திரம்", "பாதம்"],
    shool: 'சூலம்',
    nallaNeram: 'நல்ல நேரம்',
    gowriNallaNeram: 'கௌரி நல்ல நேரம்',
    chandrashtama: 'சந்திராஷ்டமம்',
    morning: 'காலை',
    evening: 'மாலை',
    none:    'இல்லை',
  },

  en: {
    title:          'Whatsapp shareable Panchang',
    basicInfo:      'Basic Details',
    panchangElems:  'Panchang Elements',
    subhaMuhurtha: 'Subha Muhurtha Timings',
    asubhaMuhurtha: 'Asubha Timings',
    hora:           'Hora Muhurta',
    lagna:          'Lagna Table',
    sunrise:        'Sunrise',
    sunset:         'Sunset',
    tithi:          'Tithi',
    nakshatra:      'Nakshatra',
    yog:            'Yog',
    karan:          'Karan',
    element:        'Element',
    name:           'Name',
    endTime:        'End Time',
    dayNight:       'Day/Night',
    time:           'Time',
    planet:         'Planet',
    lagnaCol:       'Lagna',
    startTime:      'Start Time',
    abhijit:        'Abhijit Muhurta',
    rahukaal:       'Rahu Kaal',
    gulikaal:       'Gulika Kaal',
    yamghant:       'Yamghant Kaal',
    horaDayPeriod:  'Day',
    horaNightPeriod:'Night',
    headers: ["Planet", "Sign", "Deg", "Nakshatra", "Padam"],
    shool: 'Soolam',
    nallaNeram: 'Nalla Neram',
    gowriNallaNeram: 'Gowri Nalla Neram',
    chandrashtama: 'Chandrashtamam',
    morning: 'Morning',
    evening: 'Evening',
    none:    'None',
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
  'Mrigashirsha':       'மிருகசீரிடம்',  'Mrigashira':        'மிருகசீரிடம்',
  'Ardra':              'திருவாதிரை',    'Punarvasu':         'புனர்பூசம்',
  'Pushya':             'பூசம்',          'Ashlesha':          'ஆயில்யம்',
  'Magha':              'மகம்',           'Purva Phalguni':    'பூரம்',
  'Uttara Phalguni':    'உத்திரம்',       'Hasta':             'அஸ்தம்',
  'Chitra':             'சித்திரை',      'Swati':             'சுவாதி',
  'Visakha':            'விசாகம்',        'Vishakha':          'விசாகம்',
  'Anuradha':           'அனுஷம்',         'Jyeshtha':          'கேட்டை',
  'Moola':              'மூலம்',           'Mula':              'மூலம்',
  'Purva Ashadha':      'பூராடம்',        'PurvaShadha':       'பூராடம்',
  'Uttara Ashadha':     'உத்திராடம்',     'UttaraShadha':      'உத்திராடம்',
  'Shravana':           'திருவோணம்',     'Shravan':           'திருவோணம்',
  'Dhanishta':          'அவிட்டம்',       'Dhanistha':         'அவிட்டம்',
  'Shatabhisha':        'சதயம்',          'Shatbhisha':        'சதயம்',
  'Purva Bhadrapada':   'பூரட்டாதி',      'Purvabhadra':       'பூரட்டாதி',
  'Uttara Bhadrapada':  'உத்திரட்டாதி',   'Uttarabhadra':      'உத்திரட்டாதி',
  'Revati':             'ரேவதி',
};

const YOGA_NAMES = {
  'Vishkambha': 'விஷ்கும்பம்', 'Prithi':      'பிரீதி',
  'Ayushman':   'ஆயுஷ்மான்',  'Saubhagya':  'சௌபாக்கியம்',
  'Shobhana':   'சோபனம்',      'Atiganda':   'அதிகண்டம்',
  'Sukarma':    'சுகர்மம்',    'Dhriti':     'திருதி',
  'Shula':      'சூலம்',        'Ganda':      'கண்டம்',
  'Vriddhi':    'வ்ருத்தி',    'Vridhi':     'வ்ருத்தி',
  'Dhruva':     'துருவம்',      'Vyaghata':   'வ்யாகாதம்',
  'Harshana':   'ஹர்ஷணம்',    'Vajra':      'வஜ்ரம்',
  'Siddhi':     'சித்தி',       'Vyatipata':  'வ்யதீபாதம்',
  'Variyana':   'வரியான்',      'Parigha':    'பரிகம்',
  'Shiva':      'சிவம்',        'Siddha':     'சித்தம்',
  'Sadhya':     'சாத்யம்',     'Shubha':     'சுபம்',
  'Shukla':     'சுக்லம்',     'Bramha':     'பிரம்மம்',
  'Indra':      'இந்திரம்',    'Vaidhruthi': 'வைத்ருதி',
  'Sukla':      'சுக்லம்',
};

const KARANA_NAMES = {
  'Bava':        'பவம்',        'Balava':      'பாலவம்',
  'Kaulava':     'கௌலவம்',     'Taitula':     'தைதிலம்',
  'Garaja':      'கரஜம்',       'Vanija':      'வணிஜம்',
  'Vishti':      'விஷ்டி',      'Shakuni':     'சகுனி',
  'Chatushpada': 'சதுஷ்பாதம்', 'Naga':        'நாகம்',
  'Kimstughna':  'கிம்ஸ்துக்னம்',
};

const DISHA_SHOOL = {
  'East': 'கிழக்கு', 'West': 'மேற்கு',
  'North': 'வடக்கு', 'South': 'தெற்கு',
  'NE': 'வடகிழக்கு', 'NW': 'வடமேற்கு',
  'SE': 'தென்கிழக்கு', 'SW': 'தென்மேற்கு',
};

// ── Translate helpers ─────────────────────────────────────────────────────────
const tr = (map, val, lang) => {
  if (!val) return '-';
  return lang === 'ta' ? (map[val] || val) : val;
};

export const translateNakshatra = (name, lang) => tr(NAKSHATRA_NAMES, name?.trim(), lang);
export const translateTithi     = (name, lang) => tr(TITHI_NAMES,    name?.trim(), lang);
export const translateTithiType = (type, lang) => tr(TITHI_TYPES,    type?.trim(), lang);
export const translateYoga      = (name, lang) => tr(YOGA_NAMES,     name?.trim(), lang);
export const translateKarana    = (name, lang) => tr(KARANA_NAMES,   name?.trim(), lang);
export const translateDisha     = (val,  lang) => tr(DISHA_SHOOL,    val?.trim(),  lang);

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

export const fmtTime = (str) => {
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

export const fmt12 = (t) => {
  if (!t) return '-';
  return fmtTime(String(t));
};

/**
 * Tamil period label from 24-hour value
 */
const inferTamilPeriod = (hour) => {
  if (hour >= 0  && hour < 5)  return 'அதிகாலை';
  if (hour >= 5  && hour < 12) return 'காலை';
  if (hour >= 12 && hour < 16) return 'மதியம்';
  if (hour >= 16 && hour < 18) return 'பிற்பகல்';
  if (hour >= 18 && hour < 21) return 'மாலை';
  return 'இரவு';
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
 * Format a range of two English date strings.
 * Tamil:   "இன்று மாலை 10:05 முதல்\nநாளை காலை 6:00 வரை"
 * English: "Today Evening 10:05 PM – Tomorrow Morning 06:00 AM"
 */
export const fmtRelativeRange = (startStr, endStr, todayDateStr, lang) => {
  if (!startStr && !endStr) return '-';

  if (lang === 'ta') {
    const s = startStr ? toTamilRelativeTime(startStr, todayDateStr) : null;
    const e = endStr   ? toTamilRelativeTime(endStr,   todayDateStr) : null;
    if (s && e) return `${s} முதல் ${e} வரை`;
    if (e)      return `${e} வரை`;
    return s || '-';
  } else {
    const s = fmtTime(startStr);
    const e = fmtTime(endStr);
    if (s !== '-' && e !== '-') return `${s} – ${e}`;
    return s !== '-' ? s : (e !== '-' ? e : '-');
  }
};

export const fmtRange = (obj, lang) => {
  if (!obj) return '-';
  const s = obj.start || obj.start_time;
  const e = obj.end   || obj.end_time;
  return fmtRelativeRange(s, e, null, lang);
};

// ── Tithi name formatting ─────────────────────────────────────────────────────
export const formatTithiName = (name, type, lang) => {
  const tName = translateTithi(name, lang);
  const tType = translateTithiType(type, lang);
  return tType ? `${tType} ${tName}` : tName;
};

// ── Nalla Neram slot formatter ────────────────────────────────────────────────
/**
 * Parses a slot string that may contain Tamil period labels OR English AM/PM times.
 * Tamil input:  "காலை 08:00 - காலை 09:30"
 * English input: "08:00 AM - 09:30 AM"
 * Returns a normalised "HH:MM AM/PM - HH:MM AM/PM" string.
 */
export const formatNeramSlot = (slotStr, lang) => {
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

/**
 * Format an "asubha" (inauspicious) time value — Rahu Kaal, Gulika, Yamakantam.
 * Accepts either an { start, end } / { start_time, end_time } object, or a
 * plain "HH:MM AM/PM to HH:MM AM/PM" string, and returns a localized,
 * relative-day-aware range string.
 */
export const fmtAsubha = (val, todayDateStr, lang) => {
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
      return fmtRelativeRange(match[1].trim(), match[2].trim(), todayDateStr, lang);
    }
    return val;
  }

  return '-';
};

export const generatePanchangHTML = (jsonobj, lang, user) => {
  // ── Align with PanchangScreen.js API shape ─────────────────────────────────
  console.log('in generatePanchangHTML', jsonobj);
  const pan  = jsonobj?.panchang?.response || jsonobj?.response || jsonobj;
  const todayDateStr = pan?.date || '';
  const astrologerName     = user?.name     || '';
  const astrologerPhone    = user?.phone    || '';
  const astrologerLocation = user?.location || '';
  const astrologerPhoto    = user?.photo_url    || '';

  const adv  = pan?.advanced_details || {};
  const masa = adv?.masa || {};

  const L = LABELS[lang] || LABELS.ta;

  // ── 1. Sunrise / Sunset values ────────────────────────────────────────────
  const sunriseVal = fmt12(adv?.sun_rise);
  const sunsetVal  = fmt12(adv?.sun_set);

  // ── 2. Nalla Neram ────────────────────────────────────────────────────────
  const standardNallaNeram = jsonobj?.standardNallaNeram || null;

  let nallaNeramRows = []; // { label, value }
  if (standardNallaNeram) {
    if (standardNallaNeram.morning?.length) {
      standardNallaNeram.morning.forEach(slot =>
        nallaNeramRows.push({
          label: L.morning,
          value: formatNeramSlot(slot, lang),
        })
      );
    }
    if (standardNallaNeram.evening?.length) {
      standardNallaNeram.evening.forEach(slot =>
        nallaNeramRows.push({
          label: L.evening,
          value: formatNeramSlot(slot, lang),
        })
      );
    }
  }
  if (!nallaNeramRows.length) nallaNeramRows = [{ label: '', value: L.none }];

  // ── 3. Gowri Nalla Neram ──────────────────────────────────────────────────
  const gowriData = jsonobj?.gowriNallaNeram || { daySlots: [], nightSlots: [] };
  const daySlots   = gowriData.daySlots   || [];
  const nightSlots = gowriData.nightSlots || [];

  const getAmirdhaSlots = (slots) =>
    slots.filter(s => {
      const name = s.name?.trim()?.toLowerCase() || '';
      return name === 'அமிர்த' || name === 'amirdha' || name === 'amirtha' || name === 'amrita';
    });

  const dayAmirdhaList   = getAmirdhaSlots(daySlots);
  const nightAmirdhaList = getAmirdhaSlots(nightSlots);

  const formatGowriTimeRange = (timeRange) => {
    if (!timeRange) return L.none;
    return formatNeramSlot(timeRange, lang);
  };

  let gowriRows = []; // { label, value }
  if (dayAmirdhaList.length) {
    dayAmirdhaList.forEach(s => gowriRows.push({
      label: L.morning,
      value: formatGowriTimeRange(s.timeRange),
    }));
  } else {
    gowriRows.push({ label: L.morning, value: L.none });
  }
  if (nightAmirdhaList.length) {
    nightAmirdhaList.forEach(s => gowriRows.push({
      label: L.evening,
      value: formatGowriTimeRange(s.timeRange),
    }));
  } else {
    gowriRows.push({ label: L.evening, value: L.none });
  }

  // ── 4. Tithi ──────────────────────────────────────────────────────────────
  const tithiName = formatTithiName(pan?.tithi?.name, pan?.tithi?.type, lang);
  const tithiTime = fmtRelativeRange(pan?.tithi?.start, pan?.tithi?.end, todayDateStr, lang);

  // ── 5. Abhijit ────────────────────────────────────────────────────────────
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

  // ── 6. Asubha values ──────────────────────────────────────────────────────
  const rahukaalVal = fmtAsubha(pan?.rahukaal, todayDateStr, lang);
  const gulikaalVal = fmtAsubha(pan?.gulika, todayDateStr, lang);
  const yamghantVal = fmtAsubha(pan?.yamakanta, todayDateStr, lang);

  // ── 7. Chandrashtama ──────────────────────────────────────────────────────
  const chandrashtama = jsonobj?.chandrashtama || '-';

  // ── 8. Element values: Nakshatra / Yog / Karan / Disha Shool ─────────────
  const nakshatraName = translateNakshatra(pan?.nakshatra?.name, lang);
  const nakshatraTime = fmtRelativeRange(pan?.nakshatra?.start, pan?.nakshatra?.end, todayDateStr, lang);

  const yogName = translateYoga(pan?.yoga?.name, lang);
  const yogTime = fmtRelativeRange(pan?.yoga?.start, pan?.yoga?.end, todayDateStr, lang);

  const karanName = translateKarana(pan?.karana?.name, lang);
  const karanTime = fmtRelativeRange(pan?.karana?.start, pan?.karana?.end, todayDateStr, lang);

  const dishaShoolName = translateDisha(adv?.disha_shool, lang);

  const dateStr = pan?.date || '';

  // ── Helper: render rows for nalla neram / gowri ──────────────────────────
  const renderSubRows = (rows) =>
    rows.map(r => `
      <div class="sub-row">
        ${r.label ? `<span class="sr-label">${r.label}</span>` : ''}
        <span class="sr-value">${r.value}</span>
      </div>`).join('');

  // ── Final HTML ─────────────────────────────────────────────────────────────
  return `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;700;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @page { size: 210mm 297mm; margin: 0; }

        :root {
          --maroon: #8B2E1F;
          --gold: #C98A2B;
          --gold-line: #E8C77A;
          --gold-dark: #8B5E22;
          --cream: #FFF8E7;
          --indigo: #2A2570;
          --ink: #2C2C2A;
          --muted: #5F5E5A;
          --rahu-bg: #FAECE7; --rahu-tag:#993C1D; --rahu-val:#4A1B0C;
          --guli-bg: #EAF3DE; --guli-tag:#3B6D11; --guli-val:#173404;
          --yama-bg: #FBEAF0; --yama-tag:#993556; --yama-val:#4B1528;
        }

        body {
          font-family: 'Noto Sans Tamil', sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          background: var(--cream);
          padding: 14px;
          color: var(--ink);
        }

        .page-container { max-width: 440px; margin: 0 auto; }

        /* ── Kolam dot divider ───────────────────────────────────────────── */
        .kolam {
          height: 7px;
          background-image: radial-gradient(circle, var(--gold) 1.3px, transparent 1.5px);
          background-size: 12px 7px;
          background-repeat: repeat-x;
          background-position: center;
          opacity: .55;
        }

        /* ── Letterhead ──────────────────────────────────────────────────── */
        .letterhead {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding-bottom: 8px;
          text-align: center;
        }
        .lh-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lh-photo {
          width: 56px; height: 56px;
          border-radius: 8px; object-fit: cover;
          border: 2px solid var(--maroon); flex-shrink: 0;
        }
        .lh-text { flex: 1; min-width: 0; }
        .lh-name { font-size: 17px; font-weight: 800; color: var(--indigo); letter-spacing: .3px; }
        .lh-meta { font-size: 11px; color: var(--muted); margin-top: 2px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .lh-meta-item { display: flex; align-items: center; gap: 3px; }
        .lh-meta-icon { color: var(--maroon); }
        .lh-om { font-size: 20px; color: var(--gold); flex-shrink: 0; }
        .lh-divider { margin: 8px 0 10px; }

        /* ── Master ledger card ──────────────────────────────────────────── */
        .almanac { border: 1.5px solid var(--gold-line); border-radius: 12px; overflow: hidden; background: #fff; }

        .almanac-caption {
          background: var(--maroon);
          color: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 9px 13px;
        }
        .almanac-caption h1 { font-size: 14px; font-weight: 800; }
        .almanac-caption .date { font-size: 10.5px; opacity: .9; }

        /* ── Hero tithi band ─────────────────────────────────────────────── */
        .hero-tithi {
          margin: 11px 13px 4px;
          background: linear-gradient(135deg, var(--gold), var(--maroon));
          border-radius: 9px;
          padding: 10px 13px;
          text-align: center;
          color: #fff;
        }
        .hero-tag   { font-size: 9.5px; letter-spacing: 1.4px; text-transform: uppercase; opacity: .85; }
        .hero-title { font-size: 19px; font-weight: 800; margin-top: 1px; }
        .hero-sub   { font-size: 11px; margin-top: 3px; opacity: .95; line-height: 1.35; }

        /* ── Quad grid ───────────────────────────────────────────────────── */
        .quad {
          display: grid;
          grid-template-columns: 1fr 1fr;
          margin: 8px 13px 0;
          border: 1px solid #EFE2C0;
          border-radius: 8px;
          overflow: hidden;
        }
        .quad .cell {
          padding: 7px 10px;
          border-right: 1px dashed var(--gold-line);
          border-bottom: 1px dashed var(--gold-line);
        }
        .quad .cell:nth-child(2n)       { border-right: none; }
        .quad .cell:nth-last-child(-n+2) { border-bottom: none; }
        .cell-label { font-size: 10px; text-transform: uppercase; letter-spacing: .4px; color: var(--gold-dark); font-weight: 700; }
        .cell-value { font-size: 14px; font-weight: 800; margin-top: 1px; }
        .cell-sub   { font-size: 10px; color: var(--muted); font-weight: 500; margin-top: 2px; line-height: 1.4; }

        /* ── Section bar ─────────────────────────────────────────────────── */
        .section-bar {
          display: flex; align-items: center; gap: 6px;
          margin: 10px 13px 5px;
          font-size: 11px; font-weight: 800;
          border-bottom: 1.5px solid var(--gold-line);
          padding-bottom: 4px;
        }
        .section-bar.subha  { color: var(--maroon); }
        .section-bar.asubha { color: var(--rahu-tag); border-bottom-color: #F0997B; }

        /* ── Rows (muhurtha list) ─────────────────────────────────────────── */
        .rows { padding: 0 13px; }
        .row {
          display: flex; justify-content: space-between;
          align-items: flex-start; gap: 10px;
          padding: 6px 0;
          border-bottom: 1px dashed rgba(139,46,31,.15);
          font-size: 12.5px;
        }
        .row:last-child { border-bottom: none; }
        .row .r-label { color: var(--muted); white-space: nowrap; flex-shrink: 0; }
        .row .r-value { font-weight: 700; text-align: right; }

        /* ── Sub-rows inside a .row (for nalla neram, gowri) ─────────────── */
        .sub-rows-wrap { text-align: right; }
        .sub-row {
          display: flex; justify-content: flex-end; align-items: center; gap: 6px;
          font-size: 12px; line-height: 1.5;
        }
        .sr-label {
          font-size: 10px; font-weight: 700;
          background: #FFF0D6; color: var(--gold-dark);
          border-radius: 4px; padding: 0 5px;
          white-space: nowrap;
        }
        .sr-value { font-weight: 700; }

        /* ── Asubha chip row ─────────────────────────────────────────────── */
        .chips { display: flex; gap: 7px; padding: 0 13px 11px; }
        .chip { flex: 1; border-radius: 7px; padding: 6px 8px; text-align: center; }
        .chip .c-label { font-size: 12px; font-weight: 800; }
        .chip .c-value { font-size: 11px; font-weight: 700; margin-top: 1px; }
        .chip.rahu { background: var(--rahu-bg); }
        .chip.rahu .c-label { color: var(--rahu-tag); }
        .chip.rahu .c-value { color: var(--rahu-val); }
        .chip.guli { background: var(--guli-bg); }
        .chip.guli .c-label { color: var(--guli-tag); }
        .chip.guli .c-value { color: var(--guli-val); }
        .chip.yama { background: var(--yama-bg); }
        .chip.yama .c-label { color: var(--yama-tag); }
        .chip.yama .c-value { color: var(--yama-val); }

        /* ── Chandrashtama block ─────────────────────────────────────────── */
        .chandra { margin: 0 13px 12px; background: #FAEEDA; border-radius: 8px; padding: 8px 11px; }
        .chandra .c-tag  { font-size: 10.5px; font-weight: 800; color: #854F0B; margin-bottom: 2px; }
        .chandra .c-text { font-size: 11.5px; color: #412402; line-height: 1.4; }

        /* ── Footer ──────────────────────────────────────────────────────── */
        .footer { margin-top: 10px; text-align: center; }
        .footer .kolam { margin-bottom: 6px; }
        .copyright-text { font-size: 10.5px; color: #888; letter-spacing: 1px; }

        @media print { body { background: #fff; } }
      </style>
    </head>
    <body>
      <div class="page-container">

        <!-- ══ LETTERHEAD ══ -->
        ${(astrologerName || astrologerPhone || astrologerLocation) ? `
        <div class="letterhead">
          <div class="lh-om">🕉</div>
          <div class="lh-row">
            ${astrologerPhoto ? `<img class="lh-photo" src="${astrologerPhoto}" alt="photo" />` : ''}
            <div class="lh-text">
              ${astrologerName ? `<div class="lh-name">${astrologerName}</div>` : ''}
              <div class="lh-meta">
                ${astrologerPhone    ? `<span class="lh-meta-item"><span class="lh-meta-icon">📞</span>${astrologerPhone}</span>` : ''}
                ${astrologerLocation ? `<span class="lh-meta-item"><span class="lh-meta-icon">📍</span>${astrologerLocation}</span>` : ''}
              </div>
            </div>
          </div>
        </div>
        <div class="kolam lh-divider"></div>
        ` : ''}

        <!-- ══ MASTER ALMANAC LEDGER ══ -->
        <div class="almanac">

          <div class="almanac-caption">
            <h1>${L.title}</h1>
            <div class="date">${dateStr}</div>
          </div>

          <!-- ══ TITHI HERO ══ -->
          <div class="hero-tithi">
            <div class="hero-tag">${L.tithi}</div>
            <div class="hero-title">${tithiName || '-'}</div>
            <div class="hero-sub">${tithiTime}</div>
          </div>

          <!-- ══ QUAD: SUNRISE / SUNSET / NAKSHATRA / YOG / KARAN / SHOOL ══ -->
          <div class="quad">
            <div class="cell">
              <div class="cell-label">${L.sunrise}</div>
              <div class="cell-value">${sunriseVal}</div>
            </div>
            <div class="cell">
              <div class="cell-label">${L.sunset}</div>
              <div class="cell-value">${sunsetVal}</div>
            </div>
            <div class="cell">
              <div class="cell-label">${L.nakshatra}</div>
              <div class="cell-value">${nakshatraName || '-'}</div>
              <div class="cell-sub">${nakshatraTime}</div>
            </div>
            <div class="cell">
              <div class="cell-label">${L.yog}</div>
              <div class="cell-value">${yogName || '-'}</div>
              <div class="cell-sub">${yogTime}</div>
            </div>
            <div class="cell">
              <div class="cell-label">${L.karan}</div>
              <div class="cell-value">${karanName || '-'}</div>
              <div class="cell-sub">${karanTime}</div>
            </div>
            <div class="cell">
              <div class="cell-label">${L.shool}</div>
              <div class="cell-value">${dishaShoolName}</div>
            </div>
          </div>

          <!-- ══ MUHURTHA ROWS ══ -->
          <div class="section-bar subha">${L.subhaMuhurtha}</div>
          <div class="rows">

            <!-- Abhijit -->
            <div class="row">
              <span class="r-label">${L.abhijit}</span>
              <span class="r-value">${abhijitTime}</span>
            </div>

            <!-- Nalla Neram — one sub-row per slot -->
            <div class="row">
              <span class="r-label">${L.nallaNeram}</span>
              <div class="sub-rows-wrap">
                ${renderSubRows(nallaNeramRows)}
              </div>
            </div>

            <!-- Gowri Nalla Neram — காலை / மாலை sub-rows -->
            <div class="row">
              <span class="r-label">${L.gowriNallaNeram}</span>
              <div class="sub-rows-wrap">
                ${renderSubRows(gowriRows)}
              </div>
            </div>

          </div>

          <!-- ══ ASUBHA CHIPS ══ -->
          <div class="section-bar asubha">${L.asubhaMuhurtha}</div>
          <div class="chips">
            <div class="chip rahu">
              <div class="c-label">${L.rahukaal}</div>
              <div class="c-value">${rahukaalVal}</div>
            </div>
            <div class="chip guli">
              <div class="c-label">${L.gulikaal}</div>
              <div class="c-value">${gulikaalVal}</div>
            </div>
            <div class="chip yama">
              <div class="c-label">${L.yamghant}</div>
              <div class="c-value">${yamghantVal}</div>
            </div>
          </div>

          <!-- ══ CHANDRASHTAMA ══ -->
          <div class="chandra">
            <div class="c-tag">${L.chandrashtama}</div>
            <div class="c-text">${chandrashtama}</div>
          </div>

        </div>

        <div class="footer">
          <div class="kolam"></div>
          <div class="copyright-text">@Astroayan</div>
        </div>

      </div>
    </body>
    </html>
  `;
};
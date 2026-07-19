/**
 * panchangLogic.js
 * Shared logic for Daily Panchang Report
 * Variable names aligned with PanchangScreen.js API response structure:
 *   panchang.response  → pan
 *   pan.advanced_details → adv
 *   adv.masa → masa
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
    chandrashtama: 'சந்திராஷ்டமம்'
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
    chandrashtama: 'Chandrashtamam'
  },
};

const NAKSHATRA_TRANSLATIONS = {
  'Ashwini': 'அசுவினி', 'Bharani': 'பரணி', 'Krittika': 'கார்த்திகை',
  'Rohini': 'ரோகிணி', 'Mrigashirsha': 'மிருகசீரிடம்', 'Ardra': 'திருவாதிரை',
  'Punarvasu': 'புனர்பூசம்', 'Pushya': 'பூசம்', 'Ashlesha': 'ஆயில்யம்',
  'Magha': 'மகம்', 'Purva Phalguni': 'பூரம்', 'Uttara Phalguni': 'உத்திரம்',
  'Hasta': 'அஸ்தம்', 'Chitra': 'சித்திரை', 'Swati': 'சுவாதி',
  'Visakha': 'விசாகம்', 'Anuradha': 'அனுஷம்', 'Jyeshtha': 'கேட்டை',
  'Moola': 'மூலம்', 'Purva Ashadha': 'பூராடம்', 'Uttara Ashadha': 'உத்திராடம்',
  'Shravana': 'திருவோணம்', 'Dhanishta': 'அவிட்டம்', 'Shatabhisha': 'சதயம்',
  'Purva Bhadrapada': 'பூரட்டாதி', 'Uttara Bhadrapada': 'உத்திரட்டாதி', 'Revati': 'ரேவதி'
};

const translateNakshatra = (name, lang) => {
  if (!name) return '-';
  if (lang !== 'ta') return name;
  const cleanName = name.trim();
  return NAKSHATRA_TRANSLATIONS[cleanName] || cleanName;
};

const toDate = (t) => {
  if (!t) return null;
  if (typeof t === 'string') {
    if (t.includes('T')) {
      const timePart = t.split('T')[1].split('+')[0];
      const [h = 0, m = 0, s = 0] = timePart.split(':').map(Number);
      return { hour: h, minute: m, second: s };
    }
    const [h = 0, m = 0, s = 0] = t.split(':').map(Number);
    return { hour: h, minute: m, second: s };
  }
  return t;
};

// ── Tamil time-string parser ───────────────────────────────────────────────
// Handles strings like: "அதிகாலை 5:59 மணி", "மாலை 6:45 மணி", "இரவு 2:10 மணி"
const TAMIL_PERIOD_MAP = {
  'அதிகாலை': 'AM',  // pre-dawn
  'காலை':    'AM',  // morning
  'மதியம்':  'PM',  // afternoon / noon
  'பிற்பகல்':'PM',  // post-noon
  'மாலை':    'PM',  // evening
  'இரவு':    null,  // night — resolved by hour (< 6 → AM, else PM)
};

const parseTamilTimeStr = (str) => {
  if (!str || typeof str !== 'string') return null;

  for (const [period, ampm] of Object.entries(TAMIL_PERIOD_MAP)) {
    if (!str.includes(period)) continue;

    const match = str.match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;

    const hour   = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    // இரவு: hours 1–5 are past midnight (AM), 6–11 are evening (PM)
    const resolvedAmpm = ampm ?? (hour < 6 ? 'AM' : 'PM');

    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hour)}:${pad(minute)} ${resolvedAmpm}`;
  }
  return null; // not a Tamil time string
};

const MONTH_MAP = {
  'ஜனவரி': 0, 'பிப்ரவரி': 1, 'மார்ச்': 2, 'ஏப்ரல்': 3,
  'மே': 4, 'ஜூன்': 5, 'ஜூலை': 6, 'ஆகஸ்ட்': 7,
  'செப்டம்பர்': 8, 'அக்டோபர்': 9, 'நவம்பர்': 10, 'டிசம்பர்': 11,
};

const parseTamilFullDateStr = (str) => {
  if (!str || typeof str !== 'string') return null;
  let month = -1;
  for (const [tamilMonth, mNum] of Object.entries(MONTH_MAP)) {
    if (str.includes(tamilMonth)) { month = mNum; break; }
  }
  const dayMatch  = str.match(/(\d{1,2})\s+\d{4}/);
  const yearMatch = str.match(/\d{4}/);
  if (!dayMatch || !yearMatch || month === -1) return null;
  const day  = parseInt(dayMatch[1], 10);
  const year = parseInt(yearMatch[0], 10);
  const timeMatch = str.match(/(\d{1,2}):(\d{2})/);
  if (!timeMatch) return null;
  let hour   = parseInt(timeMatch[1], 10);
  const minute = parseInt(timeMatch[2], 10);
  if ((str.includes('மாலை') || str.includes('இரவு') || str.includes('மதியம்') || str.includes('பிற்பகல்')) && hour < 12) {
    hour += 12;
  }
  return new Date(year, month, day, hour, minute, 0);
};

const toTamilTimePeriod = (str) => {
  if (str.includes('அதிகாலை')) return 'அதிகாலை';
  if (str.includes('காலை'))    return 'காலை';
  if (str.includes('மதியம்'))  return 'மதியம்';
  if (str.includes('பிற்பகல்'))return 'பிற்பகல்';
  if (str.includes('மாலை'))   return 'மாலை';
  if (str.includes('இரவு'))    return 'இரவு';
  return '';
};

// ── Resolve 24h hour → Tamil period label ────────────────────────────────
// Rules:
//   00:00–00:59  → நேற்று நள்ளிரவு  (yesterday's auspicious night / midnight)
//   01:00–05:59  → அதிகாலை          (pre-dawn)
//   06:00–11:59  → காலை             (morning)
//   12:00–13:59  → மதியம்           (noon/afternoon)
//   14:00–16:59  → பிற்பகல்         (post-noon)
//   17:00–19:59  → மாலை            (evening)
//   20:00–23:59  → இரவு            (night)
const hourToTamilPeriod = (hour24) => {
  if (hour24 === 0)              return 'நேற்று நள்ளிரவு';
  if (hour24 >= 1 && hour24 < 6) return 'அதிகாலை';
  if (hour24 < 12)               return 'காலை';
  if (hour24 < 14)               return 'மதியம்';
  if (hour24 < 17)               return 'பிற்பகல்';
  if (hour24 < 20)               return 'மாலை';
  return 'இரவு';
};

// ── Convert a Tamil full date string → { relLabel, period, hhmm, ampm } ──
const parseTamilTimeComponents = (str, todayDateStr) => {
  if (!str || typeof str !== 'string') return null;

  const dt = parseTamilFullDateStr(str);
  const todayDt = parseTamilFullDateStr((todayDateStr || '') + ' காலை 12:00 மணி');

  let relLabel = 'இன்று';
  let hour24   = null;
  let minute   = null;

  if (dt) {
    hour24 = dt.getHours();
    minute = dt.getMinutes();
    if (todayDt) {
      const diffDays = Math.round((dt - todayDt) / (1000 * 60 * 60 * 24));
      if (diffDays <= -1)     relLabel = 'நேற்று';
      else if (diffDays >= 1) relLabel = 'நாளை';
    }
  } else {
    // No full date — try to extract time + period from the raw string
    const rawParsed = parseTamilTimeStr(str);
    if (!rawParsed) return null;
    const [hm, ap] = rawParsed.split(' ');
    const [h, m] = hm.split(':').map(Number);
    // convert to rough 24h for period detection
    if (ap === 'PM' && h < 12) hour24 = h + 12;
    else if (ap === 'AM' && h === 12) hour24 = 0;
    else hour24 = h;
    minute = m;
    relLabel = null; // no date info
  }

  const period = hourToTamilPeriod(hour24);
  const pad    = (n) => String(n).padStart(2, '0');
  // Display hour: use 12h format but keep original hour digits for readability
  // For அதிகாலை/இரவு etc., show as-is (e.g., 02:30)
  const displayHour = hour24 % 12 || 12;
  const ampm = hour24 < 12 ? 'AM' : 'PM';
  const hhmm = `${pad(displayHour)}:${pad(minute)}`;

  // special midnight label already embedded in period
  if (hour24 === 0) {
    return { relLabel: relLabel || '', period: 'நேற்று நள்ளிரவு', hhmm, ampm };
  }

  return { relLabel: relLabel || '', period, hhmm, ampm };
};

// ── Format a single Tamil time string → "இன்று காலை 07:11 AM" ────────────
const toTamilRelativeTime = (str, todayDateStr) => {
  const parts = parseTamilTimeComponents(str, todayDateStr);
  if (!parts) return '-';
  const { relLabel, period, hhmm, ampm } = parts;
  const prefix = relLabel ? `${relLabel} ` : '';
  return `${prefix}${period} ${hhmm} ${ampm}`;
};

// ── Format a start–end range: "இன்று காலை 07:11 AM முதல் காலை 08:48 AM வரை" ──
const fmtRelativeRange = (startStr, endStr, todayDateStr) => {
  if (!startStr && !endStr) return '-';
  const s = startStr ? toTamilRelativeTime(startStr, todayDateStr) : null;
  const e = endStr   ? toTamilRelativeTime(endStr,   todayDateStr) : null;
  if (s && e) return `${s} முதல் ${e} வரை`;
  if (e)      return `${e} வரை`;
  return s || '-';
};

const fmtTime = (t) => {
  if (typeof t === 'string') {
    const tamilResult = parseTamilTimeStr(t);
    if (tamilResult) return tamilResult;
  }
  const d = toDate(t);
  if (!d) return '-';
  const pad  = (n) => String(n).padStart(2, '0');
  const h12  = d.hour % 12 || 12;
  const ampm = d.hour < 12 ? 'AM' : 'PM';
  return `${pad(h12)}:${pad(d.minute)} ${ampm}`;
};

const fmtRange = (obj) => {
  if (!obj) return '-';
  const s = fmtTime(obj.start || obj.start_time);
  const e = fmtTime(obj.end   || obj.end_time);
  return s === '-' ? '-' : `${s} – ${e}`;
};

const fmt12 = (t) => {
  if (!t) return '-';
  const parts = t.split(':');
  if (parts.length === 2) parts.push('00');
  return fmtTime(parts.join(':'));
};

// ── Format nalla neram slot string → "07:30 AM - 08:30 AM" ──────────────
// Input:  "காலை 07:30 மணி முதல் காலை 08:30 மணி வரை"  (or similar)
const formatNeramSlotWithAMPM = (slotStr) => {
  if (!slotStr) return '-';
  // Match all time tokens with period prefixes
  const regex = /(அதிகாலை|காலை|மதியம்|பிற்பகல்|மாலை|இரவு)\s*(\d{1,2}):(\d{2})/g;
  const matches = [...slotStr.matchAll(regex)];
  if (matches.length < 2) {
    // fallback — just strip to hh:mm pairs
    const simple = slotStr.match(/\d{1,2}:\d{2}/g);
    return simple ? simple.join(' - ') : slotStr;
  }
  const fmt = (m) => {
    const period = m[1];
    const h = parseInt(m[2], 10);
    const min = m[3];
    const isAM = (period === 'காலை' || period === 'அதிகாலை');
    const ampm = isAM ? 'AM' : 'PM';
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(h)}:${min} ${ampm}`;
  };
  return `${fmt(matches[0])} - ${fmt(matches[1])}`;
};

export const generatePanchangHTML = (jsonobj, lang, user) => {
  // ── Align with PanchangScreen.js API shape ─────────────────────────────────
  console.log('in generatePanchangHTML', jsonobj)
  const pan  = jsonobj?.panchang?.response || jsonobj?.response || jsonobj;
  const todayDateStr = pan?.date || '';
  const astrologerName     = user?.name     || '';
  const astrologerPhone    = user?.phone    || '';
  const astrologerLocation = user?.location || '';
  const astrologerPhoto    = user?.photo_url    || '';

  const adv  = pan?.advanced_details || {};
  const masa = adv?.masa || {};

  const planetsRaw = jsonobj?.planets?.response
                  || jsonobj?.planets
                  || jsonobj?.response
                  || {};

  const planets = Array.isArray(planetsRaw)
    ? planetsRaw
    : Object.entries(planetsRaw)
        .filter(([key, val]) =>
          !isNaN(Number(key)) &&
          val &&
          typeof val === 'object' &&
          val.rasi_no != null
        )
        .map(([_, val]) => val);

  const L = LABELS[lang] || LABELS.ta;

  const planetNameMap = {
    'வியாழன்': 'குரு',
    'வெள்ளி':  'சுக்ரன்',
    'லக்னம்':  'லக்',
    'Ascendant': 'Asc',
  };

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
          label: lang === 'ta' ? 'காலை' : 'Morning',
          value: formatNeramSlotWithAMPM(slot),
        })
      );
    }
    if (standardNallaNeram.evening?.length) {
      standardNallaNeram.evening.forEach(slot =>
        nallaNeramRows.push({
          label: lang === 'ta' ? 'மாலை' : 'Evening',
          value: formatNeramSlotWithAMPM(slot),
        })
      );
    }
  }
  if (!nallaNeramRows.length) nallaNeramRows = [{ label: '', value: lang === 'ta' ? 'இல்லை' : 'None' }];

  // ── 3. Gowri Nalla Neram ──────────────────────────────────────────────────
  const gowriData = jsonobj?.gowriNallaNeram || { daySlots: [], nightSlots: [] };
  const daySlots   = gowriData.daySlots   || [];
  const nightSlots = gowriData.nightSlots || [];

  const getAmirdhaSlots = (slots) => {
    return slots.filter((slot) => {
      const n = slot.name?.trim()?.toLowerCase();
      return n === 'அமிர்த' || n === 'amirdha' || n === 'amirtha';
    });
  };

  const noneLabel  = lang === 'ta' ? 'இல்லை' : 'None';

  const dayAmirdhaList   = getAmirdhaSlots(daySlots);
  const nightAmirdhaList = getAmirdhaSlots(nightSlots);

  // Format each Gowri slot timeRange with AM/PM
  const formatGowriTimeRange = (timeRange) => {
    if (!timeRange) return noneLabel;
    return formatNeramSlotWithAMPM(timeRange);
  };

  let gowriRows = []; // { label, value }
  if (dayAmirdhaList.length) {
    dayAmirdhaList.forEach(s => gowriRows.push({
      label: lang === 'ta' ? 'காலை' : 'Morning',
      value: formatGowriTimeRange(s.timeRange),
    }));
  } else {
    gowriRows.push({ label: lang === 'ta' ? 'காலை' : 'Morning', value: noneLabel });
  }
  if (nightAmirdhaList.length) {
    nightAmirdhaList.forEach(s => gowriRows.push({
      label: lang === 'ta' ? 'மாலை' : 'Evening',
      value: formatGowriTimeRange(s.timeRange),
    }));
  } else {
    gowriRows.push({ label: lang === 'ta' ? 'மாலை' : 'Evening', value: noneLabel });
  }

  // ── 4. Tithi ──────────────────────────────────────────────────────────────
  const formatTithiName = (name) => {
    if (!name) return name;
    return name
      .replace(/சுக்ல/g,   'வளர்பிறை')
      .replace(/கிருஷ்ணா/g, 'தேய்பிறை')
      .replace(/Shukla/gi,  'Valarpirai')
      .replace(/Krishna/gi, 'Theipirai');
  };

  const tithiName = formatTithiName(pan?.tithi?.name);
  const tithiTime = fmtRelativeRange(pan?.tithi?.start, pan?.tithi?.end, todayDateStr);
  const abhijitTime = fmtRelativeRange(adv?.abhijit_muhurta?.start, adv?.abhijit_muhurta?.end, todayDateStr);

  // ── 5. Asubha values ──────────────────────────────────────────────────────
  const fmtAsubha = (val) => {
    if (!val) return '-';
    if (typeof val === 'string') return val;
    return fmtRange(val);
  };

  const rahukaalVal  = fmtAsubha(pan?.rahukaal);
  const gulikaalVal  = fmtAsubha(pan?.gulika);
  const yamghantVal  = fmtAsubha(pan?.yamakanta);

  // ── 6. Chandrashtama ──────────────────────────────────────────────────────
  const chandrashtama = jsonobj?.chandrashtama || '-';

  // ── 7. Element values: Nakshatra / Yog / Karan / Disha Shool ─────────────
  const nakshatraName = translateNakshatra(pan?.nakshatra?.name, lang) || pan?.nakshatra?.name;
  const nakshatraTime = fmtRelativeRange(pan?.nakshatra?.start, pan?.nakshatra?.end, todayDateStr);

  const yogName = pan?.yoga?.name;
  const yogTime = fmtRelativeRange(pan?.yoga?.start, pan?.yoga?.end, todayDateStr);

  const karanName = pan?.karana?.name;
  const karanTime = fmtRelativeRange(pan?.karana?.start, pan?.karana?.end, todayDateStr);

  const dishaShoolName = adv?.disha_shool || '-';

  // ── Abhijit Muhurtha — build sub-rows (label from start-time period) ─────
  const buildAbhijitRows = () => {
    const start = adv?.abhijit_muhurta?.start;
    const end   = adv?.abhijit_muhurta?.end;
    if (!start && !end) return [{ label: '', value: '-' }];

    const startParts = start ? parseTamilTimeComponents(start, todayDateStr) : null;
    const endParts   = end   ? parseTamilTimeComponents(end,   todayDateStr) : null;

    // Derive the label (காலை / மாலை etc.) from the start time period
    const periodLabel = startParts?.period || endParts?.period || '';

    const startFmt = startParts ? `${startParts.hhmm} ${startParts.ampm}` : '-';
    const endFmt   = endParts   ? `${endParts.hhmm} ${endParts.ampm}`     : '-';
    const value    = (startParts && endParts) ? `${startFmt} - ${endFmt}` : (startFmt !== '-' ? startFmt : endFmt);

    return [{ label: periodLabel, value }];
  };
  const abhijitRows = buildAbhijitRows();

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
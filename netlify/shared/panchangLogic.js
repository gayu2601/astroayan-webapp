/**
 * panchangLogic.js - FIXED VERSION
 * Correctly handles full Tamil date strings with period names
 * "திங்கள் ஜூன் 29 2026 இரவு 2:41 மணி" → "இன்று அதிகாலை 2:41"
 */

const LABELS = {
  ta: {
    title:          'இன்றைய பஞ்சாங்கம்',
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
    dishaShool:     'திசா சூல்',
    horaDayPeriod:  'பகல்',
    horaNightPeriod:'இரவு',
    headers: ["கிரகம்", "ராசி", "பாகை", "நட்சத்திரம்", "பாதம்"],
    shool: 'சூலம்',
    nallaNeram: 'நல்ல நேரம்',
    gowriNallaNeram: 'கௌரி நல்ல நேரம்',
    chandrashtama: 'சந்திராஷ்டமம்'
  },

  en: {
    title:          'Today Panchang',
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
    dishaShool:     'Disha Shool',
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

// ── FIX: Parse Tamil full date and convert hour to 24-hour format ──────────
// Input: "திங்கள் ஜூன் 29 2026 இரவு 2:41 மணி"
// Output: Date object with correct 24-hour time + detected period
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
  
  // ── Infer 24-hour format based on period ──────────────────────────────
  if (str.includes('மதியம்') || str.includes('பிற்பகல்') || str.includes('மாலை')) {
    // Afternoon/evening: if hour < 12, add 12
    if (hour < 12) hour += 12;
  } else if (str.includes('இரவு')) {
    // Night: 11 PM (23:00) or 2 AM (02:00)?
    // If hour >= 5, it's likely PM, so add 12
    // If hour < 5, it's early morning (past midnight), keep as-is
    if (hour >= 5 && hour < 12) hour += 12;
  }
  // அதிகாலை, காலை: AM periods, hour stays as-is
  
  return new Date(year, month, day, hour, minute, 0);
};

// ── FIX: Infer correct Tamil period based on 24-hour time ──────────────────
const inferTamilPeriod = (hour) => {
  if (hour >= 0 && hour < 5) {
    return 'அதிகாலை'; // 0:00 – 4:59 = pre-dawn
  } else if (hour >= 5 && hour < 12) {
    return 'காலை'; // 5:00 – 11:59 = morning
  } else if (hour >= 12 && hour < 16) {
    return 'மதியம்'; // 12:00 – 15:59 = afternoon
  } else if (hour >= 16 && hour < 18) {
    return 'பிற்பகல்'; // 16:00 – 17:59 = post-noon
  } else if (hour >= 18 && hour < 21) {
    return 'மாலை'; // 18:00 – 20:59 = evening
  } else {
    return 'இரவு'; // 21:00 – 23:59 = night
  }
};

const toTamilRelativeTime = (str, todayDateStr) => {
  const dt = parseTamilFullDateStr(str);
  const todayDt = parseTamilFullDateStr((todayDateStr || '') + ' காலை 12:00 மணி');
  
  let relLabel = 'இன்று';
  if (dt && todayDt) {
    const diffDays = Math.round((dt - todayDt) / (1000 * 60 * 60 * 24));
    if (diffDays <= -1)     relLabel = 'நேற்று';
    else if (diffDays >= 1) relLabel = 'நாளை';
  }
  
  // ── FIXED: Infer period from 24-hour time, not from input string ──────
  let period = 'இரவு'; // default fallback
  if (dt) {
    const hour = dt.getHours();
    period = inferTamilPeriod(hour);
  }
  
  const timeOnly = parseTamilTimeStr(str);
  if (!timeOnly) return '-';
  const [hm] = timeOnly.split(' '); // "07:11" from "07:11 AM"
  
  return dt ? `${relLabel} ${period} ${hm}` : `${period} ${hm}`;
};

const fmtRelativeRange = (startStr, endStr, todayDateStr) => {
  if (!startStr && !endStr) return '-';
  const s = startStr ? toTamilRelativeTime(startStr, todayDateStr) : null;
  const e = endStr   ? toTamilRelativeTime(endStr,   todayDateStr) : null;
  if (s && e) return `${s} முதல்\n${e} வரை`;
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

// [Rest of the code remains the same as the original...]
const generatePanchangHTML = (jsonobj, lang) => {
  // ── Align with PanchangScreen.js API shape ─────────────────────────────────
  // PanchangScreen.js:  pan = panchang?.response
  //                     adv = pan?.advanced_details
  //                     masa = adv?.masa
  console.log('in generatePanchangHTML', jsonobj)
  const pan  = jsonobj?.panchang?.response || jsonobj?.response || jsonobj;
  const todayDateStr = pan?.date || '';

	const adv  = pan?.advanced_details || {};
	const masa = adv?.masa || {};

  const planetsRaw = jsonobj?.planets?.response
                  || jsonobj?.planets
                  || jsonobj?.response   // ← planets are keyed "0"–"9" inside response
                  || {};

  const planets = Array.isArray(planetsRaw)
    ? planetsRaw
    : Object.entries(planetsRaw)
        .filter(([key, val]) =>
          !isNaN(Number(key)) &&        // only numeric keys "0"–"9" are planets
          val &&
          typeof val === 'object' &&
          val.rasi_no != null           // must have a valid rasi_no to be placed
        )
        .map(([_, val]) => val);

  const L = LABELS[lang] || LABELS.ta;

  const planetNameMap = {
  'வியாழன்': 'குரு',
  'வெள்ளி':  'சுக்ரன்',
  'லக்னம்':  'லக்',     // ← use 'லக்' so PLANET_STYLE matches
  'Ascendant': 'Asc',   // ← ADD THIS — maps to existing PLANET_STYLE key
};


  const ELEM_COLORS = {
    tithi:         { label: '#E65100', bg: '#FFF3E0' },
    nakshatra:     { label: '#0277BD', bg: '#E3F2FD' },
    rasi:          { label: '#6A1B9A', bg: '#F3E5F5' },
    karan:         { label: '#4E342E', bg: '#EFEBE9' },
    yog:           { label: '#2E7D32', bg: '#E8F5E9' },
    namayog:       { label: '#5C6BC0', bg: '#E8EAF6' },
    orai:          { label: '#AD1457', bg: '#FCE4EC' },
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
		<div class="tile-val" style="font-size: 15px;">${val || '-'}</div>
	  </div>
	`;
  }).join('');

  // ── 2. Nalla Neram ────────────────────────────────────────────────────────
  const standardNallaNeram = jsonobj?.standardNallaNeram || null;

  const formatNeramSlot = (slotStr) => {
    if (!slotStr) return '-';
    const regex = /(காலை|மாலை)\s*(\d{2}:\d{2}).*?(காலை|மாலை)\s*(\d{2}:\d{2})/;
    const match = slotStr.match(regex);
    if (!match) return slotStr;
    const startPeriod = match[1] === 'காலை' ? 'AM' : 'PM';
    const endPeriod   = match[3] === 'காலை' ? 'AM' : 'PM';
    return `${match[2]} ${startPeriod} - ${match[4]} ${endPeriod}`;
  };

  let standardNallaNeramStr = '-';
  if (standardNallaNeram) {
    const lines = [];
    if (standardNallaNeram.morning?.length) {
      standardNallaNeram.morning.forEach(slot => lines.push(`காலை - ${formatNeramSlot(slot)}`));
    }
    if (standardNallaNeram.evening?.length) {
      standardNallaNeram.evening.forEach(slot => lines.push(`மாலை - ${formatNeramSlot(slot)}`));
    }
    standardNallaNeramStr = lines.length > 0 ? lines.join('\n') : (lang === 'ta' ? 'இல்லை' : 'None');
  }

  // ── 3. Gowri Nalla Neram ──────────────────────────────────────────────────
  const gowriData = jsonobj?.gowriNallaNeram || { daySlots: [], nightSlots: [] };
const daySlots = gowriData.daySlots || [];
const nightSlots = gowriData.nightSlots || [];

let gowriDisplayStr = '-';

// 1. Helper function to find Amirdha occurrences
const getAmirdhaSlots = (slots) => {
  return slots.filter((slot) => {
    const n = slot.name?.trim()?.toLowerCase();
    return n === 'அமிர்த' || n === 'amirdha' || n === 'amirtha';
  });
};

const dayAmirdhaList = getAmirdhaSlots(daySlots);
const nightAmirdhaList = getAmirdhaSlots(nightSlots);

if (dayAmirdhaList.length || nightAmirdhaList.length) {
  const dayLabel = lang === 'ta' ? 'காலை' : 'Morning';
  const nightLabel = lang === 'ta' ? 'மாலை' : 'Evening';
  const noneLabel = lang === 'ta' ? 'இல்லை' : 'None';

  // 2. Convert matches into exact string text formats
  const dayAmirdha = dayAmirdhaList.length ? dayAmirdhaList.map(s => s.timeRange).join(', ') : noneLabel;
  const nightAmirdha = nightAmirdhaList.length ? nightAmirdhaList.map(s => s.timeRange).join(', ') : noneLabel;

  // 3. Render directly using your exact target string format and line height tokens
  gowriDisplayStr = `
    <div style="font-size:15px;">
      <div class="tile-val" style="white-space: pre-line; margin-top: -40px;">${dayLabel}: ${dayAmirdha}</div>
      <div class="tile-val" style="white-space: pre-line; margin-top: -15px; margin-bottom: -70px">${nightLabel}: ${nightAmirdha}</div>
    </div>
  `;
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

  const tithiName  = formatTithiName(pan?.tithi?.name);
  const tithiStart = fmtTime(pan?.tithi?.start);
  const tithiEnd   = fmtTime(pan?.tithi?.end);
  const tithiTime = fmtRelativeRange(pan?.tithi?.start, pan?.tithi?.end, todayDateStr);

	const tithiDisplayStr = `
	  <div style="font-size:14px; font-weight:700; line-height:1.6; white-space:pre-line; margin-top: -30px;">
		<div style="color:#E65100; margin-top: -10px">${tithiName || '-'}</div>
        <div style="color:#0D47A1 ; margin-top: -20px; margin-bottom: -40px">${tithiTime}</div>
	  </div>
	`;
  // ── 5. Subha Tiles ────────────────────────────────────────────────────────
  const subhaTiles = [
    [L.tithi,           tithiDisplayStr],
    [L.abhijit, fmtRelativeRange(adv?.abhijit_muhurta?.start, adv?.abhijit_muhurta?.end, todayDateStr)],
    [L.nallaNeram,      standardNallaNeramStr],
    [L.gowriNallaNeram, gowriDisplayStr],
  ].map(([label, val], i) => `
    <div class="tile tile--wide" style="background:${MUHU_BGS[i % MUHU_BGS.length]};">
      <div class="tile-lbl" style="color:${MUHU_COLORS[i % MUHU_COLORS.length]};">${label}</div>
      <div class="tile-val" style="white-space: pre-line; margin-top: 5px;">${val}</div>
    </div>
  `).join('');

  // ── 6. Asubha Tiles ───────────────────────────────────────────────────────
  const fmtAsubha = (val) => {
    if (!val) return '-';
    if (typeof val === 'string') return val;
    return fmtRange(val);
  };

  const asubhaTiles = [
    [L.rahukaal, fmtAsubha(pan?.rahukaal)],
    [L.gulikaal, fmtAsubha(pan?.gulika)],
    [L.yamghant, fmtAsubha(pan?.yamakanta)],
  ].map(([label, val], i) => `
    <div class="tile" style="background:${MUHU_BGS[i + 1]};">
      <div class="tile-lbl" style="color:${MUHU_COLORS[i + 1]};">${label}</div>
      <div class="tile-val">${val}</div>
    </div>
  `).join('');

  // ── 7. Chandrashtama ──────────────────────────────────────────────────────
  const chandrashtama = jsonobj?.chandrashtama || null;

  const chandrashtamaTile = `
    <div class="tile" style="background:${ELEM_COLORS.chandrashtama.bg};">
      <div class="tile-lbl" style="color:${ELEM_COLORS.chandrashtama.label};">${L.chandrashtama}</div>
      <div class="tile-val" style="font-size: 13px; white-space: pre-line;">${chandrashtama}</div>
    </div>
  `;

  // ── 8. Element Tiles ──────────────────────────────────────────────────────
  const elementTiles = [
    {
      key:   'nakshatra',
      label: L.nakshatra,
      name:  pan?.nakshatra?.name,
      start: pan?.nakshatra?.start,
      end:   pan?.nakshatra?.end,
    },
    {
      key:   'yog',
      label: L.yog,
      name:  pan?.yoga?.name,
      start: pan?.yoga?.start,
      end:   pan?.yoga?.end,
    },
    {
      key:   'karan',
      label: L.karan,
      name:  pan?.karana?.name,
      start: pan?.karana?.start,
      end:   pan?.karana?.end,
    },
    {
      key:   'shool',
      label: L.shool,
      name:  adv?.disha_shool,
    },
  ].map(({ key, label, name, start, end }) => {
    const c = ELEM_COLORS[key];
    const startTime = fmtTime(start);
    const endTime   = fmtTime(end);
    const timeRange = fmtRelativeRange(start, end, todayDateStr);

    return `
      <div class="tile tile--elem" style="background:${c.bg};">
        <div class="tile-lbl" style="color:${c.label};">${label}</div>
        <span class="tile-elem" style="color:#B71C1C;">${name || '-'}</span>
		<span class="tile-elem" style="color:#0D47A1 ;">${timeRange}</span>
      </div>
    `;
  }).join('');

  // ── 9. Rasi Kattam ────────────────────────────────────────────────────────
  const CELL_TO_SIGN = {
    0: 12, 1: 1,  2: 2,  3: 3,
    4: 11,              7: 4,
    8: 10,              11: 5,
    12: 9, 13: 8, 14: 7, 15: 6,
  };

  const SIGN_NAMES_TA = {
    1: 'மேஷம்',    2: 'ரிஷபம்',      3: 'மிதுனம்',
    4: 'கடகம்',    5: 'சிம்மம்',     6: 'கன்னி',
    7: 'துலாம்',   8: 'விருச்சிகம்',  9: 'தனுசு',
    10: 'மகரம்',  11: 'கும்பம்',     12: 'மீனம்',
  };
  const SIGN_NAMES_EN = {
    1: 'Aries',  2: 'Taurus',     3: 'Gemini',
    4: 'Cancer', 5: 'Leo',        6: 'Virgo',
    7: 'Libra',  8: 'Scorpio',    9: 'Sagittarius',
    10: 'Capricorn', 11: 'Aquarius', 12: 'Pisces',
  };
  const SIGN_NAMES = lang === 'ta' ? SIGN_NAMES_TA : SIGN_NAMES_EN;

  const CENTER = new Set([5, 6, 9, 10]);

  const PLANET_STYLE = {
    'சூரியன்': { abbr: 'சூரி', bg: '#FFF176', color: '#5D4037' },
    'சந்திரன்':{ abbr: 'சந்',  bg: '#E0E0E0', color: '#37474F' },
    'செவ்வாய்':{ abbr: 'செவ்', bg: '#FFCCBC', color: '#BF360C' },
    'புதன்':   { abbr: 'புத',  bg: '#C8E6C9', color: '#1B5E20' },
    'குரு':    { abbr: 'குரு', bg: '#FFF9C4', color: '#F57F17' },
    'சுக்கிரன்':{ abbr: 'சுக்', bg: '#E1F5FE', color: '#01579B' },
    'சனி':     { abbr: 'சனி',  bg: '#283593', color: '#FFFFFF' },
    'ராகு':    { abbr: 'ராகு', bg: '#A5D6A7', color: '#1B5E20' },
    'கேது':    { abbr: 'கேது', bg: '#BDBDBD', color: '#424242' },
    'லக்':     { abbr: 'ல',    bg: '#E8EAF6', color: '#1A237E' },
    
    'சூ':      { abbr: 'சூரி', bg: '#FFF176', color: '#5D4037' },
    'சந்':     { abbr: 'சந்',  bg: '#E0E0E0', color: '#37474F' },
    'செ':      { abbr: 'செவ்', bg: '#FFCCBC', color: '#BF360C' },
    'பு':      { abbr: 'புத',  bg: '#C8E6C9', color: '#1B5E20' },
    'சுக்':    { abbr: 'சுக்', bg: '#E1F5FE', color: '#01579B' },
    'ரா':      { abbr: 'ராகு', bg: '#A5D6A7', color: '#1B5E20' },
    'கே':      { abbr: 'கேது', bg: '#BDBDBD', color: '#424242' },
  };

  const bySign = {};

  planets.forEach(p => {
    const signNo = p.rasi_no; 
    if (!signNo) return;

    let name = p.name ? p.name.trim() : p.full_name;

    if (name === 'லக்னம்') name = 'லக்';
    if (name === 'சுக்கிரன்') name = 'சுக்';

    if (
      name === 'களத்திரஸ்தானம்' ||
      name === 'var' ||
      name?.toLowerCase?.() === 'var'
    ) return;

	console.log(bySign, bySign[signNo], signNo);
    bySign[signNo] = bySign[signNo] || [];
    bySign[signNo].push(name);
  });

  const makeBadge = (name) => {
    const s = PLANET_STYLE[name] || { abbr: name.slice(0, 2), bg: '#E0E0E0', color: '#333' };
    return `<span class="p-badge" style="background:${s.bg};color:${s.color};">${s.abbr}</span>`;
  };

  const dateStr = pan?.date || '';

  const centerHTML = `
    <div class="kc-inner">
      <div class="kc-title">${lang === 'ta' ? 'கோச்சாரம்' : 'Gocharam'}</div>
      <div class="kc-date">${dateStr}</div>
    </div>
  `;

	const cells = Array.from({ length: 16 }, (_, i) => {
	  if (CENTER.has(i)) {
		return i === 5
		  ? `<div class="kc">${centerHTML}</div>`
		  : null;
	  }
	  const sign = CELL_TO_SIGN[i];
	  const planetBadges = (bySign[sign] || []).map(makeBadge).join('');
	  return `<div class="kh"><div class="badge-row">${planetBadges}</div></div>`;
	});

	const kattamGrid = cells.filter(Boolean).join('');
  
  console.log('rowCells', cells)

  const kattamRows = [0, 1, 2, 3].map(r => {
    const rowCells = [0, 1, 2, 3]
      .map(c => cells[r * 4 + c])
      .filter(Boolean)
      .join('');
    return `<tr>${rowCells}</tr>`;
  }).join('');

  // ── Final HTML ─────────────────────────────────────────────────────────────
  return `
    <!DOCTYPE html>
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
          width: 100%;
          max-width: 210mm;
          background: #FFFDF0;
          border: 3px solid #FFD700;
          padding: 4mm 5mm;
          display: flex;
          flex-direction: column;
          gap: 0;
          overflow: hidden;
          margin: 0 auto;
        }

        h2 {
          text-align: center;
          color: #B71C1C;
          font-size: clamp(16px, 4vw, 24px);
          line-height: 1.1;
          border-bottom: 2px solid #FFD700;
          padding-bottom: 2px;
          margin-bottom: 5px;
          flex-shrink: 0;
        }

        .section-gap  { height: 10px; flex-shrink: 0; }
        .section-gap1 { height: 5px;  flex-shrink: 0; }

        .tile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
        }

        .tile {
          border-radius: 10px;
          padding: 6px 8px 5px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 1px;
        }

        .tile--wide { grid-column: span 2; }

        .tile-lbl {
          font-size: clamp(14px, 2.2vw, 15px);
          font-weight: 700;
          line-height: 1.2;
        }

        .tile-val {
          font-size: clamp(14px, 2.8vw, 15px);
          font-weight: 800;
          color: #1a1a2e;
          line-height: 1.2;
        }

        .tile-elem {
          font-size: clamp(14px, 2.8vw, 15px);
          font-weight: 800;
          color: #d50000;
        }

        .flex-box { display: flex; gap: 8px; flex-shrink: 0; }
        .flex-box > div { flex: 1; }
		
		.kattam-wrapper {
		  position: relative;
		  display: flex;
		  justify-content: center;
		}

		.kattam {
		  display: grid;
		  grid-template-columns: repeat(4, 1fr);
		  grid-template-rows: repeat(4, 1fr);
		  width: 72%;
		  aspect-ratio: 1 / 1;
		  border-top: 1.5px solid #9E9E9E;
		  border-left: 1.5px solid #9E9E9E;
		}

		.kh {
		  background: #F8F9FF;
		  border-right: 1.5px solid #9E9E9E;
		  border-bottom: 1.5px solid #9E9E9E;
		}

		.kc {
		  background: #FFFDF0;
		  border-right: 1.5px solid #9E9E9E;
		  border-bottom: 1.5px solid #9E9E9E;
		  grid-column: span 2;
		  grid-row: span 2;
		}

		.badge-row {
		  height: 100%;
		  width: 100%;
		  display: flex;
		  flex-wrap: wrap;
		  align-content: center;
		  justify-content: center;
		  gap: 3px;
		}

		.kc-inner {
		  display: flex;
		  flex-direction: column;
		  align-items: center;
		  justify-content: center;
		  gap: 4px;
		  padding: 8px 4px;
		  height: 100%;
		}

        .kattam-wrapper .watermark {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: clamp(28px, 8vw, 44px);
          font-weight: 900;
          color: rgba(183, 28, 28, 0.09);
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
          letter-spacing: 4px;
          z-index: 1;
        }

        .sign-label {
          font-size: clamp(9px, 1.5vw, 11px);
          font-weight: 700;
          color: #888;
          text-align: left;
          padding: 2px 3px 0;
          line-height: 1;
          white-space: nowrap;
          overflow: hidden;
        }
        .kh, .kc { height: 100%; }

        .kc-title { font-size: clamp(12px, 3vw, 16px); font-weight: 800; color: #B71C1C; }
        .kc-date  { font-size: clamp(8px, 2vw, 10px);  font-weight: 700; color: #555; text-align: center; line-height: 1.5; }

        .p-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          width: clamp(30px, 5vw, 38px);
          height: clamp(20px, 4vw, 27px);
          font-size: clamp(11px, 1.8vw, 14px);
          font-weight: 800;
          line-height: 1;
          text-align: center;
        }
		
		.tile-elem-name {
		  font-size: clamp(14px, 2.8vw, 15px);
		  font-weight: 800;
		  line-height: 1.3;
		}

		.tile-elem-time {
		  font-size: clamp(12px, 2.2vw, 13px);
		  font-weight: 700;
		  white-space: pre-line;
		  line-height: 1.6;
		}

        .subam-footer { margin-top: 16px; text-align: center; flex-shrink: 0; }
        .subam-bottom-line { width: 60%; height: 1.5px; background: linear-gradient(to right, transparent, #B71C1C, transparent); margin: 6px auto 0; }
        .copyright-text { margin-top: 7px; font-size: clamp(11px, 2.5vw, 13px); color: #888; letter-spacing: 1px; }

        @media (max-width: 800px) {
          .kattam { width: 70%; }
        }
        @media (max-width: 500px) {
          .flex-box { flex-direction: column; gap: 5px; }
          .kattam { width: 70%; }
        }
        @media (max-width: 360px) {
          .page-container { padding-left: 2mm; padding-right: 2mm; }
          .tile { padding: 4px 4px 3px; border-radius: 7px; gap: 0; }
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
    </html>
  `;
};
module.exports = { generatePanchangHTML };
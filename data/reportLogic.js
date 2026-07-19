/**
 * reportLogic.js - Dual Language Support (Tamil & English)
 */
const TEXT = {
  en: {
    title: "Birth Horoscope Details",
    headers: ["Planet", "Sign", "Full Deg", "Sign Deg", "Nakshatra", "Pad"],
    dignity: { uchcham: "Exalted", neecham: "Debilitated", atchi: "Own House" },
    labels: { name: "Name", fatherName: "Father's Name", motherName: "Mother's Name", dob: "Date of Birth", time: "Time of Birth", place: "Place of Birth", sunrise: "Sunrise", lagna: "Ascendant", star: "Nakshatra", tithi: "Tithi", rashi: "Rashi", yog: "Yogam", karan: "Karanam", dashaBalanceLabel: "Birth Time Dasha Balance", dashaPlanetLabel: "Birth Time Dasha", lagnaPointLabel: "Lagna Degree", currentDashaTitle: "Current Dasha / Bhukthi", bhukthiEndLabel: "Bhukthi End Date" },
    charts: { rasi: "Rasi Chart", navamsa: "Navamsa" }
  },
  ta: {
    title: "ஜனன ஜாதக குறிப்பு",
    headers: ["கிரகம்", "ராசி", "முழு பாகை", "ராசி பாகை", "நட்சத்திரம்", "பாதம்"],
    dignity: { uchcham: "உச்சம்", neecham: "நீச்சம்", atchi: "ஆட்சி" },
    labels: { name: "பெயர்", fatherName: "தந்தை பெயர்", motherName: "தாய் பெயர்", dob: "பிறந்த தேதி", time: "பிறந்த நேரம்", place: "பிறந்த இடம்", sunrise: "சூரிய உதயம்", lagna: "லக்னம்", star: "நட்சத்திரம்", tithi: "திதி", rashi: "ராசி", yog: "யோகம்", karan: "கரணம்", dashaBalanceLabel: "ஜனன கால திசா இருப்பு", dashaPlanetLabel: "ஜனன கால திசா", lagnaPointLabel: "லக்ன புள்ளி", currentDashaTitle: "நடப்பு தசா / புக்தி", bhukthiEndLabel: "புக்தி முடிவு தேதி" },
    charts: { rasi: "ராசி சக்கரம்", navamsa: "நவாம்சம்" }
  }
};

const PLANET_SMALL_TAMIL_MAP = {
  "சூ": "சூரி", "சந்": "சந்", "செ": "செவ்", "பு": "புத",
  "கு": "குரு", "சு": "சுக்", "சனி": "சனி",
  "ரா": "ராகு", "கே": "கேது", "லக்": "லக்",
};

const PLANET_TAMIL = {
  SUN: "சூரி", MOON: "சந்", MARS: "செவ்", MERCURY: "புத",
  JUPITER: "குரு", VENUS: "சுக்", SATURN: "சனி",
  RAHU: "ராகு", KETU: "கேது", ASCENDANT: "லக்",
};

// South Indian chart layout — sign numbers in each cell position
const KATTAM_LAYOUT = [12, 1, 2, 3, 11, null, null, 4, 10, null, null, 5, 9, 8, 7, 6];

/**
 * @param {object} data       - Horoscope API response
 * @param {string} lang       - 'ta' | 'en'
 * @param {object} user       - Auth user object { name, phone, location, ... }
 */
export const generateReportHTML = (data, lang = 'ta', user = {}) => {
  const {
    name, fatherName, motherName, birthParams, place,
    planets: planetsRaw, astro, d1Chart: d1Raw, d9Chart: d9Raw,
    dashaBalance, dashaPlanet, nadappuDasa
  } = data;

  const planetsArray = Object.entries(planetsRaw)
    .filter(([key]) => !isNaN(key))
    .map(([, val]) => val);

  const d1Array = Object.entries(d1Raw)
    .filter(([key]) => !isNaN(key))
    .map(([, val]) => val);

  const d9Array = Object.entries(d9Raw)
    .filter(([key]) => !isNaN(key))
    .map(([, val]) => val);

  const dateParts  = (birthParams.date || birthParams.dob || '').split('/');
  const timeParts  = (birthParams.time || birthParams.tob || '').split(':');
  const day   = dateParts[0] || '';
  const month = dateParts[1] || '';
  const year  = dateParts[2] || '';
  const hour  = timeParts[0] || '';
  const min   = timeParts[1] || '';

  const lagnaEntry      = planetsRaw['0'];
  const ascendantDegree = lagnaEntry ? lagnaEntry.global_degree?.toFixed(2) : '0';
  const ascendantSignNo = lagnaEntry ? lagnaEntry.rasi_no : 1;

  const t = TEXT[lang] || TEXT['ta'];

  const rasiVal      = astro.rasi             || '';
  const nakshatraVal = astro.nakshatra        || '';
  const lagnaVal     = astro.ascendant_sign   || '';
  const tithiVal     = astro.tithi            || '';
  const yogVal       = astro.yoga             || '';
  const karanVal     = astro.karana           || '';

  // ── User / Astrologer info for letterhead ──
  const astrologerName     = user?.name     || '';
  const astrologerPhone    = user?.phone    || '';
  const astrologerLocation = user?.location || '';
  const astrologerLogo    = user?.logo_url    || ''; 

  const LAGNA_NAMES = ['லக்', 'லக்னம்', 'lak', 'ascendant', 'lagna'];

  const tableRows = planetsArray
    .filter(p => !LAGNA_NAMES.includes((p.name || '').toLowerCase()))
    .map(p => {
      const fullDeg = typeof p.global_degree === 'number'
        ? p.global_degree?.toFixed(2) : p.global_degree || '';
      const normDeg = typeof p.local_degree === 'number'
        ? p.local_degree?.toFixed(2)  : p.local_degree  || '';
      return `
        <tr>
          <td>${p.full_name || p.name}</td>
          <td>${p.zodiac || ''}</td>
          <td>${fullDeg}</td>
          <td style="color:#e65100;">${normDeg}</td>
          <td>${p.nakshatra || ''}</td>
          <td>${p.nakshatra_pada || ''}</td>
        </tr>`;
    }).join('');

  const buildSignMap = (arr) => {
    const map = {};
    arr.forEach(entry => {
      const rasi = entry.rasi_no;
      if (!rasi) return;
      if (!map[rasi]) map[rasi] = [];
      map[rasi].push(entry.name || '');
    });
    return map;
  };

  const renderChartGrid = (title, arr, isD1 = false) => {
    const signMap    = buildSignMap(arr);
    const lagnaLabel = lang === 'ta' ? 'ல' : 'La';
    let centerInjected = false;

    const cells = KATTAM_LAYOUT.map(signNum => {
      if (signNum === null) {
        if (!centerInjected) {
          centerInjected = true;
          return `<div class="box center-box">${title}</div>`;
        }
        return '';
      }

      let planetNames = (signMap[signNum] || []).map(p => {
        if (lang === 'ta') {
          return PLANET_SMALL_TAMIL_MAP[p.trim()]
            || PLANET_TAMIL[p.trim().toUpperCase()]
            || p.trim();
        }
        return p.trim();
      });

      if (isD1 && signNum === ascendantSignNo) {
        const alreadyHas = planetNames.some(p =>
          p === 'ல' || p === 'லக்' || p.toUpperCase() === 'LA' || p.toUpperCase() === 'ASC'
        );
        if (!alreadyHas) planetNames.push(lagnaLabel);
      }

      return `<div class="box">${planetNames.join(' ')}</div>`;
    }).join('');

    return `
      <div class="chart-wrapper">
        <div class="kattam-grid">${cells}</div>
      </div>`;
  };

  const cap = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  const formatTithi = (val) => {
    if (!val) return '';
    const parts = val.split('/');
    const paksha    = (parts[1] || '').trim();
    const tithiName = (parts[2] || '').trim();
    let pakshaLabel = '';
    if (/கிருஷ்ண|krishna/i.test(paksha)) {
      pakshaLabel = lang === 'ta' ? 'தேய்பிறை' : 'Theipirai';
    } else if (/சுக்ல|shukla/i.test(paksha)) {
      pakshaLabel = lang === 'ta' ? 'வளர்பிறை' : 'Valarpirai';
    } else {
      pakshaLabel = paksha;
    }
    return `${pakshaLabel} ${tithiName}`.trim();
  };

  return `
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @page { size: A4; margin: 0; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { width: 100%; overflow-x: hidden; font-family: 'Segoe UI', Arial, sans-serif; background: #fff; -webkit-print-color-adjust: exact; }

      .page-container {
        width: 100%;
        max-width: 210mm;
        padding: 6mm 3mm;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        overflow: hidden;
      }

      /* ── Letterhead ── */
      .letterhead {
          width: 100%;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          padding-bottom: 10px;
          margin-bottom: 12px;
          border-bottom: 2px solid #FAC775;
          gap: 12px;
        }
        .lh-photo {
          width: clamp(54px, 12vw, 72px);
          height: clamp(54px, 12vw, 72px);
          border-radius: 4px;
          object-fit: cover;
          border: 2px solid #993C1D;
          flex-shrink: 0;
		  margin-top: 15px;
        }
        .lh-text { display: flex; flex-direction: column; align-items: center; gap: 2px; }
      .lh-om {
        font-size: clamp(18px, 5vw, 28px);
        color: #c0392b;
        line-height: 1;
        margin-bottom: 2px;
      }
      .lh-name {
        font-size: clamp(15px, 4vw, 22px);
        font-weight: 900;
        color: #1a237e;
        letter-spacing: 1.5px;
        text-transform: uppercase;
      }
      .lh-divider {
        width: 60%;
        height: 1px;
        background: linear-gradient(to right, transparent, #c0392b, transparent);
        margin: 3px auto;
      }
      .lh-meta {
        display: flex;
        gap: 16px;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
      }
      .lh-meta-item {
		  display: flex;
		  align-items: center;
		  gap: 4px;
		  font-size: clamp(14px, 2.2vw, 16px);
		  color: #4a4a4a;
		}
		.lh-meta-icon {
		  color: #c0392b;
		  font-size: clamp(13px, 2.5vw, 15px);
		}

      h2 { width: 100%; text-align: center; color: #2e7d32; margin: 6px 0; font-size: clamp(12px, 3.5vw, 17px); text-transform: uppercase; }

      .header-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
      .header-table td { padding: clamp(3px,1vw,5px) clamp(4px,1.5vw,8px); border: 1px solid #b2dfdb; font-size: clamp(10px,2.2vw,12px); width: 50%; background: #fafafa; text-align: center; }

      .info-row { display: flex; gap: 8px; margin: 4px 0 8px; flex-wrap: nowrap; width: 100%; justify-content: center; }
      .info-box { flex: 1; min-width: 0; border-radius: 6px; padding: clamp(4px,1.5vw,8px); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
      .info-box.left  { background: #e8f5e9; border: 1px solid #a5d6a7; }
      .info-box.right { background: #fff3e0; border: 1px solid #ffcc80; }
      .info-label { color: #1a237e; font-weight: bold; font-size: clamp(10px,2vw,12px); }
      .info-value { color: #2e7d32; font-weight: 800; font-size: clamp(10px,2.2vw,13px); }
      .info-title { color: #d32f2f; font-weight: bold; font-size: clamp(10px,2vw,12px); }

      .planets-wrapper { position: relative; margin-bottom: 6px; width: 100%; overflow: hidden; }
      
      table.planets { width: 100%; border-collapse: collapse; table-layout: fixed; }
      table.planets th { background: #eceff1; border: 1px solid #c0392b; color: #00796b; padding: clamp(3px,1vw,5px) 2px; font-size: clamp(9px,2vw,11px); text-align: center; }
      table.planets td { border: 1px solid #d32f2f; text-align: center; padding: clamp(3px,1vw,5px) 2px; font-size: clamp(9px,2.2vw,11px); font-weight: 500; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

      .charts-outer { position: relative; width: 100%; overflow: hidden; }
      
      .charts-container {
        display: flex; justify-content: center; align-items: center;
        padding: 6px 0; flex-wrap: nowrap; gap: 10px; width: 100%;
      }

      .chart-wrapper {
        flex: 1 1 0; min-width: 0; max-width: 200px; display: flex; justify-content: center;
      }

      .kattam-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(4, 1fr);
        border: 3px solid #c0392b;
        width: 100%; aspect-ratio: 1; height: auto;
      }

      .box {
        border: 1px solid #c0392b;
        display: flex; align-items: center; justify-content: center;
        font-size: clamp(9px,1.8vw,12px); font-weight: bold; color: #c0392b;
        text-align: center; padding: 1px; overflow: hidden;
        word-break: break-word; line-height: 1.1; min-height: 0; align-self: stretch;
      }

      .center-box {
        grid-column: 2/4; grid-row: 2/4;
        background: #f9fbe7; color: #1b5e20;
        font-size: clamp(9px,2vw,12px); font-weight: 900;
        overflow: hidden; min-height: 0; align-self: stretch;
        display: flex; align-items: center; justify-content: center;
      }

      .subam-footer { margin-top: 10px; text-align: center; width: 100%; }
      .subam-line-row { display: flex; align-items: center; justify-content: center; gap: 10px; }
      .subam-line { flex: 1; height: 2px; background: linear-gradient(to right, transparent, #c0392b, transparent); max-width: 160px; }
      .subam-text { font-size: clamp(14px,3.5vw,20px); font-weight: 900; color: #c0392b; letter-spacing: 3px; padding: 0 8px; }
      .subam-bottom-line { width: 60%; height: 1.5px; background: linear-gradient(to right, transparent, #c0392b, transparent); margin: 4px auto 0; }
      .copyright-text { font-size: clamp(9px,1.8vw,11px); color: #999; margin-top: 3px; }

      @media (max-width: 500px) {
        .info-row { flex-wrap: wrap; }
        .info-box { min-width: 45%; }
        .charts-container { flex-wrap: nowrap; gap: 4px; }
        .chart-wrapper { flex: 1 1 0; min-width: 0; max-width: none; }
        .kattam-grid { width: 100%; height: auto; aspect-ratio: 1; }
        .box { font-size: clamp(8px,2.2vw,11px); padding: 1px; }
        .lh-meta { gap: 10px; }
      }

      @media (max-width: 349px) {
        .page-container { padding: 4mm 2mm; }
        .charts-container { gap: 2px; }
        .box { font-size: 8px; padding: 1px; }
        .center-box { font-size: 8px; }
        table.planets th, table.planets td { font-size: 9px; padding: 2px 1px; }
        .header-table td { font-size: 9px; padding: 2px 3px; }
        .info-label, .info-value, .info-title { font-size: 10px; }
        h2 { font-size: 11px; }
        .lh-name { font-size: 12px; }
      }

      @media print {
        html, body { width: 210mm; }
        .page-container { width: 210mm; max-height: 297mm; padding: 6mm 3mm; overflow: hidden; }
      }
    </style>
  </head>
  <body>
  <div class="page-container">

    <!-- ══════════════ LETTERHEAD ══════════════ -->
    ${(astrologerName || astrologerPhone || astrologerLocation) ? `
        <div class="letterhead">
          ${astrologerLogo ? `<img class="lh-photo" src="${astrologerLogo}" alt="photo" />` : ''}
          <div class="lh-text">
            <div class="lh-om">🕉</div>
            ${astrologerName ? `<div class="lh-name">${astrologerName}</div>` : ''}
            <div class="lh-divider"></div>
            <div class="lh-meta">
              ${astrologerPhone    ? `<span class="lh-meta-item"><span class="lh-meta-icon">📞</span>${astrologerPhone}</span>` : ''}
              ${astrologerPhone && astrologerLocation ? `<span style="color:#993C1D;">|</span>` : ''}
              ${astrologerLocation ? `<span class="lh-meta-item"><span class="lh-meta-icon">📍</span>${astrologerLocation}</span>` : ''}
            </div>
          </div>
        </div>
        ` : ''}
    <!-- ════════════════════════════════════════ -->

    <h2>${t.title}</h2>

    <table class="header-table">
      <tr>
        <td><b>${t.labels.name}:</b> ${cap(name)}</td>
        <td><b>${t.labels.rashi}:</b> ${rasiVal}</td>
      </tr>
      <tr>
        <td><b>${t.labels.fatherName}:</b> ${cap(fatherName || '')}</td>
        <td><b>${t.labels.star}:</b> ${nakshatraVal}</td>
      </tr>
      <tr>
        <td><b>${t.labels.motherName}:</b> ${cap(motherName || '')}</td>
        <td><b>${t.labels.lagna}:</b> ${lagnaVal}</td>
      </tr>
      <tr>
        <td><b>${t.labels.dob}:</b> ${day}-${month}-${year}</td>
        <td><b>${t.labels.tithi}:</b> ${formatTithi(tithiVal)}</td>
      </tr>
      <tr>
        <td><b>${t.labels.time}:</b> ${hour}:${min}</td>
        <td><b>${t.labels.yog}:</b> ${yogVal}</td>
      </tr>
      <tr>
        <td><b>${t.labels.place}:</b> ${cap(place || '')}</td>
        <td><b>${t.labels.karan}:</b> ${karanVal}</td>
      </tr>
    </table>

    <div class="info-row">
      <div class="info-box left">
        <div style="text-align:center;">
          <span class="info-label">${t.labels.dashaBalanceLabel}: </span>
          <span class="info-value">${dashaBalance || ''}</span>
        </div>
        <div style="text-align:center; margin-top:4px;">
          <span class="info-label">${t.labels.dashaPlanetLabel}: </span>
          <span class="info-value">${dashaPlanet ? (dashaPlanet.name || dashaPlanet) : ''}</span>
        </div>
        <div style="text-align:center; margin-top:4px;">
          <span class="info-label">${t.labels.lagnaPointLabel}: </span>
          <span class="info-value">${ascendantDegree}°</span>
        </div>
      </div>
      <div class="info-box right">
        <div class="info-title">${t.labels.currentDashaTitle}</div>
        <div class="info-value" style="color:#1a237e; font-size:clamp(12px,3vw,15px);">${nadappuDasa ? nadappuDasa.text : ''}</div>
        <div style="font-size:clamp(9px,2vw,12px); color:#d32f2f;">${t.labels.bhukthiEndLabel}</div>
        <div style="font-size:clamp(9px,2vw,12px); color:#d32f2f;">
          <b>${nadappuDasa ? (nadappuDasa.endDate || '') : ''}</b>
        </div>
      </div>
    </div>

    <div class="planets-wrapper">
      <table class="planets">
        <colgroup>
          <col style="width:20%;" />
          <col style="width:19%;" />
          <col style="width:13%;" />
          <col style="width:13%;" />
          <col style="width:25%;" />
          <col style="width:10%;" />
        </colgroup>
        <thead><tr>${t.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>

    <div class="charts-outer">
      <div class="charts-container">
        ${renderChartGrid(t.charts.rasi,    d1Array, true)}
        ${renderChartGrid(t.charts.navamsa, d9Array, false)}
      </div>
    </div>

    <div class="subam-footer">
      <div class="subam-line-row">
        <div class="subam-line"></div>
        <div class="subam-text">சுபம்</div>
        <div class="subam-line"></div>
      </div>
      <div class="subam-bottom-line"></div>
	  <div class="copyright-text">@Astroayan</div>
    </div>

  </div>
  </body>
  </html>`;
};
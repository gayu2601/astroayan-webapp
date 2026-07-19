/**
 * bookReportLogic.js - Dual Language Support (Tamil & English)
 */
import { getGrahaPalans } from '../data/graha-palan'; 
import { getVaaraPalan } from '../data/vaara-palan'; 
import { getNakshatraPalan } from '../data/nakshatra-palan';

const TEXT = {
  en: {
    title: "Birth Horoscope Details",
    headers: ["Planet", "Sign", "Full Deg", "Sign Deg", "Nakshatra", "Pad"],
    dignity: { uchcham: "Exalted", neecham: "Debilitated", atchi: "Own House" },
    labels: { name: "Name", fatherName: "Father's Name", motherName: "Mother's Name", dob: "Date of Birth", time: "Time of Birth", place: "Place of Birth", sunrise: "Sunrise", lagna: "Ascendant", star: "Nakshatra", tithi: "Tithi", rashi: "Rashi", yog: "Yogam", karan: "Karanam", dashaBalanceLabel: "Birth Time Dasha Balance", dashaPlanetLabel: "Birth Time Dasha", lagnaPointLabel: "Lagna Degree", currentDashaTitle: "Current Dasha / Bhukthi", bhukthiEndLabel: "Bhukthi End Date" },
    charts: { rasi: "D1- Rasi Chart", navamsa: "D9 - Navamsa" },
    divisionalCharts: {
      d2: "D2 - Hora", d3: "D3 - Drekkana", d3s: "D3S - Somanath", d4: "D4 - Chaturthamsa",
      d5: "D5 - Panchamsa", d7: "D7 - Saptamsa", d8: "D8 - Ashtamsa", d10: "D10 - Dasamsa",
      d10R: "D10R - Dasamsa (R)", d12: "D12 - Dvadasamsa", d16: "D16 - Shodasamsa",
      d20: "D20 - Vimshamsa", d24: "D24 - Chaturvimshamsa", d24R: "D24R - Chaturvimshamsa (R)",
      d27: "D27 - Saptavimshamsa", d30: "D30 - Trimshamsa", d40: "D40 - Khavedamsa",
      d45: "D45 - Akshavedamsa", d60: "D60 - Shashtiamsa"
    },
	ashtakvarga: {
	  title: "Ashtakavarga",
	  sectionHeading: "Ashtakavarga Chart",
	  planetLabel: "Planet",
	  totalLabel: "Total"
	},
    sectionTitles: { bhavaPredictions: "House Predictions", dashaPredictions: "Dasha Predictions", house: "House", dashaEnd: "Dasha Period End", planet: "Planet" }
  },
  ta: {
    title: "ஜனன ஜாதக குறிப்பு",
    headers: ["கிரகம்", "ராசி", "முழு பாகை", "ராசி பாகை", "நட்சத்திரம்", "பாதம்"],
    dignity: { uchcham: "உச்சம்", neecham: "நீச்சம்", atchi: "ஆட்சி" },
    labels: { name: "பெயர்", fatherName: "தந்தை பெயர்", motherName: "தாய் பெயர்", dob: "பிறந்த தேதி", time: "பிறந்த நேரம்", place: "பிறந்த இடம்", sunrise: "சூரிய உதயம்", lagna: "லக்னம்", star: "நட்சத்திரம்", tithi: "திதி", rashi: "ராசி", yog: "யோகம்", karan: "கரணம்", dashaBalanceLabel: "ஜனன கால திசா இருப்பு", dashaPlanetLabel: "ஜனன கால திசா", lagnaPointLabel: "லக்ன புள்ளி", currentDashaTitle: "நடப்பு தசா / புக்தி", bhukthiEndLabel: "புக்தி முடிவு தேதி" },
    charts: { rasi: "D1 - ராசி சக்கரம்", navamsa: "D9 - நவாம்சம்" },
    divisionalCharts: {
      d2: "D2 - ஹோரா", d3: "D3 - திரேக்காணம்", d3s: "D3S - சோமநாத்", d4: "D4 - சதுர்த்தாம்சம்",
      d5: "D5 - பஞ்சாம்சம்", d7: "D7 - சப்தாம்சம்", d8: "D8 - அஷ்டாம்சம்", d10: "D10 - தசாம்சம்",
      d10R: "D10R - தசாம்சம் (R)", d12: "D12 - துவாதசாம்சம்", d16: "D16 - சோதசாம்சம்",
      d20: "D20 - விம்சாம்சம்", d24: "D24 - சதுர்விம்சாம்சம்", d24R: "D24R - சதுர்விம்சாம்சம் (R)",
      d27: "D27 - சப்தவிம்சாம்சம்", d30: "D30 - திரிம்சாம்சம்", d40: "D40 - கவேதாம்சம்",
      d45: "D45 - அக்ஷவேதாம்சம்", d60: "D60 - ஷஷ்டியாம்சம்"
    },
    ashtakvarga: {
	  title: "அஷ்டகவர்க்கம்",
	  sectionHeading: "அஷ்டகவர்க்க சக்கரம்",
	  planetLabel: "கிரகம்",
	  totalLabel: "மொத்தம்"
	},
    sectionTitles: { bhavaPredictions: "பாவ பலன்கள்", dashaPredictions: "தசா பலன்கள்", house: "பாவம்", dashaEnd: "தசா முடிவு தேதி", planet: "கிரகம்" }
  }
};

const ASHTAK_PLANETS = [
  { index: 0, en: 'Sun',     ta: 'சூரியன்' },
  { index: 1, en: 'Moon',    ta: 'சந்திரன்' },
  { index: 2, en: 'Mars',    ta: 'செவ்வாய்' },
  { index: 3, en: 'Mercury', ta: 'புதன்'    },
  { index: 4, en: 'Jupiter', ta: 'குரு'     },
  { index: 5, en: 'Venus',   ta: 'சுக்கிரன்'},
  { index: 6, en: 'Saturn',  ta: 'சனி'      },
  { index: 'total', en: 'Total', ta: 'மொத்தம்' },
];

const SIGN_NAMES_EN = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];

const SIGN_NAMES_TA = [
  'மேஷம்','ரிஷபம்','மிதுனம்','கடகம்','சிம்மம்','கன்னி',
  'துலாம்','விருச்சிகம்','தனுசு','மகரம்','கும்பம்','மீனம்'
];

const getAshtakScoreColor = (score, isTotal) => {
  if (isTotal) {
    if (score >= 30) return '#2e7d32';
    if (score >= 25) return '#e65100';
    return '#c0392b';
  } else {
    // per-planet max is 8
    if (score >= 5) return '#2e7d32';
    if (score >= 3) return '#e65100';
    return '#c0392b';
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

const ORDINAL_SUFFIX = (n) => {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
};

export const generateBookReportHTML = (data, lang = 'ta', user) => {
  const {
    name, fatherName, motherName, birthParams, place,
    planets: planetsRaw, astro, d1Chart: d1Raw, d9Chart: d9Raw,
    dashaBalance, dashaPlanet, nadappuDasa,
    predictions: predictionsRaw,
    mergedDashas,
    d2Chart, d3Chart, d3sChart, d4Chart, d5Chart, d7Chart, d8Chart,
    d10Chart, d10RChart, d12Chart, d16Chart, d20Chart, d24Chart, d24RChart,
    d27Chart, d30Chart, d40Chart, d45Chart, d60Chart, ashtakvargaChart
  } = data;
  // ── Graha Palan Section ──
	const grahaPalanHTML = (() => {
	  if (!d1Raw) return '';
	  const palans = getGrahaPalans(d1Raw);
	  if (!palans.length) return '';
	  const heading = lang === 'ta' ? 'கிரக பலன்கள்' : 'Planet Predictions';
	  const merged = palans.map(({ palan }) => palan).filter(Boolean).join(' ');
	  return `
		<div class="section-break"></div>
		<div class="section-heading">${heading}</div>
		<p class="pred-text" style="text-align: left;">${merged}</p>`;
	})();
	
	const vaaraPalanHTML = (() => {
	  const dob = birthParams.date || birthParams.dob || '';
	  if (!dob) return '';
	  const vaara = getVaaraPalan(dob);
	  if (!vaara) return '';
	  const heading = lang === 'ta' ? 'வார பலன்கள்' : 'Day of Birth';
	  const merged = `${vaara.palan} ${vaara.vazhipaadu}`;
	  return `
		<div class="section-break"></div>
		<div class="section-heading">${heading}</div>
		<p class="pred-text" style="text-align: left;">${merged}</p>`;
	})();
	
  const toArray = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return Object.entries(raw)
      .filter(([key]) => !isNaN(key))
      .map(([, val]) => val);
  };

  const planetsArray = toArray(planetsRaw);
  const d1Array      = toArray(d1Raw);
  const d9Array      = toArray(d9Raw);

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
  const astrologerName     = user?.name     || '';
  const astrologerPhone    = user?.phone    || '';
  const astrologerLocation = user?.location || '';
  const astrologerLogo = user?.logo_url || '';

  const rasiVal      = astro.rasi             || '';
  const nakshatraVal = astro.nakshatra        || '';
  const lagnaVal     = astro.ascendant_sign   || '';
  const tithiVal     = astro.tithi            || '';
  const yogVal       = astro.yoga             || '';
  const karanVal     = astro.karana           || '';

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
  
  const nakshatraPalanHTML = (() => {
	  const nakshatra = getNakshatraPalan(nakshatraVal);
	  console.log('in nakshatraPalanHTML', nakshatra, nakshatraVal)
	  if (!nakshatra) return '';
	  const heading = lang === 'ta' ? 'நட்சத்திர பலன்கள்' : 'Birth Star Predictions';
	  return `
		<div class="section-break"></div>
		<div class="section-heading">${heading}</div>
		<p class="pred-text" style="text-align: left;">${nakshatra.palan}</p>`;
	})();

  
  const renderAshtakavargaGrid = (ashtakData, planetIndex, centerLabel, lang) => {
	  if (!ashtakData) return '<div class="chart-wrapper"></div>';

	  const { ashtakvarga_total, ashtakvarga_points } = ashtakData;
	  const isTotal = planetIndex === 'total';
	  const scores  = isTotal ? ashtakvarga_total : ashtakvarga_points[planetIndex];

	  if (!scores || scores.length < 12) return '<div class="chart-wrapper"></div>';

	  const signNames = lang === 'ta' ? SIGN_NAMES_TA : SIGN_NAMES_EN;
	  let centerInjected = false;

	  const cells = KATTAM_LAYOUT.map(signNum => {
		if (signNum === null) {
		  if (!centerInjected) {
			centerInjected = true;
			return `<div class="box center-box">${centerLabel}</div>`;
		  }
		  return '';
		}

		const idx   = signNum - 1;
		const score = scores[idx];
		const color = getAshtakScoreColor(score, isTotal);

		return `
		  <div class="box ashtak-box">
			<span class="ashtak-score" style="color:${color};">${score}</span>
			<span class="ashtak-sign">${signNames[idx]}</span>
		  </div>`;
	  }).join('');

	  return `
		<div class="chart-wrapper">
		  <div class="kattam-grid">${cells}</div>
		</div>`;
	};

  
  const ashtakavargaHTML = (() => {
	  if (!ashtakvargaChart) return '';

	  const heading = lang === 'ta' ? 'அஷ்டகவர்க்க சக்கரம்' : 'Ashtakavarga Chart';

	  const chartList = ASHTAK_PLANETS.map(p => ({
		label: lang === 'ta' ? p.ta : p.en,
		index: p.index,
	  }));

	  // Pair into rows of 2 — identical to your divisionalRows logic
	  const rows = [];
	  for (let i = 0; i < chartList.length; i += 2) {
		rows.push(chartList.slice(i, i + 2));
	  }

	  const rowsHTML = rows.map(row => `
		<div class="charts-container div-chart-row">
		  ${row.map(c =>
			renderAshtakavargaGrid(ashtakvargaChart, c.index, c.label, lang)
		  ).join('')}
		  ${row.length === 1 ? '<div class="chart-wrapper"></div>' : ''}
		</div>
	  `).join('');

	  return `
		<div class="section-break"></div>
		<div class="section-heading">${heading}</div>
		<div class="charts-outer">
		  ${rowsHTML}
		</div>`;
	})();
	
  const renderChartGrid = (title, arr, isD1 = false) => {
    if (!arr || arr.length === 0) return `<div class="chart-wrapper"><div class="kattam-grid-empty">${title}</div></div>`;
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

  // ── Divisional charts list ──
  const divisionalChartList = [
    { key: 'd2',   label: t.divisionalCharts.d2,   arr: toArray(d2Chart)   },
    { key: 'd3',   label: t.divisionalCharts.d3,   arr: toArray(d3Chart)   },
    { key: 'd3s',  label: t.divisionalCharts.d3s,  arr: toArray(d3sChart)  },
    { key: 'd4',   label: t.divisionalCharts.d4,   arr: toArray(d4Chart)   },
    { key: 'd5',   label: t.divisionalCharts.d5,   arr: toArray(d5Chart)   },
    { key: 'd7',   label: t.divisionalCharts.d7,   arr: toArray(d7Chart)   },
    { key: 'd8',   label: t.divisionalCharts.d8,   arr: toArray(d8Chart)   },
    { key: 'd10',  label: t.divisionalCharts.d10,  arr: toArray(d10Chart)  },
    { key: 'd10R', label: t.divisionalCharts.d10R, arr: toArray(d10RChart) },
    { key: 'd12',  label: t.divisionalCharts.d12,  arr: toArray(d12Chart)  },
    { key: 'd16',  label: t.divisionalCharts.d16,  arr: toArray(d16Chart)  },
    { key: 'd20',  label: t.divisionalCharts.d20,  arr: toArray(d20Chart)  },
    { key: 'd24',  label: t.divisionalCharts.d24,  arr: toArray(d24Chart)  },
    { key: 'd24R', label: t.divisionalCharts.d24R, arr: toArray(d24RChart) },
    { key: 'd27',  label: t.divisionalCharts.d27,  arr: toArray(d27Chart)  },
    { key: 'd30',  label: t.divisionalCharts.d30,  arr: toArray(d30Chart)  },
    { key: 'd40',  label: t.divisionalCharts.d40,  arr: toArray(d40Chart)  },
    { key: 'd45',  label: t.divisionalCharts.d45,  arr: toArray(d45Chart)  },
    { key: 'd60',  label: t.divisionalCharts.d60,  arr: toArray(d60Chart)  },
  ].filter(c => c.arr.length > 0);

  // Pair them into rows of 2
  const divisionalRows = [];
  for (let i = 0; i < divisionalChartList.length; i += 2) {
    divisionalRows.push(divisionalChartList.slice(i, i + 2));
  }

  const divisionalChartsHTML = divisionalRows.map(row => `
    <div class="charts-container div-chart-row">
      ${row.map(c => renderChartGrid(c.label, c.arr, false)).join('')}
      ${row.length === 1 ? '<div class="chart-wrapper"></div>' : ''}
    </div>
  `).join('');

  // Strip leading context sentence from prediction text
  const stripLeadingSince = (text) => {
    if (!text) return '';
    return text
      .trim()
      // English: "Since the 1st lord, Sun is in the 10th house, "
      .replace(/^since\s+the\s+\S+\s+lord[^,]*,\s*/i, '')
      // Tamil: "ஜாதகத்தில் கேது உங்கள் முதல் வீட்டில் அமர்ந்திருந்தால், "
      .replace(/^ஜாதகத்தில்[^,]*,\s*/u, '')
      // Tamil: "11வது வீட்டின் அதிபதி, புதன், 11 வது வீடான மிதுனம் ராசியில் இருப்பதால், "
      .replace(/^\d+\s*வது\s*வீட்டின்\s*அதிபதி[^,]*,[^,]*,[^,]*இருப்பதால்,\s*/u, '')
      .trim();
  };
  
  const virivaanaPalangalHTML = (() => {
	  const heading = lang === 'ta' ? 'விரிவான பலன்கள்' : 'Detailed Predictions';

	  // Collect graha palan texts
	  const grahaPalans = (() => {
		if (!d1Raw) return [];
		const palans = getGrahaPalans(d1Raw);
		return palans.map(({ palan }) => palan).filter(Boolean);
	  })();

	  // Collect bhava palan texts
	  const bhavaPalans = (() => {
		if (!predictionsRaw || !Array.isArray(predictionsRaw)) return [];
		return predictionsRaw
		  .filter(p => p.personalised_prediction)
		  .map(p => stripLeadingSince(p.personalised_prediction));
	  })();

	  const allTexts = [...grahaPalans, ...bhavaPalans].filter(Boolean);
	  if (!allTexts.length) return '';

	  // Split into 3 roughly equal paragraphs
	  const chunkSize = Math.ceil(allTexts.length / 3);
	  const paragraphs = [0, 1, 2]
		.map(i => allTexts.slice(i * chunkSize, (i + 1) * chunkSize).join(' '))
		.filter(Boolean);

	  const parasHTML = paragraphs
		.map(para => `<p class="pred-text" style="text-align:left; margin-bottom:10px;">${para}</p>`)
		.join('');

	  return `
		<div class="section-break"></div>
		<div class="section-heading">${heading}</div>
		${parasHTML}`;
	})();
 

  // ── Bhava Predictions ──
 const bhavaPredictionsHTML = (() => {
    if (!predictionsRaw || !Array.isArray(predictionsRaw) || predictionsRaw.length === 0) return '';
    const merged = predictionsRaw
      .filter(p => p.personalised_prediction)
      .map(p => stripLeadingSince(p.personalised_prediction))
      .join(' ');
    if (!merged) return '';
    return `
      <div class="section-break"></div>
      <div class="section-heading">${t.sectionTitles.bhavaPredictions}</div>
      <p class="pred-text" style="text-align: left;">${merged}</p>`;
  })();
  
  
	
	const TAMIL_MONTHS = {
	  'ஜனவரி': 0, 'பிப்ரவரி': 1, 'மார்ச்': 2, 'ஏப்ரல்': 3, 'மே': 4, 'ஜூன்': 5,
	  'ஜூலை': 6, 'ஆகஸ்ட்': 7, 'செப்டம்பர்': 8, 'அக்டோபர்': 9, 'நவம்பர்': 10, 'டிசம்பர்': 11
	};

	// Handles both "செவ்வாய் மார்ச் 27 2018 " and, for currentDasha's sub-periods,
	// "திங்கள் மார்ச் 09 2026 காலை 9:13 மணி"
	function parseTamilDate(str) {
	  if (!str) return null;
	  const s = str.trim();
	  const re = /^(\S+)\s+(\S+)\s+(\d{1,2})\s+(\d{4})(?:\s+(\S+)\s+(\d{1,2}):(\d{2})\s+மணி)?$/;
	  const m = s.match(re);
	  if (!m) return null;

	  const [, , monthName, day, year, period, hourStr, minStr] = m;
	  const month = TAMIL_MONTHS[monthName];
	  if (month === undefined) return null;

	  let hour = 0, minute = 0;
	  if (hourStr) {
		hour = parseInt(hourStr, 10);
		minute = parseInt(minStr, 10);
		if ((period === 'மாலை' || period === 'இரவு') && hour < 12) hour += 12;
		if (period === 'காலை' && hour === 12) hour = 0;
	  }

	  return new Date(parseInt(year, 10), month, parseInt(day, 10), hour, minute);
	}

	// Then for display:
	function formatDate(dateObj) {
	  if (!dateObj || isNaN(dateObj)) return '—';
	  return dateObj.toLocaleDateString('ta-IN', { day: '2-digit', month: 'short', year: 'numeric' });
	}
	
  // ── Dasha Predictions ──
  const dashaPredictionsHTML = (() => {

	  if (!mergedDashas?.length) return '';

	  return `

	  <div class="section-break"></div>

	  <div class="section-heading">

		  ${t.sectionTitles.dashaPredictions}

	  </div>

	  ${mergedDashas.map(md => `

		  <div class="pred-card dasha-card">

			  <div class="pred-house-header">

				  <span class="pred-house-num dasha-planet">

					  ${md.name} மகா தசை

				  </span>

				  <span class="pred-verbal">

					  ${md.start}

					  →

					  ${md.end}

				  </span>

			  </div>

			  <table class="bhukthi-table">

				  <thead>

					  <tr>

						  <th>புக்தி</th>

						  <th>ஆரம்பம்</th>

						  <th>முடிவு</th>

					  </tr>

				  </thead>

				  <tbody>

					  ${md.bhukthis.map(b => `

					  <tr>

						  <td>${b.name}</td>

						  <td>${b.start}</td>

						  <td>${b.end}</td>

					  </tr>

					  `).join('')}

				  </tbody>

			  </table>

			  <p class="pred-text">

				  ${md.prediction?.prediction || ''}

			  </p>

		  </div>

	  `).join('')}

	  `;

	})();

  return `
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @page { size: A4; margin: 12mm 10mm; }
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
	  
	  .bhukthi-table{

		width:100%;

		border-collapse:collapse;

		margin:10px 0 15px;

		font-size:12px;
		
		align-items: 'center'

		}

		.bhukthi-table th{

		background:#e8f5e9;

		color:#1a237e;

		padding:6px;

		border:1px solid #ccc;

		}

		.bhukthi-table td{

		padding:5px;

		border:1px solid #ddd;

		text-align:center;

		}

		.bhukthi-table tr:nth-child(even){

		background:#fafafa;

		}

      .charts-outer { position: relative; width: 100%; }
      
      .charts-container {
        display: flex; justify-content: center; align-items: center;
        padding: 6px 0; flex-wrap: nowrap; gap: 6px; width: 100%;
      }

      .div-chart-row {
        margin-bottom: 4px;
        padding: 4px 0;
        border-bottom: 1px dashed #e0e0e0;
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .chart-wrapper {
        flex: 1 1 0; min-width: 0; max-width: 320px; display: flex; justify-content: center;
        break-inside: avoid; page-break-inside: avoid;
      }

      .kattam-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(4, 1fr);
        border: 3px solid #c0392b;
        width: 100%; aspect-ratio: 1; height: auto;
        break-inside: avoid; page-break-inside: avoid;
      }

      .kattam-grid-empty {
        border: 2px dashed #ccc;
        width: 100%;
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: clamp(9px,2vw,11px);
        color: #aaa;
      }

      .box {
        border: 1px solid #c0392b;
        display: flex; align-items: center; justify-content: center;
        font-size: clamp(10px,2.2vw,14px); font-weight: bold; color: #c0392b;
        text-align: center; padding: 2px; overflow: hidden;
        word-break: break-word; line-height: 1.2; min-height: 0; align-self: stretch;
      }

      .center-box {
        grid-column: 2/4; grid-row: 2/4;
        background: #f9fbe7; color: #1b5e20;
        font-size: clamp(10px, 2.2vw, 13px); font-weight: 900;
        overflow: hidden; min-height: 0; align-self: stretch;
        display: flex; align-items: center; justify-content: center;
      }

      /* ── Section headings ── */
      .section-break {
        width: 100%;
        height: 2px;
        background: linear-gradient(to right, transparent, #c0392b, transparent);
        margin: 14px 0 8px;
      }

      .section-heading {
        width: 100%;
        text-align: center;
        font-size: clamp(13px, 3.5vw, 18px);
        font-weight: 900;
        color: #1b5e20;
        letter-spacing: 1px;
        margin-bottom: 10px;
        padding: 4px 0;
        border-bottom: 2px solid #a5d6a7;
        break-before: page;
        page-break-before: always;
      }

      /* ── Prediction cards ── */
      .predictions-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 8px;
      }

      .pred-card {
        width: 100%;
        background: #fafafa;
        border: 1px solid #e0e0e0;
        border-left: 4px solid #c0392b;
        border-radius: 4px;
        padding: clamp(6px,2vw,10px) clamp(8px,2.5vw,14px);
        text-align: left;
      }

      .dasha-card {
        border-left-color: #1a237e;
        background: #f8f9ff;
		margin-bottom: 10px;
      }

      .pred-house-header {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 5px;
      }

      .pred-house-num {
        font-size: clamp(14px,2.5vw,17px);
        font-weight: 900;
        color: #c0392b;
      }

      .dasha-planet {
        color: #1a237e;
      }

      .pred-verbal {
        font-size: clamp(12px,2vw,14px);
        color: #000;
		font-weight: 600;
        background: #e8f5e9;
        border-radius: 3px;
        padding: 1px 5px;
      }

      .pred-strength {
        font-size: clamp(9px,2vw,11px);
        font-weight: bold;
        background: #f3e5f5;
        border-radius: 3px;
        padding: 1px 5px;
      }

      .pred-text {
        font-size: clamp(12px,2.2vw,14px);
        color: #333;
        line-height: 1.5;
      }

      .pred-zodiac-info {
        font-size: clamp(9px,2vw,11px);
        color: #555;
        font-style: italic;
        margin-bottom: 4px;
        line-height: 1.4;
      }
	  
	.ashtak-grid {
	  border: 3px solid #c0392b;
	}

	.ashtak-box {
	  display: flex;
	  flex-direction: column !important;
	  align-items: center;
	  justify-content: center;
	  gap: 1px;
	  padding: 2px;
	}
		
	.ashtak-score {
	  font-size: clamp(13px, 3vw, 19px);
	  font-weight: 900;
	  line-height: 1;
	}
	.ashtak-sign {
	  font-size: clamp(12px, 1.5vw, 10px);
	  color: #000;
	  font-weight: 500;
	  line-height: 1;
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
        .pred-card { padding: 6px 8px; }
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
        .letterhead img { width: 28px; }
        .pred-text, .pred-zodiac-info { font-size: 9px; }
        .section-heading { font-size: 12px; }
      }

      @media print {
        html, body { width: 210mm; }
        .page-container { width: 210mm; padding: 6mm 3mm; }
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

    <!-- D1 + D9 charts -->
    <div class="charts-outer">
      <div class="charts-container">
        ${renderChartGrid(t.charts.rasi,    d1Array, true)}
        ${renderChartGrid(t.charts.navamsa, d9Array, false)}
      </div>
    </div>

    <!-- D2–D60 divisional charts (2 per row) -->
    <div class="charts-outer">
      ${divisionalChartsHTML}
    </div>
	
	${ashtakavargaHTML}

	${virivaanaPalangalHTML}
	
	${nakshatraPalanHTML}
	
	${vaaraPalanHTML}

    <!-- தசா பலன்கள் -->
    ${dashaPredictionsHTML}

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
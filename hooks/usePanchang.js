import { useState, useEffect, useCallback } from 'react';

const ASTRO_BASE = 'https://api.vedicastroapi.com/v3-json';
const CHANDRASHTAMA_MAPS = {
  ta: {
    0: "உத்திரம் (2,3,4 பாதம்), அஸ்தம், சித்திரை (1,2 பாதம்) [கன்னி ராசி]", // Moon in Mesham (8th from Kanni)
    1: "சித்திரை (3,4 பாதம்), சுவாதி, விசாகம் (1,2,3 பாதம்) [துலாம் ராசி]", // Moon in Rishabam (8th from Thulaam)
    2: "விசாகம் (4ம் பாதம்), அனுஷம், கேட்டை [விருச்சிக ராசி]", // Moon in Mithunam (8th from Vrischika)
    3: "மூலம், பூராடம், உத்திராடம் (1ம் பாதம்) [தனுசு ராசி]", // Moon in Kadagam (8th from Dhanusu)
    4: "உத்திராடம் (2,3,4 பாதம்), திருவோணம், அவிட்டம் (1,2 பாதம்) [மகர ராசி]", // Moon in Simham (8th from Makaram)
    5: "அவிட்டம் (3,4 பாதம்), சதயம், பூரட்டாதி (1,2,3 பாதம்) [கும்ப ராசி]", // Moon in Kanni (8th from Kumbham)
    6: "பூரட்டாதி (4ம் பாதம்), உத்திரட்டாதி, ரேவதி [மீன ராசி]", // Moon in Thulaam (8th from Meenam)
    7: "அஸ்வினி, பரணி, கார்த்திகை (1ம் பாதம்) [மேஷ ராசி]", // Moon in Vrischika (8th from Mesha) -> TRIGGERS BHARANI/KARTHIKAI 1
    8: "கார்த்திகை (2,3,4 பாதம்), ரோகிணி, மிருகசீரிடம் (1,2 பாதம்) [ரிஷப ராசி]", // Moon in Dhanusu (8th from Rishaba) -> TRIGGERS MULA/ROHINI
    9: "மிருகசீரிடம் (3,4 பாதம்), திருவாதிரை, புனர்பூசம் (1,2,3 பாதம்) [மிதுன ராசி]", // Moon in Makaram (8th from Mithunam)
    10: "புனர்பூசம் (4ம் பாதம்), பூசம், ஆயில்யம் [கடக ராசி]", // Moon in Kumbham (8th from Kadagam)
    11: "மகம், பூரம், உத்திரம் (1ம் பாதம்) [சிம்ம ராசி]" // Moon in Meenam (8th from Simham)
  },
  en: {
    0: "Uttara Phalguni (2,3,4), Hasta, Chitra (1,2) [Virgo Born]",
    1: "Chitra (3,4), Swati, Vishakha (1,2,3) [Libra Born]",
    2: "Vishakha (4), Anuradha, Jyeshta [Scorpio Born]",
    3: "Mula, Purva Ashadha, Uttara Ashadha (1) [Sagittarius Born]",
    4: "Uttara Ashadha (2,3,4), Shravana, Dhanishta (1,2) [Capricorn Born]",
    5: "Dhanishta (3,4), Shatabhisha, Purva Bhadrapada (1,2,3) [Aquarius Born]",
    6: "Purva Bhadrapada (4), Uttara Bhadrapada, Revati [Pisces Born]",
    7: "Ashwini, Bharani, Krittika (1st Padam) [Aries Born]",
    8: "Krittika (2,3,4), Rohini, Mrigashasra (1,2) [Taurus Born]",
    9: "Mrigashasra (3,4), Ardra, Punarvasu (1,2,3) [Gemini Born]",
    10: "Punarvasu (4), Pushya, Ashlesha [Cancer Born]",
    11: "Magha, Purva Phalguni, Uttara Phalguni (1) [Leo Born]"
  }
};

// Fixed Planetary Rule order for Gowri Panchangam (Daytime shifts)
const GOWRI_DAY_SEQUENCES = {
  Sunday: ['Uthi', 'Amirdha', 'Rogam', 'Laabam', 'Soram', 'Sugam', 'Visham', 'Chorala'],
  Monday: ['Amirdha', 'Soram', 'Sugam', 'Visham', 'Chorala', 'Uthi', 'Rogam', 'Laabam'],
  Tuesday: ['Soram', 'Visham', 'Chorala', 'Uthi', 'Rogam', 'Laabam', 'Amirdha', 'Sugam'],
  Wednesday: ['Laabam', 'Sugam', 'Visham', 'Chorala', 'Uthi', 'Rogam', 'Amirdha', 'Soram'],
  Thursday: ['Sugam', 'Chorala', 'Uthi', 'Rogam', 'Laabam', 'Amirdha', 'Soram', 'Visham'],
  Friday: ['Chorala', 'Laabam', 'Amirdha', 'Soram', 'Visham', 'Sugam', 'Uthi', 'Rogam'],
  Saturday: ['Rogam', 'Chorala', 'Uthi', 'Visham', 'Sugam', 'Amirdha', 'Soram', 'Laabam'],
};

const GOWRI_NIGHT_SEQUENCES = {
  Sunday: ['Sugam', 'Soram', 'Uthi', 'Amirdha', 'Visham', 'Rogam', 'Laabam', 'Dhanam'],
  Monday: ['Soram', 'Uthi', 'Amirdha', 'Visham', 'Rogam', 'Laabam', 'Dhanam', 'Sugam'],
  Tuesday: ['Uthi', 'Amirdha', 'Visham', 'Rogam', 'Laabam', 'Dhanam', 'Sugam', 'Soram'],
  Wednesday: ['Amirdha', 'Visham', 'Rogam', 'Laabam', 'Dhanam', 'Sugam', 'Soram', 'Uthi'],
  Thursday: ['Visham', 'Rogam', 'Laabam', 'Dhanam', 'Sugam', 'Soram', 'Uthi', 'Amirdha'],
  Friday: ['Rogam', 'Laabam', 'Dhanam', 'Sugam', 'Soram', 'Uthi', 'Amirdha', 'Visham'],
  Saturday: ['Laabam', 'Dhanam', 'Sugam', 'Soram', 'Uthi', 'Amirdha', 'Visham', 'Rogam'],
};

// Language mapping translation for dynamic output string structures
const GOWRI_NAMES_TA = {
  Uthi: 'உத்தி', Amirdha: 'அமிர்த', Rogam: 'ரோகம்', Laabam: 'லாபம்',
  Soram: 'சோரம்', Sugam: 'சுகம்', Visham: 'விஷம்', Chorala: 'சோரளா'
};

const astroGet = async (endpoint, params) => {
  console.log(params);
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${ASTRO_BASE}/${endpoint}?${query}`, {
    method: 'GET',
  });
  if (!res.ok) throw new Error(`${endpoint} failed: ${res.status}`);
  return res.json();
};

const calculateOfflineChandrashtamaStars = (input, langCode) => {
  try {
    const { day, month, year, hour, min } = input;
    const isTamil = langCode === 'ta';

    const targetDate = new Date(year, month - 1, day, hour || 12, min || 0);
    const epochTime = targetDate.getTime(); 
    const julianDate = (epochTime / 86400000) + 2440587.5;
    const d = julianDate - 2451545.0;

    const L = 218.316 + 13.176396 * d; 
    const M = 134.963 + 13.064993 * d; 

    let tropicalLong = L + 6.289 * Math.sin((M * Math.PI) / 180);
    const ayanamsa = 23.85 + ((targetDate.getFullYear() - 1950) * 0.01397); 

    let siderealLong = (tropicalLong - ayanamsa) % 360;
    if (siderealLong < 0) siderealLong += 360;

    const currentRasiIdx = Math.floor(siderealLong / 30) % 12;
    const currentMap = CHANDRASHTAMA_MAPS[langCode] || CHANDRASHTAMA_MAPS['en'];
    return currentMap[currentRasiIdx] || (isTamil ? "கணக்கிட முடியவில்லை" : "Calculation Error");
    
  } catch (error) {
    console.error("Offline calculation error:", error);
    return langCode === 'ta' ? "கணிப்பதில் பிழை" : "Calculation Error";
  }
};

const calculateTamilNallaNeram = (dayOfWeekName) => {
  const timings = {
    Sunday: {
      morning: ["06:30 AM", "07:30 AM"],
      evening: ["03:00 PM", "04:00 PM"],
    },

    Monday: {
      morning: ["09:30 AM", "10:30 AM"],
      evening: ["04:30 PM", "05:30 PM"],
    },

    Tuesday: {
      morning: ["10:30 AM", "11:30 AM"],
      evening: ["03:00 PM", "04:00 PM"],
    },

    Wednesday: {
      morning: ["07:30 AM", "08:30 AM"],
      evening: ["12:00 PM", "01:00 PM"],
    },

    Thursday: {
      morning: ["10:30 AM", "11:30 AM"],
      evening: ["01:30 PM", "02:30 PM"],
    },

    Friday: {
      morning: ["09:00 AM", "10:00 AM"],
      evening: ["05:00 PM", "06:00 PM"],
    },

    Saturday: {
      morning: ["07:30 AM", "08:30 AM"],
      evening: ["04:30 PM", "05:30 PM"],
    },
  };

  const key =
    Object.keys(timings).find((k) =>
      dayOfWeekName.toLowerCase().includes(k.toLowerCase())
    ) || "Sunday";

  const formatRange = ([start, end]) =>
    `${start} - ${end}`;

  return {
    morning: [formatRange(timings[key].morning)],
    evening: [formatRange(timings[key].evening)],
  };
};

const parseTimeToMinutes = (timeString) => {
  if (!timeString) return 360; // fallback to 6:00 AM
  const cleaned = timeString.trim();
  const match = cleaned.match(/^(\d+):(\d+)\s*(AM|PM)?$/i);
  if (!match) {
    const parts = cleaned.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3];

  if (ampm) {
    if (ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
  }
  return hours * 60 + minutes;
};

/**
 * Utility to stringify fractional minutes back into human-readable text blocks
 */
const minutesToTimeString = (totalMinutes) => {
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const mins = Math.floor(totalMinutes % 60);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(displayHours).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${ampm}`;
};

/**
 * Core dynamic calculator parsing the day duration into 8 specific slices
 */
const calculateDynamicGowriNeram = (sunriseStr, sunsetStr, dayOfWeekName, langCode) => {
  const sunriseMin = parseTimeToMinutes(sunriseStr);
  const sunsetMin = parseTimeToMinutes(sunsetStr);
  const totalDaylight = sunsetMin - sunriseMin;
  const totalNighttime = (1440 - sunsetMin) + sunriseMin; // Wraps into next day sunrise

  const dayInterval = totalDaylight / 8;
  const nightInterval = totalNighttime / 8;

  const key = Object.keys(GOWRI_DAY_SEQUENCES).find(k => dayOfWeekName.toLowerCase().includes(k.toLowerCase())) || "Sunday";
  const isTamil = langCode === 'ta';

  // 8 Day Slots
  const daySlots = GOWRI_DAY_SEQUENCES[key].map((name, i) => {
    const start = sunriseMin + (i * dayInterval);
    const end = sunriseMin + ((i + 1) * dayInterval);
    return {
      name: isTamil ? (GOWRI_NAMES_TA[name] || name) : name,
      timeRange: `${minutesToTimeString(start)} - ${minutesToTimeString(end)}`,
      status: ['Amirdha', 'Uthi', 'Laabam', 'Sugam'].includes(name) ? 'Good' : 'Bad'
    };
  });

  // 8 Night Slots 
  const nightSlots = GOWRI_NIGHT_SEQUENCES[key].map((name, i) => {
    const start = sunsetMin + (i * nightInterval);
    const end = sunsetMin + ((i + 1) * nightInterval);
    return {
      name: isTamil ? (GOWRI_NAMES_TA[name] || name) : name,
      timeRange: `${minutesToTimeString(start)} - ${minutesToTimeString(end)}`,
      status: ['Amirdha', 'Uthi', 'Laabam', 'Sugam'].includes(name) ? 'Good' : 'Bad'
    };
  });

  return { daySlots, nightSlots };
};

export const usePanchang = (input) => {
  const [data,    setData]    = useState(null);
  const [htmlObj,    setHtmlObj]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  
  console.log('input', input)

  const fetchPanchangData = useCallback(async () => {
    if (!input) return;
    setLoading(true);
    setError(null);
	console.log('input', input)
	const { date, time, tz, lat, lon, lang } = input;
	try {
      const { date, time, ...rest } = input;

	const [dd, mm, yyyy] = date.split('/');
	const [hh, min] = time.split(':');
	const panchangParams = { ...rest, date, time };
	const planetParams   = { ...rest, dob: date, tob: time };
	console.log('params', panchangParams, planetParams)

	const current = new Date(`${yyyy}-${mm}-${dd}`);
	const dayNameInEnglish   = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(current);
    const standardNallaNeram = calculateTamilNallaNeram(dayNameInEnglish);

      const [panToday, planToday] = await Promise.all([
        astroGet('panchang/panchang',        panchangParams),
		astroGet('horoscope/planet-details', planetParams)
      ]);
	  
	  const apiSunrise = panToday?.response?.sunrise || "06:00 AM";
      const apiSunset = panToday?.response?.sunset || "06:30 PM";
		const computedGowriBlocks = calculateDynamicGowriNeram(apiSunrise, apiSunset, dayNameInEnglish, lang);
		const derivedChandrashtamaStars = calculateOfflineChandrashtamaStars({day: dd, month: mm, year: yyyy, hour: hh, min: min}, lang);
		let dataObj = {
			panchang:        panToday?.response,
			planets:         planToday?.response,
			gowriNallaNeram: computedGowriBlocks, 
			chandrashtama:   derivedChandrashtamaStars,
			standardNallaNeram
		};
	  
	  console.log('dataObj', dataObj);
	
	setData(dataObj);
 
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [input]);

  useEffect(() => {
    fetchPanchangData();
  }, [fetchPanchangData]);

  return {
    panchang: data?.panchang, planets: data?.planets, gowriNallaNeram: data?.gowriNallaNeram,chandrashtama:   data?.chandrashtama,
  standardNallaNeram: data?.standardNallaNeram,
	loading,
    error,
    refetch: fetchPanchangData,
  };
};
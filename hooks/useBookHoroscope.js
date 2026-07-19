import { generateBookReportHTML } from '../data/bookReportLogic'; 
import { useAuth } from '../lib/AuthContext';

const Print = { printToFileAsync: async () => ({ uri: '' }) };
const Sharing = { isAvailableAsync: async () => false, shareAsync: async () => {} };
const FileSystem = { cacheDirectory: '', copyAsync: async () => {} };
const Platform = { OS: 'web' };
const Alert = { alert: (title, msg) => typeof window !== 'undefined' ? window.alert(msg ? `${title}\n${msg}` : title) : console.log(title, msg) };

// 1. Tamil Planet Translation Map
const tamilPlanets = {
  "Sun": "சூரியன்",
  "Moon": "சந்திரன்",
  "Mars": "செவ்வாய்",
  "Rahu": "ராகு",
  "Jupiter": "குரு",
  "Saturn": "சனி",
  "Mercury": "புதன்",
  "Ketu": "கேது",
  "Venus": "சுக்கிரன்"
};

const calculateDashaBalance = (dob, firstDashaEnd, lang = 'ta') => {
  const birth = new Date(dob);
  let end;
  const parts = firstDashaEnd.split('-');
  if (parts[0].length === 4) {
    end = new Date(firstDashaEnd);
  } else {
    end = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }

  let years = end.getFullYear() - birth.getFullYear();
  let months = end.getMonth() - birth.getMonth();
  let days = end.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (lang === 'ta') {
    return `${years} வருடம், ${months} மாதம், ${days} நாள்`;
  } else {
    return `${years} Year(s), ${months} Month(s), ${days} Day(s)`;
  }
};

export const useBookHoroscope = () => {
	const { user } = useAuth();
  
  const ASTRO_BASE = 'https://api.vedicastroapi.com/v3-json';

	const astroGet = async (endpoint, params) => {
		console.log(params)
	  const query = new URLSearchParams(params).toString();
	  const res = await fetch(`${ASTRO_BASE}/${endpoint}?${query}`, {
		method: 'GET',
	  });
	  if (!res.ok) {
		  const errBody = await res.text();
		  throw new Error(`${endpoint} failed: ${res.status} — ${errBody}`);
		}
	  return res.json();
	};

  const geocodePlace = async (place) => {
    const encoded = encodeURIComponent(place);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
      { headers: { 'User-Agent': 'JathagamApp/1.0' } }
    );
    const data = await res.json();
    if (!data || data.length === 0) throw new Error(`"${place}" என்ற இடத்தை கண்டுபிடிக்க முடியவில்லை.`);
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  };
  
  const generateAndPrint = async (formData, lang) => {
	  console.log('in generateAndPrint', formData)
    const { name, fatherName, motherName, dob, time, place } = formData;
	console.log('in generateAndPrint', formData)
    try {
      const [year, month, day] = dob.split('-').map(Number);
      const [hour, min] = time.split(':').map(Number);
      
      const { lat, lon } = await geocodePlace(place);

	  const pad = (n) => String(n).padStart(2, '0');

	  const birthParams = {
		api_key: '6a0b4e5a-b8d5-5e1a-bd97-6128ad38d349',
		dob:  `${pad(day)}/${pad(month)}/${year}`,   // ✅ "05/01/2026"
		tob:  `${pad(hour)}:${pad(min)}`,            // ✅ "09:05"
		lat,
		lon,
		tz:   5.5,
		lang,
	  };

      // 2. Added 'current_vdasha' to the Promise.all array
      const [planets, astro, d1, d9, dashaList, currentDasha, antardashaList, predictions, dashaPredictions, d2, d3, d3s, d4, d5, d7, d8, d10, d10R, d12, d16, d20, d24, d24R, d27, d40, d45, d60, d30, ashtakvarga] = await Promise.all([
        astroGet('horoscope/planet-details', birthParams),
        astroGet('extended-horoscope/extended-kundli-details', birthParams),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D1'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D9'}),
        astroGet('dashas/maha-dasha', birthParams),
        astroGet('dashas/current-mahadasha', birthParams),
		astroGet('dashas/antar-dasha', birthParams),
        astroGet('horoscope/personal-characteristics', birthParams),
        astroGet('dashas/maha-dasha-predictions', birthParams),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D2'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D3'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D3-s'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D4'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D5'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D7'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D8'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D10'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D10-R'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D12'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D16'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D20'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D24'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D24-R'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D27'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D40'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D45'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D60'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D30'}),
        astroGet('horoscope/ashtakvarga', {...birthParams, planet: 'total'})
      ]);
	  
	  console.log(dashaList, currentDasha, antardashaList, dashaPredictions);
	  
		const antardashaLookup = {};
		const antardashaNames = antardashaList.response.antardashas;
		const antardashaEnds = antardashaList.response.antardasha_order; // these are END dates, not starts
		antardashaNames.forEach((list, index) => {
		  const majorPlanet = list[0].split('/')[0];
		  antardashaLookup[majorPlanet] = {
			names: list,
			ends: antardashaEnds[index]
		  };
		});

		const mahaNames = dashaList.response.mahadasha;        // plain strings, e.g. "சூரியன்"
		const mahaEnds = dashaList.response.mahadasha_order;    // END dates, parallel array
		const firstMahaStart = dashaList.response.dasha_start_date;

		const mergedDashas = mahaNames.map((name, index) => {
		  const start = index === 0 ? firstMahaStart : mahaEnds[index - 1];
		  const end = mahaEnds[index];

		  const antars = antardashaLookup[name];
		  let bhukthis = [];
		  if (antars) {
			bhukthis = antars.names.map((item, i) => {
			  const [, bhukthi] = item.split('/');
			  return {
				name: bhukthi,
				start: i === 0 ? start : antars.ends[i - 1],
				end: antars.ends[i]
			  };
			});
		  }

		  const prediction = dashaPredictions.response.dashas?.find(x => x.dasha === name);

		  return { name, start, end, bhukthis, prediction };
		});
	  
		// Format nadappuDasa based on lang
		const nadappuDasa = lang === 'ta'
		  ? {
			  text: `${currentDasha?.response?.order_of_dashas?.major?.name} தசா / ${currentDasha?.response?.order_of_dashas?.minor?.name} புக்தி`,
			  endDate: currentDasha?.response?.order_of_dashas?.minor?.end
			}
		  : {
			  text: `${currentDasha?.response?.order_of_dashas?.major?.name} Dasha / ${currentDasha?.response?.order_of_dashas?.minor?.name} Bhukthi`,
			  endDate: currentDasha?.response?.order_of_dashas?.minor?.end
			};
		console.log('nadappuDasa', nadappuDasa);

      const reportPayload = {
        name, fatherName, motherName, birthParams, place,
        planets: planets.response, astro:astro.response, d1Chart: d1.response, d9Chart: d9.response,
        dashaBalance: dashaList?.response?.dasha_remaining_at_birth,
		dashaPlanet: dashaList?.response?.mahadasha[0],
        nadappuDasa,
		predictions: predictions?.response,
		mergedDashas,
		d2Chart: d2.response,
		d3Chart: d3.response,
		d3sChart: d3s.response,
		d4Chart: d4.response,
		d5Chart: d5.response,
		d7Chart: d7.response,
		d8Chart: d8.response,
		d10Chart: d10.response,
		d10RChart: d10R.response,
		d12Chart: d12.response,
		d16Chart: d16.response,
		d20Chart: d20.response,
		d24Chart: d24.response,
		d24RChart: d24R.response,
		d27Chart: d27.response,
		d30Chart: d30.response,
		d40Chart: d40.response,
		d45Chart: d45.response,
		d60Chart: d60.response,
		ashtakvargaChart: ashtakvarga.response
      };
	  /*const reportPayload = {
    "name": "ggg",
    "fatherName": "",
    "motherName": "",
    "birthParams": {
        "api_key": "049ba8e6-0315-5e91-98b3-7537799a5dbe",
        "dob": "12/12/1997",
        "tob": "12:12",
        "lat": 13.0836939,
        "lon": 80.270186,
        "tz": 5.5,
        "lang": "ta"
    },
    "place": "Chennai",
    "planets": {
        "0": {
            "name": "லக்",
            "full_name": "லக்னம்",
            "local_degree": 26.221092997847506,
            "global_degree": 326.2210929978475,
            "progress_in_percentage": 87.40364332615836,
            "rasi_no": 11,
            "zodiac": "கும்பம்",
            "house": 1,
            "nakshatra": "பூரட்டாதி",
            "nakshatra_lord": "குரு",
            "nakshatra_pada": 2,
            "nakshatra_no": 25,
            "zodiac_lord": "சனி",
            "is_planet_set": false,
            "lord_status": "-",
            "basic_avastha": "-",
            "is_combust": false
        },
        "1": {
            "name": "சூ",
            "full_name": "சூரியன்",
            "local_degree": 26.448098277229917,
            "global_degree": 236.44809827722992,
            "progress_in_percentage": 88.16032759076639,
            "rasi_no": 8,
            "zodiac": "விருச்சிகம்",
            "house": 10,
            "speed_radians_per_day": 1.1763760288065451e-8,
            "retro": false,
            "nakshatra": "கேட்டை",
            "nakshatra_lord": "புதன்",
            "nakshatra_pada": 3,
            "nakshatra_no": 18,
            "zodiac_lord": "செவ்வாய்",
            "is_planet_set": false,
            "basic_avastha": "மிருத்யு",
            "lord_status": "பாதகம்"
        },
        "2": {
            "name": "சந்",
            "full_name": "சந்திரன்",
            "local_degree": 2.6892246948947474,
            "global_degree": 32.68922469489475,
            "progress_in_percentage": 8.964082316315825,
            "rasi_no": 2,
            "zodiac": "ரிஷபம்",
            "house": 4,
            "speed_radians_per_day": 1.6353523662551432e-7,
            "retro": false,
            "nakshatra": "கார்த்திகை",
            "nakshatra_lord": "சூரியன்",
            "nakshatra_pada": 2,
            "nakshatra_no": 3,
            "zodiac_lord": "சுக்கிரன்",
            "is_planet_set": false,
            "basic_avastha": "பாலா",
            "lord_status": "பாதகம்",
            "is_combust": false
        },
        "3": {
            "name": "செ",
            "full_name": "செவ்வாய்",
            "local_degree": 1.5002408813379589,
            "global_degree": 271.50024088133796,
            "progress_in_percentage": 5.000802937793196,
            "rasi_no": 10,
            "zodiac": "மகரம்",
            "house": 12,
            "speed_radians_per_day": 9.00848765432069e-9,
            "retro": false,
            "nakshatra": "உத்திராடம்",
            "nakshatra_lord": "சூரியன்",
            "nakshatra_pada": 2,
            "nakshatra_no": 21,
            "zodiac_lord": "சனி",
            "is_planet_set": false,
            "basic_avastha": "பாலா",
            "lord_status": "பாதகம்",
            "is_combust": false
        },
        "4": {
            "name": "பு",
            "full_name": "புதன்",
            "local_degree": 7.606132433450114,
            "global_degree": 247.6061324334501,
            "progress_in_percentage": 25.353774778167043,
            "rasi_no": 9,
            "zodiac": "தனுசு",
            "house": 11,
            "speed_radians_per_day": -1.0294495884773073e-8,
            "retro": true,
            "nakshatra": "மூலம்",
            "nakshatra_lord": "கேது",
            "nakshatra_pada": 3,
            "nakshatra_no": 19,
            "zodiac_lord": "குரு",
            "is_planet_set": false,
            "basic_avastha": "குமாரா",
            "lord_status": "நடுநிலை",
            "is_combust": true
        },
        "5": {
            "name": "குரு",
            "full_name": "குரு",
            "local_degree": 24.602456665408624,
            "global_degree": 294.6024566654086,
            "progress_in_percentage": 82.00818888469541,
            "rasi_no": 10,
            "zodiac": "மகரம்",
            "house": 12,
            "speed_radians_per_day": 2.0576131687246014e-9,
            "retro": false,
            "nakshatra": "அவிட்டம்",
            "nakshatra_lord": "செவ்வாய்",
            "nakshatra_pada": 1,
            "nakshatra_no": 23,
            "zodiac_lord": "சனி",
            "is_planet_set": false,
            "basic_avastha": "மிருத்யு",
            "lord_status": "மிக பாதகம்",
            "is_combust": false
        },
        "6": {
            "name": "சுக்",
            "full_name": "சுக்கிரன்",
            "local_degree": 6.211761130918205,
            "global_degree": 276.2117611309182,
            "progress_in_percentage": 20.705870436394015,
            "rasi_no": 10,
            "zodiac": "மகரம்",
            "house": 12,
            "speed_radians_per_day": 5.69701646090587e-9,
            "retro": false,
            "nakshatra": "உத்திராடம்",
            "nakshatra_lord": "சூரியன்",
            "nakshatra_pada": 3,
            "nakshatra_no": 21,
            "zodiac_lord": "சனி",
            "is_planet_set": false,
            "basic_avastha": "குமாரா",
            "lord_status": "யோககாரகம்",
            "is_combust": false
        },
        "7": {
            "name": "சனி",
            "full_name": "சனி",
            "local_degree": 19.717865044419057,
            "global_degree": 349.71786504441906,
            "progress_in_percentage": 65.7262168147302,
            "rasi_no": 12,
            "zodiac": "மீனம்",
            "house": 2,
            "speed_radians_per_day": -8.037551440329446e-11,
            "retro": true,
            "nakshatra": "ரேவதி",
            "nakshatra_lord": "புதன்",
            "nakshatra_pada": 1,
            "nakshatra_no": 27,
            "zodiac_lord": "குரு",
            "is_planet_set": false,
            "basic_avastha": "விருத்தா",
            "lord_status": "அநுகூலம்",
            "is_combust": false
        },
        "8": {
            "name": "ரா",
            "full_name": "ராகு",
            "local_degree": 20.963622889388546,
            "global_degree": 140.96362288938855,
            "progress_in_percentage": 69.87874296462849,
            "rasi_no": 5,
            "zodiac": "சிம்மம்",
            "house": 7,
            "retro": true,
            "nakshatra": "பூரம்",
            "nakshatra_lord": "சுக்கிரன்",
            "nakshatra_pada": 3,
            "nakshatra_no": 11,
            "zodiac_lord": "சூரியன்",
            "is_planet_set": false,
            "basic_avastha": "விருத்தா",
            "lord_status": "பாதகம்",
            "is_combust": false
        },
        "9": {
            "name": "கே",
            "full_name": "கேது",
            "local_degree": 20.963622889388546,
            "global_degree": 320.96362288938855,
            "progress_in_percentage": 69.87874296462849,
            "rasi_no": 11,
            "zodiac": "கும்பம்",
            "house": 1,
            "retro": true,
            "nakshatra": "பூரட்டாதி",
            "nakshatra_lord": "குரு",
            "nakshatra_pada": 1,
            "nakshatra_no": 25,
            "zodiac_lord": "சனி",
            "is_planet_set": false,
            "basic_avastha": "விருத்தா",
            "lord_status": "அநுகூலம்",
            "is_combust": false
        },
        "birth_dasa": "சூரியன்>குரு>செ",
        "current_dasa": "ரா>பு>பு",
        "birth_dasa_time": "04/09/1994",
        "current_dasa_time": " 16/06/2026",
        "lucky_gem": [
            "மாணிக்கம்"
        ],
        "lucky_num": [
            1
        ],
        "lucky_colors": [
            "வெள்ளை",
            "வெளிர் மஞ்சள்"
        ],
        "lucky_letters": [
            "ಅ",
            "ಈ",
            "ಉ",
            "ವ"
        ],
        "lucky_name_start": [
            "ஆ",
            "இ",
            "ஓ",
            "அய்"
        ],
        "rasi": "ரிஷபம்",
        "nakshatra": "கார்த்திகை",
        "nakshatra_pada": 2,
        "panchang": {
            "ayanamsa": 23.833248217421005,
            "ayanamsa_name": "Lahiri",
            "day_of_birth": "வெள்ளி",
            "day_lord": "சுக்கிரன்",
            "hora_lord": "சூரியன்",
            "sunrise_at_birth": "06:27:00",
            "sunset_at_birth": "17:38:59",
            "karana": "கராஜா",
            "yoga": "சித்தா",
            "tithi": "சதுர்த்தசி"
        },
        "ghatka_chakra": {
            "rasi": "கன்னி",
            "tithi": [
                "5 (பஞ்சமி)",
                "10 (தசமி)",
                "15 (பௌர்ணமி / அமாவாசை)"
            ],
            "day": "சனி",
            "nakshatra": "ஹஸ்தம்",
            "tatva": "ஆகாசம்",
            "lord": "குரு",
            "same_sex_lagna": "ரிஷபம்",
            "opposite_sex_lagna": "விருச்சிகம்"
        }
    },
    "astro": {
        "gana": "ராக்ஷசர்",
        "yoni": "வெள்ளாடு",
        "vasya": "சதுஷ்பட",
        "nadi": "அந்த்ய",
        "varna": "வைஷ்யர்",
        "paya": "இரும்பு",
        "paya_by_nakshatra": "Iron",
        "tatva": "நிலம்",
        "life_stone": "நீலக்கல்",
        "lucky_stone": "மரகதம்",
        "fortune_stone": "வைரம்",
        "name_start": "ஆ",
        "ascendant_sign": "கும்பம்",
        "ascendant_nakshatra": "பூரட்டாதி",
        "rasi": "ரிஷபம்",
        "rasi_lord": "சுக்கிரன்",
        "nakshatra": "கார்த்திகை",
        "nakshatra_lord": "சூரியன்",
        "nakshatra_pada": 2,
        "sun_sign": "விருச்சிகம்",
        "karana": "கராஜா",
        "yoga": "சித்தா",
        "ayanamsa": 23.833248217421005
    },
    "d1Chart": {
        "0": {
            "name": "லக்",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 26.221092997847506
        },
        "1": {
            "name": "சூ",
            "zodiac": "விருச்சிகம்",
            "rasi_no": 8,
            "house": 10,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 26.448098277229917
        },
        "2": {
            "name": "சந்",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 4,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 2.6892246948947474
        },
        "3": {
            "name": "செ",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 12,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 1.5002408813379589
        },
        "4": {
            "name": "பு",
            "zodiac": "தனுசு",
            "rasi_no": 9,
            "house": 11,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 7.606132433450114
        },
        "5": {
            "name": "குரு",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 12,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 24.602456665408624
        },
        "6": {
            "name": "சுக்",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 12,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 6.211761130918205
        },
        "7": {
            "name": "சனி",
            "zodiac": "மீனம்",
            "rasi_no": 12,
            "house": 2,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 19.717865044419057
        },
        "8": {
            "name": "ரா",
            "zodiac": "சிம்மம்",
            "rasi_no": 5,
            "house": 7,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 20.963622889388546
        },
        "9": {
            "name": "கே",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 1,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 20.963622889388546
        },
        "chart": "D1",
        "chart_name": "லக்னா"
    },
    "d9Chart": {
        "0": {
            "name": "லக்",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 25.989836980627842
        },
        "1": {
            "name": "சூ",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 10,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 28.03288449506954
        },
        "2": {
            "name": "சந்",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 9,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 24.203022254052712
        },
        "3": {
            "name": "செ",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 9,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 13.502167932042084
        },
        "4": {
            "name": "பு",
            "zodiac": "மிதுனம்",
            "rasi_no": 3,
            "house": 2,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 8.455191901051421
        },
        "5": {
            "name": "குரு",
            "zodiac": "சிம்மம்",
            "rasi_no": 5,
            "house": 4,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 11.42210998867813
        },
        "6": {
            "name": "சுக்",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 10,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 25.905850178264245
        },
        "7": {
            "name": "சனி",
            "zodiac": "தனுசு",
            "rasi_no": 9,
            "house": 8,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 27.460785399771794
        },
        "8": {
            "name": "ரா",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 6,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 8.672606004497084
        },
        "9": {
            "name": "கே",
            "zodiac": "மேஷம்",
            "rasi_no": 1,
            "house": 12,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 8.672606004497084
        },
        "chart": "D9",
        "chart_name": "நவாம்சா"
    },
    "dashaBalance": "3 வருடங்கள் 3 மாதங்கள் 15 நாட்கள்",
    "dashaPlanet": "சூரியன்",
    "nadappuDasa": {
        "text": "ராகு தசா / புதன் புக்தி",
        "endDate": "திங்கள் செப்டம்பர் 25 2028 மாலை 6:02 மணி"
    },
    "predictions": [
        {
            "current_house": 1,
            "verbal_location": " 2 வது வீட்டின் அதிபதி 1 வீட்டில் இருக்கிறார்",
            "current_zodiac": "மீனம்",
            "lord_of_zodiac": "சனி",
            "lord_zodiac_location": "மீனம்",
            "lord_house_location": 2,
            "personalised_prediction": " 2வது வீட்டின் அதிபதி, சனி, 2 வது வீடான மீனம் ராசியில் இருப்பதால், நீங்கள் நிறைய போராட்டங்கள் மற்றும் கடின உழைப்புக்குப் பிறகு செல்வத்தை அடைவீர்கள் ஆனால் கணிசமான தாமதங்களைச் சந்திக்க வேண்டியிருக்கும். உங்கள் வாழ்க்கையில் ஆரம்பத்தில் அலட்சியமாக இருப்பீர்கள் மற்றும் சோம்பேறியாக இருப்பீர்கள், அதனால் நீங்கள் சரியான முடிவுகளைப் பெற மாட்டீர்கள். கடினமான உழைப்பில் ஈடுபடாமல் நீங்கள் வாழ்க்கையில் எதையும் பெறமாட்டீர்கள். ",
            "lord_strength": "நற்பலன்"
        },
        {
            "current_house": 2,
            "verbal_location": " 12 வது வீட்டின் அதிபதி 2 வீட்டில் இருக்கிறார்",
            "current_zodiac": "மகரம்",
            "lord_of_zodiac": "குரு",
            "lord_zodiac_location": "மகரம்",
            "lord_house_location": 12,
            "personalised_prediction": " 12வது வீட்டின் அதிபதி, குரு, 12 வது வீடான மகரம் ராசியில் இருப்பதால், நீங்கள் பெருநிறுவனத் துறையிலோ அல்லது நிதித்துறையிலோ உங்கள் செல்வத்தை சம்பாதிக்கலாம். நீங்கள் அங்கு ஒரு மேலாளர் அல்லது வழிகாட்டி நிலையில் இருக்கலாம். நீங்கள் ஒரு நிதித் திட்டமாக வேலை செய்து இந்தத் துறையில் செல்வம் சம்பாதிக்கலாம்.",
            "lord_strength": "நீச்சம்"
        },
        {
            "current_house": 3,
            "verbal_location": " 12 வது வீட்டின் அதிபதி 3 வீட்டில் இருக்கிறார்",
            "current_zodiac": "மகரம்",
            "lord_of_zodiac": "செவ்வாய்",
            "lord_zodiac_location": "மகரம்",
            "lord_house_location": 12,
            "personalised_prediction": " 12வது வீட்டின் அதிபதி, செவ்வாய், 12 வது வீடான மகரம் ராசியில் இருப்பதால், உடன்பிறந்தவர்களுடனான உறவில் உங்களுக்கு குழப்பம் இருக்கும். இரு தரப்பினரும் ஒருவருக்கொருவர் ஆதிக்கம் செலுத்த விரும்புவார்கள் மற்றும் தொடர்புகள் முறைகேடாக இருக்கலாம். முதலீடுகள் பெரும் இழப்பை ஏற்படுத்தும். நீங்கள் முதலீடுகளுக்காக வெளிநாட்டு நிலங்களில் வேலை செய்யலாம்.",
            "lord_strength": "உச்சம்"
        },
        {
            "current_house": 4,
            "verbal_location": " 12 வது வீட்டின் அதிபதி 4 வீட்டில் இருக்கிறார்",
            "current_zodiac": "மகரம்",
            "lord_of_zodiac": "சுக்கிரன்",
            "lord_zodiac_location": "மகரம்",
            "lord_house_location": 12,
            "personalised_prediction": " 12வது வீட்டின் அதிபதி, சுக்கிரன், 12 வது வீடான மகரம் ராசியில் இருப்பதால், நீங்கள் வெளிநாடுகளில் இருந்து செல்வத்தை இழப்பீர்கள். வெளிநாட்டு நிலத்துடனான உங்கள் உறவுகள் உங்கள் சூழலுக்கு பேரழிவை ஏற்படுத்தும். நீங்கள் பங்குச்சந்தை மற்றும் கணக்கு வேலைகளில் நல்ல நிலையில் இருப்பீர்கள்.",
            "lord_strength": "நற்பலன்"
        },
        {
            "current_house": 5,
            "verbal_location": " 11 வது வீட்டின் அதிபதி 5 வீட்டில் இருக்கிறார்",
            "current_zodiac": "தனுசு",
            "lord_of_zodiac": "புதன்",
            "lord_zodiac_location": "தனுசு",
            "lord_house_location": 11,
            "personalised_prediction": " 11வது வீட்டின் அதிபதி, புதன், 11 வது வீடான தனுசு ராசியில் இருப்பதால், உங்கள் ஆர்வமெல்லாம் கல்வித் துறையில் இருக்கும். நீங்கள் ஒரு ஆசிரியராக வேண்டும் மற்றும் நீங்கள் சமீபத்திய அறிவைப் புதுப்பித்துக் கொள்ள விரும்பும் அனைத்து தலைப்புகள் பற்றிய தகவல்களையும் பெறுவீர்கள். நீங்கள் வாழ்நாள் முழுவதும் இயற்கையின் மாணவராக இருக்க வேண்டும். . ",
            "lord_strength": "நற்பலன்"
        },
        {
            "current_house": 6,
            "verbal_location": " 4 வது வீட்டின் அதிபதி 6 வீட்டில் இருக்கிறார்",
            "current_zodiac": "ரிஷபம்",
            "lord_of_zodiac": "சந்திரன்",
            "lord_zodiac_location": "ரிஷபம்",
            "lord_house_location": 4,
            "personalised_prediction": " 4வது வீட்டின் அதிபதி, சந்திரன், 4 வது வீடான ரிஷபம் ராசியில் இருப்பதால், உங்கள் தாய் நர்சிங் அல்லது குணப்படுத்தும் சேவை துறையில் இருந்திருக்கலாம். அவள் இயல்பாகவே ஒரு பரிபூரணவாதியாக இருந்திருக்கலாம். சிறிய தவறுகளுக்கு கூட அவர் உங்களை விமர்சிப்பார். உங்களுக்கு அக்கறையுள்ள குணம் இருக்கும், மருத்துவத் துறையிலும் சேரலாம். . ",
            "lord_strength": "உச்சம்"
        },
        {
            "current_house": 7,
            "verbal_location": " 10 வது வீட்டின் அதிபதி 7 வீட்டில் இருக்கிறார்",
            "current_zodiac": "விருச்சிகம்",
            "lord_of_zodiac": "சூரியன்",
            "lord_zodiac_location": "விருச்சிகம்",
            "lord_house_location": 10,
            "personalised_prediction": " 10வது வீட்டின் அதிபதி, சூரியன், 10 வது வீடான விருச்சிகம் ராசியில் இருப்பதால், நீங்கள் ஒரு கடுமையான நபராக இருப்பீர்கள், உங்களுக்கு நிறைய கோபமோ அல்லது ஈகோவோ இருக்கும். நீங்கள் மற்றவர்களை ஆதிக்கம் செலுத்த விரும்புவீர்கள், உங்கள் வாழ்க்கையில் மக்களால் நீங்கள் விரும்பப்பட மாட்டீர்கள். வியாபாரத்தில் அல்லது காதலில் கூட நீங்கள் விரும்புவீர்கள் உங்கள் துணைவியாளர்களை  ஆதிக்கம் செலுத்துங்கள். ",
            "lord_strength": "நற்பலன்"
        },
        {
            "current_house": 8,
            "verbal_location": " 11 வது வீட்டின் அதிபதி 8 வீட்டில் இருக்கிறார்",
            "current_zodiac": "தனுசு",
            "lord_of_zodiac": "புதன்",
            "lord_zodiac_location": "தனுசு",
            "lord_house_location": 11,
            "personalised_prediction": " 11வது வீட்டின் அதிபதி, புதன், 11 வது வீடான தனுசு ராசியில் இருப்பதால், நீங்கள் ஆன்மீகம், அமானுஷ்யம் மற்றும் ஆன்மீகத்துடன் தொடர்பு கொள்ள விரும்பும் நபராக இருப்பீர்கள். நீங்கள் மிகவும் கற்பனை மிகுந்தவராக இருப்பிர்கள். எழுத்து மற்றும் வலைப்பதிவின் மூலம் உங்கள் அறிவை வழங்குவதில் நீங்கள் ஆர்வமாக இருப்பீர்கள். உங்களால் பங்குச் சந்தையில் சிறப்பாக செயலற்ற முடியும் .",
            "lord_strength": "நற்பலன்"
        },
        {
            "current_house": 9,
            "verbal_location": " 12 வது வீட்டின் அதிபதி 9 வீட்டில் இருக்கிறார்",
            "current_zodiac": "மகரம்",
            "lord_of_zodiac": "சுக்கிரன்",
            "lord_zodiac_location": "மகரம்",
            "lord_house_location": 12,
            "personalised_prediction": " 12வது வீட்டின் அதிபதி, சுக்கிரன், 12 வது வீடான மகரம் ராசியில் இருப்பதால், நீங்கள் வெவ்வேறு இனத்தைச் சேர்ந்தவர்களுடன் பணிபுரிந்து பணம் சம்பாதிக்க முயழுவீர்கள். நீங்கள் தொலைதூர இடங்களுக்கு கல்விகாக பயணிப்பீர்கள். நீங்கள் வேறு மதத்தைச் சேர்ந்த ஒருவரை திருமணம் செய்துகொள்ளலாம். நீங்களும் உங்கள் மனைவியும் கற்றுக் கொள்ள வேண்டும், மக்களே. ",
            "lord_strength": "நற்பலன்"
        },
        {
            "current_house": 10,
            "verbal_location": " 12 வது வீட்டின் அதிபதி 10 வீட்டில் இருக்கிறார்",
            "current_zodiac": "மகரம்",
            "lord_of_zodiac": "செவ்வாய்",
            "lord_zodiac_location": "மகரம்",
            "lord_house_location": 12,
            "personalised_prediction": " 12வது வீட்டின் அதிபதி, செவ்வாய், 12 வது வீடான மகரம் ராசியில் இருப்பதால், நீங்கள் தொழில்நுட்ப துறையில் ள்ள வேலையில் அதிகாரப்பூர்வமான பதவியைப் பெறுவதில் அதிகம் செலுத்துவீர்கள் மற்றும்   ஆக்ரோஷமான நபர் . நீங்கள் இராணுவத்தில் இருக்கலாம் அல்லது ஜெயிலராக வேலை செய்யலாம். நீங்கள் ரியல் எஸ்டேட்டிலிருந்து நிறைய செல்வம் சம்பாதிப்பீர்கள்.",
            "lord_strength": "உச்சம்"
        },
        {
            "current_house": 11,
            "verbal_location": " 12 வது வீட்டின் அதிபதி 11 வீட்டில் இருக்கிறார்",
            "current_zodiac": "மகரம்",
            "lord_of_zodiac": "குரு",
            "lord_zodiac_location": "மகரம்",
            "lord_house_location": 12,
            "personalised_prediction": " 12வது வீட்டின் அதிபதி, குரு, 12 வது வீடான மகரம் ராசியில் இருப்பதால், மற்ற மக்களுக்கு சேவை செய்வதற்கும், உலகில் மாற்றத்தை கொண்டு வருவதற்கும் நீங்கள் மறைவான மற்றும் மாய அறிவைப் பயன்படுத்துவீர்கள். ஆலோசனை மற்றும் கற்பித்தல் உங்களுக்கு சாதகமான தொழிலாக இருக்கும். உங்கள் வருமான ஓட்டம் வாழ்க்கையில் நிறைய மாற்றங்களைச் செய்யும்.",
            "lord_strength": "நீச்சம்"
        },
        {
            "current_house": 12,
            "verbal_location": " 2 வது வீட்டின் அதிபதி 12 வீட்டில் இருக்கிறார்",
            "current_zodiac": "மீனம்",
            "lord_of_zodiac": "சனி",
            "lord_zodiac_location": "மீனம்",
            "lord_house_location": 2,
            "personalised_prediction": " 2வது வீட்டின் அதிபதி, சனி, 2 வது வீடான மீனம் ராசியில் இருப்பதால், எந்த நோக்கத்திற்காகவும் எந்த வெளிநாட்டு நிலத்திற்கும் செல்ல நீங்கள் மிகவும் கஷ்டப்பட வேண்டியிருக்கும். உங்கள் முப்பதுகளுக்குப் பிறகுதான் நீங்கள் குறிப்பிடத்தக்க ஒன்றை அடைவீர்கள். உங்கள் பூர்வீக நிலத்திற்கு திரும்புவதற்கான உங்கள் போராட்டம் கடினமாக இருக்கும். நீங்கள் சட்டத் துறையுடன் தொடர்புடையவராக இருப்பீர்கள். ",
            "lord_strength": "நற்பலன்"
        }
    ],
    "mergedDashas": [
        {
            "name": "சூரியன்",
            "start": "செவ்வாய் மார்ச் 28 1995 ",
            "end": "செவ்வாய் மார்ச் 27 2001 ",
            "bhukthis": [
                {
                    "name": "சூரியன்",
                    "start": "செவ்வாய் மார்ச் 28 1995 ",
                    "end": "சனி ஜூலை 15 1995 "
                },
                {
                    "name": "சந்திரன்",
                    "start": "சனி ஜூலை 15 1995 ",
                    "end": "ஞாயிறு ஜனவரி 14 1996 "
                },
                {
                    "name": "செவ்வாய்",
                    "start": "ஞாயிறு ஜனவரி 14 1996 ",
                    "end": "செவ்வாய் மே 21 1996 "
                },
                {
                    "name": "ராகு",
                    "start": "செவ்வாய் மே 21 1996 ",
                    "end": "திங்கள் ஏப்ரல் 14 1997 "
                },
                {
                    "name": "குரு",
                    "start": "திங்கள் ஏப்ரல் 14 1997 ",
                    "end": "ஞாயிறு பிப்ரவரி 01 1998 "
                },
                {
                    "name": "சனி",
                    "start": "ஞாயிறு பிப்ரவரி 01 1998 ",
                    "end": "வியாழன் ஜனவரி 14 1999 "
                },
                {
                    "name": "புதன்",
                    "start": "வியாழன் ஜனவரி 14 1999 ",
                    "end": "சனி நவம்பர் 20 1999 "
                },
                {
                    "name": "கேது",
                    "start": "சனி நவம்பர் 20 1999 ",
                    "end": "திங்கள் மார்ச் 27 2000 "
                },
                {
                    "name": "சுக்கிரன்",
                    "start": "திங்கள் மார்ச் 27 2000 ",
                    "end": "செவ்வாய் மார்ச் 27 2001 "
                }
            ],
            "prediction": {
                "prediction": " 7வது வீட்டின் அதிபதி, சூரியன், 10 வது வீடான விருச்சிகம் ராசியில் இருப்பதால், உங்கள் வாழ்க்கைத் துணை அல்லது உங்கள் தந்தை அரசாங்கத்தில் சட்டம் அல்லது நிர்வாகத் துறையில் பணிபுரிபவராக இருக்கலாம். நீங்கள் வாழ்க்கையில் நிறைய மாற்றத்தக்க நிகழ்வுகளைச் சந்திப்பீர்கள், அல்லது உங்கள் மனைவி கூட குழப்பமான சூழலில் வேலை செய்வீர்கள். சூரியன்-10-விருச்சிகம் சவால்களையும் கொண்டு வரலாம். தொழில் தொடர்பான சிக்கல்கள் இருக்கலாம், இது உங்கள் ஆரோக்கியத்தை பாதிக்கக்கூடிய மன அழுத்த சூழ்நிலைகளுக்கு வழிவகுக்கும். ஸ்கார்பியோவின் இரகசிய இயல்பு உறவுகளில் தவறான புரிதல்களையும் மோதல்களையும் ஏற்படுத்தும், இது திருமண வாழ்க்கையில் சிக்கலான சூழ்நிலைகளுக்கு வழிவகுக்கும். மேலும், இந்த கலவையானது தேவையற்ற பயணச் செலவுகளைத் தூண்டி, திரட்டப்பட்ட செல்வத்தின் மீது அழுத்தத்தை ஏற்படுத்தக்கூடும். வியாபாரத்தில், நீங்கள் அவசரமாக முடிவெடுப்பது பின்னடைவுக்கு வழிவகுக்கும். இந்த காலகட்டத்தில் நிதி இழப்புகள் மற்றும் செலவுகள் சாத்தியமான பிரச்சனைகளாக இருக்கலாம். குடும்பத்தில் உள்ள இறுக்கமான உறவுகளை நிர்வகிக்க மிகவும் கவனமாகவும் திறந்த அணுகுமுறையும் தேவைப்படலாம்.",
                "dasha": "சூரியன்",
                "dasha_end_year": "செவ்வாய் மார்ச் 27 2001 ",
                "dasha_start_year": "செவ்வாய் மார்ச் 27 21995",
                "planet_in_zodiac": "விருச்சிகம் என்பது செவ்வாயை அதிபதியாகக் கொண்ட பேரார்வம் மற்றும் லட்சியத்துடன் தொடர்புடைய ஒரு நிலையான நீர்நிலை ராசி. சூரியன் மற்றும் செவ்வாய் இருவரும் ஆண்பால் உமிழும் கிரகங்கள் மற்றும் ஒருவருக்கொருவர் நண்பர்கள். அனுபவங்கள் மற்றும் திடீர் மாற்றங்கள் போன்ற மரணம் தொடர்பான வீடு. சூரியன் விருச்சிகம் இருப்பது உணர்ச்சிகளின் குளம். இந்த மக்கள் இதயத்தில் ஆழமாக புதைந்திருக்கும் உணர்வுகள் மற்றும் மர்மங்கள் நிறைய உள்ளன பொய் மற்றும் மகிழ்ச்சியற்ற உணர்வு அவர்களின் வாழ்வில் பரவுகிறது. அவர்கள் பொதுவாக தங்கள் திருமண வாழ்க்கையிலும் அதிருப்தி அடைகிறார்கள். வாதங்களில் ஈடுபடுவதற்கு ஒரு உள்ளார்ந்த ஆசை இருக்கிறது, சண்டையை ஊக்குவிக்கிறது. பெற்றோரின் அன்பை அனுபவிப்பதில் அவர்கள் மிகவும் துரதிருஷ்டவசமானவர்கள். இருப்பினும், இவை சராசரி சுய மரியாதையை விட அதிக லட்சியம் கொண்ட சிலர் . இந்த மக்கள் சவால்களை உண்கிறார்கள். அவர்கள் வெற்றிக்கான பசி மற்றும் கோரும் சூழ்நிலைகள் மற்றும் பதவிகளில் செழித்து வளர்கிறார்கள். இருப்பினும், விருச்சிகத்தில் சூரியன் உள்ளவர்கள் ஆயுதங்கள் மற்றும் தீ சம்பந்தப்பட்ட சூழ்நிலைகளில் கவனமாக இருக்க வேண்டும். "
            }
        },
        {
            "name": "சந்திரன்",
            "start": "செவ்வாய் மார்ச் 27 2001 ",
            "end": "திங்கள் மார்ச் 28 2011 ",
            "bhukthis": [
                {
                    "name": "சந்திரன்",
                    "start": "செவ்வாய் மார்ச் 27 2001 ",
                    "end": "வெள்ளி ஜனவரி 25 2002 "
                },
                {
                    "name": "செவ்வாய்",
                    "start": "வெள்ளி ஜனவரி 25 2002 ",
                    "end": "செவ்வாய் ஆகஸ்ட் 27 2002 "
                },
                {
                    "name": "ராகு",
                    "start": "செவ்வாய் ஆகஸ்ட் 27 2002 ",
                    "end": "புதன் பிப்ரவரி 25 2004 "
                },
                {
                    "name": "குரு",
                    "start": "புதன் பிப்ரவரி 25 2004 ",
                    "end": "ஞாயிறு ஜூன் 26 2005 "
                },
                {
                    "name": "சனி",
                    "start": "ஞாயிறு ஜூன் 26 2005 ",
                    "end": "வெள்ளி ஜனவரி 26 2007 "
                },
                {
                    "name": "புதன்",
                    "start": "வெள்ளி ஜனவரி 26 2007 ",
                    "end": "வியாழன் ஜூன் 26 2008 "
                },
                {
                    "name": "கேது",
                    "start": "வியாழன் ஜூன் 26 2008 ",
                    "end": "ஞாயிறு ஜனவரி 25 2009 "
                },
                {
                    "name": "சுக்கிரன்",
                    "start": "ஞாயிறு ஜனவரி 25 2009 ",
                    "end": "ஞாயிறு செப்டம்பர் 26 2010 "
                },
                {
                    "name": "சூரியன்",
                    "start": "ஞாயிறு செப்டம்பர் 26 2010 ",
                    "end": "திங்கள் மார்ச் 28 2011 "
                }
            ],
            "prediction": {
                "prediction": " 6வது வீட்டின் அதிபதி, சந்திரன், 4 வது வீடான ரிஷபம் ராசியில் இருப்பதால், நீங்கள் உங்கள் தாயுடன் சிறந்த உறவைக் கொண்டிருப்பீர்கள் மற்றும் சிறந்த தகவல் தொடர்பு திறன்களைக் கொண்டிருப்பீர்கள். நீங்கள் நர்சிங் துறையில் இருப்பீர்கள் மற்றும் மக்களுக்கு உதவ விரும்புவீர்கள். நீங்கள் ஒரு உண்மையான நபராக இருக்க வேண்டும். 4 வது வீட்டில் சந்திரன் மற்றும் ரிஷபம் ராசி இந்த மஹாதஷாவின் கீழ் மகத்தான உணர்ச்சி மற்றும் குடும்ப மகிழ்ச்சியின் நேரத்தைக் குறிக்கிறது. உங்கள் தாய் மற்றும் நெருங்கிய உறவினர்களுடனான உங்கள் உறவு வலுவடையும், நல்லிணக்கம் மற்றும் புரிதலின் அதிகரித்த உணர்வைக் கொண்டுவரும். உங்கள் செல்வம் செழித்து ஆறுதலளிக்கும் புதிய சொத்துக்களைப் பெறுவதற்கு இது ஒரு நல்ல காலம். நிலம், கட்டுமானம் அல்லது நிதி தொடர்பான துறைகளில் ஒரு தொழில் வளர்ச்சி மற்றும் ஸ்திரத்தன்மையைக் காணும், மேலும் நல்ல நிதி ஆரோக்கியத்திற்கான வாய்ப்புகள் தெளிவாக உள்ளன. இந்த காலகட்டத்தில் சாப்பாட்டு அறைகள் மற்றும் உணவு உண்ணும் இடங்கள் முக்கிய பங்கு வகிக்கும். உங்கள் நிலையான மற்றும் விசுவாசமான தன்மையை பிரதிபலிக்கும் ஆடம்பரமான பொருட்களிலிருந்து ஆதாயங்களை எதிர்பார்க்கலாம். முக்கிய முடிவுகள் மற்றும் ஊகங்கள் வெற்றிகரமான முடிவுகளைத் தரும். ஒட்டுமொத்தமாக, இந்த மஹாதாஷா பூர்வீகத்திற்கு அமைதியான வாழ்க்கை, உணர்ச்சி திருப்தி மற்றும் பொருள் வெற்றியை வழங்குகிறது.",
                "dasha": "சந்திரன்",
                "dasha_end_year": "திங்கள் மார்ச் 28 2011 ",
                "dasha_start_year": "செவ்வாய் மார்ச் 27 2001 ",
                "planet_in_zodiac": "இது சந்திரனுக்கு ஒரு உயர்ந்த நிலை தரும், இருப்பினும் ரிஷபத்தின் அதிபதி சுக்கிரன், இது சந்திரனுடன் எதிரி உறவைப் பகிர்ந்து கொள்கிறது. ஆனால் இரண்டும் நீர் கோள்கள் என்பதால், அவற்றின் ஆற்றல்கள் நன்றாக மோதுகின்றன. ரிஷபத்தில் சந்திரன் உள்ளவர்கள் மிகவும்  அன்பானவராக மற்றும் அழகாக இருப்பார்கள். நீங்கள் ஒரு தாராளமான மற்றும் தொண்டுள்ள நபர், தேவைப்படுபவர்களுக்கு எப்போதும் உதவ விரும்புகிறார். சுக்கிரனின் சாதகமான இடம் உங்களுக்கு செல்வத்தையும் சொத்துக்களையும் வழங்குகிறது. ஆடம்பரங்கள் மற்றும் பொருள் உடைமைகள் உங்களை ஈர்க்கின்றன. நீங்கள் ஒரு அடிப்படை மற்றும் நடைமுறை நபர். நீங்களும் சமமான பெரிய இதயமுள்ளவர். ஒரு நண்பராகவும் கூட்டாளியாகவும், ரிஷப ராசியில் உள்ள சந்திரன் மிகவும் விசுவாசமானவராக, நம்பகமானவராக, நிலையானவராக, உறுதியுடன் இருப்பார். உங்கள் உறவுகள் பெரும்பாலும் நீண்ட காலம் நீடிக்கும் ஆனால் நீங்களும் உடைமையாக இருக்கலாம். உங்கள் நகைச்சுவை உணர்வு காரணமாக நீங்கள் ஒரு வேடிக்கையான நபர். கலைகளிலும் உங்களுக்கு அதிக நாட்டம் உண்டு. வீடு மற்றும் உள்துறை வடிவமைப்பை புதுப்பித்தல் போன்ற விஷயங்களும் உங்களை ஈர்க்கின்றன."
            }
        },
        {
            "name": "செவ்வாய்",
            "start": "திங்கள் மார்ச் 28 2011 ",
            "end": "செவ்வாய் மார்ச் 27 2018 ",
            "bhukthis": [
                {
                    "name": "செவ்வாய்",
                    "start": "திங்கள் மார்ச் 28 2011 ",
                    "end": "புதன் ஆகஸ்ட் 24 2011 "
                },
                {
                    "name": "ராகு",
                    "start": "புதன் ஆகஸ்ட் 24 2011 ",
                    "end": "திங்கள் செப்டம்பர் 10 2012 "
                },
                {
                    "name": "குரு",
                    "start": "திங்கள் செப்டம்பர் 10 2012 ",
                    "end": "சனி ஆகஸ்ட் 17 2013 "
                },
                {
                    "name": "சனி",
                    "start": "சனி ஆகஸ்ட் 17 2013 ",
                    "end": "வெள்ளி செப்டம்பர் 26 2014 "
                },
                {
                    "name": "புதன்",
                    "start": "வெள்ளி செப்டம்பர் 26 2014 ",
                    "end": "புதன் செப்டம்பர் 23 2015 "
                },
                {
                    "name": "கேது",
                    "start": "புதன் செப்டம்பர் 23 2015 ",
                    "end": "வெள்ளி பிப்ரவரி 19 2016 "
                },
                {
                    "name": "சுக்கிரன்",
                    "start": "வெள்ளி பிப்ரவரி 19 2016 ",
                    "end": "வியாழன் ஏப்ரல் 20 2017 "
                },
                {
                    "name": "சூரியன்",
                    "start": "வியாழன் ஏப்ரல் 20 2017 ",
                    "end": "சனி ஆகஸ்ட் 26 2017 "
                },
                {
                    "name": "சந்திரன்",
                    "start": "சனி ஆகஸ்ட் 26 2017 ",
                    "end": "செவ்வாய் மார்ச் 27 2018 "
                }
            ],
            "prediction": {
                "prediction": " 3வது வீட்டின் அதிபதி, செவ்வாய், 12 வது வீடான மகரம் ராசியில் இருப்பதால், நீங்கள் ஒரு விளையாட்டு வீரராக இருக்கலாம், அவர் தனக்கும் அவரது நாட்டிற்கும் பதக்கங்களையும் பாராட்டுகளையும் வெல்வார் ஆனால் வெளிநாடுகளில் விளையாடுவார். உங்கள் இளைய சகோதரர் வெளிநாட்டு நிறுவனங்களுடன் பணிபுரிந்து வெளிநாட்டில் குடியேறலாம். 12 ஆம் வீட்டில் உள்ள மகரத்தில் செவ்வாய் இந்த கட்டம் வேலை மற்றும் ஓய்வுக்காக வெளிநாட்டு இடங்களை ஆராய எதிர்பாராத வாய்ப்புகளைத் தரக்கூடும். சில செலவுகள் இருக்கலாம் என்றாலும், பதவி உயர்வு அல்லது தொழில் முன்னேற்றம் போன்றவற்றில் பலனளிக்கும். பூர்வீகவாசிகள் செலவு செய்வதில் மிகவும் கவனமாகவும் நடைமுறை சார்ந்தவர்களாகவும் இருக்கலாம். உங்களின் அர்ப்பணிப்பு மற்றும் கடின உழைப்பு ஆகியவை நிர்வாகத் துறையில் அல்லது தகவல் தொழில்நுட்பத் துறையில் உயர உதவும். ஒழுக்கமான மற்றும் உறுதியான செவ்வாய் சனியின் ஆட்சி மகரத்துடன் நன்றாக இணைகிறது, உங்கள் இலக்குகளை அடைவதற்கான பாதையை ஒளிரச் செய்கிறது. உடல்நிலை திருப்திகரமாக உள்ளது. சில பூர்வீகவாசிகள் ஆன்மீக ஆறுதலைக் காணலாம் மற்றும் தொண்டு, பரோபகாரம் மற்றும் சமூக சேவைகளில் அதிகமாக ஈடுபடலாம். உறவுகளில் வெகுமதிகள் மற்றும் அதிகரித்த பாலியல் இன்பம் ஆகியவை எதிர்பார்க்கப்படுகின்றன.",
                "dasha": "செவ்வாய்",
                "dasha_end_year": "செவ்வாய் மார்ச் 27 2018 ",
                "dasha_start_year": "திங்கள் மார்ச் 28 2011 ",
                "planet_in_zodiac": "மகரத்தில் செவ்வாய் உச்சத்தில் உள்ளது, ஆனால் மகரத்தின் அதிபதி சனி மற்றும் அது செவ்வாய் கிரகத்துடன் பகை உறவைப் பகிர்ந்து கொள்கிறது. செவ்வாய் தடையற்ற ஆற்றல் மற்றும் சனி சிரமங்களை கொடுக்கிறது அதனால் மகர ராசியில் செவ்வாய் உள்ள நபர் தங்கள் ஆற்றலை சரியான திசையில் செலுத்த போராடுகிறார். இந்த பழங்குடியினர் கடுமையான, செயலற்ற மற்றும் ஆக்ரோஷமான இயல்புடையவர்கள். அவர்கள் இயற்கையில் ஒதுக்கப்பட்டவர்கள், குறிப்பாக பொது இடங்களில் அவர்களால் ரகசியங்களை வைத்து வதந்திகளிலும் ஈடுபட முடியாது. இந்த போக்கு பெரும்பாலும் அவர்களின் அன்புக்குரியவர்களிடமிருந்தும் உறவினர்களிடமிருந்தும் அவர்களைத் தூரப்படுத்துகிறது. அவர்கள் மனரீதியாகவும் உடல் ரீதியாகவும் மிகவும் வலிமையானவர்கள், ஆனால் அவர்கள் வாழ்க்கையைத் தூண்டவும் உறவுகளை உருவாக்கவும் தேவையான உணர்ச்சிகள் இல்லை. அவர்களின் கடின உழைப்புக்கும் உறுதியுக்கும் உடனடியாக வெகுமதி இல்லை. அவர்கள் உணர்ச்சிபூர்வமான ஈடுபாடு மற்றும் வெளிப்பாட்டுடன் போராடுகையில், அவர்கள் தங்கள் வாழ்க்கையின் தொழில்முறை துறையில் சிறப்பாகச் செயல்படுகிறார்கள். அவர்கள் தங்கள் தொழில் லட்சியங்களை உணர முனைகிறார்கள், அவை பெரும்பாலும் பொருள் உடைமைகள் மற்றும் ஆறுதல்களுக்கான வலுவான தூண்டுதலால் இயக்கப்படுகின்றன. இந்த மக்கள் சொந்தமாக ஏதாவது தொடங்குவதை விட, மற்றவர்களுக்கு சேவை செய்ய முனைகிறார்கள். இந்த வேலைவாய்ப்பு ஒட்டுமொத்தமாக உணர்ச்சி ரீதியாக திருப்தி அடைவதற்கான முக்கிய நற்பண்புகளை இழக்கிறது. "
            }
        },
        {
            "name": "ராகு",
            "start": "செவ்வாய் மார்ச் 27 2018 ",
            "end": "வியாழன் மார்ச் 27 2036 ",
            "bhukthis": [
                {
                    "name": "ராகு",
                    "start": "செவ்வாய் மார்ச் 27 2018 ",
                    "end": "திங்கள் டிசம்பர் 07 2020 "
                },
                {
                    "name": "குரு",
                    "start": "திங்கள் டிசம்பர் 07 2020 ",
                    "end": "புதன் மே 03 2023 "
                },
                {
                    "name": "சனி",
                    "start": "புதன் மே 03 2023 ",
                    "end": "திங்கள் மார்ச் 09 2026 "
                },
                {
                    "name": "புதன்",
                    "start": "திங்கள் மார்ச் 09 2026 ",
                    "end": "திங்கள் செப்டம்பர் 25 2028 "
                },
                {
                    "name": "கேது",
                    "start": "திங்கள் செப்டம்பர் 25 2028 ",
                    "end": "ஞாயிறு அக்டோபர் 14 2029 "
                },
                {
                    "name": "சுக்கிரன்",
                    "start": "ஞாயிறு அக்டோபர் 14 2029 ",
                    "end": "புதன் அக்டோபர் 13 2032 "
                },
                {
                    "name": "சூரியன்",
                    "start": "புதன் அக்டோபர் 13 2032 ",
                    "end": "புதன் செப்டம்பர் 07 2033 "
                },
                {
                    "name": "சந்திரன்",
                    "start": "புதன் செப்டம்பர் 07 2033 ",
                    "end": "வெள்ளி மார்ச் 09 2035 "
                },
                {
                    "name": "செவ்வாய்",
                    "start": "வெள்ளி மார்ச் 09 2035 ",
                    "end": "வியாழன் மார்ச் 27 2036 "
                }
            ],
            "prediction": {
                "prediction": "7 வது வீட்டில் ராகு உள்ளவர்கள் சமமாக அங்கீகரிக்கப்பட விரும்புகிறார்கள். அத்தகைய நபர்கள் கலாச்சார பொருத்தமற்ற அல்லது விசித்திரமான சாத்தியமான கூட்டாளியுடன்  ஈர்க்கப்படுகிறார்கள். பூர்வீகவாசிகள் பெரும்பாலும் தங்கள் வாழ்க்கைத் துணையுடன் அசாதாரண சூழ்நிலைகளில் சிக்கிக்கொள்கிறார்கள். சில நேரங்களில், அவர்கள் திருமணம், ஒப்பந்தம் அல்லது உடன் படிக்கை முதலில் நடக்காது . முதல் திருமணம் பெரும்பாலும் அவர்களின் சமூக அந்தஸ்தை உயர்த்துகிறது; இருப்பினும், வழக்கை துணை வாழ்க்கையின்  மதிப்புகளை புறக்கணிக்கலாம்.  இருப்பினும், ராகு தீவிரத்தையும் திடீர் மாற்றங்களையும் கொண்டு வர முடியும் என்பதை நினைவில் கொள்ளுங்கள், இது அவ்வப்போது கொந்தளிப்பை உருவாக்கும். உங்கள் திருமணம் மற்றும் வணிக கூட்டாளிகளின் 7 வது வீட்டில், இது சில நேரங்களில் போராட்டங்களுக்கு வழிவகுக்கும், குறிப்பாக தொடர்பு மற்றும் பரஸ்பர புரிதல். தவறான விளக்கங்கள் தனிப்பட்ட மற்றும் தொழில்முறை உறவுகளை பாதிக்கலாம். சிம்மத்தின் ஆதிக்க குணம் உங்களை பிடிவாதமாக ஆக்கி, தேவையற்ற சச்சரவுகளுக்கு வழிவகுக்கும். அதிக நம்பிக்கை உங்கள் முடிவெடுப்பதில் எதிர்மறையான தாக்கத்தை ஏற்படுத்தும் என்பதை நினைவில் கொள்ளுங்கள். முதிர்ச்சியுடனும் பொறுமையுடனும் சிக்கலைக் கையாள்வது பயனுள்ள மோதலைத் தீர்ப்பதற்கு இன்றியமையாதது. மேலும், சிம்ம ராசியின் லட்சியப் பக்கத்தால் நீங்கள் மன அழுத்தத்தை சந்திக்க நேரிடலாம், எனவே உங்கள் ஆரோக்கியத்தை பராமரிக்க தேவையான இடைவெளிகளை எடுக்க மறக்காதீர்கள்.",
                "dasha": "ராகு",
                "dasha_end_year": "வியாழன் மார்ச் 27 2036 ",
                "dasha_start_year": "செவ்வாய் மார்ச் 27 2018 ",
                "planet_in_zodiac": "ராகு சூரியனுடன் பகை உறவைப் பகிர்ந்து கொள்கிறார், அதனால்தான் வேத ஜோதிடத்தில் எதிர்மறையான முடிவுகளைக் கொண்டுவருவதற்காக அவர்களின் இணைப்பும் நடத்தப்படுகிறது. சிம்மம் சூரியனால் ஆளப்படுகிறது, எனவே இயற்கையாகவே ராகு எதிரி கிரகத்தின் அடையாளத்தில் வைக்கப்படும் முடிவுகள் சாதகமாக இருக்காது. சிம்மம் ஒரு நெருப்பு ராசி, நெருப்பு என்றால் ஆக்கிரமிப்பு, ஆசை, பேரார்வம் மற்றும் லட்சியம். இவை அனைத்தும் ராகு பூர்வீகத்தில் அதிகரிக்கிறது. இந்த மக்களுக்கும் அவர்களின் நெறிமுறைகள் மற்றும் நம்பிக்கைகள் அங்கீகரிக்கப்பட்டு போற்றப்பட வேண்டும் என்ற வலுவான விருப்பம் உள்ளது. சிம்மத்தில் ராகு பெரும்பாலும் குடும்பத்தை பூர்வீகமாக பிரித்துவிடுகிறார். மேலும், அத்தகைய நபர் தந்தையுடன் தவறான புரிதல்களையும் கருத்து மோதல்களையும் பகிர்ந்து கொள்கிறார். இந்த மக்கள் நல்ல மூலோபாய வல்லுனர்களை உருவாக்குகிறார்கள். அவர்கள் ஈர்க்கக்கூடிய புத்திசாலித்தனமும் கூர்மையான மனமும் கொண்டவர்கள். அவர்கள் புத்திசாலி ஆனால் சில சமயங்களில் விவேகமுள்ளவர்களாக இருப்பார்கள். ஈகோ மற்றும் சுய - ஆர்வம் இவர்களிடம் அதிகம். குழந்தைகள் மற்றும் சந்ததி விஷயங்களில் அவர்கள் பிரச்சனைகளை எதிர்கொள்கிறார்கள். அவர்கள் காடுகளிலும் காட்டு இடங்களிலும் பயணம் செய்ய விரும்புகிறார்கள். அவர்கள் நல்ல விவாதக்காரர்கள் மற்றும் சிங்கம் போல மிகவும் வீரம் உடையவர்கள்."
            }
        },
        {
            "name": "குரு",
            "start": "வியாழன் மார்ச் 27 2036 ",
            "end": "செவ்வாய் மார்ச் 26 2052 ",
            "bhukthis": [
                {
                    "name": "குரு",
                    "start": "வியாழன் மார்ச் 27 2036 ",
                    "end": "சனி மே 15 2038 "
                },
                {
                    "name": "சனி",
                    "start": "சனி மே 15 2038 ",
                    "end": "ஞாயிறு நவம்பர் 25 2040 "
                },
                {
                    "name": "புதன்",
                    "start": "ஞாயிறு நவம்பர் 25 2040 ",
                    "end": "செவ்வாய் மார்ச் 03 2043 "
                },
                {
                    "name": "கேது",
                    "start": "செவ்வாய் மார்ச் 03 2043 ",
                    "end": "ஞாயிறு பிப்ரவரி 07 2044 "
                },
                {
                    "name": "சுக்கிரன்",
                    "start": "ஞாயிறு பிப்ரவரி 07 2044 ",
                    "end": "திங்கள் அக்டோபர் 08 2046 "
                },
                {
                    "name": "சூரியன்",
                    "start": "திங்கள் அக்டோபர் 08 2046 ",
                    "end": "சனி ஜூலை 27 2047 "
                },
                {
                    "name": "சந்திரன்",
                    "start": "சனி ஜூலை 27 2047 ",
                    "end": "புதன் நவம்பர் 25 2048 "
                },
                {
                    "name": "செவ்வாய்",
                    "start": "புதன் நவம்பர் 25 2048 ",
                    "end": "திங்கள் நவம்பர் 01 2049 "
                },
                {
                    "name": "ராகு",
                    "start": "திங்கள் நவம்பர் 01 2049 ",
                    "end": "செவ்வாய் மார்ச் 26 2052 "
                }
            ],
            "prediction": {
                "prediction": " 2வது வீட்டின் அதிபதி, குரு, 12 வது வீடான மகரம் ராசியில் இருப்பதால், நீங்கள் வெளிநாடுகளில் நிதி மூலம் பணம் சம்பாதிப்பீர்கள். நீங்கள் வெளிநாட்டில் கூட சட்டத்துறையில் இருக்கலாம். சில தொலைதூர இடத்தில் நீங்கள் ஒரு குறிப்பிடத்தக்க நபரை சந்திக்கலாம். உங்கள் வாழ்க்கையின் ஆரம்பத்தில் உங்கள் செல்வத்தை இழக்க நேரிடும், ஆனால் பின்னர் வாழ்க்கையில் அதை மீண்டும் பெறுவீர்கள். உங்கள் பிள்ளைகளும் வெளிநாடு சென்று படிக்கலாம்.  இருப்பினும், 12 ஆம் வீட்டில் வியாழன் விரிவடையும் தன்மை, அதிகப்படியான செலவுகளுக்கு வழிவகுக்கும், இது நிதி நெருக்கடியை ஏற்படுத்தும். நடைமுறைவாதம் மற்றும் எச்சரிக்கைக்கு பெயர் பெற்ற மகர ராசியில் இருப்பது, உங்களை அதிகப்படியான பழமைவாதியாக மாற்றலாம் அல்லது உங்கள் சிந்தனையை மட்டுப்படுத்தலாம், வியாழனின் இயல்பான நம்பிக்கையைத் தடுக்கலாம். பொறுப்புகள், சுமைகள் மற்றும் சனியின் (மகரத்தின் ஆட்சியாளர்) பாடங்களின் அழுத்தத்தையும் நீங்கள் உணரலாம். தொழில் ரீதியாக, நீங்கள் கடக்க வேண்டிய நிர்வாகம் அல்லது கனரக இயந்திரத் துறைகளில் கடுமையான போட்டி அல்லது குறிப்பிடத்தக்க சவால்களை சந்திக்க நேரிடும். தூக்கம் மற்றும் தனிமை தொடர்பான பிரச்சினைகள் இருக்கலாம். மகர ராசியால் சுட்டிக்காட்டப்பட்ட கால்கள் மற்றும் முழங்கால்களில் பிரச்சினைகள் ஏற்படலாம்.",
                "dasha": "குரு",
                "dasha_end_year": "செவ்வாய் மார்ச் 26 2052 ",
                "dasha_start_year": "வியாழன் மார்ச் 27 2036 ",
                "planet_in_zodiac": "மகரம் என்பது சனியின் ஆளுகைக்கு உட்பட்ட ஒரு நகரும்  பூமியின் ராசி, இது ஒரு நடுநிலை காற்றோட்டமான கிரகம். வியாழன் மற்றும் சனி ஒருவருக்கொருவர் நடுநிலை வகிக்கிறார்கள். அவர்கள் எதிரிகள் இல்லை என்றாலும், அவர்களின் உறவு நட்பாக இல்லை. மேலும், மகர ராசியில் வியாழன் பலவீனமடைவதால் சனியின் கேடான தாக்கத்தின் காரணமாக இந்த இடத்தில் அதன் நேர்மறையைப் பயன்படுத்த முடியவில்லை. வேலை வாழ்க்கை என்று வரும்போது, இந்த மக்கள் நெறிமுறைகள் மற்றும் ஒழுக்கத்தின் உயர்ந்த உணர்வை வெளிப்படுத்துகிறார்கள், குறிப்பாக வணிகம் அல்லது பொது அலுவலகத்தில். இந்த மக்களுக்கு நல்ல தீர்ப்பு திறன் உள்ளது, எனவே அவர்கள் சட்டம் போன்ற துறைகளில் சிறப்பாக செயல்படுகிறார்கள். மகர ராசியில் உள்ள வியாழன் ஒருவருக்கு முடிவில்லாத லட்சியத்தை அளிக்கிறது. இத்தகைய மக்கள் இயற்கையில் இரக்கமுள்ளவர்கள். அவர்களின் குணம் தூய்மையானது மற்றும் அவர்கள் உறவினர்களிடம் மிகவும் பாசமாக இருக்கிறார்கள். அவர்கள் அறிவாற்றல் இல்லாதவர்கள் என்றாலும், அவர்கள் வாழ்க்கையில் கடினமாக உழைக்கிறார்கள். இருப்பினும் அவர்களின் கடின உழைப்பு அவர்களின் எதிர்பார்ப்புகளுக்கு ஏற்ப நிதி ஆதாயங்களை ஏற்படுத்தாது. வியாழன் ஆன்மீக உள்ளுணர்வுகளைத் தருகிறது, ஆனால் சனியின் செல்வாக்கு நபரின் மத நடத்தையை பாதிக்கிறது. இந்த பூர்வீக மக்கள் சேவை மற்றும் தொழிலில் அதிக அக்கறை கொண்டவர்கள் மற்றும் அதிகாரத்தை அடைய வலுவான உந்துதல் கொண்டவர்கள். அவர்களின் தூய்மை உணர்வும் அவ்வளவாக இல்லை. "
            }
        },
        {
            "name": "சனி",
            "start": "செவ்வாய் மார்ச் 26 2052 ",
            "end": "வெள்ளி மார்ச் 27 2071 ",
            "bhukthis": [
                {
                    "name": "சனி",
                    "start": "செவ்வாய் மார்ச் 26 2052 ",
                    "end": "செவ்வாய் மார்ச் 30 2055 "
                },
                {
                    "name": "புதன்",
                    "start": "செவ்வாய் மார்ச் 30 2055 ",
                    "end": "வெள்ளி டிசம்பர் 07 2057 "
                },
                {
                    "name": "கேது",
                    "start": "வெள்ளி டிசம்பர் 07 2057 ",
                    "end": "வியாழன் ஜனவரி 16 2059 "
                },
                {
                    "name": "சுக்கிரன்",
                    "start": "வியாழன் ஜனவரி 16 2059 ",
                    "end": "சனி மார்ச் 18 2062 "
                },
                {
                    "name": "சூரியன்",
                    "start": "சனி மார்ச் 18 2062 ",
                    "end": "புதன் பிப்ரவரி 28 2063 "
                },
                {
                    "name": "சந்திரன்",
                    "start": "புதன் பிப்ரவரி 28 2063 ",
                    "end": "ஞாயிறு செப்டம்பர் 28 2064 "
                },
                {
                    "name": "செவ்வாய்",
                    "start": "ஞாயிறு செப்டம்பர் 28 2064 ",
                    "end": "சனி நவம்பர் 07 2065 "
                },
                {
                    "name": "ராகு",
                    "start": "சனி நவம்பர் 07 2065 ",
                    "end": "வியாழன் செப்டம்பர் 13 2068 "
                },
                {
                    "name": "குரு",
                    "start": "வியாழன் செப்டம்பர் 13 2068 ",
                    "end": "வெள்ளி மார்ச் 27 2071 "
                }
            ],
            "prediction": {
                "prediction": " 1வது வீட்டின் அதிபதி, சனி, 2 வது வீடான மீனம் ராசியில் இருப்பதால், குடும்பத்தில் மோதல்கள் பொதுவானதாக இருக்கலாம். பணம் சம்பந்தமாக உங்களுக்கு பயமும் கவலையும் இருக்கலாம். நீங்கள் உங்கள் குடும்பத்தினரையும் உறவினர்களையும் ஆதரிப்பீர்கள் ஆனால் அவர்களுடனான உங்கள் உறவு பாதிக்கப்படலாம். நீங்கள் நல்ல பணம் சம்பாதிக்க முடியும் ஆனால் கஞ்சத்தனமாக இருப்பீர்கள். குழந்தை பருவத்தில், நீங்கள் நிறைய வறுமையை சந்திக்க நேரிடும், அதனால் நீங்கள் பணத்தை மதிக்க கற்றுக்கொள்வீர்கள்.  மீன ராசிக்கு 2வது வீட்டில் சனி செல்வம் மற்றும் குடும்ப வாழ்க்கையில் சாதகமற்ற விளைவை ஏற்படுத்தும். சனியின் பாடங்கள் நிதி வரம்புகளை உள்ளடக்கியிருக்கலாம், இது பாதுகாப்பின்மை உணர்வுக்கு வழிவகுக்கும். சனியின் கட்டுப்பாடான தாக்கத்தால் குடும்ப உறவுகளில் உணர்ச்சி ஏற்றத்தாழ்வுகள் துன்பத்தை ஏற்படுத்தும். மீனத்தின் இலட்சியவாத மற்றும் அதிக உணர்திறன் கொண்ட போக்கு சனியின் நடைமுறை அணுகுமுறையுடன் மோதக்கூடும், இது முடிவெடுப்பதில் குழப்பத்திற்கு வழிவகுக்கும், குறிப்பாக நிதி சம்பந்தமாக. வெளிநாட்டு பயணம் அல்லது சேவைகளில் நீங்கள் தடைகளை சந்திக்க நேரிடும். உங்கள் ஆரோக்கியத்தை கவனித்துக் கொள்ளுங்கள், ஏனெனில் இந்த காலகட்டத்தில் அது எதிர்மறையாக பாதிக்கப்படலாம்.",
                "dasha": "சனி",
                "dasha_end_year": "வெள்ளி மார்ச் 27 2071 ",
                "dasha_start_year": "செவ்வாய் மார்ச் 26 2052 ",
                "planet_in_zodiac": "மீனம் என்பது வியாழனால் ஆளப்படும் இரட்டை நீர் ராசியாகும் ஆகும். சனி மற்றும் வியாழன் இரண்டும் ஒருவருக்கொருவர் நடுநிலை வகிக்கின்றன. மீனம் ராசியில் சனி உள்ளவர்கள் ஆன்மீகத்திற்கு அர்ப்பணிப்பார்கள். 12 வது வீட்டின் தொடர்பு காரணமாக, அத்தகைய சொந்தக்காரர்கள் முன்னேற முனைகிறார்கள். ஆன்மீக விடுதலையை நோக்கி. மீனம் ராசியானது இரண்டு மீன்கள் எதிர் திசையில் நீந்துவதைக் குறிக்கிறது. இது தண்ணீருடன் தொடர்புடையது. மேலும் மீனத்தில் சனி அமர்ந்தால், பூர்வீகம் ஆழ்ந்த சிந்தனையாளராகிறது. அத்தகைய நபர் ஒவ்வொரு விஷயத்தையும் அதன் ஆழத்தில் படிக்கிறார். சனி இந்த பூர்வீகவாசிகளுக்கு சிறந்த தீர்ப்புகளை வழங்க உதவுகிறது ஆனால் ஒரு ஆசிரியரைப் போல் அல்லாமல் ஒரு வழிகாட்டியைப் போல் செயல்படுகிறது. அது அவர்களின் வழிகாட்டும் ஆவி போல் செயல்படுகிறது. மீனத்தில் சனியுடன் பிறந்தவர்கள் இயற்கையில் தியாகம் செய்கிறார்கள். அவர்கள் கலைகளில் வலுவான நாட்டம் கொண்டவர்கள். இந்த நபர்கள்  பெரும்பாலும் தங்கள் நண்பர்கள் மற்றும் உறவினர்களிடையே முக்கிய பங்கு வகிக்கிறார்கள், ஏனென்றால் அவர்கள் ஒழுங்குபடுத்துவதிலும் கொள்கைகளை உருவாக்குவதிலும் சிறந்தவர்கள் இந்த பூர்வீக மக்கள் கண்ணியமான, பணக்கார, இரக்கமுள்ள, உணர்திறன் மற்றும் விசுவாசமுள்ளவர்களாக இருக்கிறார்கள். மேலும் சம்பாதிக்க வேண்டும் என்ற வலுவான விருப்பமும் உள்ளது. இத்தகைய மக்கள் கலைகள் போன்ற ஆக்கபூர்வமான துறைகளில் வலுவான தொடர்பைக் கொண்டுள்ளனர். அவர்கள் உண்மையில் கலை அல்லது ஆன்மீகத் துறையில் தங்கள் தொழிலைச் செய்ய வாய்ப்புள்ளது. இந்த பூர்வீகவாசிகள் நல்ல கற்றல் மற்றும் நம்பிக்கையான அணுகுமுறையைக் கொண்டுள்ளனர். அவர்கள் ஒரு பிரகாசமான எதிர்காலத்தை நாடுகிறார்கள், அதை நோக்கி வேலை செய்கிறார்கள். இந்த பூர்வீகவாசிகளும் நிறைய ஈடுபட விரும்புகிறார்கள். "
            }
        },
        {
            "name": "புதன்",
            "start": "வெள்ளி மார்ச் 27 2071 ",
            "end": "வெள்ளி மார்ச் 26 2088 ",
            "bhukthis": [
                {
                    "name": "புதன்",
                    "start": "வெள்ளி மார்ச் 27 2071 ",
                    "end": "புதன் ஆகஸ்ட் 23 2073 "
                },
                {
                    "name": "கேது",
                    "start": "புதன் ஆகஸ்ட் 23 2073 ",
                    "end": "திங்கள் ஆகஸ்ட் 20 2074 "
                },
                {
                    "name": "சுக்கிரன்",
                    "start": "திங்கள் ஆகஸ்ட் 20 2074 ",
                    "end": "ஞாயிறு ஜூன் 20 2077 "
                },
                {
                    "name": "சூரியன்",
                    "start": "ஞாயிறு ஜூன் 20 2077 ",
                    "end": "செவ்வாய் ஏப்ரல் 26 2078 "
                },
                {
                    "name": "சந்திரன்",
                    "start": "செவ்வாய் ஏப்ரல் 26 2078 ",
                    "end": "செவ்வாய் செப்டம்பர் 26 2079 "
                },
                {
                    "name": "செவ்வாய்",
                    "start": "செவ்வாய் செப்டம்பர் 26 2079 ",
                    "end": "ஞாயிறு செப்டம்பர் 22 2080 "
                },
                {
                    "name": "ராகு",
                    "start": "ஞாயிறு செப்டம்பர் 22 2080 ",
                    "end": "ஞாயிறு ஏப்ரல் 11 2083 "
                },
                {
                    "name": "குரு",
                    "start": "ஞாயிறு ஏப்ரல் 11 2083 ",
                    "end": "செவ்வாய் ஜூலை 17 2085 "
                },
                {
                    "name": "சனி",
                    "start": "செவ்வாய் ஜூலை 17 2085 ",
                    "end": "வெள்ளி மார்ச் 26 2088 "
                }
            ],
            "prediction": {
                "prediction": " 5வது வீட்டின் அதிபதி, புதன், 11 வது வீடான தனுசு ராசியில் இருப்பதால், பெரிய நிறுவனங்களில் கற்பிப்பதன் மூலமோ அல்லது ஆலோசகராக செயல்படுவதன் மூலமோ நீங்கள் சம்பாதிக்கலாம். நீங்கள் எந்தத் துறையிலும் தொடர்புடைய உயர் படிப்புகளுக்குச் செல்ல ஆர்வமாக இருப்பீர்கள். நீங்கள் பணம் பற்றி கணக்கிட்டு எழுதுவதன் மூலமும் சம்பாதிக்கலாம். உங்கள் அறிவுசார் மற்றும் தகவல் தொடர்பு திறன்கள் சுவாரஸ்யமாக இருந்தாலும், அவை எப்போதும் உங்களுக்கு சாதகமாக இருக்காது. உங்கள் சகிப்புத்தன்மை காரணமாக உங்கள் உடன்பிறப்புகள் அல்லது நெருங்கிய நண்பர்களுடன் தவறான புரிதல்கள் அல்லது வாக்குவாதங்களை நீங்கள் சந்திக்க நேரிடும். தனுசு ராசியில் வரும் அதீத நம்பிக்கை, நிதி மற்றும் முதலீடுகள் தொடர்பாக நடைமுறைக்கு மாறான முடிவுகளை எடுக்க வழிவகுக்கும், இதனால் இழப்புகள் ஏற்படும். தொழில் ரீதியாக, அரசியலில், கேலியான கருத்துக்கள் அல்லது போட்டியாளர்களைக் கையாள்வதில் நீங்கள் சவால்களை எதிர்கொள்ள நேரிடும். வருமானத்தில் ஏற்ற இறக்கங்கள் இருக்கலாம், அதனால் மன அழுத்தம் ஏற்படலாம். அறிவிற்கான உங்கள் நிலையான ஆசை மற்றவர்களிடம் தற்பெருமை காட்டுவது, உறவுகளை பாதிக்கும்.",
                "dasha": "புதன்",
                "dasha_end_year": "வெள்ளி மார்ச் 26 2088 ",
                "dasha_start_year": "வெள்ளி மார்ச் 27 2071 ",
                "planet_in_zodiac": "தனுசு என்பது வியாழனால் ஆளப்படும் இரட்டை நெருப்பு ராசி ஆகும், இது ஜோதிடத்தில் அனைத்து கிரகங்களிலும் மிகவும் நன்மை பயக்கும் என்று கருதப்படுகிறது. வியாழனுக்கும் புதனுக்கும் இடையே ஒரு நெருங்கிய உறவு இருந்தாலும், இந்த இரு கிரகங்களும் பூர்வீகத்திற்கு நன்றாக மாறும். இயற்கையில் நன்மை பயக்கும் மற்றும் நேர்மறையான முடிவுகளைத் தருகிறது. தனுசு ராசியில் புதன் உள்ளவர்கள் வாழ்க்கையில் தாராளவாத அணுகுமுறையைக் கொண்டுள்ளனர். புதன் தந்திரம் மற்றும் இராஜதந்திரக் கலையிலும் அவர்களைப் பயன்படுத்துகிறது. மத இடங்கள் மற்றும் புத்தகங்களைப் பார்வையிடுவதற்கான வலுவான விருப்பம். அவர்கள் தத்துவ மனப்பான்மை கொண்டவர்கள், எனவே இது போன்ற விவேகமான விவாதங்களை அனுபவிக்கவும். உளவியல் மற்றும் மதம் ஆகியவை படிக்கும் பாடங்களாக அவர்களை ஈர்க்கின்றன. புதன் இங்குள்ளவருக்கு சொற்பொழிவாற்றும் திறனை அளிக்கிறது. நபர் ஒரு திறமையான பேச்சாளர், பெரும்பாலும் எழுதுவதில் நிபுணர். வெளிநாட்டு கலாச்சாரங்கள் மற்றும் மொழிகள் பொதுவாக அத்தகைய மக்களை கவர்ந்திழுக்கும். அவர்களின் கற்பனை மிகவும் வளமான மற்றும் சுவாரஸ்யமானது. இந்த மக்கள் நல்ல கதைசொல்லிகளாக மாறுகிறார்கள் மற்றும் ஆசிரியர்களை ஒரு தொழிலாக ஏற்றுக்கொள்ளலாம், ஏனென்றால் அவர்களின் யோசனைகள் பெரும்பாலும் கட்டாயமாகவும் கவர்ச்சியாகவும் இருக்கின்றன."
            }
        },
        {
            "name": "கேது",
            "start": "வெள்ளி மார்ச் 26 2088 ",
            "end": "ஞாயிறு மார்ச் 27 2095 ",
            "bhukthis": [
                {
                    "name": "கேது",
                    "start": "வெள்ளி மார்ச் 26 2088 ",
                    "end": "ஞாயிறு ஆகஸ்ட் 22 2088 "
                },
                {
                    "name": "சுக்கிரன்",
                    "start": "ஞாயிறு ஆகஸ்ட் 22 2088 ",
                    "end": "சனி அக்டோபர் 22 2089 "
                },
                {
                    "name": "சூரியன்",
                    "start": "சனி அக்டோபர் 22 2089 ",
                    "end": "திங்கள் பிப்ரவரி 27 2090 "
                },
                {
                    "name": "சந்திரன்",
                    "start": "திங்கள் பிப்ரவரி 27 2090 ",
                    "end": "வியாழன் செப்டம்பர் 28 2090 "
                },
                {
                    "name": "செவ்வாய்",
                    "start": "வியாழன் செப்டம்பர் 28 2090 ",
                    "end": "சனி பிப்ரவரி 24 2091 "
                },
                {
                    "name": "ராகு",
                    "start": "சனி பிப்ரவரி 24 2091 ",
                    "end": "வெள்ளி மார்ச் 14 2092 "
                },
                {
                    "name": "குரு",
                    "start": "வெள்ளி மார்ச் 14 2092 ",
                    "end": "புதன் பிப்ரவரி 18 2093 "
                },
                {
                    "name": "சனி",
                    "start": "புதன் பிப்ரவரி 18 2093 ",
                    "end": "செவ்வாய் மார்ச் 30 2094 "
                },
                {
                    "name": "புதன்",
                    "start": "செவ்வாய் மார்ச் 30 2094 ",
                    "end": "ஞாயிறு மார்ச் 27 2095 "
                }
            ],
            "prediction": {
                "prediction": "ஜாதகத்தில் கேது உங்கள் முதல் வீட்டில் அமர்ந்திருந்தால், நீங்கள் மிகவும் மர்மமான ஆளுமை உடையவராக இருப்பீர்கள். மக்களுக்கு உங்களை புரிந்துகொள்வதில் கஷ்டம்.. நீங்கள் சொல்வதில் பெரும்பாலும் இரட்டை அர்த்தம் இருக்கும். உங்களுடை வாழ்க்கைக்கான லட்சியத்தை நிறைவேற்ற நிறைய பயணங்களை மேற்கொள்வீர்கள். நீங்கள் கெட்ட சகவாசத்தை தவிர்ப்பதை நல்லது. சில சமயங்களில் சுயநலமாகவும் பேராசை கொண்டவராகவும் மாறுவதற்கான வலுவான போக்கு உள்ளது.  உங்கள் கேது மகாதசையின் போது, கும்ப ராசியில் உங்கள் வீட்டின் எண் 1 இல் கேதுவின் இருப்பிடம் ஆன்மீக வளர்ச்சி, சுய கண்டுபிடிப்பு மற்றும் மாற்றத்தின் ஒரு அற்புதமான கட்டத்தை பரிந்துரைக்கிறது. புதிய சகிப்புத்தன்மை மற்றும் உயிர்ச்சக்தியுடன் உங்கள் உடல் ஆரோக்கியம் கணிசமாக மேம்படும். உங்கள் ஞானம் மற்றும் ஸ்டோயிசம் ஆகியவற்றால் நீங்கள் அடையாளம் காணப்படுவீர்கள், இது பெரும் புகழையும் வெற்றியையும் கொண்டு வரக்கூடும். உங்கள் உயரமான அந்தஸ்தும், தனித்துவமான தோற்றமும் உங்களுக்கும் சுற்றி இருப்பவர்களுக்கும் பெருமையாக இருக்கலாம். உங்கள் ஆற்றல் கும்பத்தின் மாய குணங்களுடன் எதிரொலிக்கும், உங்களில் ஆர்வத்தையும் அறிவார்ந்த வலிமையையும் தூண்டி, உள்ளுணர்வு மற்றும் தொலைநோக்கு மந்திரத்தை நீங்கள் கண்டறியச் செய்யும். இந்த காலகட்டம் உங்களின் தனிப்பட்ட உறவுகளை மேம்படுத்தும், அங்கு நண்பர்கள் மற்றும் குடும்பத்தினருடனான உங்கள் தொடர்புகளில் புதிய ஆழங்களை நீங்கள் காணலாம். இந்த காலகட்டத்தில் உங்கள் வீட்டுச் சூழலில் நீங்கள் பெரும் அமைதி, ஆறுதல் மற்றும் ஸ்திரத்தன்மையை அனுபவிப்பீர்கள்.",
                "dasha": "கேது",
                "dasha_end_year": "ஞாயிறு மார்ச் 27 2095 ",
                "dasha_start_year": "வெள்ளி மார்ச் 26 2088 ",
                "planet_in_zodiac": "கும்பத்தின் ஆளும் கிரகம் சனியும் மற்றும் இருவரும் ஒருவருக்கொருவர் நட்பாக இருக்கிறார்கள். சனி பொருள்முதல்வாதத்திலிருந்து விலகுவதற்கான முக்கியத்துவமாகும் மற்றும் கேதுவும் ஆன்மீக விடுதலையுடன் தொடர்புடையவர். கும்பத்தில் கேதுவுடன் பிறந்தவர்கள் மிகவும் கற்றவர்கள் மற்றும் புரிந்துகொள்கிறார்கள். வாழ்க்கையின் யதார்த்தம். ஆனால் இந்த அறிவு இருந்தபோதிலும், அவர்கள் தங்கள் ஆசைகளிலிருந்து விடுபட போராடுகிறார்கள். கும்பத்தில் கேது அந்த நபருக்கு முடிவில்லாத ஆசைகளைத் தருகிறார். சனியும் சமூக சேவையுடன் தொடர்புடையது மற்றும் கும்பமும் செய்கிறது.கேதுவின் இடப்பெயர்ச்சி ஒருவரின் நற்பண்புப் பணிகளை மேலும் அதிகரிக்கச் செய்கிறது. கேது ஒரு காற்றோட்டமான கிரகம் மற்றும் அது கும்பத்தில் நிலைபெறும் போது,பூர்வீகம் நம்பத்தகாத திட்டங்களைச் செய்ய முனைகிறது மற்றும் தேவையற்ற ஆசைகளைக் கொண்டுள்ளது. கேதுவின் இந்த நிலை பூர்வீக காது தொடர்பான பிரச்சினைகளுக்கு ஆளாகிறது. இந்த மக்கள் வாழ்க்கையில் தாமதமாக வெற்றி பெறுகிறார்கள். அவர்கள் இயற்கையில் மிகவும் கண்டிப்பானவர்கள் மற்றும் பிடிவாதமானவர்கள். அவர்களின் விருப்பத்திற்கு எதிராக மாற்றத்தை ஏற்படுத்துவது மிகவும் கடினம் குடும்பம், நண்பர்கள் மற்றும் அவர்களது சொந்த குழந்தைகளுடனான அவர்களின் உறவு அதிகம் வளராது. வருமானத்தில் உறுதியற்ற தன்மை இந்த பூர்வீகவாசிகளுக்கும் சாத்தியமாகும். கும்பத்தில் உள்ள கேது வெளிநாடு செல்வதற்கான வாய்ப்புகளை அதிகரிக்கிறது. "
            }
        },
        {
            "name": "சுக்கிரன்",
            "start": "ஞாயிறு மார்ச் 27 2095 ",
            "end": "வியாழன் மார்ச் 28 2115 ",
            "bhukthis": [
                {
                    "name": "சுக்கிரன்",
                    "start": "ஞாயிறு மார்ச் 27 2095 ",
                    "end": "சனி ஜூலை 26 2098 "
                },
                {
                    "name": "சூரியன்",
                    "start": "சனி ஜூலை 26 2098 ",
                    "end": "திங்கள் ஜூலை 27 2099 "
                },
                {
                    "name": "சந்திரன்",
                    "start": "திங்கள் ஜூலை 27 2099 ",
                    "end": "ஞாயிறு மார்ச் 27 2101 "
                },
                {
                    "name": "செவ்வாய்",
                    "start": "ஞாயிறு மார்ச் 27 2101 ",
                    "end": "சனி மே 27 2102 "
                },
                {
                    "name": "ராகு",
                    "start": "சனி மே 27 2102 ",
                    "end": "புதன் மே 27 2105 "
                },
                {
                    "name": "குரு",
                    "start": "புதன் மே 27 2105 ",
                    "end": "வியாழன் ஜனவரி 26 2108 "
                },
                {
                    "name": "சனி",
                    "start": "வியாழன் ஜனவரி 26 2108 ",
                    "end": "சனி மார்ச் 28 2111 "
                },
                {
                    "name": "புதன்",
                    "start": "சனி மார்ச் 28 2111 ",
                    "end": "வெள்ளி ஜனவரி 26 2114 "
                },
                {
                    "name": "கேது",
                    "start": "வெள்ளி ஜனவரி 26 2114 ",
                    "end": "வியாழன் மார்ச் 28 2115 "
                }
            ],
            "prediction": {
                "prediction": " 4வது வீட்டின் அதிபதி, சுக்கிரன், 12 வது வீடான மகரம் ராசியில் இருப்பதால், நீங்கள் தொலைதூர இடங்களுக்குச் செல்ல விரும்புவீர்கள், பல்வேறு கலாச்சாரங்களைச் சேர்ந்த புதிய நபர்களைச் சந்திக்க விரும்புவீர்கள். நீங்கள் உயர் படிப்பு மற்றும் வெவ்வேறு தத்துவங்களில் ஈடுபடுவீர்கள். வெளிநாட்டு மூலங்களிலிருந்து செல்வத்தைப் பெறுவீர்கள். உங்கள் துணைவர் வேறு நாட்டை சேர்ந்தவராக இருப்பர்.  சுக்கிரன், மகரத்தில் உங்கள் 12 வது வீட்டிற்குச் செல்வதால், வெளிநாட்டு வணிகம் மற்றும் வர்த்தகத்தில் செழிப்பை உறுதியளிக்கிறார். இந்த பசுமையான கிரகம் உங்கள் செலவினங்களுக்கு ஆடம்பரம், அழகு மற்றும் இணக்கம் ஆகியவற்றைக் கொண்டுவருகிறது, கலை மற்றும் உறவுகளின் துறையில் ஆடம்பரமான செலவுகளை அனுமதிக்கிறது. பேச்சுவார்த்தை மற்றும் நிதிக்கான இயல்பான சாமர்த்தியம் அதிக லாபத்தைத் தரும். கவர்ச்சியான இடங்களுக்கு பயணம் செய்வது வெளிப்படையானது, ஆன்மீக வளர்ச்சி மற்றும் சுய இன்பத்தை மேம்படுத்துகிறது. பெரிய சமூகங்களுடனான ஆழமான பிணைப்புகள் நல்ல காரியங்களுக்கு இரகசியமாக பங்களிக்க உங்களைத் தூண்டும். ஒழுக்கமான காதல் வாழ்க்கை வெளிநாட்டு கூட்டாளர்களுடன் நிலையான உறவுகளை உருவாக்க உதவும். குடும்பம் உங்களின் உந்துதலுக்கு உறுதுணையாக இருக்கும் மற்றும் தொலைதூர நாடுகளில் வெற்றி பெறுவீர்கள்.",
                "dasha": "சுக்கிரன்",
                "dasha_end_year": "வியாழன் மார்ச் 28 2115 ",
                "dasha_start_year": "ஞாயிறு மார்ச் 27 2095 ",
                "planet_in_zodiac": "மகரம் ஒரு அசையும் பூமி ராசி மற்றும் அவர்களின் தன்மை மற்றும் மனோபாவத்தில் உறுதியான உணர்வு உள்ளது. அவர்கள் ஒதுக்கப்பட்ட மற்றும் உணர்ச்சிவசப்பட்ட நபர்களாக இருப்பார்கள். மேலும் சுக்கிரன் , காதல் கிரகம் மகரத்தில் வைக்கப்படும் போது,அது சிக்கலைத் தருகிறது கூட்டாளியிடம் உணர்வுகளையும் உணர்ச்சிகளையும் வெளிப்படுத்துவதுடன், மகர ராசியில் சுக்கிரன் உள்ளவர்கள் தங்கள் ஆசைகளை வலியுறுத்துவது மற்றும் தங்கள் கூட்டாளியிடம் சொல்வது கடினம். அவர்கள் காதல் வாழ்க்கையில் கூச்ச சுபாவமுள்ளவர்கள் இறுதியில் தனிமை மற்றும் அவர்கள் இதிலிருந்து தப்பிக்க முனைகிறார்கள், இதனால் அவர்கள் சில சமயங்களில் உணர்ச்சிவசப்படாமல் இருப்பார்கள். அவர்கள் தங்கள் விவகாரங்களை எப்படி நடத்துகிறார்கள் என்பதில் தீவிரமும் விவேகமும் இருக்கிறது. அவர்கள் காதல் விஷயங்களில் மிகவும் நடைமுறைக்குரியவர்கள். உண்மையில் அவர்கள் திறமையானவர்கள் தேவைப்பட்டால் ஏமாற்றுதல் வெற்றியை அடைய போராட்ட காலங்களில் கைகோருங்கள். "
            }
        }
    ],
    "d2Chart": {
        "0": {
            "name": "லக்",
            "zodiac": "கடகம்",
            "rasi_no": 4,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 22.442185995695013
        },
        "1": {
            "name": "சூ",
            "zodiac": "சிம்மம்",
            "rasi_no": 5,
            "house": 2,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 22.896196554459834
        },
        "2": {
            "name": "சந்",
            "zodiac": "கடகம்",
            "rasi_no": 4,
            "house": 1,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 5.378449389789495
        },
        "3": {
            "name": "செ",
            "zodiac": "கடகம்",
            "rasi_no": 4,
            "house": 1,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 3.0004817626759177
        },
        "4": {
            "name": "பு",
            "zodiac": "சிம்மம்",
            "rasi_no": 5,
            "house": 2,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 15.212264866900227
        },
        "5": {
            "name": "குரு",
            "zodiac": "சிம்மம்",
            "rasi_no": 5,
            "house": 2,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 19.20491333081725
        },
        "6": {
            "name": "சுக்",
            "zodiac": "கடகம்",
            "rasi_no": 4,
            "house": 1,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 12.42352226183641
        },
        "7": {
            "name": "சனி",
            "zodiac": "சிம்மம்",
            "rasi_no": 5,
            "house": 2,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 9.435730088838113
        },
        "8": {
            "name": "ரா",
            "zodiac": "கடகம்",
            "rasi_no": 4,
            "house": 1,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 11.927245778777092
        },
        "9": {
            "name": "கே",
            "zodiac": "கடகம்",
            "rasi_no": 4,
            "house": 1,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 11.927245778777092
        },
        "chart": "D2",
        "chart_name": "ஹோரா"
    },
    "d3Chart": {
        "0": {
            "name": "லக்",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 18.663278993542576
        },
        "1": {
            "name": "சூ",
            "zodiac": "கடகம்",
            "rasi_no": 4,
            "house": 10,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 19.344294831689695
        },
        "2": {
            "name": "சந்",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 8,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 8.067674084684242
        },
        "3": {
            "name": "செ",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 4,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 4.500722644013877
        },
        "4": {
            "name": "பு",
            "zodiac": "தனுசு",
            "rasi_no": 9,
            "house": 3,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 22.818397300350398
        },
        "5": {
            "name": "குரு",
            "zodiac": "கன்னி",
            "rasi_no": 6,
            "house": 12,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 13.80736999622593
        },
        "6": {
            "name": "சுக்",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 4,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 18.635283392754673
        },
        "7": {
            "name": "சனி",
            "zodiac": "கடகம்",
            "rasi_no": 4,
            "house": 10,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 29.15359513325734
        },
        "8": {
            "name": "ரா",
            "zodiac": "மேஷம்",
            "rasi_no": 1,
            "house": 7,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 2.8908686681656377
        },
        "9": {
            "name": "கே",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 1,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 2.8908686681656945
        },
        "chart": "D3",
        "chart_name": "திரேஷ்கனா"
    },
    "d3sChart": {
        "0": {
            "name": "லக்",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 26.221092997847506
        },
        "1": {
            "name": "சூ",
            "zodiac": "விருச்சிகம்",
            "rasi_no": 8,
            "house": 10,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 26.448098277229917
        },
        "2": {
            "name": "சந்",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 4,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 2.6892246948947474
        },
        "3": {
            "name": "செ",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 12,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 1.5002408813379589
        },
        "4": {
            "name": "பு",
            "zodiac": "தனுசு",
            "rasi_no": 9,
            "house": 11,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 7.606132433450114
        },
        "5": {
            "name": "குரு",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 12,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 24.602456665408624
        },
        "6": {
            "name": "சுக்",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 12,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 6.211761130918205
        },
        "7": {
            "name": "சனி",
            "zodiac": "மீனம்",
            "rasi_no": 12,
            "house": 2,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 19.717865044419057
        },
        "8": {
            "name": "ரா",
            "zodiac": "சிம்மம்",
            "rasi_no": 5,
            "house": 7,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 20.963622889388546
        },
        "9": {
            "name": "கே",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 1,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 20.963622889388546
        },
        "chart": "D3-s",
        "chart_name": "டி 3-சோமநாத"
    },
    "d4Chart": {
        "0": {
            "name": "லக்",
            "zodiac": "விருச்சிகம்",
            "rasi_no": 8,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 14.884371991390026
        },
        "1": {
            "name": "சூ",
            "zodiac": "சிம்மம்",
            "rasi_no": 5,
            "house": 10,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 15.792393108919669
        },
        "2": {
            "name": "சந்",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 7,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 10.75689877957899
        },
        "3": {
            "name": "செ",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 3,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 6.000963525351835
        },
        "4": {
            "name": "பு",
            "zodiac": "மீனம்",
            "rasi_no": 12,
            "house": 5,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 0.4245297338004548
        },
        "5": {
            "name": "குரு",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 12,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 8.409826661634497
        },
        "6": {
            "name": "சுக்",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 3,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 24.84704452367282
        },
        "7": {
            "name": "சனி",
            "zodiac": "கன்னி",
            "rasi_no": 6,
            "house": 11,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 18.871460177676227
        },
        "8": {
            "name": "ரா",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 4,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 23.854491557554184
        },
        "9": {
            "name": "கே",
            "zodiac": "சிம்மம்",
            "rasi_no": 5,
            "house": 10,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 23.854491557554184
        },
        "chart": "D4",
        "chart_name": "சதுர்த்தம்சா"
    },
    "d5Chart": {
        "0": {
            "name": "லக்",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 11.10546498923759
        },
        "1": {
            "name": "சூ",
            "zodiac": "கடகம்",
            "rasi_no": 4,
            "house": 10,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 12.240491386149415
        },
        "2": {
            "name": "சந்",
            "zodiac": "கன்னி",
            "rasi_no": 6,
            "house": 12,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 13.446123474473723
        },
        "3": {
            "name": "செ",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 4,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 7.501204406689794
        },
        "4": {
            "name": "பு",
            "zodiac": "கன்னி",
            "rasi_no": 6,
            "house": 12,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 8.030662167250739
        },
        "5": {
            "name": "குரு",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 8,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 3.0122833270431784
        },
        "6": {
            "name": "சுக்",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 5,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 1.0588056545911968
        },
        "7": {
            "name": "சனி",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 5,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 8.58932522209534
        },
        "8": {
            "name": "ரா",
            "zodiac": "மீனம்",
            "rasi_no": 12,
            "house": 6,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 14.818114446942673
        },
        "9": {
            "name": "கே",
            "zodiac": "கன்னி",
            "rasi_no": 6,
            "house": 12,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 14.818114446942673
        },
        "chart": "D5",
        "chart_name": "பஞ்சம்சா"
    },
    "d7Chart": {
        "0": {
            "name": "லக்",
            "zodiac": "சிம்மம்",
            "rasi_no": 5,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 3.547650984932716
        },
        "1": {
            "name": "சூ",
            "zodiac": "விருச்சிகம்",
            "rasi_no": 8,
            "house": 4,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 5.136687940609363
        },
        "2": {
            "name": "சந்",
            "zodiac": "விருச்சிகம்",
            "rasi_no": 8,
            "house": 4,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 18.824572864263246
        },
        "3": {
            "name": "செ",
            "zodiac": "கடகம்",
            "rasi_no": 4,
            "house": 12,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 10.501686169365712
        },
        "4": {
            "name": "பு",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 6,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 23.242927034150853
        },
        "5": {
            "name": "குரு",
            "zodiac": "தனுசு",
            "rasi_no": 9,
            "house": 5,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 22.217196657860768
        },
        "6": {
            "name": "சுக்",
            "zodiac": "சிம்மம்",
            "rasi_no": 5,
            "house": 1,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 13.482327916427494
        },
        "7": {
            "name": "சனி",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 6,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 18.025055310933567
        },
        "8": {
            "name": "ரா",
            "zodiac": "தனுசு",
            "rasi_no": 9,
            "house": 5,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 26.745360225719764
        },
        "9": {
            "name": "கே",
            "zodiac": "மிதுனம்",
            "rasi_no": 3,
            "house": 11,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 26.745360225720106
        },
        "chart": "D7",
        "chart_name": "சப்தம்சா"
    },
    "d8Chart": {
        "0": {
            "name": "லக்",
            "zodiac": "மிதுனம்",
            "rasi_no": 3,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 29.76874398278005
        },
        "1": {
            "name": "சூ",
            "zodiac": "மீனம்",
            "rasi_no": 12,
            "house": 10,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 1.584786217839337
        },
        "2": {
            "name": "சந்",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 12,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 21.51379755915798
        },
        "3": {
            "name": "செ",
            "zodiac": "மேஷம்",
            "rasi_no": 1,
            "house": 11,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 12.00192705070367
        },
        "4": {
            "name": "பு",
            "zodiac": "மீனம்",
            "rasi_no": 12,
            "house": 10,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 0.8490594676009096
        },
        "5": {
            "name": "குரு",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 12,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 16.819653323268994
        },
        "6": {
            "name": "சுக்",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 12,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 19.694089047345642
        },
        "7": {
            "name": "சனி",
            "zodiac": "மீனம்",
            "rasi_no": 12,
            "house": 10,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 7.742920355352453
        },
        "8": {
            "name": "ரா",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 12,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 17.708983115108367
        },
        "9": {
            "name": "கே",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 12,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 17.708983115108367
        },
        "chart": "D8",
        "chart_name": "அஷ்டம்சா"
    },
    "d10Chart": {
        "0": {
            "name": "லக்",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 22.21092997847518
        },
        "1": {
            "name": "சூ",
            "zodiac": "மீனம்",
            "rasi_no": 12,
            "house": 6,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 24.48098277229883
        },
        "2": {
            "name": "சந்",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 4,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 26.892246948947445
        },
        "3": {
            "name": "செ",
            "zodiac": "கன்னி",
            "rasi_no": 6,
            "house": 12,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 15.002408813379589
        },
        "4": {
            "name": "பு",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 5,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 16.061324334501478
        },
        "5": {
            "name": "குரு",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 8,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 6.024566654086357
        },
        "6": {
            "name": "சுக்",
            "zodiac": "விருச்சிகம்",
            "rasi_no": 8,
            "house": 2,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 2.1176113091823936
        },
        "7": {
            "name": "சனி",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 8,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 17.17865044419068
        },
        "8": {
            "name": "ரா",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 5,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 29.636228893885345
        },
        "9": {
            "name": "கே",
            "zodiac": "சிம்மம்",
            "rasi_no": 5,
            "house": 11,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 29.636228893885345
        },
        "chart": "D10",
        "chart_name": "தசாம்சா"
    },
    "d10RChart": {
        "0": {
            "name": "லக்",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 22.21092997847518
        },
        "1": {
            "name": "சூ",
            "zodiac": "விருச்சிகம்",
            "rasi_no": 8,
            "house": 2,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 24.48098277229883
        },
        "2": {
            "name": "சந்",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 4,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 26.892246948947445
        },
        "3": {
            "name": "செ",
            "zodiac": "கன்னி",
            "rasi_no": 6,
            "house": 12,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 15.002408813379589
        },
        "4": {
            "name": "பு",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 5,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 16.061324334501478
        },
        "5": {
            "name": "குரு",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 4,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 6.024566654086357
        },
        "6": {
            "name": "சுக்",
            "zodiac": "கடகம்",
            "rasi_no": 4,
            "house": 10,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 2.1176113091823936
        },
        "7": {
            "name": "சனி",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 8,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 17.17865044419068
        },
        "8": {
            "name": "ரா",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 5,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 29.636228893885345
        },
        "9": {
            "name": "கே",
            "zodiac": "சிம்மம்",
            "rasi_no": 5,
            "house": 11,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 29.636228893885345
        },
        "chart": "D10-R",
        "chart_name": "தசாம்சா-ஈவன்ரெவர்ஸ்"
    },
    "d12Chart": {
        "0": {
            "name": "லக்",
            "zodiac": "தனுசு",
            "rasi_no": 9,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 14.653115974170305
        },
        "1": {
            "name": "சூ",
            "zodiac": "கன்னி",
            "rasi_no": 6,
            "house": 10,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 17.377179326758778
        },
        "2": {
            "name": "சந்",
            "zodiac": "மிதுனம்",
            "rasi_no": 3,
            "house": 7,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 2.2706963387369683
        },
        "3": {
            "name": "செ",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 2,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 18.002890576055506
        },
        "4": {
            "name": "பு",
            "zodiac": "மீனம்",
            "rasi_no": 12,
            "house": 4,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 1.2735892014015917
        },
        "5": {
            "name": "குரு",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 11,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 25.22947998490372
        },
        "6": {
            "name": "சுக்",
            "zodiac": "மீனம்",
            "rasi_no": 12,
            "house": 4,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 14.54113357101869
        },
        "7": {
            "name": "சனி",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 11,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 26.61438053302936
        },
        "8": {
            "name": "ரா",
            "zodiac": "மேஷம்",
            "rasi_no": 1,
            "house": 5,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 11.56347467266255
        },
        "9": {
            "name": "கே",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 11,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 11.563474672662778
        },
        "chart": "D12",
        "chart_name": "த்வாதசம்சா"
    },
    "d16Chart": {
        "0": {
            "name": "லக்",
            "zodiac": "கன்னி",
            "rasi_no": 6,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 29.537487965560103
        },
        "1": {
            "name": "சூ",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 2,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 3.169572435678674
        },
        "2": {
            "name": "சந்",
            "zodiac": "கன்னி",
            "rasi_no": 6,
            "house": 1,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 13.027595118315958
        },
        "3": {
            "name": "செ",
            "zodiac": "மேஷம்",
            "rasi_no": 1,
            "house": 8,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 24.00385410140734
        },
        "4": {
            "name": "பு",
            "zodiac": "மேஷம்",
            "rasi_no": 1,
            "house": 8,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 1.6981189352018191
        },
        "5": {
            "name": "குரு",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 9,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 3.639306646537989
        },
        "6": {
            "name": "சுக்",
            "zodiac": "கடகம்",
            "rasi_no": 4,
            "house": 11,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 9.388178094691284
        },
        "7": {
            "name": "சனி",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 2,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 15.485840710704906
        },
        "8": {
            "name": "ரா",
            "zodiac": "கடகம்",
            "rasi_no": 4,
            "house": 11,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 5.417966230216734
        },
        "9": {
            "name": "கே",
            "zodiac": "கடகம்",
            "rasi_no": 4,
            "house": 11,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 5.417966230216734
        },
        "chart": "D16",
        "chart_name": "ஷோடாஷாம்சா"
    },
    "d20Chart": {
        "0": {
            "name": "லக்",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 14.421859956950357
        },
        "1": {
            "name": "சூ",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 1,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 18.96196554459766
        },
        "2": {
            "name": "சந்",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 9,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 23.78449389789489
        },
        "3": {
            "name": "செ",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 1,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 0.004817626759177074
        },
        "4": {
            "name": "பு",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 9,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 2.122648669002956
        },
        "5": {
            "name": "குரு",
            "zodiac": "சிம்மம்",
            "rasi_no": 5,
            "house": 4,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 12.049133308172713
        },
        "6": {
            "name": "சுக்",
            "zodiac": "சிம்மம்",
            "rasi_no": 5,
            "house": 4,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 4.235222618364787
        },
        "7": {
            "name": "சனி",
            "zodiac": "கன்னி",
            "rasi_no": 6,
            "house": 5,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 4.35730088838136
        },
        "8": {
            "name": "ரா",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 9,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 29.27245778777069
        },
        "9": {
            "name": "கே",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 9,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 29.27245778777069
        },
        "chart": "D20",
        "chart_name": "விம்சாம்சா"
    },
    "d24Chart": {
        "0": {
            "name": "லக்",
            "zodiac": "மேஷம்",
            "rasi_no": 1,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 29.30623194834061
        },
        "1": {
            "name": "சூ",
            "zodiac": "மேஷம்",
            "rasi_no": 1,
            "house": 1,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 4.754358653517556
        },
        "2": {
            "name": "சந்",
            "zodiac": "கன்னி",
            "rasi_no": 6,
            "house": 6,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 4.541392677473937
        },
        "3": {
            "name": "செ",
            "zodiac": "சிம்மம்",
            "rasi_no": 5,
            "house": 5,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 6.0057811521110125
        },
        "4": {
            "name": "பு",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 11,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 2.5471784028031834
        },
        "5": {
            "name": "குரு",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 11,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 20.458959969807438
        },
        "6": {
            "name": "சுக்",
            "zodiac": "விருச்சிகம்",
            "rasi_no": 8,
            "house": 8,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 29.08226714203738
        },
        "7": {
            "name": "சனி",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 7,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 23.228761066058723
        },
        "8": {
            "name": "ரா",
            "zodiac": "தனுசு",
            "rasi_no": 9,
            "house": 9,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 23.1269493453251
        },
        "9": {
            "name": "கே",
            "zodiac": "தனுசு",
            "rasi_no": 9,
            "house": 9,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 23.126949345325556
        },
        "chart": "D24",
        "chart_name": "சதுர்விம்ஷம்ஷா"
    },
    "d24RChart": {
        "0": {
            "name": "லக்",
            "zodiac": "மேஷம்",
            "rasi_no": 1,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 29.30623194834061
        },
        "1": {
            "name": "சூ",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 7,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 4.754358653517556
        },
        "2": {
            "name": "சந்",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 2,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 4.541392677473937
        },
        "3": {
            "name": "செ",
            "zodiac": "மிதுனம்",
            "rasi_no": 3,
            "house": 3,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 6.0057811521110125
        },
        "4": {
            "name": "பு",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 11,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 2.5471784028031834
        },
        "5": {
            "name": "குரு",
            "zodiac": "தனுசு",
            "rasi_no": 9,
            "house": 9,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 20.458959969807438
        },
        "6": {
            "name": "சுக்",
            "zodiac": "மீனம்",
            "rasi_no": 12,
            "house": 12,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 29.08226714203738
        },
        "7": {
            "name": "சனி",
            "zodiac": "மேஷம்",
            "rasi_no": 1,
            "house": 1,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 23.228761066058723
        },
        "8": {
            "name": "ரா",
            "zodiac": "தனுசு",
            "rasi_no": 9,
            "house": 9,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 23.1269493453251
        },
        "9": {
            "name": "கே",
            "zodiac": "தனுசு",
            "rasi_no": 9,
            "house": 9,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 23.126949345325556
        },
        "chart": "D24-R",
        "chart_name": "டி 24-ஆர்"
    },
    "d27Chart": {
        "0": {
            "name": "லக்",
            "zodiac": "கடகம்",
            "rasi_no": 4,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 17.969510941882618
        },
        "1": {
            "name": "சூ",
            "zodiac": "மிதுனம்",
            "rasi_no": 3,
            "house": 12,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 24.09865348520725
        },
        "2": {
            "name": "சந்",
            "zodiac": "கன்னி",
            "rasi_no": 6,
            "house": 3,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 12.609066762158136
        },
        "3": {
            "name": "செ",
            "zodiac": "சிம்மம்",
            "rasi_no": 5,
            "house": 2,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 10.50650379612398
        },
        "4": {
            "name": "பு",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 8,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 25.36557570315199
        },
        "5": {
            "name": "குரு",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 11,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 4.266329966032572
        },
        "6": {
            "name": "சுக்",
            "zodiac": "தனுசு",
            "rasi_no": 9,
            "house": 6,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 17.71755053479137
        },
        "7": {
            "name": "சனி",
            "zodiac": "தனுசு",
            "rasi_no": 9,
            "house": 6,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 22.382356199314017
        },
        "8": {
            "name": "ரா",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 8,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 26.01781801349034
        },
        "9": {
            "name": "கே",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 8,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 26.017818013491706
        },
        "chart": "D27",
        "chart_name": "பம்ஷா"
    },
    "d30Chart": {
        "0": {
            "name": "லக்",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 6.632789935425535
        },
        "1": {
            "name": "சூ",
            "zodiac": "விருச்சிகம்",
            "rasi_no": 8,
            "house": 2,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 13.442948316897855
        },
        "2": {
            "name": "சந்",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 8,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 20.67674084684245
        },
        "3": {
            "name": "செ",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 8,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 15.007226440138766
        },
        "4": {
            "name": "பு",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 5,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 18.183973003503525
        },
        "5": {
            "name": "குரு",
            "zodiac": "விருச்சிகம்",
            "rasi_no": 8,
            "house": 2,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 18.073699962258615
        },
        "6": {
            "name": "சுக்",
            "zodiac": "கன்னி",
            "rasi_no": 6,
            "house": 12,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 6.352833927545362
        },
        "7": {
            "name": "சனி",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 4,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 21.53595133257113
        },
        "8": {
            "name": "ரா",
            "zodiac": "மிதுனம்",
            "rasi_no": 3,
            "house": 9,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 28.908686681656036
        },
        "9": {
            "name": "கே",
            "zodiac": "மிதுனம்",
            "rasi_no": 3,
            "house": 9,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 28.908686681656036
        },
        "chart": "D30",
        "chart_name": "திரிம்ஷாம்ஷா"
    },
    "d40Chart": {
        "0": {
            "name": "லக்",
            "zodiac": "மிதுனம்",
            "rasi_no": 3,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 28.843719913900713
        },
        "1": {
            "name": "சூ",
            "zodiac": "கடகம்",
            "rasi_no": 4,
            "house": 2,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 7.923931089195321
        },
        "2": {
            "name": "சந்",
            "zodiac": "விருச்சிகம்",
            "rasi_no": 8,
            "house": 6,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 17.56898779578978
        },
        "3": {
            "name": "செ",
            "zodiac": "மிதுனம்",
            "rasi_no": 3,
            "house": 1,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 0.009635253518354148
        },
        "4": {
            "name": "பு",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 5,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 4.245297338005912
        },
        "5": {
            "name": "குரு",
            "zodiac": "தனுசு",
            "rasi_no": 9,
            "house": 7,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 24.098266616345427
        },
        "6": {
            "name": "சுக்",
            "zodiac": "தனுசு",
            "rasi_no": 9,
            "house": 7,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 8.470445236729574
        },
        "7": {
            "name": "சனி",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 9,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 8.71460177676272
        },
        "8": {
            "name": "ரா",
            "zodiac": "விருச்சிகம்",
            "rasi_no": 8,
            "house": 6,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 28.54491557554138
        },
        "9": {
            "name": "கே",
            "zodiac": "விருச்சிகம்",
            "rasi_no": 8,
            "house": 6,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 28.54491557554138
        },
        "chart": "D40",
        "chart_name": "காவேதம்சா"
    },
    "d45Chart": {
        "0": {
            "name": "லக்",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 9.949184903136484
        },
        "1": {
            "name": "சூ",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 10,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 20.164422475345418
        },
        "2": {
            "name": "சந்",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 5,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 1.0151112702633327
        },
        "3": {
            "name": "செ",
            "zodiac": "மீனம்",
            "rasi_no": 12,
            "house": 3,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 7.510839660206329
        },
        "4": {
            "name": "பு",
            "zodiac": "மீனம்",
            "rasi_no": 12,
            "house": 3,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 12.275959505253923
        },
        "5": {
            "name": "குரு",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 1,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 27.110549943387014
        },
        "6": {
            "name": "சுக்",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 10,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 9.529250891318952
        },
        "7": {
            "name": "சனி",
            "zodiac": "தனுசு",
            "rasi_no": 9,
            "house": 12,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 17.303926998856696
        },
        "8": {
            "name": "ரா",
            "zodiac": "விருச்சிகம்",
            "rasi_no": 8,
            "house": 11,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 13.363030022484054
        },
        "9": {
            "name": "கே",
            "zodiac": "ரிஷபம்",
            "rasi_no": 2,
            "house": 5,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 13.363030022483144
        },
        "chart": "D45",
        "chart_name": "அக்ஷவேதம்சா"
    },
    "d60Chart": {
        "0": {
            "name": "லக்",
            "zodiac": "மிதுனம்",
            "rasi_no": 3,
            "house": 1,
            "retro": false,
            "full_name": "Ascendant",
            "local_degree": 13.26557987085107
        },
        "1": {
            "name": "சூ",
            "zodiac": "மீனம்",
            "rasi_no": 12,
            "house": 10,
            "retro": false,
            "full_name": "Sun",
            "local_degree": 26.88589663379571
        },
        "2": {
            "name": "சந்",
            "zodiac": "துலாம்",
            "rasi_no": 7,
            "house": 5,
            "retro": false,
            "full_name": "Moon",
            "local_degree": 11.353481693684898
        },
        "3": {
            "name": "செ",
            "zodiac": "மேஷம்",
            "rasi_no": 1,
            "house": 11,
            "retro": false,
            "full_name": "Mars",
            "local_degree": 0.014452880277531222
        },
        "4": {
            "name": "பு",
            "zodiac": "மீனம்",
            "rasi_no": 12,
            "house": 10,
            "retro": true,
            "full_name": "Mercury",
            "local_degree": 6.367946007007049
        },
        "5": {
            "name": "குரு",
            "zodiac": "கும்பம்",
            "rasi_no": 11,
            "house": 9,
            "retro": false,
            "full_name": "Jupiter",
            "local_degree": 6.147399924517231
        },
        "6": {
            "name": "சுக்",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 8,
            "retro": false,
            "full_name": "Venus",
            "local_degree": 12.705667855090724
        },
        "7": {
            "name": "சனி",
            "zodiac": "மிதுனம்",
            "rasi_no": 3,
            "house": 1,
            "retro": true,
            "full_name": "Saturn",
            "local_degree": 13.071902665142261
        },
        "8": {
            "name": "ரா",
            "zodiac": "மகரம்",
            "rasi_no": 10,
            "house": 8,
            "retro": true,
            "full_name": "Rahu",
            "local_degree": 27.817373363312072
        },
        "9": {
            "name": "கே",
            "zodiac": "கடகம்",
            "rasi_no": 4,
            "house": 2,
            "retro": true,
            "full_name": "Ketu",
            "local_degree": 27.817373363312072
        },
        "chart": "D60",
        "chart_name": "சாஸ்தியம்ஷா"
    },
    "ashtakvargaChart": {
        "ashtakvarga_order": [
            "சூரியன்",
            "சந்திரன்",
            "செவ்வாய்",
            "புதன்",
            "குரு",
            "சுக்கிரன்",
            "சனி",
            "லக்னம்"
        ],
        "ashtakvarga_points": [
            [
                4,
                4,
                4,
                5,
                3,
                5,
                4,
                6,
                4,
                3,
                4,
                2
            ],
            [
                5,
                5,
                3,
                6,
                3,
                4,
                5,
                5,
                3,
                3,
                3,
                4
            ],
            [
                4,
                1,
                3,
                3,
                3,
                2,
                5,
                5,
                4,
                3,
                3,
                3
            ],
            [
                5,
                3,
                3,
                3,
                5,
                6,
                5,
                6,
                5,
                3,
                5,
                5
            ],
            [
                3,
                5,
                4,
                5,
                6,
                4,
                5,
                6,
                3,
                5,
                6,
                4
            ],
            [
                4,
                7,
                5,
                2,
                4,
                6,
                6,
                4,
                4,
                3,
                3,
                4
            ],
            [
                1,
                6,
                4,
                4,
                3,
                2,
                3,
                6,
                5,
                1,
                2,
                2
            ],
            [
                5,
                4,
                3,
                4,
                4,
                4,
                5,
                3,
                3,
                6,
                4,
                5
            ]
        ],
        "ashtakvarga_total": [
            26,
            31,
            26,
            28,
            27,
            29,
            33,
            38,
            28,
            21,
            26,
            24
        ]
    }
}*/
	  
	  console.log('reportPayload', reportPayload)

      let html;
		try {
		  html = generateBookReportHTML(reportPayload, lang, user);
		} catch (err) {
		  console.error('reportLogic error:', err);
		  Alert.alert("Report Error", err.message);
		  return;
		}

	  console.log(html)

      if (Platform.OS === 'web') {
		  const printWindow = window.open('', '_blank');
		  if (!printWindow) {
			Alert.alert("Popup blocked", "Please allow popups for this site");
			setLoading(false);
			return;
		  }

		  const html = generateBookReportHTML(reportPayload, lang, user);

		  const wrappedHTML = `
			<!DOCTYPE html>
			<html>
			<head>
			  <meta charset="UTF-8"/>
			  <style>
				* { box-sizing: border-box; margin: 0; padding: 0; }

				#toolbar {
				  position: fixed;
				  top: 0; left: 0; right: 0;
				  z-index: 9999;
				  background: #1a1a2e;
				  display: flex;
				  align-items: center;
				  gap: 10px;
				  padding: 10px 16px;
				  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
				}

				#toolbar .tb-title {
				  color: #FFD700;
				  font-family: sans-serif;
				  font-size: 15px;
				  font-weight: 700;
				  flex: 1;
				}

				#toolbar button {
				  border: none;
				  border-radius: 8px;
				  padding: 8px 18px;
				  font-size: 14px;
				  font-weight: 700;
				  cursor: pointer;
				  font-family: sans-serif;
				}

				.btn-print { background: #FFD700; color: #1a1a2e; }
				.btn-share { background: #4CAF50; color: #fff; }
				.btn-close { background: #444; color: #fff; }

				#content {
				  margin-top: 56px; /* push content below fixed toolbar */
				}

				@media print {
				  #toolbar { display: none !important; }
				  #content { margin-top: 0 !important; }
				}
			  </style>
			</head>
			<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
			<script>
			  async function shareReport() {
				const element = document.getElementById('content');

				const opt = {
				  margin: 0,
				  filename: 'panchangam.pdf',
				  image: { type: 'jpeg', quality: 0.98 },
				  html2canvas: { scale: 2 },
				  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
				};

				const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
				const file = new File([pdfBlob], 'panchangam.pdf', { type: 'application/pdf' });

				if (navigator.canShare && navigator.canShare({ files: [file] })) {
				  try {
					await navigator.share({
					  files: [file],
					  title: 'பஞ்சாங்கம்',
					  text: 'இன்றைய பஞ்சாங்கம்'
					});
				  } catch (e) {
					// user cancelled
				  }
				} else {
				  // Fallback: trigger download
				  const link = document.createElement('a');
				  link.href = URL.createObjectURL(pdfBlob);
				  link.download = 'panchangam.pdf';
				  link.click();
				}
			  }
			</script>
			<body>
			    <div id="toolbar">
				  <span class="tb-title">📅 பஞ்சாங்கம்</span>
				  <button class="btn-print" onclick="window.print()">🖨️ Print / PDF</button>
				  <button class="btn-share" onclick="shareReport()">📤 Share</button>
				  <button class="btn-close" onclick="window.close()">✕ Close</button>
				</div>

			  <div id="content">
				${html}
			  </div>
			</body>
			</html>
		  `;

		  printWindow.document.open();
		  printWindow.document.write(wrappedHTML);
		  printWindow.document.close();
		} else {
		  const { uri } = await Print.printToFileAsync({ html });
		  const isAvailable = await Sharing.isAvailableAsync();
		  if (isAvailable) {
			await Sharing.shareAsync(uri, {
			  mimeType: 'application/pdf',
			  dialogTitle: 'ஜாதகம் பகிர்வு',   // or 'Share Horoscope' for English
			  UTI: 'com.adobe.pdf',             // iOS only, ignored on Android
			});
		  } else {
			Alert.alert("பகிர முடியவில்லை", "இந்த சாதனத்தில் பகிர்வு இயங்கவில்லை.");
		  }
		}

      return reportPayload;
    } catch (error) {
      console.error(error);
      Alert.alert("பிழை", error.message || "தரவுகளைப் பெறுவதில் சிக்கல்.");
    }
  };

  return { generateAndPrint };
};
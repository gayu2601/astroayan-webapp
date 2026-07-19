import { useState, useEffect, useCallback } from 'react';

const ASTRO_BASE = 'https://api.vedicastroapi.com/v3-json/matching';

const astroGet = async (endpoint, params) => {
	console.log(params)
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${ASTRO_BASE}/${endpoint}?${query}`, {
    method: 'GET',
  });
  if (!res.ok) throw new Error(`${endpoint} failed: ${res.status}`);
  return res.json();
};

export const useTobPorutham = (input) => {
  const [poruthResponse,    setPoruthResponse]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchPoruthamData = useCallback(async () => {
    if (!input) return;
	console.log('input', input)
    setLoading(true);
    setError(null);
    try {
      const poruthamResp = await astroGet('ashtakoot-with-astro-details', input);
      console.log(poruthamResp);
	  
	  /*let poruthamResp = {
    "status": 200,
    "response": {
        "tara": {
            "boy_tara": "வாத்",
            "girl_tara": "சாதக்",
            "tara": 1.5,
            "description": "ஆறுதல் - செழிப்பு - ஆரோக்கியம்",
            "name": "தரா",
            "full_score": 3
        },
        "gana": {
            "boy_gana": "மானிடர்",
            "girl_gana": "மானிடர்",
            "gana": 6,
            "description": "குணம்",
            "name": "கணம்",
            "full_score": 6
        },
        "yoni": {
            "boy_yoni": "நாய்",
            "girl_yoni": "எலி",
            "yoni": 1,
            "description": "காதல்",
            "name": "யோனி",
            "full_score": 4
        },
        "bhakoot": {
            "boy_rasi": 3,
            "girl_rasi": 5,
            "boy_rasi_name": "மிதுனம்",
            "girl_rasi_name": "சிம்மம்",
            "bhakoot": 7,
            "description": "ஆக்கபூர்வமான திறன் / கட்டமைத்தல் / சமூகம் மற்றும் ஜோடி",
            "name": "ராசி",
            "full_score": 7
        },
        "grahamaitri": {
            "boy_lord": "புதன்",
            "girl_lord": "சூரியன்",
            "grahamaitri": 4,
            "description": "நட்பு",
            "name": "ராசி அதிபதி",
            "full_score": 5
        },
        "vasya": {
            "boy_vasya": "மாணவ",
            "girl_vasya": "வஞ்சார",
            "vasya": 0,
            "description": "ஒருவருக்கொருவர் உள்ளார்ந்த கொடுக்கல் / ஈர்ப்பு",
            "name": "வச்யம்",
            "full_score": 2
        },
        "nadi": {
            "boy_nadi": "ஆதி",
            "girl_nadi": "மத்ய",
            "nadi": 8,
            "description": "சந்ததி ",
            "name": "நாடி",
            "full_score": 8
        },
        "varna": {
            "boy_varna": "சூத்ரா",
            "girl_varna": "க்ஷத்ரியர்",
            "varna": 0,
            "description": "வேலை",
            "name": "வர்ணம்",
            "full_score": 1
        },
        "score": 27.5,
        "bot_response": "அஷ்டகூட் ஜாதக பொருத்தத்தில் 27.5/36 மதிப்பெண் ஆகும், இது நல்ல பொருத்தம்",
        "boy_planetary_details": {
            "0": {
                "name": "லக்",
                "full_name": "லக்னம்",
                "local_degree": 12.394063121416053,
                "global_degree": 162.39406312141605,
                "progress_in_percentage": 41.31354373805351,
                "rasi_no": 6,
                "zodiac": "கன்னி",
                "house": 1,
                "nakshatra": "ஹஸ்தம்",
                "nakshatra_lord": "சந்திரன்",
                "nakshatra_pada": 1,
                "nakshatra_no": 13,
                "zodiac_lord": "புதன்",
                "is_planet_set": false,
                "lord_status": "-",
                "basic_avastha": "-",
                "is_combust": false,
                "tithi_no": "3"
            },
            "1": {
                "name": "சூ",
                "full_name": "சூரியன்",
                "local_degree": 12.9607886018062,
                "global_degree": 282.9607886018062,
                "progress_in_percentage": 43.20262867268733,
                "rasi_no": 10,
                "zodiac": "மகரம்",
                "house": 5,
                "speed_radians_per_day": 1.1760545267489761e-8,
                "retro": false,
                "mean_values": {
                    "ra": 306.8227581876529,
                    "apogee": 91.82510621352914,
                    "trueLongitude": 126.82078483945595,
                    "meanLongitude": 126.05425863623122,
                    "apogeeDistance": 1.0167114475066248
                },
                "nakshatra": "திருவோணம்",
                "nakshatra_lord": "சந்திரன்",
                "nakshatra_pada": 1,
                "nakshatra_no": 22,
                "zodiac_lord": "சனி",
                "is_planet_set": true,
                "basic_avastha": "Yuva",
                "lord_status": "Neutral"
            },
            "2": {
                "name": "சந்",
                "full_name": "சந்திரன்",
                "local_degree": 16.11490497983735,
                "global_degree": 136.11490497983735,
                "progress_in_percentage": 53.71634993279116,
                "rasi_no": 5,
                "zodiac": "சிம்மம்",
                "house": 12,
                "speed_radians_per_day": 1.365419238683127e-7,
                "retro": false,
                "nakshatra": "பூரம்",
                "nakshatra_lord": "சுக்கிரன்",
                "nakshatra_pada": 1,
                "nakshatra_no": 11,
                "zodiac_lord": "சூரியன்",
                "is_planet_set": false,
                "basic_avastha": "Yuva",
                "lord_status": "Malefic",
                "is_combust": false
            },
            "3": {
                "name": "செ",
                "full_name": "செவ்வாய்",
                "local_degree": 11.467037921201467,
                "global_degree": 161.46703792120147,
                "progress_in_percentage": 38.223459737338224,
                "rasi_no": 6,
                "zodiac": "கன்னி",
                "house": 1,
                "speed_radians_per_day": 1.404963991769695e-9,
                "retro": false,
                "mean_values": {
                    "ra": 185.28791978759338,
                    "apogee": 25.614981747773413,
                    "trueLongitude": 155.03855718422454,
                    "meanLongitude": 154.83986779849334,
                    "apogeeDistance": 1.6659881575037772
                },
                "nakshatra": "ஹஸ்தம்",
                "nakshatra_lord": "சந்திரன்",
                "nakshatra_pada": 1,
                "nakshatra_no": 13,
                "zodiac_lord": "புதன்",
                "is_planet_set": false,
                "basic_avastha": "Kumara",
                "lord_status": "Highly Malefic",
                "is_combust": false
            },
            "4": {
                "name": "பு",
                "full_name": "புதன்",
                "local_degree": 18.56843832087128,
                "global_degree": 258.5684383208713,
                "progress_in_percentage": 61.89479440290426,
                "rasi_no": 9,
                "zodiac": "தனுசு",
                "house": 4,
                "speed_radians_per_day": 1.2818287037037222e-8,
                "retro": false,
                "mean_values": {
                    "ra": 282.43233829587473,
                    "apogee": 125.78708452845802,
                    "trueLongitude": 212.76487343821728,
                    "meanLongitude": 194.24406079144768,
                    "apogeeDistance": 0.46669804025654765
                },
                "nakshatra": "பூராடம்",
                "nakshatra_lord": "சுக்கிரன்",
                "nakshatra_pada": 2,
                "nakshatra_no": 20,
                "zodiac_lord": "குரு",
                "is_planet_set": true,
                "basic_avastha": "Vriddha",
                "lord_status": "Benefic",
                "is_combust": false
            },
            "5": {
                "name": "குரு",
                "full_name": "குரு",
                "local_degree": 7.376877142238698,
                "global_degree": 277.3768771422387,
                "progress_in_percentage": 24.589590474128993,
                "rasi_no": 10,
                "zodiac": "மகரம்",
                "house": 5,
                "speed_radians_per_day": 2.7199074074075653e-9,
                "retro": false,
                "mean_values": {
                    "ra": 301.2833681313908,
                    "apogee": 115.2932633887875,
                    "trueLongitude": 300.22628646177463,
                    "meanLongitude": 305.5177003003291,
                    "apogeeDistance": 5.455168566112922
                },
                "nakshatra": "உத்திராடம்",
                "nakshatra_lord": "சூரியன்",
                "nakshatra_pada": 4,
                "nakshatra_no": 21,
                "zodiac_lord": "சனி",
                "is_planet_set": true,
                "basic_avastha": "Kumara",
                "lord_status": "Maraka",
                "is_combust": true
            },
            "6": {
                "name": "சுக்",
                "full_name": "சுக்கிரன்",
                "local_degree": 26.807374882098657,
                "global_degree": 266.80737488209866,
                "progress_in_percentage": 89.35791627366218,
                "rasi_no": 9,
                "zodiac": "தனுசு",
                "house": 4,
                "speed_radians_per_day": 1.4493312757201404e-8,
                "retro": false,
                "mean_values": {
                    "ra": 290.6661614800635,
                    "apogee": 208.22266591835668,
                    "trueLongitude": 268.5429790870206,
                    "meanLongitude": 268.0116479154351,
                    "apogeeDistance": 0.7282323029782674
                },
                "nakshatra": "உத்திராடம்",
                "nakshatra_lord": "சூரியன்",
                "nakshatra_pada": 1,
                "nakshatra_no": 21,
                "zodiac_lord": "குரு",
                "is_planet_set": true,
                "basic_avastha": "Mritya",
                "lord_status": "Yogakaraka",
                "is_combust": false
            },
            "7": {
                "name": "சனி",
                "full_name": "சனி",
                "local_degree": 9.304819165539016,
                "global_degree": 339.304819165539,
                "progress_in_percentage": 31.016063885130052,
                "rasi_no": 12,
                "zodiac": "மீனம்",
                "house": 7,
                "speed_radians_per_day": 1.0063014403292211e-9,
                "retro": false,
                "mean_values": {
                    "ra": 2.9797449522846478,
                    "apogee": 206.17578103033182,
                    "trueLongitude": 7.98691424659511,
                    "meanLongitude": 14.137255613322935,
                    "apogeeDistance": 10.053704190759102
                },
                "nakshatra": "உத்திரட்டாதி",
                "nakshatra_lord": "சனி",
                "nakshatra_pada": 2,
                "nakshatra_no": 26,
                "zodiac_lord": "குரு",
                "is_planet_set": true,
                "basic_avastha": "Kumara",
                "lord_status": "Neutral",
                "is_combust": false
            },
            "8": {
                "name": "ரா",
                "full_name": "ராகு",
                "local_degree": 7.8990434877979965,
                "global_degree": 157.899043487798,
                "progress_in_percentage": 26.330144959326656,
                "rasi_no": 6,
                "zodiac": "கன்னி",
                "house": 1,
                "retro": true,
                "nakshatra": "உத்திரம்",
                "nakshatra_lord": "சூரியன்",
                "nakshatra_pada": 4,
                "nakshatra_no": 12,
                "zodiac_lord": "புதன்",
                "is_planet_set": false,
                "basic_avastha": "Kumara",
                "lord_status": "Benefic",
                "is_combust": false
            },
            "9": {
                "name": "கே",
                "full_name": "கேது",
                "local_degree": 7.8990434877979965,
                "global_degree": 337.899043487798,
                "progress_in_percentage": 26.330144959326656,
                "rasi_no": 12,
                "zodiac": "மீனம்",
                "house": 7,
                "retro": true,
                "nakshatra": "உத்திரட்டாதி",
                "nakshatra_lord": "சனி",
                "nakshatra_pada": 2,
                "nakshatra_no": 26,
                "zodiac_lord": "குரு",
                "is_planet_set": true,
                "basic_avastha": "Kumara",
                "lord_status": "Maraka",
                "is_combust": false
            }
        },
        "girl_planetary_details": {
            "0": {
                "name": "லக்",
                "full_name": "லக்னம்",
                "local_degree": 12.394063121416053,
                "global_degree": 162.39406312141605,
                "progress_in_percentage": 41.31354373805351,
                "rasi_no": 6,
                "zodiac": "கன்னி",
                "house": 1,
                "nakshatra": "ஹஸ்தம்",
                "nakshatra_lord": "சந்திரன்",
                "nakshatra_pada": 1,
                "nakshatra_no": 13,
                "zodiac_lord": "புதன்",
                "is_planet_set": false,
                "lord_status": "-",
                "basic_avastha": "-",
                "is_combust": false,
                "tithi_no": "3"
            },
            "1": {
                "name": "சூ",
                "full_name": "சூரியன்",
                "local_degree": 12.9607886018062,
                "global_degree": 282.9607886018062,
                "progress_in_percentage": 43.20262867268733,
                "rasi_no": 10,
                "zodiac": "மகரம்",
                "house": 5,
                "speed_radians_per_day": 1.1760545267489761e-8,
                "retro": false,
                "mean_values": {
                    "ra": 306.8227581876529,
                    "apogee": 91.82510621352914,
                    "trueLongitude": 126.82078483945595,
                    "meanLongitude": 126.05425863623122,
                    "apogeeDistance": 1.0167114475066248
                },
                "nakshatra": "திருவோணம்",
                "nakshatra_lord": "சந்திரன்",
                "nakshatra_pada": 1,
                "nakshatra_no": 22,
                "zodiac_lord": "சனி",
                "is_planet_set": true,
                "basic_avastha": "Yuva",
                "lord_status": "Neutral"
            },
            "2": {
                "name": "சந்",
                "full_name": "சந்திரன்",
                "local_degree": 16.11490497983735,
                "global_degree": 136.11490497983735,
                "progress_in_percentage": 53.71634993279116,
                "rasi_no": 5,
                "zodiac": "சிம்மம்",
                "house": 12,
                "speed_radians_per_day": 1.365419238683127e-7,
                "retro": false,
                "nakshatra": "பூரம்",
                "nakshatra_lord": "சுக்கிரன்",
                "nakshatra_pada": 1,
                "nakshatra_no": 11,
                "zodiac_lord": "சூரியன்",
                "is_planet_set": false,
                "basic_avastha": "Yuva",
                "lord_status": "Malefic",
                "is_combust": false
            },
            "3": {
                "name": "செ",
                "full_name": "செவ்வாய்",
                "local_degree": 11.467037921201467,
                "global_degree": 161.46703792120147,
                "progress_in_percentage": 38.223459737338224,
                "rasi_no": 6,
                "zodiac": "கன்னி",
                "house": 1,
                "speed_radians_per_day": 1.404963991769695e-9,
                "retro": false,
                "mean_values": {
                    "ra": 185.28791978759338,
                    "apogee": 25.614981747773413,
                    "trueLongitude": 155.03855718422454,
                    "meanLongitude": 154.83986779849334,
                    "apogeeDistance": 1.6659881575037772
                },
                "nakshatra": "ஹஸ்தம்",
                "nakshatra_lord": "சந்திரன்",
                "nakshatra_pada": 1,
                "nakshatra_no": 13,
                "zodiac_lord": "புதன்",
                "is_planet_set": false,
                "basic_avastha": "Kumara",
                "lord_status": "Highly Malefic",
                "is_combust": false
            },
            "4": {
                "name": "பு",
                "full_name": "புதன்",
                "local_degree": 18.56843832087128,
                "global_degree": 258.5684383208713,
                "progress_in_percentage": 61.89479440290426,
                "rasi_no": 9,
                "zodiac": "தனுசு",
                "house": 4,
                "speed_radians_per_day": 1.2818287037037222e-8,
                "retro": false,
                "mean_values": {
                    "ra": 282.43233829587473,
                    "apogee": 125.78708452845802,
                    "trueLongitude": 212.76487343821728,
                    "meanLongitude": 194.24406079144768,
                    "apogeeDistance": 0.46669804025654765
                },
                "nakshatra": "பூராடம்",
                "nakshatra_lord": "சுக்கிரன்",
                "nakshatra_pada": 2,
                "nakshatra_no": 20,
                "zodiac_lord": "குரு",
                "is_planet_set": true,
                "basic_avastha": "Vriddha",
                "lord_status": "Benefic",
                "is_combust": false
            },
            "5": {
                "name": "குரு",
                "full_name": "குரு",
                "local_degree": 7.376877142238698,
                "global_degree": 277.3768771422387,
                "progress_in_percentage": 24.589590474128993,
                "rasi_no": 10,
                "zodiac": "மகரம்",
                "house": 5,
                "speed_radians_per_day": 2.7199074074075653e-9,
                "retro": false,
                "mean_values": {
                    "ra": 301.2833681313908,
                    "apogee": 115.2932633887875,
                    "trueLongitude": 300.22628646177463,
                    "meanLongitude": 305.5177003003291,
                    "apogeeDistance": 5.455168566112922
                },
                "nakshatra": "உத்திராடம்",
                "nakshatra_lord": "சூரியன்",
                "nakshatra_pada": 4,
                "nakshatra_no": 21,
                "zodiac_lord": "சனி",
                "is_planet_set": true,
                "basic_avastha": "Kumara",
                "lord_status": "Maraka",
                "is_combust": true
            },
            "6": {
                "name": "சுக்",
                "full_name": "சுக்கிரன்",
                "local_degree": 26.807374882098657,
                "global_degree": 266.80737488209866,
                "progress_in_percentage": 89.35791627366218,
                "rasi_no": 9,
                "zodiac": "தனுசு",
                "house": 4,
                "speed_radians_per_day": 1.4493312757201404e-8,
                "retro": false,
                "mean_values": {
                    "ra": 290.6661614800635,
                    "apogee": 208.22266591835668,
                    "trueLongitude": 268.5429790870206,
                    "meanLongitude": 268.0116479154351,
                    "apogeeDistance": 0.7282323029782674
                },
                "nakshatra": "உத்திராடம்",
                "nakshatra_lord": "சூரியன்",
                "nakshatra_pada": 1,
                "nakshatra_no": 21,
                "zodiac_lord": "குரு",
                "is_planet_set": true,
                "basic_avastha": "Mritya",
                "lord_status": "Yogakaraka",
                "is_combust": false
            },
            "7": {
                "name": "சனி",
                "full_name": "சனி",
                "local_degree": 9.304819165539016,
                "global_degree": 339.304819165539,
                "progress_in_percentage": 31.016063885130052,
                "rasi_no": 12,
                "zodiac": "மீனம்",
                "house": 7,
                "speed_radians_per_day": 1.0063014403292211e-9,
                "retro": false,
                "mean_values": {
                    "ra": 2.9797449522846478,
                    "apogee": 206.17578103033182,
                    "trueLongitude": 7.98691424659511,
                    "meanLongitude": 14.137255613322935,
                    "apogeeDistance": 10.053704190759102
                },
                "nakshatra": "உத்திரட்டாதி",
                "nakshatra_lord": "சனி",
                "nakshatra_pada": 2,
                "nakshatra_no": 26,
                "zodiac_lord": "குரு",
                "is_planet_set": true,
                "basic_avastha": "Kumara",
                "lord_status": "Neutral",
                "is_combust": false
            },
            "8": {
                "name": "ரா",
                "full_name": "ராகு",
                "local_degree": 7.8990434877979965,
                "global_degree": 157.899043487798,
                "progress_in_percentage": 26.330144959326656,
                "rasi_no": 6,
                "zodiac": "கன்னி",
                "house": 1,
                "retro": true,
                "nakshatra": "உத்திரம்",
                "nakshatra_lord": "சூரியன்",
                "nakshatra_pada": 4,
                "nakshatra_no": 12,
                "zodiac_lord": "புதன்",
                "is_planet_set": false,
                "basic_avastha": "Kumara",
                "lord_status": "Benefic",
                "is_combust": false
            },
            "9": {
                "name": "கே",
                "full_name": "கேது",
                "local_degree": 7.8990434877979965,
                "global_degree": 337.899043487798,
                "progress_in_percentage": 26.330144959326656,
                "rasi_no": 12,
                "zodiac": "மீனம்",
                "house": 7,
                "retro": true,
                "nakshatra": "உத்திரட்டாதி",
                "nakshatra_lord": "சனி",
                "nakshatra_pada": 2,
                "nakshatra_no": 26,
                "zodiac_lord": "குரு",
                "is_planet_set": true,
                "basic_avastha": "Kumara",
                "lord_status": "Maraka",
                "is_combust": false
            }
        },
        "boy_astro_details": {
            "gana": "மானிடர்",
            "yoni": "நாய்",
            "vasya": "மாணவ",
            "nadi": "ஆதி",
            "varna": "சூத்ரா",
            "paya": "வெள்ளி",
            "tatva": "காற்று",
            "birth_dasa": "ராகு>சனி>குரு",
            "current_dasa": "சனி>பு>செ",
            "birth_dasa_time": "05/03/1987",
            "current_dasa_time": " 16/05/2026",
            "lucky_gem": [
                "கோமேதகம்"
            ],
            "lucky_num": [
                4
            ],
            "lucky_colors": [
                "பச்சை"
            ],
            "lucky_letters": [
                "K",
                "G",
                "N",
                "C"
            ],
            "lucky_name_start": [
                "கு",
                "காம்",
                "ஜா",
                "சா"
            ],
            "rasi": "மிதுனம்",
            "nakshatra": "திருவாதிரை",
            "nakshatra_pada": 2,
            "ascendant_sign": "துலாம்"
        },
        "girl_astro_details": {
            "gana": "மானிடர்",
            "yoni": "எலி",
            "vasya": "வஞ்சார",
            "nadi": "மத்ய",
            "varna": "க்ஷத்ரியர்",
            "paya": "இரும்பு",
            "tatva": "தீ",
            "birth_dasa": "சுக்கிரன்>சூ>சுக்",
            "current_dasa": "சந்>கே>செ",
            "birth_dasa_time": "02/01/1993",
            "current_dasa_time": " 16/05/2026",
            "lucky_gem": [
                "வைரம்"
            ],
            "lucky_num": [
                9
            ],
            "lucky_colors": [
                "வெளிர் பழுப்பு"
            ],
            "lucky_letters": [
                "M",
                "T"
            ],
            "lucky_name_start": [
                "மோ",
                "டா",
                "டீ",
                "டூ"
            ],
            "rasi": "சிம்மம்",
            "nakshatra": "பூரம்",
            "nakshatra_pada": 1,
            "ascendant_sign": "கன்னி"
        }
    },
    "remaining_api_calls": 479
}*/
      setPoruthResponse(poruthamResp)
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [input]);

  useEffect(() => {
    fetchPoruthamData();
  }, [fetchPoruthamData]);

  return { porutham: poruthResponse?.response, loading, error, refetch: fetchPoruthamData };
};
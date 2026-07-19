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

export const useNakshatraPorutham = (input) => {
  const [poruthResponse,    setPoruthResponse]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchPoruthamData = useCallback(async () => {
    if (!input) return;
    setLoading(true);
    setError(null);
    try {
      const poruthamResp = await astroGet('nakshatra-match', input);
      console.log(poruthamResp);
      /*let poruthamResp = {
    "status": 200,
    "response": {
    "dina": {
        "boy_star": "பரணி",
        "girl_star": "அஸ்வினி",
        "dina": 1,
        "description": "நல்ல ஆரோக்கியம் மற்றும் செழிப்பு",
        "name": "தினம்",
        "full_score": 1
    },
    "gana": {
        "boy_gana": "மானிடர்",
        "girl_gana": "தேவர்",
        "gana": 0.5,
        "description": "குணம்",
        "name": "கணம்",
        "full_score": 1
    },
    "mahendra": {
        "boy_star": "பரணி",
        "girl_star": "அஸ்வினி",
        "mahendra": 0,
        "description": "சந்ததி",
        "name": "மஹேந்திரம்",
        "full_score": 1
    },
    "sthree": {
        "boy_star": "பரணி",
        "girl_star": "அஸ்வினி",
        "sthree": 0,
        "description": "செல்வக் குவிப்பு",
        "name": "ஸ்த்ரீ தீர்க்கம்",
        "full_score": 1
    },
    "yoni": {
        "boy_yoni": "யானை",
        "girl_yoni": "குதிரை",
        "yoni": 1,
        "description": "காதல்",
        "name": "யோனி",
        "full_score": 1
    },
    "rasi": {
        "boy_rasi": "மேஷம்",
        "girl_rasi": "மேஷம்",
        "rasi": 1,
        "description": "சந்ததியின் தொடர்ச்சி",
        "name": "ராசி",
        "full_score": 1
    },
    "rasiathi": {
        "boy_lord": "செவ்வாய்",
        "girl_lord": "செவ்வாய்",
        "rasiathi": 1,
        "description": "நட்பு",
        "name": "ராசி அதிபதி",
        "full_score": 1
    },
    "vasya": {
        "boy_rasi": "மேஷம்",
        "girl_rasi": "மேஷம்",
        "vasya": 0,
        "description": "ஒருவருக்கொருவர் உள்ளார்ந்த கொடுக்கல் / ஈர்ப்பு",
        "name": "வச்யம்",
        "full_score": 1
    },
    "rajju": {
        "boy_rajju": "தொடை",
        "girl_rajju": "பாதம்",
        "rajju": 1,
        "description": "கணவரின் நீண்ட ஆயுள்",
        "name": "ராஜ்ஜு",
        "full_score": 1
    },
    "vedha": {
        "boy_star": "பரணி",
        "girl_star": "அஸ்வினி",
        "vedha": 1,
        "description": "ஆபத்துகளைத் தவிர்ப்பது",
        "name": "வேதா",
        "full_score": 1
    },
    "score": 6.5,
    "bot_response": "தமிழ் ஜாதக பொருத்தத்தில் 6.5/10 மதிப்பெண் ஆகும், இது நல்ல பொருத்தம்"
},
    "remaining_api_calls": 483
};*/
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
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  Sun, Moon, Star, Calendar, Clock, Heart, Sparkles, BookOpen, 
  Compass, Info, User, ChevronRight, Share2, Printer, LogIn, LogOut,
  Sliders, Award, FileText, CheckCircle, AlertCircle, Plus, Trash, Globe, MapPin, HelpCircle,
  Check, ArrowRight, ArrowLeft, UserCheck, ShieldAlert, ShoppingBag, Video, Crown, Landmark, Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabase'
// ── Custom Shared Modules ───────────────────────────────────────────────────
import { CustomKattamGrid } from './components/CustomKattamGrid';
import { CosmicBackground } from './components/CosmicBackground';
import AgeCalculator from './components/AgeCalculator';
import { WalletModal } from './components/WalletModal';
import { RemedyShop } from './components/RemedyShop';
import { ConsultExpert } from './components/ConsultExpert';
import ManaiyadiShastram from './components/ManaiyadiShastram';
import AdminDashboardScreen from './components/AdminDashboardScreen';
import RetailerDashboardScreen from './components/RetailerDashboardScreen';
import LizardOmens from './components/LizardOmens';
import StarMarriage from './components/StarMarriage';
import DailyRasiPalan from './components/DailyRasiPalan';
import DailyNakshatraPalan from './components/DailyNakshatraPalan';
import WeeklyRasiPalan from './components/WeeklyRasiPalan';
import HoraSection from './components/HoraSection';
import GocharamTransit from './components/GocharamTransit';
import toast from '../lib/toast'

// ── Newly Modularized Web TypeScript Components ─────────────────────────────
import Panchangam from './components/Panchangam';
import Porutham from './components/Porutham';
import HoroscopeInputForm from './components/HoroscopeInputForm';
import HoroscopeOutputScreen from './components/HoroscopeOutputScreen';
import BiodataGenerator from './components/BiodataGenerator';
import { useHoroscopeData } from '../hooks/useHoroscope';
import { useAuth } from '../lib/AuthContext';
import SignupScreen from './components/SignupScreen';

// ── Premium PDF & Interactive Viewers ────────────────────────────────────────
import PageHoroscopePdf from './components/PageHoroscopePdf';
import BookHoroscopePdf from './components/BookHoroscopePdf';
import ViewBookHoroscope from './components/ViewBookHoroscope';
import MarriagePoruthamPdf from './components/MarriagePoruthamPdf';
import PanchangamPdf from './components/PanchangamPdf';

// ── Translation Database ───────────────────────────────────────────────────
import { translations } from '../i18n/translations';

// ── Offline Traditional Tamil Data ───────────────────────────────────────────
import { NAKSHATRA_PALAN } from '../data/nakshatra-palan';
import { VAARA_PALAN } from '../data/vaara-palan';

// ── Base Constants ───────────────────────────────────────────────────────────
const SIGN_NAMES_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
const SIGN_NAMES_TA = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி',
  'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்',
];

const NAKSHATRAS_EN = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Visakha', 'Anuradha', 'Jyeshtha',
  'Moola', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

const NAKSHATRAS_TA = [
  'அஸ்வினி', 'பரணி', 'கார்த்திகை', 'ரோகிணி', 'மிருகசீரிடம்', 'திருவாதிரை',
  'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்', 'பூரம்', 'உத்திரம்',
  'அஸ்தம்', 'சித்திரை', 'சுவாதி', 'விசாகம்', 'அனுஷம்', 'கேட்டை',
  'மூலம்', 'பூராடம்', 'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்',
  'பூரட்டாதி', 'உத்திரட்டாதி', 'ரேவதி'
];

const PLANETS_EN = ['Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const PLANETS_TA = ['லக்னம்', 'சூரியன்', 'சந்திரன்', 'செவ்வாய்', 'புதன்', 'குரு', 'சுக்கிரன்', 'சனி', 'ராகு', 'கேது'];

// ── Offline Moon Sidereal Longitude (mirrors netlify/functions/panchang.js) ─
// Low-precision lunar approximation — good enough for "today's star" display
// without needing a live API call.
const getMoonSiderealLongitude = (date: Date): number => {
  const epochTime  = date.getTime();
  const julianDate = (epochTime / 86400000) + 2440587.5;
  const d          = julianDate - 2451545.0;

  const L = 218.316 + 13.176396 * d;
  const M = 134.963 + 13.064993 * d;

  const tropicalLong = L + 6.289 * Math.sin((M * Math.PI) / 180);
  const ayanamsa      = 23.85 + ((date.getFullYear() - 1950) * 0.01397);

  let siderealLong = (tropicalLong - ayanamsa) % 360;
  if (siderealLong < 0) siderealLong += 360;
  return siderealLong;
};

// ── Today's Nakshatra (own offline logic, no API call) ───────────────────────
const getTodayNakshatra = (langCode: 'ta' | 'en', date: Date = new Date()): string => {
  const siderealLong  = getMoonSiderealLongitude(date);
  const nakshatraSpan = 360 / 27;
  const idx           = Math.floor(siderealLong / nakshatraSpan) % 27;
  const names         = langCode === 'ta' ? NAKSHATRAS_TA : NAKSHATRAS_EN;
  return names[idx];
};

// ── Chandrashtama Maps (ported from netlify/functions/panchang.js) ──────────
const CHANDRASHTAMA_MAPS: Record<'ta' | 'en', Record<number, string>> = {
  ta: {
    0:  "உத்திரம் (2,3,4 பாதம்), அஸ்தம், சித்திரை (1,2 பாதம்) [கன்னி ராசி]",
    1:  "சித்திரை (3,4 பாதம்), சுவாதி, விசாகம் (1,2,3 பாதம்) [துலாம் ராசி]",
    2:  "விசாகம் (4ம் பாதம்), அனுஷம், கேட்டை [விருச்சிக ராசி]",
    3:  "மூலம், பூராடம், உத்திராடம் (1ம் பாதம்) [தனுசு ராசி]",
    4:  "உத்திராடம் (2,3,4 பாதம்), திருவோணம், அவிட்டம் (1,2 பாதம்) [மகர ராசி]",
    5:  "அவிட்டம் (3,4 பாதம்), சதயம், பூரட்டாதி (1,2,3 பாதம்) [கும்ப ராசி]",
    6:  "பூரட்டாதி (4ம் பாதம்), உத்திரட்டாதி, ரேவதி [மீன ராசி]",
    7:  "அஸ்வினி, பரணி, கார்த்திகை (1ம் பாதம்) [மேஷ ராசி]",
    8:  "கார்த்திகை (2,3,4 பாதம்), ரோகிணி, மிருகசீரிடம் (1,2 பாதம்) [ரிஷப ராசி]",
    9:  "மிருகசீரிடம் (3,4 பாதம்), திருவாதிரை, புனர்பூசம் (1,2,3 பாதம்) [மிதுன ராசி]",
    10: "புனர்பூசம் (4ம் பாதம்), பூசம், ஆயில்யம் [கடக ராசி]",
    11: "மகம், பூரம், உத்திரம் (1ம் பாதம்) [சிம்ம ராசி]"
  },
  en: {
    0:  "Uttara Phalguni (2,3,4), Hasta, Chitra (1,2) [Virgo Born]",
    1:  "Chitra (3,4), Swati, Vishakha (1,2,3) [Libra Born]",
    2:  "Vishakha (4), Anuradha, Jyeshta [Scorpio Born]",
    3:  "Mula, Purva Ashadha, Uttara Ashadha (1) [Sagittarius Born]",
    4:  "Uttara Ashadha (2,3,4), Shravana, Dhanishta (1,2) [Capricorn Born]",
    5:  "Dhanishta (3,4), Shatabhisha, Purva Bhadrapada (1,2,3) [Aquarius Born]",
    6:  "Purva Bhadrapada (4), Uttara Bhadrapada, Revati [Pisces Born]",
    7:  "Ashwini, Bharani, Krittika (1st Padam) [Aries Born]",
    8:  "Krittika (2,3,4), Rohini, Mrigashasra (1,2) [Taurus Born]",
    9:  "Mrigashasra (3,4), Ardra, Punarvasu (1,2,3) [Gemini Born]",
    10: "Punarvasu (4), Pushya, Ashlesha [Cancer Born]",
    11: "Magha, Purva Phalguni, Uttara Phalguni (1) [Leo Born]"
  }
};

// ── Today's Chandrashtamam (own offline logic, mirrors panchang.js exactly) ─
const getTodayChandrashtamam = (langCode: 'ta' | 'en', date: Date = new Date()): string => {
  try {
    const siderealLong   = getMoonSiderealLongitude(date);
    const currentRasiIdx = Math.floor(siderealLong / 30) % 12;
    const currentMap     = CHANDRASHTAMA_MAPS[langCode] || CHANDRASHTAMA_MAPS['en'];
    return currentMap[currentRasiIdx] ||
      (langCode === 'ta' ? "கணக்கிட முடியவில்லை" : "Calculation Error");
  } catch (error) {
    console.error("Offline chandrashtama calculation error:", error);
    return langCode === 'ta' ? "கணிப்பதில் பிழை" : "Calculation Error";
  }
};

// ── Marriage Porutham Calculation Helper ────────────────────────────────────
const calculateMarriagePorutham = (boyStarName: string, girlStarName: string, isTa: boolean) => {
  const getStarIdx = (name: string): number => {
    let idx = NAKSHATRAS_TA.indexOf(name);
    if (idx === -1) idx = NAKSHATRAS_EN.indexOf(name);
    return idx === -1 ? 0 : idx;
  };

  const boyIdx = getStarIdx(boyStarName);
  const girlIdx = getStarIdx(girlStarName);

  const GANA_MAP = [0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1, 1, 0];
  const RASI_MAP = [0, 0, 0, 1, 1, 1, 2, 3, 3, 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 10, 11, 11];
  const RAJJU_MAP = [0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0];

  const dist = (boyIdx - girlIdx + 27) % 27 + 1;

  const dinaDists = [2, 4, 6, 8, 9, 11, 13, 15, 17, 18, 20, 22, 24, 26, 27];
  const isDinaMatch = dinaDists.includes(dist);
  const dinaScore = isDinaMatch ? 1 : 0;

  const boyGana = GANA_MAP[boyIdx];
  const girlGana = GANA_MAP[girlIdx];
  let ganaScore = 0;
  if (boyGana === girlGana) {
    ganaScore = 1;
  } else if (boyGana === 0 && girlGana === 1) {
    ganaScore = 1;
  } else if (boyGana === 1 && girlGana === 0) {
    ganaScore = 0.75;
  } else if (boyGana === 2 && girlGana === 1) {
    ganaScore = 0.5;
  }

  const mahendraDists = [4, 7, 10, 13, 16, 19, 22, 25];
  const isMahendraMatch = mahendraDists.includes(dist);
  const mahendraScore = isMahendraMatch ? 1 : 0;

  let streeScore = 0;
  if (dist > 13) streeScore = 1;
  else if (dist > 9) streeScore = 0.5;

  const yoniAnimalMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 0];
  const boyYoni = yoniAnimalMap[boyIdx];
  const girlYoni = yoniAnimalMap[girlIdx];
  let yoniScore = 0.5;
  if (boyYoni === girlYoni) {
    yoniScore = 1;
  } else {
    const enemies = [[3, 12], [5, 6], [1, 13], [0, 8], [4, 10], [7, 9], [11, 2]];
    const isEnemy = enemies.some(pair => (pair[0] === boyYoni && pair[1] === girlYoni) || (pair[0] === girlYoni && pair[1] === boyYoni));
    if (isEnemy) yoniScore = 0;
  }

  const boyRasi = RASI_MAP[boyIdx];
  const girlRasi = RASI_MAP[girlIdx];
  const rasiDist = (boyRasi - girlRasi + 12) % 12 + 1;
  const isRasiMatch = [1, 7, 9, 10, 11, 12].includes(rasiDist);
  const rasiScore = isRasiMatch ? 1 : 0;

  const lordGroup = [0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0];
  const boyLordGroup = lordGroup[boyRasi];
  const girlLordGroup = lordGroup[girlRasi];
  let lordScore = 0.5;
  if (boyRasi === girlRasi || boyLordGroup === girlLordGroup) {
    lordScore = 1;
  } else {
    const enemies = [[4, 9], [4, 10], [0, 2], [0, 5]];
    const isEnemy = enemies.some(pair => (pair[0] === boyRasi && pair[1] === girlRasi) || (pair[0] === girlRasi && pair[1] === boyRasi));
    if (isEnemy) lordScore = 0;
  }

  const vasyaMap: Record<number, number[]> = {
    0: [4, 7], 1: [3, 6], 2: [5], 3: [7, 8], 4: [6], 5: [11, 1],
    6: [9], 7: [3], 8: [11], 9: [10], 10: [0], 11: [5]
  };
  const isVasyaMatch = (vasyaMap[girlRasi]?.includes(boyRasi)) || (vasyaMap[boyRasi]?.includes(girlRasi));
  const vasyaScore = isVasyaMatch ? 1 : 0;

  const boyRajju = RAJJU_MAP[boyIdx];
  const girlRajju = RAJJU_MAP[girlIdx];
  const isRajjuMatch = boyRajju !== girlRajju;
  const rajjuScore = isRajjuMatch ? 1 : 0;

  const vedhaPairs = [
    [0, 17], [1, 16], [2, 15], [3, 14], [5, 21], [6, 20],
    [7, 19], [8, 18], [9, 26], [10, 25], [11, 24], [12, 23], [13, 22]
  ];
  const isVedhaEnemy = vedhaPairs.some(pair => (pair[0] === boyIdx && pair[1] === girlIdx) || (pair[0] === girlIdx && pair[1] === boyIdx));
  const vedhaScore = isVedhaEnemy ? 0 : 1;

  const matches = [
    {
      name: isTa ? "தினப் பொருத்தம் (Dina)" : "Dina Porutham",
      status: dinaScore === 1 ? (isTa ? "உத்தமம் (Excellent)" : "Excellent") : (isTa ? "பொருத்தம் இல்லை (No Match)" : "No Match"),
      score: dinaScore,
      description: isTa ? "தம்பதியரின் நீண்ட ஆயுள், நல் ஆரோக்கியம் மற்றும் தினசரி மகிழ்ச்சியை உறுதி செய்கிறது." : "Ensures longevity, robust health, and daily joy in relationship."
    },
    {
      name: isTa ? "கணப் பொருத்தம் (Gana)" : "Gana Porutham",
      status: ganaScore === 1 ? (isTa ? "உத்தமம் (Excellent)" : "Excellent") : ganaScore > 0 ? (isTa ? "மத்திமம் (Medium)" : "Medium") : (isTa ? "பொருத்தம் இல்லை (No Match)" : "No Match"),
      score: ganaScore,
      description: isTa ? "தம்பதியரின் குண நலன்கள் மற்றும் மனப்போக்கைப் பொருத்துகிறது." : "Matches psychological temperaments and spiritual character frequency."
    },
    {
      name: isTa ? "மகேந்திரப் பொருத்தம் (Mahendra)" : "Mahendra Porutham",
      status: mahendraScore === 1 ? (isTa ? "உத்தமம் (Excellent)" : "Excellent") : (isTa ? "பொருத்தம் இல்லை (No Match)" : "No Match"),
      score: mahendraScore,
      description: isTa ? "வம்ச வளர்ச்சி மற்றும் புத்திரப் பேற்றை அருள்கிறது." : "Blesses the couple with worthy progeny, longevity, and heritage continuation."
    },
    {
      name: isTa ? "ஸ்திரீதீர்க்கப் பொருத்தம் (StreeDeerkha)" : "StreeDeerkha Porutham",
      status: streeScore === 1 ? (isTa ? "உத்தமம் (Excellent)" : "Excellent") : streeScore > 0 ? (isTa ? "மத்திமம் (Medium)" : "Medium") : (isTa ? "பொருத்தம் இல்லை (No Match)" : "No Match"),
      score: streeScore,
      description: isTa ? "பெண் துணையின் மாங்கல்ய பலம் மற்றும் செல்வத்தை வளர்க்கிறது." : "Secures prosperity, marital wellness, and long life span for the female partner."
    },
    {
      name: isTa ? "யோனிப் பொருத்தம் (Yoni)" : "Yoni Porutham",
      status: yoniScore === 1 ? (isTa ? "உத்தமம் (Excellent)" : "Excellent") : yoniScore > 0 ? (isTa ? "மத்திமம் (Medium)" : "Medium") : (isTa ? "பொருத்தம் இல்லை (No Match)" : "No Match"),
      score: yoniScore,
      description: isTa ? "தம்பதியரிடையே உடலியல் ஈர்ப்பு மற்றும் தாம்பத்திய இணக்கத்தைக் குறிக்கிறது." : "Matches physical chemistry, health bonding, and biological constitution."
    },
    {
      name: isTa ? "ராசிப் பொருத்தம் (Rasi)" : "Rasi Porutham",
      status: rasiScore === 1 ? (isTa ? "உத்தமம் (Excellent)" : "Excellent") : (isTa ? "பொருத்தம் இல்லை (No Match)" : "No Match"),
      score: rasiScore,
      description: isTa ? "தம்பதியரின் மன இணக்கம் மற்றும் குடும்ப வளர்ச்சியைத் தரும்." : "Matches general life outlook, core aspirations, and mental wavelength alignment."
    },
    {
      name: isTa ? "ராசியதிபதி பொருத்தம் (RasiAdhipati)" : "RasiAdhipati Porutham",
      status: lordScore === 1 ? (isTa ? "உத்தமம் (Excellent)" : "Excellent") : lordScore > 0 ? (isTa ? "மத்திமம் (Medium)" : "Medium") : (isTa ? "பொருத்தம் இல்லை (No Match)" : "No Match"),
      score: lordScore,
      description: isTa ? "தம்பதியரிடையே பரஸ்பர நட்பு மற்றும் மரியாதையைத் தரும்." : "Governs financial security, social compatibility, and professional growth."
    },
    {
      name: isTa ? "வசியப் பொருத்தம் (Vasya)" : "Vasya Porutham",
      status: vasyaScore === 1 ? (isTa ? "உத்தமம் (Excellent)" : "Excellent") : (isTa ? "பொருத்தம் இல்லை (No Match)" : "No Match"),
      score: vasyaScore,
      description: isTa ? "தம்பதியரிடையே உள்ள ஈர்ப்பு மற்றும் மன ஒற்றுமையைக் குறிக்கும்." : "Nourishes magnetic romantic attraction and deep emotional love."
    },
    {
      name: isTa ? "ரஜ்ஜுப் பொருத்தம் (Rajju)" : "Rajju Porutham",
      status: rajjuScore === 1 ? (isTa ? "பொருத்தம் உண்டு (Satisfied)" : "Satisfied") : (isTa ? "தோஷம் (Rajju Dosha)" : "Rajju Dosha (Mismatched)"),
      score: rajjuScore,
      description: isTa ? "கணவரின் நீண்ட ஆயுளை உறுதி செய்கிறது (மிக முக்கிய பொருத்தம்)." : "The absolute most crucial checkpoint ensuring husband's longevity and health safety."
    },
    {
      name: isTa ? "வேதைப் பொருத்தம் (Vedha)" : "Vedha Porutham",
      status: vedhaScore === 1 ? (isTa ? "பொருத்தம் உண்டு (Satisfied)" : "Satisfied") : (isTa ? "வேதை தோஷம் (Vedha Dosha)" : "Vedha Dosha (Mismatched)"),
      score: vedhaScore,
      description: isTa ? "தம்பதியரைத் துன்பங்கள் மற்றும் வாதங்களில் இருந்து காக்கிறது." : "Protects the relationship from sudden calamities and communication friction."
    }
  ];

  const matchedCount = matches.filter(m => m.score > 0).length;
  const totalScore = matches.reduce((sum, m) => sum + m.score, 0);
  const percentage = Math.round((totalScore / 10) * 100);

  return {
    boy: boyStarName,
    girl: girlStarName,
    matches,
    matchedCount,
    totalScore,
    percentage,
    verdict: totalScore >= 7.5
      ? (isTa ? "திருமணம் செய்ய மிகவும் உத்தமம்! (Excellent Match)" : "Highly Recommended for Marriage! (Excellent Match)")
      : totalScore >= 5.5
        ? (isTa ? "திருமணம் செய்ய மத்திமம். (Average Match)" : "Moderately Recommended. (Average Match)")
        : (isTa ? "பொருத்தம் போதாது. (Low Match)" : "Not Recommended due to low compatibility. (Low Match)")
  };
};

// ── Login Screen (web equivalent of mobile LoginScreen.js) ──────────────────
function LoginScreen({ onLoginSuccess, language, theme }: {
  onLoginSuccess: (userData: any) => void;
  language: string;
  theme: 'light' | 'dark';
}) {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLight = theme === 'light';

  const handleLogin = async () => {
    setError('');
    if (!phone || !password) {
      setError(language === 'ta' ? 'அனைத்து புலங்களையும் நிரப்பவும்' : 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { supabase } = await import('../lib/supabase');
      const { data, error: sbError } = await supabase
        .from('profiles')
        .select(`
          *,
          customer_plans!customer_plans_customer_id_fkey (
            is_active,
			plan_name,
            duration_label,
            features,
            expires_at,
            status
          )
        `)
        .eq('phone', phone)
        .eq('password', password)
        .single();

      if (sbError || !data) {
        setError(language === 'ta' ? 'தொலைபேசி எண் அல்லது கடவுச்சொல் தவறானது' : 'Invalid phone or password');
        return;
      }

      onLoginSuccess(data);

      if (data.user_type === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user_type === 'retailer') {
        navigate('/retailer/dashboard');
      } else {
        navigate('/');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-all duration-300 ${isLight ? 'bg-[#FDFBF7]' : 'bg-[#0A0612]'}`}>
      <CosmicBackground theme={theme} />

      <div className="relative z-10 w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 border-amber-400 shadow-lg shadow-amber-500/20 ${isLight ? 'bg-violet-100' : 'bg-violet-950/60'}`}>
            <span className="text-4xl">☽</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-cinzel font-black tracking-widest text-amber-400">AstroAyan</h1>
            <p className={`mt-1 text-xs tracking-[0.25em] uppercase font-semibold ${isLight ? 'text-[#5C4F43]' : 'text-gray-400'}`}>
              Jothidam Portal
            </p>
          </div>
        </div>

        {/* Card */}
        <div className={`rounded-2xl p-7 border shadow-xl space-y-5 transition-all ${isLight ? 'bg-white/80 border-amber-500/20' : 'bg-white/5 border-white/10'}`}>
          <h2 className={`text-xl font-bold ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>
            {language === 'ta' ? 'உள்நுழை' : 'Sign In'}
          </h2>

          {error && (
            <p className="text-sm text-red-400 font-semibold text-center">{error}</p>
          )}

          <div className="space-y-4">
            <input
              type="tel"
              maxLength={10}
              placeholder={language === 'ta' ? 'தொலைபேசி எண்' : 'Phone Number'}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className={`w-full px-4 py-3.5 rounded-xl border text-sm outline-none transition-all focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 ${isLight ? 'bg-amber-50/60 border-amber-500/20 text-[#2C241E] placeholder:text-[#9C8F85]' : 'bg-white/5 border-white/10 text-white placeholder:text-gray-500'}`}
            />
            <input
              type="password"
              placeholder={language === 'ta' ? 'கடவுச்சொல்' : 'Password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className={`w-full px-4 py-3.5 rounded-xl border text-sm outline-none transition-all focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 ${isLight ? 'bg-amber-50/60 border-amber-500/20 text-[#2C241E] placeholder:text-[#9C8F85]' : 'bg-white/5 border-white/10 text-white placeholder:text-gray-500'}`}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 to-violet-400 hover:from-violet-500 hover:to-violet-300 active:scale-[0.98] transition-all shadow-md shadow-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? (language === 'ta' ? 'நுழைகிறது...' : 'Entering...')
              : (language === 'ta' ? 'உள்நுழை' : 'Enter the Cosmos')}
          </button>

          <button
            onClick={() => navigate('/signup')}
            className={`w-full text-center text-sm font-bold mt-1 transition-colors ${isLight ? 'text-violet-600 hover:text-violet-800' : 'text-violet-400 hover:text-violet-200'}`}
          >
            {language === 'ta' ? 'கணக்கு உருவாக்கு' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
// ── Help Modal ────────────────────────────────────────────────────────────────
function HelpModal({ visible, onClose, isLight, language }: {
  visible: boolean; onClose: () => void; isLight: boolean; language: string;
}) {
  const [showForm,   setShowForm]   = useState(false);
  const [phone,      setPhone]      = useState('');
  const [message,    setMessage]    = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => { setShowForm(false); setPhone(''); setMessage(''); onClose(); };

  const handleSend = async () => {
    if (!phone.trim() || !message.trim()) {
      toast.error('Please enter your phone number and a message.'); return;
    }
    setSubmitting(true);
    try {
        const { error } = await supabase.from('support_queries').insert({
          phone_no: phone.trim(),
          message:  message.trim(),
        });
        if (error) throw error;
      toast.success('Message sent! We will get back to you soon.');
      handleClose();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  const panelCls = isLight
    ? "bg-white border-amber-500/20 text-[#2C241E]"
    : "bg-[#12102a] border-white/10 text-gray-100";
  const inputCls = isLight
    ? "bg-amber-50/60 border-amber-500/20 text-[#2C241E] placeholder-[#9C8E84] focus:border-amber-500/60"
    : "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-amber-500/40";
  const labelCls = `text-[10px] font-bold tracking-[0.18em] uppercase mb-1.5 block ${isLight ? "text-[#9C8E84]" : "text-gray-400"}`;
  const cardCls  = isLight
    ? "flex items-center gap-3.5 bg-amber-50/60 border border-amber-500/20 rounded-xl p-4"
    : "flex items-center gap-3.5 bg-white/[0.03] border border-amber-500/20 rounded-xl p-4";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className={`relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border shadow-2xl p-6 space-y-5 ${panelCls}`}>
        <div className="w-10 h-1 bg-amber-500/30 rounded-full mx-auto sm:hidden mb-2" />
        <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 text-sm font-bold hover:bg-amber-500/20 transition-all">✕</button>

        <div>
          <h2 className="text-lg font-serif font-black text-amber-500">{language === 'ta' ? 'உதவி & ஆதரவு' : 'Help & Support'}</h2>
          <p className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 ${isLight ? "text-[#9C8E84]" : "text-gray-400"}`}>CONTACT US</p>
        </div>

        {/* Email card */}
        <a href="mailto:astroayancc@gmail.com" className={`${cardCls} hover:border-amber-500/40 transition-all no-underline`}>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
              <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>
          <div>
            <p className={labelCls}>EMAIL</p>
            <p className={`text-sm font-semibold ${isLight ? "text-[#2C241E]" : "text-white"}`}>astroayancc@gmail.com</p>
          </div>
        </a>

        {!showForm ? (
          <div className="space-y-3">
            <button onClick={() => setShowForm(true)}
              className="w-full py-2.5 rounded-xl text-sm font-bold tracking-wider border bg-amber-500/15 border-amber-500 text-amber-400 hover:bg-amber-500/25 transition-all">
              {language === 'ta' ? 'செய்தி அனுப்பு' : 'Send us a message'}
            </button>
            <button onClick={handleClose}
              className={`w-full py-2.5 rounded-xl text-sm font-bold tracking-wider border transition-all ${isLight ? "border-amber-500/30 text-amber-600 hover:bg-amber-50" : "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"}`}>
              {language === 'ta' ? 'மூடு' : 'Close'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className={`text-[10px] font-bold tracking-widest uppercase ${isLight ? "text-[#9C8E84]" : "text-gray-400"}`}>SEND A MESSAGE</p>

            <div>
              <label className={labelCls}>YOUR PHONE NUMBER</label>
              <input
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all ${inputCls}`}
                value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210" maxLength={10} inputMode="numeric"
              />
            </div>

            <div>
              <label className={labelCls}>MESSAGE</label>
              <textarea
                className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all resize-none ${inputCls}`}
                rows={4} value={message} onChange={e => setMessage(e.target.value)}
                placeholder={language === 'ta' ? 'உங்கள் செய்தியை உள்ளிடுங்கள்...' : 'Type your message...'}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wider border transition-all ${isLight ? "border-amber-500/30 text-amber-600 hover:bg-amber-50" : "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"}`}>
                {language === 'ta' ? 'பின்செல்' : 'Back'}
              </button>
              <button onClick={handleSend} disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold tracking-wider border bg-amber-500/15 border-amber-500 text-amber-400 hover:bg-amber-500/25 transition-all disabled:opacity-60">
                {submitting ? (language === 'ta' ? 'அனுப்புகிறது...' : 'Sending...') : (language === 'ta' ? 'அனுப்பு' : 'Send')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// ── Profile Settings Modal ────────────────────────────────────────────────────
function ProfileSettingsModal({ user, visible, onClose, onSave, isLight, language }: {
  user: any; visible: boolean; onClose: () => void; onSave: (updates: any) => void;
  isLight: boolean; language: string;
}) {
  const [name,    setName]    = useState(user?.name    || '');
  const [phone,   setPhone]   = useState(user?.phone   || '');
  const [address, setAddress] = useState(user?.location || '');
  const [notes,   setNotes]   = useState(user?.notes   || '');
  const [loading, setLoading] = useState(false);
  const [saved,   setSaved]   = useState(false);

  // Reset local state when user prop changes (e.g. after save)
  useEffect(() => {
    if (visible) {
      setName(user?.name || '');
      setPhone(user?.phone || '');
      setAddress(user?.location || '');
      setNotes(user?.notes || '');
    }
  }, [visible, user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      if (supabase) {
        const { error } = await supabase.from('profiles').update({
          name: name || user.name,
          phone: phone || user.phone,
          location: address || user.location,
          notes: notes || user.notes,
        }).eq('id', user.id);
        if (error) throw error;
      }
      onSave({ name, phone, location: address, notes });
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 800);
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  const panelCls = isLight
    ? "bg-white border-amber-500/20 text-[#2C241E]"
    : "bg-[#12102a] border-white/10 text-gray-100";
  const inputCls = isLight
    ? "bg-amber-50/60 border-amber-500/20 text-[#2C241E] placeholder-[#9C8E84] focus:border-amber-500/60"
    : "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-amber-500/40";
  const labelCls = `text-[10px] font-bold tracking-[0.18em] uppercase mb-1.5 block ${isLight ? "text-[#9C8E84]" : "text-gray-400"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      {/* Sheet */}
      <div className={`relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border shadow-2xl p-6 space-y-5 ${panelCls}`}>
        {/* Handle */}
        <div className="w-10 h-1 bg-amber-500/30 rounded-full mx-auto sm:hidden mb-2" />
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 text-sm font-bold hover:bg-amber-500/20 transition-all">✕</button>

        <div>
          <h2 className="text-lg font-serif font-black text-amber-500">{language === 'ta' ? 'என் சுயவிவரம்' : 'My Profile'}</h2>
          <p className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 ${isLight ? "text-[#9C8E84]" : "text-gray-400"}`}>PERSONAL DETAILS</p>
        </div>

        <div>
          <label className={labelCls}>FULL NAME</label>
          <input className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all ${inputCls}`}
            value={name} onChange={e => setName(e.target.value)}
            placeholder={language === 'ta' ? 'உங்கள் பெயர்' : 'Enter your name'} />
        </div>

        <div>
          <label className={labelCls}>PHONE NUMBER</label>
          <input className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all ${inputCls}`}
            value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="+91 98765 43210" />
        </div>

        <div>
          <label className={labelCls}>ADDRESS</label>
          <textarea className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all resize-none ${inputCls}`}
            rows={3} value={address} onChange={e => setAddress(e.target.value)}
            placeholder={language === 'ta' ? 'முகவரி' : 'Enter your address'} />
        </div>

        <div>
          <label className={labelCls}>NOTES</label>
          <textarea className={`w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all resize-none ${inputCls}`}
            rows={2} value={notes} onChange={e => setNotes(e.target.value)}
            placeholder={language === 'ta' ? 'குறிப்புகள்' : 'Any notes...'} />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-full py-2.5 rounded-xl text-sm font-bold tracking-wider border transition-all ${
            saved
              ? "bg-green-500/15 border-green-500 text-green-400"
              : "bg-amber-500/15 border-amber-500 text-amber-400 hover:bg-amber-500/25"
          } disabled:opacity-60`}
        >
          {loading ? (language === 'ta' ? 'சேமிக்கிறது...' : 'Saving...') : saved ? '✓ Saved' : (language === 'ta' ? 'சேமி' : 'Save Profile')}
        </button>
      </div>
    </div>
  );
}

// ── Password Field (defined outside modal to prevent remount on rerender) ─────
function PasswordField({ label, value, onChange, show, onToggle, placeholder, inputCls, labelCls }: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggle: () => void; placeholder: string;
  inputCls: string; labelCls: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className={`w-full px-3 py-2 pr-10 rounded-xl border text-sm outline-none transition-all ${inputCls}`}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <button type="button" onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 hover:text-amber-400 transition-colors text-xs">
          {show ? <span>🙈</span> : <span>👁</span>}
        </button>
      </div>
    </div>
  );
}

// ── Password Reset Modal ──────────────────────────────────────────────────────
function PasswordResetModal({ user, visible, onClose, isLight, language }: {
  user: any; visible: boolean; onClose: () => void; isLight: boolean; language: string;
}) {
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [showCur,    setShowCur]    = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [loading,    setLoading]    = useState(false);

  const reset = () => { setCurrentPw(''); setNewPw(''); setConfirmPw(''); setShowCur(false); setShowNew(false); setShowConf(false); };
  const handleClose = () => { reset(); onClose(); };

  // Password strength (mirrors Screen.js logic)
  const strength = newPw.length === 0 ? 0 : Math.min(Math.floor(newPw.length / 3), 4);
  const isStrong = newPw.length >= 12;
  const strengthLabel = newPw.length === 0 ? '' : newPw.length < 8 ? 'Too short' : newPw.length < 12 ? 'Good' : 'Strong';

  const handleSave = async () => {
    if (!newPw || !confirmPw) return toast.warning('Please fill in all fields.');
    if (newPw !== confirmPw) return toast.warning('Passwords do not match.');
    try {
      setLoading(true);
      const { error } = await supabase.from('profiles').update({ password: newPw }).eq('id', user.id);
      if (error) throw error;
      toast.success(language === 'ta' ? 'கடவுச்சொல் புதுப்பிக்கப்பட்டது!' : 'Password updated successfully!');
      reset(); onClose();
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  const panelCls = isLight
    ? "bg-white border-amber-500/20 text-[#2C241E]"
    : "bg-[#12102a] border-white/10 text-gray-100";
  const inputCls = isLight
    ? "bg-amber-50/60 border-amber-500/20 text-[#2C241E] placeholder-[#9C8E84] focus:border-amber-500/60"
    : "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-amber-500/40";
  const labelCls = `text-[10px] font-bold tracking-[0.18em] uppercase mb-1.5 block ${isLight ? "text-[#9C8E84]" : "text-gray-400"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className={`relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border shadow-2xl p-6 space-y-5 ${panelCls}`}>
        <div className="w-10 h-1 bg-amber-500/30 rounded-full mx-auto sm:hidden mb-2" />
        <button onClick={handleClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 text-sm font-bold hover:bg-amber-500/20 transition-all">✕</button>

        <div>
          <h2 className="text-lg font-serif font-black text-amber-500">{language === 'ta' ? 'பாதுகாப்பு' : 'Security'}</h2>
          <p className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 ${isLight ? "text-[#9C8E84]" : "text-gray-400"}`}>CHANGE PASSWORD</p>
        </div>

        <PasswordField label="CURRENT PASSWORD" value={currentPw} onChange={setCurrentPw}
          show={showCur} onToggle={() => setShowCur(v => !v)} placeholder="Enter current password"
          inputCls={inputCls} labelCls={labelCls} />

        <PasswordField label="NEW PASSWORD" value={newPw} onChange={setNewPw}
          show={showNew} onToggle={() => setShowNew(v => !v)} placeholder="Enter new password"
          inputCls={inputCls} labelCls={labelCls} />

        {/* Strength bar */}
        {newPw.length > 0 && (
          <div className="flex items-center gap-1.5 -mt-2">
            {[0,1,2,3].map(i => (
              <div key={i} className={`flex-1 h-0.5 rounded-full transition-all ${
                i < strength
                  ? isStrong ? "bg-green-500" : "bg-amber-500/70"
                  : isLight ? "bg-gray-200" : "bg-white/10"
              }`} />
            ))}
            <span className={`text-[10px] tracking-widest min-w-[54px] ${isLight ? "text-[#9C8E84]" : "text-gray-400"}`}>{strengthLabel}</span>
          </div>
        )}

        <PasswordField label="CONFIRM NEW PASSWORD" value={confirmPw} onChange={setConfirmPw}
          show={showConf} onToggle={() => setShowConf(v => !v)} placeholder="Repeat new password"
          inputCls={inputCls} labelCls={labelCls} />

        <button onClick={handleSave} disabled={loading}
          className="w-full py-2.5 rounded-xl text-sm font-bold tracking-wider border bg-amber-500/15 border-amber-500 text-amber-400 hover:bg-amber-500/25 transition-all disabled:opacity-60">
          {loading ? (language === 'ta' ? 'புதுப்பிக்கிறது...' : 'Updating...') : (language === 'ta' ? 'கடவுச்சொல் மாற்று' : 'Update Password')}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const { user, login, logout, language, setLanguage, updateUser } = useAuth() as any;
  
  const navigate = useNavigate();
  const location = useLocation();

  // Parse path to get activeTab and sub-parameters
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[1] || 'home';

  // Sub-tabs parsed from URL path parameters
  const predictionsSubTab = (activeTab === 'predictions' && pathParts[2]) ? pathParts[2] : 'rasi';
  // NEW: panchangam now has 4 sub-pills
  const panchangamSubTab = (activeTab === 'panchangam' && pathParts[2]) ? pathParts[2] : 'daily';
  // NEW: horoscope sub-tabs
  const horoscopeSubTab = (activeTab === 'horoscope' && pathParts[2]) ? pathParts[2] : 'birth';
  // NEW: marriage sub-tabs
  const marriageSubTab = (activeTab === 'marriage' && pathParts[2]) ? pathParts[2] : 'porutham';
  // Keep vedic-tools for other tools (palli, manaiyadi, age)
  const vedicToolSub = (activeTab === 'vedic-tools' && pathParts[2]) ? pathParts[2] : null;

  // Wallet and Order State (persisted offline)
  const [walletBalance, setWalletBalance] = useState<number>(250);
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);  // ← add this
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

  // Load state from LocalStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('astroTheme') as 'light' | 'dark';
    if (savedTheme) setTheme(savedTheme);

    const savedBalance = localStorage.getItem('astroWalletBalance');
    if (savedBalance) setWalletBalance(Number(savedBalance));

    const savedOrders = localStorage.getItem('astroOrders');
    if (savedOrders) setOrderHistory(JSON.parse(savedOrders));
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('astroTheme', next);
  };

  const toggleLanguage = (lang: 'ta' | 'en') => {
    setLanguage(lang);
  };

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('astroUser');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const handleTopUp = (amount: number) => {
    const next = walletBalance + amount;
    setWalletBalance(next);
    localStorage.setItem('astroWalletBalance', String(next));
  };

  const handlePurchase = (price: number, itemDetails: any) => {
    const nextBal = walletBalance - price;
    setWalletBalance(nextBal);
    localStorage.setItem('astroWalletBalance', String(nextBal));
    const nextOrders = [itemDetails, ...orderHistory];
    setOrderHistory(nextOrders);
    localStorage.setItem('astroOrders', JSON.stringify(nextOrders));
  };

  const handleBookExpert = (fee: number, bookingDetails: any) => {
    const nextBal = walletBalance - fee;
    setWalletBalance(nextBal);
    localStorage.setItem('astroWalletBalance', String(nextBal));
    const nextOrders = [bookingDetails, ...orderHistory];
    setOrderHistory(nextOrders);
    localStorage.setItem('astroOrders', JSON.stringify(nextOrders));
  };

  const t = (key: string) => {
    return translations[language]?.[key] ?? translations['ta']?.[key] ?? key;
  };

  const isLight = theme === 'light';

  // Today's nakshatra + chandrashtamam — computed offline, language-aware
  const todayNakshatra    = getTodayNakshatra(language);
  const todayChandrashtamam = getTodayChandrashtamam(language);

  const handleHoroBack = () => {
    setHoroData(null);
    setHoroDetails(null);
    navigate(-1);
  };

  const BackButton = () => (
    <button
      onClick={() => navigate(-1)}
      className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mb-4 ${
        isLight
          ? "bg-amber-50/80 border-amber-500/25 text-[#5C4F43] hover:text-[#2C241E] hover:border-amber-500/50 hover:bg-amber-100/50 shadow-sm"
          : "bg-black/30 border-white/10 text-gray-300 hover:text-white hover:border-amber-500/30 hover:bg-black/50 shadow-md"
      }`}
    >
      <ArrowLeft className="h-4 w-4 text-amber-500" />
      <span>{language === 'ta' ? 'பின்னால்' : 'Back'}</span>
    </button>
  );

  const getPlanetIcon = (planetKey: string) => {
    switch (planetKey) {
      case 'Sun': return <Sun className="h-5 w-5 text-amber-500 animate-spin-slow" />;
      case 'Venus': return <Sparkles className="h-5 w-5 text-rose-400 animate-twinkle" />;
      case 'Mercury': return <BookOpen className="h-5 w-5 text-sky-400" />;
      case 'Moon': return <Moon className="h-5 w-5 text-slate-300 animate-twinkle" />;
      case 'Saturn': return <ShieldAlert className="h-5 w-5 text-indigo-400" />;
      case 'Jupiter': return <Crown className="h-5 w-5 text-yellow-400 animate-twinkle" />;
      case 'Mars': return <Zap className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  const isSlotActive = (slotIndex: number) => {
    const selectedD = new Date(horaDate || new Date());
    const todayD = new Date();
    if (selectedD.toDateString() !== todayD.toDateString()) return false;
    const currentHour = todayD.getHours();
    const slotStartHour = 6 + slotIndex;
    return currentHour === slotStartHour;
  };

  const getSlotStyle = (planetKey: string, isLight: boolean, isCurrent: boolean) => {
    const styles: Record<string, { bg: string; border: string; lightBg: string; lightBorder: string; hoverBorder: string; lightHoverBorder: string }> = {
      Sun: { bg: "bg-gradient-to-br from-amber-500/5 via-[#231E18]/40 to-black/20", border: "border-amber-500/20", lightBg: "bg-gradient-to-br from-amber-50/80 via-amber-100/30 to-amber-200/20", lightBorder: "border-amber-500/25", hoverBorder: "hover:border-amber-500/40 hover:shadow-amber-500/5", lightHoverBorder: "hover:border-amber-500/50 hover:shadow-amber-500/5" },
      Venus: { bg: "bg-gradient-to-br from-rose-500/5 via-[#231A1F]/40 to-black/20", border: "border-rose-500/20", lightBg: "bg-gradient-to-br from-rose-50/80 via-rose-100/30 to-rose-200/20", lightBorder: "border-rose-500/25", hoverBorder: "hover:border-rose-500/40 hover:shadow-rose-500/5", lightHoverBorder: "hover:border-rose-500/50 hover:shadow-rose-500/5" },
      Mercury: { bg: "bg-gradient-to-br from-sky-500/5 via-[#1A2128]/40 to-black/20", border: "border-sky-500/20", lightBg: "bg-gradient-to-br from-sky-50/80 via-sky-100/30 to-sky-200/20", lightBorder: "border-sky-500/25", hoverBorder: "hover:border-sky-500/40 hover:shadow-sky-500/5", lightHoverBorder: "hover:border-sky-500/50 hover:shadow-sky-500/5" },
      Moon: { bg: "bg-gradient-to-br from-slate-400/5 via-[#202025]/40 to-black/20", border: "border-slate-500/20", lightBg: "bg-gradient-to-br from-slate-50/80 via-slate-100/30 to-slate-200/20", lightBorder: "border-slate-500/25", hoverBorder: "hover:border-slate-500/40 hover:shadow-slate-500/5", lightHoverBorder: "hover:border-slate-500/50 hover:shadow-slate-500/5" },
      Saturn: { bg: "bg-gradient-to-br from-indigo-500/5 via-[#1E1A2C]/40 to-black/20", border: "border-indigo-500/20", lightBg: "bg-gradient-to-br from-indigo-50/80 via-indigo-100/30 to-indigo-200/20", lightBorder: "border-indigo-500/25", hoverBorder: "hover:border-indigo-500/40 hover:shadow-indigo-500/5", lightHoverBorder: "hover:border-indigo-500/50 hover:shadow-indigo-500/5" },
      Jupiter: { bg: "bg-gradient-to-br from-yellow-500/5 via-[#24221A]/40 to-black/20", border: "border-yellow-500/20", lightBg: "bg-gradient-to-br from-yellow-50/80 via-yellow-100/30 to-yellow-200/20", lightBorder: "border-yellow-500/25", hoverBorder: "hover:border-yellow-500/40 hover:shadow-yellow-500/5", lightHoverBorder: "hover:border-yellow-500/50 hover:shadow-yellow-500/5" },
      Mars: { bg: "bg-gradient-to-br from-red-500/5 via-[#281A1A]/40 to-black/20", border: "border-red-500/20", lightBg: "bg-gradient-to-br from-red-50/80 via-red-100/30 to-red-200/20", lightBorder: "border-red-500/25", hoverBorder: "hover:border-red-500/40 hover:shadow-red-500/5", lightHoverBorder: "hover:border-red-500/50 hover:shadow-red-500/5" }
    };
    const currentStyle = styles[planetKey] || styles.Sun;
    if (isCurrent) {
      return isLight 
        ? `bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100/80 border-amber-500 shadow-[0_4px_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/40 scale-[1.02] duration-300`
        : `bg-amber-500/10 border-amber-500/50 shadow-[0_4px_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30 scale-[1.02] duration-300`;
    }
    return `${isLight ? currentStyle.lightBg : currentStyle.bg} ${isLight ? currentStyle.lightBorder : currentStyle.border} ${isLight ? currentStyle.lightHoverBorder : currentStyle.hoverBorder} shadow-sm`;
  };

  // ── State for all interactive modules ───────────────────────────────────
  const [panDate, setPanDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [panTime, setPanTime] = useState<string>("06:00");
  const [panPlace, setPanPlace] = useState<string>("Chennai");
  const [panResult, setPanResult] = useState<any>(null);
  const [panLoading, setPanLoading] = useState<boolean>(false);

  const [horoName, setHoroName] = useState<string>("Srinivasan");
  const [horoDob, setHoroDob] = useState<string>("1995-05-17");
  const [horoTob, setHoroTob] = useState<string>("05:45");
  const [horoPlace, setHoroPlace] = useState<string>("Chennai");
  const [horoResult, setHoroResult] = useState<any>(null);
  const [horoLoading, setHoroLoading] = useState<boolean>(false);

  const [boyStar, setBoyStar] = useState<string>("பரணி");
  const [girlStar, setGirlStar] = useState<string>("அஸ்வினி");
  const [poruthamResult, setPoruthamResult] = useState<any>(null);
  const [poruthamLoading, setPoruthamLoading] = useState<boolean>(false);

  const [selectedRasi, setSelectedRasi] = useState<number>(0);
  const [palanResult, setPalanResult] = useState<any>(null);
  const [palanLoading, setPalanLoading] = useState<boolean>(false);

  const [selectedStar, setSelectedStar] = useState<string>("அஸ்வினி");
  const [starPalanResult, setStarPalanResult] = useState<any>(null);

  const [selectedWeeklyRasi, setSelectedWeeklyRasi] = useState<number>(0);
  const [weeklyResult, setWeeklyResult] = useState<any>(null);
  const [weeklyLoading, setWeeklyLoading] = useState<boolean>(false);

  const [horaDate, setHoraDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [horaResult, setHoraResult] = useState<any>(null);
  const [horaLoading, setHoraLoading] = useState<boolean>(false);

  const [gocharResult, setGocharResult] = useState<any>(null);
  const [gocharLoading, setGocharLoading] = useState<boolean>(false);

  const [matchStarInput, setMatchStarInput] = useState<string>("அஸ்வினி");
  const [matchStarResult, setMatchStarResult] = useState<string[]>([]);

  const [manaiyadiLength, setManaiyadiLength] = useState<number>(10);
  const [manaiyadiWidth, setManaiyadiWidth] = useState<number>(12);
  const [manaiyadiResult, setManaiyadiResult] = useState<any>(null);

  const [palliGender, setPalliGender] = useState<'male' | 'female'>('male');
  const [palliPart, setPalliPart] = useState<string>("தலையில்");
  const [palliResult, setPalliResult] = useState<string>("");

  const [biodataForm, setBiodataForm] = useState<any>({
    name: "Srinivasan", gender: "male", dob: "1995-05-17", tob: "05:45", pob: "Chennai",
    star: "அஸ்வினி", rasi: "மேஷம்", lagna: "ரிஷபம்", religion: "Hindu",
    chevvaiDosham: "No", rahuKethu: "No", gothra: "Siva Gothram", height: "5'8\"",
    education: "B.E. Computer Science", occupation: "Software Engineer",
    fatherName: "Sundaram", motherName: "Lalitha", fatherOccupation: "Retired Officer",
    contactNumber: "+91 9876543210", siblings: "1 Brother, 1 Sister",
    expectations: "Educated, family-oriented family"
  });
  const [biodataPreview, setBiodataPreview] = useState<boolean>(false);
  const [biodataStep, setBiodataStep] = useState<number>(1);
  const [biodataAccent, setBiodataAccent] = useState<string>("crimson");

  const [horoData, setHoroData] = useState<any>(null);
  const [horoInputName, setHoroInputName] = useState<string>('');
  const [horoInputDate, setHoroInputDate] = useState<Date>(new Date());
  const { data: horoDetails, loading: horoDetailsLoading, error: horoDetailsError, fetch: fetchHoro, setData: setHoroDetails } = useHoroscopeData();
  
  const [poruthamFilter, setPoruthamFilter] = useState<'all' | 'satisfied' | 'unsatisfied'>('all');
  const [starMatchFilter, setStarMatchFilter] = useState<'all' | 'excellent' | 'good' | 'neutral'>('all');

  // ── API & Calculation Functions ──────────────────────────────────────────
  const runPanchang = async () => {
    setPanLoading(true);
    setPanResult(null);
    try {
      const d = new Date(panDate);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const tamilDays = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
      const jsWeekday = d.getDay();
      const dayName = days[jsWeekday];
      
      const nallaNeramMorning = { Sunday: "07:30 AM - 09:00 AM", Monday: "06:00 AM - 07:30 AM", Tuesday: "07:30 AM - 09:00 AM", Wednesday: "09:00 AM - 10:30 AM", Thursday: "09:00 AM - 10:30 AM", Friday: "06:00 AM - 07:30 AM", Saturday: "07:30 AM - 09:00 AM" }[dayName];
      const nallaNeramEvening = { Sunday: "04:30 PM - 06:00 PM", Monday: "04:30 PM - 06:00 PM", Tuesday: "04:30 PM - 06:00 PM", Wednesday: "04:30 PM - 06:00 PM", Thursday: "04:30 PM - 06:00 PM", Friday: "04:30 PM - 06:00 PM", Saturday: "04:30 PM - 06:00 PM" }[dayName];
      const raahuKalam = { Sunday: "04:30 PM - 06:00 PM", Monday: "07:30 AM - 09:00 AM", Tuesday: "03:00 PM - 04:30 PM", Wednesday: "12:00 PM - 01:30 PM", Thursday: "01:30 PM - 03:00 PM", Friday: "10:30 AM - 12:00 PM", Saturday: "09:00 AM - 10:30 AM" }[dayName];
      const gulikaKaal = { Sunday: "03:00 PM - 04:30 PM", Monday: "01:30 PM - 03:00 PM", Tuesday: "12:00 PM - 01:30 PM", Wednesday: "10:30 AM - 12:00 PM", Thursday: "09:00 AM - 10:30 AM", Friday: "07:30 AM - 09:00 AM", Saturday: "06:00 AM - 07:30 AM" }[dayName];
      const yamagandamTime = { Sunday: "12:00 PM - 01:30 PM", Monday: "10:30 AM - 12:00 PM", Tuesday: "09:00 AM - 10:30 AM", Wednesday: "07:30 AM - 09:00 AM", Thursday: "06:00 AM - 07:30 AM", Friday: "03:00 PM - 04:30 PM", Saturday: "01:30 PM - 03:00 PM" }[dayName];

      await new Promise(resolve => setTimeout(resolve, 500));

      setPanResult({
        date: panDate,
        day: language === 'ta' ? tamilDays[jsWeekday] : dayName,
        tithi: language === 'ta' ? "கிருஷ்ண திரயோதசி (பகல் 02:40 வரை)" : "Krishna Trayodashi (until 02:40 PM)",
        nakshatra: language === 'ta' ? "மிருகசீரிடம் (இரவு 09:15 வரை)" : "Mrigashirsha (until 09:15 PM)",
        yogam: language === 'ta' ? "விருத்தி யோகம் (மாலை 08:07 வரை)" : "Vriddhi Yogam (until 08:07 PM)",
        karanam: language === 'ta' ? "வனசை (பகல் 02:40 வரை)" : "Vanija (until 02:40 PM)",
        paksha: language === 'ta' ? "கிருஷ்ண பட்சம்" : "Krishna-Paksha",
        sunrise: "05:49:02 AM", sunset: "07:17:03 PM", moonrise: "03:06:05 AM", moonset: "05:27:17 PM",
        moonSign: language === 'ta' ? "ரிஷபம் (Taurus)" : "Taurus",
        sunSign: language === 'ta' ? "மிதுனம் (Gemini)" : "Gemini",
        ritu: language === 'ta' ? "கிரீஷ்ம (Grishm)" : "Grishm (Summer)",
        shakaSamvat: "1948", vikramSamvat: "2083",
        monthAmanta: language === 'ta' ? "ஜேஷ்டா (Jyeshtha)" : "Jyeshtha",
        monthPurnimanta: language === 'ta' ? "ஆஷாட (Ashadha)" : "Ashadha",
        abhijit: "11:45 AM - 12:35 PM", amritKaal: "02:10 PM - 03:40 PM",
        nallaNeram: { morning: nallaNeramMorning, evening: nallaNeramEvening },
        raahukalam: raahuKalam, yamagandam: yamagandamTime, gulikai: gulikaKaal,
        durmuhurtam: "04:15 PM - 05:05 PM",
        chandrashtamam: language === 'ta' ? "அஸ்தம், சித்திரை [கன்னி ராசி]" : "Hasta, Chitra [Virgo Born]"
      });
      confetti({ particleCount: 30, spread: 40 });
    } catch (e) {
      console.error(e);
    } finally {
      setPanLoading(false);
    }
  };

  const runHoroscope = async () => {
    setHoroLoading(true);
    setHoroResult(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const dobDate = new Date(horoDob);
      const hash = dobDate.getTime() % 12;
      const lagnaSign = (hash + 1) === 0 ? 1 : Math.abs(hash + 1);
      const generatedPlanets = [
        { rasi_no: lagnaSign, name: language === 'ta' ? 'லக்' : 'La' },
        { rasi_no: ((hash + 2) % 12) + 1, name: language === 'ta' ? 'சூரி' : 'Su' },
        { rasi_no: ((hash + 5) % 12) + 1, name: language === 'ta' ? 'சந்' : 'Mo' },
        { rasi_no: ((hash + 7) % 12) + 1, name: language === 'ta' ? 'செவ்' : 'Ma' },
        { rasi_no: ((hash + 3) % 12) + 1, name: language === 'ta' ? 'புத' : 'Me' },
        { rasi_no: ((hash + 9) % 12) + 1, name: language === 'ta' ? 'குரு' : 'Ju' },
        { rasi_no: ((hash + 11) % 12) + 1, name: language === 'ta' ? 'சுக்' : 'Ve' },
        { rasi_no: ((hash + 1) % 12) + 1, name: language === 'ta' ? 'சனி' : 'Sa' },
        { rasi_no: ((hash + 4) % 12) + 1, name: language === 'ta' ? 'ராகு' : 'Ra' },
        { rasi_no: (((hash + 4 + 6) % 12) + 1), name: language === 'ta' ? 'கேது' : 'Ke' },
      ];
      setHoroResult({
        name: horoName, dob: horoDob, tob: horoTob, place: horoPlace,
        lagnaSignNo: lagnaSign, planets: generatedPlanets,
        predictions: language === 'ta' ? [
          "வாழ்க்கையில் சிறந்த உழைப்பும், தெய்வ பக்தியும் கொண்டவர்.",
          "குடும்பத்தில் அமைதியும் மகிழ்ச்சியும் நிலைத்திருக்கும்.",
          "வியாபாரத் துறையில் நல்ல லாபமும் புகழும் பெறுவார்.",
          "ஆரோக்கியத்தில் கவனம் தேவை, குறிப்பாக உஷ்ண சம்பந்த நோய்கள்."
        ] : [
          "Hardworking individual with deep spiritual inclinations.",
          "Peace and harmony will prevail in family life.",
          "Success and recognition in business/professions.",
          "Needs to care for physical health, especially heat-related ailments."
        ]
      });
      confetti({ particleCount: 35, spread: 50 });
    } catch (e) {
      console.error(e);
    } finally {
      setHoroLoading(false);
    }
  };

  const runPorutham = async () => {
    setPoruthamLoading(true);
    setPoruthamResult(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      const res = calculateMarriagePorutham(boyStar, girlStar, language === 'ta');
      setPoruthamResult(res);
      if (res.totalScore >= 6) confetti({ particleCount: 50, spread: 70 });
    } catch (e) {
      console.error(e);
    } finally {
      setPoruthamLoading(false);
    }
  };

  const runRasiPalan = async () => {
    setPalanLoading(true);
    setPalanResult(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const rasiNameEn = SIGN_NAMES_EN[selectedRasi];
      const rasiNameTa = SIGN_NAMES_TA[selectedRasi];
      const rasiName = language === 'ta' ? rasiNameTa : rasiNameEn;
      const financeEn = ["Positive financial gains through previous business investments. A good time to clear long-standing debts.","Moderate income flows. Watch out for sudden impulse purchases or expenses related to household maintenance.","Strong financial period. Direct profits from brokerage, media, or freelance projects are indicated today.","Spend with caution. Avoid lending money to acquaintances today as recovery might face unexpected delays.","Splendid financial opportunities. A sudden luxury or long-term asset purchase will bring satisfaction.","Favorable day for realigning your budgets. Savings plans initiated today will secure solid returns in the future.","Lucrative partnerships bring solid cash flow. Perfect day to negotiate luxury item prices or real estate deals.","Unexpected monetary gains from old family inheritances or forgotten investments. Keep a check on travel expenses.","Highly favorable finances. Expansion of wealth through teaching, consulting, or spiritual coaching channels.","Slow but steady financial growth. Dedication and hard work in physical labor or trading bring honest yields.","Exceptional wealth accumulation opportunities through modern tech, online assets, or humanitarian network connections.","Divinely supported money inflows. Profits from creative writing, foreign transactions, or divine arts."];
      const financeTa = ["முந்தைய தொழில் முதலீடுகள் மூலம் சாதகமான நிதி ஆதாயங்கள் கிடைக்கும். நீண்ட கால கடன்களை அடைக்க நல்ல நேரம்.","மிதமான பண வரவு இருக்கும். வீட்டின் பழுதுபார்ப்பு அல்லது ஆடம்பரப் பொருட்களுக்காக வீண் செலவுகள் ஏற்படுவதைத் தவிர்க்கவும்.","வலுவான நிதி காலம். தரகு, ஊடகம் அல்லது பகுதி நேர திட்டங்கள் மூலம் இன்று நேரடி லாபம் கிடைக்க வாய்ப்புள்ளது.","எச்சரிக்கையுடன் செலவிடவும். இன்று நண்பர்கள் அல்லது தெரிந்தவர்களுக்கு கடன் கொடுப்பதைத் தவிர்க்கவும், திரும்பப் பெறுவதில் தாமதம் ஏற்படலாம்.","சிறந்த நிதி வாய்ப்புகள் அமையும். திடீர் பணவரவு அல்லது நீண்ட கால சொத்துக்கள் வாங்குவது மனநிறைவைத் தரும்.","உங்கள் பட்ஜெட்டை மறுசீரமைக்க சாதகமான நாள். இன்று தொடங்கும் சேமிப்புத் திட்டங்கள் எதிர்காலத்தில் நல்ல பலனைத் தரும்.","லாபகரமான கூட்டாண்மை மூலம் நல்ல பணப்புழக்கம் ஏற்படும். சொத்துக்கள் அல்லது வாகனங்கள் வாங்குவது பற்றி விவாதிக்க உகந்த நாள்.","குடும்ப சொத்துக்கள் அல்லது பழைய முதலீடுகள் மூலம் எதிர்பாராத பணவரவு உண்டு. பயணச் செலவுகளைக் கட்டுப்படுத்தவும்.","மிகவும் சாதகமான நிதி நிலைமை. ஆலோசனை, கற்பித்தல் அல்லது ஆன்மீக வழிகாட்டுதல் மூலம் வருமானம் பெருகும்.","மெதுவான ஆனால் நிலையான நிதி வளர்ச்சி. கடின உழைப்பு மற்றும் வணிக முயற்சிகள் நேர்மையான லாபத்தை தரும்.","நவீன தொழில்நுட்பம், ஆன்லைன் சொத்துக்கள் அல்லது சமூக அமைப்புகள் மூலம் அசாத்திய நிதி வாய்ப்புகள் கூடிவரும்.","தெய்வீக அருள் நிறைந்த தனவரவு உண்டு. எழுத்து, கலை, அல்லது வெளிநாட்டு வர்த்தகம் மூலம் எதிர்பார்த்த லாபம் கிடைக்கும்."];
      const generalPalanTa = ["இன்று மகிழ்ச்சிகரமான நாளாக இருக்கும். புதிய முயற்சிகள் வெற்றி தரும்.","வரவும் செலவும் சமமாக இருக்கும். குடும்பத்தில் அமைதி நிலவும்.","நண்பர்கள் மூலம் எதிர்பார்த்த உதவி கிடைக்கும். வியாபாரத்தில் மேன்மை.","மனதில் புதிய சிந்தனைகளும் திட்டங்களும் உருவாகும். சுப செய்தி வந்து சேரும்.","திட்டமிட்ட காரியங்கள் தடையின்றி நடக்கும். ஆரோக்கியம் சீராக இருக்கும்.","உத்தியோகத்தில் சக ஊழியர்களின் ஆதரவு கிடைக்கும். பண வரவு உண்டு."];
      const generalPalanEn = ["Today will be a joyful and highly rewarding day. Success in new endeavors.","Income and expenses will balance out. Peaceful domestic atmosphere.","Expected support from close friends will arrive. Prosperity in business.","Fresh ideas and grand plans will emerge. Good news is on the way.","Planned activities will proceed smoothly. Health remains robust.","Coworkers' cooperation will ease workplace stress. Financial gains."];
      const rasiPalanIndex = selectedRasi % generalPalanTa.length;
      setPalanResult({
        rasi: rasiName,
        palan: language === 'ta' ? generalPalanTa[rasiPalanIndex] : generalPalanEn[rasiPalanIndex],
        financialOutlook: language === 'ta' ? financeTa[selectedRasi] : financeEn[selectedRasi],
        luckyColor: language === 'ta' ? ["மஞ்சள்","வெள்ளை","சிவப்பு","பச்சை","நீலம்","ஆரஞ்சு","ஊதா","இளஞ்சிவப்பு","தங்கம்","வெள்ளி","கருநீலம்","மரகதம்"][selectedRasi % 12] : ["Yellow","White","Red","Green","Blue","Orange","Purple","Pink","Gold","Silver","Navy Blue","Emerald"][selectedRasi % 12],
        luckyNumbers: [9, 3, 5, 1, 7, 6, 8, 2, 4, 11, 22, 5][selectedRasi % 12],
        score: [90, 75, 80, 85, 95, 70, 88, 72, 84, 91, 76, 89][selectedRasi % 12]
      });
    } catch (e) {
      console.error(e);
    } finally {
      setPalanLoading(false);
    }
  };

  const runNakshatraPalan = () => {
    const idx = NAKSHATRAS_TA.indexOf(selectedStar);
    const resolvedIdx = idx >= 0 ? idx : 0;
    const starEn = NAKSHATRAS_EN[resolvedIdx];
    const ganas = ["Deva", "Manushya", "Rakshasa"];
    const ganasTa = ["தேவர்", "மனிதர்", "அரக்கர்"];
    const ganaIndex = [0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1, 1, 0][resolvedIdx];
    const rulers = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
    const rulersTa = ["கேது", "சுக்கிரன்", "சூரியன்", "சந்திரன்", "செவ்வாய்", "ராகு", "குரு", "சனி", "புதன்"];
    const rulerIndex = [0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 1, 2, 3, 4, 5, 6, 7, 8, 0, 1, 2, 3, 4, 5, 6, 7, 8][resolvedIdx];
    const favorabilities = [95, 80, 85, 90, 75, 70, 88, 92, 65, 80, 78, 85, 90, 82, 88, 70, 94, 60, 75, 82, 88, 95, 84, 76, 72, 86, 90];
    const found = NAKSHATRA_PALAN[selectedStar] || { rasi: "மேஷம் (Aries)", palan: "இன்று சிறப்பான நாளாக இருக்கும். புதிய முயற்சிகள் வெல்லும்.", vazhipaadu: "விநாயகர் வழிபாடு மேன்மை தரும்." };
    setStarPalanResult({
      star: selectedStar, starEn,
      rasi: found.rasi, palan: found.palan, vazhipaadu: found.vazhipaadu,
      rulingPlanet: language === 'ta' ? rulersTa[rulerIndex] : rulers[rulerIndex],
      devagana: language === 'ta' ? ganasTa[ganaIndex] : ganas[ganaIndex],
      favorability: favorabilities[resolvedIdx]
    });
  };

  const runWeeklyRasiPalan = async () => {
    setWeeklyLoading(true);
    setWeeklyResult(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      const rasiName = language === 'ta' ? SIGN_NAMES_TA[selectedWeeklyRasi] : SIGN_NAMES_EN[selectedWeeklyRasi];
      const found = VAARA_PALAN[selectedWeeklyRasi % 7] || { palan: "வாரத்தின் துவக்கம் சுறுசுறுப்பாக இருக்கும். நண்பர்கள் மூலம் நல்ல தகவல் வந்து சேரும்.", vazhipaadu: "முருகப் பெருமானை சஷ்டி அன்று வழிபட நலம் விளையும்." };
      const weeklyScores = [88, 79, 92, 84, 76, 91, 85, 70, 89, 95, 82, 90];
      setWeeklyResult({
        rasi: rasiName, palan: found.palan, vazhipaadu: found.vazhipaadu,
        score: weeklyScores[selectedWeeklyRasi % 12],
        luckyNumber: [3, 9, 5, 2, 8, 1, 6, 7, 4, 11, 22, 5][selectedWeeklyRasi % 12],
        luckyColor: language === 'ta' ? ["மஞ்சள்","வெள்ளை","சிவப்பு","பச்சை","நீலம்","ஆரஞ்சு","ஊதா","இளஞ்சிவப்பு","தங்கம்","வெள்ளி","கருநீலம்","மரகதம்"][selectedWeeklyRasi % 12] : ["Yellow","White","Red","Green","Blue","Orange","Purple","Pink","Gold","Silver","Navy Blue","Emerald"][selectedWeeklyRasi % 12]
      });
    } catch (e) {
      console.error(e);
    } finally {
      setWeeklyLoading(false);
    }
  };

  const runHora = async () => {
    setHoraLoading(true);
    setHoraResult(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const PLANET_CYCLE = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];
      const WEEKDAY_TO_HORA_START_INDEX = [0, 3, 6, 2, 5, 1, 4];
      const HORA_PLANETS_DATA: Record<string, any> = {
        Sun: { nameEn: "Sun (Surya)", nameTa: "சூரிய ஹோரை", natureEn: "Neutral", natureTa: "சமநிலை", activitiesEn: "Ideal for meeting authority figures, applying for jobs, government tasks.", activitiesTa: "அரசு அதிகாரிகள் சந்திப்பு, உத்தியோக விண்ணப்பம் மற்றும் நிர்வாக முடிவுகள் எடுக்க உகந்தது.", color: "amber-500" },
        Venus: { nameEn: "Venus (Shukra)", nameTa: "சுக்கிர ஹோரை", natureEn: "Auspicious", natureTa: "சுபம்", activitiesEn: "Highly auspicious for weddings, luxury goods, jewelry, and harmony.", activitiesTa: "சுப காரியங்கள், ஆபரணங்கள் வாங்குதல் மற்றும் கலைப் பயிற்சிக்கு உகந்தது.", color: "rose-400" },
        Mercury: { nameEn: "Mercury (Budha)", nameTa: "புதன் ஹோரை", natureEn: "Auspicious", natureTa: "சுபம்", activitiesEn: "Excellent for education, business deals, trade, and public speaking.", activitiesTa: "கல்வி கற்கத் துவங்க, வியாபார உடன்படிக்கைகள் மற்றும் புதிய பயணம் மேற்கொள்ள உகந்தது.", color: "sky-400" },
        Moon: { nameEn: "Moon (Chandra)", nameTa: "சந்திர ஹோரை", natureEn: "Auspicious", natureTa: "சுபம்", activitiesEn: "Favorable for creative work, travel, and food-related business.", activitiesTa: "படைப்பிலக்கியம், கடல் பயணம் மற்றும் உணவுப் பொருட்கள் வியாபாரத்திற்கு நன்று.", color: "slate-300" },
        Saturn: { nameEn: "Saturn (Shani)", nameTa: "சனி ஹோரை", natureEn: "Inauspicious", natureTa: "அசுபம்", activitiesEn: "Avoid auspicious tasks. Good for clearing debts, cleaning, agriculture.", activitiesTa: "சுப காரியங்களைத் தவிர்க்கவும். பழைய கடன்களை அடைக்க மற்றும் விவசாய வேலைகளுக்கு உகந்தது.", color: "indigo-400" },
        Jupiter: { nameEn: "Jupiter (Guru)", nameTa: "குரு ஹோரை", natureEn: "Auspicious", natureTa: "சுபம்", activitiesEn: "Highly auspicious for investments, spiritual acts, and weddings.", activitiesTa: "அனைத்து சுப காரியங்களுக்கும் உத்தமம். ஆன்மீகம் மற்றும் வங்கி முதலீட்டிற்கு உகந்தது.", color: "yellow-400" },
        Mars: { nameEn: "Mars (Mangal)", nameTa: "செவ்வாய் ஹோரை", natureEn: "Inauspicious", natureTa: "அசுபம்", activitiesEn: "Avoid new partnerships. Good for physical sports, litigation, properties.", activitiesTa: "சுப ஒப்பந்தங்களைத் தவிர்க்கவும். உடற்பயிற்சி மற்றும் நில விவகாரங்களுக்கு உகந்தது.", color: "red-500" }
      };
      const d = new Date(horaDate || new Date());
      const dayOfWeek = d.getDay();
      const startIndex = WEEKDAY_TO_HORA_START_INDEX[dayOfWeek];
      const hoursEn = ["06:00 AM - 07:00 AM","07:00 AM - 08:00 AM","08:00 AM - 09:00 AM","09:00 AM - 10:00 AM","10:00 AM - 11:00 AM","11:00 AM - 12:00 PM","12:00 PM - 01:00 PM","01:00 PM - 02:00 PM","02:00 PM - 03:00 PM","03:00 PM - 04:00 PM","04:00 PM - 05:00 PM","05:00 PM - 06:00 PM"];
      const hoursTa = ["காலை 06:00 - 07:00","காலை 07:00 - 08:00","முற்பகல் 08:00 - 09:00","முற்பகல் 09:00 - 10:00","முற்பகல் 10:00 - 11:00","முற்பகல் 11:00 - நண்பகல் 12:00","நண்பகல் 12:00 - பிற்பகல் 01:00","பிற்பகல் 01:00 - 02:00","பிற்பகல் 02:00 - 03:00","பிற்பகல் 03:00 - மாலை 04:00","மாலை 04:00 - 05:00","மாலை 05:00 - 06:00"];
      const slots = hoursEn.map((timeEn, i) => {
        const planetIndex = (startIndex + i) % 7;
        const planetKey = PLANET_CYCLE[planetIndex];
        const planetData = HORA_PLANETS_DATA[planetKey];
        return { time: language === 'ta' ? hoursTa[i] : timeEn, planet: language === 'ta' ? planetData.nameTa : planetData.nameEn, planetKey, nature: language === 'ta' ? planetData.natureTa : planetData.natureEn, activities: language === 'ta' ? planetData.activitiesTa : planetData.activitiesEn, color: planetData.color };
      });
      setHoraResult({ date: horaDate, slots });
    } catch (e) {
      console.error(e);
    } finally {
      setHoraLoading(false);
    }
  };

  const runGocharam = async () => {
    setGocharLoading(true);
    setGocharResult(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const transitPlanets = [
        { rasi_no: 1, name: language === 'ta' ? 'குரு' : 'Jupiter' },
        { rasi_no: 3, name: language === 'ta' ? 'சூரி' : 'Sun' },
        { rasi_no: 3, name: language === 'ta' ? 'புத' : 'Mercury' },
        { rasi_no: 4, name: language === 'ta' ? 'சுக்' : 'Venus' },
        { rasi_no: 6, name: language === 'ta' ? 'கேது' : 'Ketu' },
        { rasi_no: 10, name: language === 'ta' ? 'செவ்' : 'Mars' },
        { rasi_no: 11, name: language === 'ta' ? 'சனி' : 'Saturn' },
        { rasi_no: 12, name: language === 'ta' ? 'ராகு' : 'Rahu' },
        { rasi_no: 12, name: language === 'ta' ? 'சந்' : 'Moon' },
      ];
      setGocharResult({ title: language === 'ta' ? "இன்றைய கோச்சாரம்" : "Live Transit", planets: transitPlanets, lagnaSignNo: 1 });
    } catch (e) {
      console.error(e);
    } finally {
      setGocharLoading(false);
    }
  };

  const runStarsMatch = () => {
    const results = NAKSHATRAS_TA.map((partnerStar, idx) => {
      const partnerStarEn = NAKSHATRAS_EN[idx];
      const comp = calculateMarriagePorutham(matchStarInput, partnerStar, language === 'ta');
      let classification = comp.totalScore >= 7.5 ? "excellent" : comp.totalScore >= 5.5 ? "good" : "neutral";
      let classificationLabel = comp.totalScore >= 7.5 ? (language === 'ta' ? "உத்தம பொருத்தம் (Excellent)" : "Excellent Match") : comp.totalScore >= 5.5 ? (language === 'ta' ? "மத்திம பொருத்தம் (Medium)" : "Good Match") : (language === 'ta' ? "பொருத்தம் குறைவு (Low)" : "Low Compatibility");
      return { nameTa: partnerStar, nameEn: partnerStarEn, score: comp.totalScore, percentage: comp.percentage, classification, classificationLabel, matchedCount: comp.matchedCount };
    });
    results.sort((a, b) => b.score - a.score);
    setMatchStarResult(results as any);
  };

  const runManaiyadi = () => {
    const area = manaiyadiLength * manaiyadiWidth;
    setManaiyadiResult({
      length: manaiyadiLength, width: manaiyadiWidth, area,
      verdict: area % 2 === 0
        ? (language === 'ta' ? "மனையடி அளவுகள் மிகவும் உத்தமம். வீட்டில் செல்வமும், ஆரோக்கியமும் பெருமளவில் தங்கும்." : "Highly Auspicious dimensions. The house will attract continuous prosperity, health, and spiritual peace.")
        : (language === 'ta' ? "மனையடி அளவுகள் மத்திமம். சுப காரியங்களில் சிறு தாமதங்கள் ஏற்படலாம், வடகிழக்கு திசை பூசைகள் நல்லது." : "Moderate compatibility. Minor delays in ceremonies might occur. Corrective Vastu prayers recommended.")
    });
  };

  const runPalli = () => {
    let response = "";
    if (palliGender === 'male') {
      response = palliPart === "தலையில்"
        ? (language === 'ta' ? "கலகம் அல்லது பெரும் சண்டை நேரிடலாம், அமைதி காக்கவும்." : "Disputes or dynamic conflicts may arise. Maintain mental peace.")
        : (language === 'ta' ? "பெரும் பொருள் சேர்க்கை மற்றும் தனலாபம் கிட்டும்." : "Imminent financial gains or material accumulation.");
    } else {
      response = palliPart === "தலையில்"
        ? (language === 'ta' ? "மிகுந்த பயமும் கவலையும் வரலாம், அம்பிகை வழிபாடு நலம் தரும்." : "Anxiety or fear might emerge. Prayers to Goddess Durga highly beneficial.")
        : (language === 'ta' ? "உறவினர்கள் வருகை அல்லது சுப செய்திகள் வந்து சேரும்." : "An auspicious family event or joyful family visits expected.");
    }
    setPalliResult(response);
  };

  useEffect(() => {
    runPanchang();
    runGocharam();
    runNakshatraPalan();
    runRasiPalan();
    runWeeklyRasiPalan();
    runHora();
    runManaiyadi();
    runPalli();
  }, [language]);

  // ── Role-based dashboard redirect (mirrors _layout.js redirectToDashboard) ──
  // When an authenticated user lands on an auth/landing route, send admins and
  // retailers to their own dashboards instead of the default customer view.
  useEffect(() => {
    if (!user) return;
    const inAuthScreen = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup';
    if (!inAuthScreen) return;

    if (user.user_type === 'admin') {
      navigate('/admin', { replace: true });
    } else if (user.user_type === 'retailer') {
      navigate('/retailer', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  // ── Shared nav tab pill style helper ────────────────────────────────────
  const subPillClass = (active: boolean) =>
    `px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
      active
        ? "bg-amber-500 border-amber-500 text-white"
        : isLight
          ? "bg-amber-50 border-amber-500/15 text-[#5C4F43] hover:text-[#2C241E]"
          : "bg-black/20 border-white/5 text-gray-400 hover:text-white"
    }`;

	const RetailerElement = (
	  	<div className="glass-panel p-6 rounded-2xl border">
		  <RetailerDashboardScreen/>
		</div>
	);

  if (user === undefined) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-sans ${theme === 'light' ? 'light-theme bg-[#FDFBF7]' : 'bg-[#0A0612]'} transition-all duration-300 relative overflow-hidden`}>
        <CosmicBackground theme={theme} />
        <div className="text-center relative z-10 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-[#B45309] flex items-center justify-center shadow-lg animate-spin">
            <span className="text-2xl font-bold text-white font-serif">ॐ</span>
          </div>
          <div className="text-amber-500 font-cinzel font-black tracking-widest text-lg">ASTROAYAN</div>
          <div className="text-xs text-gray-400 font-mono tracking-wider animate-pulse">
            {language === 'ta' ? "அண்டவெளியின் ஆற்றலை இணைக்கிறது..." : "CONNECTING CELESTIAL PORTAL..."}
          </div>
        </div>
      </div>
    );
  }

  // When user is null, render login/signup screens; redirect everything else to /login
  if (user === null) {
    return (
      <Routes>
        <Route path="/login" element={
          <LoginScreen onLoginSuccess={(userData: any) => login(userData)} language={language} theme={theme} />
        } />
        <Route path="/signup" element={
          <SignupScreen onSignupSuccess={(userData: any) => login(userData)} language={language} theme={theme} />
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
  
  const ADMIN_USER_ID = 'f7191c3d-b329-49e3-965d-c5015663ebba';
  
  return (
    <div className={`min-h-screen font-sans ${theme === 'light' ? 'light-theme text-[#2C241E]' : 'text-gray-100'} transition-all duration-300 relative pb-16 overflow-x-hidden`}>
      
      <CosmicBackground theme={theme} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ─── Navigation Header ──────────────────────────────────────────────── */}
        <header className={`flex flex-col lg:flex-row justify-between items-center py-5 border-b mb-8 gap-4 transition-all ${isLight ? "border-amber-500/10" : "border-gray-700/10"}`}>
          <Link to="/" className="flex items-center gap-2.5 cursor-pointer">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-[#B45309] flex items-center justify-center shadow-lg transition-all ${isLight ? "shadow-amber-600/10" : "shadow-amber-500/20"}`}>
              <span className="text-xl font-bold text-white font-serif">ॐ</span>
            </div>
            <div>
              <span className="text-xl font-cinzel font-black tracking-[0.12em] text-amber-500">ASTROAYAN</span>
              <span className={`block text-[8px] tracking-[0.2em] uppercase font-sans font-bold transition-all ${isLight ? "text-[#5C4F43]" : "text-[#a19fbe]"}`}>Divine Cosmic Wisdom</span>
            </div>
          </Link>

          {/* ── Main Nav Tabs ────────────────────────────────────────────────── */}
          <nav className={`flex flex-wrap items-center justify-center gap-1 backdrop-blur-md p-1 rounded-xl border transition-all ${isLight ? "bg-amber-500/5 border-amber-500/15" : "bg-black/25 border-white/5"}`}>
            {[
              { id: 'home',        labelEn: 'Dashboard',    labelTa: 'டாஷ்போர்டு',      path: '/' },
              { id: 'predictions', labelEn: 'Predictions',  labelTa: 'பலன்கள்',          path: '/predictions' },
              { id: 'panchangam',  labelEn: 'Panchangam',   labelTa: 'பஞ்சாங்கம்',       path: '/panchangam' },
              { id: 'horoscope',   labelEn: 'Horoscope',    labelTa: 'ஜாதகம்',           path: '/horoscope' },
              { id: 'marriage',    labelEn: 'Marriage',     labelTa: 'திருமணம்',          path: '/marriage' },
              { id: 'vedic-tools', labelEn: 'Vedic Tools',  labelTa: 'வைதீகக் கருவிகள்', path: '/vedic-tools' },
              { id: 'consult',     labelEn: 'Consult Expert', labelTa: 'ஆலோசனை',        path: '/consult' },
              { id: 'shop',        labelEn: 'Remedy Shop',  labelTa: 'பரிகாரக் கடை',     path: '/shop' }
            ].map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                  activeTab === tab.id
                    ? isLight
                      ? "bg-amber-600/15 border border-amber-600/25 text-[#B45309] shadow-sm"
                      : "bg-amber-500/15 border border-amber-500/20 text-amber-400 shadow-sm"
                    : isLight
                      ? "text-[#5C4F43] hover:text-[#2C241E] hover:bg-amber-600/5"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {language === 'ta' ? tab.labelTa : tab.labelEn}
              </Link>
            ))}
          </nav>

          {/* Quick controls */}
			<div className="flex flex-wrap items-center justify-center gap-3">
			{user?.id !== ADMIN_USER_ID && (
			<>
				<div className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-xl font-mono text-xs transition-all ${isLight ? "bg-amber-50/70 border-amber-500/20" : "bg-black/45 border-amber-500/15"}`}>
				  <span className={`text-[10px] font-bold tracking-wider ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>WALLET:</span>
				  <span className="text-amber-500 font-black">₹{walletBalance}</span>
				  <button onClick={() => setShowWalletModal(true)} className="ml-1 bg-amber-500 hover:bg-amber-600 text-white text-[9px] px-1.5 py-0.5 rounded-md font-sans font-bold uppercase transition-all">+ Add</button>
				</div>
				<div className="bg-gradient-to-r from-amber-500 to-[#B45309] text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/10">
				  <Crown className="h-3.5 w-3.5" /><span>{user?.customer_plans?.plan_name}</span>
				</div>
			</>
			)}
            <div className={`flex rounded-xl p-0.5 border text-xs font-bold transition-all ${isLight ? "bg-amber-50/50 border-amber-500/15" : "bg-black/35 border-white/5"}`}>
              <button onClick={() => toggleLanguage('en')} className={`px-2.5 py-1 rounded-lg transition-all ${language === 'en' ? 'bg-amber-500 text-white shadow' : isLight ? 'text-[#5C4F43] hover:text-[#2C241E]' : 'text-gray-400 hover:text-white'}`}>EN</button>
              <button onClick={() => toggleLanguage('ta')} className={`px-2.5 py-1 rounded-lg transition-all ${language === 'ta' ? 'bg-amber-500 text-white shadow' : isLight ? 'text-[#5C4F43] hover:text-[#2C241E]' : 'text-gray-400 hover:text-white'}`}>தமிழ்</button>
            </div>
            <button
			  onClick={toggleTheme}
			  className={`relative flex items-center w-[72px] h-8 rounded-full border transition-all shadow-md ${
				isLight ? "bg-amber-50/50 border-amber-500/15" : "bg-black/35 border-white/5"
			  }`}
			>
			  <span
				className={`absolute flex items-center justify-center w-7 h-7 rounded-full transition-transform duration-300 ${
				  isLight ? "translate-x-0.5 bg-amber-400" : "translate-x-[40px] bg-amber-500"
				}`}
			  >
				{isLight ? <Sun className="h-3.5 w-3.5 text-white" /> : <Moon className="h-3.5 w-3.5 text-white" />}
			  </span>
			  <span
				className={`absolute text-[10px] font-bold transition-all ${
				  isLight ? "right-2 text-amber-500/60" : "left-2 text-amber-400/60"
				}`}
			  >
				{isLight ? "Dark" : "Light"}
			  </span>
			</button>
			{user?.id !== ADMIN_USER_ID && (
			<>
				<button
				  onClick={() => setShowProfileModal(true)}
				  title={language === 'ta' ? "சுயவிவரம்" : "Profile Settings"}
				  className={`p-2 rounded-xl border transition-all shadow-md ${isLight ? "bg-amber-50/50 border-amber-500/15 text-[#5C4F43] hover:bg-amber-100/50 hover:border-amber-500/40" : "bg-black/35 border-white/5 text-gray-300 hover:bg-black/55 hover:border-amber-500/30 hover:text-amber-400"}`}
				>
				  <User className="h-4 w-4" />
				</button>
				<button
				  onClick={() => setShowPasswordModal(true)}
				  title={language === 'ta' ? "கடவுச்சொல் மாற்று" : "Change Password"}
				  className={`p-2 rounded-xl border transition-all shadow-md ${isLight ? "bg-amber-50/50 border-amber-500/15 text-[#5C4F43] hover:bg-amber-100/50 hover:border-amber-500/40" : "bg-black/35 border-white/5 text-gray-300 hover:bg-black/55 hover:border-amber-500/30 hover:text-amber-400"}`}
				>
				  <Sliders className="h-4 w-4" />
				</button>
				<button
				  onClick={() => setShowHelpModal(true)}
				  title={language === 'ta' ? "உதவி" : "Help & Support"}
				  className={`p-2 rounded-xl border transition-all shadow-md ${isLight ? "bg-amber-50/50 border-amber-500/15 text-[#5C4F43] hover:bg-amber-100/50 hover:border-amber-500/40" : "bg-black/35 border-white/5 text-gray-300 hover:bg-black/55 hover:border-amber-500/30 hover:text-amber-400"}`}
				>
				  <HelpCircle className="h-4 w-4" />
				</button>
			</>
			)}
            <button 
              onClick={handleLogout} 
              title={language === 'ta' ? "வெளியேறு (Logout)" : "Logout"}
              className={`p-2 rounded-xl border text-rose-500 transition-all shadow-md ${isLight ? "bg-amber-50/50 border-amber-500/15 hover:bg-rose-50 hover:border-rose-300" : "bg-black/35 border-white/5 hover:bg-black/55 hover:border-rose-500/30"}`}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ─── Main Content Routes ─────────────────────────────────────────────── */}
        <main className="min-h-[60vh]">
          <Routes>

            {/* ── HOME / DASHBOARD ──────────────────────────────────────────────── */}
            <Route path="/" element={
              <div className="space-y-8 animate-fade-in">

                {/* Welcome Hero */}
                <div className={`relative overflow-hidden rounded-3xl border transition-all duration-300 p-8 shadow-2xl ${isLight ? "bg-gradient-to-br from-amber-500/10 via-amber-50/70 to-indigo-50/40 border-amber-500/15" : "bg-gradient-to-br from-[#0c0a24]/90 via-[#120e36]/95 to-[#0c0a24]/90 border-amber-500/10"}`}>
				  <div className={`absolute top-0 right-1/4 w-96 h-96 rounded-full filter blur-3xl pointer-events-none transition-all ${isLight ? "bg-amber-500/8" : "bg-amber-500/5"}`} />
				  <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-6 relative z-10">
					<div className="lg:col-span-2 space-y-4">
					  <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold tracking-widest font-mono uppercase transition-all ${isLight ? "bg-amber-100 border border-amber-500/20 text-[#B45309]" : "bg-[#B45309]/20 border border-[#B45309]/35 text-amber-400"}`}>✦ ASTROAYAN PORTAL ✦</span>
					  <h1 className={`text-3xl md:text-4xl font-serif font-black tracking-tight leading-tight transition-all ${isLight ? "text-[#1E120A]" : "text-[#FFFDF9]"}`}>
						{language === 'ta' ? `வணக்கம், ${user?.name || ''}! உங்கள் விண்மீன் வழிகாட்டியைக் கண்டறியுங்கள்` : `Welcome, ${user?.name || 'Explorer'}! Explore Your Cosmic Roadmap`}
					  </h1>
					  <p className={`text-xs max-w-xl leading-relaxed transition-all ${isLight ? "text-[#5C4F43]" : "text-gray-300"}`}>
						{language === 'ta' ? "துல்லியமான ஜாதகக் கணிப்பு, திருமணப் பொருத்தம், தினசரி கோள் பெயர்ச்சி மற்றும் பஞ்சாங்க தகவல்களை ஒரே இடத்தில் அணுபவியுங்கள்." : "Generate detailed natal Kundlis, check live auspicious panchang hours, audit relationship compatibility, or schedule lineage-expert divine consultations."}
					  </p>
					</div>
					<div className={`p-5 rounded-2xl space-y-3 lg:ml-auto w-full max-w-xs transition-all border ${isLight ? "bg-white/95 border-amber-500/15 shadow-md" : "bg-black/45 border-amber-500/10"}`}>
					  <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider font-mono transition-all ${isLight ? "text-[#B45309]" : "text-amber-400"}`}>
						<Star className="h-4 w-4 text-amber-500 fill-amber-500 animate-spin-slow" />{language === 'ta' ? 'இன்றைய நட்சத்திரம்' : "TODAY'S STAR"}
					  </div>
					  <div className={`text-lg font-serif font-bold leading-snug transition-all ${isLight ? "text-[#2C241E]" : "text-white"}`}>{todayNakshatra}</div>
					  <div className={`text-[10px] font-mono transition-all ${isLight ? "text-[#7A695A]" : "text-gray-400"}`}>{language === 'ta' ? `சந்திராஷ்டமம்: ${todayChandrashtamam}` : `Chandrashtamam warning: ${todayChandrashtamam}`}</div>
					</div>
				  </div>
				</div>
                {/* Free Panchangam PDF Banner */}
                <div onClick={() => navigate('/panchangam/panchangam-pdf')} className={`relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 p-5 ${isLight ? "bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-emerald-400/60 hover:border-emerald-500/80 shadow-md" : "bg-gradient-to-r from-emerald-950/60 via-black/40 to-teal-950/50 border-emerald-500/40 hover:border-emerald-400/70"}`}>
                  <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isLight ? "bg-emerald-100 text-emerald-700" : "bg-emerald-500/15 text-emerald-400"}`}><Share2 className="h-5 w-5" /></div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`text-sm font-bold font-serif ${isLight ? "text-emerald-900" : "text-emerald-300"}`}>{language === 'ta' ? "பஞ்சாங்கம் PDF பகிர்வு" : "Share Panchangam PDF"}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${isLight ? "bg-emerald-100 border-emerald-400/50 text-emerald-700" : "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"}`}><Zap className="h-2.5 w-2.5" /> {language === 'ta' ? "இலவசம்" : "FREE"}</span>
                      </div>
                      <p className={`text-[11px] leading-relaxed ${isLight ? "text-emerald-800/70" : "text-emerald-300/60"}`}>{language === 'ta' ? "இன்றைய பஞ்சாங்க விவரங்களை PDF ஆக உருவாக்கி குடும்பத்தினருடன் பகிரலாம்." : "Generate and share today's Panchangam as a beautiful PDF — completely free."}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl shrink-0 transition-all relative z-10 ${isLight ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow shadow-emerald-500/20" : "bg-emerald-500/80 text-white hover:bg-emerald-500"}`}>
                    <span>{language === 'ta' ? "PDF உருவாக்கு" : "Generate PDF"}</span><ArrowRight className="h-4 w-4" />
                  </div>
                </div>

                {/* GROUP 1: HOROSCOPE */}
                <div className="gradient-group-jadhagam p-6 rounded-3xl space-y-5 animate-fade-in border">
                  <div className="border-b border-gray-700/10 pb-4">
                    <h2 className="text-xl font-serif font-black tracking-tight text-amber-500 flex items-center gap-2"><Compass className="h-5 w-5" />{language === 'ta' ? "ஜாதகம் & ஹோரோஸ்கோப்" : "Horoscope"}</h2>
                    <p className={`text-xs mt-1 ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>{language === 'ta' ? "ஒரு பக்க ஜாதகம், பிறப்பு கட்டம், விரிவான ஜாதகம் மற்றும் PDF அறிக்கைகள்." : "1-Page PDF, birth chart casting, detailed horoscope, and premium PDF reports."}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { path: '/horoscope/birth', icon: <Compass className="h-5 w-5" />, titleTa: "பிறப்பு ஜாதகம் கணித்தல்", titleEn: "View Horoscope (Birth Kundli)", descTa: "உங்கள் பிறந்த விவரங்களைக் கொண்டு D1 இராசி கட்டத்தை கணிக்கவும்.", descEn: "Cast your detailed natal Vedic D1 Kundli chart interactively.", ctaTa: "ஜாதகம் காண்க", ctaEn: "Cast Chart" },
                      { path: '/horoscope/view-report', icon: <BookOpen className="h-5 w-5" />, titleTa: "விரிவான ஜாதகம்", titleEn: "Interactive Report Viewer", descTa: "பஞ்சாங்கம், தசா, மற்றும் கிரக நிலைகளுடன் கூடிய விரிவான ஜாதக அறிக்கை.", descEn: "Interactive report viewer with dasha, planets, and full chart details.", ctaTa: "விரிவாக காண்க", ctaEn: "View Report" },
                      { path: '/horoscope/page-pdf', icon: <FileText className="h-5 w-5" />, titleTa: "ஒரு பக்க ஜாதக PDF", titleEn: "1-Page Horoscope PDF", descTa: "ஒற்றை பக்கத்தில் ஜாதக சுருக்கம் PDF.", descEn: "Compact single-page Vedic horoscope summary as a PDF.", ctaTa: "PDF உருவாக்கு", ctaEn: "Generate PDF" },
                      { path: '/horoscope/book-pdf', icon: <Printer className="h-5 w-5" />, titleTa: "விரிவான ஜாதக PDF", titleEn: "Detailed Horoscope PDF", descTa: "பல பக்க விரிவான ஜாதக புத்தகம் PDF வடிவில்.", descEn: "Multi-page comprehensive horoscope book as a downloadable PDF.", ctaTa: "PDF உருவாக்கு", ctaEn: "Generate PDF" },
                    ].map((item) => (
                      <div key={item.path} onClick={() => navigate(item.path)} className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer flex flex-col justify-between ${isLight ? "bg-white border-amber-500/15 hover:bg-amber-50/75 hover:border-amber-500/40 shadow-sm" : "bg-black/35 border-white/5 hover:bg-black/55 hover:border-amber-500/30"}`}>
                        <div className="space-y-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">{item.icon}</div>
                          <div>
                            <h3 className={`text-sm font-bold font-serif ${isLight ? "text-[#1E120A]" : "text-white"}`}>{language === 'ta' ? item.titleTa : item.titleEn}</h3>
                            <p className={`text-[11px] leading-relaxed mt-1 ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>{language === 'ta' ? item.descTa : item.descEn}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-amber-500"><span>{language === 'ta' ? item.ctaTa : item.ctaEn}</span><ChevronRight className="h-4 w-4" /></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GROUP 2: MARRIAGE */}
                <div className="gradient-group-tools p-6 rounded-3xl space-y-5 animate-fade-in border">
                  <div className="border-b border-gray-700/10 pb-4">
                    <h2 className="text-xl font-serif font-black tracking-tight text-amber-500 flex items-center gap-2"><Heart className="h-5 w-5" />{language === 'ta' ? "திருமணம்" : "Marriage"}</h2>
                    <p className={`text-xs mt-1 ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>{language === 'ta' ? "திருமணப் பொருத்தம், PDF, பயோடேட்டா மற்றும் பொருத்தமான நட்சத்திர பட்டியல்." : "Marriage porutham, PDF report, biodata generator, and compatible star lists."}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { path: '/marriage/porutham', icon: <Heart className="h-5 w-5" />, titleTa: "திருமணப் பொருத்தம்", titleEn: "Marriage Porutham", descTa: "10 முகப் பொருத்தப் பகுப்பாய்வு.", descEn: "10-point Vedic star compatibility analysis.", ctaTa: "பொருத்தம் சோதி", ctaEn: "Check Porutham" },
                      { path: '/marriage/porutham-pdf', icon: <Printer className="h-5 w-5" />, titleTa: "திருமண பொருத்தம் PDF", titleEn: "Marriage Porutham PDF", descTa: "திருமண பொருத்த அறிக்கையை PDF ஆக பதிவிறக்கவும்.", descEn: "Download the detailed porutham report as a shareable PDF.", ctaTa: "PDF உருவாக்கு", ctaEn: "Generate PDF" },
                      { path: '/marriage/biodata', icon: <FileText className="h-5 w-5" />, titleTa: "திருமண பயோடேட்டா தயாரிப்பான்", titleEn: "Biodata Generator", descTa: "அழகான திருமணப் பயோடேட்டாவை உருவாக்குதல்.", descEn: "Create elegant customized marriage biodata profiles.", ctaTa: "தயாரிக்க", ctaEn: "Generate Biodata" },
                      { path: '/marriage/stars', icon: <Award className="h-5 w-5" />, titleTa: "பொருத்தமான நட்சத்திரங்கள் பட்டியல்", titleEn: "Compatible Stars List", descTa: "உங்கள் நட்சத்திரத்திற்குப் பொருத்தமான நட்சத்திரங்களின் அட்டவணை.", descEn: "Complete list of compatible star configurations for marriage.", ctaTa: "பட்டியல் காண்க", ctaEn: "View Star List" },
                    ].map((item) => (
                      <div key={item.path} onClick={() => navigate(item.path)} className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer flex flex-col justify-between ${isLight ? "bg-white border-amber-500/15 hover:bg-amber-50/75 hover:border-amber-500/40 shadow-sm" : "bg-black/35 border-white/5 hover:bg-black/55 hover:border-amber-500/30"}`}>
                        <div className="space-y-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">{item.icon}</div>
                          <div>
                            <h3 className={`text-sm font-bold font-serif ${isLight ? "text-[#1E120A]" : "text-white"}`}>{language === 'ta' ? item.titleTa : item.titleEn}</h3>
                            <p className={`text-[11px] leading-relaxed mt-1 ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>{language === 'ta' ? item.descTa : item.descEn}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-amber-500"><span>{language === 'ta' ? item.ctaTa : item.ctaEn}</span><ChevronRight className="h-4 w-4" /></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GROUP 3: PANCHANGAM & PREDICTIONS */}
                <div className="gradient-group-predictions p-6 rounded-3xl space-y-5 animate-fade-in border">
                  <div className="border-b border-gray-700/10 pb-4">
                    <h2 className="text-xl font-serif font-black tracking-tight text-amber-500 flex items-center gap-2"><Calendar className="h-5 w-5" />{language === 'ta' ? "பஞ்சாங்கம் & கணிப்புகள்" : "Panchangam and Predictions"}</h2>
                    <p className={`text-xs mt-1 ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>{language === 'ta' ? "தினசரி பஞ்சாங்கம், ராசி பலன், நட்சத்திர பலன், வார பலன், கோச்சாரம் மற்றும் ஹோரா." : "Daily panchang, rasi & nakshatra palans, weekly forecast, live transit, and hora timings."}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { path: '/panchangam/daily', icon: <Calendar className="h-5 w-5" />, titleTa: "பஞ்சாங்கம்", titleEn: "Panchangam", descTa: "திதி, வாரம், நட்சத்திரம், யோகம், கரணம்.", descEn: "Daily Vedic calendar with tithi, nakshatra, yoga, karana, and nalla neram.", ctaTa: "பஞ்சாங்கம் காண்க", ctaEn: "View Panchangam" },
                      { path: '/predictions/rasi', icon: <Sparkles className="h-5 w-5" />, titleTa: "தினசரி இராசி பலன்", titleEn: "Daily Rasi Palan", descTa: "12 இராசிகளுக்கான இன்றைய கிரக கணிப்புகள்.", descEn: "Today's planetary forecast for all 12 moon signs.", ctaTa: "பலன் காண்க", ctaEn: "View Palan" },
                      { path: '/predictions/weekly', icon: <Calendar className="h-5 w-5" />, titleTa: "வாராந்திர இராசி பலன்", titleEn: "Weekly Rasi Palan", descTa: "வரும் வாரத்திற்கான முழு கிரகப் பெயர்ச்சி பலன்கள்.", descEn: "7-day comprehensive planetary transit forecasts.", ctaTa: "வார பலன் காண்க", ctaEn: "View Weekly" },
                      { path: '/predictions/nakshatra', icon: <Star className="h-5 w-5" />, titleTa: "தினசரி நட்சத்திர பலன்", titleEn: "Daily Nakshatra Palan", descTa: "27 நட்சத்திரங்களுக்கான பிரத்யேக தினசரி பலன்கள்.", descEn: "Star-specific daily forecasts for all 27 nakshatras.", ctaTa: "நட்சத்திர பலன்", ctaEn: "View Nakshatra" },
                      { path: '/panchangam/gocharam', icon: <Globe className="h-5 w-5" />, titleTa: "நேரடி கோச்சாரம்", titleEn: "Live Gocharam", descTa: "தற்போதைய கோள்களின் நிகழ்நேர இராசி கட்டப் பெயர்ச்சி பலன்கள்.", descEn: "Real-time planetary transit positions across the zodiac.", ctaTa: "கோச்சாரம் காண்க", ctaEn: "View Transit" },
                      { path: '/panchangam/hora', icon: <Clock className="h-5 w-5" />, titleTa: "ஹோரா முகூர்த்தம்", titleEn: "Hora Muhurtham", descTa: "சுப காரியங்களுக்கு சிறந்த ஹோரா கால அட்டவணை.", descEn: "Planetary hour table to pick the ideal time for important tasks.", ctaTa: "ஹோரா காண்க", ctaEn: "View Horas" },
                    ].map((item) => (
                      <div key={item.path} onClick={() => navigate(item.path)} className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer flex flex-col justify-between ${isLight ? "bg-white border-amber-500/15 hover:bg-amber-50/75 hover:border-amber-500/40 shadow-sm" : "bg-black/35 border-white/5 hover:bg-black/55 hover:border-amber-500/30"}`}>
                        <div className="space-y-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">{item.icon}</div>
                          <div>
                            <h3 className={`text-sm font-bold font-serif ${isLight ? "text-[#1E120A]" : "text-white"}`}>{language === 'ta' ? item.titleTa : item.titleEn}</h3>
                            <p className={`text-[11px] leading-relaxed mt-1 ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>{language === 'ta' ? item.descTa : item.descEn}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-amber-500"><span>{language === 'ta' ? item.ctaTa : item.ctaEn}</span><ChevronRight className="h-4 w-4" /></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GROUP 4: OTHER TOOLS */}
                <div className="gradient-group-panchangam p-6 rounded-3xl space-y-5 animate-fade-in border">
                  <div className="border-b border-gray-700/10 pb-4">
                    <h2 className="text-xl font-serif font-black tracking-tight text-amber-500 flex items-center gap-2"><Sliders className="h-5 w-5" />{language === 'ta' ? "பிற கருவிகள்" : "Other Tools"}</h2>
                    <p className={`text-xs mt-1 ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>{language === 'ta' ? "பல்லி சாஸ்திரம், மனையடி சாஸ்திரம் மற்றும் வயது கணிப்பான்." : "Lizard omen guide, vastu house measurement calculator, and age calculator."}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { path: '/vedic-tools/palli', icon: <Info className="h-5 w-5" />, titleTa: "பல்லி விழும் பலன்", titleEn: "Lizard Omen Guide", descTa: "உடலின் எந்த பகுதியில் பல்லி விழுகிறது என்பதற்கான சுப/அசுப பலன்கள்.", descEn: "Traditional body-part lizard falling omen outcomes.", ctaTa: "பலன் காண்க", ctaEn: "Explore Omens" },
                      { path: '/vedic-tools/manaiyadi', icon: <Landmark className="h-5 w-5" />, titleTa: "மனையடி சாஸ்திரம்", titleEn: "Manaiyadi Shastram", descTa: "வீட்டு அறை அடி கணக்கின் சுப/அசுப பலன்கள்.", descEn: "House vastu room measurement auspiciousness guide.", ctaTa: "அடி சாஸ்திரம் காண்க", ctaEn: "Verify Vastu" },
                      { path: '/vedic-tools/age', icon: <Clock className="h-5 w-5" />, titleTa: "வயது கணிப்பான்", titleEn: "Age Calculator", descTa: "துல்லியமான வயது, மாதங்கள் மற்றும் நாட்கள் கணக்கீடு.", descEn: "Calculate your precise chronological age in years, months, and days.", ctaTa: "வயதை கணக்கிடு", ctaEn: "Calculate Age" },
                    ].map((item) => (
                      <div key={item.path} onClick={() => navigate(item.path)} className={`p-5 rounded-2xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer flex flex-col justify-between ${isLight ? "bg-white border-amber-500/15 hover:bg-amber-50/75 hover:border-amber-500/40 shadow-sm" : "bg-black/35 border-white/5 hover:bg-black/55 hover:border-amber-500/30"}`}>
                        <div className="space-y-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">{item.icon}</div>
                          <div>
                            <h3 className={`text-sm font-bold font-serif ${isLight ? "text-[#1E120A]" : "text-white"}`}>{language === 'ta' ? item.titleTa : item.titleEn}</h3>
                            <p className={`text-[11px] leading-relaxed mt-1 ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>{language === 'ta' ? item.descTa : item.descEn}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-amber-500"><span>{language === 'ta' ? item.ctaTa : item.ctaEn}</span><ChevronRight className="h-4 w-4" /></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GROUP 5: CONSULTATION */}
                <div className="gradient-group-consult p-6 rounded-3xl space-y-5 animate-fade-in border">
                  <div className="border-b border-gray-700/10 pb-4">
                    <h2 className="text-xl font-serif font-black tracking-tight text-amber-500 flex items-center gap-2"><User className="h-5 w-5" />{language === 'ta' ? "பரம்பரை ஜோதிடர்களுடன் நேரடி ஆலோசனை" : "Divine Consultation & Lineage Experts"}</h2>
                    <p className={`text-xs mt-1 ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>{language === 'ta' ? "சான்றளிக்கப்பட்ட பரம்பரை குருக்கள் மற்றும் வல்லுநர்களுடன் உடனடி முன்பதிவு." : "Schedule confidential high-priority live video or chat consultations directly with lineage-certified masters."}</p>
                  </div>
                  <div onClick={() => navigate('/consult')} className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-xl cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 ${isLight ? "bg-white border-amber-500/15 hover:bg-amber-50/75 hover:border-amber-500/40 shadow-sm" : "bg-black/35 border-white/5 hover:bg-black/55 hover:border-amber-500/30"}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0"><Video className="h-6 w-6" /></div>
                      <div>
                        <h3 className={`text-base font-bold font-serif ${isLight ? "text-[#1E120A]" : "text-white"}`}>{language === 'ta' ? "ஒருவரை ஒருவர் நேரடி வீடியோ/அரட்டை ஆலோசனை" : "Schedule Live 1-on-1 Consultations"}</h3>
                        <p className={`text-xs leading-relaxed mt-1 ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>{language === 'ta' ? "பிரபல ஜோதிட வல்லுநர்கள், பரம்பரை வேத அறிஞர்களுடன் உங்கள் ஜாதகம் மற்றும் சந்தேகங்களுக்கு தீர்வு காணுங்கள்." : "Book private consultations with lineage masters from sacred temples."}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold bg-amber-500 text-white px-4 py-2 rounded-xl shrink-0"><span>{language === 'ta' ? "உடனடி முன்பதிவு" : "Schedule Expert Now"}</span><ArrowRight className="h-4 w-4" /></div>
                  </div>
                </div>

                {/* GROUP 6: REMEDY SHOP */}
                <div className="gradient-group-shop p-6 rounded-3xl space-y-5 animate-fade-in border">
                  <div className="border-b border-gray-700/10 pb-4">
                    <h2 className="text-xl font-serif font-black tracking-tight text-amber-500 flex items-center gap-2"><ShoppingBag className="h-5 w-5" />{language === 'ta' ? "பரிகார நவரத்தினங்கள் & ஆன்மீகப் பொருட்கள்" : "Sacred Remedy & Gemstone Sanctum"}</h2>
                    <p className={`text-xs mt-1 ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>{language === 'ta' ? "கிரக தோஷ நிவர்த்திக்கான சான்றளிக்கப்பட்ட நவரத்தினங்கள், செம்பு ஸ்ரீ யந்திரம், மற்றும் ருத்ராட்ச மாலைகள்." : "Acquire Vedic-certified energized gemstones, heavy-gauge copper yantras, or natural Nepal rudraksha beads."}</p>
                  </div>
                  <div onClick={() => navigate('/shop')} className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-xl cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 ${isLight ? "bg-white border-amber-500/15 hover:bg-amber-50/75 hover:border-amber-500/40 shadow-sm" : "bg-black/35 border-white/5 hover:bg-black/55 hover:border-amber-500/30"}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0"><ShoppingBag className="h-6 w-6" /></div>
                      <div>
                        <h3 className={`text-base font-bold font-serif ${isLight ? "text-[#1E120A]" : "text-white"}`}>{language === 'ta' ? "சக்தியூட்டப்பட்ட பரிகார ஆன்மீகக் கடையை பார்வையிடுக" : "Browse Energized Spiritual Remedies Store"}</h3>
                        <p className={`text-xs leading-relaxed mt-1 ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>{language === 'ta' ? "கிரக தோஷங்களைக் களைந்து, நேர்மறை ஆற்றலை ஈர்க்க வேத முறைப்படி சக்தியூட்டப்பட்ட ஆன்மீகப் பொருட்கள்." : "Purchase authenticated remedy stones, copper Sri Yantras, and natural certified rudrakshas."}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold bg-amber-500 text-white px-4 py-2 rounded-xl shrink-0"><span>{language === 'ta' ? "ஆன்மீக கடை" : "Browse Remedy Shop"}</span><ArrowRight className="h-4 w-4" /></div>
                  </div>
                </div>
              </div>
            } />

            {/* ── PREDICTIONS ───────────────────────────────────────────────────── */}
            <Route path="/predictions/*" element={
              <div className="space-y-6 animate-fade-in">
                <BackButton />
                <div className="flex flex-wrap gap-2 border-b border-gray-700/25 pb-3">
                  {[
                    { id: 'rasi',      labelEn: 'Daily Rasi Palan',      labelTa: 'தினசரி இராசி பலன்' },
                    { id: 'nakshatra', labelEn: 'Daily Nakshatra Palan', labelTa: 'தினசரி நட்சத்திர பலன்' },
                    { id: 'weekly',    labelEn: 'Weekly Rasi Palan',     labelTa: 'வாராந்திர இராசி பலன்' },
                  ].map((sub) => (
                    <button key={sub.id} onClick={() => navigate(`/predictions/${sub.id}`)} className={subPillClass(predictionsSubTab === sub.id)}>
                      {language === 'ta' ? sub.labelTa : sub.labelEn}
                    </button>
                  ))}
                </div>
                {predictionsSubTab === 'rasi'      && <DailyRasiPalan isLight={isLight} />}
                {predictionsSubTab === 'nakshatra' && <DailyNakshatraPalan isLight={isLight} />}
                {predictionsSubTab === 'weekly'    && <WeeklyRasiPalan isLight={isLight} />}
              </div>
            } />

            {/* ── PANCHANGAM (now with 4 sub-pills) ──────────────────────────────── */}
            <Route path="/panchangam/*" element={
              <div className="space-y-6 animate-fade-in">
                <BackButton />
                <div className="flex flex-wrap gap-2 border-b border-gray-700/25 pb-3">
                  {[
                    { id: 'daily',          labelEn: 'Daily Panchangam',    labelTa: 'தினசரி பஞ்சாங்கம்' },
                    { id: 'panchangam-pdf', labelEn: 'Panchangam PDF',      labelTa: 'பஞ்சாங்கம் PDF' },
                    { id: 'hora',           labelEn: 'Hora Muhurtham',      labelTa: 'ஹோரா முகூர்த்தம்' },
                    { id: 'gocharam',       labelEn: 'Live Gocharam Transit', labelTa: 'நேரடி கோச்சாரம்' },
                  ].map((sub) => (
                    <button key={sub.id} onClick={() => navigate(`/panchangam/${sub.id}`)} className={subPillClass(panchangamSubTab === sub.id)}>
                      {language === 'ta' ? sub.labelTa : sub.labelEn}
                    </button>
                  ))}
                </div>
                {panchangamSubTab === 'daily'          && <Panchangam isLight={isLight} />}
                {panchangamSubTab === 'panchangam-pdf' && <PanchangamPdf isLight={isLight}/>}
                {panchangamSubTab === 'hora'           && <HoraSection isLight={isLight} />}
                {panchangamSubTab === 'gocharam'       && <GocharamTransit isLight={isLight} />}
              </div>
            } />

            {/* ── HOROSCOPE (new tab) ─────────────────────────────────────────────── */}
            <Route path="/horoscope/*" element={
              <div className="space-y-6 animate-fade-in">
                <BackButton />
                <div className="flex flex-wrap gap-2 border-b border-gray-700/25 pb-3">
                  {[
                    { id: 'birth',       labelEn: 'Birth Horoscope',     labelTa: 'பிறப்பு ஜாதகம்' },
                    { id: 'view-report', labelEn: 'Interactive Report Viewer', labelTa: 'விரிவான ஜாதக அறிக்கை' },
                    { id: 'page-pdf',    labelEn: '1-Page Horoscope PDF',      labelTa: 'ஒரு பக்க ஜாதக PDF' },
                    { id: 'book-pdf',    labelEn: 'Detailed Horoscope PDF',    labelTa: 'விரிவான ஜாதக PDF' },
                  ].map((sub) => (
                    <button key={sub.id} onClick={() => navigate(`/horoscope/${sub.id}`)} className={subPillClass(horoscopeSubTab === sub.id)}>
                      {language === 'ta' ? sub.labelTa : sub.labelEn}
                    </button>
                  ))}
                </div>

                {horoscopeSubTab === 'birth' && (
                  <div className="animate-fade-in">
                    {!horoData ? (
                      <HoroscopeInputForm onSubmit={(values) => {
                        setHoroInputName(values.name);
                        setHoroInputDate(values.dob);
                        const dob = values.dob;
                        const input = { day: dob.getDate(), month: dob.getMonth() + 1, year: dob.getFullYear(), hour: dob.getHours(), min: dob.getMinutes(), lat: values.lat, lon: values.lon, tzone: values.tzone, lang: language };
                        fetchHoro(input);
                        setHoroData(input);
                      }} />
                    ) : (
                      <HoroscopeOutputScreen name={horoInputName} date={horoInputDate} data={horoDetails} loading={horoDetailsLoading} error={horoDetailsError} onBack={handleHoroBack} />
                    )}
                  </div>
                )}
                {horoscopeSubTab === 'view-report' && <ViewBookHoroscope isLight={isLight}/>}
                {horoscopeSubTab === 'page-pdf'    && <PageHoroscopePdf isLight={isLight}/>}
                {horoscopeSubTab === 'book-pdf'    && <BookHoroscopePdf isLight={isLight}/>}
              </div>
            } />

            {/* ── MARRIAGE (new tab) ──────────────────────────────────────────────── */}
            <Route path="/marriage/*" element={
              <div className="space-y-6 animate-fade-in">
                <BackButton />
                <div className="flex flex-wrap gap-2 border-b border-gray-700/25 pb-3">
                  {[
                    { id: 'porutham',     labelEn: 'Marriage Porutham',     labelTa: 'திருமணப் பொருத்தம்' },
                    { id: 'porutham-pdf', labelEn: 'Marriage Porutham PDF', labelTa: 'திருமண பொருத்தம் PDF' },
                    { id: 'biodata',      labelEn: 'Biodata Generator',     labelTa: 'பயோடேட்டா தயாரிப்பான்' },
                    { id: 'stars',        labelEn: 'Compatible Stars List', labelTa: 'பொருத்தமான நட்சத்திரங்கள்' },
                  ].map((sub) => (
                    <button key={sub.id} onClick={() => navigate(`/marriage/${sub.id}`)} className={subPillClass(marriageSubTab === sub.id)}>
                      {language === 'ta' ? sub.labelTa : sub.labelEn}
                    </button>
                  ))}
                </div>

                {marriageSubTab === 'porutham'     && <Porutham isLight={isLight}/>}
                {marriageSubTab === 'porutham-pdf' && <MarriagePoruthamPdf isLight={isLight}/>}
                {marriageSubTab === 'stars'        && <StarMarriage language={language} isLight={isLight} />}
                {marriageSubTab === 'biodata' && <BiodataGenerator />}
              </div>
            } />

            {/* ── VEDIC TOOLS (palli, manaiyadi, age only) ───────────────────────── */}
            <Route path="/vedic-tools/*" element={
              <div className="space-y-6 animate-fade-in">
                <BackButton />
                {vedicToolSub === null ? (
                  <div className="space-y-6">
                    <div className="border-b border-gray-700/25 pb-3">
                      <h2 className="text-xl font-serif font-bold text-amber-500">{language === 'ta' ? "வைதீகக் கருவிகள்" : "Vedic Tools"}</h2>
                      <p className={`text-xs mt-1 ${isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>{language === 'ta' ? "பல்லி சாஸ்திரம், மனையடி சாஸ்திரம் மற்றும் வயது கணிப்பான்." : "Lizard omen guide, vastu house measurement calculator, and age calculator."}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'palli',      title: language === 'ta' ? 'பல்லி விழும் பலன்'  : 'Lizard Omen Guide',    desc: language === 'ta' ? 'உடலின் எந்த பகுதியில் பல்லி விழுகிறது என்பதற்கான சுப/அசுப பலன்கள்.' : 'Traditional body-part lizard falling omen outcomes.' },
                        { id: 'manaiyadi', title: language === 'ta' ? 'மனையடி சாஸ்திரம்'  : 'Manaiyadi Shastram',   desc: language === 'ta' ? 'வீட்டு அறை அடி கணக்கின் சுப/அசுப பலன்கள்.' : 'Verify your structural layout measurements for optimal house prosperity.' },
                        { id: 'age',        title: language === 'ta' ? 'வயது கணிப்பான்'     : 'Age Calculator',       desc: language === 'ta' ? 'துல்லியமான வயது, மாதங்கள் மற்றும் நாட்கள் கணக்கீடு.' : 'Find your precise chronological age down to the day.' },
                      ].map((tool) => (
                        <div key={tool.id} onClick={() => navigate(`/vedic-tools/${tool.id}`)} className="glass-panel p-5 rounded-2xl border cursor-pointer hover:scale-[1.01] transition-all space-y-2">
                          <h3 className="text-sm font-serif font-bold text-amber-400">{tool.title}</h3>
                          <p className="text-[11px] text-gray-400 leading-normal">{tool.desc}</p>
                          <div className="text-[9px] font-mono font-bold text-amber-500 tracking-wider pt-2 uppercase">LAUNCH TOOL ✦</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vedicToolSub === 'manaiyadi' && <ManaiyadiShastram language={language} isLight={isLight} />}
                    {vedicToolSub === 'palli'     && <LizardOmens language={language} isLight={isLight} />}
                    {vedicToolSub === 'age'       && <AgeCalculator language={language} />}
                  </div>
                )}
              </div>
            } />

            {/* ── CONSULT EXPERT ────────────────────────────────────────────────── */}
            <Route path="/consult" element={
              <div className="space-y-6 animate-fade-in">
                <BackButton />
                <ConsultExpert walletBalance={walletBalance} onBook={handleBookExpert} onOpenWallet={() => setShowWalletModal(true)} language={language} theme={theme} />
              </div>
            } />

            {/* ── REMEDY SHOP ───────────────────────────────────────────────────── */}
            <Route path="/shop" element={
              <div className="space-y-6 animate-fade-in">
                <BackButton />
                <RemedyShop walletBalance={walletBalance} onPurchase={handlePurchase} onOpenWallet={() => setShowWalletModal(true)} language={language} theme={theme} />
              </div>
            } />

            {/* ── LOGIN / SIGNUP — redirect authenticated users back to home ── */}
            <Route path="/login"  element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />

            {/* ── ADMIN / RETAILER — role-specific dashboards ─────────────────────
                Placeholder targets for the redirect below; replace with the real
                admin/retailer dashboard components when they're wired in. ── */}
            <Route path="/admin/*" element={
                <div className="glass-panel p-6 rounded-2xl border">
                  <AdminDashboardScreen/>
                </div>
            } />
			
			<Route path="/admin/retailer/*" element={RetailerElement} />
			<Route path="/retailer/*" element={RetailerElement} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </main>
      </div>

      <WalletModal isOpen={showWalletModal} onClose={() => setShowWalletModal(false)} onTopUp={handleTopUp} language={language} theme={theme} />
      <ProfileSettingsModal
        user={user}
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSave={async (updates) => {
          if (updateUser) await updateUser(updates);
        }}
        isLight={isLight}
        language={language}
      />
	  <HelpModal
		  visible={showHelpModal}
		  onClose={() => setShowHelpModal(false)}
		  isLight={isLight}
		  language={language}
		/>
      <PasswordResetModal
        user={user}
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        isLight={isLight}
        language={language}
      />
    </div>
  );
}
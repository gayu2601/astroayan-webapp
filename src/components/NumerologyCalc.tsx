import React, { useEffect, useMemo, useRef, useState } from "react";

/* ------------------------------------------------------------------ */
/*  NumerologyCalc — Bilingual Tamil & English Numerology Calculator  */
/*  Supports language ('ta' | 'en') and isLight (boolean) props       */
/* ------------------------------------------------------------------ */

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const IconPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 21s-6.5-6.1-6.5-11A6.5 6.5 0 0 1 12 3.5 6.5 6.5 0 0 1 18.5 10c0 4.9-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);

const IconPrinter = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9V3h12v6" />
    <rect x="4" y="9" width="16" height="8" rx="1.5" />
    <path d="M6 17v4h12v-4" />
  </svg>
);

const IconSpark = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l1.8 5.6L19.5 9l-5.7 1.4L12 16l-1.8-5.6L4.5 9l5.7-1.4L12 2Z" />
    <path d="M19 15l.8 2.4L22 18l-2.2.6L19 21l-.8-2.4L16 18l2.2-.6L19 15Z" />
  </svg>
);

const IconSpinner = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" className="numc-spin">
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
    <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
  </svg>
);

// Chaldean letter values
const CHALDEAN: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

const digitSum = (value: number): number =>
  String(Math.abs(value))
    .split("")
    .reduce((sum, ch) => sum + Number(ch), 0);

const reduceToSingle = (value: number): number => {
  let n = value;
  while (n > 9) n = digitSum(n);
  return n;
};

interface PlaceSuggestion {
  place_id: string;
  description: string;
  lat: number;
  lon: number;
}

async function fetchPlaceSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (!query || query.length < 2) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&limit=5&addressdetails=1`;
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "NumerologyCalcApp/1.0" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map((item: any) => ({
      place_id: item.place_id?.toString() || Math.random().toString(),
      description: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));
  } catch (e) {
    console.error("Location suggestion error:", e);
    return [];
  }
}

type NumMeta = {
  planetTa: string;
  planetEn: string;
  directionTa: string;
  directionEn: string;
  colorTa: string;
  colorEn: string;
  friends: number[];
  enemies: number[];
  lifeMeaningTa: string;
  lifeMeaningEn: string;
  destinyMeaningTa: string;
  destinyMeaningEn: string;
  letterMeaningTa: string;
  letterMeaningEn: string;
};

const NUMBER_DATA: Record<number, NumMeta> = {
  1: {
    planetTa: "சூரியன்",
    planetEn: "Sun",
    directionTa: "கிழக்கு",
    directionEn: "East",
    colorTa: "தங்கம் / ஆரஞ்சு நிறம்",
    colorEn: "Gold / Bright Orange",
    friends: [1, 2, 3, 9],
    enemies: [4, 8],
    lifeMeaningTa:
      "தன்னம்பிக்கையும் தலைமைத்துவ குணமும் மிக்கவர். புதிய முயற்சிகளில் முன்னின்று செயல்படுவார்கள். சுயமாக முடிவெடுத்து வெற்றி காணும் ஆற்றல் உண்டு.",
    lifeMeaningEn:
      "Possesses radiant confidence, ambition, and organic leadership. Naturally pioneers new ventures and excels through independent decision making.",
    destinyMeaningTa:
      "தலைமைத்துவப் பொறுப்புகளும் சுயமாக நிறுவனம் அமைக்கும் வாய்ப்பும் கிடைக்கும். சுயமுயற்சியால் உயர்ந்த அந்தஸ்து பெறுவீர்கள்.",
    destinyMeaningEn:
      "Endowed with executive positions and the capability to build self-directed institutions. Attains elevated social status through sheer self-reliance.",
    letterMeaningTa: "தலைமைத்துவ குணம் கொண்டவர். புதிய முயற்சிகளில் முன்னின்று செயல்படுவார்கள்.",
    letterMeaningEn: "Natural leader and pioneer. Always steps forward to spearhead new initiatives.",
  },
  2: {
    planetTa: "சந்திரன்",
    planetEn: "Moon",
    directionTa: "மேற்கு",
    directionEn: "West",
    colorTa: "வெண்மை நிறம்",
    colorEn: "Pure White / Pearl Cream",
    friends: [1, 2, 7],
    enemies: [4, 8, 9],
    lifeMeaningTa:
      "வருங்காலத்தை அறியும் ஆற்றல் படைத்தவர்கள். சிறந்த ஜோதிடராகவும் மருத்துவராகவும் புகழ்பெறும் வாய்ப்புடையவர்கள். மக்களின் மனதை அறிந்து செயல்படும் ஆற்றல் மிக்கவர்.",
    lifeMeaningEn:
      "Blessed with acute intuition, empathy, and artistic vision. Excels in psychological insight, medicine, counseling, and diplomacy.",
    destinyMeaningTa:
      "கூட்டாண்மை, ஆலோசனை, கலைத் துறைகளில் வெற்றி பெறுவீர்கள். பொறுமையும் ஒத்துழைப்பும் நல்ல பலன் தரும்.",
    destinyMeaningEn:
      "Thrives in collaborative partnerships, advisory roles, and creative arts. Gentle perseverance yields exceptional harmony and success.",
    letterMeaningTa: "அமைதியான, கவனமுள்ள குணம் கொண்டவர். மற்றவர்களுடன் இணக்கமாக பழகுவார்கள்.",
    letterMeaningEn: "Calm, thoughtful, and accommodating disposition. Harmonizes effortlessly with peers.",
  },
  3: {
    planetTa: "குரு",
    planetEn: "Jupiter",
    directionTa: "வடகிழக்கு",
    directionEn: "North-East",
    colorTa: "மஞ்சள் நிறம்",
    colorEn: "Radiant Yellow / Saffron",
    friends: [1, 3, 6, 9],
    enemies: [4, 8],
    lifeMeaningTa:
      "சிந்தனையாளர். தன்னம்பிக்கை கொண்ட சிந்தனையும், எதிர்காலத்தில் முன்னேறத் துடிக்கும் செயலும் உடையவர். கல்வியிலும் அறிவுத் தேடலிலும் சிறந்து விளங்குவார்கள்.",
    lifeMeaningEn:
      "Intellectual, philosophically gifted, and visionary. Driven by self-confidence and knowledge expansion with lifelong devotion to learning.",
    destinyMeaningTa:
      "கல்வி, ஆசிரியப் பணி, சட்டம் அல்லது ஆன்மீகத் துறையில் சிறப்பு பெறுவீர்கள். அறிவுத் தேடலால் மதிப்பு உயரும்.",
    destinyMeaningEn:
      "Attains distinguished honors in academia, pedagogy, law, consulting, and spiritual philosophy.",
    letterMeaningTa:
      "சிந்தனையாளர். தன்னம்பிக்கை கொண்ட சிந்தனையும், எதிர்காலத்தில் முன்னேறத் துடிக்கும் செயலும் உடையவர்.",
    letterMeaningEn:
      "Deep thinker with an inspiring personality, forward-looking mind, and strong moral convictions.",
  },
  4: {
    planetTa: "ராகு",
    planetEn: "Rahu",
    directionTa: "தெற்கு",
    directionEn: "South",
    colorTa: "நீலம் / சாம்பல் நிறம்",
    colorEn: "Electric Blue / Charcoal Grey",
    friends: [1, 5, 6, 7],
    enemies: [2, 3, 8, 9],
    lifeMeaningTa:
      "கடின உழைப்பாளிகள். திட்டமிட்டு செயல்படும் குணம் கொண்டவர்கள். சவால்களை எதிர்கொண்டு முன்னேறும் மனோபலம் மிக்கவர்.",
    lifeMeaningEn:
      "Systematic, resilient, and relentlessly hardworking. Pragmatic planner capable of overcoming daunting odds through sheer grit.",
    destinyMeaningTa:
      "நிலையான உழைப்பின் மூலம் படிப்படியாக முன்னேற்றம் காண்பீர்கள். நிர்வாகம், பொறியியல் தொழில்களில் வெற்றி உண்டு.",
    destinyMeaningEn:
      "Builds lasting prosperity through steady dedication. Achieves mastery in management, engineering, technology, and administration.",
    letterMeaningTa: "நடைமுறை அறிவும் உறுதியான குணமும் கொண்டவர். கடின உழைப்பில் நம்பிக்கை வைப்பவர்.",
    letterMeaningEn: "Pragmatic, steadfast, and grounded. Places unshakable faith in disciplined work ethic.",
  },
  5: {
    planetTa: "புதன்",
    planetEn: "Mercury",
    directionTa: "வடக்கு",
    directionEn: "North",
    colorTa: "இலைப்பச்சை நிறம்",
    colorEn: "Emerald Green",
    friends: [1, 4, 5, 6, 7],
    enemies: [2],
    lifeMeaningTa:
      "விரைவாக முடிவெடுக்கும் திறனும் தொடர்பு ஆற்றலும் மிக்கவர். புதிய இடங்கள், மாற்றங்கள் மற்றும் பயணங்களில் ஆர்வம் கொண்டவர்கள்.",
    lifeMeaningEn:
      "Quick-witted, highly articulate, and adaptable. Loves intellectual versatility, commerce, rapid innovation, and travel.",
    destinyMeaningTa:
      "உயர்கல்வி, பட்டம், அதனால் உயர்நிலை பெறும் நிலை இவற்றைத் தரும். தொடர்பு, ஊடகம், வர்த்தகத் துறைகளில் சிறப்பு உண்டு.",
    destinyMeaningEn:
      "Grants academic laurels and commercial triumphs. Uniquely excels in media, communication, business enterprise, and technology.",
    letterMeaningTa: "புத்திசாலித்தனமும் விரைவான புரிதலும் கொண்டவர். புதிய விஷயங்களை எளிதில் கற்றுக்கொள்வார்கள்.",
    letterMeaningEn: "Sharp intellect and rapid comprehension. Masters novel concepts with extraordinary agility.",
  },
  6: {
    planetTa: "சுக்கிரன்",
    planetEn: "Venus",
    directionTa: "தென்கிழக்கு",
    directionEn: "South-East",
    colorTa: "வெள்ளை / இளநீல நிறம்",
    colorEn: "Sparkling White / Sky Blue",
    friends: [1, 3, 4, 6, 9],
    enemies: [2, 5],
    lifeMeaningTa:
      "அழகியல் உணர்வும் அன்பான குணமும் மிக்கவர். குடும்பத்தையும் உறவுகளையும் மதிக்கும் தன்மை உடையவர்கள். கலை, அழகியல் துறைகளில் சிறந்து விளங்குவார்கள்.",
    lifeMeaningEn:
      "Magnetic, charming, refined, and deeply affectionate. Deeply values domestic bliss, artistic aesthetics, luxury, and social warmth.",
    destinyMeaningTa:
      "குடும்பம், அழகுசாதனம், கலை, திருமணம் தொடர்பான துறைகளில் மகிழ்ச்சியும் வெற்றியும் கிடைக்கும்.",
    destinyMeaningEn:
      "Blessed with domestic prosperity and happiness. Flourishes in luxury goods, creative arts, hospitality, and design.",
    letterMeaningTa: "அன்பான, பொறுப்புள்ள குணம் கொண்டவர். குடும்பத்தையும் நண்பர்களையும் நேசிப்பார்கள்.",
    letterMeaningEn: "Loving, responsible, and devoted. Cherishes deep bonds with family and friends.",
  },
  7: {
    planetTa: "கேது",
    planetEn: "Ketu",
    directionTa: "வடமேற்கு",
    directionEn: "North-West",
    colorTa: "கடல்பச்சை நிறம்",
    colorEn: "Sea Green / Smokey Quartz",
    friends: [1, 2, 4, 5],
    enemies: [8, 9],
    lifeMeaningTa:
      "ஆழ்ந்த சிந்தனையும் ஆன்மீக நாட்டமும் கொண்டவர்கள். தனிமையில் இருந்து சிந்திக்க விரும்புவார்கள். ஆராய்ச்சி, ஆன்மீகத் துறைகளில் சிறந்து விளங்குவார்கள்.",
    lifeMeaningEn:
      "Profound philosophical thinker with mystical inclinations. Loves contemplative solitude, deep analytical research, and esoteric wisdom.",
    destinyMeaningTa:
      "ஆராய்ச்சி, ஆன்மீகம், மருத்துவம் தொடர்பான துறைகளில் புகழ் பெறுவீர்கள். தனித்துவமான பாதையில் வெற்றி காண்பீர்கள்.",
    destinyMeaningEn:
      "Earns distinction in scholarly research, spiritual mysticism, and healing sciences by walking an authentically unique path.",
    letterMeaningTa: "ஆழ்ந்த சிந்தனை உடையவர். தனிமையில் இருந்து யோசிக்க விரும்புவார்கள்.",
    letterMeaningEn: "Reflective and introspective nature. Finds wisdom in peaceful contemplation.",
  },
  8: {
    planetTa: "சனி",
    planetEn: "Saturn",
    directionTa: "மேற்கு",
    directionEn: "West",
    colorTa: "கருமை / நீல நிறம்",
    colorEn: "Deep Midnight Blue / Black",
    friends: [1, 5, 6],
    enemies: [2, 3, 4, 7, 9],
    lifeMeaningTa:
      "கடின உழைப்பின் மூலம் வெற்றி காணும் தன்மை உடையவர்கள். பொறுப்புணர்வும் நிர்வாகத் திறனும் மிக்கவர். வாழ்க்கையில் ஏற்ற இறக்கங்களை சமாளிக்கும் மனோபலம் கொண்டவர்கள்.",
    lifeMeaningEn:
      "Resilient powerhouse who achieves monumental heights through patience. Endowed with immense administrative stamina and perseverance.",
    destinyMeaningTa:
      "நிதி, நிர்வாகம், அரசியல் தொடர்பான துறைகளில் அதிகாரமும் செல்வாக்கும் பெறுவீர்கள். கடின உழைப்பு நல்ல பலன் தரும்.",
    destinyMeaningEn:
      "Attains substantial authority and financial mastery in governance, industrial administration, and corporate finance.",
    letterMeaningTa: "நிர்வாகத் திறனும் இலக்கு நோக்கிய குணமும் கொண்டவர். கடின உழைப்பால் வெற்றி காண்பார்கள்.",
    letterMeaningEn: "Executive strategist driven by clear objectives. Builds substantial success through diligent perseverance.",
  },
  9: {
    planetTa: "செவ்வாய்",
    planetEn: "Mars",
    directionTa: "தெற்கு",
    directionEn: "South",
    colorTa: "சிவப்பு நிறம்",
    colorEn: "Crimson Red",
    friends: [1, 2, 3, 6],
    enemies: [4, 7],
    lifeMeaningTa:
      "தைரியமும் போராடும் குணமும் மிக்கவர். மனிதநேயப் பணிகளில் ஆர்வம் கொண்டவர்கள். தலைமைத்துவமும் துணிச்சலும் நிறைந்தவர்கள்.",
    lifeMeaningEn:
      "Courageous, bold, and fiercely protective. Passionate humanitarian warrior dedicated to justice, defense, and uplifting others.",
    destinyMeaningTa:
      "சேவைத் துறை, மனிதநேயப் பணிகள், இராணுவம் தொடர்பான பணிகளில் புகழும் அங்கீகாரமும் கிடைக்கும்.",
    destinyMeaningEn:
      "Earns public respect in public service, social justice, military defense, engineering, and humanitarian leadership.",
    letterMeaningTa: "இரக்க குணமும் தைரியமும் கொண்டவர். மற்றவர்களுக்கு உதவும் மனப்பான்மை உடையவர்.",
    letterMeaningEn: "Compassionate bravery. Eager to defend and support others in need.",
  },
};

const MONTHS_TA = [
  "ஜனவரி", "பிப்ரவரி", "மார்ச்", "ஏப்ரல்", "மே", "ஜூன்",
  "ஜூலை", "ஆகஸ்ட்", "செப்டம்பர்", "அக்டோபர்", "நவம்பர்", "டிசம்பர்",
];

const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface FormState {
  name: string;
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  ampm: "AM" | "PM";
  place: string;
  placeLat: number | null;
  placeLon: number | null;
}

interface ResultState {
  input: FormState;
  lifeNumber: number;
  destinyNumber: number;
  nameNumber: number;
  firstLetter: string;
}

function calculate(form: FormState): ResultState {
  const lifeNumber = reduceToSingle(form.day);

  const dateDigits = `${form.day}${form.month}${form.year}`
    .split("")
    .reduce((sum, ch) => sum + Number(ch), 0);
  const destinyNumber = reduceToSingle(dateDigits);

  const cleanedName = form.name.toUpperCase().replace(/[^A-Z]/g, "");
  const nameSum = cleanedName
    .split("")
    .reduce((sum, ch) => sum + (CHALDEAN[ch] || 0), 0);
  const nameNumber = nameSum > 0 ? reduceToSingle(nameSum) : 0;

  const firstLetter = cleanedName.charAt(0) || "-";

  return { input: form, lifeNumber, destinyNumber, nameNumber, firstLetter };
}

export interface NumerologyCalcProps {
  language?: 'ta' | 'en';
  isLight?: boolean;
}

export default function NumerologyCalc({
  language = 'ta',
  isLight = false,
}: NumerologyCalcProps) {
  const isTa = language === 'ta';
  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState<FormState>({
    name: "",
    day: 1,
    month: 1,
    year: currentYear - 25,
    hour: 6,
    minute: 0,
    ampm: "PM",
    place: "",
    placeLat: null,
    placeLon: null,
  });

  const [result, setResult] = useState<ResultState | null>(null);

  // Location autocomplete
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loadingPlace, setLoadingPlace] = useState(false);
  const [openPlace, setOpenPlace] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const placeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (placeDropdownRef.current && !placeDropdownRef.current.contains(e.target as Node)) {
        setOpenPlace(false);
        setPlaceSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePlaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setForm((f) => ({ ...f, place: text, placeLat: null, placeLon: null }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text) {
      setPlaceSuggestions([]);
      setOpenPlace(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoadingPlace(true);
      const results = await fetchPlaceSuggestions(text);
      setPlaceSuggestions(results);
      setOpenPlace(results.length > 0);
      setLoadingPlace(false);
    }, 400);
  };

  const handleSelectPlace = (item: PlaceSuggestion) => {
    setForm((f) => ({ ...f, place: item.description, placeLat: item.lat, placeLon: item.lon }));
    setPlaceSuggestions([]);
    setOpenPlace(false);
  };

  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = currentYear + 1; y >= 1930; y--) arr.push(y);
    return arr;
  }, [currentYear]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(calculate(form));
  };

  const handlePrint = () => window.print();

  const life = result ? NUMBER_DATA[result.lifeNumber] : null;
  const destiny = result ? NUMBER_DATA[result.destinyNumber] : null;
  const letterMeta = result ? NUMBER_DATA[CHALDEAN[result.firstLetter] || 0] : null;

  const nameConflicts =
    result && destiny && result.nameNumber
      ? destiny.enemies.includes(result.nameNumber)
      : false;

  const favorableYears = result
    ? Array.from({ length: 5 }, (_, i) => result.input.year + result.destinyNumber * (i + 1))
    : [];

  const monthNames = isTa ? MONTHS_TA : MONTHS_EN;

  return (
    <div className={`numc-root ${isLight ? 'numc-theme-light' : 'numc-theme-dark'}`}>
      <style>{`
        .numc-root {
          font-family: 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 680px;
          margin: 0 auto;
          transition: all 0.2s ease-in-out;
        }
        .numc-theme-light {
          --numc-bg: #FFFDF7;
          --numc-card-bg: #FFFFFF;
          --numc-border: #E5D9C5;
          --numc-text: #2C241E;
          --numc-muted: #7A695A;
          --numc-accent: #0B3D2E;
          --numc-accent-grad: linear-gradient(135deg, #0B3D2E, #145C45);
          --numc-gold: #C99A2E;
          --numc-input-bg: #FBF9F2;
          --numc-box-bg: #F9F6ED;
          --numc-box-gold: #FDF8E8;
          --numc-box-pink: #FDF2F4;
        }
        .numc-theme-dark {
          --numc-bg: #0B111A;
          --numc-card-bg: #0F172A;
          --numc-border: #1E293B;
          --numc-text: #F1F5F9;
          --numc-muted: #94A3B8;
          --numc-accent: #10B981;
          --numc-accent-grad: linear-gradient(135deg, #064E3B, #047857);
          --numc-gold: #F59E0B;
          --numc-input-bg: #1E293B;
          --numc-box-bg: #1E293B;
          --numc-box-gold: #2A2415;
          --numc-box-pink: #2D1A22;
        }
        .numc-card {
          background: var(--numc-card-bg);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.12);
          border: 1px solid var(--numc-border);
          border-top: 5px solid var(--numc-gold);
        }
        .numc-header {
          background: var(--numc-accent-grad);
          color: #FDF6E3;
          padding: 22px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .numc-header h1 {
          font-weight: 800;
          font-size: 1.25rem;
          margin: 0;
          letter-spacing: 0.2px;
        }
        .numc-body {
          padding: 24px;
          color: var(--numc-text);
        }
        .numc-form { display: flex; flex-direction: column; gap: 6px; }
        .numc-label { font-weight: 600; font-size: 0.92rem; margin-top: 14px; color: var(--numc-text); }
        .numc-group-label { font-weight: 700; font-size: 0.95rem; margin-top: 18px; color: var(--numc-text); }
        .numc-input-icon {
          display: flex; align-items: center; gap: 10px;
          border: 1.5px solid var(--numc-border); border-radius: 12px;
          padding: 11px 14px; background: var(--numc-input-bg); margin-top: 4px;
        }
        .numc-input-icon svg { color: var(--numc-gold); flex-shrink: 0; }
        .numc-input-icon input {
          border: none; outline: none; background: transparent;
          width: 100%; font-size: 0.95rem; font-family: inherit; color: var(--numc-text);
        }
        .numc-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 6px; }
        .numc-field {
          border: 1.5px solid var(--numc-border); border-radius: 12px; background: var(--numc-input-bg);
          padding: 8px 12px; display: flex; flex-direction: column; gap: 2px;
        }
        .numc-field select {
          border: none; background: transparent; font-size: 1rem; font-weight: 700;
          color: var(--numc-text); font-family: inherit; outline: none;
        }
        .numc-field span { font-size: 0.72rem; color: var(--numc-muted); }
        .numc-time-row { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
        .numc-time-row select {
          border: 1.5px solid var(--numc-border); border-radius: 12px; background: var(--numc-input-bg);
          padding: 10px 12px; font-size: 0.95rem; font-weight: 700; color: var(--numc-text);
          font-family: inherit; outline: none;
        }
        .numc-colon { font-weight: 800; color: var(--numc-text); }
        .numc-ampm { display: flex; border: 1.5px solid var(--numc-border); border-radius: 12px; overflow: hidden; margin-left: auto; }
        .numc-ampm button {
          border: none; background: var(--numc-input-bg); padding: 10px 16px; font-weight: 700;
          font-family: inherit; cursor: pointer; color: var(--numc-muted);
        }
        .numc-ampm button.active { background: var(--numc-gold); color: #FFF; }
        .numc-place-wrap { position: relative; margin-top: 4px; }
        .numc-place-wrap .numc-input-icon { margin-top: 0; }
        .numc-place-spinner { margin-left: auto; color: var(--numc-gold); display: flex; }
        .numc-spin { animation: numc-rotate 0.8s linear infinite; }
        @keyframes numc-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .numc-suggestions {
          position: absolute; z-index: 50; top: calc(100% + 6px); left: 0; right: 0;
          background: var(--numc-card-bg); border: 1px solid var(--numc-border); border-radius: 12px;
          box-shadow: 0 12px 30px rgba(0,0,0,0.2); list-style: none;
          margin: 0; padding: 6px; max-height: 220px; overflow-y: auto;
        }
        .numc-suggestions li {
          display: flex; align-items: flex-start; gap: 8px; padding: 9px 12px;
          border-radius: 8px; cursor: pointer; font-size: 0.85rem; color: var(--numc-text);
          line-height: 1.35;
        }
        .numc-suggestions li:hover { background: var(--numc-input-bg); }
        .numc-suggestions li svg { color: var(--numc-gold); flex-shrink: 0; margin-top: 2px; }

        .numc-submit {
          margin-top: 24px; background: var(--numc-accent-grad);
          color: #FFF; border: none; border-radius: 14px; padding: 14px;
          font-size: 1rem; font-weight: 800; font-family: inherit; cursor: pointer;
          letter-spacing: 0.3px; transition: transform 0.1s, opacity 0.2s;
        }
        .numc-submit:hover { opacity: 0.95; transform: scale(1.005); }

        .numc-actions { display: flex; gap: 12px; margin-bottom: 20px; }
        .numc-secondary {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          border: 1.5px solid var(--numc-border); background: var(--numc-card-bg); color: var(--numc-text);
          border-radius: 12px; padding: 11px; font-weight: 700; font-family: inherit; cursor: pointer;
          font-size: 0.88rem; transition: background 0.2s;
        }
        .numc-secondary:hover { background: var(--numc-input-bg); }
        .numc-print-btn { background: var(--numc-accent); color: #FFF; border-color: var(--numc-accent); }
        .numc-print-btn:hover { opacity: 0.92; }

        .numc-summary {
          display: flex; flex-direction: column; gap: 4px; margin-bottom: 20px;
          padding: 12px 16px; background: var(--numc-input-bg); border-radius: 12px; border: 1px solid var(--numc-border);
        }
        .numc-summary strong { color: var(--numc-text); font-size: 1.05rem; }
        .numc-summary span { font-size: 0.84rem; color: var(--numc-muted); }

        .numc-h2 { font-weight: 800; color: var(--numc-text); font-size: 1.2rem; margin: 8px 0 14px; }
        .numc-h3 {
          font-weight: 700; color: var(--numc-text); font-size: 1.02rem;
          margin: 24px 0 10px; border-bottom: 2px solid var(--numc-border); padding-bottom: 6px;
        }

        .numc-numcards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .numc-card-blue, .numc-card-gold, .numc-card-purple {
          grid-column: span 1; border-radius: 14px; padding: 16px; text-align: center; border: 1px solid transparent;
        }
        .numc-card-purple { grid-column: 1 / span 2; }
        
        .numc-theme-light .numc-card-blue { background: #EAF1FB; border-color: #C7DCFA; }
        .numc-theme-light .numc-card-gold { background: #FDF6E2; border-color: #F8E5A8; }
        .numc-theme-light .numc-card-purple { background: #F4EBFB; border-color: #E2C7FA; }
        
        .numc-theme-dark .numc-card-blue { background: #132742; border-color: #1E3A5F; }
        .numc-theme-dark .numc-card-gold { background: #2B2312; border-color: #4A3A1A; }
        .numc-theme-dark .numc-card-purple { background: #261633; border-color: #452461; }

        .numc-card-blue span, .numc-card-gold span, .numc-card-purple span {
          display: block; font-size: 0.86rem; margin-bottom: 6px; font-weight: 600; opacity: 0.85;
        }
        .numc-card-blue strong { font-size: 1.9rem; color: #3B82F6; }
        .numc-card-gold strong { font-size: 1.9rem; color: #F59E0B; }
        .numc-card-purple strong { font-size: 1.9rem; color: #A855F7; }

        .numc-note { border-radius: 12px; padding: 14px 16px; font-size: 0.9rem; line-height: 1.5; margin-bottom: 16px; }
        .numc-note-good {
          background: rgba(16, 185, 129, 0.12);
          color: #10B981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .numc-note-bad {
          background: rgba(239, 68, 68, 0.12);
          color: #EF4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .numc-box {
          background: var(--numc-box-bg); border-radius: 12px; padding: 16px;
          font-size: 0.92rem; line-height: 1.65; border: 1px solid var(--numc-border);
        }
        .numc-box p { margin: 0 0 10px; }
        .numc-box p:last-child { margin-bottom: 0; }
        .numc-box-gold { background: var(--numc-box-gold); }
        .numc-box-pink { background: var(--numc-box-pink); }

        .numc-table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
        .numc-table td { padding: 11px 8px; border-bottom: 1px solid var(--numc-border); }
        .numc-table td:first-child { color: var(--numc-muted); width: 52%; }
        .numc-good-num { color: #10B981; font-weight: 700; }
        .numc-bad-num { color: #EF4444; font-weight: 700; }

        .numc-years { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .numc-year-pill {
          background: var(--numc-accent); color: #FFF;
          border-radius: 999px; padding: 6px 14px; font-weight: 700; font-size: 0.88rem;
        }

        .numc-inline-note { margin-top: 8px; font-size: 0.9rem; font-weight: 600; }

        @media print {
          body * { visibility: hidden; }
          .numc-print-area, .numc-print-area * { visibility: visible; }
          .numc-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .numc-no-print { display: none !important; }
          .numc-card { box-shadow: none; border: none; }
        }
      `}</style>

      <div className="numc-card">
        <div className="numc-header">
          <IconSpark />
          <h1>{isTa ? "தமிழ் நியூமராலஜி கணிப்பு" : "Tamil Vedic Numerology Report"}</h1>
        </div>

        <div className="numc-body">
          {!result && (
            <form className="numc-form" onSubmit={handleSubmit}>
              <label className="numc-label" htmlFor="numc-name">
                {isTa ? "பெயர் (Name)" : "Full Name"}
              </label>
              <div className="numc-input-icon">
                <IconUser />
                <input
                  id="numc-name"
                  type="text"
                  placeholder={isTa ? "உங்கள் பெயர் (ஆங்கில எழுத்தில், எ.கா. Kumar)" : "Your name (in English, e.g. Kumar)"}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="numc-group-label">
                {isTa ? "பிறந்த தேதி" : "Date of Birth"}
              </div>
              <div className="numc-row3">
                <div className="numc-field">
                  <select
                    value={form.day}
                    onChange={(e) => setForm({ ...form, day: Number(e.target.value) })}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <span>{isTa ? "தேதி" : "Day"}</span>
                </div>
                <div className="numc-field">
                  <select
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                  >
                    {monthNames.map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <span>{isTa ? "மாதம்" : "Month"}</span>
                </div>
                <div className="numc-field">
                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <span>{isTa ? "வருடம்" : "Year"}</span>
                </div>
              </div>

              <div className="numc-group-label">
                {isTa ? "பிறந்த நேரம்" : "Time of Birth"}
              </div>
              <div className="numc-time-row">
                <select
                  value={form.hour}
                  onChange={(e) => setForm({ ...form, hour: Number(e.target.value) })}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={h}>{String(h).padStart(2, "0")}</option>
                  ))}
                </select>
                <span className="numc-colon">:</span>
                <select
                  value={form.minute}
                  onChange={(e) => setForm({ ...form, minute: Number(e.target.value) })}
                >
                  {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                    <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                  ))}
                </select>
                <div className="numc-ampm">
                  <button
                    type="button"
                    className={form.ampm === "AM" ? "active" : ""}
                    onClick={() => setForm({ ...form, ampm: "AM" })}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    className={form.ampm === "PM" ? "active" : ""}
                    onClick={() => setForm({ ...form, ampm: "PM" })}
                  >
                    PM
                  </button>
                </div>
              </div>

              <label className="numc-label" htmlFor="numc-place">
                {isTa ? "பிறந்த இடம்" : "Place of Birth"}
              </label>
              <div className="numc-place-wrap" ref={placeDropdownRef}>
                <div className="numc-input-icon">
                  <IconPin />
                  <input
                    id="numc-place"
                    type="text"
                    placeholder={isTa ? "ஊரைத் தேடுங்கள்..." : "Search city or town..."}
                    value={form.place}
                    onChange={handlePlaceChange}
                    onFocus={() => placeSuggestions.length > 0 && setOpenPlace(true)}
                    autoComplete="off"
                  />
                  {loadingPlace && (
                    <span className="numc-place-spinner">
                      <IconSpinner />
                    </span>
                  )}
                </div>
                {openPlace && placeSuggestions.length > 0 && (
                  <ul className="numc-suggestions">
                    {placeSuggestions.map((item) => (
                      <li key={item.place_id} onClick={() => handleSelectPlace(item)}>
                        <IconPin />
                        <span>{item.description}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button type="submit" className="numc-submit">
                {isTa ? "நியூமராலஜி பலன் காண" : "Generate Numerology Report"}
              </button>
            </form>
          )}

          {result && life && destiny && (
            <div className="numc-print-area">
              <div className="numc-actions numc-no-print">
                <button className="numc-secondary" onClick={() => setResult(null)}>
                  <IconEdit /> {isTa ? "மீண்டும் கணிக்க" : "Recalculate"}
                </button>
                <button className="numc-secondary numc-print-btn" onClick={handlePrint}>
                  <IconPrinter /> {isTa ? "PDF ஆக பதிவிறக்கம்" : "Print / Save as PDF"}
                </button>
              </div>

              <div className="numc-summary">
                <strong>{result.input.name || "—"}</strong>
                <span>
                  {result.input.day} {monthNames[result.input.month - 1]} {result.input.year} ·{" "}
                  {String(result.input.hour).padStart(2, "0")}:{String(result.input.minute).padStart(2, "0")}{" "}
                  {result.input.ampm}
                  {result.input.place ? ` · ${result.input.place}` : ""}
                </span>
              </div>

              <h2 className="numc-h2">
                {isTa ? "உங்கள் நியூமராலஜி பலன்கள்" : "Your Numerological Insights"}
              </h2>
              <div className="numc-numcards">
                <div className="numc-card-blue">
                  <span>{isTa ? "உயிர் எண் (Life Number)" : "Life Number"}</span>
                  <strong>{result.lifeNumber}</strong>
                </div>
                <div className="numc-card-gold">
                  <span>{isTa ? "விதி எண் (Destiny Number)" : "Destiny Number"}</span>
                  <strong>{result.destinyNumber}</strong>
                </div>
                <div className="numc-card-purple">
                  <span>{isTa ? "பெயரெண் (Name Number)" : "Name Number"}</span>
                  <strong>{result.nameNumber || "-"}</strong>
                </div>
              </div>

              <div className={nameConflicts ? "numc-note numc-note-bad" : "numc-note numc-note-good"}>
                {nameConflicts ? (
                  isTa ? (
                    <>உங்கள் பெயரெண் ({result.nameNumber}) உங்கள் விதி எண்ணின் ({result.destinyNumber}) பகை எண்களில் ஒன்று. பெயர் எழுத்துக்களை மாற்றி சரிசெய்ய பரிந்துரைக்கப்படுகிறது.</>
                  ) : (
                    <>Your name number ({result.nameNumber}) is in conflict with your destiny number ({result.destinyNumber}). A slight name spelling adjustment is recommended for smoother success.</>
                  )
                ) : (
                  isTa ? (
                    <>உங்கள் பெயரெண் பாதுகாப்பானது. உங்கள் விதி எண்ணுடன் ({result.destinyNumber}) முரண்படவில்லை.</>
                  ) : (
                    <>Your name number ({result.nameNumber}) is harmonious and does not conflict with your destiny number ({result.destinyNumber}).</>
                  )
                )}
              </div>

              <h3 className="numc-h3">
                {isTa ? `நீங்கள் பிறந்த தேதிக்கான பலன்கள் (தேதி: ${result.input.day})` : `Birth Day Reading (Day: ${result.input.day})`}
              </h3>
              <div className="numc-box">
                {isTa ? life.lifeMeaningTa : life.lifeMeaningEn}
              </div>

              <h3 className="numc-h3">
                {isTa ? `உங்கள் விதி எண்ணின் பலன் (எண்: ${result.destinyNumber})` : `Destiny Number Significance (Number: ${result.destinyNumber})`}
              </h3>
              <div className="numc-box numc-box-gold">
                {isTa ? destiny.destinyMeaningTa : destiny.destinyMeaningEn}
              </div>

              <h3 className="numc-h3">
                {isTa ? `உங்கள் அதிர்ஷ்ட விபரங்கள் (விதி எண்: ${result.destinyNumber})` : `Favorable Astro-Numerology Factors (Destiny: ${result.destinyNumber})`}
              </h3>
              <table className="numc-table">
                <tbody>
                  <tr>
                    <td>{isTa ? "ஆளுமை கிரகம்" : "Ruling Planet"}</td>
                    <td><strong>{isTa ? destiny.planetTa : destiny.planetEn}</strong></td>
                  </tr>
                  <tr>
                    <td>{isTa ? "அதிர்ஷ்ட திசை" : "Fortunate Direction"}</td>
                    <td>{isTa ? destiny.directionTa : destiny.directionEn}</td>
                  </tr>
                  <tr>
                    <td>{isTa ? "அதிர்ஷ்ட நிறங்கள்" : "Lucky Colors"}</td>
                    <td>{isTa ? destiny.colorTa : destiny.colorEn}</td>
                  </tr>
                  <tr>
                    <td>{isTa ? "நட்பு எண்கள் (பயன்படுத்தலாம்)" : "Friendly Harmonious Numbers"}</td>
                    <td className="numc-good-num">{destiny.friends.join(", ")}</td>
                  </tr>
                  <tr>
                    <td>{isTa ? "பகை எண்கள் (தவிர்க்கவும்)" : "Conflicting Numbers (Avoid)"}</td>
                    <td className="numc-bad-num">{destiny.enemies.join(", ")}</td>
                  </tr>
                </tbody>
              </table>

              {letterMeta && result.firstLetter !== "-" && (
                <>
                  <h3 className="numc-h3">
                    {isTa ? `பெயரின் முதல் எழுத்து பலன் ('${result.firstLetter}')` : `First Letter Vibration ('${result.firstLetter}')`}
                  </h3>
                  <div className="numc-box numc-box-pink">
                    {isTa ? letterMeta.letterMeaningTa : letterMeta.letterMeaningEn}
                  </div>
                </>
              )}

              <h3 className="numc-h3">
                {isTa ? "உங்களுக்கு யோகம் தரும் நன்மையான ஆண்டுகள்" : "Fortunate Landmark Years"}
              </h3>
              <div className="numc-box">
                {isTa
                  ? "உங்கள் பிறந்த ஆண்டு மற்றும் விதி எண்ணின் அடிப்படையில், உங்களுக்கு நன்மையான பலன்கள் நடைபெறும் வாய்ப்புள்ள ஆண்டுகள்:"
                  : "Based on your birth year and destiny number cycle, key years for milestone opportunities and growth:"}
                <div className="numc-years">
                  {favorableYears.map((y) => (
                    <span key={y} className="numc-year-pill">{y}</span>
                  ))}
                </div>
              </div>

              <h3 className="numc-h3">
                {isTa ? "அதிர்ஷ்ட வாகன & மொபைல் எண்கள்" : "Vehicle & Mobile Number Selection"}
              </h3>
              <div className="numc-box">
                <p>
                  <strong>{isTa ? "வாகன எண் அமைப்பு: " : "Vehicle Registration: "}</strong>
                  {isTa
                    ? "கார் அல்லது இருசக்கர வாகனத்தின் பதிவு எண்ணைக் கூட்டினால் (ஆங்கில எழுத்துக்களின் எண்களையும் சேர்த்து) வரும் இறுதி ஒற்றைப்படை எண், உங்கள் நட்பு எண்களில் ஒன்றாக இருக்க வேண்டும்."
                    : "The cumulative single-digit sum of your vehicle registration plate should reduce to one of your friendly numbers."}
                </p>
                <p>
                  <strong>{isTa ? "மொபைல் / டெலிபோன் எண்: " : "Mobile / Phone Number: "}</strong>
                  {isTa
                    ? "உங்கள் மொபைல் எண்ணின் அனைத்து இலக்கங்களையும் கூட்டினால் வரும் ஒற்றைப்படை எண் உங்கள் நட்பு எண்ணாக அமைவது சிறப்பு."
                    : "All digits of your mobile number summed together to a single digit should align with your friendly numbers for harmonious communication."}
                </p>
                <div className="numc-inline-note">
                  {isTa ? "தேர்ந்தெடுக்க வேண்டிய கூட்டு எண்கள்: " : "Recommended Cumulative Numbers: "}
                  <strong>{destiny.friends.join(", ")}</strong>
                </div>
              </div>

              <h3 className="numc-h3">
                {isTa ? "வாழ்க்கைத் துணை & தொழில் கூட்டாளி பொருத்தம்" : "Life Partner & Business Partner Compatibility"}
              </h3>
              <div className="numc-box numc-box-pink">
                <p>
                  <strong>{isTa ? "வாழ்க்கைத் துணையைத் தேர்ந்தெடுத்தல்: " : "Life Partner Match: "}</strong>
                  {isTa
                    ? `முழுமையான மகிழ்ச்சிக்கு, துணையின் விதி எண் மற்றும் பெயரெண் உங்கள் நட்பு எண்களாக (${destiny.friends.join(", ")}) அமைவது நல்லது. பகை எண்களாக (${destiny.enemies.join(", ")}) அமைந்தால் கருத்து வேறுபாடுகள் ஏற்படலாம்.`
                    : `For deep domestic contentment, your partner's destiny or name number should ideally resonate with your friendly numbers (${destiny.friends.join(", ")}).`}
                </p>
                <p>
                  <strong>{isTa ? "தொழில் கூட்டாளியைத் தேர்ந்தெடுத்தல்: " : "Business Partnership: "}</strong>
                  {isTa
                    ? `நீங்கள் இணைந்து செயல்பட நினைக்கும் நபரின் விதி எண் உங்கள் விதி எண்ணுடன் (${result.destinyNumber}) அல்லது நட்பு எண்களுடன் ஒத்திருப்பது கூட்டு முயற்சியில் சிறப்பான பலனைத் தரும்.`
                    : `Choosing business associates whose destiny numbers align with yours (${result.destinyNumber}) or your friendly set fosters trust and financial prosperity.`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";

export type Mode = "full" | "last4";
export type CompatibilityLevel = "same" | "friend" | "neutral" | "enemy";

const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

function digitSumOnce(n: number): number {
  return Math.abs(n).toString().split("").reduce((s, d) => s + Number(d), 0);
}

function reduceToSingleDigit(n: number): number {
  let value = Math.abs(n);
  while (value > 9) value = digitSumOnce(value);
  return value;
}

function lettersOnly(name: string): string[] {
  return name.toUpperCase().replace(/[^A-Z]/g, "").split("");
}

function digitsOnly(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

function getDestinyNumber(dob: string): number {
  const digits = digitsOnly(dob);
  if (!digits) return 0;
  const sum = digits.split("").reduce((s, d) => s + Number(d), 0);
  return reduceToSingleDigit(sum);
}

function getNameNumber(name: string): number {
  const letters = lettersOnly(name);
  if (!letters.length) return 0;
  const sum = letters.reduce((s, ch) => s + (CHALDEAN_MAP[ch] ?? 0), 0);
  return reduceToSingleDigit(sum);
}

function getSoulUrgeNumber(name: string): number {
  const letters = lettersOnly(name).filter((ch) => VOWELS.has(ch));
  if (!letters.length) return 0;
  const sum = letters.reduce((s, ch) => s + (CHALDEAN_MAP[ch] ?? 0), 0);
  return reduceToSingleDigit(sum);
}

function getPersonalityNumber(name: string): number {
  const letters = lettersOnly(name).filter((ch) => !VOWELS.has(ch));
  if (!letters.length) return 0;
  const sum = letters.reduce((s, ch) => s + (CHALDEAN_MAP[ch] ?? 0), 0);
  return reduceToSingleDigit(sum);
}

function getPersonalYearNumber(dob: string, year: number): number {
  const digits = digitsOnly(dob);
  if (digits.length < 4) return 0;
  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const sum = digitSumOnce(day) + digitSumOnce(month) + digitSumOnce(year);
  return reduceToSingleDigit(sum);
}

interface FriendMap {
  friends: number[];
  neutral: number[];
  enemies: number[];
}

const COMPATIBILITY: Record<number, FriendMap> = {
  1: { friends: [1, 2, 3, 9], neutral: [5, 6], enemies: [4, 7, 8] },
  2: { friends: [1, 2, 4, 7], neutral: [3, 5, 6], enemies: [8, 9] },
  3: { friends: [1, 3, 6, 9], neutral: [2, 5], enemies: [4, 7, 8] },
  4: { friends: [1, 4, 5, 6, 7], neutral: [3], enemies: [2, 8, 9] },
  5: { friends: [1, 3, 5, 6], neutral: [2, 4, 9], enemies: [7, 8] },
  6: { friends: [1, 4, 5, 6, 9], neutral: [3], enemies: [2, 7, 8] },
  7: { friends: [2, 4, 7], neutral: [1, 5, 6], enemies: [3, 8, 9] },
  8: { friends: [4, 6, 8], neutral: [5], enemies: [1, 2, 3, 7, 9] },
  9: { friends: [1, 3, 6, 9], neutral: [4, 5], enemies: [2, 7, 8] },
  0: { friends: [], neutral: [1, 2, 3, 4, 5, 6, 7, 8, 9], enemies: [] },
};

function getCompatibilityLevel(a: number, b: number): CompatibilityLevel {
  if (a === b) return "same";
  const chart = COMPATIBILITY[a] ?? COMPATIBILITY[0];
  if (chart.friends.includes(b)) return "friend";
  if (chart.neutral.includes(b)) return "neutral";
  return "enemy";
}

const LEVEL_SCORE: Record<CompatibilityLevel, number> = {
  same: 100,
  friend: 90,
  neutral: 60,
  enemy: 30,
};

function getDigitStringNumber(value: string, mode: Mode = "full"): number {
  let digits = digitsOnly(value);
  if (mode === "last4") digits = digits.slice(-4);
  if (!digits) return 0;
  const sum = digits.split("").reduce((s, d) => s + Number(d), 0);
  return reduceToSingleDigit(sum);
}

const PERSONALITY_TEXT_TA: Record<number, string> = {
  0: "எண் தரவு போதவில்லை — முழுப் பெயரை நிரப்பவும்.",
  1: "தலைமைத்துவமும் சுயமரியாதையும் மிக்கவர். தனித்து முடிவெடுக்க விரும்புவார்.",
  2: "மென்மையான, ஒத்துழைப்புள்ள குணம். உறவுகளை பராமரிப்பதில் திறமையானவர்.",
  3: "கலைத்திறனும் பேச்சுத் திறனும் கொண்டவர். சமூகத்தில் விரைவில் கவனம் ஈர்ப்பார்.",
  4: "ஒழுங்கு மற்றும் உழைப்பை நம்புபவர். நிலையான அடித்தளம் அமைப்பதில் கவனம்.",
  5: "சுதந்திரத்தை விரும்புபவர், மாற்றங்களை எளிதில் ஏற்பார். பயணங்களில் ஆர்வம்.",
  6: "ஒரு தாய்/தந்தையைப் போல பொறுப்பானவர். மற்றவர்கள் மீது அக்கறை கொண்டவர் என்று சமூகம் உங்களை மதிக்கிறது.",
  7: "ஆழ்ந்த சிந்தனையும் தனிமையை விரும்பும் குணமும் கொண்டவர். ஆன்மீகத்தில் ஈடுபாடு.",
  8: "அதிகாரம் மற்றும் சாதனையில் கவனம். கடின உழைப்பால் வெற்றி காண்பவர்.",
  9: "பரந்த மனப்பான்மை, மனிதநேயப் பணிகளில் ஈடுபாடு கொண்டவர்.",
};

const PERSONALITY_TEXT_EN: Record<number, string> = {
  0: "Insufficient name data — please provide your full name in English.",
  1: "Natural leadership, independent decision maker with strong self-respect.",
  2: "Gentle, diplomatic, and highly cooperative. Skilled at nurturing relationships.",
  3: "Creative, expressive, and engaging orator. Easily earns social recognition.",
  4: "Disciplined, systematic, and hardworking. Focused on building stable foundations.",
  5: "Values freedom, adaptable to changes, adventurous with an interest in travel.",
  6: "Nurturing, responsible, and caring. Respected in society for devotion to family and community.",
  7: "Analytical, contemplative, and fond of solitude with deep spiritual inclination.",
  8: "Ambitious, executive-minded, achieving profound success through perseverance.",
  9: "Broad-minded, compassionate humanitarian dedicated to societal welfare.",
};

const YEAR_TEXT_TA: Record<number, string> = {
  0: "தேதி தகவல் போதவில்லை.",
  1: "புதிய தொடக்கங்களுக்கான ஆண்டு. புதிய முயற்சிகளை தைரியமாக தொடங்கலாம்.",
  2: "பொறுமை மற்றும் கூட்டாண்மைகளுக்கான ஆண்டு. உறவுகளில் கவனம் தேவை.",
  3: "படைப்பாற்றல் மற்றும் தொடர்புகள் சிறக்கும் ஆண்டு. வெளிப்பாடுகளுக்கு ஏற்றது.",
  4: "உறுதியான உழைப்பும் திட்டமிடலும் தேவைப்படும் ஆண்டு.",
  5: "மாற்றங்கள் மற்றும் பயணங்கள் நிறைந்த ஆண்டு. நெகிழ்வுத்தன்மை உதவும்.",
  6: "குடும்பம் மற்றும் உறவுகளுக்கு முக்கியத்துவம் தரும் வருடம். திருமணம், குழந்தை பாக்கியம் போன்ற சுபநிகழ்ச்சிகள் நடக்கும்.",
  7: "சுயபரிசோதனை மற்றும் ஆன்மீக வளர்ச்சிக்கான ஆண்டு.",
  8: "பொருளாதார மற்றும் தொழில் முன்னேற்றத்திற்கான ஆண்டு.",
  9: "ஒரு கட்டத்தை முடித்து அடுத்த கட்டத்திற்கு தயாராகும் ஆண்டு.",
};

const YEAR_TEXT_EN: Record<number, string> = {
  0: "Insufficient date information.",
  1: "A year for new beginnings and bold initiatives. Excellent time to launch projects.",
  2: "A year of patience, partnerships, and harmony. Pay attention to close relationships.",
  3: "A year of creative self-expression, communication, and joyful social expansion.",
  4: "A year demanding steady effort, disciplined planning, and methodical work.",
  5: "A dynamic year filled with unexpected positive changes, freedom, and travel.",
  6: "A year emphasizing home, family, and relationships. Favors weddings and children.",
  7: "A reflective year dedicated to introspection, study, and spiritual enrichment.",
  8: "A year of material rewards, career elevation, and financial breakthroughs.",
  9: "A completion year of releasing the old and preparing the slate for a fresh 9-year cycle.",
};

const DIGIT_NUMBER_TEXT_TA: Record<CompatibilityLevel, string> = {
  same: "இந்த எண் உங்கள் விதி எண்ணுக்கு மிகச் சிறந்த பொருத்தம். கவலையின்றி பயன்படுத்தலாம்.",
  friend: "இந்த எண் உங்கள் விதி எண்ணுக்கு நல்ல பொருத்தமாக உள்ளது. கவலை தேவையில்லை.",
  neutral: "இந்த எண் உங்கள் விதி எண்ணுக்கு சாதாரண பொருத்தம். குறிப்பிடத்தக்க பாதிப்பு இல்லை.",
  enemy: "இந்த எண் உங்கள் விதி எண்ணுக்கு எதிர்மறையாக உள்ளது. கவனமாக பயன்படுத்தவும்.",
};

const DIGIT_NUMBER_TEXT_EN: Record<CompatibilityLevel, string> = {
  same: "This number is an optimal vibration for your destiny number. Highly recommended.",
  friend: "This number shares a friendly vibration with your destiny number. Favorable to use.",
  neutral: "This number has a neutral vibration with your destiny number. Normal impact.",
  enemy: "This number has a conflicting vibration with your destiny number. Use with awareness.",
};

const CURRENT_YEAR = new Date().getFullYear();

export interface NumerologyProps {
  language?: 'ta' | 'en';
  isLight?: boolean;
}

function NumberBadge({ n, size = "md", isLight = true }: { n: number; size?: "md" | "lg"; isLight?: boolean }) {
  const dims = size === "lg" ? "h-16 w-16 text-2xl font-bold" : "h-11 w-11 text-base font-bold";
  return (
    <div
      className={`${dims} shrink-0 rounded-full border flex items-center justify-center font-serif transition-colors ${
        isLight
          ? 'border-[#B08D57] bg-[#FBF6EC] text-[#7B2D3D] shadow-xs'
          : 'border-amber-500/50 bg-amber-950/40 text-amber-300 shadow-md'
      }`}
    >
      {n}
    </div>
  );
}

function ReadingRow({
  number,
  label,
  text,
  isLast,
  isLight = true,
}: {
  number: number;
  label: string;
  text: string;
  isLast?: boolean;
  isLight?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <NumberBadge n={number} isLight={isLight} />
        {!isLast && (
          <div className={`w-px flex-1 my-2 ${isLight ? 'bg-[#DED2B8]' : 'bg-slate-800'}`} />
        )}
      </div>
      <div className={`pb-8 ${isLast ? "pb-0" : ""}`}>
        <p className={`text-xs sm:text-sm uppercase tracking-wider font-semibold mb-1 ${
          isLight ? 'text-[#8A7A5C]' : 'text-amber-400/80'
        }`}>
          {label}
        </p>
        <p className={`leading-relaxed text-sm ${
          isLight ? 'text-[#3A2E22]' : 'text-slate-200'
        }`}>
          {text}
        </p>
      </div>
    </div>
  );
}

function CompatibilityBar({ percent, label, isLight = true }: { percent: number; label: string; isLight?: boolean }) {
  const color =
    percent >= 90 ? (isLight ? "#2F7A54" : "#4ADE80") : percent >= 60 ? (isLight ? "#B08D57" : "#FBBF24") : (isLight ? "#A6344B" : "#F87171");
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className={`text-xs sm:text-sm font-medium ${isLight ? 'text-[#8A7A5C]' : 'text-slate-300'}`}>
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color }}>
          {percent}%
        </span>
      </div>
      <div className={`h-2 rounded-full overflow-hidden ${isLight ? 'bg-[#EDE3CE]' : 'bg-slate-800'}`}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function Field({ label, isLight, children }: { label: string; isLight?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={`block text-xs sm:text-sm font-medium mb-1.5 ${isLight ? 'text-[#8A7A5C]' : 'text-slate-300'}`}>
        {label}
      </span>
      {children}
    </label>
  );
}

function DigitNumberCard({
  title,
  addedNumber,
  percent,
  text,
  compatLabel,
  isLight = true,
}: {
  title: string;
  addedNumber: number;
  percent: number;
  text: string;
  compatLabel: string;
  isLight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 sm:p-6 space-y-4 transition-all ${
      isLight
        ? 'border-[#DED2B8] bg-[#FBF6EC]'
        : 'border-slate-800 bg-slate-900/90 shadow-lg'
    }`}>
      <h2 className={`font-serif text-base sm:text-lg font-bold ${
        isLight ? 'text-[#7B2D3D]' : 'text-amber-300'
      }`}>
        {title}
      </h2>
      <div className="flex items-center gap-4">
        <NumberBadge n={addedNumber} size="lg" isLight={isLight} />
        <div className="flex-1">
          <CompatibilityBar percent={percent} label={compatLabel} isLight={isLight} />
        </div>
      </div>
      <p className={`text-xs sm:text-sm ${isLight ? 'text-[#8A7A5C]' : 'text-slate-300'}`}>
        {text}
      </p>
    </div>
  );
}

type CoreResult = {
  destinyNumber: number;
  nameNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  yearNumber: number;
  nameCompatibilityLevel: CompatibilityLevel;
  nameCompatibilityPercent: number;
};

type DigitReading = {
  addedNumber: number;
  level: CompatibilityLevel;
  percent: number;
  text: string;
};

type CalculatedState = {
  core: CoreResult;
  mobileReading: DigitReading | null;
  vehicleReading: DigitReading | null;
} | null;

export default function Numerology({
  language = 'ta',
  isLight = false,
}: NumerologyProps) {
  const isTa = language === 'ta';

  const [dob, setDob] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleMode, setVehicleMode] = useState<Mode>("full");
  const [result, setResult] = useState<CalculatedState>(null);

  const canCalculate = dob && fullName.trim();

  function handleCalculate() {
    if (!canCalculate) return;

    const destinyNumber = getDestinyNumber(dob);
    const nameNumber = getNameNumber(fullName);
    const soulUrgeNumber = getSoulUrgeNumber(fullName);
    const personalityNumber = getPersonalityNumber(fullName);
    const yearNumber = getPersonalYearNumber(dob, CURRENT_YEAR);
    const nameCompatibilityLevel = getCompatibilityLevel(destinyNumber, nameNumber);
    const nameCompatibilityPercent = LEVEL_SCORE[nameCompatibilityLevel];
    const core: CoreResult = {
      destinyNumber,
      nameNumber,
      soulUrgeNumber,
      personalityNumber,
      yearNumber,
      nameCompatibilityLevel,
      nameCompatibilityPercent,
    };

    const digitTextMap = isTa ? DIGIT_NUMBER_TEXT_TA : DIGIT_NUMBER_TEXT_EN;

    const mobileReading: DigitReading | null = mobileNumber.trim()
      ? (() => {
          const addedNumber = getDigitStringNumber(mobileNumber, "full");
          const level = getCompatibilityLevel(destinyNumber, addedNumber);
          return { addedNumber, level, percent: LEVEL_SCORE[level], text: digitTextMap[level] };
        })()
      : null;

    const vehicleReading: DigitReading | null = vehicleNumber.trim()
      ? (() => {
          const addedNumber = getDigitStringNumber(vehicleNumber, vehicleMode);
          const level = getCompatibilityLevel(destinyNumber, addedNumber);
          return { addedNumber, level, percent: LEVEL_SCORE[level], text: digitTextMap[level] };
        })()
      : null;

    setResult({ core, mobileReading, vehicleReading });
  }

  const core = result?.core ?? null;
  const mobileReading = result?.mobileReading ?? null;
  const vehicleReading = result?.vehicleReading ?? null;

  const inputClasses = isLight
    ? "w-full rounded-lg bg-[#FBF6EC] border border-[#DED2B8] px-3.5 py-2.5 text-[#3A2E22] placeholder:text-[#B3A588] focus:outline-none focus:border-[#B08D57] focus:ring-1 focus:ring-[#B08D57]/30 text-sm"
    : "w-full rounded-lg bg-slate-800 border border-slate-700 px-3.5 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 text-sm";

  return (
    <div className={`rounded-2xl border p-5 md:p-8 transition-colors ${
      isLight
        ? 'bg-[#F5EFE0] text-[#3A2E22] border-[#DED2B8]'
        : 'bg-slate-950 text-slate-100 border-slate-800'
    }`}>
      <div className="grid md:grid-cols-[320px_1fr] gap-8 lg:gap-10">
        
        {/* Input panel */}
        <div className="space-y-6">
          <div>
            <h1 className={`font-serif text-2xl font-bold ${
              isLight ? 'text-[#7B2D3D]' : 'text-amber-400'
            }`}>
              {isTa ? "எண் கணிதம்" : "Chaldean Numerology"}
            </h1>
            <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${
              isLight ? 'text-[#8A7A5C]' : 'text-slate-400'
            }`}>
              {isTa
                ? "பிறந்த தேதியும் பெயரும் வழியாக உங்கள் எண் பலனை காணுங்கள்."
                : "Discover your destiny, soul urge, and name harmony using ancient Chaldean numerology."}
            </p>
          </div>

          <div className={`space-y-4 rounded-xl border p-5 transition-all ${
            isLight ? 'border-[#DED2B8] bg-[#FBF6EC]' : 'border-slate-800 bg-slate-900/90'
          }`}>
            <Field label={isTa ? "பிறந்த தேதி" : "Date of Birth"} isLight={isLight}>
              <input
                type="date"
                className={inputClasses}
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </Field>
            <Field label={isTa ? "முழு பெயர் (ஆங்கிலத்தில்)" : "Full Name (English letters)"} isLight={isLight}>
              <input
                type="text"
                placeholder={isTa ? "எ.கா. S. RAMESH" : "e.g. S. RAMESH"}
                className={inputClasses}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </Field>
          </div>

          <div className={`space-y-4 rounded-xl border p-5 transition-all ${
            isLight ? 'border-[#DED2B8] bg-[#FBF6EC]' : 'border-slate-800 bg-slate-900/90'
          }`}>
            <Field label={isTa ? "மொபைல் எண் (விருப்பமுறுத்தால்)" : "Mobile Number (Optional)"} isLight={isLight}>
              <input
                type="tel"
                placeholder={isTa ? "10 இலக்க எண்" : "10-digit mobile number"}
                className={inputClasses}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </Field>
          </div>

          <div className={`space-y-4 rounded-xl border p-5 transition-all ${
            isLight ? 'border-[#DED2B8] bg-[#FBF6EC]' : 'border-slate-800 bg-slate-900/90'
          }`}>
            <Field label={isTa ? "வாகன எண் (விருப்பமுறுத்தால்)" : "Vehicle Number (Optional)"} isLight={isLight}>
              <input
                type="text"
                placeholder="E.G., TN 38 BX 8055"
                className={inputClasses}
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
              />
            </Field>
            <div className={`flex flex-col sm:flex-row gap-3 text-xs ${
              isLight ? 'text-[#8A7A5C]' : 'text-slate-400'
            }`}>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="numerology-vmode"
                  checked={vehicleMode === "full"}
                  onChange={() => setVehicleMode("full")}
                  className="accent-amber-600"
                />
                {isTa ? "முழு எண் (TN உட்பட)" : "Full Number (incl. TN)"}
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="numerology-vmode"
                  checked={vehicleMode === "last4"}
                  onChange={() => setVehicleMode("last4")}
                  className="accent-amber-600"
                />
                {isTa ? "கடைசி 4 எண்கள் மட்டும்" : "Last 4 Digits Only"}
              </label>
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={!canCalculate}
            className={`w-full rounded-xl py-3 font-serif text-sm sm:text-base font-bold tracking-wide transition-all ${
              isLight
                ? 'bg-[#7B2D3D] text-[#FBF6EC] hover:bg-[#6A2535] disabled:opacity-40 shadow-sm'
                : 'bg-amber-600 text-slate-950 hover:bg-amber-500 disabled:opacity-30 shadow-md font-bold'
            }`}
          >
            {isTa ? "கணக்கிடு" : "Calculate Numerology"}
          </button>
        </div>

        {/* Reading panel */}
        <div>
          {!core ? (
            <div className={`h-full min-h-[300px] flex items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center text-sm ${
              isLight
                ? 'border-[#DED2B8] text-[#B3A588] bg-[#FBF6EC]/50'
                : 'border-slate-800 text-slate-400 bg-slate-900/30'
            }`}>
              {isTa
                ? "பிறந்த தேதியும் பெயரும் நிரப்பி கணக்கிடு அழுத்தவும்."
                : "Enter your date of birth and full name, then click Calculate."}
            </div>
          ) : (
            <div className="space-y-8">
              <div className={`rounded-xl border p-6 transition-all ${
                isLight ? 'border-[#DED2B8] bg-[#FBF6EC]' : 'border-slate-800 bg-slate-900/90'
              }`}>
                <ReadingRow
                  number={core.destinyNumber}
                  label={isTa ? "விதி எண் (Destiny Number)" : "Destiny Number"}
                  text={isTa
                    ? "உங்கள் பிறந்த தேதியிலிருந்து கிடைக்கும் அடிப்படை எண். இது உங்கள் வாழ்வின் திசையை குறிக்கிறது."
                    : "The core master number derived from your complete date of birth, reflecting your life path and overarching purpose."}
                  isLight={isLight}
                />
                <ReadingRow
                  number={core.nameNumber}
                  label={isTa ? "பெயர் எண் (Name Number)" : "Name Number"}
                  text={isTa
                    ? "உங்கள் பெயரின் எழுத்துக்களிலிருந்து கிடைக்கும் எண். இது உங்கள் வெளிப்புற அடையாளத்தை பாதிக்கிறது."
                    : "The vibration derived from letters of your full name in Chaldean mapping, influencing your public identity."}
                  isLight={isLight}
                />
                <ReadingRow
                  number={core.soulUrgeNumber}
                  label={isTa ? "ஆன்மீக எண் (Soul Urge)" : "Soul Urge Number"}
                  text={isTa
                    ? "உங்கள் பெயரில் உள்ள உயிரெழுத்துக்களிலிருந்து கிடைக்கும் எண். இது உங்கள் அக ஆசைகளை குறிக்கிறது."
                    : "Calculated from the vowels in your name, revealing your inner desires, soul motivations, and true self."}
                  isLight={isLight}
                />
                <ReadingRow
                  number={core.personalityNumber}
                  label={isTa ? "வெளிப்படை எண் (Personality)" : "Personality Number"}
                  text={isTa ? PERSONALITY_TEXT_TA[core.personalityNumber] : PERSONALITY_TEXT_EN[core.personalityNumber]}
                  isLight={isLight}
                />
                <ReadingRow
                  number={core.yearNumber}
                  label={isTa ? `நடப்பு வருட பலன் (${CURRENT_YEAR})` : `Personal Year Forecast (${CURRENT_YEAR})`}
                  text={isTa ? YEAR_TEXT_TA[core.yearNumber] : YEAR_TEXT_EN[core.yearNumber]}
                  isLast
                  isLight={isLight}
                />
              </div>

              <div className={`rounded-xl border p-6 space-y-4 transition-all ${
                isLight ? 'border-[#DED2B8] bg-[#FBF6EC]' : 'border-slate-800 bg-slate-900/90'
              }`}>
                <h2 className={`font-serif text-lg font-bold ${
                  isLight ? 'text-[#7B2D3D]' : 'text-amber-300'
                }`}>
                  {isTa ? "பெயர் பொருத்தம்" : "Name Harmony & Compatibility"}
                </h2>
                <CompatibilityBar
                  percent={core.nameCompatibilityPercent}
                  label={isTa ? "விதி எண் — பெயர் எண் பொருத்தம்" : "Destiny Number — Name Number Harmony"}
                  isLight={isLight}
                />
                <p className={`text-xs sm:text-sm leading-relaxed ${isLight ? 'text-[#8A7A5C]' : 'text-slate-300'}`}>
                  {core.nameCompatibilityLevel === "same" && (
                    isTa
                      ? "விதி எண்ணும் பெயர் எண்ணும் ஒரே எண். இது மிகச் சிறந்த பொருத்தம்."
                      : "Destiny number and name number are identical. This represents pristine harmonic resonance."
                  )}
                  {core.nameCompatibilityLevel === "friend" && (
                    isTa
                      ? "உங்கள் பெயரும் விதி எண்ணும் நட்பு எண்களாக உள்ளன. பெயர் மாற்றம் தேவையில்லை."
                      : "Your name number shares a friendly vibration with your destiny number. No name change required."
                  )}
                  {core.nameCompatibilityLevel === "neutral" && (
                    isTa
                      ? "உங்கள் பெயரும் விதி எண்ணும் நடுநிலை பொருத்தமாக உள்ளன."
                      : "Your name and destiny numbers share a neutral relationship."
                  )}
                  {core.nameCompatibilityLevel === "enemy" && (
                    isTa
                      ? "உங்கள் பெயரும் விதி எண்ணும் மாறுபட்ட எண்களாக உள்ளன. ஒரு நல்லெண் நிபுணரை அணுகலாம்."
                      : "Your name and destiny numbers are in conflict. A minor spelling correction can boost prosperity."
                  )}
                </p>
              </div>

              {mobileReading && (
                <DigitNumberCard
                  title={isTa ? "மொபைல் எண் பொருத்தம்" : "Mobile Number Vibration"}
                  addedNumber={mobileReading.addedNumber}
                  percent={mobileReading.percent}
                  text={mobileReading.text}
                  compatLabel={isTa ? "கூட்டு எண் பொருத்தம்" : "Cumulative Number Match"}
                  isLight={isLight}
                />
              )}

              {vehicleReading && (
                <DigitNumberCard
                  title={isTa ? "வாகன எண் பொருத்தம்" : "Vehicle Number Vibration"}
                  addedNumber={vehicleReading.addedNumber}
                  percent={vehicleReading.percent}
                  text={vehicleReading.text}
                  compatLabel={isTa ? "கூட்டு எண் பொருத்தம்" : "Cumulative Number Match"}
                  isLight={isLight}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

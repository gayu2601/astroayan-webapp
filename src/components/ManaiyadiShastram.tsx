import React, { useState } from "react";
import { Ruler, Home, CheckCircle2, AlertTriangle, Search, Info } from "lucide-react";
import ScreenGuard from './ScreenGuard';

interface ManaiyadiShastramProps {
  language: "ta" | "en";
  isLight?: boolean;
}

interface Measurement {
  feet: number;
  labelTamil: string;
  labelEnglish: string;
  isAuspicious: boolean;
}

const MEASUREMENTS: Measurement[] = [
  { feet: 6, labelTamil: "நன்மையுண்டு", labelEnglish: "Good Fortune", isAuspicious: true },
  { feet: 7, labelTamil: "தரித்திரம்", labelEnglish: "Poverty", isAuspicious: false },
  { feet: 8, labelTamil: "இராஜ்ய சம்பத்து", labelEnglish: "Royal Wealth", isAuspicious: true },
  { feet: 9, labelTamil: "பீடை", labelEnglish: "Misfortune", isAuspicious: false },
  { feet: 10, labelTamil: "பாலமுதம் உண்டு", labelEnglish: "Nourishment & Prosperity", isAuspicious: true },
  { feet: 11, labelTamil: "நன்மை", labelEnglish: "Good Fortune", isAuspicious: true },
  { feet: 12, labelTamil: "புத்திர தோஷம்", labelEnglish: "Child-related Dosha", isAuspicious: false },
  { feet: 13, labelTamil: "வியாதி உண்டு", labelEnglish: "Illness", isAuspicious: false },
  { feet: 14, labelTamil: "சஞ்சலமுண்டு", labelEnglish: "Mental Disturbance", isAuspicious: false },
  { feet: 15, labelTamil: "உடன் துக்கம்", labelEnglish: "Immediate Sorrow", isAuspicious: false },
  { feet: 16, labelTamil: "மிகுந்த செல்வமுண்டு", labelEnglish: "Great Wealth", isAuspicious: true },
  { feet: 17, labelTamil: "எதிரி அஞ்சுவான்", labelEnglish: "Enemies Fear You", isAuspicious: true },
  { feet: 18, labelTamil: "மனை பாழாகும்", labelEnglish: "House Becomes Ruined", isAuspicious: false },
  { feet: 19, labelTamil: "தரித்திரம், புத்திர நலிவு", labelEnglish: "Poverty & Child-related Suffering", isAuspicious: false },
  { feet: 20, labelTamil: "இன்பம் தரும்", labelEnglish: "Brings Happiness", isAuspicious: true },
  { feet: 21, labelTamil: "நன்மை தரும்", labelEnglish: "Brings Good Fortune", isAuspicious: true },
  { feet: 22, labelTamil: "எதிரி அஞ்சுவான்", labelEnglish: "Enemies Fear You", isAuspicious: true },
  { feet: 23, labelTamil: "தீதுண்டாகும்", labelEnglish: "Brings Misfortune", isAuspicious: false },
  { feet: 24, labelTamil: "மத்திமம்", labelEnglish: "Average", isAuspicious: true },
  { feet: 25, labelTamil: "மனையாள் மரணம்", labelEnglish: "Death of Spouse", isAuspicious: false },
  { feet: 26, labelTamil: "சம்பத்துண்டு", labelEnglish: "Wealth", isAuspicious: true },
  { feet: 27, labelTamil: "மிகுந்த செல்வமுண்டு", labelEnglish: "Great Wealth", isAuspicious: true },
  { feet: 28, labelTamil: "தெய்வ கடாட்சமுண்டு", labelEnglish: "Divine Blessings", isAuspicious: true },
  { feet: 29, labelTamil: "பால் பாக்யம் உண்டு", labelEnglish: "Blessing of Milk & Nourishment", isAuspicious: true },
  { feet: 30, labelTamil: "லட்சுமி கடாட்சம் பெறுவார்", labelEnglish: "Blessed by Lakshmi", isAuspicious: true },
  { feet: 31, labelTamil: "நன்மையுண்டு", labelEnglish: "Good Fortune", isAuspicious: true },
  { feet: 32, labelTamil: "இழந்த பொருள் திரும்ப வரும்", labelEnglish: "Lost Property Returns", isAuspicious: true },
  { feet: 33, labelTamil: "நன்மையுண்டு", labelEnglish: "Good Fortune", isAuspicious: true },
  { feet: 34, labelTamil: "குடி விட்டு ஓடும்", labelEnglish: "Forced to Leave Home", isAuspicious: false },
  { feet: 35, labelTamil: "லட்சுமி கடாட்சமுண்டு", labelEnglish: "Lakshmi's Blessings", isAuspicious: true },
  { feet: 36, labelTamil: "லட்சுமி கடாட்சமுண்டு", labelEnglish: "Lakshmi's Blessings", isAuspicious: true },
  { feet: 37, labelTamil: "கால்நடை சேரும்", labelEnglish: "Gain of Livestock", isAuspicious: true },
  { feet: 38, labelTamil: "பிரம்ம ராட்சதன் குடி இருப்பான்", labelEnglish: "Brahma Rakshasa Influence", isAuspicious: false },
  { feet: 39, labelTamil: "நன்மையுண்டு", labelEnglish: "Good Fortune", isAuspicious: true },
  { feet: 40, labelTamil: "எதிரிகளால் தீது", labelEnglish: "Harm from Enemies", isAuspicious: false },
  { feet: 41, labelTamil: "குடும்ப சம்பத்து உண்டு", labelEnglish: "Family Wealth", isAuspicious: true },
  { feet: 42, labelTamil: "அஷ்ட லட்சுமி வாசம் உண்டு", labelEnglish: "Presence of Ashta Lakshmi", isAuspicious: true },
  { feet: 43, labelTamil: "நன்மை குறையாது", labelEnglish: "Good Fortune Never Reduces", isAuspicious: true },
  { feet: 44, labelTamil: "கண்ணுக்குப் பிணி ஏற்படும்", labelEnglish: "Eye Disease", isAuspicious: false },
  { feet: 45, labelTamil: "சற்புத்திர பாக்கியமுண்டு", labelEnglish: "Blessing of Good Children", isAuspicious: true },
  { feet: 46, labelTamil: "சலன புத்தி இருக்கும்", labelEnglish: "Restless Mind", isAuspicious: false },
  { feet: 47, labelTamil: "மாந்திரீக பாதிப்பு பெறுவர்", labelEnglish: "Affected by Black Magic", isAuspicious: false },
  { feet: 48, labelTamil: "நெருப்பு கண்டம் காட்டும்", labelEnglish: "Fire Hazard", isAuspicious: false },
  { feet: 49, labelTamil: "மலடாகு", labelEnglish: "Infertility", isAuspicious: false },
  { feet: 50, labelTamil: "தலைமை ஸ்தானம் பெறுவர்", labelEnglish: "Leadership Position", isAuspicious: true },
  { feet: 51, labelTamil: "பிரச்னைகள் தோன்றும்", labelEnglish: "Problems Arise", isAuspicious: false },
  { feet: 52, labelTamil: "தன - தான்ய சம்பத்து சேரும்", labelEnglish: "Wealth & Grains", isAuspicious: true },
  { feet: 53, labelTamil: "களவு - காம உணர்வு தோன்றும்", labelEnglish: "Theft & Lustful Tendencies", isAuspicious: false },
  { feet: 54, labelTamil: "அரசபோக வாழ்வு அமையும்", labelEnglish: "Royal Lifestyle", isAuspicious: true },
  { feet: 55, labelTamil: "பகை அழியும்", labelEnglish: "Enemies Destroyed", isAuspicious: true },
  { feet: 56, labelTamil: "எதிர்பாராத லாபம்", labelEnglish: "Unexpected Gain", isAuspicious: true },
  { feet: 57, labelTamil: "இறுதி முடிவு தீதாகும்", labelEnglish: "Final Result Unfavorable", isAuspicious: false },
  { feet: 58, labelTamil: "காரிய சாதனை பெறுவர்", labelEnglish: "Success in Endeavors", isAuspicious: true },
  { feet: 59, labelTamil: "சமுதாய ஆதரவு உண்டு", labelEnglish: "Social Support", isAuspicious: true },
  { feet: 60, labelTamil: "செல்வம், செல்வாக்கு சேரும்", labelEnglish: "Wealth & Influence", isAuspicious: true },
  { feet: 61, labelTamil: "வெற்றிக்கு வழி", labelEnglish: "Path to Success", isAuspicious: true },
  { feet: 62, labelTamil: "மிக்க பகை உண்டாகும்", labelEnglish: "Many Enemies", isAuspicious: false },
  { feet: 63, labelTamil: "திடீர் யோகம் காட்டும்", labelEnglish: "Sudden Fortune", isAuspicious: true },
  { feet: 64, labelTamil: "அரசாங்க உதவி உண்டு", labelEnglish: "Government Support", isAuspicious: true },
  { feet: 65, labelTamil: "நண்பர்கள் உதவி உண்டு", labelEnglish: "Help from Friends", isAuspicious: true },
  { feet: 66, labelTamil: "அரசாங்க உதவி உண்டு", labelEnglish: "Government Support", isAuspicious: true },
  { feet: 67, labelTamil: "பெண் பகை தோன்றும்", labelEnglish: "Enmity from Women", isAuspicious: false },
  { feet: 68, labelTamil: "காரியத்தில் தோல்வி", labelEnglish: "Failure in Efforts", isAuspicious: false },
  { feet: 69, labelTamil: "சுய முன்னேற்றம்", labelEnglish: "Self Progress", isAuspicious: true },
  { feet: 70, labelTamil: "ஏமாற்றம் தரும்", labelEnglish: "Disappointment", isAuspicious: false },
  { feet: 71, labelTamil: "தன யோகம் காட்டும்", labelEnglish: "Wealth Yoga", isAuspicious: true },
  { feet: 72, labelTamil: "லட்சுமி கடாட்சம் உண்டாகும்", labelEnglish: "Lakshmi's Blessings", isAuspicious: true },
  { feet: 73, labelTamil: "பக்தி விசுவாசம்", labelEnglish: "Devotion & Faith", isAuspicious: true },
  { feet: 74, labelTamil: "ஊக்கத்திற்கு ஏற்ற ஆக்கம்", labelEnglish: "Progress Through Motivation", isAuspicious: true },
  { feet: 75, labelTamil: "செல்வாக்கு பெறுவர்", labelEnglish: "Influence & Reputation", isAuspicious: true },
  { feet: 76, labelTamil: "திடீர் தனவரவு", labelEnglish: "Sudden Income", isAuspicious: true },
  { feet: 77, labelTamil: "பெரும் புகழ் பெறுவர்", labelEnglish: "Great Fame", isAuspicious: true },
  { feet: 78, labelTamil: "பொருள் அழிவு", labelEnglish: "Loss of Wealth", isAuspicious: false },
  { feet: 79, labelTamil: "துரிதமான முன்னேற்றம்", labelEnglish: "Rapid Progress", isAuspicious: true },
  { feet: 80, labelTamil: "ஆபத்து", labelEnglish: "Danger", isAuspicious: false },
  { feet: 81, labelTamil: "வெற்றி", labelEnglish: "Success", isAuspicious: true },
  { feet: 82, labelTamil: "விரும்பிய திருமணம்", labelEnglish: "Desired Marriage", isAuspicious: true },
  { feet: 83, labelTamil: "அரசாங்க உதவி உண்டு", labelEnglish: "Government Support", isAuspicious: true },
  { feet: 84, labelTamil: "வாகன யோகம்", labelEnglish: "Vehicle Fortune", isAuspicious: true },
  { feet: 85, labelTamil: "இறுதி வெற்றி", labelEnglish: "Ultimate Success", isAuspicious: true },
  { feet: 86, labelTamil: "எல்லார் ஆதரவும் உண்டு", labelEnglish: "Support from Everyone", isAuspicious: true },
  { feet: 87, labelTamil: "மந்தமான முன்னேற்றம்", labelEnglish: "Slow Progress", isAuspicious: false },
  { feet: 88, labelTamil: "கீர்த்தி பெறுவர்", labelEnglish: "Fame", isAuspicious: true },
  { feet: 89, labelTamil: "பாராட்டு பெறுவர்", labelEnglish: "Recognition", isAuspicious: true },
  { feet: 90, labelTamil: "மிக்க புகழ் உண்டாகும்", labelEnglish: "Great Reputation", isAuspicious: true },
  { feet: 91, labelTamil: "வெளிநாட்டுப் பிரயாணம்", labelEnglish: "Foreign Travel", isAuspicious: true },
  { feet: 92, labelTamil: "பொன், பொருள், பூமி லாபம்", labelEnglish: "Gain of Gold, Wealth & Land", isAuspicious: true },
  { feet: 93, labelTamil: "பல கலைகள் விருத்தி", labelEnglish: "Growth in Many Skills", isAuspicious: true },
  { feet: 94, labelTamil: "காரிய வெற்றி", labelEnglish: "Success in Work", isAuspicious: true },
  { feet: 95, labelTamil: "பெரும்பேறு பெறுவர்", labelEnglish: "Great Fortune", isAuspicious: true },
  { feet: 96, labelTamil: "பெண் வழி ஆதாயம்", labelEnglish: "Gain Through Women", isAuspicious: true },
  { feet: 97, labelTamil: "முயற்சியில் வெற்றி", labelEnglish: "Success Through Effort", isAuspicious: true },
  { feet: 98, labelTamil: "கடின உழைப்பு", labelEnglish: "Hard Work", isAuspicious: false },
  { feet: 99, labelTamil: "சமநிலை", labelEnglish: "Balanced", isAuspicious: true },
  { feet: 100, labelTamil: "அரசாங்க உதவி", labelEnglish: "Government Support", isAuspicious: true },
  { feet: 101, labelTamil: "சமநிலை", labelEnglish: "Balanced", isAuspicious: true },
  { feet: 102, labelTamil: "அரசாங்க வெகுமதி", labelEnglish: "Government Reward", isAuspicious: true },
  { feet: 103, labelTamil: "குழப்ப வாதம்", labelEnglish: "Conflicts & Arguments", isAuspicious: false },
  { feet: 104, labelTamil: "சுபமங்களம் தரும்", labelEnglish: "Brings Auspiciousness", isAuspicious: true },
  { feet: 105, labelTamil: "நற்பெயர் நிலைக்கும்", labelEnglish: "Good Name Endures", isAuspicious: true },
  { feet: 106, labelTamil: "சிக்கான சூழ்நிலை", labelEnglish: "Difficult Situation", isAuspicious: false },
  { feet: 107, labelTamil: "மந்தமான முன்னேற்றம்", labelEnglish: "Slow Progress", isAuspicious: false },
  { feet: 108, labelTamil: "காரிய சாதனை", labelEnglish: "Achievement", isAuspicious: true },
  { feet: 109, labelTamil: "போட்டா போட்டி", labelEnglish: "Competition", isAuspicious: false },
  { feet: 110, labelTamil: "சிரமத்தில் வெற்றி", labelEnglish: "Success After Hardship", isAuspicious: true },
  { feet: 111, labelTamil: "ஏமாற்றம்", labelEnglish: "Disappointment", isAuspicious: false },
  { feet: 112, labelTamil: "பிதுர் தோஷம்", labelEnglish: "Pitru Dosha", isAuspicious: false },
  { feet: 113, labelTamil: "மரண பயம்", labelEnglish: "Fear of Death", isAuspicious: false },
  { feet: 114, labelTamil: "திடீர் யோகம்", labelEnglish: "Sudden Fortune", isAuspicious: true },
  { feet: 115, labelTamil: "காரிய வெற்றி", labelEnglish: "Success in Work", isAuspicious: true },
  { feet: 116, labelTamil: "எதிர்பாராத மாற்றம்", labelEnglish: "Unexpected Change", isAuspicious: true },
  { feet: 117, labelTamil: "தோல்வி மேல் தோல்வி", labelEnglish: "Repeated Failures", isAuspicious: false },
  { feet: 118, labelTamil: "காரிய தாமதம்", labelEnglish: "Delay in Work", isAuspicious: false },
  { feet: 119, labelTamil: "பேராசை", labelEnglish: "Greed", isAuspicious: false },
  { feet: 120, labelTamil: "சர்வமும் வெற்றி", labelEnglish: "Success in Everything", isAuspicious: true }
];

export function getResult(feet: number): Measurement {
  if (feet >= 120) {
    return { feet, labelTamil: "சுபம் தரும்", labelEnglish: "Highly Auspicious", isAuspicious: true };
  }
  const found = MEASUREMENTS.find(m => m.feet === feet);
  if (found) return found;
  const cycleIndex = ((feet - 6) % 10) + 6;
  return (
    MEASUREMENTS.find((m) => m.feet === cycleIndex) ?? {
      feet,
      labelTamil: "சுபம்",
      labelEnglish: "Auspicious",
      isAuspicious: true,
    }
  );
}

export default function ManaiyadiShastram({ language, isLight = false }: ManaiyadiShastramProps) {
  const [length, setLength] = useState<number>(10);
  const [width, setWidth] = useState<number>(12);
  const [selectedFeet, setSelectedFeet] = useState<number>(12);
  const [customFeet, setCustomFeet] = useState<string>("12");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const areaResult = getResult(length * width);
  const selectedResult = getResult(selectedFeet);

  const handleCustomFeetChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    setCustomFeet(cleaned);
    const num = parseInt(cleaned, 10);
    if (!isNaN(num) && num >= 1) {
      setSelectedFeet(num);
    }
  };

  const handleSelectMeasurement = (feet: number) => {
    setSelectedFeet(feet);
    setCustomFeet(String(feet));
  };

  const filteredMeasurements = MEASUREMENTS.filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.feet.toString().includes(q) ||
      m.labelTamil.toLowerCase().includes(q) ||
      m.labelEnglish.toLowerCase().includes(q)
    );
  });

  return (
  <ScreenGuard featureId="manaiyadi">
    <div className="space-y-6">
      {/* ── Dimension Calculator ── */}
      <div className={`p-6 rounded-3xl border transition-all ${
        isLight 
          ? "bg-amber-500/5 border-amber-500/20 shadow-sm" 
          : "bg-[#1C1840]/40 border-amber-500/10 shadow-xl"
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <Ruler className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-serif font-bold text-amber-500">
            {language === "ta" ? "மனையடி வாஸ்து கால்குலேட்டர்" : "Vastu Area & Dimension Analyzer"}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className={`block text-xs font-bold ${isLight ? "text-gray-700" : "text-gray-400"} mb-1 uppercase tracking-wide`}>
                {language === "ta" ? "நீளம் (Length - அடி)" : "Length (Feet)"}
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={length}
                onChange={(e) => setLength(Math.max(1, Number(e.target.value)))}
                className={`w-full px-3 py-2 rounded-lg border text-sm font-semibold transition-all ${
                  isLight
                    ? "bg-white border-gray-300 text-gray-900 focus:ring-1 focus:ring-amber-500/30"
                    : "bg-black/40 border-white/10 text-white focus:ring-1 focus:ring-amber-500/30"
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-bold ${isLight ? "text-gray-700" : "text-gray-400"} mb-1 uppercase tracking-wide`}>
                {language === "ta" ? "அகலம் (Width - அடி)" : "Width (Feet)"}
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={width}
                onChange={(e) => setWidth(Math.max(1, Number(e.target.value)))}
                className={`w-full px-3 py-2 rounded-lg border text-sm font-semibold transition-all ${
                  isLight
                    ? "bg-white border-gray-300 text-gray-900 focus:ring-1 focus:ring-amber-500/30"
                    : "bg-black/40 border-white/10 text-white focus:ring-1 focus:ring-amber-500/30"
                }`}
              />
            </div>

            <div className={`p-4 rounded-xl border flex items-center gap-3 ${
              isLight ? "bg-amber-50/50 border-amber-500/10" : "bg-white/5 border-white/5"
            }`}>
              <Home className="h-8 w-8 text-amber-500 flex-shrink-0" />
              <div>
                <p className={`text-xs ${isLight ? "text-gray-600" : "text-gray-400"} font-medium`}>
                  {language === "ta" ? "மொத்த பரப்பளவு" : "Calculated Area"}
                </p>
                <p className="text-2xl font-mono font-black text-amber-400">
                  {length * width} <span className="text-xs font-bold text-gray-400">SQFT ({length * width} {language === "ta" ? "அடி" : "Feet"})</span>
                </p>
              </div>
            </div>
          </div>

          {/* Calculator Results display */}
          <div className="flex flex-col justify-between">
            <div className={`p-5 rounded-2xl border flex-1 flex flex-col justify-center space-y-4 ${
              areaResult.isAuspicious
                ? isLight 
                  ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-950" 
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : isLight 
                  ? "bg-rose-500/5 border-rose-500/20 text-rose-950" 
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-black tracking-wider uppercase px-2.5 py-1 rounded-full border ${
                  areaResult.isAuspicious
                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500"
                    : "bg-rose-500/10 border-rose-500/25 text-rose-500"
                }`}>
                  {areaResult.isAuspicious 
                    ? (language === "ta" ? "சுபம் • நற்பலன்" : "Auspicious • Good Fortune")
                    : (language === "ta" ? "அசுபம் • பரிகாரம் தேவை" : "Inauspicious • Avoid")
                  }
                </span>
                {areaResult.isAuspicious ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                )}
              </div>

              <div>
                <h4 className={`text-xl font-serif font-black ${isLight ? "text-gray-900" : "text-white"}`}>
                  {language === "ta" ? areaResult.labelTamil : areaResult.labelEnglish}
                </h4>
                <p className={`text-xs mt-2 leading-relaxed ${isLight ? "text-gray-700" : "text-gray-300"}`}>
                  {areaResult.isAuspicious
                    ? (language === "ta" 
                        ? "மனையடி அளவுகள் மிகவும் உத்தமம். வீட்டில் செல்வமும், ஆரோக்கியமும் பெருமளவில் தங்கும்." 
                        : "Highly Auspicious dimensions. The house will attract continuous prosperity, health, and spiritual peace.")
                    : (language === "ta"
                        ? "மனையடி அளவுகள் மத்திமம் அல்லது அசுபம். சுப காரியங்களில் சிறு தடைகள் ஏற்படலாம், வாஸ்து பூசைகள் நல்லது."
                        : "Moderate or challenging compatibility. Minor delays or obstructions might occur. Corrective Vastu prayers or structural alignment adjustments recommended.")
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Lookup Specific Feet Value ── */}
      <div className={`p-6 rounded-3xl border transition-all ${
        isLight 
          ? "bg-white border-gray-200 shadow-sm" 
          : "bg-[#1C1840]/40 border-white/5 shadow-xl"
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-amber-500 uppercase tracking-wider font-serif">
              {language === "ta" ? "குறிப்பிட்ட அடி அளவு பலன் காண" : "Check Specific Dimension Outcome"}
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={language === "ta" ? "உதாரணம்: 16" : "Example: 16"}
                value={customFeet}
                onChange={(e) => handleCustomFeetChange(e.target.value)}
                className={`flex-1 px-3 py-2 rounded-lg border text-sm font-semibold transition-all ${
                  isLight
                    ? "bg-white border-gray-300 text-gray-900 focus:ring-1 focus:ring-amber-500/30"
                    : "bg-black/40 border-white/10 text-white focus:ring-1 focus:ring-amber-500/30"
                }`}
              />
              <div className={`px-4 py-2 border rounded-lg font-bold text-xs flex items-center justify-center uppercase ${
                isLight ? "bg-amber-50 border-amber-500/20 text-[#B45309]" : "bg-amber-500/10 border-amber-500/25 text-amber-400"
              }`}>
                {language === "ta" ? "அடி" : "Feet"}
              </div>
            </div>

            <div className={`p-4 rounded-xl border space-y-3 ${
              selectedResult.isAuspicious
                ? isLight ? "bg-emerald-500/5 border-emerald-500/10" : "bg-emerald-500/5 border-emerald-500/20"
                : isLight ? "bg-rose-500/5 border-rose-500/10" : "bg-rose-500/5 border-rose-500/20"
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  selectedResult.isAuspicious
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                }`}>
                  {selectedFeet} {language === "ta" ? "அடி பலன்" : "Feet Prediction"}
                </span>
                <span className={`text-xs font-bold ${selectedResult.isAuspicious ? "text-emerald-500" : "text-rose-500"}`}>
                  {selectedResult.isAuspicious ? (language === "ta" ? "சுபம்" : "Auspicious") : (language === "ta" ? "அசுபம்" : "Inauspicious")}
                </span>
              </div>
              <div>
                <p className={`text-lg font-bold ${isLight ? "text-gray-900" : "text-white"}`}>
                  {language === "ta" ? selectedResult.labelTamil : selectedResult.labelEnglish}
                </p>
              </div>
            </div>
          </div>

          {/* Catalog & Search list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-amber-500 uppercase tracking-wider font-serif">
                {language === "ta" ? "அனைத்து பலன்கள் பட்டியல்" : "Classic Measurements Catalog"}
              </h4>
              <div className="relative w-40">
                <input
                  type="text"
                  placeholder={language === "ta" ? "தேடுக..." : "Search..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-7 pr-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                    isLight
                      ? "bg-white border-gray-300 text-gray-900"
                      : "bg-black/30 border-white/5 text-white"
                  }`}
                />
                <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-2" />
              </div>
            </div>

            <div className={`border rounded-2xl overflow-y-auto max-h-[180px] p-2 space-y-1.5 custom-scrollbar ${
              isLight ? "bg-gray-50 border-gray-200" : "bg-black/25 border-white/5"
            }`}>
              {filteredMeasurements.map((m) => (
                <button
                  key={m.feet}
                  onClick={() => handleSelectMeasurement(m.feet)}
                  className={`w-full p-2.5 rounded-xl border text-left flex justify-between items-center transition-all ${
                    selectedFeet === m.feet
                      ? isLight
                        ? "bg-amber-100 border-amber-500/40 shadow-sm"
                        : "bg-[#251D12]/30 border-amber-500/45"
                      : m.isAuspicious
                        ? isLight
                          ? "bg-white border-gray-100 hover:border-emerald-500/20 text-gray-800"
                          : "bg-white/5 border-transparent hover:border-emerald-500/20 text-gray-200"
                        : isLight
                          ? "bg-white border-gray-100 hover:border-rose-500/20 text-gray-800"
                          : "bg-white/5 border-transparent hover:border-rose-500/20 text-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-12 text-center text-xs font-black py-0.5 rounded ${
                      m.isAuspicious
                        ? isLight ? "bg-emerald-100 text-emerald-800" : "bg-emerald-500/15 text-emerald-400"
                        : isLight ? "bg-rose-100 text-rose-800" : "bg-rose-500/15 text-rose-400"
                    }`}>
                      {m.feet} {language === "ta" ? "அடி" : "Ft"}
                    </span>
                    <span className="text-xs font-semibold">
                      {language === "ta" ? m.labelTamil : m.labelEnglish}
                    </span>
                  </div>
                  <span className={`h-2 w-2 rounded-full flex-shrink-0 ${m.isAuspicious ? "bg-emerald-500" : "bg-rose-500"}`} />
                </button>
              ))}
              {filteredMeasurements.length === 0 && (
                <div className="text-center py-6 text-xs text-gray-500">
                  {language === "ta" ? "பொருத்தமான அளவுகள் எதுவும் இல்லை" : "No matching measurements found"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Informational Banner ── */}
      <div className={`p-4 rounded-2xl border flex items-start gap-2.5 ${
        isLight ? "bg-amber-50/40 border-amber-500/10 text-amber-900" : "bg-amber-500/5 border-amber-500/10 text-amber-200"
      }`}>
        <Info className="h-4.5 w-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed opacity-90">
          {language === "ta" 
            ? "120 அடிக்கு மேல் உள்ள அனைத்து மனை அளவுகளும் பொதுவாக சுப பலன் தருவன என்று வாஸ்து சாஸ்திரம் கூறுகிறது. நீள அகல பெருக்கம் இரட்டைப் படை எண்களாக இருப்பது உன்னதம்." 
            : "Vastu scriptures mention that all house measurements exceeding 120 feet inherently project a highly favorable, auspicious cosmic vibration. Standard sizing layouts in even numbered multipliers are preferred."
          }
        </p>
      </div>
    </div>
	</ScreenGuard>
  );
}

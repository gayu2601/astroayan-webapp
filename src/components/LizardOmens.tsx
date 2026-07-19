import React, { useState } from "react";
import { ShieldCheck, User, CheckCircle2, AlertCircle, AlertTriangle, Sparkles, Compass, HelpCircle } from "lucide-react";
import ScreenGuard from './ScreenGuard';

interface LizardOmensProps {
  language: "ta" | "en";
  isLight?: boolean;
}

interface OmenItem {
  part: string;
  partEn: string;
  result: string;
  resultEn: string;
  type: "good" | "warn" | "neutral";
}

interface Section {
  label: string;
  sub: string;
  items: OmenItem[];
}

const SECTIONS: Section[] = [
  {
    label: "தலை & முகம் (Head & Face)",
    sub: "Head",
    items: [
      { part: "தலை", partEn: "Head", result: "கலகம் / சண்டை", resultEn: "Disputes or conflicts", type: "neutral" },
      { part: "குடுமி", partEn: "Tuft of Hair", result: "சுகம் மற்றும் அமைதி", resultEn: "Comfort & peace", type: "good" },
      { part: "கூந்தல்", partEn: "Hair", result: "தன லாபம்", resultEn: "Financial gains", type: "good" },
      { part: "முகம்", partEn: "Face", result: "பத்து தரிசனம் / நல்வாய்ப்பு", resultEn: "Fortunate opportunities", type: "good" },
      { part: "நெற்றி", partEn: "Forehead", result: "பதவி உயர்வு / பட்டாபிஷேகம்", resultEn: "Promotion or high status", type: "good" },
      { part: "வலப்புறம்", partEn: "Right Head Side", result: "ராஜானுக்கிரகம் / அரசாங்க நன்மை", resultEn: "Government support & honor", type: "good" },
      { part: "இடது மத்தியில்", partEn: "Left Head Side", result: "சிறு தடைகள் / விசனம்", resultEn: "Minor obstacles or sorrow", type: "warn" },
      { part: "வலது கபாலம்", partEn: "Right Skull", result: "பொருள் சேர்க்கை / சம்பத்து", resultEn: "Wealth accumulation", type: "good" },
      { part: "இட கபாலம்", partEn: "Left Skull", result: "அன்பும் பாசமும் பெருகும்", resultEn: "Increase in affection", type: "good" }
    ]
  },
  {
    label: "கண் & முகம் (Eyes & Face)",
    sub: "Eyes & Face",
    items: [
      { part: "வலக்கண்", partEn: "Right Eye", result: "நற்பலன்கள் / சுபம்", resultEn: "Highly auspicious outcomes", type: "good" },
      { part: "இடக்கண்", partEn: "Left Eye", result: "கட்டுப்படுதல் / அமைதி", resultEn: "Discipline or calmness", type: "neutral" },
      { part: "மூக்கு", partEn: "Nose", result: "வியாதி / சோர்வு", resultEn: "Health issues or fatigue", type: "warn" },
      { part: "மூக்கு நுனி", partEn: "Tip of Nose", result: "விசனம் / கவலை", resultEn: "Mental anxiety or worry", type: "warn" },
      { part: "மேல் உதடு", partEn: "Upper Lip", result: "பொருள் நாசம் / இழப்பு", resultEn: "Loss of wealth", type: "warn" },
      { part: "கீழ் உதடு", partEn: "Lower Lip", result: "தனலாபம் / பண வரவு", resultEn: "Financial income", type: "good" },
      { part: "வாய்க்கடை", partEn: "Corner of Mouth", result: "ராஜதண்டனை / கண்டனம்", resultEn: "Criticism or penalty", type: "warn" },
      { part: "வாய்", partEn: "Mouth", result: "சிறு பயம் / கவலை", resultEn: "Minor fears", type: "warn" }
    ]
  },
  {
    label: "காது & கழுத்து (Ear & Neck)",
    sub: "Ear & Neck",
    items: [
      { part: "வலது காது", partEn: "Right Ear", result: "தீர்க்காயுசு / நல் ஆரோக்கியம்", resultEn: "Longevity & robust health", type: "good" },
      { part: "இடது காது", partEn: "Left Ear", result: "வியாபார வெற்றி / லாபம்", resultEn: "Trade success & gain", type: "good" },
      { part: "கழுத்து", partEn: "Neck", result: "சத்ரு நாசம் / எதிரிகள் விலகுதல்", resultEn: "Destruction of enemies", type: "good" }
    ]
  },
  {
    label: "மேல் உடல் (Upper Body)",
    sub: "Upper Body",
    items: [
      { part: "வலது புஜம்", partEn: "Right Shoulder", result: "ஆரோக்கிய மேம்பாடு", resultEn: "Improvement in wellness", type: "good" },
      { part: "இடது புஜம்", partEn: "Left Shoulder", result: "ஸ்த்ரீ சுகம் / தம்பதி இணக்கம்", resultEn: "Marital happiness", type: "good" },
      { part: "வலக்கை", partEn: "Right Hand", result: "வீண் விரயம் / துக்கம்", resultEn: "Sorrow or waste of efforts", type: "warn" },
      { part: "இடக்கை", partEn: "Left Hand", result: "மனத்துயரம் / சோர்வு", resultEn: "Sadness or lethargy", type: "warn" },
      { part: "வலது மணிக்கட்டு", partEn: "Right Wrist", result: "பீடை / தடைகள்", resultEn: "Obstacles or misfortune", type: "warn" },
      { part: "இடது மணிக்கட்டு", partEn: "Left Wrist", result: "கீர்த்தி / புகழ்", resultEn: "Fame & social honor", type: "good" },
      { part: "வலது கை விரல்", partEn: "Right Fingers", result: "ராஜசமானம் / உயர்வு", resultEn: "High honor & success", type: "good" },
      { part: "இடக்கை விரல்", partEn: "Left Fingers", result: "சிறிய கவலைகள்", resultEn: "Minor worries", type: "warn" }
    ]
  },
  {
    label: "மார்பு & வயிறு (Chest & Abdomen)",
    sub: "Chest & Abdomen",
    items: [
      { part: "மார்பு", partEn: "Chest", result: "தனலாபம் / அதிர்ஷ்டம்", resultEn: "Financial luck", type: "good" },
      { part: "வலது ஸ்தனம்", partEn: "Right Breast", result: "பாப சம்பவம் / கவலை", resultEn: "Minor bad news", type: "warn" },
      { part: "இடது ஸ்தனம்", partEn: "Left Breast", result: "சௌக்கியம் / வசதிகள்", resultEn: "Comforts & wellness", type: "good" },
      { part: "தேகம் (பொதுவாக)", partEn: "General Body", result: "தீர்க்காயுசு", resultEn: "Longevity", type: "good" },
      { part: "வலது விலா எலும்பு", partEn: "Right Ribs", result: "வாழ்க்கை மேம்பாடு / உயர்வு", resultEn: "Life upgrade", type: "good" },
      { part: "இடது விலா எலும்பு", partEn: "Left Ribs", result: "வீண் செலவு / கெடுதல்", resultEn: "Unnecessary expenses", type: "warn" },
      { part: "வயிறு", partEn: "Abdomen", result: "தான்ய லாபம் / சுவையான உணவு", resultEn: "Abundance of grains & delicious food", type: "good" },
      { part: "நாபி (தொப்புள்)", partEn: "Navel", result: "ரத்தின லாபம் / ஆபரண சேர்க்கை", resultEn: "Gems or jewelry gains", type: "good" }
    ]
  },
  {
    label: "கீழ் உடல் (Lower Body)",
    sub: "Lower Body",
    items: [
      { part: "முதுகு", partEn: "Back", result: "பொருள் நாசம்", resultEn: "Loss of items", type: "warn" },
      { part: "வலது/இடது தொடை", partEn: "Thighs", result: "சுப பிரயாணம் / பயணம்", resultEn: "Joyful travel", type: "good" },
      { part: "முழங்கால்கள்", partEn: "Knees", result: "சுகம் தரும் பயணங்கள்", resultEn: "Comfortable journeys", type: "good" },
      { part: "கணுக்கால்கள்", partEn: "Ankles", result: "ஆரோக்கிய நன்மை", resultEn: "Health benefits", type: "good" },
      { part: "பாதங்கள்", partEn: "Feet", result: "வெற்றிகரமான பயணம்", resultEn: "Successful journey", type: "good" },
      { part: "கால் விரல் நகங்கள்", partEn: "Toenails", result: "பொருள் இழப்பு / நஷ்டம்", resultEn: "Financial losses", type: "warn" },
      { part: "தேகத்தில் ஓடுதல்", partEn: "Running across body", result: "தீர்க்காயுசு / ஆயுள் விருத்தி", resultEn: "Longevity & life extension", type: "good" }
    ]
  }
];

export default function LizardOmens({ language, isLight = false }: LizardOmensProps) {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [selectedPart, setSelectedPart] = useState<string>("தலை");
  const [hasChecked, setHasChecked] = useState<boolean>(true);

  // Flatten all items for the dropdown
  const allParts = SECTIONS.reduce((acc, sec) => {
    return [...acc, ...sec.items];
  }, [] as OmenItem[]);

  const currentItem = allParts.find(p => p.part === selectedPart) || allParts[0];

  // Dynamic reading depending on gender
  const getDynamicReading = (item: OmenItem, gen: "male" | "female") => {
    const isTa = language === "ta";
    
    // Custom Head logic matching the original App.tsx
    if (item.part === "தலை" || item.partEn === "Head") {
      if (gen === "male") {
        return {
          verdict: isTa 
            ? "கலகம் அல்லது பெரும் சண்டை நேரிடலாம், அமைதி காக்கவும்." 
            : "Disputes or dynamic conflicts may arise. Maintain mental peace.",
          type: "warn" as const
        };
      } else {
        return {
          verdict: isTa 
            ? "மிகுந்த பயமும் கவலையும் வரலாம், அம்பிகை வழிபாடு நலம் தரும்." 
            : "Anxiety or fear might emerge. Prayers to Goddess Durga highly beneficial.",
          type: "warn" as const
        };
      }
    }

    // Traditional Gender Inverse Theory
    // For males, right side is good, left side is warning
    // For females, left side is good, right side is warning
    const partName = item.part.toLowerCase();
    const isRightSide = partName.includes("வலது") || partName.includes("வலக்");
    const isLeftSide = partName.includes("இடது") || partName.includes("இடக்");

    if (isRightSide) {
      if (gen === "female") {
        return {
          verdict: isTa 
            ? `மத்திம பலன். ${item.result} கிடைக்கச் சற்று தாமதம் ஆகலாம், சிறிய மனக்கவலை.` 
            : `Moderate prediction. Benefits from ${item.resultEn} might see slight delay or mental concern.`,
          type: "neutral" as const
        };
      }
    } else if (isLeftSide) {
      if (gen === "female") {
        return {
          verdict: isTa 
            ? `மிகவும் நற்பலன் தரும். ${item.result} மற்றும் சிறந்த சுப பலன்கள் வந்து சேரும்.` 
            : `Highly Auspicious. Brings joyful progress in ${item.resultEn} and immediate success.`,
          type: "good" as const
        };
      } else {
        return {
          verdict: isTa
            ? `சிரமம் அல்லது தன நஷ்டம் நேரலாம். விரயங்களைத் தவிர்க்கவும்.`
            : `Potential challenges or loss of resources. Avoid high expenditures.`,
          type: "warn" as const
        };
      }
    }

    return {
      verdict: isTa ? item.result : item.resultEn,
      type: item.type
    };
  };

  const dynamicResult = getDynamicReading(currentItem, gender);

  return (
  <ScreenGuard featureId="palli_palan">
    <div className="space-y-6">
      {/* ── Interactive Form ── */}
      <div className={`p-6 rounded-3xl border transition-all ${
        isLight 
          ? "bg-amber-500/5 border-amber-500/20 shadow-sm" 
          : "bg-[#1C1840]/40 border-amber-500/10 shadow-xl"
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-serif font-bold text-amber-500">
            {language === "ta" ? "பல்லி விழும் பலன் கண்டறிய" : "Lizard Falling Omen Checker"}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Gender Selection */}
            <div>
              <label className={`block text-xs font-bold ${isLight ? "text-gray-700" : "text-gray-400"} mb-1.5 uppercase tracking-wide`}>
                {language === "ta" ? "பாலினம் (Gender)" : "Gender"}
              </label>
              <div className="flex gap-2">
                {[
                  { id: "male", labelEn: "Male", labelTa: "ஆண்" },
                  { id: "female", labelEn: "Female", labelTa: "பெண்" }
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setGender(g.id as any);
                      setHasChecked(true);
                    }}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all uppercase tracking-wider ${
                      gender === g.id
                        ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/10"
                        : isLight
                          ? "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          : "bg-black/30 border-white/5 text-gray-400 hover:bg-black/40"
                    }`}
                  >
                    <User className="h-3.5 w-3.5 inline mr-1" />
                    {language === "ta" ? g.labelTa : g.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Body Part Selection */}
            <div>
              <label className={`block text-xs font-bold ${isLight ? "text-gray-700" : "text-gray-400"} mb-1.5 uppercase tracking-wide`}>
                {language === "ta" ? "உடல் பாகத்தைத் தேர்ந்தெடுக்கவும்" : "Select Body Part"}
              </label>
              <select
                value={selectedPart}
                onChange={(e) => {
                  setSelectedPart(e.target.value);
                  setHasChecked(true);
                }}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold focus:ring-1 focus:ring-amber-500/30 transition-all ${
                  isLight
                    ? "bg-white border-gray-300 text-gray-900"
                    : "bg-black/40 border-white/10 text-white"
                }`}
              >
                {allParts.map((item, idx) => (
                  <option key={idx} value={item.part} className="bg-[#2C2C35] text-white">
                    {language === "ta" ? `${item.part} (${item.partEn})` : `${item.partEn} (${item.part})`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Result Panel */}
          <div className="flex flex-col justify-between">
            {hasChecked && currentItem && (
              <div className={`p-5 rounded-2xl border flex-1 flex flex-col justify-center space-y-3.5 transition-all animate-fade-in ${
                dynamicResult.type === "good"
                  ? isLight
                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-950"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : dynamicResult.type === "warn"
                    ? isLight
                      ? "bg-rose-500/5 border-rose-500/20 text-rose-950"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    : isLight
                      ? "bg-amber-500/5 border-amber-500/20 text-amber-950"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-400"
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-black tracking-wider uppercase px-2.5 py-1 rounded-full border ${
                    dynamicResult.type === "good"
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-500"
                      : dynamicResult.type === "warn"
                        ? "bg-rose-500/10 border-rose-500/25 text-rose-500"
                        : "bg-amber-500/10 border-amber-500/25 text-amber-500"
                  }`}>
                    {dynamicResult.type === "good"
                      ? (language === "ta" ? "சுபம் • நல் யோகம்" : "Auspicious • Good Fortune")
                      : dynamicResult.type === "warn"
                        ? (language === "ta" ? "பரிகாரம் தேவை • தோஷம்" : "Caution • Remedy Recommended")
                        : (language === "ta" ? "மத்திமம் • சாமான்யம்" : "Neutral • Normal")
                    }
                  </span>
                  {dynamicResult.type === "good" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : dynamicResult.type === "warn" ? (
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                  ) : (
                    <Compass className="h-5 w-5 text-amber-500" />
                  )}
                </div>

                <div>
                  <h4 className={`text-base font-bold ${isLight ? "text-gray-900" : "text-white"}`}>
                    {language === "ta" ? `${currentItem.part} மீது விழுந்த பலன்:` : `Omen for Lizard on ${currentItem.partEn}:`}
                  </h4>
                  <p className={`text-sm font-semibold mt-1 font-serif text-amber-500`}>
                    {language === "ta" ? currentItem.result : currentItem.resultEn}
                  </p>
                  <p className={`text-xs mt-2.5 leading-relaxed ${isLight ? "text-gray-700" : "text-gray-300"}`}>
                    {dynamicResult.verdict}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Remedy Card ── */}
      <div className={`p-5 rounded-3xl border space-y-2.5 ${
        isLight ? "bg-amber-50/50 border-amber-500/10 text-amber-900" : "bg-white/5 border-white/5 text-gray-200"
      }`}>
        <h4 className="text-sm font-serif font-bold text-amber-500 flex items-center gap-1.5 uppercase tracking-wide">
          <ShieldCheck className="h-4.5 w-4.5" />
          {language === "ta" ? "🪔 தோஷ பரிகாரம் (Vedic Remedy)" : "🪔 Spiritual Remedial Guidelines"}
        </h4>
        <div className={`h-px w-full ${isLight ? "bg-amber-500/15" : "bg-white/5"}`} />
        <p className="text-xs leading-relaxed opacity-90">
          {language === "ta"
            ? "தோஷமுள்ள இடங்களில் பல்லி விழுந்தால் உடனே தலைக்கு குளித்துவிட்டு இஷ்ட தெய்வத்தை வணங்கவும். காஞ்சிபுரம் வரதராஜ பெருமாள் கோவிலும், தங்கப் பல்லியைத் தொட்டு வணங்குவதும் மிகச் சிறந்த பரிகாரமாகும்."
            : "If a lizard falls on a caution-flagged body part, take a clean bath immediately and pray to your family deity. Visiting the golden & silver lizard sanctum in Kanchipuram Varadharaja Perumal Temple is traditionally believed to dissolve all dosha effects."
          }
        </p>
      </div>

      {/* ── Structured Grid Body Catalog ── */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-amber-500 uppercase tracking-wider font-serif">
          {language === "ta" ? "சரீர சாஸ்திர முழு விபரம் (Full Catalog)" : "Detailed Segment-by-Segment Catalog"}
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SECTIONS.map((sec, sIdx) => (
            <div key={sIdx} className={`p-5 rounded-2xl border space-y-3 ${
              isLight ? "bg-white border-gray-200 shadow-sm" : "bg-black/20 border-white/5"
            }`}>
              <h5 className={`text-xs font-black uppercase tracking-wider ${isLight ? "text-gray-900" : "text-amber-500"}`}>
                ✦ {sec.label}
              </h5>

              <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1.5 custom-scrollbar">
                {sec.items.map((item, iIdx) => {
                  const itemResult = getDynamicReading(item, gender);
                  
                  let badgeBg = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                  if (itemResult.type === "good") badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                  if (itemResult.type === "warn") badgeBg = "bg-rose-500/10 text-rose-400 border-rose-500/20";

                  return (
                    <div 
                      key={iIdx}
                      onClick={() => {
                        setSelectedPart(item.part);
                        setHasChecked(true);
                      }}
                      className={`p-2.5 rounded-xl border text-left flex justify-between items-center transition-all cursor-pointer ${
                        selectedPart === item.part
                          ? isLight
                            ? "bg-amber-100 border-amber-500/40"
                            : "bg-[#251D12]/30 border-amber-500/45"
                          : isLight
                            ? "bg-gray-50 border-gray-100 hover:border-gray-200"
                            : "bg-white/5 border-transparent hover:border-white/10"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className={`text-xs font-bold ${isLight ? "text-gray-900" : "text-white"}`}>
                          {language === "ta" ? item.part : item.partEn}
                        </p>
                        <p className={`text-[10px] ${isLight ? "text-gray-600" : "text-gray-400"}`}>
                          {language === "ta" ? item.result : item.resultEn}
                        </p>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${badgeBg}`}>
                        {itemResult.type === "good" ? (language === "ta" ? "சுபம்" : "Good") : itemResult.type === "warn" ? (language === "ta" ? "தோஷம்" : "Caution") : (language === "ta" ? "சாமான்யம்" : "Neutral")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
	</ScreenGuard>
  );
}

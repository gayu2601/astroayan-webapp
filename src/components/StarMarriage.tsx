import React, { useState } from "react";
import { Heart, Compass, Star, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, ListFilter, Info } from "lucide-react";
import ScreenGuard from './ScreenGuard';

interface StarMarriageProps {
  language: "ta" | "en";
  isLight?: boolean;
}

// ── Data from stars.js ────────────────────────────────────────────────────────
const NAKSH: [string, string][] = [
  ["Ashwini", "அஸ்வினி"],
  ["Bharani", "பரணி"],
  ["Krittika", "கிருத்திகை"],
  ["Rohini", "ரோகிணி"],
  ["Mrigashira", "மிருகசீரிஷம்"],
  ["Ardra", "திருவாதிரை"],
  ["Punarvasu", "புனர்பூசம்"],
  ["Pushya", "பூசம்"],
  ["Ashlesha", "ஆயில்யம்"],
  ["Magha", "மகம்"],
  ["Purva Phalguni", "பூரம்"],
  ["Uttara Phalguni", "உத்திரம்"],
  ["Hasta", "அஸ்தம்"],
  ["Chitra", "சித்திரை"],
  ["Swati", "சுவாதி"],
  ["Vishakha", "விசாகம்"],
  ["Anuradha", "அனுஷம்"],
  ["Jyeshtha", "கேட்டை"],
  ["Mula", "மூலம்"],
  ["Purva Ashadha", "பூராடம்"],
  ["Uttara Ashadha", "உத்திராடம்"],
  ["Shravana", "திருவோணம்"],
  ["Dhanishta", "அவிட்டம்"],
  ["Shatabhisha", "சதயம்"],
  ["Purva Bhadrapada", "பூரட்டாதி"],
  ["Uttara Bhadrapada", "உத்திரட்டாதி"],
  ["Revati", "ரேவதி"]
];

const NAKSH_RASI = [
  0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5,
  6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11
];

const RASI_NAMES_EN = ["Mesha", "Rishabha", "Mithuna", "Kataka", "Simha", "Kanya", "Thula", "Vrischika", "Dhanus", "Makara", "Kumbha", "Meena"];
const RASI_NAMES_TA = ["மேஷம்", "ரிஷபம்", "மிதுனம்", "கடகம்", "சிம்மம்", "கன்னி", "துலாம்", "விருச்சிகம்", "தனுசு", "மகரம்", "கும்பம்", "மீனம்"];

const TARA_NAMES_EN = ["", "Janma", "Sampat", "Vipat", "Kshema", "Pratyak", "Sadhana", "Naidhana", "Mitra", "Parama Mitra"];
const TARA_NAMES_TA = ["", "ஜன்ம", "சம்பத்", "விபத்", "க்ஷேம", "ப்ரத்யக்", "சாதன", "நைதன", "மித்ர", "பரம மித்ர"];

const VARNA = [3, 2, 1, 4, 4, 1, 3, 2, 1, 4, 3, 3, 2, 4, 3, 4, 2, 2, 4, 3, 4, 2, 1, 1, 3, 2, 3];
const VASHYA = [1, 1, 5, 4, 5, 5, 1, 4, 5, 1, 1, 3, 4, 5, 5, 3, 4, 5, 1, 1, 3, 4, 1, 1, 3, 4, 4];
const YONI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 14, 12, 13, 11, 10, 9, 8, 7, 6, 3, 4, 5, 1];
const GANA = [1, 2, 3, 1, 1, 3, 1, 1, 3, 2, 2, 1, 1, 3, 1, 3, 1, 2, 3, 2, 1, 1, 3, 3, 2, 1, 1];
const LORD = [7, 6, 3, 2, 4, 8, 4, 8, 2, 8, 6, 3, 2, 4, 8, 4, 8, 2, 8, 6, 3, 2, 8, 8, 4, 8, 4];
const NADI = [1, 2, 3, 3, 2, 1, 1, 2, 3, 3, 2, 1, 1, 2, 3, 3, 2, 1, 1, 2, 3, 3, 2, 1, 1, 2, 3];

const TIER_WEIGHTS: Record<number, number> = { 1: 0, 2: 3, 3: 0, 4: 3, 5: 0, 6: 3, 7: 0, 8: 1.5, 9: 3 };
const YONI_ENEMIES = [[1, 2], [3, 4], [5, 6], [7, 8], [9, 10], [11, 12], [13, 14]];
const PLANET_FRIENDS: Record<number, number[]> = { 2: [3, 4, 8], 3: [2, 4, 8], 4: [2, 3, 8], 6: [7, 8], 7: [6, 8], 8: [2, 6, 7] };

// ── Pada helper functions ───────────────────────────────────────────────────
function padaIndex(nakIdx: number, pada: number) {
  return nakIdx * 4 + (pada - 1);
}

function nakFromPada(pi: number) {
  return Math.floor(pi / 4);
}

// ── Ashtakoot Kootas Calculators ──────────────────────────────────────────────
function getTier(d: number) {
  const t = d % 9;
  return t === 0 ? 9 : t;
}

interface KootaResults {
  total: number;
  varna: number;
  vashya: number;
  tara: number;
  yoni: number;
  graha: number;
  gana: number;
  bhakoot: number;
  nadi: number;
  taraLabel: string;
  taraLabelTa: string;
}

function calcKootas(gPada: number, bPada: number): KootaResults {
  const g = nakFromPada(gPada);
  const b = nakFromPada(bPada);

  // Varna — nakshatra level
  const varna = VARNA[g] >= VARNA[b] ? 1 : 0;

  // Vashya — nakshatra level
  const gv = VASHYA[g];
  const bv = VASHYA[b];
  const vf: Record<number, number[]> = { 1: [4, 5], 3: [1], 4: [1, 5], 5: [1, 4] };
  let vashya = 0;
  if (gv === bv) vashya = 2;
  else if (vf[gv]?.includes(bv)) vashya = 1;
  else if (vf[bv]?.includes(gv)) vashya = 0.5;

  // Tara — pada level
  const d1 = ((bPada - gPada + 108) % 108) + 1;
  const d2 = ((gPada - bPada + 108) % 108) + 1;
  const t1 = getTier(d1);
  const t2 = getTier(d2);
  const tara = (TIER_WEIGHTS[t1] + TIER_WEIGHTS[t2]) / 2;
  const taraLabel = TARA_NAMES_EN[t1];
  const taraLabelTa = TARA_NAMES_TA[t1];

  // Yoni — nakshatra level
  const gy = YONI[g];
  const by = YONI[b];
  let yoni = 1;
  if (gy === by) {
    yoni = 4;
  } else {
    let enemy = false;
    for (const p of YONI_ENEMIES) {
      if (p.includes(gy) && p.includes(by)) {
        enemy = true;
        break;
      }
    }
    if (enemy) {
      yoni = 0;
    } else {
      const a: Record<number, number[]> = {
        1: [7], 2: [8], 3: [9], 4: [10], 5: [11], 6: [12], 7: [1],
        8: [2], 9: [3], 10: [4], 11: [5], 12: [6], 13: [14], 14: [13]
      };
      if (a[gy]?.includes(by) || a[by]?.includes(gy)) yoni = 2;
    }
  }

  // Graha Maitri — nakshatra level
  const gl = LORD[g];
  const bl = LORD[b];
  let graha = 1;
  if (gl === bl) {
    graha = 5;
  } else if ((PLANET_FRIENDS[gl] || []).includes(bl) && (PLANET_FRIENDS[bl] || []).includes(gl)) {
    graha = 5;
  } else if ((PLANET_FRIENDS[gl] || []).includes(bl) || (PLANET_FRIENDS[bl] || []).includes(gl)) {
    graha = 4;
  }

  // Gana — nakshatra level
  const gg = GANA[g];
  const bg2 = GANA[b];
  let gana = 0;
  if (gg === bg2) gana = 6;
  else if ((gg === 1 && bg2 === 2) || (gg === 2 && bg2 === 1)) gana = 5;
  else if ((gg === 2 && bg2 === 3) || (gg === 3 && bg2 === 2)) gana = 1;

  // Bhakoot — rasi level
  const gr = NAKSH_RASI[g];
  const br2 = NAKSH_RASI[b];
  let bhakoot = 3.5;
  if (gr === br2) {
    bhakoot = 7;
  } else {
    const diff = Math.abs(gr - br2);
    const d = diff < 6 ? diff : 12 - diff;
    if ([1, 2, 3, 4, 5, 7, 9, 11].includes(d)) bhakoot = 7;
    else if ([6, 8].includes(d)) bhakoot = 0;
  }

  // Nadi — nakshatra level
  const nadi = NADI[g] === NADI[b] ? 0 : 8;

  const total = varna + vashya + tara + yoni + graha + gana + bhakoot + nadi;
  return {
    total: Math.round(total * 2) / 2,
    varna,
    vashya,
    tara,
    yoni,
    graha,
    gana,
    bhakoot,
    nadi,
    taraLabel,
    taraLabelTa
  };
}

// Descriptions
const DESCRIPTIONS = [
  { min: 88, desc: "Passionate, sensuous, emotionally supportive", descTa: "உணர்ச்சிப்பூர்வமான ஆதரவு, சிறந்த காதல் இணக்கம் மற்றும் பிரியமான வாழ்வு." },
  { min: 80, desc: "Shared energy, mutual understanding", descTa: "பரஸ்பர புரிந்துணர்வு, பகிர்ந்துகொள்ளப்பட்ட ஆற்றல் மற்றும் அமைதி நிறைந்த வாழ்க்கை." },
  { min: 75, desc: "Adventurous trust, accepts vulnerabilities", descTa: "பரஸ்பர நம்பிக்கை, சவால்களை எதிர்கொள்ளும் திறமை மற்றும் நேர்மையான பிணைப்பு." },
  { min: 72, desc: "Soulmate-like connection, intense emotions", descTa: "மனப்பூர்வமான இணைப்பு, ஆழ்ந்த காதல் மற்றும் ஆன்மீக ரீதியிலான பிணைப்பு." },
  { min: 68, desc: "Intimate, empowering, protective bond", descTa: "பரஸ்பர பாதுகாப்பு, ஒருவருக்கொருவர் உதவும் மனப்பான்மை மற்றும் நெருக்கம்." },
  { min: 64, desc: "Unconventional love, breaks emotional barriers", descTa: "எல்லையற்ற அன்பு, தடைகளை உடைத்து வாழும் ஆர்வம் மற்றும் மகிழ்ச்சியான பிணைப்பு." },
  { min: 58, desc: "Passionate depth under cool exterior", descTa: "மேலோட்டமாக அமைதி தெரிந்தாலும், உள்ளுக்குள் ஆழமான பாசம் மற்றும் பொறுப்பு." },
  { min: 52, desc: "Stable partnership with steady affection", descTa: "நிலையான வாழ்க்கை துணை, சீரான அன்பும் அரவணைப்பும் கொண்ட நிதானமான இல்லறம்." },
  { min: 44, desc: "Compatible with effort and compromise", descTa: "சமரசங்கள் மற்றும் சிறந்த முயற்சிகளுடன் கூடிய சுமுகமான இணக்கமான இல்லறம்." },
  { min: 0, desc: "Challenging match, needs careful consideration", descTa: "சவால்கள் நிறைந்த பொருத்தம். மிகுந்த கவனமுடன் முடிவெடுக்கவும், ஆலோசனைகள் தேவை." }
];

function getDescription(pct: number, isTa: boolean) {
  for (const item of DESCRIPTIONS) {
    if (pct >= item.min) return isTa ? item.descTa : item.desc;
  }
  return "";
}

// ── Compatibility List Creator ──────────────────────────────────────────────
const MIN_POINTS = 18;

interface PadaCompatibility {
  pada: number;
  padaIdx: number;
  points: number;
  pct: number;
  desc: string;
  kootas: KootaResults;
}

interface StarCompatibilityEntry {
  idx: number;
  padas: PadaCompatibility[];
  bestPoints: number;
  bestPct: number;
  bestDesc: string;
}

function getCompatibility(birthPada: number, lookingFor: "male" | "female", isTa: boolean) {
  const comp: StarCompatibilityEntry[] = [];
  const avoid: StarCompatibilityEntry[] = [];
  const birthNak = nakFromPada(birthPada);

  for (let candNak = 0; candNak < 27; candNak++) {
    if (candNak === birthNak) continue;

    // Compute all 4 padas for this candidate nakshatra
    const padas: PadaCompatibility[] = [1, 2, 3, 4].map(p => {
      const candPada = padaIndex(candNak, p);
      // If looking for male, birthPada is girl and candPada is boy
      // If looking for female, birthPada is boy and candPada is girl
      const g = lookingFor === "female" ? birthPada : candPada;
      const b = lookingFor === "female" ? candPada : birthPada;
      const k = calcKootas(g, b);
      const points = Math.round(k.total);
      const pct = Math.round((k.total / 36) * 100);
      return {
        pada: p,
        padaIdx: candPada,
        points,
        pct,
        desc: getDescription(pct, isTa),
        kootas: k
      };
    });

    const bestPada = padas.reduce((a, b) => (b.points > a.points ? b : a));
    const entry: StarCompatibilityEntry = {
      idx: candNak,
      padas,
      bestPoints: bestPada.points,
      bestPct: bestPada.pct,
      bestDesc: bestPada.desc
    };

    if (bestPada.points >= MIN_POINTS) {
      comp.push(entry);
    } else {
      avoid.push(entry);
    }
  }

  comp.sort((a, b) => b.bestPoints - a.bestPoints || a.idx - b.idx);
  avoid.sort((a, b) => b.bestPoints - a.bestPoints || a.idx - b.idx);

  return { comp, avoid };
}

// Tara badge color config
const TARA_COLORS: Record<string, { bg: string; text: string }> = {
  "Parama Mitra": { bg: "bg-indigo-950/40", text: "text-indigo-400 border-indigo-500/20" },
  "Mitra": { bg: "bg-emerald-950/40", text: "text-emerald-400 border-emerald-500/20" },
  "Sadhana": { bg: "bg-emerald-950/40", text: "text-emerald-400 border-emerald-500/20" },
  "Sampat": { bg: "bg-amber-950/40", text: "text-amber-400 border-amber-500/20" },
  "Kshema": { bg: "bg-purple-950/40", text: "text-purple-400 border-purple-500/20" },
  "Janma": { bg: "bg-rose-950/40", text: "text-rose-400 border-rose-500/20" },
  "Vipat": { bg: "bg-rose-950/50", text: "text-rose-500 border-rose-500/20" },
  "Pratyak": { bg: "bg-orange-950/40", text: "text-orange-400 border-orange-500/20" },
  "Naidhana": { bg: "bg-rose-950/50", text: "text-rose-500 border-rose-500/20" }
};

// ── Sub-component: Koota progress bars ──────────────────────────────────────
const KOOTA_DEFS = [
  { key: "varna", label: "Varna", max: 1 },
  { key: "vashya", label: "Vashya", max: 2 },
  { key: "tara", label: "Tara", max: 3 },
  { key: "yoni", label: "Yoni", max: 4 },
  { key: "graha", label: "Graha", max: 5 },
  { key: "gana", label: "Gana", max: 6 },
  { key: "bhakoot", label: "Bhakoot", max: 7 },
  { key: "nadi", label: "Nadi", max: 8 }
];

function KootaBars({ kootas, isLight }: { kootas: KootaResults; isLight: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3 pt-3 pb-1 border-t border-white/5">
      {KOOTA_DEFS.map(({ key, label, max }) => {
        const val = kootas[key as keyof KootaResults] as number;
        const ratio = val / max;
        
        let barColor = "bg-rose-500";
        if (ratio >= 0.75) barColor = "bg-emerald-500";
        else if (ratio >= 0.4) barColor = "bg-amber-500";

        return (
          <div key={key} className="flex items-center justify-between text-[11px] font-mono">
            <span className={`w-14 font-semibold ${isLight ? "text-gray-700" : "text-gray-400"}`}>{label}</span>
            <div className={`flex-1 h-2 rounded-full mx-2 overflow-hidden ${isLight ? "bg-gray-200" : "bg-black/40"}`}>
              <div 
                className={`h-full rounded-full transition-all ${barColor}`} 
                style={{ width: `${Math.round(ratio * 100)}%` }}
              />
            </div>
            <span className={`w-8 text-right font-black ${isLight ? "text-gray-900" : "text-white"}`}>{val}/{max}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Sub-component: Expandable Pada Row ──────────────────────────────────────
function PadaRow({ padaData, isLight, defaultExpanded, language }: { padaData: PadaCompatibility; isLight: boolean; defaultExpanded: boolean; language: "ta" | "en" }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { pada, points, pct, kootas, desc } = padaData;

  const isAuspicious = points >= 18;
  const tc = TARA_COLORS[kootas.taraLabel] || { bg: "bg-white/5", text: "text-gray-400 border-white/5" };

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-300 ${
      isLight ? "border-gray-200 bg-white" : "border-white/5 bg-[#1F1B4E]/30"
    }`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex flex-wrap items-center justify-between gap-3 text-left hover:bg-white/5 transition-all"
      >
        <div className="flex items-center gap-2.5">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border uppercase ${
            isAuspicious 
              ? isLight ? "bg-emerald-50 text-emerald-700 border-emerald-500/20" : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
              : isLight ? "bg-rose-50 text-rose-700 border-rose-500/20" : "bg-rose-500/15 text-rose-400 border-rose-500/20"
          }`}>
            {language === "ta" ? `${pada} ஆம் பாதம்` : `Pada ${pada}`}
          </span>
          <span className="font-mono text-xs font-black text-amber-500">
            {points}/36 {language === "ta" ? "புள்ளிகள்" : "Points"}
          </span>
          <span className={`text-[10px] font-mono ${isLight ? "text-gray-600" : "text-gray-400"}`}>
            ({pct}%)
          </span>
        </div>

        <div className="flex items-center gap-2.5 ml-auto">
          {kootas.taraLabel && (
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${tc.bg} ${tc.text}`}>
              {language === "ta" ? `தாரா: ${kootas.taraLabelTa}` : `Tara: ${kootas.taraLabel}`}
            </span>
          )}
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          <p className={`text-[11px] leading-relaxed italic ${isLight ? "text-gray-600" : "text-gray-300"}`}>
            {desc}
          </p>
          <KootaBars kootas={kootas} isLight={isLight} />
        </div>
      )}
    </div>
  );
}

// ── Sub-component: Star Card ───────────────────────────────────────────────
function StarCard({ item, rank, isAvoid, isLight, language }: { item: StarCompatibilityEntry; rank: number; isAvoid: boolean; isLight: boolean; language: "ta" | "en" }) {
  const { idx, padas, bestPct, bestPoints } = item;
  const [en, ta] = NAKSH[idx];
  
  const rasiIdx = NAKSH_RASI[idx];
  const rasiName = language === "ta" ? RASI_NAMES_TA[rasiIdx] : RASI_NAMES_EN[rasiIdx];

  let cardStyle = "";
  if (isAvoid) {
    cardStyle = isLight 
      ? "bg-rose-500/5 border-rose-500/25 border-l-4 border-l-rose-500 text-rose-950" 
      : "bg-[#2A1116]/40 border-rose-500/20 border-l-4 border-l-rose-500 text-rose-300";
  } else if (rank === 0) {
    cardStyle = isLight
      ? "bg-amber-500/5 border-amber-500/30 border-l-4 border-l-amber-500 text-amber-950"
      : "bg-[#251D12]/40 border-amber-500/25 border-l-4 border-l-amber-500 text-amber-300";
  } else if (rank <= 3) {
    cardStyle = isLight
      ? "bg-emerald-500/5 border-emerald-500/25 border-l-4 border-l-emerald-500 text-emerald-950"
      : "bg-[#122018]/40 border-emerald-500/20 border-l-4 border-l-emerald-500 text-emerald-300";
  } else {
    cardStyle = isLight
      ? "bg-gray-50 border-gray-200 border-l-4 border-l-purple-500 text-gray-800"
      : "bg-white/5 border-white/5 border-l-4 border-l-purple-500 text-gray-200";
  }

  return (
    <div className={`p-4 rounded-2xl border flex flex-col space-y-3 transition-all ${cardStyle}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <h4 className={`text-lg font-bold font-serif ${isLight ? "text-gray-900" : "text-white"}`}>
            {language === "ta" ? ta : en} <span className="text-xs font-sans font-normal text-gray-400">({language === "ta" ? en : ta})</span>
          </h4>
          <p className="text-xs text-amber-500 font-semibold uppercase tracking-wider">
            {language === "ta" ? `ராசி: ${rasiName}` : `${rasiName} Rasi`}
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-mono font-black text-amber-400">
            {bestPct}%
          </div>
          <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            {bestPoints}/36 Max
          </div>
        </div>
      </div>

      <p className={`text-xs leading-relaxed opacity-90 ${isLight ? "text-gray-700" : "text-gray-300"}`}>
        {item.bestDesc}
      </p>

      <div className="h-px bg-white/5" />

      {/* 4 Padas list */}
      <div className="space-y-2">
        {padas.map((p, pIdx) => (
          <PadaRow
            key={p.pada}
            padaData={p}
            isLight={isLight}
            defaultExpanded={pIdx === 0}
            language={language}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function StarMarriage({ language, isLight = false }: StarMarriageProps) {
  const [starIdx, setStarIdx] = useState<number>(0);
  const [pada, setPada] = useState<number>(1);
  const [lookingFor, setLookingFor] = useState<"male" | "female">("female");
  const [results, setResults] = useState<{ comp: StarCompatibilityEntry[]; avoid: StarCompatibilityEntry[] } | null>(null);

  const calculateMatches = () => {
    const bp = padaIndex(starIdx, pada);
    const compatResult = getCompatibility(bp, lookingFor, language === "ta");
    setResults(compatResult);
  };

  // Trigger auto calc on start if star index is valid
  React.useEffect(() => {
    calculateMatches();
  }, [starIdx, pada, lookingFor, language]);

  return (
  <ScreenGuard featureId="porutham_star">
    <div className="space-y-6">
      {/* Controls Card */}
      <div className={`p-6 rounded-3xl border transition-all ${
        isLight 
          ? "bg-amber-500/5 border-amber-500/20 shadow-sm" 
          : "bg-[#1C1840]/40 border-amber-500/10 shadow-xl"
      }`}>
        <div className="flex items-center gap-2 mb-5">
          <Heart className="h-5.5 w-5.5 text-amber-500 animate-pulse" />
          <h3 className="text-lg font-serif font-bold text-amber-500 uppercase tracking-wider">
            {language === "ta" ? "நட்சத்திரப் பொருத்தத் தேடல்" : "Vedic Star Compatibility Calculator"}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Star Selection */}
          <div>
            <label className={`block text-xs font-bold ${isLight ? "text-gray-700" : "text-gray-400"} mb-1.5 uppercase tracking-wider`}>
              {language === "ta" ? "உங்கள் நட்சத்திரம்" : "Your Natal Moon Star"}
            </label>
            <select
              value={starIdx}
              onChange={(e) => setStarIdx(Number(e.target.value))}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                isLight
                  ? "bg-white border-gray-300 text-gray-900"
                  : "bg-black/40 border-white/10 text-white"
              }`}
            >
              {NAKSH.map(([en, ta], idx) => (
                <option key={idx} value={idx} className="bg-[#2C2C35] text-white">
                  {language === "ta" ? `${ta} (${en})` : `${en} (${ta})`}
                </option>
              ))}
            </select>
          </div>

          {/* Pada Selection */}
          <div>
            <label className={`block text-xs font-bold ${isLight ? "text-gray-700" : "text-gray-400"} mb-1.5 uppercase tracking-wider`}>
              {language === "ta" ? "பாதம்" : "Pada"}
            </label>
            <select
              value={pada}
              onChange={(e) => setPada(Number(e.target.value))}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                isLight
                  ? "bg-white border-gray-300 text-gray-900"
                  : "bg-black/40 border-white/10 text-white"
              }`}
            >
              {[1, 2, 3, 4].map(p => (
                <option key={p} value={p} className="bg-[#2C2C35] text-white">
                  {language === "ta" ? `${p} ஆம் பாதம்` : `Pada ${p}`}
                </option>
              ))}
            </select>
          </div>

          {/* Looking For Gender */}
          <div>
            <label className={`block text-xs font-bold ${isLight ? "text-gray-700" : "text-gray-400"} mb-1.5 uppercase tracking-wider`}>
              {language === "ta" ? "தேடும் வரன்" : "Looking for"}
            </label>
            <select
              value={lookingFor}
              onChange={(e) => setLookingFor(e.target.value as any)}
              className={`w-full px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                isLight
                  ? "bg-white border-gray-300 text-gray-900"
                  : "bg-black/40 border-white/10 text-white"
              }`}
            >
              <option value="female" className="bg-[#2C2C35] text-white">
                {language === "ta" ? "பெண் நட்சத்திர பொருத்தங்கள்" : "Compatible Female Stars"}
              </option>
              <option value="male" className="bg-[#2C2C35] text-white">
                {language === "ta" ? "ஆண் நட்சத்திர பொருத்தங்கள்" : "Compatible Male Stars"}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Informational Guidelines Legend */}
      <div className={`p-4 rounded-2xl border text-xs flex flex-wrap items-center justify-between gap-3 ${
        isLight ? "bg-amber-50/40 border-amber-500/10 text-amber-900" : "bg-amber-500/5 border-amber-500/10 text-amber-200"
      }`}>
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span>
            {language === "ta" 
              ? "புள்ளிகள் விளக்கம்: மத்திம பொருத்தம் ≥18 (50%), உத்தம பொருத்தம் ≥27 (75%)." 
              : "Scoring Guideline: Acceptable Match ≥18 pts (50%), Excellent Match ≥27 pts (75%)."
            }
          </span>
        </div>
        <div className="flex gap-4 text-[10px] font-bold">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {language === "ta" ? "மிக நன்று" : "Excellent"}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            {language === "ta" ? "மத்திமம்" : "Good"}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            {language === "ta" ? "பொருத்தம் இல்லை" : "Avoid"}
          </span>
        </div>
      </div>

      {results && (
        <div className="space-y-8">
          {/* Excellent & Good Matches Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <h4 className="text-sm font-black text-emerald-500 uppercase tracking-widest font-serif">
                {language === "ta" ? "பொருத்தமான நட்சத்திரங்கள் (Best Matches)" : "Highly Compatible Match Lists"}
              </h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {results.comp.map((entry, idx) => (
                <StarCard
                  key={entry.idx}
                  item={entry}
                  rank={idx}
                  isAvoid={false}
                  isLight={isLight}
                  language={language}
                />
              ))}
              {results.comp.length === 0 && (
                <div className="col-span-full text-center py-12 text-sm text-gray-500 bg-black/10 rounded-2xl border border-dashed border-white/5">
                  {language === "ta" ? "பொருத்தமான நட்சத்திரங்கள் எதுவும் இல்லை." : "No highly compatible stars found for this configuration."}
                </div>
              )}
            </div>
          </div>

          {/* Low Compatibility (Avoid) Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-500 animate-pulse" />
              <h4 className="text-sm font-black text-rose-500 uppercase tracking-widest font-serif">
                {language === "ta" ? "பொருத்தம் குறைந்த நட்சத்திரங்கள் (Avoid)" : "Stars with Low Compatibility (Avoid)"}
              </h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {results.avoid.map((entry, idx) => (
                <StarCard
                  key={entry.idx}
                  item={entry}
                  rank={idx}
                  isAvoid={true}
                  isLight={isLight}
                  language={language}
                />
              ))}
              {results.avoid.length === 0 && (
                <div className="col-span-full text-center py-12 text-sm text-gray-500 bg-black/10 rounded-2xl border border-dashed border-white/5">
                  {language === "ta" ? "தவிர்க்க வேண்டிய நட்சத்திரங்கள் எதுவும் இல்லை!" : "No avoid stars found!"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
	</ScreenGuard>
  );
}

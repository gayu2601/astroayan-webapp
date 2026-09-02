import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Leaf, Sparkles, AlertCircle, RefreshCw, Check } from 'lucide-react';

// ==========================================
// 1. DATA DICTIONARIES & HELPER LOGIC
// ==========================================

export interface VetrilaiPrasnamAppProps {
  language?: 'ta' | 'en';
  isLight?: boolean;
}

interface LeafOption {
  id: string;
  labelTa: string;
  labelEn: string;
  descTa: string;
  descEn: string;
  statusColor: string;
  statusDarkColor: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
}

const LEAF_CONDITIONS: LeafOption[] = [
  {
    id: 'green',
    labelTa: 'பசுமையான, முழுமையான வெற்றிலை',
    labelEn: 'Fresh, Whole Betel Leaf',
    descTa: 'வெற்றிலை குறைகள் இல்லாமல் பசுமையாக இருப்பதால் காரியம் 100% தடையின்றி வெற்றியடையும்.',
    descEn: 'Free of defects and vibrant green, assuring 100% unimpeded success in your endeavor.',
    statusColor: '#16a34a',
    statusDarkColor: '#22c55e',
    bgLight: '#f0fdf4',
    bgDark: 'rgba(22, 163, 74, 0.12)',
    borderLight: '#bbf7d0',
    borderDark: 'rgba(34, 197, 94, 0.3)',
  },
  {
    id: 'torn',
    labelTa: 'நுனி கிழிந்த வெற்றிலை',
    labelEn: 'Torn Tip of Leaf',
    descTa: 'காரியத்தின் இறுதிப் பகுதியில் சிறு மனக்கவலை அல்லது எதிர்பாராத தாமதம் ஏற்படலாம்.',
    descEn: 'Minor anxiety or unexpected delay may occur towards the completion phase.',
    statusColor: '#d97706',
    statusDarkColor: '#f59e0b',
    bgLight: '#fffbeb',
    bgDark: 'rgba(217, 119, 6, 0.12)',
    borderLight: '#fde68a',
    borderDark: 'rgba(245, 158, 11, 0.3)',
  },
  {
    id: 'holes',
    labelTa: 'ஓட்டை / கரையான் அரித்த வெற்றிலை',
    labelEn: 'Leaf with Holes / Insect Marks',
    descTa: 'எதிரிகளால் சிறு இடையூறுகள் அல்லது நிதி விரயங்கள் ஏற்பட வாய்ப்புள்ளதால் எச்சரிக்கை தேவை.',
    descEn: 'Minor hindrances from adversaries or financial leakage possible; extra vigilance advised.',
    statusColor: '#dc2626',
    statusDarkColor: '#ef4444',
    bgLight: '#fef2f2',
    bgDark: 'rgba(220, 38, 38, 0.12)',
    borderLight: '#fecaca',
    borderDark: 'rgba(239, 68, 68, 0.3)',
  },
  {
    id: 'withered',
    labelTa: 'வாடிய அல்லது காய்ந்த வெற்றிலை',
    labelEn: 'Withered or Dried Leaf',
    descTa: 'உடல் சோர்வு, முயற்சியில் மந்தநிலை மற்றும் எதிர்பார்த்த ஆதரவு கிடைப்பதில் தாமதம் வரலாம்.',
    descEn: 'Sluggishness in efforts, bodily fatigue, or delay in expected backing.',
    statusColor: '#ea580c',
    statusDarkColor: '#fb923c',
    bgLight: '#fff7ed',
    bgDark: 'rgba(234, 88, 12, 0.12)',
    borderLight: '#fed7aa',
    borderDark: 'rgba(251, 146, 60, 0.3)',
  },
  {
    id: 'nostem',
    labelTa: 'காம்பு இல்லாத வெற்றிலை',
    labelEn: 'Leaf Without Stem',
    descTa: 'காரியத்தின் தொடக்க நிலையில் சில தடுமாற்றங்களும் குழப்பங்களும் வரலாம்.',
    descEn: 'Initial hesitation, confusion, or faltering steps at the onset of the task.',
    statusColor: '#9333ea',
    statusDarkColor: '#c084fc',
    bgLight: '#faf5ff',
    bgDark: 'rgba(147, 51, 234, 0.12)',
    borderLight: '#e9d5ff',
    borderDark: 'rgba(192, 132, 252, 0.3)',
  },
];

interface PlanetItem {
  nameTa: string;
  nameEn: string;
  tagTa: string;
  tagEn: string;
  descTa: string;
  descEn: string;
  colorLight: string;
  colorDark: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
}

const PLANET_DATA: Record<number, PlanetItem> = {
  1: {
    nameTa: 'சூரியன்',
    nameEn: 'Sun (Surya)',
    tagTa: 'அதிகாரம் & வெற்றி',
    tagEn: 'Authority & Victory',
    descTa: 'அரசு வழி நன்மைகள், தலைமைப் பொறுப்பு மற்றும் காரிய சித்தி உண்டாகும்.',
    descEn: 'Benefits through government authorities, leadership positions, and triumphant success.',
    colorLight: '#c2410c',
    colorDark: '#fb923c',
    bgLight: '#fff7ed',
    bgDark: 'rgba(234, 88, 12, 0.12)',
    borderLight: '#fed7aa',
    borderDark: 'rgba(251, 146, 60, 0.35)',
  },
  2: {
    nameTa: 'சந்திரன்',
    nameEn: 'Moon (Chandran)',
    tagTa: 'மன அமைதி & பயணம்',
    tagEn: 'Peace of Mind & Travel',
    descTa: 'மன தெளிவு, இடமாற்றம், பயணம் மற்றும் தாய் வழி ஆதரவு கிடைக்கும்.',
    descEn: 'Mental serenity, pleasant journeys, relocations, and benevolent maternal support.',
    colorLight: '#0369a1',
    colorDark: '#38bdf8',
    bgLight: '#f0f9ff',
    bgDark: 'rgba(2, 132, 199, 0.12)',
    borderLight: '#bae6fd',
    borderDark: 'rgba(56, 189, 248, 0.35)',
  },
  3: {
    nameTa: 'செவ்வாய்',
    nameEn: 'Mars (Chevvai)',
    tagTa: 'தைரியம் & சொத்து',
    tagEn: 'Courage & Property',
    descTa: 'பூமி, நிலம் சார்ந்த சேர்க்கை மற்றும் எதிர்ப்புகளை முறியடிக்கும் பலன்.',
    descEn: 'Real estate and land gains, courage to take bold decisions, and overcoming opposition.',
    colorLight: '#b91c1c',
    colorDark: '#f87171',
    bgLight: '#fef2f2',
    bgDark: 'rgba(220, 38, 38, 0.12)',
    borderLight: '#fecaca',
    borderDark: 'rgba(248, 113, 113, 0.35)',
  },
  4: {
    nameTa: 'புதன்',
    nameEn: 'Mercury (Budhan)',
    tagTa: 'வியாபாரம் & கல்வி',
    tagEn: 'Business & Education',
    descTa: 'புத்தி கூர்மை, வியாபார விருத்தி, கல்வி மற்றும் காகிதத் தொடர்புகள் சாதகமாகும்.',
    descEn: 'Intellectual sharpness, commercial growth, academic progress, and favorable documentation.',
    colorLight: '#047857',
    colorDark: '#34d399',
    bgLight: '#ecfdf5',
    bgDark: 'rgba(5, 150, 105, 0.12)',
    borderLight: '#a7f3d0',
    borderDark: 'rgba(52, 211, 153, 0.35)',
  },
  5: {
    nameTa: 'குரு',
    nameEn: 'Jupiter (Guru)',
    tagTa: 'சுப காரியம் & தனம்',
    tagEn: 'Auspiciousness & Wealth',
    descTa: 'பணப்புழக்கம் அதிகரிக்கும், சுப நிகழ்ச்சிகள் தடையின்றி கைக்கூடும்.',
    descEn: 'Inflow of wealth enhances, sacred rituals and auspicious family milestones materialize smoothly.',
    colorLight: '#b45309',
    colorDark: '#fbbf24',
    bgLight: '#fffbeb',
    bgDark: 'rgba(217, 119, 6, 0.12)',
    borderLight: '#fde68a',
    borderDark: 'rgba(251, 191, 36, 0.35)',
  },
  6: {
    nameTa: 'சுக்கிரன்',
    nameEn: 'Venus (Sukran)',
    tagTa: 'பண வரவு & மகிழ்ச்சி',
    tagEn: 'Prosperity & Happiness',
    descTa: 'பொருளாதார மேன்மை, வாகன யோகம், குடும்ப மகிழ்ச்சி பெருகும்.',
    descEn: 'Financial elevation, vehicle and luxury acquisitions, domestic joy, and artistic grace.',
    colorLight: '#a21caf',
    colorDark: '#e879f9',
    bgLight: '#fdf4ff',
    bgDark: 'rgba(217, 70, 239, 0.12)',
    borderLight: '#f5d0fe',
    borderDark: 'rgba(232, 121, 249, 0.35)',
  },
  7: {
    nameTa: 'சனி',
    nameEn: 'Saturn (Sani)',
    tagTa: 'உழைப்பு & தாமதம்',
    tagEn: 'Labor & Perseverance',
    descTa: 'கடின உழைப்பிற்கு பிறகே பலன் கிடைக்கும். பொறுமையுடன் செயல்படவும்.',
    descEn: 'Success is earned after industrious perseverance. Patient, steady action is essential.',
    colorLight: '#374151',
    colorDark: '#9ca3af',
    bgLight: '#f9fafb',
    bgDark: 'rgba(75, 85, 99, 0.15)',
    borderLight: '#e5e7eb',
    borderDark: 'rgba(156, 163, 175, 0.35)',
  },
  8: {
    nameTa: 'ராகு',
    nameEn: 'Rahu',
    tagTa: 'திடீர் யோகம்',
    tagEn: 'Sudden Fortune',
    descTa: 'எதிர்பாராத பணவரவு, திடீர் திருப்பங்கள் மற்றும் ரகசிய உதவிகள் கிடைக்கும்.',
    descEn: 'Unexpected financial windfalls, sudden dramatic twists, and confidential support.',
    colorLight: '#6d28d9',
    colorDark: '#a78bfa',
    bgLight: '#f5f3ff',
    bgDark: 'rgba(124, 58, 237, 0.12)',
    borderLight: '#ddd6fe',
    borderDark: 'rgba(167, 139, 250, 0.35)',
  },
  9: {
    nameTa: 'கேது',
    nameEn: 'Ketu',
    tagTa: 'ஆன்மீகம் & ஞானம்',
    tagEn: 'Wisdom & Spirituality',
    descTa: 'ஆன்மீக சிந்தனை, தெய்வ வழிபாட்டினால் காரிய தடைகள் விலகும்.',
    descEn: 'Spiritual contemplation, detachment, and devout worship will dissolve persistent roadblocks.',
    colorLight: '#0e7490',
    colorDark: '#22d3ee',
    bgLight: '#ecfeff',
    bgDark: 'rgba(8, 145, 178, 0.12)',
    borderLight: '#a5f3fc',
    borderDark: 'rgba(34, 211, 238, 0.35)',
  },
};

// ==========================================
// 2. INTERFACES
// ==========================================

interface FormState {
  name: string;
  location: string;
  vetrilaiCount: number | '';
  paakkuCount: number | '';
  palamCount: number | '';
  selectedConditions: string[];
}

interface ResultData {
  clientName: string;
  clientLocation: string;
  vetrilai: number;
  paakku: number;
  palam: number;
  planetKey: number;
  planetInfo: PlanetItem;
  conditionResults: LeafOption[];
  insights: string[];
}

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

export const VetrilaiPrasnamApp: React.FC<VetrilaiPrasnamAppProps> = ({
  language = 'ta',
  isLight = false,
}) => {
  const isTa = language === 'ta';

  const [formData, setFormData] = useState<FormState>({
    name: '',
    location: '',
    vetrilaiCount: '',
    paakkuCount: '',
    palamCount: '',
    selectedConditions: [],
  });

  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('Count') ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleCheckboxToggle = (id: string) => {
    setFormData((prev) => {
      const exists = prev.selectedConditions.includes(id);
      return {
        ...prev,
        selectedConditions: exists
          ? prev.selectedConditions.filter((item) => item !== id)
          : [...prev.selectedConditions, id],
      };
    });
  };

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const vetrilai = Number(formData.vetrilaiCount);
    const paakku = Number(formData.paakkuCount);
    const palam = Number(formData.palamCount);

    if (!vetrilai || vetrilai <= 0) {
      setError(
        isTa
          ? 'தயவுசெய்து வெற்றிலை எண்ணிக்கையை உள்ளிடவும்.'
          : 'Please enter the number of betel leaves.'
      );
      return;
    }
    if (formData.paakkuCount === '' || paakku < 0) {
      setError(
        isTa
          ? 'செல்லுபடியாகும் பாக்கு எண்ணிக்கையை உள்ளிடவும்.'
          : 'Please enter a valid count of areca nuts (0 or more).'
      );
      return;
    }
    if (formData.palamCount === '' || palam < 0) {
      setError(
        isTa
          ? 'செல்லுபடியாகும் பழம் எண்ணிக்கையை உள்ளிடவும்.'
          : 'Please enter a valid count of fruits (0 or more).'
      );
      return;
    }

    const combinedCount = vetrilai + paakku;
    const planetKey = combinedCount % 9 === 0 ? 9 : combinedCount % 9;
    const planetInfo = PLANET_DATA[planetKey];

    const conditionResults = LEAF_CONDITIONS.filter((item) =>
      formData.selectedConditions.includes(item.id)
    );

    const insights: string[] = [];

    // Paakku insight
    if (paakku % 2 === 0 && paakku > 0) {
      insights.push(
        isTa
          ? `பாக்கு இரட்டையாக (${paakku}) இருப்பதால் நினைத்த காரியம் சுபமாக முடியும்.`
          : `The count of areca nuts is even (${paakku}), indicating auspicious and smooth fruition of your intended goal.`
      );
    } else if (paakku > 0) {
      insights.push(
        isTa
          ? `பாக்கு ஒற்றையாக (${paakku}) இருப்பதால் சிறு தாமதத்திற்கு பின் காரியம் கைகூடும்.`
          : `The count of areca nuts is odd (${paakku}), suggesting minor delays before ultimate success.`
      );
    }

    // Fruit insight
    if (palam > 0) {
      insights.push(
        isTa
          ? `${palam} பழங்கள் அமைந்தது மிகச் சிறப்பு! குடும்பத்தில் மகிழ்ச்சியும் சுப பலன்களும் உண்டாகும்.`
          : `Having ${palam} fruit(s) placed is exceptionally auspicious! Brings domestic happiness and blessed results.`
      );
    } else {
      insights.push(
        isTa
          ? `பழம் வைக்கப்படாததால் காரிய வெற்றிக்கான முயற்சி இருமடங்கு தேவைப்படும்.`
          : `No fruit was placed in the Thamboolam; double effort and persistent determination will be needed.`
      );
    }

    setResult({
      clientName: formData.name || (isTa ? 'அன்பர்' : 'Seeker'),
      clientLocation: formData.location || (isTa ? 'பொது' : 'General'),
      vetrilai,
      paakku,
      palam,
      planetKey,
      planetInfo,
      conditionResults,
      insights,
    });
  };

  const handleReset = () => {
    setFormData({
      name: '',
      location: '',
      vetrilaiCount: '',
      paakkuCount: '',
      palamCount: '',
      selectedConditions: [],
    });
    setResult(null);
    setError('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* ---------------- INPUT FORM SECTION ---------------- */}
      <div
        className={`rounded-2xl border overflow-hidden transition-all ${
          isLight
            ? 'bg-white border-emerald-500/25 shadow-lg shadow-emerald-500/5'
            : 'bg-slate-900/60 border-gray-800 shadow-xl backdrop-blur-md'
        }`}
      >
        {/* Header Banner */}
        <div
          className={`p-6 text-center transition-all ${
            isLight
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-sm'
              : 'bg-gradient-to-r from-emerald-900/80 via-teal-900/60 to-emerald-950 text-white border-b border-emerald-500/20'
          }`}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider font-mono uppercase bg-white/15 border border-white/20 text-emerald-100 mb-2">
            <Leaf className="w-3.5 h-3.5" />
            <span>{isTa ? 'தாம்பூல சாஸ்திரம்' : 'Thamboola Shastram'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight">
            {isTa ? 'வெற்றிலை பிரசன்னம்' : 'Betel Leaf (Vetrilai) Prasnam'}
          </h2>
          <p className="text-xs sm:text-sm mt-1 text-emerald-100/90 max-w-lg mx-auto leading-relaxed">
            {isTa
              ? 'தாம்பூல வெற்றிலை, பாக்கு மற்றும் பழங்களின் அடிப்படையில் பெறப்படும் பிரசன்ன கணிப்பு.'
              : 'Traditional Thamboola divination interpreting the quantity, condition, and nature of betel leaves and nuts.'}
          </p>
        </div>

        <form onSubmit={handleCalculate} className="p-6 sm:p-8 space-y-5">
          {/* Row 1: Name & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  isLight ? 'text-[#5C4F43]' : 'text-gray-300'
                }`}
              >
                {isTa ? 'பெயர்:' : 'Name:'}
              </label>
              <input
                type="text"
                name="name"
                placeholder={isTa ? 'எ.கா: சுந்தர்' : 'e.g., Sundar'}
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors outline-none ${
                  isLight
                    ? 'bg-emerald-50/30 border-emerald-500/30 text-[#2C241E] focus:border-emerald-600 focus:bg-white'
                    : 'bg-slate-950 border-gray-700 text-white focus:border-emerald-500 focus:bg-slate-900'
                }`}
              />
            </div>
            <div>
              <label
                className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                  isLight ? 'text-[#5C4F43]' : 'text-gray-300'
                }`}
              >
                {isTa ? 'இடம் (ஊர்):' : 'Location (City/Town):'}
              </label>
              <input
                type="text"
                name="location"
                placeholder={isTa ? 'எ.கா: சென்னை' : 'e.g., Chennai'}
                value={formData.location}
                onChange={handleInputChange}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors outline-none ${
                  isLight
                    ? 'bg-emerald-50/30 border-emerald-500/30 text-[#2C241E] focus:border-emerald-600 focus:bg-white'
                    : 'bg-slate-950 border-gray-700 text-white focus:border-emerald-500 focus:bg-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Row 2: Counts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Green Card: Betel Leaf */}
            <div
              className={`p-4 rounded-xl border text-center transition-all ${
                isLight
                  ? 'bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-300/70 shadow-sm'
                  : 'bg-gradient-to-br from-emerald-950/30 to-teal-950/20 border-emerald-500/30'
              }`}
            >
              <span
                className={`block text-sm font-bold mb-1.5 ${
                  isLight ? 'text-emerald-950' : 'text-emerald-300'
                }`}
              >
                🌿 {isTa ? 'வெற்றிலை' : 'Betel Leaf'}
              </span>
              <input
                type="number"
                name="vetrilaiCount"
                placeholder="0"
                value={formData.vetrilaiCount}
                onChange={handleInputChange}
                className={`w-full max-w-[140px] mx-auto px-3 py-2 rounded-lg border text-center text-lg font-bold transition-colors outline-none ${
                  isLight
                    ? 'bg-white border-emerald-400 text-emerald-950 focus:ring-2 focus:ring-emerald-400/20'
                    : 'bg-slate-950 border-emerald-500/50 text-emerald-200 focus:ring-2 focus:ring-emerald-500/20'
                }`}
              />
              <span
                className={`block mt-2 text-[11px] font-medium ${
                  isLight ? 'text-emerald-800/80' : 'text-emerald-300/70'
                }`}
              >
                {isTa ? 'எண்ணிக்கை' : 'Quantity'}
              </span>
            </div>

            {/* Amber Card: Areca Nut */}
            <div
              className={`p-4 rounded-xl border text-center transition-all ${
                isLight
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50/50 border-amber-300/70 shadow-sm'
                  : 'bg-gradient-to-br from-amber-950/30 to-orange-950/20 border-amber-500/30'
              }`}
            >
              <span
                className={`block text-sm font-bold mb-1.5 ${
                  isLight ? 'text-amber-950' : 'text-amber-300'
                }`}
              >
                🌰 {isTa ? 'பாக்கு' : 'Areca Nut'}
              </span>
              <input
                type="number"
                name="paakkuCount"
                placeholder="0"
                value={formData.paakkuCount}
                onChange={handleInputChange}
                className={`w-full max-w-[140px] mx-auto px-3 py-2 rounded-lg border text-center text-lg font-bold transition-colors outline-none ${
                  isLight
                    ? 'bg-white border-amber-400 text-amber-950 focus:ring-2 focus:ring-amber-400/20'
                    : 'bg-slate-950 border-amber-500/50 text-amber-200 focus:ring-2 focus:ring-amber-500/20'
                }`}
              />
              <span
                className={`block mt-2 text-[11px] font-medium ${
                  isLight ? 'text-amber-800/80' : 'text-amber-300/70'
                }`}
              >
                {isTa ? 'எண்ணிக்கை' : 'Quantity'}
              </span>
            </div>

            {/* Rose Card: Banana / Fruit */}
            <div
              className={`p-4 rounded-xl border text-center transition-all ${
                isLight
                  ? 'bg-gradient-to-br from-rose-50 to-pink-50/50 border-rose-300/70 shadow-sm'
                  : 'bg-gradient-to-br from-rose-950/30 to-pink-950/20 border-rose-500/30'
              }`}
            >
              <span
                className={`block text-sm font-bold mb-1.5 ${
                  isLight ? 'text-rose-950' : 'text-rose-300'
                }`}
              >
                🍌 {isTa ? 'பழம்' : 'Fruit (Banana)'}
              </span>
              <input
                type="number"
                name="palamCount"
                placeholder="0"
                value={formData.palamCount}
                onChange={handleInputChange}
                className={`w-full max-w-[140px] mx-auto px-3 py-2 rounded-lg border text-center text-lg font-bold transition-colors outline-none ${
                  isLight
                    ? 'bg-white border-rose-400 text-rose-950 focus:ring-2 focus:ring-rose-400/20'
                    : 'bg-slate-950 border-rose-500/50 text-rose-200 focus:ring-2 focus:ring-rose-500/20'
                }`}
              />
              <span
                className={`block mt-2 text-[11px] font-medium ${
                  isLight ? 'text-rose-800/80' : 'text-rose-300/70'
                }`}
              >
                {isTa ? 'எண்ணிக்கை' : 'Quantity'}
              </span>
            </div>
          </div>

          {/* Row 3: Checkboxes for Leaf Condition */}
          <div className="space-y-2 pt-2">
            <label
              className={`block text-xs font-bold uppercase tracking-wider ${
                isLight ? 'text-[#5C4F43]' : 'text-gray-300'
              }`}
            >
              {isTa
                ? 'வெற்றிலையின் தன்மை (பொருந்துபவற்றைத் தேர்ந்தெடுக்கவும்):'
                : 'Condition of the Betel Leaves (Select applicable signs):'}
            </label>
            <div className="flex flex-col gap-2">
              {LEAF_CONDITIONS.map((cond) => {
                const checked = formData.selectedConditions.includes(cond.id);
                return (
                  <label
                    key={cond.id}
                    onClick={() => handleCheckboxToggle(cond.id)}
                    style={{
                      backgroundColor: isLight
                        ? checked
                          ? cond.bgLight
                          : '#ffffff'
                        : checked
                        ? cond.bgDark
                        : 'rgba(15, 23, 42, 0.6)',
                      borderColor: isLight
                        ? checked
                          ? cond.borderLight
                          : '#e5e7eb'
                        : checked
                        ? cond.borderDark
                        : '#374151',
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      checked ? 'shadow-sm' : 'hover:border-gray-400'
                    }`}
                  >
                    <div
                      style={{
                        backgroundColor: checked
                          ? isLight
                            ? cond.statusColor
                            : cond.statusDarkColor
                          : 'transparent',
                        borderColor: checked
                          ? isLight
                            ? cond.statusColor
                            : cond.statusDarkColor
                          : isLight
                          ? '#9ca3af'
                          : '#6b7280',
                      }}
                      className="w-5 h-5 rounded border flex items-center justify-center text-white text-xs font-bold transition-colors flex-shrink-0"
                    >
                      {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <span
                        style={{
                          color: checked
                            ? isLight
                              ? cond.statusColor
                              : cond.statusDarkColor
                            : isLight
                            ? '#2C241E'
                            : '#f3f4f6',
                        }}
                        className="text-xs sm:text-sm font-bold block"
                      >
                        {isTa ? cond.labelTa : cond.labelEn}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {error && (
            <div
              className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
                isLight
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-red-950/50 text-red-300 border-red-800/50'
              }`}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 px-5 rounded-xl text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isTa ? 'பிரசன்னம் காண்' : 'Calculate Divination'}</span>
            </button>
            {result && (
              <button
                type="button"
                onClick={handleReset}
                className={`px-4 py-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isLight
                    ? 'bg-emerald-50/70 border-emerald-500/30 text-[#5C4F43] hover:bg-emerald-100'
                    : 'border-gray-800 text-gray-300 hover:bg-slate-800'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isTa ? 'மீட்டமை' : 'Reset'}</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ---------------- OUTPUT RESULT DASHBOARD ---------------- */}
      {result && (
        <div
          className={`p-6 sm:p-8 rounded-2xl border transition-all ${
            isLight
              ? 'bg-[#FFFDF7] border-emerald-500/30 shadow-xl text-[#2C241E]'
              : 'bg-slate-900/80 border-gray-800 shadow-2xl text-white backdrop-blur-md'
          }`}
        >
          {/* Header Strip */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-emerald-500/20">
            <div>
              <span
                className={`text-[11px] font-mono font-bold uppercase tracking-wider block ${
                  isLight ? 'text-emerald-700' : 'text-emerald-400'
                }`}
              >
                {isTa ? 'தாம்பூல பிரசன்ன அறிக்கை' : 'Thamboola Prasnam Report'}
              </span>
              <h3
                className={`text-xl sm:text-2xl font-serif font-black mt-0.5 ${
                  isLight ? 'text-[#1E120A]' : 'text-white'
                }`}
              >
                {result.clientName}{' '}
                <span
                  className={`text-sm font-sans font-normal ${
                    isLight ? 'text-[#7A695A]' : 'text-gray-400'
                  }`}
                >
                  | {result.clientLocation}
                </span>
              </h3>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap gap-2">
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                  isLight
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-emerald-950/50 text-emerald-300 border-emerald-700/50'
                }`}
              >
                🌿 {isTa ? 'வெற்றிலை' : 'Betel'}: {result.vetrilai}
              </div>
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                  isLight
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-amber-950/50 text-amber-300 border-amber-700/50'
                }`}
              >
                🌰 {isTa ? 'பாக்கு' : 'Nut'}: {result.paakku}
              </div>
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                  isLight
                    ? 'bg-rose-50 text-rose-800 border-rose-300'
                    : 'bg-rose-950/50 text-rose-300 border-rose-700/50'
                }`}
              >
                🍌 {isTa ? 'பழம்' : 'Fruit'}: {result.palam}
              </div>
            </div>
          </div>

          {/* Main Hero Card - Ruling Planet */}
          <div
            style={{
              backgroundColor: isLight ? result.planetInfo.bgLight : result.planetInfo.bgDark,
              borderColor: isLight ? result.planetInfo.borderLight : result.planetInfo.borderDark,
            }}
            className="rounded-2xl border p-6 text-center my-6 shadow-sm"
          >
            <span
              style={{
                color: isLight ? result.planetInfo.colorLight : result.planetInfo.colorDark,
              }}
              className="text-xs font-mono font-black uppercase tracking-wider block"
            >
              {isTa ? 'கணிதப் பிரசன்ன கிரகம்' : 'Governing Divination Planet'}
            </span>
            <h4
              style={{
                color: isLight ? result.planetInfo.colorLight : result.planetInfo.colorDark,
              }}
              className="text-2xl sm:text-3xl font-serif font-black my-2"
            >
              {isTa ? result.planetInfo.nameTa : result.planetInfo.nameEn} (
              {isTa ? result.planetInfo.tagTa : result.planetInfo.tagEn})
            </h4>
            <div
              className={`inline-block px-5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium mt-1 max-w-xl ${
                isLight
                  ? 'bg-white/90 border-amber-500/20 text-[#2C241E] shadow-sm'
                  : 'bg-slate-950/80 border-gray-700 text-gray-200'
              }`}
            >
              {isTa ? result.planetInfo.descTa : result.planetInfo.descEn}
            </div>
          </div>

          {/* Grid Layout for Leaf Condition & Subtle Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Leaf Condition Analysis */}
            <div className="space-y-3">
              <h4
                className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-[#5C4F43]' : 'text-gray-400'
                }`}
              >
                {isTa
                  ? 'வெற்றிலையின் தன்மை (பௌதிக பலன்கள்)'
                  : 'Physical Characteristics of Betel Leaves'}
              </h4>

              {result.conditionResults.length > 0 ? (
                <div className="space-y-2.5">
                  {result.conditionResults.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: isLight ? item.bgLight : item.bgDark,
                        borderColor: isLight ? item.borderLight : item.borderDark,
                      }}
                      className="p-3.5 rounded-xl border transition-all"
                    >
                      <h5
                        style={{
                          color: isLight ? item.statusColor : item.statusDarkColor,
                        }}
                        className="text-xs sm:text-sm font-bold mb-1"
                      >
                        {isTa ? item.labelTa : item.labelEn}
                      </h5>
                      <p
                        className={`text-xs leading-relaxed ${
                          isLight ? 'text-[#374151]' : 'text-gray-300'
                        }`}
                      >
                        {isTa ? item.descTa : item.descEn}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`p-6 rounded-xl border text-center ${
                    isLight
                      ? 'bg-amber-50/40 border-amber-500/20 text-gray-500'
                      : 'bg-slate-950/60 border-gray-800 text-gray-400'
                  }`}
                >
                  <p className="text-xs italic">
                    {isTa
                      ? 'சிறப்பு லட்சணங்கள் எதுவும் தேர்ந்தெடுக்கப்படவில்லை.'
                      : 'No specific leaf defects or peculiarities selected.'}
                  </p>
                </div>
              )}
            </div>

            {/* Box 2: Subtle Insights */}
            <div className="space-y-3">
              <h4
                className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-[#5C4F43]' : 'text-gray-400'
                }`}
              >
                {isTa ? 'சூட்சுமப் பலன்கள் & கணிப்புகள்' : 'Subtle Insights & Interpretations'}
              </h4>

              <div
                className={`p-4 rounded-xl border h-full ${
                  isLight
                    ? 'bg-purple-50/70 border-purple-200'
                    : 'bg-purple-950/20 border-purple-800/40'
                }`}
              >
                <ul className="space-y-3">
                  {result.insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <span
                        className={`font-black flex-shrink-0 ${
                          isLight ? 'text-purple-600' : 'text-purple-400'
                        }`}
                      >
                        ✦
                      </span>
                      <span
                        className={`leading-relaxed ${
                          isLight ? 'text-purple-950 font-medium' : 'text-purple-200'
                        }`}
                      >
                        {insight}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VetrilaiPrasnamApp;

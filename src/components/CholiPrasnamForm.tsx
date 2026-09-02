import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Compass, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

// ==========================================
// 1. ASTROLOGY DICTIONARIES (BILINGUAL)
// ==========================================

interface BhavaInfo {
  ta: string;
  en: string;
}

const BHAVA_MAP: Record<number, BhavaInfo> = {
  1: {
    ta: 'தன்னைப் பற்றிய கவலை அல்லது சொந்த ஆரோக்கியம்.',
    en: 'Self, personal vitality, physical health, and overall mindset.',
  },
  2: {
    ta: 'தனம், குடும்பம், நிதியுதவி அல்லது சொல் வாக்கு பற்றிய விஷயம்.',
    en: 'Wealth, family harmony, financial assistance, and spoken word.',
  },
  3: {
    ta: 'சகோதரம், தைரியம், குறுகிய பயணம் அல்லது தொடர்பு பற்றிய காரியம்.',
    en: 'Siblings, courage, short journeys, communication, and new initiatives.',
  },
  4: {
    ta: 'தாய், வீடு, நிலம், வாகனம் அல்லது சுக வாழ்வு பற்றிய கவலை.',
    en: 'Mother, residence, land, vehicle, home comfort, and peace of mind.',
  },
  5: {
    ta: 'குழந்தைகள், புத்திர பாக்கியம், காதல் அல்லது பூர்வ புண்ணியம்.',
    en: 'Children, progeny blessings, romance, intuition, and past merits (Purva Punya).',
  },
  6: {
    ta: 'கடன், நோய், வழக்கு அல்லது எதிரிகளால் ஏற்படும் தொந்தரவு.',
    en: 'Debts, illness, legal disputes, opposition, and daily obstacles.',
  },
  7: {
    ta: 'கணவன்/மனைவி, திருமணம், கூட்டுத் தொழில் அல்லது வாடிக்கையாளர்.',
    en: 'Spouse, matrimonial alliance, business partnerships, and public relations.',
  },
  8: {
    ta: 'ஆயுள், எதிர்பாராத நஷ்டம், தடைகள் அல்லது அவமானம்.',
    en: 'Longevity, unforeseen setbacks, delays, anxiety, and secret matters.',
  },
  9: {
    ta: 'தந்தை, பாக்கியம், உயர் கல்வி அல்லது தூர தேசப் பயணம்.',
    en: 'Father, fortune, divine grace, higher wisdom, and long-distance travel.',
  },
  10: {
    ta: 'தொழில், வேலை வாய்ப்பு, பதவி உயர்வு அல்லது ஜீவனம்.',
    en: 'Profession, career prospects, promotion, reputation, and livelihood.',
  },
  11: {
    ta: 'லாபம், மூத்த சகோதரம், ஆசைகள் நிறைவேறுதல்.',
    en: 'Gains/profits, elder siblings, fulfillment of aspirations, and helpful networks.',
  },
  12: {
    ta: 'விரயம், வெளிநாட்டு யோகம், மருத்துவச் செலவு அல்லது முதலீடு.',
    en: 'Expenditures, foreign prospects, hospitalities, investments, and detachment.',
  },
};

interface PlanetInfo {
  nameTa: string;
  nameEn: string;
  descTa: string;
  descEn: string;
}

const PLANET_MAP: Record<number, PlanetInfo> = {
  1: {
    nameTa: 'சூரியன்',
    nameEn: 'Sun (Surya)',
    descTa: 'அரசு வழி காரியங்கள், தந்தையின் ஆரோக்கியம் அல்லது தலைமைப் பதவி பற்றிய காரியம்.',
    descEn: "Matters related to government authorities, father's health, or leadership roles.",
  },
  2: {
    nameTa: 'செவ்வாய்',
    nameEn: 'Mars (Chevvai)',
    descTa: 'பூமி, சொத்துத் தகராறு, அவசரம் அல்லது தைரியமான முடிவுகள் எடுக்க வேண்டிய நிலை.',
    descEn: 'Matters regarding land, property disputes, haste, or requiring bold decisive steps.',
  },
  3: {
    nameTa: 'குரு',
    nameEn: 'Jupiter (Guru)',
    descTa: 'சுப காரியங்கள், பணப்புழக்கம், ஆன்மீகம் அல்லது பெரியோர்களின் ஆசி பெறல்.',
    descEn: 'Auspicious celebrations, financial prosperity, spiritual pursuits, and blessings of elders.',
  },
  4: {
    nameTa: 'புதன்',
    nameEn: 'Mercury (Budhan)',
    descTa: 'வியாபாரம், கல்வி, காகிதத் தொடர்புகள் அல்லது புத்தி கூர்மையால் தீர்க்கும் காரியம்.',
    descEn: 'Commercial enterprise, education, documentation, agreements, and intellect-driven solutions.',
  },
  5: {
    nameTa: 'சுக்கிரன்',
    nameEn: 'Venus (Sukran)',
    descTa: 'திருமணம், பெண்கள் வழி நன்மைகள், ஆடம்பரப் பொருட்கள் அல்லது கலைத் துறை.',
    descEn: 'Marriage alliances, gains through women, luxury articles, arts, and marital joy.',
  },
  6: {
    nameTa: 'சனி',
    nameEn: 'Saturn (Sani)',
    descTa: 'நீண்ட நாள் இழுபறியான காரியம், தொழில் மந்தநிலை அல்லது உடல் ஆரோக்கியம் பற்றிய கவலை.',
    descEn: 'Long-delayed undertakings, career slowdowns, perseverant effort, or physical health concerns.',
  },
  7: {
    nameTa: 'சந்திரன்',
    nameEn: 'Moon (Chandran)',
    descTa: 'மனக்குழப்பம், இடமாற்றம், பயணம் அல்லது தாய் வழி உறவு சார்ந்த காரியம்.',
    descEn: 'Fluctuating thoughts, relocations, travel, or maternal relationship matters.',
  },
  8: {
    nameTa: 'ராகு / கேது',
    nameEn: 'Rahu / Ketu',
    descTa: 'திடீர் திருப்பங்கள், ரகசிய காரியங்கள், மாயை அல்லது வெளிநாட்டுத் தொடர்புகள்.',
    descEn: 'Sudden unexpected turns, secretive matters, illusions, or foreign connections.',
  },
};

interface AyamInfo {
  titleTa: string;
  titleEn: string;
  descTa: string;
  descEn: string;
  badgeColor: string;
  badgeDarkBg: string;
}

const AYAM_MAP: Record<number, AyamInfo> = {
  1: {
    titleTa: 'த்வஜம் (கொடி)',
    titleEn: 'Dhvajam (Flag)',
    descTa: 'மிகச் சிறந்த நிலை. நீங்கள் நினைத்த காரியத்தில் மாபெரும் வெற்றியும், புகழும் கிடைக்கும்.',
    descEn: 'Supreme auspicious state. Grand victory, honor, and renown will crown your endeavor.',
    badgeColor: '#15803d',
    badgeDarkBg: 'rgba(34, 197, 94, 0.2)',
  },
  2: {
    titleTa: 'தூமம் (புகை)',
    titleEn: 'Dhoomam (Smoke)',
    descTa: 'காரியத்தில் சில தடைகளும் மனக்குழப்பங்களும் ஏற்படலாம். பொறுமை அவசியம்.',
    descEn: 'Minor obstacles, obscurity, and confusion may arise. Calm patience is essential.',
    badgeColor: '#b91c1c',
    badgeDarkBg: 'rgba(239, 68, 68, 0.2)',
  },
  3: {
    titleTa: 'சிம்மம் (சிங்கம்)',
    titleEn: 'Simham (Lion)',
    descTa: 'எதிர்ப்புகளை முறியடித்து காரியத்தில் முழுமையான வெற்றி அடைவீர்கள்.',
    descEn: 'Overcomes all competition and opposition; grants decisive, complete triumph.',
    badgeColor: '#1d4ed8',
    badgeDarkBg: 'rgba(59, 130, 246, 0.2)',
  },
  4: {
    titleTa: 'சுவானம் (நாய்)',
    titleEn: 'Svanam (Dog)',
    descTa: 'தேவையற்ற விவாதங்கள், சண்டைகள் மற்றும் விரயங்களைத் தவிர்க்கவும்.',
    descEn: 'Avoid unnecessary arguments, disputes, and wasteful expenditures.',
    badgeColor: '#c2410c',
    badgeDarkBg: 'rgba(249, 115, 22, 0.2)',
  },
  5: {
    titleTa: 'விருஷபம் (காளை)',
    titleEn: 'Vrishabham (Bull)',
    descTa: 'தன லாபமும், குடும்பத்தில் சுப நிகழ்ச்சிகளும் தடையின்றி நடக்கும்.',
    descEn: 'Prosperous financial inflow and auspicious family occasions proceed smoothly.',
    badgeColor: '#047857',
    badgeDarkBg: 'rgba(16, 185, 129, 0.2)',
  },
  6: {
    titleTa: 'கரம் (கழுதை)',
    titleEn: 'Kharam (Donkey)',
    descTa: 'அதிக உழைப்பிற்குப் பின்பே காரியம் சித்தியாகும். விடாமுயற்சி தேவை.',
    descEn: 'Success comes strictly after heavy labor and perseverance. Persistent effort needed.',
    badgeColor: '#4b5563',
    badgeDarkBg: 'rgba(156, 163, 175, 0.2)',
  },
  7: {
    titleTa: 'கஜம் (யானை)',
    titleEn: 'Gajam (Elephant)',
    descTa: 'உயர் அதிகாரிகளின் ஆதரவும், பெரிய அளவிலான வெற்றிகளும் சேரும்.',
    descEn: 'Support from high dignitaries, respected status, and magnanimous success.',
    badgeColor: '#6d28d9',
    badgeDarkBg: 'rgba(168, 85, 247, 0.2)',
  },
  8: {
    titleTa: 'வயசம் (காகம்)',
    titleEn: 'Vayasam (Crow)',
    descTa: 'தேவையற்ற அலைச்சல்களும் சிறு தடைகளும் ஏற்பட வாய்ப்புள்ளது.',
    descEn: 'Likelihood of fruitless running around, weariness, and minor delays.',
    badgeColor: '#d97706',
    badgeDarkBg: 'rgba(245, 158, 11, 0.2)',
  },
};

// ==========================================
// 2. INTERFACES & PROPS
// ==========================================

export interface CholiPrasnamFormProps {
  language?: 'ta' | 'en';
  isLight?: boolean;
}

interface FormState {
  name: string;
  location: string;
  totalCowries: number | '';
  openCowries: number | '';
}

interface ResultData {
  clientName: string;
  clientLocation: string;
  bhavaNumber: number;
  bhavaDesc: string;
  planetName: string;
  planetDesc: string;
  openCount: number;
  openDesc: string;
  ayamTitle: string;
  ayamDesc: string;
  ayamColor: string;
  ayamDarkBg: string;
}

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

export const CholiPrasnamForm: React.FC<CholiPrasnamFormProps> = ({
  language = 'ta',
  isLight = false,
}) => {
  const isTa = language === 'ta';

  const [formData, setFormData] = useState<FormState>({
    name: '',
    location: '',
    totalCowries: '',
    openCowries: '',
  });

  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('Cowries') ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const total = Number(formData.totalCowries);
    const open = Number(formData.openCowries);

    if (!total || total <= 0) {
      setError(
        isTa
          ? 'தயவுசெய்து மொத்த சோழிகளின் எண்ணிக்கையை உள்ளிடவும்.'
          : 'Please enter the total number of cowrie shells picked.'
      );
      return;
    }
    if (formData.openCowries === '' || open < 0 || open > total) {
      setError(
        isTa
          ? 'மலர்ந்த சோழிகள் செல்லுபடியாகும் எண்ணிக்கையாக இருக்க வேண்டும் (0 முதல் மொத்த சோழிகள் வரை).'
          : 'Open cowries count must be a valid number between 0 and total cowries.'
      );
      return;
    }

    const bhavaNumber = ((total - 1) % 12) + 1;
    const bhavaInfo = BHAVA_MAP[bhavaNumber];

    const modulo8 = total % 8 === 0 ? 8 : total % 8;
    const planetInfo = PLANET_MAP[modulo8];
    const ayamInfo = AYAM_MAP[modulo8];

    const isOpenEven = open % 2 === 0;
    const openDesc = isTa
      ? isOpenEven
        ? `மலர்ந்த சோழிகள் இரட்டைப்படையாக (${open}) உள்ளதால் தடைகள் விலகி சுப பலன் தரும்.`
        : `மலர்ந்த சோழிகள் ஒற்றைப்படையாக (${open}) உள்ளதால் கூடுதல் கவனம் மற்றும் எச்சரிக்கை தேவை.`
      : isOpenEven
      ? `The count of open cowries is even (${open}), indicating obstacles dissolving and bringing auspicious fruition.`
      : `The count of open cowries is odd (${open}), indicating that extra care and vigilance are advised.`;

    setResult({
      clientName: formData.name || (isTa ? 'அன்பர்' : 'Seeker'),
      clientLocation: formData.location || (isTa ? 'பொது' : 'General'),
      bhavaNumber,
      bhavaDesc: isTa ? bhavaInfo.ta : bhavaInfo.en,
      planetName: isTa ? planetInfo.nameTa : planetInfo.nameEn,
      planetDesc: isTa ? planetInfo.descTa : planetInfo.descEn,
      openCount: open,
      openDesc,
      ayamTitle: isTa ? ayamInfo.titleTa : ayamInfo.titleEn,
      ayamDesc: isTa ? ayamInfo.descTa : ayamInfo.descEn,
      ayamColor: ayamInfo.badgeColor,
      ayamDarkBg: ayamInfo.badgeDarkBg,
    });
  };

  const handleReset = () => {
    setFormData({
      name: '',
      location: '',
      totalCowries: '',
      openCowries: '',
    });
    setResult(null);
    setError('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* ---------------- SECTION 1: INPUT FORM ---------------- */}
      <div
        className={`p-6 sm:p-8 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white border-amber-500/25 shadow-lg shadow-amber-500/5'
            : 'bg-slate-900/60 border-gray-800 shadow-xl backdrop-blur-md'
        }`}
      >
        {/* Header Title */}
        <div className="text-center pb-4 mb-6 border-b border-amber-500/20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider font-mono uppercase bg-amber-500/15 border border-amber-500/30 text-amber-500 mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>{isTa ? 'சோழி பிரசன்னம்' : 'Choli Prasnam'}</span>
          </div>
          <h2
            className={`text-2xl sm:text-3xl font-serif font-black tracking-tight ${
              isLight ? 'text-amber-900' : 'text-amber-400'
            }`}
          >
            {isTa ? 'சோழி பிரசன்னம் - உள்ளீடு' : 'Choli (Cowrie) Prasnam - Input'}
          </h2>
          <p
            className={`text-xs mt-1.5 max-w-lg mx-auto leading-relaxed ${
              isLight ? 'text-[#5C4F43]' : 'text-gray-400'
            }`}
          >
            {isTa
              ? 'அஷ்டமங்கல பிரசன்ன முறையில் சோழிகளை உருட்டி எடுக்கப்படும் கணக்கீடு மற்றும் பலன்கள்.'
              : 'Traditional Ashtamangala divination based on cowrie shell distribution and orientation.'}
          </p>
        </div>

        <form onSubmit={handleCalculate} className="space-y-5">
          {/* Row 1: Name and Location */}
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
                placeholder={isTa ? 'எ.கா: ராமன்' : 'e.g., Raman'}
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors outline-none ${
                  isLight
                    ? 'bg-amber-50/40 border-amber-500/30 text-[#2C241E] focus:border-amber-500 focus:bg-white'
                    : 'bg-slate-950 border-gray-700 text-white focus:border-amber-500 focus:bg-slate-900'
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
                placeholder={isTa ? 'எ.கா: மதுரை' : 'e.g., Madurai'}
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors outline-none ${
                  isLight
                    ? 'bg-amber-50/40 border-amber-500/30 text-[#2C241E] focus:border-amber-500 focus:bg-white'
                    : 'bg-slate-950 border-gray-700 text-white focus:border-amber-500 focus:bg-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Row 2: Cowrie Counts Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Orange Card - Total Cowries */}
            <div
              className={`p-4 rounded-xl border text-center transition-all ${
                isLight
                  ? 'bg-gradient-to-br from-orange-50/80 to-amber-50/60 border-orange-300/70 shadow-sm'
                  : 'bg-gradient-to-br from-orange-950/30 to-amber-950/20 border-orange-500/30'
              }`}
            >
              <label
                className={`block text-sm font-bold mb-2 ${
                  isLight ? 'text-orange-900' : 'text-orange-300'
                }`}
              >
                {isTa ? 'பிரித்த மொத்த சோழிகள்:' : 'Total Cowries Picked:'}
              </label>
              <input
                type="number"
                name="totalCowries"
                placeholder={isTa ? 'எ.கா: 27' : 'e.g. 27'}
                value={formData.totalCowries}
                onChange={handleChange}
                className={`w-full max-w-[200px] mx-auto px-3 py-2 rounded-lg border text-center text-lg font-bold transition-colors outline-none ${
                  isLight
                    ? 'bg-white border-orange-400 text-orange-950 focus:ring-2 focus:ring-orange-400/20'
                    : 'bg-slate-950 border-orange-500/50 text-orange-200 focus:ring-2 focus:ring-orange-500/20'
                }`}
              />
              <span
                className={`block mt-2 text-[11px] font-medium ${
                  isLight ? 'text-orange-800/80' : 'text-orange-300/70'
                }`}
              >
                {isTa ? 'மொத்த சோழிகளின் எண்ணிக்கை' : 'Total number of cowrie shells'}
              </span>
            </div>

            {/* Green Card - Open Cowries */}
            <div
              className={`p-4 rounded-xl border text-center transition-all ${
                isLight
                  ? 'bg-gradient-to-br from-emerald-50/80 to-teal-50/60 border-emerald-300/70 shadow-sm'
                  : 'bg-gradient-to-br from-emerald-950/30 to-teal-950/20 border-emerald-500/30'
              }`}
            >
              <label
                className={`block text-sm font-bold mb-2 ${
                  isLight ? 'text-emerald-900' : 'text-emerald-300'
                }`}
              >
                {isTa ? 'மலர்ந்த சோழிகள்:' : 'Open (Face-Up) Cowries:'}
              </label>
              <input
                type="number"
                name="openCowries"
                placeholder={isTa ? 'எ.கா: 5' : 'e.g. 5'}
                value={formData.openCowries}
                onChange={handleChange}
                className={`w-full max-w-[200px] mx-auto px-3 py-2 rounded-lg border text-center text-lg font-bold transition-colors outline-none ${
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
                {isTa ? 'முகம் காட்டி விழும் சோழிகள்' : 'Cowries landing face-upwards'}
              </span>
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
              className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-3 px-5 rounded-xl text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isTa ? 'சோழி பலன் காண்' : 'Calculate Prasnam Reading'}</span>
            </button>
            {result && (
              <button
                type="button"
                onClick={handleReset}
                className={`px-4 py-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isLight
                    ? 'bg-amber-50/70 border-amber-500/30 text-[#5C4F43] hover:bg-amber-100'
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

      {/* ---------------- SECTION 2: DASHBOARD RESULTS UI ---------------- */}
      {result && (
        <div
          className={`p-6 sm:p-8 rounded-2xl border transition-all ${
            isLight
              ? 'bg-[#FFFDF7] border-amber-500/30 shadow-xl text-[#2C241E]'
              : 'bg-slate-900/80 border-gray-800 shadow-2xl text-white backdrop-blur-md'
          }`}
        >
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-amber-500/20">
            <div>
              <span
                className={`text-[11px] font-mono font-bold uppercase tracking-wider block ${
                  isLight ? 'text-amber-700' : 'text-amber-400'
                }`}
              >
                {isTa ? 'பிரசன்ன கணிப்பு அறிக்கை' : 'Prasnam Divination Report'}
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
                  ({result.clientLocation})
                </span>
              </h3>
            </div>

            <div
              style={{
                backgroundColor: isLight ? result.ayamColor : result.ayamDarkBg,
                color: '#ffffff',
                border: isLight ? 'none' : `1px solid ${result.ayamColor}`,
              }}
              className="px-4 py-2 rounded-full font-bold text-xs sm:text-sm tracking-wide shadow-sm flex items-center gap-1.5"
            >
              <span>✦</span>
              <span>{result.ayamTitle}</span>
            </div>
          </div>

          {/* Color-Coded Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {/* Card 1: Blue Theme (Bhava / Rasi) */}
            <div
              className={`p-5 rounded-xl border transition-all ${
                isLight
                  ? 'bg-blue-50/70 border-blue-200 shadow-sm'
                  : 'bg-blue-950/30 border-blue-800/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-mono font-black ${
                    isLight ? 'text-blue-600' : 'text-blue-400'
                  }`}
                >
                  01
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isLight ? 'text-blue-800' : 'text-blue-300'
                  }`}
                >
                  {isTa ? 'பிரசன்ன ராசி நிலை' : 'Prasnam Bhava Position'}
                </span>
              </div>
              <p
                className={`text-lg font-serif font-black mb-1.5 ${
                  isLight ? 'text-blue-950' : 'text-blue-100'
                }`}
              >
                {isTa ? `பாவம் ${result.bhavaNumber}` : `Bhava (House) ${result.bhavaNumber}`}
              </p>
              <p
                className={`text-xs leading-relaxed ${
                  isLight ? 'text-blue-900/90' : 'text-blue-200/80'
                }`}
              >
                {result.bhavaDesc}
              </p>
            </div>

            {/* Card 2: Purple Theme (Ruling Planet) */}
            <div
              className={`p-5 rounded-xl border transition-all ${
                isLight
                  ? 'bg-purple-50/70 border-purple-200 shadow-sm'
                  : 'bg-purple-950/30 border-purple-800/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-mono font-black ${
                    isLight ? 'text-purple-600' : 'text-purple-400'
                  }`}
                >
                  02
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isLight ? 'text-purple-800' : 'text-purple-300'
                  }`}
                >
                  {isTa ? 'இயக்கும் நவக்கிரகம்' : 'Governing Navagraha'}
                </span>
              </div>
              <p
                className={`text-lg font-serif font-black mb-1.5 ${
                  isLight ? 'text-purple-950' : 'text-purple-100'
                }`}
              >
                {result.planetName}
              </p>
              <p
                className={`text-xs leading-relaxed ${
                  isLight ? 'text-purple-900/90' : 'text-purple-200/80'
                }`}
              >
                {result.planetDesc}
              </p>
            </div>

            {/* Card 3: Cyan Theme (Cowrie Insight) */}
            <div
              className={`p-5 rounded-xl border transition-all ${
                isLight
                  ? 'bg-cyan-50/70 border-cyan-200 shadow-sm'
                  : 'bg-cyan-950/30 border-cyan-800/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-mono font-black ${
                    isLight ? 'text-cyan-600' : 'text-cyan-400'
                  }`}
                >
                  03
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isLight ? 'text-cyan-800' : 'text-cyan-300'
                  }`}
                >
                  {isTa ? 'சோழி முகக் குறிப்பு' : 'Cowrie Face Observation'}
                </span>
              </div>
              <p
                className={`text-lg font-serif font-black mb-1.5 ${
                  isLight ? 'text-cyan-950' : 'text-cyan-100'
                }`}
              >
                {isTa
                  ? `${result.openCount} சோழிகள் மலர்ந்தன`
                  : `${result.openCount} Open Cowries`}
              </p>
              <p
                className={`text-xs leading-relaxed ${
                  isLight ? 'text-cyan-900/90' : 'text-cyan-200/80'
                }`}
              >
                {result.openDesc}
              </p>
            </div>

            {/* Card 4: Emerald / Green Theme (Ashtamangala Final Decision) */}
            <div
              className={`p-5 rounded-xl border transition-all ${
                isLight
                  ? 'bg-emerald-50/70 border-emerald-200 shadow-sm'
                  : 'bg-emerald-950/30 border-emerald-800/40'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-mono font-black ${
                    isLight ? 'text-emerald-600' : 'text-emerald-400'
                  }`}
                >
                  04
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isLight ? 'text-emerald-800' : 'text-emerald-300'
                  }`}
                >
                  {isTa ? 'அஷ்டமங்கல முடிவு' : 'Ashtamangala Verdict'}
                </span>
              </div>
              <p
                style={{ color: isLight ? result.ayamColor : '#34d399' }}
                className="text-lg font-serif font-black mb-1.5"
              >
                {result.ayamTitle}
              </p>
              <p
                className={`text-xs leading-relaxed ${
                  isLight ? 'text-emerald-900/90' : 'text-emerald-200/80'
                }`}
              >
                {result.ayamDesc}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CholiPrasnamForm;

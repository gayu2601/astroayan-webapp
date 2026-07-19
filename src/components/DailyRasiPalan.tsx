import React, { useState, useMemo } from "react";
import { useRasiPalan } from "../../hooks/useRasiPalan";
import { useTranslation } from "../../hooks/useTranslation";
import { 
  Sparkles, 
  Briefcase, 
  Heart, 
  Users, 
  Plane, 
  Smile, 
  Dumbbell, 
  HeartPulse,
  CircleDollarSign,
  ChevronDown, 
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Award
} from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import ScreenGuard from './ScreenGuard';

interface DailyRasiPalanProps {
  isLight?: boolean;
}

const ZODIACS = [
  { labelEn: "Aries",       labelTa: "மேஷம்",      value: "aries",       index: 1  },
  { labelEn: "Taurus",      labelTa: "ரிஷபம்",     value: "taurus",      index: 2  },
  { labelEn: "Gemini",      labelTa: "மிதுனம்",    value: "gemini",      index: 3  },
  { labelEn: "Cancer",      labelTa: "கடகம்",       value: "cancer",      index: 4  },
  { labelEn: "Leo",         labelTa: "சிம்மம்",    value: "leo",         index: 5  },
  { labelEn: "Virgo",       labelTa: "கன்னி",       value: "virgo",       index: 6  },
  { labelEn: "Libra",       labelTa: "துலாம்",      value: "libra",       index: 7  },
  { labelEn: "Scorpio",     labelTa: "விருச்சிகம்", value: "scorpio",     index: 8  },
  { labelEn: "Sagittarius", labelTa: "தனுசு",       value: "sagittarius", index: 9  },
  { labelEn: "Capricorn",   labelTa: "மகரம்",       value: "capricorn",   index: 10 },
  { labelEn: "Aquarius",    labelTa: "கும்பம்",     value: "aquarius",    index: 11 },
  { labelEn: "Pisces",      labelTa: "மீனம்",       value: "pisces",      index: 12 },
];

export default function DailyRasiPalan({ isLight = false }: DailyRasiPalanProps) {
  const { t, isTamil } = useTranslation();
  const { language } = useAuth();
  const [selectedZodiac, setSelectedZodiac] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const hookInput = useMemo(() => {
    if (!selectedZodiac) return null;
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const date = `${dd}/${mm}/${yyyy}`;
    
    const zodiacObj = ZODIACS.find(z => z.index === selectedZodiac);
    return {
      zodiac: zodiacObj ? zodiacObj.index : 0,
      api_key: '6a0b4e5a-b8d5-5e1a-bd97-6128ad38d349',
      date,
      lang: language,
      split: true
    };
  }, [selectedZodiac]);

  const { rasiPalan: data, loading, error, refetch } = useRasiPalan(hookInput);
  console.log('rasiPalan', data)

  const palanContent = useMemo(() => {
    if (!data?.bot_response) return null;
    const { bot_response, zodiac, lucky_color, lucky_color_code, lucky_number } = data;
    const totalScore = bot_response.total_score?.score ?? 50;
    
    const combinedPara1 = [
      bot_response.career?.split_response?.trim(),
      bot_response.finances?.split_response?.trim(),
      bot_response.status?.split_response?.trim(),
    ].filter(Boolean).join(" ");

    const combinedPara2 = [
      bot_response.relationship?.split_response?.trim(),
      bot_response.family?.split_response?.trim(),
      bot_response.friends?.split_response?.trim(),
      bot_response.travel?.split_response?.trim(),
      bot_response.health?.split_response?.trim(),
    ].filter(Boolean).join(" ");

    return { 
      bot_response, 
      zodiac, 
      lucky_color, 
      lucky_color_code, 
      lucky_number, 
      totalScore, 
      combinedPara1, 
      combinedPara2 
    };
  }, [data]);

  const AREA_CONFIGS = [
    {
      key: "career",
      label: t("rasiPalan.area.career"),
      icon: Briefcase,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      key: "finances",
      label: t("rasiPalan.area.finances"),
      icon: CircleDollarSign,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      key: "relationship",
      label: t("rasiPalan.area.relationship"),
      icon: Heart,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      key: "family",
      label: t("rasiPalan.area.family"),
      icon: Users,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
    },
    {
      key: "travel",
      label: t("rasiPalan.area.travel"),
      icon: Plane,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    {
      key: "friends",
      label: t("rasiPalan.area.friends"),
      icon: Smile,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      key: "physique",
      label: t("rasiPalan.area.physique"),
      icon: Dumbbell,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
    },
    {
      key: "health",
      label: t("rasiPalan.area.health"),
      icon: HeartPulse,
      color: "text-rose-400",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
    },
  ];

  const activeZodiacObj = ZODIACS.find(z => z.index === selectedZodiac);

  return (
  <ScreenGuard featureId="daily_rasi_palan">
    <div id="daily-rasi-palan-section" className={`p-6 rounded-3xl space-y-6 border transition-all duration-300 ${
      isLight 
        ? "bg-white/80 border-[#E8DCC4] shadow-sm text-[#1E120A]" 
        : "bg-black/35 border-white/5 text-gray-100 shadow-xl shadow-black/20"
    }`}>
      {/* Top Title Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-700/25 pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-black text-amber-500 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500 animate-pulse" />
            {t("rasiPalan.title")}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {new Date().toLocaleDateString(isTamil ? "ta-IN" : "en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {selectedZodiac && (
          <button 
            onClick={() => refetch()}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/25 disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            {isTamil ? "புதுப்பி" : "Refresh"}
          </button>
        )}
      </div>

      {/* Zodiac Custom Dropdown Selector */}
      <div className="relative">
        <label className="block text-xs font-black uppercase tracking-wider mb-2 text-gray-400">
          {t("rasiPalan.selectZodiac")}
        </label>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all text-left ${
            isLight
              ? "bg-[#FCFBF7] border-[#E8DCC4] text-[#1E120A]"
              : "bg-black/40 border-white/10 text-white"
          }`}
        >
          <span className="font-medium">
            {activeZodiacObj 
              ? (isTamil ? activeZodiacObj.labelTa : activeZodiacObj.labelEn) 
              : t("rasiPalan.selectZodiac")}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropdownOpen && (
          <div className={`absolute z-30 mt-2 w-full max-h-60 overflow-y-auto rounded-2xl border p-2 shadow-2xl animate-fade-in ${
            isLight ? "bg-[#FCFBF7] border-[#E8DCC4]" : "bg-[#12121E] border-white/10"
          }`}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
              {ZODIACS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    setSelectedZodiac(item.index);
                    setDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    selectedZodiac === item.index
                      ? "bg-amber-500 text-white"
                      : isLight
                        ? "text-[#1E120A] hover:bg-amber-500/10"
                        : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <span>{isTamil ? item.labelTa : item.labelEn}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dynamic States (Prompt, Loading, Error, Content) */}
      {!selectedZodiac && (
        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
          <Sparkles className="h-10 w-10 text-gray-600 mb-2.5 animate-bounce" />
          <p className="text-sm font-medium">{t("rasiPalan.selectPrompt")}</p>
        </div>
      )}

      {selectedZodiac && loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center text-amber-500 space-y-3">
          <div className="h-8 w-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-sm font-bold tracking-wide animate-pulse">{t("rasiPalan.loading")}</p>
        </div>
      )}

      {selectedZodiac && !loading && error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3 text-rose-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">{isTamil ? "பிழை ஏற்பட்டது" : "Error Occurred"}</h4>
            <p className="text-xs mt-0.5 text-rose-400/80">{error}</p>
          </div>
        </div>
      )}

      {selectedZodiac && !loading && palanContent && (
        <div className="space-y-6 animate-fade-in">
          {/* Hero Overall Card */}
          <div className={`p-5 rounded-2xl border ${
            isLight 
              ? "bg-gradient-to-br from-amber-500/5 to-amber-600/15 border-amber-500/20" 
              : "bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/15"
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-black text-amber-500 uppercase tracking-wide">
                    {palanContent.zodiac}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-0.5">
                    {t("common.overallScore")}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-baseline justify-end">
                  <span className="text-2xl font-black text-amber-400">{palanContent.totalScore}</span>
                  <span className="text-[10px] font-bold text-gray-500">/100</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-bold uppercase tracking-wider block mt-1">
                  {palanContent.totalScore >= 75 ? (isTamil ? "மிகச் சிறப்பு" : "Excellent") : palanContent.totalScore >= 55 ? (isTamil ? "நன்று" : "Good") : (isTamil ? "சராசரி" : "Average")}
                </span>
              </div>
            </div>

            {/* Score Bar */}
            <div className="w-full bg-black/30 h-1.5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${palanContent.totalScore}%` }}
              />
            </div>

            <p className={`text-xs leading-relaxed mt-4 font-sans ${isLight ? "text-[#5C4F43]" : "text-gray-300"}`}>
              {palanContent.bot_response?.total_score?.split_response?.trim()}
            </p>
          </div>

          {/* Lucky Credentials Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isLight ? "bg-white border-[#E8DCC4]" : "bg-black/30 border-white/5"}`}>
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
                <span className="font-mono text-base font-black">#</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  {t("common.luckyNumbers")}
                </span>
                <span className={`text-sm font-black font-serif ${isLight ? "text-[#1E120A]" : "text-white"}`}>
                  {Array.isArray(palanContent.lucky_number) ? palanContent.lucky_number.join(" & ") : palanContent.lucky_number}
                </span>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isLight ? "bg-white border-[#E8DCC4]" : "bg-black/30 border-white/5"}`}>
              <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <span 
                  className="h-4 w-4 rounded-full border border-white/20 block shadow-inner shrink-0" 
                  style={{ backgroundColor: palanContent.lucky_color_code || "#fff" }}
                />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                  {t("common.luckyColor")}
                </span>
                <span className={`text-sm font-black font-serif capitalize ${isLight ? "text-[#1E120A]" : "text-white"}`}>
                  {palanContent.lucky_color}
                </span>
              </div>
            </div>
          </div>

          {/* Summary Forecast Section */}
          <div className={`p-5 rounded-2xl border space-y-4 ${isLight ? "bg-white border-[#E8DCC4]" : "bg-black/30 border-white/5"}`}>
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-700/25 pb-2">
              <TrendingUp className="h-4 w-4" />
              {t("common.todayForecast")}
            </h3>
            
            <div className="space-y-3 text-xs leading-relaxed text-gray-300 font-sans">
              <p className={isLight ? "text-[#5C4F43]" : "text-gray-300"}>{palanContent.combinedPara1}</p>
              <div className="border-t border-gray-700/15 my-2" />
              <p className={isLight ? "text-[#5C4F43]" : "text-gray-300"}>{palanContent.combinedPara2}</p>
            </div>
          </div>

          {/* Detailed Area Breakdown Bento */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
              <Award className="h-4 w-4" />
              {t("common.areaBreakdown")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AREA_CONFIGS.map((cfg) => {
                const areaData = palanContent.bot_response[cfg.key];
                if (!areaData) return null;

                const Icon = cfg.icon;
                const score = areaData.score ?? 50;
                const isAlert = cfg.key === "health" && score < 40;

                return (
                  <div 
                    key={cfg.key}
                    className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3.5 transition-all hover:scale-[1.01] duration-300 ${
                      isAlert 
                        ? "bg-rose-500/5 border-rose-500/25" 
                        : isLight 
                          ? "bg-white border-[#E8DCC4]" 
                          : "bg-black/30 border-white/5"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl border ${cfg.borderColor} ${cfg.bgColor} ${cfg.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className={`text-xs font-black uppercase tracking-wider ${isLight ? "text-[#1E120A]" : "text-gray-200"}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <span className={`text-sm font-black ${isAlert ? "text-rose-400" : cfg.color}`}>
                        {score}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-black/30 h-1 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${isAlert ? "bg-rose-500" : "bg-amber-500"}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>

                    <p className={`text-xs leading-relaxed font-sans ${isAlert ? "text-rose-300" : isLight ? "text-[#5C4F43]" : "text-gray-400"}`}>
                      {areaData.split_response?.trim()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
	</ScreenGuard>
  );
}

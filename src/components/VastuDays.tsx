import React from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { Clock, Compass, Home, Info, ShieldCheck } from "lucide-react";

interface VastuDaysTabProps {
  isLight?: boolean;
}

interface VastuDay {
  date: string;
  timeTa: string;
  timeEn: string;
  timeRange: string;
  noteTa: string;
  noteEn: string;
}

const VASTU_DATA: VastuDay[] = [
  {
    date: "26-01-2026",
    timeTa: "காலை",
    timeEn: "Morning",
    timeRange: "10.41 - 11.17",
    noteTa: "தை மாதம் - கிழக்கு திசை நோக்கி பூசை செய்ய உத்தமம்.",
    noteEn: "Thai Month - Ideal for East-facing rituals & excavations.",
  },
  {
    date: "06-03-2026",
    timeTa: "காலை",
    timeEn: "Morning",
    timeRange: "10.32 - 11.08",
    noteTa: "மாசி மாதம் - தெற்கு திசை நோக்கி வாஸ்து செய்ய நலம் பயக்கும்.",
    noteEn: "Masi Month - Auspicious for South-facing building works.",
  },
  {
    date: "23-04-2026",
    timeTa: "காலை",
    timeEn: "Morning",
    timeRange: "08.54 - 09.30",
    noteTa: "சித்திரை மாதம் - மேற்கு திசை நோக்கி பூசை செய்ய சிறப்பு.",
    noteEn: "Chithirai Month - Excellent for West-facing Vastu foundation.",
  },
  {
    date: "04-06-2026",
    timeTa: "காலை",
    timeEn: "Morning",
    timeRange: "09.58 - 10.34",
    noteTa: "வைகாசி மாதம் - வடக்கு திசை நோக்கி வாஸ்து செய்ய உகந்தது.",
    noteEn: "Vaikasi Month - High prosperity for North-facing activities.",
  },
  {
    date: "27-07-2026",
    timeTa: "காலை",
    timeEn: "Morning",
    timeRange: "07.44 - 08.20",
    noteTa: "ஆடி மாதம் - கிழக்கு திசையில் புதிய மனை கோல சிறப்பு.",
    noteEn: "Aadi Month - Auspicious for starting new layout boundaries.",
  },
  {
    date: "23-08-2026",
    timeTa: "காலை",
    timeEn: "Morning",
    timeRange: "07.23 - 07.59",
    noteTa: "ஆவணி மாதம் - தெற்கு திசை வாஸ்து பணிகளுக்கு நன்று.",
    noteEn: "Avani Month - Recommended for building columns & beams.",
  },
  {
    date: "28-10-2026",
    timeTa: "காலை",
    timeEn: "Morning",
    timeRange: "07.44 - 08.20",
    noteTa: "ஐப்பசி மாதம் - மேற்கு திசை நோக்கி மனை பூசை செய்ய உத்தமம்.",
    noteEn: "Aippasi Month - Ideal for foundation-laying ceremonies.",
  },
  {
    date: "24-11-2026",
    timeTa: "காலை",
    timeEn: "Morning",
    timeRange: "11.29 - 12.05",
    noteTa: "கார்த்திகை மாதம் - வடக்கு திசை நோக்கி வாஸ்து செய்ய நன்று.",
    noteEn: "Karthigai Month - Auspicious for starting roof or structural work.",
  },
];

export default function VastuDays({ isLight = true }: VastuDaysTabProps) {
  const { isTamil } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Disclaimer Info Banner */}
      <div
        className={`p-4 rounded-2xl border text-xs flex gap-3 transition-all ${
          isLight
            ? "bg-amber-50/40 border-amber-500/15 text-[#5C4F43]"
            : "bg-white/5 border-white/5 text-gray-300"
        }`}
      >
        <Info className="w-5 h-5 shrink-0 text-amber-500" />
        <div>
          <p className="font-bold mb-1">
            {isTamil ? "வாஸ்து பூஜை நியதி:" : "Vastu Puja Principles:"}
          </p>
          <p className="leading-relaxed">
            {isTamil
              ? "வாஸ்து புருஷன் வருடத்திற்கு சில குறிப்பிட்ட நாட்களில் மட்டுமே விழித்திருப்பார். அந்த நேரத்தில் மட்டுமே மனை பூஜை அல்லது வாஸ்து பூஜைகள் செய்ய வேண்டும். இங்கு கொடுக்கப்பட்டுள்ள நேரங்கள் அனைத்தும் அத்தகைய உன்னத கால அளவு ஆகும்."
              : "The Vastu Purusha wakes up only on specific days and precise hours in a year. Building laying or foundation Puja must be initiated exactly within these specialized cosmic windows for eternal home-peace."}
          </p>
        </div>
      </div>

      {/* Vastu Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {VASTU_DATA.map((item, idx) => (
          <div
            key={idx}
            className={`rounded-3xl border shadow-lg overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-xl flex flex-col justify-between ${
              isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"
            }`}
          >
            <div className="p-6 space-y-4">
              {/* Header - Date Badge and Direction Info */}
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Home className="w-4.5 h-4.5 text-amber-500" />
                    <span
                      className={`text-[10px] font-bold tracking-widest uppercase font-mono ${
                        isLight ? "text-amber-700" : "text-amber-400"
                      }`}
                    >
                      {isTamil ? "வாஸ்து பூஜை தினம்" : "VASTU MUHURTHAM"}
                    </span>
                  </div>
                  <h4
                    className={`text-xl font-mono font-black ${
                      isLight ? "text-gray-900" : "text-white"
                    }`}
                  >
                    {item.date}
                  </h4>
                </div>

                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl">
                  <Compass className="w-5 h-5 animate-spin-slow" />
                </div>
              </div>

              {/* Auspicious Time Range Callout */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isLight
                    ? "bg-amber-50/40 border-amber-500/10"
                    : "bg-white/5 border-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        isLight ? "text-gray-800" : "text-white"
                      }`}
                    >
                      {isTamil ? "உகந்த நேரம்" : "Auspicious Time"}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      {isTamil ? item.timeTa : item.timeEn}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-mono font-black text-amber-500">
                    {item.timeRange}
                  </span>
                </div>
              </div>

              {/* Vastu Shastra Notes */}
              <div className="flex gap-2 text-xs">
                <ShieldCheck className="w-4.5 h-4.5 shrink-0 text-emerald-500 mt-0.5" />
                <p
                  className={`leading-relaxed ${
                    isLight ? "text-gray-600" : "text-gray-300"
                  }`}
                >
                  {isTamil ? item.noteTa : item.noteEn}
                </p>
              </div>
            </div>

            {/* Footer decoration */}
            <div
              className={`px-6 py-3 border-t text-[10px] font-mono flex items-center justify-between ${
                isLight
                  ? "bg-amber-50/10 border-amber-500/10 text-gray-500"
                  : "bg-black/10 border-white/5 text-gray-400"
              }`}
            >
              <span>
                {isTamil
                  ? "பூமி பூஜை & மனை அடிக்கல் நாட்டல்"
                  : "Bhumi Puja & Foundation Laying"}
              </span>
              <span className="text-amber-500 font-bold">✦ OK ✦</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import React from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { Calendar, CheckCircle, Info, Sparkles } from "lucide-react";

interface SubhaMuhurthamTabProps {
  isLight?: boolean;
}

interface MuhurthamDate {
  date: string;
  dayTa: string;
  dayEn: string;
}

interface MonthMuhurtham {
  monthTa: string;
  monthEn: string;
  dates: MuhurthamDate[];
}

const MUHURTHAM_DATA: MonthMuhurtham[] = [
  {
    monthTa: "ஜூலை 2026",
    monthEn: "July 2026",
    dates: [
      { date: "02", dayTa: "வியாழன்", dayEn: "Thursday" },
      { date: "05", dayTa: "ஞாயிறு", dayEn: "Sunday" },
      { date: "12", dayTa: "ஞாயிறு", dayEn: "Sunday" },
    ],
  },
  {
    monthTa: "ஆகஸ்ட் 2026",
    monthEn: "August 2026",
    dates: [
      { date: "23", dayTa: "ஞாயிறு", dayEn: "Sunday" },
      { date: "30", dayTa: "ஞாயிறு", dayEn: "Sunday" },
      { date: "31", dayTa: "திங்கள்", dayEn: "Monday" },
    ],
  },
  {
    monthTa: "செப்டம்பர் 2026",
    monthEn: "September 2026",
    dates: [
      { date: "07", dayTa: "திங்கள்", dayEn: "Monday" },
      { date: "13", dayTa: "ஞாயிறு", dayEn: "Sunday" },
      { date: "17", dayTa: "வியாழன்", dayEn: "Thursday" },
    ],
  },
  {
    monthTa: "அக்டோபர் 2026",
    monthEn: "October 2026",
    dates: [
      { date: "25", dayTa: "ஞாயிறு", dayEn: "Sunday" },
      { date: "30", dayTa: "வெள்ளி", dayEn: "Friday" },
    ],
  },
  {
    monthTa: "நவம்பர் 2026",
    monthEn: "November 2026",
    dates: [
      { date: "01", dayTa: "ஞாயிறு", dayEn: "Sunday" },
      { date: "11", dayTa: "புதன்", dayEn: "Wednesday" },
      { date: "13", dayTa: "வெள்ளி", dayEn: "Friday" },
      { date: "15", dayTa: "ஞாயிறு", dayEn: "Sunday" },
      { date: "16", dayTa: "திங்கள்", dayEn: "Monday" },
      { date: "20", dayTa: "வெள்ளி", dayEn: "Friday" },
      { date: "29", dayTa: "ஞாயிறு", dayEn: "Sunday" },
    ],
  },
  {
    monthTa: "டிசம்பர் 2026",
    monthEn: "December 2026",
    dates: [
      { date: "04", dayTa: "வெள்ளி", dayEn: "Friday" },
      { date: "06", dayTa: "ஞாயிறு", dayEn: "Sunday" },
      { date: "10", dayTa: "வியாழன்", dayEn: "Thursday" },
      { date: "13", dayTa: "ஞாயிறு", dayEn: "Sunday" },
      { date: "14", dayTa: "திங்கள்", dayEn: "Monday" },
    ],
  },
];

export default function SubhaMuhurthamDays({ isLight = true }: SubhaMuhurthamTabProps) {
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
            {isTamil ? "குறிப்பு:" : "Astrological Notice:"}
          </p>
          <p className="leading-relaxed">
            {isTamil
              ? "கீழே கொடுக்கப்பட்டுள்ள தேதிகள் அனைத்தும் 2026 ஆம் ஆண்டிற்கான பொதுவான சுப முகூர்த்த நாட்கள் ஆகும். மணமகன் மற்றும் மணமகளின் பிறந்த நட்சத்திரம் மற்றும் ஜாதக அமைப்புக்கு ஏற்ப துல்லியமான முகூர்த்த நேரத்தை ஜோதிடரிடம் சோதித்து முடிவெடுக்கவும்."
              : "The dates listed below are general auspicious marriage Muhurthams for 2026. For high-precision Muhurtham tailored to the specific birth charts of the bride and groom, consult our lineage experts."}
          </p>
        </div>
      </div>

      {/* Months Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MUHURTHAM_DATA.map((month, idx) => (
          <div
            key={idx}
            className={`rounded-3xl border shadow-lg overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-xl ${
              isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"
            }`}
          >
            {/* Card Header */}
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-amber-500" />
                <h3
                  className={`font-serif font-black text-sm uppercase tracking-wide ${
                    isLight ? "text-gray-900" : "text-amber-400"
                  }`}
                >
                  {isTamil ? month.monthTa : month.monthEn}
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-500/80 tracking-wider">
                2026
              </span>
            </div>

            {/* Dates Listing */}
            <div className="p-5 space-y-3.5">
              {month.dates.map((d, dIdx) => (
                <div
                  key={dIdx}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isLight
                      ? "bg-amber-50/30 border-amber-500/10 hover:bg-amber-50/50"
                      : "bg-white/5 border-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Date Badge */}
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex flex-col items-center justify-center font-mono font-black text-base shadow-md shadow-amber-500/10">
                      {d.date}
                    </div>
                    <div>
                      <p
                        className={`text-xs font-bold ${
                          isLight ? "text-gray-800" : "text-white"
                        }`}
                      >
                        {isTamil ? d.dayTa : d.dayEn}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Month Bottom Note */}
            <div
              className={`px-5 py-3 border-t text-[10px] flex items-center justify-between font-mono ${
                isLight
                  ? "bg-amber-50/15 border-amber-500/10 text-gray-500"
                  : "bg-black/10 border-white/5 text-gray-400"
              }`}
            >
              <span>
                {isTamil ? "வளர்பிறை சுப தினங்கள்" : "Valarpirai Auspicious Days"}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
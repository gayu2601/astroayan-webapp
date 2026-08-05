import React, { useState } from 'react';
import { Sparkles, Gem, ArrowLeft, Search, Star, Globe, LayoutGrid, Table } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StarGemstoneProps {
  language?: 'ta' | 'en';
}

export interface GemstoneItem {
  stars: string;
  planet: string;
  gem: string;
  colorBg?: string;
  colorBorder?: string;
  colorText?: string;
}

export const GEMSTONE_DATA: GemstoneItem[] = [
  { 
    stars: "அசுவதி, மகம், மூலம்", 
    planet: "கேது", 
    gem: "வைடூரியம்",
    colorBg: "bg-amber-950/30",
    colorBorder: "border-amber-500/40",
    colorText: "text-amber-300"
  },
  { 
    stars: "பரணி, பூரம், பூராடம்", 
    planet: "சுக்கிரன்", 
    gem: "வைரம்",
    colorBg: "bg-sky-950/30",
    colorBorder: "border-sky-400/40",
    colorText: "text-sky-200"
  },
  { 
    stars: "கார்த்திகை, உத்திராடம், உத்திரம்", 
    planet: "சூரியன்", 
    gem: "மாணிக்கம்",
    colorBg: "bg-rose-950/30",
    colorBorder: "border-rose-500/40",
    colorText: "text-rose-300"
  },
  { 
    stars: "ரோஹிணி, ஹஸ்தம், திருவோணம்", 
    planet: "சந்திரன்", 
    gem: "நல்முத்து",
    colorBg: "bg-slate-900/40",
    colorBorder: "border-slate-300/40",
    colorText: "text-slate-100"
  },
  { 
    stars: "மிருகசீர்ஷம், சித்திரை, அவிட்டம்", 
    planet: "செவ்வாய்", 
    gem: "பவளம்",
    colorBg: "bg-orange-950/30",
    colorBorder: "border-orange-500/40",
    colorText: "text-orange-300"
  },
  { 
    stars: "திருவாதிரை, சுவாதி, சதயம்", 
    planet: "ராகு", 
    gem: "கோமேதயம்",
    colorBg: "bg-stone-900/40",
    colorBorder: "border-amber-700/40",
    colorText: "text-amber-400"
  },
  { 
    stars: "புனர்பூசம், விசாகம், பூரட்டாதி", 
    planet: "குரு", 
    gem: "புஷ்பராகம்",
    colorBg: "bg-yellow-950/30",
    colorBorder: "border-yellow-400/40",
    colorText: "text-yellow-300"
  },
  { 
    stars: "பூசம், அனுஷம், உத்திராட்டாதி", 
    planet: "சனி", 
    gem: "நீலம்",
    colorBg: "bg-blue-950/30",
    colorBorder: "border-blue-500/40",
    colorText: "text-blue-300"
  },
  { 
    stars: "ஆயில்யம், கேட்டை, ரேவதி", 
    planet: "புதன்", 
    gem: "மரகதம்",
    colorBg: "bg-emerald-950/30",
    colorBorder: "border-emerald-500/40",
    colorText: "text-emerald-300"
  }
];

export const GEMSTONE_DATA_EN: GemstoneItem[] = [
  {
    stars: "Ashwini, Magham, Moolam",
    planet: "Ketu",
    gem: "Cat's Eye",
    colorBg: "bg-amber-950/30",
    colorBorder: "border-amber-500/40",
    colorText: "text-amber-300"
  },
  {
    stars: "Bharani, Pooram, Pooradam",
    planet: "Venus",
    gem: "Diamond",
    colorBg: "bg-sky-950/30",
    colorBorder: "border-sky-400/40",
    colorText: "text-sky-200"
  },
  {
    stars: "Karthigai, Uthiradam, Uthiram",
    planet: "Sun",
    gem: "Ruby",
    colorBg: "bg-rose-950/30",
    colorBorder: "border-rose-500/40",
    colorText: "text-rose-300"
  },
  {
    stars: "Rohini, Hastham, Thiruvonam",
    planet: "Moon",
    gem: "Pearl",
    colorBg: "bg-slate-900/40",
    colorBorder: "border-slate-300/40",
    colorText: "text-slate-100"
  },
  {
    stars: "Mrigashirsha, Chithirai, Avittam",
    planet: "Mars",
    gem: "Red Coral",
    colorBg: "bg-orange-950/30",
    colorBorder: "border-orange-500/40",
    colorText: "text-orange-300"
  },
  {
    stars: "Thiruvathirai, Swathi, Sadayam",
    planet: "Rahu",
    gem: "Hessonite (Gomed)",
    colorBg: "bg-stone-900/40",
    colorBorder: "border-amber-700/40",
    colorText: "text-amber-400"
  },
  {
    stars: "Punarpoosam, Visakam, Poorattadhi",
    planet: "Jupiter",
    gem: "Yellow Sapphire",
    colorBg: "bg-yellow-950/30",
    colorBorder: "border-yellow-400/40",
    colorText: "text-yellow-300"
  },
  {
    stars: "Poosam, Anusham, Uthirattadhi",
    planet: "Saturn",
    gem: "Blue Sapphire",
    colorBg: "bg-blue-950/30",
    colorBorder: "border-blue-500/40",
    colorText: "text-blue-300"
  },
  {
    stars: "Ayilyam, Kettai, Revathi",
    planet: "Mercury",
    gem: "Emerald",
    colorBg: "bg-emerald-950/30",
    colorBorder: "border-emerald-500/40",
    colorText: "text-emerald-300"
  }
];

export const StarGemstoneMapping: React.FC<StarGemstoneProps> = ({ language }) => {
  const navigate = useNavigate();
  const isTa = language === 'ta';
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const FINAL_DATA = isTa ? GEMSTONE_DATA : GEMSTONE_DATA_EN;

  const filteredData = FINAL_DATA.filter((item) => {
    const q = searchQuery.toLowerCase();
    return item.stars.toLowerCase().includes(q) ||
      item.planet.toLowerCase().includes(q) ||
      item.gem.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Main Title Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500/15 via-amber-500/10 to-purple-500/15 border border-emerald-500/20 p-6 sm:p-8 backdrop-blur-md">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-amber-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Gem className="w-6 h-6 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-amber-200">
                {isTa ? 'நட்சத்திரம் - கிரகம் - அதிர்ஷ்ட கல்' : 'Natchathiram - Graham - Gemstone'}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] font-mono uppercase tracking-wider">
                {isTa ? '27 நட்சத்திரங்கள், அதிபதி கிரகங்கள் மற்றும் உகந்த அதிர்ஷ்ட ரத்தினக் கற்கள் அட்டவணை' : 'Mapping of 27 Nakshatras, Ruling Planets & Lucky Gemstones'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isTa ? 'நட்சத்திரம், கிரகம் அல்லது கல் தேடுக...' : 'Search star, planet or gemstone...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-[var(--theme-text-muted)] hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{isTa ? 'கார்டுகள்' : 'Cards'}</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'table'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-[var(--theme-text-muted)] hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>{isTa ? 'அட்டவணை' : 'Table'}</span>
          </button>
        </div>
      </div>

      {/* Structured 3-Column Content View */}
      {viewMode === 'table' ? (
        /* Table View */
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 border-b border-white/15 text-xs font-serif uppercase tracking-wider text-amber-300">
                  <th className="py-4 px-5">{isTa ? 'நட்சத்திரங்கள் (Stars)' : 'Stars'}</th>
                  <th className="py-4 px-5">{isTa ? 'அதிபதி கிரகம் (Planet)' : 'Ruling Planet'}</th>
                  <th className="py-4 px-5">{isTa ? 'அதிர்ஷ்ட கல் (Gemstone)' : 'Gemstone'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                {filteredData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{item.stars}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 font-medium text-xs">
                        {item.planet}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border ${item.colorBg} ${item.colorBorder} ${item.colorText} font-serif font-bold text-xs sm:text-sm shadow-sm`}>
                        <Gem className="w-3.5 h-3.5" />
                        <span>{item.gem}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Structured 3-Column Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map((item, idx) => (
            <div
              key={idx}
              className={`glass-panel p-5 rounded-2xl border ${item.colorBorder} ${item.colorBg} hover:border-emerald-400/50 transition-all duration-300 space-y-4 flex flex-col justify-between`}
            >
              {/* Header: Planet Badge & Index */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-xs font-mono text-amber-300">
                    {idx + 1}
                  </div>
                  <span className="text-xs font-mono uppercase text-[var(--theme-text-muted)] tracking-wider">
                    {isTa ? 'கிரக அதிபதி' : 'Planet'}
                  </span>
                </div>

                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-black/50 border border-white/15 text-amber-300 font-serif font-bold text-xs">
                  {item.planet}
                </span>
              </div>

              {/* 3-Column Inner Breakdown: Stars | Planet | Gemstone */}
              <div className="space-y-3">
                {/* 1. Stars */}
                <div className="space-y-1">
                  <span className="text-[11px] text-[var(--theme-text-muted)] font-mono uppercase tracking-wider block">
                    {isTa ? 'நட்சத்திரங்கள்:' : 'Stars:'}
                  </span>
                  <p className="text-sm font-semibold text-white leading-snug">
                    {item.stars}
                  </p>
                </div>

                {/* 2 & 3. Planet & Gemstone Pill Card */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                  <div className="p-2.5 rounded-xl bg-black/30 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-[var(--theme-text-muted)] font-mono uppercase block">
                      {isTa ? 'கிரகம்' : 'Planet'}
                    </span>
                    <span className="text-xs font-bold text-purple-200">
                      {item.planet}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-xl bg-black/40 border ${item.colorBorder} space-y-0.5`}>
                    <span className="text-[10px] text-[var(--theme-text-muted)] font-mono uppercase block">
                      {isTa ? 'அதிர்ஷ்ட கல்' : 'Gemstone'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Gem className="w-3 h-3 text-amber-300 shrink-0" />
                      <span className={`text-xs font-serif font-bold ${item.colorText}`}>
                        {item.gem}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StarGemstoneMapping;
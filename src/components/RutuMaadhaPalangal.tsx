import React, { useState } from 'react';
import { Sparkles, Calendar, ArrowLeft, Search, AlertCircle, ShieldAlert, Filter, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RutuMaadhaProps {
  language?: 'ta' | 'en';
}

export interface RutuMonthItem {
  month: string;
  result: string;
  remedy?: string;
}

export const RUTU_MAADHA_DATA: RutuMonthItem[] = [
  { month: "சித்திரை", result: "விதவை", remedy: "30 நாட்களுக்குள் சிவபெருமானுக்கு பாலாபிஷேகம் செய்யவும்" },
  { month: "வைகாசி", result: "பதிவிரதை" },
  { month: "ஆனி", result: "சுகபோகம் பெறுபவள்" },
  { month: "ஆடி", result: "நடத்தை கெட்டுப் போகும்", remedy: "21 நாட்களுக்குள் அம்பாளுக்கு நூதன வஸ்திரதானம் செய்யவும்" },
  { month: "ஆவணி", result: "அதிக புத்ரலாபம்" },
  { month: "புரட்டாசி", result: "செல்வச் செழிப்பு உள்ளவள்" },
  { month: "ஐப்பசி", result: "வைதவ்யம் உள்ளவள்", remedy: "5 சுமங்கலிகளுக்கு வஸ்திர தானம் செய்யவும்" },
  { month: "கார்த்திகை", result: "பரபுருஷ நாட்டம் உள்ளவள்", remedy: "சிவன் கோயிலுக்கு அணையாவிளக்கு சமர்ப்பிக்கவும்" },
  { month: "மார்கழி", result: "நடத்தை கெட்டுப் போகும்", remedy: "பெருமாள் கோயிலில் 11 பேருக்கு அன்னதானம் செய்யவும்" },
  { month: "தை", result: "பதிவிரதை" },
  { month: "மாசி", result: "பொருள் நஷ்டம்", remedy: "சிவன் கோயிலில் 11 பேருக்கு அன்னதானம் செய்யவும்" },
  { month: "பங்குனி", result: "பல குழந்தைகள் பெறுவாள்" }
];

export const RUTU_MAADHA_DATA_EN: RutuMonthItem[] = [
  { month: "Chithirai", result: "May become widowed", remedy: "Perform a milk abhishekam to Lord Shiva within 30 days" },
  { month: "Vaikasi", result: "A devoted and faithful wife" },
  { month: "Aani", result: "Will enjoy a comfortable and luxurious life" },
  { month: "Aadi", result: "May develop improper conduct", remedy: "Offer new clothes to Goddess Amman within 21 days" },
  { month: "Aavani", result: "Blessed with many children" },
  { month: "Purattasi", result: "Will enjoy wealth and prosperity" },
  { month: "Aippasi", result: "Indication of widowhood", remedy: "Donate clothes to 5 married women (Sumangalis)" },
  { month: "Karthigai", result: "May develop attraction towards another man", remedy: "Offer an eternal lamp (Anaiya Vilakku) to a Shiva temple" },
  { month: "Margazhi", result: "May develop improper conduct", remedy: "Offer Annadanam (food donation) to 11 people at a Perumal temple" },
  { month: "Thai", result: "A devoted and faithful wife" },
  { month: "Maasi", result: "Financial loss", remedy: "Offer Annadanam (food donation) to 11 people at a Shiva temple" },
  { month: "Panguni", result: "Will be blessed with many children" }
];

export const RutuMaadhaPalangal: React.FC<RutuMaadhaProps> = ({ language }) => {
	const isTa = language === 'ta';
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [filterRemedyOnly, setFilterRemedyOnly] = useState<boolean>(false);
  const FINAL_DATA = isTa ? RUTU_MAADHA_DATA : RUTU_MAADHA_DATA_EN;

  const filteredData = FINAL_DATA.filter((item) => {
    const matchesSearch = item.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.result.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.remedy && item.remedy.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesMonth = selectedMonth === 'all' || item.month === selectedMonth;
    const matchesRemedy = !filterRemedyOnly || Boolean(item.remedy);

    return matchesSearch && matchesMonth && matchesRemedy;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Main Title Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-indigo-500/15 border border-amber-500/20 p-6 sm:p-8 backdrop-blur-md">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Calendar className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-amber-200">
                {isTa ? 'ருது மாத பலன்கள்' : 'Rutu Maadha Palangal'}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] font-mono uppercase tracking-wider">
                {isTa ? 'தமிழ் மாதங்களின் படி ருது சுப அசுப பலன்கள் மற்றும் பரிகாரங்கள்' : 'Predictions & Vedic Remedies by Tamil Month of Menstruation'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isTa ? 'மாதம் அல்லது பலன் தேடுக...' : 'Search month or prediction...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>

          {/* Month Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-amber-300 focus:outline-none focus:border-amber-500/50 transition-all"
          >
            <option value="all">{isTa ? 'அனைத்து மாதங்களும் (All Months)' : 'All Months'}</option>
            {FINAL_DATA.map((item) => (
              <option key={item.month} value={item.month}>
                {item.month}
              </option>
            ))}
          </select>

          {/* Remedy Toggle Pill */}
          <button
            onClick={() => setFilterRemedyOnly(!filterRemedyOnly)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 border ${
              filterRemedyOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/10'
                : 'bg-black/30 text-[var(--theme-text-muted)] border-white/10 hover:border-white/20'
            }`}
          >
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>{isTa ? 'பரிகாரங்கள் உள்ளவை மட்டும்' : 'Remedies Only'}</span>
          </button>
        </div>
      </div>

      {/* Grid of Month Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredData.length > 0 ? (
          filteredData.map((item, idx) => {
            const hasRemedy = Boolean(item.remedy);
            return (
              <div
                key={idx}
                className={`glass-panel p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                  hasRemedy
                    ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-black/20 to-purple-950/20 hover:border-amber-400/50'
                    : 'border-white/10 bg-black/20 hover:border-white/20'
                }`}
              >
                {/* Header: Month & Indicator */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 font-serif font-bold text-sm">
                      {idx + 1}
                    </div>
                    <h3 className="text-lg font-bold font-serif text-amber-200">
                      {item.month} {isTa ? 'மாதம்' : 'Month'}
                    </h3>
                  </div>

                  {hasRemedy ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-medium">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isTa ? 'பரிகாரம் தேவை' : 'Remedy Required'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isTa ? 'சுப பலன்' : 'Auspicious'}</span>
                    </span>
                  )}
                </div>

                {/* Result Text */}
                <div className="space-y-1">
                  <span className="text-[11px] text-[var(--theme-text-muted)] font-mono uppercase tracking-wider block">
                    {isTa ? 'பலன்:' : 'Prediction:'}
                  </span>
                  <p className="text-base font-medium text-white leading-relaxed">
                    {item.result}
                  </p>
                </div>

                {/* Visually Highlighted Remedy Section if exists */}
                {hasRemedy && (
                  <div className="mt-2 rounded-xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-purple-950/40 border border-amber-500/30 p-3.5 space-y-1.5 shadow-inner">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold tracking-wide">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        <span>{isTa ? 'பரிந்துரைக்கப்பட்ட பரிகாரம்' : 'Recommended Remedy'}</span>
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-100/95 font-medium leading-relaxed pl-0.5">
                      {item.remedy}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full glass-panel p-8 text-center rounded-2xl border border-white/10 space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto opacity-60" />
            <p className="text-sm text-[var(--theme-text-muted)]">
              {isTa ? 'தேடலுக்கு ஏற்ப விவரங்கள் எதுவுமில்லை.' : 'No items match your search filter.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RutuMaadhaPalangal;
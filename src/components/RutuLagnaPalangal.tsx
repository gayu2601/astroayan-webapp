import React, { useState } from 'react';
import { Sparkles, Compass, ArrowLeft, Search, AlertCircle, ShieldAlert, Filter, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface RutuLagnaProps {
language?: 'ta' | 'en';
}
export interface RutuLagnaItem {
rashi: string;
result: string;
remedy?: string;
}
export const RUTU_LAGNA_DATA: RutuLagnaItem[] = [
{ rashi: "மேஷம்", result: "மனம் போனபடி நடப்பவள்" },
{ rashi: "ரிஷபம்", result: "சுகபோகம்" },
{ rashi: "மிதுனம்", result: "சகலசம்பத்து ஏற்படும்" },
{ rashi: "கடகம்", result: "கெட்ட நடத்தை உள்ளவள்", remedy: "9 வாரம் அம்பாளுக்கு நெய்விளக்கு வைக்கவும்" },
{ rashi: "சிம்மம்", result: "புத்ர லாபம்" },
{ rashi: "கன்னி", result: "செல்வம் உள்ளவள்" },
{ rashi: "துலாம்", result: "சாமார்த்தியமுள்ளவள்" },
{ rashi: "விருச்சிகம்", result: "பரபுருஷ இச்சையுள்ளவள்", remedy: "9 வாரம் முருகனுக்கு நல்லெண்ணெய் விளக்கு வைக்கவும்" },
{ rashi: "தனுசு", result: "முன்பாதி துர்நடத்தை, பின்பாதி பதிவிரதை", remedy: "ஆசிரியர்கள் 4 பேருக்கு அன்னதானம் செய்யவும்" },
{ rashi: "மகரம்", result: "கௌரவக்குறைவு", remedy: "8 வாரம் சனிக்கு எள்நீபம் வைக்கவும்" },
{ rashi: "கும்பம்", result: "தான்யம் மிகுந்தவள்" },
{ rashi: "மீனம்", result: "சாமார்த்தியம் உள்ளவள்" }
];

export const RUTU_LAGNA_DATA_EN: RutuLagnaItem[] = [
  { rashi: "Aries", result: "Acts according to her own will" },
  { rashi: "Taurus", result: "Enjoys comfort and luxury" },
  { rashi: "Gemini", result: "Blessed with all kinds of prosperity" },
  { rashi: "Cancer", result: "May have improper conduct", remedy: "Light a ghee lamp for Goddess Amman for 9 consecutive weeks" },
  { rashi: "Leo", result: "Blessed with children" },
  { rashi: "Virgo", result: "Wealthy" },
  { rashi: "Libra", result: "Intelligent and resourceful" },
  { rashi: "Scorpio", result: "May develop attraction towards another man", remedy: "Light a sesame oil lamp for Lord Murugan for 9 consecutive weeks" },
  { rashi: "Sagittarius", result: "Improper conduct in the first half of life, faithful wife in the later half", remedy: "Offer Annadanam to 4 teachers" },
  { rashi: "Capricorn", result: "Loss of reputation", remedy: "Light a sesame oil lamp for Lord Shani for 8 consecutive weeks" },
  { rashi: "Aquarius", result: "Blessed with abundant food grains and prosperity" },
  { rashi: "Pisces", result: "Intelligent and resourceful" }
];

export const RutuLagnaPalangal: React.FC<RutuLagnaProps> = ({ language }) => {
const navigate = useNavigate();
const isTa = language === 'ta';
const [searchQuery, setSearchQuery] = useState('');
const [selectedRashi, setSelectedRashi] = useState<string>('all');
const [filterRemedyOnly, setFilterRemedyOnly] = useState<boolean>(false);
const FINAL_DATA = isTa ? RUTU_LAGNA_DATA : RUTU_LAGNA_DATA_EN;
const filteredData = FINAL_DATA.filter((item) => {
const matchesSearch = item.rashi.toLowerCase().includes(searchQuery.toLowerCase()) ||
item.result.toLowerCase().includes(searchQuery.toLowerCase()) ||
(item.remedy && item.remedy.toLowerCase().includes(searchQuery.toLowerCase()));
const matchesRashi = selectedRashi === 'all' || item.rashi === selectedRashi;
const matchesRemedy = !filterRemedyOnly || Boolean(item.remedy);

return matchesSearch && matchesRashi && matchesRemedy;
});
return (
<div className="space-y-6 max-w-5xl mx-auto">
  {/* Main Title Card */}
  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500/15 via-indigo-500/10 to-amber-500/15 border border-purple-500/20 p-6 sm:p-8 backdrop-blur-md">
    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
    <div className="relative z-10 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-amber-500/20 border border-indigo-500/40 flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <Compass className="w-6 h-6 text-indigo-300" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-amber-200">
            {isTa ? 'ருது லக்ன பலன்கள்' : 'Rutu Lagna Palangal'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--theme-text-muted)] font-mono uppercase tracking-wider">
            {isTa ? 'லக்னம் / ராசி அடிப்படையிலான ருது பலன்கள் மற்றும் பரிகாரங்கள்' : 'Predictions & Remedies based on Lagna / Rasi during Rutu'}
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
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/60" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isTa ? 'லக்னம் அல்லது பலன் தேடுக...' : 'Search Lagna or prediction...'}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-indigo-500/50 transition-all"
        />
      </div>

      {/* Lagna/Rashi Dropdown */}
      <select
        value={selectedRashi}
        onChange={(e) => setSelectedRashi(e.target.value)}
        className="px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-indigo-300 focus:outline-none focus:border-indigo-500/50 transition-all"
      >
        <option value="all">{isTa ? 'அனைத்து லக்னங்களும் (All Lagnas)' : 'All Lagnas'}</option>
        {FINAL_DATA.map((item) => (
          <option key={item.rashi} value={item.rashi}>
            {item.rashi} {isTa ? 'லக்னம்' : 'Lagna'}
          </option>
        ))}
      </select>

      {/* Remedy Filter Button */}
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

  {/* Grid of Lagna Cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {filteredData.length > 0 ? (
      filteredData.map((item, idx) => {
        const hasRemedy = Boolean(item.remedy);
        return (
          <div
            key={idx}
            className={`glass-panel p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
              hasRemedy
                ? 'border-amber-500/30 bg-gradient-to-br from-indigo-950/20 via-black/20 to-amber-950/20 hover:border-amber-400/50'
                : 'border-white/10 bg-black/20 hover:border-white/20'
            }`}
          >
            {/* Header: Rashi/Lagna */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-serif font-bold text-sm">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-bold font-serif text-amber-200">
                  {item.rashi} {isTa ? 'லக்னம் / ராசி' : 'Lagna'}
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

            {/* Remedy Badge Tag Section */}
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
        <AlertCircle className="w-8 h-8 text-indigo-400 mx-auto opacity-60" />
        <p className="text-sm text-[var(--theme-text-muted)]">
          {isTa ? 'தேடலுக்கு ஏற்ப விவரங்கள் எதுவுமில்லை.' : 'No items match your search filter.'}
        </p>
      </div>
    )}
  </div>
</div>
);
};
export default RutuLagnaPalangal;
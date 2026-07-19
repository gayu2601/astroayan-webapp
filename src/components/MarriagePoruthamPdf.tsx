import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useNakshatraPorutham } from '../../hooks/useNakshatraPorutham';
import { useTobPorutham } from '../../hooks/useTobPorutham';
import { 
  Heart, Sparkles, Star, Clock, Printer, Loader2, 
  CheckCircle, AlertCircle, Calendar, MapPin, ChevronRight, BarChart3 
} from 'lucide-react';
import ScreenGuard from './ScreenGuard';

const NAKSH_TAMIL = [
  'அஸ்வினி', 'பரணி', 'கார்த்திகை', 'ரோகிணி', 'மிருகசீரிடம்',
  'திருவாதிரை', 'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்',
  'பூரம்', 'உத்திரம்', 'ஹஸ்தம்', 'சித்திரை', 'சுவாதி',
  'விசாகம்', 'அனுஷம்', 'கேட்டை', 'மூலம்', 'பூராடம்',
  'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்', 'பூரட்டாதி',
  'உத்திரட்டாதி', 'ரேவதி'
];

const NAKSH_ENGLISH = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira',
  'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
  'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati',
  'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati'
];

const MATCH_KEY_LABELS: Record<string, { ta: string; en: string }> = {
  dina: { ta: 'தினம் (Dina)', en: 'Dina (Health/Prosperity)' },
  gana: { ta: 'கணம் (Gana)', en: 'Gana (Temperament)' },
  mahendra: { ta: 'மஹேந்திரம் (Mahendra)', en: 'Mahendra (Lineage)' },
  sthree: { ta: 'ஸ்த்ரீ தீர்க்கம் (Sthree)', en: 'Sthree Deergham (Wealth)' },
  yoni: { ta: 'யோனி (Yoni)', en: 'Yoni (Physical Compatibility)' },
  rasi: { ta: 'ராசி (Rasi)', en: 'Rasi (Zodiac Match)' },
  rasiathi: { ta: 'ராசி அதிபதி (Rasiathi)', en: 'Rasi Adhipati (Friendship)' },
  vasya: { ta: 'வச்யம் (Vasya)', en: 'Vasya (Mutual Attraction)' },
  rajju: { ta: 'ராஜ்ஜு (Rajju)', en: 'Rajju (Longevity of Groom)' },
  vedha: { ta: 'வேதா (Vedha)', en: 'Vedha (Obstacles Avoidance)' },
  tara: { ta: 'தாரா (Tara)', en: 'Tara (Destiny/Comfort)' },
  bhakoot: { ta: 'பகூட் / ராசி (Bhakoot)', en: 'Bhakoot (Relationship/Family)' },
  grahamaitri: { ta: 'கிரக மைத்ரி / அதிபதி', en: 'Graha Maitri (Mental Match)' },
  nadi: { ta: 'நாடி (Nadi)', en: 'Nadi (Health/Offspring)' },
  varna: { ta: 'வர்ணம் (Varna)', en: 'Varna (Vocation/Nature)' }
};

export default function MarriagePoruthamPdf() {
  const { t, language, isTamil } = useTranslation();
  const [matchType, setMatchType] = useState<'star' | 'tob'>('star');
  
  // Star Match State
  const [girlStar, setGirlStar] = useState<number>(0);
  const [boyStar, setBoyStar] = useState<number>(0);
  
  // TOB Match State
  const [girlName, setGirlName] = useState('');
  const [boyName, setBoyName] = useState('');
  const [girlDob, setGirlDob] = useState('');
  const [boyDob, setBoyDob] = useState('');
  const [girlTob, setGirlTob] = useState('');
  const [boyTob, setBoyTob] = useState('');
  const [girlPlace, setGirlPlace] = useState('');
  const [boyPlace, setBoyPlace] = useState('');

  const [apiInput, setApiInput] = useState<any>(null);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  const { porutham: starPorutham, loading: starLoading, error: starError } = 
    useNakshatraPorutham(matchType === 'star' ? apiInput : null);
    
  const { porutham: tobPorutham, loading: tobLoading, error: tobError } = 
    useTobPorutham(matchType === 'tob' ? apiInput : null);

  const activeResult = matchType === 'star' ? starPorutham : tobPorutham;
  const globalLoading = starLoading || tobLoading;
  const globalError = starError || tobError || errorLocal;

  const handleStarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);
    setApiInput({
	  api_key: '6a0b4e5a-b8d5-5e1a-bd97-6128ad38d349',
      boy_star: boyStar + 1,
      girl_star: girlStar + 1,
      lang: language
    });
  };

  const handleTobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);

    if (!girlDob || !boyDob || !girlTob || !boyTob || !girlPlace || !boyPlace) {
      setErrorLocal(isTamil ? 'அனைத்து விபரங்களையும் நிரப்பவும்.' : 'Please fill all fields.');
      return;
    }

    try {
      // Helper geocode
      const geocode = async (place: string) => {
        const encoded = encodeURIComponent(place);
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`);
        const d = await res.json();
        if (!d || d.length === 0) throw new Error(`"${place}" not found`);
        return { lat: parseFloat(d[0].lat), lon: parseFloat(d[0].lon) };
      };

      const girlCoords = await geocode(girlPlace);
      const boyCoords = await geocode(boyPlace);

      // Convert date inputs "YYYY-MM-DD" to "DD/MM/YYYY"
      const formatApiDate = (dStr: string) => {
        const parts = dStr.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      };

      setApiInput({
		api_key: '6a0b4e5a-b8d5-5e1a-bd97-6128ad38d349',  
        boy_dob: formatApiDate(boyDob),
        boy_tob: boyTob,
        girl_dob: formatApiDate(girlDob),
        girl_tob: girlTob,
        boy_lat: boyCoords.lat,
        boy_lon: boyCoords.lon,
        girl_lat: girlCoords.lat,
        girl_lon: girlCoords.lon,
        boy_tz: 5.5,
        girl_tz: 5.5,
        lang: language
      });
    } catch (err: any) {
      setErrorLocal(err.message || String(err));
    }
  };

  // Triggers PDF Printing inside new Window
  const handlePrint = () => {
    if (!activeResult) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup blocked! Please allow popups for this site.');
      return;
    }

    const maxScore = matchType === 'tob' ? 36 : 10;
    const score = activeResult.score || 0;

    let rowsHTML = '';
    const excludedKeys = [
      'score','bot_response','boy_planetary_details','girl_planetary_details','boy_astro_details','girl_astro_details'
    ];

    Object.entries(activeResult).forEach(([key, value]: any) => {
      if (excludedKeys.includes(key)) return;
      const label = MATCH_KEY_LABELS[key] ? (isTamil ? MATCH_KEY_LABELS[key].ta : MATCH_KEY_LABELS[key].en) : key;
      const status = (value[key] || value.full_score) ? 'Matched' : 'Not Matched';
      const points = value[key] ?? value.score ?? 0;
      const full = value.full_score || 1;
      
      rowsHTML += `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${label}</td>
          <td style="padding: 10px; border: 1px solid #ddd; text-align: center; color: ${points > 0 ? 'green' : 'red'}; font-weight: bold;">
            ${points} / ${full}
          </td>
          <td style="padding: 10px; border: 1px solid #ddd;">${value.description || '—'}</td>
        </tr>
      `;
    });

    const reportHTML = `
      <html>
        <head>
          <title>Porutham Match Report</title>
          <style>
            body { font-family: sans-serif; background-color: #fffcf5; color: #333; padding: 40px; }
            .card { max-width: 800px; margin: 0 auto; background: #fff; padding: 30px; border: 2px solid #e5c158; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            h1 { text-align: center; font-family: serif; color: #b45309; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #fef3c7; color: #92400e; font-weight: bold; padding: 12px; border: 1px solid #ddd; }
            .score { text-align: center; font-size: 24px; font-weight: bold; margin-top: 30px; color: #b45309; padding: 15px; background: #fef3c7; border-radius: 8px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="card">
            <button class="no-print" onclick="window.print()" style="padding: 10px 20px; background: #b45309; color: white; border: none; border-radius: 6px; cursor: pointer; float: right;">Print</button>
            <h1>💍 Marriage Porutham Match Report</h1>
            <h3 style="text-align: center;">${matchType === 'star' ? 'Star Matching Analysis' : 'Time of Birth Matching Analysis'}</h3>
            
            <table>
              <thead>
                <tr>
                  <th>Porutham (Koot)</th>
                  <th>Points</th>
                  <th>Observation</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHTML}
              </tbody>
            </table>

            <div class="score">
              Total Score: ${score} / ${maxScore}
              <div style="font-size: 14px; font-weight: normal; margin-top: 10px; color: #555;">
                ${activeResult.bot_response || ''}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(reportHTML);
    printWindow.document.close();
  };

  return (
  <ScreenGuard featureId="porutham_pdf">
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Tab Switcher */}
      <div className="flex border border-gray-150 p-1.5 rounded-xl bg-gray-50 max-w-md mx-auto">
        <button
          onClick={() => { setMatchType('star'); setApiInput(null); }}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            matchType === 'star'
              ? 'bg-amber-500 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Star className="w-4 h-4" />
          {isTamil ? 'நட்சத்திர பொருத்தம்' : 'Star Matching'}
        </button>
        <button
          onClick={() => { setMatchType('tob'); setApiInput(null); }}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            matchType === 'tob'
              ? 'bg-amber-500 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          {isTamil ? 'நேர பொருத்தம்' : 'Birth Time Matching'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Form Inputs Container */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-b border-gray-100 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-800">
              {isTamil ? 'விபரங்களை உள்ளிடவும்' : 'Enter Match Profiles'}
            </h3>
          </div>

          <div className="p-6">
            {matchType === 'star' ? (
              <form onSubmit={handleStarSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Girl Star Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {isTamil ? 'பெண் நட்சத்திரம்' : "Girl's Star"}
                    </label>
                    <select
                      value={girlStar}
                      onChange={(e) => setGirlStar(Number(e.target.value))}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-semibold text-gray-800"
                    >
                      {NAKSH_TAMIL.map((star, idx) => (
                        <option key={idx} value={idx}>
                          {isTamil ? star : NAKSH_ENGLISH[idx]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Boy Star Selection */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {isTamil ? 'ஆண் நட்சத்திரம்' : "Boy's Star"}
                    </label>
                    <select
                      value={boyStar}
                      onChange={(e) => setBoyStar(Number(e.target.value))}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-semibold text-gray-800"
                    >
                      {NAKSH_TAMIL.map((star, idx) => (
                        <option key={idx} value={idx}>
                          {isTamil ? star : NAKSH_ENGLISH[idx]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={globalLoading}
                  className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {globalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isTamil ? 'பொருத்தம் பார்க்கப்படுகிறது...' : 'Matching Stars...'}
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      {isTamil ? 'பொருத்தம் காண்க' : 'Check Star Compatibility'}
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleTobSubmit} className="space-y-6">
                {/* Girl Section */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-amber-700 uppercase tracking-wider border-b border-gray-100 pb-1">
                    {isTamil ? 'பெண் விபரங்கள்' : "Girl's Birth Details"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={isTamil ? 'பெயர்' : 'Name'}
                      value={girlName}
                      onChange={(e) => setGirlName(e.target.value)}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                    <input
                      type="date"
                      value={girlDob}
                      onChange={(e) => setGirlDob(e.target.value)}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-700"
                    />
                    <input
                      type="time"
                      value={girlTob}
                      onChange={(e) => setGirlTob(e.target.value)}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-700"
                    />
                    <input
                      type="text"
                      placeholder={isTamil ? 'பிறந்த இடம்' : 'Birth Place'}
                      value={girlPlace}
                      onChange={(e) => setGirlPlace(e.target.value)}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                {/* Boy Section */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-indigo-700 uppercase tracking-wider border-b border-gray-100 pb-1">
                    {isTamil ? 'ஆண் விபரங்கள்' : "Boy's Birth Details"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={isTamil ? 'பெயர்' : 'Name'}
                      value={boyName}
                      onChange={(e) => setBoyName(e.target.value)}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                    <input
                      type="date"
                      value={boyDob}
                      onChange={(e) => setBoyDob(e.target.value)}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700"
                    />
                    <input
                      type="time"
                      value={boyTob}
                      onChange={(e) => setBoyTob(e.target.value)}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700"
                    />
                    <input
                      type="text"
                      placeholder={isTamil ? 'பிறந்த இடம்' : 'Birth Place'}
                      value={boyPlace}
                      onChange={(e) => setBoyPlace(e.target.value)}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={globalLoading}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all text-sm flex items-center justify-center gap-2"
                >
                  {globalLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isTamil ? 'பிறந்த நேர பொருத்தம் கணிக்கப்படுகிறது...' : 'Analyzing TOB Compatibility...'}
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      {isTamil ? 'பொருத்தம் காண்க' : 'Check Birth Time Compatibility'}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Results Sidebar Display Column */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-5 space-y-6">
            <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-3 text-sm flex items-center gap-2">
              <BarChart3 className="w-4.5 h-4.5 text-amber-500" />
              {isTamil ? 'பொருத்த முடிவுகள்' : 'Match Analysis'}
            </h4>

            {globalLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-xs text-gray-400">
                  {isTamil ? 'இணைப்புப் பொருத்தங்கள் கணிக்கப்படுகின்றன...' : 'Syncing astrological parameters...'}
                </p>
              </div>
            ) : activeResult ? (
              <div className="space-y-6">
                <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl text-center space-y-2">
                  <div className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                    {isTamil ? 'பொருத்த மதிப்பெண்' : 'Total Compatibility Score'}
                  </div>
                  <div className="text-3xl font-black text-amber-600">
                    {activeResult.score} / {matchType === 'tob' ? 36 : 10}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {activeResult.bot_response}
                  </p>
                </div>

                {/* Score list breakdown */}
                <div className="space-y-2 divide-y divide-gray-50 max-h-[300px] overflow-y-auto pr-1">
                  {Object.entries(activeResult).map(([key, value]: any) => {
                    const excluded = ['score', 'bot_response', 'boy_planetary_details', 'girl_planetary_details', 'boy_astro_details', 'girl_astro_details'];
                    if (excluded.includes(key)) return null;

                    const label = MATCH_KEY_LABELS[key] ? (isTamil ? MATCH_KEY_LABELS[key].ta : MATCH_KEY_LABELS[key].en) : key;
                    const pts = value[key] ?? value.score ?? 0;
                    const full = value.full_score || 1;

                    return (
                      <div key={key} className="flex justify-between items-center py-2.5 text-xs">
                        <div className="space-y-0.5">
                          <span className="font-bold text-gray-800">{label}</span>
                          <p className="text-[10px] text-gray-400 max-w-[180px] truncate">{value.description}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          pts > 0 ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-500'
                        }`}>
                          {pts} / {full}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handlePrint}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/10 transition-all text-xs"
                >
                  <Printer className="w-4 h-4" />
                  {isTamil ? 'அறிக்கை அச்சிடு / சேமி' : 'Print / Save Report PDF'}
                </button>
              </div>
            ) : globalError ? (
              <div className="flex items-start gap-3 bg-red-50 text-red-800 p-4 rounded-xl border border-red-100 text-xs leading-relaxed">
                <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-sm">{isTamil ? 'பிழை' : 'Error'}</h5>
                  <p>{globalError}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 space-y-2">
                <Heart className="w-8 h-8 mx-auto text-amber-500/20" />
                <p className="text-xs">
                  {isTamil 
                    ? 'விபரங்களை சமர்ப்பித்து பொருத்தங்களை கணித்திடுங்கள்.' 
                    : 'Submit birth parameters on the left to display compatibility scorecard.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
	</ScreenGuard>
  );
}

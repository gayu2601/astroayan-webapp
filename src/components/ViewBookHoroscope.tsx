import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useBookHoroscope1 } from '../../hooks/useBookHoroscope1';
import HoroscopeInputForm from './HoroscopeInputForm';
import { CustomKattamGrid } from './CustomKattamGrid';
import { 
  Sparkles, Calendar, Clock, MapPin, ChevronLeft, Award, HelpCircle, 
  Loader2, BookOpen, Layers, Milestone, Compass, Table, Heart 
} from 'lucide-react';

const PLANET_NAMES_TA: Record<string, string> = {
  Sun: 'சூரியன்', Moon: 'சந்திரன்', Mars: 'செவ்வாய்', Mercury: 'புதன்',
  Jupiter: 'குரு', Venus: 'சுக்கிரன்', Saturn: 'சனி', Rahu: 'ராகு', Ketu: 'கேது',
  Ascendant: 'லக்னம்', Lagna: 'லக்னம்'
};

const DIVISIONAL_LABELS: Record<string, string> = {
  d2: 'D2 - Hora',
  d3: 'D3 - Drekkana',
  d3s: 'D3S - Somanath',
  d4: 'D4 - Chaturthamsa',
  d5: 'D5 - Panchamsa',
  d7: 'D7 - Saptamsa',
  d8: 'D8 - Ashtamsa',
  d10: 'D10 - Dasamsa',
  d10R: 'D10R - Dasamsa (R)',
  d12: 'D12 - Dvadasamsa',
  d16: 'D16 - Shodasamsa',
  d20: 'D20 - Vimshamsa',
  d24: 'D24 - Chaturvimshamsa',
  d24R: 'D24R - Chaturvimshamsa (R)',
  d27: 'D27 - Saptavimshamsa',
  d30: 'D30 - Trimshamsa',
  d40: 'D40 - Khavedamsa',
  d45: 'D45 - Akshavedamsa',
  d60: 'D60 - Shashtiamsa',
};

const DIVISIONAL_LABELS_TA: Record<string, string> = {
  d2: 'D2 - ஹோரா',
  d3: 'D3 - திரேக்காணம்',
  d3s: 'D3S - சோமநாத்',
  d4: 'D4 - சதுர்த்தாம்சம்',
  d5: 'D5 - பஞ்சாம்சம்',
  d7: 'D7 - சப்தாம்சம்',
  d8: 'D8 - அஷ்டாம்சம்',
  d10: 'D10 - தசாம்சம்',
  d10R: 'D10R - தசாம்சம் (R)',
  d12: 'D12 - துவாதசாம்சம்',
  d16: 'D16 - சோதசாம்சம்',
  d20: 'D20 - விம்சாம்சம்',
  d24: 'D24 - சதுர்விம்சாம்சம்',
  d24R: 'D24R - சதுர்விம்சாம்சம் (R)',
  d27: 'D27 - சப்தவிம்சாம்சம்',
  d30: 'D30 - திரிம்சாம்சம்',
  d40: 'D40 - கவேதாம்சம்',
  d45: 'D45 - அக்ஷவேதாம்சம்',
  d60: 'D60 - ஷஷ்டியாம்சம்',
};

export default function ViewBookHoroscope({ isLight = false }: { isLight?: boolean }) {
  const { t, language, isTamil } = useTranslation();
  const { generateReportData } = useBookHoroscope1();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'divs' | 'ashtak' | 'dashas' | 'predictions'>('basic');
  const [selectedDivKey, setSelectedDivKey] = useState<string>('d2');

  const handleFormSubmit = async (values: {
    name: string;
    fatherName: string;
    motherName: string;
    dob: Date;
    tob: Date;
    place: string;
  }) => {
    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const dobStr = values.dob.toISOString().split('T')[0]; // "YYYY-MM-DD"
      const hours = String(values.tob.getHours()).padStart(2, '0');
      const mins = String(values.tob.getMinutes()).padStart(2, '0');
      const timeStr = `${hours}:${mins}`; // "HH:MM"

      const data = await generateReportData({
        name: values.name,
        fatherName: values.fatherName,
        motherName: values.motherName,
        dob: dobStr,
        time: timeStr,
        place: values.place,
      }, language);

      if (data) {
        setReportData(data);
      } else {
        throw new Error(language === 'ta' ? 'ஜாதக விபரங்களைப் பெற முடியவில்லை.' : 'Failed to retrieve horoscope report data.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setReportData(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-6">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        <div className="space-y-2">
          <h3 className={`text-xl font-semibold ${isLight ? "text-gray-800" : "text-amber-400"}`}>
            {language === 'ta' ? 'ஜாதக விபரங்கள் கணிக்கப்படுகின்றன...' : 'Calculating Birth Coordinates...'}
          </h3>
          <p className={`text-sm max-w-md mx-auto ${isLight ? "text-gray-500" : "text-gray-300"}`}>
            {language === 'ta' 
              ? '16 வர்க்கச் சக்கரங்கள், தசா காலங்கள் மற்றும் விரிவான ஜாதக பலன்கள் அண்ட வெளியின் கிரக நிலைகளுடன் இணைக்கப்படுகின்றன.' 
              : 'Orchestrating planetary algorithms, divisional layouts, dasha timelines and astro predictions.'}
          </p>
        </div>
      </div>
    );
  }

  if (reportData) {
    // Format planets raw list
    const planetsArray = reportData.planets ? Object.values(reportData.planets) : [];
    const lagnaEntry: any = planetsArray.find((p: any) => p.name === 'லக்' || p.name === 'Lagna' || p.full_name?.toLowerCase().includes('lagna') || p.full_name?.toLowerCase().includes('ascendant'));
    const ascendantSignNo = lagnaEntry ? lagnaEntry.rasi_no : 1;

    // Filter planet rows
    const filteredPlanetRows = planetsArray.filter((p: any) => {
      const nameLower = (p.full_name || p.name || '').toLowerCase();
      return !nameLower.includes('lagna') && !nameLower.includes('ascendant') && !nameLower.includes('லக்');
    });

    // Divisional charts selection data
    const divCharts = [
      { key: 'd2', label: isTamil ? DIVISIONAL_LABELS_TA.d2 : DIVISIONAL_LABELS.d2, data: reportData.d2Chart },
      { key: 'd3', label: isTamil ? DIVISIONAL_LABELS_TA.d3 : DIVISIONAL_LABELS.d3, data: reportData.d3Chart },
      { key: 'd3s', label: isTamil ? DIVISIONAL_LABELS_TA.d3s : DIVISIONAL_LABELS.d3s, data: reportData.d3sChart },
      { key: 'd4', label: isTamil ? DIVISIONAL_LABELS_TA.d4 : DIVISIONAL_LABELS.d4, data: reportData.d4Chart },
      { key: 'd5', label: isTamil ? DIVISIONAL_LABELS_TA.d5 : DIVISIONAL_LABELS.d5, data: reportData.d5Chart },
      { key: 'd7', label: isTamil ? DIVISIONAL_LABELS_TA.d7 : DIVISIONAL_LABELS.d7, data: reportData.d7Chart },
      { key: 'd8', label: isTamil ? DIVISIONAL_LABELS_TA.d8 : DIVISIONAL_LABELS.d8, data: reportData.d8Chart },
      { key: 'd10', label: isTamil ? DIVISIONAL_LABELS_TA.d10 : DIVISIONAL_LABELS.d10, data: reportData.d10Chart },
      { key: 'd10R', label: isTamil ? DIVISIONAL_LABELS_TA.d10R : DIVISIONAL_LABELS.d10R, data: reportData.d10RChart },
      { key: 'd12', label: isTamil ? DIVISIONAL_LABELS_TA.d12 : DIVISIONAL_LABELS.d12, data: reportData.d12Chart },
      { key: 'd16', label: isTamil ? DIVISIONAL_LABELS_TA.d16 : DIVISIONAL_LABELS.d16, data: reportData.d16Chart },
      { key: 'd20', label: isTamil ? DIVISIONAL_LABELS_TA.d20 : DIVISIONAL_LABELS.d20, data: reportData.d20Chart },
      { key: 'd24', label: isTamil ? DIVISIONAL_LABELS_TA.d24 : DIVISIONAL_LABELS.d24, data: reportData.d24Chart },
      { key: 'd24R', label: isTamil ? DIVISIONAL_LABELS_TA.d24R : DIVISIONAL_LABELS.d24R, data: reportData.d24RChart },
      { key: 'd27', label: isTamil ? DIVISIONAL_LABELS_TA.d27 : DIVISIONAL_LABELS.d27, data: reportData.d27Chart },
      { key: 'd30', label: isTamil ? DIVISIONAL_LABELS_TA.d30 : DIVISIONAL_LABELS.d30, data: reportData.d30Chart },
      { key: 'd40', label: isTamil ? DIVISIONAL_LABELS_TA.d40 : DIVISIONAL_LABELS.d40, data: reportData.d40Chart },
      { key: 'd45', label: isTamil ? DIVISIONAL_LABELS_TA.d45 : DIVISIONAL_LABELS.d45, data: reportData.d45Chart },
      { key: 'd60', label: isTamil ? DIVISIONAL_LABELS_TA.d60 : DIVISIONAL_LABELS.d60, data: reportData.d60Chart },
    ].filter(c => c.data && Object.keys(c.data).length > 0);

    const activeDivChart = divCharts.find(c => c.key === selectedDivKey) || divCharts[0];

    // Helper to format planet array for Kattam view
    const makeKattamPlanets = (chartResponse: any) => {
      if (!chartResponse) return [];
      return Object.values(chartResponse).map((p: any) => ({
        rasi_no: p.rasi_no,
        name: isTamil ? (PLANET_NAMES_TA[p.full_name || p.name] || p.name) : p.name
      }));
    };

    return (
      <div className="space-y-6 pb-12">
        {/* Top bar with Back Button & Title */}
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl border transition-all ${isLight ? "bg-white border-amber-500/15 shadow-md" : "bg-black/35 border-white/5 shadow-xl"}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className={`p-2 rounded-lg transition-colors border ${isLight ? "hover:bg-amber-50 text-gray-500 hover:text-gray-700 border-amber-500/15" : "hover:bg-white/10 text-gray-400 hover:text-white border-white/5"}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className={`text-xl font-cinzel font-black ${isLight ? "text-amber-700" : "text-amber-400"}`}>{reportData.name}</h2>
              <p className={`text-xs font-mono ${isLight ? "text-gray-500" : "text-gray-400"}`}>{reportData.place}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'basic', label: isTamil ? 'பொது / இராசி' : 'Basic & Charts', icon: Compass },
              { id: 'divs', label: isTamil ? 'வர்க்கச் சக்கரங்கள்' : 'Divisional Charts', icon: Layers },
              { id: 'ashtak', label: isTamil ? 'அஷ்டகவர்க்கம்' : 'Ashtakavarga', icon: Table },
              { id: 'dashas', label: isTamil ? 'தசா புத்தகம்' : 'Dasha Timeline', icon: Milestone },
              { id: 'predictions', label: isTamil ? 'விரிவான பலன்கள்' : 'Detailed predictions', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/10'
                      : isLight
                      ? 'bg-amber-500/5 text-gray-700 hover:bg-amber-500/10 border border-amber-500/15'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content containers */}
        {activeTab === 'basic' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Quick Stats Column */}
            <div className="lg:col-span-4 space-y-6">
              <div className={`rounded-xl border shadow-xl overflow-hidden transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
                <div className={`p-4 border-b font-bold text-sm transition-all ${isLight ? "bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/15 text-gray-800" : "bg-white/5 border-white/5 text-amber-400"}`}>
                  {isTamil ? 'ஜனன கால விபரங்கள்' : 'Birth Astro Details'}
                </div>
                <div className={`p-4 space-y-3 divide-y text-xs transition-all ${isLight ? "divide-amber-500/10 text-[#5C4F43]" : "divide-white/5 text-gray-300"}`}>
                  <div className="flex justify-between py-1.5">
                    <span className={`font-semibold ${isLight ? "text-gray-500" : "text-gray-400"}`}>{isTamil ? 'பெயர்' : "Name"}</span>
                    <span className={`font-bold ${isLight ? "text-gray-900" : "text-white"}`}>{reportData.name}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className={`font-semibold ${isLight ? "text-gray-500" : "text-gray-400"}`}>{isTamil ? 'தந்தை பெயர்' : "Father's Name"}</span>
                    <span className={`font-bold ${isLight ? "text-gray-900" : "text-white"}`}>{reportData.fatherName || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className={`font-semibold ${isLight ? "text-gray-500" : "text-gray-400"}`}>{isTamil ? 'லக்னம்' : 'Lagna'}</span>
                    <span className={`font-bold ${isLight ? "text-indigo-700" : "text-indigo-400"}`}>{reportData.astro?.ascendant_sign}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className={`font-semibold ${isLight ? "text-gray-500" : "text-gray-400"}`}>{isTamil ? 'ராசி' : 'Rashi'}</span>
                    <span className={`font-bold ${isLight ? "text-purple-700" : "text-purple-300"}`}>{reportData.astro?.rasi}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className={`font-semibold ${isLight ? "text-gray-500" : "text-gray-400"}`}>{isTamil ? 'நட்சத்திரம்' : 'Nakshatra'}</span>
                    <span className={`font-bold ${isLight ? "text-amber-700" : "text-amber-400"}`}>{reportData.astro?.nakshatra}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className={`font-semibold ${isLight ? "text-gray-500" : "text-gray-400"}`}>{isTamil ? 'திதி' : 'Tithi'}</span>
                    <span className={`font-bold ${isLight ? "text-gray-900" : "text-white"}`}>{reportData.astro?.tithi || reportData.planets?.panchang?.tithi || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className={`font-semibold ${isLight ? "text-gray-500" : "text-gray-400"}`}>{isTamil ? 'யோகம்' : 'Yogam'}</span>
                    <span className={`font-bold ${isLight ? "text-gray-900" : "text-white"}`}>{reportData.astro?.yoga || reportData.planets?.panchang?.yoga || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className={`font-semibold ${isLight ? "text-gray-500" : "text-gray-400"}`}>{isTamil ? 'கரணம்' : 'Karanam'}</span>
                    <span className={`font-bold ${isLight ? "text-gray-900" : "text-white"}`}>{reportData.astro?.karana || reportData.planets?.panchang?.karana || '—'}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className={`font-semibold ${isLight ? "text-gray-500" : "text-gray-400"}`}>{isTamil ? 'ஜனன கால திசா இருப்பு' : 'Dasha Balance at Birth'}</span>
                    <span className={`font-bold text-right ${isLight ? "text-gray-900" : "text-white"}`}>{reportData.dashaBalance || '—'}</span>
                  </div>
                  <div className={`flex justify-between py-1.5 p-2 rounded-lg transition-all ${isLight ? "bg-amber-500/5" : "bg-amber-500/10"}`}>
                    <span className={`font-bold ${isLight ? "text-amber-800" : "text-amber-400"}`}>{isTamil ? 'நடப்பு தசா' : 'Current Dasha'}</span>
                    <span className={`font-black ${isLight ? "text-amber-800" : "text-amber-300"}`}>{reportData.nadappuDasa?.text || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-xl border shadow-xl space-y-3 transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
                  <h4 className={`font-bold text-center text-sm ${isLight ? "text-amber-700" : "text-amber-400"}`}>
                    {isTamil ? 'இராசிச் சக்கரம் (D1)' : 'Rasi Chart (D1)'}
                  </h4>
                  <CustomKattamGrid 
                    title={isTamil ? "இராசி" : "Rasi"} 
                    planets={makeKattamPlanets(reportData.d1Chart)} 
                    lagnaSignNo={ascendantSignNo} 
                    isTamil={isTamil} 
                    theme={isLight ? "light" : "dark"} 
                  />
                </div>
                <div className={`p-4 rounded-xl border shadow-xl space-y-3 transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
                  <h4 className={`font-bold text-center text-sm ${isLight ? "text-indigo-700" : "text-indigo-400"}`}>
                    {isTamil ? 'நவாம்சம் (D9)' : 'Navamsa Chart (D9)'}
                  </h4>
                  <CustomKattamGrid 
                    title={isTamil ? "நவாம்சம்" : "Navamsa"} 
                    planets={makeKattamPlanets(reportData.d9Chart)} 
                    lagnaSignNo={ascendantSignNo} 
                    isTamil={isTamil} 
                    theme={isLight ? "light" : "dark"} 
                  />
                </div>
              </div>

              {/* Planet Details Table */}
              <div className={`rounded-xl border shadow-xl overflow-hidden transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
                <div className={`p-4 border-b font-bold text-xs sm:text-sm transition-all ${isLight ? "bg-amber-500/5 border-amber-500/15 text-gray-800" : "bg-white/5 border-white/5 text-amber-400"}`}>
                  {isTamil ? 'கிரக ஸ்புடங்கள் மற்றும் நிலைகள்' : 'Planetary Longitudes & Positions'}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className={`font-semibold uppercase text-[10px] transition-all ${isLight ? "bg-gray-50 text-gray-600" : "bg-white/5 text-gray-300"}`}>
                      <tr>
                        <th className="p-3">{isTamil ? 'கிரகம்' : 'Planet'}</th>
                        <th className="p-3">{isTamil ? 'ராசி' : 'Sign'}</th>
                        <th className="p-3">{isTamil ? 'ராசி பாகை' : 'Sign Deg'}</th>
                        <th className="p-3">{isTamil ? 'நட்சத்திரம்' : 'Nakshatra'}</th>
                        <th className="p-3">{isTamil ? 'பாதம்' : 'Pada'}</th>
                        <th className="p-3">{isTamil ? 'அதிபதி' : 'Lord'}</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y transition-all ${isLight ? "divide-amber-500/10 text-[#5C4F43]" : "divide-white/5 text-gray-300"}`}>
                      {filteredPlanetRows.map((p: any, idx: number) => {
                        return (
                          <tr key={idx} className={`transition-all ${isLight ? "hover:bg-amber-500/5" : "hover:bg-white/5"}`}>
                            <td className={`p-3 font-semibold ${isLight ? "text-gray-900" : "text-white"}`}>
                              {isTamil ? (PLANET_NAMES_TA[p.full_name || p.name] || p.full_name || p.name) : (p.full_name || p.name)}
                              {p.retro && <span className="ml-1 text-red-500 font-bold text-[9px]">(R)</span>}
                            </td>
                            <td className="p-3">{p.zodiac}</td>
                            <td className="p-3 font-semibold">{typeof p.local_degree === 'number' ? p.local_degree.toFixed(2) : p.local_degree}°</td>
                            <td className={`p-3 font-semibold ${isLight ? "text-amber-700" : "text-amber-400"}`}>{p.nakshatra}</td>
                            <td className="p-3 font-bold">{p.nakshatra_pada}</td>
                            <td className={`p-3 ${isLight ? "text-gray-500" : "text-gray-400"}`}>{p.nakshatra_lord || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'divs' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Divisional Chart Selector Sidebar */}
            <div className={`lg:col-span-4 p-4 rounded-xl border shadow-xl space-y-2 max-h-[500px] overflow-y-auto transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
              <h4 className={`font-bold border-b pb-2 text-xs uppercase tracking-wider mb-2 transition-all ${isLight ? "text-gray-700 border-amber-500/15" : "text-amber-400 border-white/5"}`}>
                {isTamil ? 'சக்கரத்தைத் தேர்ந்தெடுக்கவும்' : 'Select Divisional'}
              </h4>
              <div className="space-y-1">
                {divCharts.map((chart) => (
                  <button
                    key={chart.key}
                    onClick={() => setSelectedDivKey(chart.key)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedDivKey === chart.key
                        ? isLight
                          ? 'bg-amber-500/10 border-l-4 border-amber-500 text-amber-800'
                          : 'bg-amber-500/20 border-l-4 border-amber-500 text-amber-300'
                        : isLight
                        ? 'hover:bg-amber-500/5 border-l-4 border-transparent text-[#5C4F43]'
                        : 'hover:bg-white/5 border-l-4 border-transparent text-gray-300'
                    }`}
                  >
                    {chart.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Divisional Chart Rendering Column */}
            <div className={`lg:col-span-8 p-6 rounded-xl border shadow-xl flex flex-col items-center justify-center space-y-6 transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
              <div className="text-center space-y-1">
                <h3 className={`text-lg font-cinzel font-bold transition-all ${isLight ? "text-amber-700" : "text-amber-400"}`}>{activeDivChart?.label}</h3>
                <p className={`text-xs ${isLight ? "text-gray-500" : "text-gray-400"}`}>
                  {isTamil ? 'வர்க்கப் பகுப்பாய்வு விளக்கப்படம்' : 'Sub-divisional cosmic chart grid'}
                </p>
              </div>

              {activeDivChart ? (
                <CustomKattamGrid 
                  title={activeDivChart.key.toUpperCase()} 
                  planets={makeKattamPlanets(activeDivChart.data)} 
                  lagnaSignNo={ascendantSignNo} 
                  isTamil={isTamil} 
                  theme={isLight ? "light" : "dark"} 
                />
              ) : (
                <div className="text-gray-400 py-12 text-center text-xs">
                  {isTamil ? 'விளக்கப்படம் கிடைக்கவில்லை' : 'Chart is empty or unavailable'}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'ashtak' && (() => {
          const PLANET_LABEL_MAP: Record<string, string> = {
            Sun: isTamil ? 'சூரியன்' : 'Sun',
            Moon: isTamil ? 'சந்திரன்' : 'Moon',
            Mars: isTamil ? 'செவ்வாய்' : 'Mars',
            Mercury: isTamil ? 'புதன்' : 'Mercury',
            Jupiter: isTamil ? 'குரு' : 'Jupiter',
            Venus: isTamil ? 'சுக்கிரன்' : 'Venus',
            Saturn: isTamil ? 'சனி' : 'Saturn',
            Ascendant: isTamil ? 'லக்னம்' : 'Ascendant',
          };

          const SIGN_NAMES_TA = ['மேஷம்','ரிஷபம்','மிதுனம்','கடகம்','சிம்மம்','கன்னி','துலாம்','விருச்சிகம்','தனுசு','மகரம்','கும்பம்','மீனம்'];
          const SIGN_NAMES_EN = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

          const ashtak = reportData.ashtakvargaChart as {
            ashtakvarga_order: string[];
            ashtakvarga_points: number[][];
            ashtakvarga_total: number[];
          } | null | undefined;

          const bindusToPlanets = (arr: number[]) =>
            arr.map((val, j) => ({ rasi_no: j + 1, name: String(val) }));

          const order = ashtak?.ashtakvarga_order ?? [];
          const points = ashtak?.ashtakvarga_points ?? [];
          const total = ashtak?.ashtakvarga_total ?? [];

          const planetRows = order.map((planetName, i) => ({
            key: planetName,
            label: PLANET_LABEL_MAP[planetName] ?? planetName,
            bindus: points[i] ?? [],
            isTotal: false,
          }));
          const totalRow = {
            key: 'total',
            label: isTamil ? 'மொத்தம் (சர்வாஷ்டகம்)' : 'Total (Sarvashtaka)',
            bindus: total,
            isTotal: true,
          };
          const allRows = [...planetRows, totalRow];

          return (
            <div className="space-y-8">
              <div className={`p-6 rounded-xl border shadow-xl space-y-6 transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
                <div className="text-center space-y-2">
                  <h3 className={`text-xl font-cinzel font-bold transition-all ${isLight ? "text-amber-700" : "text-amber-400"}`}>
                    {isTamil ? 'அஷ்டகவர்க்க பரல்கள்' : 'Ashtakavarga Matrix'}
                  </h3>
                  <p className={`text-xs max-w-md mx-auto ${isLight ? "text-gray-500" : "text-gray-300"}`}>
                    {isTamil
                      ? 'ஒவ்வொரு கிரகத்தின் பரல்களும் இராசி வாரியாக காட்டப்படுகின்றன.'
                      : 'Bindus (points) contributed by each planet across the 12 signs.'}
                  </p>
                </div>

                {ashtak && order.length > 0 ? (
                  <>
                    {/* Per-planet kattam grids */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {allRows.map(({ key, label, bindus, isTotal }) => (
                        <div
                          key={key}
                          className={`border rounded-xl p-4 shadow-sm space-y-3 transition-all ${
                            isTotal
                              ? isLight
                                ? 'border-amber-300 bg-amber-50/30 sm:col-span-2 lg:col-span-1'
                                : 'border-amber-500/30 bg-amber-500/10 sm:col-span-2 lg:col-span-1'
                              : isLight
                              ? 'border-gray-100 bg-white'
                              : 'border-white/5 bg-black/25'
                          }`}
                        >
                          <h4 className={`font-bold text-center text-xs border-b pb-2 transition-all ${
                            isTotal
                              ? isLight ? 'text-amber-800 border-amber-200' : 'text-amber-300 border-amber-500/20'
                              : isLight ? 'text-indigo-700 border-gray-200' : 'text-indigo-300 border-white/5'
                          }`}>
                            {label}
                          </h4>
                          {bindus.length === 12 ? (
                            <CustomKattamGrid
                              title={label}
                              planets={bindusToPlanets(bindus)}
                              lagnaSignNo={ascendantSignNo}
                              isTamil={isTamil}
                              theme={isLight ? "light" : "dark"}
                            />
                          ) : (
                            <p className="text-center text-gray-400 text-[10px] py-4">
                              {isTamil ? 'தகவல் இல்லை' : 'No data'}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Full matrix table */}
                    <div className={`overflow-x-auto rounded-xl border shadow overflow-hidden mt-4 transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
                      <div className={`p-4 border-b font-bold text-xs sm:text-sm transition-all ${isLight ? "bg-amber-500/5 border-amber-500/15 text-gray-800" : "bg-white/5 border-white/5 text-amber-400"}`}>
                        {isTamil ? 'அஷ்டகவர்க்க முழு அட்டவணை' : 'Full Ashtakavarga Table'}
                      </div>
                      <table className="w-full text-center text-[10px] font-mono">
                        <thead className={`font-semibold uppercase transition-all ${isLight ? "bg-gray-100 text-gray-600" : "bg-white/5 text-gray-300"}`}>
                          <tr>
                            <th className={`p-2 text-left sticky left-0 min-w-[72px] transition-all ${isLight ? "bg-gray-100" : "bg-[#0d0a1a]"}`}>
                              {isTamil ? 'கிரகம்' : 'Planet'}
                            </th>
                            {SIGN_NAMES_EN.map((s, j) => (
                              <th key={j} className="p-2 min-w-[38px]">
                                {isTamil ? SIGN_NAMES_TA[j].slice(0, 3) : s.slice(0, 3)}
                              </th>
                            ))}
                            <th className={`p-2 min-w-[38px] transition-all ${isLight ? "bg-amber-50 text-amber-800" : "bg-amber-500/10 text-amber-300"}`}>
                              {isTamil ? 'மொத்' : 'Sum'}
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y transition-all ${isLight ? "divide-gray-100 text-gray-700" : "divide-white/5 text-gray-300"}`}>
                          {planetRows.map(({ key, label, bindus }) => {
                            const rowSum = bindus.reduce((a, b) => a + b, 0);
                            return (
                              <tr key={key} className={`transition-all ${isLight ? "hover:bg-amber-50/10" : "hover:bg-white/5"}`}>
                                <td className={`p-2 text-left font-semibold sticky left-0 transition-all ${isLight ? "text-gray-800 bg-white" : "text-white bg-[#0d0a1a]"}`}>
                                  {label}
                                </td>
                                {bindus.map((val, j) => (
                                  <td
                                    key={j}
                                    className={`p-2 font-bold ${
                                      val >= 5 ? 'text-green-500' : val <= 2 ? 'text-red-500' : isLight ? 'text-gray-700' : 'text-gray-300'
                                    }`}
                                  >
                                    {val}
                                  </td>
                                ))}
                                <td className={`p-2 font-black transition-all ${isLight ? "text-indigo-700 bg-indigo-50/30" : "text-indigo-300 bg-indigo-500/10"}`}>{rowSum}</td>
                              </tr>
                            );
                          })}
                          {/* Sarvashtaka total row */}
                          {total.length === 12 && (
                            <tr className={`font-black transition-all ${isLight ? "bg-amber-50/40" : "bg-amber-500/10"}`}>
                              <td className={`p-2 text-left sticky left-0 transition-all ${isLight ? "text-amber-800 bg-amber-50/40" : "text-amber-300 bg-amber-500/10"}`}>
                                {isTamil ? 'மொத்தம்' : 'Total'}
                              </td>
                              {total.map((val, j) => {
                                let cls = isLight ? 'text-gray-800' : 'text-gray-200';
                                if (val >= 30) cls = 'text-green-500';
                                else if (val <= 24) cls = 'text-red-500';
                                return (
                                  <td key={j} className={`p-2 font-black text-sm ${cls}`}>{val}</td>
                                );
                              })}
                              <td className={`p-2 font-black transition-all ${isLight ? "text-amber-800 bg-amber-100/60" : "text-amber-300 bg-amber-500/20"}`}>
                                {total.reduce((a, b) => a + b, 0)}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Sign-wise total summary */}
                    {total.length === 12 && (
                      <div className={`overflow-x-auto rounded-xl border shadow overflow-hidden transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
                        <div className={`p-4 border-b font-bold text-xs sm:text-sm transition-all ${isLight ? "bg-amber-500/5 border-amber-500/15 text-gray-800" : "bg-white/5 border-white/5 text-amber-400"}`}>
                          {isTamil ? 'இராசி வாரியாக மொத்த பரல்கள் (சர்வாஷ்டகம்)' : 'Sarvashtaka — Total Bindus by Sign'}
                        </div>
                        <table className="w-full text-left text-xs font-mono">
                          <thead className={`font-semibold uppercase text-[10px] transition-all ${isLight ? "bg-gray-100 text-gray-600" : "bg-white/5 text-gray-300"}`}>
                            <tr>
                              <th className="p-3">{isTamil ? 'ராசி எண்' : 'Sign'}</th>
                              <th className="p-3">{isTamil ? 'ராசி பெயர்' : 'Sign Name'}</th>
                              <th className="p-3 text-center">{isTamil ? 'மொத்த பரல்கள்' : 'Total Bindus'}</th>
                              <th className="p-3">{isTamil ? 'பலம்' : 'Strength'}</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y transition-all ${isLight ? "divide-gray-100 text-gray-700" : "divide-white/5 text-gray-300"}`}>
                            {total.map((val, j) => {
                              let strLabel = isTamil ? 'நடுத்தரம்' : 'Average';
                              let strColor = isLight ? 'text-gray-600' : 'text-gray-400';
                              if (val >= 30) { strLabel = isTamil ? 'மிக்க பலம்' : 'Strong'; strColor = 'text-green-500 font-bold'; }
                              else if (val <= 24) { strLabel = isTamil ? 'குறைந்த பலம்' : 'Weak'; strColor = 'text-red-500 font-bold'; }
                              return (
                                <tr key={j} className={`transition-all ${isLight ? "hover:bg-amber-50/5" : "hover:bg-white/5"}`}>
                                  <td className="p-3 font-semibold">{j + 1}</td>
                                  <td className="p-3 font-bold">
                                    {isTamil ? SIGN_NAMES_TA[j] : SIGN_NAMES_EN[j]}
                                  </td>
                                  <td className="p-3 text-center text-indigo-500 font-black text-sm">{val}</td>
                                  <td className="p-3"><span className={strColor}>{strLabel}</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-400 text-center py-12 text-xs">
                    {isTamil ? 'அஷ்டகவர்க்க விபரங்கள் கிடைக்கவில்லை.' : 'Ashtakavarga details are empty.'}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {activeTab === 'dashas' && (
          <div className={`p-6 rounded-xl border shadow-xl space-y-6 transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
            <div className="text-center space-y-2">
              <h3 className={`text-xl font-cinzel font-bold transition-all ${isLight ? "text-amber-700" : "text-amber-400"}`}>
                {isTamil ? 'தசா புக்தி கால அட்டவணை' : 'Detailed Dasha & Bhukthi Timeline'}
              </h3>
              <p className={`text-xs max-w-md mx-auto ${isLight ? "text-gray-500" : "text-gray-300"}`}>
                {isTamil 
                  ? 'உங்கள் வாழ்நாளின் முக்கியமான கிரக தசா மற்றும் உட்புக்திகளின் கால அளவுகள்.' 
                  : 'Planetary periods and sub-periods running throughout your life cycle.'}
              </p>
            </div>

            {reportData.mergedDashas ? (
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                {reportData.mergedDashas.map((dasha: any, idx: number) => {
                  return (
                    <div key={idx} className={`border rounded-xl overflow-hidden shadow-sm hover:shadow transition-all ${isLight ? "border-amber-500/10 bg-gradient-to-r from-amber-50/10 to-white" : "border-white/5 bg-gradient-to-r from-white/5 to-black/25"}`}>
                      <div className={`p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 transition-all ${isLight ? "bg-amber-500/5 border-amber-500/10" : "bg-white/5 border-white/5"}`}>
                        <div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mr-2 ${isLight ? "bg-amber-500/10 text-amber-800" : "bg-amber-500/20 text-amber-300"}`}>
                            {isTamil ? 'தசா' : 'Major Dasha'}
                          </span>
                          <span className={`font-bold text-sm ${isLight ? "text-gray-900" : "text-white"}`}>
                            {isTamil ? (PLANET_NAMES_TA[dasha.name] || dasha.name) : dasha.name}
                          </span>
                        </div>
                        <div className={`text-xs font-mono ${isLight ? "text-[#5C4F43]" : "text-gray-300"}`}>
                          <span className="font-semibold">{dasha.start}</span>
                          <span className="mx-1.5 font-bold">→</span>
                          <span className={`font-semibold ${isLight ? "text-amber-700" : "text-amber-400"}`}>{dasha.end}</span>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {dasha.bhukthis?.map((bhukthi: any, bIdx: number) => {
                            return (
                              <div key={bIdx} className={`p-3 rounded-lg border space-y-1 text-[11px] transition-all ${isLight ? "bg-white border-amber-500/10" : "bg-black/25 border-white/5"}`}>
                                <div className="flex justify-between items-center">
                                  <span className={`font-semibold ${isLight ? "text-gray-700" : "text-gray-300"}`}>
                                    {isTamil ? (PLANET_NAMES_TA[bhukthi.name] || bhukthi.name) : bhukthi.name}
                                  </span>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isLight ? "bg-indigo-50 text-indigo-700" : "bg-indigo-500/10 text-indigo-300"}`}>
                                    {isTamil ? 'புக்தி' : 'Bhukthi'}
                                  </span>
                                </div>
                                <div className={`text-[10px] font-mono mt-1 ${isLight ? "text-gray-500" : "text-gray-400"}`}>
                                  <div>{bhukthi.start}</div>
                                  <div>{bhukthi.end}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {dasha.prediction?.personalized_prediction && (
                          <div className={`mt-4 p-3 rounded-lg border text-xs leading-relaxed transition-all ${isLight ? "bg-amber-500/5 border-amber-500/10 text-gray-700" : "bg-white/5 border-white/5 text-gray-300"}`}>
                            <span className={`font-bold block mb-1 ${isLight ? "text-amber-800" : "text-amber-400"}`}>
                              {isTamil ? 'தசா பலன்கள்:' : 'Dasha Predictions:'}
                            </span>
                            {dasha.prediction.personalized_prediction}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-12 text-xs">
                {isTamil ? 'தசா விபரங்கள் கிடைக்கவில்லை.' : 'Dasha details are empty.'}
              </div>
            )}
          </div>
        )}

        {activeTab === 'predictions' && (() => {
          const stripLeadingSince = (text: string) => {
            if (!text) return '';
            return text.trim()
              .replace(/^since\s+the\s+\S+\s+lord[^,]*,\s*/i, '')
              .replace(/^ஜாதகத்தில்[^,]*,\s*/u, '')
              .replace(/^\d+\s*வது\s*வீட்டின்\s*அதிபதி[^,]*,[^,]*,[^,]*இருப்பதால்,\s*/u, '')
              .trim();
          };

          const grahaPalanTexts: string[] = reportData.grahaPalans
            ? (Array.isArray(reportData.grahaPalans)
                ? reportData.grahaPalans.map((g: any) => g.palan || g).filter(Boolean)
                : [])
            : [];

          const nakshatraPalanText: string = reportData.nakshatraPalan?.palan
            || reportData.nakshatraPalan
            || '';

          const vaaraPalanText: string = reportData.vaaraPalan
            ? `${reportData.vaaraPalan.palan || ''} ${reportData.vaaraPalan.vazhipaadu || ''}`.trim()
            : '';

          const bhavaPalans: string[] = Array.isArray(reportData.predictions)
            ? reportData.predictions
                .filter((p: any) => p.personalised_prediction)
                .map((p: any) => stripLeadingSince(p.personalised_prediction))
            : [];
          const allParas = [...grahaPalanTexts, ...bhavaPalans].filter(Boolean);
          const chunk = Math.ceil(allParas.length / 3);
          const detailedParagraphs: string[] = allParas.length
            ? [0, 1, 2].map((i) => allParas.slice(i * chunk, (i + 1) * chunk).join(' ')).filter(Boolean)
            : [];

          return (
            <div className="space-y-8">
              <div className={`p-6 rounded-xl border shadow-xl space-y-2 text-center transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
                <h3 className={`text-xl font-cinzel font-bold transition-all ${isLight ? "text-amber-700" : "text-amber-400"}`}>
                  {isTamil ? 'விரிவான ஜாதக பலன்கள்' : 'Detailed Predictions'}
                </h3>
                <p className={`text-xs max-w-md mx-auto ${isLight ? "text-gray-500" : "text-gray-300"}`}>
                  {isTamil
                    ? 'கிரக பலன்கள், நட்சத்திர பலன்கள், வார பலன்கள் மற்றும் பாவ பலன்கள்.'
                    : 'Graha palans, nakshatra predictions, vaara palans and house predictions.'}
                </p>
              </div>

              {/* 1. Detailed combined paragraphs */}
              {detailedParagraphs.length > 0 && (
                <div className={`p-6 rounded-xl border shadow-xl space-y-4 transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
                  <h4 className={`font-bold text-sm sm:text-base flex items-center gap-2 border-b pb-3 transition-all ${isLight ? "text-amber-800 border-amber-100" : "text-amber-400 border-white/5"}`}>
                    <BookOpen className="w-4 h-4" />
                    {isTamil ? 'விரிவான பலன்கள்' : 'Detailed Predictions'}
                  </h4>
                  <div className="space-y-4">
                    {detailedParagraphs.map((para, i) => (
                      <p key={i} className={`text-xs leading-relaxed ${isLight ? "text-gray-700" : "text-gray-300"}`}>{para}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Nakshatra Palan */}
              {nakshatraPalanText && (
                <div className={`p-6 rounded-xl border shadow-xl space-y-4 transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
                  <h4 className={`font-bold text-sm sm:text-base flex items-center gap-2 border-b pb-3 transition-all ${isLight ? "text-purple-800 border-purple-100" : "text-purple-300 border-white/5"}`}>
                    <Sparkles className="w-4 h-4" />
                    {isTamil ? 'நட்சத்திர பலன்கள்' : 'Birth Star Predictions'}
                    {reportData.astro?.nakshatra && (
                      <span className={`ml-2 text-[10px] px-2 py-0.5 rounded font-normal transition-all ${isLight ? "bg-purple-100 text-purple-700" : "bg-purple-500/20 text-purple-300"}`}>
                        {reportData.astro.nakshatra}
                      </span>
                    )}
                  </h4>
                  <p className={`text-xs leading-relaxed ${isLight ? "text-gray-700" : "text-gray-300"}`}>{nakshatraPalanText}</p>
                </div>
              )}

              {/* 3. Vaara Palan */}
              {vaaraPalanText && (
                <div className={`p-6 rounded-xl border shadow-xl space-y-4 transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
                  <h4 className={`font-bold text-sm sm:text-base flex items-center gap-2 border-b pb-3 transition-all ${isLight ? "text-teal-800 border-teal-100" : "text-teal-300 border-white/5"}`}>
                    <Calendar className="w-4 h-4" />
                    {isTamil ? 'வார பலன்கள்' : 'Day of Birth Predictions'}
                  </h4>
                  <p className={`text-xs leading-relaxed ${isLight ? "text-gray-700" : "text-gray-300"}`}>{vaaraPalanText}</p>
                </div>
              )}

              {/* 4. House Predictions grid */}
              <div className={`p-6 rounded-xl border shadow-xl space-y-4 transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
                <h4 className={`font-bold text-sm sm:text-base flex items-center gap-2 border-b pb-3 transition-all ${isLight ? "text-amber-800 border-amber-100" : "text-amber-400 border-white/5"}`}>
                  <BookOpen className="w-4 h-4" />
                  {isTamil ? 'பாவ பலன்கள் (வீடுகளின் பலன்)' : 'House Predictions'}
                </h4>
                {Array.isArray(reportData.predictions) && reportData.predictions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportData.predictions.map((pred: any, idx: number) => (
                      <div key={idx} className={`p-4 rounded-xl border space-y-2 text-xs transition-all ${isLight ? "bg-gray-50 border-gray-100" : "bg-black/25 border-white/5"}`}>
                        <div className={`flex justify-between items-center border-b pb-2 transition-all ${isLight ? "border-gray-200" : "border-white/5"}`}>
                          <span className={`font-bold ${isLight ? "text-gray-900" : "text-white"}`}>
                            {isTamil
                              ? `${pred.current_house} வது பாவம் (${pred.current_zodiac})`
                              : `House ${pred.current_house} (${pred.current_zodiac})`}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pred.lord_strength === 'நற்பலன்' || pred.lord_strength === 'உச்சம்' || pred.lord_strength === 'ஆட்சி'
                              ? isLight ? 'bg-green-100 text-green-800' : 'bg-green-500/20 text-green-300'
                              : isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {pred.lord_strength}
                          </span>
                        </div>
                        <div className={`font-semibold ${isLight ? "text-gray-400" : "text-gray-500"}`}>{pred.verbal_location}</div>
                        <p className={`leading-relaxed mt-1 text-xs ${isLight ? "text-gray-600" : "text-gray-300"}`}>{pred.personalised_prediction}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-6 text-xs">
                    {isTamil ? 'பாவ பலன்கள் கிடைக்கவில்லை' : 'No house predictions found.'}
                  </div>
                )}
              </div>

              {/* 5. Dasha Predictions */}
              {Array.isArray(reportData.mergedDashas) && reportData.mergedDashas.some((d: any) => d.prediction?.prediction || d.prediction?.personalized_prediction) && (
                <div className={`p-6 rounded-xl border shadow-xl space-y-4 transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
                  <h4 className={`font-bold text-sm sm:text-base flex items-center gap-2 border-b pb-3 transition-all ${isLight ? "text-indigo-800 border-indigo-100" : "text-indigo-300 border-white/5"}`}>
                    <Milestone className="w-4 h-4" />
                    {isTamil ? 'தசா பலன்கள்' : 'Dasha Predictions'}
                  </h4>
                  <div className="space-y-4">
                    {reportData.mergedDashas
                      .filter((d: any) => d.prediction?.prediction || d.prediction?.personalized_prediction)
                      .map((dasha: any, idx: number) => {
                        const predText = dasha.prediction?.prediction || dasha.prediction?.personalized_prediction || '';
                        return (
                          <div key={idx} className={`border rounded-xl overflow-hidden transition-all ${isLight ? "border-indigo-50" : "border-white/5"}`}>
                            <div className={`px-4 py-2.5 flex justify-between items-center transition-all ${isLight ? "bg-indigo-50/60" : "bg-indigo-500/10"}`}>
                              <span className={`font-bold text-xs ${isLight ? "text-indigo-800" : "text-indigo-300"}`}>
                                {isTamil ? (PLANET_NAMES_TA[dasha.name] || dasha.name) : dasha.name}
                                {isTamil ? ' மகா தசை' : ' Maha Dasha'}
                              </span>
                              <span className={`text-[10px] font-mono ${isLight ? "text-gray-500" : "text-gray-400"}`}>
                                {dasha.start} → {dasha.end}
                              </span>
                            </div>
                            <p className={`px-4 py-3 text-xs leading-relaxed ${isLight ? "text-gray-700" : "text-gray-300"}`}>{predText}</p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header section with decorative styling */}
      <div className="text-center space-y-3 relative py-6">
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 to-transparent blur-2xl -z-10" />
        <div className="inline-flex p-3 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500 animate-pulse">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className={`text-3xl font-cinzel font-bold tracking-tight transition-all ${isLight ? "text-gray-900" : "text-white"}`}>
          {language === 'ta' ? 'ஜாதக புத்தகம் காண்க' : 'View Book Horoscope'}
        </h2>
        <p className={`max-w-xl mx-auto text-sm sm:text-base transition-all ${isLight ? "text-gray-500" : "text-gray-300"}`}>
          {language === 'ta' 
            ? 'அஷ்டவர்க்கம், தசா புக்தி பலன்கள், வர்க்கச் சக்கரங்களுடன் கூடிய ஊடாடும் ஜாதக கணினி.' 
            : 'Interactive birth chart dashboard with Ashtakavarga, divisionals, dasha Predictions, and planet matrices.'}
        </p>
      </div>

      <div className={`rounded-2xl border shadow-xl overflow-hidden transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
        <div className={`p-6 border-b flex items-center gap-3 transition-all ${isLight ? "bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/15" : "bg-white/5 border-white/5"}`}>
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className={`font-semibold ${isLight ? "text-gray-800" : "text-amber-400"}`}>
            {language === 'ta' ? 'பிறப்பு விபரங்களை உள்ளிடவும்' : 'Enter Birth Details'}
          </h3>
        </div>
        <div className="p-6">
          <HoroscopeInputForm onSubmit={handleFormSubmit} />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 text-red-800 p-4 rounded-xl border border-red-100 text-sm">
          <ChevronLeft className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <div>
            <h5 className="font-semibold">{language === 'ta' ? 'பிழை ஏற்பட்டது' : 'Error Occurred'}</h5>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
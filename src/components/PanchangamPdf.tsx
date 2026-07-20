import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { usePanchangPdf } from '../../hooks/usePanchangPdf';
import { 
  Calendar, Clock, MapPin, Printer, Loader2, Sparkles, 
  CheckCircle, AlertCircle, Send, FileText 
} from 'lucide-react';

interface PanchangamPdfProps {
  isLight?: boolean;
}

export default function PanchangamPdf({ isLight = true }: PanchangamPdfProps) {
  const { t, language, isTamil } = useTranslation();
  const { fetchPanchangData, loading, error } = usePanchangPdf();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  // Initialize with current date & time
  React.useEffect(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    setDate(`${yyyy}-${mm}-${dd}`);
    
    const hh = String(now.getHours()).padStart(2, '0');
    const minStr = String(now.getMinutes()).padStart(2, '0');
    setTime(`${hh}:${minStr}`);
  }, []);
  
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error(isTamil 
          ? 'உங்கள் சாதனத்தில் இருப்பிட சேவை கிடைக்கவில்லை.' 
          : 'Geolocation is not supported by your device.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });
  };

  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const d = await res.json();
      return d?.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorLocal(null);
    setSuccess(false);

    if (!date || !time) {
      setErrorLocal(isTamil ? 'அனைத்து விபரங்களையும் பூர்த்தி செய்யவும்.' : 'Please fill all details.');
      return;
    }

    try {
      // Nominatim search geocoding
      setLocating(true);
      const position = await getCurrentPosition();
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      setLocating(false);
	  
	  const resolvedName = await reverseGeocode(lat, lon);
      setPlaceName(resolvedName);

      const [year, month, day] = date.split('-').map(Number);
      const [hour, min] = time.split(':').map(Number);

      await fetchPanchangData({
        day,
        month,
        year,
        hour,
        min,
        tzone: 5.5,
        lat,
        lon,
        lang: language
      });

      setSuccess(true);
    } catch (err: any) {
      setLocating(false);
      console.error(err);
      if (err?.code === 1) {
        // GeolocationPositionError.PERMISSION_DENIED
        setErrorLocal(isTamil 
          ? 'இருப்பிட அனுமதி மறுக்கப்பட்டது. அறிக்கை தயாரிக்க இருப்பிட அணுகலை இயக்கவும்.' 
          : 'Location permission denied. Please enable location access to generate the report.');
      } else {
		setErrorLocal(err.message || String(err));
	  }
    }
  };

  const globalError = error || errorLocal;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Dynamic Header */}
      <div className="text-center space-y-3 relative py-6">
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 to-transparent blur-2xl -z-10" />
        <div className="inline-flex p-3 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500 animate-pulse">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className={`text-3xl font-cinzel font-bold tracking-tight transition-all ${isLight ? "text-gray-900" : "text-white"}`}>
          {isTamil ? 'பஞ்சாங்கம் PDF / அச்சு' : 'Panchangam PDF & Export'}
        </h2>
        <p className={`max-w-xl mx-auto text-sm sm:text-base transition-all ${isLight ? "text-gray-500" : "text-gray-300"}`}>
          {isTamil 
            ? 'திதி, நட்சத்திரம், நல்ல நேரம், கௌரி நல்ல நேரம் உள்ளிட்ட விபரங்களை பிடிஎஃப் ஆக அச்சிட்டு பகிரும் தளம்.' 
            : 'Export daily Panchangam cards, dynamic Gowri timings and tithi sheets into high quality printable documents.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Form panel */}
        <div className={`md:col-span-7 rounded-2xl border shadow-xl overflow-hidden transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
          <div className={`p-5 border-b flex items-center gap-3 transition-all ${isLight ? "bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-amber-500/15" : "bg-white/5 border-white/5"}`}>
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className={`font-semibold ${isLight ? "text-gray-800" : "text-amber-400"}`}>
              {isTamil ? 'அறிக்கைக்கான விபரங்கள்' : 'Export Parameters'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Date Input */}
              <div className="space-y-2">
                <label className={`block text-xs font-bold uppercase tracking-wider ${isLight ? "text-[#5C4F43]" : "text-amber-400"}`}>
                  {isTamil ? 'தேதி' : 'Select Date'}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-amber-500/70" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-semibold ${isLight ? "bg-gray-50 border-gray-250 text-gray-800" : "bg-white/5 border-white/5 text-gray-150"}`}
                  />
                </div>
              </div>

              {/* Time Input */}
              <div className="space-y-2">
                <label className={`block text-xs font-bold uppercase tracking-wider ${isLight ? "text-[#5C4F43]" : "text-amber-400"}`}>
                  {isTamil ? 'நேரம்' : 'Select Time'}
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-amber-500/70" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-semibold ${isLight ? "bg-gray-50 border-gray-250 text-gray-800" : "bg-white/5 border-white/5 text-gray-150"}`}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-amber-50/60 border border-amber-100 rounded-xl p-3.5 text-xs text-amber-800">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                {isTamil 
                  ? 'உங்கள் தற்போதைய இருப்பிடம் தானாக பயன்படுத்தப்படும். தொடர, உங்கள் சாதனத்தில் இருப்பிட அனுமதியை அனுமதிக்கவும்.' 
                  : "Your current location will be used automatically. Please allow location access when prompted."}
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || locating}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm flex items-center justify-center gap-2"
            >
              {locating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isTamil ? 'இருப்பிடம் கண்டறியப்படுகிறது...' : 'Detecting location...'}
                </>
              ) : loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isTamil ? 'தயாரிக்கப்படுகிறது...' : 'Processing Report...'}
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  {isTamil ? 'அறிக்கை தயார் செய்க (PDF)' : 'Generate Printable PDF'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info panel */}
        <div className={`md:col-span-5 rounded-2xl border shadow-xl p-6 space-y-6 transition-all ${isLight ? "bg-white border-amber-500/15" : "bg-black/35 border-white/5"}`}>
          <h4 className={`font-bold border-b pb-3 text-sm transition-all ${isLight ? "text-gray-800 border-amber-500/15" : "text-amber-400 border-white/5"}`}>
            {isTamil ? 'அறிக்கையின் சிறப்புகள்' : 'PDF Features'}
          </h4>

          {locating || loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-xs text-gray-400">
                {locating 
                  ? (isTamil ? 'இருப்பிடம் கண்டறியப்படுகிறது...' : 'Detecting your location...')
                  : (isTamil ? 'துல்லிய பஞ்சாங்க விவரங்கள் கணக்கிடப்படுகின்றன...' : 'Crunching astronomical degrees...')}
              </p>
            </div>
          ) : success ? (
            <div className="space-y-6">
              <div className={`flex items-start gap-3 p-4 rounded-xl border text-xs transition-all ${isLight ? "bg-green-50 text-green-800 border-green-100" : "bg-green-500/10 text-green-300 border-green-500/20"}`}>
                <CheckCircle className="w-5 h-5 shrink-0 text-green-500 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-sm">
                    {isTamil ? 'அறிக்கை தயார்!' : 'Report Dispatched!'}
                  </h5>
                  <p className="text-xs mt-1 leading-relaxed">
                    {isTamil 
                      ? 'உங்களது விரிவான பஞ்சாங்க அறிக்கை அச்சுப் பக்கத்தில் வெற்றிகரமாக திறக்கப்பட்டுள்ளது.' 
                      : 'Your printable dynamic panchangam sheet has opened in a new window.'}
                  </p>
                </div>
              </div>

              <div className={`border rounded-xl p-4 text-xs space-y-1 transition-all ${isLight ? "bg-amber-50/20 border-amber-500/10 text-gray-700" : "bg-white/5 border-white/5 text-gray-300"}`}>
                <div className="flex justify-between font-medium">
                  <span>{isTamil ? 'தேதி:' : 'Date:'}</span>
                  <span className={`font-bold ${isLight ? "text-gray-800" : "text-white"}`}>{date}</span>
                </div>
              </div>
            </div>
          ) : globalError ? (
            <div className={`flex items-start gap-3 p-4 rounded-xl border text-xs transition-all ${isLight ? "bg-red-50 text-red-850 border-red-100" : "bg-red-500/10 text-red-300 border-red-500/20"}`}>
              <AlertCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-sm">{isTamil ? 'பிழை ஏற்பட்டது' : 'Error Occurred'}</h5>
                <p className="mt-1">{globalError}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ul className={`space-y-3 text-xs ${isLight ? "text-[#5C4F43]" : "text-gray-300"}`}>
                <li className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{isTamil ? 'தினசரி பஞ்சாங்க திதி, யோக, கரண கணிப்புகள்' : 'Complete daily Tithi, Yog, and Karanam times'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{isTamil ? 'துல்லிய ராகு, எமகண்ட நேர அட்டவணை' : 'Accurate Rahu, Yamagandam timings list'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{isTamil ? 'கௌரி நல்ல நேரம் மற்றும் சந்திராஷ்டமம் விபரங்கள்' : 'Interactive Gowri and Chandrashtama alerts'}</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useBookHoroscope } from '../../hooks/useBookHoroscope';
import HoroscopeInputForm from './HoroscopeInputForm';
import { BookOpen, Printer, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import ScreenGuard from './ScreenGuard';

export default function BookHoroscopePdf() {
  const { t, language } = useTranslation();
  const { generateAndPrint } = useBookHoroscope();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

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
    setSuccess(false);

    try {
      const dobStr = values.dob.toISOString().split('T')[0]; // "YYYY-MM-DD"
      const hours = String(values.tob.getHours()).padStart(2, '0');
      const mins = String(values.tob.getMinutes()).padStart(2, '0');
      const timeStr = `${hours}:${mins}`; // "HH:MM"

      const result = await generateAndPrint({
        name: values.name,
        fatherName: values.fatherName,
        motherName: values.motherName,
        dob: dobStr,
        time: timeStr,
        place: values.place,
      }, language);

      if (result) {
        setSuccess(true);
        setReportData(result);
      } else {
        throw new Error(language === 'ta' ? 'ஜாதக புத்தகம் உருவாக்க முடியவில்லை' : 'Failed to generate horoscope book');
      }
    } catch (err: any) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
  <ScreenGuard featureId="book_pdf">
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header section with decorative styling */}
      <div className="text-center space-y-3 relative py-6">
        <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 to-transparent blur-2xl -z-10" />
        <div className="inline-flex p-3 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500 animate-pulse">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-cinzel font-bold text-gray-900 tracking-tight">
          {language === 'ta' ? 'ஜாதக புத்தக PDF' : 'Book Horoscope PDF'}
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base">
          {language === 'ta' 
            ? 'அஷ்டவர்க்கம், 16 நவாம்ச சக்கரங்கள் மற்றும் தசா புக்திகளுடன் கூடிய முழுமையான ஜாதக புத்தகம்.' 
            : 'Detailed multiple-page Horoscope book with Ashtakavarga, 16 Divisional charts, and prediction logs.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Form Container */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-b border-gray-100 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-800">
              {language === 'ta' ? 'பிறப்பு விபரங்களை உள்ளிடவும்' : 'Enter Birth Details'}
            </h3>
          </div>
          <div className="p-6">
            <HoroscopeInputForm onSubmit={handleFormSubmit} />
          </div>
        </div>

        {/* Action Panel / Status Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6 space-y-6">
          <h4 className="font-semibold text-gray-800 border-b border-gray-100 pb-3">
            {language === 'ta' ? 'அறிக்கை நிலை' : 'Report Status'}
          </h4>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              <div>
                <p className="font-semibold text-gray-800">
                  {language === 'ta' ? 'புத்தகம் கணிக்கப்படுகிறது...' : 'Generating Book Report...'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {language === 'ta' 
                    ? '16 வர்க்கச் சக்கரங்கள், தசா பலன்கள் மற்றும் அஷ்டவர்க்க பரல்கள் கணிக்கப்படுகின்றன. இதற்கு சில வினாடிகள் ஆகலாம்.' 
                    : 'Computing 16 divisional tables, dasha Predictions, and Ashtakavarga matrices. Please wait some seconds.'}
                </p>
              </div>
            </div>
          ) : success ? (
            <div className="space-y-6">
              <div className="flex items-start gap-3 bg-green-50 text-green-800 p-4 rounded-xl border border-green-100">
                <CheckCircle className="w-5 h-5 shrink-0 text-green-500 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-sm">
                    {language === 'ta' ? 'புத்தகம் தயார்!' : 'Book Report Ready!'}
                  </h5>
                  <p className="text-xs text-green-700/80 mt-1">
                    {language === 'ta' 
                      ? 'உங்கள் விரிவான ஜாதக புத்தகம் புதிய சாளரத்தில் திறக்கப்பட்டுள்ளது.' 
                      : 'Your complete book horoscope is generated and opened in a new tab.'}
                  </p>
                </div>
              </div>

              {reportData && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium">{language === 'ta' ? 'பெயர்:' : 'Name:'}</span>
                    <span className="font-semibold text-gray-800">{reportData.name || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{language === 'ta' ? 'பிறப்பு திசை:' : 'Birth Dasha:'}</span>
                    <span className="font-semibold text-gray-800">{reportData.dashaPlanet || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{language === 'ta' ? 'நடப்பு தசா:' : 'Current Dasha:'}</span>
                    <span className="font-semibold text-gray-800">{reportData.nadappuDasa?.text || '—'}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => handleFormSubmit(reportData)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all text-sm"
              >
                <Printer className="w-4 h-4" />
                {language === 'ta' ? 'மீண்டும் அச்சிடு / சேமி' : 'Reprint / Save PDF'}
              </button>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-red-50 text-red-800 p-4 rounded-xl border border-red-100 text-xs">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-sm">
                    {language === 'ta' ? 'பிழை ஏற்பட்டது' : 'Error Occurred'}
                  </h5>
                  <p className="mt-1 leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-amber-500/40" />
              <p className="text-xs">
                {language === 'ta' 
                  ? 'விபரங்களை பூர்த்தி செய்து சமர்ப்பித்தால் ஜாதகம் கணிக்கப்படும்.' 
                  : 'Fill out the form on the left to compute and preview the Book PDF.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
	</ScreenGuard>
  );
}

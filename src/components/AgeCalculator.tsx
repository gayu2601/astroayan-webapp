import { useState } from 'react';
import ScreenGuard from './ScreenGuard';

interface AgeResult {
  years: number;
  months: number;
  days: number;
}

interface Props {
  language: 'ta' | 'en';
}

function calculateAge(dob: string): AgeResult {
  const birth = new Date(dob);
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

export default function AgeCalculator({ language }: Props) {
  const [ageDob, setAgeDob] = useState('');
  const [ageResult, setAgeResult] = useState<AgeResult | null>(null);

  const runAgeCalc = () => {
    if (!ageDob) return;
    setAgeResult(calculateAge(ageDob));
  };

  const ta = language === 'ta';

  return (
  <ScreenGuard featureId="age_calc">
    <div className="gradient-group-tools p-6 rounded-3xl space-y-4 animate-fade-in border">
      <h3 className="text-lg font-serif font-bold text-amber-500">
        {ta ? 'வயது கணிப்பான்' : 'Cosmic Age Calculator'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1">
              {ta ? 'பிறந்த தேதி' : 'Birth Date'}
            </label>
            <input
              type="date"
              value={ageDob}
              onChange={(e) => setAgeDob(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-xs"
            />
          </div>
          <button
            onClick={runAgeCalc}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-bold text-xs uppercase"
          >
            {ta ? 'வயதை கணக்கிடு' : 'Calculate Celestial Age'}
          </button>
        </div>

        {ageResult && (
          <div className="p-4 bg-black/35 rounded-xl border border-amber-500/20 space-y-2 text-center flex flex-col justify-center">
            <div className="text-xs text-gray-400 font-mono">
              {ta ? 'உங்கள் வயது' : 'YOUR CHRONOLOGICAL CELESTIAL AGE'}
            </div>
            <div className="text-2xl font-mono font-black text-amber-400">
              {ageResult.years} {ta ? 'வருடங்கள்' : 'Years'},{' '}
              {ageResult.months} {ta ? 'மாதங்கள்' : 'Months'}
            </div>
            <div className="text-sm font-mono text-gray-300 mt-1">
              {ageResult.days} {ta ? 'நாட்கள்' : 'Days'}
            </div>
          </div>
        )}
      </div>
    </div>
	</ScreenGuard>
  );
}
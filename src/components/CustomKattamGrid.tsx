import React from 'react';

const SIGN_NAMES_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];
const SIGN_NAMES_TA = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி',
  'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்',
];

const KATTAM_LAYOUT = [
  [12, 1,    2,    3],
  [11, null, null, 4],
  [10, null, null, 5],
  [9,  8,    7,    6],
];

interface KattamGridProps {
  title: string;
  planets: { rasi_no: number; name: string }[];
  lagnaSignNo: number;
  isTamil: boolean;
  theme: 'light' | 'dark';
}

export function CustomKattamGrid({ title, planets, lagnaSignNo, isTamil, theme }: KattamGridProps) {
  const isLight = theme === 'light';
  
  const signMap: Record<number, string[]> = {};
  planets.forEach((p) => {
    if (!p.rasi_no) return;
    if (!signMap[p.rasi_no]) signMap[p.rasi_no] = [];
    signMap[p.rasi_no].push(p.name);
  });

  const getSignName = (num: number) => {
    return isTamil ? SIGN_NAMES_TA[num - 1] : SIGN_NAMES_EN[num - 1];
  };

  const getPlanetsInSign = (num: number) => {
    const arr = signMap[num] || [];
    const elements = [...arr];
    if (num === lagnaSignNo) {
      const lagLabel = isTamil ? 'ல' : 'La';
      if (!elements.includes(lagLabel)) {
        elements.unshift(lagLabel);
      }
    }
    return elements;
  };

  return (
    <div id="kattam-grid-container" className={`w-full max-w-[380px] mx-auto border-2 ${isLight ? "border-[#D97706]/75 bg-[#FFFDF9]" : "border-amber-500/60 bg-black/60"} overflow-hidden shadow-2xl rounded-xl font-mono text-xs animate-fade-in`}>
      <div className="grid grid-cols-4 grid-rows-4 aspect-square relative">
        {KATTAM_LAYOUT.map((row, rIdx) => (
          <React.Fragment key={rIdx}>
            {row.map((signNo, cIdx) => {
              if (signNo === null) {
                return <div key={`${rIdx}-${cIdx}`} className="bg-transparent" />;
              }

              const signPlanets = getPlanetsInSign(signNo);
              const signName = getSignName(signNo);

              return (
                <div 
                  key={`${rIdx}-${cIdx}`} 
                  id={`sign-box-${signNo}`}
                  className={`border p-1.5 flex flex-col justify-between aspect-square transition-all ${
                    isLight 
                      ? "border-[#D97706]/15 bg-[#FFFDF9] hover:bg-amber-50/20 text-[#2C241E]" 
                      : "border-amber-500/25 bg-[#0b0825]/90 hover:bg-white/5 text-white"
                  }`}
                >
                  <div className={`text-[9px] font-bold ${isLight ? "text-[#5C4F43]" : "text-[#b8a8d0]"}`}>
                    {signName}
                  </div>
                  
                  <div className="flex flex-wrap gap-0.5 mt-1 justify-center max-h-[45px] overflow-y-auto">
                    {signPlanets.map((p, idx) => (
                      <span 
                        key={idx} 
                        className={`px-1 rounded text-[9px] font-black tracking-tighter ${
                          p === 'ல' || p === 'La' || p.toLowerCase().includes('lag')
                            ? "bg-indigo-600 text-white"
                            : isLight ? "bg-amber-100 text-[#B45309] border border-[#B45309]/20" : "bg-amber-500/20 border border-amber-500/60 text-amber-300 shadow-[0_0_5px_rgba(245,158,11,0.2)]"
                        }`}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-[8px] text-right text-gray-500/60 font-semibold">{signNo}</div>
                </div>
              );
            })}
          </React.Fragment>
        ))}

        <div className={`absolute top-1/4 left-1/4 w-1/2 h-1/2 border flex flex-col items-center justify-center p-2.5 text-center transition-colors ${
          isLight 
            ? "bg-[#FFFDF9] border-[#D97706]/25 text-[#2C241E]" 
            : "bg-[#060412]/95 border-amber-500/35 text-white"
        }`}>
          <div className="text-xs font-cinzel font-black uppercase tracking-wider text-amber-500">
            {title}
          </div>
          <div className="text-[9px] text-gray-400 mt-1 uppercase font-sans tracking-widest scale-90">
            {isTamil ? "இராசிச் சக்கரம்" : "Rasi Chart (D1)"}
          </div>
        </div>
      </div>
    </div>
  );
}

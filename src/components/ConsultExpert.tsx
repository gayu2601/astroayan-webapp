import React, { useState, useEffect } from 'react';
import { Shield, Video, Calendar, Star, CheckCircle, AlertCircle, Clock, Zap, MessageSquare, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Expert {
  id: string;
  nameEn: string;
  nameTa: string;
  experienceEn: string;
  experienceTa: string;
  specialtyEn: string;
  specialtyTa: string;
  category: 'vedic' | 'tarot' | 'numerology';
  price: number;
  rating: number;
  yearsOfExp: number;
  available: boolean;
  avatar: string;
  descriptionEn: string;
  descriptionTa: string;
  languagesEn: string[];
  languagesTa: string[];
  status: 'online' | 'busy' | 'offline';
}

const MASTER_ASTROLOGERS: Expert[] = [
  {
    id: 'devendra',
    nameEn: 'Acharya Devendra Sharma',
    nameTa: 'ஆச்சார்யா தேவேந்திர சர்மா',
    experienceEn: '18 Yrs Exp',
    experienceTa: '18 வருட அனுபவம்',
    specialtyEn: 'Vedic Astrology, Kundli Analysis',
    specialtyTa: 'வேத ஜோதிடம், குண்டலி கணிப்பு',
    category: 'vedic',
    price: 35,
    rating: 4.9,
    yearsOfExp: 18,
    available: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
    descriptionEn: '"Wise, extremely gentle, refers to classical scriptures like Brihat Parashara Hora Shastra, focuses on karmic lessons..."',
    descriptionTa: '"மிகவும் அறிவார்ந்த, அமைதியான குணமுடையவர். பிரகத் பராசர ஹோரா சாஸ்திரத்தின்படி கர்ம வினைகளைக் கணித்து பரிகாரங்கள் வழங்குவதில் வல்லவர்..."',
    languagesEn: ['Hindi', 'Sanskrit', 'English'],
    languagesTa: ['இந்தி', 'சமஸ்கிருதம்', 'ஆங்கிலம்'],
    status: 'online'
  },
  {
    id: 'radhika',
    nameEn: 'Dr. Radhika Sen',
    nameTa: 'டாக்டர் ராதிகா சென்',
    experienceEn: '12 Yrs Exp',
    experienceTa: '12 வருட அனுபவம்',
    specialtyEn: 'KP System, Numerology, Vastu Shastra',
    specialtyTa: 'கே.பி முறை, எண் கணிதம், வாஸ்து சாஸ்திரம்',
    category: 'numerology',
    price: 30,
    rating: 4.8,
    yearsOfExp: 12,
    available: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150',
    descriptionEn: '"Highly scientific and analytical, uses number dynamics and structural directions of your living space to offer remedies..."',
    descriptionTa: '"மிகவும் அறிவியல் பூர்வமான மற்றும் பகுப்பாய்வு திறன் கொண்டவர். உங்கள் வீட்டின் வாஸ்து மற்றும் எண் கணிதத்தின் அடிப்படையில் சிறந்த தீர்வு வழங்குவார்..."',
    languagesEn: ['English', 'Bengali', 'Hindi'],
    languagesTa: ['ஆங்கிலம்', 'வங்காளம்', 'இந்தி'],
    status: 'online'
  },
  {
    id: 'elena',
    nameEn: 'Tarot Reader Elena',
    nameTa: 'டாரோட் ரீடர் எலினா',
    experienceEn: '9 Yrs Exp',
    experienceTa: '9 வருட அனுபவம்',
    specialtyEn: 'Tarot Reading, Psychic Reading',
    specialtyTa: 'டாரோட் கார்டு வாசிப்பு, ஆன்மீக உள்ளுணர்வு',
    category: 'tarot',
    price: 40,
    rating: 4.9,
    yearsOfExp: 9,
    available: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150',
    descriptionEn: '"Mystical, highly intuitive, focuses on subconscious blockages and current energy vibrations. Guides you on path..."',
    descriptionTa: '"உள்ளுணர்வு மிக்க டாரோட் நிபுணர். உங்கள் ஆழ்மன தடைகள் மற்றும் தற்போதைய ஆற்றல் அதிர்வுகளின் அடிப்படையில் நேர்த்தியான வழிகாட்டுதலை வழங்குவார்..."',
    languagesEn: ['English', 'Spanish'],
    languagesTa: ['ஆங்கிலம்', 'ஸ்பானிஷ்'],
    status: 'busy'
  },
  {
    id: 'siddharth',
    nameEn: 'Siddharth Shastri',
    nameTa: 'சித்தார்த் சாஸ்திரி',
    experienceEn: '14 Yrs Exp',
    experienceTa: '14 வருட அனுபவம்',
    specialtyEn: 'Lal Kitab, Gemini-Yogas',
    specialtyTa: 'லால் கிதாப் பரிகாரங்கள், ஜைமினி யோகம்',
    category: 'vedic',
    price: 28,
    rating: 4.7,
    yearsOfExp: 14,
    available: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150',
    descriptionEn: '"Direct, practical, specializes in Lal Kitab remedies which are simple, inexpensive household items or tasks to change..."',
    descriptionTa: '"நேரடியான மற்றும் நடைமுறை ரீதியான தீர்வு வழங்குபவர். எளிய, குறைந்த செலவிலான வீட்டுப் பரிகாரங்களின் மூலம் விதியை மாற்றி அமைக்கும் வல்லவர்..."',
    languagesEn: ['Hindi', 'Punjabi'],
    languagesTa: ['இந்தி', 'பஞ்சாபி'],
    status: 'online'
  },
  {
    id: 'maithili',
    nameEn: 'Maithili Iyer',
    nameTa: 'மைதிலி ஐயர்',
    experienceEn: '22 Yrs Exp',
    experienceTa: '22 வருட அனுபவம்',
    specialtyEn: 'Nadi Astrology, Palmistry',
    specialtyTa: 'நாடி ஜோதிடம், கைரேகை சாஸ்திரம்',
    category: 'vedic',
    price: 50,
    rating: 4.9,
    yearsOfExp: 22,
    available: false,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150&h=150',
    descriptionEn: '"Profound soul reader, believes everything is pre-written on palm lines and ancient palm leaves. Teaches how self-realization..."',
    descriptionTa: '"ஆழ்ந்த ஆன்மீக ஞானம் கொண்டவர். உங்கள் கைரேகை மற்றும் நாடி ஓலைச் சுவடிகள் மூலம் உங்கள் கடந்தகால, எதிர்கால கர்ம வினைகளைத் துல்லியமாக விளக்குவார்..."',
    languagesEn: ['Tamil', 'Telugu', 'Hindi', 'English'],
    languagesTa: ['தமிழ்', 'தெலுங்கு', 'இந்தி', 'ஆங்கிலம்'],
    status: 'offline'
  }
];

interface ConsultExpertProps {
  walletBalance: number;
  onBook: (amount: number, bookingDetails: any) => void;
  onOpenWallet: () => void;
  language: 'ta' | 'en';
  theme: 'light' | 'dark';
}

export function ConsultExpert({ walletBalance, onBook, onOpenWallet, language, theme }: ConsultExpertProps) {
  const isLight = theme === 'light';
  const [successBooking, setSuccessBooking] = useState<any | null>(null);
  const [errorBooking, setErrorBooking] = useState<string | null>(null);
  
  // Timer state for dynamic countdown
  const [countdown, setCountdown] = useState<number>(120); // 2 minutes countdown
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [specialtyFilter, setSpecialtyFilter] = useState<'all' | 'vedic' | 'tarot' | 'numerology'>('all');

  useEffect(() => {
    let interval: any = null;
    if (timerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, countdown]);

  const handleBook = (expert: Expert) => {
    setSuccessBooking(null);
    setErrorBooking(null);

    // Dynamic cost calculated as a standard 5-minute initial call or flat cost matching the expert rate
    const bookingCost = expert.price * 5; // e.g. 5 mins initial call fee

    if (walletBalance < bookingCost) {
      setErrorBooking(
        language === 'ta'
          ? `போதிய பேலன்ஸ் இல்லை! இந்த ஆலோசனையைத் தொடங்க (5 நிமிட அழைப்பிற்கு) மேலும் ₹${bookingCost - walletBalance} தேவை.`
          : `Insufficient funds! You need ₹${bookingCost - walletBalance} more in your wallet for a 5-minute initial session.`
      );
      return;
    }

    onBook(bookingCost, {
      id: expert.id,
      expertName: language === 'ta' ? expert.nameTa : expert.nameEn,
      price: bookingCost,
      date: new Date().toLocaleString()
    });

    confetti({ particleCount: 60, spread: 60 });
    setSuccessBooking(expert);
    setCountdown(120);
    setTimerActive(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const filteredExperts = MASTER_ASTROLOGERS.filter((astro) => {
    if (specialtyFilter === 'all') return true;
    return astro.category === specialtyFilter;
  });

  return (
    <div id="consult-expert-content" className="space-y-6 animate-fade-in">
      {/* Consult Banner header */}
      <div className={`p-6 rounded-3xl border ${
        isLight 
          ? "bg-gradient-to-r from-amber-50 to-amber-100/50 border-amber-500/25 text-[#2C241E] shadow-md" 
          : "bg-gradient-to-r from-[#08061a] via-[#180e3c] to-[#3f190b] border-amber-500/25 text-white shadow-2xl"
        }`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-500">
              <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider font-mono">✦ Consult Premium Astrologers</span>
            </div>
            <h2 className="text-2xl font-serif font-bold mt-1 tracking-tight">
              {language === 'ta' ? "நிபுணத்துவ ஜோதிட ஆலோசனைகள்" : "Consult Premium Astrologers"}
            </h2>
            <p className={`text-xs mt-1 max-w-xl ${isLight ? "text-[#5C4F43]" : "text-gray-300"}`}>
              {language === 'ta' 
                ? "சான்றளிக்கப்பட்ட வேத குருக்கள், கைரேகை நிபுணர்கள் மற்றும் சிறந்த டாரோட் வல்லுநர்களுடன் நேரடி அரட்டை மற்றும் அழைப்புகள்."
                : "Real-time chat & call sessions with certified Indian astrologers, palmists, and Tarot experts."}
            </p>
          </div>
          
          <div className={`flex flex-col items-end p-4 rounded-xl border ${isLight ? "bg-amber-500/5 border-amber-500/20" : "bg-black/35 border-amber-500/20"}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? "text-[#7A695A]" : "text-gray-400"}`}>YOUR WALLET BALANCE</span>
            <span className="text-xl font-mono font-black text-amber-500 mt-1">₹{walletBalance}</span>
            <button 
              onClick={onOpenWallet}
              className="mt-2 text-[10px] bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-lg font-bold uppercase tracking-wide transition-all"
            >
              + Add Cash
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {errorBooking && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center justify-between gap-2.5 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>{errorBooking}</div>
          </div>
          <button 
            onClick={onOpenWallet}
            className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] px-3 py-1 rounded font-bold uppercase tracking-wider shrink-0"
          >
            Add Now
          </button>
        </div>
      )}

      {successBooking && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-3.5 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                {language === 'ta' ? "முன்பதிவு உறுதி செய்யப்பட்டது!" : "Appointment Confirmed & Authorized!"}
              </h4>
              <p className="text-gray-300 mt-1 text-xs">
                {language === 'ta'
                  ? `${successBooking.nameTa} உடனான நேரலை ஒளிப்பதிவு அழைப்பிற்காக உங்கள் இணைப்பு தயாராகிறது.`
                  : `Your secure divine connection with ${successBooking.nameEn} is booting up.`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3.5 bg-black/45 p-4 rounded-xl border border-emerald-500/25 max-w-sm">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500 animate-pulse text-lg">
              📡
            </div>
            <div>
              <div className="text-[10px] text-gray-400 uppercase font-mono font-bold">CONNECTING SECURE PORTAL IN</div>
              <div className="text-lg font-mono font-black text-emerald-400 mt-0.5">{countdown > 0 ? formatTime(countdown) : "CONNECTING NOW..."}</div>
            </div>
          </div>
        </div>
      )}

      {/* Specialty Filter Navigation Tab */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {[
          { id: 'all', labelEn: 'All Specialties', labelTa: 'அனைத்து பிரிவுகள்' },
          { id: 'vedic', labelEn: 'Vedic & Kundli', labelTa: 'வேத ஜோதிடம்' },
          { id: 'tarot', labelEn: 'Tarot & Psychic', labelTa: 'டாரோட் & ஆன்மீகம்' },
          { id: 'numerology', labelEn: 'Numerology & KP', labelTa: 'எண் கணிதம் & கே.பி' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSpecialtyFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              specialtyFilter === tab.id
                ? isLight 
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/10"
                  : "bg-[#d97706]/15 border border-[#d97706]/60 text-amber-400 font-bold"
                : isLight
                  ? "bg-[#FFFDF9] hover:bg-amber-500/5 text-gray-700 border border-amber-500/15"
                  : "bg-black/40 hover:bg-white/5 text-gray-400 border border-white/5"
            }`}
          >
            {language === 'ta' ? tab.labelTa : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Vertical Card Grid Layout exactly like uploaded image */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperts.map((astro) => {
          // Status indicators
          let statusColor = "bg-emerald-500 ring-emerald-500/25";
          let statusTextEn = "Online";
          let statusTextTa = "நேரலையில்";
          
          if (astro.status === 'busy') {
            statusColor = "bg-rose-500 ring-rose-500/25";
            statusTextEn = "In Queue";
            statusTextTa = "வரிசையில்";
          } else if (astro.status === 'offline') {
            statusColor = "bg-gray-500 ring-gray-500/25";
            statusTextEn = "Offline";
            statusTextTa = "அகல இணைப்பில்";
          }

          // Card button states
          let buttonClass = "bg-amber-500 hover:bg-amber-600 text-black";
          let buttonTextEn = "Chat Now";
          let buttonTextTa = "அரட்டை செய்";
          
          if (astro.status === 'busy') {
            buttonClass = "bg-[#2b1220]/60 hover:bg-[#2b1220]/80 border border-rose-500/30 text-rose-400";
            buttonTextEn = "Join Queue";
            buttonTextTa = "வரிசையில் சேர்";
          } else if (astro.status === 'offline') {
            buttonClass = "bg-[#181a20] border border-gray-800 text-gray-500 cursor-not-allowed";
            buttonTextEn = "Offline";
            buttonTextTa = "தற்போது இல்லை";
          }

          return (
            <div 
              key={astro.id}
              id={`expert-card-${astro.id}`}
              className={`rounded-2xl p-6 border flex flex-col justify-between transition-all duration-300 ${
                isLight 
                  ? "bg-white border-amber-500/15 shadow-sm hover:border-amber-500/35 hover:shadow-md" 
                  : "bg-[#0c0a24]/90 border-white/5 hover:border-amber-500/15 shadow-xl hover:shadow-2xl hover:translate-y-[-2px]"
              }`}
            >
              <div className="space-y-4">
                {/* Header Row: Avatar image & Name Details */}
                <div className="flex gap-4 items-start">
                  <div className="relative">
                    <img 
                      src={astro.avatar} 
                      alt={astro.nameEn} 
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border border-amber-500/25 shadow-md shrink-0" 
                    />
                    {/* Active Status Indicator Pulse Dot */}
                    <span className={`absolute bottom-[-2px] right-[-2px] w-3.5 h-3.5 rounded-full ring-4 ${
                      isLight ? "ring-white" : "ring-[#0c0a24]"
                    } ${statusColor}`} />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className={`text-md font-bold leading-tight ${isLight ? "text-gray-900" : "text-white"}`}>
                      {language === 'ta' ? astro.nameTa : astro.nameEn}
                    </h3>
                    
                    <p className="text-[11px] font-mono font-medium text-amber-500 tracking-wide">
                      {language === 'ta' ? astro.specialtyTa : astro.specialtyEn}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <span className="text-amber-400 font-bold">⭐ {astro.rating}</span>
                      <span className="text-gray-600">|</span>
                      <span>{language === 'ta' ? astro.experienceTa : astro.experienceEn}</span>
                    </div>
                  </div>
                </div>

                {/* Description Block */}
                <div className="py-2">
                  <p className={`text-[12px] leading-relaxed italic ${
                    isLight ? "text-gray-600" : "text-gray-400"
                  }`}>
                    {language === 'ta' ? astro.descriptionTa : astro.descriptionEn}
                  </p>
                </div>

                {/* Language tags row */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(language === 'ta' ? astro.languagesTa : astro.languagesEn).map((lang, idx) => (
                    <span 
                      key={idx} 
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border ${
                        isLight 
                          ? "bg-amber-500/5 text-amber-800 border-amber-500/10" 
                          : "bg-white/5 border-white/10 text-gray-300"
                      }`}
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Row: Cost and action button */}
              <div className={`mt-6 pt-4 border-t flex justify-between items-center ${
                isLight ? "border-amber-500/10" : "border-white/5"
              }`}>
                <div className="space-y-0.5">
                  <span className={`text-[9px] font-bold block uppercase tracking-wider ${
                    isLight ? "text-[#7A695A]" : "text-gray-500"
                  }`}>
                    {language === 'ta' ? "ஆலோசனை கட்டணம்" : "CONSULTATION CHARGE"}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-lg font-mono font-black ${isLight ? "text-gray-900" : "text-white"}`}>
                      ₹{astro.price}
                    </span>
                    <span className={`text-xs ${isLight ? "text-[#7A695A]" : "text-gray-500"}`}>
                      /min
                    </span>
                  </div>
                </div>

                <button
                  disabled={astro.status === 'offline'}
                  onClick={() => handleBook(astro)}
                  className={`py-2.5 px-5 rounded-xl font-bold text-xs transition-all duration-200 flex items-center gap-1.5 shadow-md uppercase tracking-wider ${buttonClass}`}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  {language === 'ta' ? buttonTextTa : buttonTextEn}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

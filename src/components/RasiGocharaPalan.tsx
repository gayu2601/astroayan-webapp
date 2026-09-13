import { useEffect, useState } from "react";

type Element = "fire" | "earth" | "air" | "water";

export interface RasiItem {
  ta: string;
  en: string;
  element: Element;
  guruTa: string;
  guruEn: string;
  saniTa: string;
  saniEn: string;
  rahuKetuTa: string;
  rahuKetuEn: string;
  benefitsTa: string;
  benefitsEn: string;
  disadvantagesTa: string;
  disadvantagesEn: string;
}

const RASIS: RasiItem[] = [
  {
    ta: "மேஷம்",
    en: "Aries",
    element: "fire",
    guruTa: "4-ம் இடம் (சுக ஸ்தானம்)",
    guruEn: "4th House (Sukha Sthanam / Comforts)",
    saniTa: "ஜென்ம சனி / மேஷ ராசி மாற்றம்",
    saniEn: "Janma Sani / Transit to Aries",
    rahuKetuTa: "கலவையான அமைப்பு",
    rahuKetuEn: "Mixed Influences",
    benefitsTa:
      "நான்காம் இடத்து குருவினால் வீடு, வாகனம் வாங்கும் யோகம் மற்றும் சொத்து சேர்க்கை உண்டாகும். நீண்ட நாள் தடைகள் விலகி குடும்பத்தில் நிம்மதி பிறக்கும்.",
    benefitsEn:
      "Jupiter in the 4th house brings auspicious yoga for acquiring property, new vehicles, and domestic comforts. Longstanding obstacles dissolve and peace returns to the family.",
    disadvantagesTa: "கடின உழைப்புக்கான முழு அங்கீகாரம் கிடைக்க தாமதமாகலாம்.",
    disadvantagesEn: "Recognition for hard work may face minor delays; patience is essential.",
  },
  {
    ta: "ரிஷபம்",
    en: "Taurus",
    element: "earth",
    guruTa: "3-ம் இடம் (முயற்சி ஸ்தானம்)",
    guruEn: "3rd House (Effort & Enterprise)",
    saniTa: "11-ம் இடம் (லாப ஸ்தானம்)",
    saniEn: "11th House (Labha Sthanam / Gains)",
    rahuKetuTa: "நிதி நிர்வாகத்தில் கவனம் தேவை",
    rahuKetuEn: "Prudence needed in financial management",
    benefitsTa:
      "குருவின் பார்வை 7, 9, 11-ல் விழுவதால் திருமணத் தடைகள் நீங்கி சுபகாரியங்கள் கைகூடும். கூட்டுத் தொழிலில் நல்ல லாபமும், நீண்ட நாள் ஆசைகளும் நிறைவேறும்.",
    benefitsEn:
      "Jupiter's aspect on 7th, 9th, and 11th houses clears marital delays and favors celebrations. Highly profitable collaborative partnerships and fulfillment of long-held dreams.",
    disadvantagesTa: "கடின உழைப்புக்கான முழு அங்கீகாரம் கிடைக்க தாமதமாகலாம்.",
    disadvantagesEn: "Full fruits of labor require sustained persistence and dedication.",
  },
  {
    ta: "மிதுனம்",
    en: "Gemini",
    element: "air",
    guruTa: "2-ம் இடம் (தன ஸ்தானம்)",
    guruEn: "2nd House (Dhana Sthanam / Wealth)",
    saniTa: "10-ம் இடம் (தொழில் ஸ்தானம்)",
    saniEn: "10th House (Karma / Profession)",
    rahuKetuTa: "கோச்சாரம் சாதகம்",
    rahuKetuEn: "Transit in progress",
    benefitsTa:
      "தன குருவானதால் நிதி நிலை பன்மடங்கு உயரும். குடும்பத்தில் இருந்த குழப்பங்கள் நீங்கி ஒற்றுமை பலப்படும். பேச்சாற்றலால் காரியங்களைச் சாதிப்பீர்கள். கடன் தொல்லைகள் குறையும்.",
    benefitsEn:
      "Jupiter in the 2nd house multiplies financial inflow. Family discord clears away, fostering unity. Eloquent speech accomplishes critical milestones; outstanding debts reduce significantly.",
    disadvantagesTa:
      "கண் மற்றும் பற்கள் சார்ந்த உபாதைகள் தோன்றி மறையலாம். புதிய முதலீடுகளில் சிறிய அளவிலான கவனம் தேவை.",
    disadvantagesEn:
      "Minor eye or dental sensitivity may arise. Exercise thoughtful scrutiny with speculative investments.",
  },
  {
    ta: "கடகம்",
    en: "Cancer",
    element: "water",
    guruTa: "1-ம் இடம் (ஜென்ம ராசியில் உச்சம்)",
    guruEn: "1st House (Exalted in Janma Rasi)",
    saniTa: "9-ம் இடம் (பாக்கிய ஸ்தானம்)",
    saniEn: "9th House (Bhagya Sthanam / Fortune)",
    rahuKetuTa: "சுப மாற்றம்",
    rahuKetuEn: "Auspicious alignment",
    benefitsTa:
      "குரு பகவான் உச்சம் பெறுவதால் கோடீஸ்வர யோகம் போன்ற அதிர்ஷ்ட வாய்ப்புகள், புத்திர பாக்கியம் மற்றும் திருமண யோகம் கைகூடும். புதிய தொடக்கங்கள் வெற்றியைத் தரும்.",
    benefitsEn:
      "Exalted Jupiter bestows rare wealth-generating opportunities, progeny blessings, and marriage alliances. New entrepreneurial launches achieve profound success.",
    disadvantagesTa:
      "ஜென்ம குரு என்பதால் ஆரம்பத்தில் மனக்குழப்பங்களும், எதிலும் பொறுமையைக் கடைபிடிக்க வேண்டிய சூழலும் உருவாகும்.",
    disadvantagesEn:
      "Jupiter in Janma Rasi may cause initial mental restlessness; deliberate patience is required.",
  },
  {
    ta: "சிம்மம்",
    en: "Leo",
    element: "fire",
    guruTa: "12-ம் இடம் (விரய ஸ்தானம்)",
    guruEn: "12th House (Vyaya Sthanam / Expenses)",
    saniTa: "8-ம் இடம் (அஷ்டம சனி)",
    saniEn: "8th House (Ashtama Sani)",
    rahuKetuTa: "விரய ஸ்தானத்தில் கேது",
    rahuKetuEn: "Ketu in 12th House",
    benefitsTa:
      "சுப விரயங்கள் (வீடு கட்டுதல், திருமணம் போன்ற சுப நிகழ்ச்சிகள்) அதிகரிக்கும். அயல்நாட்டுப் பயணங்கள் மற்றும் ஆன்மீக யாத்திரைகள் கைகூடும்.",
    benefitsEn:
      "Auspicious expenditures (building home, weddings, religious events) increase. Foreign travel opportunities and spiritual pilgrimages materialize.",
    disadvantagesTa:
      "செலவுகள் அதிகரிக்கும் என்பதால் பொருளாதாரத்தில் சிக்கனம் தேவை. தேவையற்ற மன அழுத்தமும், வேலை பளுவும் கூடும்.",
    disadvantagesEn:
      "Expenditures escalate, requiring disciplined budgeting. Heavy workload demands mindful stress management.",
  },
  {
    ta: "கன்னி",
    en: "Virgo",
    element: "earth",
    guruTa: "11-ம் இடம் (லாப ஸ்தானம்)",
    guruEn: "11th House (Labha Sthanam / Gains)",
    saniTa: "7-ம் இடம் (கூட்டாண்மை)",
    saniEn: "7th House (Partnerships)",
    rahuKetuTa: "ஆதரவான அமைப்பு",
    rahuKetuEn: "Supportive transit",
    benefitsTa:
      "லாப குருவால் பொருளாதாரத்தில் அபாரமான வளர்ச்சி ஏற்படும். உத்தியோகத்தில் எதிர்பார்த்த பதவி உயர்வு மற்றும் ஊதிய உயர்வு தடையின்றி கிடைக்கும். மூத்த சகோதரர்களின் முழு ஆதரவு கிட்டும்.",
    benefitsEn:
      "Labha Guru sparks extraordinary economic expansion. Promotions, bonuses, and salary increments flow without impediment. Complete support from elder siblings and mentors.",
    disadvantagesTa:
      "ராகு-கேதுவின் தாக்கத்தால் குடும்ப உறவுகளில் மற்றும் பணப் பரிமாற்றங்களில் சிறிய அளவிலான எச்சரிக்கை தேவை.",
    disadvantagesEn:
      "Exercise moderate caution in verbal family discussions and significant loan guarantees.",
  },
  {
    ta: "துலாம்",
    en: "Libra",
    element: "air",
    guruTa: "10-ம் இடம் (தொழில் ஸ்தானம்)",
    guruEn: "10th House (Karma / Career)",
    saniTa: "6-ம் இடம் (வெற்றி ஸ்தானம்)",
    saniEn: "6th House (Victory over Hurdles)",
    rahuKetuTa: "சீரான நிலை",
    rahuKetuEn: "Steady transit",
    benefitsTa:
      "உழைப்புக்கு ஏற்ற வருமானம் கிடைக்கும். புதிய தொழிலோ அல்லது உத்தியோகத்தில் புதிய பொறுப்புகளோ உங்களைத் தேடி வரும்.",
    benefitsEn:
      "Income strictly commensurate with diligent effort. New business avenues, leadership promotions, and higher responsibilities seek you out.",
    disadvantagesTa:
      "பத்தில் குரு வந்தால் பதவி மாற்றம் அல்லது பணிச்சுமை அதிகரிக்கும். வியாபாரத்தில் புதிய முதலீடுகளைச் செய்யும் போது அதிக நிதானம் தேவை.",
    disadvantagesEn:
      "10th house Jupiter may bring job transfers or heavier workload. Exercise balance before major capital commitments.",
  },
  {
    ta: "விருச்சிகம்",
    en: "Scorpio",
    element: "water",
    guruTa: "9-ம் இடம் (பாக்கிய ஸ்தானம்)",
    guruEn: "9th House (Bhagya Sthanam / Fortune)",
    saniTa: "5-ம் இடம் (பூர்வ புண்ணியம்)",
    saniEn: "5th House (Poorva Punya)",
    rahuKetuTa: "நன்மையான அமைப்பு",
    rahuKetuEn: "Beneficial alignment",
    benefitsTa:
      "பாக்கிய குருவின் பார்வையால் தொட்டது துலங்கும். நீண்ட தூரப் பயணங்கள் மூலம் அனுகூலம் உண்டு. சமூகத்தில் மதிப்பும் மரியாதையும் உயரும்.",
    benefitsEn:
      "Bhagya Guru’s golden aspect turns every endeavour into gold. Long-distance journeys yield high prosperity. Tremendous rise in social honor and community prestige.",
    disadvantagesTa:
      "தந்தையின் உடல்நலத்தில் சிறு உபாதைகள் ஏற்படலாம்; குடும்பத்தில் சின்ன சின்ன கருத்து வேறுபாடுகள் வந்து நீங்கும்.",
    disadvantagesEn:
      "Attention required toward father's health; minor domestic differences need understanding.",
  },
  {
    ta: "தனுசு",
    en: "Sagittarius",
    element: "fire",
    guruTa: "8-ம் இடம் (ஆயுள் ஸ்தானம்)",
    guruEn: "8th House (Transformation & Wisdom)",
    saniTa: "4-ம் இடம் (அர்த்தாஷ்டம சனி)",
    saniEn: "4th House (Ardhashtama Sani)",
    rahuKetuTa: "குடும்ப மற்றும் வேலை சவால்கள்",
    rahuKetuEn: "Domestic and professional growth challenges",
    benefitsTa:
      "ஆன்மீக ஈடுபாடு அதிகரிக்கும். மறைமுகமான சில வழிகளில் உதவிகள் கிடைக்கும். கடினமான சூழ்நிலைகளைச் சமாளிக்கும் மனப்பக்குவம் உண்டாகும்.",
    benefitsEn:
      "Spiritual insight and philosophical wisdom surge. Unexpected support arrives from hidden sources. Inner mental resilience matures to handle any adversity.",
    disadvantagesTa:
      "எட்டாம் இடத்து குருவினால் பொருளாதாரத்தில் பற்றாக்குறையும், தேவையற்ற அலைச்சலும் ஏற்படும். பெற்றோரின் உடல்நலத்தில் கவனம் செலுத்த வேண்டும்.",
    disadvantagesEn:
      "8th house Jupiter can cause temporary liquidity constraints and tiring travels. Guard health of parents.",
  },
  {
    ta: "மகரம்",
    en: "Capricorn",
    element: "earth",
    guruTa: "7-ம் இடம் (களத்திர ஸ்தானம்)",
    guruEn: "7th House (Kalathra / Marriage & Trade)",
    saniTa: "3-ம் இடம் (மிகச்சிறப்பான லாபகரமான நிலை)",
    saniEn: "3rd House (Highly Lucrative & Victorious)",
    rahuKetuTa: "சாதகமான நிலை",
    rahuKetuEn: "Favorable positioning",
    benefitsTa:
      "சனி பகவானின் அருளால் நீண்ட காலக் கடின உழைப்புக்கான அங்கீகாரம் மற்றும் பாராட்டு கிடைக்கும். உத்தியோகத்தில் உயர்ந்த பொறுப்புகளும் புதிய வருமான வழிகளும் உருவாகும். ஏழாம் இடத்து குருவால் திருமணத் தடைகள் விலகும்.",
    benefitsEn:
      "Saturn's blessing rewards long-standing toil with high honors. Elevation to prominent professional roles and fresh revenue streams. 7th house Jupiter eliminates wedding delays.",
    disadvantagesTa:
      "கூட்டாண்மை வியாபாரத்தில் ஆரம்பத்தில் சிறிய அளவிலான ஈகோ பிரச்சனைகள் தலைதூக்கலாம், எனவே வெளிப்படைத்தன்மை தேவை.",
    disadvantagesEn:
      "Minor ego friction possible with business partners; maintain open transparency.",
  },
  {
    ta: "கும்பம்",
    en: "Aquarius",
    element: "air",
    guruTa: "6-ம் இடம் (ரோக ஸ்தானம்)",
    guruEn: "6th House (Roga & Rina Sthanam)",
    saniTa: "2-ம் இடம் (மேஷ ராசிக்கு மாறுவதால் ஏழரை சனியிலிருந்து முழுமையான விமோசனம்)",
    saniEn: "2nd House (Complete relief from Sade Sati upon transit to Aries)",
    rahuKetuTa: "மாற்றங்கள் தரும் கோச்சாரம்",
    rahuKetuEn: "Transformative transit",
    benefitsTa:
      "ஏழரை சனியின் பிடியிலிருந்து விலகுவதால் மன அமைதியும் உற்சாகமும் பெருக்கெடுக்கும். நீண்ட நாட்களாக முடங்கியிருந்த முக்கிய பணிகளை வெற்றிகரமாக முடிப்பீர்கள். நிதிநிலை வலுவடையும்.",
    benefitsEn:
      "Relief from Sade Sati brings immense peace of mind and revitalized energy. Stalled undertakings resume and succeed. Financial stability strengthens noticeably.",
    disadvantagesTa:
      "ஆறாம் இடத்து குருவினால் எதிரிகள் மறைமுகமாக அடங்கினாலும், உடல் நலனில் மற்றும் உணவு விஷயத்தில் கவனம் செலுத்த வேண்டும்.",
    disadvantagesEn:
      "6th house Jupiter subdues rivals, but requires mindful dietary habits and routine health care.",
  },
  {
    ta: "மீனம்",
    en: "Pisces",
    element: "water",
    guruTa: "5-ம் இடம் (பூர்வ புண்ணியம்)",
    guruEn: "5th House (Poorva Punya Sthanam)",
    saniTa: "1-ம் இடம் (ஜென்ம சனி)",
    saniEn: "1st House (Janma Sani)",
    rahuKetuTa: "கர்ம வினை தீர்வு",
    rahuKetuEn: "Karmic adjustments",
    benefitsTa:
      "ஐந்தாம் இடத்து குரு பூர்வ புண்ணிய பலன்களைத் தருவார். பிள்ளைகள் வழியில் பெருமையும் மகிழ்ச்சியும் உண்டாகும். கல்வி மற்றும் அறிவு சார்ந்த துறைகளில் இருப்போருக்கு உச்சமான காலம்.",
    benefitsEn:
      "5th house Jupiter unlocks ancestral merits and good karma. Joy, pride, and celebration through children. Golden era for scholars, creatives, and educators.",
    disadvantagesTa:
      "சனி மற்றும் ராகு-கேதுவின் தாக்கத்தால் தேவையற்ற மனக்கவலைகள், குடும்பத்தில் சிறு குழப்பங்கள் ஏற்பட்டு மறையும். எதிலும் திட்டமிட்டுச் செயல்படுவது நன்மையைத் தரும்.",
    disadvantagesEn:
      "Saturn and nodal influences may trigger unneeded anxieties and minor household confusion. Strategic planning ensures victory.",
  },
];

const ELEMENT_LABEL_TA: Record<Element, string> = {
  fire: "அக்னி",
  earth: "பூமி",
  air: "வாயு",
  water: "நீர்",
};

const ELEMENT_LABEL_EN: Record<Element, string> = {
  fire: "Fire",
  earth: "Earth",
  air: "Air",
  water: "Water",
};

function ElementMark({ element, size = 16 }: { element: Element; size?: number }) {
  switch (element) {
    case "fire":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <path
            d="M12 2c1 3-2 4-2 7a4 4 0 1 0 8 0c0-1-.5-2-1-2 .3 2-.6 3-1.7 3 .5-1 .2-2.5-.8-3.5-.3 1.3-1 2-2 2.3.6-2.5-.5-4.8-2.5-6.8Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "earth":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <path
            d="M3 18 9 7l3 5 2-3 7 9H3Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "air":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <path
            d="M3 9h11a3 3 0 1 0-2.8-4M3 15h14a3 3 0 1 1-2.6 4.3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "water":
      return (
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <path
            d="M12 3c3 4 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 3-7 6-11Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export interface RasiGocharaPalanProps {
  language?: 'ta' | 'en';
  isLight?: boolean;
}

export default function RasiGocharaPalan({
  language = 'ta',
  isLight = false,
}: RasiGocharaPalanProps) {
  const isTa = language === 'ta';
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (document.getElementById("rasi-palan-fonts")) return;
    const link = document.createElement("link");
    link.id = "rasi-palan-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Noto+Serif+Tamil:wght@500;600;700&family=Noto+Sans+Tamil:wght@400;500&family=Inter:ital,wght@0,400;0,500;1,400&display=swap";
    document.head.appendChild(link);
  }, []);

  const rasi = selected !== null ? RASIS[selected] : null;

  return (
    <div className={`rp-root ${isLight ? 'rp-theme-light' : 'rp-theme-dark'}`}>
      <style>{`
        .rp-root {
          font-family: "Noto Sans Tamil", "Inter", sans-serif;
          padding: 2.5rem 1.25rem 3.5rem;
          min-height: 100%;
          box-sizing: border-box;
          transition: background-color 0.2s, color 0.2s;
        }
        .rp-theme-light {
          --paper: #FFFDF7;
          --paper-deep: #F7EEDB;
          --paper-card: #FFFFFF;
          --ink: #2B2118;
          --ink-soft: #6B5D4C;
          --rule: rgba(43, 33, 24, 0.18);
          --fire: #9E3827;
          --earth: #A67520;
          --air: #2F5876;
          --water: #1C6B61;
          --good: #1B7844;
          --caution: #A83626;
          --border-accent: rgba(193, 143, 38, 0.4);
          background: var(--paper);
          color: var(--ink);
        }
        .rp-theme-dark {
          --paper: #0B101B;
          --paper-deep: #131B2E;
          --paper-card: #0F172A;
          --ink: #F1F5F9;
          --ink-soft: #94A3B8;
          --rule: rgba(255, 255, 255, 0.1);
          --fire: #F87171;
          --earth: #FBBF24;
          --air: #60A5FA;
          --water: #34D399;
          --good: #4ADE80;
          --caution: #F87171;
          --border-accent: rgba(245, 158, 11, 0.35);
          background: var(--paper);
          color: var(--ink);
        }
        .rp-root *, .rp-root *::before, .rp-root *::after { box-sizing: border-box; }

        .rp-header {
          max-width: 760px;
          margin: 0 auto 2rem;
          text-align: center;
        }
        .rp-title {
          font-family: "Noto Serif Tamil", Georgia, serif;
          font-weight: 700;
          font-size: clamp(1.9rem, 4vw, 2.5rem);
          letter-spacing: 0.01em;
          margin: 0;
          color: var(--ink);
        }
        .rp-title-en {
          display: block;
          font-family: "Inter", sans-serif;
          font-style: italic;
          font-weight: 500;
          font-size: 0.95rem;
          color: var(--ink-soft);
          margin-top: 0.4rem;
        }
        .rp-prompt {
          margin-top: 0.9rem;
          font-size: 1rem;
          color: var(--ink-soft);
          font-weight: 500;
        }
        .rp-divider {
          width: 130px;
          margin: 1.1rem auto 0;
          border-top: 3px double var(--rule);
          opacity: 0.7;
        }

        /* ---- selection screen ---- */
        .rp-select-grid {
          max-width: 820px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          animation: rp-fade 280ms ease;
        }
        .rp-select-card {
          background: var(--paper-deep);
          border: 1px solid var(--rule);
          border-bottom: 3.5px solid var(--el-color);
          border-radius: 14px;
          padding: 1.4rem 0.6rem 1.1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-family: inherit;
          color: var(--ink);
          transition: transform 140ms ease, background 140ms ease, box-shadow 140ms ease;
        }
        .rp-theme-light .rp-select-card:hover {
          background: #EEDEB8;
          transform: translateY(-3px);
          box-shadow: 0 8px 18px rgba(43, 33, 24, 0.08);
        }
        .rp-theme-dark .rp-select-card:hover {
          background: #1A253D;
          transform: translateY(-3px);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.4);
        }
        .rp-select-card:focus-visible {
          outline: 2px solid var(--ink);
          outline-offset: 2px;
        }
        .rp-select-badge {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: 1.5px solid var(--el-color);
          color: var(--el-color);
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
        }
        .rp-select-ta {
          font-family: "Noto Serif Tamil", Georgia, serif;
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--el-color);
        }
        .rp-select-en {
          font-size: 0.76rem;
          font-style: italic;
          color: var(--ink-soft);
          font-weight: 500;
        }

        /* ---- detail screen ---- */
        .rp-back {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--ink-soft);
          cursor: pointer;
          padding: 0.4rem 0;
          transition: color 0.15s ease;
        }
        .rp-back:hover { color: var(--ink); }
        .rp-back-wrap { max-width: 900px; margin: 0 auto 1.2rem; }

        .rp-panel {
          max-width: 900px;
          margin: 0 auto;
          background: var(--paper-card);
          border: 1px solid var(--rule);
          border-top: 4px solid var(--el-color);
          border-radius: 16px;
          padding: 1.8rem 1.8rem 2rem;
          position: relative;
          box-shadow: 0 12px 32px rgba(0,0,0,0.06);
          animation: rp-fade 260ms ease;
        }
        @keyframes rp-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rp-panel::before, .rp-panel::after {
          content: "";
          position: absolute;
          width: 14px;
          height: 14px;
          border: 1px solid var(--ink);
          opacity: 0.25;
        }
        .rp-panel::before { top: 10px; left: 10px; border-right: none; border-bottom: none; }
        .rp-panel::after { top: 10px; right: 10px; border-left: none; border-bottom: none; }

        .rp-panel-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.6rem;
          border-bottom: 1px solid var(--rule);
          padding-bottom: 1rem;
          margin-bottom: 1.3rem;
        }
        .rp-panel-name {
          font-family: "Noto Serif Tamil", Georgia, serif;
          font-weight: 700;
          font-size: 1.8rem;
          color: var(--el-color);
        }
        .rp-panel-en {
          font-style: italic;
          color: var(--ink-soft);
          font-size: 1rem;
          margin-top: 2px;
        }
        .rp-element-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--el-color);
          font-size: 0.88rem;
          font-weight: 600;
          background: var(--paper-deep);
          border: 1px solid var(--rule);
          padding: 5px 12px;
          border-radius: 999px;
        }

        .rp-transits {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.8rem;
          margin-bottom: 1.5rem;
        }
        .rp-chip {
          border: 1px solid var(--rule);
          background: var(--paper-deep);
          padding: 0.8rem 0.9rem;
          border-radius: 12px;
        }
        .rp-chip-label {
          font-family: "Noto Serif Tamil", Georgia, serif;
          font-weight: 700;
          font-size: 0.88rem;
          color: var(--ink-soft);
          margin-bottom: 0.35rem;
        }
        .rp-chip-value {
          font-size: 0.92rem;
          line-height: 1.45;
          font-weight: 500;
        }

        .rp-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.1rem;
        }
        .rp-col {
          padding: 1.1rem 1.2rem;
          border-left: 4px solid var(--col-color);
          background: var(--paper-deep);
          border-radius: 0 12px 12px 0;
        }
        .rp-col-title {
          font-family: "Noto Serif Tamil", Georgia, serif;
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--col-color);
          margin: 0 0 0.5rem;
        }
        .rp-col-text {
          margin: 0;
          font-size: 0.94rem;
          line-height: 1.65;
          color: var(--ink);
        }

        @media (max-width: 740px) {
          .rp-select-grid { grid-template-columns: repeat(3, 1fr); }
          .rp-transits { grid-template-columns: 1fr; }
        }
        @media (max-width: 540px) {
          .rp-select-grid { grid-template-columns: repeat(2, 1fr); }
          .rp-cols { grid-template-columns: 1fr; }
          .rp-panel { padding: 1.4rem 1.1rem 1.6rem; }
        }
      `}</style>

      <header className="rp-header">
        <h1 className="rp-title">
          {isTa ? "ராசி கோச்சார பலன்கள்" : "Rasi Gochara Palangal"}
        </h1>
        {rasi === null && (
          <p className="rp-prompt">
            {isTa ? "உங்கள் ராசியைத் தேர்ந்தெடுக்கவும்" : "Select your Rasi (Zodiac Sign) to view predictions"}
          </p>
        )}
        <div className="rp-divider" />
      </header>

      {rasi === null ? (
        <div className="rp-select-grid" role="list" aria-label="Rasi selector">
          {RASIS.map((r, i) => (
            <button
              key={r.en}
              role="listitem"
              className="rp-select-card"
              style={{ ["--el-color" as any]: `var(--${r.element})` }}
              onClick={() => setSelected(i)}
            >
              <span className="rp-select-badge">
                <ElementMark element={r.element} size={22} />
              </span>
              <span className="rp-select-ta">{isTa ? r.ta : r.en}</span>
              <span className="rp-select-en">{isTa ? r.en : r.ta}</span>
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="rp-back-wrap">
            <button className="rp-back" onClick={() => setSelected(null)}>
              ← {isTa ? "வேறு ராசி தேர்வு செய்ய" : "Choose another Rasi"}
            </button>
          </div>

          <section
            className="rp-panel"
            style={{ ["--el-color" as any]: `var(--${rasi.element})` }}
            key={rasi.en}
          >
            <div className="rp-panel-head">
              <div>
                <div className="rp-panel-name">{isTa ? rasi.ta : rasi.en}</div>
                <div className="rp-panel-en">{isTa ? rasi.en : rasi.ta}</div>
              </div>
              <span className="rp-element-tag">
                <ElementMark element={rasi.element} size={18} />
                {isTa ? `${ELEMENT_LABEL_TA[rasi.element]} ராசி` : `${ELEMENT_LABEL_EN[rasi.element]} Sign`}
              </span>
            </div>

            <div className="rp-transits">
              <div className="rp-chip">
                <div className="rp-chip-label">
                  {isTa ? "குரு கோச்சாரம்" : "Jupiter Transit (Guru)"}
                </div>
                <div className="rp-chip-value">
                  {isTa ? rasi.guruTa : rasi.guruEn}
                </div>
              </div>
              <div className="rp-chip">
                <div className="rp-chip-label">
                  {isTa ? "சனி கோச்சாரம்" : "Saturn Transit (Sani)"}
                </div>
                <div className="rp-chip-value">
                  {isTa ? rasi.saniTa : rasi.saniEn}
                </div>
              </div>
              <div className="rp-chip">
                <div className="rp-chip-label">
                  {isTa ? "ராகு - கேது" : "Rahu - Ketu Transit"}
                </div>
                <div className="rp-chip-value">
                  {isTa ? rasi.rahuKetuTa : rasi.rahuKetuEn}
                </div>
              </div>
            </div>

            <div className="rp-cols">
              <div className="rp-col" style={{ ["--col-color" as any]: "var(--good)" }}>
                <p className="rp-col-title">
                  {isTa ? "நன்மைகள் (Positive Impacts)" : "Positive Impacts & Opportunities"}
                </p>
                <p className="rp-col-text">
                  {isTa ? rasi.benefitsTa : rasi.benefitsEn}
                </p>
              </div>
              <div className="rp-col" style={{ ["--col-color" as any]: "var(--caution)" }}>
                <p className="rp-col-title">
                  {isTa ? "தீமைகள் / எச்சரிக்கை" : "Challenges & Precautionary Advice"}
                </p>
                <p className="rp-col-text">
                  {isTa ? rasi.disadvantagesTa : rasi.disadvantagesEn}
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

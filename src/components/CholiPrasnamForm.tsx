import React, { useState, ChangeEvent, FormEvent } from 'react';

// ==========================================
// 1. TAMIL ASTROLOGY DICTIONARIES
// ==========================================

const BHAVA_MAP: Record<number, string> = {
  1: 'தன்னைப் பற்றிய கவலை அல்லது சொந்த ஆரோக்கியம்.',
  2: 'தனம், குடும்பம், நிதியுதவி அல்லது சொல் வாக்கு பற்றிய விஷயம்.',
  3: 'சகோதரம், தைரியம், குறுகிய பயணம் அல்லது தொடர்பு பற்றிய காரியம்.',
  4: 'தாய், வீடு, நிலம், வாகனம் அல்லது சுக வாழ்வு பற்றிய கவலை.',
  5: 'குழந்தைகள், புத்திர பாக்கியம், காதல் அல்லது பூர்வ புண்ணியம்.',
  6: 'கடன், நோய், வழக்கு அல்லது எதிரிகளால் ஏற்படும் தொந்தரவு.',
  7: 'கணவன்/மனைவி, திருமணம், கூட்டுத் தொழில் அல்லது வாடிக்கையாளர்.',
  8: 'ஆயுள், எதிர்பாராத நஷ்டம், தடைகள் அல்லது அவமானம்.',
  9: 'தந்தை, பாக்கியம், உயர் கல்வி அல்லது தூர தேசப் பயணம்.',
  10: 'தொழில், வேலை வாய்ப்பு, பதவி உயர்வு அல்லது ஜீவனம்.',
  11: 'லாபம், மூத்த சகோதரம், ஆசைகள் நிறைவேறுதல்.',
  12: 'விரயம், வெளிநாட்டு யோகம், மருத்துவச் செலவு அல்லது முதலீடு.',
};

const PLANET_MAP: Record<number, { name: string; desc: string }> = {
  1: { name: 'சூரியன்', desc: 'அரசு வழி காரியங்கள், தந்தையின் ஆரோக்கியம் அல்லது தலைமைப் பதவி பற்றிய காரியம்.' },
  2: { name: 'செவ்வாய்', desc: 'பூமி, சொத்துத் தகராறு, அவசரம் அல்லது தைரியமான முடிவுகள் எடுக்க வேண்டிய நிலை.' },
  3: { name: 'குரு', desc: 'சுப காரியங்கள், பணப்புழக்கம், ஆன்மீகம் அல்லது பெரியோர்களின் ஆசி பெறல்.' },
  4: { name: 'புதன்', desc: 'வியாபாரம், கல்வி, காகிதத் தொடர்புகள் அல்லது புத்தி கூர்மையால் தீர்க்கும் காரியம்.' },
  5: { name: 'சுக்கிரன்', desc: 'திருமணம், பெண்கள் வழி நன்மைகள், ஆடம்பரப் பொருட்கள் அல்லது கலைத் துறை.' },
  6: { name: 'சனி', desc: 'நீண்ட நாள் இழுபறியான காரியம், தொழில் மந்தநிலை அல்லது உடல் ஆரோக்கியம் பற்றிய கவலை.' },
  7: { name: 'சந்திரன்', desc: 'மனக்குழப்பம், இடமாற்றம், பயணம் அல்லது தாய் வழி உறவு சார்ந்த காரியம்.' },
  8: { name: 'ராகு / கேது', desc: 'திடீர் திருப்பங்கள், ரகசிய காரியங்கள், மாயை அல்லது வெளிநாட்டுத் தொடர்புகள்.' },
};

const AYAM_MAP: Record<number, { title: string; desc: string; badgeColor: string }> = {
  1: { title: 'த்வஜம் (கொடி)', desc: 'மிகச் சிறந்த நிலை. நீங்கள் நினைத்த காரியத்தில் மாபெரும் வெற்றியும், புகழும் கிடைக்கும்.', badgeColor: '#15803d' },
  2: { title: 'தூமம் (புகை)', desc: 'காரியத்தில் சில தடைகளும் மனக்குழப்பங்களும் ஏற்படலாம். பொறுமை அவசியம்.', badgeColor: '#b91c1c' },
  3: { title: 'சிம்மம் (சிங்கம்)', desc: 'எதிர்ப்புகளை முறியடித்து காரியத்தில் முழுமையான வெற்றி அடைவீர்கள்.', badgeColor: '#1d4ed8' },
  4: { title: 'சுவானம் (நாய்)', desc: 'தேவையற்ற விவாதங்கள், சண்டைகள் மற்றும் விரயங்களைத் தவிர்க்கவும்.', badgeColor: '#c2410c' },
  5: { title: 'விருஷபம் (காளை)', desc: 'தன லாபமும், குடும்பத்தில் சுப நிகழ்ச்சிகளும் தடையின்றி நடக்கும்.', badgeColor: '#047857' },
  6: { title: 'கரம் (கழுதை)', desc: 'அதிக உழைப்பிற்குப் பின்பே காரியம் சித்தியாகும். விடாமுயற்சி தேவை.', badgeColor: '#374151' },
  7: { title: 'கஜம் (யானை)', desc: 'உயர் அதிகாரிகளின் ஆதரவும், பெரிய அளவிலான வெற்றிகளும் சேரும்.', badgeColor: '#6d28d9' },
  8: { title: 'வயசம் (காகம்)', desc: 'தேவையற்ற அலைச்சல்களும் சிறு தடைகளும் ஏற்பட வாய்ப்புள்ளது.', badgeColor: '#d97706' },
};

// ==========================================
// 2. INTERFACES
// ==========================================

interface FormState {
  name: string;
  location: string;
  totalCowries: number | '';
  openCowries: number | '';
}

interface ResultData {
  clientName: string;
  clientLocation: string;
  bhavaNumber: number;
  bhavaDesc: string;
  planetName: string;
  planetDesc: string;
  openCount: number;
  openDesc: string;
  ayamTitle: string;
  ayamDesc: string;
  ayamColor: string;
}

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

export const CholiPrasnamForm: React.FC = () => {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    location: '',
    totalCowries: '',
    openCowries: '',
  });

  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('Cowries') ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const total = Number(formData.totalCowries);
    const open = Number(formData.openCowries);

    if (!total || total <= 0) {
      setError('தயவுசெய்து மொத்த சோழிகளின் எண்ணிக்கையை உள்ளிடவும்.');
      return;
    }
    if (formData.openCowries === '' || open < 0 || open > total) {
      setError('மலர்ந்த சோழிகள் செல்லுபடியாகும் எண்ணிக்கையாக இருக்க வேண்டும்.');
      return;
    }

    const bhavaNumber = ((total - 1) % 12) + 1;
    const bhavaDesc = BHAVA_MAP[bhavaNumber];

    const modulo8 = total % 8 === 0 ? 8 : total % 8;
    const planetInfo = PLANET_MAP[modulo8];
    const ayamInfo = AYAM_MAP[modulo8];

    const isOpenEven = open % 2 === 0;
    const openDesc = isOpenEven
      ? `மலர்ந்த சோழிகள் இரட்டைப்படையாக (${open}) உள்ளதால் தடைகள் விலகி சுப பலன் தரும்.`
      : `மலர்ந்த சோழிகள் ஒற்றைப்படையாக (${open}) உள்ளதால் கூடுதல் கவனம் மற்றும் எச்சரிக்கை தேவை.`;

    setResult({
      clientName: formData.name || 'அன்பர்',
      clientLocation: formData.location || 'பொது',
      bhavaNumber,
      bhavaDesc,
      planetName: planetInfo.name,
      planetDesc: planetInfo.desc,
      openCount: open,
      openDesc,
      ayamTitle: ayamInfo.title,
      ayamDesc: ayamInfo.desc,
      ayamColor: ayamInfo.badgeColor,
    });
  };

  return (
    <div style={styles.container}>
      {/* ---------------- SECTION 1: INPUT FORM (UNCHANGED) ---------------- */}
      <div style={styles.cardContainer}>
        <h2 style={styles.heading}>சோழி பிரசன்னம் - உள்ளீடு</h2>

        <form onSubmit={handleCalculate}>
          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>பெயர்:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={styles.textInput}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>இடம் (ஊர்):</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                style={styles.textInput}
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.orangeCard}>
              <label style={styles.cardLabelOrange}>பிரித்த மொத்த சோழிகள்:</label>
              <input
                type="number"
                name="totalCowries"
                placeholder="எ.கா: 27"
                value={formData.totalCowries}
                onChange={handleChange}
                style={styles.cardInput}
              />
              <span style={styles.subText}>மொத்த சோழிகளின் எண்ணிக்கை</span>
            </div>

            <div style={styles.greenCard}>
              <label style={styles.cardLabelGreen}>மலர்ந்த சோழிகள்:</label>
              <input
                type="number"
                name="openCowries"
                placeholder="எ.கா: 5"
                value={formData.openCowries}
                onChange={handleChange}
                style={styles.cardInput}
              />
              <span style={styles.subText}>முகம் காட்டி விழும் சோழிகள்</span>
            </div>
          </div>

          {error && <div style={styles.errorMessage}>{error}</div>}

          <button type="submit" style={styles.submitBtn}>
            சோழி பலன் காண்
          </button>
        </form>
      </div>

      {/* ---------------- SECTION 2: COLORFUL DASHBOARD RESULTS UI ---------------- */}
      {result && (
        <div style={styles.reportCard}>
          {/* Header Bar */}
          <div style={styles.reportHeader}>
            <div>
              <span style={styles.reportTag}>பிரசன்ன கணிப்பு அறிக்கை</span>
              <h3 style={styles.clientTitle}>
                {result.clientName} <span style={styles.locationText}>({result.clientLocation})</span>
              </h3>
            </div>
            <div style={{ ...styles.verdictBadge, backgroundColor: result.ayamColor }}>
              {result.ayamTitle}
            </div>
          </div>

          <hr style={styles.divider} />

          {/* Color-Coded Cards Grid */}
          <div style={styles.grid}>
            {/* Card 1: Blue Theme (Bhava / Rasi) */}
            <div style={{ ...styles.gridItem, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
              <div style={styles.itemHeader}>
                <span style={{ ...styles.itemNumber, color: '#2563eb' }}>01</span>
                <span style={{ ...styles.itemTitle, color: '#1d4ed8' }}>பிரசன்ன ராசி நிலை</span>
              </div>
              <p style={{ ...styles.itemValBold, color: '#1e40af' }}>பாவம் {result.bhavaNumber}</p>
              <p style={{ ...styles.itemDesc, color: '#1e3a8a' }}>{result.bhavaDesc}</p>
            </div>

            {/* Card 2: Purple Theme (Ruling Planet) */}
            <div style={{ ...styles.gridItem, backgroundColor: '#faf5ff', borderColor: '#e9d5ff' }}>
              <div style={styles.itemHeader}>
                <span style={{ ...styles.itemNumber, color: '#9333ea' }}>02</span>
                <span style={{ ...styles.itemTitle, color: '#7e22ce' }}>இயக்கும் நவக்கிரகம்</span>
              </div>
              <p style={{ ...styles.itemValBold, color: '#6b21a8' }}>{result.planetName}</p>
              <p style={{ ...styles.itemDesc, color: '#581c87' }}>{result.planetDesc}</p>
            </div>

            {/* Card 3: Cyan Theme (Cowrie Insight) */}
            <div style={{ ...styles.gridItem, backgroundColor: '#ecfeff', borderColor: '#a5f3fc' }}>
              <div style={styles.itemHeader}>
                <span style={{ ...styles.itemNumber, color: '#0891b2' }}>03</span>
                <span style={{ ...styles.itemTitle, color: '#0e7490' }}>சோழி முகக் குறிப்பு</span>
              </div>
              <p style={{ ...styles.itemValBold, color: '#155e75' }}>{result.openCount} சோழிகள் மலர்ந்தன</p>
              <p style={{ ...styles.itemDesc, color: '#164e63' }}>{result.openDesc}</p>
            </div>

            {/* Card 4: Emerald / Green Theme (Ashtamangala Final Decision) */}
            <div style={{ ...styles.gridItem, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <div style={styles.itemHeader}>
                <span style={{ ...styles.itemNumber, color: '#16a34a' }}>04</span>
                <span style={{ ...styles.itemTitle, color: '#15803d' }}>அஷ்டமங்கல முடிவு</span>
              </div>
              <p style={{ ...styles.itemValBold, color: result.ayamColor }}>{result.ayamTitle}</p>
              <p style={{ ...styles.itemDesc, color: '#14532d' }}>{result.ayamDesc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. CSS STYLES
// ==========================================
const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '680px',
    margin: '20px auto',
    fontFamily: "'Mukta Malar', 'Segoe UI', sans-serif",
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
    border: '1px solid #f0f0f0',
  },
  heading: {
    textAlign: 'center',
    color: '#b33900',
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '20px',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: '10px',
  },
  row: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  inputGroup: {
    flex: '1 1 200px',
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '6px',
    color: '#333',
  },
  textInput: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #dcdcdc',
    fontSize: '14px',
    outline: 'none',
  },
  orangeCard: {
    flex: '1 1 240px',
    backgroundColor: '#fffdf9',
    border: '1px solid #ffd8bf',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
  },
  greenCard: {
    flex: '1 1 240px',
    backgroundColor: '#f4fbf9',
    border: '1px solid #b5ece1',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
  },
  cardLabelOrange: {
    display: 'block',
    fontWeight: 'bold',
    color: '#b33900',
    fontSize: '16px',
    marginBottom: '10px',
  },
  cardLabelGreen: {
    display: 'block',
    fontWeight: 'bold',
    color: '#00796b',
    fontSize: '16px',
    marginBottom: '10px',
  },
  cardInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #cccccc',
    textAlign: 'center',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  subText: {
    display: 'block',
    marginTop: '6px',
    fontSize: '12px',
    color: '#777777',
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#e64a19',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  errorMessage: {
    color: '#d32f2f',
    fontSize: '13px',
    textAlign: 'center',
    marginBottom: '10px',
  },

  // RESULTS UI REPORT CONTAINER
  reportCard: {
    marginTop: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
  },
  reportHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  reportTag: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  clientTitle: {
    margin: '4px 0 0 0',
    fontSize: '20px',
    color: '#111827',
    fontWeight: 700,
  },
  locationText: {
    fontSize: '15px',
    color: '#6b7280',
    fontWeight: 400,
  },
  verdictBadge: {
    color: '#ffffff',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 700,
    fontSize: '14px',
    letterSpacing: '0.02em',
  },
  divider: {
    margin: '18px 0',
    border: 'none',
    borderTop: '1px solid #f3f4f6',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '16px',
  },
  gridItem: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: '10px',
    padding: '16px',
    transition: 'all 0.2s ease',
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  itemNumber: {
    fontSize: '12px',
    fontWeight: 800,
  },
  itemTitle: {
    fontSize: '13px',
    fontWeight: 700,
  },
  itemValBold: {
    margin: '4px 0 6px 0',
    fontSize: '16px',
    fontWeight: 700,
  },
  itemDesc: {
    margin: 0,
    fontSize: '13px',
    lineHeight: '1.5',
    fontWeight: 500,
  },
};

export default CholiPrasnamForm;
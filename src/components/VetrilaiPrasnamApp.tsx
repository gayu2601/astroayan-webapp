import React, { useState, ChangeEvent, FormEvent } from 'react';

// ==========================================
// 1. DATA DICTIONARIES & HELPER LOGIC
// ==========================================

interface LeafOption {
  id: string;
  label: string;
  desc: string;
  statusColor: string;
  bgColor: string;
}

const LEAF_CONDITIONS: LeafOption[] = [
  {
    id: 'green',
    label: 'பசுமையான, முழுமையான வெற்றிலை',
    desc: 'வெற்றிலை குறைகள் இல்லாமல் பசுமையாக இருப்பதால் காரியம் 100% தடையின்றி வெற்றியடையும்.',
    statusColor: '#16a34a',
    bgColor: '#f0fdf4',
  },
  {
    id: 'torn',
    label: 'நுனி கிழிந்த வெற்றிலை',
    desc: 'காரியத்தின் இறுதிப் பகுதியில் சிறு மனக்கவலை அல்லது எதிர்பாராத தாமதம் ஏற்படலாம்.',
    statusColor: '#d97706',
    bgColor: '#fffbeb',
  },
  {
    id: 'holes',
    label: 'ஓட்டை / கரையான் அரித்த வெற்றிலை',
    desc: 'எதிரிகளால் சிறு இடையூறுகள் அல்லது நிதி விரயங்கள் ஏற்பட வாய்ப்புள்ளதால் எச்சரிக்கை தேவை.',
    statusColor: '#dc2626',
    bgColor: '#fef2f2',
  },
  {
    id: 'withered',
    label: 'வாடிய அல்லது காய்ந்த வெற்றிலை',
    desc: 'உடல் சோர்வு, முயற்சியில் மந்தநிலை மற்றும் எதிர்பார்த்த ஆதரவு கிடைப்பதில் தாமதம் வரலாம்.',
    statusColor: '#ea580c',
    bgColor: '#fff7ed',
  },
  {
    id: 'nostem',
    label: 'காம்பு இல்லாத வெற்றிலை',
    desc: 'காரியத்தின் தொடக்க நிலையில் சில தடுமாற்றங்களும் குழப்பங்களும் வரலாம்.',
    statusColor: '#9333ea',
    bgColor: '#faf5ff',
  },
];

const PLANET_DATA: Record<number, { name: string; tag: string; desc: string; color: string; bgColor: string }> = {
  1: { name: 'சூரியன்', tag: 'அதிகாரம் & வெற்றி', desc: 'அரசு வழி நன்மைகள், தலைமைப் பொறுப்பு மற்றும் காரிய சித்தி உண்டாகும்.', color: '#ea580c', bgColor: '#fff7ed' },
  2: { name: 'சந்திரன்', tag: 'மன அமைதி & பயணம்', desc: 'மன தெளிவு, இடமாற்றம், பயணம் மற்றும் தாய் வழி ஆதரவு கிடைக்கும்.', color: '#0284c7', bgColor: '#f0f9ff' },
  3: { name: 'செவ்வாய்', tag: 'தைரியம் & சொத்து', desc: 'பூமி, நிலம் சார்ந்த சேர்க்கை மற்றும் எதிர்ப்புகளை முறியடிக்கும் பலன்.', color: '#dc2626', bgColor: '#fef2f2' },
  4: { name: 'புதன்', tag: 'வியாபாரம் & கல்வி', desc: 'புத்தி கூர்மை, வியாபார விருத்தி, கல்வி மற்றும் காகிதத் தொடர்புகள் சாதகமாகும்.', color: '#059669', bgColor: '#ecfdf5' },
  5: { name: 'குரு', tag: 'சுப காரியம் & தனம்', desc: 'பணப்புழக்கம் அதிகரிக்கும், சுப நிகழ்ச்சிகள் தடையின்றி கைக்கூடும்.', color: '#d97706', bgColor: '#fffbeb' },
  6: { name: 'சுக்கிரன்', tag: 'பண வரவு', desc: 'பொருளாதார மேன்மை, வாகன யோகம், மகிழ்ச்சி பெருகும்.', color: '#d946ef', bgColor: '#fdf4ff' },
  7: { name: 'சனி', tag: 'உழைப்பு & தாமதம்', desc: 'கடின உழைப்பிற்கு பிறகே பலன் கிடைக்கும். பொறுமையுடன் செயல்படவும்.', color: '#4b5563', bgColor: '#f9fafb' },
  8: { name: 'ராகு', tag: 'திடீர் யோகம்', desc: 'எதிர்பாராத பணவரவு, திடீர் திருப்பங்கள் மற்றும் ரகசிய உதவிகள் கிடைக்கும்.', color: '#7c3aed', bgColor: '#f5f3ff' },
  9: { name: 'கேது', tag: 'ஆன்மீகம் & ஞானம்', desc: 'ஆன்மீக சிந்தனை, தெய்வ வழிபாட்டினால் காரிய தடைகள் விலகும்.', color: '#0891b2', bgColor: '#ecfeff' },
};

// ==========================================
// 2. INTERFACES
// ==========================================

interface FormState {
  name: string;
  location: string;
  vetrilaiCount: number | '';
  paakkuCount: number | '';
  palamCount: number | '';
  selectedConditions: string[];
}

interface ResultData {
  clientName: string;
  clientLocation: string;
  vetrilai: number;
  paakku: number;
  palam: number;
  planetInfo: { name: string; tag: string; desc: string; color: string; bgColor: string };
  conditionResults: LeafOption[];
  insights: string[];
}

// ==========================================
// 3. MAIN COMPONENT
// ==========================================

export const VetrilaiPrasnamApp: React.FC = () => {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    location: '',
    vetrilaiCount: '',
    paakkuCount: '',
    palamCount: '',
    selectedConditions: [],
  });

  const [result, setResult] = useState<ResultData | null>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name.includes('Count') ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleCheckboxToggle = (id: string) => {
    setFormData((prev) => {
      const exists = prev.selectedConditions.includes(id);
      return {
        ...prev,
        selectedConditions: exists
          ? prev.selectedConditions.filter((item) => item !== id)
          : [...prev.selectedConditions, id],
      };
    });
  };

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const vetrilai = Number(formData.vetrilaiCount);
    const paakku = Number(formData.paakkuCount);
    const palam = Number(formData.palamCount);

    if (!vetrilai || vetrilai <= 0) {
      setError('தயவுசெய்து வெற்றிலை எண்ணிக்கையை உள்ளிடவும்.');
      return;
    }
    if (formData.paakkuCount === '' || paakku < 0) {
      setError('செல்லுபடியாகும் பாக்கு எண்ணிக்கையை உள்ளிடவும்.');
      return;
    }
    if (formData.palamCount === '' || palam < 0) {
      setError('செல்லுபடியாகும் பழம் எண்ணிக்கையை உள்ளிடவும்.');
      return;
    }

    const combinedCount = vetrilai + paakku;
	const planetKey = combinedCount % 9 === 0 ? 9 : combinedCount % 9;
	const planetInfo = PLANET_DATA[planetKey];

    const conditionResults = LEAF_CONDITIONS.filter((item) =>
      formData.selectedConditions.includes(item.id)
    );

    const insights: string[] = [];
    if (paakku % 2 === 0 && paakku > 0) {
      insights.push(`பாக்கு இரட்டையாக (${paakku}) இருப்பதால் நினைத்த காரியம் சுபமாக முடியும்.`);
    } else if (paakku > 0) {
      insights.push(`பாக்கு ஒற்றையாக (${paakku}) இருப்பதால் சிறு தாமதத்திற்கு பின் காரியம் கைகூடும்.`);
    }

    if (palam > 0) {
      insights.push(`${palam} பழங்கள் அமைந்தது மிகச் சிறப்பு! குடும்பத்தில் மகிழ்ச்சியும் சுப பலன்களும் உண்டாகும்.`);
    } else {
      insights.push(`பழம் வைக்கப்படாததால் காரிய வெற்றிக்கான முயற்சி இருமடங்கு தேவைப்படும்.`);
    }

    setResult({
      clientName: formData.name || 'அன்பர்',
      clientLocation: formData.location || 'பொது',
      vetrilai,
      paakku,
      palam,
      planetInfo,
      conditionResults,
      insights,
    });
  };

  return (
    <div style={styles.container}>
      {/* ---------------- INPUT FORM SECTION ---------------- */}
      <div style={styles.formWrapper}>
        <div style={styles.headerBanner}>
          <h2 style={styles.headerTitle}>வெற்றிலை பிரசன்னம்</h2>
          <p style={styles.headerSubtitle}>தாம்பூல கணிப்பு உள்ளீடு</p>
        </div>

        <form onSubmit={handleCalculate} style={styles.form}>
          {/* Row 1: Name & Location */}
          <div style={styles.row}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>பெயர்</label>
              <input
                type="text"
                name="name"
                placeholder="எ.கா: சுந்தர்"
                value={formData.name}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>இடம் (ஊர்)</label>
              <input
                type="text"
                name="location"
                placeholder="எ.கா: சென்னை"
                value={formData.location}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>
          </div>

          {/* Row 2: Counts */}
          <div style={styles.countGrid}>
            <div style={styles.countCardGreen}>
              <span style={styles.countCardTitle}>வெற்றிலை</span>
              <input
                type="number"
                name="vetrilaiCount"
                placeholder="0"
                value={formData.vetrilaiCount}
                onChange={handleInputChange}
                style={styles.countInput}
              />
              <span style={styles.countCardSub}>எண்ணிக்கை</span>
            </div>

            <div style={styles.countCardAmber}>
              <span style={styles.countCardTitle}>பாக்கு</span>
              <input
                type="number"
                name="paakkuCount"
                placeholder="0"
                value={formData.paakkuCount}
                onChange={handleInputChange}
                style={styles.countInput}
              />
              <span style={styles.countCardSub}>எண்ணிக்கை</span>
            </div>

            <div style={styles.countCardRose}>
              <span style={styles.countCardTitle}>பழம்</span>
              <input
                type="number"
                name="palamCount"
                placeholder="0"
                value={formData.palamCount}
                onChange={handleInputChange}
                style={styles.countInput}
              />
              <span style={styles.countCardSub}>எண்ணிக்கை</span>
            </div>
          </div>

          {/* Row 3: Checkboxes */}
          <div style={styles.checkboxSection}>
            <label style={styles.checkboxSectionLabel}>
              வெற்றிலையின் தன்மை (பொருந்துபவற்றைத் தேர்ந்தெடுக்கவும்):
            </label>
            <div style={styles.checkboxGrid}>
              {LEAF_CONDITIONS.map((cond) => {
                const checked = formData.selectedConditions.includes(cond.id);
                return (
                  <label
                    key={cond.id}
                    style={{
                      ...styles.checkboxTile,
                      borderColor: checked ? cond.statusColor : '#e5e7eb',
                      backgroundColor: checked ? cond.bgColor : '#ffffff',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleCheckboxToggle(cond.id)}
                      style={styles.hiddenCheckbox}
                    />
                    <span
                      style={{
                        ...styles.customIndicator,
                        backgroundColor: checked ? cond.statusColor : '#fff',
                        borderColor: checked ? cond.statusColor : '#d1d5db',
                      }}
                    >
                      {checked && '✓'}
                    </span>
                    <span style={{ ...styles.checkboxLabelText, color: checked ? cond.statusColor : '#374151' }}>
                      {cond.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {error && <div style={styles.errorBanner}>{error}</div>}

          <button type="submit" style={styles.submitButton}>
            பிரசன்னம் காண்
          </button>
        </form>
      </div>

      {/* ---------------- OUTPUT RESULT DASHBOARD ---------------- */}
      {result && (
        <div style={styles.resultDashboard}>
          {/* Header Strip */}
          <div style={styles.dashboardHeader}>
            <div>
              <span style={styles.dashboardBadge}>தாம்பூல பிரசன்ன அறிக்கை</span>
              <h3 style={styles.dashboardTitle}>
                {result.clientName}{' '}
                <span style={styles.dashboardSubtitle}>| {result.clientLocation}</span>
              </h3>
            </div>
            {/* Quick Metrics */}
            <div style={styles.metricsPillGroup}>
              <div style={styles.metricPillGreen}>🌿 வெற்றிலை: {result.vetrilai}</div>
              <div style={styles.metricPillAmber}>🌰 பாக்கு: {result.paakku}</div>
              <div style={styles.metricPillRose}>🍌 பழம்: {result.palam}</div>
            </div>
          </div>

          {/* Main Hero Card - Ruling Planet */}
          <div
            style={{
              ...styles.heroCard,
              backgroundColor: result.planetInfo.bgColor,
              borderColor: result.planetInfo.color,
            }}
          >
            <span style={{ ...styles.heroTag, color: result.planetInfo.color }}>
              கணிதப் பிரசன்ன கிரகம்
            </span>
            <h4 style={{ ...styles.heroPlanetName, color: result.planetInfo.color }}>
              {result.planetInfo.name} ({result.planetInfo.tag})
            </h4>
            <div style={styles.heroDescBox}>
              <p style={styles.heroDescText}>{result.planetInfo.desc}</p>
            </div>
          </div>

          {/* Grid Layout for Leaf Condition & Subtle Insights */}
          <div style={styles.resultGrid}>
            {/* Box 1: Leaf Condition Analysis */}
            <div style={styles.gridSection}>
              <h4 style={styles.sectionHeaderTitle}>வெற்றிலையின் தன்மை (பௌதிக பலன்கள்)</h4>
              {result.conditionResults.length > 0 ? (
                <div style={styles.conditionStack}>
                  {result.conditionResults.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        ...styles.conditionCard,
                        backgroundColor: item.bgColor,
                        borderColor: item.statusColor,
                      }}
                    >
                      <h5 style={{ ...styles.conditionTitle, color: item.statusColor }}>
                        {item.label}
                      </h5>
                      <p style={styles.conditionDesc}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.emptyCard}>
                  <p style={styles.emptyText}>சிறப்பு லட்சணங்கள் எதுவும் தேர்ந்தெடுக்கப்படவில்லை.</p>
                </div>
              )}
            </div>

            {/* Box 2: Subtle Insights */}
            <div style={styles.gridSection}>
              <h4 style={styles.sectionHeaderTitle}>சூட்சுமப் பலன்கள் & கணிப்புகள்</h4>
              <div style={styles.insightsCard}>
                <ul style={styles.insightsList}>
                  {result.insights.map((insight, idx) => (
                    <li key={idx} style={styles.insightItem}>
                      <span style={styles.insightBullet}>✦</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
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
    maxWidth: '720px',
    margin: '24px auto',
    fontFamily: "'Mukta Malar', 'Segoe UI', sans-serif",
  },

  // FORM STYLES
  formWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  headerBanner: {
    backgroundColor: '#059669',
    padding: '20px',
    textAlign: 'center',
    color: '#ffffff',
  },
  headerTitle: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 700,
  },
  headerSubtitle: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    opacity: 0.9,
  },
  form: {
    padding: '24px',
  },
  row: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  fieldGroup: {
    flex: '1 1 220px',
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
  },
  countGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
    marginBottom: '20px',
  },
  countCardGreen: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '10px',
    padding: '14px',
    textAlign: 'center',
  },
  countCardAmber: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '10px',
    padding: '14px',
    textAlign: 'center',
  },
  countCardRose: {
    backgroundColor: '#fff1f2',
    border: '1px solid #fecdd3',
    borderRadius: '10px',
    padding: '14px',
    textAlign: 'center',
  },
  countCardTitle: {
    display: 'block',
    fontSize: '15px',
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: '8px',
  },
  countInput: {
    width: '100%',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 700,
    boxSizing: 'border-box',
  },
  countCardSub: {
    display: 'block',
    marginTop: '4px',
    fontSize: '11px',
    color: '#6b7280',
  },
  checkboxSection: {
    marginBottom: '20px',
  },
  checkboxSectionLabel: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#374151',
    marginBottom: '10px',
    display: 'block',
  },
  checkboxGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  checkboxTile: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  hiddenCheckbox: {
    display: 'none',
  },
  customIndicator: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    borderWidth: '1px',
    borderStyle: 'solid',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 700,
    color: '#ffffff',
  },
  checkboxLabelText: {
    fontSize: '13px',
    fontWeight: 600,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
    textAlign: 'center',
    marginBottom: '14px',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    padding: '14px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
  },

  // RESULTS DASHBOARD STYLES
  resultDashboard: {
    marginTop: '28px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    padding: '24px',
    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
  },
  dashboardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f3f4f6',
  },
  dashboardBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  dashboardTitle: {
    margin: '2px 0 0 0',
    fontSize: '20px',
    color: '#111827',
    fontWeight: 700,
  },
  dashboardSubtitle: {
    fontSize: '15px',
    color: '#6b7280',
    fontWeight: 400,
  },
  metricsPillGroup: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  metricPillGreen: {
    backgroundColor: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 700,
  },
  metricPillAmber: {
    backgroundColor: '#fffbeb',
    color: '#b45309',
    border: '1px solid #fde68a',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 700,
  },
  metricPillRose: {
    backgroundColor: '#fff1f2',
    color: '#be123c',
    border: '1px solid #fecdd3',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 700,
  },

  // HERO CARD
  heroCard: {
    borderRadius: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '20px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  heroTag: {
    fontSize: '12px',
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  heroPlanetName: {
    margin: '6px 0 12px 0',
    fontSize: '22px',
    fontWeight: 800,
  },
  heroDescBox: {
    backgroundColor: '#ffffff',
    padding: '10px 16px',
    borderRadius: '8px',
    display: 'inline-block',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  heroDescText: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
  },

  // GRID SECTION
  resultGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
  },
  gridSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  sectionHeaderTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: '12px',
    margin: '0 0 12px 0',
  },
  conditionStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  conditionCard: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: '10px',
    padding: '12px 14px',
  },
  conditionTitle: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: 700,
  },
  conditionDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#4b5563',
    lineHeight: '1.4',
  },
  emptyCard: {
    backgroundColor: '#f9fafb',
    border: '1px solid #f3f4f6',
    borderRadius: '10px',
    padding: '16px',
    textAlign: 'center',
  },
  emptyText: {
    margin: 0,
    fontSize: '13px',
    color: '#9ca3af',
  },

  // INSIGHTS
  insightsCard: {
    backgroundColor: '#faf5ff',
    border: '1px solid #e9d5ff',
    borderRadius: '10px',
    padding: '16px',
    flex: 1,
  },
  insightsList: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  insightItem: {
    fontSize: '13px',
    color: '#581c87',
    lineHeight: '1.5',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    fontWeight: 500,
  },
  insightBullet: {
    color: '#9333ea',
    fontWeight: 700,
  },
};

export default VetrilaiPrasnamApp;
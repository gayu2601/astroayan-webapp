import { generateReportHTML } from '../data/reportLogic'; 
import { useAuth } from '../lib/AuthContext';

const Print = { printToFileAsync: async () => ({ uri: '' }) };
const Sharing = { isAvailableAsync: async () => false, shareAsync: async () => {} };
const FileSystem = { cacheDirectory: '', copyAsync: async () => {} };
const Platform = { OS: 'web' };
const Alert = { alert: (title, msg) => typeof window !== 'undefined' ? window.alert(msg ? `${title}\n${msg}` : title) : console.log(title, msg) };

// 1. Tamil Planet Translation Map
const tamilPlanets = {
  "Sun": "சூரியன்",
  "Moon": "சந்திரன்",
  "Mars": "செவ்வாய்",
  "Rahu": "ராகு",
  "Jupiter": "குரு",
  "Saturn": "சனி",
  "Mercury": "புதன்",
  "Ketu": "கேது",
  "Venus": "சுக்கிரன்"
};

const calculateDashaBalance = (dob, firstDashaEnd, lang = 'ta') => {
  const birth = new Date(dob);
  let end;
  const parts = firstDashaEnd.split('-');
  if (parts[0].length === 4) {
    end = new Date(firstDashaEnd);
  } else {
    end = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }

  let years = end.getFullYear() - birth.getFullYear();
  let months = end.getMonth() - birth.getMonth();
  let days = end.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (lang === 'ta') {
    return `${years} வருடம், ${months} மாதம், ${days} நாள்`;
  } else {
    return `${years} Year(s), ${months} Month(s), ${days} Day(s)`;
  }
};

export const usePageHoroscope = () => {
  const { user } = useAuth();
  const ASTRO_BASE = 'https://api.vedicastroapi.com/v3-json';

	const astroGet = async (endpoint, params) => {
		console.log(params)
	  const query = new URLSearchParams(params).toString();
	  const res = await fetch(`${ASTRO_BASE}/${endpoint}?${query}`, {
		method: 'GET',
	  });
	  if (!res.ok) {
		  const errBody = await res.text();
		  throw new Error(`${endpoint} failed: ${res.status} — ${errBody}`);
		}
	  return res.json();
	};

  const geocodePlace = async (place) => {
    const encoded = encodeURIComponent(place);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
      { headers: { 'User-Agent': 'JathagamApp/1.0' } }
    );
    const data = await res.json();
    if (!data || data.length === 0) throw new Error(`"${place}" என்ற இடத்தை கண்டுபிடிக்க முடியவில்லை.`);
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  };
  
  const generateAndPrint = async (formData, lang) => {
	  console.log('in generateAndPrint', formData)
    const { name, fatherName, motherName, dob, time, place } = formData;
	console.log('in generateAndPrint', formData)
    try {
      const [year, month, day] = dob.split('-').map(Number);
      const [hour, min] = time.split(':').map(Number);
      
      const { lat, lon } = await geocodePlace(place);

	  const pad = (n) => String(n).padStart(2, '0');

	  const birthParams = {
		api_key: '6a0b4e5a-b8d5-5e1a-bd97-6128ad38d349',
		dob:  `${pad(day)}/${pad(month)}/${year}`,   // ✅ "05/01/2026"
		tob:  `${pad(hour)}:${pad(min)}`,            // ✅ "09:05"
		lat,
		lon,
		tz:   5.5,
		lang: lang,
	  };

      // 2. Added 'current_vdasha' to the Promise.all array
      const [planets, astro, d1, d9, dashaList, currentDasha] = await Promise.all([
        astroGet('horoscope/planet-details', birthParams),
        astroGet('extended-horoscope/extended-kundli-details', birthParams),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D1'}),
        astroGet('horoscope/divisional-charts', {...birthParams, div: 'D9'}),
        astroGet('dashas/maha-dasha', birthParams),
        astroGet('dashas/current-mahadasha', birthParams)
      ]);
	  
	  console.log(planets, astro, d1, d9, dashaList, currentDasha)
	  
		// Format nadappuDasa based on lang
		const nadappuDasa = lang === 'ta'
		  ? {
			  text: `${currentDasha?.response?.order_of_dashas?.major?.name} தசா / ${currentDasha?.response?.order_of_dashas?.minor?.name} புக்தி`,
			  endDate: currentDasha?.response?.order_of_dashas?.minor?.end
			}
		  : {
			  text: `${currentDasha?.response?.order_of_dashas?.major?.name} Dasha / ${currentDasha?.response?.order_of_dashas?.minor?.name} Bhukthi`,
			  endDate: currentDasha?.response?.order_of_dashas?.minor?.end
			};
		console.log('nadappuDasa', nadappuDasa);

      const reportPayload = {
        name, fatherName, motherName, birthParams, place,
        planets: planets.response, astro:astro.response, d1Chart: d1.response, d9Chart: d9.response,
        dashaBalance: dashaList?.response?.dasha_remaining_at_birth,
		dashaPlanet: dashaList?.response?.mahadasha[0],
        nadappuDasa // 4. Passing the formatted current period to reportLogic
      };
	  
	  console.log('reportPayload', reportPayload)

      let html;
		try {
		  html = generateReportHTML(reportPayload, lang, user);
		} catch (err) {
		  console.error('reportLogic error:', err);
		  Alert.alert("Report Error", err.message);
		  return;
		}

	  console.log(html)

      if (Platform.OS === 'web') {
		  const printWindow = window.open('', '_blank');
		  if (!printWindow) {
			Alert.alert("Popup blocked", "Please allow popups for this site");
			setLoading(false);
			return;
		  }

		  const html = generateReportHTML(reportPayload, lang, user);

		  const wrappedHTML = `
			<!DOCTYPE html>
			<html>
			<head>
			  <meta charset="UTF-8"/>
			  <style>
				* { box-sizing: border-box; margin: 0; padding: 0; }

				#toolbar {
				  position: fixed;
				  top: 0; left: 0; right: 0;
				  z-index: 9999;
				  background: #1a1a2e;
				  display: flex;
				  align-items: center;
				  gap: 10px;
				  padding: 10px 16px;
				  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
				}

				#toolbar .tb-title {
				  color: #FFD700;
				  font-family: sans-serif;
				  font-size: 15px;
				  font-weight: 700;
				  flex: 1;
				}

				#toolbar button {
				  border: none;
				  border-radius: 8px;
				  padding: 8px 18px;
				  font-size: 14px;
				  font-weight: 700;
				  cursor: pointer;
				  font-family: sans-serif;
				}

				.btn-print { background: #FFD700; color: #1a1a2e; }
				.btn-share { background: #4CAF50; color: #fff; }
				.btn-close { background: #444; color: #fff; }

				#content {
				  margin-top: 56px; /* push content below fixed toolbar */
				}

				@media print {
				  #toolbar { display: none !important; }
				  #content { margin-top: 0 !important; }
				}
			  </style>
			</head>
			<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
			<script>
			  async function shareReport() {
				const element = document.getElementById('content');

				const opt = {
				  margin: 0,
				  filename: 'panchangam.pdf',
				  image: { type: 'jpeg', quality: 0.98 },
				  html2canvas: { scale: 2 },
				  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
				};

				const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
				const file = new File([pdfBlob], 'panchangam.pdf', { type: 'application/pdf' });

				if (navigator.canShare && navigator.canShare({ files: [file] })) {
				  try {
					await navigator.share({
					  files: [file],
					  title: 'பஞ்சாங்கம்',
					  text: 'இன்றைய பஞ்சாங்கம்'
					});
				  } catch (e) {
					// user cancelled
				  }
				} else {
				  // Fallback: trigger download
				  const link = document.createElement('a');
				  link.href = URL.createObjectURL(pdfBlob);
				  link.download = 'panchangam.pdf';
				  link.click();
				}
			  }
			</script>
			<body>
			    <div id="toolbar">
				  <span class="tb-title">📅 பஞ்சாங்கம்</span>
				  <button class="btn-print" onclick="window.print()">🖨️ Print / PDF</button>
				  <button class="btn-share" onclick="shareReport()">📤 Share</button>
				  <button class="btn-close" onclick="window.close()">✕ Close</button>
				</div>

			  <div id="content">
				${html}
			  </div>
			</body>
			</html>
		  `;

		  printWindow.document.open();
		  printWindow.document.write(wrappedHTML);
		  printWindow.document.close();
		} else {
		  const { uri } = await Print.printToFileAsync({ html });
		  const namedUri = FileSystem.cacheDirectory + '1_page_jadhagam.pdf';
			await FileSystem.copyAsync({ from: uri, to: namedUri });

			const isAvailable = await Sharing.isAvailableAsync();
			if (isAvailable) {
			  await Sharing.shareAsync(namedUri, {
				mimeType: 'application/pdf',
				dialogTitle: 'ஒரு பக்க ஜாதகம் PDF',
				UTI: 'com.adobe.pdf',
			  });
			} else {
			  Alert.alert('பகிர முடியவில்லை', 'இந்த சாதனத்தில் பகிர்வு இயங்கவில்லை.');
			}

		}

      return reportPayload;
    } catch (error) {
      console.error(error);
      Alert.alert("பிழை", error.message || "தரவுகளைப் பெறுவதில் சிக்கல்.");
    }
  };

  return { generateAndPrint };
};

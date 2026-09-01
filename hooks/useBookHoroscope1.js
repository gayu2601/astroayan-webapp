const Alert = { alert: (title, msg) => typeof window !== 'undefined' ? window.alert(msg ? `${title}\n${msg}` : title) : console.log(title, msg) };
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

export const useBookHoroscope1 = () => {
  const { user } = useAuth();

  // TODO: point this at the real "exact predictions" endpoint + auth for
  // your account. It must return the combined { status, meta, basic,
  // varga_charts } shape (see exactPredictionsApi_horoscope.txt).
  const EXACT_PREDICTIONS_API_URL = 'https://api.exactpredictions.in/v2/horoscope';
  const EXACT_PREDICTIONS_API_KEY = 'epk_a67f82d69786979c58ef3a06bbf86e3ccb45f1e2ab30640d';

  const geocodePlace = async (place) => {
    const encoded = encodeURIComponent(place);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
      { headers: { 'User-Agent': 'JathagamApp/1.0' } }
    );
    const data = await res.json();
    if (!data || data.length === 0)
      throw new Error(`"${place}" என்ற இடத்தை கண்டுபிடிக்க முடியவில்லை.`);
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  };

  /**
   * Fetches the horoscope in a single call to the "exact predictions" API
   * and returns { name, fatherName, motherName, place, api }, where `api`
   * is the raw { status, meta, basic, varga_charts } response. Any
   * old-shape derivation (astro summary, dasha tables, divisional charts,
   * etc.) now happens on the fly in ViewBookHoroscope.tsx from `api`.
   *
   * @returns {Promise<object|undefined>} reportPayload, or undefined on error
   */
  const generateReportData = async (formData, lang) => {
	  console.log("in generateReportData", formData);

	  const {
		name,
		fatherName,
		motherName,
		dob,
		time,
		place,
	  } = formData;

	  try {
		const [year, month, day] = dob.split("-").map(Number);
		const [hour, minute] = time.split(":").map(Number);

		const { lat, lon } = await geocodePlace(place);

		const birthParams = {
		  name,
		  father_name: fatherName,
		  mother_name: motherName,
		  year,
		  month,
		  day,
		  hour,
		  minute,
		  lat,
		  lon,
		  tz: 5.5,
		  dst: 0,
		  place,
		  language: lang || "en",
		};

		const { data, error } = await supabase.functions.invoke(
		  "generate-book-horoscope",
		  {
			body: birthParams,
		  }
		);

		if (error) {
		  throw error;
		}

		const api = data;

		const reportPayload = {
		  name,
		  fatherName,
		  motherName,
		  place,
		  birthParams,
		  api,
		};

		console.log("reportPayload", reportPayload);

		return reportPayload;

	  } catch (error) {
		console.error("generateReportData error:", error);

		Alert.alert(
		  "பிழை",
		  error.message || "தரவுகளைப் பெறுவதில் சிக்கல்."
		);

		return undefined;
	  }
	};

  return { generateReportData };
};
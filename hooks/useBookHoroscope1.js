const Alert = { alert: (title, msg) => typeof window !== 'undefined' ? window.alert(msg ? `${title}\n${msg}` : title) : console.log(title, msg) };
import { useAuth } from '../lib/AuthContext';

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

export const useBookHoroscope1 = () => {
  const { user } = useAuth();

  const ASTRO_BASE = 'https://api.vedicastroapi.com/v3-json';

  const astroGet = async (endpoint, params) => {
    console.log(params);
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
    if (!data || data.length === 0)
      throw new Error(`"${place}" என்ற இடத்தை கண்டுபிடிக்க முடியவில்லை.`);
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  };

  /**
   * Fetches all astro data and returns a reportPayload object
   * ready to be passed directly to <BookReportScreen data={...} />.
   *
   * @returns {Promise<object|undefined>} reportPayload, or undefined on error
   */
  const generateReportData = async (formData, lang) => {
    console.log('in generateReportData', formData);
    const { name, fatherName, motherName, dob, time, place } = formData;

    try {
      const [year, month, day] = dob.split('-').map(Number);
      const [hour, min] = time.split(':').map(Number);

      const { lat, lon } = await geocodePlace(place);

      const pad = (n) => String(n).padStart(2, '0');

      const birthParams = {
        api_key: '6a0b4e5a-b8d5-5e1a-bd97-6128ad38d349',
        dob: `${pad(day)}/${pad(month)}/${year}`,
        tob: `${pad(hour)}:${pad(min)}`,
        lat,
        lon,
        tz: 5.5,
        lang,
      };

      const [
        planets, astro, d1, d9, dashaList, currentDasha, antardashaList,
        predictions, dashaPredictions,
        d2, d3, d3s, d4, d5, d7, d8, d10, d10R, d12, d16,
        d20, d24, d24R, d27, d40, d45, d60, d30, ashtakvarga,
      ] = await Promise.all([
        astroGet('horoscope/planet-details', birthParams),
        astroGet('extended-horoscope/extended-kundli-details', birthParams),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D1' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D9' }),
        astroGet('dashas/maha-dasha', birthParams),
        astroGet('dashas/current-mahadasha', birthParams),
        astroGet('dashas/antar-dasha', birthParams),
        astroGet('horoscope/personal-characteristics', birthParams),
        astroGet('dashas/maha-dasha-predictions', birthParams),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D2' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D3' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D3-s' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D4' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D5' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D7' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D8' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D10' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D10-R' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D12' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D16' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D20' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D24' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D24-R' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D27' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D40' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D45' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D60' }),
        astroGet('horoscope/divisional-charts', { ...birthParams, div: 'D30' }),
        astroGet('horoscope/ashtakvarga', { ...birthParams, planet: 'total' }),
      ]);

      console.log(dashaList, currentDasha, antardashaList, dashaPredictions);

      // ── Build antardasha lookup ──
      const antardashaLookup = {};
      const antardashaNames = antardashaList.response.antardashas;
      const antardashaEnds = antardashaList.response.antardasha_order;
      antardashaNames.forEach((list, index) => {
        const majorPlanet = list[0].split('/')[0];
        antardashaLookup[majorPlanet] = {
          names: list,
          ends: antardashaEnds[index],
        };
      });

      // ── Build merged dashas ──
      const mahaNames = dashaList.response.mahadasha;
      const mahaEnds = dashaList.response.mahadasha_order;
      const firstMahaStart = dashaList.response.dasha_start_date;

      const mergedDashas = mahaNames.map((name, index) => {
        const start = index === 0 ? firstMahaStart : mahaEnds[index - 1];
        const end = mahaEnds[index];

        const antars = antardashaLookup[name];
        let bhukthis = [];
        if (antars) {
          bhukthis = antars.names.map((item, i) => {
            const [, bhukthi] = item.split('/');
            return {
              name: bhukthi,
              start: i === 0 ? start : antars.ends[i - 1],
              end: antars.ends[i],
            };
          });
        }

        const prediction = dashaPredictions.response.dashas?.find(
          (x) => x.dasha === name
        );

        return { name, start, end, bhukthis, prediction };
      });

      // ── Current dasha text ──
      const nadappuDasa =
        lang === 'ta'
          ? {
              text: `${currentDasha?.response?.order_of_dashas?.major?.name} தசா / ${currentDasha?.response?.order_of_dashas?.minor?.name} புக்தி`,
              endDate: currentDasha?.response?.order_of_dashas?.minor?.end,
            }
          : {
              text: `${currentDasha?.response?.order_of_dashas?.major?.name} Dasha / ${currentDasha?.response?.order_of_dashas?.minor?.name} Bhukthi`,
              endDate: currentDasha?.response?.order_of_dashas?.minor?.end,
            };

      console.log('nadappuDasa', nadappuDasa);

      const reportPayload = {
        name,
        fatherName,
        motherName,
        birthParams,
        place,
        planets: planets.response,
        astro: astro.response,
        d1Chart: d1.response,
        d9Chart: d9.response,
        dashaBalance: dashaList?.response?.dasha_remaining_at_birth,
        dashaPlanet: dashaList?.response?.mahadasha[0],
        nadappuDasa,
        predictions: predictions?.response,
        mergedDashas,
        d2Chart: d2.response,
        d3Chart: d3.response,
        d3sChart: d3s.response,
        d4Chart: d4.response,
        d5Chart: d5.response,
        d7Chart: d7.response,
        d8Chart: d8.response,
        d10Chart: d10.response,
        d10RChart: d10R.response,
        d12Chart: d12.response,
        d16Chart: d16.response,
        d20Chart: d20.response,
        d24Chart: d24.response,
        d24RChart: d24R.response,
        d27Chart: d27.response,
        d30Chart: d30.response,
        d40Chart: d40.response,
        d45Chart: d45.response,
        d60Chart: d60.response,
        ashtakvargaChart: ashtakvarga.response,
      };

      console.log('reportPayload', reportPayload);
      return reportPayload;
    } catch (error) {
      console.error(error);
      Alert.alert('பிழை', error.message || 'தரவுகளைப் பெறுவதில் சிக்கல்.');
      return undefined;
    }
  };

  return { generateReportData };
};
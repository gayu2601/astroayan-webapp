// lib/astrology/lagna-badhakam.js
// லக்கன பாதகம் (Lagna Badhakam) - Badhaka rasi for each lagna
// Source: Traditional Vedic Astrology Tamil reference
// Rule: Chara lagnas → 11th, Sthira lagnas → 9th, Dwi-swabhava lagnas → 7th

const LAGNA_BADHAKAM = {
  "மேஷம்":      { badhakam: "கும்பம்" },
  "கடகம்":      { badhakam: "ரிஷபம்" },
  "துலாம்":     { badhakam: "சிம்மம்" },
  "மகரம்":      { badhakam: "விருச்சிகம்" },

  "ரிஷபம்":     { badhakam: "மகரம்" },
  "சிம்மம்":    { badhakam: "மேஷம்" },
  "விருச்சிகம்": { badhakam: "கடகம்" },
  "கும்பம்":    { badhakam: "துலாம்" },

  "மிதுனம்":    { badhakam: "தனுசு" },
  "கன்னி":      { badhakam: "மீனம்" },
  "தனுசு":      { badhakam: "மிதுனம்" },
  "மீனம்":      { badhakam: "கன்னி" },
};

function getLagnaBadhakam(lagna) {
  return LAGNA_BADHAKAM[lagna?.trim()] ?? null;
}

export { LAGNA_BADHAKAM, getLagnaBadhakam };
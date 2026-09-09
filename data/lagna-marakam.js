// lib/astrology/lagna-marakam.js
// லக்கன மாரகம் (Lagna Marakam) - Maraka rasis for each lagna
// Source: Traditional Vedic Astrology Tamil reference
// Rule: 2nd and 7th house lords from lagna are maraka sthanas

const LAGNA_MARAKAM = {
  "மேஷம்":      { marakam: ["ரிஷபம்", "துலாம்"] },
  "கடகம்":      { marakam: ["சிம்மம்", "மகரம்"] },
  "துலாம்":     { marakam: ["விருச்சிகம்", "மேஷம்"] },
  "மகரம்":      { marakam: ["கும்பம்", "கடகம்"] },

  "ரிஷபம்":     { marakam: ["மிதுனம்", "விருச்சிகம்"] },
  "சிம்மம்":    { marakam: ["கன்னி", "கும்பம்"] },
  "விருச்சிகம்": { marakam: ["தனுசு", "ரிஷபம்"] },
  "கும்பம்":    { marakam: ["மீனம்", "சிம்மம்"] },

  "மிதுனம்":    { marakam: ["கடகம்", "தனுசு"] },
  "கன்னி":      { marakam: ["துலாம்", "மீனம்"] },
  "தனுசு":      { marakam: ["மகரம்", "மிதுனம்"] },
  "மீனம்":      { marakam: ["மேஷம்", "கன்னி"] },
};

function getLagnaMarakam(lagna) {
  return LAGNA_MARAKAM[lagna?.trim()] ?? null;
}

// Check if a given rasi is maraka for this lagna
function isMarakaRasi(lagna, rasi) {
  return LAGNA_MARAKAM[lagna?.trim()]?.marakam.includes(rasi) ?? false;
}

export { LAGNA_MARAKAM, getLagnaMarakam, isMarakaRasi };
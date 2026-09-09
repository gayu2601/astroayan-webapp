// lib/astrology/tithi-soonyam.js
// திதி சூனியம் (Tithi soonyam) - Void rasis for each tithi
// Source: Traditional Vedic Astrology Tamil reference

const TITHI_soonyam = {
  "பிரதமை":    { soonyam: ["துலாம்", "மகரம்"] },
  "துதியை":    { soonyam: ["தனுசு", "மீனம்"] },
  "திருதியை":  { soonyam: ["மகரம்", "சிம்மம்"] },
  "சதுர்த்தி": { soonyam: ["கும்பம்", "ரிஷபம்"] },
  "பஞ்சமி":    { soonyam: ["மிதுனம்", "கன்னி"] },
  "சஷ்டி":     { soonyam: ["மேஷம்", "சிம்மம்"] },
  "ஸப்தமி":    { soonyam: ["தனுசு", "கடகம்"] },
  "அஷ்டமி":   { soonyam: ["மிதுனம்", "கன்னி"] },
  "நவமி":      { soonyam: ["சிம்மம்", "விருச்சிகம்"] },
  "தசமி":      { soonyam: ["சிம்மம்", "விருச்சிகம்"] },
  "ஏகாதசி":   { soonyam: ["தனுசு", "மீனம்"] },
  "துவாதசி":   { soonyam: ["துலாம்", "மகரம்"] },
  "திரயோதசி": { soonyam: ["ரிஷபம்", "சிம்மம்"] },
  "சதுர்த்தசி": { soonyam: ["மிதுனம்", "கன்னி"] },
};

function getTithiSoonyam(tithi) {
  return TITHI_soonyam[tithi?.trim()] ?? null;
}

// Check if a given rasi is soonyam for this tithi
function isSoonyamRasi(tithi, rasi) {
  return TITHI_soonyam[tithi?.trim()]?.soonyam.includes(rasi) ?? false;
}

export { TITHI_soonyam, getTithiSoonyam, isSoonyamRasi };
// lib/astrology/suryan-mudakku.js
// சூரியன் முடக்கு (Suryan Mudakku) - Blocked star & house based on Sun's birth star
// Source: Traditional Vedic Astrology Tamil reference

const SURYAN_MUDAKKU = {
  "அஸ்வினி":      { mudakku_natchathiram: "பூரம்",         mudakku_veedu: "சிம்மம்" },
  "பரணி":         { mudakku_natchathiram: "மகம்",           mudakku_veedu: "சிம்மம்" },
  "கிருத்திகை":   { mudakku_natchathiram: "ஆயில்யம்",      mudakku_veedu: "கடகம்" },
  "ரோகிணி":       { mudakku_natchathiram: "பூசம்",          mudakku_veedu: "கடகம்" },
  "மிருகசீரிடம்": { mudakku_natchathiram: "புனர்பூசம்",    mudakku_veedu: "மிதுனம்" },
  "திருவாதிரை":   { mudakku_natchathiram: "திருவாதிரை",    mudakku_veedu: "மிதுனம்" },
  "புனர்பூசம்":   { mudakku_natchathiram: "மிருகசீரிடம்",  mudakku_veedu: "ரிஷபம்" },
  "பூசம்":        { mudakku_natchathiram: "ரோகிணி",         mudakku_veedu: "ரிஷபம்" },
  "ஆயில்யம்":     { mudakku_natchathiram: "கிருத்திகை",    mudakku_veedu: "மேஷம்" },
  "மகம்":         { mudakku_natchathiram: "பரணி",           mudakku_veedu: "மேஷம்" },
  "பூரம்":        { mudakku_natchathiram: "அஸ்வினி",        mudakku_veedu: "மேஷம்" },
  "உத்திரம்":     { mudakku_natchathiram: "ரேவதி",          mudakku_veedu: "மீனம்" },
  "ஹஸ்தம்":       { mudakku_natchathiram: "உத்திரட்டாதி",  mudakku_veedu: "மீனம்" },
  "சித்திரை":     { mudakku_natchathiram: "பூரட்டாதி",     mudakku_veedu: "கும்பம்" },
  "ஸ்வாதி":       { mudakku_natchathiram: "சதயம்",          mudakku_veedu: "கும்பம்" },
  "விசாகம்":      { mudakku_natchathiram: "அவிட்டம்",      mudakku_veedu: "மகரம்" },
  "அனுசம்":       { mudakku_natchathiram: "திருவோணம்",     mudakku_veedu: "மகரம்" },
  "கேட்டை":       { mudakku_natchathiram: "உத்திராடம்",    mudakku_veedu: "தனுசு" },
  "மூலம்":        { mudakku_natchathiram: "பூராடம்",        mudakku_veedu: "தனுசு" },
  "பூராடம்":      { mudakku_natchathiram: "மூலம்",          mudakku_veedu: "தனுசு" },
  "உத்திராடம்":   { mudakku_natchathiram: "கேட்டை",        mudakku_veedu: "விருச்சிகம்" },
  "திருவோணம்":    { mudakku_natchathiram: "அனுசம்",         mudakku_veedu: "விருச்சிகம்" },
  "அவிட்டம்":     { mudakku_natchathiram: "விசாகம்",        mudakku_veedu: "துலாம்" },
  "சதயம்":        { mudakku_natchathiram: "ஸ்வாதி",         mudakku_veedu: "துலாம்" },
  "பூரட்டாதி":    { mudakku_natchathiram: "சித்திரை",      mudakku_veedu: "கன்னி" },
  "உத்திரட்டாதி": { mudakku_natchathiram: "ஹஸ்தம்",        mudakku_veedu: "கன்னி" },
  "ரேவதி":        { mudakku_natchathiram: "உத்திரம்",      mudakku_veedu: "சிம்மம்" },
};

function getSuryanMudakku(natchathiram) {
  return SURYAN_MUDAKKU[natchathiram?.trim()] ?? null;
}

export { SURYAN_MUDAKKU, getSuryanMudakku };
// lib/astrology/yogi-avayogi.js
// யோக பலன்கள் (Yoga Palan) - Yogi & Avayogi natchathiram/graha for each yoga
// Source: Traditional Vedic Astrology Tamil reference

const YOGA_PALAN = {
  "விஷகம்பம்":  { yogi: { natchathiram: "பூசம்",        graha: "சனி" },      avayogi: { natchathiram: "திருவோணம்",    graha: "சந்திரன்" } },
  "பிரீதி":     { yogi: { natchathiram: "ஆயில்யம்",     graha: "புதன்" },    avayogi: { natchathiram: "அவிட்டம்",      graha: "செவ்வாய்" } },
  "ஆயுஷ்மானம்": { yogi: { natchathiram: "மகம்",          graha: "கேது" },     avayogi: { natchathiram: "சதயம்",          graha: "ராகு" } },
  "சௌபாக்கியம்": { yogi: { natchathiram: "பூரம்",         graha: "சுக்கிரன்" }, avayogi: { natchathiram: "பூரட்டாதி",     graha: "குரு" } },
  "சோபனம்":     { yogi: { natchathiram: "உத்திரம்",      graha: "சூரியன்" },  avayogi: { natchathiram: "உத்திரட்டாதி",  graha: "சனி" } },
  "அதிககண்டம்": { yogi: { natchathiram: "ஹஸ்தம்",        graha: "சந்திரன்" }, avayogi: { natchathiram: "ரேவதி",          graha: "புதன்" } },
  "சுகர்மம்":   { yogi: { natchathiram: "சித்திரை",      graha: "செவ்வாய்" }, avayogi: { natchathiram: "அசுவினி",        graha: "கேது" } },
  "திருதி":     { yogi: { natchathiram: "சுவாதி",         graha: "ராகு" },     avayogi: { natchathiram: "பரணி",           graha: "சுக்கிரன்" } },
  "சூலம்":      { yogi: { natchathiram: "விசாகம்",        graha: "குரு" },     avayogi: { natchathiram: "கார்த்திகை",     graha: "சூரியன்" } },
  "கண்டம்":     { yogi: { natchathiram: "அனுஷம்",        graha: "சனி" },      avayogi: { natchathiram: "ரோகிணி",         graha: "சந்திரன்" } },
  "விருத்தி":   { yogi: { natchathiram: "கேட்டை",        graha: "புதன்" },    avayogi: { natchathiram: "மிருகசீரிடம்",   graha: "செவ்வாய்" } },
  "துருவம்":    { yogi: { natchathiram: "மூலம்",          graha: "கேது" },     avayogi: { natchathiram: "திருவாதிரை",     graha: "ராகு" } },
  "வியாகாதம்":  { yogi: { natchathiram: "பூராடம்",        graha: "சுக்கிரன்" }, avayogi: { natchathiram: "புனர்பூசம்",    graha: "குரு" } },
  "அரிஷணம்":   { yogi: { natchathiram: "உத்திராடம்",     graha: "சூரியன்" },  avayogi: { natchathiram: "பூசம்",          graha: "சனி" } },
  "வச்சிரம்":   { yogi: { natchathiram: "திருவோணம்",     graha: "சந்திரன்" }, avayogi: { natchathiram: "ஆயில்யம்",       graha: "புதன்" } },
  "சித்தி":     { yogi: { natchathiram: "அவிட்டம்",      graha: "செவ்வாய்" }, avayogi: { natchathiram: "மகம்",           graha: "கேது" } },
  "வியிபாதம்":  { yogi: { natchathiram: "சதயம்",          graha: "ராகு" },     avayogi: { natchathiram: "பூரம்",          graha: "சுக்கிரன்" } },
  "வரியான்":    { yogi: { natchathiram: "பூரட்டாதி",      graha: "குரு" },     avayogi: { natchathiram: "உத்திரம்",       graha: "சூரியன்" } },
  "பரிகம்":     { yogi: { natchathiram: "உத்திரட்டாதி",  graha: "சனி" },      avayogi: { natchathiram: "ஹஸ்தம்",         graha: "சந்திரன்" } },
  "சிவம்":      { yogi: { natchathiram: "ரேவதி",          graha: "புதன்" },    avayogi: { natchathiram: "சித்திரை",       graha: "செவ்வாய்" } },
  "சித்தா":    { yogi: { natchathiram: "அசுவினி",        graha: "கேது" },     avayogi: { natchathiram: "சுவாதி",         graha: "ராகு" } },
  "சாத்தியம்":  { yogi: { natchathiram: "பரணி",           graha: "சுக்கிரன்" }, avayogi: { natchathiram: "விசாகம்",       graha: "குரு" } },
  "சுபம்":      { yogi: { natchathiram: "கார்த்திகை",    graha: "சூரியன்" },  avayogi: { natchathiram: "அனுஷம்",         graha: "சனி" } },
  "சுப்பிரம்":  { yogi: { natchathiram: "ரோகிணி",         graha: "சந்திரன்" }, avayogi: { natchathiram: "கேட்டை",        graha: "புதன்" } },
  "பிரம்மம்":   { yogi: { natchathiram: "மிருகசீரிடம்",  graha: "செவ்வாய்" }, avayogi: { natchathiram: "மூலம்",          graha: "கேது" } },
  "ஐந்திரம்":   { yogi: { natchathiram: "திருவாதிரை",    graha: "ராகு" },     avayogi: { natchathiram: "பூராடம்",        graha: "சுக்கிரன்" } },
  "வைதிருதி":   { yogi: { natchathiram: "புனர்பூசம்",    graha: "குரு" },     avayogi: { natchathiram: "உத்திராடம்",     graha: "சூரியன்" } },
};

function getYogaPalan(yoga) {
  return YOGA_PALAN[yoga?.trim()] ?? null;
}

export { YOGA_PALAN, getYogaPalan };
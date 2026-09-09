// lib/astrology/natchathira-nama-ezhuthukal.js
// நட்சத்திர பெயர் எழுத்துக்கள் (Natchathira Nama Ezhuthukal)
// Starting syllables for names based on birth star
// Source: Traditional Vedic Astrology Tamil reference

const NATCHATHIRA_NAMA_EZHUTHUKAL = {
  "அசுவினி":       { ezhuthukal: ["க", "சே", "சோ", "ல"] },
  "பரணி":          { ezhuthukal: ["லி", "லு", "லே", "லோ"] },
  "கிருத்திகை":    { ezhuthukal: ["அ", "இ", "உ", "எ"] },
  "ரோகிணி":        { ezhuthukal: ["ஓ", "வ", "வி", "வு"] },
  "மிருகசீரிடம்":  { ezhuthukal: ["வே", "வோ", "கா", "கி"] },
  "திருவாதிரை":    { ezhuthukal: ["கு", "க", "ஞ", "ச"] },
  "புனர்பூசம்":    { ezhuthukal: ["கே", "கோ", "ஹ", "ஹி"] },
  "பூசம்":         { ezhuthukal: ["ஹு", "ஹே", "ஹோ", "ட"] },
  "ஆயில்யம்":      { ezhuthukal: ["டி", "டு", "டே", "டோ"] },
  "மகம்":          { ezhuthukal: ["ம", "மி", "மு", "மே"] },
  "பூரம்":         { ezhuthukal: ["மோ", "ட", "டி", "டு"] },
  "உத்திரம்":      { ezhuthukal: ["டே", "டோ", "ப", "பி"] },
  "அஸ்தம்":        { ezhuthukal: ["பூ", "ஷ", "ந", "ட"] },
  "சித்திரை":      { ezhuthukal: ["பே", "போ", "ர", "ரி"] },
  "சுவாதி":        { ezhuthukal: ["ரு", "ரே", "ரோ", "த"] },
  "விசாகம்":       { ezhuthukal: ["தி", "து", "தே", "தோ"] },
  "அனுஷம்":        { ezhuthukal: ["ந", "நி", "நு", "நே"] },
  "கேட்டை":        { ezhuthukal: ["நோ", "ய", "இ", "பூ"] },
  "மூலம்":         { ezhuthukal: ["யே", "யோ", "ப", "பி"] },
  "பூராடம்":       { ezhuthukal: ["பூ", "த", "ப", "டா"] },
  "உத்திராடம்":    { ezhuthukal: ["பே", "போ", "ஜ", "ஜி"] },
  "திருவோணம்":     { ezhuthukal: ["ஜூ", "ஜே", "ஜோ", "கா"] },
  "அவிட்டம்":      { ezhuthukal: ["க", "கீ", "கு", "கூ"] },
  "சதயம்":         { ezhuthukal: ["கோ", "ஸ", "ஸீ", "ஸூ"] },
  "பூரட்டாதி":     { ezhuthukal: ["ஸே", "ஸோ", "தா", "தீ"] },
  "உத்திரட்டாதி":  { ezhuthukal: ["து", "ச", "ஸ்ரீ", "ஞ"] },
  "ரேவதி":         { ezhuthukal: ["தே", "தோ", "ச", "சி"] },
};

function getNatchathiraEzhuthukal(natchathiram) {
  return NATCHATHIRA_NAMA_EZHUTHUKAL[natchathiram?.trim()] ?? null;
}

export { NATCHATHIRA_NAMA_EZHUTHUKAL, getNatchathiraEzhuthukal };
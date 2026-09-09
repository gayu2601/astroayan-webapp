// lib/astrology/natchathira-pakshi.js
// நட்சத்திர பட்சி (Natchathira Pakshi) - Birth star bird by lunar phase
// Source: Traditional Vedic Astrology Tamil reference

const NATCHATHIRA_PAKSHI = {
  வளர்பிறை: {
    "அசுவினி":    { pakshi: "வல்லூறு" },
    "பரணி":       { pakshi: "வல்லூறு" },
    "கார்த்திகை": { pakshi: "வல்லூறு" },
    "ரோகிணி":     { pakshi: "வல்லூறு" },
    "மிருகசீரிஷம்": { pakshi: "வல்லூறு" },

    "திருவாதிரை": { pakshi: "ஆந்தை" },
    "புனர்பூசம்":  { pakshi: "ஆந்தை" },
    "பூசம்":       { pakshi: "ஆந்தை" },
    "ஆயில்யம்":   { pakshi: "ஆந்தை" },
    "மகம்":        { pakshi: "ஆந்தை" },
    "பூரம்":       { pakshi: "ஆந்தை" },

    "உத்திரம்":   { pakshi: "காகம்" },
    "அஸ்தம்":     { pakshi: "காகம்" },
    "சித்திரை":   { pakshi: "காகம்" },
    "சுவாதி":     { pakshi: "காகம்" },
    "விசாகம்":    { pakshi: "காகம்" },

    "அனுஷம்":     { pakshi: "கோழி" },
    "கேட்டை":     { pakshi: "கோழி" },
    "மூலம்":      { pakshi: "கோழி" },
    "பூராடம்":    { pakshi: "கோழி" },
    "உத்திராடம்": { pakshi: "கோழி" },

    "திருவோணம்":    { pakshi: "மயில்" },
    "அவிட்டம்":     { pakshi: "மயில்" },
    "சதயம்":        { pakshi: "மயில்" },
    "பூரட்டாதி":    { pakshi: "மயில்" },
    "உத்திரட்டாதி": { pakshi: "மயில்" },
    "ரேவதி":        { pakshi: "மயில்" },
  },

  தேய்பிறை: {
    "அசுவினி":    { pakshi: "மயில்" },
    "பரணி":       { pakshi: "மயில்" },
    "கார்த்திகை": { pakshi: "மயில்" },
    "ரோகிணி":     { pakshi: "மயில்" },
    "மிருகசீரிஷம்": { pakshi: "மயில்" },

    "திருவாதிரை": { pakshi: "கோழி" },
    "புனர்பூசம்":  { pakshi: "கோழி" },
    "பூசம்":       { pakshi: "கோழி" },
    "ஆயில்யம்":   { pakshi: "கோழி" },
    "மகம்":        { pakshi: "கோழி" },
    "பூரம்":       { pakshi: "கோழி" },

    "உத்திரம்":   { pakshi: "காகம்" },
    "அஸ்தம்":     { pakshi: "காகம்" },
    "சித்திரை":   { pakshi: "காகம்" },
    "சுவாதி":     { pakshi: "காகம்" },
    "விசாகம்":    { pakshi: "காகம்" },

    "அனுஷம்":     { pakshi: "ஆந்தை" },
    "கேட்டை":     { pakshi: "ஆந்தை" },
    "மூலம்":      { pakshi: "ஆந்தை" },
    "பூராடம்":    { pakshi: "ஆந்தை" },
    "உத்திராடம்": { pakshi: "ஆந்தை" },

    "திருவோணம்":    { pakshi: "வல்லூறு" },
    "அவிட்டம்":     { pakshi: "வல்லூறு" },
    "சதயம்":        { pakshi: "வல்லூறு" },
    "பூரட்டாதி":    { pakshi: "வல்லூறு" },
    "உத்திரட்டாதி": { pakshi: "வல்லூறு" },
    "ரேவதி":        { pakshi: "வல்லூறு" },
  },
};

// lunarPhase: "வளர்பிறை" | "தேய்பிறை"
function getNatchathiraPakshi(natchathiram, lunarPhase) {
  return NATCHATHIRA_PAKSHI[lunarPhase]?.[natchathiram?.trim()] ?? null;
}

export { NATCHATHIRA_PAKSHI, getNatchathiraPakshi };
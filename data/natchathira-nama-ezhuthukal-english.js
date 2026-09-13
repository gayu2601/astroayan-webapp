// lib/astrology/natchathira-nama-ezhuthukal-english.js
// Natchathira Nama Ezhuthukal (English transliteration)
// Starting syllables for names based on birth star (Nakshatra)
// English transliteration of natchathira-nama-ezhuthukal.js

const NATCHATHIRA_NAMA_EZHUTHUKAL_EN = {
  "Ashwini":        { ezhuthukal: ["Ka", "Che", "Cho", "La"] },
  "Bharani":        { ezhuthukal: ["Li", "Lu", "Le", "Lo"] },
  "Krithigai":      { ezhuthukal: ["A", "I", "U", "E"] },
  "Rohini":         { ezhuthukal: ["O", "Va", "Vi", "Vu"] },
  "Mrigasheersham": { ezhuthukal: ["Ve", "Vo", "Kaa", "Ki"] },
  "Thiruvathirai":  { ezhuthukal: ["Ku", "Ka", "Nga", "Sa"] },
  "Punarpoosam":    { ezhuthukal: ["Ke", "Ko", "Ha", "Hi"] },
  "Poosam":         { ezhuthukal: ["Hu", "He", "Ho", "Da"] },
  "Ayilyam":        { ezhuthukal: ["Di", "Du", "De", "Do"] },
  "Magam":          { ezhuthukal: ["Ma", "Mi", "Mu", "Me"] },
  "Pooram":         { ezhuthukal: ["Mo", "Ta", "Ti", "Tu"] },
  "Uthiram":        { ezhuthukal: ["Te", "To", "Pa", "Pi"] },
  "Astham":         { ezhuthukal: ["Poo", "Sha", "Na", "Ta"] },
  "Chithirai":      { ezhuthukal: ["Pe", "Po", "Ra", "Ri"] },
  "Swathi":         { ezhuthukal: ["Ru", "Re", "Ro", "Tha"] },
  "Visakam":        { ezhuthukal: ["Thi", "Thu", "The", "Tho"] },
  "Anusham":        { ezhuthukal: ["Na", "Ni", "Nu", "Ne"] },
  "Kettai":         { ezhuthukal: ["No", "Ya", "I", "Poo"] },
  "Moolam":         { ezhuthukal: ["Ye", "Yo", "Pa", "Pi"] },
  "Pooradam":       { ezhuthukal: ["Poo", "Tha", "Pa", "Daa"] },
  "Uthiradam":      { ezhuthukal: ["Pe", "Po", "Ja", "Ji"] },
  "Thiruvonam":     { ezhuthukal: ["Ju", "Je", "Jo", "Kaa"] },
  "Avittam":        { ezhuthukal: ["Ka", "Kee", "Ku", "Koo"] },
  "Sathayam":       { ezhuthukal: ["Ko", "Sa", "See", "Soo"] },
  "Poorattathi":    { ezhuthukal: ["Se", "So", "Thaa", "Thee"] },
  "Uthirattathi":   { ezhuthukal: ["Thu", "Sa", "Sri", "Nya"] },
  "Revathi":        { ezhuthukal: ["The", "Tho", "Sa", "Si"] },
};

function getNatchathiraEzhuthukalEn(natchathiram) {
  return NATCHATHIRA_NAMA_EZHUTHUKAL_EN[natchathiram?.trim()] ?? null;
}

export { NATCHATHIRA_NAMA_EZHUTHUKAL_EN, getNatchathiraEzhuthukalEn };
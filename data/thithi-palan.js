// lib/astrology/thithi-palan.js
// Thithi Palan (திதி பலன்கள்) - Lunar day results
// Source: Traditional Vedic Astrology Tamil reference

const THITHI_PALAN = {
  "பிரதமை": {
    number: 1,
    englishName: "Prathama",
    palan: "எதையும் சாதிக்கும் மன உறுதி, சுகபோக வாழ்க்கை.",
  },
  "துவிதியை": {
    number: 2,
    englishName: "Dwithiya",
    palan: "சாந்த குணம், நேர்மை, அன்பான சுபாவம்.",
  },
  "திருதியை": {
    number: 3,
    englishName: "Thrithiya",
    palan: "செல்வச் செழிப்பு, கலைகளில் ஈடுபாடு மற்றும் அதிர்ஷ்டம்.",
  },
  "சதுர்த்தி": {
    number: 4,
    englishName: "Chaturthi",
    palan:
      "தடைகளைத் தகர்க்கும் வீரம், சற்று முன்கோபம் மற்றும் ரகசியமான செயல்பாடுகள்.",
  },
  "பஞ்சமி": {
    number: 5,
    englishName: "Panchami",
    palan: "அபார அறிவாற்றல், வியாபாரத் திறமை, நீண்ட ஆயுள்.",
  },
  "சஷ்டி": {
    number: 6,
    englishName: "Shashti",
    palan: "வீரம், நிர்வாகத் திறன், ஆன்மீக ஈடுபாடு.",
  },
  "சப்தமி": {
    number: 7,
    englishName: "Saptami",
    palan: "சமூக சேவை மனப்பான்மை, புகழ், செல்வச் செழிப்பு.",
  },
  "அஷ்டமி": {
    number: 8,
    englishName: "Ashtami",
    palan: "சிறந்த பேச்சாற்றல், ஆன்மீகத் தேடல் மற்றும் போராடும் குணம்.",
  },
  "நவமி": {
    number: 9,
    englishName: "Navami",
    palan: "தைரியம், தலைவன் ஆகும் திறன், தெய்வ பக்தி.",
  },
  "தசமி": {
    number: 10,
    englishName: "Dashami",
    palan:
      "தர்ம சிந்தனை, சட்ட அறிவு, தொழில் மற்றும் வியாபாரத்தில் செல்வம் ஈட்டுதல்.",
  },
  "ஏகாதசி": {
    number: 11,
    englishName: "Ekadashi",
    palan: "மிகுந்த இறைபக்தி, ஒழுக்கமான வாழ்வு மற்றும் நற்பெயர்.",
  },
  "துவாதசி": {
    number: 12,
    englishName: "Dwadashi",
    palan: "சாத்வீக குணம், அமைதியான சுபாவம், தான-தர்மங்களில் ஈடுபாடு.",
  },
  "திரயோதசி": {
    number: 13,
    englishName: "Thrayodasi",
    palan:
      "வசதியான வாழ்க்கை, ஆடை ஆபரணம் சேர்தல் மற்றும் நட்பு பாராட்டுதல்.",
  },
  "சதுர்த்தசி": {
    number: 14,
    englishName: "Chaturdasi",
    palan:
      "கடின உழைப்பு, சவால்களைச் சந்திக்கும் மன உறுதி மற்றும் ஆன்மீக முதிர்ச்சி.",
  },
  "பௌர்ணமி": {
    number: 15,
    englishName: "Pournami",
    palan: "தெளிவான மனநிலை, மாபெரும் செல்வாக்கு மற்றும் ராஜ யோகம்.",
  },
  "அமாவாசை": {
    number: 16,
    englishName: "Amavasai",
    palan: "தெளிவான மனநிலை, மாபெரும் செல்வாக்கு மற்றும் ராஜ யோகம்.",
  },
};

function getThithiPalan(thithiName) {
  return THITHI_PALAN[thithiName?.trim()] ?? null;
}

export { THITHI_PALAN, getThithiPalan };
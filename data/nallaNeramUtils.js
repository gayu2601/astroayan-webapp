export function computeNallaNeram(sunriseStr, jsWeekday) {
	console.log('in computeNallaNeram', sunriseStr, jsWeekday)
  function parseTime(str) {
	  if (!str) return null;
	  
	  // Extract the first HH:MM pattern found anywhere in the string
	  // Handles Tamil strings like "அதிகாலை 5:45 மணி"
	  const match = str.match(/(\d{1,2}):(\d{2})/);
	  if (!match) return null;
	  
	  const h = parseInt(match[1], 10);
	  const m = parseInt(match[2], 10);
	  if (isNaN(h) || isNaN(m)) return null;
	  
	  const isPM = /PM/i.test(str);
	  const hours = isPM && h !== 12 ? h + 12 : (!isPM && h === 12 ? 0 : h);
	  return hours * 60 + m;
	}

  function fmtMin(mins) {
    const total = ((Math.round(mins) % 1440) + 1440) % 1440;
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${h}:${String(m).padStart(2, '0')}`;
  }

  const rise = parseTime(sunriseStr);
  if (rise == null) return null;

  // Round sunrise to nearest 30 min — verified: 5:53 → 6:00
  const base = Math.round(rise / 30) * 30;

  // Verified slot table from tamildailycalendar.com
  // [nallaMorningSlot, nallaEveningSlot, gowriMorningSlot, gowriEveningSlot]
  const SLOTS = {
    0: [4,  8, 6, 10], // Sunday
    1: [6,  2, 8,  4], // Monday
    2: [2,  6, 4,  8], // Tuesday  ✓ verified
    3: [3,  7, 4,  8], // Wednesday ✓ verified
    4: [5,  1, 7,  3], // Thursday
    5: [1,  5, 3,  7], // Friday
    6: [4,  8, 6, 10], // Saturday
  };

  const slot = (n) => {
	  console.log('in start', n)
    const start = base + (n - 1) * 90;
	console.log('start', start)
	console.log(`${fmtMin(start)} – ${fmtMin(start + 90)}`)
    return `${fmtMin(start)} – ${fmtMin(start + 90)}`;
  };

  const [nM, nE, gM, gE] = SLOTS[jsWeekday] || SLOTS[0];

  return {
    nallaMorning: slot(nM),
    nallaEvening: slot(nE),
    gowriMorning: slot(gM),
    gowriEvening: slot(gE),
  };
}

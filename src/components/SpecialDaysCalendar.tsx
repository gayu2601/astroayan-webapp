import { useMemo, useState } from "react";

export type YearKey = "2026" | "2027";

export interface AmavasaiRow {
  dateTa: string;
  dateEn: string;
  dayTa: string;
  dayEn: string;
  startTa: string;
  startEn: string;
  endTa: string;
  endEn: string;
}

export interface PournamiRow {
  dateTa: string;
  dateEn: string;
  tamilDateTa: string;
  tamilDateEn: string;
  timingTa: string;
  timingEn: string;
}

export interface KrithigaiRow {
  monthTa: string;
  monthEn: string;
  dateTa: string;
  dateEn: string;
  dayTa: string;
  dayEn: string;
}

export interface ChandrashtamaRow {
  monthTa: string;
  monthEn: string;
  startTa: string;
  startEn: string;
  endTa: string;
  endEn: string;
}

export interface AshtamiNavamiRow {
  monthTa: string;
  monthEn: string;
  ashtami: string;
  navamiTa: string;
  navamiEn: string;
}

/* ----------------------------- DATA ------------------------------------- */

const AMAVASAI: Record<YearKey, AmavasaiRow[]> = {
  "2026": [
    {
      dateTa: "ஜனவரி 18",
      dateEn: "January 18",
      dayTa: "ஞாயிறு",
      dayEn: "Sunday",
      startTa: "ஜனவரி 17, இரவு 09:21",
      startEn: "Jan 17, 09:21 PM",
      endTa: "ஜனவரி 18, இரவு 08:35",
      endEn: "Jan 18, 08:35 PM",
    },
    {
      dateTa: "பிப்ரவரி 17",
      dateEn: "February 17",
      dayTa: "செவ்வாய்",
      dayEn: "Tuesday",
      startTa: "பிப்ரவரி 16, காலை 06:17",
      startEn: "Feb 16, 06:17 AM",
      endTa: "பிப்ரவரி 17, காலை 05:32",
      endEn: "Feb 17, 05:32 AM",
    },
    {
      dateTa: "மார்ச் 18",
      dateEn: "March 18",
      dayTa: "புதன்",
      dayEn: "Wednesday",
      startTa: "மார்ச் 17, மாலை 04:45",
      startEn: "Mar 17, 04:45 PM",
      endTa: "மார்ச் 18, மாலை 03:52",
      endEn: "Mar 18, 03:52 PM",
    },
    {
      dateTa: "ஏப்ரல் 17",
      dateEn: "April 17",
      dayTa: "வெள்ளி",
      dayEn: "Friday",
      startTa: "ஏப்ரல் 16, இரவு 03:32",
      startEn: "Apr 16, 03:32 AM",
      endTa: "ஏப்ரல் 17, மாலை 02:47",
      endEn: "Apr 17, 02:47 PM",
    },
    {
      dateTa: "மே 16",
      dateEn: "May 16",
      dayTa: "சனி",
      dayEn: "Saturday",
      startTa: "மே 15, மதியம் 01:21",
      startEn: "May 15, 01:21 PM",
      endTa: "மே 16, மதியம் 12:15",
      endEn: "May 16, 12:15 PM",
    },
    {
      dateTa: "ஜூன் 14",
      dateEn: "June 14",
      dayTa: "ஞாயிறு",
      dayEn: "Sunday",
      startTa: "ஜூன் 13, இரவு 10:45",
      startEn: "Jun 13, 10:45 PM",
      endTa: "ஜூன் 14, இரவு 09:50",
      endEn: "Jun 14, 09:50 PM",
    },
    {
      dateTa: "ஜூலை 14",
      dateEn: "July 14",
      dayTa: "செவ்வாய்",
      dayEn: "Tuesday",
      startTa: "ஜூலை 13, காலை 07:55",
      startEn: "Jul 13, 07:55 AM",
      endTa: "ஜூலை 14, காலை 07:05",
      endEn: "Jul 14, 07:05 AM",
    },
    {
      dateTa: "ஆகஸ்ட் 12 (ஆடி அமாவாசை)",
      dateEn: "August 12 (Aadi Amavasai)",
      dayTa: "புதன்",
      dayEn: "Wednesday",
      startTa: "ஆகஸ்ட் 11, மாலை 04:30",
      startEn: "Aug 11, 04:30 PM",
      endTa: "ஆகஸ்ட் 12, மாலை 03:40",
      endEn: "Aug 12, 03:40 PM",
    },
    {
      dateTa: "செப்டம்பர் 10",
      dateEn: "September 10",
      dayTa: "வியாழன்",
      dayEn: "Thursday",
      startTa: "செப். 09, இரவு 11:20",
      startEn: "Sep 09, 11:20 PM",
      endTa: "செப். 10, காலை 09:30",
      endEn: "Sep 10, 09:30 AM",
    },
    {
      dateTa: "அக்டோபர் 10 (மஹாளய அமாவாசை)",
      dateEn: "October 10 (Mahalaya Amavasai)",
      dayTa: "சனி",
      dayEn: "Saturday",
      startTa: "அக். 09, இரவு 09:46",
      startEn: "Oct 09, 09:46 PM",
      endTa: "அக். 10, இரவு 09:27",
      endEn: "Oct 10, 09:27 PM",
    },
    {
      dateTa: "நவம்பர் 8 (தீபாவளி அமாவாசை)",
      dateEn: "November 8 (Deepavali Amavasai)",
      dayTa: "ஞாயிறு",
      dayEn: "Sunday",
      startTa: "நவம். 08, காலை 11:46",
      startEn: "Nov 08, 11:46 AM",
      endTa: "நவம். 09, மதியம் 12:32",
      endEn: "Nov 09, 12:32 PM",
    },
    {
      dateTa: "டிசம்பர் 8",
      dateEn: "December 8",
      dayTa: "செவ்வாய்",
      dayEn: "Tuesday",
      startTa: "டிச. 08, அதிகாலை 04:44",
      startEn: "Dec 08, 04:44 AM",
      endTa: "டிச. 09, காலை 06:26",
      endEn: "Dec 09, 06:26 AM",
    },
  ],
  "2027": [
    {
      dateTa: "ஜனவரி 7",
      dateEn: "January 7",
      dayTa: "வியாழன்",
      dayEn: "Thursday",
      startTa: "ஜனவரி 06, இரவு 12:00",
      startEn: "Jan 06, 12:00 AM",
      endTa: "ஜனவரி 07, அதிகாலை 01:54",
      endEn: "Jan 07, 01:54 AM",
    },
    {
      dateTa: "பிப்ரவரி 6 (தை அமாவாசை)",
      dateEn: "February 6 (Thai Amavasai)",
      dayTa: "சனி",
      dayEn: "Saturday",
      startTa: "பிப். 05, இரவு 07:48",
      startEn: "Feb 05, 07:48 PM",
      endTa: "பிப். 06, இரவு 09:39",
      endEn: "Feb 06, 09:39 PM",
    },
    {
      dateTa: "மார்ச் 8",
      dateEn: "March 8",
      dayTa: "திங்கள்",
      dayEn: "Monday",
      startTa: "மார்ச் 07, மதியம் 02:08",
      startEn: "Mar 07, 02:08 PM",
      endTa: "மார்ச் 08, மதியம் 02:59",
      endEn: "Mar 08, 02:59 PM",
    },
    {
      dateTa: "ஏப்ரல் 6",
      dateEn: "April 6",
      dayTa: "செவ்வாய்",
      dayEn: "Tuesday",
      startTa: "ஏப்ரல் 05, இரவு 10:15",
      startEn: "Apr 05, 10:15 PM",
      endTa: "ஏப்ரல் 06, அதிகாலை 05:21",
      endEn: "Apr 06, 05:21 AM",
    },
    {
      dateTa: "மே 6",
      dateEn: "May 6",
      dayTa: "வியாழன்",
      dayEn: "Thursday",
      startTa: "மே 05, மாலை 06:16",
      startEn: "May 05, 06:16 PM",
      endTa: "மே 06, மாலை 04:28",
      endEn: "May 06, 04:28 PM",
    },
    {
      dateTa: "ஜூன் 4",
      dateEn: "June 4",
      dayTa: "வெள்ளி",
      dayEn: "Friday",
      startTa: "ஜூன் 04, அதிகாலை 04:02",
      startEn: "Jun 04, 04:02 AM",
      endTa: "ஜூன் 05, அதிகாலை 01:10",
      endEn: "Jun 05, 01:10 AM",
    },
    {
      dateTa: "ஜூலை 4",
      dateEn: "July 4",
      dayTa: "ஞாயிறு",
      dayEn: "Sunday",
      startTa: "ஜூலை 03, மதியம் 12:00",
      startEn: "Jul 03, 12:00 PM",
      endTa: "ஜூலை 04, காலை 08:32",
      endEn: "Jul 04, 08:32 AM",
    },
    {
      dateTa: "ஆகஸ்ட் 2 (ஆடி அமாவாசை)",
      dateEn: "August 2 (Aadi Amavasai)",
      dayTa: "திங்கள்",
      dayEn: "Monday",
      startTa: "ஆகஸ்ட் 01, மாலை 07:05",
      startEn: "Aug 01, 07:05 PM",
      endTa: "ஆகஸ்ட் 02, மாலை 03:34",
      endEn: "Aug 02, 03:34 PM",
    },
    {
      dateTa: "ஆகஸ்ட் 31",
      dateEn: "August 31",
      dayTa: "செவ்வாய்",
      dayEn: "Tuesday",
      startTa: "ஆகஸ்ட் 31, அதிகாலை 02:13",
      startEn: "Aug 31, 02:13 AM",
      endTa: "ஆகஸ்ட் 31, இரவு 11:56",
      endEn: "Aug 31, 11:56 PM",
    },
    {
      dateTa: "செப்டம்பர் 30 (மஹாளய அமாவாசை)",
      dateEn: "September 30 (Mahalaya Amavasai)",
      dayTa: "வியாழன்",
      dayEn: "Thursday",
      startTa: "செப். 29, காலை 10:34",
      startEn: "Sep 29, 10:34 AM",
      endTa: "செப். 30, காலை 08:06",
      endEn: "Sep 30, 08:06 AM",
    },
    {
      dateTa: "அக்டோபர் 29 (தீபாவளி அமாவாசை)",
      dateEn: "October 29 (Deepavali Amavasai)",
      dayTa: "வெள்ளி",
      dayEn: "Friday",
      startTa: "அக். 28, மாலை 09:10",
      startEn: "Oct 28, 09:10 PM",
      endTa: "அக். 29, மாலை 07:06",
      endEn: "Oct 29, 07:06 PM",
    },
    {
      dateTa: "நவம்பர் 28",
      dateEn: "November 28",
      dayTa: "ஞாயிறு",
      dayEn: "Sunday",
      startTa: "நவம். 27, காலை 10:15",
      startEn: "Nov 27, 10:15 AM",
      endTa: "நவம். 28, காலை 08:54",
      endEn: "Nov 28, 08:54 AM",
    },
    {
      dateTa: "டிசம்பர் 27",
      dateEn: "December 27",
      dayTa: "திங்கள்",
      dayEn: "Monday",
      startTa: "டிச. 26, இரவு 11:20",
      startEn: "Dec 26, 11:20 PM",
      endTa: "டிச. 27, அதிகாலை 01:42",
      endEn: "Dec 27, 01:42 AM",
    },
  ],
};

const POURNAMI: Record<YearKey, PournamiRow[]> = {
  "2026": [
    {
      dateTa: "செப்டம்பர் 26, 2026 (சனி)",
      dateEn: "September 26, 2026 (Sat)",
      tamilDateTa: "புரட்டாசி 09",
      tamilDateEn: "Purattasi 09",
      timingTa: "செப் 25, இரவு 11:08 முதல் செப் 26, இரவு 10:45 வரை",
      timingEn: "Sep 25, 11:08 PM to Sep 26, 10:45 PM",
    },
    {
      dateTa: "அக்டோபர் 25, 2026 (ஞாயிறு)",
      dateEn: "October 25, 2026 (Sun)",
      tamilDateTa: "ஐப்பசி 08",
      tamilDateEn: "Aippasi 08",
      timingTa: "அக் 25, பகல் 11:28 முதல் அக் 26, காலை 10:13 வரை",
      timingEn: "Oct 25, 11:28 AM to Oct 26, 10:13 AM",
    },
    {
      dateTa: "நவம்பர் 24, 2026 (செவ்வாய்)",
      dateEn: "November 24, 2026 (Tue)",
      tamilDateTa: "கார்த்திகை 08",
      tamilDateEn: "Karthigai 08",
      timingTa: "நவ் 23, இரவு 11:02 முதல் நவ் 24, இரவு 09:07 வரை",
      timingEn: "Nov 23, 11:02 PM to Nov 24, 09:07 PM",
    },
    {
      dateTa: "டிசம்பர் 23, 2026 (புதன்)",
      dateEn: "December 23, 2026 (Wed)",
      tamilDateTa: "மார்கழி 08",
      tamilDateEn: "Margazhi 08",
      timingTa: "டிச 23, காலை 09:58 முதல் டிச 24, காலை 07:42 வரை",
      timingEn: "Dec 23, 09:58 AM to Dec 24, 07:42 AM",
    },
  ],
  "2027": [
    {
      dateTa: "ஜனவரி 22, 2027 (வெள்ளி)",
      dateEn: "January 22, 2027 (Fri)",
      tamilDateTa: "தை 08",
      tamilDateEn: "Thai 08",
      timingTa: "ஜன 21, இரவு 08:37 முதல் ஜன 22, மாலை 06:19 வரை",
      timingEn: "Jan 21, 08:37 PM to Jan 22, 06:19 PM",
    },
    {
      dateTa: "பிப்ரவரி 20, 2027 (சனி)",
      dateEn: "February 20, 2027 (Sat)",
      tamilDateTa: "மாசி 18",
      tamilDateEn: "Masi 18",
      timingTa: "பிப் 20, காலை 07:09 முதல் பிப் 21, அதிகாலை 05:07 வரை",
      timingEn: "Feb 20, 07:09 AM to Feb 21, 05:07 AM",
    },
    {
      dateTa: "மார்ச் 22, 2027 (திங்கள்)",
      dateEn: "March 22, 2027 (Mon)",
      tamilDateTa: "பங்குனி 08",
      tamilDateEn: "Panguni 08",
      timingTa: "மார்ச் 21, மாலை 05:50 முதல் மார்ச் 22, மாலை 04:23 வரை",
      timingEn: "Mar 21, 05:50 PM to Mar 22, 04:23 PM",
    },
    {
      dateTa: "ஏப்ரல் 20, 2027 (செவ்வாய்)",
      dateEn: "April 20, 2027 (Tue)",
      tamilDateTa: "சித்திரை 07 (சித்ரா பௌர்ணமி)",
      tamilDateEn: "Chithirai 07 (Chitra Pournami)",
      timingTa: "ஏப் 20, அதிகாலை 04:56 முதல் ஏப் 21, அதிகாலை 04:20 வரை",
      timingEn: "Apr 20, 04:56 AM to Apr 21, 04:20 AM",
    },
    {
      dateTa: "மே 20, 2027 (வியாழன்)",
      dateEn: "May 20, 2027 (Thu)",
      tamilDateTa: "வைகாசி 06",
      tamilDateEn: "Vaikasi 06",
      timingTa: "மே 19, மாலை 04:52 முதல் மே 20, மாலை 05:12 வரை",
      timingEn: "May 19, 04:52 PM to May 20, 05:12 PM",
    },
    {
      dateTa: "ஜூன் 18, 2027 (வெள்ளி)",
      dateEn: "June 18, 2027 (Fri)",
      tamilDateTa: "ஆனி 04",
      tamilDateEn: "Aani 04",
      timingTa: "ஜூன் 18, காலை 05:50 முதல் ஜூன் 19, காலை 07:07 வரை",
      timingEn: "Jun 18, 05:50 AM to Jun 19, 07:07 AM",
    },
    {
      dateTa: "ஜூலை 18, 2027 (ஞாயிறு)",
      dateEn: "July 18, 2027 (Sun)",
      tamilDateTa: "ஆடி 02",
      tamilDateEn: "Aadi 02",
      timingTa: "ஜூலை 17, இரவு 08:12 முதல் ஜூலை 18, இரவு 10:02 வரை",
      timingEn: "Jul 17, 08:12 PM to Jul 18, 10:02 PM",
    },
    {
      dateTa: "ஆகஸ்ட் 17, 2027 (செவ்வாய்)",
      dateEn: "August 17, 2027 (Tue)",
      tamilDateTa: "ஆவணி 01",
      tamilDateEn: "Aavani 01",
      timingTa: "ஆகஸ்ட் 16, பகல் 11:30 முதல் ஆகஸ்ட் 17, பிற்பகல் 01:26 வரை",
      timingEn: "Aug 16, 11:30 AM to Aug 17, 01:26 PM",
    },
    {
      dateTa: "செப்டம்பர் 15, 2027 (புதன்)",
      dateEn: "September 15, 2027 (Wed)",
      tamilDateTa: "ஆவணி 30",
      tamilDateEn: "Aavani 30",
      timingTa: "செப் 15, அதிகாலை 03:28 முதல் செப் 16, அதிகாலை 04:58 வரை",
      timingEn: "Sep 15, 03:28 AM to Sep 16, 04:58 AM",
    },
    {
      dateTa: "அக்டோபர் 15, 2027 (வெள்ளி)",
      dateEn: "October 15, 2027 (Fri)",
      tamilDateTa: "புரட்டாசி 29",
      tamilDateEn: "Purattasi 29",
      timingTa: "அக் 14, மாலை 07:07 முதல் அக் 15, இரவு 07:43 வரை",
      timingEn: "Oct 14, 07:07 PM to Oct 15, 07:43 PM",
    },
    {
      dateTa: "நவம்பர் 13, 2027 (சனி)",
      dateEn: "November 13, 2027 (Sat)",
      tamilDateTa: "ஐப்பசி 27",
      tamilDateEn: "Aippasi 27",
      timingTa: "நவ் 13 அன்று முழுமையாக அமைகிறது",
      timingEn: "Entire day of Nov 13",
    },
    {
      dateTa: "டிசம்பர் 13, 2027 (திங்கள்)",
      dateEn: "December 13, 2027 (Mon)",
      tamilDateTa: "கார்த்திகை 27",
      tamilDateEn: "Karthigai 27",
      timingTa: "டிச 13 அன்று முழு நிலவு திதி அமைகிறது",
      timingEn: "Full Moon tithi prevails on Dec 13",
    },
  ],
};

const KRITHIGAI: Record<YearKey, KrithigaiRow[]> = {
  "2026": [
    { monthTa: "ஜனவரி", monthEn: "January", dateTa: "ஜனவரி 27, 2026", dateEn: "January 27, 2026", dayTa: "செவ்வாய்க்கிழமை", dayEn: "Tuesday" },
    { monthTa: "பிப்ரவரி", monthEn: "February", dateTa: "பிப்ரவரி 23 & 24, 2026", dateEn: "February 23 & 24, 2026", dayTa: "திங்கள் & செவ்வாய்", dayEn: "Monday & Tuesday" },
    { monthTa: "மார்ச்", monthEn: "March", dateTa: "மார்ச் 23, 2026", dateEn: "March 23, 2026", dayTa: "திங்கட்கிழமை", dayEn: "Monday" },
    { monthTa: "ஏப்ரல்", monthEn: "April", dateTa: "ஏப்ரல் 19, 2026", dateEn: "April 19, 2026", dayTa: "ஞாயிற்றுக்கிழமை", dayEn: "Sunday" },
    { monthTa: "மே", monthEn: "May", dateTa: "மே 16, 2026", dateEn: "May 16, 2026", dayTa: "சனிக்கிழமை", dayEn: "Saturday" },
    { monthTa: "ஜூன்", monthEn: "June", dateTa: "ஜூன் 13, 2026", dateEn: "June 13, 2026", dayTa: "சனிக்கிழமை", dayEn: "Saturday" },
    { monthTa: "ஜூலை", monthEn: "July", dateTa: "ஜூலை 10, 2026", dateEn: "July 10, 2026", dayTa: "வெள்ளிக்கிழமை", dayEn: "Friday" },
    { monthTa: "ஆகஸ்ட்", monthEn: "August", dateTa: "ஆகஸ்ட் 06, 2026", dateEn: "August 06, 2026", dayTa: "வியாழக்கிழமை", dayEn: "Thursday" },
    { monthTa: "செப்டம்பர்", monthEn: "September", dateTa: "செப்டம்பர் 03 & 30, 2026", dateEn: "September 03 & 30, 2026", dayTa: "வியாழன் & புதன்", dayEn: "Thursday & Wednesday" },
    { monthTa: "அக்டோபர்", monthEn: "October", dateTa: "அக்டோபர் 27, 2026", dateEn: "October 27, 2026", dayTa: "செவ்வாய்க்கிழமை", dayEn: "Tuesday" },
    { monthTa: "நவம்பர்", monthEn: "November", dateTa: "நவம்பர் 24, 2026", dateEn: "November 24, 2026", dayTa: "செவ்வாய்க்கிழமை", dayEn: "Tuesday" },
    { monthTa: "டிசம்பர்", monthEn: "December", dateTa: "டிசம்பர் 21, 2026", dateEn: "December 21, 2026", dayTa: "திங்கட்கிழமை", dayEn: "Monday" },
  ],
  "2027": [
    { monthTa: "ஜனவரி", monthEn: "January", dateTa: "ஜனவரி 17, 2027", dateEn: "January 17, 2027", dayTa: "ஞாயிற்றுக்கிழமை", dayEn: "Sunday" },
    { monthTa: "பிப்ரவரி", monthEn: "February", dateTa: "பிப்ரவரி 14, 2027", dateEn: "February 14, 2027", dayTa: "ஞாயிற்றுக்கிழமை", dayEn: "Sunday" },
    { monthTa: "மார்ச்", monthEn: "March", dateTa: "மார்ச் 13, 2027", dateEn: "March 13, 2027", dayTa: "சனிக்கிழமை", dayEn: "Saturday" },
    { monthTa: "ஏப்ரல்", monthEn: "April", dateTa: "ஏப்ரல் 09, 2027", dateEn: "April 09, 2027", dayTa: "வெள்ளிக்கிழமை", dayEn: "Friday" },
    { monthTa: "மே", monthEn: "May", dateTa: "மே 06, 2027", dateEn: "May 06, 2027", dayTa: "வியாழக்கிழமை", dayEn: "Thursday" },
    { monthTa: "ஜூன்", monthEn: "June", dateTa: "ஜூன் 02 & 29, 2027", dateEn: "June 02 & 29, 2027", dayTa: "புதன் & செவ்வாய்", dayEn: "Wednesday & Tuesday" },
    { monthTa: "ஜூலை", monthEn: "July", dateTa: "ஜூலை 26, 2027", dateEn: "July 26, 2027", dayTa: "திங்கட்கிழமை", dayEn: "Monday" },
    { monthTa: "ஆகஸ்ட்", monthEn: "August", dateTa: "ஆகஸ்ட் 22, 2027", dateEn: "August 22, 2027", dayTa: "ஞாயிற்றுக்கிழமை", dayEn: "Sunday" },
    { monthTa: "செப்டம்பர்", monthEn: "September", dateTa: "செப்டம்பர் 19, 2027", dateEn: "September 19, 2027", dayTa: "ஞாயிற்றுக்கிழமை", dayEn: "Sunday" },
    { monthTa: "அக்டோபர்", monthEn: "October", dateTa: "அக்டோபர் 16, 2027", dateEn: "October 16, 2027", dayTa: "சனிக்கிழமை", dayEn: "Saturday" },
    { monthTa: "நவம்பர்", monthEn: "November", dateTa: "நவம்பர் 12, 2027", dateEn: "November 12, 2027", dayTa: "வெள்ளிக்கிழமை", dayEn: "Friday" },
    { monthTa: "டிசம்பர்", monthEn: "December", dateTa: "டிசம்பர் 09, 2027", dateEn: "December 09, 2027", dayTa: "வியாழக்கிழமை", dayEn: "Thursday" },
  ],
};

const CHANDRASHTAMA: Record<YearKey, ChandrashtamaRow[]> = {
  "2026": [
    { monthTa: "ஜனவரி", monthEn: "January", startTa: "ஜனவரி 13, மாலை 05:21", startEn: "Jan 13, 05:21 PM", endTa: "ஜனவரி 16, காலை 05:48", endEn: "Jan 16, 05:48 AM" },
    { monthTa: "பிப்ரவரி", monthEn: "February", startTa: "பிப்ரவரி 10, அதிகாலை 01:11", startEn: "Feb 10, 01:11 AM", endTa: "பிப்ரவரி 12, பகல் 01:42", endEn: "Feb 12, 01:42 PM" },
    { monthTa: "மார்ச்", monthEn: "March", startTa: "மார்ச் 09, காலை 09:29", startEn: "Mar 09, 09:29 AM", endTa: "மார்ச் 11, இரவு 10:00", endEn: "Mar 11, 10:00 PM" },
    { monthTa: "ஏப்ரல்", monthEn: "April", startTa: "ஏப்ரல் 05, மாலை 05:28", startEn: "Apr 05, 05:28 PM", endTa: "ஏப்ரல் 08, காலை 05:54", endEn: "Apr 08, 05:54 AM" },
    { monthTa: "மே", monthEn: "May", startTa: "மே 03, நள்ளிரவு 12:30", startEn: "May 03, 12:30 AM", endTa: "மே 05, பகல் 12:54", endEn: "May 05, 12:54 PM" },
    { monthTa: "மே / ஜூன்", monthEn: "May / June", startTa: "மே 30, காலை 06:39", startEn: "May 30, 06:39 AM", endTa: "ஜூன் 01, மாலை 07:08", endEn: "Jun 01, 07:08 PM" },
    { monthTa: "ஜூன்", monthEn: "June", startTa: "ஜூன் 26, பகல் 12:33", startEn: "Jun 26, 12:33 PM", endTa: "ஜூன் 29, அதிகாலை 01:09", endEn: "Jun 29, 01:09 AM" },
    { monthTa: "ஜூலை", monthEn: "July", startTa: "ஜூலை 23, மாலை 07:01", startEn: "Jul 23, 07:01 PM", endTa: "ஜூலை 26, காலை 07:35", endEn: "Jul 26, 07:35 AM" },
    { monthTa: "ஆகஸ்ட்", monthEn: "August", startTa: "ஆகஸ்ட் 20, அதிகாலை 02:30", startEn: "Aug 20, 02:30 AM", endTa: "ஆகஸ்ட் 22, பிற்பகல் 02:49", endEn: "Aug 22, 02:49 PM" },
    { monthTa: "செப்டம்பர்", monthEn: "September", startTa: "செப்டம்பர் 16, காலை 10:49", startEn: "Sep 16, 10:49 AM", endTa: "செப்டம்பர் 18, இரவு 10:44", endEn: "Sep 18, 10:44 PM" },
    { monthTa: "அக்டோபர்", monthEn: "October", startTa: "அக்டோபர் 13, மாலை 07:12", startEn: "Oct 13, 07:12 PM", endTa: "அக்டோபர் 16, அதிகாலை 06:47", endEn: "Oct 16, 06:47 AM" },
    { monthTa: "நவம்பர்", monthEn: "November", startTa: "நவம்பர் 10, அதிகாலை 02:48", startEn: "Nov 10, 02:48 AM", endTa: "நவம்பர் 12, பிற்பகல் 02:19", endEn: "Nov 12, 02:19 PM" },
    { monthTa: "டிசம்பர்", monthEn: "December", startTa: "டிசம்பர் 07, காலை 09:14", startEn: "Dec 07, 09:14 AM", endTa: "டிசம்பர் 09, இரவு 09:00", endEn: "Dec 09, 09:00 PM" },
  ],
  "2027": [
    { monthTa: "ஜனவரி", monthEn: "January", startTa: "ஜனவரி 03, மாலை 04:30", startEn: "Jan 03, 04:30 PM", endTa: "ஜனவரி 06, அதிகாலை 04:15", endEn: "Jan 06, 04:15 AM" },
    { monthTa: "ஜனவரி / பிப்ரவரி", monthEn: "Jan / Feb", startTa: "ஜனவரி 30, இரவு 11:15", startEn: "Jan 30, 11:15 PM", endTa: "பிப்ரவரி 02, மதியம் 12:00", endEn: "Feb 02, 12:00 PM" },
    { monthTa: "பிப்ரவரி / மார்ச்", monthEn: "Feb / Mar", startTa: "பிப்ரவரி 27, காலை 06:45", startEn: "Feb 27, 06:45 AM", endTa: "மார்ச் 01, இரவு 07:30", endEn: "Mar 01, 07:30 PM" },
    { monthTa: "மார்ச்", monthEn: "March", startTa: "மார்ச் 26, பகல் 01:20", startEn: "Mar 26, 01:20 PM", endTa: "மார்ச் 29, அதிகாலை 02:10", endEn: "Mar 29, 02:10 AM" },
    { monthTa: "ஏப்ரல்", monthEn: "April", startTa: "ஏப்ரல் 22, இரவு 08:30", startEn: "Apr 22, 08:30 PM", endTa: "ஏப்ரல் 25, காலை 09:15", endEn: "Apr 25, 09:15 AM" },
    { monthTa: "மே", monthEn: "May", startTa: "மே 20, அதிகாலை 04:10", startEn: "May 20, 04:10 AM", endTa: "மே 22, மாலை 04:45", endEn: "May 22, 04:45 PM" },
    { monthTa: "ஜூன்", monthEn: "June", startTa: "ஜூன் 16, பகல் 11:35", startEn: "Jun 16, 11:35 AM", endTa: "ஜூன் 19, நள்ளிரவு 12:10", endEn: "Jun 19, 12:10 AM" },
    { monthTa: "ஜூலை", monthEn: "July", startTa: "ஜூலை 13, இரவு 07:15", startEn: "Jul 13, 07:15 PM", endTa: "ஜூலை 16, காலை 07:45", endEn: "Jul 16, 07:45 AM" },
    { monthTa: "ஆகஸ்ட்", monthEn: "August", startTa: "ஆகஸ்ட் 10, அதிகாலை 03:20", startEn: "Aug 10, 03:20 AM", endTa: "ஆகஸ்ட் 12, பிற்பகல் 03:50", endEn: "Aug 12, 03:50 PM" },
    { monthTa: "செப்டம்பர்", monthEn: "September", startTa: "செப்டம்பர் 06, காலை 10:45", startEn: "Sep 06, 10:45 AM", endTa: "செப்டம்பர் 08, இரவு 11:20", endEn: "Sep 08, 11:20 PM" },
    { monthTa: "அக்டோபர்", monthEn: "October", startTa: "அக்டோபர் 03, மாலை 06:10", startEn: "Oct 03, 06:10 PM", endTa: "அக்டோபர் 06, காலை 06:50", endEn: "Oct 06, 06:50 AM" },
    { monthTa: "அக்டோபர் / நவம்பர்", monthEn: "Oct / Nov", startTa: "அக்டோபர் 31, அதிகாலை 01:30", startEn: "Oct 31, 01:30 AM", endTa: "நவம்பர் 02, மதியம் 02:15", endEn: "Nov 02, 02:15 PM" },
    { monthTa: "நவம்பர்", monthEn: "November", startTa: "நவம்பர் 27, காலை 08:45", startEn: "Nov 27, 08:45 AM", endTa: "நவம்பர் 29, இரவு 09:30", endEn: "Nov 29, 09:30 PM" },
    { monthTa: "டிசம்பர்", monthEn: "December", startTa: "டிசம்பர் 24, மாலை 04:15", startEn: "Dec 24, 04:15 PM", endTa: "டிசம்பர் 27, அதிகாலை 05:00", endEn: "Dec 27, 05:00 AM" },
  ],
};

const ASHTAMI_NAVAMI: Record<YearKey, AshtamiNavamiRow[]> = {
  "2026": [
    { monthTa: "ஜனவரி", monthEn: "January", ashtami: "11, 26", navamiTa: "12, 27", navamiEn: "12, 27" },
    { monthTa: "பிப்ரவரி", monthEn: "February", ashtami: "10", navamiTa: "11, 25", navamiEn: "11, 25" },
    { monthTa: "மார்ச்", monthEn: "March", ashtami: "11, 26", navamiTa: "12, 27", navamiEn: "12, 27" },
    { monthTa: "ஏப்ரல்", monthEn: "April", ashtami: "10, 24", navamiTa: "11, 25", navamiEn: "11, 25" },
    { monthTa: "மே", monthEn: "May", ashtami: "10, 24", navamiTa: "11, 25", navamiEn: "11, 25" },
    { monthTa: "ஜூன்", monthEn: "June", ashtami: "08, 22", navamiTa: "09, 23", navamiEn: "09, 23" },
    { monthTa: "ஜூலை", monthEn: "July", ashtami: "08, 22", navamiTa: "09, 23", navamiEn: "09, 23" },
    { monthTa: "ஆகஸ்ட்", monthEn: "August", ashtami: "06, 20", navamiTa: "07, 21", navamiEn: "07, 21" },
    { monthTa: "செப்டம்பர்", monthEn: "September", ashtami: "04, 19", navamiTa: "05, 20", navamiEn: "05, 20" },
    { monthTa: "அக்டோபர்", monthEn: "October", ashtami: "04, 19", navamiTa: "20", navamiEn: "20" },
    { monthTa: "நவம்பர்", monthEn: "November", ashtami: "02, 17", navamiTa: "03, 18", navamiEn: "03, 18" },
    { monthTa: "டிசம்பர்", monthEn: "December", ashtami: "01, 17, 31", navamiTa: "02, 18", navamiEn: "02, 18" },
  ],
  "2027": [
    { monthTa: "ஜனவரி", monthEn: "January", ashtami: "02, 15, 31", navamiTa: "03, 16, 29", navamiEn: "03, 16, 29" },
    { monthTa: "பிப்ரவரி", monthEn: "February", ashtami: "13, 27", navamiTa: "14, 28", navamiEn: "14, 28" },
    { monthTa: "மார்ச்", monthEn: "March", ashtami: "14, 29", navamiTa: "15, 30", navamiEn: "15, 30" },
    { monthTa: "ஏப்ரல்", monthEn: "April", ashtami: "13, 27", navamiTa: "14, 29", navamiEn: "14, 29" },
    { monthTa: "மே", monthEn: "May", ashtami: "12, 27", navamiTa: "13, 28", navamiEn: "13, 28" },
    { monthTa: "ஜூன்", monthEn: "June", ashtami: "11, 25", navamiTa: "12, 27", navamiEn: "12, 27" },
    { monthTa: "ஜூலை", monthEn: "July", ashtami: "10, 25", navamiTa: "11, 26", navamiEn: "11, 26" },
    { monthTa: "ஆகஸ்ட்", monthEn: "August", ashtami: "08, 24", navamiTa: "09, 25", navamiEn: "09, 25" },
    { monthTa: "செப்டம்பர்", monthEn: "September", ashtami: "07, 22", navamiTa: "08, 23", navamiEn: "08, 23" },
    { monthTa: "அக்டோபர்", monthEn: "October", ashtami: "06, 21", navamiTa: "07, 22 (மகா நவமி)", navamiEn: "07, 22 (Maha Navami)" },
    { monthTa: "நவம்பர்", monthEn: "November", ashtami: "05, 19", navamiTa: "06, 21", navamiEn: "06, 21" },
    { monthTa: "டிசம்பர்", monthEn: "December", ashtami: "05, 19", navamiTa: "06, 20", navamiEn: "06, 20" },
  ],
};

/* --------------------------- CATEGORY META -------------------------------- */

export type CategoryId = "amavasai" | "pournami" | "krithigai" | "chandrashtama" | "ashtami-navami";

export interface CategoryMeta {
  id: CategoryId;
  glyph: string;
  tamil: string;
  english: string;
  blurbTa: string;
  blurbEn: string;
}

const CATEGORIES: CategoryMeta[] = [
  {
    id: "amavasai",
    glyph: "●",
    tamil: "அமாவாசை",
    english: "Amavasai",
    blurbTa: "அமாவாசை திதி தொடக்கம் மற்றும் முடிவு நேரங்கள் (New Moon Days)",
    blurbEn: "New-moon tithi dates & auspicious timings",
  },
  {
    id: "pournami",
    glyph: "○",
    tamil: "பௌர்ணமி",
    english: "Pournami",
    blurbTa: "பௌர்ணமி திதி மற்றும் விரத நேரங்கள் (Full Moon Days)",
    blurbEn: "Full-moon tithi dates & auspicious timings",
  },
  {
    id: "krithigai",
    glyph: "✦",
    tamil: "கிருத்திகை",
    english: "Krithigai",
    blurbTa: "மாதாந்திர கார்த்திகை / கிருத்திகை முருக வழிபாட்டு நட்சத்திர நாட்கள்",
    blurbEn: "Monthly Krithigai nakshatra Murugan worship days",
  },
  {
    id: "chandrashtama",
    glyph: "◐",
    tamil: "சந்திராஷ்டமம்",
    english: "Chandrashtama",
    blurbTa: "மேஷ ராசிக்கான மாதாந்திர சந்திராஷ்டம எச்சரிக்கை கால அட்டவணை",
    blurbEn: "Mesha Rasi (Aries) — moon transit caution window",
  },
  {
    id: "ashtami-navami",
    glyph: "◈",
    tamil: "அஷ்டமி · நவமி",
    english: "Ashtami & Navami",
    blurbTa: "ஒவ்வொரு மாதத்திலும் வரும் அஷ்டமி மற்றும் நவமி திதி நாட்கள்",
    blurbEn: "Eighth & ninth tithi dates for each month",
  },
];

export interface SpecialDaysCalendarProps {
  language?: 'ta' | 'en';
  isLight?: boolean;
}

/* ------------------------------ COMPONENT --------------------------------- */

export default function SpecialDaysCalendar({
  language = 'ta',
  isLight = false,
}: SpecialDaysCalendarProps) {
  const isTa = language === 'ta';
  const [year, setYear] = useState<YearKey>("2026");
  const [active, setActive] = useState<CategoryId>("amavasai");

  const activeMeta = useMemo(() => CATEGORIES.find((c) => c.id === active)!, [active]);

  return (
    <div className={`sd-root ${isLight ? 'sd-theme-light' : 'sd-theme-dark'}`}>
      <style>{`
        .sd-root {
          font-family: 'Noto Sans Tamil', 'Inter', system-ui, sans-serif;
          border-radius: 20px;
          padding: 28px;
          max-width: 980px;
          margin: 0 auto;
          box-sizing: border-box;
          transition: background-color 0.2s, color 0.2s;
        }
        .sd-theme-dark {
          --sd-bg: #100F1D;
          --sd-bg-glow: radial-gradient(circle at 20% -10%, #2A2650 0%, #100F1D 55%);
          --sd-surface: #1A1830;
          --sd-surface-raised: #221F3F;
          --sd-line: rgba(201, 162, 39, 0.22);
          --sd-gold: #C9A227;
          --sd-gold-soft: #E8CE7A;
          --sd-maroon: #9C3B45;
          --sd-ink: #F1ECDC;
          --sd-ink-dim: #ABA7C6;
          --sd-badge-text: #1A1502;
          background: var(--sd-bg-glow);
          color: var(--sd-ink);
        }
        .sd-theme-light {
          --sd-bg: #FFFDF7;
          --sd-bg-glow: radial-gradient(circle at 20% -10%, #F5ECDD 0%, #FFFDF7 60%);
          --sd-surface: #F9F4E8;
          --sd-surface-raised: #FFFFFF;
          --sd-line: rgba(184, 142, 22, 0.35);
          --sd-gold: #B8860B;
          --sd-gold-soft: #8C6500;
          --sd-maroon: #85222E;
          --sd-ink: #221B14;
          --sd-ink-dim: #5C4F43;
          --sd-badge-text: #FFFFFF;
          background: var(--sd-bg-glow);
          color: var(--sd-ink);
          border: 1px solid rgba(184, 142, 22, 0.25);
          box-shadow: 0 10px 30px rgba(74, 52, 20, 0.06);
        }
        .sd-root * { box-sizing: border-box; }
        .sd-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
          border-bottom: 1px solid var(--sd-line);
          padding-bottom: 18px;
          margin-bottom: 22px;
        }
        .sd-title {
          font-family: 'Noto Serif Tamil', Georgia, serif;
          font-size: 28px;
          letter-spacing: 0.2px;
          margin: 0 0 4px;
          color: var(--sd-gold-soft);
        }
        .sd-subtitle {
          margin: 0;
          font-size: 13px;
          color: var(--sd-ink-dim);
          font-weight: 500;
        }
        .sd-year-toggle {
          display: inline-flex;
          border: 1.5px solid var(--sd-line);
          border-radius: 999px;
          padding: 3px;
          background: var(--sd-surface);
        }
        .sd-year-btn {
          border: none;
          background: transparent;
          color: var(--sd-ink-dim);
          font-size: 14px;
          padding: 7px 18px;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 700;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .sd-year-btn.active {
          background: var(--sd-gold);
          color: var(--sd-badge-text);
        }
        .sd-layout {
          display: grid;
          grid-template-columns: 230px 1fr;
          gap: 22px;
        }
        @media (max-width: 720px) {
          .sd-layout { grid-template-columns: 1fr; }
          .sd-nav { flex-direction: row; overflow-x: auto; gap: 8px; padding-bottom: 6px; }
          .sd-nav-item { flex: 0 0 auto; white-space: nowrap; }
        }
        .sd-nav {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .sd-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 12px;
          border: 1px solid transparent;
          background: transparent;
          color: var(--sd-ink-dim);
          cursor: pointer;
          text-align: left;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.18s ease;
        }
        .sd-nav-item:hover {
          background: var(--sd-surface);
          color: var(--sd-ink);
        }
        .sd-nav-item.active {
          background: var(--sd-surface-raised);
          border-color: var(--sd-line);
          color: var(--sd-gold-soft);
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .sd-nav-glyph {
          font-size: 16px;
          width: 22px;
          text-align: center;
          color: var(--sd-gold);
        }
        .sd-nav-label {
          display: flex;
          flex-direction: column;
          line-height: 1.35;
        }
        .sd-nav-tamil { font-family: 'Noto Serif Tamil', Georgia, serif; font-size: 14.5px; font-weight: 600; }
        .sd-nav-english { font-size: 11px; letter-spacing: 0.3px; color: var(--sd-ink-dim); }

        .sd-panel {
          background: var(--sd-surface);
          border: 1px solid var(--sd-line);
          border-radius: 16px;
          padding: 22px;
          min-height: 320px;
        }
        .sd-panel-head {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }
        .sd-panel-title {
          font-family: 'Noto Serif Tamil', Georgia, serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--sd-gold-soft);
          margin: 0;
        }
        .sd-panel-english {
          font-size: 13px;
          color: var(--sd-ink-dim);
          font-weight: 500;
        }
        .sd-panel-blurb {
          margin: 4px 0 20px;
          font-size: 13.5px;
          color: var(--sd-ink-dim);
          line-height: 1.5;
        }
        .sd-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 12px;
        }
        .sd-card {
          border: 1px solid var(--sd-line);
          border-radius: 12px;
          padding: 14px 16px;
          background: var(--sd-surface-raised);
          box-shadow: 0 3px 8px rgba(0,0,0,0.04);
          transition: transform 0.15s ease, border-color 0.15s ease;
        }
        .sd-card:hover {
          transform: translateY(-2px);
          border-color: var(--sd-gold);
        }
        .sd-card-date {
          font-family: 'Noto Serif Tamil', Georgia, serif;
          font-size: 15.5px;
          font-weight: 700;
          color: var(--sd-ink);
          margin: 0 0 6px;
        }
        .sd-card-day {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.3px;
          color: var(--sd-badge-text);
          background: var(--sd-gold);
          border-radius: 999px;
          padding: 2px 10px;
          margin-bottom: 9px;
        }
        .sd-card-row {
          font-size: 12.5px;
          color: var(--sd-ink-dim);
          margin: 3px 0;
          line-height: 1.45;
        }
        .sd-card-row b {
          color: var(--sd-ink);
          font-weight: 600;
        }
        .sd-empty {
          color: var(--sd-ink-dim);
          font-size: 13px;
          padding: 30px 0;
          text-align: center;
        }
      `}</style>

      <div className="sd-head">
        <div>
          <h2 className="sd-title">
            {isTa ? "சிறப்பு நாட்கள் · பஞ்சாங்கம்" : "Special Days · Panchangam"}
          </h2>
          <p className="sd-subtitle">
            {isTa
              ? "அமாவாசை, பௌர்ணமி, கிருத்திகை, சந்திராஷ்டமம் மற்றும் அஷ்டமி-நவமி நாட்கள்"
              : "Amavasai, Pournami, Krithigai, Chandrashtama, and Ashtami-Navami calendar"}
          </p>
        </div>
        <div className="sd-year-toggle">
          {(["2026", "2027"] as YearKey[]).map((y) => (
            <button
              key={y}
              className={`sd-year-btn ${year === y ? "active" : ""}`}
              onClick={() => setYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className="sd-layout">
        <nav className="sd-nav">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`sd-nav-item ${active === cat.id ? "active" : ""}`}
              onClick={() => setActive(cat.id)}
            >
              <span className="sd-nav-glyph">{cat.glyph}</span>
              <span className="sd-nav-label">
                <span className="sd-nav-tamil">{isTa ? cat.tamil : cat.english}</span>
                <span className="sd-nav-english">{isTa ? cat.english : cat.tamil}</span>
              </span>
            </button>
          ))}
        </nav>

        <section className="sd-panel">
          <div className="sd-panel-head">
            <h3 className="sd-panel-title">{isTa ? activeMeta.tamil : activeMeta.english}</h3>
          </div>
          <p className="sd-panel-blurb">{isTa ? activeMeta.blurbTa : activeMeta.blurbEn}</p>

          {active === "amavasai" && <AmavasaiGrid rows={AMAVASAI[year]} isTa={isTa} />}
          {active === "pournami" && <PournamiGrid rows={POURNAMI[year]} isTa={isTa} />}
          {active === "krithigai" && <KrithigaiGrid rows={KRITHIGAI[year]} isTa={isTa} />}
          {active === "chandrashtama" && <ChandrashtamaGrid rows={CHANDRASHTAMA[year]} isTa={isTa} />}
          {active === "ashtami-navami" && <AshtamiNavamiGrid rows={ASHTAMI_NAVAMI[year]} isTa={isTa} />}
        </section>
      </div>
    </div>
  );
}

/* --------------------------- SUB RENDERERS -------------------------------- */

function AmavasaiGrid({ rows, isTa }: { rows: AmavasaiRow[]; isTa: boolean }) {
  if (!rows.length) return <div className="sd-empty">{isTa ? "இவ்வருடத்திற்கான தரவு இல்லை." : "No data for this year."}</div>;
  return (
    <div className="sd-grid">
      {rows.map((r, i) => (
        <div className="sd-card" key={i}>
          <p className="sd-card-date">{isTa ? r.dateTa : r.dateEn}</p>
          <span className="sd-card-day">{isTa ? r.dayTa : r.dayEn}</span>
          <p className="sd-card-row">
            <b>{isTa ? "தொடக்கம்:" : "Start:"}</b> {isTa ? r.startTa : r.startEn}
          </p>
          <p className="sd-card-row">
            <b>{isTa ? "முடிவு:" : "End:"}</b> {isTa ? r.endTa : r.endEn}
          </p>
        </div>
      ))}
    </div>
  );
}

function PournamiGrid({ rows, isTa }: { rows: PournamiRow[]; isTa: boolean }) {
  if (!rows.length) return <div className="sd-empty">{isTa ? "இவ்வருடத்திற்கான தரவு இல்லை." : "No data for this year."}</div>;
  return (
    <div className="sd-grid">
      {rows.map((r, i) => (
        <div className="sd-card" key={i}>
          <p className="sd-card-date">{isTa ? r.dateTa : r.dateEn}</p>
          <span className="sd-card-day">{isTa ? r.tamilDateTa : r.tamilDateEn}</span>
          <p className="sd-card-row">{isTa ? r.timingTa : r.timingEn}</p>
        </div>
      ))}
    </div>
  );
}

function KrithigaiGrid({ rows, isTa }: { rows: KrithigaiRow[]; isTa: boolean }) {
  if (!rows.length) return <div className="sd-empty">{isTa ? "இவ்வருடத்திற்கான தரவு இல்லை." : "No data for this year."}</div>;
  return (
    <div className="sd-grid">
      {rows.map((r, i) => (
        <div className="sd-card" key={i}>
          <p className="sd-card-date">{isTa ? r.dateTa : r.dateEn}</p>
          <span className="sd-card-day">{isTa ? r.dayTa : r.dayEn}</span>
          <p className="sd-card-row">
            <b>{isTa ? "மாதம்:" : "Month:"}</b> {isTa ? r.monthTa : r.monthEn}
          </p>
        </div>
      ))}
    </div>
  );
}

function ChandrashtamaGrid({ rows, isTa }: { rows: ChandrashtamaRow[]; isTa: boolean }) {
  if (!rows.length) return <div className="sd-empty">{isTa ? "இவ்வருடத்திற்கான தரவு இல்லை." : "No data for this year."}</div>;
  return (
    <div className="sd-grid">
      {rows.map((r, i) => (
        <div className="sd-card" key={i}>
          <p className="sd-card-date">{isTa ? r.monthTa : r.monthEn}</p>
          <p className="sd-card-row">
            <b>{isTa ? "தொடக்கம்:" : "Start:"}</b> {isTa ? r.startTa : r.startEn}
          </p>
          <p className="sd-card-row">
            <b>{isTa ? "முடிவு:" : "End:"}</b> {isTa ? r.endTa : r.endEn}
          </p>
        </div>
      ))}
    </div>
  );
}

function AshtamiNavamiGrid({ rows, isTa }: { rows: AshtamiNavamiRow[]; isTa: boolean }) {
  if (!rows.length) return <div className="sd-empty">{isTa ? "இவ்வருடத்திற்கான தரவு இல்லை." : "No data for this year."}</div>;
  return (
    <div className="sd-grid">
      {rows.map((r, i) => (
        <div className="sd-card" key={i}>
          <p className="sd-card-date">{isTa ? r.monthTa : r.monthEn}</p>
          <p className="sd-card-row">
            <b>{isTa ? "அஷ்டமி:" : "Ashtami:"}</b> {r.ashtami}
          </p>
          <p className="sd-card-row">
            <b>{isTa ? "நவமி:" : "Navami:"}</b> {isTa ? r.navamiTa : r.navamiEn}
          </p>
        </div>
      ))}
    </div>
  );
}

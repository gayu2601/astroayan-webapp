import React, { useState, useEffect, useCallback, useMemo } from "react";

// ─── Props Interface ─────────────────────────────────────────────────────────

export interface BabyNameFinderProps {
  language?: 'ta' | 'en';
  isLight?: boolean;
}

// ─── Data ────────────────────────────────────────────────────────────────────

// Tamil syllable map (from natchathira-nama-ezhuthukal.js)
const NATCHATHIRA_EZHUTHUKAL_TA: Record<string, string[]> = {
  "அசுவினி":      ["க", "சே", "சோ", "ல"],
  "பரணி":         ["லி", "லு", "லே", "லோ"],
  "கிருத்திகை":   ["அ", "இ", "உ", "எ"],
  "ரோகிணி":       ["ஓ", "வ", "வி", "வு"],
  "மிருகசீரிடம்": ["வே", "வோ", "கா", "கி"],
  "திருவாதிரை":   ["கு", "க", "ஞ", "ச"],
  "புனர்பூசம்":   ["கே", "கோ", "ஹ", "ஹி"],
  "பூசம்":        ["ஹு", "ஹே", "ஹோ", "ட"],
  "ஆயில்யம்":     ["டி", "டு", "டே", "டோ"],
  "மகம்":         ["ம", "மி", "மு", "மே"],
  "பூரம்":        ["மோ", "ட", "டி", "டு"],
  "உத்திரம்":     ["டே", "டோ", "ப", "பி"],
  "அஸ்தம்":       ["பூ", "ஷ", "ந", "ட"],
  "சித்திரை":     ["பே", "போ", "ர", "ரி"],
  "சுவாதி":       ["ரு", "ரே", "ரோ", "த"],
  "விசாகம்":      ["தி", "து", "தே", "தோ"],
  "அனுஷம்":       ["ந", "நி", "நு", "நே"],
  "கேட்டை":       ["நோ", "ய", "இ", "பூ"],
  "மூலம்":        ["யே", "யோ", "ப", "பி"],
  "பூராடம்":      ["பூ", "த", "ப", "டா"],
  "உத்திராடம்":   ["பே", "போ", "ஜ", "ஜி"],
  "திருவோணம்":    ["ஜூ", "ஜே", "ஜோ", "கா"],
  "அவிட்டம்":     ["க", "கீ", "கு", "கூ"],
  "சதயம்":        ["கோ", "ஸ", "ஸீ", "ஸூ"],
  "பூரட்டாதி":    ["ஸே", "ஸோ", "தா", "தீ"],
  "உத்திரட்டாதி": ["து", "ச", "ஸ்ரீ", "ஞ"],
  "ரேவதி":        ["தே", "தோ", "ச", "சி"],
};

// English syllable map (from natchathira-nama-ezhuthukal-english.js)
const NATCHATHIRA_EZHUTHUKAL_EN: Record<string, string[]> = {
  "Ashwini":        ["Ka", "Che", "Cho", "La"],
  "Bharani":        ["Li", "Lu", "Le", "Lo"],
  "Krittika":       ["A", "I", "U", "E"],
  "Rohini":         ["O", "Va", "Vi", "Vu"],
  "Mrigashira":     ["Ve", "Vo", "Kaa", "Ki"],
  "Ardra":          ["Ku", "Ka", "Nga", "Sa"],
  "Punarvasu":      ["Ke", "Ko", "Ha", "Hi"],
  "Pushya":         ["Hu", "He", "Ho", "Da"],
  "Ashlesha":       ["Di", "Du", "De", "Do"],
  "Magha":          ["Ma", "Mi", "Mu", "Me"],
  "Purva Phalguni": ["Mo", "Ta", "Ti", "Tu"],
  "Uttara Phalguni":["Te", "To", "Pa", "Pi"],
  "Hasta":          ["Poo", "Sha", "Na", "Ta"],
  "Chitra":         ["Pe", "Po", "Ra", "Ri"],
  "Swati":          ["Ru", "Re", "Ro", "Tha"],
  "Vishakha":       ["Thi", "Thu", "The", "Tho"],
  "Anuradha":       ["Na", "Ni", "Nu", "Ne"],
  "Jyeshtha":       ["No", "Ya", "I", "Poo"],
  "Mula":           ["Ye", "Yo", "Pa", "Pi"],
  "Purva Ashadha":  ["Poo", "Tha", "Pa", "Daa"],
  "Uttara Ashadha": ["Pe", "Po", "Ja", "Ji"],
  "Shravana":       ["Ju", "Je", "Jo", "Kaa"],
  "Dhanishta":      ["Ka", "Kee", "Ku", "Koo"],
  "Shatabhisha":    ["Ko", "Sa", "See", "Soo"],
  "Purva Bhadrapada":["Se", "So", "Thaa", "Thee"],
  "Uttara Bhadrapada":["Thu", "Sa", "Sri", "Nya"],
  "Revati":         ["The", "Tho", "Sa", "Si"],
};

// English nakshatra names for lookup key (matches the baby names data)
const NAKSHATRA_EN_MAP: Record<string, string> = {
  "அசுவினி": "Ashwini",
  "பரணி": "Bharani",
  "கிருத்திகை": "Krittika",
  "ரோகிணி": "Rohini",
  "மிருகசீரிடம்": "Mrigashira",
  "திருவாதிரை": "Ardra",
  "புனர்பூசம்": "Punarvasu",
  "பூசம்": "Pushya",
  "ஆயில்யம்": "Ashlesha",
  "மகம்": "Magha",
  "பூரம்": "Purva Phalguni",
  "உத்திரம்": "Uttara Phalguni",
  "அஸ்தம்": "Hasta",
  "சித்திரை": "Chitra",
  "சுவாதி": "Swati",
  "விசாகம்": "Vishakha",
  "அனுஷம்": "Anuradha",
  "கேட்டை": "Jyeshtha",
  "மூலம்": "Mula",
  "பூராடம்": "Purva Ashadha",
  "உத்திராடம்": "Uttara Ashadha",
  "திருவோணம்": "Shravana",
  "அவிட்டம்": "Dhanishta",
  "சதயம்": "Shatabhisha",
  "பூரட்டாதி": "Purva Bhadrapada",
  "உத்திரட்டாதி": "Uttara Bhadrapada",
  "ரேவதி": "Revati",
};

// Baby names database (from astroayan_baby_names.docx)
const BABY_NAMES: Record<"girl" | "boy", Record<string, string[]>> = {
  girl: {
    "Ashwini": ["Aadhya","Aahana","Aakriti","Aanya","Aaradhya","Aarini","Aarna","Aarya","Aashika","Aastha","Aditi","Advika","Ahana","Akanksha","Akshara","Akshaya","Alina","Amaya","Amrita","Anagha","Ananya","Anika","Anisha","Anjali","Anvika","Anya","Aparna","Aradhana","Aria","Arika","Arpita","Arya","Ashika","Ashita","Ashna","Avani","Avika","Avisha","Ayana","Ayra","Ayesha","Aarna","Aarushi","Aishani","Aishwarya","Akhila","Amisha","Anvita","Aradhya","Athira"],
    "Bharani": ["Likhita","Likisha","Lina","Lisha","Liyana","Lipika","Lithika","Lithisha","Liva","Liya","Liyana","Likhitha","Lila","Leela","Lekha","Lekhya","Lena","Leesha","Lehar","Leher","Leona","Lesha","Letika","Leya","Leyana","Lochana","Lohita","Lohini","Lopamudra","Lorika","Lona","Lovika","Lovisha","Loukya","Loukika","Louisa","Lopa","Lopika","Luvika","Lubna","Luvanya","Luvina","Luvisha","Luvita","Leya","Lisha","Lohana"],
    "Krittika": ["Aadhira","Aadhya","Aahana","Aaradhya","Aarna","Aarya","Aashi","Aashika","Aastha","Aditi","Advika","Ahalya","Ahana","Aishani","Aishwarya","Akanksha","Akhila","Akira","Akshara","Akshaya","Alina","Amara","Amaya","Amisha","Amrita","Anagha","Ananya","Anika","Anisha","Anjali","Anvika","Anya","Aparna","Aradhana","Aria","Arika","Arpita","Arya","Eesha","Eshani","Eshika","Eshita","Eshwari","Ekta","Ekisha","Evania","Urmila","Urvashi","Usha","Uthara"],
    "Rohini": ["Ojasvi","Oviya","Oorja","Oorvi","Ojaswini","Oindrila","Omisha","Omika","Ovi","Vaidehi","Vaishnavi","Vaishali","Vamika","Vani","Vanaja","Varsha","Varshini","Vasudha","Vasundhara","Vedika","Veena","Veda","Vedanshi","Vidhya","Vidhi","Vidisha","Vihana","Vihani","Vijayalakshmi","Vikasini","Vimala","Vinaya","Vineeta","Vinisha","Vini","Vanya","Varnika","Varika","Vasavi","Vibha","Vibhuti","Vidhatri","Vidula","Vina","Vritika","Vrinda","Vrushti","Vritti","Vyoma"],
    "Mrigashira": ["Veera","Veda","Vedika","Vedanshi","Veni","Venika","Vennela","Vihana","Vihani","Vini","Vinaya","Vineeta","Vinisha","Vishwa","Vishakha","Vishali","Vishnupriya","Vismaya","Vritika","Kaavya","Kaira","Kairavi","Kalika","Kalpana","Kamini","Kanika","Kanya","Karishma","Kavika","Kavini","Kavisha","Kavita","Kavyashree","Keerthi","Keerthana","Ketaki","Khyati","Kiara","Kiranmayi","Kirti","Komal","Kokila","Kripa","Krisha","Kriti","Kritika","Kumari","Kusuma","Kyra"],
    "Ardra": ["Kuja","Kumari","Kumuda","Kunda","Kunjal","Kunjika","Kusha","Kushala","Kushali","Kusuma","Gagana","Gauri","Gayatri","Geetika","Geetanjali","Gitali","Gitanjali","Girija","Gireesha","Gopika","Gowri","Grishma","Gunika","Gunjan","Gunjita","Gurleen","Gargi","Garima","Gayana","Geetha","Gehna","Greeshma","Guhika","Gulika","Gunita","Gyanika","Gyanavi","Gaurika","Gauthami","Gajalakshmi","Ganga","Gangika","Gargee","Gauravi","Gunjika"],
    "Punarvasu": ["Keerthi","Keerthana","Keerthika","Keshavi","Ketaki","Khyati","Kiara","Kiran","Kiranmayi","Kirti","Kirtana","Kiya","Kiyara","Komal","Kokila","Kripa","Krishika","Krishna","Krisha","Kriti","Kritika","Krithika","Krupa","Kuhu","Kumari","Kumuda","Kunda","Kunjal","Kusuma","Kaveri","Kavya","Kavika","Kavini","Kavisha","Kalika","Kalpana","Kamya","Kanika","Karishma","Karuna","Kaushiki","Kausalya","Kalyani","Kashika","Kashvi","Kashi","Kavana","Kavyashree","Kairavi","Kaira"],
    "Pushya": ["Huvi","Huma","Hema","Hemalatha","Hemangi","Hemanti","Hemashree","Hiral","Hita","Hitha","Hridya","Hridaya","Hritika","Hridvika","Hamsika","Hamsini","Hansika","Harini","Haripriya","Haritha","Harshika","Harshita","Hasini","Hemika","Hena","Hetal","Hima","Himani","Himanshi","Hindavi","Hiranya","Hiyanshi","Hridvi","Hrishika","Hrudaya","Hrudvika","Humaira","Hamsa","Harika","Harshali","Harsika","Havyika","Haya","Hayati","Hiralika"],
    "Ashlesha": ["Diya","Disha","Divya","Divisha","Divija","Ditya","Diti","Dipika","Deepa","Deepika","Deepthi","Deepti","Devika","Devina","Devanshi","Devyani","Dhanya","Dhanvi","Dhanika","Dharani","Dharika","Dhriti","Dhruti","Dhwani","Dhyana","Dhyuti","Diksha","Dimple","Drishti","Drishya","Durga","Durgika","Daksha","Dakshita","Damini","Damayanti","Darika","Darshana","Darshini","Deepali","Deevika","Devaki","Devanshika","Dhairya","Dhatri","Dhvani"],
    "Magha": ["Maahi","Maanya","Madhavi","Madhura","Madhuri","Mahalakshmi","Mahati","Mahika","Mahima","Maitreyi","Malavika","Malini","Mallika","Mamata","Manasa","Manasvi","Mandira","Manisha","Manjari","Manju","Manya","Marisha","Medha","Medhavi","Megha","Meghana","Meera","Meenakshi","Mihika","Mihira","Minal","Minisha","Mira","Mishika","Mitali","Mithila","Mohana","Mohini","Moksha","Monica","Mridula","Mrinal","Mrinalini","Mudita","Mukta","Muktika","Myra","Mythili","Maithili"],
    "Purva Phalguni": ["Moha","Mohana","Mohini","Monika","Monica","Mounika","Mouli","Moumita","Moulisha","Mridula","Mridvi","Mrinal","Mrinalini","Myra","Mysha","Meera","Megha","Meghana","Mihika","Misha","Mitali","Mithila","Mithra","Moksha","Mallika","Malini","Manasa","Manisha","Manjari","Manya","Madhavi","Madhura","Mahika","Mahima","Maithili","Maanya","Maahi","Medha","Medhavi","Mira","Miraya","Mishka","Mishika","Mohitha","Mokshita","Monisha","Mounika","Mrinalika"],
    "Uttara Phalguni": ["Tejasvi","Tejaswini","Tejal","Teertha","Teerthika","Teshika","Tia","Tiana","Tisha","Tishani","Toshika","Toshani","Tuhina","Tulika","Tulsi","Tanaya","Tanika","Tanisha","Tanya","Tapasya","Tara","Tarika","Tarini","Tashi","Tavisha","Teena","Tejalika","Tejasya","Tharika","Tharini","Thiya","Tina","Tithi","Titli","Trisha","Trishala","Triveni","Trupti","Tulasi","Tvesha","Tveshi","Twisha","Tanvi","Tanuja","Tapati","Taruna","Tanishka","Tanishi","Tvarita","Tvisha"],
    "Hasta": ["Puja","Pujita","Purnima","Purnavi","Purna","Pushti","Pushpa","Pushpika","Punya","Punita","Purnika","Pavani","Pavika","Pavitra","Padmini","Padma","Padmavati","Padmika","Pallavi","Parinita","Parisha","Parvati","Parnika","Parnavi","Parul","Pavi","Payal","Prabha","Pragna","Pragathi","Prachi","Pranavi","Prarthana","Preeti","Preksha","Priya","Priyanka","Prisha","Prithika","Priti","Punya","Puspa","Purnashree","Purvi","Purvika","Pahal","Parnita"],
    "Chitra": ["Pehal","Peya","Piya","Pihu","Pihika","Pooja","Poonam","Poorna","Poorvi","Poushali","Priya","Priyanka","Priyasha","Prisha","Prishika","Pranavi","Prarthana","Pratika","Pratibha","Pratyusha","Preeti","Preksha","Prema","Prena","Prerana","Purnima","Purnavi","Purvi","Pushti","Punya","Pallavi","Padmini","Padma","Padmika","Parinita","Parisha","Parvati","Parnika","Pavani","Pavika","Pavitra","Payal","Pihu","Piksha","Pinal","Piya","Piyali","Pooja","Poorvika","Pranika"],
    "Swati": ["Ruhi","Ruchi","Ruchika","Rujuta","Rukmini","Ruma","Rupa","Rupali","Rupika","Rutuja","Rutu","Riya","Riyanka","Rishika","Rishita","Ridhima","Riddhi","Riddhima","Riyaanika","Reema","Reena","Reetika","Rekha","Renu","Renuka","Revathi","Rhea","Ria","Richa","Ritu","Ritika","Rithika","Rohini","Roshini","Roshika","Roshita","Roshni","Rupal","Rupsa","Ranjani","Ranjika","Raksha","Rakshita","Ramya","Ranjitha","Rashi","Rashmi"],
    "Vishakha": ["Tiara","Tiana","Tia","Tisha","Tishya","Toshika","Toshani","Tuhi","Tuhina","Tulika","Tulsi","Tvesha","Tveshi","Twisha","Tejasvi","Tejaswini","Tejal","Teertha","Tanaya","Tanika","Tanisha","Tanya","Tanvi","Tapasya","Tara","Tarika","Tarini","Tashi","Tavisha","Tanuja","Tapati","Tanishka","Tanishi","Tharika","Tharini","Thiya","Tithi","Trisha","Trishala","Triveni","Trupti","Tvarita","Tvisha","Tveshika","Teena","Tiyara","Toshita","Tulaja","Tushita"],
    "Anuradha": ["Naisha","Naina","Nandini","Nandita","Navya","Navika","Navisha","Nayantara","Nayana","Neela","Neelam","Neelima","Neeraja","Neha","Niharika","Nikita","Nila","Nilanjana","Nilasha","Nisha","Nishika","Nishita","Nitya","Nivedita","Nivya","Niyati","Nupur","Nutan","Nyra","Nysa","Namrata","Namita","Nandana","Nandhita","Nandika","Narmada","Natasha","Navina","Neelakshi","Neeravi","Niranjana","Nirmala","Nirupama","Nithya","Nivedha","Nivetha","Niharika","Niharini","Nandhika"],
    "Jyeshtha": ["Noopur","Noma","Noshika","Nupur","Nitya","Niyati","Nisha","Nishita","Nishka","Nishika","Niharika","Niharini","Nikita","Nila","Nilima","Nilanjana","Neha","Neelima","Neeraja","Neeravi","Navya","Navika","Navisha","Nandini","Nandita","Nandana","Nandhika","Nayana","Nayantara","Naisha","Naina","Namita","Namrata","Narmada","Natasha","Nivedita","Nivedha","Nivetha","Nivya","Niranjana","Nirmala","Nirupama","Nithya","Nyra","Nysa","Nandika","Navina","Neelakshi","Noshita","Nupurika"],
    "Mula": ["Yeva","Yeshika","Yeshita","Yashika","Yashita","Yashvi","Yashasvi","Yami","Yamini","Yamika","Yamuna","Yana","Yanaika","Yatika","Yathika","Yatra","Yutika","Yukta","Yukti","Yuvika","Yuvina","Yuvisha","Yuvani","Yojana","Yogita","Yogini","Yogeeta","Yashaswini","Yashoda","Yashodhara","Yashmita","Yashvi","Yatharthi","Yavana","Yavika","Yavisha","Yojitha","Yositha","Yovana","Yuvathi","Yuvika","Yuvisha","Yuktha","Yukshita","Yuktika","Yutika","Yuthika","Yuvanya"],
    "Purva Ashadha": ["Bhuvana","Bhuvika","Bhumika","Bhavani","Bhavana","Bhavika","Bhavya","Bhakti","Bhargavi","Bharati","Bhanupriya","Bhanuja","Bhavitha","Bhavini","Bhoomika","Bhoomi","Bhuvi","Bhairavi","Bhagyashree","Dhanya","Dhanvi","Dharani","Dharika","Dhriti","Dhwani","Dhyana","Dhyuti","Diksha","Divya","Divisha","Divija","Diya","Disha","Deepa","Deepika","Deepti","Devika","Devanshi","Devyani","Daksha","Dakshita","Damini","Darshana","Darshini","Dhatri","Dhairya","Dhvani","Drishti","Durga"],
    "Uttara Ashadha": ["Bhuvana","Bhumika","Bhoomi","Bhavani","Bhavana","Bhavika","Bhavini","Bhavya","Bhakti","Bhargavi","Bharati","Bhanupriya","Bhanvi","Bhavitha","Bhairavi","Bhagyashree","Bhuvika","Bhuvi","Bina","Binita","Bindiya","Bindhu","Binisha","Brinda","Brindha","Brishti","Bhumija","Bhoomika","Bhupali","Bhupika","Bhushana","Bhushita","Bhavisha","Bhavitha","Bhavini","Bhavika","Bhavana","Bhavya","Bhakti","Bhargavi","Bharathi","Bhanuja","Bhanumathi","Bhanupriya","Bhairavi","Bhagyashree","Bhuvana","Bhuvika","Bhumika","Bhoomi"],
    "Shravana": ["Juhi","Jui","Jwala","Jwalamukhi","Jyoti","Jyotika","Jyotsna","Jhanvi","Jhanvika","Jharna","Jhilmil","Jigna","Jivika","Jiya","Jiyana","Jivisha","Jnana","Jnanavi","Jagruti","Jagriti","Janaki","Janhavi","Janisha","Janvi","Jasika","Jasmin","Jasmine","Jaya","Jayanti","Jayashree","Jayika","Jeevika","Jeevitha","Jeevana","Jeevanika","Jhanak","Jheel","Jigyasa","Jinal","Jinisha","Jivani","Jivitha","Joshika","Juhi","Jyothi","Jyotirmayi","Jothika","Jagravi","Janitha"],
    "Dhanishta": ["Gaayatri","Gagana","Gauri","Gaurika","Gayatri","Geeta","Geetika","Geetanjali","Gehna","Gitanjali","Girija","Gopika","Gowri","Grishma","Gunika","Gunjan","Gunjika","Gunjita","Gurleen","Chaitali","Chaitra","Chandana","Chandni","Charita","Charitha","Charvi","Chaya","Chetana","Chetna","Chinmayi","Chitra","Chitrali","Chitrangada","Chitrika","Chhavi","Chhaya","Charulata","Charushila","Charmi","Chandrika","Chandrima","Chandra","Chinmayi","Chaitanya","Chahana","Chaitravi"],
    "Shatabhisha": ["Goja","Gouri","Gopika","Goushika","Saachi","Saadhana","Saakshi","Saanya","Saarika","Saanvi","Sadhika","Sahana","Sakshi","Saloni","Samaira","Samanya","Sameera","Samhita","Samiksha","Samira","Sana","Sanaya","Sandhya","Sanika","Sanjana","Sanjitha","Sanskriti","Sanvi","Sara","Saranya","Sarika","Sarita","Sarojini","Sashi","Shalini","Shambhavi","Shankari","Sharanya","Sharika","Sharmila","Shreya","Shriya","Shristi","Shruti","Simran","Siya","Sohini","Sonali","Soumya","Suhani"],
    "Purva Bhadrapada": ["Sejal","Seema","Seher","Sesha","Seshika","Setu","Siya","Simran","Sia","Siyana","Sohini","Sonali","Sonam","Soumya","Suhani","Sujata","Sukanya","Sukriti","Suma","Sumana","Sumathi","Sunaina","Sunanda","Sunita","Supriya","Surabhi","Suraksha","Suravi","Surbhi","Sushmita","Sushma","Swara","Swarna","Swati","Swetha","Saachi","Saadhana","Saakshi","Saanya","Saarika","Saanvi","Sahana","Sakshi","Saloni","Samaira","Sameera","Samhita","Samiksha","Sanaya","Sanjana"],
    "Uttara Bhadrapada": ["Duha","Dulari","Durgika","Durga","Duhita","Deepa","Deepika","Deepti","Devika","Devanshi","Divya","Diya","Disha","Dhanya","Dhanvi","Dharani","Dhara","Dharika","Dhriti","Dhwani","Dhyana","Dhyuti","Diksha","Divisha","Divija","Drishti","Drishya","Daksha","Dakshita","Damini","Damayanti","Darika","Darshana","Darshini","Devyani","Dhatri","Dhairya","Dhvani","Dimple","Dipali","Diptika","Divitha","Dhanika","Dharini","Dhruti","Dhruvika","Ditya","Diti"],
    "Revati": ["Deeksha","Deepa","Deepika","Deepti","Devika","Devina","Devanshi","Devyani","Diya","Disha","Divya","Divisha","Divija","Ditya","Diti","Dhanvi","Dhanya","Dharani","Dharika","Dhriti","Dhruti","Dhwani","Dhyana","Dhyuti","Diksha","Drishti","Drishya","Durga","Daksha","Dakshita","Damini","Damayanti","Darika","Darshana","Darshini","Dhatri","Dhairya","Dhvani","Dhanika","Dhara","Dharini","Dhruvika","Diptika","Divitha","Devika","Devanshika","Deekshita","Deepali","Deepthi","Durgika"],
  },
  boy: {
    "Ashwini": ["Chudamani","Chetan","Chetak","Chetas","Chetanraj","Cholan","Chokkan","Choudesh","Chudesh","Chaitanya","Chaitin","Chaitesh","Laksh","Lakshman","Lakshit","Lakshya","Lakshith","Lakshmikant","Lalit","Lalith","Laxman","Lavesh","Lav","Lavan","Lavin","Lavish","Lavit","Layan","Layak","Lohit","Lohith","Lokesh","Loknath","Lokendra","Lokesha","Lokeshwar","Lakhan","Lakshendra","Laladitya","Lalitya","Lavanesh","Lavendra","Lakshdeep","Lakshraj","Lakshveer","Likhit","Likhith"],
    "Bharani": ["Likhit","Likhith","Likesh","Lilesh","Lijin","Likhesh","Liyan","Liyansh","Litesh","Litin","Luv","Luvansh","Luvish","Luvin","Luvraj","Luvendra","Luthesh","Luhit","Luhith","Luvik","Lekh","Lekhan","Lekhraj","Lekhit","Leeladhar","Leelesh","Lehar","Lehesh","Levan","Levesh","Lokesh","Lokan","Lokendra","Lokeshwar","Loknath","Lohit","Lohith","Lohesh","Lohan","Lohendra","Lomesh","Lokesha","Lokraj","Lovesh","Lovit","Lovin","Lonav","Lohanesh","Lohansh"],
    "Krittika": ["Aarav","Aaryan","Aayush","Abhay","Abhinav","Abhishek","Adarsh","Aditya","Advait","Advik","Agastya","Ahan","Ajay","Akash","Akhil","Akshay","Alok","Amar","Amay","Amit","Amogh","Anand","Anay","Aniket","Anirudh","Anish","Ankit","Anmol","Ansh","Anshul","Arav","Arhaan","Arjun","Arnav","Aryan","Atharv","Avinash","Avyan","Ayansh","Ayaan","Eeshan","Eshan","Ekansh","Eklavya","Eshwar","Eshaan","Uday","Ujjwal","Umesh","Utkarsh"],
    "Rohini": ["Om","Omkar","Ojas","Ojaswin","Omesh","Ovi","Ovin","Ovesh","Ojasraj","Omendra","Vaibhav","Vaidik","Vaikunth","Vairaj","Vaishnav","Valmik","Vansh","Varad","Varun","Vatsal","Ved","Vedant","Vedansh","Vedarth","Veer","Veeraj","Veeran","Vihan","Vijay","Vikas","Vikram","Vimal","Vinay","Vineet","Vinit","Vinod","Vipul","Viraj","Virat","Vishal","Vishesh","Vishnu","Vivan","Vivaan","Vivek","Vivin","Viyan","Viraat","Vishwa"],
    "Mrigashira": ["Ved","Vedant","Vedansh","Vedarth","Vedesh","Vedik","Veer","Veeraj","Veeran","Veerendra","Venkat","Venkatesh","Venish","Venu","Vihan","Vihang","Vimal","Vinay","Vineet","Vinit","Kairav","Kairan","Kaivalya","Kalyan","Kamal","Kanan","Kanishk","Karan","Karthik","Kartikeya","Karun","Kashyap","Kavin","Kavish","Kedar","Keshav","Keyan","Kiaan","Kian","Kiran","Kishan","Kishore","Kunal","Kush","Kushal","Kushaan","Kirit","Kiyan","Kirat"],
    "Ardra": ["Kunal","Kuber","Kumar","Kumaran","Kusha","Kush","Kushal","Kushagra","Kunalraj","Kunj","Gagan","Gajendra","Ganesh","Gaurav","Gautam","Gautham","Girish","Gireesh","Gokul","Gopal","Govind","Guhan","Guna","Gunasekar","Gunjan","Gurdeep","Gurdev","Gurkirat","Gurmeet","Gurpreet","Ghanshyam","Ghanesh","Ghanendra","Ghanraj","Ghatak","Chaitanya","Chandan","Chandran","Charan","Charith","Chetan","Chetak","Chirag","Chiranjiv","Chiranjeevi","Cholan","Chaitesh","Chaitin","Chandra"],
    "Punarvasu": ["Keshav","Ketan","Kewal","Kedar","Keerth","Keerthan","Keshan","Keshin","Keshavraj","Keyan","Kovid","Koushik","Harsh","Harshit","Harshad","Hari","Harin","Harindra","Harish","Harivansh","Harivardhan","Harikrishna","Hardeep","Hardik","Hargun","Hemanth","Hemant","Hemendra","Himanshu","Himesh","Hiran","Hiren","Hitesh","Hitendra","Hridhaan","Hriday","Hrishikesh","Hritik","Himmat","Hiranmay","Himadri","Hiral","Hishaan","Hiyan","Hivaan"],
    "Pushya": ["Huzefa","Huvin","Huvan","Hemanth","Hemant","Hemendra","Hemesh","Hemraj","Hemadri","Hemanshu","Hoshang","Homan","Homi","Hoshit","Hovik","Hovesh","Daksh","Dakshit","Dakshesh","Daman","Damodar","Darsh","Darshan","Darshil","Darpan","Dattatreya","Daya","Dayanand","Deep","Deepak","Deepesh","Dev","Devaansh","Devansh","Devendra","Devraj","Dhanush","Dhanvin","Dhruv","Dhruva","Dhruvan","Dheer","Dheeraj","Dhairya","Dhaval","Dhiren","Dinesh","Divit","Divyansh","Dwij"],
    "Ashlesha": ["Daksh","Dakshit","Daman","Darsh","Darshan","Darshil","Darpan","Daya","Dayanand","Deep","Deepak","Deepesh","Dev","Devaansh","Devansh","Devendra","Devraj","Devesh","Devik","Devit","Dheer","Dheeraj","Dhruv","Dhruvan","Dhruva","Dinesh","Dhanush","Dhanvin","Divit","Divyansh","Ditya","Divesh","Dikshit","Dileep","Dushyant","Durgesh","Durgaprasad","Durgan","Dovesh","Doran","Dolesh","Doreesh","Dron","Drona","Dronesh","Doyel","Dorai","Doshit"],
    "Magha": ["Aarav","Madhav","Madan","Mahesh","Mahir","Mahin","Maitreya","Manan","Manas","Manav","Mandeep","Mandar","Manish","Manjunath","Manoj","Manohar","Mayank","Mayur","Medhansh","Mihir","Milan","Milind","Miraj","Mitesh","Mithil","Mithun","Mohan","Mohit","Moksh","Monish","Mridul","Mrinal","Mukesh","Mukul","Mudit","Mukund","Murali","Murugan","Mahadev","Mahendra","Mahipal","Mahit","Maulik","Mayuresh","Megh","Meghraj","Mehool","Mohanish","Mohesh","Mokshit"],
    "Purva Phalguni": ["Mohan","Mohit","Moksh","Monish","Monu","Mohesh","Mohanraj","Mohnish","Mohak","Mohitraj","Tanish","Tanishq","Tanuj","Tanmay","Tanay","Tarun","Tarak","Taran","Tarpan","Tathagata","Tejas","Tej","Tejendra","Tejaswin","Teerth","Tilak","Tirth","Tirthankar","Tushar","Tushit","Tuhin","Tushal","Tuvik","Tuvansh","Tuvan","Tushant","Tushir","Tushya","Tanu","Tanush","Tapas","Tapesh","Tarakesh","Tarunesh","Tejasraj","Tilakraj","Tiyansh","Tuvin"],
    "Uttara Phalguni": ["Tejas","Tej","Tejendra","Tejaswin","Teerth","Teerthan","Tejomay","Tejraj","Tejasveer","Tejash","Tohit","Toman","Toshit","Tovin","Tovik","Tohin","Tohar","Toshesh","Tohil","Toran","Parth","Parthiv","Parikshit","Parin","Parv","Parvesh","Pavan","Pavak","Pankaj","Pankit","Param","Paramesh","Paras","Piyush","Pinal","Pinak","Piyansh","Pritam","Prithvi","Pranav","Pranay","Prateek","Pratik","Pratham","Priyansh","Piyal","Pithesh"],
    "Hasta": ["Punit","Puneet","Puru","Purav","Purushottam","Pushkar","Pushpit","Pulkit","Pulakesh","Pujit","Shail","Shailesh","Shaurya","Shashank","Shashwat","Shayan","Shekhar","Shishir","Shiv","Shivaansh","Shivam","Shiven","Shivendra","Shlok","Shrey","Shreyansh","Shreyas","Shrikant","Shravan","Shubham","Shubh","Naman","Nandan","Nandish","Nakul","Naresh","Navin","Navneet","Naveen","Nayan","Neel","Neeraj","Nehal","Nirav","Nirbhay","Nishant","Nitesh","Nithin","Nikhil"],
    "Chitra": ["Peshwa","Peya","Peshan","Peshit","Poonam","Poojit","Poorav","Poshit","Poshak","Poman","Raghav","Raghunath","Raj","Rajan","Rajat","Rajeev","Rajesh","Rajiv","Rajveer","Rakesh","Raman","Ramesh","Ranbir","Ranjit","Rishi","Rishaan","Rishabh","Rishav","Ritesh","Ritvik","Rohan","Rohit","Ronit","Rudra","Rudraksh","Ruhan","Rishik","Riyan","Riyansh","Rituraj","Ronav","Rachit","Ranveer","Raunak","Ravin","Ravish","Reyansh","Rishwanth","Rithesh"],
    "Swati": ["Rudra","Rudraksh","Rudresh","Ruhan","Rujul","Rupesh","Rupin","Ruturaj","Ruchir","Ruchit","Reyansh","Rehaan","Rehan","Reet","Revan","Revanth","Revansh","Rishabh","Ritesh","Rithvik","Rohan","Rohit","Ronak","Ronit","Ronav","Roshit","Roshesh","Rohanesh","Roshan","Roshin","Tanish","Tanay","Tanmay","Tanuj","Tarun","Tarak","Taran","Tarpan","Tejas","Tej","Tejendra","Teerth","Tilak","Tirth","Tushar","Tushit","Tuhin","Tuvik","Tuvansh","Tushant"],
    "Vishakha": ["Tiaansh","Tihan","Tihir","Tilak","Timal","Tirth","Tirthankar","Tishan","Tishit","Tivan","Tuhin","Tushar","Tushit","Tushal","Tushant","Tuvik","Tuvansh","Tuvan","Tuvin","Tushir","Tejas","Tej","Tejendra","Tejaswin","Teerth","Teerthan","Tejomay","Tejraj","Tejasveer","Tejash","Tohit","Toman","Toshit","Tovin","Tovik","Tohin","Tohar","Toshesh","Tohil","Toran","Tanish","Tanmay","Tanay","Tarun","Tarak","Taran","Tarpan","Tanuj","Tapas","Tapesh"],
    "Anuradha": ["Naman","Nandan","Nandish","Nakul","Nalin","Narendra","Naresh","Narayan","Natesh","Naveen","Navin","Navneet","Navraj","Nayan","Neel","Neelesh","Neeraj","Nehal","Neerav","Nikhil","Nikesh","Nilesh","Nimit","Nipun","Niraj","Nirav","Nirbhay","Niren","Niranjan","Nishant","Nishit","Nitesh","Nithin","Nitin","Nivaan","Nivansh","Nivan","Nivish","Niyam","Niyansh","Noman","Nuh","Nupur","Nuresh","Nuthan","Nuvin","Nevan","Neer"],
    "Jyeshtha": ["Noman","Noor","Noshit","Noyan","Noyesh","Nomanraj","Noorish","Noyel","Nohit","Noshin","Yash","Yashas","Yashwant","Yashvardhan","Yashraj","Yashwin","Yatin","Yatendra","Yatish","Yashodhan","Yuvan","Yuvraj","Yuvansh","Yuvin","Yuvik","Yuvanesh","Yudhajit","Yudhish","Yudhishtir","Yukta","Yukesh","Yutish","Yuvanraj","Yuvendra","Yashdeep","Yashveer","Yashmit","Yashneel","Yashit","Yiyansh","Yitish","Yivan","Yishan","Yishit","Yuvraj","Yuvansh","Yuvik","Yuvin","Yuvan"],
    "Mula": ["Yesh","Yeshwanth","Yeshwant","Yogan","Yogesh","Yogendra","Yogin","Yojit","Yohan","Yomesh","Bharat","Bharath","Bhargav","Bhaskar","Bhavesh","Bhavin","Bhavik","Bhavish","Bheem","Bheeshma","Bhishma","Bhishak","Bhim","Bhimarjun","Bhupen","Bhupendra","Bhushan","Bhudev","Bhuman","Bhuvan","Bhuvnesh","Bhairav","Bhanu","Bhanudev","Bhanesh","Bhargesh","Bhaswar","Bhavya","Bhaveshwar","Bhadrak","Bhibhav","Bhuvanesh","Bhuvik","Bhuvesh","Bhupat","Bhupesh"],
    "Purva Ashadha": ["Bhuvan","Bhuvesh","Bhuvik","Bhuvnesh","Bhumesh","Bhudev","Bhupen","Bhupendra","Bhushan","Bhupat","Dhanush","Dhanvin","Dhanraj","Dhanesh","Dhananjay","Dhanvant","Dhairya","Dhruv","Dhruvan","Dheer","Dheeraj","Dhiren","Dhaval","Dhruva","Dhruvik","Dhruvansh","Dhyan","Dharmik","Dharmesh","Dharmendra","Phalak","Phanindra","Phanish","Phaneesh","Phanesh","Phool","Phoolchand","Phalguna","Phaniraj","Dhanush","Dhanvin","Dhruv","Dhruvik","Dhiraj","Dhairav","Dhanushraj","Dharm","Dhruvesh","Dhanveer"],
    "Uttara Ashadha": ["Bheem","Bheeshma","Bherav","Bheru","Bhetal","Bheresh","Bholanath","Bholenath","Bhoj","Bhoop","Bhoopal","Bhoomesh","Bhoresh","Bhotesh","Bhogesh","Bhoman","Bhovik","Bhuvan","Bhuvesh","Jagan","Jagat","Jagdish","Jagannath","Jai","Jaidev","Jaikishan","Jainil","Jairaj","Jaisal","Jatin","Jay","Jayant","Jayesh","Jaydeep","Jayendra","Jayanth","Jigar","Jignesh","Jishnu","Jitendra","Jitesh","Jivin","Jiyaan","Jivansh","Jivraj","Jishan","Jihan"],
    "Shravana": ["Juhi","Jugal","Junaid","Juvan","Juvin","Jujhar","Jupesh","Juresh","Jeet","Jeetendra","Jeevan","Jeev","Jeevansh","Jeyan","Jeyesh","Jignesh","Jitesh","Jiten","Jivaan","Jivansh","Jodh","Jogen","Jogesh","Joman","Joravar","Josh","Joshua","Joshan","Jovin","Jovan","Ghanesh","Ghanshyam","Ghanendra","Ghanraj","Ghatak","Ghanan","Ghaneshwar","Ghanak","Ghanit","Gaurav","Gautam","Ganesh","Gagan","Girish","Gireesh","Gokul","Govind","Gopal","Guhan"],
    "Dhanishta": ["Gagan","Gajendra","Ganesh","Gaurav","Gautam","Gautham","Gavesh","Gaganesh","Gajesh","Gajan","Gireesh","Girish","Giri","Gitesh","Gitan","Givaan","Giyan","Gihan","Giriansh","Girivardhan","Guhan","Gukesh","Gulshan","Gunesh","Gunjan","Gurdeep","Gurdev","Gurkirat","Gurmeet","Gurpreet","Guneet","Guneshwar","Gopal","Govind","Gokul","Gomesh","Gokesh","Gopinath","Goutam","Gourav","Geet","Geetesh","Geyan","Geyaan","Geshan","Gevish","Gehan","Geshav"],
    "Shatabhisha": ["Gopal","Govind","Gokul","Gopinath","Goutham","Gaurav","Gokesh","Goman","Govan","Govesh","Saahil","Saajan","Saanidhya","Saarthak","Sachin","Sagar","Sahaj","Sahil","Sai","Saikiran","Sairaj","Samarth","Sameer","Samar","Samay","Sambhav","Samir","Sanjay","Sankalp","Sanket","Sarthak","Sarvesh","Satish","Satyam","Shaurya","Siddharth","Siddhant","Sidharth","Simran","Soham","Sohit","Somesh","Sourabh","Souvik","Subhash","Sudhir","Suhaan","Suhas","Sumit","Suraj"],
    "Purva Bhadrapada": ["Sehaj","Sejal","Semil","Senan","Sevan","Sevanth","Sesh","Seshadri","Seshagiri","Setu","Soham","Sohan","Sohit","Som","Somesh","Somnath","Sourabh","Sourav","Souvik","Sovit","Daksh","Dakshit","Daman","Darsh","Darshan","Darshil","Darpan","Datt","Dattatreya","Daya","Dayanand","Deep","Deepak","Deepesh","Dev","Devansh","Devendra","Devraj","Devesh","Dhruv","Dhiraj","Dheer","Dhanush","Dhanvin","Divit","Divyansh","Ditya","Divesh","Dikshit","Dinesh"],
    "Uttara Bhadrapada": ["Dushyant","Durg","Durgesh","Durlabh","Duhshasan","Dushyanth","Dushy","Duvin","Duvan","Duvansh","Tharun","Tharunesh","Thaman","Thanish","Tharvesh","Thayan","Thiyagu","Thiru","Thirumal","Thirunavukarasu","Jhanak","Jhanish","Jhanit","Jhanesh","Jhalak","Jignesh","Jishnu","Jishan","Jiten","Jitesh","Daksh","Dakshit","Daman","Darsh","Darshan","Darshil","Darpan","Daya","Dayanand","Deep","Deepak","Deepesh","Dev","Devansh","Devendra","Devraj","Dheer","Dheeraj","Dhruv","Dhanush"],
    "Revati": ["Dev","Devaansh","Devansh","Devendra","Devraj","Devesh","Devik","Devit","Devarsh","Deveshwar","Deep","Deepak","Deepesh","Deependra","Deenanath","Deen","Deekshith","Devaraj","Devan","Devanshu","Dohan","Doman","Dores","Dorai","Dovesh","Dron","Dronesh","Doshit","Doyel","Dovik","Chaitanya","Chaitesh","Chaitin","Chandan","Chandran","Charan","Charith","Chetan","Chetak","Chirag","Chiranjiv","Chiranjeev","Chiranjeevi","Cholan","Choudesh","Chudesh","Chiranjeet","Chaitvik","Chitrak"],
  },
};

const BABY_NAMES_TA: Record<"girl" | "boy", Record<string, string[]>> = {
  girl: {
    "Ashwini": ["ஆத்யா","ஆஹநா","ஆக்ரிதி","ஆந்யா","ஆரத்யா","ஆரிநி","ஆர்நா","ஆர்யா","ஆஷிகா","ஆஸ்தா","அதிதி","அத்விகா","அஹநா","அகந்க்ஷா","அக்ஷரா","அக்ஷயா","அலிநா","அமயா","அம்ரிதா","அநகா","அநந்யா","அநிகா","அநிஷா","அஞலி","அந்விகா","அந்யா","அபர்நா","அரதநா","அரியா","அரிகா","அர்பிதா","அர்யா","அஷிகா","அஷிதா","அஷ்நா","அவநி","அவிகா","அவிஷா","அயநா","அய்ரா","அயெஷா","ஆர்நா","ஆருஷி","ஐஷநி","ஐஷ்வர்யா","அகிலா","அமிஷா","அந்விதா","அரத்யா","அதிரா"],
    "Bharani": ["லிகிதா","லிகிஷா","லிநா","லிஷா","லியநா","லிபிகா","லிதிகா","லிதிஷா","லிவா","லியா","லியநா","லிகிதா","லிலா","லீலா","லெகா","லெக்யா","லெநா","லீஷா","லெஹர்","லெஹெர்","லெஒநா","லெஷா","லெதிகா","லெயா","லெயநா","லெயா","லொசநா","லொஹிதா","லொஹிநி","லொபமுத்ரா","லொரிகா","லொநா","லொவிகா","லொவிஷா","லொஉக்யா","லொஉகிகா","லொஉஇஸா","லொபா","லொபிகா","லுவிகா","லுப்நா","லுஹிதா","லுலிகா","லுவந்யா","லுவிநா","லுவிஷா","லுவிதா","லெயா","லிஷா","லொஹநா"],
    "Krittika": ["ஆதிரா","ஆத்யா","ஆஹநா","ஆரத்யா","ஆர்நா","ஆர்யா","ஆஷி","ஆஷிகா","ஆஸ்தா","அதிதி","அத்விகா","அஹல்யா","அஹநா","ஐஷநி","ஐஷ்வர்யா","அகந்க்ஷா","அகிலா","அகிரா","அக்ஷரா","அக்ஷயா","அலிநா","அமரா","அமயா","அமிஷா","அம்ரிதா","அநகா","அநந்யா","அநிகா","அநிஷா","அஞலி","அந்விகா","அந்யா","அபர்நா","அரதநா","அரியா","அரிகா","அர்பிதா","அர்யா","ஈஷா","எஷநி","எஷிகா","எஷிதா","எஷ்வரி","எக்தா","எகிஷா","எவநியா","உர்மிலா","உர்வஷி","உஷா","உதரா"],
    "Rohini": ["ஒஜஸ்வி","ஒவியா","ஊர்ஜா","ஊர்வி","ஒஜஸ்விநி","ஒஇந்த்ரிலா","ஒமிஷா","ஒமிகா","ஒவி","ஊர்ஜா","வைதெஹி","வைஷ்நவி","வைஷலி","வமிகா","வநி","வநஜா","வர்ஷா","வர்ஷிநி","வஸுதா","வஸுந்தரா","வெதிகா","வீநா","வெதா","வெதந்ஷி","வித்யா","விதி","விதிஷா","விஹநா","விஹநி","விஜயலக்ஷ்மி","விகஸிநி","விமலா","விநயா","விநீதா","விநிஷா","விநி","வந்யா","வர்நிகா","வரிகா","வஸவி","விபா","விபுதி","விதத்ரி","விதுலா","விநா","வ்ரிதிகா","வ்ரிந்தா","வ்ருஷ்தி","வ்ரித்தி","வ்யொமா"],
    "Mrigashira": ["வீரா","வெதா","வெதிகா","வெதந்ஷி","வெநி","வெநிகா","வெந்நெலா","விஹநா","விஹநி","விநி","விநயா","விநீதா","விநிஷா","விஷ்வா","விசாகம்","விஷலி","விஷ்நுப்ரியா","விஸ்மயா","விஷ்தி","வ்ரிதிகா","காவ்யா","கைரா","கைரவி","கலிகா","கல்பநா","கமிநி","கநிகா","கந்யா","கரிஷ்மா","கவிகா","கவிநி","கவிஷா","கவிதா","கவ்யஷ்ரீ","கீர்தி","கீர்தநா","கெதகி","க்யதி","கிஅரா","கிரந்மயி","கிர்தி","கொமல்","கொகிலா","க்ரிபா","க்ரிஷா","க்ரிதி","க்ரிதிகா","குமரி","குஸுமா","க்ய்ரா"],
    "Ardra": ["குஜா","குமரி","குமுதா","குந்தா","குஞல்","குஞிகா","குஷா","குஷலா","குஷலி","குஸுமா","ககநா","கௌரி","கயத்ரி","கீதிகா","கீதஞலி","கிதலி","கிதஞலி","கிரிஜா","கிரீஷா","கொபிகா","கொவ்ரி","க்ரிஷ்மா","குநிகா","குஞந்","குஞிதா","குர்லீந்","கௌரி","கர்கி","கரிமா","கயநா","கீதா","கெஹ்நா","கிதலி","கொபிகா","க்ரீஷ்மா","க்ரிஹலக்ஷ்மி","குஹிகா","குலிகா","குநிதா","க்யநிகா","க்யநவி","கௌரிகா","கௌதமி","கஜலக்ஷ்மி","கஙா","கஙிகா","கர்கீ","கௌரி","கௌரவி","குஞிகா"],
    "Punarvasu": ["கீர்தி","கீர்தநா","கீர்திகா","கெஷவி","கெதகி","க்யதி","கிஅரா","கிரந்","கிரந்மயி","கிர்தி","கிர்தநா","கியா","கியரா","கொமல்","கொகிலா","க்ரிபா","க்ரிஷிகா","க்ரிஷ்நா","க்ரிஷா","க்ரிதி","க்ரிதிகா","க்ரிதிகா","க்ருபா","குஹு","குமரி","குமுதா","குந்தா","குஞல்","குஸுமா","கவெரி","கவ்யா","கவிகா","கவிநி","கவிஷா","கலிகா","கல்பநா","கம்யா","கநிகா","கரிஷ்மா","கருநா","கௌஷிகி","கௌஸல்யா","கல்யநி","கஷிகா","கஷ்வி","கஷி","கவநா","கவ்யஷ்ரீ","கைரவி","கைரா"],
    "Pushya": ["ஹுவி","ஹுமா","ஹெமா","ஹெமலதா","ஹெமஙி","ஹெமந்தி","ஹெமஷ்ரீ","ஹிரல்","ஹிதா","ஹிதா","ஹ்ரித்யா","ஹ்ரிதயா","ஹ்ரிதிகா","ஹ்ரித்விகா","ஹம்ஸிகா","ஹம்ஸிநி","ஹந்ஸிகா","ஹரிநி","ஹரிப்ரியா","ஹரிதா","ஹர்ஷிகா","ஹர்ஷிதா","ஹஸிநி","ஹெமா","ஹெமிகா","ஹெநா","ஹெதல்","ஹிமா","ஹிமநி","ஹிமந்ஷி","ஹிந்தவி","ஹிரல்","ஹிரந்யா","ஹிதா","ஹியந்ஷி","ஹ்ரித்வி","ஹ்ரிஷிகா","ஹ்ருதயா","ஹ்ருத்விகா","ஹுமா","ஹுமைரா","ஹம்ஸா","ஹரிகா","ஹர்ஷலி","ஹர்ஸிகா","ஹவ்யிகா","ஹயா","ஹயதி","ஹிரலிகா","ஹ்ரித்விகா"],
    "Ashlesha": ["தியா","திஷா","திவ்யா","திவிஷா","திவிஜா","தித்யா","திதி","திபிகா","தீபா","தீபிகா","தீப்தி","தீப்தி","தெவிகா","தெவிநா","தெவந்ஷி","தெவ்யநி","தந்யா","தந்வி","தநிகா","தரநி","தரிகா","த்ரிதி","த்ருதி","த்வநி","த்யநா","த்யுதி","திக்ஷா","திம்ப்லெ","திஷா","திவிஷா","த்ரிஷ்தி","த்ரிஷ்யா","துர்கா","துர்கிகா","தக்ஷா","தக்ஷிதா","தமிநி","தமயந்தி","தரிகா","தர்ஷநா","தர்ஷிநி","தீபலி","தீவிகா","தெவகி","தெவந்ஷிகா","தெவிகா","தைர்யா","தந்யா","தத்ரி","த்வநி"],
    "Magha": ["மாஹி","மாந்யா","மதவி","மதுரா","மதுரி","மஹலக்ஷ்மி","மஹதி","மஹிகா","மஹிமா","மைத்ரெயி","மலவிகா","மலிநி","மல்லிகா","மமதா","மநஸா","மநஸ்வி","மந்திரா","மநிஷா","மஞரி","மஞு","மந்யா","மரிஷா","மெதா","மெதவி","மெகா","மெகநா","மீரா","மீநக்ஷி","மீரா","மிஹிகா","மிஹிரா","மிநல்","மிநிஷா","மிரா","மிஷிகா","மிதலி","மிதிலா","மொஹநா","மொஹிநி","மொக்ஷா","மொநிகா","ம்ரிதுலா","ம்ரிநல்","ம்ரிநலிநி","முதிதா","முக்தா","முக்திகா","ம்ய்ரா","ம்ய்திலி","மைதிலி"],
    "Purva Phalguni": ["மொஹா","மொஹநா","மொஹிநி","மொநிகா","மொநிகா","மொஉநிகா","மொஉலி","மொஉமிதா","மொஉலிஷா","ம்ரிதுலா","ம்ரித்வி","ம்ரிநல்","ம்ரிநலிநி","ம்ய்ரா","ம்ய்ஷா","மீரா","மெகா","மெகநா","மிஹிகா","மிஷா","மிதலி","மிதிலா","மித்ரா","மொக்ஷா","மல்லிகா","மலிநி","மநஸா","மநிஷா","மஞரி","மந்யா","மதவி","மதுரா","மஹிகா","மஹிமா","மைதிலி","மாந்யா","மாஹி","மெதா","மெதவி","மிரா","மிரயா","மிஷ்கா","மிஷிகா","மொஹிதா","மொக்ஷிதா","மொநிஷா","மொஉநிகா","ம்ரிநலிகா","ம்ரித்திகா","ம்ய்த்ரயி"],
    "Uttara Phalguni": ["தெஜஸ்வி","தெஜஸ்விநி","தெஜல்","தீர்தா","தீர்திகா","தெஷிகா","தியா","திஅநா","திஷா","திஷநி","தொஷிகா","தொஷநி","துஹிநா","துலிகா","துல்ஸி","தநயா","தநிகா","தநிஷா","தந்யா","தபஸ்யா","தரா","தரிகா","தரிநி","தஷி","தவிஷா","தீநா","தெஜலிகா","தெஜஸ்யா","தரிகா","தரிநி","தியா","திநா","திதி","தித்லி","த்ரிஷா","த்ரிஷலா","த்ரிவெநி","த்ருப்தி","துலஸி","த்வெஷா","த்வெஷி","த்விஷா","தந்வி","தநுஜா","தபதி","தருநா","தநிஷ்கா","தநிஷி","த்வரிதா","த்விஷா"],
    "Hasta": ["புஜா","புஜிதா","புர்நிமா","புர்நவி","புர்நா","புஷ்தி","புஷ்பா","புஷ்பிகா","புந்யா","புநிதா","புர்நிகா","புர்நிமா","பவநி","பவிகா","பவித்ரா","பத்மிநி","பத்மா","பத்மவதி","பத்மிகா","பல்லவி","பரிநிதா","பரிஷா","பர்வதி","பர்நிகா","பர்நவி","பருல்","பவி","பவநி","பயல்","ப்ரபா","ப்ரக்நா","ப்ரகதி","ப்ரசி","ப்ரநவி","ப்ரர்தநா","ப்ரீதி","ப்ரெக்ஷா","ப்ரியா","ப்ரியந்கா","ப்ரிஷா","ப்ரிதிகா","ப்ரிதி","புந்யா","புஸ்பா","புர்நஷ்ரீ","புர்வி","புர்விகா","பத்மிநிகா","பஹல்","பர்நிதா"],
    "Chitra": ["பெஹல்","பெயா","பியா","பிஹு","பிஹிகா","பூஜா","பூநம்","பூர்நா","பூர்வி","பொஉஷலி","ப்ரியா","ப்ரியந்கா","ப்ரியஷா","ப்ரிஷா","ப்ரிஷிகா","ப்ரநவி","ப்ரர்தநா","ப்ரதிகா","ப்ரதிபா","ப்ரத்யுஷா","ப்ரீதி","ப்ரெக்ஷா","ப்ரெமா","ப்ரெநா","ப்ரெரநா","புர்நிமா","புர்நவி","புர்வி","புஷ்தி","புந்யா","பல்லவி","பத்மிநி","பத்மா","பத்மிகா","பரிநிதா","பரிஷா","பர்வதி","பர்நிகா","பவநி","பவிகா","பவித்ரா","பயல்","பிஹு","பிக்ஷா","பிநல்","பியா","பியலி","பூஜா","பூர்விகா","ப்ரநிகா"],
    "Swati": ["ருஹி","ருசி","ருசிகா","ருஜுதா","ருக்மிநி","ருமா","ருபா","ருபலி","ருபிகா","ருதுஜா","ருது","ரியா","ரியந்கா","ரிஷிகா","ரிஷிதா","ரிதிமா","ரித்தி","ரித்திமா","ரியா","ரியாநிகா","ரீமா","ரீநா","ரீதிகா","ரெகா","ரெநு","ரெநுகா","ரெவதி","ர்ஹெஆ","ரியா","ரிசா","ரிது","ரிதிகா","ரிதிகா","ரியா","ரோகிணி","ரொஷிநி","ரொஷிகா","ரொஷிதா","ரொஷ்நி","ரொஷிகா","ருபல்","ருப்ஸா","ரஞநி","ரஞிகா","ரக்ஷா","ரக்ஷிதா","ரம்யா","ரஞிதா","ரஷி","ரஷ்மி"],
    "Vishakha": ["திஅரா","திஅநா","தியா","திஷா","திஷ்யா","தொஷிகா","தொஷநி","துஹி","துஹிநா","துலிகா","துல்ஸி","த்வெஷா","த்வெஷி","த்விஷா","தெஜஸ்வி","தெஜஸ்விநி","தெஜல்","தீர்தா","தநயா","தநிகா","தநிஷா","தந்யா","தந்வி","தபஸ்யா","தரா","தரிகா","தரிநி","தஷி","தவிஷா","தநுஜா","தபதி","தநிஷ்கா","தநிஷி","தரிகா","தரிநி","தியா","திதி","த்ரிஷா","த்ரிஷலா","த்ரிவெநி","த்ருப்தி","த்வரிதா","த்விஷா","த்வெஷிகா","தீநா","திஅநா","தியரா","தொஷிதா","துலஜா","துஷிதா"],
    "Anuradha": ["நைஷா","நைநா","நந்திநி","நந்திதா","நவ்யா","நவிகா","நவிஷா","நயந்தரா","நயநா","நீலா","நீலம்","நீலிமா","நீரஜா","நெஹா","நிஹரிகா","நிகிதா","நிலா","நிலஞநா","நிலஷா","நிஷா","நிஷிகா","நிஷிதா","நித்யா","நிவெதிதா","நிவ்யா","நியதி","நுபுர்","நுதந்","ந்ய்ரா","ந்ய்ஸா","நம்ரதா","நமிதா","நந்தநா","நந்திதா","நந்திகா","நர்மதா","நதஷா","நவிநா","நீலக்ஷி","நீரவி","நிரஞநா","நிர்மலா","நிருபமா","நித்யா","நித்யா","நிவெதா","நிவெதா","நிஹரிகா","நிஹரிநி","நந்திகா"],
    "Jyeshtha": ["நூபுர்","நொமா","நொஷிகா","நுபுர்","நித்யா","நியதி","நிஷா","நிஷிதா","நிஷ்கா","நிஷிகா","நிஹரிகா","நிஹரிநி","நிகிதா","நிலா","நிலிமா","நிலஞநா","நெஹா","நீலிமா","நீரஜா","நீரவி","நவ்யா","நவிகா","நவிஷா","நந்திநி","நந்திதா","நந்தநா","நந்திகா","நயநா","நயந்தரா","நைஷா","நைநா","நமிதா","நம்ரதா","நர்மதா","நதஷா","நிவெதிதா","நிவெதா","நிவெதா","நிவ்யா","நிரஞநா","நிர்மலா","நிருபமா","நித்யா","ந்ய்ரா","ந்ய்ஸா","நந்திகா","நவிநா","நீலக்ஷி","நொஷிதா","நுபுரிகா"],
    "Mula": ["யெவா","யெஷிகா","யெஷிதா","யஷிகா","யஷிதா","யஷ்வி","யஷஸ்வி","யமி","யமிநி","யமிகா","யமுநா","யநா","யநைகா","யதிகா","யதிகா","யத்ரா","யுதிகா","யுக்தா","யுக்தி","யுவிகா","யுவிநா","யுவிஷா","யுவநி","யொஜநா","யொகிதா","யொகிநி","யொகீதா","யஷஸ்விநி","யஷொதா","யஷொதரா","யஷிகா","யஷ்மிதா","யஷ்வி","யதர்தி","யவநா","யவிகா","யவிஷா","யொஜிதா","யொஸிதா","யொவநா","யுவதி","யுவிகா","யுவிஷா","யுக்தா","யுக்ஷிதா","யுக்திகா","யுதிகா","யுதிகா","யுவந்யா","யஷிகா"],
    "Purva Ashadha": ["புவநா","புவிகா","புமிகா","பவநி","பவநா","பவிகா","பவ்யா","பக்தி","பர்கவி","பரதி","பநுப்ரியா","பநுஜா","பவிதா","பவிநி","பூமிகா","பூமி","புவி","புவிகா","பைரவி","பக்யஷ்ரீ","தந்யா","தந்வி","தரநி","தரிகா","த்ரிதி","த்வநி","த்யநா","த்யுதி","திக்ஷா","திவ்யா","திவிஷா","திவிஜா","தியா","திஷா","தீபா","தீபிகா","தீப்தி","தெவிகா","தெவந்ஷி","தெவ்யநி","தக்ஷா","தக்ஷிதா","தமிநி","தர்ஷநா","தர்ஷிநி","தத்ரி","தைர்யா","த்வநி","த்ரிஷ்தி","துர்கா"],
    "Uttara Ashadha": ["புவநா","புமிகா","பூமி","பவநி","பவநா","பவிகா","பவிநி","பவ்யா","பக்தி","பர்கவி","பரதி","பநுப்ரியா","பந்வி","பவிதா","பைரவி","பக்யஷ்ரீ","புவிகா","புவி","பிநா","பிநிதா","பிந்தியா","பிந்து","பிநிஷா","ப்ரிந்தா","ப்ரிந்தா","ப்ரிஷ்தி","புமிஜா","பூமிகா","புபலி","புபிகா","புஷநா","புஷிதா","பவிஷா","பவிதா","பவிநி","பவிகா","பவநா","பவ்யா","பக்தி","பர்கவி","பரதி","பநுஜா","பநுமதி","பநுப்ரியா","பைரவி","பக்யஷ்ரீ","புவநா","புவிகா","புமிகா","பூமி"],
    "Shravana": ["ஜுஹி","ஜுஇ","ஜ்வலா","ஜ்வலமுகி","ஜ்யொதி","ஜ்யொதிகா","ஜ்யொத்ஸ்நா","ஜந்வி","ஜந்விகா","ஜர்நா","ஜில்மில்","ஜிக்நா","ஜிவிகா","ஜியா","ஜியநா","ஜிவிஷா","ஜிவிகா","ஜ்நநா","ஜ்நநவி","ஜக்ருதி","ஜக்ரிதி","ஜநகி","ஜந்ஹவி","ஜநிஷா","ஜந்வி","ஜஸிகா","ஜஸ்மிந்","ஜஸ்மிநெ","ஜயா","ஜயந்தி","ஜயஷ்ரீ","ஜயிகா","ஜீவிகா","ஜீவிதா","ஜீவநா","ஜீவநிகா","ஜநக்","ஜீல்","ஜிக்யஸா","ஜிநல்","ஜிநிஷா","ஜிவநி","ஜிவிதா","ஜொஷிகா","ஜுஹி","ஜ்யொதி","ஜ்யொதிர்மயி","ஜொதிகா","ஜக்ரவி","ஜநிதா"],
    "Dhanishta": ["காயத்ரி","ககநா","கௌரி","கௌரிகா","கயத்ரி","கீதா","கீதிகா","கீதஞலி","கெஹ்நா","கிதஞலி","கிரிஜா","கொபிகா","கொவ்ரி","க்ரிஷ்மா","குநிகா","குஞந்","குஞிகா","குஞிதா","குர்லீந்","கௌரி","சைதலி","சைத்ரா","சந்தநா","சந்த்நி","சரிதா","சரிதா","சர்வி","சயா","செதநா","செத்நா","சிந்மயி","சித்திரை","சித்ரலி","சித்ரஙதா","சித்ரிகா","ச்ஹவி","ச்ஹயா","சைதலி","சருலதா","சருஷிலா","சர்மி","சரிதா","சந்த்ரிகா","சந்த்ரிமா","சந்த்ரா","சிந்மயி","சைதந்யா","சஹநா","சஹநா","சைத்ரவி"],
    "Shatabhisha": ["கொஜா","கொஉரி","கொபிகா","கொஉஷிகா","ஸாசி","ஸாதநா","ஸாக்ஷி","ஸாந்யா","ஸாரிகா","ஸாந்வி","ஸதிகா","ஸஹநா","ஸக்ஷி","ஸலொநி","ஸமைரா","ஸமந்யா","ஸமீரா","ஸம்ஹிதா","ஸமிக்ஷா","ஸமிரா","ஸநா","ஸநயா","ஸந்த்யா","ஸநிகா","ஸஞநா","ஸஞிதா","ஸந்ஸ்க்ரிதி","ஸந்வி","ஸரா","ஸரந்யா","ஸரிகா","ஸரிதா","ஸரொஜிநி","ஸஷி","ஷலிநி","ஷம்பவி","ஷந்கரி","ஷரந்யா","ஷரிகா","ஷர்மிலா","ஷ்ரெயா","ஷ்ரியா","ஷ்ரிஸ்தி","ஷ்ருதி","ஸிம்ரந்","ஸியா","ஸொஹிநி","ஸொநலி","ஸொஉம்யா","ஸுஹநி"],
    "Purva Bhadrapada": ["ஸெஜல்","ஸீமா","ஸெஹெர்","ஸெஷா","ஸெஷிகா","ஸெது","ஸியா","ஸிம்ரந்","ஸியா","ஸியநா","ஸொஹிநி","ஸொநலி","ஸொநம்","ஸொஉம்யா","ஸுஹநி","ஸுஜதா","ஸுகந்யா","ஸுக்ரிதி","ஸுமா","ஸுமநா","ஸுமதி","ஸுநைநா","ஸுநந்தா","ஸுநிதா","ஸுப்ரியா","ஸுரபி","ஸுரக்ஷா","ஸுரவி","ஸுர்பி","ஸுஷ்மிதா","ஸுஷ்மா","ஸ்வரா","ஸ்வர்நா","சுவாதி","ஸ்வெதா","ஸாசி","ஸாதநா","ஸாக்ஷி","ஸாந்யா","ஸாரிகா","ஸாந்வி","ஸஹநா","ஸக்ஷி","ஸலொநி","ஸமைரா","ஸமீரா","ஸம்ஹிதா","ஸமிக்ஷா","ஸநயா","ஸஞநா"],
    "Uttara Bhadrapada": ["துஹா","துலரி","துர்கிகா","துர்கா","துஹிதா","தீபா","தீபிகா","தீப்தி","தெவிகா","தெவந்ஷி","திவ்யா","தியா","திஷா","தந்யா","தந்வி","தரநி","தரா","தரிகா","த்ரிதி","த்வநி","த்யநா","த்யுதி","திக்ஷா","திவிஷா","திவிஜா","த்ரிஷ்தி","த்ரிஷ்யா","தக்ஷா","தக்ஷிதா","தமிநி","தமயந்தி","தரிகா","தர்ஷநா","தர்ஷிநி","தெவ்யநி","தத்ரி","தைர்யா","த்வநி","திம்ப்லெ","திபலி","திப்திகா","திவிதா","தநிகா","தந்யா","தரா","தரிநி","த்ருதி","த்ருவிகா","தித்யா","திதி"],
    "Revati": ["தீக்ஷா","தீபா","தீபிகா","தீப்தி","தெவிகா","தெவிநா","தெவந்ஷி","தெவ்யநி","தியா","திஷா","திவ்யா","திவிஷா","திவிஜா","தித்யா","திதி","தந்வி","தந்யா","தரநி","தரிகா","த்ரிதி","த்ருதி","த்வநி","த்யநா","த்யுதி","திக்ஷா","த்ரிஷ்தி","த்ரிஷ்யா","துர்கா","தக்ஷா","தக்ஷிதா","தமிநி","தமயந்தி","தரிகா","தர்ஷநா","தர்ஷிநி","தத்ரி","தைர்யா","த்வநி","தநிகா","தரா","தரிநி","த்ருவிகா","திப்திகா","திவிதா","தெவிகா","தெவந்ஷிகா","தீக்ஷிதா","தீபலி","தீப்தி","துர்கிகா"],
  },
  boy: {
    "Ashwini": ["சுதமநி","செதந்","செதக்","செதஸ்","செதந்ரஜ்","சொலந்","சொக்கந்","சொஉதெஷ்","சுதெஷ்","சைதந்யா","சைதிந்","சைதெஷ்","லக்ஷ்","லக்ஷ்மந்","லக்ஷித்","லக்ஷ்யா","லக்ஷித்","லக்ஷ்மிகந்த்","லலித்","லலித்","லக்ஸ்மந்","லவெஷ்","லவ்","லவந்","லவிந்","லவிஷ்","லவித்","லயந்","லயக்","லொஹித்","லொஹித்","லொகெஷ்","லொக்நத்","லொகெந்த்ரா","லொகெஷா","லொகெஷ்வர்","லகந்","லக்ஷெந்த்ரா","லலதித்யா","லலித்யா","லவநெஷ்","லவெந்த்ரா","லக்ஸ்மிகுமர்","லக்ஷெந்த்ரா","லக்ஷ்தீப்","லக்ஷ்ரஜ்","லக்ஷ்வீர்","லக்ஷ்மந்","லிகித்","லிகித்"],
    "Bharani": ["லிகித்","லிகித்","லிகெஷ்","லிலெஷ்","லிஜிந்","லிகெஷ்","லியந்","லியந்ஷ்","லிதெஷ்","லிதிந்","லுவ்","லுவந்ஷ்","லுவிஷ்","லுவிந்","லுவ்ரஜ்","லுவெந்த்ரா","லுதெஷ்","லுஹித்","லுஹித்","லுவிக்","லெக்","லெகந்","லெக்ரஜ்","லெகித்","லீலதர்","லீலெஷ்","லெஹர்","லெஹெஷ்","லெவந்","லெவெஷ்","லொகெஷ்","லொகந்","லொகெந்த்ரா","லொகெஷ்வர்","லொக்நத்","லொஹித்","லொஹித்","லொஹெஷ்","லொஹந்","லொஹெந்த்ரா","லொமெஷ்","லொகெஷா","லொக்ரஜ்","லொவெஷ்","லொவித்","லொவிந்","லொநவ்","லொகெஸ்வர்","லொஹநெஷ்","லொஹந்ஷ்"],
    "Krittika": ["ஆரவ்","ஆர்யந்","ஆயுஷ்","அபய்","அபிநவ்","அபிஷெக்","அதர்ஷ்","அதித்யா","அத்வைத்","அத்விக்","அகஸ்த்யா","அஹந்","அஜய்","அகஷ்","அகில்","அக்ஷய்","அலொக்","அமர்","அமய்","அமித்","அமொக்","அநந்த்","அநய்","அநிகெத்","அநிருத்","அநிஷ்","அந்கித்","அந்மொல்","அந்ஷ்","அந்ஷுல்","அரவ்","அர்ஹாந்","அர்ஜுந்","அர்நவ்","அர்யந்","அதர்வ்","அவிநஷ்","அவ்யந்","அயந்ஷ்","அயாந்","ஈஷந்","எஷந்","எகந்ஷ்","எக்லவ்யா","எஷ்வர்","எஷாந்","உதய்","உஜ்ஜ்வல்","உமெஷ்","உத்கர்ஷ்"],
    "Rohini": ["ஒம்","ஒம்கர்","ஒஜஸ்","ஒஜஸ்விந்","ஒமெஷ்","ஒவி","ஒவிந்","ஒவெஷ்","ஒஜஸ்ரஜ்","ஒமெந்த்ரா","வைபவ்","வைதிக்","வைகுந்த்","வைரஜ்","வைஷ்நவ்","வல்மிக்","வந்ஷ்","வரத்","வருந்","வத்ஸல்","வெத்","வெதந்த்","வெதந்ஷ்","வெதர்த்","வீர்","வீரஜ்","வீரந்","விஹந்","விஜய்","விகஸ்","விக்ரம்","விமல்","விநய்","விநீத்","விநித்","விநொத்","விபுல்","விரஜ்","விரத்","விஷல்","விஷெஷ்","விஷ்நு","விவந்","விவாந்","விவெக்","விவிந்","வியந்","விராத்","விராஜ்","விஷ்வா"],
    "Mrigashira": ["வெத்","வெதந்த்","வெதந்ஷ்","வெதர்த்","வெதெஷ்","வெதிக்","வீர்","வீரஜ்","வீரந்","வீரெந்த்ரா","வெந்கத்","வெந்கதெஷ்","வெநிஷ்","வெநு","விஹந்","விஹங்","விமல்","விநய்","விநீத்","விநித்","கைரவ்","கைரந்","கைவல்யா","கல்யந்","கமல்","கநந்","கநிஷ்க்","கரந்","கர்திக்","கர்திகெயா","கருந்","கஷ்யப்","கவிந்","கவிஷ்","கெதர்","கெஷவ்","கெயந்","கிஆந்","கிஅந்","கிரந்","கிஷந்","கிஷொரெ","குநல்","குஷ்","குஷல்","குஷாந்","கிரித்","கியந்","கிரத்","கிஅநெஷ்"],
    "Ardra": ["குநல்","குபெர்","குமர்","குமரந்","குஷா","குஷ்","குஷல்","குஷக்ரா","குநல்ரஜ்","குஞ்","ககந்","கஜெந்த்ரா","கநெஷ்","கௌரவ்","கௌதம்","கௌதம்","கிரிஷ்","கிரீஷ்","கொகுல்","கொபல்","கொவிந்த்","குஹந்","குநா","குநஸெகர்","குஞந்","குர்தீப்","குர்தெவ்","குர்கிரத்","குர்மீத்","குர்ப்ரீத்","கந்ஷ்யம்","கநெஷ்","கநெந்த்ரா","கந்ரஜ்","கதக்","சைதந்யா","சந்தந்","சந்த்ரந்","சரந்","சரித்","செதந்","செதக்","சிரக்","சிரஞிவ்","சிரஞீவி","சொலந்","சைதெஷ்","சைதிந்","சிரஞீவ்","சந்த்ரா"],
    "Punarvasu": ["கெஷவ்","கெதந்","கெவல்","கெதர்","கீர்த்","கீர்தந்","கெஷந்","கெஷிந்","கெஷவ்ரஜ்","கெயந்","கொவித்","கொயல்","கொஉஷிக்","கொஷ்","கொவித்","கொமல்","ஹர்ஷ்","ஹர்ஷித்","ஹர்ஷத்","ஹரி","ஹரிந்","ஹரிந்த்ரா","ஹரிஷ்","ஹரிவந்ஷ்","ஹரிவர்தந்","ஹரிக்ரிஷ்நா","ஹர்தீப்","ஹர்திக்","ஹர்குந்","ஹெமந்த்","ஹெமந்த்","ஹெமெந்த்ரா","ஹிமந்ஷு","ஹிமெஷ்","ஹிரந்","ஹிரெந்","ஹிதெஷ்","ஹிதெந்த்ரா","ஹ்ரிதாந்","ஹ்ரிதய்","ஹ்ரிஷிகெஷ்","ஹ்ரிதிக்","ஹிதெஷ்","ஹிம்மத்","ஹிரந்மய்","ஹிமத்ரி","ஹிரல்","ஹிஷாந்","ஹியந்","ஹிவாந்"],
    "Pushya": ["ஹுஸெஃபா","ஹுவிந்","ஹுவந்","ஹெமந்த்","ஹெமந்த்","ஹெமெந்த்ரா","ஹெமெஷ்","ஹெம்ரஜ்","ஹெமத்ரி","ஹெமந்ஷு","ஹொஷங்","ஹொமந்","ஹொமி","ஹொஷித்","ஹொவிக்","ஹொவெஷ்","தக்ஷ்","தக்ஷித்","தக்ஷெஷ்","தமந்","தமொதர்","தர்ஷ்","தர்ஷந்","தர்ஷில்","தர்பந்","தத்தத்ரெயா","தயா","தயநந்த்","தீப்","தீபக்","தீபெஷ்","தெவ்","தெவாந்ஷ்","தெவந்ஷ்","தெவெந்த்ரா","தெவ்ரஜ்","தநுஷ்","தந்விந்","த்ருவ்","த்ருவா","த்ருவந்","தீர்","தீரஜ்","தைர்யா","தவல்","திரெந்","திநெஷ்","திவித்","திவ்யந்ஷ்","த்விஜ்"],
    "Ashlesha": ["தக்ஷ்","தக்ஷித்","தமந்","தர்ஷ்","தர்ஷந்","தர்ஷில்","தர்பந்","தயா","தயநந்த்","தீப்","தீபக்","தீபெஷ்","தெவ்","தெவாந்ஷ்","தெவந்ஷ்","தெவெந்த்ரா","தெவ்ரஜ்","தெவெஷ்","தெவிக்","தெவித்","தீர்","தீரஜ்","த்ருவ்","த்ருவந்","த்ருவா","திநெஷ்","தநுஷ்","தந்விந்","திவித்","திவ்யந்ஷ்","தித்யா","திவெஷ்","திக்ஷித்","திலீப்","திநெஷ்","துஷ்யந்த்","துர்கெஷ்","துர்கப்ரஸத்","துர்கந்","துஷ்ய்","தொவெஷ்","தொரந்","தொலெஷ்","தொரீஷ்","த்ரொந்","த்ரொநா","த்ரொநெஷ்","தொயெல்","தொரை","தொஷித்"],
    "Magha": ["ஆரவ்","மதவ்","மதந்","மஹெஷ்","மஹிர்","மஹிந்","மைத்ரெயா","மநந்","மநஸ்","மநவ்","மந்தீப்","மந்தர்","மநிஷ்","மஞுநத்","மநொஜ்","மநொஹர்","மயந்க்","மயுர்","மெதந்ஷ்","மிஹிர்","மிலந்","மிலிந்த்","மிரஜ்","மிதெஷ்","மிதில்","மிதுந்","மொஹந்","மொஹித்","மொக்ஷ்","மொநிஷ்","ம்ரிதுல்","ம்ரிநல்","முகெஷ்","முகுல்","முதித்","முகுந்த்","முரலி","முருகந்","மஹதெவ்","மஹெந்த்ரா","மஹிபல்","மஹித்","மௌலிக்","மயுரெஷ்","மெக்","மெக்ரஜ்","மெஹூல்","மொஹநிஷ்","மொஹெஷ்","மொக்ஷித்"],
    "Purva Phalguni": ["மொஹந்","மொஹித்","மொக்ஷ்","மொநிஷ்","மொநு","மொஹெஷ்","மொஹந்ரஜ்","மொஹ்நிஷ்","மொஹக்","மொஹித்ரஜ்","தநிஷ்","தநிஷq","தநுஜ்","தந்மய்","தநய்","தருந்","தரக்","தரந்","தர்பந்","ததகதா","தெஜஸ்","தெஜ்","தெஜெந்த்ரா","தெஜஸ்விந்","தீர்த்","திலக்","திர்த்","திர்தந்கர்","துஷர்","துஷித்","துஹிந்","துஷல்","துவிக்","துவந்ஷ்","துவந்","துஷந்த்","துஷிர்","துஷ்யா","தநு","தநுஷ்","தநுஷ்ரீ","தபஸ்","தபெஷ்","தரகெஷ்","தருநெஷ்","தெஜஸ்ரஜ்","திலக்ரஜ்","திம்மர்","தியந்ஷ்","துவிந்"],
    "Uttara Phalguni": ["தெஜஸ்","தெஜ்","தெஜெந்த்ரா","தெஜஸ்விந்","தீர்த்","தீர்தந்","தெஜொமய்","தெஜ்ரஜ்","தெஜஸ்வீர்","தெஜஷ்","தொஹித்","தொமந்","தொஷித்","தொவிந்","தொவிக்","தொஹிந்","தொஹர்","தொஷெஷ்","தொஹில்","தொரந்","பர்த்","பர்திவ்","பரிக்ஷித்","பரிந்","பர்வ்","பர்வெஷ்","பவந்","பவக்","பந்கஜ்","பந்கித்","பரம்","பரமெஷ்","பரஸ்","பியுஷ்","பிநல்","பிநக்","பியந்ஷ்","பிதம்பர்","ப்ரிதம்","ப்ரித்வி","ப்ரநவ்","ப்ரநய்","ப்ரதீக்","ப்ரதிக்","ப்ரதம்","ப்ரியந்ஷ்","பியல்","பிதெஷ்","பிந்து","பிதெஷ்"],
    "Hasta": ["புநித்","புநீத்","புரு","புரவ்","புருஷொத்தம்","புஷ்கர்","புஷ்பித்","புல்கித்","புலகெஷ்","புஜித்","ஷைல்","ஷைலெஷ்","ஷௌர்யா","ஷஷந்க்","ஷஷ்வத்","ஷயந்","ஷெகர்","ஷிஷிர்","ஷிவ்","ஷிவாந்ஷ்","ஷிவம்","ஷிவெந்","ஷிவெந்த்ரா","ஷ்லொக்","ஷ்ரெய்","ஷ்ரெயந்ஷ்","ஷ்ரெயஸ்","ஷ்ரிகந்த்","ஷ்ரவந்","ஷுபம்","ஷுப்","ஷுப்ர்","நமந்","நந்தந்","நந்திஷ்","நகுல்","நரெஷ்","நவிந்","நவ்நீத்","நவீந்","நயந்","நீல்","நீரஜ்","நெஹல்","நிரவ்","நிர்பய்","நிஷந்த்","நிதெஷ்","நிதிந்","நிகில்"],
    "Chitra": ["பெஷ்வா","பெயா","பெஷந்","பெஷித்","பூநம்","பூஜித்","பூரவ்","பொஷித்","பொஷக்","பொமந்","ரகவ்","ரகுநத்","ரஜ்","ரஜந்","ரஜத்","ரஜீவ்","ரஜெஷ்","ரஜிவ்","ரஜ்வீர்","ரகெஷ்","ரமந்","ரமெஷ்","ரந்பிர்","ரஞித்","ரிஷி","ரிஷாந்","ரிஷப்","ரிஷவ்","ரிதெஷ்","ரித்விக்","ரொஹந்","ரொஹித்","ரொநித்","ருத்ரா","ருத்ரக்ஷ்","ருஹந்","ரிஷிக்","ரியந்","ரியந்ஷ்","ரிதுரஜ்","ரொநவ்","ரொநவ்","ரசித்","ரந்வீர்","ரௌநக்","ரவிந்","ரவிஷ்","ரெயந்ஷ்","ரிஷ்வந்த்","ரிதெஷ்"],
    "Swati": ["ருத்ரா","ருத்ரக்ஷ்","ருத்ரெஷ்","ருஹந்","ருஜுல்","ருபெஷ்","ருபிந்","ருதுரஜ்","ருசிர்","ருசித்","ரெயந்ஷ்","ரெஹாந்","ரெஹந்","ரீத்","ரெவந்","ரெவந்த்","ரெவந்ஷ்","ரிஷப்","ரிதெஷ்","ரித்விக்","ரொஹந்","ரொஹித்","ரொநக்","ரொநித்","ரொநவ்","ரொஷித்","ரொஷெஷ்","ரொஹநெஷ்","ரொஷந்","ரொஷிந்","தநிஷ்","தநய்","தந்மய்","தநுஜ்","தருந்","தரக்","தரந்","தர்பந்","தெஜஸ்","தெஜ்","தெஜெந்த்ரா","தீர்த்","திலக்","திர்த்","துஷர்","துஷித்","துஹிந்","துவிக்","துவந்ஷ்","துஷந்த்"],
    "Vishakha": ["திஆந்ஷ்","திஹந்","திஹிர்","திலக்","திமல்","திர்த்","திர்தந்கர்","திஷந்","திஷித்","திவந்","துஹிந்","துஷர்","துஷித்","துஷல்","துஷந்த்","துவிக்","துவந்ஷ்","துவந்","துவிந்","துஷிர்","தெஜஸ்","தெஜ்","தெஜெந்த்ரா","தெஜஸ்விந்","தீர்த்","தீர்தந்","தெஜொமய்","தெஜ்ரஜ்","தெஜஸ்வீர்","தெஜஷ்","தொஹித்","தொமந்","தொஷித்","தொவிந்","தொவிக்","தொஹிந்","தொஹர்","தொஷெஷ்","தொஹில்","தொரந்","தநிஷ்","தந்மய்","தநய்","தருந்","தரக்","தரந்","தர்பந்","தநுஜ்","தபஸ்","தபெஷ்"],
    "Anuradha": ["நமந்","நந்தந்","நந்திஷ்","நகுல்","நலிந்","நமந்","நரெந்த்ரா","நரெஷ்","நரயந்","நதெஷ்","நவீந்","நவிந்","நவ்நீத்","நவ்ரஜ்","நயந்","நீல்","நீலெஷ்","நீரஜ்","நெஹல்","நீரவ்","நிகில்","நிகெஷ்","நிலெஷ்","நிமித்","நிபுந்","நிரஜ்","நிரவ்","நிர்பய்","நிரெந்","நிரஞந்","நிஷந்த்","நிஷித்","நிதெஷ்","நிதிந்","நிதிந்","நிவாந்","நிவந்ஷ்","நிவந்","நிவிஷ்","நியம்","நியந்ஷ்","நொமந்","நுஹ்","நுபுர்","நுரெஷ்","நுதந்","நுவிந்","நெவந்","நீர்","நீரஜ்"],
    "Jyeshtha": ["நொமந்","நூர்","நொஷித்","நொயந்","நொயெஷ்","நொமந்ரஜ்","நூரிஷ்","நொயெல்","நொஹித்","நொஷிந்","யஷ்","யஷஸ்","யஷ்வந்த்","யஷ்வர்தந்","யஷ்ரஜ்","யஷ்விந்","யதிந்","யதெந்த்ரா","யதிஷ்","யஷொதந்","யுவந்","யுவ்ரஜ்","யுவந்ஷ்","யுவிந்","யுவிக்","யுவநெஷ்","யுதஜித்","யுதிஷ்","யுதிஷ்திர்","யுக்தா","யுகெஷ்","யுதிஷ்","யுவந்ரஜ்","யுவெந்த்ரா","யுவநெஷ்","யஷ்தீப்","யஷ்வீர்","யஷ்மித்","யஷ்நீல்","யஷித்","யியந்ஷ்","யிதிஷ்","யிவந்","யிஷந்","யிஷித்","யுவ்ரஜ்","யுவந்ஷ்","யுவிக்","யுவிந்","யுவந்"],
    "Mula": ["யெஷ்","யெஷ்வந்த்","யெஷ்வந்த்","யொகந்","யொகெஷ்","யொகெந்த்ரா","யொகிந்","யொஜித்","யொஹந்","யொமெஷ்","பரத்","பரத்","பர்கவ்","பஸ்கர்","பவெஷ்","பவிந்","பவிக்","பவிஷ்","பீம்","பீஷ்மா","பிஷ்மா","பிஷக்","பிம்","பிமர்ஜுந்","புபெந்","புபெந்த்ரா","புஷந்","புதெவ்","புமந்","புவந்","புவ்நெஷ்","பைரவ்","பநு","பநுதெவ்","பநெஷ்","பர்கெஷ்","பஸ்வர்","பவ்யா","பவெஷ்வர்","பத்ரக்","பத்ரிநத்","பிபவ்","பிஷந்","புவநெஷ்","புவிக்","புவெஷ்","புபத்","புபெஷ்","புஷந்","பவெஷ்"],
    "Purva Ashadha": ["புவந்","புவெஷ்","புவிக்","புவ்நெஷ்","புமெஷ்","புதெவ்","புபெந்","புபெந்த்ரா","புஷந்","புபத்","தநுஷ்","தந்விந்","தந்ரஜ்","தநெஷ்","தநஞய்","தந்வந்த்","தைர்யா","த்ருவ்","த்ருவந்","தீர்","தீரஜ்","திரெந்","தவல்","த்ருவா","த்ருவிக்","த்ருவந்ஷ்","த்யந்","தர்மிக்","தர்மெஷ்","தர்மெந்த்ரா","பலக்","பநிந்த்ரா","பநிஷ்","பநீஷ்","பநெஷ்","பூல்","பூல்சந்த்","பல்குநா","பநிரஜ்","பநிந்த்ரா","தநுஷ்","தந்விந்","த்ருவ்","த்ருவிக்","திரஜ்","தைரவ்","தநுஷ்ரஜ்","தர்ம்","த்ருவெஷ்","தந்வீர்"],
    "Uttara Ashadha": ["பீம்","பீஷ்மா","பெரவ்","பெரு","பெதல்","பெரெஷ்","பொலநத்","பொலெநத்","பொஜ்","பூப்","பூபல்","பூமெஷ்","பொரெஷ்","பொஸலெ","பொதெஷ்","பொகெஷ்","பொமந்","பொவிக்","புவந்","புவெஷ்","ஜகந்","ஜகத்","ஜக்திஷ்","ஜகந்நத்","ஜை","ஜைதெவ்","ஜைகிஷந்","ஜைநில்","ஜைரஜ்","ஜைஸல்","ஜதிந்","ஜவெத்","ஜய்","ஜயந்த்","ஜயெஷ்","ஜய்தீப்","ஜயெந்த்ரா","ஜயந்த்","ஜிகர்","ஜிக்நெஷ்","ஜிஷ்நு","ஜிதெந்த்ரா","ஜிதெஷ்","ஜிவிந்","ஜியாந்","ஜிவந்ஷ்","ஜிவ்ரஜ்","ஜிஷந்","ஜிஹந்","ஜிதெஷ்"],
    "Shravana": ["ஜுஹி","ஜுகல்","ஜுநைத்","ஜுவந்","ஜுவிந்","ஜுஜர்","ஜுபெஷ்","ஜுரெஷ்","ஜீத்","ஜீதெந்த்ரா","ஜீவந்","ஜீவ்","ஜீவந்ஷ்","ஜெயந்","ஜெயெஷ்","ஜிக்நெஷ்","ஜிதெஷ்","ஜிதெந்","ஜிவாந்","ஜிவந்ஷ்","ஜொத்","ஜொகெந்","ஜொகெஷ்","ஜொமந்","ஜொரவர்","ஜொஷ்","ஜொஷுஆ","ஜொஷந்","ஜொவிந்","ஜொவந்","கநெஷ்","கந்ஷ்யம்","கநெந்த்ரா","கந்ரஜ்","கதக்","கநந்","கநெஷ்வர்","கநெந்த்ரா","கநக்","கநித்","கௌரவ்","கௌதம்","கநெஷ்","ககந்","கிரிஷ்","கிரீஷ்","கொகுல்","கொவிந்த்","கொபல்","குஹந்"],
    "Dhanishta": ["ககந்","கஜெந்த்ரா","கநெஷ்","கௌரவ்","கௌதம்","கௌதம்","கவெஷ்","ககநெஷ்","கஜெஷ்","கஜந்","கிரீஷ்","கிரிஷ்","கிரி","கிதெஷ்","கிதந்","கிவாந்","கியந்","கிஹந்","கிரிஅந்ஷ்","கிரிவர்தந்","குஹந்","குகெஷ்","குல்ஷந்","குநெஷ்","குஞந்","குர்தீப்","குர்தெவ்","குர்கிரத்","குர்மீத்","குர்ப்ரீத்","குநீத்","குநெஷ்வர்","கொபல்","கொவிந்த்","கொகுல்","கொமெஷ்","கொகெஷ்","கொபிநத்","கொஉதம்","கொஉரவ்","கீத்","கீதெஷ்","கெயந்","கெயாந்","கெஷந்","கெவிஷ்","கெஹந்","கெதிந்","கெயநெஷ்","கெஷவ்"],
    "Shatabhisha": ["கொபல்","கொவிந்த்","கொகுல்","கொபிநத்","கொஉதம்","கௌரவ்","கொகெஷ்","கொமந்","கொவந்","கொவெஷ்","ஸாஹில்","ஸாஜந்","ஸாநித்யா","ஸார்தக்","ஸசிந்","ஸகர்","ஸஹஜ்","ஸஹில்","ஸை","ஸைகிரந்","ஸைரஜ்","ஸமர்த்","ஸமீர்","ஸமர்","ஸமய்","ஸம்பவ்","ஸமிர்","ஸஞய்","ஸந்கல்ப்","ஸந்கெத்","ஸர்தக்","ஸர்வெஷ்","ஸதிஷ்","ஸத்யம்","ஷௌர்யா","ஸித்தர்த்","ஸித்தந்த்","ஸிதர்த்","ஸிம்ரந்","ஸொஹம்","ஸொஹித்","ஸொமெஷ்","ஸொஉரப்","ஸொஉவிக்","ஸுபஷ்","ஸுதிர்","ஸுஹாந்","ஸுஹஸ்","ஸுமித்","ஸுரஜ்"],
    "Purva Bhadrapada": ["ஸெஹஜ்","ஸெஜல்","ஸெமில்","ஸெநந்","ஸெவந்","ஸெவந்த்","ஸெஷ்","ஸெஷத்ரி","ஸெஷகிரி","ஸெது","ஸொஹம்","ஸொஹந்","ஸொஹித்","ஸொம்","ஸொமெஷ்","ஸொம்நத்","ஸொஉரப்","ஸொஉரவ்","ஸொஉவிக்","ஸொவித்","தக்ஷ்","தக்ஷித்","தமந்","தர்ஷ்","தர்ஷந்","தர்ஷில்","தர்பந்","தத்த்","தத்தத்ரெயா","தயா","தயநந்த்","தீப்","தீபக்","தீபெஷ்","தெவ்","தெவந்ஷ்","தெவெந்த்ரா","தெவ்ரஜ்","தெவெஷ்","த்ருவ்","திரஜ்","தீர்","தநுஷ்","தந்விந்","திவித்","திவ்யந்ஷ்","தித்யா","திவெஷ்","திக்ஷித்","திநெஷ்"],
    "Uttara Bhadrapada": ["துஷ்யந்த்","துர்க்","துர்கெஷ்","துர்லப்","துஹ்ஷஸந்","துஷ்யந்த்","துஷ்ய்","துவிந்","துவந்","துவந்ஷ்","தருந்","தருநெஷ்","தமந்","தநிஷ்","தர்வெஷ்","தயந்","தியகு","திரு","திருமல்","திருநவுகரஸு","ஜநக்","ஜநிஷ்","ஜநித்","ஜநெஷ்","ஜலக்","ஜிக்நெஷ்","ஜிஷ்நு","ஜிஷந்","ஜிதெந்","ஜிதெஷ்","தக்ஷ்","தக்ஷித்","தமந்","தர்ஷ்","தர்ஷந்","தர்ஷில்","தர்பந்","தயா","தயநந்த்","தீப்","தீபக்","தீபெஷ்","தெவ்","தெவந்ஷ்","தெவெந்த்ரா","தெவ்ரஜ்","தீர்","தீரஜ்","த்ருவ்","தநுஷ்"],
    "Revati": ["தெவ்","தெவாந்ஷ்","தெவந்ஷ்","தெவெந்த்ரா","தெவ்ரஜ்","தெவெஷ்","தெவிக்","தெவித்","தெவர்ஷ்","தெவெஷ்வர்","தீப்","தீபக்","தீபெஷ்","தீபெந்த்ரா","தீநநத்","தீந்","தீக்ஷித்","தெவரஜ்","தெவந்","தெவந்ஷு","தொஹந்","தொமந்","தொரெஸ்","தொரை","தொவெஷ்","த்ரொந்","த்ரொநெஷ்","தொஷித்","தொயெல்","தொவிக்","சைதந்யா","சைதெஷ்","சைதிந்","சந்தந்","சந்த்ரந்","சரந்","சரித்","செதந்","செதக்","சிரக்","சிரஞிவ்","சிரஞீவ்","சிரஞீவி","சொலந்","சொஉதெஷ்","சுதெஷ்","சிரஞீத்","சைத்விக்","சிரஞீத்","சித்ரக்"],
  },
};

const NAKSHATRAS = Object.keys(NATCHATHIRA_EZHUTHUKAL_TA);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getEzhuthukalMap(language: 'ta' | 'en'): Record<string, string[]> {
  if (language === 'en') {
    // EN map is keyed by EN nakshatra name, same keys as NATCHATHIRA_EZHUTHUKAL_TA values
    // Remap to Tamil nakshatra key for consistent NAKSHATRAS lookup
    const result: Record<string, string[]> = {};
    for (const [taKey, enKey] of Object.entries(NAKSHATRA_EN_MAP)) {
      if (NATCHATHIRA_EZHUTHUKAL_EN[enKey]) {
        result[taKey] = NATCHATHIRA_EZHUTHUKAL_EN[enKey];
      }
    }
    return result;
  }
  return NATCHATHIRA_EZHUTHUKAL_TA;
}

function getLettersForPada(nakshatra: string, pada: number, language: 'ta' | 'en'): string[] {
  const map = getEzhuthukalMap(language);
  const letters = map[nakshatra];
  if (!letters || pada < 1 || pada > 4) return [];
  return [letters[pada - 1]];
}

function filterNamesByLetters(
  nakshatra: string,
  gender: "girl" | "boy",
  lettersInput: string,
  language: 'ta' | 'en'
): string[] {
  const enName = NAKSHATRA_EN_MAP[nakshatra];
  if (!enName) return [];
  const nameDb = language === 'en' ? BABY_NAMES : BABY_NAMES_TA;
  const allNames = nameDb[gender][enName] ?? [];
  const letters = lettersInput
    .split(",")
    .map((l) => l.trim().toLowerCase())
    .filter(Boolean);
  if (!letters.length) return allNames;
  return allNames.filter((name) =>
    letters.some((l) => name.toLowerCase().startsWith(l))
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BabyNameFinder({
  language = 'ta',
  isLight = false,
}: BabyNameFinderProps) {
  const isTa = language === 'ta';

  const [nakshatra, setNakshatra] = useState("");
  const [pada, setPada] = useState<1 | 2 | 3 | 4 | 0>(0);
  const [gender, setGender] = useState<"girl" | "boy" | "">("");
  const [startingLetters, setStartingLetters] = useState("");
  const [lettersManuallyEdited, setLettersManuallyEdited] = useState(false);
  const [names, setNames] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [nameSearch, setNameSearch] = useState<string>("");

  // Auto-derive starting letters from nakshatra + pada unless user edited them
  useEffect(() => {
    if (!nakshatra || !pada || lettersManuallyEdited) return;
    const letters = getLettersForPada(nakshatra, pada, language);
    setStartingLetters(letters.join(", "));
  }, [nakshatra, pada, lettersManuallyEdited, language]);

  // Filter names whenever relevant inputs change
  useEffect(() => {
    if (!nakshatra || !gender || !startingLetters) {
      setNames([]);
      return;
    }
    setNames(filterNamesByLetters(nakshatra, gender as "girl" | "boy", startingLetters, language));
  }, [nakshatra, gender, startingLetters, language]);

  const handleLettersChange = useCallback((val: string) => {
    setStartingLetters(val);
    setLettersManuallyEdited(true);
  }, []);

  const handleNakshatraChange = useCallback((val: string) => {
    setNakshatra(val);
    setPada(0);
    setStartingLetters("");
    setLettersManuallyEdited(false);
    setNames([]);
    setNameSearch("");
  }, []);

  const handlePadaChange = useCallback(
    (val: number) => {
      setPada(val as 1 | 2 | 3 | 4);
      setLettersManuallyEdited(false);
    },
    []
  );

  const handleCopy = (name: string) => {
    navigator.clipboard.writeText(name).then(() => {
      setCopied(name);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const allPadaLetters = nakshatra ? getEzhuthukalMap(language)[nakshatra] : null;

  // Filter names by optional search query
  const displayedNames = useMemo(() => {
    if (!nameSearch.trim()) return names;
    const q = nameSearch.trim().toLowerCase();
    return names.filter((n) => n.toLowerCase().includes(q));
  }, [names, nameSearch]);

  // Theme palettes
  const t = useMemo(() => {
    if (isLight) {
      return {
        rootBg: "linear-gradient(180deg, #FFFDF9 0%, #FAF4E8 100%)",
        rootBorder: "#E4D5BE",
        rootShadow: "0 10px 30px rgba(74, 52, 20, 0.06)",
        cardBg: "#FFFFFF",
        cardBorder: "#E6D9C5",
        innerBg: "#FAF5EC",
        inputBg: "#FFFFFF",
        inputBorder: "#D8C7B0",
        btnBorder: "#E2D4BD",
        activeBtnBg: "#FEF3C7",
        activeBtnBorder: "#B45309",
        activeBtnText: "#92400E",
        activeBtnShadow: "0 2px 10px rgba(180, 83, 9, 0.15)",
        textPrimary: "#1C1917",
        textSecondary: "#57534E",
        gold: "#B45309",
        goldLight: "#92400E",
        chipBg: "#FFFFFF",
        chipBorder: "#E2D4BD",
        chipText: "#1C1917",
        chipHoverBorder: "#B45309",
        chipCopiedBg: "#DCFCE7",
        chipCopiedBorder: "#16A34A",
        chipCopiedText: "#15803D",
        badgeBg: "#FEF3C7",
        badgeBorder: "#FCD34D",
        badgeText: "#92400E",
        promptText: "#78716C",
      };
    }
    return {
      rootBg: "radial-gradient(ellipse at 30% 10%, #20183B 0%, #0E0A1A 60%)",
      rootBorder: "rgba(201, 162, 39, 0.25)",
      rootShadow: "0 12px 35px rgba(0, 0, 0, 0.4)",
      cardBg: "#171228",
      cardBorder: "rgba(201, 162, 39, 0.22)",
      innerBg: "#221A3B",
      inputBg: "#1F1735",
      inputBorder: "rgba(201, 162, 39, 0.25)",
      btnBorder: "rgba(201, 162, 39, 0.25)",
      activeBtnBg: "rgba(201, 162, 39, 0.2)",
      activeBtnBorder: "#C9A227",
      activeBtnText: "#F5E6A3",
      activeBtnShadow: "0 0 14px rgba(201, 162, 39, 0.25)",
      textPrimary: "#F1ECDC",
      textSecondary: "#ABA7C6",
      gold: "#C9A227",
      goldLight: "#F5E6A3",
      chipBg: "#1C1530",
      chipBorder: "rgba(201, 162, 39, 0.22)",
      chipText: "#EDE8FF",
      chipHoverBorder: "#C9A227",
      chipCopiedBg: "rgba(34, 197, 94, 0.2)",
      chipCopiedBorder: "#22C55E",
      chipCopiedText: "#86EFAC",
      badgeBg: "rgba(201, 162, 39, 0.15)",
      badgeBorder: "rgba(201, 162, 39, 0.3)",
      badgeText: "#E8CE7A",
      promptText: "#8E88B0",
    };
  }, [isLight]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 780,
        margin: "0 auto",
        padding: "24px 16px 48px",
        fontFamily: isTa
          ? "'Noto Sans Tamil', 'Inter', system-ui, sans-serif"
          : "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: t.rootBg,
          border: `1px solid ${t.rootBorder}`,
          borderRadius: 20,
          boxShadow: t.rootShadow,
          padding: "28px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
          transition: "background 0.2s ease, border-color 0.2s ease",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", paddingTop: 4 }}>
          <div
            style={{
              fontSize: 26,
              color: t.gold,
              marginBottom: 6,
              letterSpacing: 6,
              lineHeight: 1,
            }}
          >
            ✦
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 800,
              color: t.goldLight,
              letterSpacing: "0.01em",
              fontFamily: "'Noto Serif Tamil', Georgia, serif",
            }}
          >
            {isTa ? "குழந்தை பெயர் கணிப்பான்" : "Baby Name Finder"}
          </h1>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13,
              color: t.textSecondary,
              letterSpacing: "0.05em",
              fontWeight: 500,
            }}
          >
            {isTa
              ? "நட்சத்திரம் · பாதம் · தொடக்க எழுத்துக்களின் அடிப்படையில் பெயர்கள்"
              : "Vedic Baby Names by Nakshatra, Pada & Auspicious Syllables"}
          </p>
        </div>

        {/* Configuration Card */}
        <div
          style={{
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
            borderRadius: 16,
            padding: "24px 22px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            boxShadow: isLight ? "0 2px 8px rgba(0,0,0,0.03)" : "none",
          }}
        >
          {/* Nakshatra Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: t.gold,
                letterSpacing: "0.06em",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>{isTa ? "நட்சத்திரம்" : "Nakshatra (Birth Star)"}</span>
              <span
                style={{
                  color: t.textSecondary,
                  fontWeight: 500,
                  fontSize: 11,
                }}
              >
                {isTa ? "Nakshatra" : "நட்சத்திரம்"}
              </span>
            </label>
            <div style={{ position: "relative" }}>
              <select
                style={{
                  background: t.inputBg,
                  border: `1px solid ${t.inputBorder}`,
                  borderRadius: 10,
                  color: t.textPrimary,
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "11px 14px",
                  appearance: "none",
                  cursor: "pointer",
                  outline: "none",
                  width: "100%",
                  boxShadow: isLight ? "inset 0 1px 2px rgba(0,0,0,0.03)" : "none",
                }}
                value={nakshatra}
                onChange={(e) => handleNakshatraChange(e.target.value)}
              >
                <option value="">
                  {isTa ? "— நட்சத்திரத்தைத் தேர்ந்தெடுக்கவும் —" : "— Select Nakshatra —"}
                </option>
                {NAKSHATRAS.map((n) => (
                  <option key={n} value={n}>
                    {isTa
                      ? `${n} · ${NAKSHATRA_EN_MAP[n]}`
                      : `${NAKSHATRA_EN_MAP[n]} (${n})`}
                  </option>
                ))}
              </select>
              <div
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: t.textSecondary,
                  fontSize: 12,
                }}
              >
                ▼
              </div>
            </div>
          </div>

          {/* Pada Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: t.gold,
                letterSpacing: "0.06em",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>{isTa ? "பாதம்" : "Pada (Quarter)"}</span>
              <span
                style={{
                  color: t.textSecondary,
                  fontWeight: 500,
                  fontSize: 11,
                }}
              >
                {isTa ? "Pada" : "பாதம்"}
              </span>
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8,
              }}
            >
              {[1, 2, 3, 4].map((p) => {
                const letter = allPadaLetters?.[p - 1];
                const active = pada === p;
                return (
                  <button
                    key={p}
                    type="button"
                    style={{
                      background: active ? t.activeBtnBg : t.innerBg,
                      border: `1.5px solid ${active ? t.activeBtnBorder : t.btnBorder}`,
                      borderRadius: 10,
                      color: active ? t.activeBtnText : t.textPrimary,
                      padding: "10px 6px",
                      cursor: nakshatra ? "pointer" : "not-allowed",
                      opacity: nakshatra ? 1 : 0.45,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      transition: "all 0.15s ease",
                      boxShadow: active ? t.activeBtnShadow : "none",
                    }}
                    onClick={() => nakshatra && handlePadaChange(p)}
                    disabled={!nakshatra}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: active ? t.activeBtnText : t.textSecondary,
                        fontWeight: 600,
                      }}
                    >
                      {isTa ? `பாதம் ${p}` : `Pada ${p}`}
                    </span>
                    {letter && (
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: active ? t.activeBtnText : t.gold,
                          lineHeight: 1,
                        }}
                      >
                        {letter}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gender Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: t.gold,
                letterSpacing: "0.06em",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>{isTa ? "பாலினம்" : "Gender"}</span>
              <span
                style={{
                  color: t.textSecondary,
                  fontWeight: 500,
                  fontSize: 11,
                }}
              >
                {isTa ? "Gender" : "பாலினம்"}
              </span>
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {(["girl", "boy"] as const).map((g) => {
                const active = gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    style={{
                      background: active ? t.activeBtnBg : t.innerBg,
                      border: `1.5px solid ${active ? t.activeBtnBorder : t.btnBorder}`,
                      borderRadius: 10,
                      color: active ? t.activeBtnText : t.textPrimary,
                      padding: "12px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      transition: "all 0.15s ease",
                      boxShadow: active ? t.activeBtnShadow : "none",
                    }}
                    onClick={() => setGender(g)}
                  >
                    <span
                      style={{
                        fontSize: 18,
                        color: active ? t.activeBtnText : t.gold,
                        lineHeight: 1,
                      }}
                    >
                      {g === "girl" ? "♀" : "♂"}
                    </span>
                    <span>
                      {g === "girl"
                        ? isTa
                          ? "பெண் குழந்தை · Girl"
                          : "Baby Girl · பெண்"
                        : isTa
                        ? "ஆண் குழந்தை · Boy"
                        : "Baby Boy · ஆண்"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Starting Letters Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: t.gold,
                letterSpacing: "0.06em",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>{isTa ? "தொடக்க எழுத்துக்கள்" : "Starting Syllables / Letters"}</span>
              <span
                style={{
                  color: t.textSecondary,
                  fontWeight: 500,
                  fontSize: 11,
                }}
              >
                {isTa ? "Starting Letters" : "தொடக்க எழுத்துக்கள்"}
              </span>
              {lettersManuallyEdited && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 10,
                    fontWeight: 700,
                    background: t.badgeBg,
                    color: t.badgeText,
                    border: `1px solid ${t.badgeBorder}`,
                    borderRadius: 4,
                    padding: "1px 6px",
                    letterSpacing: "0.05em",
                  }}
                >
                  {isTa ? "மாற்றப்பட்டது" : "edited"}
                </span>
              )}
            </label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                style={{
                  flex: 1,
                  background: t.inputBg,
                  border: `1px solid ${t.inputBorder}`,
                  borderRadius: 10,
                  color: t.textPrimary,
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "10px 14px",
                  outline: "none",
                  fontFamily: "inherit",
                  boxShadow: isLight ? "inset 0 1px 2px rgba(0,0,0,0.03)" : "none",
                }}
                type="text"
                placeholder={
                  isTa
                    ? "எ.கா: க, சே, ல  (கால்புள்ளி கொண்டு பிரிக்கவும்)"
                    : "e.g. Ka, Se, La (comma-separated)"
                }
                value={startingLetters}
                onChange={(e) => handleLettersChange(e.target.value)}
              />
              {lettersManuallyEdited && (
                <button
                  type="button"
                  style={{
                    background: t.badgeBg,
                    border: `1px solid ${t.badgeBorder}`,
                    borderRadius: 10,
                    color: t.badgeText,
                    fontSize: 18,
                    width: 42,
                    height: 42,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    lineHeight: 1,
                    transition: "transform 0.15s ease",
                  }}
                  onClick={() => setLettersManuallyEdited(false)}
                  title={
                    isTa
                      ? "நட்சத்திர இயல்பு எழுத்துக்கு மீட்டமைக்கவும்"
                      : "Reset to nakshatra defaults"
                  }
                >
                  ↺
                </button>
              )}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 11.5,
                color: t.textSecondary,
                lineHeight: 1.45,
              }}
            >
              {isTa
                ? "பிற எழுத்துக்களில் தேட விரும்பினால் மாற்றலாம். ↺ அழுத்தினால் நட்சத்திர எழுத்துக்குத் திரும்பும்."
                : "Edit to search across different starting letters. Click ↺ to restore nakshatra defaults."}
            </p>
          </div>
        </div>

        {/* Results Section */}
        {names.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                borderBottom: `1px solid ${t.cardBorder}`,
                paddingBottom: 10,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 700,
                    color: t.textPrimary,
                  }}
                >
                  {isTa
                    ? `${names.length} பெயர்கள் கிடைக்கப்பெற்றன`
                    : `${names.length} Name${names.length === 1 ? "" : "s"} Found`}
                </h2>
                {nakshatra && (
                  <span
                    style={{
                      fontSize: 12,
                      color: t.gold,
                      fontWeight: 600,
                    }}
                  >
                    {isTa
                      ? `${nakshatra} ${pada ? `· பாதம் ${pada}` : ""} · ${
                          gender === "girl" ? "பெண்" : "ஆண்"
                        }`
                      : `${NAKSHATRA_EN_MAP[nakshatra] || nakshatra} ${
                          pada ? `· Pada ${pada}` : ""
                        } · ${gender === "girl" ? "Girl" : "Boy"}`}
                  </span>
                )}
              </div>

              {/* Quick filter within search */}
              {names.length > 8 && (
                <input
                  type="text"
                  placeholder={isTa ? "பெயரைத் தேடு..." : "Filter names..."}
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  style={{
                    background: t.inputBg,
                    border: `1px solid ${t.inputBorder}`,
                    borderRadius: 8,
                    color: t.textPrimary,
                    fontSize: 12,
                    padding: "6px 12px",
                    outline: "none",
                    minWidth: 140,
                  }}
                />
              )}
            </div>

            {/* Names Grid */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              {displayedNames.map((name) => {
                const isCopied = copied === name;
                return (
                  <button
                    key={name}
                    type="button"
                    style={{
                      background: isCopied ? t.chipCopiedBg : t.chipBg,
                      border: `1px solid ${isCopied ? t.chipCopiedBorder : t.chipBorder}`,
                      borderRadius: 8,
                      color: isCopied ? t.chipCopiedText : t.chipText,
                      padding: "8px 13px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.12s ease",
                      fontSize: 13,
                      boxShadow: isLight ? "0 1px 3px rgba(0,0,0,0.03)" : "none",
                    }}
                    onClick={() => handleCopy(name)}
                    title={
                      isTa ? `"${name}" நகலெடுக்க கிளிக் செய்யவும்` : `Click to copy "${name}"`
                    }
                  >
                    <span style={{ fontWeight: 600 }}>{name}</span>
                    <span
                      style={{
                        fontSize: 11,
                        opacity: 0.75,
                        marginLeft: 2,
                      }}
                    >
                      {isCopied ? "✓" : "⎘"}
                    </span>
                  </button>
                );
              })}
            </div>

            {displayedNames.length === 0 && nameSearch && (
              <div
                style={{
                  textAlign: "center",
                  padding: "16px",
                  color: t.textSecondary,
                  fontSize: 13,
                }}
              >
                {isTa
                  ? `"${nameSearch}" என்ற பெயரில் எதுவும் இல்லை.`
                  : `No names matching "${nameSearch}".`}
              </div>
            )}
          </div>
        )}

        {/* Empty state when filters return 0 */}
        {nakshatra && gender && startingLetters && names.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "32px 16px",
              color: t.textSecondary,
              background: t.cardBg,
              border: `1px solid ${t.cardBorder}`,
              borderRadius: 14,
            }}
          >
            <div
              style={{
                fontSize: 32,
                marginBottom: 10,
                opacity: 0.4,
              }}
            >
              ◌
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                lineHeight: 1.6,
                color: t.textPrimary,
                fontWeight: 500,
              }}
            >
              {isTa
                ? "இந்த எழுத்துக்களில் பெயர்கள் இல்லை. வேறு தொடக்க எழுத்துக்களை முயற்சிக்கவும்."
                : "No baby names found with these starting syllables. Try different letters above."}
            </p>
          </div>
        )}

        {/* Prompt when nothing is selected */}
        {(!nakshatra || !gender) && names.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "24px 16px",
              color: t.promptText,
              fontSize: 13.5,
              letterSpacing: "0.02em",
              background: isLight ? "rgba(180, 83, 9, 0.04)" : "rgba(255, 255, 255, 0.02)",
              border: `1px dashed ${t.cardBorder}`,
              borderRadius: 12,
            }}
          >
            <p style={{ margin: 0, fontWeight: 500 }}>
              {isTa
                ? "நட்சத்திரம், பாதம் மற்றும் பாலினத்தைத் தேர்ந்தெடுக்கவும் ✦"
                : "Please select Nakshatra, Pada, and Gender above to view names ✦"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
import { useState, useEffect, useCallback } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const NATCHATHIRA_EZHUTHUKAL: Record<string, string[]> = {
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

const NAKSHATRAS = Object.keys(NATCHATHIRA_EZHUTHUKAL);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLettersForPada(nakshatra: string, pada: number): string[] {
  const letters = NATCHATHIRA_EZHUTHUKAL[nakshatra];
  if (!letters || pada < 1 || pada > 4) return [];
  return [letters[pada - 1]];
}

function filterNamesByLetters(
  nakshatra: string,
  gender: "girl" | "boy",
  lettersInput: string
): string[] {
  const enName = NAKSHATRA_EN_MAP[nakshatra];
  if (!enName) return [];
  const allNames = BABY_NAMES[gender][enName] ?? [];
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

export default function BabyNameFinder() {
  const [nakshatra, setNakshatra] = useState("");
  const [pada, setPada] = useState<1 | 2 | 3 | 4 | 0>(0);
  const [gender, setGender] = useState<"girl" | "boy" | "">("");
  const [startingLetters, setStartingLetters] = useState("");
  const [lettersManuallyEdited, setLettersManuallyEdited] = useState(false);
  const [names, setNames] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  // Auto-derive starting letters from nakshatra + pada unless user edited them
  useEffect(() => {
    if (!nakshatra || !pada || lettersManuallyEdited) return;
    const letters = getLettersForPada(nakshatra, pada);
    setStartingLetters(letters.join(", "));
  }, [nakshatra, pada, lettersManuallyEdited]);

  // Filter names whenever relevant inputs change
  useEffect(() => {
    if (!nakshatra || !gender || !startingLetters) {
      setNames([]);
      return;
    }
    setNames(filterNamesByLetters(nakshatra, gender as "girl" | "boy", startingLetters));
  }, [nakshatra, gender, startingLetters]);

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

  const allPadaLetters = nakshatra ? NATCHATHIRA_EZHUTHUKAL[nakshatra] : null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>✦</div>
          <h1 style={styles.title}>Baby Name Finder</h1>
          <p style={styles.subtitle}>
            நட்சத்திரம் · பாதம் · பெயர் எழுத்துக்கள்
          </p>
        </div>

        {/* Form */}
        <div style={styles.card}>
          {/* Nakshatra */}
          <div style={styles.field}>
            <label style={styles.label}>நட்சத்திரம் <span style={styles.labelEn}>Nakshatra</span></label>
            <select
              style={styles.select}
              value={nakshatra}
              onChange={(e) => handleNakshatraChange(e.target.value)}
            >
              <option value="">— தேர்ந்தெடுக்கவும் —</option>
              {NAKSHATRAS.map((n) => (
                <option key={n} value={n}>
                  {n} · {NAKSHATRA_EN_MAP[n]}
                </option>
              ))}
            </select>
          </div>

          {/* Pada */}
          <div style={styles.field}>
            <label style={styles.label}>பாதம் <span style={styles.labelEn}>Pada</span></label>
            <div style={styles.padaRow}>
              {[1, 2, 3, 4].map((p) => {
                const letter = allPadaLetters?.[p - 1];
                const active = pada === p;
                return (
                  <button
                    key={p}
                    style={{
                      ...styles.padaBtn,
                      ...(active ? styles.padaBtnActive : {}),
                      ...(!nakshatra ? styles.padaBtnDisabled : {}),
                    }}
                    onClick={() => nakshatra && handlePadaChange(p)}
                    disabled={!nakshatra}
                  >
                    <span style={styles.padaNum}>பாதம் {p}</span>
                    {letter && (
                      <span style={styles.padaLetter}>{letter}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gender */}
          <div style={styles.field}>
            <label style={styles.label}>பாலினம் <span style={styles.labelEn}>Gender</span></label>
            <div style={styles.genderRow}>
              {(["girl", "boy"] as const).map((g) => (
                <button
                  key={g}
                  style={{
                    ...styles.genderBtn,
                    ...(gender === g ? styles.genderBtnActive : {}),
                  }}
                  onClick={() => setGender(g)}
                >
                  <span style={styles.genderIcon}>{g === "girl" ? "♀" : "♂"}</span>
                  <span>{g === "girl" ? "பெண் · Girl" : "ஆண் · Boy"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Starting Letters */}
          <div style={styles.field}>
            <label style={styles.label}>
              பெயர் எழுத்துக்கள்
              <span style={styles.labelEn}>Starting Letters</span>
              {lettersManuallyEdited && (
                <span style={styles.editBadge}>edited</span>
              )}
            </label>
            <div style={styles.lettersRow}>
              <input
                style={styles.input}
                type="text"
                placeholder="எ.கா: க, சே, ல  (comma-separated)"
                value={startingLetters}
                onChange={(e) => handleLettersChange(e.target.value)}
              />
              {lettersManuallyEdited && (
                <button
                  style={styles.resetBtn}
                  onClick={() => setLettersManuallyEdited(false)}
                  title="Reset to nakshatra defaults"
                >
                  ↺
                </button>
              )}
            </div>
            <p style={styles.hint}>
              Edit to search across different starting letters. Reset ↺ to restore nakshatra defaults.
            </p>
          </div>
        </div>

        {/* Results */}
        {names.length > 0 && (
          <div style={styles.resultsSection}>
            <div style={styles.resultsHeader}>
              <h2 style={styles.resultsTitle}>
                {names.length} பெயர்கள் {names.length > 1 ? "கிடைத்தன" : "கிடைத்தது"}
              </h2>
              {nakshatra && (
                <span style={styles.resultsMeta}>
                  {nakshatra} {pada ? `· பாதம் ${pada}` : ""} · {gender === "girl" ? "பெண்" : "ஆண்"}
                </span>
              )}
            </div>
            <div style={styles.nameGrid}>
              {names.map((name) => (
                <button
                  key={name}
                  style={{
                    ...styles.nameChip,
                    ...(copied === name ? styles.nameChipCopied : {}),
                  }}
                  onClick={() => handleCopy(name)}
                  title={`Copy "${name}"`}
                >
                  <span style={styles.nameTxt}>{name}</span>
                  <span style={styles.nameAction}>
                    {copied === name ? "✓" : "⎘"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {nakshatra && gender && startingLetters && names.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>◌</div>
            <p style={styles.emptyText}>
              இந்த எழுத்துக்களில் பெயர்கள் இல்லை. Try different starting letters.
            </p>
          </div>
        )}

        {/* Prompt when nothing is selected */}
        {(!nakshatra || !gender) && names.length === 0 && (
          <div style={styles.promptState}>
            <p style={styles.promptText}>
              நட்சத்திரம், பாதம், பாலினம் தேர்ந்தெடுக்கவும்
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const GOLD = "#B8860B";
const GOLD_LIGHT = "#F5E6A3";
const DEEP = "#1A1035";
const DEEP2 = "#2A1F50";
const SURFACE = "#221845";
const BORDER = "rgba(184,134,11,0.3)";
const TEXT = "#EDE8FF";
const MUTED = "#9B93C5";

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: `radial-gradient(ellipse at 30% 10%, #2B1F5C 0%, ${DEEP} 60%)`,
    display: "flex",
    justifyContent: "center",
    padding: "32px 16px 64px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: 640,
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  header: {
    textAlign: "center",
    paddingTop: 8,
  },
  headerIcon: {
    fontSize: 28,
    color: GOLD,
    marginBottom: 8,
    display: "block",
    letterSpacing: 8,
  },
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 700,
    color: TEXT,
    letterSpacing: "0.01em",
  },
  subtitle: {
    margin: "6px 0 0",
    fontSize: 13,
    color: MUTED,
    letterSpacing: "0.12em",
  },
  card: {
    background: SURFACE,
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    padding: "28px 28px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 22,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: GOLD,
    letterSpacing: "0.08em",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  labelEn: {
    color: MUTED,
    fontWeight: 400,
    letterSpacing: "0.04em",
    fontSize: 11,
  },
  editBadge: {
    marginLeft: "auto",
    fontSize: 10,
    background: "rgba(184,134,11,0.15)",
    color: GOLD,
    border: `1px solid ${BORDER}`,
    borderRadius: 4,
    padding: "1px 6px",
    letterSpacing: "0.06em",
  },
  select: {
    background: DEEP2,
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    color: TEXT,
    fontSize: 14,
    padding: "10px 14px",
    appearance: "none" as const,
    cursor: "pointer",
    outline: "none",
    width: "100%",
  },
  padaRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: 8,
  },
  padaBtn: {
    background: DEEP2,
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    color: TEXT,
    padding: "10px 6px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    transition: "all 0.15s",
  },
  padaBtnActive: {
    background: "rgba(184,134,11,0.18)",
    border: `1px solid ${GOLD}`,
    boxShadow: `0 0 12px rgba(184,134,11,0.25)`,
  },
  padaBtnDisabled: {
    opacity: 0.35,
    cursor: "not-allowed",
  },
  padaNum: {
    fontSize: 10,
    color: MUTED,
    letterSpacing: "0.04em",
  },
  padaLetter: {
    fontSize: 18,
    fontWeight: 700,
    color: GOLD_LIGHT,
    lineHeight: 1,
  },
  genderRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  genderBtn: {
    background: DEEP2,
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    color: TEXT,
    padding: "12px 16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    transition: "all 0.15s",
  },
  genderBtnActive: {
    background: "rgba(184,134,11,0.18)",
    border: `1px solid ${GOLD}`,
    boxShadow: `0 0 12px rgba(184,134,11,0.2)`,
  },
  genderIcon: {
    fontSize: 16,
    color: GOLD,
  },
  lettersRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
    background: DEEP2,
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    color: TEXT,
    fontSize: 14,
    padding: "10px 14px",
    outline: "none",
    fontFamily: "inherit",
  },
  resetBtn: {
    background: "rgba(184,134,11,0.12)",
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    color: GOLD,
    fontSize: 18,
    width: 38,
    height: 38,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    lineHeight: 1,
  },
  hint: {
    margin: 0,
    fontSize: 11,
    color: MUTED,
    lineHeight: 1.5,
  },
  resultsSection: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  resultsHeader: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap" as const,
  },
  resultsTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 600,
    color: TEXT,
  },
  resultsMeta: {
    fontSize: 12,
    color: MUTED,
  },
  nameGrid: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: 8,
  },
  nameChip: {
    background: SURFACE,
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    color: TEXT,
    padding: "7px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.12s",
    fontSize: 13,
  },
  nameChipCopied: {
    background: "rgba(184,134,11,0.2)",
    border: `1px solid ${GOLD}`,
    color: GOLD_LIGHT,
  },
  nameTxt: {
    fontWeight: 500,
  },
  nameAction: {
    fontSize: 11,
    color: MUTED,
    opacity: 0.7,
  },
  emptyState: {
    textAlign: "center",
    padding: "32px 16px",
    color: MUTED,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
    opacity: 0.4,
  },
  emptyText: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.6,
  },
  promptState: {
    textAlign: "center",
    padding: "24px 16px",
    color: MUTED,
    fontSize: 13,
    letterSpacing: "0.04em",
  },
  promptText: {
    margin: 0,
  },
};
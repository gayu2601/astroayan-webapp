import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { MapPin, User, Calendar, Clock, Sparkles, BookOpen, ChevronDown, Check, Trash2, ShieldAlert } from 'lucide-react';
import ScreenGuard from './ScreenGuard';

interface HoroscopeInputFormProps {
  onSubmit: (values: {
    name: string;
    fatherName: string;
    motherName: string;
    dob: Date;
    tob: Date;
    place: string;
    lat: number;
    lon: number;
    tzone: number;
  }) => void;
}

export default function HoroscopeInputForm({ onSubmit }: HoroscopeInputFormProps) {
  const { t, language, isTamil } = useTranslation();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  
  // HTML5 input states
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  
  const [place, setPlace] = useState('');
  const [lat, setLat] = useState<number>(13.0827); // default to Chennai
  const [lon, setLon] = useState<number>(80.2707); // default to Chennai
  const [tzone, setTzone] = useState<number>(5.5); // default to India
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const debounceRef = useRef<any>(null);

  const [savedProfiles, setSavedProfiles] = useState<any[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  // ── Load saved profiles on mount ──
  useEffect(() => {
    if (user?.id) {
      loadProfiles();
    }
  }, [user]);

  async function loadProfiles() {
    try {
      const { data, error } = await supabase
        .from('horoscope_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });
      
      if (error) throw error;

      if (data) {
        setSavedProfiles(
          data.map((r: any) => ({
            id: r.id,
            name: r.name,
            fatherName: r.father_name,
            motherName: r.mother_name,
            dob: r.dob, // ISO string or Date string
            place: r.place,
            savedAt: r.saved_at,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    }
  }

  // ── Location Autocomplete ──
  async function fetchSuggestions(queryStr: string) {
    if (!queryStr || queryStr.length < 2) return [];
    try {
      // 1. Try Ola Maps API if key exists
      const olaKey = process.env.EXPO_PUBLIC_OLA_MAPS_API_KEY;
      if (olaKey) {
        const url = `https://api.olamaps.io/places/v1/autocomplete?input=${encodeURIComponent(queryStr)}&api_key=${olaKey}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          return (data.predictions || []).map((p: any) => ({
            description: p.description,
            place_id: p.place_id,
            source: 'olamaps'
          }));
        }
      }

      // 2. Fallback to Nominatim OSM Search API
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryStr)}&format=json&limit=5&addressdetails=1`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'VedicAstroWeb/1.0' },
      });
      if (res.ok) {
        const data = await res.json();
        return data.map((item: any) => ({
          description: item.display_name,
          place_id: item.place_id?.toString() || Math.random().toString(),
          source: 'nominatim'
        }));
      }
      return [];
    } catch (e) {
      console.error('Location suggestion error:', e);
      return [];
    }
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setPlace(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text) {
      setSuggestions([]);
      setOpenLocation(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoadingLocation(true);
      const results = await fetchSuggestions(text);
      setSuggestions(results);
      setOpenLocation(results.length > 0);
      setLoadingLocation(false);
    }, 400);
  };

  const handleSelectLocation = async (item: any) => {
    setPlace(item.description);
    setSuggestions([]);
    setOpenLocation(false);
    setLoadingLocation(true);
    try {
      const olaKey = process.env.EXPO_PUBLIC_OLA_MAPS_API_KEY;
      if (item.source === 'olamaps' && olaKey) {
        const url = `https://api.olamaps.io/places/v1/details?place_id=${item.place_id}&api_key=${olaKey}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const location = data.result?.geometry?.location;
          if (location) {
            setLat(location.lat);
            setLon(location.lng);
          }
        }
      } else {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(item.description)}&format=json&limit=1`;
        const res = await fetch(url, { headers: { 'User-Agent': 'VedicAstroWeb/1.0' } });
        if (res.ok) {
          const data = await res.json();
          if (data && data[0]) {
            setLat(parseFloat(data[0].lat));
            setLon(parseFloat(data[0].lon));
          }
        }
      }
    } catch (e) {
      console.error('Error fetching details for selected location:', e);
    } finally {
      setLoadingLocation(false);
    }
  };

  // ── Save Profile ──
  async function handleSaveProfile() {
    if (!name.trim() || !birthDate || !birthTime || !place.trim() || !user?.id) return;
    setSaveStatus('saving');

    // Combine date and time to construct ISO string
    const combinedDateStr = `${birthDate}T${birthTime}`;

    const newProfile = {
      id: Date.now().toString(),
      name: name.trim(),
      fatherName: fatherName.trim(),
      motherName: motherName.trim(),
      dob: combinedDateStr,
      place: place.trim(),
      savedAt: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('horoscope_profiles')
        .insert({
          user_id: user.id,
          name: newProfile.name,
          father_name: newProfile.fatherName,
          mother_name: newProfile.motherName,
          dob: newProfile.dob,
          place: newProfile.place,
          saved_at: newProfile.savedAt,
        });

      if (error) throw error;

      // Update state local list
      const existing = savedProfiles.findIndex(
        (p) => p.name.toLowerCase() === newProfile.name.toLowerCase()
      );
      const updated =
        existing >= 0
          ? savedProfiles.map((p, i) => (i === existing ? newProfile : p))
          : [newProfile, ...savedProfiles];

      setSavedProfiles(updated);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setSaveStatus(null);
    }
  }

  // ── Load Profile ──
  function handleLoadProfile(profile: any) {
    setName(profile.name || '');
    setFatherName(profile.fatherName || '');
    setMotherName(profile.motherName || '');
    setPlace(profile.place || '');
    
    if (profile.dob) {
      const d = new Date(profile.dob);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const mins = String(d.getMinutes()).padStart(2, '0');
        
        setBirthDate(`${year}-${month}-${day}`);
        setBirthTime(`${hours}:${mins}`);
      }
    }
    setSelectedProfile(profile);
    setDropdownOpen(false);
  }

  // ── Delete Profile ──
  async function handleDeleteProfile(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('horoscope_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSavedProfiles((prev) => prev.filter((p) => p.id !== id));
      if (selectedProfile?.id === id) {
        setSelectedProfile(null);
      }
    } catch (err) {
      console.error('Error deleting profile:', err);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthDate || !birthTime || !place.trim()) return;

    // Build specific Date objects for dob/tob
    const [year, month, day] = birthDate.split('-').map(Number);
    const [hours, mins] = birthTime.split(':').map(Number);
    
    const dobObj = new Date(year, month - 1, day, hours, mins, 0);
    const tobObj = new Date(year, month - 1, day, hours, mins, 0);

    onSubmit({
      name: name.trim(),
      fatherName: fatherName.trim(),
      motherName: motherName.trim(),
      dob: dobObj,
      tob: tobObj,
      place: place.trim(),
      lat,
      lon,
      tzone,
    });
  };

  const isFormValid = name.trim() && birthDate && birthTime && place.trim();

  return (
  <ScreenGuard featureId="jadhagam">
    <div className="max-w-xl mx-auto space-y-6">
      {/* ── Header Decor ── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet-950/40 border border-violet-500/30 text-amber-400 text-2xl shadow-lg shadow-violet-500/10">
          ☽
        </div>
        <div className="flex justify-center gap-2 text-amber-500/60 text-xs">
          <span>✦</span>
          <span>✧</span>
          <span>⋆</span>
          <span>✦</span>
          <span>✧</span>
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-white font-serif">
          {isTamil ? 'ஜாதக கணிப்பு' : 'Horoscope Casting'}
        </h2>
        <p className="text-sm text-gray-400">
          {t('form.headerSub') || (isTamil ? 'உங்கள் பிறந்த விவரங்களை உள்ளிட்டு விரிவான ஜாதகத்தைப் பெறுங்கள்.' : 'Enter birth details to compute your complete Vedic horoscope chart & placements.')}
        </p>
        <div className="flex h-1 max-w-xs mx-auto rounded-full overflow-hidden bg-gray-800">
          <div className="flex-1 bg-violet-600" />
          <div className="flex-1 bg-fuchsia-500" />
          <div className="flex-1 bg-amber-500" />
          <div className="flex-1 bg-emerald-500" />
        </div>
      </div>

      {/* ── Saved Profiles Dropdown ── */}
      {user && savedProfiles.length > 0 && (
        <div className="relative z-20">
          <label className="block text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2 font-sans">
            {t('form.savedProfiles') || (isTamil ? 'சேமிக்கப்பட்ட சுயவிவரங்கள்' : 'Saved Profiles')}
          </label>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between bg-slate-900/60 border border-violet-500/20 hover:border-violet-500/40 rounded-lg px-4 py-3 text-left transition-all text-sm"
          >
            <div className="flex items-center gap-3 truncate">
              {selectedProfile ? (
                <>
                  <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center font-bold text-amber-300">
                    {selectedProfile.name[0].toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-white truncate text-xs">{selectedProfile.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{selectedProfile.place}</p>
                  </div>
                </>
              ) : (
                <span className="text-gray-400">{t('form.selectProfile') || (isTamil ? 'ஒரு சுயவிவரத்தைத் தேர்ந்தெடுக்கவும்' : 'Select a Saved Profile')}</span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-violet-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-950 border border-violet-500/30 rounded-lg shadow-2xl max-h-60 overflow-y-auto divide-y divide-violet-500/10">
              {savedProfiles.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleLoadProfile(p)}
                  className={`flex items-center justify-between p-3 cursor-pointer hover:bg-violet-950/30 transition-colors ${selectedProfile?.id === p.id ? 'bg-violet-950/20' : ''}`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-7 h-7 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center font-serif text-sm text-violet-300">
                      {p.name[0].toUpperCase()}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-white text-xs truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{p.place}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedProfile?.id === p.id && <Check className="w-4 h-4 text-amber-400" />}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteProfile(e, p.id)}
                      className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                      title={isTamil ? 'அழி' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Input Form Card ── */}
      <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-gray-800 rounded-xl p-5 space-y-4 shadow-xl relative overflow-hidden backdrop-blur-md">
        {/* Name Field */}
        <div className="relative group">
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l bg-violet-500" />
          <div className="pl-3 space-y-1.5">
            <label className="text-xs font-semibold text-violet-400 tracking-wider uppercase block">
              {t('form.fullName') || (isTamil ? 'முழு பெயர்' : 'Full Name')} *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-violet-400">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder={t('form.namePlaceholder') || (isTamil ? 'பெயரை உள்ளிடவும்' : 'Enter full name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950/60 border border-gray-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Father's & Mother's Names Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative group">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l bg-violet-600" />
            <div className="pl-3 space-y-1.5">
              <label className="text-xs font-semibold text-violet-400 tracking-wider uppercase block">
                {t('form.fatherName') || (isTamil ? 'தந்தை பெயர்' : 'Father’s Name')}
              </label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="w-full bg-slate-950/60 border border-gray-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l bg-violet-600" />
            <div className="pl-3 space-y-1.5">
              <label className="text-xs font-semibold text-violet-400 tracking-wider uppercase block">
                {t('form.motherName') || (isTamil ? 'தாய் பெயர்' : 'Mother’s Name')}
              </label>
              <input
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                className="w-full bg-slate-950/60 border border-gray-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 rounded-lg px-4 py-2.5 text-white text-sm outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Birth Date & Time Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative group">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l bg-amber-500" />
            <div className="pl-3 space-y-1.5">
              <label className="text-xs font-semibold text-amber-400 tracking-wider uppercase block">
                {t('form.birthDate') || (isTamil ? 'பிறந்த தேதி' : 'Birth Date')} *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-amber-500">
                  <Calendar className="w-4 h-4" />
                </span>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-slate-950/60 border border-gray-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l bg-amber-500" />
            <div className="pl-3 space-y-1.5">
              <label className="text-xs font-semibold text-amber-400 tracking-wider uppercase block">
                {t('form.birthTime') || (isTamil ? 'பிறந்த நேரம்' : 'Birth Time')} *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-amber-500">
                  <Clock className="w-4 h-4" />
                </span>
                <input
                  type="time"
                  required
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full bg-slate-950/60 border border-gray-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Birth Place */}
        <div className="relative group">
          <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l bg-emerald-500" />
          <div className="pl-3 space-y-1.5">
            <label className="text-xs font-semibold text-emerald-400 tracking-wider uppercase block">
              {t('form.birthPlace') || (isTamil ? 'பிறந்த இடம்' : 'Birth Place')} *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-emerald-400">
                <MapPin className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={place}
                onChange={handleLocationChange}
                placeholder={t('form.birthPlacePlaceholder') || (isTamil ? 'உதாரணம்: சென்னை, தமிழ்நாடு' : 'e.g. Chennai, Tamil Nadu')}
                className="w-full bg-slate-950/60 border border-gray-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 rounded-lg pl-9 pr-4 py-2.5 text-white text-sm outline-none transition-all"
              />
              {loadingLocation && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Suggestions Panel */}
            {openLocation && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-slate-950 border border-emerald-500/30 rounded-lg shadow-2xl z-50 divide-y divide-gray-800/50 max-h-48 overflow-y-auto">
                {suggestions.map((item) => (
                  <button
                    key={item.place_id}
                    type="button"
                    onClick={() => handleSelectLocation(item)}
                    className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-emerald-950/20 transition-colors flex items-center gap-2 truncate"
                  >
                    <span className="text-emerald-500 text-sm">📍</span>
                    <span className="truncate">{item.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coloured info strip */}
        <div className="flex gap-2.5 items-start bg-violet-950/15 border border-violet-500/10 rounded-lg p-3 text-xs text-violet-200">
          <span className="text-base leading-none">🔮</span>
          <p className="leading-relaxed">
            {t('form.infoStrip') || (isTamil 
              ? 'துல்லியமான ஜாதகக் கணிப்பிற்கு உங்கள் பிறந்த நேரம் மற்றும் இடத்தை சரியாக குறிப்பிடவும்.' 
              : 'Provide highly precise birth time and location coordinates to ensure calculations conform precisely to the astrological standards.')}
          </p>
        </div>

        {/* Action row (Save + Generate side by side) */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {user && (
            <button
              type="button"
              disabled={!isFormValid || saveStatus === 'saving'}
              onClick={handleSaveProfile}
              className={`flex-1 border py-2.5 rounded-lg text-xs font-semibold tracking-wider transition-all uppercase flex items-center justify-center gap-1.5 ${
                !isFormValid 
                  ? 'border-gray-800 bg-transparent text-gray-600 cursor-not-allowed' 
                  : saveStatus === 'saved'
                    ? 'border-emerald-500/30 bg-emerald-950/25 text-emerald-400'
                    : 'border-violet-500/30 bg-violet-950/20 text-violet-300 hover:bg-violet-950/40 hover:border-violet-500/50'
              }`}
            >
              {saveStatus === 'saving' ? (
                <span>{t('common.saving') || 'Saving...'}</span>
              ) : saveStatus === 'saved' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('form.saved') || 'Saved!'}</span>
                </>
              ) : (
                <span>{t('form.saveProfile') || (isTamil ? 'சுயவிவரத்தைச் சேமி' : 'Save Profile')}</span>
              )}
            </button>
          )}

          <button
            type="submit"
            disabled={!isFormValid}
            className={`flex-[1.4] relative py-2.5 rounded-lg text-xs font-serif font-bold tracking-wider uppercase overflow-hidden transition-all shadow-lg ${
              isFormValid 
                ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-violet-500/15' 
                : 'bg-gray-800/40 text-gray-500 border border-gray-800 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('form.generate') || (isTamil ? 'ஜாதகத்தை உருவாக்கு' : 'Generate Horoscope')}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </span>
            {isFormValid && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400/60" />}
          </button>
        </div>
      </form>
    </div>
	</ScreenGuard>
  );
}

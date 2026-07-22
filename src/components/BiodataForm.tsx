import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import { Sparkles, Save, User, BookOpen, Users, Home, Heart, Phone, MapPin, Plus, Trash2, FolderOpen, Calendar, Clock, Image as ImageIcon } from 'lucide-react';
import ScreenGuard from './ScreenGuard';

interface BiodataFormProps {
  onSubmit: (values: any, reportType: string) => void;
  loading: boolean;
}

export default function BiodataForm({ onSubmit, loading }: BiodataFormProps) {
  const { t, language, isTamil } = useTranslation();
  const { user } = useAuth();
  
  const [values, setValues] = useState<any>({
    name: '',
    gender: isTamil ? 'பெண்' : 'Female',
    dob: '',
    tob: '',
    birthPlace: '',
    religion: isTamil ? 'இந்து' : 'Hindu',
    caste: '',
    height: '',
    weight: '',
    complexion: '',
    maritalStatus: isTamil ? 'திருமணமாகாத' : 'Single',
    nativePlace: '',
    photo: '',
    education: '',
    occupation: '',
    salary: '',
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    siblings: '',
    propertyType: '',
    propertyLocation: '',
    expectation: '',
    notes: '',
    phone: '',
    address: '',
    registrationNo: '',
  });

  const [reportType, setReportType] = useState('type1');
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string>('');
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);
  const [currentEntryName, setCurrentEntryName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newEntryName, setNewEntryName] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Geocomplete places
  const [placeQuery, setPlaceQuery] = useState('');
  const [placeSuggestions, setPlaceSuggestions] = useState<any[]>([]);
  const [activeLocationField, setActiveLocationField] = useState<string | null>(null);
  const autocompleteTimeout = useRef<any>(null);

  useEffect(() => {
    if (user?.id) {
      fetchEntries();
    }
  }, [user?.id]);

  const fetchEntries = async () => {
    if (!user?.id) return;
    try {
      setEntriesLoading(true);
      const { data, error } = await supabase
        .from('biodata')
        .select('id, entry_name, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setEntries(data || []);
      if (data && data.length > 0) {
        setSelectedEntryId(String(data[0].id));
      }
    } catch (err) {
      console.error('Error fetching entries:', err);
    } finally {
      setEntriesLoading(false);
    }
  };

  const handleLoadEntry = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from('biodata')
      .select('id, entry_name, data')
      .eq('id', id)
      .single();
    if (error) throw error;

    const loadedData: any = data.data || {};

    // Resolve stored filename → public URL only if not already a full URL
    if (loadedData.photo && !loadedData.photo.startsWith('http')) {
      const { data: urlData } = supabase.storage
        .from('biodata')
        .getPublicUrl(loadedData.photo);
      loadedData.photo = urlData?.publicUrl || loadedData.photo;
    }

    if (loadedData.dob && loadedData.dob.length > 10) {
      loadedData.dob = loadedData.dob.slice(0, 10);
    }

    setValues({ ...values, ...loadedData });
    setCurrentEntryId(data.id);
    setCurrentEntryName(data.entry_name || '');
  } catch (err) {
    console.error('Error loading entry:', err);
  }
};

  const handleDeleteEntry = async (id: number) => {
    if (!confirm(isTamil ? 'இந்த விவரத்தை நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this entry?')) return;
    try {
      const { error } = await supabase
        .from('biodata')
        .delete()
        .eq('id', id);
      if (error) throw error;
      
      if (currentEntryId === id) {
        handleReset();
      }
      fetchEntries();
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  const handleReset = () => {
    setValues({
      name: '',
      gender: isTamil ? 'பெண்' : 'Female',
      dob: '',
      tob: '',
      birthPlace: '',
      religion: isTamil ? 'இந்து' : 'Hindu',
      caste: '',
      height: '',
      weight: '',
      complexion: '',
      maritalStatus: isTamil ? 'திருமணமாகாத' : 'Single',
      nativePlace: '',
      photo: '',
      education: '',
      occupation: '',
      salary: '',
      fatherName: '',
      fatherOccupation: '',
      motherName: '',
      motherOccupation: '',
      siblings: '',
      propertyType: '',
      propertyLocation: '',
      expectation: '',
      notes: '',
      phone: '',
      address: '',
      registrationNo: '',
    });
    setCurrentEntryId(null);
    setCurrentEntryName('');
  };

  // ─── Shared photo-upload helper ─────────────────────────────────────────────
  // On web, photo is either a URL (already uploaded / external) or a data: URI
  // (freshly picked via <input type="file">). Uploads data: URIs to Supabase
  // storage and returns the bare filename so we store only the key, not the blob.
  const uploadPhotoIfNeeded = async (formValues: any): Promise<any> => {
    let fv = { ...formValues };

    // If it's already a remote URL that we uploaded before, strip back to filename
    if (fv.photo && fv.photo.startsWith('http')) {
      const parts = fv.photo.split('/');
      fv.photo = parts[parts.length - 1]; // e.g. "1234567890.jpg"
      return fv; // already in storage — nothing to upload
    }

    const photoIsLocalFile =
      fv.photo &&
      (fv.photo.startsWith('data:') ||
        fv.photo.startsWith('file://') ||
        fv.photo.startsWith('blob:'));

    if (photoIsLocalFile) {
      let uploadData: Uint8Array | ArrayBuffer;
      let extension = 'jpg';

      if (fv.photo.startsWith('data:')) {
        // Web — decode base64 data URI directly
        const [header, base64] = fv.photo.split(',');
        extension = header.split(';')[0].split('/')[1] || 'jpg';
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
        uploadData = bytes;
      } else {
        // blob: / file: — fetch as ArrayBuffer
        uploadData = await fetch(fv.photo).then((r) => r.arrayBuffer());
        extension = fv.photo.split('.').pop()?.split('?')[0] || 'jpg';
      }

      const fileName = `${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from('biodata')
        .upload(fileName, uploadData, { contentType: `image/${extension}`, upsert: true });
      if (uploadError) throw uploadError;

      fv.photo = fileName; // store only the storage key
    }

    return fv;
  };

  // ─── Update an existing DB entry ───────────────────────────────────────────
	const saveExistingEntry = async () => {
  if (!user?.id) {
    alert(isTamil ? 'விவரங்களைச் சேமிக்க உள்நுழையவும்.' : 'Please sign in to save your profiles.');
    return;
  }
  try {
    setSaving(true);
    const formValues = await uploadPhotoIfNeeded(values);

    const { error } = await supabase
      .from('biodata')
      .update({ data: formValues, updated_at: new Date().toISOString() })
      .eq('id', currentEntryId);
    if (error) throw error;

    setValues(formValues); // reflect stored filename back into local state
    fetchEntries();
  } catch (err) {
    console.error('Error updating entry:', err);
    alert(isTamil ? 'சேமிப்பு தோல்வியடைந்தது. மீண்டும் முயற்சி செய்யவும்.' : 'Save failed. Please try again.');
  } finally {
    setSaving(false);
  }
};
  // ─── Insert a new DB entry ───────────────────────────────────────────────────
const saveToSupabase = async (entryName: string) => {
  if (!user?.id) {
    alert(isTamil ? 'விவரங்களைச் சேமிக்க உள்நுழையவும்.' : 'Please sign in to save your profiles.');
    return;
  }
  try {
    setSaving(true);
    const formValues = await uploadPhotoIfNeeded(values);

    const { data: inserted, error: insertError } = await supabase
      .from('biodata')
      .insert({
        user_id: user.id,
        entry_name: entryName,
        data: formValues,           // ← use formValues (with resolved filename), not a null photo
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (insertError) throw insertError;

    setValues(formValues);
    setCurrentEntryId(inserted.id);
    setCurrentEntryName(entryName);
    setShowSaveModal(false);
    setNewEntryName('');
    fetchEntries();
  } catch (err) {
    console.error('Error saving entry:', err);
    alert(isTamil ? 'சேமிப்பு தோல்வியடைந்தது. மீண்டும் முயற்சி செய்யவும்.' : 'Save failed. Please try again.');
  } finally {
    setSaving(false);
  }
};
	
  const handleLocationSearch = (query: string, fieldKey: string) => {
    setValues((prev: any) => ({ ...prev, [fieldKey]: query }));
    setActiveLocationField(fieldKey);
    if (autocompleteTimeout.current) clearTimeout(autocompleteTimeout.current);
    if (!query || query.length < 2) {
      setPlaceSuggestions([]);
      return;
    }
    autocompleteTimeout.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
        const res = await fetch(url, { headers: { 'User-Agent': 'VedicAstroApp/1.0' } });
        const data = await res.json();
        setPlaceSuggestions(data || []);
      } catch (err) {
        console.error(err);
      }
    }, 400);
  };

  const handleSelectSuggestion = (display_name: string, fieldKey: string) => {
    setValues((prev: any) => ({ ...prev, [fieldKey]: display_name }));
    setPlaceSuggestions([]);
    setActiveLocationField(null);
  };

  const triggerSubmit = () => {
	console.log('in triggerSubmit', values)
    if (!values.name) {
      alert(isTamil ? 'பெயரை உள்ளிடவும்' : 'Please enter a name');
      return;
    }
    if (!values.dob) {
      alert(isTamil ? 'பிறந்த தேதியைத் தேர்ந்தெடுக்கவும்' : 'Please select birth date');
      return;
    }
    onSubmit(values, reportType);
  };

  const sectionHeaderClass = "flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-violet-600 dark:text-violet-400 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4 mt-6";

  return (
  <ScreenGuard featureId="biodata">
    <div className="space-y-6">
      {/* Save / Load Sub-panel */}
      {user?.id && (
        <div className="bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-500" />
            <div>
              <h4 className="text-xs font-extrabold text-gray-900 dark:text-white uppercase tracking-wider">
                {currentEntryName ? `${isTamil ? 'திருத்துகிறது' : 'Editing'}: ${currentEntryName}` : (isTamil ? 'புதிய திருமண விவரம்' : 'New Profile')}
              </h4>
              <p className="text-[10px] text-gray-600 dark:text-gray-500">
                {isTamil ? 'உங்கள் சுயவிவரங்களைச் சேமித்து பின்னர் பயன்படுத்தலாம்' : 'Save profiles for printing or sharing later.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            {entries.length > 0 && (
              <div className="flex items-center gap-2 flex-1 md:flex-none">
                <select
                  value={selectedEntryId}
                  onChange={(e) => setSelectedEntryId(e.target.value)}
                  className="bg-white dark:bg-slate-950 border border-gray-300 dark:border-gray-800 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-white outline-none focus:border-violet-500"
                >
                  {entries.map((e) => (
                    <option key={e.id} value={e.id}>{e.entry_name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleLoadEntry(Number(selectedEntryId))}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all"
                >
                  {isTamil ? 'ஏற்றுக' : 'Load'}
                </button>
                <button
                  onClick={() => handleDeleteEntry(Number(selectedEntryId))}
                  className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 p-1.5"
                  title="Delete Profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={handleReset}
              className="border border-gray-300 dark:border-gray-800 hover:bg-slate-800 text-gray-600 dark:text-gray-400 hover:text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all"
            >
              {isTamil ? 'புதியது' : 'Reset'}
            </button>
          </div>
        </div>
      )}

      {/* Main Form Fields */}
      <div className="bg-white dark:bg-slate-900/40 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xl space-y-4">
        {/* Registration No */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">
              {isTamil ? 'பதிவு எண் (விருப்பத்தேர்வு)' : 'Registration No (Optional)'}
            </span>
            <input
              type="text"
              value={values.registrationNo || ''}
              onChange={(e) => setValues({ ...values, registrationNo: e.target.value })}
              placeholder="e.g. REG-40592"
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">
              {isTamil ? 'அறிக்கை வடிவம்' : 'Report Type'}
            </span>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            >
              <option value="type1">{isTamil ? 'முழு ஜாதக ஜாதக விவரங்கள் (வகை 1)' : 'Full Kundli & Dasha Details (Type 1)'}</option>
              <option value="type2">{isTamil ? 'அடிப்படை ஜாதக விவரங்கள் மட்டும் (வகை 2)' : 'Basic Kundli Info Only (Type 2)'}</option>
            </select>
          </div>
        </div>

        {/* SECTION 1: Personal Info */}
        <h3 className={sectionHeaderClass}>
          <User className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          {isTamil ? 'தனிப்பட்ட விவரங்கள்' : 'Personal Details'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Name *</span>
            <input
              type="text"
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Gender</span>
            <select
              value={values.gender}
              onChange={(e) => setValues({ ...values, gender: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            >
              <option value={isTamil ? 'பெண்' : 'Female'}>{isTamil ? 'பெண்' : 'Female'}</option>
              <option value={isTamil ? 'ஆண்' : 'Male'}>{isTamil ? 'ஆண்' : 'Male'}</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Date of Birth *</span>
            <input
              type="date"
              value={values.dob}
              onChange={(e) => setValues({ ...values, dob: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Time of Birth *</span>
            <input
              type="time"
              value={values.tob}
              onChange={(e) => setValues({ ...values, tob: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>

          <div className="space-y-1.5 relative">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Birth Place *</span>
            <input
              type="text"
              value={values.birthPlace}
              onChange={(e) => handleLocationSearch(e.target.value, 'birthPlace')}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
            {activeLocationField === 'birthPlace' && placeSuggestions.length > 0 && (
              <div className="absolute top-14 left-0 right-0 bg-white dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden z-50 shadow-2xl">
                {placeSuggestions.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(p.display_name, 'birthPlace')}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-slate-900 hover:text-white border-b border-gray-100 dark:border-gray-900/60"
                  >
                    {p.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Religion</span>
            <input
              type="text"
              value={values.religion}
              onChange={(e) => setValues({ ...values, religion: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Caste</span>
            <input
              type="text"
              value={values.caste}
              onChange={(e) => setValues({ ...values, caste: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Height</span>
            <input
              type="text"
              value={values.height}
              onChange={(e) => setValues({ ...values, height: e.target.value })}
              placeholder="e.g. 5 ft 4 in"
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Weight</span>
            <input
              type="text"
              value={values.weight}
              onChange={(e) => setValues({ ...values, weight: e.target.value })}
              placeholder="e.g. 62 kg"
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Complexion</span>
            <input
              type="text"
              value={values.complexion}
              onChange={(e) => setValues({ ...values, complexion: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Marital Status</span>
            <input
              type="text"
              value={values.maritalStatus}
              onChange={(e) => setValues({ ...values, maritalStatus: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>

          <div className="space-y-1.5 relative">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Native Place</span>
            <input
              type="text"
              value={values.nativePlace}
              onChange={(e) => handleLocationSearch(e.target.value, 'nativePlace')}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
            {activeLocationField === 'nativePlace' && placeSuggestions.length > 0 && (
              <div className="absolute top-14 left-0 right-0 bg-white dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden z-50 shadow-2xl">
                {placeSuggestions.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(p.display_name, 'nativePlace')}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-slate-900 hover:text-white border-b border-gray-100 dark:border-gray-900/60"
                  >
                    {p.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Optional Direct Photo URL/Input */}
<div className="space-y-1.5">
  <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1">
    <ImageIcon className="w-3 h-3" />
    {isTamil ? 'புகைப்படம்' : 'Photo'}
  </span>

  {/* Preview */}
  {values.photo ? (
    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
      <img
        src={values.photo}
        alt="preview"
        className="w-full h-full object-cover"
      />
      <button
        onClick={() => setValues({ ...values, photo: '' })}
        className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black/80 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
        title="Remove"
      >
        ✕
      </button>
    </div>
  ) : (
    <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-violet-500 transition-colors">
      <ImageIcon className="w-5 h-5 text-gray-400 mb-1" />
      <span className="text-[9px] text-gray-400 text-center leading-tight">
        {isTamil ? 'படம் தேர்ந்தெடு' : 'Upload'}
      </span>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            setValues((prev: any) => ({ ...prev, photo: ev.target?.result as string }));
          };
          reader.readAsDataURL(file);
        }}
      />
    </label>
  )}

  {/* URL fallback input */}
  <input
    type="text"
    value={values.photo.startsWith('data:') ? '' : values.photo}
    onChange={(e) => setValues({ ...values, photo: e.target.value })}
    placeholder="…or paste a URL"
    className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
  />
</div>
        </div>

        {/* SECTION 2: Professional Details */}
        <h3 className={sectionHeaderClass}>
          <BookOpen className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          {isTamil ? 'கல்வி மற்றும் வேலை' : 'Education & Profession'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Education</span>
            <input
              type="text"
              value={values.education}
              onChange={(e) => setValues({ ...values, education: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Occupation</span>
            <input
              type="text"
              value={values.occupation}
              onChange={(e) => setValues({ ...values, occupation: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Salary / Monthly Income</span>
            <input
              type="text"
              value={values.salary}
              onChange={(e) => setValues({ ...values, salary: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* SECTION 3: Family details */}
        <h3 className={sectionHeaderClass}>
          <Users className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          {isTamil ? 'குடும்ப விவரங்கள்' : 'Family Details'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Father's Name</span>
            <input
              type="text"
              value={values.fatherName}
              onChange={(e) => setValues({ ...values, fatherName: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Father's Occupation</span>
            <input
              type="text"
              value={values.fatherOccupation}
              onChange={(e) => setValues({ ...values, fatherOccupation: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Mother's Name</span>
            <input
              type="text"
              value={values.motherName}
              onChange={(e) => setValues({ ...values, motherName: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Mother's Occupation</span>
            <input
              type="text"
              value={values.motherOccupation}
              onChange={(e) => setValues({ ...values, motherOccupation: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest font-sans">Siblings (Brothers / Sisters)</span>
            <input
              type="text"
              value={values.siblings}
              onChange={(e) => setValues({ ...values, siblings: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* SECTION 4: Property Details */}
        <h3 className={sectionHeaderClass}>
          <Home className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          {isTamil ? 'சொத்து விவரங்கள்' : 'Property Details'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Property Type</span>
            <input
              type="text"
              value={values.propertyType}
              onChange={(e) => setValues({ ...values, propertyType: e.target.value })}
              placeholder="e.g. Own House, Agricultural land"
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Property Location</span>
            <input
              type="text"
              value={values.propertyLocation}
              onChange={(e) => setValues({ ...values, propertyLocation: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* SECTION 5: Expectations */}
        <h3 className={sectionHeaderClass}>
          <Heart className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          {isTamil ? 'எதிர்பார்ப்புகள்' : 'Expectations'}
        </h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Expectations</span>
            <textarea
              value={values.expectation}
              onChange={(e) => setValues({ ...values, expectation: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500 h-20 resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Additional Notes</span>
            <textarea
              value={values.notes}
              onChange={(e) => setValues({ ...values, notes: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500 h-20 resize-none"
            />
          </div>
        </div>

        {/* SECTION 6: Contact */}
        <h3 className={sectionHeaderClass}>
          <Phone className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          {isTamil ? 'தொடர்பு விவரங்கள்' : 'Contact Details'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Phone Number</span>
            <input
              type="text"
              value={values.phone}
              onChange={(e) => setValues({ ...values, phone: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <span className="text-[10px] font-extrabold text-gray-600 dark:text-gray-500 uppercase tracking-widest">Address</span>
            <input
              type="text"
              value={values.address}
              onChange={(e) => setValues({ ...values, address: e.target.value })}
              className="w-full bg-white dark:bg-slate-950/60 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Save and Submit Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          {user?.id && (
            <button
              onClick={() => {
                if (currentEntryId) {
                  saveExistingEntry();
                } else {
                  setShowSaveModal(true);
                }
              }}
              disabled={saving}
              className="flex-1 border border-violet-500 hover:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold text-xs py-2.5 rounded-lg transition-all uppercase tracking-wider flex items-center justify-center gap-2 h-10"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? (isTamil ? 'சேமிக்கப்படுகிறது...' : 'Saving...') : (isTamil ? 'சுயவிவரத்தை சேமிக்க' : 'Save Profile')}</span>
            </button>
          )}

          <button
            onClick={triggerSubmit}
            disabled={loading}
            className="flex-[2] bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-extrabold text-xs py-2.5 rounded-lg transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-10"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{isTamil ? 'ஜாதகம் கணிக்கப்படுகிறது...' : 'Generating Astro Data...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>{isTamil ? 'விவர பத்திரிகை உருவாக்கு' : 'Generate Biodata Report'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Profile Modal (for naming new profiles) */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">{isTamil ? 'சுயவிவர சேமிப்பு' : 'Save Profile Name'}</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">{isTamil ? 'இந்த சுயவிவரத்தை மீண்டும் பயன்படுத்த பெயர் கொடுங்கள்' : 'Provide a name for this profile to reload it later.'}</p>
            <input
              type="text"
              value={newEntryName}
              onChange={(e) => setNewEntryName(e.target.value)}
              placeholder="e.g. My Profile Draft"
              className="w-full bg-white dark:bg-slate-950 border border-gray-300 dark:border-gray-800 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-xs outline-none focus:border-violet-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 rounded-lg"
              >
                {isTamil ? 'ரத்து செய்க' : 'Cancel'}
              </button>
              <button
                onClick={() => saveToSupabase(newEntryName)}
                disabled={!newEntryName.trim()}
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold py-2 rounded-lg disabled:opacity-50"
              >
                {isTamil ? 'சேமிக்க' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
	</ScreenGuard>
  );
}

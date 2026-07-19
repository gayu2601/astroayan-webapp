import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BiodataForm from './BiodataForm';
import BiodataPreview from './BiodataPreview';
import { useBiodata } from '../../hooks/useBiodata';
import { useAuth } from '../../lib/AuthContext';

async function geocodePlace(placeName: string) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'AstroAyanWeb/1.0' } });
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const results = await res.json();
  if (!results.length) throw new Error(`Place not found: "${placeName}"`);
  const { lat, lon } = results[0];
  return { lat: parseFloat(lat), lon: parseFloat(lon) };
}

export default function BiodataGenerator() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<any>(null);
  const { data: biodataOutput, loading, error, fetch: fetchBiodata } = useBiodata();
  const { language } = useAuth();

  // If the hook surfaces an error, drop back to the form so the user can retry.
  useEffect(() => {
    if (error) {
      alert(error);
      setFormData(null);
    }
  }, [error]);

  const handleSubmit = async (values: any, reportType: string) => {
    setFormData(values);
    try {
      const { lat, lon } = await geocodePlace(values.birthPlace?.trim());
      const [year, month, day] = (values.dob || '').split('-').map(Number);
      const [hour, min] = (values.tob || '00:00').split(':').map(Number);
      await fetchBiodata({ day, month, year, hour, min, lat, lon, tzone: 5.5, lang: language }, reportType);
    } catch (err: any) {
      console.error('BiodataGenerator submit failed:', err);
      alert(err.message || 'Could not generate biodata');
      setFormData(null);
    }
  };

  const handleBack = () => {
    setFormData(null);
    navigate(-1);
  };

  if (formData && biodataOutput && !loading) {
    return <BiodataPreview formData={formData} biodataOutput={biodataOutput} onBack={handleBack} />;
  }

  return <BiodataForm loading={loading} onSubmit={handleSubmit} />;
}
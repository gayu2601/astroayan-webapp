import { useState, useEffect, useCallback } from 'react';

const ASTRO_BASE = 'https://api.vedicastroapi.com/v3-json';

const astroGet = async (endpoint, params) => {
  const query = new URLSearchParams(params).toString();

  const res = await fetch(`${ASTRO_BASE}/${endpoint}?${query}`);

  if (!res.ok) {
    throw new Error(`${endpoint} failed: ${res.status}`);
  }

  return res.json();
};

export const useRasiPalan = (input) => {
  const [rasiPalan, setRasiPalan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRasiPalan = useCallback(async () => {
    if (!input) return;
    try {
      setLoading(true);
      setError(null);
      const response = await astroGet('prediction/daily-sun', input);
      setRasiPalan(response?.response ?? null);
    } catch (e) {
      setError(e.message);
      setRasiPalan(null);
    } finally {
      setLoading(false);
    }
  }, [input]);

  useEffect(() => {
    fetchRasiPalan();
  }, [fetchRasiPalan]);

  return {
    rasiPalan,
    loading,
    error,
    refetch: fetchRasiPalan,
  };
};
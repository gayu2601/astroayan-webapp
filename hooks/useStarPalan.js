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

export const useStarPalan = (input) => {
  const [starPalan, setStarPalan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStarPalan = useCallback(async () => {
    if (!input) return;
    try {
      setLoading(true);
      setError(null);
      const response = await astroGet('prediction/daily-nakshatra', input);
      setStarPalan(response?.response ?? null);
    } catch (e) {
      setError(e.message);
      setStarPalan(null);
    } finally {
      setLoading(false);
    }
  }, [input]);

  useEffect(() => {
    fetchStarPalan();
  }, [fetchStarPalan]);

  return {
    starPalan,
    loading,
    error,
    refetch: fetchStarPalan,
  };
};
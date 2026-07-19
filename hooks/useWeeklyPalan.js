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

export const useWeeklyPalan = (input) => {
  const [weeklyPalan, setWeeklyPalan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeeklyPalan = useCallback(async () => {
    if (!input) return;
    try {
      setLoading(true);
      setError(null);
      const response = await astroGet('prediction/weekly-sun', input);
      setWeeklyPalan(response?.response ?? null);
    } catch (e) {
      setError(e.message);
      setWeeklyPalan(null);
    } finally {
      setLoading(false);
    }
  }, [input]);

  useEffect(() => {
    fetchWeeklyPalan();
  }, [fetchWeeklyPalan]);

  return {
    weeklyPalan,
    loading,
    error,
    refetch: fetchWeeklyPalan,
  };
};
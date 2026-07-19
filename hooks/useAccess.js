// lib/useAccess.js
// ─────────────────────────────────────────────────────────────────────────────
// Schema-exact version matching your customer_plans + profiles tables.
//
// Key schema facts used here:
//   customer_plans.customer_id  → FK → profiles.id
//   customer_plans.features     → text[]
//   customer_plans.is_active    → boolean
//   customer_plans.status       → 'Active' | 'Expired' | 'Pending'
//   customer_plans.expires_at   → timestamptz  (NOT NULL)
//   customer_plans.duration_id  → text (nullable)
//   profiles.is_active          → boolean
//   profiles.user_type          → 'user' | 'admin' | 'retailer'
//   (no approval_status column on profiles)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

// ── Feature → screen route mapping ───────────────────────────────────────────
export const FEATURE_ROUTE_MAP = {
  panchang:      '(app)/panchangam',
  jadhagam:      '(app)/horoscope',
  book_pdf:      '(app)/pageHoroscope',
  horoscope_pdf: '(app)/horoscope1',
  porutham_star: '(app)/stars',
  porutham_mrg: '(app)/porutham',
  porutham_pdf: '(app)/poruthamPdf',
  hora: '(app)/hora',
  biodata: '(app)/biodata',
  age_calc:      '(app)/age',
  gocharam:      '(app)/gocharam',
  manaiyadi: '(app)/manaiyadi',
  palli_palan:      '(app)/palliPalan',
};

// Reverse: route segment → featureId  e.g. 'home' → 'panchang'
export const ROUTE_FEATURE_MAP = Object.entries(FEATURE_ROUTE_MAP).reduce(
  (acc, [fid, route]) => { acc[route.split('/').pop()] = fid; return acc; }, {}
);

// ─────────────────────────────────────────────────────────────────────────────
export function useAccess() {
  const { user } = useAuth();                   // user.id must be the profiles.id UUID
  const [plan,      setPlan]      = useState(null);
  const [features,  setFeatures]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [isTrial,   setIsTrial]   = useState(false);

  const loadPlan = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }

    setLoading(true);
    try {
      // ── Fetch the single most-recent ACTIVE plan ──────────────────────────
      // We query is_active=true first; the trg_plan_status trigger keeps
      // status in sync server-side, but we double-check expiry client-side.
      const { data, error } = await supabase
        .from('customer_plans')
        .select('*')
        .eq('customer_id', user.id)
        .eq('is_active', true)
        .order('activated_at', { ascending: false })
        .limit(1)
        .maybeSingle();           // maybeSingle() returns null (not error) when 0 rows

      if (error) {
        console.warn('[useAccess] fetch error:', error.message);
      }

      if (!data) {
        // No active plan row at all
        setPlan(null); setFeatures([]); setIsExpired(false); setIsTrial(false);
        return;
      }

      // ── Client-side expiry check ──────────────────────────────────────────
      // expires_at is stored as '9999-12-31T00:00:00.000Z' for lifetime plans
      const isLifetime = data.expires_at?.startsWith('9999');
      const expired    = !isLifetime && new Date(data.expires_at) < new Date();

      if (expired) {
        // Fire-and-forget: mark expired in DB so the trigger + other sessions agree
        supabase
          .from('customer_plans')
          .update({ is_active: false, status: 'Expired' })
          .eq('id', data.id);
      }

      setPlan(data);
      setFeatures(expired ? [] : (data.features ?? []));
      setIsExpired(expired);
      setIsTrial(data.duration_id === '1d');
    } catch (err) {
      console.error('[useAccess] unexpected error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadPlan(); }, [loadPlan]);

  // ── Real-time: admin updates customer_plans → instant unlock/lock ─────────
  useEffect(() => {
    if (!user?.id) return;
	const channelName = `access:${user.id}:${Date.now()}`;
    const ch = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event:  '*',
        schema: 'public',
        table:  'customer_plans',
        filter: `customer_id=eq.${user.id}`,
      }, () => loadPlan())
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [user?.id, loadPlan]);

  // ── hasAccess(featureId | routeSegment) ───────────────────────────────────
  const hasAccess = useCallback(
    (key) => {
      if (!plan || isExpired) return false;
      if (features.includes(key)) return true;                  // direct featureId
      const fid = ROUTE_FEATURE_MAP[key];                       // route segment
      return !!(fid && features.includes(fid));
    },
    [plan, features, isExpired]
  );

  return { plan, features, loading, isExpired, isTrial, hasAccess, reload: loadPlan };
}
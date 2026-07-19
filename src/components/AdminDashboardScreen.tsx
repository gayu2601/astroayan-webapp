import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  Crown, Pencil, KeyRound, Trash2, Tag, Bell, Download, LogOut, X, Check, Phone,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import toast from '../../lib/toast'

// =============================================================================
// THEME
// =============================================================================
const T = {
  deep: '#0A0612', surface: '#120D1E', card: '#1A1230',
  gold: '#D4A843', goldL: '#F0C96A', goldD: '#8A6A20',
  purple: '#6B3FA0', purpleL: '#9B6FD0',
  text: '#E8DFF5', muted: '#8B7AAA',
  border: 'rgba(212,168,67,0.18)', border2: 'rgba(107,63,160,0.25)',
  active: '#2ECC71', expired: '#E74C3C', warn: '#F39C12', blue: '#74B9FF',
};

const FEATURES = [
  { id: 'panchang', icon: '🌅', name: 'Daily Panchangam', nameTA: 'நாள் பஞ்சாங்கம்', desc: 'தினசரி பஞ்சாங்கம்' },
  { id: 'jadhagam', icon: '📜', name: 'Jadhagam', nameTA: 'ஜாதகம்', desc: 'முழு ஜாதகம்' },
  { id: 'horoscope_pdf', icon: '📕', name: '1 Page Jadhagam', nameTA: 'ஒரு பக்க ஜாதகம்', desc: 'ஒரு பக்க ஜாதகம் PDF' },
  { id: 'book_pdf', icon: '📕', name: 'Jadhagam Book', nameTA: 'விரிவான ஜாதகம்', desc: 'விரிவான ஜாதகம் PDF' },
  { id: 'porutham_star', icon: '⭐', name: 'Matching Stars', nameTA: 'பொருந்தும் நட்சத்திரங்கள்', desc: 'பொருந்தும் ஆண் & பெண் நட்சத்திரங்கள்' },
  { id: 'porutham_mrg', icon: '💍', name: 'Marriage Porutham', nameTA: 'திருமண பொருத்தம்', desc: 'திருமண பொருத்தம் - 10 பொருத்தம் - ராசி & லக்னம்' },
  { id: 'porutham_pdf', icon: '📄', name: 'Marriage Porutham PDF', nameTA: 'திருமண பொருத்தம் PDF', desc: 'திருமண பொருத்தம் - 10 பொருத்தம் - ராசி & லக்னம் PDF' },
  { id: 'biodata', icon: '🪪', name: 'Marriage Biodata PDF', nameTA: 'திருமண பயோடேட்டா PDF', desc: 'திருமண பயோடேட்டா PDF' },
  { id: 'hora', icon: '🕒', name: 'Hora Muhurtham', nameTA: 'ஹோரை முகூர்த்தம்', desc: 'ஹோரை முகூர்த்த நேரங்கள்' },
  { id: 'gocharam', icon: '🪐', name: 'Gocharam', nameTA: 'கோச்சாரம்', desc: 'கோச்சார கட்டம்' },
  { id: 'manaiyadi', icon: '🏠', name: 'Manaiyadi Sasthiram', nameTA: 'மனையடி சாஸ்திரம்', desc: 'மனை அளவு மற்றும் வாஸ்து பலன்கள்' },
  { id: 'palli_palan', icon: '🦎', name: 'Palli Vizhum Palan', nameTA: 'பல்லி விழும் பலன்', desc: 'பல்லி விழும் பலன்கள்' },
  { id: 'age_calc', icon: '🔢', name: 'Age Calculator', nameTA: 'வயது கணக்கீடு', desc: 'வயது கணித்தல்' },
  { id: 'daily_rasi_palan', icon: '♈', name: 'Daily Rasi Palan', nameTA: 'தின ராசி பலன்', desc: 'இன்றைய ராசி பலன்கள்' },
  { id: 'daily_nakshatra_palan', icon: '🌟', name: 'Daily Nakshatra Palan', nameTA: 'தின நட்சத்திர பலன்', desc: 'இன்றைய நட்சத்திர பலன்கள்' },
  { id: 'weekly_rasi_palan', icon: '📅', name: 'Weekly Rasi Palan', nameTA: 'வார ராசி பலன்', desc: 'இந்த வார ராசி பலன்கள்' },
];

const DURATIONS = [
  { id: '1d', label: '1 Day', sub: 'Trial', days: 1 },
  { id: '1m', label: '1 Month', sub: '30 days', days: 30 },
  { id: '3m', label: '3 Months', sub: '90 days', days: 90 },
  { id: '6m', label: '6 Months', sub: '180 days', days: 180 },
  { id: '1y', label: '1 Year', sub: '365 days', days: 365 },
  { id: '2y', label: '2 Years', sub: '730 days', days: 730 },
  { id: '3y', label: '3 Years', sub: '1095 days', days: 1095 },
  { id: '5y', label: '5 Years', sub: '1825 days', days: 1825 },
  { id: 'life', label: 'Lifetime', sub: 'Forever', days: null as number | null },
];

const AVATAR_COLORS = [
  { bg: 'rgba(212,168,67,0.15)', fg: T.gold },
  { bg: 'rgba(107,63,160,0.2)', fg: T.purpleL },
  { bg: 'rgba(46,204,113,0.15)', fg: T.active },
  { bg: 'rgba(231,76,60,0.15)', fg: T.expired },
  { bg: 'rgba(243,156,18,0.15)', fg: T.warn },
  { bg: 'rgba(116,185,255,0.15)', fg: T.blue },
];

const FEATURE_LABELS: Record<string, string> = {
  panchang: 'Panchang', jadhagam: 'Jadhagam', horoscope_pdf: '1 Page Jadhagam',
  book_pdf: 'Jadhagam Book', porutham_star: 'Matching Stars', porutham_mrg: 'Marriage Porutham',
  porutham_pdf: 'Marriage Porutham PDF', biodata: 'Marriage Biodata PDF', hora: 'Hora Muhurtham',
  gocharam: 'Gocharam', age_calc: 'Age Calculator', manaiyadi: 'Manaiyadi Sasthiram',
  palli_palan: 'Palli Vizhum Palan', daily_rasi_palan: 'Daily Rasi Palan',
  daily_nakshatra_palan: 'Daily Nakshatra Palan', weekly_rasi_palan: 'Weekly Rasi Palan',
};

const ADMIN_ID = 'f7191c3d-b329-49e3-965d-c5015663ebba';

// =============================================================================
// HELPERS
// =============================================================================
function calcExpiry(days: number | null) {
  if (days === null) return '9999-12-31T00:00:00.000Z';
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function formatDate(iso?: string | null) {
  if (!iso || iso.startsWith('9999')) return 'Lifetime';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

function getInitials(name?: string | null, phone?: string | null) {
  return (name || phone || '?').slice(0, 2).toUpperCase();
}

// =============================================================================
// DB HELPERS
// =============================================================================
async function dbFetchUsers() {
  const { data, error } = await supabase.from('admin_user_list').select('*').neq('id', ADMIN_ID);
  if (error) throw error;
  return data || [];
}

async function dbSavePackage(userId: string, adminId: string, durationObj: typeof DURATIONS[0], features: string[]) {
  const now = new Date().toISOString();
  const expiresAt = calcExpiry(durationObj.days);
  const { error } = await supabase.from('customer_plans').upsert(
    {
      customer_id: userId, activated_by: adminId, updated_by: adminId,
      plan_name: `Jothidam · ${durationObj.label}`, duration_id: durationObj.id,
      duration_label: durationObj.label, duration_days: durationObj.days ?? 0,
      features, activated_at: now, expires_at: expiresAt, is_active: true, status: 'Active',
    },
    { onConflict: 'customer_id' }
  );
  if (error) throw error;
}

async function dbUpdatePassword(userId: string, password: string) {
  const { error } = await supabase.from('profiles').update({ password }).eq('id', userId);
  if (error) throw error;
}

async function dbUpdateUser(userId: string, changes: Record<string, any>) {
  const { error } = await supabase.from('profiles').update(changes).eq('id', userId);
  if (error) throw error;
}

async function dbDeleteUser(userId: string) {
  const { error } = await supabase.from('profiles').delete().eq('id', userId);
  if (error) throw error;
}

async function dbToggleRetailer(userId: string, makeRetailer: boolean) {
  const { error } = await supabase.from('profiles')
    .update({ user_type: makeRetailer ? 'retailer' : 'user' }).eq('id', userId);
  if (error) throw error;
}
// =============================================================================
// NOTIFICATIONS PANEL
// =============================================================================
type BellQuery = { id: string; phone_no: string; message: string; is_read: boolean; created_at: string };

function NotificationsPanel({
  open,
  onClose,
  queries,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  queries: BellQuery[];
  loading: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="absolute top-16 right-4 w-80 rounded-2xl border p-3.5 shadow-2xl"
        style={{ background: T.card, borderColor: T.border }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3 border-b pb-2.5" style={{ borderColor: T.border }}>
          <span className="font-serif text-base tracking-wide" style={{ color: T.gold }}>🔔 Messages</span>
          <button onClick={onClose}>
            <X className="h-4 w-4" style={{ color: T.muted }} />
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="text-center py-6 text-sm" style={{ color: T.muted }}>Loading…</div>
        ) : queries.length === 0 ? (
          <div className="text-center py-6 text-sm" style={{ color: T.muted }}>No messages yet</div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto space-y-2.5">
            {queries.map(q => (
              <div key={q.id} className="border-b pb-2.5" style={{ borderColor: 'rgba(212,168,67,0.08)' }}>
                <a
                  href={`tel:${q.phone_no}`}
                  className="text-sm font-semibold flex items-center gap-1"
                  style={{ color: T.gold }}
                >
                  <Phone className="h-3 w-3" /> {q.phone_no}
                </a>
                <p className="text-sm mt-1 line-clamp-3" style={{ color: T.text }}>{q.message}</p>
                <div className="text-xs mt-1" style={{ color: T.gold }}>
                  {new Date(q.created_at).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SHARED MODAL SHELL
// =============================================================================
function ModalShell({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.78)' }} onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-3">
        <div
          onClick={e => e.stopPropagation()}
          className={`w-full ${wide ? 'max-w-xl' : 'max-w-md'} rounded-2xl border flex flex-col max-h-[92vh]`}
          style={{ background: T.card, borderColor: T.border }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

function ModalHeader({ title, user, onClose }: { title: string; user?: any; onClose?: () => void }) {
  return (
    <div className="p-4 border-b flex items-center justify-between flex-wrap gap-2 rounded-t-2xl" style={{ background: T.surface, borderColor: T.border }}>
      <span className="font-serif tracking-wide text-base" style={{ color: T.gold }}>✦ {title}</span>
      <div className="flex items-center gap-2">
        {user && (
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-xs" style={{ background: 'rgba(107,63,160,0.2)', borderColor: T.border2, color: T.purpleL }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.active }} />
            {user.name || user.phone}
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="p-1"><X className="h-4 w-4" style={{ color: T.text }} /></button>
        )}
      </div>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2.5 mt-1">
      <span className="font-serif text-[10px] tracking-widest" style={{ color: T.goldD }}>{label.toUpperCase()}</span>
      <div className="flex-1 h-px" style={{ background: T.border }} />
    </div>
  );
}

// =============================================================================
// PACKAGE MODAL
// =============================================================================
function PackageModal({ visible, user, adminId, onClose, onSuccess}: any) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) { setSelected(new Set()); setDuration(DURATIONS[0]); }
  }, [visible, user?.id]);

  if (!visible) return null;

  const toggleFeature = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleAll = () =>
    selected.size === FEATURES.length ? setSelected(new Set()) : setSelected(new Set(FEATURES.map(f => f.id)));

  const expiresAt = calcExpiry(duration.days);

  const handleConfirm = async () => {
    if (!user || selected.size === 0) return;
    setLoading(true);
    try {
      await dbSavePackage(user.id, adminId, duration, Array.from(selected));
      onSuccess?.();
      onClose();
      toast.success(`Package Updated: ${selected.size} features · ${duration.label}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update package');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell onClose={onClose} wide>
      <ModalHeader title="Update Package" user={user} onClose={onClose} />
      <div className="overflow-y-auto px-4 pt-3.5">
        <SectionDivider label="Features" />
        <button
          onClick={toggleAll}
          className="w-full flex items-center justify-between rounded-lg p-3.5 border mb-2.5"
          style={{ background: 'rgba(212,168,67,0.06)', borderColor: 'rgba(212,168,67,0.15)' }}
        >
          <div className="text-left">
            <div className="font-bold text-sm" style={{ color: T.gold }}>Select All Features</div>
            <div className="text-xs mt-0.5" style={{ color: T.muted }}>{selected.size} of {FEATURES.length} selected</div>
          </div>
          <div className="w-10 h-[22px] rounded-full border flex items-center px-0.5" style={{ background: selected.size === FEATURES.length ? T.gold : 'rgba(255,255,255,0.06)', borderColor: selected.size === FEATURES.length ? T.gold : T.border, justifyContent: selected.size === FEATURES.length ? 'flex-end' : 'flex-start' }}>
            <span className="w-4 h-4 rounded-full bg-white block" />
          </div>
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
          {FEATURES.map(f => {
            const sel = selected.has(f.id);
            return (
              <button
                key={f.id}
                onClick={() => toggleFeature(f.id)}
                className="text-left rounded-lg p-3.5 border flex items-start gap-2.5"
                style={{ background: sel ? 'rgba(212,168,67,0.07)' : T.surface, borderColor: sel ? T.gold : T.border }}
              >
                <span className="text-xl w-6 text-center">{f.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm" style={{ color: T.text }}>{f.name}</div>
                  <div className="text-[11px]" style={{ color: T.purpleL }}>{f.nameTA}</div>
                  <div className="text-xs leading-snug" style={{ color: T.muted }}>{f.desc}</div>
                </div>
                <div className="w-[18px] h-[18px] rounded border flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: sel ? T.gold : 'transparent', borderColor: sel ? T.gold : T.border }}>
                  {sel && <Check className="h-3 w-3" style={{ color: T.deep }} />}
                </div>
              </button>
            );
          })}
        </div>
        <SectionDivider label="Plan Duration" />
        <div className="flex flex-wrap gap-1.5 mb-3.5 justify-center">
          {DURATIONS.map(d => {
            const sel = duration.id === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDuration(d)}
                className="rounded-lg py-2.5 px-3 border text-center w-[30%] sm:w-[23%]"
                style={{ background: sel ? 'rgba(212,168,67,0.08)' : T.surface, borderColor: sel ? T.gold : T.border }}
              >
                <div className="font-serif font-semibold text-sm" style={{ color: sel ? T.gold : T.text }}>{d.label}</div>
                <div className="text-[10px] mt-0.5" style={{ color: T.muted }}>{d.sub}</div>
              </button>
            );
          })}
        </div>
        <div className="rounded-lg p-3.5 border flex justify-around mb-2.5" style={{ background: T.surface, borderColor: T.border }}>
          <div className="text-center">
            <div className="font-serif font-bold text-base" style={{ color: T.gold }}>{selected.size}</div>
            <div className="text-[10px] tracking-wide mt-1" style={{ color: T.muted }}>FEATURES</div>
          </div>
          <div className="text-center">
            <div className="font-serif font-bold text-base" style={{ color: T.gold }}>{duration.label}</div>
            <div className="text-[10px] tracking-wide mt-1" style={{ color: T.muted }}>DURATION</div>
          </div>
          <div className="text-center">
            <div className="font-serif font-bold text-base" style={{ color: T.gold }}>{formatDate(expiresAt)}</div>
            <div className="text-[10px] tracking-wide mt-1" style={{ color: T.muted }}>EXPIRES</div>
          </div>
        </div>
        {selected.size > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {Array.from(selected).map(id => {
              const f = FEATURES.find(x => x.id === id);
              return f ? (
                <span key={id} className="rounded px-2 py-1 border text-xs" style={{ background: 'rgba(107,63,160,0.2)', borderColor: 'rgba(107,63,160,0.3)', color: T.purpleL }}>
                  {f.icon} {f.name.split(' ')[0]}
                </span>
              ) : null;
            })}
          </div>
        )}
        <div className="h-4" />
      </div>
      <div className="p-4 border-t space-y-2.5" style={{ background: T.surface, borderColor: T.border }}>
        {selected.size === 0 && <p className="text-xs text-center" style={{ color: T.muted }}>Select at least 1 feature</p>}
        <button
          onClick={handleConfirm}
          disabled={selected.size === 0 || loading}
          className="w-full py-3 rounded-lg font-bold text-sm"
          style={{ background: T.gold, color: T.deep, opacity: (selected.size === 0 || loading) ? 0.4 : 1 }}
        >
          {loading ? 'Saving…' : 'Confirm & Subscribe'}
        </button>
      </div>
    </ModalShell>
  );
}

// =============================================================================
// RESET PASSWORD MODAL
// =============================================================================
function ResetPasswordModal({ visible, user, onClose }: any) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (visible) { setPassword(''); setConfirm(''); } }, [visible]);

  if (!visible) return null;

  const handleSave = async () => {
    if (!password.trim()) return toast.warning('Password required');
    if (password.length < 4) return toast.warning('Password too short');
    if (password !== confirm) return toast.warning('Passwords do not match');
    setLoading(true);
    try {
      await dbUpdatePassword(user.id, password);
      toast.success(`Password updated for ${user.name || user.phone}`);
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader title="Reset Password" user={user} onClose={onClose} />
      <div className="p-5 space-y-3.5">
        <div>
          <label className="block text-[11px] tracking-wide mb-1 font-serif" style={{ color: T.muted }}>NEW PASSWORD</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter new password"
            className="w-full rounded-lg p-3 border text-sm" style={{ background: 'rgba(255,255,255,0.05)', borderColor: T.border, color: T.text }} />
        </div>
        <div>
          <label className="block text-[11px] tracking-wide mb-1 font-serif" style={{ color: T.muted }}>CONFIRM PASSWORD</label>
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password"
            className="w-full rounded-lg p-3 border text-sm" style={{ background: 'rgba(255,255,255,0.05)', borderColor: T.border, color: T.text }} />
        </div>
      </div>
      <div className="p-4 border-t flex flex-col sm:flex-row gap-2.5" style={{ background: T.surface, borderColor: T.border }}>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border text-sm" style={{ borderColor: T.border, color: T.muted }}>Cancel</button>
        <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 rounded-lg font-bold text-sm" style={{ background: T.gold, color: T.deep, opacity: loading ? 0.4 : 1 }}>
          {loading ? 'Saving…' : 'Update Password'}
        </button>
      </div>
    </ModalShell>
  );
}

// =============================================================================
// EDIT USER MODAL
// =============================================================================
function EditUserModal({ visible, user, onClose, onSuccess }: any) {
  const [form, setForm] = useState({ name: '', phone: '', location: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && user) setForm({ name: user.name || '', phone: user.phone || '', location: user.location || '' });
  }, [visible, user?.id]);

  if (!visible) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await dbUpdateUser(user.id, form);
      onSuccess?.({ ...user, ...form });
      onClose();
      toast.success('User Updated');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const FIELDS = [
    { label: 'FULL NAME', key: 'name', ph: 'Enter name' },
    { label: 'MOBILE NUMBER', key: 'phone', ph: '10-digit number' },
    { label: 'LOCATION', key: 'location', ph: 'City, State' },
  ] as const;

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader title="Edit User" user={user} onClose={onClose} />
      <div className="p-5 space-y-3.5">
        {FIELDS.map(f => (
          <div key={f.key}>
            <label className="block text-[11px] tracking-wide mb-1 font-serif" style={{ color: T.muted }}>{f.label}</label>
            <input
              value={(form as any)[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              placeholder={f.ph}
              className="w-full rounded-lg p-3 border text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', borderColor: T.border, color: T.text }}
            />
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex flex-col sm:flex-row gap-2.5" style={{ background: T.surface, borderColor: T.border }}>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border text-sm" style={{ borderColor: T.border, color: T.muted }}>Cancel</button>
        <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 rounded-lg font-bold text-sm" style={{ background: T.gold, color: T.deep, opacity: loading ? 0.4 : 1 }}>
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </ModalShell>
  );
}

// =============================================================================
// DELETE MODAL
// =============================================================================
function DeleteModal({ visible, user, onClose, onConfirm }: any) {
  const [loading, setLoading] = useState(false);
  if (!visible) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await dbDeleteUser(user.id);
      onConfirm?.(user.id);
      onClose();
      toast.info(`User ${user.name || user.phone} removed`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell onClose={onClose}>
      <div className="p-6 flex justify-center border-b rounded-t-2xl" style={{ background: T.surface, borderColor: T.border }}>
        <span className="text-3xl">⚠️</span>
      </div>
      <div className="p-5 text-center">
        <div className="font-serif font-bold text-base mb-2.5" style={{ color: T.expired }}>Delete User</div>
        <p className="text-sm leading-relaxed" style={{ color: T.muted }}>
          Delete "{user?.name || user?.phone}"?<br />This action cannot be undone.
        </p>
      </div>
      <div className="p-4 border-t flex flex-col sm:flex-row gap-2.5" style={{ background: T.surface, borderColor: T.border }}>
        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border text-sm" style={{ borderColor: T.border, color: T.muted }}>Cancel</button>
        <button onClick={handleDelete} disabled={loading} className="flex-1 py-2.5 rounded-lg font-bold text-sm text-white" style={{ background: T.expired, opacity: loading ? 0.4 : 1 }}>
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </ModalShell>
  );
}

// =============================================================================
// USER ROW — desktop table row (md+) and mobile card (below md)
// =============================================================================
function UserRow({ item, index, onPackage, onEdit, onPassword, onDelete, onToggleRetailer, navigate }: any) {
  const av = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const isActive = item.is_active;
  const isRetailer = item.user_type === 'retailer';
  const planStatus = item.plan_status || (isActive ? 'Active' : 'Expired');

  const ActionButtons = ({ mobile }: { mobile?: boolean }) => (
    <div className={`flex flex-wrap gap-1.5 ${mobile ? '' : ''}`}>
      <button onClick={onPackage} className={`${mobile ? 'w-10 h-10' : 'w-8 h-8'} rounded-full border flex items-center justify-center`} style={{ background: 'rgba(212,168,67,0.12)', borderColor: 'rgba(212,168,67,0.3)' }}><Crown className="h-3.5 w-3.5" style={{ color: T.gold }} /></button>
      <button onClick={onEdit} className={`${mobile ? 'w-10 h-10' : 'w-8 h-8'} rounded-full border flex items-center justify-center`} style={{ background: 'rgba(107,63,160,0.12)', borderColor: 'rgba(107,63,160,0.3)' }}><Pencil className="h-3.5 w-3.5" style={{ color: T.purpleL }} /></button>
      <button onClick={onPassword} className={`${mobile ? 'w-10 h-10' : 'w-8 h-8'} rounded-full border flex items-center justify-center`} style={{ background: 'rgba(116,185,255,0.1)', borderColor: 'rgba(116,185,255,0.3)' }}><KeyRound className="h-3.5 w-3.5" style={{ color: T.blue }} /></button>
      <button onClick={onDelete} className={`${mobile ? 'w-10 h-10' : 'w-8 h-8'} rounded-full border flex items-center justify-center`} style={{ background: 'rgba(231,76,60,0.1)', borderColor: 'rgba(231,76,60,0.3)' }}><Trash2 className="h-3.5 w-3.5" style={{ color: T.expired }} /></button>
      <button onClick={onToggleRetailer} className={`${mobile ? 'w-10 h-10' : 'w-8 h-8'} rounded-full border flex items-center justify-center`} style={{ background: isRetailer ? 'rgba(212,168,67,0.25)' : 'rgba(212,168,67,0.06)', borderColor: isRetailer ? T.gold : 'rgba(212,168,67,0.2)' }}><Tag className="h-3.5 w-3.5" style={{ color: T.gold }} /></button>
    </div>
  );

  const FeatureBadges = () => (
    Array.isArray(item.features) && item.features.length > 0 ? (
      <div className="flex flex-wrap gap-1">
        {item.features.map((f: string) => (
          <span key={f} className="rounded px-1.5 py-0.5 border text-[11px] font-bold" style={{ background: 'rgba(212,168,67,0.08)', borderColor: 'rgba(212,168,67,0.2)', color: T.goldL }}>
            {FEATURE_LABELS[f] || f}
          </span>
        ))}
      </div>
    ) : <span className="text-xs" style={{ color: T.expired }}>None</span>
  );

  return (
    <>
      {/* Mobile card */}
      <div className="md:hidden rounded-none border-b px-3 py-3.5 mb-3" style={{ background: T.card, borderColor: 'rgba(212,168,67,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: av.bg }}>
            <span className="text-[13px] font-bold" style={{ color: av.fg }}>{getInitials(item.name, item.phone)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate" style={{ color: T.text }}>{item.name || '—'}</div>
            <div className="text-xs mt-0.5" style={{ color: T.muted }}>📱 {item.phone || '—'}</div>
          </div>
        </div>
        {item.location && <div className="text-xs mt-1.5" style={{ color: T.muted }}>📍 {item.location}</div>}
        {isRetailer && (
          <span
            className="inline-block mt-1.5 rounded px-1.5 py-0.5 border text-[11px] font-bold cursor-pointer"
            style={{ background: 'rgba(212,168,67,0.12)', borderColor: 'rgba(212,168,67,0.3)', color: T.gold }}
            onClick={() => navigate(`/admin/retailer?id=${item.id}&name=${encodeURIComponent(item.name || '')}&phone=${encodeURIComponent(item.phone || '')}`)}
          >
            🏷️ RETAILER →
          </span>
        )}
        {item.duration_label && (
          <div className="mt-2 space-y-1">
            <span className="inline-block rounded px-1.5 py-0.5 border text-xs font-bold" style={{ background: 'rgba(107,63,160,0.2)', borderColor: 'rgba(107,63,160,0.35)', color: T.purpleL }}>{item.duration_label.toUpperCase()}</span>
            {item.plan_name && <div className="text-xs truncate" style={{ color: T.muted }}>{item.plan_name}</div>}
            <div className="text-xs" style={{ color: T.muted }}>Exp: {formatDate(item.expires_at)}</div>
          </div>
        )}
        <div className="mt-2"><FeatureBadges /></div>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="w-[7px] h-[7px] rounded-full" style={{ background: isActive ? T.active : T.expired }} />
          <span className="text-xs font-bold tracking-wide" style={{ color: isActive ? T.active : T.expired }}>{planStatus.toUpperCase()}</span>
        </div>
        <div className="mt-3"><ActionButtons mobile /></div>
      </div>

      {/* Desktop table row */}
      <div className="hidden md:flex items-center px-3 py-3.5 border-b mx-3.5 gap-1.5" style={{ background: T.card, borderColor: 'rgba(212,168,67,0.06)' }}>
        <div
          className="flex items-center gap-2 flex-[1.4] cursor-pointer"
          onClick={() => isRetailer && navigate(`/admin/retailer?id=${item.id}&name=${encodeURIComponent(item.name || '')}&phone=${encodeURIComponent(item.phone || '')}`)}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: av.bg }}>
            <span className="text-xs font-bold" style={{ color: av.fg }}>{getInitials(item.name, item.phone)}</span>
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm truncate" style={{ color: T.text }}>{item.name || '—'}</div>
            <div className="text-xs" style={{ color: T.muted }}>📱 {item.phone || '—'}</div>
            {item.location && <div className="text-xs" style={{ color: T.muted }}>📍 {item.location}</div>}
            {isRetailer && <span className="inline-block mt-0.5 rounded px-1 py-px border text-[9px] font-bold" style={{ background: 'rgba(212,168,67,0.12)', borderColor: 'rgba(212,168,67,0.3)', color: T.gold }}>🏷️ RETAILER →</span>}
          </div>
        </div>
        <div className="flex-[0.8] min-w-0">
          {item.duration_label ? (
            <>
              <span className="inline-block rounded px-1.5 py-0.5 border text-[11px] font-bold" style={{ background: 'rgba(107,63,160,0.2)', borderColor: 'rgba(107,63,160,0.35)', color: T.purpleL }}>{item.duration_label.toUpperCase()}</span>
              {item.plan_name && <div className="text-xs truncate mt-0.5" style={{ color: T.muted }}>{item.plan_name}</div>}
              <div className="text-xs truncate" style={{ color: T.muted }}>Exp: {formatDate(item.expires_at)}</div>
            </>
          ) : <span className="text-xs" style={{ color: T.expired }}>No plan</span>}
        </div>
        <div className="flex-[1.7]"><FeatureBadges /></div>
        <div className="flex-1 ml-6">
          <div className="flex items-center gap-1">
            <span className="w-[7px] h-[7px] rounded-full" style={{ background: isActive ? T.active : T.expired }} />
            <span className="text-[11px] font-bold tracking-wide" style={{ color: isActive ? T.active : T.expired }}>{planStatus.toUpperCase()}</span>
          </div>
          {item.activated_at_display && <div className="text-[11px]" style={{ color: T.muted }}>Act: {item.activated_at_display}</div>}
        </div>
        <div className="flex-[0.9] text-xs font-bold text-white truncate">{item.activated_by_name}</div>
        <div className="flex-[1.2]"><ActionButtons /></div>
      </div>
    </>
  );
}

// =============================================================================
// MAIN SCREEN
// =============================================================================
export default function AdminDashboardScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [pwdUser, setPwdUser] = useState<any>(null);
  const [pkgUser, setPkgUser] = useState<any>(null);
  const [editUser, setEditUser] = useState<any>(null);
  const [delUser, setDelUser] = useState<any>(null);
  const [bellOpen, setBellOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellQueries, setBellQueries] = useState<any[]>([]);
  const [bellLoading, setBellLoading] = useState(false);

  const { logout } = useAuth() as any;
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, expiredUsers: 0, todayActive: 0, totalRetailers: 0 });
  
  // After your existing stats computation, add this memoized map:
const filterCounts = useMemo(() => {
  const today = new Date().toDateString();
  const now = new Date().setHours(0, 0, 0, 0);
  return {
    All: users.length,
    Active: users.filter(u => u.is_active).length,
    Inactive: users.filter(u => !u.is_active).length,
    Retailer: users.filter(u => u.user_type === 'retailer').length,
    Today: users.filter(u => u.activated_at && new Date(u.activated_at).toDateString() === today).length,
    Premium: users.filter(u => u.plan_name && !u.plan_name.includes('Trial') && u.is_active).length,
  };
}, [users]);

  const loadUsers = useCallback(async () => {
    const data = await dbFetchUsers();
    setUsers(data);
    const today = new Date().toDateString();
    setStats({
      totalUsers: data.length,
      activeUsers: data.filter((u: any) => u.is_active).length,
      expiredUsers: data.filter((u: any) => !u.is_active).length,
      todayActive: data.filter((u: any) => u.activated_at && new Date(u.activated_at).toDateString() === today).length,
      totalRetailers: data.filter((u: any) => u.user_type === 'retailer').length,
    });
  }, []);

  useEffect(() => {
    (async () => { setLoading(true); try { await loadUsers(); } finally { setLoading(false); } })();

    const fetchUnread = async () => {
      const { count } = await supabase.from('support_queries').select('*', { count: 'exact', head: true }).eq('is_read', false);
      setUnreadCount(count ?? 0);
    };
    fetchUnread();

    const channel = supabase
      .channel('admin_bell_badge')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_queries' }, fetchUnread)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadUsers]);

  useEffect(() => {
    if (!bellOpen) return;
    (async () => {
      setBellLoading(true);
      const { data } = await supabase.from('support_queries').select('id, phone_no, message, is_read, created_at').order('created_at', { ascending: false }).limit(30);
      setBellQueries(data ?? []);
      setBellLoading(false);
      await supabase.from('support_queries').update({ is_read: true }).eq('is_read', false);
      setUnreadCount(0);
    })();
  }, [bellOpen]);

  const todayStr = new Date().toDateString();

  const filteredUsers = useMemo(() => users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || (u.name || '').toLowerCase().includes(q) || (u.phone || '').includes(q);
    const matchS = statusFilter === 'All'
      || (statusFilter === 'Active' && u.is_active)
      || (statusFilter === 'Inactive' && !u.is_active)
      || (statusFilter === 'Retailer' && u.user_type === 'retailer')
      || (statusFilter === 'Today' && u.activated_at && new Date(u.activated_at).toDateString() === todayStr)
      || (statusFilter === 'Premium' && u.plan_name && !u.plan_name.includes('Trial') && u.is_active);
    return matchQ && matchS;
  }), [users, search, statusFilter, todayStr]);

  const handleExportExcel = useCallback(() => {
    try {
      if (filteredUsers.length === 0) { toast.error('No users to export'); return; }
      const rows = filteredUsers.map(u => ({
        'Name': u.name || '', 'Phone': u.phone || '', 'Location': u.location || '',
        'User Type': u.user_type === 'retailer' ? 'Retailer' : 'User',
        'Plan Name': u.plan_name || '', 'Duration': u.duration_label || '',
        'Expires At': formatDate(u.expires_at), 'Status': u.plan_status || (u.is_active ? 'Active' : 'Expired'),
        'Activated By': u.activated_by_name || '', 'Activated At': u.activated_at_display || '',
        'Features': Array.isArray(u.features) ? u.features.map((f: string) => FEATURE_LABELS[f] || f).join(', ') : '',
      }));
      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 18 }, { wch: 10 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 14 }, { wch: 50 }];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
      const wbout = XLSX.write(workbook, { type: 'base64', bookType: 'xlsx' });
      const fileName = `jothidam_users_${new Date().toISOString().slice(0, 10)}.xlsx`;
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${wbout}`;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${rows.length} users exported`);
    } catch (err: any) {
      toast.error(`Export Failed: ${err.message}`);
    }
  }, [filteredUsers, toast]);

  const doToggleRetailer = useCallback(async (item: any) => {
	  const isRetailer = item.user_type === 'retailer';
	  try {
		await dbToggleRetailer(item.id, !isRetailer);
		setUsers(prev =>
		  prev.map(u => u.id === item.id ? { ...u, user_type: isRetailer ? 'user' : 'retailer' } : u)
		);
		toast.success(isRetailer
		  ? `${item.name || item.phone} is now a regular user`
		  : `${item.name || item.phone} is now a retailer`
		);
	  } catch (e: any) {
		toast.error(e.message);
	  }
	}, []);

	const handleToggleRetailer = useCallback((item: any) => {
	  const isRetailer = item.user_type === 'retailer';
	  toast.confirm(
		`${isRetailer ? 'Remove' : 'Activate'} retailer: ${item.name || item.phone}?`,
		() => doToggleRetailer(item),
		{ confirmLabel: isRetailer ? 'Remove' : 'Activate' }
	  );
	}, [doToggleRetailer]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
  }, [logout, navigate]);

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${T.deep}, ${T.surface}, ${T.deep})`, color: T.text }}>
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 px-4 sm:px-5 py-3.5 border-b" style={{ borderColor: T.border }}>
        <span className="font-serif tracking-[0.15em] text-lg sm:text-xl" style={{ color: T.gold }}>✦ ASTROAYAN ✦</span>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-sm" style={{ background: 'rgba(107,63,160,0.15)', borderColor: T.border2, color: T.purpleL }}>
            <span className="w-[7px] h-[7px] rounded-full" style={{ background: T.active }} />
            Admin
          </div>
          <div className="relative">
            <button
              onClick={() => setBellOpen(o => !o)}
              className="rounded-2xl border px-3 py-1.5"
              style={{ background: 'rgba(212,168,67,0.12)', borderColor: 'rgba(212,168,67,0.3)' }}
            >
              <Bell className="h-4.5 w-4.5" style={{ color: T.gold }} />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: T.expired }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>
          <button onClick={handleExportExcel} className="flex items-center gap-1.5 rounded-2xl px-3.5 py-1.5 border text-xs font-bold" style={{ background: 'rgba(46,204,113,0.15)', borderColor: 'rgba(46,204,113,0.4)', color: 'white' }}>
            <Download className="h-4 w-4" style={{ color: T.active }} /> Export
          </button>
          <button onClick={handleLogout} className="rounded-2xl px-3.5 py-1.5 text-xs font-bold text-white flex items-center gap-1.5" style={{ background: '#FF4D4F' }}>
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </div>

      {loading && <div className="text-center py-1 text-xs" style={{ color: T.gold }}>Loading…</div>}

      <div className="max-w-7xl mx-auto">
        {/* ── METRICS ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 px-3 sm:px-4 mt-2 mb-1">
          {[
            { label: 'Total Users', value: stats.totalUsers, color: T.gold },
            { label: 'Active', value: stats.activeUsers, color: T.active },
            { label: 'Expired', value: stats.expiredUsers, color: T.expired },
            { label: 'Today Active', value: stats.todayActive, color: T.warn },
            { label: 'Retailers', value: stats.totalRetailers, color: T.blue },
          ].map(m => (
            <div key={m.label} className="rounded-xl border p-3.5" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-[11px] tracking-wide font-serif mb-1.5" style={{ color: T.muted }}>{m.label.toUpperCase()}</div>
              <div className="font-serif font-bold text-2xl" style={{ color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* ── SEARCH & FILTER ── */}
        <div className="rounded-xl border p-3 mx-3 sm:mx-4 mt-3 mb-2 space-y-2" style={{ background: T.card, borderColor: T.border }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="பெயர்/மொபைல் (Search by name or phone)"
            className="w-full rounded-lg border p-2.5 text-sm"
            style={{ background: 'rgba(255,255,255,0.05)', borderColor: T.border, color: T.text }}
          />
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Active', 'Inactive', 'Retailer', 'Today', 'Premium'].map(opt => (
			  <button
				key={opt}
				onClick={() => setStatusFilter(opt)}
				className="rounded-full border px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5"
				style={{
				  background: statusFilter === opt ? 'rgba(212,168,67,0.1)' : T.deep,
				  borderColor: statusFilter === opt ? T.goldD : T.border,
				  color: statusFilter === opt ? T.gold : T.muted,
				}}
			  >
				{opt}
				<span
				  className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
				  style={{
					background: statusFilter === opt ? 'rgba(212,168,67,0.2)' : 'rgba(255,255,255,0.06)',
					color: statusFilter === opt ? T.gold : T.muted,
					minWidth: '18px',
					textAlign: 'center',
				  }}
				>
				  {filterCounts[opt as keyof typeof filterCounts] ?? 0}
				</span>
			  </button>
			))}
          </div>
        </div>

        {/* ── TABLE HEADER (desktop only) ── */}
        <div className="hidden md:flex px-4 py-2.5 mx-3.5 border rounded-t-lg" style={{ background: 'rgba(212,168,67,0.05)', borderColor: T.border }}>
          <span className="flex-[1.4] text-[10px] font-semibold tracking-widest" style={{ color: T.goldL }}>USER PROFILE</span>
          <span className="flex-[0.8] text-[10px] font-semibold tracking-widest" style={{ color: T.goldL }}>PLAN</span>
          <span className="flex-[1.7] text-[10px] font-semibold tracking-widest" style={{ color: T.goldL }}>FEATURES</span>
          <span className="flex-1 ml-6 text-[10px] font-semibold tracking-widest" style={{ color: T.goldL }}>STATUS</span>
          <span className="flex-[0.9] text-[10px] font-semibold tracking-widest" style={{ color: T.goldL }}>ACTIVATED BY</span>
          <span className="flex-[1.2] text-[10px] font-semibold tracking-widest" style={{ color: T.goldL }}>ACTIONS</span>
        </div>

        {/* ── ROWS ── */}
        <div className="pb-10">
          {filteredUsers.length === 0 ? (
            <div className="text-center mt-10 p-5" style={{ color: T.muted }}>No users found</div>
          ) : (
            filteredUsers.map((item, index) => (
              <UserRow
                key={item.id}
                item={item}
                index={index}
                onPackage={() => setPkgUser(item)}
                onEdit={() => setEditUser(item)}
                onPassword={() => setPwdUser(item)}
                onDelete={() => setDelUser(item)}
                onToggleRetailer={() => handleToggleRetailer(item)}
                navigate={navigate}
              />
            ))
          )}
        </div>
      </div>

      <PackageModal visible={!!pkgUser} user={pkgUser} adminId={ADMIN_ID} onClose={() => setPkgUser(null)} onSuccess={loadUsers}/>
      <EditUserModal visible={!!editUser} user={editUser} onClose={() => setEditUser(null)} onSuccess={(updated: any) => setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u))} />
      <ResetPasswordModal visible={!!pwdUser} user={pwdUser} onClose={() => setPwdUser(null)} />
      <DeleteModal visible={!!delUser} user={delUser} onClose={() => setDelUser(null)} onConfirm={(id: string) => setUsers(prev => prev.filter(u => u.id !== id))} />

      <NotificationsPanel
        open={bellOpen}
        onClose={() => setBellOpen(false)}
        queries={bellQueries}
        loading={bellLoading}
      />
    </div>
  );
}
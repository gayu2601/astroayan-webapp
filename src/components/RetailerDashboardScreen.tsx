import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';  // ← add this line
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  Crown,
  FileSpreadsheet,
  KeyRound,
  LogOut,
  Pencil,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import toast from '../../lib/toast'

interface Feature {
  id: string;
  icon: string;
  name: string;
  nameTA: string;
  desc: string;
}

interface Duration {
  id: string;
  label: string;
  sub: string;
  days: number | null;
}

interface Customer {
  id: string;
  name?: string;
  phone?: string;
  location?: string;
  plan_name?: string;
  duration_label?: string;
  expires_at?: string;
  is_active?: boolean;
  plan_status?: string;
  activated_at?: string;
  activated_at_display?: string;
  features?: string[];
}

interface Stats {
  totalCustomers: number;
  activeCustomers: number;
  expiringSoon: number;
  todayActivations: number;
}

interface EditForm {
  name: string;
  phone: string;
  location: string;
}


const FEATURES: Feature[] = [
  { id: 'panchang',      icon: '🌅', name: 'Daily Panchangam',     nameTA: 'நாள் பஞ்சாங்கம்',           desc: 'தினசரி பஞ்சாங்கம்' },
  { id: 'jadhagam',      icon: '📜', name: 'Jadhagam',             nameTA: 'ஜாதகம்',                    desc: 'முழு ஜாதகம்' },
  { id: 'horoscope_pdf', icon: '📕', name: '1 Page Jadhagam',      nameTA: 'ஒரு பக்க ஜாதகம்',     desc: 'ஒரு பக்க ஜாதகம் PDF' },
  { id: 'book_pdf',      icon: '📕', name: 'Jadhagam Book',        nameTA: 'விரிவான ஜாதகம்',          desc: 'விரிவான ஜாதகம் PDF' },
  { id: 'porutham_star', icon: '⭐', name: 'Matching Stars',        nameTA: 'பொருந்தும் நட்சத்திரங்கள்', desc: 'பொருந்தும் ஆண் & பெண் நட்சத்திரங்கள்' },
  { id: 'porutham_mrg',  icon: '💍', name: 'Marriage Porutham',     nameTA: 'திருமண பொருத்தம்',         desc: 'திருமண பொருத்தம் - 10 பொருத்தம் - ராசி & லக்னம்' },
  { id: 'porutham_pdf',  icon: '📄', name: 'Marriage Porutham PDF', nameTA: 'திருமண பொருத்தம் PDF',     desc: 'திருமண பொருத்தம் - 10 பொருத்தம் - ராசி & லக்னம் PDF' },
  { id: 'biodata',       icon: '🪪', name: 'Marriage Biodata PDF',  nameTA: 'திருமண பயோடேட்டா PDF',    desc: 'திருமண பயோடேட்டா PDF' },
  { id: 'hora',          icon: '🕒', name: 'Hora Muhurtham',        nameTA: 'ஹோரை முகூர்த்தம்',        desc: 'ஹோரை முகூர்த்த நேரங்கள்' },
  { id: 'gocharam',      icon: '🪐', name: 'Gocharam',              nameTA: 'கோச்சாரம்',               desc: 'கோச்சார கட்டம்' },
  { id: 'manaiyadi',     icon: '🏠', name: 'Manaiyadi Sasthiram',   nameTA: 'மனையடி சாஸ்திரம்',         desc: 'மனை அளவு மற்றும் வாஸ்து பலன்கள்' },
  { id: 'palli_palan',   icon: '🦎', name: 'Palli Vizhum Palan',   nameTA: 'பல்லி விழும் பலன்',        desc: 'பல்லி விழும் பலன்கள்' },
  { id: 'age_calc',      icon: '🔢', name: 'Age Calculator',        nameTA: 'வயது கணக்கீடு',            desc: 'வயது கணித்தல்' },
  { id: 'daily_rasi_palan',      icon: '♈', name: 'Daily Rasi Palan',      nameTA: 'தின ராசி பலன்',      desc: 'இன்றைய ராசி பலன்கள்' },
  { id: 'daily_nakshatra_palan', icon: '🌟', name: 'Daily Nakshatra Palan', nameTA: 'தின நட்சத்திர பலன்', desc: 'இன்றைய நட்சத்திர பலன்கள்' },
  { id: 'weekly_rasi_palan',     icon: '📅', name: 'Weekly Rasi Palan',     nameTA: 'வார ராசி பலன்',      desc: 'இந்த வார ராசி பலன்கள்' },
];

const DURATIONS: Duration[] = [
  { id: '1d',   label: '1 Day',    sub: 'Trial',     days: 1    },
  { id: '1m',   label: '1 Month',  sub: '30 days',   days: 30   },
  { id: '3m',   label: '3 Months', sub: '90 days',   days: 90   },
  { id: '6m',   label: '6 Months', sub: '180 days',  days: 180  },
  { id: '1y',   label: '1 Year',   sub: '365 days',  days: 365  },
  { id: '2y',   label: '2 Years',  sub: '730 days',  days: 730  },
  { id: '3y',   label: '3 Years',  sub: '1095 days', days: 1095 },
  { id: '5y',   label: '5 Years',  sub: '1825 days', days: 1825 },
  { id: 'life', label: 'Lifetime', sub: 'Forever',   days: null },
];

const T = {
  deep:    '#0A0612',
  surface: '#120D1E',
  card:    '#1A1230',
  gold:    '#D4A843',
  goldL:   '#F0C96A',
  goldD:   '#8A6A20',
  purple:  '#6B3FA0',
  purpleL: '#9B6FD0',
  text:    '#E8DFF5',
  muted:   '#8B7AAA',
  border:  'rgba(212,168,67,0.18)',
  border2: 'rgba(107,63,160,0.25)',
  active:  '#2ECC71',
  expired: '#E74C3C',
  warn:    '#F39C12',
  blue:    '#74B9FF',
};

const AVATAR_COLORS = [
  { bg: 'rgba(212,168,67,0.15)',  fg: T.gold    },
  { bg: 'rgba(107,63,160,0.2)',   fg: T.purpleL },
  { bg: 'rgba(46,204,113,0.15)',  fg: T.active  },
  { bg: 'rgba(231,76,60,0.15)',   fg: T.expired },
  { bg: 'rgba(243,156,18,0.15)',  fg: T.warn    },
  { bg: 'rgba(116,185,255,0.15)', fg: T.blue    },
];

const SERIF = "Georgia, 'Times New Roman', serif";


const FEATURE_LABELS: Record<string, string> = {
  panchang:              'Panchang',
  jadhagam:              'Jadhagam',
  horoscope_pdf:         '1 Page Jadhagam',
  book_pdf:              'Jadhagam Book',
  porutham_star:         'Matching Stars',
  porutham_mrg:          'Marriage Porutham',
  porutham_pdf:          'Marriage Porutham PDF',
  biodata:               'Marriage Biodata PDF',
  hora:                  'Hora Muhurtham',
  gocharam:              'Gocharam',
  age_calc:              'Age Calculator',
  manaiyadi:             'Manaiyadi Sasthiram',
  palliPalan:            'Palli Vizhum Palan',
  daily_rasi_palan:      'Daily Rasi Palan',
  daily_nakshatra_palan: 'Daily Nakshatra Palan',
  weekly_rasi_palan:     'Weekly Rasi Palan',
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function calcExpiry(days: number | null): string {
  if (days === null) return '9999-12-31T00:00:00.000Z';
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function formatDate(iso?: string): string {
  if (!iso || iso.startsWith('9999')) return 'Lifetime';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

function getInitials(name?: string, phone?: string): string {
  return (name || phone || '?').slice(0, 2).toUpperCase();
}

// ─── db helpers ──────────────────────────────────────────────────────────────

async function dbSavePackage(
  userId: string,
  retailerId: string,
  durationObj: Duration,
  features: string[],
): Promise<void> {
  const now       = new Date().toISOString();
  const expiresAt = calcExpiry(durationObj.days);
  const { error: planErr } = await supabase
    .from('customer_plans')
    .upsert(
      {
        customer_id:    userId,
        activated_by:   retailerId,
        updated_by:     retailerId,
        plan_name:      `Jothidam · ${durationObj.label}`,
        duration_id:    durationObj.id,
        duration_label: durationObj.label,
        duration_days:  durationObj.days ?? 0,
        features,
        activated_at:   now,
        expires_at:     expiresAt,
        is_active:      true,
        status:         'Active',
      },
      { onConflict: 'customer_id' },
    );
  if (planErr) throw planErr;
}

async function dbUpdatePassword(userId: string, password: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ password }).eq('id', userId);
  if (error) throw error;
}

async function dbUpdateUser(userId: string, changes: Partial<EditForm>): Promise<void> {
  const { error } = await supabase.from('profiles').update(changes).eq('id', userId);
  if (error) throw error;
}

async function dbDeleteUser(userId: string): Promise<void> {
  const { error } = await supabase.from('profiles').delete().eq('id', userId);
  if (error) throw error;
}

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
};

function ModalShell({ open, onClose, children, wide }: ModalProps) {
  if (!open) return null;

  return createPortal(
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className={`modal-card ${wide ? 'modal-wide' : ''}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

function PackageModal({
  user,
  retailerId,
  onClose,
  onSuccess,
  toast,
}: {
  user: Customer | null;
  retailerId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [duration, setDuration] = useState<Duration>(DURATIONS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setSelected(new Set(user.features ?? []));
      setDuration(DURATIONS.find((item) => item.label === user.duration_label) ?? DURATIONS[0]);
    }
  }, [user]);

  const toggleFeature = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!user || !selected.size) return;
    setLoading(true);
    try {
      await dbSavePackage(user.id, retailerId, duration, Array.from(selected));
      toast.success(`Package Updated: ${selected.size} features · ${duration.label}`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update package');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={!!user} onClose={onClose} wide>
      <div className="modal-header">
        <div>
          <h2>✦ Update Package</h2>
          <p>{user?.name || user?.phone}</p>
        </div>
        <button className="icon-button" onClick={onClose}><X /></button>
      </div>

      <div className="modal-body">
        <div className="section-title">
          <span>FEATURES</span>
          <button
            className="text-button"
            onClick={() =>
              setSelected(
                selected.size === FEATURES.length
                  ? new Set()
                  : new Set(FEATURES.map((feature) => feature.id)),
              )
            }
          >
            {selected.size === FEATURES.length ? 'Clear all' : 'Select all'}
          </button>
        </div>

        <div className="feature-grid">
          {FEATURES.map((feature) => {
            const active = selected.has(feature.id);
            return (
              <button
                type="button"
                key={feature.id}
                className={`feature-card ${active ? 'selected' : ''}`}
                onClick={() => toggleFeature(feature.id)}
              >
                <span className="feature-icon">{feature.icon}</span>
                <span className="feature-copy">
                  <strong>{feature.name}</strong>
                  <small>{feature.nameTA}</small>
                  <span>{feature.desc}</span>
                </span>
                <span className="checkbox">{active ? '✓' : ''}</span>
              </button>
            );
          })}
        </div>

        <div className="section-title"><span>PLAN DURATION</span></div>
        <div className="duration-grid">
          {DURATIONS.map((item) => (
            <button
              key={item.id}
              className={`duration-button ${duration.id === item.id ? 'selected' : ''}`}
              onClick={() => setDuration(item)}
            >
              <strong>{item.label}</strong>
              <small>{item.sub}</small>
            </button>
          ))}
        </div>

        <div className="summary-grid">
          <div><strong>{selected.size}</strong><span>FEATURES</span></div>
          <div><strong>{duration.label}</strong><span>DURATION</span></div>
          <div><strong>{formatDate(calcExpiry(duration.days))}</strong><span>EXPIRES</span></div>
        </div>
      </div>

      <div className="modal-footer">
        <button className="secondary-button" onClick={onClose}>Cancel</button>
        <button
          className="primary-button"
          disabled={!selected.size || loading}
          onClick={handleConfirm}
        >
          {loading ? 'Saving…' : 'Confirm & Subscribe'}
        </button>
      </div>
    </ModalShell>
  );
}

function EditUserModal({
  user,
  onClose,
  onSuccess,
  toast,
}: {
  user: Customer | null;
  onClose: () => void;
  onSuccess: (user: Customer) => void;
}) {
  const [form, setForm] = useState<EditForm>({ name: '', phone: '', location: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        phone: user.phone ?? '',
        location: user.location ?? '',
      });
    }
  }, [user]);

  const save = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await dbUpdateUser(user.id, form);
      const updated = { ...user, ...form };
      onSuccess(updated);
      toast.success('User Updated');
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={!!user} onClose={onClose}>
      <div className="modal-header">
        <div><h2>✦ Edit User</h2><p>{user?.name || user?.phone}</p></div>
        <button className="icon-button" onClick={onClose}><X /></button>
      </div>
      <div className="modal-body form-stack">
        {([
          ['name', 'FULL NAME', 'Enter name'],
          ['phone', 'MOBILE NUMBER', '10-digit number'],
          ['location', 'LOCATION', 'City, State'],
        ] as const).map(([key, label, placeholder]) => (
          <label key={key}>
            <span>{label}</span>
            <input
              value={form[key]}
              placeholder={placeholder}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, [key]: event.target.value }))
              }
            />
          </label>
        ))}
      </div>
      <div className="modal-footer">
        <button className="secondary-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" onClick={save} disabled={loading}>
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </ModalShell>
  );
}

function ResetPasswordModal({
  user,
  onClose,
  toast,
}: {
  user: Customer | null;
  onClose: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPassword('');
    setConfirm('');
  }, [user]);

  const save = async () => {
    if (!user) return;
    if (!password.trim()) return toast.error('Password required');
    if (password.length < 4) return toast.error('Password too short');
    if (password !== confirm) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await dbUpdatePassword(user.id, password);
      toast.success(`Password updated for ${user.name || user.phone}`);
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={!!user} onClose={onClose}>
      <div className="modal-header">
        <div><h2>✦ Reset Password</h2><p>{user?.name || user?.phone}</p></div>
        <button className="icon-button" onClick={onClose}><X /></button>
      </div>
      <div className="modal-body form-stack">
        <label>
          <span>NEW PASSWORD</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <label>
          <span>CONFIRM PASSWORD</span>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </label>
      </div>
      <div className="modal-footer">
        <button className="secondary-button" onClick={onClose}>Cancel</button>
        <button className="primary-button" onClick={save} disabled={loading}>
          {loading ? 'Saving…' : 'Update Password'}
        </button>
      </div>
    </ModalShell>
  );
}

function DeleteModal({
  user,
  onClose,
  onConfirm,
  toast,
}: {
  user: Customer | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const remove = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await dbDeleteUser(user.id);
      onConfirm(user.id);
      toast.info(`User ${user.name || user.phone} removed`);
      onClose();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={!!user} onClose={onClose}>
      <div className="modal-header">
        <div><h2 className="danger-text">Delete User</h2></div>
        <button className="icon-button" onClick={onClose}><X /></button>
      </div>
      <div className="modal-body delete-copy">
        Delete “{user?.name || user?.phone}”? This action cannot be undone.
      </div>
      <div className="modal-footer">
        <button className="secondary-button" onClick={onClose}>Cancel</button>
        <button className="danger-button" onClick={remove} disabled={loading}>
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </ModalShell>
  );
}

const ADMIN_ID = 'f7191c3d-b329-49e3-965d-c5015663ebba';

export default function RetailerDashboardScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const paramRetailerId = searchParams.get('id');
  const paramRetailerName = searchParams.get('name');
  const retailerId = paramRetailerId || user?.id || '';
  const retailerName = paramRetailerName || user?.name || 'Retailer';
  const isAdminView = !!paramRetailerId;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    activeCustomers: 0,
    expiringSoon: 0,
    todayActivations: 0,
  });

  const [pkgUser, setPkgUser] = useState<Customer | null>(null);
  const [editUser, setEditUser] = useState<Customer | null>(null);
  const [pwdUser, setPwdUser] = useState<Customer | null>(null);
  const [delUser, setDelUser] = useState<Customer | null>(null);

  const loadCustomers = async () => {
    if (!retailerId) return;
    const { data, error } = await supabase
      .from('admin_user_list')
      .select('*')
      .or(`activated_by.eq.${retailerId},activated_by.is.null`)
      .neq('id', ADMIN_ID);

    if (error) throw error;
    setCustomers(data ?? []);
  };

  const loadStats = async () => {
    if (!retailerId) return;

    const { data, error } = await supabase
      .from('admin_user_list')
      .select('id, is_active, activated_at')
      .eq('activated_by', retailerId)
      .eq('user_type', 'user');

    if (error) throw error;

    const list = data ?? [];
    const today = new Date().toDateString();

    setStats({
      totalCustomers: list.length,
      activeCustomers: list.filter((item: any) => item.is_active).length,
      expiringSoon: list.filter((item: any) => !item.is_active).length,
      todayActivations: list.filter(
        (item: any) =>
          item.activated_at &&
          new Date(item.activated_at).toDateString() === today,
      ).length,
    });
  };

  const loadedRetailerRef = useRef<string | null>(null);

useEffect(() => {
  if (!retailerId) return;

  // Prevent duplicate/repeated loading for the same retailer
  if (loadedRetailerRef.current === retailerId) return;

  loadedRetailerRef.current = retailerId;

  const loadData = async () => {
    try {
      const [customersResult, statsResult] = await Promise.all([
        supabase
          .from('admin_user_list')
          .select('*')
          .or(`activated_by.eq.${retailerId},activated_by.is.null`)
          .neq('id', ADMIN_ID),

        supabase
          .from('admin_user_list')
          .select('id, is_active, activated_at')
          .eq('activated_by', retailerId)
          .eq('user_type', 'user'),
      ]);

      if (customersResult.error) {
        throw customersResult.error;
      }

      if (statsResult.error) {
        throw statsResult.error;
      }

      setCustomers(customersResult.data ?? []);

      const list = statsResult.data ?? [];
      const today = new Date().toDateString();

      setStats({
        totalCustomers: list.length,
        activeCustomers: list.filter(
          (item: any) => item.is_active
        ).length,
        expiringSoon: list.filter(
          (item: any) => !item.is_active
        ).length,
        todayActivations: list.filter(
          (item: any) =>
            item.activated_at &&
            new Date(item.activated_at).toDateString() === today
        ).length,
      });
    } catch (error: any) {
      console.error(
        'RetailerDashboard load error:',
        error
      );
    }
  };

  void loadData();
}, [retailerId]);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) {
      setSearched(false);
      setResults([]);
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await supabase
        .from('admin_user_list')
        .select('*')
        .neq('id', ADMIN_ID)
        .or(`name.ilike.%${q}%,phone.ilike.%${q}%`);

      if (error) throw error;
      setResults(data ?? []);
    } catch (error: any) {
      toast.error(`Search failed: ${error?.message} ?? Unable to search`);
    } finally {
      setLoading(false);
    }
  };

  const listData = useMemo(() => (searched ? results : customers), [searched, results, customers]);

  const refresh = async () => {
    await Promise.all([loadCustomers(), loadStats()]);
    if (searched) await handleSearch();
  };

  const handleExportExcel = () => {
    if (!listData.length) {
      toast.error('No customers to export');
      return;
    }

    const rows = listData.map((item) => ({
      Name: item.name ?? '',
      Phone: item.phone ?? '',
      Location: item.location ?? '',
      'Plan Name': item.plan_name ?? '',
      Duration: item.duration_label ?? '',
      'Expires At': formatDate(item.expires_at),
      Status: item.plan_status || (item.is_active ? 'Active' : 'Expired'),
      'Activated At': item.activated_at_display ?? '',
      Features: Array.isArray(item.features)
        ? item.features.map((feature) => FEATURE_LABELS[feature] || feature).join(', ')
        : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    worksheet['!cols'] = [
      { wch: 22 }, { wch: 14 }, { wch: 18 }, { wch: 22 },
      { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 50 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    XLSX.writeFile(workbook, `jothidam_customers_${new Date().toISOString().slice(0, 10)}.xlsx`);

    toast.success(`${rows.length} customers exported`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="retailer-dashboard">
      <header className="dashboard-header">
        <div>
          {isAdminView && (
            <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
          )}
          <h1>{isAdminView ? `${retailerName}'s Customers` : 'Retailer Dashboard'}</h1>
          <p>
            {isAdminView
              ? `Viewing customers activated by ${retailerName}`
              : 'Search and manage your astrology customers'}
          </p>
        </div>

        <div className="header-actions">
          <button className="export-button" onClick={handleExportExcel}>
            <FileSpreadsheet size={17} /> Export
          </button>
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={17} /> Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="stats-grid">
          {[
            ['Customers', stats.totalCustomers, 'active'],
            ['Active', stats.activeCustomers, 'active'],
            ['Expiring', stats.expiringSoon, 'expired'],
            ['Today', stats.todayActivations, 'warn'],
          ].map(([label, value, tone]) => (
            <article className="stat-card" key={String(label)}>
              <span>{label}</span>
              <strong className={String(tone)}>{value}</strong>
            </article>
          ))}
        </section>

        <section className="search-section">
          <h2><Search size={20} /> Find Customer</h2>
          <div className="search-row">
            <input
              value={query}
              placeholder="Search by name or phone number..."
              onChange={(event) => {
                setQuery(event.target.value);
                if (!event.target.value.trim()) {
                  setSearched(false);
                  setResults([]);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleSearch();
              }}
            />
            <button
              className="primary-button"
              disabled={!query.trim() || loading}
              onClick={handleSearch}
            >
              {loading ? 'Searching…' : 'Search'}
            </button>
          </div>
          <p className="results-label">
            {searched
              ? loading
                ? 'Searching…'
                : results.length
                  ? `${results.length} result${results.length === 1 ? '' : 's'} for “${query}”`
                  : 'No customers found'
              : 'All Users'}
          </p>
        </section>

        <section className="customer-table-wrap">
          <div className="customer-table">
            <div className="table-head">
              <span>USER PROFILE</span>
              <span>PLAN</span>
              <span>FEATURES</span>
              <span>STATUS</span>
              <span>ACTIONS</span>
            </div>

            {listData.length === 0 ? (
              <div className="empty-state">
                {searched ? 'No customers match your search' : 'No customers yet'}
              </div>
            ) : (
              listData.map((item, index) => {
                const avatar = AVATAR_COLORS[index % AVATAR_COLORS.length];
                const isActive = !!item.is_active;
                const planStatus = item.plan_status || (isActive ? 'Active' : 'Expired');

                return (
                  <article className="customer-row" key={item.id}>
                    <div className="profile-cell">
                      <div
                        className="avatar"
                        style={{ background: avatar.bg, color: avatar.fg }}
                      >
                        {getInitials(item.name, item.phone)}
                      </div>
                      <div>
                        <strong>{item.name || '—'}</strong>
                        <span>📱 {item.phone || '—'}</span>
                        {item.location && <span>📍 {item.location}</span>}
                      </div>
                    </div>

                    <div className="plan-cell">
                      {item.duration_label ? (
                        <>
                          <span className="plan-badge">{item.duration_label.toUpperCase()}</span>
                          {item.plan_name && <span>{item.plan_name}</span>}
                          <span>Exp: {formatDate(item.expires_at)}</span>
                        </>
                      ) : (
                        <span className="danger-text">No plan</span>
                      )}
                    </div>

                    <div className="features-cell">
                      {item.features?.length ? (
                        item.features.map((feature) => (
                          <span className="feature-badge" key={feature}>
                            {FEATURE_LABELS[feature] || feature}
                          </span>
                        ))
                      ) : (
                        <span className="danger-text">None</span>
                      )}
                    </div>

                    <div className="status-cell">
                      <span className={`status ${isActive ? 'status-active' : 'status-expired'}`}>
                        <i /> {planStatus.toUpperCase()}
                      </span>
                      {item.activated_at_display && <small>Act: {item.activated_at_display}</small>}
                    </div>

                    <div className="actions-cell">
                      <button title="Update package" className="round-button crown" onClick={() => setPkgUser(item)}>
                        <Crown size={17} />
                      </button>
                      <button title="Edit user" className="round-button edit" onClick={() => setEditUser(item)}>
                        <Pencil size={17} />
                      </button>
                      <button title="Reset password" className="round-button key" onClick={() => setPwdUser(item)}>
                        <KeyRound size={17} />
                      </button>
                      <button title="Delete user" className="round-button delete" onClick={() => setDelUser(item)}>
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </main>

      <PackageModal
        user={pkgUser}
        retailerId={retailerId}
        onClose={() => setPkgUser(null)}
        onSuccess={() => void refresh()}
      />
      <EditUserModal
        user={editUser}
        onClose={() => setEditUser(null)}
        onSuccess={(updated) => {
          setCustomers((prev) => prev.map((item) => item.id === updated.id ? updated : item));
          setResults((prev) => prev.map((item) => item.id === updated.id ? updated : item));
        }}
      />
      <ResetPasswordModal user={pwdUser} onClose={() => setPwdUser(null)} />
      <DeleteModal
        user={delUser}
        onClose={() => setDelUser(null)}
        onConfirm={(id) => {
          setCustomers((prev) => prev.filter((item) => item.id !== id));
          setResults((prev) => prev.filter((item) => item.id !== id));
          void loadStats();
        }}
      />

      <style>{`
        :root {
          --deep: ${T.deep};
          --surface: ${T.surface};
          --card: ${T.card};
          --gold: ${T.gold};
          --gold-light: ${T.goldL};
          --purple-light: ${T.purpleL};
          --text: ${T.text};
          --muted: ${T.muted};
          --active: ${T.active};
          --expired: ${T.expired};
          --warn: ${T.warn};
          --border: ${T.border};
          --border2: ${T.border2};
        }

        * { box-sizing: border-box; }
        button, input { font: inherit; }

        .retailer-dashboard {
          min-height: 100vh;
          color: var(--text);
          background:
            radial-gradient(circle at top right, rgba(107,63,160,.18), transparent 30%),
            linear-gradient(135deg, var(--deep), #10091b);
          font-family: Inter, system-ui, sans-serif;
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 22px clamp(16px, 4vw, 48px);
          border-bottom: 1px solid var(--border);
        }

        h1, h2, p { margin: 0; }
        .dashboard-header h1 {
          color: var(--gold);
          font-family: ${SERIF};
          font-size: clamp(24px, 3vw, 34px);
          letter-spacing: 1px;
        }
        .dashboard-header p { color: var(--muted); margin-top: 5px; }
        .back-button, .text-button {
          color: var(--gold);
          background: transparent;
          border: 0;
          cursor: pointer;
          padding: 0;
          margin-bottom: 8px;
        }

        .header-actions, .actions-cell, .modal-footer {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .export-button, .logout-button, .primary-button, .secondary-button, .danger-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border-radius: 10px;
          padding: 10px 16px;
          font-weight: 800;
          cursor: pointer;
        }
        .export-button {
          color: var(--active);
          background: rgba(46,204,113,.15);
          border: 1px solid rgba(46,204,113,.4);
        }
        .logout-button, .danger-button {
          color: white;
          background: #e74c3c;
          border: 1px solid rgba(255,255,255,.15);
        }
        .primary-button {
          color: var(--deep);
          background: var(--gold);
          border: 1px solid var(--gold);
        }
        .secondary-button {
          color: var(--muted);
          background: transparent;
          border: 1px solid var(--border);
        }
        button:disabled { opacity: .45; cursor: not-allowed; }

        .dashboard-content {
          width: min(1500px, 100%);
          margin: 0 auto;
          padding: 18px clamp(12px, 3vw, 32px) 60px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        .stat-card {
          padding: 18px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--card);
        }
        .stat-card span { color: var(--muted); letter-spacing: 2px; font-size: 11px; }
        .stat-card strong {
          display: block;
          margin-top: 8px;
          font-family: ${SERIF};
          font-size: 30px;
        }
        .active { color: var(--active); }
        .expired, .danger-text { color: var(--expired); }
        .warn { color: var(--warn); }

        .search-section { margin-top: 20px; }
        .search-section h2 {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 18px;
          margin-bottom: 10px;
        }
        .search-row { display: flex; gap: 8px; }
        .search-row input, .form-stack input {
          width: 100%;
          color: var(--text);
          background: var(--card);
          border: 1px solid var(--border2);
          border-radius: 10px;
          padding: 12px 14px;
          outline: none;
        }
        .search-row input:focus, .form-stack input:focus { border-color: var(--gold); }
        .results-label { margin: 10px 0 12px; color: var(--muted); }

        .customer-table {
          overflow: hidden;
          border: 1px solid var(--border);
          border-radius: 12px;
        }
        .table-head, .customer-row {
          display: grid;
          grid-template-columns: 1.4fr .8fr 1.7fr .7fr 1fr;
          gap: 12px;
          align-items: center;
        }
        .table-head {
          padding: 12px 14px;
          color: var(--gold-light);
          background: rgba(212,168,67,.05);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.5px;
        }
        .customer-row {
          padding: 14px;
          background: var(--card);
          border-top: 1px solid rgba(212,168,67,.07);
        }
        .profile-cell { display: flex; gap: 10px; align-items: center; min-width: 0; }
        .profile-cell > div:last-child, .plan-cell, .status-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }
        .profile-cell span, .plan-cell > span:not(.plan-badge), .status-cell small {
          color: var(--muted);
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .avatar {
          width: 42px;
          height: 42px;
          flex: 0 0 42px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          border: 1px solid var(--border);
          font-weight: 800;
        }
        .plan-badge, .feature-badge {
          width: fit-content;
          padding: 3px 7px;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 700;
        }
        .plan-badge {
          color: var(--purple-light);
          background: rgba(107,63,160,.2);
          border: 1px solid rgba(107,63,160,.35);
        }
        .features-cell { display: flex; flex-wrap: wrap; gap: 5px; }
        .feature-badge {
          color: var(--gold-light);
          background: rgba(212,168,67,.08);
          border: 1px solid rgba(212,168,67,.2);
        }
        .status { display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 800; }
        .status i { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
        .status-active { color: var(--active); }
        .status-expired { color: var(--expired); }

        .round-button, .icon-button {
          display: inline-grid;
          place-items: center;
          cursor: pointer;
          color: inherit;
          background: transparent;
          border: 0;
        }
        .round-button {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid;
        }
        .crown { color: var(--gold); border-color: rgba(212,168,67,.3); background: rgba(212,168,67,.12); }
        .edit { color: var(--purple-light); border-color: rgba(107,63,160,.3); background: rgba(107,63,160,.12); }
        .key { color: #74b9ff; border-color: rgba(116,185,255,.3); background: rgba(116,185,255,.1); }
        .delete { color: var(--expired); border-color: rgba(231,76,60,.3); background: rgba(231,76,60,.1); }
        .empty-state { padding: 50px 20px; text-align: center; color: var(--muted); background: var(--card); }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(0,0,0,.72);
          backdrop-filter: blur(5px);
        }
        .modal-card {
          width: min(520px, 100%);
          max-height: 92vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--surface);
          box-shadow: 0 24px 80px rgba(0,0,0,.5);
        }
        .modal-wide { width: min(980px, 100%); }
        .modal-header, .modal-footer {
          padding: 16px 18px;
          border-bottom: 1px solid var(--border);
        }
        .modal-header { display: flex; justify-content: space-between; gap: 16px; }
        .modal-header h2 { color: var(--gold); font-size: 18px; }
        .modal-header p { color: var(--muted); margin-top: 4px; }
        .modal-body { padding: 18px; overflow: auto; }
        .modal-footer {
          justify-content: flex-end;
          border-top: 1px solid var(--border);
          border-bottom: 0;
        }
        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          color: var(--muted);
          font-size: 11px;
          letter-spacing: 2px;
          margin: 4px 0 12px;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        .feature-card {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 10px;
          text-align: left;
          color: var(--text);
          background: rgba(255,255,255,.025);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 11px;
          cursor: pointer;
        }
        .feature-card.selected { border-color: var(--gold); background: rgba(212,168,67,.08); }
        .feature-icon { font-size: 22px; }
        .feature-copy { display: flex; flex-direction: column; gap: 2px; }
        .feature-copy small, .feature-copy span { color: var(--muted); font-size: 11px; }
        .checkbox {
          width: 20px;
          height: 20px;
          display: grid;
          place-items: center;
          border: 1px solid var(--border);
          border-radius: 5px;
          color: var(--deep);
          background: var(--gold);
        }
        .duration-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 7px;
          margin-bottom: 16px;
        }
        .duration-button {
          display: flex;
          flex-direction: column;
          gap: 2px;
          color: var(--text);
          background: rgba(255,255,255,.025);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 6px;
          cursor: pointer;
        }
        .duration-button small { color: var(--muted); }
        .duration-button.selected { border-color: var(--gold); color: var(--gold); }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
        }
        .summary-grid div {
          padding: 12px;
          text-align: center;
          border-right: 1px solid var(--border);
        }
        .summary-grid div:last-child { border-right: 0; }
        .summary-grid strong, .summary-grid span { display: block; }
        .summary-grid span { color: var(--muted); font-size: 10px; margin-top: 3px; letter-spacing: 1px; }

        .form-stack { display: grid; gap: 16px; }
        .form-stack label > span {
          display: block;
          color: var(--muted);
          font-size: 11px;
          letter-spacing: 1.5px;
          margin-bottom: 6px;
        }
        .delete-copy { color: var(--muted); line-height: 1.6; }

        .toast-stack {
          position: fixed;
          right: 20px;
          bottom: 20px;
          z-index: 2000;
          display: grid;
          gap: 8px;
          width: min(380px, calc(100vw - 40px));
        }
        .toast {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          padding: 14px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--card);
          box-shadow: 0 12px 35px rgba(0,0,0,.35);
        }
        .toast strong, .toast span { display: block; }
        .toast span { color: var(--muted); font-size: 12px; margin-top: 3px; }
        .toast-success strong { color: var(--active); }
        .toast-error strong { color: var(--expired); }

        @media (max-width: 1000px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .table-head { display: none; }
          .customer-table { border: 0; overflow: visible; }
          .customer-row {
            grid-template-columns: 1fr 1fr;
            border: 1px solid var(--border);
            border-radius: 12px;
            margin-bottom: 12px;
          }
          .profile-cell { grid-column: 1 / -1; }
          .features-cell { grid-column: 1 / -1; }
          .actions-cell { justify-content: flex-end; }
          .duration-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 640px) {
          .dashboard-header { align-items: flex-start; flex-direction: column; }
          .header-actions { width: 100%; }
          .header-actions button { flex: 1; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .search-row { flex-direction: column; }
          .customer-row { grid-template-columns: 1fr; }
          .profile-cell, .features-cell { grid-column: auto; }
          .actions-cell { justify-content: flex-start; }
          .feature-grid { grid-template-columns: 1fr; }
          .duration-grid { grid-template-columns: repeat(2, 1fr); }
          .summary-grid { grid-template-columns: 1fr; }
          .summary-grid div { border-right: 0; border-bottom: 1px solid var(--border); }
          .summary-grid div:last-child { border-bottom: 0; }
          .modal-footer > button { flex: 1; }
        }
      `}</style>
    </div>
  );
}

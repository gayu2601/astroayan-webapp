import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CosmicBackground } from './CosmicBackground';
import { supabase } from '../../lib/supabase';

// ── All feature IDs — trial gives access to every feature ────────────────────
const ALL_FEATURES = [
  'panchang', 'jadhagam', 'horoscope_pdf', 'book_pdf',
  'porutham_star', 'porutham_mrg', 'porutham_pdf', 'biodata',
  'hora', 'gocharam', 'manaiyadi', 'palli_palan', 'age_calc',
  'panchangam_pdf', 'daily_rasi_palan', 'daily_nakshatra_palan', 'weekly_rasi_palan',
];

interface Props {
  onSignupSuccess: (userData: any) => void;
  language: string;
  theme: 'light' | 'dark';
}

export default function SignupScreen({ onSignupSuccess, language, theme }: Props) {
  const navigate = useNavigate();
  const isLight = theme === 'light';

  const [name,            setName]            = useState('');
  const [phone,           setPhone]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState('');

  const t = (en: string, ta: string) => language === 'ta' ? ta : en;

  const handleSignup = async () => {
    setError('');
    setSuccess('');

    // ── Validation ──────────────────────────────────────────────────────────
    if (!name || !phone || !password || !confirmPassword) {
      setError(t('Please fill in all fields', 'அனைத்து புலங்களையும் நிரப்பவும்'));
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setError(t('Please enter a valid 10-digit phone number', 'சரியான 10 இலக்க தொலைபேசி எண் உள்ளிடவும்'));
      return;
    }
    if (password.length < 4) {
      setError(t('Password must be at least 4 characters', 'கடவுச்சொல் குறைந்தது 4 எழுத்துகள் இருக்க வேண்டும்'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('Passwords do not match', 'கடவுச்சொற்கள் பொருந்தவில்லை'));
      return;
    }

    setLoading(true);
    try {
      // ── 1. Check duplicate phone ──────────────────────────────────────────
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

      if (existing) {
        setError(t(
          'An account with this phone number already exists',
          'இந்த தொலைபேசி எண்ணில் ஏற்கனவே கணக்கு உள்ளது',
        ));
        return;
      }

      // ── 2. Insert profile ─────────────────────────────────────────────────
      const { data, error: insertErr } = await supabase
        .from('profiles')
        .insert([{ name, phone, password }])
        .select()
        .single();

      if (insertErr) {
        if (insertErr.code === '23505') {
          setError(t(
            'An account with this phone number already exists',
            'இந்த தொலைபேசி எண்ணில் ஏற்கனவே கணக்கு உள்ளது',
          ));
        } else {
          setError(insertErr.message);
        }
        return;
      }

      // ── 3. Insert 1-day free trial plan ──────────────────────────────────
      const now     = new Date();
      const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const { error: planErr } = await supabase
        .from('customer_plans')
        .insert([{
          customer_id:    data.id,
          activated_by:   null,
          updated_by:     null,
          plan_name:      'Free Trial · 1 Day',
          duration_id:    '1d',
          duration_label: '1 Day',
          duration_days:  1,
          features:       ALL_FEATURES,
          activated_at:   now.toISOString(),
          expires_at:     expires.toISOString(),
          is_active:      true,
          status:         'Active',
        }]);

      if (planErr) {
        // Non-fatal — profile created, trial insert failed
        console.warn('[signup] trial plan insert failed:', planErr.message);
      }

      setSuccess(t(
        'Account created! 1-day free trial activated.',
        'கணக்கு உருவாக்கப்பட்டது! 1 நாள் இலவச சோதனை செயல்படுத்தப்பட்டது.',
      ));

      onSignupSuccess(data);
      navigate('/');

    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3.5 rounded-xl border text-sm outline-none transition-all
    focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30
    ${isLight
      ? 'bg-amber-50/60 border-amber-500/20 text-[#2C241E] placeholder:text-[#9C8F85]'
      : 'bg-white/5 border-white/10 text-white placeholder:text-gray-500'}`;

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-all duration-300 ${isLight ? 'bg-[#FDFBF7]' : 'bg-[#0A0612]'}`}>
      <CosmicBackground theme={theme} />

      <div className="relative z-10 w-full max-w-sm space-y-8">

        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-4">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 border-amber-400 shadow-lg shadow-amber-500/20 ${isLight ? 'bg-violet-100' : 'bg-violet-950/60'}`}>
            <span className="text-4xl">✦</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-cinzel font-black tracking-widest text-amber-400">AstroAyan</h1>
            <p className={`mt-1 text-xs tracking-[0.25em] uppercase font-semibold ${isLight ? 'text-[#5C4F43]' : 'text-gray-400'}`}>
              {t('Create Account', 'கணக்கு உருவாக்கு')}
            </p>
          </div>
        </div>

        {/* ── Card ─────────────────────────────────────────────────────────── */}
        <div className={`rounded-2xl p-7 border shadow-xl space-y-5 transition-all ${isLight ? 'bg-white/80 border-amber-500/20' : 'bg-white/5 border-white/10'}`}>
          <h2 className={`text-xl font-bold ${isLight ? 'text-[#2C241E]' : 'text-white'}`}>
            {t('Register', 'பதிவு செய்')}
          </h2>

          {error   && <p className="text-sm text-red-400   font-semibold text-center">{error}</p>}
          {success && <p className="text-sm text-emerald-400 font-semibold text-center">{success}</p>}

          <div className="space-y-4">
            <input
              type="text"
              placeholder={t('Full Name', 'முழு பெயர்')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
            <input
              type="tel"
              maxLength={10}
              placeholder={t('Phone Number', 'தொலைபேசி எண்')}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className={inputClass}
            />
            <input
              type="password"
              placeholder={t('Password', 'கடவுச்சொல்')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <input
              type="password"
              placeholder={t('Confirm Password', 'கடவுச்சொல்லை உறுதிப்படுத்தவும்')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
              className={inputClass}
            />
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-violet-600 to-violet-400 hover:from-violet-500 hover:to-violet-300 active:scale-[0.98] transition-all shadow-md shadow-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? t('Creating...', 'உருவாக்குகிறது...')
              : t('Create Account', 'கணக்கு உருவாக்கு')}
          </button>

          <button
            onClick={() => navigate('/login')}
            className={`w-full text-center text-sm font-bold mt-1 transition-colors ${isLight ? 'text-violet-600 hover:text-violet-800' : 'text-violet-400 hover:text-violet-200'}`}
          >
            {t('Already have an account? Login', 'ஏற்கனவே கணக்கு உள்ளதா? உள்நுழை')}
          </button>
        </div>

      </div>
    </div>
  );
}
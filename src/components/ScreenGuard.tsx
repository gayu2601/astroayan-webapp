// components/ScreenGuard.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Wrap any page/section with this component.
// Shows a lock UI when the user has no access to featureId.
//
// Usage:
//   <ScreenGuard featureId="panchang">
//     <YourExistingContent />
//   </ScreenGuard>
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAccess } from '../../hooks/useAccess';
import { supabase } from '../../lib/supabase';

// ─── Design tokens (mirrors RN T object) ─────────────────────────────────────
// All used as inline styles or CSS vars so they stay in sync with the RN source

const T = {
  deep:    '#0A0612',
  surface: '#120D1E',
  card:    '#1A1230',
  gold:    '#D4A843',
  goldD:   '#8A6A20',
  purpleL: '#9B6FD0',
  text:    '#E8DFF5',
  muted:   '#8B7AAA',
  border:  'rgba(212,168,67,0.18)',
  border2: 'rgba(107,63,160,0.25)',
  active:  '#2ECC71',
  expired: '#E74C3C',
  warn:    '#F39C12',
} as const;

// ─── Feature metadata ─────────────────────────────────────────────────────────

const FEATURE_META: Record<string, { icon: string; name: string; nameTA: string }> = {
  panchang:              { icon: '🌅', name: 'Daily Panchangam',        nameTA: 'நாள் பஞ்சாங்கம்' },
  jadhagam:              { icon: '📜', name: 'Jadhagam',                nameTA: 'ஜாதகம்' },
  horoscope_pdf:         { icon: '📜', name: '1 Page Jadhagam',         nameTA: 'ஒரு பக்க ஜாதகம்' },
  book_pdf:              { icon: '📕', name: 'Detailed Jadhagam',        nameTA: 'ஜாதக புத்தகம் PDF' },
  porutham_star:         { icon: '⭐', name: 'Matching Stars',           nameTA: 'நட்சத்திர பொருத்தம்' },
  porutham_mrg:          { icon: '💍', name: 'Marriage Porutham',        nameTA: 'திருமண பொருத்தம்' },
  porutham_pdf:          { icon: '📄', name: 'Marriage Porutham PDF',    nameTA: 'திருமண பொருத்தம் PDF' },
  gocharam:              { icon: '🪐', name: 'Gocharam',                 nameTA: 'கோச்சாரம்' },
  biodata:               { icon: '🪪', name: 'Marriage Biodata PDF',     nameTA: 'திருமண பயோடேட்டா PDF' },
  hora:                  { icon: '🕒', name: 'Hora Muhurtham',           nameTA: 'ஹோரை முகூர்த்த நேரங்கள்' },
  manaiyadi:             { icon: '🏠', name: 'Manaiyadi Sasthiram',      nameTA: 'மனையடி சாஸ்திரம்' },
  age_calc:              { icon: '🔢', name: 'Age Calculator',           nameTA: 'வயது கணக்கீடு' },
  palli_palan:           { icon: '🦎', name: 'Palli Vizhum Palan',       nameTA: 'பல்லி விழும் பலன்கள்' },
  daily_rasi_palan:      { icon: '♈', name: 'Daily Rasi Palan',         nameTA: 'தின ராசி பலன்' },
  daily_nakshatra_palan: { icon: '🌟', name: 'Daily Nakshatra Palan',    nameTA: 'தின நட்சத்திர பலன்' },
  weekly_rasi_palan:     { icon: '📅', name: 'Weekly Rasi Palan',        nameTA: 'வார ராசி பலன்' },
};

const CONTACT_EMAIL = 'astroayancc@gmail.com';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso?: string | null): string {
  if (!iso || iso.startsWith('9999')) return 'Lifetime';
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

// ─── PulseLock — CSS keyframe animation replaces RN Animated ─────────────────

function PulseLock() {
  return (
    <>
      <style>{`
        @keyframes sg-pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.14); }
        }
        .sg-pulse-lock {
          font-size: 54px;
          line-height: 1;
          display: inline-block;
          animation: sg-pulse 1.7s ease-in-out infinite;
          margin: 4px 0;
        }
        @media (prefers-reduced-motion: reduce) {
          .sg-pulse-lock { animation: none; }
        }
      `}</style>
      <span className="sg-pulse-lock" role="img" aria-label="Locked">🔒</span>
    </>
  );
}

// ─── ContactModal — bottom sheet replaces RN Modal ───────────────────────────

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  featureId: string;
}

function ContactModal({ open, onClose, featureId }: ContactModalProps) {
  const [phone,      setPhone]      = useState('');
  const [message,    setMessage]    = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast,      setToast]      = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else      document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleClose = () => {
    setPhone('');
    setMessage('');
    setToast(null);
    onClose();
  };

  const handleSend = async () => {
    if (!phone.trim() || !message.trim()) {
      setToast({ type: 'error', text: 'Please enter your phone number and a message.' });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('support_queries').insert({
        phone_no: phone.trim(),
        message:  `[${featureId}] ${message.trim()}`,
      });
      if (error) throw error;
      setToast({ type: 'success', text: 'Message sent! We will get back to you soon.' });
      setPhone('');
      setMessage('');
      setTimeout(handleClose, 1800);
    } catch (err: any) {
      setToast({ type: 'error', text: err?.message || 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <>
      <style>{`
        @keyframes sg-sheet-in {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        .sg-sheet {
          animation: sg-sheet-in 0.28s cubic-bezier(0.32,0.72,0,1) both;
        }
      `}</style>

      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 flex flex-col justify-end"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      >
        {/* Sheet */}
        <div
          ref={sheetRef}
          className="sg-sheet relative w-full max-w-lg mx-auto rounded-t-2xl px-6 pb-10 pt-4"
          style={{
            backgroundColor: T.surface,
            borderTop: `1px solid ${T.border}`,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <div
            className="w-10 h-1 rounded-full mx-auto mb-3"
            style={{ backgroundColor: T.border2 }}
          />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-opacity hover:opacity-70"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: T.muted }}
            aria-label="Close"
          >
            ✕
          </button>

          {/* Title */}
          <h2 className="text-xl font-bold mt-3 mb-1" style={{ color: T.gold, fontFamily: 'Georgia, serif' }}>
            Contact Us
          </h2>

          {/* Toast */}
          {toast && (
            <div
              className="text-xs rounded-lg px-4 py-3 mb-3 mt-2"
              style={{
                backgroundColor: toast.type === 'success' ? 'rgba(46,204,113,0.12)' : 'rgba(231,76,60,0.12)',
                border: `1px solid ${toast.type === 'success' ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)'}`,
                color: toast.type === 'success' ? '#2ECC71' : T.expired,
              }}
            >
              {toast.text}
            </div>
          )}

          {/* Email card */}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 mt-3 transition-opacity hover:opacity-80 no-underline"
            style={{ backgroundColor: 'rgba(212,168,67,0.07)', border: `1px solid ${T.border}` }}
          >
            <span className="text-xl">📧</span>
            <div>
              <p className="text-[10px] font-bold tracking-widest" style={{ color: T.muted }}>EMAIL</p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: T.text }}>{CONTACT_EMAIL}</p>
            </div>
          </a>

          {/* Message form */}
          <p className="text-[10px] font-bold tracking-[1.5px] mt-6 mb-2.5" style={{ color: T.muted }}>
            OR SEND US A MESSAGE
          </p>

          <label className="text-[10px] font-bold tracking-widest block mb-1.5" style={{ color: T.muted }}>
            YOUR PHONE NUMBER
          </label>
          <input
            type="tel"
            placeholder="e.g. +91 98765 43210"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-1"
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: `1px solid ${T.border}`,
              color: T.text,
              caretColor: T.gold,
            }}
          />

          <label className="text-[10px] font-bold tracking-widest block mt-3.5 mb-1.5" style={{ color: T.muted }}>
            MESSAGE
          </label>
          <textarea
            placeholder="Type your message…"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm resize-none outline-none focus:ring-1"
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: `1px solid ${T.border}`,
              color: T.text,
              caretColor: T.gold,
            }}
          />

          <button
            onClick={handleSend}
            disabled={submitting}
            className="w-full mt-5 py-3.5 rounded-xl text-sm font-extrabold tracking-wide transition-opacity disabled:opacity-60"
            style={{ backgroundColor: T.gold, color: T.deep }}
          >
            {submitting ? 'Sending…' : 'Send Message'}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}

// ─── ScreenGuard ──────────────────────────────────────────────────────────────

interface ScreenGuardProps {
  featureId: string;
  children: React.ReactNode;
}

export default function ScreenGuard({ featureId, children }: ScreenGuardProps) {
  const { hasAccess, loading, isExpired, plan } = useAccess();
  const [contactOpen, setContactOpen] = useState(false);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center w-full min-h-[320px] gap-3"
        style={{ backgroundColor: T.deep }}
      >
        {/* CSS spinner — replaces ActivityIndicator */}
        <style>{`
          @keyframes sg-spin { to { transform: rotate(360deg); } }
          .sg-spinner {
            width: 36px; height: 36px;
            border: 3px solid rgba(212,168,67,0.2);
            border-top-color: ${T.gold};
            border-radius: 50%;
            animation: sg-spin 0.8s linear infinite;
          }
        `}</style>
        <div className="sg-spinner" />
        <p className="text-xs tracking-widest" style={{ color: T.muted, fontFamily: 'Georgia, serif' }}>
          சோதிடம் சரிபார்க்கிறது…
        </p>
      </div>
    );
  }

  // ── Access granted ───────────────────────────────────────────────────────
  if (hasAccess(featureId)) return <>{children}</>;

  // ── Access denied — build lock screen ───────────────────────────────────
  const meta       = FEATURE_META[featureId] ?? { icon: '🔒', name: 'This Feature', nameTA: '' };
  const noPlan     = !plan;
  const isRedPill  = noPlan || isExpired;
  const notInPlan  = plan && !isExpired;

  const headline = noPlan
    ? 'Trial Ended'
    : isExpired
      ? 'Subscription Expired'
      : 'Feature Not Included';

  const pillLabel = noPlan
    ? 'NO ACTIVE PLAN'
    : isExpired
      ? 'PLAN EXPIRED'
      : 'NOT ACTIVATED';

  const bodyText = noPlan
    ? 'Your 1-day free trial has ended. Contact your retailer or admin to activate a plan.'
    : isExpired
      ? `Your plan expired on ${fmt(plan?.expires_at)}. Please renew to continue using this service.`
      : `"${meta.name}" is not part of your current plan. Ask your admin to add this feature.`;

  return (
    <>
      {/* Ambient blobs + gradient root — mirrors LinearGradient + blobTL/blobBR */}
      <div
        className="relative flex items-center justify-center w-full min-h-[420px] overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${T.deep} 0%, ${T.surface} 50%, ${T.deep} 100%)`,
        }}
      >
        {/* blobTL */}
        <div
          className="absolute -top-20 -left-20 w-56 h-56 rounded-full pointer-events-none"
          style={{
            backgroundColor: 'rgba(212,168,67,0.05)',
            border: '1px solid rgba(212,168,67,0.09)',
          }}
        />
        {/* blobBR */}
        <div
          className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
          style={{
            backgroundColor: 'rgba(107,63,160,0.07)',
            border: '1px solid rgba(107,63,160,0.12)',
          }}
        />

        {/* Content column */}
        <div className="relative z-10 flex flex-col items-center gap-3.5 w-full max-w-sm px-6 py-8">

          {/* Feature identity card */}
          <div
            className="flex items-center gap-3 w-full rounded-2xl px-4 py-3"
            style={{
              backgroundColor: 'rgba(212,168,67,0.07)',
              border: `1px solid ${T.border}`,
            }}
          >
            <span className="text-2xl leading-none">{meta.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: T.text, fontFamily: 'Georgia, serif' }}>
                {meta.name}
              </p>
              {meta.nameTA && (
                <p className="text-[11px] mt-0.5" style={{ color: T.purpleL }}>{meta.nameTA}</p>
              )}
            </div>
          </div>

          {/* Animated lock */}
          <PulseLock />

          {/* Status pill */}
          <div
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5"
            style={{
              backgroundColor: isRedPill ? 'rgba(231,76,60,0.12)' : 'rgba(243,156,18,0.11)',
              border: `1px solid ${isRedPill ? 'rgba(231,76,60,0.35)' : 'rgba(243,156,18,0.35)'}`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ backgroundColor: isRedPill ? T.expired : T.warn }}
            />
            <span
              className="text-[10px] font-extrabold tracking-widest"
              style={{ color: isRedPill ? T.expired : T.warn }}
            >
              {pillLabel}
            </span>
          </div>

          {/* Headline */}
          <h2
            className="text-xl font-bold text-center tracking-wide leading-tight"
            style={{ color: T.gold, fontFamily: 'Georgia, serif' }}
          >
            {headline}
          </h2>

          {/* Body text */}
          <p className="text-xs text-center leading-relaxed -mt-1 whitespace-pre-line" style={{ color: T.muted }}>
            {bodyText}
          </p>

          {/* Divider */}
          <div className="w-3/5 h-px my-0.5" style={{ backgroundColor: T.border }} />

          {/* Free trial info box */}
          {noPlan && (
            <div
              className="w-full rounded-xl p-3.5 flex flex-col gap-1.5"
              style={{ backgroundColor: 'rgba(212,168,67,0.05)', border: `1px solid ${T.border}` }}
            >
              <p className="text-xs font-bold tracking-widest" style={{ color: T.gold, fontFamily: 'Georgia, serif' }}>
                🎁 Free Trial
              </p>
              <p className="text-xs leading-relaxed" style={{ color: T.muted }}>
                Every new account includes a{' '}
                <span style={{ color: T.gold }}>1-day free trial</span>
                {' '}with access to all features. Your trial period has now ended.
              </p>
            </div>
          )}

          {/* Current plan info box */}
          {notInPlan && plan && (
            <div
              className="w-full rounded-xl p-3.5 flex flex-col gap-1.5"
              style={{ backgroundColor: 'rgba(212,168,67,0.05)', border: `1px solid ${T.border}` }}
            >
              <p className="text-xs font-bold tracking-widest" style={{ color: T.gold, fontFamily: 'Georgia, serif' }}>
                📦 Current Plan
              </p>
              <p className="text-xs leading-relaxed" style={{ color: T.muted }}>
                <span style={{ color: T.gold }}>{(plan as any).plan_name}</span>
                {'  •  '}
                Expires: <span style={{ color: T.gold }}>{fmt((plan as any).expires_at)}</span>
              </p>
            </div>
          )}

          {/* CTA button */}
          <button
            onClick={() => setContactOpen(true)}
            className="w-full py-3.5 rounded-xl text-sm font-extrabold tracking-wide mt-1 transition-opacity hover:opacity-90 active:opacity-80"
            style={{ backgroundColor: T.gold, color: T.deep }}
          >
            📞 Contact Us / Send a Message
          </button>

          {/* Hint text */}
          <div
            className="w-full rounded-xl p-3.5"
            style={{ backgroundColor: 'rgba(107,63,160,0.1)', border: `1px solid ${T.border2}` }}
          >
            <p className="text-xs text-center leading-relaxed" style={{ color: T.purpleL }}>
              📞 Contact your retailer or admin to{' '}
              {noPlan || isExpired ? 'activate / renew your plan' : 'upgrade your plan'}.
            </p>
          </div>

        </div>
      </div>

      {/* Contact bottom-sheet modal */}
      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        featureId={featureId}
      />
    </>
  );
}
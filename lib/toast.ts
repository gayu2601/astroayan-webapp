// toast.ts — drop this in src/lib/toast.ts
// Usage: import toast from '@/lib/toast'
//        toast.success('Custom Neck sketch saved!')
//        toast.error('Upload failed. Try again.')
//        toast.info('Syncing orders…')
//        toast.warning('Storage limit approaching.')
//        toast.confirm('Remove retailer?', () => doToggle(item))
//        toast.confirm('Delete?', onConfirm, { confirmLabel: 'Yes, delete', cancelLabel: 'Keep' })
//        toast('Plain message')           ← shorthand for info

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;   // ms, default 3500
  id?: string;         // supply to deduplicate (same id replaces existing toast)
}

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  timer: ReturnType<typeof setTimeout>;
  el: HTMLElement;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const CONTAINER_ID = '__thaiyal_toast_root__';

const CONTAINER_CSS = `
  position: fixed;
  bottom: 1.25rem;
  right: 1.25rem;
  z-index: 99999;
  display: flex;
  flex-direction: column-reverse;
  gap: 0.5rem;
  pointer-events: none;
  max-width: min(calc(100vw - 2.5rem), 380px);
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
`.replace(/\s+/g, ' ').trim();

const TOAST_BASE_CSS = `
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.45;
  pointer-events: all;
  cursor: default;
  box-shadow: 0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06);
  transition: opacity 180ms ease, transform 200ms cubic-bezier(.22,1,.36,1);
  opacity: 0;
  transform: translateY(8px) scale(0.97);
  will-change: opacity, transform;
  word-break: break-word;
`.replace(/\s+/g, ' ').trim();

const TYPE_STYLES: Record<ToastType, { bg: string; border: string; color: string; icon: string }> = {
  success: {
    bg:     '#f0fdf4',
    border: '#bbf7d0',
    color:  '#14532d',
    icon:   `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;margin-top:1px"><circle cx="8" cy="8" r="7.25" stroke="#16a34a" stroke-width="1.5"/><path d="M5 8l2 2 4-4" stroke="#16a34a" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  error: {
    bg:     '#fff1f2',
    border: '#fecdd3',
    color:  '#7f1d1d',
    icon:   `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;margin-top:1px"><circle cx="8" cy="8" r="7.25" stroke="#dc2626" stroke-width="1.5"/><path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#dc2626" stroke-width="1.75" stroke-linecap="round"/></svg>`,
  },
  warning: {
    bg:     '#fffbeb',
    border: '#fde68a',
    color:  '#78350f',
    icon:   `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;margin-top:1px"><path d="M8 2.5L1.5 13.5h13L8 2.5z" stroke="#d97706" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 6.5v3M8 11h.01" stroke="#d97706" stroke-width="1.75" stroke-linecap="round"/></svg>`,
  },
  info: {
    bg:     '#eff6ff',
    border: '#bfdbfe',
    color:  '#1e3a5f',
    icon:   `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;margin-top:1px"><circle cx="8" cy="8" r="7.25" stroke="#3b82f6" stroke-width="1.5"/><path d="M8 7v4M8 5h.01" stroke="#3b82f6" stroke-width="1.75" stroke-linecap="round"/></svg>`,
  },
};

// ─── Core ─────────────────────────────────────────────────────────────────────

const toasts = new Map<string, ToastItem>();

function getContainer(): HTMLElement {
  let el = document.getElementById(CONTAINER_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = CONTAINER_ID;
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Notifications');
    el.setAttribute('aria-live', 'polite');
    el.style.cssText = CONTAINER_CSS;
    document.body.appendChild(el);
  }
  return el;
}

function dismiss(id: string) {
  const item = toasts.get(id);
  if (!item) return;
  clearTimeout(item.timer);
  item.el.style.opacity = '0';
  item.el.style.transform = 'translateY(6px) scale(0.96)';
  setTimeout(() => {
    item.el.remove();
    toasts.delete(id);
  }, 200);
}

function show(message: string, type: ToastType, options: ToastOptions = {}): string {
  const { duration = 3500, id = `t-${Date.now()}-${Math.random().toString(36).slice(2)}` } = options;

  // Replace existing toast with same id
  if (toasts.has(id)) dismiss(id);

  const styles = TYPE_STYLES[type];
  const container = getContainer();

  const el = document.createElement('div');
  el.setAttribute('role', 'alert');
  el.style.cssText = TOAST_BASE_CSS;
  el.style.background = styles.bg;
  el.style.borderColor = styles.border;
  el.style.color = styles.color;

  el.innerHTML = `
    ${styles.icon}
    <span style="flex:1;min-width:0">${message}</span>
    <button
      aria-label="Dismiss"
      style="flex-shrink:0;background:none;border:none;cursor:pointer;padding:0;margin-top:1px;opacity:0.5;color:inherit;line-height:1;font-size:16px;transition:opacity 120ms"
      onmouseenter="this.style.opacity='1'"
      onmouseleave="this.style.opacity='0.5'"
    >✕</button>
  `;

  const closeBtn = el.querySelector('button')!;
  closeBtn.addEventListener('click', () => dismiss(id));

  container.appendChild(el);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0) scale(1)';
    });
  });

  const timer = setTimeout(() => dismiss(id), duration);
  toasts.set(id, { id, message, type, timer, el });

  return id;
}

// ─── Public API ───────────────────────────────────────────────────────────────

interface ConfirmOptions {
  confirmLabel?: string;   // default 'Confirm'
  cancelLabel?:  string;   // default 'Cancel'
  id?: string;
}

const CONFIRM_STYLES = {
  bg:     '#fffbeb',
  border: '#fde68a',
  color:  '#78350f',
  icon:   `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;margin-top:1px"><path d="M8 2.5L1.5 13.5h13L8 2.5z" stroke="#d97706" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 6.5v3M8 11h.01" stroke="#d97706" stroke-width="1.75" stroke-linecap="round"/></svg>`,
};

const CONFIRM_BTN_BASE = `
  border: none; cursor: pointer; padding: 3px 10px; border-radius: 6px;
  font-size: 12px; font-weight: 700; line-height: 1.6; transition: opacity 120ms;
`.replace(/\s+/g, ' ').trim();

function showConfirm(message: string, onConfirm: () => void, options: ConfirmOptions = {}): string {
  const {
    confirmLabel = 'Confirm',
    cancelLabel  = 'Cancel',
    id = `tc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  } = options;

  if (toasts.has(id)) dismiss(id);

  const container = getContainer();
  const el = document.createElement('div');
  el.setAttribute('role', 'alertdialog');
  el.setAttribute('aria-modal', 'false');
  el.style.cssText = TOAST_BASE_CSS + ' flex-direction: column; gap: 0.5rem;';
  el.style.background  = CONFIRM_STYLES.bg;
  el.style.borderColor = CONFIRM_STYLES.border;
  el.style.color       = CONFIRM_STYLES.color;

  el.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:0.625rem">
      ${CONFIRM_STYLES.icon}
      <span style="flex:1;min-width:0;font-size:13px;font-weight:600;line-height:1.45">${message}</span>
    </div>
    <div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:2px">
      <button data-role="cancel"  style="${CONFIRM_BTN_BASE} background:#fff8e1; color:#92400e; border:1px solid #fde68a;">${cancelLabel}</button>
      <button data-role="confirm" style="${CONFIRM_BTN_BASE} background:#d97706; color:#fff; border:1px solid #b45309;">${confirmLabel}</button>
    </div>
  `;

  const cancelBtn  = el.querySelector<HTMLButtonElement>('[data-role="cancel"]')!;
  const confirmBtn = el.querySelector<HTMLButtonElement>('[data-role="confirm"]')!;

  cancelBtn.addEventListener('click',  () => dismiss(id));
  confirmBtn.addEventListener('click', () => { dismiss(id); onConfirm(); });

  // No auto-dismiss — stays until user acts
  const timer = setTimeout(() => dismiss(id), 12000);  // safety fallback after 12s
  container.appendChild(el);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity   = '1';
      el.style.transform = 'translateY(0) scale(1)';
    });
  });

  toasts.set(id, { id, message, type: 'warning', timer, el });
  return id;
}

function toast(message: string, options?: ToastOptions): string {
  return show(message, 'info', options);
}

toast.success    = (message: string, options?: ToastOptions) => show(message, 'success', options);
toast.error      = (message: string, options?: ToastOptions) => show(message, 'error',   options);
toast.warning    = (message: string, options?: ToastOptions) => show(message, 'warning', options);
toast.info       = (message: string, options?: ToastOptions) => show(message, 'info',    options);
toast.confirm    = (message: string, onConfirm: () => void, options?: ConfirmOptions) => showConfirm(message, onConfirm, options);
toast.dismiss    = dismiss;
toast.dismissAll = () => { [...toasts.keys()].forEach(dismiss); };

export default toast;
import { useAuth } from '../lib/AuthContext';
import { translations } from '../i18n/translations';

export function useTranslation() {
  const { language } = useAuth();
  const lang = language || 'ta';

  const t = (key) =>
    translations[lang]?.[key] ?? translations['ta']?.[key] ?? key;

  return { t, language: lang, isTamil: lang === 'ta' };
}

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { normalizeLanguage } from './config-lang';
import enLocales from './langs/en';
import cnLocales from './langs/cn';
import messages from './messages.json';

let lng = 'cn';
try { lng = normalizeLanguage(window.localStorage.getItem('i18nextLng')); } catch { /* Storage is optional. */ }
const textResources = (language) => Object.fromEntries(Object.entries(messages).map(([key, value]) => [key, value[language]]));
function syncLanguage(language) {
  const normalized = normalizeLanguage(language);
  try { window.localStorage.setItem('i18nextLng', normalized); } catch { /* Keep working in memory. */ }
  if (typeof document !== 'undefined') document.documentElement.lang = normalized === 'cn' ? 'zh-CN' : 'en';
}
i18n.use(initReactI18next).init({
  resources: {
    en: { translations: enLocales, ui: textResources('en') },
    cn: { translations: cnLocales, ui: textResources('cn') },
  },
  lng, supportedLngs: ['cn', 'en'], fallbackLng: 'cn',
  ns: ['translations', 'ui'], defaultNS: 'translations',
  interpolation: { escapeValue: false },
});
i18n.on('languageChanged', syncLanguage);
syncLanguage(lng);
export default i18n;

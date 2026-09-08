import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import { normalizeLanguage } from './config-lang';

// Source text is the stable key. Only authored UI text is passed here; never user records.
export function tr(text, values) {
  return i18n.t(text, { ns: 'ui', keySeparator: false, nsSeparator: false, defaultValue: text, ...values });
}
export function useUiLanguage() {
  const { i18n: instance } = useTranslation();
  return normalizeLanguage(instance.resolvedLanguage || instance.language);
}
export const currentLocale = () => normalizeLanguage(i18n.language) === 'cn' ? 'zh-CN' : 'en-MY';

import { useTranslation } from 'react-i18next';
import { allLangs, normalizeLanguage } from './config-lang';

export default function useLocales() {
  const { i18n, t } = useTranslation();
  const currentLang = allLangs.find((lang) => lang.value === normalizeLanguage(i18n.resolvedLanguage || i18n.language));
  return {
    onChangeLang: (language) => i18n.changeLanguage(normalizeLanguage(language)),
    translate: t, currentLang, allLangs,
  };
}

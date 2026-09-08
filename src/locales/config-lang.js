import { enUS, zhCN } from '@mui/material/locale';
import { enUS as enDate, zhCN as cnDate } from 'date-fns/locale';

export const allLangs = [
  { label: '华文', value: 'cn', locale: 'zh-CN', systemValue: zhCN, dateLocale: cnDate, icon: '/assets/icons/flags/ic_flag_cn.svg' },
  { label: 'English', value: 'en', locale: 'en-MY', systemValue: enUS, dateLocale: enDate, icon: '/assets/icons/flags/ic_flag_en.svg' },
];
export const defaultLang = allLangs[0];
export const normalizeLanguage = (value) => {
  if (/^en(?:-|$)/i.test(value || '')) return 'en';
  return 'cn';
};

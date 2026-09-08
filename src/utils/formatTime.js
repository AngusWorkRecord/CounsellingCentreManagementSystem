import { enUS, zhCN } from 'date-fns/locale';
import { format, getTime, formatDistanceToNow } from 'date-fns';
import { currentLocale } from '../locales/translate';

const dateLocale = () => currentLocale() === 'zh-CN' ? zhCN : enUS;

// ----------------------------------------------------------------------

export function fDate(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy';

  return date ? format(new Date(date), fm, { locale: dateLocale() }) : '';
}

export function fDateTime(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm, { locale: dateLocale() }) : '';
}

export function fTimestamp(date) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: dateLocale(),
      })
    : '';
}

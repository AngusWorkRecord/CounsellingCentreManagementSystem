import { currentLocale, tr } from '../../../locales/translate';

export function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function formatDuration(totalMinutes) {
  const minutes = Math.max(0, Math.round(toNumber(totalMinutes)));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  // 中文原文：分钟、小时
  if (!hours) return tr("{{p0}} min", { p0: remainingMinutes });
  if (!remainingMinutes) return tr("{{p0}} hr", { p0: hours });
  return tr("{{p0}} hr {{p1}} min", { p0: hours, p1: remainingMinutes });
}

export function formatCurrency(value) {
  const amount = toNumber(value);
  return `RM${amount.toLocaleString(currentLocale(), {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function groupCount(sessions, field) {
  const counts = new Map();

  sessions.forEach((session) => {
    // 中文原文：未分类
    const label = session[field] || 'Uncategorised';
    counts.set(label, (counts.get(label) || 0) + 1);
  });

  return Array.from(counts, ([label, value]) => ({ label, value }));
}

export function getSessionDateKey(value) {
  if (!value) return '';
  const dateKey = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey) ? dateKey : '';
}

export function getSessionMonth(value) {
  return getSessionDateKey(value).slice(0, 7);
}

export function getSessionYear(value) {
  return getSessionDateKey(value).slice(0, 4);
}

export function formatLocalDate(value) {
  if (!value) return '';
  if (typeof value === 'string') return getSessionDateKey(value);

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function filterSessionsByPeriod(sessions, period) {
  const { mode, month, year, startDate, endDate } = period;
  const startKey = formatLocalDate(startDate);
  const endKey = formatLocalDate(endDate);

  return sessions.filter((session) => {
    const dateKey = getSessionDateKey(session.counselling_date);
    if (!dateKey) return false;

    if (mode === 'year') return dateKey.slice(0, 4) === String(year);
    if (mode === 'custom') return Boolean(startKey && endKey && dateKey >= startKey && dateKey <= endKey);
    return dateKey.slice(0, 7) === month;
  });
}

export function formatPeriodLabel({ mode, month, year, startDate, endDate }) {
  // 中文原文：年、至
  if (mode === 'year') return `${year}`;
  if (mode === 'custom') return tr("{{p0}} to {{p1}}", { p0: formatLocalDate(startDate), p1: formatLocalDate(endDate) });

  const [monthYear, monthNumber] = month.split('-');
  // 中文原文：年、月
  return new Date(Number(monthYear), Number(monthNumber) - 1).toLocaleString(currentLocale(), { month: 'long', year: 'numeric' });
}

export function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function formatDuration(totalMinutes) {
  const minutes = Math.max(0, Math.round(toNumber(totalMinutes)));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (!hours) return `${remainingMinutes}分钟`;
  if (!remainingMinutes) return `${hours}小时`;
  return `${hours}小时${remainingMinutes}分钟`;
}

export function formatCurrency(value) {
  const amount = toNumber(value);
  return `RM${amount.toLocaleString('en-MY', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function groupCount(sessions, field) {
  const counts = new Map();

  sessions.forEach((session) => {
    const label = session[field] || '未分类';
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
  if (mode === 'year') return `${year}年`;
  if (mode === 'custom') return `${formatLocalDate(startDate)} 至 ${formatLocalDate(endDate)}`;

  const [monthYear, monthNumber] = month.split('-');
  return `${monthYear}年${Number(monthNumber)}月`;
}

import { toNumber } from '../utils';

export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getCurrentYear() {
  return String(new Date().getFullYear());
}

export function getPeriodDateRange({ mode, month, year, startDate, endDate }) {
  if (mode === 'custom') {
    const format = (value) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      const monthValue = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${date.getFullYear()}-${monthValue}-${day}`;
    };
    return { dateFrom: format(startDate), dateTo: format(endDate) };
  }
  if (mode === 'year') return { dateFrom: `${year}-01-01`, dateTo: `${year}-12-31` };
  const [monthYear, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(monthYear, monthNumber, 0).getDate();
  return { dateFrom: `${month}-01`, dateTo: `${month}-${String(lastDay).padStart(2, '0')}` };
}

export function calculateDashboardMetrics(sessions) {
  const totalMinutes = sessions.reduce(
    (total, session) => total + toNumber(session.duration_minutes),
    0
  );
  const totalCollection = sessions.reduce(
    (total, session) => total + toNumber(session.amount_received_rm),
    0
  );

  return {
    totalCases: sessions.length,
    totalMinutes,
    averageMinutes: sessions.length ? totalMinutes / sessions.length : 0,
    totalCollection,
  };
}

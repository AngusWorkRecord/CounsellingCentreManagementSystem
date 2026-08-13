import { toNumber } from '../utils';

export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getCurrentYear() {
  return String(new Date().getFullYear());
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

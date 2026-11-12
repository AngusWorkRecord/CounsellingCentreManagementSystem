import { periodRange } from './rosterModel';

// Sarawak calendar, including applicable federal holidays and replacement days.
// https://talikhidmat.sarawak.gov.my/talikhidmat/web/home/list_holiday/?id=web
// Sources (checked 2026-11-12): https://www.mef.org.my/PublicHoliday.aspx
// https://www.kabinet.gov.my/akta-dan-warta/
const calendars = {
  2026: [
    ['01-01', "New Year's Day"],
    ['03-23', 'Hari Raya replacement holiday'],
    ['04-03', 'Good Friday'],
    ['06-02', 'Gawai Dayak Holiday'],
    ['06-03', 'Wesak replacement holiday'],
    ['06-04', 'Gawai replacement holiday'],
    ['07-22', 'Sarawak Day'],
    ['10-10', "Sarawak Governor's Birthday"],
    ['02-17', 'Chinese New Year'],
    ['02-18', 'Chinese New Year Holiday'],
    ['03-21', 'Hari Raya Aidilfitri'],
    ['03-22', 'Hari Raya Aidilfitri Holiday'],
    ['05-01', 'Labour Day'],
    ['05-27', 'Hari Raya Haji'],
    ['05-31', 'Wesak Day'],
    ['06-01', "Gawai Dayak / Agong's Birthday"],
    ['06-17', 'Awal Muharram'],
    ['08-25', "Prophet Muhammad's Birthday"],
    ['08-31', 'National Day'],
    ['09-16', 'Malaysia Day'],
    ['12-25', 'Christmas Day'],
  ],
  2027: [
    ['01-01', "New Year's Day"],
    ['02-08', 'Chinese New Year replacement holiday'],
    ['03-26', 'Good Friday'],
    ['06-01', 'Gawai Dayak'],
    ['06-02', 'Gawai Dayak Holiday'],
    ['06-08', 'Awal Muharram replacement holiday'],
    ['07-22', 'Sarawak Day'],
    ['08-16', 'Prophet Muhammad replacement holiday'],
    ['10-09', "Sarawak Governor's Birthday"],
    ['02-06', 'Chinese New Year'],
    ['02-07', 'Chinese New Year Holiday'],
    ['03-10', 'Hari Raya Aidilfitri'],
    ['03-11', 'Hari Raya Aidilfitri Holiday'],
    ['05-01', 'Labour Day'],
    ['05-17', 'Hari Raya Haji'],
    ['05-20', 'Wesak Day'],
    ['06-06', 'Awal Muharram'],
    ['06-07', "Agong's Birthday"],
    ['08-15', "Prophet Muhammad's Birthday"],
    ['08-31', 'National Day'],
    ['09-16', 'Malaysia Day'],
    ['12-25', 'Christmas Day'],
  ],
};

export function malaysiaHolidays(period) {
  const range = periodRange(period);
  if (!range) return { holidays: [], missingYears: [] };
  const holidays = [];
  const missingYears = [];
  for (let year = Number(range.from.slice(0, 4)); year <= Number(range.to.slice(0, 4)); year += 1) {
    if (!calendars[year]) missingYears.push(year);
    else
      calendars[year].forEach(([date, name]) => {
        const fullDate = `${year}-${date}`;
        if (fullDate >= range.from && fullDate <= range.to) holidays.push({ date: fullDate, name });
      });
  }
  holidays.sort((a, b) => a.date.localeCompare(b.date));
  return { holidays, missingYears };
}

// Keep manual duplicates intact so existing validation can flag input mistakes.
export const mergeHolidays = (builtIn, manual) => [
  ...builtIn.filter((holiday) => !manual.some((item) => item.date === holiday.date)),
  ...manual,
];

import { periodMonths, periodRange, validDate } from './rosterModel';

const METHODS = ['phone', 'f2f', 'zoom'];
const escapeHtml = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[char])
  );

// A width estimate for pagination only. Names are always printed in full.
const lineCount = (text) =>
  Math.max(
    1,
    Math.ceil([...text].reduce((total, char) => total + (char.charCodeAt(0) > 255 ? 2 : 1), 0) / 18)
  );

export function buildRosterPrintPages({ period, shifts, knownPeople, holidays = [], labels }) {
  const range = periodRange(period);
  if (!range) return [];
  const selected = shifts.filter(
    (s) => validDate(s.date) && s.date >= range.from && s.date <= range.to
  );
  const blocks = [];
  periodMonths(period).forEach((month, monthIndex) => {
    const rows = [];
    const cursor = new Date(`${month}-01T12:00:00Z`);
    while (cursor.toISOString().startsWith(month)) {
      const date = cursor.toISOString().slice(0, 10);
      const entries = selected.filter((s) => s.date === date);
      if (
        date >= range.from &&
        date <= range.to &&
        ([1, 3, 5].includes(cursor.getUTCDay()) || entries.length)
      ) {
        const cells = METHODS.map((method) =>
          entries
            .filter((s) => s.method === method)
            .sort(
              (a, b) => a.start.localeCompare(b.start) || String(a.id).localeCompare(String(b.id))
            )
            .flatMap((s, _, sameMethod) => [
              ...(sameMethod.length > 1 ? [`${s.start}-${s.end}`] : []),
              ...(s.personIds.length && s.manualAssignment && labels.manualAdjustment ? [labels.manualAdjustment] : []),
              ...s.personIds.map((id) => knownPeople[id]?.name || labels.unavailablePerson(id)),
            ])
        );
        // Split unusually large groups across continued date rows, never clip names.
        const parts = cells.map((names) => {
          const chunks = [[]];
          let lines = 0;
          names.forEach((name) => {
            const size = lineCount(name);
            if (lines + size > 12 && chunks[chunks.length - 1].length) {
              chunks.push([]);
              lines = 0;
            }
            chunks[chunks.length - 1].push(name);
            lines += size;
          });
          return chunks;
        });
        const holiday = holidays.find((h) => h.date === date)?.name || '';
        for (let part = 0; part < Math.max(...parts.map((p) => p.length)); part += 1) {
          const cellParts = parts.map((p) => p[part] || []);
          rows.push({
            date,
            cells: cellParts,
            holiday,
            continued: part > 0,
            cost:
              Math.max(
                3,
                ...cellParts.map((names) => names.reduce((n, name) => n + lineCount(name), 0) + 1)
              ) + (holiday && entries.length ? lineCount(holiday) : 0),
          });
        }
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    let block = { month, monthIndex, continued: false, rows: [] };
    let cost = 0;
    rows.forEach((row) => {
      if (block.rows.length && (cost + row.cost > 44 || block.rows.length >= 14)) {
        blocks.push(block);
        block = { month, monthIndex, continued: true, rows: [] };
        cost = 0;
      }
      block.rows.push(row);
      cost += row.cost;
    });
    blocks.push(block);
  });
  return Array.from({ length: Math.ceil(blocks.length / 3) }, (_, i) =>
    blocks.slice(i * 3, i * 3 + 3)
  );
}

export function rosterPrintHtml(options) {
  const { period, labels, language = 'cn', personName = '' } = options;
  const range = periodRange(period);
  const pages = buildRosterPrintPages(options);
  if (!range || !pages.length) return '';
  const locale = language === 'cn' ? 'zh-CN' : 'en-MY';
  const monthFormat = new Intl.DateTimeFormat(locale, {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: 'long',
  });
  const dateFormat = new Intl.DateTimeFormat(locale, {
    timeZone: 'Asia/Kuala_Lumpur',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const dayFormat = new Intl.DateTimeFormat(locale, {
    timeZone: 'Asia/Kuala_Lumpur',
    weekday: 'short',
  });
  const atDate = (date) => new Date(`${date}T12:00:00Z`);
  const content = pages
    .map(
      (blocks, pageIndex) => `<section class="sheet">
    <header><h1>${escapeHtml(labels.centre)}</h1><h2>${escapeHtml(labels.title)}</h2>
    <p>${escapeHtml(dateFormat.format(atDate(range.from)))} - ${escapeHtml(
        dateFormat.format(atDate(range.to))
      )}${personName ? ` · ${escapeHtml(personName)}` : ''}</p></header>
    <div class="months">${blocks
      .map(
        (block) => `<table class="month month-${block.monthIndex % 2}">
      <colgroup><col class="date-column"><col><col><col></colgroup>
      <thead><tr><th colspan="4" class="month-name">${escapeHtml(
        monthFormat.format(atDate(`${block.month}-01`))
      )}${block.continued ? ` (${escapeHtml(labels.continued)})` : ''}</th></tr>
      <tr>${[labels.date, labels.phone, labels.f2f, labels.zoom]
        .map((label) => `<th scope="col">${escapeHtml(label)}</th>`)
        .join('')}</tr></thead>
      <tbody>${
        block.rows
          .map((row, i) => {
            const day = atDate(row.date);
            const dateText =
              language === 'cn'
                ? `(${
                    ['日', '一', '二', '三', '四', '五', '六'][day.getUTCDay()]
                  })${day.getUTCDate()}日`
                : `${dayFormat.format(day)} ${day.getUTCDate()}`;
            const emptyHoliday = row.holiday && row.cells.every((names) => !names.length);
            let rowClass = i % 2 === 0 ? 'stripe' : '';
            if (row.holiday) rowClass = 'holiday';
            return `<tr class="${rowClass}"><td class="date">${escapeHtml(dateText)}${
              row.continued ? `<small>${escapeHtml(labels.continued)}</small>` : ''
            }</td>${
              emptyHoliday
                ? `<td colspan="3">${escapeHtml(row.holiday)}</td>`
                : row.cells
                    .map(
                      (names, method) =>
                        `<td>${
                          method === 0 && row.holiday
                            ? `<div class="holiday-note">${escapeHtml(row.holiday)}</div>`
                            : ''
                        }${names
                          .map((name) => `<div class="person">${escapeHtml(name)}</div>`)
                          .join('')}</td>`
                    )
                    .join('')
            }</tr>`;
          })
          .join('') || `<tr><td colspan="4">${escapeHtml(labels.noDutyDates)}</td></tr>`
      }</tbody></table>`
      )
      .join('')}</div>
    <footer>${pageIndex + 1} / ${pages.length}</footer></section>`
    )
    .join('');
  return `<!doctype html><html lang="${
    language === 'cn' ? 'zh-CN' : 'en'
  }"><head><meta charset="utf-8"><title>Duty-roster_${range.from}_${range.to}</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111; font-family: Arial, 'Microsoft YaHei', 'PingFang SC', sans-serif; }
    .toolbar { padding: 14px; background: #f2f4f3; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .toolbar button { padding: 8px 16px; cursor: pointer; }
    .sheet { width: 277mm; margin: 12px auto; padding: 0; break-after: page; }
    .sheet:last-child { break-after: auto; }
    header { text-align: center; height: 23mm; padding-top: 1mm; }
    h1 { font-size: 13pt; margin: 0 0 2mm; font-weight: 600; }
    h2 { font-size: 10pt; margin: 0 0 1mm; font-weight: 500; }
    header p { font-size: 8pt; margin: 0; }
    .months { display: flex; align-items: flex-start; gap: 6mm; }
    table { width: calc((100% - 12mm) / 3); table-layout: fixed; border-collapse: collapse; border: 0.3mm solid #222; font-size: 7.4pt; line-height: 1.2; }
    .date-column { width: 21%; }
    th, td { padding: 1mm 0.8mm; text-align: left; vertical-align: middle; overflow-wrap: anywhere; border-right: 0.2mm dotted #555; }
    th:last-child, td:last-child { border-right: 0; }
    thead th { border-bottom: 0.2mm solid #333; }
    .month-name { text-align: center; font-size: 10pt; padding: 0.8mm; font-weight: 500; }
    tbody tr { height: 10mm; break-inside: avoid; }
    .month-0 .month-name, .month-0 .stripe { background: #b6d7a8; }
    .month-1 .month-name, .month-1 .stripe { background: #d5a6bd; }
    .holiday { background: #fff2cc; }
    .person { margin: 0; }
    .date { font-size: 7.5pt; }
    small { display: block; font-size: 6.5pt; }
    .holiday-note { font-weight: 600; margin-bottom: 1mm; }
    footer { text-align: right; font-size: 7pt; margin-top: 3mm; }
    @media screen { body { background: #ddd; } .sheet { background: white; padding: 10mm; width: 297mm; } }
    @media print { .toolbar { display: none; } .sheet { margin: 0; } * { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  </style></head><body><div class="toolbar"><button id="print-roster">${escapeHtml(
    labels.print
  )}</button><button id="close-roster">${escapeHtml(labels.close)}</button><span>${escapeHtml(
    labels.instructions
  )}</span></div>${content}</body></html>`;
}

export function printDutyRoster(options) {
  const html = rosterPrintHtml(options);
  if (!html) return false;
  // Open synchronously within the click event to avoid popup blockers.
  const preview = window.open('', '_blank');
  if (!preview) return false;
  preview.opener = null;
  preview.document.open();
  preview.document.write(html);
  preview.document.close();
  const print = () => {
    preview.focus();
    preview.print();
  };
  preview.document.getElementById('print-roster').addEventListener('click', print);
  preview.document.getElementById('close-roster').addEventListener('click', () => preview.close());
  Promise.resolve(preview.document.fonts?.ready).then(() => {
    if (!preview.closed) preview.setTimeout(print, 100);
  });
  return true;
}

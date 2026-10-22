/* eslint-env jest */
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import CounsellingPracticePage from '../../pages/CounsellingPracticePage';
import i18n from '../../locales/i18n';
import usePractice from './usePractice';
import { emptyRecord, examples, exportText, sections, validateRecord } from './model';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root;
let container;
let practice;
const result = Object.fromEntries([...Object.keys(sections).map((key) => [key, [{ title: key, detail: 'Reflect on the summary', sourceRefs: ['field:summary'] }]]), ['limitations', ['Limited to this record']]]);
function Probe({ language }) { practice = usePractice(language); return null; }
async function mount(language = 'cn') { await act(async () => root.render(<Probe language={language} />)); }
async function update(fn) { await act(async () => fn()); }
function deferred() { let resolve; const promise = new Promise((done) => { resolve = done; }); return { promise, resolve }; }
function reply(language = 'cn') { return { ok: true, json: async () => ({ success: true, data: { language, generatedAt: '2026-10-20T00:00:00Z', result } }) }; }
beforeEach(async () => {
  await i18n.changeLanguage('cn');
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  global.fetch = jest.fn(async () => reply());
});
afterEach(() => { act(() => root.unmount()); container.remove(); jest.restoreAllMocks(); delete global.fetch; });

test('summary validation and shared field boundaries', () => {
  expect(validateRecord(emptyRecord()).summary).toBeTruthy();
  expect(validateRecord({ ...examples.cn })).toEqual({});
  expect(validateRecord({ ...examples.cn, background: 'x'.repeat(2001) }).background).toBeTruthy();
});
test('manual generation uses public endpoint and scopes memory cache by record and language', async () => {
  await mount();
  await update(() => practice.run());
  expect(fetch).not.toHaveBeenCalled();
  await update(() => { practice.replaceRecord(examples.cn); practice.setConfirmed(true); });
  await update(() => practice.run());
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toBe('/api/ai/student-feedback');
  expect(fetch.mock.calls[0][1].credentials).toBe('omit');
  expect(JSON.parse(fetch.mock.calls[0][1].body).language).toBe('cn');
  expect(practice.feedback.result).toEqual(result);
  await update(() => practice.setRecord({ ...examples.cn, questions: 'Changed question' }));
  expect(practice.stale).toBe(true);
  await update(() => practice.setRecord({ ...examples.cn }));
  expect(practice.stale).toBe(false);
  await mount('en');
  expect(practice.record.summary).toBe(examples.cn.summary);
  expect(practice.feedback).toBeNull();
  expect(fetch).toHaveBeenCalledTimes(1);
  fetch.mockImplementation(async () => reply('en'));
  await update(() => practice.run());
  await mount('cn');
  expect(practice.feedback.language).toBe('cn');
  expect(fetch).toHaveBeenCalledTimes(2);
  await update(() => practice.clear());
  expect(practice.record).toEqual(emptyRecord());
  expect(practice.feedback).toBeNull();
  await mount('en'); expect(practice.feedback).toBeNull();
});
test.each(['cancel', 'language', 'edit', 'clear'])('ignores late responses after %s', async (action) => {
  await mount();
  await update(() => { practice.replaceRecord(examples.cn); practice.setConfirmed(true); });
  const pending = deferred(); fetch.mockImplementation(() => pending.promise);
  let run;
  await update(() => { run = practice.run(); });
  expect(practice.loading).toBe(true);
  if (action === 'cancel') await update(() => practice.cancel());
  if (action === 'clear') await update(() => practice.clear());
  if (action === 'language') await mount('en');
  if (action === 'edit') await update(() => practice.setRecord({ ...examples.cn, summary: 'A different record' }));
  await update(async () => { pending.resolve(reply()); await run; });
  expect(practice.feedback).toBeNull();
  expect(practice.loading).toBe(false);
});
test('failure keeps input and permits retry; export preserves raw record and feedback', async () => {
  await mount();
  await update(() => { practice.replaceRecord(examples.cn); practice.setConfirmed(true); });
  fetch.mockRejectedValueOnce(Object.assign(new Error(), { code: 'AI_TIMEOUT' }));
  await update(() => practice.run());
  expect(practice.error).toBe('AI_TIMEOUT');
  expect(practice.record).toEqual(examples.cn);
  await update(() => practice.run());
  expect(practice.error).toBe('');
  const text = exportText(practice.record, practice.feedback, (value) => value, (value) => value);
  expect(text).toContain(examples.cn.summary);
  expect(text).toContain('Reflect on the summary');
  expect(text).toContain('field:summary');
  expect(text).toContain('cn');
});
test('public page renders without authentication, confirms overwrite and switches language without replacing input', async () => {
  await update(() => root.render(<HelmetProvider><CounsellingPracticePage /></HelmetProvider>));
  const button = (label) => [...document.querySelectorAll('button')].find((node) => node.textContent === label);
  await update(() => button('载入虚构示例').click());
  expect(container.querySelector('[name="summary"]').value).toBe(examples.cn.summary);
  await update(() => button('English').click());
  expect(container.querySelector('[name="summary"]').value).toBe(examples.cn.summary);
  expect(container.textContent).toContain('Prepare for your next counselling session');
  await update(() => button('Load fictional example').click());
  expect(document.querySelector('[role="dialog"]')).toBeTruthy();
  await update(() => button('Cancel').click());
  expect(container.querySelector('[name="summary"]').value).toBe(examples.cn.summary);
  await update(() => button('Clear practice').click());
  await update(() => button('Confirm').click());
  expect(container.querySelector('[name="summary"]').value).toBe('');
  await update(() => button('华文').click());
  expect(container.textContent).toContain('辅导个案练习');
  expect(fetch).not.toHaveBeenCalled();
});

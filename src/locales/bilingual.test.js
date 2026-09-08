/* eslint-env jest */
/* eslint-disable react/prop-types */
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { TablePagination } from '@mui/material';
import i18n from './i18n';
import messages from './messages.json';
import { normalizeLanguage } from './config-lang';
import { domainLabel } from './domainLabels';
import { tr, useUiLanguage } from './translate';
import { uiMessage } from './uiMessage';
import ThemeLocalization from './ThemeLocalization';
import LanguagePopover from '../layouts/dashboard/header/LanguagePopover';
import CaseCreateForm from '../sections/@dashboard/counselling/cases/create/CaseCreateForm';
import PendingFollowUp from '../sections/@dashboard/counselling/cases/list/PendingFollowUp';
import { CASE_CATEGORIES, SESSION_MODES } from '../sections/@dashboard/counselling/cases/create/constants';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let mockFormMethods;
jest.mock('../components/snackbar', () => ({ useSnackbar: () => ({ enqueueSnackbar: jest.fn() }) }));
jest.mock('../components/hook-form/RHFTextField', () => ({ name, label }) => {
  mockFormMethods = jest.requireActual('react-hook-form').useFormContext();
  return <input aria-label={label} {...mockFormMethods.register(name)} />;
});
function Probe() { useUiLanguage(); return <span>{tr('Save Case')}</span>; }

describe('bilingual UI', () => {
  let container;
  let root;
  beforeEach(async () => {
    await i18n.changeLanguage('cn');
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });
  afterEach(() => { act(() => root.unmount()); container.remove(); jest.restoreAllMocks(); });

  test('defaults and legacy language values normalize to supported languages', () => {
    expect(normalizeLanguage(null)).toBe('cn');
    expect(normalizeLanguage('fr')).toBe('cn');
    expect(normalizeLanguage('ar')).toBe('cn');
    expect(normalizeLanguage('zh-CN')).toBe('cn');
    expect(normalizeLanguage('en-US')).toBe('en');
  });
  test('switches without remounting, persists preference and synchronizes document language', async () => {
    await act(async () => root.render(<Probe />));
    expect(container.textContent).toBe('保存个案');
    await act(async () => i18n.changeLanguage('en'));
    expect(container.textContent).toBe('Save Case');
    expect(localStorage.getItem('i18nextLng')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    await act(async () => i18n.changeLanguage('cn'));
    expect(document.documentElement.lang).toBe('zh-CN');
  });
  test('storage failure does not prevent in-memory switching', async () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    await act(async () => root.render(<Probe />));
    await act(async () => i18n.changeLanguage('en'));
    expect(container.textContent).toBe('Save Case');
  });
  test('the visible language buttons switch MUI pagination as well as application text', async () => {
    await act(async () => root.render(
      <ThemeLocalization>
        <LanguagePopover />
        <Probe />
        <TablePagination component="div" count={20} rowsPerPage={10} page={0} onPageChange={() => {}} />
      </ThemeLocalization>
    ));
    expect(container.textContent).toContain('每页');
    await act(async () => container.querySelector('button[lang="en"]').click());
    expect(container.textContent).toContain('Rows per page');
    expect(container.textContent).toContain('Save Case');
    expect(localStorage.getItem('i18nextLng')).toBe('en');
  });
  test('all resource entries contain both languages and matching interpolation variables', () => {
    Object.entries(messages).forEach(([key, value]) => {
      expect(typeof value.cn).toBe('string');
      expect(typeof value.en).toBe('string');
      const vars = (text) => (text.match(/\{\{\w+\}\}/g) || []).sort();
      expect({ key, vars: vars(value.cn) }).toEqual({ key, vars: vars(value.en) });
    });
  });
  test('domain labels change while the persisted values stay fixed', async () => {
    const categories = [...CASE_CATEGORIES];
    const modes = [...SESSION_MODES];
    expect(domainLabel('面谈')).toBe('面谈');
    await i18n.changeLanguage('en');
    expect(domainLabel('面谈')).toBe('Face-to-face');
    expect(CASE_CATEGORIES).toEqual(categories);
    expect(SESSION_MODES).toEqual(modes);
    expect(domainLabel('自定义类别')).toBe('自定义类别');
    expect(domainLabel('Save Case')).toBe('Save Case');
    expect(uiMessage('请输入提交编号')).toBe('Please enter the Submission ID');
  });
  test('changing language preserves an unsaved case and its stable category values', async () => {
    await act(async () => root.render(<MemoryRouter><CaseCreateForm /></MemoryRouter>));
    await act(async () => {
      mockFormMethods.setValue('clientInitials', '保留这个原文');
      mockFormMethods.setValue('caseCategory', '家庭');
      mockFormMethods.setValue('sessionMode', '面谈');
    });
    await act(async () => i18n.changeLanguage('en'));
    expect(mockFormMethods.getValues('clientInitials')).toBe('保留这个原文');
    expect(mockFormMethods.getValues('caseCategory')).toBe('家庭');
    expect(mockFormMethods.getValues('sessionMode')).toBe('面谈');
    expect(container.textContent).toContain('Save Case');
  });
  test('existing validation errors change language without resetting the form', async () => {
    await act(async () => root.render(<MemoryRouter><CaseCreateForm /></MemoryRouter>));
    await act(async () => { await mockFormMethods.trigger('submissionId'); });
    expect(mockFormMethods.formState.errors.submissionId.message).toBe('请输入提交编号');
    await act(async () => i18n.changeLanguage('en'));
    expect(mockFormMethods.formState.errors.submissionId.message).toBe('Please enter the Submission ID');
  });
  test('switching language does not reset an already sent reminder', async () => {
    const cases = [{ id: '1', initials: 'Original', counsellor: 'Counsellor Name', reminderStage: 'First Reminder', elapsedSinceEnd: '24h', sessionEndedAt: new Date('2026-01-01') }];
    await act(async () => root.render(<PendingFollowUp cases={cases} />));
    const button = Array.from(container.querySelectorAll('button')).find((item) => item.textContent.includes('发送提醒'));
    await act(async () => button.click());
    await act(async () => i18n.changeLanguage('en'));
    const sent = Array.from(container.querySelectorAll('button')).find((item) => item.textContent.includes('Sent'));
    expect(sent.disabled).toBe(true);
  });
});

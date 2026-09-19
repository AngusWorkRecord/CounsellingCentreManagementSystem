/* eslint-env jest */
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import LoveDesignTable from './LoveDesignTable';
import i18n from '../../locales/i18n';
import { STORAGE_KEY, initialTable, tableReducer, TABLE_WIDTH, TABLE_HEIGHT } from './tableState';
import { cards } from './data';
import { SettingsProvider, useSettingsContext } from '../../components/settings/SettingsContext';
import AppTheme from '../../theme';
import ThemeColorPresets from '../../components/settings/ThemeColorPresets';
import ThemeContrast from '../../components/settings/ThemeContrast';
import ThemeRtlLayout from '../../components/settings/ThemeRtlLayout';
import SettingsDrawer from '../../components/settings/drawer/SettingsDrawer';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let container;
let root;
let frames;
let nextFrame;
let settings;
function SettingsProbe() {
  settings = useSettingsContext();
  return null;
}
const saved = () => JSON.parse(localStorage.getItem(STORAGE_KEY));
const button = (text, scope = document) =>
  [...scope.querySelectorAll('button')].find((node) => node.textContent.trim() === text);
const click = async (node) => {
  expect(node).toBeTruthy();
  await act(async () => node.click());
};
const pile = () => container.querySelector('.ldt-pile');
const onTable = () => [...container.querySelectorAll('[data-card-id]')];
const select = async (deckId) =>
  click(container.querySelector(`.ldt-filters button[value="${deckId}"]`));
const changeLanguage = async (code) =>
  click(container.querySelector(`button[lang="${code === 'cn' ? 'zh-CN' : code}"]`));
function viewportMetrics(width = 1000, height = 700) {
  const viewport = container.querySelector('.ldt-viewport');
  Object.defineProperties(viewport, {
    clientWidth: { value: width, configurable: true },
    clientHeight: { value: height, configurable: true },
    scrollWidth: { value: TABLE_WIDTH, configurable: true },
    scrollHeight: { value: TABLE_HEIGHT, configurable: true },
  });
  viewport.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    right: width,
    bottom: height,
    width,
    height,
  });
  return viewport;
}
const mount = async () => {
  await act(async () =>
    root.render(
      <SettingsProvider>
        <AppTheme>
          <ThemeColorPresets>
            <ThemeContrast>
              <ThemeRtlLayout>
                <SettingsProbe />
                <LoveDesignTable />
              </ThemeRtlLayout>
            </ThemeContrast>
          </ThemeColorPresets>
        </AppTheme>
      </SettingsProvider>
    )
  );
  viewportMetrics();
};
const remount = async () => {
  await act(async () => root.unmount());
  root = createRoot(container);
  await mount();
};
const pointer = async (
  target,
  type,
  x,
  y,
  pointerType = 'mouse',
  pointerId = 1,
  modifiers = {}
) => {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    button: 0,
    ...modifiers,
  });
  Object.defineProperties(event, {
    pointerId: { value: pointerId },
    pointerType: { value: pointerType },
    isPrimary: { value: true },
  });
  const surface = target.matches('[data-card-id]')
    ? target.querySelector('.ldt-card-face')
    : target;
  await act(async () => surface.dispatchEvent(event));
};
const moveCard = async (card, pointerType = 'mouse') => {
  await pointer(card, 'pointerdown', 300, 250, pointerType);
  await pointer(card, 'pointermove', 437, 329, pointerType);
  await pointer(card, 'pointerup', 437, 329, pointerType);
};
beforeEach(async () => {
  jest.spyOn(Math, 'random').mockReturnValue(0);
  localStorage.clear();
  await i18n.changeLanguage('cn');
  frames = new Map();
  nextFrame = 0;
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    nextFrame += 1;
    frames.set(nextFrame, callback);
    return nextFrame;
  });
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => frames.delete(id));
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  jest.restoreAllMocks();
});

test('opens directly to a single table with only deck filters and table controls', async () => {
  await mount();
  expect(pile().textContent).toContain('54 张');
  expect(container.querySelectorAll('.ldt-filters button')).toHaveLength(4);
  expect(container.querySelectorAll('.ldt-table-actions button')).toHaveLength(3);
  expect(container.querySelector('input, textarea, [role="progressbar"]')).toBeNull();
  expect(container.textContent).not.toMatch(/开始探索|很重要|评分|核心价值|下一张|结果|我的回答/);
  expect(onTable()).toHaveLength(0);
});

test('random draw is the default, draws beyond the first card, and mode survives language, filters and refresh', async () => {
  await mount();
  expect(button('随机抽牌').getAttribute('aria-pressed')).toBe('true');
  const available = cards.filter((card) => card.deckId === 'love-value');
  Math.random.mockReturnValue(0.75);
  await click(pile());
  expect(saved().tableCards[0].cardId).toBe(available[Math.floor(available.length * 0.75)].id);
  const first = onTable()[0];
  await click(first.querySelector('.ldt-card-face'));
  const placed = saved().tableCards;
  await click(button('按顺序抽牌'));
  expect(saved().tableCards).toEqual(placed);
  expect(first.classList.contains('ldt-selected')).toBe(true);
  await changeLanguage('en');
  expect(button('Draw in order').getAttribute('aria-pressed')).toBe('true');
  await changeLanguage('cn');
  expect(button('按顺序抽牌').getAttribute('aria-pressed')).toBe('true');
  await select('action');
  expect(saved().drawMode).toBe('sequential');
  await click(pile());
  expect(saved().tableCards.at(-1).cardId).toBe(cards.find((card) => card.deckId === 'action').id);
  await remount();
  expect(button('按顺序抽牌').getAttribute('aria-pressed')).toBe('true');
  expect(saved().tableCards[0]).toEqual(placed[0]);
  await click(button('重置'));
  await click(button('确认'));
  expect(saved().drawMode).toBe('sequential');
});

test('mixes decks without changing existing cards and updates remaining counts', async () => {
  await mount();
  await click(pile());
  const first = saved().tableCards[0];
  expect(pile().textContent).toContain('53 张');
  await select('action');
  expect(pile().textContent).toContain('30 张');
  expect(saved().tableCards[0]).toEqual(first);
  await click(pile());
  await select('exploration');
  await click(pile());
  await select('all');
  expect(pile().textContent).toContain('105 张');
  expect(onTable()).toHaveLength(3);
  expect(saved().tableCards[0]).toEqual(first);
});

test.each(['mouse', 'touch'])(
  '%s drag changes free coordinates and saves after pointer release',
  async (pointerType) => {
    await mount();
    await click(pile());
    const before = saved().tableCards[0];
    const card = onTable()[0];
    await pointer(card, 'pointerdown', 300, 250, pointerType);
    await pointer(card, 'pointermove', 437, 329, pointerType);
    expect(parseFloat(card.style.left)).toBeCloseTo(before.x + 137);
    expect(saved().tableCards[0].x).toBe(before.x);
    await pointer(card, 'pointerup', 437, 329, pointerType);
    expect(saved().tableCards[0]).toEqual({ ...before, x: before.x + 137, y: before.y + 79 });
    expect(card.className).not.toContain('ldt-dragging');
    await remount();
    expect(parseFloat(onTable()[0].style.left)).toBeCloseTo(before.x + 137);
  }
);

test('drag accounts for scroll changes, and pointer cancellation restores the saved position', async () => {
  await mount();
  await click(pile());
  const viewport = viewportMetrics();
  const before = saved().tableCards[0];
  const card = onTable()[0];
  await pointer(card, 'pointerdown', 300, 250);
  viewport.scrollLeft = 120;
  viewport.scrollTop = 80;
  await pointer(card, 'pointermove', 350, 270);
  expect(parseFloat(card.style.left)).toBeCloseTo(before.x + 170);
  expect(parseFloat(card.style.top)).toBeCloseTo(before.y + 100);
  await pointer(card, 'pointercancel', 350, 270);
  expect(parseFloat(card.style.left)).toBe(before.x);
  expect(saved().tableCards[0]).toEqual(before);
  expect(frames.size).toBe(0);
});

test('dragging near an edge scrolls the workspace without a drop zone', async () => {
  await mount();
  await click(pile());
  const viewport = viewportMetrics();
  const card = onTable()[0];
  await pointer(card, 'pointerdown', 300, 250);
  await pointer(card, 'pointermove', 995, 680);
  const [frameId, callback] = [...frames.entries()][0];
  frames.delete(frameId);
  await act(async () => callback());
  expect(viewport.scrollLeft).toBeGreaterThan(0);
  expect(viewport.scrollTop).toBeGreaterThan(0);
  await pointer(card, 'pointerup', 995, 680);
  expect(frames.size).toBe(0);
});

test('blank tabletop supports mouse panning; drawing uses the visible scrolled area', async () => {
  await mount();
  await click(button('平移'));
  const workspace = container.querySelector('.ldt-workspace');
  const viewport = viewportMetrics();
  await pointer(workspace, 'pointerdown', 400, 300);
  await pointer(workspace, 'pointermove', 150, 100);
  await pointer(workspace, 'pointerup', 150, 100);
  expect(viewport.scrollLeft).toBe(250);
  expect(viewport.scrollTop).toBe(200);
  await click(pile());
  expect(saved().tableCards[0]).toMatchObject({ x: 640, y: 390 });
});

test('selection preserves layers and menu supports group front, back and confirmed return', async () => {
  await mount();
  await click(pile());
  await click(pile());
  const [first, second] = onTable();
  await moveCard(first);
  expect(Number(first.style.zIndex)).toBeLessThan(Number(second.style.zIndex));
  await click(first.querySelector('.ldt-card-footer button'));
  await click(
    [...document.querySelectorAll('[role="menuitem"]')].find(
      (node) => node.textContent === '整组置底'
    )
  );
  expect(Number(first.style.zIndex)).toBeLessThan(Number(second.style.zIndex));
  await click(first.querySelector('.ldt-card-footer button'));
  await click(
    [...document.querySelectorAll('[role="menuitem"]')].find(
      (node) => node.textContent === '整组置顶'
    )
  );
  expect(Number(first.style.zIndex)).toBeGreaterThan(Number(second.style.zIndex));
  await click(first.querySelector('.ldt-card-footer button'));
  await click(
    [...document.querySelectorAll('[role="menuitem"]')].find(
      (node) => node.textContent === '收回选中卡片'
    )
  );
  expect(onTable()).toHaveLength(2);
  await click(button('确认'));
  expect(onTable()).toHaveLength(1);
  expect(pile().textContent).toContain('53 张');
});

test('keyboard movement remains spatial and shuffle leaves all drawn cards unchanged', async () => {
  await mount();
  await click(pile());
  const card = onTable()[0];
  const initial = saved().tableCards[0];
  await act(async () =>
    card
      .querySelector('.ldt-card-face')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
  );
  expect(saved().tableCards[0].x).toBe(initial.x + 10);
  await act(async () =>
    card
      .querySelector('.ldt-card-face')
      .dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', shiftKey: true, bubbles: true })
      )
  );
  expect(saved().tableCards[0].y).toBe(initial.y + 40);
  const before = saved();
  jest.spyOn(Math, 'random').mockReturnValue(0);
  await click(button('洗牌'));
  expect(saved().tableCards).toEqual(before.tableCards);
  expect(saved().remainingOrder).not.toEqual(before.remainingOrder);
});

test('bilingual switching, menu and confirmation retain the same spatial table, then refresh restores it', async () => {
  await mount();
  await click(pile());
  await moveCard(onTable()[0]);
  await select('action');
  await click(pile());
  const before = saved();
  await changeLanguage('en');
  expect(container.textContent).toContain('Sincere / honest / faithful');
  expect(saved()).toEqual(before);
  await changeLanguage('cn');
  expect(saved()).toEqual(before);
  await click(onTable()[0].querySelector('.ldt-card-footer button'));
  await act(async () => i18n.changeLanguage('en'));
  expect(document.querySelector('[role="menu"]').textContent).toContain('Return selected cards');
  await click(
    [...document.querySelectorAll('[role="menuitem"]')].find(
      (node) => node.textContent === 'Bring group to front'
    )
  );
  await click(button('Return all'));
  await act(async () => i18n.changeLanguage('cn'));
  expect(document.querySelector('[role="dialog"]').textContent).toContain('全部收回？');
  await click(button('取消'));
  const latest = saved();
  await remount();
  expect(saved()).toEqual(latest);
  expect(onTable()).toHaveLength(2);
  expect(onTable()[0].style.left).toBe(`${latest.tableCards[0].x}px`);
});

test('return-all is confirmed; reset restores original library order and default filter', async () => {
  await mount();
  await click(pile());
  await select('action');
  await click(pile());
  await click(button('全部收回'));
  await click(button('取消'));
  expect(onTable()).toHaveLength(2);
  await click(button('全部收回'));
  await click(button('确认'));
  expect(onTable()).toHaveLength(0);
  expect(saved().selectedDeck).toBe('action');
  expect(saved().remainingOrder).toHaveLength(108);
  localStorage.setItem('unrelated', 'keep');
  await click(button('重置'));
  await click(button('确认'));
  expect(saved()).toEqual(initialTable());
  expect(localStorage.getItem('unrelated')).toBe('keep');
  expect(localStorage.getItem('i18nextLng')).toBe('cn');
});

test('an exhausted deck disables drawing while other filters remain available', async () => {
  let state = initialTable();
  cards
    .filter((card) => card.deckId === 'love-value')
    .forEach(() => {
      state = tableReducer(state, { type: 'DRAW', x: 400, y: 400, rotation: 0 });
    });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  await mount();
  expect(pile().disabled).toBe(true);
  expect(button('洗牌').disabled).toBe(true);
  await select('action');
  expect(pile().disabled).toBe(false);
  expect(onTable()).toHaveLength(54);
});

test('mobile viewport retains a large free workspace and supports touch movement', async () => {
  await mount();
  viewportMetrics(360, 600);
  await click(pile());
  expect(container.querySelector('.ldt-workspace').style.width).toBe('2400px');
  expect(saved().tableCards[0]).toMatchObject({ x: 70, y: 176 });
  await moveCard(onTable()[0], 'touch');
  expect(saved().tableCards[0]).toMatchObject({ x: 207, y: 255 });
});

test('storage errors allow continued use and invalid records recover without an activity flow', async () => {
  localStorage.setItem(STORAGE_KEY, '{broken');
  await mount();
  expect(container.textContent).toContain('保存的牌桌无法恢复');
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('quota');
  });
  await click(pile());
  expect(onTable()).toHaveLength(1);
  expect(container.textContent).toContain('浏览器无法保存牌桌');
});

const selectedElements = () => onTable().filter((card) => card.classList.contains('ldt-selected'));
const key = async (target, value, modifiers = {}) =>
  act(async () =>
    target.dispatchEvent(
      new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...modifiers })
    )
  );
const menuItem = (label) =>
  [...document.querySelectorAll('[role="menuitem"]')].find((node) => node.textContent === label);
function seedPositions(
  positions = [
    [300, 200],
    [320, 220],
    [850, 600],
  ]
) {
  let state = initialTable();
  positions.forEach(([x, y], i) => {
    state = tableReducer(state, { type: 'DRAW', x, y, rotation: i % 2 ? 3 : -3 });
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
async function marqueeDrag(start, end, pointerType = 'mouse', modifiers = {}) {
  const workspace = container.querySelector('.ldt-workspace');
  await pointer(workspace, 'pointerdown', ...start, pointerType, 1, modifiers);
  await pointer(workspace, 'pointermove', ...end, pointerType);
  await pointer(workspace, 'pointerup', ...end, pointerType);
}

test.each([
  [
    [250, 150],
    [580, 560],
  ],
  [
    [580, 560],
    [250, 150],
  ],
  [
    [250, 560],
    [580, 150],
  ],
  [
    [580, 150],
    [250, 560],
  ],
])('marquee selects intersecting and stacked cards in direction %j → %j', async (start, end) => {
  seedPositions();
  await mount();
  const before = saved();
  await marqueeDrag(start, end);
  expect(selectedElements()).toHaveLength(2);
  expect(container.querySelector('.ldt-marquee')).toBeNull();
  expect(saved()).toEqual(before);
});

test('selection supports append, modifier toggle, selected-card preservation, blank click and scoped select-all', async () => {
  seedPositions();
  await mount();
  await marqueeDrag([250, 150], [580, 560]);
  const [first, , third] = onTable();
  await pointer(first, 'pointerdown', 400, 250);
  await pointer(first, 'pointerup', 400, 250);
  expect(selectedElements()).toHaveLength(2);
  await marqueeDrag([800, 550], [950, 680], 'mouse', { shiftKey: true });
  expect(selectedElements()).toHaveLength(3);
  await pointer(first, 'pointerdown', 400, 250, 'mouse', 1, { ctrlKey: true });
  expect(selectedElements()).toHaveLength(2);
  await pointer(first, 'pointerdown', 400, 250, 'mouse', 1, { metaKey: true });
  expect(selectedElements()).toHaveLength(3);
  await key(viewportMetrics(), 'Escape');
  expect(selectedElements()).toHaveLength(0);
  await key(document.body, 'a', { ctrlKey: true });
  expect(selectedElements()).toHaveLength(0);
  await key(viewportMetrics(), 'a', { metaKey: true });
  expect(selectedElements()).toHaveLength(3);
  await marqueeDrag([100, 100], [100, 100]);
  expect(selectedElements()).toHaveLength(0);
  await pointer(third, 'pointerdown', 900, 650);
  await pointer(third, 'pointerup', 900, 650);
  expect(selectedElements()).toEqual([third]);
  await select('action');
  expect(selectedElements()).toEqual([third]);
  await key(container.querySelector('.ldt-filters button[value="action"]'), 'Escape');
  expect(selectedElements()).toHaveLength(0);
});

test.each(['mouse', 'touch'])(
  '%s group dragging saves once, preserves offsets and cancels on Escape',
  async (pointerType) => {
    seedPositions();
    await mount();
    await marqueeDrag([250, 150], [580, 560], pointerType);
    const before = saved();
    const storage = jest.spyOn(Storage.prototype, 'setItem');
    const [first, second] = onTable();
    await pointer(first, 'pointerdown', 400, 250, pointerType);
    await pointer(first, 'pointermove', 460, 290, pointerType);
    expect(parseFloat(second.style.left)).toBe(before.tableCards[1].x + 60);
    expect(saved()).toEqual(before);
    await key(first.querySelector('button'), 'Escape');
    expect(first.style.left).toBe(`${before.tableCards[0].x}px`);
    expect(selectedElements()).toHaveLength(2);
    expect(storage).not.toHaveBeenCalled();
    await pointer(first, 'pointerdown', 400, 250, pointerType);
    await pointer(first, 'pointermove', 460, 290, pointerType);
    await pointer(first, 'pointerup', 460, 290, pointerType);
    expect(storage).toHaveBeenCalledTimes(1);
    expect(saved().tableCards.slice(0, 2)).toEqual(
      before.tableCards.slice(0, 2).map((card) => ({ ...card, x: card.x + 60, y: card.y + 40 }))
    );
    expect(saved().tableCards[2]).toEqual(before.tableCards[2]);
    await remount();
    expect(selectedElements()).toHaveLength(0);
  }
);

test('marquee coordinates include scroll and cancellation restores previous selection', async () => {
  seedPositions();
  await mount();
  const viewport = viewportMetrics();
  viewport.scrollLeft = 200;
  viewport.scrollTop = 100;
  await marqueeDrag([50, 50], [380, 460]);
  expect(selectedElements()).toHaveLength(2);
  const workspace = container.querySelector('.ldt-workspace');
  await pointer(workspace, 'pointerdown', 600, 500);
  await pointer(workspace, 'pointermove', 900, 650);
  expect(selectedElements()).toHaveLength(1);
  await pointer(workspace, 'pointercancel', 900, 650);
  expect(selectedElements()).toHaveLength(2);
  expect(container.querySelector('.ldt-marquee')).toBeNull();
});

test('pan over cards moves the view; operation buttons work and pan cancellation restores scroll', async () => {
  seedPositions();
  await mount();
  await click(button('平移'));
  const viewport = viewportMetrics();
  const before = saved();
  const first = onTable()[0];
  await pointer(first, 'pointerdown', 400, 350, 'touch');
  await pointer(first, 'pointermove', 200, 150, 'touch');
  expect(viewport.scrollLeft).toBe(200);
  await pointer(first, 'pointercancel', 200, 150, 'touch');
  expect(viewport.scrollLeft).toBe(0);
  await pointer(first, 'pointerdown', 400, 350);
  await pointer(first, 'pointerup', 200, 150);
  expect(viewport.scrollLeft).toBe(200);
  expect(saved()).toEqual(before);
  await click(first.querySelector('[data-card-menu]'));
  expect(document.querySelector('[role="menu"]')).toBeTruthy();
  expect(selectedElements()).toEqual([first]);
});

test('coarse pointer defaults to pan and explicit selection tool persists through language changes', async () => {
  const original = window.matchMedia;
  window.matchMedia = jest.fn((query) => ({
    matches: query === '(pointer: coarse)',
    addListener() {},
    removeListener() {},
  }));
  try {
    await mount();
    expect(button('平移').getAttribute('aria-pressed')).toBe('true');
    await click(button('选择'));
    await changeLanguage('en');
    expect(
      container.querySelector('.ldt-tools button[value="select"]').getAttribute('aria-pressed')
    ).toBe('true');
  } finally {
    window.matchMedia = original;
  }
});

test('context menu applies to current group; confirmed return clears only that group', async () => {
  seedPositions();
  await mount();
  await marqueeDrag([250, 150], [580, 560]);
  const before = saved();
  await act(async () =>
    onTable()[0]
      .querySelector('button')
      .dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, clientX: 450, clientY: 300 }))
  );
  expect(selectedElements()).toHaveLength(2);
  await click(menuItem('整组置顶'));
  expect(saved().tableCards.map((card) => card.zIndex)).toEqual([2, 3, 1]);
  await click(button('选中卡片操作'));
  await click(menuItem('横排'));
  expect(saved().tableCards[2]).toEqual({ ...before.tableCards[2], zIndex: 1 });
  await click(button('选中卡片操作'));
  await click(menuItem('收回选中卡片'));
  expect(document.querySelector('[role="dialog"]').textContent).toContain('2 张');
  await act(async () => i18n.changeLanguage('en'));
  expect(document.querySelector('[role="dialog"]').textContent).toContain('2 selected cards');
  expect(selectedElements()).toHaveLength(2);
  await click(button('Confirm'));
  expect(onTable()).toHaveLength(1);
  expect(selectedElements()).toHaveLength(0);
  expect(saved().tableCards[0].cardId).toBe(before.tableCards[2].cardId);
  await remount();
  expect(onTable()).toHaveLength(1);
});

test('impossible arrangement is disabled with a bilingual reason', async () => {
  seedPositions(Array.from({ length: 54 }, () => [300, 300]));
  await mount();
  await key(viewportMetrics(), 'a', { ctrlKey: true });
  await click(button('选中卡片操作'));
  const grid = [...document.querySelectorAll('[role="menuitem"]')].find((node) =>
    node.textContent.startsWith('网格排列')
  );
  expect(grid.getAttribute('aria-disabled')).toBe('true');
  expect(grid.textContent).toContain('牌桌空间不足');
  await act(async () => i18n.changeLanguage('en'));
  expect(document.querySelector('[role="menu"]').textContent).toContain('Not enough table space');
});

test('global appearance, RTL, stretch, language and viewport changes preserve the live table and selection', async () => {
  seedPositions();
  await mount();
  await marqueeDrag([250, 150], [580, 560]);
  await select('action');
  const before = saved();
  const first = onTable()[0];
  const page = container.querySelector('.love-table');
  const lightBg = page.style.getPropertyValue('--ldt-bg');
  await act(async () => settings.onChangeMode({ target: { value: 'dark' } }));
  expect(page.style.getPropertyValue('--ldt-bg')).not.toBe(lightBg);
  const options = [...settings.presetsOption];
  await options.reduce(async (previous, option) => {
    await previous;
    await act(async () => settings.onChangeColorPresets({ target: { value: option.name } }));
    expect(page.style.getPropertyValue('--ldt-primary')).toBe(option.value);
  }, Promise.resolve());
  const border = page.style.getPropertyValue('--ldt-border');
  await act(async () => settings.onChangeContrast({ target: { value: 'bold' } }));
  expect(page.style.getPropertyValue('--ldt-border')).not.toBe(border);
  await act(async () => settings.onChangeDirection({ target: { value: 'rtl' } }));
  expect(page.dir).toBe('rtl');
  expect(viewportMetrics().dir).toBe('ltr');
  expect(first.dir).toBe('rtl');
  const fixedClass = page.className;
  await act(async () => settings.onToggleStretch());
  expect(page.className).not.toBe(fixedClass);
  viewportMetrics(1800, 900);
  await act(async () => {
    window.dispatchEvent(new Event('resize'));
    document.dispatchEvent(new Event('fullscreenchange'));
  });
  await changeLanguage('en');
  await changeLanguage('cn');
  expect(onTable()[0]).toBe(first);
  expect(selectedElements()).toHaveLength(2);
  expect(saved()).toEqual(before);
  await remount();
  expect(saved()).toEqual(before);
  expect(settings.themeMode).toBe('dark');
  expect(settings.themeDirection).toBe('rtl');
  expect(settings.themeStretch).toBe(true);
  expect(selectedElements()).toHaveLength(0);
  await act(async () => settings.onResetSetting());
  expect(container.querySelector('.love-table').dir).toBe('ltr');
  expect(saved()).toEqual(before);
});

test.each(['/love-design', '/dashboard/app'])(
  'existing settings drawer hides layout only on the standalone table: %s',
  async (path) => {
    await act(async () =>
      root.render(
        <SettingsProvider>
          <MemoryRouter
            initialEntries={[path]}
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <AppTheme>
              <SettingsDrawer />
            </AppTheme>
          </MemoryRouter>
        </SettingsProvider>
      )
    );
    await click(container.querySelector('button'));
    const drawer = document.querySelector('.MuiDrawer-paper');
    expect(drawer).toBeTruthy();
    expect(drawer.textContent.includes('布局')).toBe(path !== '/love-design');
    expect(drawer.textContent).toContain('对比度');
  }
);

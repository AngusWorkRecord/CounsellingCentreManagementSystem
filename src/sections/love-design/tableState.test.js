/* eslint-env jest */
import { cards, cardById, decks, deckFilters } from './data';
import {
  initialTable,
  activeDeck,
  tableReducer,
  shuffled,
  validateTable,
  constrainPosition,
  readTable,
  saveTable,
  STORAGE_KEY,
  TABLE_WIDTH,
  TABLE_HEIGHT,
  CARD_WIDTH,
  CARD_HEIGHT,
} from './tableState';
import messages from '../../locales/messages.json';
import { cardBounds, groupBounds, hitCards, rectangleBetween, layoutCards } from './tableGeometry';

const send = (state, type, action = {}) => tableReducer(state, { type, ...action });
const draw = (state, x = 420, y = 260) => send(state, 'DRAW', { x, y, rotation: -1.5 });

test.each(['love-value', 'action', 'exploration', 'all'])(
  'random draws use only remaining %s cards without repetition',
  (deckId) => {
    let state = send(initialTable(), 'FILTER', { deckId });
    const initialIds = activeDeck(state);
    for (let i = 0; i < initialIds.length; i += 1) {
      const available = activeDeck(state);
      const expected = available[Math.floor(0.75 * available.length)];
      state = send(state, 'DRAW', { randomValue: 0.75, x: 400, y: 400, rotation: 0 });
      expect(state.tableCards.at(-1).cardId).toBe(expected);
    }
    expect(new Set(state.tableCards.map((card) => card.cardId))).toEqual(new Set(initialIds));
    expect(validateTable(state)).toBe(true);
    expect(send(state, 'DRAW', { randomValue: 0.75, x: 400, y: 400, rotation: 0 })).toBe(state);
  }
);

test('draw mode changes preserve table and pile; sequential mode follows current pile order', () => {
  let state = draw(initialTable());
  const before = state;
  state = send(state, 'DRAW_MODE', { mode: 'sequential' });
  expect(state.tableCards).toBe(before.tableCards);
  expect(state.remainingOrder).toBe(before.remainingOrder);
  const next = activeDeck(state)[0];
  state = send(state, 'DRAW', { randomValue: 0.999, x: 400, y: 400, rotation: 0 });
  expect(state.tableCards.at(-1).cardId).toBe(next);
  expect(send(state, 'RESET').drawMode).toBe('sequential');
  expect(send(state, 'DRAW_MODE', { mode: 'invalid' })).toBe(state);
});

test('legacy tables gain random mode without losing positions; invalid draw preferences are rejected', () => {
  const legacy = draw(initialTable());
  delete legacy.drawMode;
  const restored = readTable({ getItem: () => JSON.stringify(legacy) });
  expect(restored).toEqual({ state: { ...legacy, drawMode: 'random' }, issue: null });
  expect(validateTable({ ...legacy, drawMode: 'invalid' })).toBe(false);
  [-1, 1, Infinity, NaN].forEach((randomValue) => {
    expect(send(restored.state, 'DRAW', { randomValue, x: 400, y: 400, rotation: 0 })).toBe(
      restored.state
    );
  });
});

test('keeps 108 original cards and bilingual library text', () => {
  expect(cards).toHaveLength(108);
  expect(new Set(cards.map((card) => card.id)).size).toBe(108);
  expect(deckFilters.map((deck) => deck.count)).toEqual([54, 30, 24, 108]);
  cards.forEach((card) => {
    expect(card).not.toHaveProperty('x');
    expect(messages[card.text].cn).toBe(card.text);
    expect(messages[card.text].en).toBeTruthy();
  });
  decks
    .flatMap((deck) => deck.categories)
    .forEach((category) => {
      expect(messages[category.name].cn).toBe(category.name);
      expect(messages[category.name].en).toBeTruthy();
    });
});

test.each(['love-value', 'action', 'exploration', 'all'])(
  'draws only active %s cards and exhausts without duplicates',
  (deckId) => {
    let state = send(initialTable(), 'FILTER', { deckId });
    const count = activeDeck(state).length;
    for (let i = 0; i < count; i += 1) state = draw(state);
    expect(state.tableCards).toHaveLength(count);
    expect(new Set(state.tableCards.map((card) => card.cardId)).size).toBe(count);
    expect(activeDeck(state)).toEqual([]);
    expect(draw(state)).toBe(state);
    expect(validateTable(state)).toBe(true);
    if (deckId !== 'all')
      expect(state.tableCards.every((card) => cardById[card.cardId].deckId === deckId)).toBe(true);
  }
);

test('switching filters preserves positions, rotation and stacking across decks', () => {
  let state = draw(initialTable(), 507.25, 689.75);
  const first = state.tableCards[0];
  state = send(state, 'FILTER', { deckId: 'action' });
  expect(state.tableCards[0]).toEqual(first);
  expect(activeDeck(state)).toHaveLength(30);
  state = draw(state, first.x, first.y);
  expect(state.tableCards[1]).toMatchObject({ x: first.x, y: first.y });
  expect(state.tableCards[0]).toEqual(first);
  state = send(state, 'FILTER', { deckId: 'all' });
  expect(activeDeck(state)).toHaveLength(106);
  expect(validateTable(state)).toBe(true);
});

test('shuffle affects only remaining active cards, never table cards or other deck order', () => {
  let state = draw(initialTable());
  const tableBefore = state.tableCards;
  const otherBefore = state.remainingOrder.filter((id) => cardById[id].deckId !== 'love-value');
  const order = shuffled(activeDeck(state), () => 0);
  expect(order).not.toEqual(activeDeck(state));
  state = send(state, 'SHUFFLE', { order });
  expect(activeDeck(state)).toEqual(order);
  expect(state.tableCards).toBe(tableBefore);
  expect(state.remainingOrder.filter((id) => cardById[id].deckId !== 'love-value')).toEqual(
    otherBefore
  );
  expect(send(state, 'SHUFFLE', { order: [order[0], order[0]] })).toBe(state);
  expect(validateTable(state)).toBe(true);
});

test('free movement preserves fractional coordinates and permits exact overlap', () => {
  let state = draw(draw(initialTable()));
  const [first, second] = state.tableCards;
  state = send(state, 'MOVE', { cardId: first.cardId, x: 728.31, y: 477.84 });
  expect(state.tableCards[0]).toMatchObject({ x: 728.31, y: 477.84, rotation: -1.5 });
  state = send(state, 'MOVE', { cardId: second.cardId, x: 728.31, y: 477.84 });
  expect(state.tableCards[1]).toMatchObject({ x: 728.31, y: 477.84 });
  expect(validateTable(state)).toBe(true);
});

test('front and back change only z order and preserve it after returning a card', () => {
  let state = draw(draw(draw(initialTable())));
  const [first, second, third] = state.tableCards;
  state = send(state, 'FRONT', { cardId: first.cardId });
  expect(state.tableCards.find((card) => card.cardId === first.cardId).zIndex).toBe(3);
  state = send(state, 'BACK', { cardId: first.cardId });
  expect(state.tableCards.find((card) => card.cardId === first.cardId)).toEqual({
    ...first,
    zIndex: 1,
  });
  state = send(state, 'RETURN', { cardId: second.cardId });
  state = send(state, 'FRONT', { cardId: first.cardId });
  expect(state.tableCards.find((card) => card.cardId === third.cardId).zIndex).toBe(1);
  expect(validateTable(state)).toBe(true);
});

test('return and collect restore cards to their own decks without duplication', () => {
  let state = draw(initialTable());
  const firstId = state.tableCards[0].cardId;
  state = draw(send(state, 'FILTER', { deckId: 'action' }));
  state = send(state, 'RETURN', { cardId: firstId });
  expect(activeDeck(state)).toHaveLength(29);
  expect(state.remainingOrder.at(-1)).toBe(firstId);
  expect(send(state, 'RETURN', { cardId: firstId })).toBe(state);
  state = send(state, 'COLLECT');
  expect(state.tableCards).toEqual([]);
  expect(activeDeck(state)).toHaveLength(30);
  expect(state.remainingOrder).toHaveLength(108);
  expect(validateTable(state)).toBe(true);
});

test('reset restores the original order and filter without altering the card library', () => {
  const before = JSON.stringify(cards);
  let state = draw(send(initialTable(), 'FILTER', { deckId: 'all' }));
  state = send(state, 'SHUFFLE', { order: [...activeDeck(state)].reverse() });
  expect(send(state, 'RESET')).toEqual(initialTable());
  expect(JSON.stringify(cards)).toBe(before);
});

test('workspace bounds include rotated corners; invalid positions are rejected', () => {
  const left = constrainPosition(-1000, -1000, 3);
  const right = constrainPosition(10000, 10000, -3);
  expect(left.x).toBeGreaterThan(0);
  expect(left.y).toBeGreaterThan(0);
  expect(right.x).toBeLessThan(TABLE_WIDTH - CARD_WIDTH);
  expect(right.y).toBeLessThan(TABLE_HEIGHT - CARD_HEIGHT);
  const state = draw(initialTable());
  expect(send(state, 'MOVE', { cardId: state.tableCards[0].cardId, x: Infinity, y: 10 })).toBe(
    state
  );
});

test('save and reload preserve the full table including shuffled deck order and layers', () => {
  let state = draw(draw(initialTable()));
  state = send(state, 'FRONT', { cardId: state.tableCards[0].cardId });
  state = send(state, 'FILTER', { deckId: 'all' });
  state = send(state, 'SHUFFLE', { order: [...activeDeck(state)].reverse() });
  expect(saveTable(localStorage, state)).toBe(true);
  expect(readTable(localStorage)).toEqual({ state, issue: null });
});

test('corrupt or incompatible records recover to an empty table; storage failure is nonfatal', () => {
  expect(readTable({ getItem: () => '{broken' })).toEqual({
    state: initialTable(),
    issue: 'invalid',
  });
  expect(readTable({ getItem: () => JSON.stringify({ version: 999 }) }).issue).toBe('invalid');
  const failed = {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('quota');
    },
  };
  expect(readTable(failed).issue).toBe('storage');
  expect(saveTable(failed, initialTable())).toBe(false);
});

test.each([
  (s) => ({ ...s, remainingOrder: s.remainingOrder.slice(1) }),
  (s) => ({ ...s, remainingOrder: [...s.remainingOrder, s.tableCards[0].cardId] }),
  (s) => ({ ...s, remainingOrder: ['missing', ...s.remainingOrder.slice(1)] }),
  (s) => ({ ...s, selectedDeck: 'unknown' }),
  (s) => ({ ...s, tableCards: [{ ...s.tableCards[0], x: -500 }] }),
  (s) => ({ ...s, tableCards: [{ ...s.tableCards[0], rotation: 12 }] }),
  (s) => ({ ...s, tableCards: [{ ...s.tableCards[0], zIndex: 0 }] }),
  (s) => ({ ...s, tableCards: [null] }),
])('rejects invalid tabletop records', (change) => {
  const state = change(draw(initialTable()));
  expect(validateTable(state)).toBe(false);
});

test('legacy assessment records and unrelated storage are not used or cleared', () => {
  localStorage.clear();
  localStorage.setItem('love-design-progress', JSON.stringify({ currentStep: 'result' }));
  localStorage.setItem('i18nextLng', 'en');
  expect(readTable(localStorage).state).toEqual(initialTable());
  saveTable(localStorage, initialTable());
  expect(localStorage.getItem('i18nextLng')).toBe('en');
  expect(localStorage.getItem('love-design-progress')).toBeTruthy();
  expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
});

function sampleTable(count = 4) {
  let state = initialTable();
  for (let i = 0; i < count; i += 1)
    state = send(state, 'DRAW', { x: 300 + i * 13, y: 200 + i * 17, rotation: (i % 3) * 3 - 3 });
  return state;
}

test.each([
  [0, 0, 900, 900],
  [900, 900, 0, 0],
  [0, 900, 900, 0],
  [900, 0, 0, 900],
])('marquee normalizes every drag direction and includes covered cards: %j', (x, y, endX, endY) => {
  const state = sampleTable();
  expect(hitCards(state.tableCards, rectangleBetween({ x, y }, { x: endX, y: endY }))).toEqual(
    state.tableCards.map((card) => card.cardId)
  );
});

test('marquee includes partial intersections with rotated outer corners', () => {
  const card = sampleTable(1).tableCards[0];
  const b = cardBounds(card);
  expect(
    hitCards([card], { left: b.left - 1, right: b.left + 1, top: b.top - 1, bottom: b.top + 1 })
  ).toEqual([card.cardId]);
  expect(
    hitCards([card], { left: b.left - 3, right: b.left - 1, top: b.top - 3, bottom: b.top - 1 })
  ).toEqual([]);
});

test.each([
  [-10000, -10000],
  [10000, 10000],
])(
  'group movement clamps one shared delta and keeps all relative positions and layers',
  (dx, dy) => {
    const state = sampleTable();
    const cardIds = state.tableCards.slice(0, 3).map((card) => card.cardId);
    const next = send(state, 'MOVE_MANY', { cardIds, dx, dy });
    const delta = {
      x: next.tableCards[0].x - state.tableCards[0].x,
      y: next.tableCards[0].y - state.tableCards[0].y,
    };
    next.tableCards.slice(0, 3).forEach((card, i) => {
      expect(card.x - state.tableCards[i].x).toBeCloseTo(delta.x);
      expect(card.y - state.tableCards[i].y).toBeCloseTo(delta.y);
      expect(card.rotation).toBe(state.tableCards[i].rotation);
      expect(card.zIndex).toBe(state.tableCards[i].zIndex);
    });
    expect(next.tableCards[3]).toBe(state.tableCards[3]);
    expect(validateTable(next)).toBe(true);
    expect(readTable({ getItem: () => JSON.stringify(next) }).state).toEqual(next);
  }
);

test('batch layers preserve group order and batch return ignores duplicates and unknown IDs', () => {
  const state = sampleTable();
  const cardIds = [state.tableCards[2].cardId, state.tableCards[0].cardId];
  const front = send(state, 'FRONT_MANY', { cardIds });
  expect(front.tableCards.map((card) => card.zIndex)).toEqual([3, 1, 4, 2]);
  const back = send(front, 'BACK_MANY', { cardIds });
  expect(back.tableCards.map((card) => card.zIndex)).toEqual([1, 3, 2, 4]);
  const returned = send(back, 'RETURN_MANY', { cardIds: [...cardIds, cardIds[0], 'missing'] });
  expect(returned.tableCards).toEqual([back.tableCards[1], back.tableCards[3]]);
  expect(validateTable(returned)).toBe(true);
  expect(send(returned, 'RETURN_MANY', { cardIds })).toBe(returned);
});

test.each(['left', 'right', 'top', 'bottom', 'center-x', 'center-y'])(
  'alignment %s uses visual selection bounds and preserves angles',
  (layout) => {
    const state = sampleTable();
    const group = state.tableCards.slice(0, 3);
    const b = groupBounds(group);
    const next = send(state, 'LAYOUT', { cardIds: group.map((card) => card.cardId), layout });
    next.tableCards.slice(0, 3).forEach((card, i) => {
      const bounds = cardBounds(card);
      if (layout === 'center-x')
        expect((bounds.left + bounds.right) / 2).toBeCloseTo((b.left + b.right) / 2);
      else if (layout === 'center-y')
        expect((bounds.top + bounds.bottom) / 2).toBeCloseTo((b.top + b.bottom) / 2);
      else expect(bounds[layout]).toBeCloseTo(b[layout]);
      expect(card.rotation).toBe(group[i].rotation);
      expect(card.zIndex).toBe(group[i].zIndex);
    });
    expect(next.tableCards[3]).toBe(state.tableCards[3]);
    expect(validateTable(next)).toBe(true);
  }
);

test.each(['row', 'column', 'grid'])(
  '%s arrangement is spatially sorted, bounded and has no rotated overlap',
  (mode) => {
    const group = sampleTable().tableCards.map((card, i) => ({
      ...card,
      x: 1800 + (3 - i) * 10,
      y: 1000 + (3 - i) * 10,
    }));
    const result = layoutCards(group, mode);
    expect(result.map((card) => card.cardId)).toEqual(
      [...group].reverse().map((card) => card.cardId)
    );
    result.forEach((card, i) => {
      const b = cardBounds(card);
      expect(b.left).toBeGreaterThanOrEqual(-0.001);
      expect(b.top).toBeGreaterThanOrEqual(-0.001);
      expect(b.right).toBeLessThanOrEqual(TABLE_WIDTH + 0.001);
      expect(b.bottom).toBeLessThanOrEqual(TABLE_HEIGHT + 0.001);
      result.slice(i + 1).forEach((other) => {
        const a = cardBounds(other);
        expect(
          Math.max(a.left - b.right, b.left - a.right, a.top - b.bottom, b.top - a.bottom)
        ).toBeGreaterThanOrEqual(15.999);
      });
    });
  }
);

test('grid adjusts to the closest fitting column count; impossible arrangements are rejected', () => {
  const group = sampleTable(25).tableCards;
  const result = layoutCards(group, 'grid');
  expect(new Set(result.map((card) => Math.round(cardBounds(card).left))).size).toBe(7);
  expect(layoutCards(group, 'row')).toBeNull();
  expect(layoutCards(group, 'column')).toBeNull();
  const state = sampleTable(54);
  expect(layoutCards(state.tableCards, 'grid')).toBeNull();
  expect(
    send(state, 'LAYOUT', { cardIds: state.tableCards.map((card) => card.cardId), layout: 'grid' })
  ).toBe(state);
});

test('equal-position arrangement uses stable ID ordering regardless of selection order', () => {
  const group = sampleTable().tableCards.map((card) => ({ ...card, x: 200, y: 200 }));
  expect(layoutCards(group, 'grid')).toEqual(layoutCards([...group].reverse(), 'grid'));
});

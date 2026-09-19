import { cards, cardById, deckFilters } from './data';
import {
  TABLE_WIDTH,
  TABLE_HEIGHT,
  CARD_WIDTH,
  CARD_HEIGHT,
  groupDelta,
  layoutCards,
} from './tableGeometry';

export { TABLE_WIDTH, TABLE_HEIGHT, CARD_WIDTH, CARD_HEIGHT } from './tableGeometry';

export const STORAGE_KEY = 'love-design-table';
export const VERSION = 1;
const filters = new Set(deckFilters.map((deck) => deck.id));
const ids = cards.map((card) => card.id);
const libraryIds = new Set(ids);

export function initialTable() {
  return {
    version: VERSION,
    selectedDeck: 'love-value',
    drawMode: 'random',
    remainingOrder: [...ids],
    tableCards: [],
  };
}

export function activeDeck(state) {
  return state.remainingOrder.filter(
    (id) => state.selectedDeck === 'all' || cardById[id].deckId === state.selectedDeck
  );
}

export function shuffled(order, random = Math.random) {
  const result = [...order];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Include the rotated corners in the workspace bounds, without snapping or grouping.
export function constrainPosition(x, y, rotation = 0) {
  const radians = (Math.abs(rotation) * Math.PI) / 180;
  const marginX = Math.max(
    0,
    (CARD_WIDTH * Math.cos(radians) + CARD_HEIGHT * Math.sin(radians) - CARD_WIDTH) / 2
  );
  const marginY = Math.max(
    0,
    (CARD_HEIGHT * Math.cos(radians) + CARD_WIDTH * Math.sin(radians) - CARD_HEIGHT) / 2
  );
  return {
    x: Math.max(marginX, Math.min(TABLE_WIDTH - CARD_WIDTH - marginX, x)),
    y: Math.max(marginY, Math.min(TABLE_HEIGHT - CARD_HEIGHT - marginY, y)),
  };
}

function reorder(tableCards, cardIds, front) {
  const ordered = [...tableCards].sort((a, b) => a.zIndex - b.zIndex);
  const selected = new Set(cardIds);
  const group = ordered.filter((item) => selected.has(item.cardId));
  if (!group.length) return tableCards;
  const rest = ordered.filter((item) => !selected.has(item.cardId));
  const next = front ? [...rest, ...group] : [...group, ...rest];
  const ranks = new Map(next.map((item, index) => [item.cardId, index + 1]));
  return tableCards.map((item) => ({ ...item, zIndex: ranks.get(item.cardId) }));
}

export function tableReducer(state, action) {
  switch (action.type) {
    case 'FILTER':
      return filters.has(action.deckId) ? { ...state, selectedDeck: action.deckId } : state;
    case 'DRAW_MODE':
      return ['random', 'sequential'].includes(action.mode)
        ? { ...state, drawMode: action.mode }
        : state;
    case 'DRAW': {
      // Supply randomness in the action so reducer replays remain deterministic.
      const randomValue = action.randomValue ?? 0;
      if (!Number.isFinite(randomValue) || randomValue < 0 || randomValue >= 1) return state;
      const available = activeDeck(state);
      const index =
        state.drawMode === 'sequential' ? 0 : Math.floor(randomValue * available.length);
      const cardId = available[index];
      if (!cardId || ![action.x, action.y, action.rotation].every(Number.isFinite)) return state;
      const rotation = Math.max(-3, Math.min(3, action.rotation));
      return {
        ...state,
        remainingOrder: state.remainingOrder.filter((id) => id !== cardId),
        tableCards: [
          ...state.tableCards,
          {
            cardId,
            ...constrainPosition(action.x, action.y, rotation),
            rotation,
            zIndex: Math.max(0, ...state.tableCards.map((card) => card.zIndex)) + 1,
          },
        ],
      };
    }
    case 'MOVE': {
      if (![action.x, action.y].every(Number.isFinite)) return state;
      return {
        ...state,
        tableCards: state.tableCards.map((card) =>
          card.cardId === action.cardId
            ? { ...card, ...constrainPosition(action.x, action.y, card.rotation) }
            : card
        ),
      };
    }
    case 'FRONT':
      return { ...state, tableCards: reorder(state.tableCards, [action.cardId], true) };
    case 'BACK':
      return { ...state, tableCards: reorder(state.tableCards, [action.cardId], false) };
    case 'MOVE_MANY':
    case 'FRONT_MANY':
    case 'BACK_MANY':
    case 'RETURN_MANY':
    case 'LAYOUT': {
      if (!Array.isArray(action.cardIds)) return state;
      const selected = new Set(action.cardIds);
      const group = state.tableCards.filter((card) => selected.has(card.cardId));
      if (!group.length) return state;
      if (action.type === 'RETURN_MANY')
        return {
          ...state,
          tableCards: state.tableCards.filter((card) => !selected.has(card.cardId)),
          remainingOrder: [...state.remainingOrder, ...group.map((card) => card.cardId)],
        };
      if (action.type === 'FRONT_MANY' || action.type === 'BACK_MANY')
        return {
          ...state,
          tableCards: reorder(state.tableCards, action.cardIds, action.type === 'FRONT_MANY'),
        };
      let next;
      if (action.type === 'MOVE_MANY') {
        if (![action.dx, action.dy].every(Number.isFinite)) return state;
        const { dx, dy } = groupDelta(group, action.dx, action.dy);
        next = group.map((card) => ({ ...card, x: card.x + dx, y: card.y + dy }));
      } else next = layoutCards(group, action.layout);
      if (!next) return state;
      const positions = new Map(next.map((card) => [card.cardId, card]));
      return {
        ...state,
        tableCards: state.tableCards.map((card) => positions.get(card.cardId) || card),
      };
    }
    case 'RETURN': {
      if (!state.tableCards.some((card) => card.cardId === action.cardId)) return state;
      return {
        ...state,
        remainingOrder: [...state.remainingOrder, action.cardId],
        tableCards: state.tableCards.filter((card) => card.cardId !== action.cardId),
      };
    }
    case 'COLLECT':
      return {
        ...state,
        remainingOrder: [...state.remainingOrder, ...state.tableCards.map((card) => card.cardId)],
        tableCards: [],
      };
    case 'SHUFFLE': {
      const active = activeDeck(state);
      if (
        !Array.isArray(action.order) ||
        action.order.length !== active.length ||
        new Set(action.order).size !== active.length ||
        action.order.some((id) => !active.includes(id))
      )
        return state;
      const included = new Set(active);
      let index = 0;
      return {
        ...state,
        remainingOrder: state.remainingOrder.map((id) => {
          if (!included.has(id)) return id;
          const nextId = action.order[index];
          index += 1;
          return nextId;
        }),
      };
    }
    case 'RESET':
      return { ...initialTable(), drawMode: state.drawMode || 'random' };
    default:
      return state;
  }
}

export function validateTable(state) {
  if (
    !state ||
    state.version !== VERSION ||
    (state.drawMode !== undefined && !['random', 'sequential'].includes(state.drawMode)) ||
    !filters.has(state.selectedDeck) ||
    !Array.isArray(state.remainingOrder) ||
    !Array.isArray(state.tableCards)
  )
    return false;
  if (
    !state.tableCards.every((card) => {
      if (
        !card ||
        !libraryIds.has(card.cardId) ||
        ![card.x, card.y, card.rotation].every(Number.isFinite) ||
        Math.abs(card.rotation) > 3 ||
        !Number.isSafeInteger(card.zIndex) ||
        card.zIndex < 1 ||
        card.zIndex > 10000
      )
        return false;
      const bounded = constrainPosition(card.x, card.y, card.rotation);
      return Math.abs(bounded.x - card.x) < 0.001 && Math.abs(bounded.y - card.y) < 0.001;
    })
  )
    return false;
  const allIds = [...state.remainingOrder, ...state.tableCards.map((card) => card.cardId)];
  return (
    allIds.length === ids.length &&
    new Set(allIds).size === ids.length &&
    allIds.every((id) => libraryIds.has(id)) &&
    new Set(state.tableCards.map((card) => card.zIndex)).size === state.tableCards.length
  );
}

export function readTable(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { state: initialTable(), issue: null };
    const state = JSON.parse(raw);
    return validateTable(state)
      ? { state: { ...state, drawMode: state.drawMode || 'random' }, issue: null }
      : { state: initialTable(), issue: 'invalid' };
  } catch (error) {
    return { state: initialTable(), issue: error instanceof SyntaxError ? 'invalid' : 'storage' };
  }
}

export function saveTable(storage, state) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

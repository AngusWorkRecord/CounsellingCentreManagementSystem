export const TABLE_WIDTH = 2400;
export const TABLE_HEIGHT = 1600;
export const CARD_WIDTH = 220;
export const CARD_HEIGHT = 320;
export const CARD_GAP = 16;

export function cardBounds(card) {
  const angle = (Math.abs(card.rotation) * Math.PI) / 180;
  const width = CARD_WIDTH * Math.cos(angle) + CARD_HEIGHT * Math.sin(angle);
  const height = CARD_HEIGHT * Math.cos(angle) + CARD_WIDTH * Math.sin(angle);
  const left = card.x + (CARD_WIDTH - width) / 2;
  const top = card.y + (CARD_HEIGHT - height) / 2;
  return { left, top, right: left + width, bottom: top + height, width, height };
}

export function groupBounds(cards) {
  if (!cards.length) return null;
  const bounds = cards.map(cardBounds);
  const left = Math.min(...bounds.map((b) => b.left));
  const top = Math.min(...bounds.map((b) => b.top));
  const right = Math.max(...bounds.map((b) => b.right));
  const bottom = Math.max(...bounds.map((b) => b.bottom));
  return { left, top, right, bottom, width: right - left, height: bottom - top };
}

export function rectangleBetween(a, b) {
  return {
    left: Math.min(a.x, b.x),
    top: Math.min(a.y, b.y),
    right: Math.max(a.x, b.x),
    bottom: Math.max(a.y, b.y),
  };
}

export function hitCards(cards, rectangle) {
  return cards
    .filter((card) => {
      const b = cardBounds(card);
      return (
        b.right >= rectangle.left &&
        b.left <= rectangle.right &&
        b.bottom >= rectangle.top &&
        b.top <= rectangle.bottom
      );
    })
    .map((card) => card.cardId);
}

export function groupDelta(cards, dx, dy) {
  const b = groupBounds(cards);
  if (!b) return { dx: 0, dy: 0 };
  return {
    dx: Math.max(-b.left, Math.min(TABLE_WIDTH - b.right, dx)),
    dy: Math.max(-b.top, Math.min(TABLE_HEIGHT - b.bottom, dy)),
  };
}

// Return a complete, bounded layout or null. No per-card clamping or resizing.
export function layoutCards(cards, mode) {
  if (!cards.length) return null;
  const group = groupBounds(cards);
  const alignment = ['left', 'right', 'top', 'bottom', 'center-x', 'center-y'];
  if (alignment.includes(mode)) {
    return cards.map((card) => {
      const b = cardBounds(card);
      let { x, y } = card;
      if (mode === 'left') x += group.left - b.left;
      if (mode === 'right') x += group.right - b.right;
      if (mode === 'top') y += group.top - b.top;
      if (mode === 'bottom') y += group.bottom - b.bottom;
      if (mode === 'center-x') x += (group.left + group.right - b.left - b.right) / 2;
      if (mode === 'center-y') y += (group.top + group.bottom - b.top - b.bottom) / 2;
      return { ...card, x, y };
    });
  }
  if (!['row', 'column', 'grid'].includes(mode)) return null;
  const ordered = [...cards].sort(
    (a, b) => a.y - b.y || a.x - b.x || a.cardId.localeCompare(b.cardId)
  );
  const bounds = ordered.map(cardBounds);
  const preferred = Math.ceil(Math.sqrt(cards.length));
  let columns = Array.from({ length: cards.length }, (_, i) => i + 1).sort(
    (a, b) => Math.abs(a - preferred) - Math.abs(b - preferred) || a - b
  );
  if (mode === 'row') columns = [cards.length];
  if (mode === 'column') columns = [1];
  for (let candidate = 0; candidate < columns.length; candidate += 1) {
    const count = columns[candidate];
    const widths = Array(count).fill(0);
    const heights = Array(Math.ceil(cards.length / count)).fill(0);
    bounds.forEach((b, i) => {
      widths[i % count] = Math.max(widths[i % count], b.width);
      heights[Math.floor(i / count)] = Math.max(heights[Math.floor(i / count)], b.height);
    });
    const width = widths.reduce((a, b) => a + b, 0) + (widths.length - 1) * CARD_GAP;
    const height = heights.reduce((a, b) => a + b, 0) + (heights.length - 1) * CARD_GAP;
    if (width <= TABLE_WIDTH && height <= TABLE_HEIGHT) {
      const left = Math.max(0, Math.min(group.left, TABLE_WIDTH - width));
      const top = Math.max(0, Math.min(group.top, TABLE_HEIGHT - height));
      return ordered.map((card, i) => ({
        ...card,
        x:
          left +
          widths.slice(0, i % count).reduce((a, b) => a + b + CARD_GAP, 0) +
          (bounds[i].width - CARD_WIDTH) / 2,
        y:
          top +
          heights.slice(0, Math.floor(i / count)).reduce((a, b) => a + b + CARD_GAP, 0) +
          (bounds[i].height - CARD_HEIGHT) / 2,
      }));
    }
  }
  return null;
}

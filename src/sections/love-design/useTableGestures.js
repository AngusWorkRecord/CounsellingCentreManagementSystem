import { useEffect, useRef, useState } from 'react';
import { groupDelta, hitCards, rectangleBetween } from './tableGeometry';

export default function useTableGestures(cards, viewportRef, dispatch) {
  const [tool, setTool] = useState(() =>
    window.matchMedia?.('(pointer: coarse)').matches ? 'pan' : 'select'
  );
  const [selectedIds, setSelectedIds] = useState([]);
  const [preview, setPreview] = useState(null);
  const [marquee, setMarquee] = useState(null);
  const [active, setActive] = useState(null);
  const gesture = useRef(null);
  const frame = useRef(null);
  useEffect(() => {
    const valid = new Set(cards.map((card) => card.cardId));
    setSelectedIds((current) =>
      current.every((id) => valid.has(id)) ? current : current.filter((id) => valid.has(id))
    );
  }, [cards]);
  const point = (clientX, clientY) => {
    const viewport = viewportRef.current;
    const rect = viewport.getBoundingClientRect();
    return {
      x: clientX - rect.left + viewport.scrollLeft,
      y: clientY - rect.top + viewport.scrollTop,
    };
  };
  const update = (g) => {
    const viewport = viewportRef.current;
    if (g.kind === 'pan') {
      viewport.scrollLeft = Math.max(
        0,
        Math.min(viewport.scrollWidth - viewport.clientWidth, g.scrollLeft + g.startX - g.clientX)
      );
      viewport.scrollTop = Math.max(
        0,
        Math.min(viewport.scrollHeight - viewport.clientHeight, g.scrollTop + g.startY - g.clientY)
      );
    } else if (g.kind === 'move') {
      const current = point(g.clientX, g.clientY);
      g.delta = groupDelta(g.cards, current.x - g.origin.x, current.y - g.origin.y);
      setPreview(
        Object.fromEntries(
          g.cards.map((card) => [card.cardId, { x: card.x + g.delta.dx, y: card.y + g.delta.dy }])
        )
      );
    } else if (g.moved) {
      const rect = rectangleBetween(g.origin, point(g.clientX, g.clientY));
      setMarquee(rect);
      setSelectedIds([
        ...new Set([...(g.append ? g.selection : []), ...hitCards(g.allCards, rect)]),
      ]);
    }
  };
  const autoScroll = () => {
    const g = gesture.current;
    if (!g) return;
    const viewport = viewportRef.current;
    if (g.moved && g.kind !== 'pan') {
      const rect = viewport.getBoundingClientRect();
      const speed = (value, start, end) => {
        if (value < start + 36) return -Math.min(16, (start + 36 - value) / 3);
        if (value > end - 36) return Math.min(16, (value - end + 36) / 3);
        return 0;
      };
      if (rect.width && rect.height) {
        viewport.scrollLeft = Math.max(
          0,
          Math.min(
            viewport.scrollWidth - viewport.clientWidth,
            viewport.scrollLeft + speed(g.clientX, rect.left, rect.right)
          )
        );
        viewport.scrollTop = Math.max(
          0,
          Math.min(
            viewport.scrollHeight - viewport.clientHeight,
            viewport.scrollTop + speed(g.clientY, rect.top, rect.bottom)
          )
        );
        update(g);
      }
    }
    frame.current = requestAnimationFrame(autoScroll);
  };
  const finish = (cancel = false) => {
    const g = gesture.current;
    if (!g) return;
    gesture.current = null;
    cancelAnimationFrame(frame.current);
    if (cancel) {
      setSelectedIds(g.selection);
      viewportRef.current.scrollLeft = g.scrollLeft;
      viewportRef.current.scrollTop = g.scrollTop;
    } else if (g.kind === 'move' && g.moved && g.delta) {
      dispatch({ type: 'MOVE_MANY', cardIds: g.cards.map((card) => card.cardId), ...g.delta });
    } else if (!g.moved && !g.cardId) setSelectedIds([]);
    setPreview(null);
    setMarquee(null);
    setActive(null);
    if (g.target.hasPointerCapture?.(g.pointerId)) g.target.releasePointerCapture(g.pointerId);
  };
  const cancelRef = useRef(finish);
  cancelRef.current = finish;
  useEffect(() => {
    const escape = (event) => {
      if (event.key !== 'Escape') return;
      if (gesture.current) {
        event.preventDefault();
        event.stopPropagation();
        cancelRef.current(true);
      } else if (
        event.target.closest?.('.love-table') &&
        !event.target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        setSelectedIds([]);
      }
    };
    window.addEventListener('keydown', escape, true);
    return () => {
      window.removeEventListener('keydown', escape, true);
      cancelAnimationFrame(frame.current);
    };
  }, []);
  const selectCard = (id, toggle = false) => {
    let next = selectedIds.includes(id) ? selectedIds : [id];
    if (toggle)
      next = selectedIds.includes(id)
        ? selectedIds.filter((value) => value !== id)
        : [...selectedIds, id];
    setSelectedIds(next);
    return next;
  };
  const onPointerDown = (event) => {
    if (
      gesture.current ||
      event.button !== 0 ||
      event.isPrimary === false ||
      event.target.closest('[data-card-menu]')
    )
      return;
    const id = event.target.closest('[data-card-id]')?.dataset.cardId;
    event.preventDefault();
    const viewport = viewportRef.current;
    (event.target.closest('.ldt-card-face') || viewport).focus({ preventScroll: true });
    const selection = [...selectedIds];
    let next = selection;
    if (tool === 'select') {
      if (id) next = selectCard(id, event.ctrlKey || event.metaKey);
      else if (!event.shiftKey) setSelectedIds([]);
      if (id && (event.ctrlKey || event.metaKey)) return;
    }
    let kind = id ? 'move' : 'marquee';
    if (tool === 'pan') kind = 'pan';
    gesture.current = {
      kind,
      cardId: id,
      pointerId: event.pointerId,
      target: event.currentTarget,
      startX: event.clientX,
      startY: event.clientY,
      clientX: event.clientX,
      clientY: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
      origin: point(event.clientX, event.clientY),
      selection,
      append: event.shiftKey,
      cards: cards.filter((card) => next.includes(card.cardId)),
      allCards: cards,
      moved: false,
    };
    setActive(kind);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    frame.current = requestAnimationFrame(autoScroll);
  };
  const onPointerMove = (event) => {
    const g = gesture.current;
    if (!g || g.pointerId !== event.pointerId) return;
    g.clientX = event.clientX;
    g.clientY = event.clientY;
    g.moved ||= Math.hypot(g.clientX - g.startX, g.clientY - g.startY) > 3;
    if (g.moved) update(g);
  };
  const onKeyDown = (event) => {
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setSelectedIds([]);
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      setSelectedIds(cards.map((card) => card.cardId));
    } else {
      const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      const id = event.target.closest('[data-card-id]')?.dataset.cardId;
      if (id && moves[event.key] && !event.target.closest('[data-card-menu]')) {
        event.preventDefault();
        const ids = selectCard(id);
        const [dx, dy] = moves[event.key];
        const distance = event.shiftKey ? 40 : 10;
        dispatch({ type: 'MOVE_MANY', cardIds: ids, dx: dx * distance, dy: dy * distance });
      }
    }
  };
  return {
    tool,
    setTool: (value) => {
      finish(true);
      setTool(value);
    },
    selectedIds,
    setSelectedIds,
    selectCard,
    preview,
    marquee,
    active,
    onKeyDown,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: (event) => {
        if (gesture.current?.pointerId === event.pointerId) {
          onPointerMove(event);
          finish();
        }
      },
      onPointerCancel: (event) => {
        if (gesture.current?.pointerId === event.pointerId) finish(true);
      },
      onLostPointerCapture: (event) => {
        if (gesture.current?.pointerId === event.pointerId) finish(true);
      },
    },
  };
}

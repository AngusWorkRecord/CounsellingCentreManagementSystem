// Only one native drag can exist in a document. Keep the business snapshot in
// memory; the DataTransfer payload contains identifiers and a nonce, never records.
export const PERSON_DRAG_TYPE = 'application/x-duty-roster-person';
let session = null;
const listeners = new Set();
let stopScrolling = null;
const emit = () => listeners.forEach((listener) => listener());
export const getPersonDrag = () => session;
export const subscribePersonDrag = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function endPersonDrag() {
  stopScrolling?.();
  stopScrolling = null;
  if (session) {
    session = null;
    emit();
  }
}

export function edgeScrollDelta(position, start, end, scroll, max) {
  if (position < start || position > end || end <= start) return 0;
  const edge = Math.min(32, (end - start) / 3);
  if (position < start + edge && scroll > 0) return -12;
  if (position > end - edge && scroll < max) return 12;
  return 0;
}

export function scrollDragEdges(target, x, y) {
  let node = target instanceof Element ? target : null;
  let movedX = false;
  let movedY = false;
  const root = document.scrollingElement;
  const nodes = [];
  while (node) {
    if (node !== root) nodes.push(node);
    node = node.parentElement;
  }
  if (root) nodes.push(root);
  nodes.forEach((element) => {
    const isRoot = element === root;
    const rect = isRoot
      ? { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }
      : element.getBoundingClientRect();
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return;
    const style = getComputedStyle(element);
    const dx =
      !movedX && (isRoot || /auto|scroll/.test(style.overflowX))
        ? edgeScrollDelta(
            x,
            rect.left,
            rect.right,
            element.scrollLeft,
            element.scrollWidth - element.clientWidth
          )
        : 0;
    const dy =
      !movedY && (isRoot || /auto|scroll/.test(style.overflowY))
        ? edgeScrollDelta(
            y,
            rect.top,
            rect.bottom,
            element.scrollTop,
            element.scrollHeight - element.clientHeight
          )
        : 0;
    if (dx) {
      element.scrollLeft += dx;
      movedX = true;
    }
    if (dy) {
      element.scrollTop += dy;
      movedY = true;
    }
  });
}

export function beginPersonDrag(next) {
  endPersonDrag();
  session = next;
  emit();
  let point = null;
  let frame;
  const track = (event) => {
    point = { target: event.target, x: event.clientX, y: event.clientY };
  };
  const tick = () => {
    if (point) scrollDragEdges(point.target, point.x, point.y);
    frame = window.requestAnimationFrame(tick);
  };
  const escape = (event) => {
    if (event.key === 'Escape') endPersonDrag();
  };
  window.addEventListener('dragover', track, true);
  window.addEventListener('dragend', endPersonDrag, true);
  window.addEventListener('drop', endPersonDrag);
  window.addEventListener('keydown', escape, true);
  frame = window.requestAnimationFrame(tick);
  stopScrolling = () => {
    window.cancelAnimationFrame(frame);
    window.removeEventListener('dragover', track, true);
    window.removeEventListener('dragend', endPersonDrag, true);
    window.removeEventListener('drop', endPersonDrag);
    window.removeEventListener('keydown', escape, true);
  };
}

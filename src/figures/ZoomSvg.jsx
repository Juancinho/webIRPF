import { useEffect, useRef, useState } from 'react';
import { clamp, round } from './scale';
import { useNarrow } from '../hooks/useNarrow';

const MIN = 1;
const MAX = 9;

/**
 * A figure you can get closer to.
 *
 * Every dense figure in the publication is magnifiable: wheel or pinch to
 * zoom around the pointer, drag to pan, double-click or ⟲ to reset, and the
 * same three moves from the keyboard (+ − 0 and the arrows) once the figure
 * has focus. On phones it opens already magnified, so marks and labels stay
 * legible instead of shrinking with the viewport.
 */
export default function ZoomSvg({
  viewBox,
  children,
  className = '',
  style,
  initial,
  hint = true,
  label = 'Figura ampliable',
  ...rest
}) {
  const narrow = useNarrow();
  const boxRef = useRef(null);
  const pointers = useRef(new Map());
  const pinch = useRef(null);
  const drag = useRef(null);
  const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number);

  // phones open the figure magnified at its left edge; desktops open whole
  const start = wide => {
    const k = initial ?? (wide ? 1 : 2.1);
    return { k, x: 0, y: k > 1 ? -(vbH * (k - 1)) / 2 : 0 };
  };

  const [t, setT] = useState(() => start(!narrow));
  const [wasNarrow, setWasNarrow] = useState(narrow);
  const [grabbing, setGrabbing] = useState(false);

  if (wasNarrow !== narrow) {
    setWasNarrow(narrow);
    setT(start(!narrow));
  }

  const bound = (k, x, y) => ({
    k,
    x: clamp(x, -vbW * (k - 1), 0),
    y: clamp(y, -vbH * (k - 1), 0),
  });

  /** Zoom by `factor` keeping the point under the cursor fixed. */
  const zoomAt = (factor, px, py) => {
    setT(prev => {
      const k = clamp(prev.k * factor, MIN, MAX);
      if (k === prev.k) return prev;
      const r = k / prev.k;
      return bound(k, px - (px - prev.x) * r, py - (py - prev.y) * r);
    });
  };

  const toLocal = e => {
    const el = boxRef.current;
    if (!el) return [0, 0];
    const r = el.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * vbW, ((e.clientY - r.top) / r.height) * vbH];
  };

  const onWheel = e => {
    if (!e.ctrlKey && Math.abs(e.deltaY) < 2) return;
    e.preventDefault();
    const [px, py] = toLocal(e);
    zoomAt(e.deltaY < 0 ? 1.18 : 1 / 1.18, px, py);
  };

  // wheel must be registered non-passively to be preventable
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const handler = ev => onWheel(ev);
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  });

  const onPointerDown = e => {
    const el = boxRef.current;
    el?.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = Math.hypot(a.x - b.x, a.y - b.y);
      drag.current = null;
    } else {
      const [px, py] = toLocal(e);
      drag.current = { px, py, x: t.x, y: t.y };
      setGrabbing(true);
    }
  };

  const onPointerMove = e => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > 0) {
        const el = boxRef.current;
        const r = el.getBoundingClientRect();
        const cx = (((a.x + b.x) / 2 - r.left) / r.width) * vbW;
        const cy = (((a.y + b.y) / 2 - r.top) / r.height) * vbH;
        zoomAt(d / pinch.current, cx, cy);
        pinch.current = d;
      }
      return;
    }

    if (drag.current) {
      const [px, py] = toLocal(e);
      setT(prev => bound(prev.k, drag.current.x + (px - drag.current.px), drag.current.y + (py - drag.current.py)));
    }
  };

  const endPointer = e => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) {
      drag.current = null;
      setGrabbing(false);
    }
  };

  const onKeyDown = e => {
    const step = 40 / t.k;
    const map = {
      '+': () => zoomAt(1.25, vbW / 2, vbH / 2),
      '=': () => zoomAt(1.25, vbW / 2, vbH / 2),
      '-': () => zoomAt(1 / 1.25, vbW / 2, vbH / 2),
      '0': () => setT({ k: 1, x: 0, y: 0 }),
      ArrowLeft: () => setT(p => bound(p.k, p.x + step, p.y)),
      ArrowRight: () => setT(p => bound(p.k, p.x - step, p.y)),
      ArrowUp: () => setT(p => bound(p.k, p.x, p.y + step)),
      ArrowDown: () => setT(p => bound(p.k, p.x, p.y - step)),
    };
    if (map[e.key]) {
      map[e.key]();
      e.preventDefault();
    }
  };

  const reset = () => setT({ k: 1, x: 0, y: 0 });

  return (
    <div className="fs-zoom-wrap">
      <div
        ref={boxRef}
        className={`fs-zoom ${grabbing ? 'is-grabbing' : ''} ${className}`.trim()}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onDoubleClick={reset}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="group"
        aria-label={`${label}. Usa + y − para ampliar, las flechas para desplazarte y 0 para reiniciar.`}
      >
        <svg className="fs-svg" viewBox={viewBox} style={style} {...rest}>
          <g transform={`translate(${round(t.x)} ${round(t.y)}) scale(${round(t.k)})`}>{children}</g>
        </svg>

        <div className="fs-zoom-controls">
          <button type="button" onClick={() => zoomAt(1.3, vbW / 2, vbH / 2)} disabled={t.k >= MAX} aria-label="Ampliar">
            +
          </button>
          <button type="button" onClick={() => zoomAt(1 / 1.3, vbW / 2, vbH / 2)} disabled={t.k <= MIN} aria-label="Reducir">
            −
          </button>
          <button type="button" onClick={reset} disabled={t.k === 1 && t.x === 0 && t.y === 0} aria-label="Reiniciar la vista">
            ⟲
          </button>
        </div>
      </div>

      {hint && (
        <p className="fs-zoom-hint">
          {t.k > 1.02 ? `×${t.k.toFixed(1)} · arrastra para desplazarte · ⟲ para reiniciar` : 'Rueda o pellizca para ampliar · arrastra para desplazarte'}
        </p>
      )}
    </div>
  );
}

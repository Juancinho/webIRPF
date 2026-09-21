import { useCallback, useEffect, useRef, useState } from 'react';
import { clamp } from './scale';

/**
 * Zoom de datos, no de imagen.
 *
 * En vez de escalar el dibujo —que engorda trazos y tipografía como si fuera
 * una foto— esto mueve el **dominio** del eje. La figura vuelve a calcular sus
 * escalas y sus marcas con el nuevo rango, así que al ampliar aparecen más
 * divisiones del eje y el texto conserva siempre su tamaño.
 *
 * El eje vertical se deja quieto a propósito: en estas figuras la magnitud
 * vertical es la que se compara, y reescalarla al ampliar haría mentir a la
 * pendiente.
 */
export function useDomainZoom(full, { pxRange, vbWidth, maxZoom = 40 } = {}) {
  const [lo0, hi0] = full;
  const spanFull = hi0 - lo0;
  const minSpan = spanFull / maxZoom;

  const ref = useRef(null);
  const drag = useRef(null);
  const pinch = useRef(null);
  const pointers = useRef(new Map());

  const [dom, setDom] = useState(full);
  const [prevFull, setPrevFull] = useState(full);

  // si cambia el dominio completo (otro año, otra serie), se reinicia la vista
  if (prevFull[0] !== lo0 || prevFull[1] !== hi0) {
    setPrevFull(full);
    setDom(full);
  }

  const bound = useCallback(
    ([a, b]) => {
      let span = clamp(b - a, minSpan, spanFull);
      let lo = clamp(a, lo0, hi0 - span);
      return [lo, lo + span];
    },
    [lo0, hi0, spanFull, minSpan]
  );

  /** Coordenada de datos bajo el cursor, con el dominio actual. */
  const toData = useCallback(
    clientX => {
      const el = ref.current;
      if (!el) return dom[0];
      const r = el.getBoundingClientRect();
      const px = ((clientX - r.left) / r.width) * vbWidth;
      const t = (px - pxRange[0]) / (pxRange[1] - pxRange[0] || 1);
      return dom[0] + t * (dom[1] - dom[0]);
    },
    [dom, pxRange, vbWidth]
  );

  /** Amplía o reduce manteniendo fijo el valor que hay bajo el cursor. */
  const zoomAt = useCallback(
    (factor, anchor) => {
      setDom(prev => {
        const span = prev[1] - prev[0];
        const nuevo = clamp(span / factor, minSpan, spanFull);
        const t = (anchor - prev[0]) / (span || 1);
        return bound([anchor - t * nuevo, anchor - t * nuevo + nuevo]);
      });
    },
    [bound, minSpan, spanFull]
  );

  const onWheel = useCallback(
    e => {
      if (Math.abs(e.deltaY) < 1) return;
      e.preventDefault();
      zoomAt(e.deltaY < 0 ? 1.22 : 1 / 1.22, toData(e.clientX));
    },
    [zoomAt, toData]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  const onPointerDown = e => {
    ref.current?.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, e.clientX);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.abs(a - b), anchor: toData((a + b) / 2) };
      drag.current = null;
    } else {
      drag.current = { at: toData(e.clientX), dom };
    }
  };

  const onPointerMove = e => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, e.clientX);

    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.abs(a - b);
      if (d > 4) {
        zoomAt(d / pinch.current.d, pinch.current.anchor);
        pinch.current.d = d;
      }
      return;
    }

    if (drag.current) {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = ((e.clientX - r.left) / r.width) * vbWidth;
      const t = (px - pxRange[0]) / (pxRange[1] - pxRange[0] || 1);
      const span = drag.current.dom[1] - drag.current.dom[0];
      const lo = drag.current.at - t * span;
      setDom(bound([lo, lo + span]));
    }
  };

  const endPointer = e => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) drag.current = null;
  };

  const centro = () => (dom[0] + dom[1]) / 2;

  const onKeyDown = e => {
    const span = dom[1] - dom[0];
    const map = {
      '+': () => zoomAt(1.3, centro()),
      '=': () => zoomAt(1.3, centro()),
      '-': () => zoomAt(1 / 1.3, centro()),
      '0': () => setDom(full),
      ArrowLeft: () => setDom(bound([dom[0] - span * 0.12, dom[1] - span * 0.12])),
      ArrowRight: () => setDom(bound([dom[0] + span * 0.12, dom[1] + span * 0.12])),
    };
    if (map[e.key]) {
      map[e.key]();
      e.preventDefault();
    }
  };

  const k = spanFull / (dom[1] - dom[0]);

  return {
    ref,
    domain: dom,
    k,
    zoomed: k > 1.001,
    reset: () => setDom(full),
    zoomIn: () => zoomAt(1.3, centro()),
    zoomOut: () => zoomAt(1 / 1.3, centro()),
    canZoomIn: dom[1] - dom[0] > minSpan * 1.001,
    bind: { onPointerDown, onPointerMove, onPointerUp: endPointer, onPointerCancel: endPointer, onKeyDown },
  };
}

import { useEffect, useRef, useState } from 'react';

/**
 * Lectura táctil de las figuras.
 *
 * Cada figura sabe reaccionar al ratón —`onMouseEnter`, `onMouseMove`,
 * `onMouseLeave`— y ninguna sabía nada del dedo. En vez de reescribir treinta
 * manejadores, esto traduce el gesto táctil a esos mismos eventos de ratón
 * sobre el elemento que queda bajo el dedo, así que cada figura sigue teniendo
 * una sola forma de leer un punto:
 *
 * - **Tocar** fija la lectura del punto tocado. Se queda hasta que se toca
 *   otro punto o cualquier sitio fuera de la figura.
 * - **Mantener y arrastrar** recorre la figura con el dedo sin desplazar la
 *   página (a partir de ~250 ms quieto, el arrastre deja de ser scroll).
 * - En las figuras con eje ampliable, el arrastre **horizontal** lee
 *   directamente —el vertical sigue desplazando la página— salvo cuando el eje
 *   ya está ampliado: entonces arrastrar desplaza el eje.
 * - **Doble toque** amplía el eje bajo el dedo (sólo figuras con zoom).
 *
 * Devuelve `activo` (hay una lectura táctil fijada), para que el recuadro de
 * lectura se coloque por encima del dedo en vez de debajo.
 */

const HOLD_MS = 260;
const SLOP = 9;

// Todas las figuras con una lectura fijada; un toque fuera de una la suelta.
const fijadas = new Set();
let escuchaGlobal = false;
let ultimoToque = -1e9;

function asegurarEscuchaGlobal() {
  if (escuchaGlobal || typeof document === 'undefined') return;
  escuchaGlobal = true;
  document.addEventListener(
    'touchstart',
    e => {
      ultimoToque = performance.now();
      for (const f of fijadas) {
        if (!f.root.contains(e.target)) f.soltar();
      }
    },
    { passive: true, capture: true }
  );
  document.addEventListener(
    'touchend',
    () => {
      ultimoToque = performance.now();
    },
    { passive: true, capture: true }
  );
}

function disparar(el, type, x, y, relatedTarget = null) {
  if (!el) return;
  el.dispatchEvent(
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window,
      clientX: x,
      clientY: y,
      relatedTarget,
    })
  );
}

export function useTactil(root, { horizontal = false, zoomed = false, onDoubleTap } = {}) {
  const [activo, setActivo] = useState(false);
  const opts = useRef({ horizontal, zoomed, onDoubleTap });

  useEffect(() => {
    opts.current = { horizontal, zoomed, onDoubleTap };
  }, [horizontal, zoomed, onDoubleTap]);

  useEffect(() => {
    if (!root) return undefined;
    asegurarEscuchaGlobal();

    let ultimo = null; // elemento que tiene ahora el «ratón»
    let gesto = null; // { x0, y0, t0, modo, timer }
    let toquePrevio = null; // para el doble toque

    const posar = (x, y) => {
      const bajo = document.elementFromPoint(x, y);
      const dentro = bajo && root.contains(bajo) && !bajo.closest('.fs-zoom-controls, .fs-tip') ? bajo : null;
      if (dentro !== ultimo) {
        if (ultimo) disparar(ultimo, 'mouseout', x, y, dentro || document.body);
        if (dentro) disparar(dentro, 'mouseover', x, y, ultimo);
        ultimo = dentro;
      }
      if (dentro) disparar(dentro, 'mousemove', x, y);
      if (dentro) {
        fijadas.add(yo);
        setActivo(true);
      } else {
        soltar();
      }
    };

    const soltar = () => {
      if (ultimo) disparar(ultimo, 'mouseout', 0, 0, document.body);
      ultimo = null;
      fijadas.delete(yo);
      setActivo(false);
    };

    const yo = { root, soltar };

    const limpiarTimer = () => {
      if (gesto?.timer) clearTimeout(gesto.timer);
      if (gesto) gesto.timer = null;
    };

    const onStart = e => {
      if (e.touches.length !== 1) {
        limpiarTimer();
        gesto = gesto ? { ...gesto, modo: 'multi' } : { modo: 'multi' };
        return;
      }
      const t = e.touches[0];
      gesto = { x0: t.clientX, y0: t.clientY, t0: performance.now(), modo: 'pendiente', timer: null };
      gesto.timer = setTimeout(() => {
        if (gesto?.modo !== 'pendiente') return;
        gesto.modo = 'lectura';
        navigator.vibrate?.(6);
        posar(gesto.x0, gesto.y0);
      }, HOLD_MS);
    };

    const onMove = e => {
      if (!gesto || e.touches.length !== 1) return;
      const t = e.touches[0];
      if (gesto.modo === 'lectura') {
        if (e.cancelable) e.preventDefault();
        posar(t.clientX, t.clientY);
        return;
      }
      if (gesto.modo !== 'pendiente') return;
      const dx = t.clientX - gesto.x0;
      const dy = t.clientY - gesto.y0;
      if (Math.hypot(dx, dy) < SLOP) return;
      limpiarTimer();
      const { horizontal: h, zoomed: z } = opts.current;
      if (h && !z && Math.abs(dx) > Math.abs(dy) * 1.2) {
        gesto.modo = 'lectura';
        if (e.cancelable) e.preventDefault();
        posar(t.clientX, t.clientY);
      } else {
        gesto.modo = 'libre'; // desplazamiento de página o del eje: no es nuestro
      }
    };

    const onEnd = e => {
      if (!gesto) return;
      limpiarTimer();
      const t = e.changedTouches[0];
      if (gesto.modo === 'pendiente' && t) {
        const ahora = performance.now();
        const dt = ahora - gesto.t0;
        if (dt < 450) {
          const doble =
            toquePrevio &&
            ahora - toquePrevio.t < 320 &&
            Math.hypot(t.clientX - toquePrevio.x, t.clientY - toquePrevio.y) < 36;
          if (doble && opts.current.onDoubleTap) {
            if (e.cancelable) e.preventDefault();
            opts.current.onDoubleTap(t.clientX);
            toquePrevio = null;
          } else {
            toquePrevio = { t: ahora, x: t.clientX, y: t.clientY };
          }
          // Un toque sobre un control dentro de la figura (un botón, un enlace)
          // se deja al navegador: sólo leemos cuando se toca el dibujo.
          if (!e.target.closest?.('button, a, input, select, label')) posar(t.clientX, t.clientY);
        }
      }
      if (e.touches.length === 0) gesto = null;
    };

    const onCancel = () => {
      limpiarTimer();
      gesto = null;
    };

    // Tras un toque, el navegador fabrica sus propios eventos de ratón de
    // compatibilidad (y algunos, además, un `mouseout` inmediato que borraba la
    // lectura recién fijada). Con el dedo, la única fuente de «hover» es ésta:
    // los de compatibilidad no llegan a la figura.
    const filtrarCompat = e => {
      if (e.isTrusted && performance.now() - ultimoToque < 900) e.stopPropagation();
    };
    const compat = ['mouseover', 'mouseout', 'mousemove', 'mouseenter', 'mouseleave'];
    compat.forEach(t => root.addEventListener(t, filtrarCompat, true));

    root.addEventListener('touchstart', onStart, { passive: true });
    root.addEventListener('touchmove', onMove, { passive: false });
    root.addEventListener('touchend', onEnd, { passive: false });
    root.addEventListener('touchcancel', onCancel, { passive: true });
    return () => {
      limpiarTimer();
      fijadas.delete(yo);
      compat.forEach(t => root.removeEventListener(t, filtrarCompat, true));
      root.removeEventListener('touchstart', onStart);
      root.removeEventListener('touchmove', onMove);
      root.removeEventListener('touchend', onEnd);
      root.removeEventListener('touchcancel', onCancel);
    };
  }, [root]);

  return activo;
}

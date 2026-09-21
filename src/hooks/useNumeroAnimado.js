import { useEffect, useRef, useState } from 'react';

const reducido = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Interpola una cifra hasta su nuevo valor.
 *
 * Las cifras grandes de la publicación cambiaban de golpe al mover la regla o
 * el año: el salto es tan brusco que cuesta ver *cuánto* ha cambiado. Con una
 * interpolación corta la vista sigue el recorrido y el cambio se entiende.
 *
 * El primer valor no se anima —entrar en la página con los números corriendo
 * sería decorativo, no informativo— y con `prefers-reduced-motion` el valor se
 * devuelve tal cual.
 */
export function useNumeroAnimado(valor, ms = 420) {
  const [mostrado, setMostrado] = useState(valor);
  const desde = useRef(valor);
  const raf = useRef(0);
  const primera = useRef(true);

  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      desde.current = valor;
      setMostrado(valor);
      return undefined;
    }
    if (reducido() || !Number.isFinite(valor) || !Number.isFinite(desde.current)) {
      desde.current = valor;
      setMostrado(valor);
      return undefined;
    }

    const a = desde.current;
    const b = valor;
    if (a === b) return undefined;

    const t0 = performance.now();
    const paso = ahora => {
      const t = Math.min(1, (ahora - t0) / ms);
      const e = 1 - Math.pow(1 - t, 3); // salida suave, sin rebote
      const v = a + (b - a) * e;
      setMostrado(v);
      desde.current = v;
      if (t < 1) raf.current = requestAnimationFrame(paso);
      else desde.current = b;
    };
    raf.current = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf.current);
  }, [valor, ms]);

  return mostrado;
}

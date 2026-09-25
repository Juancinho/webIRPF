import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * Mobile is a recomposition, not a squeeze (DESIGN.md §53). Figures that have
 * a designed portrait form ask for it here; the dense ones open magnified so
 * their marks and labels never shrink below the legible floor.
 */
export function useNarrow(query = '(max-width: 700px)') {
  const mq = useMemo(
    () => (typeof window === 'undefined' ? null : window.matchMedia(query)),
    [query]
  );

  const subscribe = useCallback(
    cb => {
      if (!mq) return () => {};
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    [mq]
  );

  return useSyncExternalStore(
    subscribe,
    () => (mq ? mq.matches : false),
    () => false
  );
}

/**
 * Ancho del lienzo en móvil. Las figuras se dibujan en 880 unidades en
 * escritorio; en un teléfono de 375 px eso encogía el texto a 3–4 px. Con un
 * lienzo de 360 unidades, una unidad es casi un píxel y los rótulos conservan
 * su tamaño. Cada figura recompone su dibujo para este ancho: no se escala.
 */
export const ANCHO_MOVIL = 360;

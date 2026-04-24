import { useState, useEffect, useCallback } from 'react';

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

export function useURLState() {
  const init = () => {
    const p = new URLSearchParams(window.location.search);
    return {
      bruto: clamp(parseInt(p.get('bruto'), 10) || 35000, 0, 200000),
      anio:  clamp(parseInt(p.get('anio'),  10) || 2026,   2012, 2026),
    };
  };

  const [state, setState] = useState(init);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('bruto', state.bruto);
    url.searchParams.set('anio', state.anio);
    window.history.replaceState({}, '', url);
  }, [state.bruto, state.anio]);

  const set = useCallback((campo, valor) => {
    setState(s => ({ ...s, [campo]: valor }));
  }, []);

  const getShareURL = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('bruto', state.bruto);
    url.searchParams.set('anio', state.anio);
    return url.toString();
  }, [state]);

  return { ...state, set, getShareURL };
}

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_OPTS, REGIONES } from '../engine/irpf';

function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

function intParam(params, key, fallback, min, max) {
  const parsed = Number.parseInt(params.get(key), 10);
  return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback;
}

function writeURLState(url, state) {
  url.searchParams.set('bruto', state.bruto);
  url.searchParams.set('anio', state.anio);

  const optional = {
    regimen: state.opts.regimen,
    ccaa: state.opts.ccaa,
    tributacion: state.opts.tributacion,
    hijos: state.opts.nHijos,
    menores3: state.opts.nHijosMenores3,
    ascendientes: state.opts.nAscendientes,
  };
  const defaults = {
    regimen: DEFAULT_OPTS.regimen,
    ccaa: DEFAULT_OPTS.ccaa,
    tributacion: DEFAULT_OPTS.tributacion,
    hijos: DEFAULT_OPTS.nHijos,
    menores3: DEFAULT_OPTS.nHijosMenores3,
    ascendientes: DEFAULT_OPTS.nAscendientes,
  };

  for (const [key, value] of Object.entries(optional)) {
    if (value === defaults[key]) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
}

export function useURLState() {
  const init = () => {
    const p = new URLSearchParams(window.location.search);
    const nHijos = intParam(p, 'hijos', DEFAULT_OPTS.nHijos, 0, 6);
    return {
      bruto: intParam(p, 'bruto', 35000, 0, 200000),
      anio: intParam(p, 'anio', 2026, 2012, 2026),
      opts: {
        regimen: ['asalariado', 'autonomo'].includes(p.get('regimen')) ? p.get('regimen') : DEFAULT_OPTS.regimen,
        ccaa: Object.hasOwn(REGIONES, p.get('ccaa')) ? p.get('ccaa') : DEFAULT_OPTS.ccaa,
        tributacion: ['individual', 'conjunta'].includes(p.get('tributacion')) ? p.get('tributacion') : DEFAULT_OPTS.tributacion,
        nHijos,
        nHijosMenores3: intParam(p, 'menores3', DEFAULT_OPTS.nHijosMenores3, 0, nHijos),
        nAscendientes: intParam(p, 'ascendientes', DEFAULT_OPTS.nAscendientes, 0, 2),
      },
    };
  };

  const [state, setState] = useState(init);

  useEffect(() => {
    const url = new URL(window.location.href);
    writeURLState(url, state);
    window.history.replaceState({}, '', url);
  }, [state]);

  const set = useCallback((campo, valor) => {
    setState(s => ({ ...s, [campo]: valor }));
  }, []);

  const setOpts = useCallback((opts) => {
    setState(state => ({ ...state, opts }));
  }, []);

  const getShareURL = useCallback(() => {
    const url = new URL(window.location.href);
    writeURLState(url, state);
    return url.toString();
  }, [state]);

  return { ...state, set, setOpts, getShareURL };
}

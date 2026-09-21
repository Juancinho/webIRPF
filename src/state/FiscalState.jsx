import { useCallback, useMemo, useState } from 'react';
import {
  calcularNomina,
  calcularTipoMarginal,
  obtenerParametros,
  SMI_ANUAL,
  REGIONES,
  percentilDe,
} from '../engine/irpf';
import { useURLState } from '../hooks/useURLState';
import { FiscalCtx } from './fiscalContext';

/** Provider for the single fiscal state; the hook lives in `fiscalContext.js`. */
export function FiscalProvider({ children }) {
  const { bruto, anio, pagas, opts, set, setOpts, getShareURL } = useURLState();
  const [focus, setFocus] = useState(null);

  const nomina = useMemo(() => calcularNomina(bruto, anio, opts), [bruto, anio, opts]);
  const marginal = useMemo(() => calcularTipoMarginal(bruto, anio, opts), [bruto, anio, opts]);
  const params = useMemo(() => obtenerParametros(anio), [anio]);

  const setBruto = useCallback(v => set('bruto', Math.min(200000, Math.max(0, Math.round(v)))), [set]);
  const setAnio = useCallback(v => set('anio', Math.min(2026, Math.max(2012, v))), [set]);
  const setPagas = useCallback(v => set('pagas', v === 14 ? 14 : 12), [set]);

  const value = useMemo(() => {
    const smi = SMI_ANUAL[anio];
    return {
      bruto, anio, pagas, opts,
      nomina, marginal, params,
      smi,
      vecesSMI: bruto > 0 && smi > 0 ? bruto / smi : 0,
      percentil: percentilDe(bruto, anio),
      region: REGIONES[opts.ccaa] || REGIONES.default,
      porPaga: nomina.salarioNeto / pagas,
      setBruto, setAnio, setPagas, setOpts, getShareURL,
      focus, setFocus,
    };
  }, [bruto, anio, pagas, opts, nomina, marginal, params, setBruto, setAnio, setPagas, setOpts, getShareURL, focus]);

  return <FiscalCtx.Provider value={value}>{children}</FiscalCtx.Provider>;
}

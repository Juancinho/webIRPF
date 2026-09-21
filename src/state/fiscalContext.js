import { createContext, useContext } from 'react';

/**
 * ONE FISCAL STATE (VISUAL_PLAN_V4 §6).
 * Salary, year, pagas and profile live in a single context so that no two
 * figures in the publication can ever disagree about the reader's numbers.
 * `focus` is the cross-highlighting bus: 'neto' | 'irpf' | 'ssTra' | 'ssEmp'.
 */
export const FiscalCtx = createContext(null);

export function useFiscal() {
  const ctx = useContext(FiscalCtx);
  if (!ctx) throw new Error('useFiscal debe usarse dentro de <FiscalProvider>');
  return ctx;
}

import { useState, useMemo } from 'react';
import { calcularNomina, calcularTipoMarginal } from '../engine/irpf';
import { eur, num } from '../utils/format';

export default function SimuladorSubida({ bruto, anio }) {
  const [incremento, setIncremento] = useState(3000);

  const actual  = useMemo(() => calcularNomina(bruto, anio), [bruto, anio]);
  const nuevo   = useMemo(() => calcularNomina(bruto + incremento, anio), [bruto, incremento, anio]);
  const marginal = useMemo(() => calcularTipoMarginal(bruto, anio, Math.max(incremento, 100)), [bruto, anio, incremento]);

  const difNeto  = nuevo.salarioNeto - actual.salarioNeto;
  const difIRPF  = nuevo.irpfFinal   - actual.irpfFinal;
  const difSS    = nuevo.cotTra      - actual.cotTra;
  const difCoste = nuevo.costeLab    - actual.costeLab;

  const pctNeto = incremento > 0 ? (difNeto  / incremento) * 100 : 0;
  const pctIRPF = incremento > 0 ? (difIRPF  / incremento) * 100 : 0;
  const pctSS   = incremento > 0 ? (difSS    / incremento) * 100 : 0;

  const alertaCliff = marginal.tipoMarginalTotal > 0.55;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
      {/* Columna izquierda: controles */}
      <div className="p-6 border-b lg:border-b-0 lg:border-r border-[var(--border)]">
        <div className="mb-1 flex items-baseline justify-between">
          <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide">
            Incremento salarial
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={num(incremento)}
              onChange={e => {
                const v = parseInt(e.target.value.replace(/\D/g,''), 10);
                if (!isNaN(v)) setIncremento(Math.min(50000, Math.max(0, v)));
              }}
              className="w-24 bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-2 py-1 text-[var(--text-h)] font-mono text-base text-right outline-none focus:border-[var(--accent)] transition-colors"
            />
            <span className="text-[var(--text)] font-medium">€</span>
          </div>
        </div>
        <input type="range" min="0" max="30000" step="500" value={incremento}
          onChange={e => setIncremento(+e.target.value)} className="w-full mt-2" />
        <div className="flex justify-between text-xs text-[var(--text)] mt-1 opacity-60">
          <span>0 €</span><span>15.000 €</span><span>30.000 €</span>
        </div>

        {/* Comparativa bruto */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text)]">Bruto actual</span>
            <span className="font-mono font-bold text-[var(--text-h)]">{eur(bruto)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text)]">Bruto nuevo</span>
            <span className="font-mono font-bold text-[var(--accent-light)]">{eur(bruto + incremento)}</span>
          </div>
          <div className="border-t border-[var(--border)] pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text)]">Coste adicional empresa</span>
              <span className="font-mono text-[var(--text-h)]">+{eur(difCoste)}</span>
            </div>
          </div>
        </div>

        {/* Cómo se reparte la subida */}
        {incremento > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide mb-2">
              De cada 100€ de subida bruta...
            </p>
            <div className="flex h-8 rounded-xl overflow-hidden w-full gap-0.5 mb-2">
              <div className="flex items-center justify-center text-xs font-bold text-[#0f1117] transition-all duration-500"
                style={{ width: `${Math.max(0, pctNeto)}%`, background: 'linear-gradient(90deg,#10b981,#059669)' }}>
                {pctNeto > 12 ? `${pctNeto.toFixed(0)}€` : ''}
              </div>
              <div className="flex items-center justify-center text-xs font-bold text-[#0f1117] transition-all duration-500"
                style={{ width: `${Math.max(0, pctSS)}%`, background: 'linear-gradient(90deg,#f59e0b,#d97706)' }}>
                {pctSS > 6 ? `${pctSS.toFixed(0)}€` : ''}
              </div>
              <div className="flex items-center justify-center text-xs font-bold text-[#0f1117] transition-all duration-500"
                style={{ width: `${Math.max(0, pctIRPF)}%`, background: 'linear-gradient(90deg,#ef4444,#dc2626)' }}>
                {pctIRPF > 6 ? `${pctIRPF.toFixed(0)}€` : ''}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2">
                <div className="font-bold text-emerald-400">{pctNeto.toFixed(1)}€</div>
                <div className="text-[var(--text)] mt-0.5">te quedas</div>
              </div>
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2">
                <div className="font-bold text-amber-400">{pctSS.toFixed(1)}€</div>
                <div className="text-[var(--text)] mt-0.5">→ SS</div>
              </div>
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2">
                <div className="font-bold text-red-400">{pctIRPF.toFixed(1)}€</div>
                <div className="text-[var(--text)] mt-0.5">→ IRPF</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Columna derecha: resultado */}
      <div className="p-6">
        {/* Neto antes / después */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-[var(--surface2)] rounded-xl p-4 border border-[var(--border)]">
            <div className="text-xs text-[var(--text)] mb-1">Neto actual</div>
            <div className="text-xl font-black font-mono text-[var(--text-h)]">{eur(actual.salarioNeto)}</div>
            <div className="text-xs text-[var(--text)]/60 mt-1">{eur(actual.salarioNeto / 12)}/mes</div>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/25">
            <div className="text-xs text-emerald-400 mb-1">Neto nuevo</div>
            <div className="text-xl font-black font-mono text-emerald-400">{eur(nuevo.salarioNeto)}</div>
            <div className="text-xs text-emerald-400/60 mt-1">{eur(nuevo.salarioNeto / 12)}/mes</div>
          </div>
        </div>

        {/* Ganancia neta */}
        {incremento > 0 && (
          <>
            <div className="rounded-xl bg-[var(--surface2)] border border-[var(--border)] p-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-[var(--text)] mb-1">Ganancia neta real</div>
                  <div className="text-2xl font-black font-mono text-emerald-400">+{eur(difNeto)}/año</div>
                  <div className="text-sm text-emerald-400/70 mt-1">+{eur(difNeto / 12)}/mes</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[var(--text)] mb-1">De {eur(incremento)} de subida</div>
                  <div className="text-lg font-bold text-[var(--text-h)]">{pctNeto.toFixed(1)}%</div>
                  <div className="text-xs text-[var(--text)]/60">te queda</div>
                </div>
              </div>
            </div>

            {/* Tipo marginal */}
            <div className={`rounded-xl p-4 border ${alertaCliff ? 'bg-orange-500/10 border-orange-500/30' : 'bg-[var(--surface2)] border-[var(--border)]'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-[var(--text)] mb-1">
                    Tipo marginal efectivo
                    {alertaCliff && <span className="ml-2 text-orange-400">⚠ Zona "cliff" Art.20</span>}
                  </div>
                  <div className={`text-2xl font-black font-mono ${alertaCliff ? 'text-orange-400' : 'text-[var(--text-h)]'}`}>
                    {(marginal.tipoMarginalTotal * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-[var(--text)]/60 mt-1">
                    De cada €100 extra de bruto, pagas {(marginal.tipoMarginalTotal * 100).toFixed(1)}€ en IRPF+SS
                  </div>
                </div>
                <div className="text-right text-xs text-[var(--text)]">
                  <div>IRPF marginal</div>
                  <div className="font-mono font-bold text-red-400">{(marginal.tipoMarginalIRPF * 100).toFixed(1)}%</div>
                </div>
              </div>
              {alertaCliff && (
                <p className="text-xs text-orange-300 mt-3 leading-relaxed">
                  En esta zona, al perder la reducción Art.20 el tipo marginal efectivo es muy alto.
                  Ganar más bruto puede suponer un incremento neto menor al esperado.
                </p>
              )}
            </div>

            {/* Desglose diferencias */}
            <div className="mt-4 space-y-0.5">
              {[
                ['Diferencia IRPF', `+${eur(difIRPF)}`, 'text-red-400'],
                ['Diferencia SS trabajador', `+${eur(difSS)}`, 'text-amber-400'],
                ['Diferencia neta', `+${eur(difNeto)}`, 'text-emerald-400'],
              ].map(([l, v, c]) => (
                <div key={l} className="flex justify-between py-1 px-2 text-xs">
                  <span className="text-[var(--text)]">{l}</span>
                  <span className={`font-mono font-bold ${c}`}>{v}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {incremento === 0 && (
          <div className="flex items-center justify-center h-40 text-sm text-[var(--text)]">
            Mueve el slider para ver qué pasa con tu neto
          </div>
        )}
      </div>
    </div>
  );
}

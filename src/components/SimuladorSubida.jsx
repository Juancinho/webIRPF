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
      <div className="p-5 sm:p-6 lg:p-7 border-b lg:border-b-0 lg:border-r border-[var(--border)]">
        <div className="mb-2 flex items-baseline justify-between">
          <label className="text-[10px] font-bold text-[var(--text)] uppercase tracking-[0.1em]">
            Incremento salarial
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={num(incremento)}
              onChange={e => {
                const v = parseInt(e.target.value.replace(/\D/g,''), 10);
                if (!isNaN(v)) setIncremento(Math.min(50000, Math.max(0, v)));
              }}
              className="input-field w-24"
            />
            <span className="text-[var(--text)] font-semibold text-sm">€</span>
          </div>
        </div>
        <input type="range" min="0" max="30000" step="500" value={incremento}
          onChange={e => setIncremento(+e.target.value)} className="w-full mt-1" />
        <div className="flex justify-between text-[10px] text-[var(--text)] mt-1.5 opacity-40 font-medium">
          <span>0 €</span><span>15.000 €</span><span>30.000 €</span>
        </div>

        {/* Comparativa bruto */}
        <div className="mt-7 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text)] font-medium">Bruto actual</span>
            <span className="font-mono font-bold text-[var(--text-h)]">{eur(bruto)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text)] font-medium">Bruto nuevo</span>
            <span className="font-mono font-bold text-[var(--accent-light)]">{eur(bruto + incremento)}</span>
          </div>
          <div className="divider-glow" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--text)] font-medium">Coste adicional empresa</span>
            <span className="font-mono font-semibold text-[var(--text-h)]">+{eur(difCoste)}</span>
          </div>
        </div>

        {/* Cómo se reparte la subida */}
        {incremento > 0 && (
          <div className="mt-7">
            <p className="text-[10px] font-bold text-[var(--text)] uppercase tracking-[0.1em] mb-3">
              De cada 100€ de subida bruta…
            </p>
            <div className="distribution-bar mb-3" style={{ height: '14px' }}>
              <div className="flex items-center justify-center text-[9px] font-bold text-white/90 transition-all duration-700"
                style={{ width: `${Math.max(0, pctNeto)}%`, background: 'linear-gradient(90deg,#10b981,#059669)', borderRadius: '999px' }}>
                {pctNeto > 14 ? `${pctNeto.toFixed(0)}€` : ''}
              </div>
              <div className="flex items-center justify-center text-[9px] font-bold text-white/90 transition-all duration-700"
                style={{ width: `${Math.max(0, pctSS)}%`, background: 'linear-gradient(90deg,#f59e0b,#d97706)', borderRadius: '999px' }}>
                {pctSS > 8 ? `${pctSS.toFixed(0)}€` : ''}
              </div>
              <div className="flex items-center justify-center text-[9px] font-bold text-white/90 transition-all duration-700"
                style={{ width: `${Math.max(0, pctIRPF)}%`, background: 'linear-gradient(90deg,#ef4444,#dc2626)', borderRadius: '999px' }}>
                {pctIRPF > 8 ? `${pctIRPF.toFixed(0)}€` : ''}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              {[
                ['te quedas', pctNeto, 'emerald', '#10b981'],
                ['→ SS', pctSS, 'amber', '#f59e0b'],
                ['→ IRPF', pctIRPF, 'red', '#ef4444'],
              ].map(([label, val, name, color]) => (
                <div key={label} className="metric-card p-3"
                  style={{ background: `${color}08`, borderColor: `${color}18` }}>
                  <div className="text-base font-black font-mono" style={{ color }}>{val.toFixed(1)}€</div>
                  <div className="text-[10px] text-[var(--text)] mt-0.5 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Columna derecha: resultado */}
      <div className="p-5 sm:p-6 lg:p-7">
        {/* Neto antes / después */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="metric-card"
            style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface2) 90%, transparent), color-mix(in srgb, var(--surface3) 70%, transparent))', borderColor: 'var(--border)' }}>
            <div className="text-[10px] text-[var(--text)] font-medium mb-1">Neto actual</div>
            <div className="text-xl font-black font-mono text-[var(--text-h)]">{eur(actual.salarioNeto)}</div>
            <div className="text-[10px] text-[var(--text)] opacity-40 mt-1">{eur(actual.salarioNeto / 12)}/mes</div>
          </div>
          <div className="metric-card"
            style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.06), rgba(52,211,153,0.02))', borderColor: 'rgba(52,211,153,0.18)' }}>
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #34d399, #10b981)' }} />
            <div className="text-[10px] text-[#34d399]/80 font-medium mb-1">Neto nuevo</div>
            <div className="text-xl font-black font-mono text-[#34d399]">{eur(nuevo.salarioNeto)}</div>
            <div className="text-[10px] text-[#34d399]/50 mt-1">{eur(nuevo.salarioNeto / 12)}/mes</div>
          </div>
        </div>

        {/* Ganancia neta */}
        {incremento > 0 && (
          <>
            <div className="metric-card mb-4"
              style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface2) 90%, transparent), color-mix(in srgb, var(--surface3) 70%, transparent))', borderColor: 'var(--border)' }}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] text-[var(--text)] font-medium mb-1.5">Ganancia neta real</div>
                  <div className="text-2xl font-black font-mono text-[#34d399] tracking-tight">+{eur(difNeto)}<span className="text-base text-[#34d399]/60 ml-1">/año</span></div>
                  <div className="text-sm text-[#34d399]/60 mt-1 font-mono">+{eur(difNeto / 12)}/mes</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[var(--text)] font-medium mb-1">De {eur(incremento)} de subida</div>
                  <div className="text-2xl font-black text-[var(--text-h)]">{pctNeto.toFixed(1)}<span className="text-sm text-[var(--text)] ml-0.5">%</span></div>
                  <div className="text-[10px] text-[var(--text)] opacity-40">te queda</div>
                </div>
              </div>
            </div>

            {/* Tipo marginal */}
            <div className={`metric-card ${alertaCliff ? '' : ''}`}
              style={{
                background: alertaCliff ? 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(249,115,22,0.03))' : 'linear-gradient(135deg, color-mix(in srgb, var(--surface2) 90%, transparent), color-mix(in srgb, var(--surface3) 70%, transparent))',
                borderColor: alertaCliff ? 'rgba(249,115,22,0.22)' : 'var(--border)',
              }}>
              {alertaCliff && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #f97316, #ea580c)' }} />}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold text-[var(--text)] mb-1 uppercase tracking-wider">
                    Tipo marginal efectivo
                    {alertaCliff && <span className="ml-2 text-orange-400 normal-case tracking-normal">⚠ Zona «cliff» Art.20</span>}
                  </div>
                  <div className={`text-2xl font-black font-mono ${alertaCliff ? 'text-orange-400' : 'text-[var(--text-h)]'}`}>
                    {(marginal.tipoMarginalTotal * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-[var(--text)] opacity-40 mt-1">
                    De cada €100 extra de bruto, pagas {(marginal.tipoMarginalTotal * 100).toFixed(1)}€ en IRPF+SS
                  </div>
                </div>
                <div className="text-right text-xs text-[var(--text)]">
                  <div className="text-[10px] font-medium">IRPF marginal</div>
                  <div className="font-mono font-bold text-red-400 text-lg">{(marginal.tipoMarginalIRPF * 100).toFixed(1)}%</div>
                </div>
              </div>
              {alertaCliff && (
                <p className="text-[11px] text-orange-300/80 mt-3 leading-relaxed border-t border-orange-500/10 pt-3">
                  En esta zona, al perder la reducción Art.20 el tipo marginal efectivo es muy alto.
                  Ganar más bruto puede suponer un incremento neto menor al esperado.
                </p>
              )}
            </div>

            {/* Desglose diferencias */}
            <div className="mt-5 space-y-0.5">
              {[
                ['Diferencia IRPF', `+${eur(difIRPF)}`, 'text-red-400'],
                ['Diferencia SS trabajador', `+${eur(difSS)}`, 'text-amber-400'],
                ['Diferencia neta', `+${eur(difNeto)}`, 'text-emerald-400'],
              ].map(([l, v, c]) => (
                <div key={l} className="flex justify-between py-1.5 px-3 text-xs rounded-lg hover:bg-[var(--surface2)]/50 transition-colors">
                  <span className="text-[var(--text)] font-medium">{l}</span>
                  <span className={`font-mono font-bold ${c}`}>{v}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {incremento === 0 && (
          <div className="flex items-center justify-center h-40 text-sm text-[var(--text)] opacity-50">
            <div className="text-center">
              <div className="text-3xl mb-2">↕</div>
              Mueve el slider para ver qué pasa con tu neto
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

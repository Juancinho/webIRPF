import { useState, useMemo } from 'react';
import { calcularNomina, calcularTipoMarginal, ANIOS, obtenerParametros, SMI_ANUAL } from '../engine/irpf';
import { eur, pct, num } from '../utils/format';

const TRAMO_COLORS = ['#60a5fa','#818cf8','#a78bfa','#c084fc','#e879f9','#f472b6'];

export default function CalculadoraCard({ bruto, anio, onChange, onShare, shareLabel }) {
  const [pagas, setPagas] = useState(12);
  const resultado = useMemo(() => calcularNomina(bruto, anio), [bruto, anio]);
  const marginal  = useMemo(() => calcularTipoMarginal(bruto, anio), [bruto, anio]);
  const params    = useMemo(() => obtenerParametros(anio), [anio]);
  const smi = SMI_ANUAL[anio];
  const vecesSMI = bruto > 0 && smi > 0 ? bruto / smi : 0;
  const pagaDisplay = pagas === 14 ? resultado.salarioNeto / 14 : resultado.salarioNeto / 12;
  const pagaLabel   = pagas === 14 ? '14 pagas' : '12 pagas';
  const noPagaIRPF  = resultado.irpfFinal === 0 && bruto > 0;
  const limiteActivo = resultado.limiteRetencion < resultado.cuotaSMI && resultado.cuotaSMI > 0;
  const cliffZone = marginal.tipoMarginalTotal > 0.55;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
      {/* ── Controles ── */}
      <div className="p-6 border-b lg:border-b-0 lg:border-r border-[var(--border)]">

        {/* Salario slider */}
        <div className="mb-6">
          <div className="flex items-baseline justify-between mb-1">
            <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide">Salario bruto anual</label>
            <div className="flex items-center gap-1.5">
              <input type="text" value={num(bruto)}
                onChange={e => { const v = parseInt(e.target.value.replace(/\D/g,''),10); if (!isNaN(v)) onChange('bruto', Math.min(200000, Math.max(0, v))); }}
                className="w-28 bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-2 py-1 text-[var(--text-h)] font-mono text-base text-right outline-none focus:border-[var(--accent)] transition-colors" />
              <span className="text-[var(--text)] font-medium">€</span>
            </div>
          </div>
          <input type="range" min="0" max="150000" step="500" value={bruto}
            onChange={e => onChange('bruto', +e.target.value)} className="w-full mt-2" />
          <div className="flex justify-between text-xs text-[var(--text)] mt-1 opacity-50">
            <span>0 €</span><span>75.000 €</span><span>150.000 €</span>
          </div>

          {/* SMI reference */}
          {bruto > 0 && smi > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap items-center">
              <span className="text-xs text-[var(--text)]">
                SMI {anio}: <strong className="text-[var(--text-h)]">{eur(smi)}</strong>
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${vecesSMI < 1.2 ? 'bg-amber-500/15 text-amber-400' : vecesSMI < 2 ? 'bg-blue-500/15 text-blue-400' : 'bg-purple-500/15 text-purple-400'}`}>
                {vecesSMI.toFixed(2)}× SMI
              </span>
              {noPagaIRPF && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold">Sin IRPF ✓</span>}
              {limiteActivo && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 font-semibold">Límite 43% activo</span>}
            </div>
          )}
        </div>

        {/* Año */}
        <div className="mb-5">
          <label className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide block mb-2">Año fiscal</label>
          <div className="flex flex-wrap gap-1">
            {ANIOS.map(a => (
              <button key={a} onClick={() => onChange('anio', a)}
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all border ${anio === a
                  ? 'bg-[var(--accent)] border-[var(--accent)] text-white shadow-lg shadow-blue-500/25'
                  : 'border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent-light)]'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Pagas toggle + Share */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs">
            {[12, 14].map(n => (
              <button key={n} onClick={() => setPagas(n)}
                className={`px-3 py-1.5 font-semibold transition-all ${pagas === n ? 'bg-[var(--accent)] text-white' : 'text-[var(--text)] hover:bg-[var(--surface2)]'}`}>
                {n} pagas
              </button>
            ))}
          </div>
          <button onClick={onShare}
            className="px-3 py-1.5 rounded-lg text-xs border border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent-light)] transition-all flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
            {shareLabel || 'Compartir'}
          </button>
        </div>

        {/* Barra visual neto/SS/IRPF */}
        {bruto > 0 && (
          <div className="mt-5">
            <div className="flex h-7 rounded-xl overflow-hidden w-full gap-0.5">
              {[
                [resultado.salarioNeto / bruto * 100, '#10b981', '#059669', 'Neto'],
                [resultado.cotTra / bruto * 100, '#f59e0b', '#d97706', 'SS'],
                [resultado.irpfFinal / bruto * 100, '#ef4444', '#dc2626', 'IRPF'],
              ].map(([w, c1, c2, label]) => (
                <div key={label} className="flex items-center justify-center text-xs font-bold text-white/90 transition-all duration-500"
                  style={{ width: `${Math.max(0, w)}%`, background: `linear-gradient(90deg,${c1},${c2})` }}>
                  {w > 10 ? `${w.toFixed(0)}%` : ''}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-1.5 text-xs text-[var(--text)] flex-wrap">
              {[['#10b981','Neto',resultado.salarioNeto/bruto*100],['#f59e0b','SS',resultado.cotTra/bruto*100],['#ef4444','IRPF',resultado.irpfFinal/bruto*100]].map(([c,l,p]) => (
                <span key={l} className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{background:c}}/>
                  {l} {p.toFixed(1)}%
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Resultado ── */}
      <div className="p-6">
        {/* Números clave */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20 col-span-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-emerald-400 font-medium mb-1">Salario neto anual</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">{eur(resultado.salarioNeto)}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-emerald-400/70 mb-1">{pagaLabel}</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">{eur(pagaDisplay)}</div>
                <div className="text-xs text-emerald-400/50">por paga</div>
              </div>
            </div>
          </div>
          <div className="bg-[var(--surface2)] rounded-xl p-3 border border-[var(--border)]">
            <div className="text-xs text-[var(--text)] mb-1">Tipo efectivo IRPF</div>
            <div className="text-lg font-black font-mono text-[var(--text-h)]">{pct(resultado.tipoEfectivoIRPF * 100)}</div>
            <div className="text-xs text-[var(--text)]/50 mt-0.5">Total c/SS: {pct(resultado.tipoEfectivoTotal * 100)}</div>
          </div>
          <div className={`rounded-xl p-3 border ${cliffZone ? 'bg-orange-500/10 border-orange-500/30' : 'bg-[var(--surface2)] border-[var(--border)]'}`}>
            <div className={`text-xs mb-1 ${cliffZone ? 'text-orange-400' : 'text-[var(--text)]'}`}>Tipo marginal efectivo</div>
            <div className={`text-lg font-black font-mono ${cliffZone ? 'text-orange-400' : 'text-[var(--text-h)]'}`}>
              {pct(marginal.tipoMarginalTotal * 100)}
            </div>
            <div className="text-xs text-[var(--text)]/50 mt-0.5">
              {cliffZone ? '⚠ Zona cliff Art.20' : `te quedas ${pct(marginal.netoMarginal * 100)} de cada €100 extra`}
            </div>
          </div>
        </div>

        {/* Desglose */}
        <div className="space-y-0.5 text-sm">
          <Fila label="Salario bruto" valor={eur(bruto)} bold />
          <Fila label="− SS trabajador" valor={`−${eur(resultado.cotTra)}`} c="text-amber-400" sub={pct(resultado.cotTra/bruto*100)} />
          {params.gastosFijos > 0 && <Fila label="− Gastos fijos Art.19" valor={`−${eur(params.gastosFijos)}`} c="text-amber-400" />}
          <Fila label="− Reducción Art.20" valor={`−${eur(resultado.redTrabajo)}`} c="text-amber-400" />
          <div className="border-t border-[var(--border)] my-1.5" />
          <Fila label="Base imponible" valor={eur(resultado.baseImponible)} bold />
          <Fila label="Cuota IRPF (tramos)" valor={eur(resultado.cuotaIntegra)} />
          <Fila label="− Mínimo personal" valor={`−${eur(resultado.cuotaMinimo)}`} c="text-amber-400" />
          {resultado.deduccionSMI > 0 && <Fila label="− Deducción SMI" valor={`−${eur(resultado.deduccionSMI)}`} c="text-amber-400" />}
          {limiteActivo && <Fila label="↓ Límite 43% Art.85.3" valor={eur(resultado.limiteRetencion)} c="text-orange-400" />}
          <div className="border-t border-[var(--border)] my-1.5" />
          <Fila label="IRPF final" valor={`−${eur(resultado.irpfFinal)}`} c="text-red-400" bold />
          <Fila label="Salario neto" valor={eur(resultado.salarioNeto)} c="text-emerald-400" bold />
        </div>

        {/* Tramos aplicados */}
        {resultado.baseImponible > 0 && (
          <div className="mt-4 space-y-1.5">
            <p className="text-xs font-semibold text-[var(--text)] uppercase tracking-wide mb-2">Tramos IRPF aplicados</p>
            {(() => {
              let prev = 0;
              return params.tramos.map(([lim, tipo], i) => {
                const desde = prev;
                const limReal = lim === Infinity ? resultado.baseImponible : lim;
                const enRango = resultado.baseImponible > desde;
                const lleno = resultado.baseImponible >= limReal;
                const fraccion = !enRango ? 0 : lleno ? 1 : (resultado.baseImponible - desde) / (limReal - desde);
                if (!enRango) { prev = limReal; return null; }
                const cuota = lleno ? (limReal - desde) * tipo : (resultado.baseImponible - desde) * tipo;
                prev = limReal;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-28 text-right text-xs text-[var(--text)] shrink-0 font-mono">
                      {lim === Infinity ? `+${eur(desde)}` : `${eur(desde)}–${eur(lim)}`}
                    </div>
                    <div className="flex-1 bg-[var(--border)] rounded-full h-2.5 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${fraccion*100}%`, background: TRAMO_COLORS[i%TRAMO_COLORS.length] }} />
                    </div>
                    <div className="w-10 text-xs font-mono shrink-0 text-right" style={{ color: TRAMO_COLORS[i%TRAMO_COLORS.length] }}>
                      {(tipo*100).toFixed(1)}%
                    </div>
                    <div className="w-14 text-xs font-mono text-right text-[var(--text-h)] shrink-0">{eur(cuota)}</div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

function Fila({ label, valor, c, bold, sub }) {
  return (
    <div className={`flex justify-between items-center py-1 px-2 rounded-lg ${bold ? 'bg-[var(--surface2)]' : ''}`}>
      <span className={`${bold ? 'font-semibold text-[var(--text-h)]' : 'text-[var(--text)]'} text-xs`}>
        {label}{sub && <span className="ml-2 opacity-40">{sub}</span>}
      </span>
      <span className={`font-mono text-xs font-semibold ${c || (bold ? 'text-[var(--text-h)]' : 'text-[var(--text)]')}`}>{valor}</span>
    </div>
  );
}

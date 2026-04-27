import { useState, useMemo } from 'react';
import { calcularNomina, calcularTipoMarginal, ANIOS, obtenerParametros, SMI_ANUAL, DEFAULT_OPTS } from '../engine/irpf';
import { eur, pct, num } from '../utils/format';
import ConfigPanel from './ConfigPanel';

const TRAMO_COLORS = ['#d4a853','#c9956b','#34d399','#fbbf24','#fb923c','#f87171'];

export default function CalculadoraCard({ bruto, anio, onChange, onShare, shareLabel, opts: optsProp, onOptsChange }) {
  const [pagas, setPagas] = useState(12);
  const [configOpen, setConfigOpen] = useState(false);
  const opts = optsProp || DEFAULT_OPTS;
  const resultado = useMemo(() => calcularNomina(bruto, anio, opts), [bruto, anio, opts]);
  const marginal  = useMemo(() => calcularTipoMarginal(bruto, anio, opts), [bruto, anio, opts]);
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
      <div className="p-5 sm:p-6 lg:p-7 border-b lg:border-b-0 lg:border-r border-[var(--border)]">

        {/* Salario slider */}
        <div className="mb-7">
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-[10px] font-bold text-[var(--text)] uppercase tracking-[0.1em]">Salario bruto anual</label>
            <div className="flex items-center gap-2">
              <input type="text" value={num(bruto)}
                onChange={e => { const v = parseInt(e.target.value.replace(/\D/g,''),10); if (!isNaN(v)) onChange('bruto', Math.min(200000, Math.max(0, v))); }}
                className="input-field w-28" />
              <span className="text-[var(--text)] font-semibold text-sm">€</span>
            </div>
          </div>
          <input type="range" min="0" max="150000" step="500" value={bruto}
            onChange={e => onChange('bruto', +e.target.value)} className="w-full mt-1" />
          <div className="flex justify-between text-[10px] text-[var(--text)] mt-1.5 opacity-40 font-medium">
            <span>0 €</span><span>75.000 €</span><span>150.000 €</span>
          </div>

          {/* SMI reference */}
          {bruto > 0 && smi > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap items-center">
              <span className="text-xs text-[var(--text)]">
                SMI {anio}: <strong className="text-[var(--text-h)]">{eur(smi)}</strong>
              </span>
              <span className={`tag ${vecesSMI < 1.2 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : vecesSMI < 2 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                {vecesSMI.toFixed(2)}× SMI
              </span>
              {noPagaIRPF && <span className="tag bg-emerald-500/10 text-emerald-400 border-emerald-500/20">✓ Sin IRPF</span>}
              {limiteActivo && <span className="tag bg-orange-500/10 text-orange-400 border-orange-500/20">Límite 43% activo</span>}
            </div>
          )}
        </div>

        {/* Año */}
        <div className="mb-6">
          <label className="text-[10px] font-bold text-[var(--text)] uppercase tracking-[0.1em] block mb-2.5">Año fiscal</label>
          <div className="flex flex-wrap gap-1.5">
            {ANIOS.map(a => (
              <button key={a} onClick={() => onChange('anio', a)}
                className={`year-btn ${anio === a ? 'active' : ''}`}
                style={anio === a ? { background: 'linear-gradient(135deg, var(--accent), var(--accent2))', boxShadow: '0 2px 12px rgba(56,189,248,0.25)' } : {}}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Pagas toggle + Share */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex rounded-xl border border-[var(--border)] overflow-hidden text-xs">
            {[12, 14].map(n => (
              <button key={n} onClick={() => setPagas(n)}
                className={`px-4 py-2 font-semibold transition-all ${pagas === n ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)]' : 'text-[var(--text)] hover:bg-[var(--surface2)]'}`}
                style={pagas === n ? { color: '#fff' } : {}}>
                {n} pagas
              </button>
            ))}
          </div>
          <button onClick={onShare} className="btn-ghost flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
            {shareLabel || 'Compartir'}
          </button>
          {onOptsChange && (
            <button onClick={() => setConfigOpen(o => !o)}
              className="btn-ghost flex items-center gap-1.5 ml-auto"
              style={configOpen ? { color: 'var(--accent)' } : {}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>
              Perfil fiscal
            </button>
          )}
        </div>

        {/* Config panel expandible */}
        {onOptsChange && (
          <div className={`config-panel ${configOpen ? 'is-open' : ''}`} style={{ marginTop: configOpen ? 0 : undefined }}>
            <div>
              <ConfigPanel opts={opts} onChange={onOptsChange} anio={anio} compact />
            </div>
          </div>
        )}

        {/* Barra visual neto/SS/IRPF */}
        {bruto > 0 && (
          <div className="mt-6">
            <div className="distribution-bar" style={{ height: '12px' }}>
              {[
                [resultado.salarioNeto / bruto * 100, '#10b981', '#059669', 'Neto'],
                [resultado.cotTra / bruto * 100, '#f59e0b', '#d97706', 'SS'],
                [resultado.irpfFinal / bruto * 100, '#ef4444', '#dc2626', 'IRPF'],
              ].map(([w, c1, c2, label]) => (
                <div key={label} className="flex items-center justify-center text-[9px] font-bold text-white/90 transition-all duration-700"
                  style={{ width: `${Math.max(0, w)}%`, background: `linear-gradient(90deg,${c1},${c2})`, borderRadius: '999px' }}>
                  {w > 12 ? `${w.toFixed(0)}%` : ''}
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-2.5 text-xs text-[var(--text)] flex-wrap">
              {[['#10b981','Neto',resultado.salarioNeto/bruto*100],['#f59e0b','SS',resultado.cotTra/bruto*100],['#ef4444','IRPF',resultado.irpfFinal/bruto*100]].map(([c,l,p]) => (
                <span key={l} className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-md inline-block" style={{background:c, boxShadow:`0 2px 8px ${c}40`}}/>
                  {l} {p.toFixed(1)}%
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Resultado ── */}
      <div className="p-5 sm:p-6 lg:p-7">
        {/* Números clave */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Neto principal */}
          <div className="metric-card col-span-2"
            style={{
              background: 'linear-gradient(135deg, rgba(52,211,153,0.06), rgba(52,211,153,0.02))',
              borderColor: 'rgba(52,211,153,0.18)',
            }}>
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #34d399, #10b981)' }} />
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] text-[#34d399]/80 font-bold uppercase tracking-wider mb-1.5">Salario neto anual</div>
                <div className="text-3xl font-black text-[#34d399] font-mono tracking-tight">{eur(resultado.salarioNeto)}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-[#34d399]/50 font-medium mb-1">{pagaLabel}</div>
                <div className="text-xl font-bold text-[#34d399] font-mono">{eur(pagaDisplay)}</div>
                <div className="text-[10px] text-[#34d399]/40 font-medium">por paga</div>
              </div>
            </div>
          </div>

          {/* Tipo efectivo */}
          <div className="metric-card group" style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="text-[10px] text-[var(--text)] font-medium">Tipo efectivo IRPF</div>
              <span className="w-3.5 h-3.5 rounded-full border border-[var(--border)] text-[8px] font-bold text-[var(--text)] flex items-center justify-center cursor-help opacity-50 group-hover:opacity-100 group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-all">?</span>
            </div>
            <div className="text-xl font-black font-mono text-[var(--text-h)]">{pct(resultado.tipoEfectivoIRPF * 100)}</div>
            <div className="text-[10px] text-[var(--text)] opacity-40 mt-0.5">Total c/SS: {pct(resultado.tipoEfectivoTotal * 100)}</div>
            <div className="overflow-hidden max-h-0 group-hover:max-h-20 transition-all duration-300 ease-in-out">
              <p className="text-[10px] text-[var(--accent-light)] mt-2 pt-2 border-t border-[var(--border)] leading-relaxed">
                 De cada 100€ que ganas, {pct(resultado.tipoEfectivoIRPF * 100)} van al IRPF. Es la media real, no el tipo del tramo.
              </p>
            </div>
          </div>

          {/* Tipo marginal */}
          <div className={`metric-card group`}
            style={{
              background: cliffZone ? 'rgba(249,115,22,0.08)' : 'var(--surface2)',
              borderColor: cliffZone ? 'rgba(249,115,22,0.2)' : 'var(--border)',
            }}>
            {cliffZone && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, #f97316, #ea580c)' }} />}
            <div className="flex items-center gap-1.5 mb-1">
              <div className={`text-[10px] font-medium ${cliffZone ? 'text-orange-400' : 'text-[var(--text)]'}`}>Tipo marginal efectivo</div>
              <span className="w-3.5 h-3.5 rounded-full border border-[var(--border)] text-[8px] font-bold text-[var(--text)] flex items-center justify-center cursor-help opacity-50 group-hover:opacity-100 group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-all">?</span>
            </div>
            <div className={`text-xl font-black font-mono ${cliffZone ? 'text-orange-400' : 'text-[var(--text-h)]'}`}>
              {pct(marginal.tipoMarginalTotal * 100)}
            </div>
            <div className="text-[10px] text-[var(--text)] opacity-40 mt-0.5">
              {cliffZone ? 'Zona cliff Art.20' : `te quedas ${pct(marginal.netoMarginal * 100)} de cada €100 extra`}
            </div>
            <div className="overflow-hidden max-h-0 group-hover:max-h-24 transition-all duration-300 ease-in-out">
              <p className="text-[10px] mt-2 pt-2 border-t border-[var(--border)] leading-relaxed" style={{ color: cliffZone ? '#fdba74' : 'var(--accent-light)' }}>
                 Si te suben el sueldo 100€, {pct(marginal.tipoMarginalTotal * 100)} se los queda Hacienda+SS. Es más alto que el tipo efectivo porque se aplica solo al "siguiente euro".
              </p>
            </div>
          </div>
        </div>

        {/* Desglose */}
        <div className="space-y-0.5 text-sm">
          <Fila label="Salario bruto" valor={eur(bruto)} bold />
          {opts.regimen === 'autonomo'
            ? <Fila label="− Cuota SS autónomo" valor={`−${eur(resultado.cotTra)}`} c="text-amber-400" sub={pct(resultado.cotTra/bruto*100)} />
            : <Fila label="− SS trabajador" valor={`−${eur(resultado.cotTra)}`} c="text-amber-400" sub={pct(resultado.cotTra/bruto*100)} />
          }
          {params.gastosFijos > 0 && opts.regimen !== 'autonomo' && <Fila label="− Gastos fijos Art.19" valor={`−${eur(params.gastosFijos)}`} c="text-amber-400" />}
          {opts.regimen === 'autonomo' && resultado.gastosFijos > 0 && <Fila label="− Gastos difícil justif. (5%)" valor={`−${eur(resultado.gastosFijos)}`} c="text-amber-400" />}
          {opts.regimen !== 'autonomo' && <Fila label="− Reducción Art.20" valor={`−${eur(resultado.redTrabajo)}`} c="text-amber-400" />}
          <div className="divider-glow" />
          <Fila label="Base imponible" valor={eur(resultado.baseImponible)} bold />
          <Fila label="Cuota IRPF (tramos)" valor={eur(resultado.cuotaIntegra)} />
          <Fila label="− Mínimo pers./familiar" valor={`−${eur(resultado.cuotaMinimo)}`} c="text-amber-400" />
          {resultado.deduccionSMI > 0 && <Fila label="− Deducción SMI" valor={`−${eur(resultado.deduccionSMI)}`} c="text-amber-400" />}
          {limiteActivo && <Fila label="Límite 43% Art.85.3" valor={eur(resultado.limiteRetencion)} c="text-orange-400" />}
          <div className="divider-glow" />
          <Fila label="IRPF final" valor={`−${eur(resultado.irpfFinal)}`} c="text-red-400" bold />
          <Fila label="Salario neto" valor={eur(resultado.salarioNeto)} c="text-emerald-400" bold />
        </div>

        {/* Tramos aplicados */}
        {resultado.baseImponible > 0 && (
          <div className="mt-5 space-y-2">
            <p className="text-[10px] font-bold text-[var(--text)] uppercase tracking-[0.1em] mb-3">Tramos IRPF aplicados</p>
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
                  <div key={i} className="flex items-center gap-2.5 group">
                    <div className="w-28 text-right text-[10px] text-[var(--text)] shrink-0 font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                      {lim === Infinity ? `+${eur(desde)}` : `${eur(desde)}–${eur(lim)}`}
                    </div>
                    <div className="tramo-bar flex-1">
                      <div style={{ width: `${fraccion*100}%`, background: `linear-gradient(90deg, ${TRAMO_COLORS[i%TRAMO_COLORS.length]}, ${TRAMO_COLORS[i%TRAMO_COLORS.length]}cc)` }} />
                    </div>
                    <div className="w-10 text-[11px] font-mono font-bold shrink-0 text-right transition-all" style={{ color: TRAMO_COLORS[i%TRAMO_COLORS.length] }}>
                      {(tipo*100).toFixed(1)}%
                    </div>
                    <div className="w-14 text-[11px] font-mono text-right text-[var(--text-h)] shrink-0 opacity-70">{eur(cuota)}</div>
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
    <div className={`flex justify-between items-center py-1.5 px-3 rounded-lg transition-all ${bold ? 'bg-[var(--surface2)]' : 'hover:bg-[var(--surface2)]/50'}`}>
      <span className={`${bold ? 'font-semibold text-[var(--text-h)]' : 'text-[var(--text)]'} text-xs`}>
        {label}{sub && <span className="ml-2 opacity-30">{sub}</span>}
      </span>
      <span className={`font-mono text-xs font-semibold ${c || (bold ? 'text-[var(--text-h)]' : 'text-[var(--text)]')}`}>{valor}</span>
    </div>
  );
}

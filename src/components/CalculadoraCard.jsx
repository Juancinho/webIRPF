import { useState, useMemo } from 'react';
import { calcularNomina, calcularTipoMarginal, ANIOS, obtenerParametros, SMI_ANUAL, DEFAULT_OPTS, REGIONES } from '../engine/irpf';
import { eur, pct, num } from '../utils/format';
import ConfigPanel from './ConfigPanel';
import ConceptDetails from './ConceptDetails';
import FiscalBreakdown from './FiscalBreakdown';
import BracketChart from './BracketChart';

export default function CalculadoraCard({ bruto, anio, onChange, onShare, shareLabel, opts: optsProp, onOptsChange }) {
  const [pagas, setPagas] = useState(12);
  const [configOpen, setConfigOpen] = useState(false);
  const opts = optsProp || DEFAULT_OPTS;
  const region = REGIONES[opts.ccaa] || REGIONES.default;
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
  const efectivoIRPFPor100 = resultado.tipoEfectivoIRPF * 100;
  const efectivoSSPor100 = bruto > 0 ? (resultado.cotTra / bruto) * 100 : 0;
  const efectivoNetoPor100 = bruto > 0 ? (resultado.salarioNeto / bruto) * 100 : 0;
  const marginalIRPFPor100 = marginal.tipoMarginalIRPF * 100;
  const marginalSSPor100 = (marginal.tipoMarginalTotal - marginal.tipoMarginalIRPF) * 100;
  const marginalNetoPor100 = marginal.netoMarginal * 100;

  return (
    <div className="calculator-layout">
      {/* ── Controles ── */}
      <div className="calculator-controls">

        {/* Salario slider */}
        <div className="mb-7">
          <label className="calculator-label" htmlFor="salary-input">Salario bruto anual</label>
          <div className="salary-input-row">
              <input id="salary-input" type="text" inputMode="numeric" value={num(bruto)}
                onChange={e => { const v = parseInt(e.target.value.replace(/\D/g,''),10); if (!isNaN(v)) onChange('bruto', Math.min(200000, Math.max(0, v))); }}
                className="salary-input" aria-describedby="salary-range-note" />
              <span>€</span>
          </div>
          <input type="range" min="0" max="150000" step="500" value={bruto}
            onChange={e => onChange('bruto', +e.target.value)} className="salary-range" aria-label="Salario bruto anual" />
          <div id="salary-range-note" className="range-scale">
            <span>0 €</span><span>75.000 €</span><span>150.000 €</span>
          </div>

          {/* SMI reference */}
          {bruto > 0 && smi > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap items-center">
              <span className="text-xs text-[var(--text)]">
                SMI {anio}: <strong className="text-[var(--text-h)]">{eur(smi)}</strong>
              </span>
              <span className="salary-annotation">
                {vecesSMI.toFixed(2)}× SMI
              </span>
              {noPagaIRPF && <span className="salary-annotation">Sin IRPF</span>}
              {limiteActivo && <span className="salary-annotation salary-annotation--signal">Límite 43% activo</span>}
            </div>
          )}
        </div>

        {/* Año */}
        <div className="mb-6">
          <label className="calculator-label">Año fiscal</label>
          <div className="year-timeline" role="group" aria-label="Año fiscal">
            {ANIOS.map(a => (
              <button key={a} onClick={() => onChange('anio', a)}
                className={`year-btn ${anio === a ? 'active' : ''}`}
                aria-pressed={anio === a}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Pagas toggle + Share */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="segmented-control text-xs">
            {[12, 14].map(n => (
              <button key={n} onClick={() => setPagas(n)}
                className={`segmented-control__button px-4 py-2 font-semibold ${pagas === n ? 'is-active' : ''}`}>
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
              className={`btn-ghost flex items-center gap-1.5 ml-auto ${configOpen ? 'is-active' : ''}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/></svg>
              Perfil fiscal · {region.name}
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

        {/* Descomposición contable: un bloque = un punto porcentual */}
        {bruto > 0 && (
          <FiscalBreakdown
            total={bruto}
            segments={[
              { key: 'neto', value: resultado.salarioNeto },
              { key: 'ssTra', value: resultado.cotTra },
              { key: 'irpf', value: resultado.irpfFinal },
            ]}
          />
        )}
      </div>

      {/* ── Resultado ── */}
      <div className="calculator-results" aria-live="polite">
        {/* Números clave */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Neto principal */}
          <div className="metric-card metric-card--primary col-span-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="metric-label">Salario neto anual</div>
                <div className="metric-primary-value font-mono">{eur(resultado.salarioNeto)}</div>
              </div>
              <div className="text-right">
                <div className="metric-side-label">{pagaLabel}</div>
                <div className="metric-side-value font-mono">{eur(pagaDisplay)}</div>
                <div className="metric-side-label">por paga</div>
              </div>
            </div>
          </div>

          {/* Tipo efectivo */}
          <div className="metric-card">
            <div className="text-[10px] text-[var(--text)] font-medium mb-1">Tipo efectivo IRPF</div>
            <div className="text-xl font-black font-mono text-[var(--text-h)]">{pct(resultado.tipoEfectivoIRPF * 100)}</div>
            <div className="text-[10px] text-[var(--text)] opacity-40 mt-0.5">Total c/SS: {pct(resultado.tipoEfectivoTotal * 100)}</div>
          </div>

          {/* Tipo marginal */}
          <div className={`metric-card ${cliffZone ? 'tone-card' : ''}`}
            style={cliffZone ? { '--tone': '#f97316' } : undefined}>
            <div className={`text-[10px] font-medium mb-1 ${cliffZone ? 'text-orange-400' : 'text-[var(--text)]'}`}>Tipo marginal efectivo</div>
            <div className={`text-xl font-black font-mono ${cliffZone ? 'text-orange-400' : 'text-[var(--text-h)]'}`}>
              {pct(marginal.tipoMarginalTotal * 100)}
            </div>
            <div className="text-[10px] text-[var(--text)] opacity-40 mt-0.5">
              {cliffZone ? 'Zona cliff Art.20' : `te quedas ${pct(marginal.netoMarginal * 100)} de cada €100 extra`}
            </div>
          </div>

          {bruto > 0 && (
            <ConceptDetails label="Entender el tipo efectivo y el marginal con tu sueldo" className="col-span-2">
              <div className="concept-comparison">
                <section>
                  <div className="concept-eyebrow">Tipo efectivo</div>
                  <h4>La media sobre todo tu salario bruto</h4>
                  <p>
                    En esta calculadora es el IRPF anual estimado dividido entre el salario bruto anual. Resume tu carga media de IRPF; no es el porcentaje de tu último tramo.
                  </p>
                  <div className="concept-formula">
                    <span>{eur(resultado.irpfFinal)} de IRPF</span>
                    <span>÷ {eur(bruto)} brutos</span>
                    <strong>= {pct(efectivoIRPFPor100)}</strong>
                  </div>
                  <p>
                    Traducido a 100 € brutos: <strong>{eur(efectivoIRPFPor100, 1)}</strong> van a IRPF, <strong>{eur(efectivoSSPor100, 1)}</strong> a tu Seguridad Social y quedan aproximadamente <strong>{eur(efectivoNetoPor100, 1)}</strong> netos.
                  </p>
                </section>

                <section>
                  <div className="concept-eyebrow">Tipo marginal efectivo</div>
                  <h4>Lo que se descuenta de los siguientes 100 €</h4>
                  <p>
                    Compara tu neto actual con el que tendrías al ganar 100 € brutos más. Incluye tanto el IRPF adicional como la cotización adicional del trabajador y el efecto de reducciones o límites que cambien con la renta.
                  </p>
                  <div className="concept-formula">
                    <span>{eur(marginalIRPFPor100, 1)} de IRPF extra</span>
                    <span>+ {eur(marginalSSPor100, 1)} de SS extra</span>
                    <strong>= {eur(marginal.tipoMarginalTotal * 100, 1)} descontados</strong>
                  </div>
                  <p>
                    En tu caso, de esos 100 € adicionales conservarías cerca de <strong>{eur(marginalNetoPor100, 1)}</strong>. El tipo del último tramo aplicado es {pct(resultado.tipoMargIRPF * 100)}, pero el marginal efectivo total puede ser distinto por la SS y por la retirada gradual de beneficios fiscales.
                  </p>
                </section>
              </div>

              <div className="concept-note">
                <strong>La clave:</strong> entrar en un tramo superior no hace que todo tu sueldo tribute a ese porcentaje. Cada tipo se aplica únicamente a la parte de base que cae en su tramo. Por eso el tipo efectivo suele ser menor que el del último tramo.
              </div>

              <div className="concept-why">
                <strong>¿Por qué importa?</strong>
                <p>
                  El efectivo sirve para entender la carga total de tu salario. El marginal sirve para valorar una subida, horas extra o un bonus: aproxima cuánto de ese ingreso adicional llegará realmente a tu bolsillo. Si aparece una zona «cliff», el porcentaje alto afecta al incremento analizado, no a todo el sueldo.
                </p>
              </div>

              <p className="concept-caveat">
                Estimación anual orientativa. La retención mensual de la nómina es un pago a cuenta y puede no coincidir con la cuota final de la declaración.
                {' '}<a href="https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c15-calculo-impuesto-determinacion-cuotas-integras/gravamen-base-liquidable-general/gravamen-estatal.html" target="_blank" rel="noreferrer">Ver metodología de la AEAT</a>.
              </p>
            </ConceptDetails>
          )}
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
          <BracketChart
            base={resultado.baseImponible}
            tramos={resultado.tramos}
            region={anio >= 2024 ? region.name : 'Escala del ejercicio'}
            anio={anio}
          />
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

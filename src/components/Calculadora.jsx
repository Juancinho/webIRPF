import { useState, useMemo } from 'react';
import { calcularNomina, obtenerParametros } from '../engine/irpf';
import { eur, pct, num } from '../utils/format';

const ANIOS = Array.from({ length: 15 }, (_, i) => 2012 + i);

function FilaDetalle({ label, valor, sub, color, bold }) {
  return (
    <div className={`flex justify-between items-center py-2 px-3 rounded-lg ${bold ? 'bg-[var(--surface2)]' : ''}`}>
      <span className={`text-sm ${bold ? 'text-[var(--text-h)] font-semibold' : 'text-[var(--text)]'}`}>
        {label}
        {sub && <span className="text-xs text-[var(--text)] ml-1 opacity-60">{sub}</span>}
      </span>
      <span className={`text-sm font-mono font-semibold ${color || (bold ? 'text-[var(--text-h)]' : 'text-[var(--text)]')}`}>
        {valor}
      </span>
    </div>
  );
}

function TipoEfectivo({ tipo, label }) {
  const pct_val = tipo * 100;
  const color = pct_val < 10 ? 'var(--green)' : pct_val < 20 ? 'var(--yellow)' : 'var(--red)';
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${Math.min(pct_val, 100)}, 100`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold" style={{ color }}>{pct_val.toFixed(1)}%</span>
        </div>
      </div>
      <span className="text-xs text-[var(--text)] mt-1 text-center">{label}</span>
    </div>
  );
}

export default function Calculadora() {
  const [bruto, setBruto] = useState(35000);
  const [anio, setAnio] = useState(2026);

  const resultado = useMemo(() => calcularNomina(bruto, anio), [bruto, anio]);
  const params = useMemo(() => obtenerParametros(anio), [anio]);

  const inputBruto = (e) => {
    const v = parseInt(e.target.value.replace(/\D/g, ''), 10);
    if (!isNaN(v)) setBruto(Math.min(200000, Math.max(0, v)));
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Salario */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Salario Bruto Anual</label>
            <div className="flex items-center gap-3 mb-3">
              <input
                type="text"
                value={num(bruto)}
                onChange={inputBruto}
                className="w-40 bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text-h)] font-mono text-lg text-right outline-none focus:border-[var(--accent)]"
              />
              <span className="text-[var(--text)]">€</span>
            </div>
            <input
              type="range" min="0" max="150000" step="500"
              value={bruto} onChange={e => setBruto(+e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-[var(--text)] mt-1">
              <span>0 €</span><span>75.000 €</span><span>150.000 €</span>
            </div>
          </div>
          {/* Año */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Año fiscal</label>
            <div className="grid grid-cols-5 gap-1.5">
              {ANIOS.map(a => (
                <button key={a} onClick={() => setAnio(a)}
                  className={`py-1.5 rounded-lg text-sm font-medium transition-all ${anio === a ? 'tab-active' : 'tab-inactive border border-[var(--border)]'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Resumen visual */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Salario Neto', val: resultado.salarioNeto, color: 'text-[var(--green)]' },
          { label: 'IRPF Pagado', val: resultado.irpfFinal, color: 'text-[var(--red)]' },
          { label: 'SS Trabajador', val: resultado.cotTra, color: 'text-[var(--yellow)]' },
          { label: 'Coste Empresa', val: resultado.costeLab, color: 'text-[var(--text-h)]' },
        ].map(({ label, val, color }) => (
          <div key={label} className="card p-4">
            <div className="text-xs text-[var(--text)] mb-1">{label}</div>
            <div className={`text-xl font-bold font-mono ${color}`}>{eur(val)}</div>
            <div className="text-xs text-[var(--text)] mt-1">{bruto > 0 ? pct(val / bruto) : '—'} del bruto</div>
          </div>
        ))}
      </div>

      {/* Desglose y Tipos efectivos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Desglose detallado */}
        <div className="card p-5 md:col-span-2 space-y-1">
          <h3 className="text-sm font-semibold text-[var(--text-h)] mb-3">Desglose del cálculo</h3>
          <FilaDetalle label="Salario Bruto" valor={eur(bruto)} bold />
          <div className="border-t border-[var(--border)] my-2" />
          <FilaDetalle label="Cotización SS Trabajador" sub="(aprox. 6.5%)" valor={`- ${eur(resultado.cotTra)}`} color="text-[var(--red)]" />
          <FilaDetalle label="Rendimiento previo" valor={eur(resultado.rnPrevio)} />
          {params.gastosFijos > 0 && <FilaDetalle label="Gastos deducibles (Art. 19)" sub="fijos" valor={`- ${eur(params.gastosFijos)}`} color="text-[var(--yellow)]" />}
          <FilaDetalle label="Reducción por rendimiento del trabajo (Art. 20)" valor={`- ${eur(resultado.redTrabajo)}`} color="text-[var(--yellow)]" />
          <FilaDetalle label="Base Imponible" valor={eur(resultado.baseImponible)} bold />
          <div className="border-t border-[var(--border)] my-2" />
          <FilaDetalle label="Cuota íntegra (escala IRPF)" valor={eur(resultado.cuotaIntegra)} />
          <FilaDetalle label="Cuota mínimo personal" valor={`- ${eur(resultado.cuotaMinimo)}`} color="text-[var(--yellow)]" />
          {resultado.deduccionSMI > 0 && <FilaDetalle label="Deducción por SMI" valor={`- ${eur(resultado.deduccionSMI)}`} color="text-[var(--yellow)]" />}
          {resultado.limiteRetencion < resultado.cuotaSMI && (
            <FilaDetalle label="Límite 43% Art.85.3 (aplicado)" valor={eur(resultado.limiteRetencion)} color="text-orange-400" />
          )}
          <div className="border-t border-[var(--border)] my-2" />
          <FilaDetalle label="IRPF Final" valor={eur(resultado.irpfFinal)} bold color="text-[var(--red)]" />
          <FilaDetalle label="Salario Neto" valor={eur(resultado.salarioNeto)} bold color="text-[var(--green)]" />
          <FilaDetalle label="Neto mensual (÷12)" valor={eur(resultado.salarioNeto / 12)} color="text-[var(--green)]" />
        </div>

        {/* Tipos efectivos */}
        <div className="card p-5 flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-[var(--text-h)] mb-4">Tipos efectivos</h3>
          <div className="flex flex-col gap-4 items-center flex-1 justify-center">
            <TipoEfectivo tipo={resultado.tipoEfectivoIRPF} label="Tipo efectivo IRPF" />
            <TipoEfectivo tipo={resultado.tipoEfectivoTotal} label="Tipo efectivo total (IRPF + SS)" />
            <TipoEfectivo tipo={resultado.cotEmp / (resultado.costeLab || 1)} label="SS Empresa / Coste laboral" />
          </div>

          <div className="border-t border-[var(--border)] pt-3 mt-4 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text)]">SS Empresa</span>
              <span className="text-[var(--text-h)] font-mono">{eur(resultado.cotEmp)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text)]">Coste laboral total</span>
              <span className="text-[var(--text-h)] font-mono">{eur(resultado.costeLab)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tramos aplicados */}
      <TramosVisuales baseImponible={resultado.baseImponible} tramos={params.tramos} anio={anio} />
    </div>
  );
}

function TramosVisuales({ baseImponible, tramos, anio }) {
  const COLORES = ['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#10b981'];
  let prev = 0;
  const segmentos = tramos.map(([ lim, tipo ], i) => {
    const limReal = lim === Infinity ? Math.max(baseImponible, prev + 1) : lim;
    const desde = prev;
    const hasta = limReal;
    const enRango = baseImponible > desde;
    const lleno = baseImponible >= hasta;
    const fraccion = enRango ? (lleno ? 1 : (baseImponible - desde) / (hasta - desde)) : 0;
    prev = hasta === Infinity ? prev : hasta;
    return { desde, hasta: lim, tipo, fraccion, lleno, color: COLORES[i % COLORES.length] };
  }).filter(s => s.desde < (baseImponible > 0 ? baseImponible + 1 : 1));

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-[var(--text-h)] mb-4">Tramos IRPF aplicados — {anio}</h3>
      <div className="space-y-2">
        {segmentos.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-24 text-xs text-right text-[var(--text)] shrink-0">
              {s.hasta === Infinity ? `+${eur(s.desde)}` : `${eur(s.desde)}–${eur(s.hasta)}`}
            </div>
            <div className="flex-1 bg-[var(--border)] rounded-full h-4 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${s.fraccion * 100}%`, background: s.color }} />
            </div>
            <div className="w-12 text-xs font-mono text-right shrink-0" style={{ color: s.color }}>
              {(s.tipo * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
      {baseImponible <= 0 && (
        <p className="text-center text-[var(--text)] text-sm mt-3">Base imponible 0 — no hay IRPF a pagar</p>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { calcularNomina, calcularTipoMarginal, ANIOS } from '../engine/irpf';
import { eur, pct } from '../utils/format';

const SECTIONS = [
  { id: 'calc', n: '1', label: 'Calculadora' },
  { id: 'simulador', n: '2', label: 'Simulador de subida' },
  { id: 'comparativa', n: '3', label: 'Comparativa histórica' },
  { id: 'cuÃ±a', n: '4', label: 'Cuña fiscal' },
  { id: 'mecanismos', n: '5', label: 'Mecanismos fiscales' },
  { id: 'normativa', n: '6', label: 'Normativa y contexto' },
];

export default function SidebarWidget({ bruto, anio, onChange }) {
  const [activeId, setActiveId] = useState('calc');

  useEffect(() => {
    const els = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const r = useMemo(() => calcularNomina(bruto, anio), [bruto, anio]);
  const m = useMemo(() => calcularTipoMarginal(bruto, anio), [bruto, anio]);

  const scroll = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-5 pb-8">

      {/* â”€â”€ Controles â”€â”€ */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-3 px-1">
          ConfiguraciÃ³n
        </p>

        {/* Bruto slider */}
        <div className="metric-mini mb-2">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="metric-mini-label">Salario bruto anual</span>
            <span className="font-mono font-bold text-[13px]" style={{ color: 'var(--accent)' }}>{eur(bruto)}</span>
          </div>
          <input
            type="range" min="0" max="150000" step="500"
            value={bruto}
            onChange={e => onChange('bruto', +e.target.value)}
            className="w-full"
            style={{ marginTop: 4 }}
          />
          <div className="flex justify-between text-[9px] text-[var(--text-soft)] mt-1 font-medium">
            <span>0 â‚¬</span><span>75kâ‚¬</span><span>150kâ‚¬</span>
          </div>
        </div>

        {/* AÃ±o */}
        <div className="metric-mini">
          <span className="metric-mini-label block mb-2">Año fiscal</span>
          <div className="flex flex-wrap gap-1">
            {ANIOS.map(a => (
              <button key={a} onClick={() => onChange('anio', a)}
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-md transition-all duration-150"
                style={anio === a ? {
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  color: 'var(--accent-on)',
                  boxShadow: '0 1px 6px var(--glow-accent)',
                } : {
                  background: 'var(--surface3)',
                  color: 'var(--text-soft)',
                }}>
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)' }} />

      {/* â”€â”€ Live metrics â”€â”€ */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-2.5 px-1">
          Resultado
        </p>

        {/* Neto */}
        <div className="metric-mini mb-2">
          <div className="metric-mini-label">Neto anual</div>
          <div className="metric-mini-value">{eur(r.salarioNeto)}</div>
          <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all duration-300" style={{
              width: `${bruto > 0 ? (r.salarioNeto / bruto * 100).toFixed(0) : 0}%`,
              background: 'linear-gradient(90deg, var(--accent2), var(--accent))'
            }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-[var(--text-soft)]">del bruto</span>
            <span className="text-[9px] font-mono" style={{ color: 'var(--accent)' }}>
              {bruto > 0 ? (r.salarioNeto / bruto * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>

        {/* Tipos */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="metric-mini">
            <div className="metric-mini-label">T. efectivo</div>
            <div className="metric-mini-value" style={{ color: 'var(--red)' }}>
              {pct(r.tipoEfectivoIRPF * 100)}
            </div>
            <div className="text-[9px] text-[var(--text-soft)] mt-0.5">IRPF / bruto</div>
          </div>
          <div className="metric-mini">
            <div className="metric-mini-label">T. marginal</div>
            <div className="metric-mini-value" style={{ color: 'var(--yellow)' }}>
              {pct(m.tipoMarginalTotal * 100)}
            </div>
            <div className="text-[9px] text-[var(--text-soft)] mt-0.5"> último €</div>
          </div>
        </div>

        {/* Retenciones */}
        <div className="metric-mini">
          <div className="metric-mini-label">Retenciones totales</div>
          <div className="flex justify-between items-center">
            <span className="metric-mini-value">{eur(r.irpfFinal + r.cotTra)}</span>
            <span className="text-[9px] font-mono text-[var(--text-soft)]">{pct(r.tipoEfectivoTotal * 100)}</span>
          </div>
          <div className="flex gap-1 mt-1.5">
            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'var(--glow-red)', color: 'var(--red)' }}>
              IRPF {eur(r.irpfFinal)}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--yellow)' }}>
              SS {eur(r.cotTra)}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)' }} />

      {/* â”€â”€ TOC Navigation â”€â”€ */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-2 px-1">
          Secciones
        </p>
        <nav className="space-y-0.5">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => scroll(s.id)}
              className={`toc-link ${activeId === s.id ? 'active' : ''}`}>
              <span className="toc-num">{s.n}</span>
              {s.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)' }} />

      <p className="text-[9px] text-[var(--text-soft)] leading-relaxed px-1">
        Solo tarifa estatal · Cálculos orientativos · BOE, INE, TGSS
      </p>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { calcularNomina } from '../engine/irpf';
import { eur } from '../utils/format';

/* ── Paleta de segmentos ── */
const SEG = {
  neto:     { color: '#22d3ee', label: 'Salario neto',        desc: 'Lo que recibes en tu cuenta' },
  irpf:     { color: '#f43f5e', label: 'IRPF retenido',       desc: 'Lo que va a Hacienda' },
  ssTra:    { color: '#f59e0b', label: 'SS trabajador',        desc: 'Tu cotización a la Seguridad Social' },
  ssEmp:    { color: '#6366f1', label: 'SS empresa',           desc: 'Lo que paga la empresa extra (tú no lo ves)' },
};

/* ── Tooltip custom ── */
function TooltipCuña({ active, payload, total }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  const pct = total > 0 ? (d.value / total * 100).toFixed(1) : 0;
  const seg = SEG[d.dataKey] || SEG[d.name] || { color: '#fff', label: d.name, desc: '' };
  return (
    <div className="card-glass p-4 shadow-2xl text-xs min-w-[220px]" style={{ backdropFilter: 'blur(24px)' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.fill, boxShadow: `0 0 8px ${d.fill}60` }} />
        <span className="font-bold text-[var(--text-h)] text-[13px]">{seg.label}</span>
      </div>
      <p className="font-mono text-[var(--text-h)] text-[15px] font-black">{eur(d.value)}</p>
      <p className="text-[10px] mt-1" style={{ color: d.fill }}>{pct}% del coste total para la empresa</p>
      <p className="text-[10px] text-[var(--text-soft)] mt-1 leading-relaxed">{seg.desc}</p>
    </div>
  );
}

/* ── Etiqueta exterior en el donut ── */
function LabelOuter({ cx, cy, midAngle, outerRadius, percent, name }) {
  if (percent < 0.04) return null;
  const RAD = Math.PI / 180;
  const r = outerRadius + 28;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return (
    <text x={x} y={y} fill="var(--text-soft)" textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central" fontSize={10} fontWeight={600}>
      {(percent * 100).toFixed(1)}%
    </text>
  );
}

export default function CuñaFiscal({ bruto, anio }) {
  const [vista, setVista] = useState('trabajador'); // 'trabajador' | 'empresa'
  const [hover, setHover] = useState(null);

  const r = useMemo(() => calcularNomina(bruto, anio), [bruto, anio]);

  /* ── Segmentos vista trabajador: bruto = neto + IRPF + SS trabajador ── */
  const dataWorker = useMemo(() => [
    { name: 'neto',  value: r.salarioNeto, fill: SEG.neto.color },
    { name: 'irpf',  value: r.irpfFinal,   fill: SEG.irpf.color },
    { name: 'ssTra', value: r.cotTra,       fill: SEG.ssTra.color },
  ].filter(d => d.value > 0), [r]);

  /* ── Segmentos vista empresa: coste laboral = neto + IRPF + SS trabajador + SS empresa ── */
  const dataEmpresa = useMemo(() => [
    { name: 'neto',  value: r.salarioNeto, fill: SEG.neto.color },
    { name: 'irpf',  value: r.irpfFinal,   fill: SEG.irpf.color },
    { name: 'ssTra', value: r.cotTra,       fill: SEG.ssTra.color },
    { name: 'ssEmp', value: r.cotEmp,       fill: SEG.ssEmp.color },
  ].filter(d => d.value > 0), [r]);

  const data  = vista === 'trabajador' ? dataWorker : dataEmpresa;
  const total = vista === 'trabajador' ? r.bruto    : r.costeLab;
  const pctNeto = total > 0 ? (r.salarioNeto / total * 100).toFixed(1) : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--text-h)] tracking-tight">Cuña fiscal</h2>
          <p className="text-sm text-[var(--text-soft)] mt-1">
            Cómo se reparte cada euro de tu sueldo entre <strong className="text-[var(--text-h)] font-semibold">tú</strong>, <strong className="text-red-400 font-semibold">Hacienda</strong> y la <strong className="text-amber-400 font-semibold">Seguridad Social</strong>.
          </p>
        </div>
        {/* Toggle vista */}
        <div className="inline-flex items-center rounded-2xl p-1 shrink-0"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <button onClick={() => setVista('trabajador')}
            className="px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300"
            style={vista === 'trabajador' ? {
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              color: 'white', boxShadow: '0 2px 12px rgba(56,189,248,0.25)',
            } : { color: 'var(--text-soft)' }}>
             Perspectiva trabajador
          </button>
          <button onClick={() => setVista('empresa')}
            className="px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300"
            style={vista === 'empresa' ? {
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', boxShadow: '0 2px 12px rgba(99,102,241,0.25)',
            } : { color: 'var(--text-soft)' }}>
             Coste real empresa
          </button>
        </div>
      </div>

      {/* Info banner según vista */}
      <div className="info-card mb-5 text-[13px] text-[var(--text)] leading-relaxed">
        {vista === 'trabajador' ? (
          <>
            <strong className="text-[var(--text-h)] font-semibold">Vista trabajador:</strong> muestra cómo se divide tu{' '}
            <strong className="text-[var(--text-h)]">bruto ({eur(r.bruto)})</strong> — lo que aparece en tu contrato.
            La diferencia entre bruto y neto la conforman el IRPF y tu cuota de SS.
          </>
        ) : (
          <>
            <strong className="text-[var(--text-h)] font-semibold">Vista empresa:</strong> muestra el{' '}
            <strong className="text-[var(--text-h)]">coste laboral real ({eur(r.costeLab)})</strong> — lo que la empresa paga en total.
            Incluye además la SS patronal (~31,5%), que el trabajador normalmente no ve en su nómina.
          </>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center">
        {/* Donut */}
        <div className="relative shrink-0" style={{ width: 280, height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%" cy="50%"
                innerRadius={72} outerRadius={110}
                dataKey="value"
                nameKey="name"
                paddingAngle={2}
                labelLine={false}
                label={LabelOuter}
                onMouseEnter={(_, i) => setHover(i)}
                onMouseLeave={() => setHover(null)}
                stroke="none"
              >
                {data.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={entry.fill}
                    opacity={hover === null || hover === i ? 1 : 0.35}
                    style={{ filter: hover === i ? `drop-shadow(0 0 8px ${entry.fill}80)` : 'none', cursor: 'pointer', transition: 'opacity 0.2s, filter 0.2s' }}
                  />
                ))}
              </Pie>
              <Tooltip content={<TooltipCuña total={total} />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Centro del donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[10px] text-[var(--text-soft)] font-semibold uppercase tracking-wider">Neto</p>
            <p className="text-2xl font-black text-[var(--text-h)] font-mono leading-none">{pctNeto}%</p>
            <p className="text-[10px] text-[var(--text-soft)] mt-0.5">{eur(r.salarioNeto)}</p>
          </div>
        </div>

        {/* Leyenda + desglose */}
        <div className="flex-1 w-full space-y-3">
          {data.map((d, i) => {
            const seg = SEG[d.name];
            const pct = total > 0 ? (d.value / total * 100) : 0;
            return (
              <div key={d.name}
                className="rounded-xl p-3.5 border transition-all duration-200 cursor-default"
                style={{
                  background: hover === i ? `${d.fill}0d` : 'var(--surface2)',
                  borderColor: hover === i ? `${d.fill}40` : 'var(--border)',
                }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: d.fill, boxShadow: `0 0 6px ${d.fill}60` }} />
                    <span className="text-[13px] font-semibold text-[var(--text-h)]">{seg.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[var(--text-h)] text-[13px]">{eur(d.value)}</span>
                    <span className="text-[10px] ml-2 font-mono" style={{ color: d.fill }}>{pct.toFixed(1)}%</span>
                  </div>
                </div>
                {/* Barra de progreso */}
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: d.fill, boxShadow: `0 0 6px ${d.fill}60` }} />
                </div>
                <p className="text-[10px] text-[var(--text-soft)] mt-1.5 leading-relaxed">{seg.desc}</p>
              </div>
            );
          })}

          {/* Resumen total */}
          <div className="rounded-xl p-3.5 border mt-2"
            style={{ background: 'var(--surface3)', borderColor: 'var(--border-light)' }}>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-soft)] font-semibold uppercase tracking-wider">
                {vista === 'trabajador' ? 'Sueldo bruto contractual' : 'Coste laboral total empresa'}
              </span>
              <span className="font-mono font-black text-[var(--text-h)] text-[14px]">{eur(total)}</span>
            </div>
            <div className="mt-2 flex gap-2 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee' }}>
                Neto: {pctNeto}%
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e' }}>
                IRPF: {total > 0 ? (r.irpfFinal / total * 100).toFixed(1) : 0}%
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                SS tra: {total > 0 ? (r.cotTra / total * 100).toFixed(1) : 0}%
              </span>
              {vista === 'empresa' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                  SS emp: {total > 0 ? (r.cotEmp / total * 100).toFixed(1) : 0}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

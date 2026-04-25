import { useState, useMemo, useCallback } from 'react';
import {
  ComposedChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea, Legend, Brush
} from 'recharts';
import {
  ANIOS, DATOS_CHART, INFLACION_A_2026, calcularNomina, obtenerParametros,
  SMI_ANUAL, REFORMA_ANIOS
} from '../engine/irpf';
import { eur } from '../utils/format';

export const YEAR_COLORS = {
  2012: '#ef4444', 2013: '#3b82f6', 2014: '#10b981',
  2015: '#f59e0b', 2016: '#8b5cf6', 2017: '#06b6d4',
  2018: '#f97316', 2019: '#ec4899', 2020: '#14b8a6',
  2021: '#6366f1', 2022: '#84cc16', 2023: '#f43f5e',
  2024: '#0ea5e9', 2025: '#d946ef', 2026: '#22d3ee',
};

const GRUPOS = {
  'Años clave': [2012,2015,2019,2023,2026],
  'Crisis 2012–14': [2012,2013,2014],
  'Reforma 2015': [2015,2016,2017],
  '2019+': [2019,2020,2021,2022,2023,2024,2025,2026],
};

/* ── Custom Brush traveller handle ── */
function BrushHandle({ x, y, width, height }) {
  const hw = 12;
  return (
    <g style={{ cursor: 'ew-resize' }}>
      <rect x={x - hw / 2} y={y - 2} width={hw} height={height + 4} rx={6}
        fill="var(--surface)" stroke="var(--accent)" strokeWidth={1.5} 
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
      {[-3, 0, 3].map(dy => (
        <line key={dy}
          x1={x - 2.5} y1={y + height / 2 + dy}
          x2={x + 2.5} y2={y + height / 2 + dy}
          stroke="var(--accent)" strokeWidth={1.2} strokeOpacity={0.8} strokeLinecap="round" />
      ))}
    </g>
  );
}

// Tooltip para el gráfico por nivel salarial
function TooltipSalario({ active, payload, label, ref2026Neto, metrica }) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a, b) => b.value - a.value);
  const isPct = metrica === 'tipo';
  return (
    <div className="card-glass p-4 shadow-2xl text-xs min-w-[260px] max-h-96 overflow-y-auto" style={{ backdropFilter: 'blur(24px)' }}>
      <p className="text-[10px] text-[var(--text-soft)] mb-0.5">Salario bruto equivalente (€2026)</p>
      <p className="font-extrabold text-[var(--text-h)] mb-2.5 border-b border-[var(--border)] pb-2 text-[13px]">{eur(label)}</p>
      <p className="text-[9px] text-[var(--accent-light)] font-semibold uppercase tracking-wider mb-1.5">
        {isPct ? 'Tipo efectivo IRPF' : 'Salario neto resultante'}
      </p>
      {sorted.map(p => {
        const anio = parseInt(p.dataKey.split('_')[1]);
        const diff = !isPct && ref2026Neto != null ? p.value - ref2026Neto : null;
        return (
          <div key={p.dataKey} className="flex justify-between items-center py-0.5 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: YEAR_COLORS[anio], boxShadow: `0 0 6px ${YEAR_COLORS[anio]}40` }} />
              <span style={{ color: YEAR_COLORS[anio] }} className="font-bold w-10">{anio}</span>
            </span>
            <span className="font-mono text-[var(--text-h)]">{isPct ? `${p.value.toFixed(1)}%` : eur(p.value)}</span>
            {diff !== null && (
              <span className={`font-mono text-[10px] ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {diff >= 0 ? '+' : ''}{eur(diff)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Tooltip para el gráfico por año (dual eje)
function TooltipAnio({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const reform = REFORMA_ANIOS.find(r => r.anio === label);
  return (
    <div className="card-glass p-4 shadow-2xl text-xs min-w-[220px]" style={{ backdropFilter: 'blur(24px)' }}>
      <p className="font-extrabold pb-2 mb-2 border-b border-[var(--border)] text-[11px]" style={{ color: YEAR_COLORS[label] }}>
        {label}{reform ? ` · ${reform.label}` : ''}
      </p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5" style={{ color: p.color }}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}40` }} />
            {p.name}
          </span>
          <span className="font-mono text-[var(--text-h)]">{p.dataKey === 'neto' ? eur(p.value) : `${p.value.toFixed(1)}%`}</span>
        </div>
      ))}
    </div>
  );
}

function exportCSV(aniosActivos) {
  const aniosArr = ANIOS.filter(a => aniosActivos.has(a));
  const header = ['Bruto_EUR2026', ...aniosArr.map(a => `neto_${a}`), ...aniosArr.map(a => `tipoIRPF_${a}`), ...aniosArr.map(a => `cargaTotal_${a}`)];
  const rows = DATOS_CHART.map(d => [
    d.bruto,
    ...aniosArr.map(a => d[`neto_${a}`]),
    ...aniosArr.map(a => d[`irpf_${a}`]),
    ...aniosArr.map(a => d[`total_${a}`]),
  ]);
  const csv = [header, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = 'irpf_comparativa.csv'; link.click();
  URL.revokeObjectURL(url);
}

export default function GraficoComparativo({ brutoRef, anioRef }) {
  const [aniosActivos, setAniosActivos] = useState(new Set([2012, 2015, 2019, 2023, 2026]));
  const [vista, setVista] = useState('salario');

  const toggleAnio = useCallback(a => setAniosActivos(prev => {
    const next = new Set(prev);
    if (next.has(a)) { if (next.size > 1) next.delete(a); } else next.add(a);
    return next;
  }), []);

  const bruto2026 = useMemo(() => Math.round(brutoRef * (INFLACION_A_2026[anioRef] || 1)), [brutoRef, anioRef]);
  const params = useMemo(() => obtenerParametros(anioRef), [anioRef]);
  const inf = INFLACION_A_2026[anioRef] || 1;
  const smi2026     = Math.round((SMI_ANUAL[anioRef] || 0) * inf);
  const umbralInf2026 = params.art20Meta.uInf ? Math.round(params.art20Meta.uInf * inf) : null;
  const umbralSup2026 = params.art20Meta.uSup ? Math.round(params.art20Meta.uSup * inf) : null;
  const baseMax2026   = Math.round(params.baseMax * inf);
  const dataPuntoRef  = DATOS_CHART.find(d => d.bruto >= bruto2026) || DATOS_CHART[DATOS_CHART.length - 1];
  const ref2026Neto   = dataPuntoRef ? dataPuntoRef['neto_2026'] : null;

  // Datos para la vista por año (dual eje)
  const dataPorAnio = useMemo(() => ANIOS.map(anio => {
    const i = INFLACION_A_2026[anio];
    const n = calcularNomina(bruto2026 / i, anio);
    return {
      anio,
      neto: Math.round(n.salarioNeto * i),
      irpf: parseFloat((n.tipoEfectivoIRPF * 100).toFixed(2)),
      total: parseFloat((n.tipoEfectivoTotal * 100).toFixed(2)),
      brutoNominal: Math.round(bruto2026 / i),
    };
  }), [bruto2026]);

  const neto2026 = dataPorAnio.find(d => d.anio === 2026)?.neto || 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">¿Cuánto valió tu sueldo en cada año?</h2>
          <p className="text-sm text-[var(--text-soft)] mt-1.5">
            Todo en <strong className="text-white font-semibold">euros constantes de 2026</strong> — la inflación ya está descontada (IPC dic.→dic., INE).
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap shrink-0">
          <div className="flex rounded-xl border border-[var(--border)] overflow-hidden text-xs">
            {[['salario',' Neto por salario'],['tipo',' Tipo efectivo'],['anio',' Evolución por año']].map(([v, l]) => (
              <button key={v} onClick={() => setVista(v)}
                className={`px-3 py-2 font-semibold transition-all ${vista === v ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] text-white' : 'text-[var(--text)] hover:bg-[var(--surface2)]'}`}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={() => exportCSV(aniosActivos)} className="btn-ghost flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            CSV
          </button>
        </div>
      </div>

      {/* ── VISTA POR NIVEL SALARIAL ── */}
      {vista === 'salario' && (
        <>
          {/* Year toggles */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {ANIOS.map(a => (
              <button key={a} onClick={() => toggleAnio(a)}
                className={`year-btn ${aniosActivos.has(a) ? 'active' : ''}`}
                style={aniosActivos.has(a) ? { background: YEAR_COLORS[a], borderColor: YEAR_COLORS[a] } : {}}>
                {a}
              </button>
            ))}
            <div className="w-px bg-[var(--border)] mx-1" />
            {Object.entries(GRUPOS).map(([nombre, anios]) => (
              <button key={nombre} onClick={() => setAniosActivos(new Set(anios))} className="btn-ghost">
                {nombre}
              </button>
            ))}
            <button onClick={() => setAniosActivos(new Set(ANIOS))} className="btn-ghost hover:!border-white hover:!text-white">Todos</button>
          </div>

          <p className="text-[10px] text-[#5a6b82] mb-2 font-medium">Eje X: salario bruto equivalente (€2026) · Eje Y: <strong className="text-[var(--text-soft)]">salario neto</strong> resultante (€2026)</p>
          <div style={{ height: 420 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DATOS_CHART} margin={{ left: 5, right: 20, top: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="bruto" stroke="var(--border)" tick={{ fontSize:10, fill:'var(--text-soft)' }} tickFormatter={v => `${v/1000}k€`} tickLine={false}
                  interval={20} />
                <YAxis stroke="var(--border)" tick={{ fontSize:11, fill:'var(--text-soft)' }} tickFormatter={v => `${(v/1000).toFixed(0)}k€`} width={50} tickLine={false}
                  label={{ value: 'Neto', angle: -90, position: 'insideLeft', offset: 10, fill: 'var(--text-soft)', fontSize: 9 }} />
                <Tooltip content={<TooltipSalario ref2026Neto={ref2026Neto} metrica="neto" />} />

                {smi2026 >= 15000 && smi2026 <= 100000 && (
                    <ReferenceLine x={smi2026} stroke="var(--yellow)" strokeOpacity={0.6} strokeDasharray="4 2"
                      label={{ value:`SMI ${anioRef}`, position:'insideTopLeft', fill:'var(--yellow)', fontSize:9 }} />
                  )}
                  {umbralInf2026 && umbralInf2026 >= 15000 && umbralInf2026 <= 100000 && (
                    <ReferenceLine x={umbralInf2026} stroke="var(--accent)" strokeOpacity={0.55} strokeDasharray="4 2"
                      label={{ value:'Art.20↓', position:'insideTopRight', fill:'var(--accent)', fontSize:9 }} />
                  )}
                  {umbralSup2026 && umbralSup2026 >= 15000 && umbralSup2026 <= 100000 && (
                    <ReferenceLine x={umbralSup2026} stroke="var(--accent)" strokeOpacity={0.35} strokeDasharray="4 2"
                      label={{ value:'Art.20=0', position:'insideTopRight', fill:'var(--accent)', fontSize:9 }} />
                  )}
                  {umbralInf2026 && umbralSup2026 && (
                    <ReferenceArea x1={Math.max(15000, umbralInf2026)} x2={Math.min(100000, umbralSup2026)}
                      fill="var(--accent)" fillOpacity={0.05} />
                  )}
                  {baseMax2026 >= 15000 && baseMax2026 <= 100000 && (
                    <ReferenceLine x={baseMax2026} stroke="var(--text-soft)" strokeOpacity={0.5} strokeDasharray="4 2"
                      label={{ value:'Tope SS', position:'insideTopRight', fill:'var(--text-soft)', fontSize:9 }} />
                  )}

                {bruto2026 >= 15000 && bruto2026 <= 100000 && (
                  <ReferenceLine x={bruto2026} stroke="var(--text-h)" strokeOpacity={0.3} strokeWidth={2} strokeDasharray="6 4"
                    label={{ value:'tu sueldo', position:'insideTopRight', fill: 'var(--text-soft)', fontSize:9 }} />
                )}

                {ANIOS.filter(a => aniosActivos.has(a)).map(a => (
                  <Line key={a} type="monotone" dataKey={`neto_${a}`}
                    stroke={YEAR_COLORS[a]} strokeWidth={a === 2026 ? 2.5 : aniosActivos.size <= 4 ? 2 : 1.5}
                    dot={false} activeDot={{ r: 5, strokeWidth: 0 }}
                    isAnimationActive={aniosActivos.size <= 8} />
                ))}
                <Brush dataKey="bruto" height={34}
                  stroke="var(--border)" fill="var(--surface2)"
                  travellerWidth={12} traveller={<BrushHandle />}
                  tickFormatter={v => `${Math.round(v/1000)}k€`}
                  padding={{ top: 10 }}
                  style={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'inherit' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <InsightSalario aniosActivos={aniosActivos} bruto2026={bruto2026} />
        </>
      )}

      {/* ── VISTA TIPO EFECTIVO ── */}
      {vista === 'tipo' && (
        <>
          {/* Year toggles */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {ANIOS.map(a => (
              <button key={a} onClick={() => toggleAnio(a)}
                className={`year-btn ${aniosActivos.has(a) ? 'active' : ''}`}
                style={aniosActivos.has(a) ? { background: YEAR_COLORS[a], borderColor: YEAR_COLORS[a] } : {}}>
                {a}
              </button>
            ))}
            <div className="w-px bg-[var(--border)] mx-1" />
            {Object.entries(GRUPOS).map(([nombre, anios]) => (
              <button key={nombre} onClick={() => setAniosActivos(new Set(anios))} className="btn-ghost">
                {nombre}
              </button>
            ))}
            <button onClick={() => setAniosActivos(new Set(ANIOS))} className="btn-ghost hover:!border-white hover:!text-white">Todos</button>
          </div>

          <div className="info-card mb-4 text-[13px] text-[var(--text)] leading-relaxed">
            <strong className="text-white font-semibold">¿Qué ves aquí?</strong> El porcentaje real de tu salario que va al IRPF (tipo efectivo),
            para cada nivel salarial y año. A mayor nivel salarial, mayor tipo efectivo — pero también se ve
            cómo las reformas han cambiado la presión fiscal real. Las líneas más bajas significan menos IRPF.
          </div>

          <p className="text-[10px] text-[#5a6b82] mb-2 font-medium">Eje X: salario bruto equivalente (€2026) · Eje Y: <strong className="text-[var(--text-soft)]">tipo efectivo IRPF</strong> (%)</p>
          <div style={{ height: 420 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DATOS_CHART} margin={{ left: 5, right: 20, top: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="bruto" stroke="var(--border)" tick={{ fontSize:10, fill:'var(--text-soft)' }} tickFormatter={v => `${v/1000}k€`} tickLine={false}
                  interval={20} />
                <YAxis stroke="var(--border)" tick={{ fontSize:11, fill:'var(--text-soft)' }} tickFormatter={v => `${v}%`} width={40} tickLine={false}
                  label={{ value: 'Tipo efectivo', angle: -90, position: 'insideLeft', offset: 5, fill: 'var(--text-soft)', fontSize: 9 }} domain={[0, 'auto']} />
                <Tooltip content={<TooltipSalario ref2026Neto={null} metrica="tipo" />} />

                {bruto2026 >= 15000 && bruto2026 <= 100000 && (
                  <ReferenceLine x={bruto2026} stroke="var(--text-h)" strokeOpacity={0.3} strokeWidth={2} strokeDasharray="6 4"
                    label={{ value:'tu sueldo', position:'insideTopRight', fill: 'var(--text-soft)', fontSize:9 }} />
                )}

                {ANIOS.filter(a => aniosActivos.has(a)).map(a => (
                  <Line key={a} type="monotone" dataKey={`irpf_${a}`}
                    stroke={YEAR_COLORS[a]} strokeWidth={a === 2026 ? 2.5 : aniosActivos.size <= 4 ? 2 : 1.5}
                    dot={false} activeDot={{ r: 5, strokeWidth: 0 }}
                    isAnimationActive={aniosActivos.size <= 8} />
                ))}
                <Brush dataKey="bruto" height={34}
                  stroke="var(--border)" fill="var(--surface2)"
                  travellerWidth={12} traveller={<BrushHandle />}
                  tickFormatter={v => `${Math.round(v/1000)}k€`}
                  padding={{ top: 10 }}
                  style={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'inherit' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <InsightSalario aniosActivos={aniosActivos} bruto2026={bruto2026} />
        </>
      )}

      {/* ── VISTA POR AÑO — Línea dual eje ── */}
      {vista === 'anio' && (
        <>
          <div className="info-card mb-5 text-[13px] text-[var(--text)] leading-relaxed">
            <strong className="text-white font-semibold">Cómo leer este gráfico:</strong> la línea verde (eje izquierdo) muestra el salario neto anual
            en euros constantes de 2026. Las líneas de puntos (eje derecho) muestran el tipo efectivo de IRPF y la carga total
            (IRPF + SS trabajador) en %. Las bandas verticales señalan los años de reforma fiscal.{' '}
            <strong className="text-white font-semibold">Salario de referencia: {eur(bruto2026)}</strong> (equiv. {eur(brutoRef)} brutos en {anioRef}).
          </div>

          <div style={{ height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dataPorAnio} margin={{ left: 5, right: 45, top: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="anio" stroke="var(--border)" tick={{ fontSize:11, fill:'var(--text-soft)' }} tickLine={false} />
                <YAxis yAxisId="eur" orientation="left" stroke="var(--border)" tick={{ fontSize:11, fill:'var(--text-soft)' }}
                  tickFormatter={v => `${(v/1000).toFixed(0)}k€`} width={50} tickLine={false} />
                <YAxis yAxisId="pct" orientation="right" stroke="var(--border)" tick={{ fontSize:11, fill:'var(--text-soft)' }}
                  tickFormatter={v => `${v}%`} width={40} tickLine={false} domain={[0, 'auto']} />
                <Tooltip content={<TooltipAnio />} />
                <Legend
                  formatter={(value) => <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>{value}</span>}
                />

                {/* Bandas de reforma */}
                {REFORMA_ANIOS.map(r => (
                  <ReferenceArea key={r.anio} yAxisId="eur" x1={r.anio} x2={r.anio + 0.5}
                    fill={r.color} fillOpacity={0.10} />
                ))}
                {/* Líneas de reforma */}
                {REFORMA_ANIOS.map(r => (
                  <ReferenceLine key={r.anio} yAxisId="eur" x={r.anio} stroke={r.color} strokeOpacity={0.5} strokeDasharray="4 2"
                    label={{ value: r.label, position: 'insideTopLeft', fill: r.color, fontSize: 9 }} />
                ))}

                <Line yAxisId="eur" type="monotone" dataKey="neto" stroke="#10b981" strokeWidth={2.5}
                  dot={(props) => <DotConColor {...props} data={dataPorAnio} />}
                  activeDot={{ r: 6, strokeWidth: 0 }} name="Neto (€2026)" />
                <Line yAxisId="pct" type="monotone" dataKey="irpf" stroke="#ef4444" strokeWidth={2}
                  strokeDasharray="7 3" dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }} name="Tipo IRPF (%)" />
                <Line yAxisId="pct" type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={2}
                  strokeDasharray="3 3" dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }} name="Carga total IRPF+SS (%)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla compacta */}
          <div className="mt-5 overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  {['Año','Bruto nominal','Neto (€2026)','Tipo IRPF','Carga total','∆ neto vs 2026'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataPorAnio.map(d => {
                  const diff = d.neto - neto2026;
                  return (
                    <tr key={d.anio}>
                      <td className="font-bold" style={{ color: YEAR_COLORS[d.anio] }}>{d.anio}</td>
                      <td className="font-mono text-[var(--text)]">{eur(d.brutoNominal)}</td>
                      <td className="font-mono font-bold text-[var(--text-h)]">{eur(d.neto)}</td>
                      <td className="font-mono text-red-400">{d.irpf.toFixed(1)}%</td>
                      <td className="font-mono text-amber-400">{d.total.toFixed(1)}%</td>
                      <td className={`font-mono font-bold ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {diff >= 0 ? '+' : ''}{eur(diff)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// Puntos coloreados por año para la línea neto
function DotConColor({ cx, cy, payload }) {
  if (!cx || !cy) return null;
  return <circle cx={cx} cy={cy} r={4} fill={YEAR_COLORS[payload.anio] || '#fff'} stroke="none" />;
}

function InsightSalario({ aniosActivos, bruto2026 }) {
  const datos = useMemo(() => {
    if (bruto2026 < 15000 || aniosActivos.size < 2) return null;
    const fila = DATOS_CHART.find(d => d.bruto >= bruto2026) || DATOS_CHART[DATOS_CHART.length - 1];
    const vals = [...aniosActivos].map(a => ({ anio: a, val: fila[`neto_${a}`] }));
    const sorted = [...vals].sort((a, b) => b.val - a.val);
    return { mejor: sorted[0], peor: sorted[sorted.length - 1], diff: sorted[0].val - sorted[sorted.length - 1].val };
  }, [aniosActivos, bruto2026]);

  if (!datos) return null;
  return (
    <div className="mt-4 info-card text-[13px]">
      <p className="text-[var(--text)] leading-relaxed">
        Con <strong className="text-[var(--text-h)] font-semibold">{eur(bruto2026)}</strong> brutos equiv. (€2026), el mejor año fue{' '}
        <strong className="font-semibold" style={{ color: YEAR_COLORS[datos.mejor.anio] }}>{datos.mejor.anio}</strong>{' '}
        ({eur(datos.mejor.val)} netos) y el peor{' '}
        <strong className="font-semibold" style={{ color: YEAR_COLORS[datos.peor.anio] }}>{datos.peor.anio}</strong>{' '}
        ({eur(datos.peor.val)} netos). Diferencia:{' '}
        <strong className="text-[var(--text-h)] font-semibold">{eur(datos.diff)}/año · {eur(datos.diff / 12)}/mes</strong>.
      </p>
    </div>
  );
}

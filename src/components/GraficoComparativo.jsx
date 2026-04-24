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
  2012:'#f87171',2013:'#fb923c',2014:'#fbbf24',
  2015:'#facc15',2016:'#a3e635',2017:'#4ade80',
  2018:'#34d399',2019:'#2dd4bf',2020:'#38bdf8',
  2021:'#60a5fa',2022:'#818cf8',2023:'#a78bfa',
  2024:'#c084fc',2025:'#e879f9',2026:'#ffffff',
};

const GRUPOS = {
  'Años clave': [2012,2015,2019,2023,2026],
  'Crisis 2012–14': [2012,2013,2014],
  'Reforma 2015': [2015,2016,2017],
  '2019+': [2019,2020,2021,2022,2023,2024,2025,2026],
};

// Tooltip para el gráfico por nivel salarial
function TooltipSalario({ active, payload, label, ref2026Neto }) {
  if (!active || !payload?.length) return null;
  const sorted = [...payload].sort((a, b) => b.value - a.value);
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 shadow-2xl text-xs min-w-[220px] max-h-96 overflow-y-auto">
      <p className="font-bold text-white mb-2 border-b border-[var(--border)] pb-1.5">Bruto equiv.: {eur(label)}</p>
      {sorted.map(p => {
        const anio = parseInt(p.dataKey.split('_')[1]);
        const diff = ref2026Neto != null ? p.value - ref2026Neto : null;
        return (
          <div key={p.dataKey} className="flex justify-between items-center py-0.5 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: YEAR_COLORS[anio] }} />
              <span style={{ color: YEAR_COLORS[anio] }} className="font-bold w-10">{anio}</span>
            </span>
            <span className="font-mono text-white">{eur(p.value)}</span>
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
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 shadow-2xl text-xs min-w-[200px]">
      <p className="font-bold pb-1.5 mb-1.5 border-b border-[var(--border)]" style={{ color: YEAR_COLORS[label] }}>
        {label}{reform ? ` · ${reform.label}` : ''}
      </p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5" style={{ color: p.color }}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-mono text-white">{p.dataKey === 'neto' ? eur(p.value) : `${p.value.toFixed(1)}%`}</span>
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
  const [mostrarUmbrales, setMostrarUmbrales] = useState(true);

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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">¿Cuánto valió tu sueldo en cada año?</h2>
          <p className="text-sm text-[#94a3b8] mt-1">
            Todo en <strong className="text-white">euros constantes de 2026</strong> — la inflación ya está descontada (IPC dic.→dic., INE).
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap shrink-0">
          <div className="flex rounded-lg border border-[#272b40] overflow-hidden text-xs">
            {[['salario','Por nivel salarial'],['anio','Evolución por año']].map(([v, l]) => (
              <button key={v} onClick={() => setVista(v)}
                className={`px-3 py-1.5 font-medium transition-all ${vista === v ? 'bg-[var(--accent)] text-white' : 'text-[#94a3b8] hover:bg-[#21253a]'}`}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={() => exportCSV(aniosActivos)}
            className="px-3 py-1.5 rounded-lg text-xs border border-[#272b40] text-[#94a3b8] hover:border-[var(--accent)] hover:text-[var(--accent-light)] transition-all flex items-center gap-1.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            CSV
          </button>
        </div>
      </div>

      {/* ── VISTA POR NIVEL SALARIAL ── */}
      {vista === 'salario' && (
        <>
          {/* Year toggles */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {ANIOS.map(a => (
              <button key={a} onClick={() => toggleAnio(a)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border-2 ${aniosActivos.has(a)
                  ? 'text-[#07090f] border-transparent shadow-md'
                  : 'border-[var(--border)] text-[var(--text)] opacity-40 hover:opacity-70'}`}
                style={aniosActivos.has(a) ? { background: YEAR_COLORS[a], borderColor: YEAR_COLORS[a] } : {}}>
                {a}
              </button>
            ))}
            <div className="w-px bg-[var(--border)] mx-1" />
            {Object.entries(GRUPOS).map(([nombre, anios]) => (
              <button key={nombre} onClick={() => setAniosActivos(new Set(anios))}
                className="px-2.5 py-1 rounded-lg text-xs border border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent-light)] transition-all">
                {nombre}
              </button>
            ))}
            <button onClick={() => setAniosActivos(new Set(ANIOS))}
              className="px-2.5 py-1 rounded-lg text-xs border border-[var(--border)] text-[var(--text)] hover:border-white hover:text-white transition-all">Todos</button>
            <button onClick={() => setMostrarUmbrales(v => !v)}
              className={`px-2.5 py-1 rounded-lg text-xs border transition-all ml-auto ${mostrarUmbrales ? 'border-[var(--accent)]/50 text-[var(--accent-light)] bg-[var(--accent-dim)]' : 'border-[var(--border)] text-[var(--text)]'}`}>
              Umbrales {anioRef}
            </button>
          </div>

          <div style={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={DATOS_CHART} margin={{ left: 5, right: 20, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2440" vertical={false} />
                <XAxis dataKey="bruto" stroke="#1e2440" tick={{ fontSize:10, fill:'#4b5563' }} tickFormatter={v => `${v/1000}k€`} tickLine={false} />
                <YAxis stroke="#1e2440" tick={{ fontSize:11, fill:'#4b5563' }} tickFormatter={v => `${(v/1000).toFixed(0)}k€`} width={50} tickLine={false} />
                <Tooltip content={<TooltipSalario ref2026Neto={ref2026Neto} />} />

                {mostrarUmbrales && (<>
                  {smi2026 >= 15000 && smi2026 <= 100000 && (
                    <ReferenceLine x={smi2026} stroke="#f59e0b" strokeOpacity={0.5} strokeDasharray="4 2"
                      label={{ value:`SMI ${anioRef}`, position:'insideTopLeft', fill:'#f59e0b', fontSize:9 }} />
                  )}
                  {umbralInf2026 && umbralInf2026 >= 15000 && umbralInf2026 <= 100000 && (
                    <ReferenceLine x={umbralInf2026} stroke="#38bdf8" strokeOpacity={0.5} strokeDasharray="4 2"
                      label={{ value:'Art.20↓', position:'insideTopRight', fill:'#38bdf8', fontSize:9 }} />
                  )}
                  {umbralSup2026 && umbralSup2026 >= 15000 && umbralSup2026 <= 100000 && (
                    <ReferenceLine x={umbralSup2026} stroke="#38bdf8" strokeOpacity={0.3} strokeDasharray="4 2"
                      label={{ value:'Art.20=0', position:'insideTopRight', fill:'#38bdf8', fontSize:9 }} />
                  )}
                  {umbralInf2026 && umbralSup2026 && (
                    <ReferenceArea x1={Math.max(15000, umbralInf2026)} x2={Math.min(100000, umbralSup2026)}
                      fill="#38bdf8" fillOpacity={0.04} />
                  )}
                  {baseMax2026 >= 15000 && baseMax2026 <= 100000 && (
                    <ReferenceLine x={baseMax2026} stroke="#a78bfa" strokeOpacity={0.4} strokeDasharray="4 2"
                      label={{ value:'Tope SS', position:'insideTopRight', fill:'#a78bfa', fontSize:9 }} />
                  )}
                </>)}

                {bruto2026 >= 15000 && bruto2026 <= 100000 && (
                  <ReferenceLine x={bruto2026} stroke="#ffffff" strokeOpacity={0.12} strokeWidth={2} strokeDasharray="6 4"
                    label={{ value:'tu sueldo', position:'insideTopRight', fill:'#64748b', fontSize:9 }} />
                )}

                {ANIOS.filter(a => aniosActivos.has(a)).map(a => (
                  <Line key={a} type="monotone" dataKey={`neto_${a}`}
                    stroke={YEAR_COLORS[a]} strokeWidth={a === 2026 ? 2.5 : aniosActivos.size <= 4 ? 2 : 1.5}
                    dot={false} activeDot={{ r: 5, strokeWidth: 0 }}
                    isAnimationActive={aniosActivos.size <= 8} />
                ))}
                <Brush dataKey="bruto" height={22} stroke="#1e2440" fill="#0d1020" travellerWidth={8}
                  tickFormatter={v => `${Math.round(v/1000)}k€`}
                  style={{ fontSize: 10, fill: '#4b5563' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Leyenda clicable */}
          <div className="flex flex-wrap gap-3 mt-2">
            {[...aniosActivos].sort((a, b) => a - b).map(a => (
              <button key={a} onClick={() => toggleAnio(a)}
                className="flex items-center gap-1.5 text-xs hover:opacity-60 transition-opacity" style={{ color: YEAR_COLORS[a] }}>
                <span className="w-5 h-0.5 inline-block rounded" style={{ background: YEAR_COLORS[a] }} />
                {a}
              </button>
            ))}
          </div>

          <InsightSalario aniosActivos={aniosActivos} bruto2026={bruto2026} />
        </>
      )}

      {/* ── VISTA POR AÑO — Línea dual eje ── */}
      {vista === 'anio' && (
        <>
          <div className="rounded-xl bg-[var(--surface2)] border border-[var(--border)] p-3 mb-4 text-sm text-[#94a3b8] leading-relaxed">
            <strong className="text-white">Cómo leer este gráfico:</strong> la línea verde (eje izquierdo) muestra el salario neto anual
            en euros constantes de 2026. Las líneas de puntos (eje derecho) muestran el tipo efectivo de IRPF y la carga total
            (IRPF + SS trabajador) en %. Las bandas verticales señalan los años de reforma fiscal.{' '}
            <strong className="text-white">Salario de referencia: {eur(bruto2026)}</strong> (equiv. {eur(brutoRef)} brutos en {anioRef}).
          </div>

          <div style={{ height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dataPorAnio} margin={{ left: 5, right: 45, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2440" vertical={false} />
                <XAxis dataKey="anio" stroke="#1e2440" tick={{ fontSize:11, fill:'#4b5563' }} tickLine={false} />
                <YAxis yAxisId="eur" orientation="left" stroke="#1e2440" tick={{ fontSize:11, fill:'#4b5563' }}
                  tickFormatter={v => `${(v/1000).toFixed(0)}k€`} width={50} tickLine={false} />
                <YAxis yAxisId="pct" orientation="right" stroke="#1e2440" tick={{ fontSize:11, fill:'#4b5563' }}
                  tickFormatter={v => `${v}%`} width={40} tickLine={false} domain={[0, 'auto']} />
                <Tooltip content={<TooltipAnio />} />
                <Legend
                  formatter={(value) => <span style={{ fontSize: 11, color: '#94a3b8' }}>{value}</span>}
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
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#272b40]">
                  {['Año','Bruto nominal','Neto (€2026)','Tipo IRPF','Carga total','∆ neto vs 2026'].map(h => (
                    <th key={h} className="py-2 px-2 text-left text-[#64748b] font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataPorAnio.map(d => {
                  const diff = d.neto - neto2026;
                  return (
                    <tr key={d.anio} className="border-b border-[#272b40] hover:bg-[#21253a]">
                      <td className="py-1.5 px-2 font-bold" style={{ color: YEAR_COLORS[d.anio] }}>{d.anio}</td>
                      <td className="py-1.5 px-2 font-mono text-[#94a3b8]">{eur(d.brutoNominal)}</td>
                      <td className="py-1.5 px-2 font-mono font-bold text-white">{eur(d.neto)}</td>
                      <td className="py-1.5 px-2 font-mono text-red-400">{d.irpf.toFixed(1)}%</td>
                      <td className="py-1.5 px-2 font-mono text-amber-400">{d.total.toFixed(1)}%</td>
                      <td className={`py-1.5 px-2 font-mono font-bold ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
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
    <div className="mt-3 rounded-xl bg-[#21253a] border border-[#272b40] p-4 text-sm">
      <p className="text-[#94a3b8] leading-relaxed">
        Con <strong className="text-white">{eur(bruto2026)}</strong> brutos equiv. (€2026), el mejor año fue{' '}
        <strong style={{ color: YEAR_COLORS[datos.mejor.anio] }}>{datos.mejor.anio}</strong>{' '}
        ({eur(datos.mejor.val)} netos) y el peor{' '}
        <strong style={{ color: YEAR_COLORS[datos.peor.anio] }}>{datos.peor.anio}</strong>{' '}
        ({eur(datos.peor.val)} netos). Diferencia:{' '}
        <strong className="text-white">{eur(datos.diff)}/año · {eur(datos.diff / 12)}/mes</strong>.
      </p>
    </div>
  );
}

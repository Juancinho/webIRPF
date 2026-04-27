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
  2012: '#ef4444',  // rojo intenso
  2013: '#3b82f6',  // azul vivo
  2014: '#22c55e',  // verde brillante
  2015: '#f59e0b',  // ámbar
  2016: '#a855f7',  // púrpura
  2017: '#06b6d4',  // cian
  2018: '#f97316',  // naranja
  2019: '#ec4899',  // rosa fuerte
  2020: '#14b8a6',  // teal
  2021: '#6366f1',  // índigo
  2022: '#84cc16',  // lima
  2023: '#f43f5e',  // rosa-rojizo
  2024: '#0ea5e9',  // azul cielo
  2025: '#d946ef',  // fucsia
  2026: '#eab308',  // amarillo dorado
};

const GRUPOS = {
  'Años clave': [2012, 2015, 2019, 2023, 2026],
  'Crisis 2012–14': [2012, 2013, 2014],
  'Reforma 2015': [2015, 2016, 2017],
  '2019+': [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
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
    <div className="p-4 text-xs min-w-[280px] max-h-96 overflow-y-auto rounded-2xl border border-[var(--border)]"
      style={{
        background: 'linear-gradient(135deg, rgba(12,12,14,0.92), rgba(20,20,22,0.88))',
        backdropFilter: 'blur(32px) saturate(150%)',
        WebkitBackdropFilter: 'blur(32px) saturate(150%)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(212,168,83,0.08) inset'
      }}>
      <p className="text-[10px] text-[var(--text-soft)] mb-0.5 uppercase tracking-wider font-semibold">Salario bruto equivalente (€2026)</p>
      <p className="font-extrabold text-[var(--text-h)] mb-3 border-b border-[var(--border)] pb-2 text-[14px] font-mono tracking-tight">{eur(label)}</p>
      <p className="text-[9px] text-[var(--accent)] font-bold uppercase tracking-wider mb-2">
        {isPct ? 'Tipo efectivo IRPF' : 'Salario neto resultante'}
      </p>
      {sorted.map(p => {
        const anio = parseInt(p.dataKey.split('_')[1]);
        const diff = !isPct && ref2026Neto != null ? p.value - ref2026Neto : null;
        return (
          <div key={p.dataKey} className="flex justify-between items-center py-0.5 gap-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-offset-1 ring-offset-[var(--surface)]" style={{ background: YEAR_COLORS[anio], boxShadow: `0 0 8px ${YEAR_COLORS[anio]}60`, ringColor: `${YEAR_COLORS[anio]}40` }} />
              <span style={{ color: YEAR_COLORS[anio] }} className="font-bold w-10">{anio}</span>
            </span>
            <span className="font-mono text-[var(--text-h)] font-semibold">{isPct ? `${p.value.toFixed(1)}%` : eur(p.value)}</span>
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
    <div className="p-4 text-xs min-w-[240px] rounded-2xl border border-[var(--border)]"
      style={{
        background: 'linear-gradient(135deg, rgba(12,12,14,0.92), rgba(20,20,22,0.88))',
        backdropFilter: 'blur(32px) saturate(150%)',
        WebkitBackdropFilter: 'blur(32px) saturate(150%)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.35), 0 0 0 1px rgba(212,168,83,0.08) inset'
      }}>
      <p className="font-extrabold pb-2 mb-2 border-b border-[var(--border)] text-[11px] uppercase tracking-wider" style={{ color: YEAR_COLORS[label] }}>
        {label}{reform ? ` · ${reform.label}` : ''}
      </p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-4 py-0.5">
          <span className="flex items-center gap-1.5" style={{ color: p.color }}>
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color, boxShadow: `0 0 8px ${p.color}60` }} />
            {p.name}
          </span>
          <span className="font-mono text-[var(--text-h)] font-semibold">{p.dataKey === 'neto' ? eur(p.value) : `${p.value.toFixed(1)}%`}</span>
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

  const toggleAnio = useCallback(a => setAniosActivos(prev => {
    const next = new Set(prev);
    if (next.has(a)) { if (next.size > 1) next.delete(a); } else next.add(a);
    return next;
  }), []);

  const bruto2026 = useMemo(() => Math.round(brutoRef * (INFLACION_A_2026[anioRef] || 1)), [brutoRef, anioRef]);
  const params = useMemo(() => obtenerParametros(anioRef), [anioRef]);
  const inf = INFLACION_A_2026[anioRef] || 1;
  const smi2026 = Math.round((SMI_ANUAL[anioRef] || 0) * inf);
  const umbralInf2026 = params.art20Meta.uInf ? Math.round(params.art20Meta.uInf * inf) : null;
  const umbralSup2026 = params.art20Meta.uSup ? Math.round(params.art20Meta.uSup * inf) : null;
  const baseMax2026 = Math.round(params.baseMax * inf);
  const dataPuntoRef = DATOS_CHART.find(d => d.bruto >= bruto2026) || DATOS_CHART[DATOS_CHART.length - 1];

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
    <div className="space-y-16">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-black text-[var(--text-h)] tracking-tight">Crónica de 15 años de impuestos</h2>
          <p className="text-sm text-[var(--text-soft)] mt-1.5 max-w-[60ch]">
            Un recorrido visual por la evolución del IRPF en España. Todo ajustado a <strong className="text-[var(--text-h)] font-semibold">euros de 2026</strong> para eliminar el ruido de la inflación y ver el valor real de tu sueldo.
          </p>
        </div>
        <button onClick={() => exportCSV(aniosActivos)} className="btn-ghost flex items-center gap-1.5 self-start">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
          Exportar CSV
        </button>
      </div>

      {/* ── CONTROLES UNIFICADOS ── */}
      <div className="p-6 rounded-2xl border border-[var(--border)]"
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface2) 90%, transparent), color-mix(in srgb, var(--surface3) 75%, transparent))',
          backdropFilter: 'blur(16px) saturate(130%)',
          WebkitBackdropFilter: 'blur(16px) saturate(130%)',
          boxShadow: 'var(--shadow-sm)'
        }}>
        <p className="text-[10px] font-bold text-[var(--text-soft)] uppercase tracking-wider mb-4">Selecciona los años para comparar</p>
        <div className="flex flex-wrap gap-1.5">
          {ANIOS.map(a => (
            <button key={a} onClick={() => toggleAnio(a)}
              className={`year-btn ${aniosActivos.has(a) ? 'active' : ''}`}
              style={aniosActivos.has(a) ? {
                background: YEAR_COLORS[a],
                borderColor: YEAR_COLORS[a],
                boxShadow: `0 2px 12px ${YEAR_COLORS[a]}40, 0 0 0 1px ${YEAR_COLORS[a]}30`,
                color: '#fff'
              } : {}}>
              {a}
            </button>
          ))}
          <div className="w-px bg-[var(--border)] mx-2 h-6 self-center" />
          {Object.entries(GRUPOS).map(([nombre, anios]) => (
            <button key={nombre} onClick={() => setAniosActivos(new Set(anios))} className="btn-ghost !py-1 !px-2.5 !text-[10px]">
              {nombre}
            </button>
          ))}
          <button onClick={() => setAniosActivos(new Set(ANIOS))} className="btn-ghost !py-1 !px-2.5 !text-[10px] hover:!border-[var(--text-h)] hover:!text-[var(--text-h)]">Todos</button>
        </div>
      </div>

      {/* ── HISTORIA 1: EL NETO REAL ── */}
      <section className="space-y-6 p-6 rounded-2xl border border-[var(--border)]"
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--surface2) 80%, transparent))',
          backdropFilter: 'blur(12px) saturate(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(120%)',
          boxShadow: 'var(--shadow-sm)'
        }}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ring-offset-[var(--surface)]" style={{ background: '#34d399', boxShadow: '0 0 8px #34d39960' }} />
            <h3 className="text-lg font-serif font-bold text-[var(--text-h)]">1. Salario neto por nivel de renta</h3>
          </div>
          <p className="text-[13px] text-[var(--text-soft)] leading-relaxed max-w-[85ch]">
            ¿Cuánto dinero llega realmente a tu bolsillo tras impuestos? En este gráfico, cada línea representa la normativa de un año diferente.
            El eje horizontal indica tu sueldo bruto, mientras que el eje vertical muestra el neto resultante.
            Al estar todo ajustado a la inflación, puedes comparar: ¿era más "valioso" un sueldo de 30.000€ en 2015 o en 2026?
          </p>
        </div>

        <div style={{ height: 420 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DATOS_CHART} margin={{ left: 5, right: 20, top: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="bruto" stroke="var(--border)" tick={{ fontSize: 10, fill: 'var(--text-soft)' }} tickFormatter={v => `${v / 1000}k€`} tickLine={false} interval={20} />
              <YAxis stroke="var(--border)" tick={{ fontSize: 11, fill: 'var(--text-soft)' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k€`} width={50} tickLine={false}
                label={{ value: 'Neto (€2026)', angle: -90, position: 'insideLeft', offset: 10, fill: 'var(--text-soft)', fontSize: 9 }} />
              <Tooltip content={<TooltipSalario ref2026Neto={neto2026} metrica="neto" />} />

              {smi2026 >= 15000 && smi2026 <= 100000 && (
                <ReferenceLine x={smi2026} stroke="var(--yellow)" strokeOpacity={0.6} strokeDasharray="4 2"
                  label={{ value: `SMI ${anioRef}`, position: 'insideTopLeft', fill: 'var(--yellow)', fontSize: 9 }} />
              )}
              {umbralInf2026 && umbralInf2026 >= 15000 && umbralInf2026 <= 100000 && (
                <ReferenceLine x={umbralInf2026} stroke="var(--accent)" strokeOpacity={0.55} strokeDasharray="4 2"
                  label={{ value: 'Art.20↓', position: 'insideTopRight', fill: 'var(--accent)', fontSize: 9 }} />
              )}
              {baseMax2026 >= 15000 && baseMax2026 <= 100000 && (
                <ReferenceLine x={baseMax2026} stroke="var(--text-soft)" strokeOpacity={0.5} strokeDasharray="4 2"
                  label={{ value: 'Tope SS', position: 'insideTopRight', fill: 'var(--text-soft)', fontSize: 9 }} />
              )}
              {bruto2026 >= 15000 && bruto2026 <= 100000 && (
                <ReferenceLine x={bruto2026} stroke="var(--text-h)" strokeOpacity={0.3} strokeWidth={2} strokeDasharray="6 4"
                  label={{ value: 'tu sueldo', position: 'insideTopRight', fill: 'var(--text-soft)', fontSize: 9 }} />
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
                tickFormatter={v => `${Math.round(v / 1000)}k€`}
                padding={{ top: 10 }}
                style={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'inherit' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <InsightSalario aniosActivos={aniosActivos} bruto2026={bruto2026} />
      </section>

      {/* ── HISTORIA 2: EL TIPO EFECTIVO ── */}
      <section className="space-y-6 p-6 rounded-2xl border border-[var(--border)]"
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--surface2) 80%, transparent))',
          backdropFilter: 'blur(12px) saturate(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(120%)',
          boxShadow: 'var(--shadow-sm)'
        }}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ring-offset-[var(--surface)]" style={{ background: '#fb7185', boxShadow: '0 0 8px #fb718560' }} />
            <h3 className="text-lg font-serif font-bold text-[var(--text-h)]">2. Carga fiscal real (Tipo Efectivo)</h3>
          </div>
          <p className="text-[13px] text-[var(--text-soft)] leading-relaxed max-w-[85ch]">
            Aquí visualizamos la intensidad del impuesto: qué porcentaje exacto de cada euro ganado se queda Hacienda.
            Una línea más baja indica un año con menor <strong className="text-[var(--text)]">carga fiscal individual</strong> para ese nivel de ingresos.
            Es el mapa definitivo para ver qué reformas bajaron los impuestos y cuáles los subieron.
            Observa cómo las curvas se cruzan: una reforma puede beneficiar a las rentas bajas pero penalizar a las medias.
          </p>
        </div>

        <div style={{ height: 420 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={DATOS_CHART} margin={{ left: 5, right: 20, top: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="bruto" stroke="var(--border)" tick={{ fontSize: 10, fill: 'var(--text-soft)' }} tickFormatter={v => `${v / 1000}k€`} tickLine={false} interval={20} />
              <YAxis stroke="var(--border)" tick={{ fontSize: 11, fill: 'var(--text-soft)' }} tickFormatter={v => `${v}%`} width={40} tickLine={false}
                label={{ value: 'Tipo efectivo', angle: -90, position: 'insideLeft', offset: 5, fill: 'var(--text-soft)', fontSize: 9 }} domain={[0, 'auto']} />
              <Tooltip content={<TooltipSalario ref2026Neto={null} metrica="tipo" />} />

              {bruto2026 >= 15000 && bruto2026 <= 100000 && (
                <ReferenceLine x={bruto2026} stroke="var(--text-h)" strokeOpacity={0.3} strokeWidth={2} strokeDasharray="6 4"
                  label={{ value: 'tu sueldo', position: 'insideTopRight', fill: 'var(--text-soft)', fontSize: 9 }} />
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
                tickFormatter={v => `${Math.round(v / 1000)}k€`}
                padding={{ top: 10 }}
                style={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'inherit' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <InsightTipo aniosActivos={aniosActivos} bruto2026={bruto2026} />
      </section>

      {/* ── HISTORIA 3: EVOLUCIÓN TEMPORAL ── */}
      <section className="space-y-6 p-6 rounded-2xl border border-[var(--border)]"
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--surface2) 80%, transparent))',
          backdropFilter: 'blur(12px) saturate(120%)',
          WebkitBackdropFilter: 'blur(12px) saturate(120%)',
          boxShadow: 'var(--shadow-sm)'
        }}>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ring-offset-[var(--surface)]" style={{ background: '#0ea5e9', boxShadow: '0 0 8px #0ea5e960' }} />
            <h3 className="text-lg font-serif font-bold text-[var(--text-h)]">3. Tu evolución histórica personal</h3>
          </div>
          <p className="text-[13px] text-[var(--text-soft)] leading-relaxed max-w-[85ch]">
            Este gráfico personaliza la historia para ti. Tomamos el sueldo que has indicado en la calculadora y trazamos su valor real a través de los últimos 15 años.
            Verás dos historias a la vez: la línea sólida muestra tu sueldo <strong className="text-[var(--text)]">neto real (€2026)</strong> y las discontinuas muestran el porcentaje de impuestos.
            Las bandas verticales de color marcan los grandes cambios legislativos que han moldeado tu nómina actual.
          </p>
        </div>

        <div style={{ height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dataPorAnio} margin={{ left: 5, right: 45, top: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="anio" stroke="var(--border)" tick={{ fontSize: 11, fill: 'var(--text-soft)' }} tickLine={false} />
              <YAxis yAxisId="eur" orientation="left" stroke="var(--border)" tick={{ fontSize: 11, fill: 'var(--text-soft)' }}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k€`} width={50} tickLine={false} />
              <YAxis yAxisId="pct" orientation="right" stroke="var(--border)" tick={{ fontSize: 11, fill: 'var(--text-soft)' }}
                tickFormatter={v => `${v}%`} width={40} tickLine={false} domain={[0, 'auto']} />
              <Tooltip content={<TooltipAnio />} />
              <Legend verticalAlign="top" height={36} formatter={(value) => <span style={{ fontSize: 11, color: 'var(--text-soft)' }}>{value}</span>} />

              {/* Bandas de reforma */}
              {REFORMA_ANIOS.map(r => (
                <ReferenceArea key={r.anio} yAxisId="eur" x1={r.anio} x2={r.anio + 0.5} fill={r.color} fillOpacity={0.08} />
              ))}

              <Line yAxisId="eur" type="monotone" dataKey="neto" stroke="#10b981" strokeWidth={2.5}
                dot={(props) => <DotConColor {...props} data={dataPorAnio} />}
                activeDot={{ r: 6, strokeWidth: 0 }} name="Neto (€2026)" />
              <Line yAxisId="pct" type="monotone" dataKey="irpf" stroke="#ef4444" strokeWidth={2}
                strokeDasharray="7 3" dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }} name="Tipo IRPF (%)" />
              <Line yAxisId="pct" type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={2}
                strokeDasharray="3 3" dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }} name="Carga total (IRPF + SS Trabajador) (%)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla compacta */}
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)]"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 90%, transparent), color-mix(in srgb, var(--surface2) 78%, transparent))',
            backdropFilter: 'blur(12px) saturate(120%)',
            WebkitBackdropFilter: 'blur(12px) saturate(120%)',
            boxShadow: 'var(--shadow-sm)'
          }}>
          <table className="data-table w-full">
            <thead>
              <tr style={{ background: 'color-mix(in srgb, var(--surface2) 80%, transparent)' }}>
                {['Año', 'Bruto nominal', 'Neto (€2026)', 'Tipo IRPF', 'Carga (IRPF+SS Tra.)', '∆ vs 2026'].map(h => (
                  <th key={h} className="text-[10px] uppercase tracking-wider text-[var(--text-soft)] px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataPorAnio.map(d => {
                const diff = d.neto - neto2026;
                return (
                  <tr key={d.anio} className="border-t border-[var(--border)] hover:bg-[var(--surface2)]/50 transition-colors">
                    <td className="font-bold px-4 py-3 text-sm" style={{ color: YEAR_COLORS[d.anio] }}>{d.anio}</td>
                    <td className="font-mono text-[var(--text)] px-4 py-3 text-xs">{eur(d.brutoNominal)}</td>
                    <td className="font-mono font-bold text-[var(--text-h)] px-4 py-3 text-sm">{eur(d.neto)}</td>
                    <td className="font-mono text-red-400 px-4 py-3 text-xs">{d.irpf.toFixed(1)}%</td>
                    <td className="font-mono text-amber-400 px-4 py-3 text-xs">{d.total.toFixed(1)}%</td>
                    <td className={`font-mono font-bold px-4 py-3 text-xs ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {diff >= 0 ? '+' : ''}{eur(diff)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// Puntos coloreados por año para la línea neto
function DotConColor({ cx, cy, payload }) {
  if (!cx || !cy) return null;
  return <circle cx={cx} cy={cy} r={4} fill={YEAR_COLORS[payload.anio] || '#fff'} stroke="none" />;
}

function InsightTipo({ aniosActivos, bruto2026 }) {
  const datos = useMemo(() => {
    if (bruto2026 < 1000) return null;
    const fila = DATOS_CHART.find(d => d.bruto >= bruto2026) || DATOS_CHART[DATOS_CHART.length - 1];
    const vals = [...aniosActivos].map(a => ({ anio: a, val: fila[`irpf_${a}`] }));
    const sorted = [...vals].sort((a, b) => a.val - b.val);

    const v2019 = fila['irpf_2019'];
    const v2026 = fila['irpf_2026'];
    const diff1926Points = v2026 - v2019;

    const neto2019 = fila['neto_2019'];
    const neto2026 = fila['neto_2026'];
    const diffEuros = neto2019 - neto2026;

    return {
      mejor: sorted[0], peor: sorted[sorted.length - 1],
      v2019, v2026, diff1926Points, diffEuros
    };
  }, [aniosActivos, bruto2026]);

  if (!datos) return null;
  const isExentoTanto19Como26 = datos.v2019 === 0 && datos.v2026 === 0;

  return (
    <div className="p-5 rounded-2xl border border-[var(--border)] text-[13px] relative overflow-hidden space-y-3"
      style={{
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface2) 88%, transparent), color-mix(in srgb, var(--surface3) 72%, transparent))',
        backdropFilter: 'blur(16px) saturate(130%)',
        WebkitBackdropFilter: 'blur(16px) saturate(130%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(251,113,133,0.08) inset'
      }}>
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'linear-gradient(to bottom, #fb7185, #f43f5e)' }} />
      <p className="text-[var(--text)] leading-relaxed">
        Para tu nivel de renta, la menor <strong>carga fiscal individual</strong> ocurrió en{' '}
        <strong className="font-semibold" style={{ color: YEAR_COLORS[datos.mejor.anio] }}>{datos.mejor.anio}</strong>{' '}
        (un tipo del <strong className="text-[var(--text-h)]">{datos.mejor.val.toFixed(1)}%</strong>)
        mientras que el año más caro fue{' '}
        <strong className="font-semibold" style={{ color: YEAR_COLORS[datos.peor.anio] }}>{datos.peor.anio}</strong>{' '}
        (un <strong className="text-[var(--text-h)]">{datos.peor.val.toFixed(1)}%</strong>).
      </p>
      <div className="pt-3 border-t border-[var(--border)]">
        {isExentoTanto19Como26 ? (
          <p className="text-[var(--text-soft)]">
            <span className="font-bold uppercase text-[10px] tracking-wider block mb-1">Balance 2019 → 2026</span>
            Tu nivel salarial estaba (y sigue estando) <strong className="text-emerald-400">exento de IRPF</strong> en ambos años.
            La pequeña diferencia de {eur(Math.abs(datos.diffEuros))} se debe exclusivamente a los cambios en las cotizaciones de la Seguridad Social (como el nuevo MEI).
          </p>
        ) : (
          <p className="text-[var(--text-soft)] leading-relaxed">
            <span className="font-bold uppercase text-[10px] tracking-wider block mb-1">Balance 2019 → 2026</span>
            Desde 2019, tu carga de IRPF ha {datos.diff1926Points >= 0 ? 'aumentado' : 'disminuido'}{' '}
            <strong className={datos.diff1926Points >= 0 ? 'text-red-400' : 'text-emerald-400'}>
              {Math.abs(datos.diff1926Points).toFixed(1)} puntos
            </strong>.
            Esto supone una diferencia de{' '}
            <strong className={datos.diffEuros >= 0 ? 'text-red-400' : 'text-emerald-400'}>
              {eur(Math.abs(datos.diffEuros))} {datos.diffEuros >= 0 ? 'menos' : 'más'}
            </strong> de neto al año para un sueldo real equivalente.
          </p>
        )}
      </div>
    </div>
  );
}

function InsightSalario({ aniosActivos, bruto2026 }) {
  const datos = useMemo(() => {
    if (bruto2026 < 1000) return null;
    const fila = DATOS_CHART.find(d => d.bruto >= bruto2026) || DATOS_CHART[DATOS_CHART.length - 1];
    const vals = [...aniosActivos].map(a => ({ anio: a, val: fila[`neto_${a}`] }));
    const sorted = [...vals].sort((a, b) => b.val - a.val);
    const v2019 = fila['neto_2019'];
    const v2026 = fila['neto_2026'];
    const diff1926 = v2026 - v2019;
    return { mejor: sorted[0], peor: sorted[sorted.length - 1], diff: sorted[0].val - sorted[sorted.length - 1].val, v2019, v2026, diff1926 };
  }, [aniosActivos, bruto2026]);

  if (!datos) return null;
  return (
    <div className="p-5 rounded-2xl border border-[var(--border)] text-[13px] relative overflow-hidden space-y-3"
      style={{
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface2) 88%, transparent), color-mix(in srgb, var(--surface3) 72%, transparent))',
        backdropFilter: 'blur(16px) saturate(130%)',
        WebkitBackdropFilter: 'blur(16px) saturate(130%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px rgba(52,211,153,0.08) inset'
      }}>
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: 'linear-gradient(to bottom, #34d399, #10b981)' }} />
      <p className="text-[var(--text)] leading-relaxed">
        Con <strong className="text-[var(--text-h)] font-semibold">{eur(bruto2026)}</strong> brutos equiv., el mejor año fue{' '}
        <strong className="font-semibold" style={{ color: YEAR_COLORS[datos.mejor.anio] }}>{datos.mejor.anio}</strong>{' '}
        ({eur(datos.mejor.val)} netos) y el peor{' '}
        <strong className="font-semibold" style={{ color: YEAR_COLORS[datos.peor.anio] }}>{datos.peor.anio}</strong>{' '}
        ({eur(datos.peor.val)} netos).
      </p>
      <div className="pt-3 border-t border-[var(--border)]">
        <p className="text-[var(--text-soft)]">
          <span className="font-bold uppercase text-[10px] tracking-wider block mb-0.5">Balance 2019 → 2026</span>
          Comparado con 2019, hoy recibes{' '}
          <strong className={datos.diff1926 >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            {eur(Math.abs(datos.diff1926))} {datos.diff1926 >= 0 ? 'más' : 'menos'}
          </strong> al año en términos de poder adquisitivo real.
        </p>
      </div>
    </div>
  );
}

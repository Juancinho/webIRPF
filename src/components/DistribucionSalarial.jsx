import { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import {
  ANIOS, DISTRIBUCION_SALARIAL, percentilDe, densidadLogNormal,
  inflacionAcumulada, INFLACION_A_2026
} from '../engine/irpf';
import { eur } from '../utils/format';

function TooltipDensidad({ active, payload, label, anio, color }) {
  if (!active || !payload || !payload.length) return null;
  const salario = label;
  const percentil = percentilDe(salario, anio);
  return (
    <div className="p-3 rounded-xl border border-[var(--border)]" style={{ background: 'var(--surface)', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-soft)] font-bold mb-1">Renta Bruta</p>
      <p className="text-[14px] font-mono font-bold mb-2" style={{ color }}>{eur(salario)}</p>
      <div className="border-t border-[var(--border)] pt-2 mt-2">
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-soft)] font-bold mb-1">Percentil estimado</p>
        <p className="text-[14px] font-mono font-bold text-[var(--text-h)]">P{percentil.toFixed(1)}</p>
      </div>
    </div>
  );
}

function BellCurve({ datos, salarioMarcado, dist, color = 'var(--accent)', anio }) {
  const percentiles = [
    { v: dist?.p10, label: 'P10' },
    { v: dist?.p25, label: 'P25' },
    { v: dist?.p50, label: 'P50' },
    { v: dist?.p75, label: 'P75' },
    { v: dist?.p90, label: 'P90' },
  ].filter(p => p.v > 0 && p.v <= 80000);

  return (
    <div style={{ height: 180, width: '100%', marginTop: 24 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={datos} margin={{ top: 15, right: 15, left: 15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
          <XAxis dataKey="salario" type="number" domain={[0, 80000]} tick={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'monospace' }} tickFormatter={v => `${v/1000}k`} tickCount={9} stroke="var(--border)" />
          <YAxis hide domain={[0, 'dataMax']} />
          <Tooltip content={<TooltipDensidad anio={anio} color={color} />} cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }} />
          
          <Area type="monotone" dataKey="densidad" fill={color} stroke={color} strokeWidth={2} fillOpacity={0.12} isAnimationActive={false} />
          
          {percentiles.map(p => (
            <ReferenceLine key={p.label} x={p.v} stroke="var(--border-light)" strokeDasharray="2 4" label={{ value: p.label, position: 'insideTop', fill: 'var(--text-soft)', fontSize: 10, fontWeight: 'bold' }} />
          ))}
          
          {salarioMarcado > 0 && salarioMarcado <= 80000 && (
            <ReferenceLine x={salarioMarcado} stroke={color} strokeWidth={1.5} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Stats strip ─────────────────────────────────────────────────────────────
function StatsStrip({ dist, salario, anio, color }) {
  if (!dist) return null;
  const items = [
    { label: 'P10', value: dist.p10 },
    { label: 'P25', value: dist.p25 },
    { label: 'Mediana', value: dist.p50 },
    { label: 'Media', value: dist.media },
    { label: 'P75', value: dist.p75 },
    { label: 'P90', value: dist.p90 },
  ];
  const pctl = percentilDe(salario, anio);
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 pt-4 border-t relative z-10" style={{ borderColor: 'var(--border)' }}>
      {items.map(({ label, value }) => {
        const isBelow = salario > 0 && salario > value;
        return (
          <div key={label} className="text-center rounded-xl py-2 px-1 transition-all duration-300 hover:bg-[var(--surface3)]">
            <p className="text-[9px] font-bold uppercase tracking-wider mb-1"
              style={{ color: isBelow ? color : 'var(--text-soft)' }}>
              {label}
            </p>
            <p className="text-[11.5px] font-mono font-bold"
              style={{ color: isBelow ? color : 'var(--text)' }}>
              {eur(value)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Component principal ──────────────────────────────────────────────────────
export default function DistribucionSalarial({ bruto, anio: anioRef }) {
  const [anioOrigen, setAnioOrigen] = useState(2018);
  const [anioDestino, setAnioDestino] = useState(anioRef || 2026);
  const [salarioBase, setSalarioBase] = useState(bruto || 25000);
  const [modoEvolucion, setModoEvolucion] = useState('nominal');

  const escenario = useMemo(() => {
    const factor = inflacionAcumulada(anioOrigen, anioDestino);
    const salarioEquivDestino = salarioBase * factor;
    return {
      factor,
      salarioEquivDestino,
      percentilOrigen: percentilDe(salarioBase, anioOrigen),
      percentilDestino: percentilDe(salarioEquivDestino, anioDestino),
      distOrigen: DISTRIBUCION_SALARIAL[anioOrigen],
      distDestino: DISTRIBUCION_SALARIAL[anioDestino],
      yearsDelta: anioDestino - anioOrigen,
    };
  }, [anioOrigen, anioDestino, salarioBase]);

  const saltoPercentil = escenario.percentilDestino - escenario.percentilOrigen;

  const curvaOrigen = useMemo(() => {
    const arr = [];
    for (let s = 500; s <= 80000; s += 300)
      arr.push({ salario: s, densidad: densidadLogNormal(s, anioOrigen) });
    return arr;
  }, [anioOrigen]);

  const curvaDestino = useMemo(() => {
    const arr = [];
    for (let s = 500; s <= 80000; s += 300)
      arr.push({ salario: s, densidad: densidadLogNormal(s, anioDestino) });
    return arr;
  }, [anioDestino]);

  const datosHist = useMemo(() => {
    return ANIOS.map(a => {
      const factor = modoEvolucion === 'real' ? INFLACION_A_2026[a] : 1;
      return {
        anio: a,
        p50: DISTRIBUCION_SALARIAL[a].p50 * factor,
        media: DISTRIBUCION_SALARIAL[a].media * factor,
        p25: DISTRIBUCION_SALARIAL[a].p25 * factor,
        p75: DISTRIBUCION_SALARIAL[a].p75 * factor,
      };
    });
  }, [modoEvolucion]);

  const evolucionText = useMemo(() => {
    const p50Ini = datosHist[0].p50;
    const p50Fin = datosHist[datosHist.length - 1].p50;
    const diff = p50Fin - p50Ini;
    const termino = modoEvolucion === 'real' ? 'reales (descontando la inflación)' : 'nominales (sin ajustar por inflación)';
    return `Desde 2012 hasta 2026, la mediana salarial (P50) en términos ${termino} ha ${diff >= 0 ? 'subido' : 'bajado'} ${eur(Math.abs(diff))}. ${modoEvolucion === 'real' ? (diff < 0 ? 'Esto significa que el poder adquisitivo del trabajador medio se ha reducido.' : 'Esto indica una ligera mejora real en el poder adquisitivo del trabajador medio.') : 'Gran parte de esta aparente subida se debe simplemente al aumento del coste de la vida (inflación).'}`;
  }, [datosHist, modoEvolucion]);

  const tono = (() => {
    if (saltoPercentil < -8) return { color: 'var(--red)',    titulo: 'Caída clara de posición', icono: '↓↓' };
    if (saltoPercentil < -3) return { color: 'var(--yellow)', titulo: 'Pierdes posición relativa', icono: '↓' };
    if (saltoPercentil > 3)  return { color: 'var(--green)',  titulo: 'Ganas posición (poco común)', icono: '↑' };
    return { color: 'var(--text-soft)', titulo: 'Posición social estable', icono: '→' };
  })();

  return (
    <div className="space-y-8">

      {/* ── Intro + concepto ── */}
      <div className="space-y-3 relative">
        <p className="text-[13.5px] text-[var(--text)] leading-relaxed max-w-3xl">
          La <strong className="text-[var(--text-h)]">distribución salarial</strong> muestra cuántos trabajadores ganan cada cantidad. El eje X es el salario bruto anual; la altura de la curva refleja cuántas personas están en ese nivel. Tu marcador rojo indica dónde te sitúas.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="dist-glass-panel p-4">
            <div className="glass-reflection" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] mb-1">¿Qué es el percentil?</p>
            <p className="text-[12px] text-[var(--text)] leading-relaxed">
              Si estás en el <strong className="text-[var(--text-h)]">percentil 60</strong>, ganas más que el 60% de los asalariados a tiempo completo en España.
            </p>
          </div>
          <div className="dist-glass-panel p-4">
            <div className="glass-reflection" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--yellow)] mb-1">Progresividad en frío</p>
            <p className="text-[12px] text-[var(--text)] leading-relaxed">
              Si tu salario sube exactamente con el IPC, tu poder adquisitivo no mejora — pero <strong className="text-[var(--text-h)]">caes en la escala relativa</strong> si el resto sube más.
            </p>
          </div>
          <div className="dist-glass-panel p-4">
            <div className="glass-reflection" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--red)] mb-1">El doble castigo</p>
            <p className="text-[12px] text-[var(--text)] leading-relaxed">
              Con IPC: pagas más IRPF (progresividad nominal) <em>y</em> desciendes en la distribución relativa. Dos golpes simultáneos.
            </p>
          </div>
        </div>
      </div>

      {/* ── Panel de control ── */}
      <div className="liquid-glass p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-2">
              Año de origen · <span style={{ color: 'var(--red)' }}>rojo</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ANIOS.map(a => (
                <button key={a} onClick={() => a !== anioDestino && setAnioOrigen(a)}
                  disabled={a === anioDestino}
                  className={`year-btn ${anioOrigen === a ? 'active' : ''}`}
                  style={{
                    ...(anioOrigen === a ? { background: 'var(--red)', boxShadow: '0 2px 10px var(--glow-red)' } : {}),
                    ...(a === anioDestino ? { opacity: 0.25, cursor: 'not-allowed' } : {}),
                  }}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-2">
              Año de comparación · <span style={{ color: 'var(--accent)' }}>azul</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ANIOS.map(a => (
                <button key={a} onClick={() => a !== anioOrigen && setAnioDestino(a)}
                  disabled={a === anioOrigen}
                  className={`year-btn ${anioDestino === a ? 'active' : ''}`}
                  style={{
                    ...(anioDestino === a ? { background: 'linear-gradient(135deg,var(--accent),var(--accent2))', boxShadow: '0 2px 10px var(--glow-accent)' } : {}),
                    ...(a === anioOrigen ? { opacity: 0.25, cursor: 'not-allowed' } : {}),
                  }}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-2">
            Tu salario en {anioOrigen} · <span className="font-mono" style={{ color: 'var(--accent)' }}>{eur(salarioBase)}</span>
            <span className="ml-2 opacity-60">→ equiv. {eur(escenario.salarioEquivDestino)} en {anioDestino} (×IPC {escenario.factor.toFixed(3)})</span>
          </p>
          <input type="range" min={5000} max={100000} step={500}
            value={salarioBase} onChange={e => setSalarioBase(+e.target.value)} className="w-full" />
          <div className="flex justify-between text-[10px] text-[var(--text-soft)] mt-1.5 opacity-50">
            <span>5k €</span><span>50k €</span><span>100k €</span>
          </div>
        </div>
      </div>

      {/* ── Resultado principal ── */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[var(--border)] relative overflow-hidden" style={{
        background: `linear-gradient(135deg, color-mix(in srgb, var(--surface2) 88%, transparent), color-mix(in srgb, var(--surface3) 72%, transparent))`,
        backdropFilter: 'blur(16px) saturate(130%)',
        WebkitBackdropFilter: 'blur(16px) saturate(130%)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px color-mix(in srgb, ${tono.color} 15%, transparent) inset`
      }}>
        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: `linear-gradient(to bottom, ${tono.color}, color-mix(in srgb, ${tono.color} 50%, transparent))` }} />
        <div className="glass-reflection" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8 relative z-10">
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1" style={{ color: tono.color }}>
                Veredicto · {anioOrigen} → {anioDestino}
              </p>
              <h3 className="font-display text-[1.6rem] leading-tight text-[var(--text-h)]">
                {tono.titulo}
              </h3>
            </div>
            
            <p className="text-[13.5px] text-[var(--text)] leading-relaxed">
              {saltoPercentil < -3 ? (
                <>
                  Si mantuviste tu poder adquisitivo (tu sueldo creció un <strong className="text-[var(--text-h)]">{((escenario.factor - 1) * 100).toFixed(0)}%</strong> con el IPC), 
                  la realidad es que <strong style={{ color: 'var(--red)' }}>te has empobrecido en términos relativos</strong>. 
                  Como los salarios del resto de España crecieron aún más, has bajado del percentil <strong className="font-mono text-[var(--text-h)]">{escenario.percentilOrigen.toFixed(0)}</strong> al <strong className="font-mono text-[var(--text-h)]">{escenario.percentilDestino.toFixed(0)}</strong>. 
                  Pagas impuestos de "renta alta" siendo, comparativamente, más pobre que en {anioOrigen}.
                </>
              ) : saltoPercentil > 3 ? (
                <>
                  Has <strong style={{ color: 'var(--green)' }}>mejorado tu posición</strong> en la sociedad. Tu salario (incluso ajustado por la inflación del {((escenario.factor - 1) * 100).toFixed(0)}%) 
                  ha crecido más rápido que el de la mayoría de españoles. Has saltado del percentil <strong className="font-mono text-[var(--text-h)]">{escenario.percentilOrigen.toFixed(0)}</strong> al <strong className="font-mono text-[var(--text-h)]">{escenario.percentilDestino.toFixed(0)}</strong>.
                </>
              ) : (
                <>
                  Tu posición en la escala salarial se mantiene <strong className="text-[var(--text-h)]">completamente estable</strong>. 
                  El aumento del coste de la vida (IPC acumulado del {((escenario.factor - 1) * 100).toFixed(0)}%) y la evolución de los sueldos en España 
                  han ido de la mano en tu nivel de ingresos. Sigues rodeado por el mismo porcentaje de población.
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[var(--surface)]/50 p-4 rounded-xl border border-[var(--border)] min-w-[280px] justify-center">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider mb-1 font-semibold" style={{ color: 'var(--red)' }}>{anioOrigen}</p>
              <p className="text-[2.5rem] font-black font-mono leading-none" style={{ color: 'var(--red)' }}>
                P{escenario.percentilOrigen.toFixed(0)}
              </p>
              <p className="text-[11px] text-[var(--text-soft)] mt-1">{eur(salarioBase)}</p>
            </div>

            <div className="flex flex-col items-center px-4 shrink-0">
              <div className="text-[1.8rem] mb-1" style={{ color: tono.color }}>{tono.icono}</div>
              <div className="font-mono text-[13px] font-bold px-2 py-0.5 rounded-full" style={{ background: `color-mix(in srgb, ${tono.color} 15%, transparent)`, color: tono.color }}>
                {saltoPercentil > 0 ? '+' : ''}{saltoPercentil.toFixed(1)} pp
              </div>
            </div>

            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider mb-1 font-semibold" style={{ color: 'var(--accent)' }}>{anioDestino}</p>
              <p className="text-[2.5rem] font-black font-mono leading-none" style={{ color: 'var(--accent)' }}>
                P{escenario.percentilDestino.toFixed(0)}
              </p>
              <p className="text-[11px] text-[var(--text-soft)] mt-1">{eur(escenario.salarioEquivDestino)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Curva año origen ── */}
      <div className="dist-glass-panel p-5 sm:p-6 relative">
        <div className="glass-reflection" />
        <div className="glass-orb glass-orb--red" style={{ width: 200, height: 200, top: -40, right: -40, opacity: 0.15 }} />
        <div className="flex items-center justify-between mb-1 relative z-10">
          <div>
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ background: 'var(--red)', verticalAlign: 'middle' }} />
            <span className="text-[13px] font-bold text-[var(--text-h)]">Distribución salarial en {anioOrigen}</span>
          </div>
          <span className="dist-glass-badge"
            style={{ background: 'color-mix(in srgb, var(--red) 12%, transparent)', color: 'var(--red)', borderColor: 'color-mix(in srgb, var(--red) 25%, transparent)' }}>
            P{escenario.percentilOrigen.toFixed(1)} · {eur(salarioBase)}
          </span>
        </div>
        <p className="text-[11.5px] text-[var(--text-soft)] mb-4 relative z-10">
          La línea roja marca tu salario. Los valores coloreados en la tabla son percentiles que superas.
        </p>

        {escenario.distOrigen && (
          <div className="relative z-10">
            <BellCurve
              datos={curvaOrigen}
              salarioMarcado={salarioBase}
              dist={escenario.distOrigen}
              color="var(--red)"
              anio={anioOrigen}
            />
          </div>
        )}

        <StatsStrip dist={escenario.distOrigen} salario={salarioBase} anio={anioOrigen} color="var(--red)" />
      </div>

      {/* ── Curva año destino ── */}
      <div className="dist-glass-panel p-5 sm:p-6 relative">
        <div className="glass-reflection" />
        <div className="glass-orb glass-orb--accent" style={{ width: 220, height: 220, top: -50, right: -30, opacity: 0.12 }} />
        <div className="flex items-center justify-between mb-1 relative z-10">
          <div>
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ background: 'var(--accent)', verticalAlign: 'middle' }} />
            <span className="text-[13px] font-bold text-[var(--text-h)]">Distribución salarial en {anioDestino}</span>
          </div>
          <span className="dist-glass-badge"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent-dim)' }}>
            P{escenario.percentilDestino.toFixed(1)} · {eur(escenario.salarioEquivDestino)}
          </span>
        </div>
        <p className="text-[11.5px] text-[var(--text-soft)] mb-4 relative z-10">
          Salario equivalente al tuyo ajustado por IPC ({((escenario.factor - 1) * 100).toFixed(0)}% acumulado). Misma capacidad de compra, posición diferente.
        </p>

        {escenario.distDestino && (
          <div className="relative z-10">
            <BellCurve
              datos={curvaDestino}
              salarioMarcado={escenario.salarioEquivDestino}
              dist={escenario.distDestino}
              color="var(--accent)"
              anio={anioDestino}
            />
          </div>
        )}

        <StatsStrip dist={escenario.distDestino} salario={escenario.salarioEquivDestino} anio={anioDestino} color="var(--accent)" />
      </div>

      {/* ── Evolución histórica ── */}
      <div className="dist-glass-panel p-5 sm:p-6 relative">
        <div className="glass-reflection" />
        <div className="glass-orb glass-orb--accent" style={{ width: 180, height: 180, bottom: -30, left: -30, opacity: 0.10 }} />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-1">Evolución histórica</p>
              <h3 className="font-display text-[1.2rem] sm:text-[1.4rem] text-[var(--text-h)] leading-tight">
                Salarios de la población 2012–2026
              </h3>
            </div>
            
            <div className="flex items-center p-1 rounded-xl border border-[var(--border)] shrink-0 self-start sm:self-auto" style={{
              background: 'color-mix(in srgb, var(--surface2) 60%, transparent)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
            }}>
              <button onClick={() => setModoEvolucion('real')} className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${modoEvolucion === 'real' ? 'bg-[var(--accent)] shadow-sm' : 'text-[var(--text-soft)] hover:text-[var(--text-h)] hover:bg-[var(--surface3)]'}`} style={modoEvolucion === 'real' ? { color: '#ffffff' } : {}}>Real (€2026)</button>
              <button onClick={() => setModoEvolucion('nominal')} className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${modoEvolucion === 'nominal' ? 'bg-[var(--accent)] shadow-sm' : 'text-[var(--text-soft)] hover:text-[var(--text-h)] hover:bg-[var(--surface3)]'}`} style={modoEvolucion === 'nominal' ? { color: '#ffffff' } : {}}>Nominal</button>
            </div>
          </div>
          
          <p className="text-[12px] text-[var(--text)] mb-5 max-w-2xl">
            P25, mediana, media y P75. El gap entre media y mediana revela la asimetría de la distribución: los salarios altos tiran de la media hacia arriba.
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={datosHist} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" />
              <XAxis dataKey="anio" tick={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'monospace' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'monospace' }}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} width={42} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, color: 'var(--text-h)' }}
                itemStyle={{ color: 'var(--text-h)' }}
                labelStyle={{ color: 'var(--text-soft)', marginBottom: 4 }}
                formatter={(v, n) => [eur(v), n]} />
              <Bar dataKey="p25" name="P25" fill="var(--accent)" fillOpacity={0.18} />
              <Line type="monotone" dataKey="p50" name="Mediana (P50)" stroke="var(--accent)" strokeWidth={2.5}
                dot={{ r: 3, fill: 'var(--accent)' }} />
              <Line type="monotone" dataKey="media" name="Media" stroke="var(--yellow)" strokeWidth={1.5}
                dot={false} strokeDasharray="5 3" />
              <Line type="monotone" dataKey="p75" name="P75" stroke="var(--text-soft)" strokeWidth={1.5}
                dot={false} strokeDasharray="3 2" />
              {[anioOrigen, anioDestino].map(a => (
                <ReferenceLine key={a} x={a} stroke="var(--border-light)" strokeDasharray="3 2" />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
          
          <div className="mt-4 p-4 rounded-xl border border-[var(--border)]" style={{ background: 'color-mix(in srgb, var(--surface2) 50%, transparent)' }}>
            <p className="text-[12px] text-[var(--text-h)] leading-relaxed">
              <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: 'var(--accent)' }} />
              {evolucionText}
            </p>
          </div>
        </div>
      </div>

      {/* ── Fuente y metodología ── */}
      <div className="dist-glass-panel p-5 space-y-4 relative">
        <div className="glass-reflection" />
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)]">Fuente y metodología</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[12px] text-[var(--text)] leading-relaxed">
          <div className="space-y-2">
            <p>
              <strong className="text-[var(--text-h)]">Datos reales (2012–2023):</strong>{' '}
              Encuesta Anual de Estructura Salarial (EAES) del INE. Ganancia bruta anual de asalariados a <strong>tiempo completo</strong>. Incluye todas las CCAA y todos los sectores.
            </p>
            <p>
              <strong className="text-[var(--text-h)]">Datos proyectados (2024–2026):</strong>{' '}
              Estimaciones propias aplicando IPC previsto + crecimiento real salarial ~0,5% anual sobre la última cifra oficial (2023).
            </p>
          </div>
          <div className="space-y-2">
            <p>
              <strong className="text-[var(--text-h)]">Curva de densidad:</strong>{' '}
              Aproximación log-normal calibrada con los percentiles oficiales (P10, P25, P50, P75, P90) de cada año. No es la distribución exacta, sino una estimación continua compatible con los datos observados.
            </p>
            <p>
              <strong className="text-[var(--text-h)]">Limitación:</strong>{' '}
              Los datos excluyen trabajadores a tiempo parcial y autónomos.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t text-[11.5px] space-y-1.5" style={{ borderColor: 'var(--border)' }}>
          <p className="text-[var(--text-soft)]">
            <strong className="text-[var(--text-h)]">Fuente oficial INE (EAES) →</strong>
          </p>
          <p className="font-mono text-[10.5px] break-all"
            style={{ color: 'var(--accent)', background: 'var(--accent-soft)', padding: '6px 10px', borderRadius: 6 }}>
            ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736177025&menu=resultados&idp=1254735976596
          </p>
          <p className="text-[var(--text-soft)]">
            El INE publica los datos con aproximadamente 2 años de retraso. Los últimos datos disponibles al cierre de esta herramienta corresponden al ejercicio 2023.
          </p>
        </div>
        </div>
      </div>

    </div>
  );
}

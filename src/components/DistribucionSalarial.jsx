import { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import {
  ANIOS, DISTRIBUCION_SALARIAL, percentilDe, densidadLogNormal,
  inflacionAcumulada,
} from '../engine/irpf';
import { eur } from '../utils/format';

// ─── Bell curve SVG ──────────────────────────────────────────────────────────
// viewBox 300×100 + wrapper aspectRatio 2.8:1 → x/y scale ≈ 1.07 (sin distorsión notable)
function BellCurve({ datos, salarioMarcado, dist, color = 'var(--accent)', anio }) {
  const maxSalario = 80000;
  const X = s => Math.min(300, (s / maxSalario) * 300);
  const maxD = Math.max(...datos.map(p => p.densidad), 0.000001);
  const Y = h => 86 - (h / maxD) * 68;

  const areaPath = datos.length > 0
    ? `M ${X(datos[0].salario).toFixed(1)},86 ` +
      datos.map(p => `L ${X(p.salario).toFixed(1)},${Y(p.densidad).toFixed(1)}`).join(' ') +
      ` L ${X(datos[datos.length - 1].salario).toFixed(1)},86 Z`
    : '';

  const marcaX = X(Math.min(salarioMarcado, maxSalario));
  const ejeX = [0, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 80000];

  const percentiles = [
    { v: dist?.p10, label: 'P10', short: '10' },
    { v: dist?.p25, label: 'P25', short: '25' },
    { v: dist?.p50, label: 'P50', short: '50' },
    { v: dist?.p75, label: 'P75', short: '75' },
    { v: dist?.p90, label: 'P90', short: '90' },
  ].filter(p => p.v > 0 && p.v <= maxSalario);

  // density at salary marker
  const closest = datos.reduce((best, p) =>
    Math.abs(p.salario - salarioMarcado) < Math.abs(best.salario - salarioMarcado) ? p : best,
    datos[0] || { salario: 0, densidad: 0 }
  );
  const markerY = salarioMarcado > 0 && salarioMarcado <= maxSalario
    ? Y(closest.densidad).toFixed(1)
    : '50';

  return (
    <div style={{ width: '100%', aspectRatio: '2.8/1', minHeight: 120 }}>
      <svg viewBox="0 0 300 100" preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', display: 'block' }}>

        {/* Soft grid */}
        {ejeX.map(v => (
          <line key={v} x1={X(v).toFixed(1)} y1="8" x2={X(v).toFixed(1)} y2="86"
            stroke="var(--border)" strokeWidth="0.25" />
        ))}

        {/* Percentile reference lines */}
        {percentiles.map(({ v, label }) => (
          <g key={label}>
            <line x1={X(v).toFixed(1)} y1="8" x2={X(v).toFixed(1)} y2="86"
              stroke="var(--border-light)" strokeWidth="0.6" strokeDasharray="2 2" />
            <rect x={X(v) - 8} y="2" width="16" height="8" rx="1.5"
              fill="var(--surface3)" fillOpacity="0.95" />
            <text x={X(v).toFixed(1)} y="8.5" textAnchor="middle"
              style={{ fontSize: '4.2px', fill: 'var(--text-soft)', fontFamily: 'monospace', fontWeight: 700 }}>
              P{label.replace('P','')}
            </text>
          </g>
        ))}

        {/* Density fill */}
        <path d={areaPath} fill={color} fillOpacity="0.12"
          stroke={color} strokeWidth="0.8" strokeLinejoin="round" />

        {/* Salary marker */}
        {salarioMarcado > 0 && salarioMarcado <= maxSalario && (
          <>
            <line x1={marcaX.toFixed(1)} y1="8" x2={marcaX.toFixed(1)} y2="86"
              stroke={color} strokeWidth="1.2" />
            <circle cx={marcaX.toFixed(1)} cy={markerY} r="3"
              fill={color} stroke="var(--bg)" strokeWidth="1" />
            {/* Salary label above marker */}
            <rect x={Math.min(marcaX - 20, 260)} y="11" width="40" height="8" rx="2"
              fill={color} fillOpacity="0.18" />
            <text x={Math.min(marcaX, 280).toFixed(1)} y="17.5" textAnchor="middle"
              style={{ fontSize: '4px', fill: color, fontFamily: 'monospace', fontWeight: 700 }}>
              {(salarioMarcado / 1000).toFixed(0)}k €
            </text>
          </>
        )}

        {/* Baseline */}
        <line x1="0" y1="86" x2="300" y2="86" stroke="var(--border)" strokeWidth="0.5" />

        {/* X axis labels */}
        {[10000, 20000, 30000, 40000, 50000, 60000, 70000].map(v => (
          <text key={v} x={X(v).toFixed(1)} y="96" textAnchor="middle"
            style={{ fontSize: '4px', fill: 'var(--text-soft)', fontFamily: 'monospace' }}>
            {v / 1000}k
          </text>
        ))}
      </svg>
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

  const datosHist = ANIOS.map(a => ({
    anio: a,
    p50: DISTRIBUCION_SALARIAL[a].p50,
    media: DISTRIBUCION_SALARIAL[a].media,
    p25: DISTRIBUCION_SALARIAL[a].p25,
    p75: DISTRIBUCION_SALARIAL[a].p75,
  }));

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
      <div className="liquid-glass p-5 sm:p-6" style={{
        background: `linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 35%), linear-gradient(135deg, color-mix(in srgb, var(--surface2) 80%, transparent), color-mix(in srgb, ${tono.color} 8%, transparent))`,
        borderColor: `color-mix(in srgb, ${tono.color} 30%, var(--glass-border))`,
      }}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-soft)] mb-3">
          Resultado — {anioOrigen} → {anioDestino}
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--red)' }}>En {anioOrigen}</p>
              <p className="text-[2.2rem] font-black font-mono leading-none" style={{ color: 'var(--red)' }}>
                P{escenario.percentilOrigen.toFixed(0)}
              </p>
              <p className="text-[11px] text-[var(--text-soft)] mt-0.5">{eur(salarioBase)}</p>
            </div>

            <div className="flex flex-col items-center gap-1 px-2">
              <div className="text-[1.5rem]" style={{ color: tono.color }}>{tono.icono}</div>
              <div className="font-display text-[1.1rem] font-bold" style={{ color: tono.color }}>
                {saltoPercentil > 0 ? '+' : ''}{saltoPercentil.toFixed(1)} pp
              </div>
              <p className="text-[10px] text-[var(--text-soft)] text-center leading-tight max-w-[80px]">{tono.titulo}</p>
            </div>

            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--accent)' }}>En {anioDestino}</p>
              <p className="text-[2.2rem] font-black font-mono leading-none" style={{ color: 'var(--accent)' }}>
                P{escenario.percentilDestino.toFixed(0)}
              </p>
              <p className="text-[11px] text-[var(--text-soft)] mt-0.5">{eur(escenario.salarioEquivDestino)} (equiv. IPC)</p>
            </div>
          </div>

          <div className="flex-1 text-[12.5px] text-[var(--text)] leading-relaxed">
            {saltoPercentil < -3 ? (
              <>
                Aunque tu salario <strong className="text-[var(--text-h)]">creció con la inflación</strong> ({(escenario.factor - 1) * 100 > 0 ? '+' : ''}{((escenario.factor - 1) * 100).toFixed(0)}%),
                el conjunto de la escala salarial creció más. Pagas impuestos de renta media pero, en términos relativos, eres más pobre que en {anioOrigen}.
              </>
            ) : saltoPercentil > 3 ? (
              <>
                Tu salario <strong className="text-[var(--text-h)]">creció por encima de la inflación</strong> y de la mediana salarial. Subiste en la escala relativa — cada vez más inusual.
              </>
            ) : (
              <>
                Tu posición en la escala salarial se mantiene estable entre {anioOrigen} y {anioDestino}.
                El IPC acumulado ({((escenario.factor - 1) * 100).toFixed(0)}%) y la evolución salarial se compensan.
              </>
            )}
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
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-1">Evolución histórica</p>
          <h3 className="font-display text-[1.2rem] sm:text-[1.4rem] text-[var(--text-h)] mb-1">
            Salarios nominales 2012–2026
          </h3>
          <p className="text-[12px] text-[var(--text)] mb-5 max-w-2xl">
            P25, mediana, media y P75 en euros corrientes de cada año. El gap entre media y mediana revela la asimetría de la distribución: los salarios altos tiran de la media hacia arriba.
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={datosHist} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" />
              <XAxis dataKey="anio" tick={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'monospace' }} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'monospace' }}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} width={42} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
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

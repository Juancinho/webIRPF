import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { CURVA_ART20, CURVA_ART20_REAL, ANIOS_ART20_MUESTRA, DATOS_UMBRALES, DATOS_UMBRALES_REAL, ANIOS } from '../engine/irpf';
import { eur } from '../utils/format';

const ART20_COLORS = {
  2012: '#f87171', 2015: '#facc15', 2019: '#2dd4bf',
  2023: '#a78bfa', 2024: '#c084fc', 2026: '#ffffff',
};

const UMBRAL_COLORS = {
  smi: '#4ade80', minExento: '#38bdf8',
  art20Inf: '#f59e0b', art20Sup: '#ef4444', art20Max: '#a78bfa',
};

/* ── Toggle reutilizable nominal / real ── */
function ToggleReal({ real, setReal }) {
  return (
    <div className="inline-flex items-center rounded-2xl p-1 mb-5"
      style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
      <button onClick={() => setReal(false)}
        className="relative px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300"
        style={!real ? {
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          color: 'white',
          boxShadow: '0 2px 12px rgba(56,189,248,0.25)',
        } : { color: '#64748b' }}>
        💰 € nominales
      </button>
      <button onClick={() => setReal(true)}
        className="relative px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300"
        style={real ? {
          background: 'linear-gradient(135deg, #10b981, #14b8a6)',
          color: 'white',
          boxShadow: '0 2px 12px rgba(16,185,129,0.3)',
        } : { color: '#64748b' }}>
        📊 € reales 2026
      </button>
    </div>
  );
}

/* ── Tooltips ── */
function TooltipArt20({ active, payload, label, real }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass p-4 shadow-2xl text-xs min-w-[260px]" style={{ backdropFilter: 'blur(24px)' }}>
      <p className="text-[10px] text-[#7a8baa] mb-0.5">Tu sueldo bruto − SS {real ? '(€2026)' : '(€ nominales)'}</p>
      <p className="font-extrabold text-white mb-2 border-b border-[var(--border)] pb-2 text-[13px]">{eur(label)}</p>
      <p className="text-[9px] text-[var(--accent-light)] font-semibold uppercase tracking-wider mb-1.5">
        ↓ Descuento que se resta de tu base imponible:
      </p>
      {[...payload].sort((a, b) => b.value - a.value).map(p => {
        const anio = parseInt(p.dataKey.split('_')[1]);
        return (
          <div key={p.dataKey} className="flex justify-between gap-3 py-0.5">
            <span className="flex items-center gap-1.5" style={{ color: ART20_COLORS[anio] }}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: ART20_COLORS[anio], boxShadow: `0 0 6px ${ART20_COLORS[anio]}40` }} />
              {anio}
            </span>
            <span className="font-mono text-white">{p.value > 0 ? `−${eur(p.value)}` : '0 €'}</span>
          </div>
        );
      })}
    </div>
  );
}

function TooltipUmbrales({ active, payload, label, real }) {
  if (!active || !payload?.length) return null;
  const desc = {
    smi: 'Salario mínimo legal',
    minExento: 'Si ganas menos → no te retienen IRPF',
    art20Inf: 'Si ganas menos → descuento Art.20 máximo',
    art20Sup: 'Si ganas más → descuento Art.20 = 0',
  };
  return (
    <div className="card-glass p-4 shadow-2xl text-xs min-w-[280px]" style={{ backdropFilter: 'blur(24px)' }}>
      <p className="font-extrabold text-white mb-2.5 border-b border-[var(--border)] pb-2 text-[13px]">
        Año {label} {real && <span className="text-emerald-400 font-normal text-[10px]">(en €2026)</span>}
      </p>
      {payload.filter(p => p.value).map(p => (
        <div key={p.dataKey} className="py-1">
          <div className="flex justify-between gap-3">
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: UMBRAL_COLORS[p.dataKey] }}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: UMBRAL_COLORS[p.dataKey] }} />
              {eur(p.value)}
            </span>
          </div>
          <p className="text-[10px] text-[#7a8baa] ml-3.5 mt-0.5">{desc[p.dataKey]}</p>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/*  TAB 1 — Curva Art.20                                     */
/* ══════════════════════════════════════════════════════════ */
function TabCurvaArt20() {
  const [aniosVis, setAniosVis] = useState(new Set(ANIOS_ART20_MUESTRA));
  const [real, setReal] = useState(false);
  const toggle = a => setAniosVis(prev => {
    const next = new Set(prev); if (next.has(a)) { if (next.size > 1) next.delete(a); } else next.add(a); return next;
  });
  const data = real ? CURVA_ART20_REAL : CURVA_ART20;

  return (
    <div>
      {/* Explicación */}
      <div className="info-card mb-5 text-[13px] text-[#94a3b8] leading-relaxed space-y-3">
        <div>
          <strong className="text-white font-semibold">📖 ¿Qué es esto?</strong>{' '}
          El Art. 20 te permite restar una cantidad de tu sueldo <em>antes</em> de calcular el IRPF.
          Es un «descuento» que reduce tu base imponible — cuanto más alto, menos impuestos pagas.
        </div>
        <div>
          <strong className="text-white font-semibold">📊 Ejes del gráfico:</strong>
          <ul className="mt-1.5 space-y-1 ml-4 list-disc">
            <li><strong className="text-white">→ Horizontal:</strong> tu sueldo bruto menos la Seguridad Social</li>
            <li><strong className="text-white">↑ Vertical:</strong> euros que se descuentan de tu base imponible</li>
            <li><strong className="text-white">Cada línea</strong> = un año. Más alta y ancha = más protección fiscal</li>
          </ul>
        </div>
        <div className="border-t border-[var(--border)] pt-3">
          <strong className="text-orange-400 font-semibold">⚠ Zona cliff:</strong>{' '}
          donde la línea baja en picado. Si te suben el sueldo 100€ ahí, pierdes parte del descuento
          y tu base imponible sube <em>más</em> de 100€. Puedes pagar más impuestos que lo que recibes de subida.
        </div>
      </div>

      <ToggleReal real={real} setReal={setReal} />

      {real && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-[12px] text-emerald-300/80 leading-relaxed">
          💡 <strong className="text-emerald-300">Vista en €2026:</strong> ahora puedes comparar directamente entre años.
          Si dos líneas coinciden, el descuento tiene el mismo valor <em>real</em>. Si la de 2026 está por encima de la de 2012,
          el descuento ha crecido más que la inflación.
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-4">
        {ANIOS_ART20_MUESTRA.map(a => (
          <button key={a} onClick={() => toggle(a)}
            className={`year-btn ${aniosVis.has(a) ? 'active' : ''}`}
            style={aniosVis.has(a) ? { background: ART20_COLORS[a], borderColor: ART20_COLORS[a] } : {}}>
            {a}
          </button>
        ))}
      </div>

      <p className="text-[10px] text-[#5a6b82] mb-2 font-medium">
        Eje X: <strong className="text-[#7a8baa]">sueldo bruto − SS</strong>{real ? ' (€2026)' : ' (€ nominales)'} ·
        Eje Y: <strong className="text-[#7a8baa]">descuento Art.20</strong>{real ? ' (€2026)' : ' (€ nominales)'}
      </p>

      <div style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 5, right: 20, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" vertical={false} />
            <XAxis dataKey="rn" stroke="#1a2040" tick={{ fontSize:10, fill:'#4b5563' }} tickFormatter={v => `${v/1000}k€`} tickLine={false} />
            <YAxis stroke="#1a2040" tick={{ fontSize:11, fill:'#4b5563' }} tickFormatter={v => `${v/1000}k€`} width={50} tickLine={false} />
            <Tooltip content={<TooltipArt20 real={real} />} />
            {ANIOS_ART20_MUESTRA.filter(a => aniosVis.has(a)).map(a => (
              <Line key={a} type="monotone" dataKey={`red_${a}`}
                stroke={ART20_COLORS[a]} strokeWidth={a === 2026 ? 2.5 : 2}
                dot={false} activeDot={{ r: 5, strokeWidth: 0 }} isAnimationActive={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-4 mt-3">
        {ANIOS_ART20_MUESTRA.filter(a => aniosVis.has(a)).map(a => (
          <span key={a} className="flex items-center gap-2 text-xs font-medium" style={{ color: ART20_COLORS[a] }}>
            <span className="w-5 h-0.5 inline-block rounded" style={{ background: ART20_COLORS[a], boxShadow: `0 0 8px ${ART20_COLORS[a]}40` }} />
            {a}
          </span>
        ))}
      </div>

      {/* Tabla */}
      <div className="mt-6">
        <p className="text-[11px] text-[#7a8baa] mb-3 font-medium leading-relaxed">
          📋 <strong className="text-white">Tabla resumen:</strong> la columna <strong className="text-orange-400">«Pérdida por €100 de subida»</strong> indica
          cuántos euros de descuento pierdes cuando tu sueldo sube 100€ dentro de la zona cliff.
        </p>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Año</th>
                <th>Descuento máximo hasta…</th>
                <th>Descuento máx. (€)</th>
                <th>Descuento = 0 desde…</th>
                <th>Ancho zona cliff</th>
                <th>Pérdida por €100 de subida</th>
              </tr>
            </thead>
            <tbody>
              {ANIOS_ART20_MUESTRA.map(a => {
                const d = DATOS_UMBRALES.find(x => x.anio === a);
                const zona = d && d.art20Inf && d.art20Sup ? d.art20Sup - d.art20Inf : null;
                const pendiente = d && d.art20Max && zona ? d.art20Max / zona : null;
                return (
                  <tr key={a}>
                    <td className="font-bold" style={{ color: ART20_COLORS[a] }}>{a}</td>
                    <td className="font-mono text-[#94a3b8]">{d?.art20Inf ? eur(d.art20Inf) : '—'}</td>
                    <td className="font-mono text-white font-bold">{d?.art20Max ? eur(d.art20Max) : '—'}</td>
                    <td className="font-mono text-[#94a3b8]">{d?.art20Sup ? eur(d.art20Sup) : '—'}</td>
                    <td className="font-mono text-orange-400">{zona ? eur(zona) : '—'}</td>
                    <td className="font-mono">
                      {pendiente != null ? (
                        <span className={pendiente > 1 ? 'text-red-400 font-bold' : 'text-[#94a3b8]'}>
                          {(pendiente * 100).toFixed(0)}€
                          {pendiente > 1 && <span className="text-[10px] text-red-400/60 ml-1">(¡más que la subida!)</span>}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 info-card text-[12px] text-[#7a8baa] leading-relaxed">
          <strong className="text-white font-semibold">💡 Ejemplo:</strong>{' '}
          Si la columna pone <strong className="text-red-400">175€</strong>, significa que por cada 100€ de subida bruta,
          pierdes 175€ de descuento. Tu base imponible sube 275€ (100 + 175). Al 19% de IRPF serían 52€ de impuestos
          por una subida de 100€ → <strong className="text-white">te quedas solo con ~48€ netos.</strong>
        </div>
        <p className="text-[10px] text-[#4b5563] mt-2 font-medium">Fuente: Art. 20 LIRPF; redacciones históricas — BOE</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/*  TAB 2 — Evolución de umbrales                            */
/* ══════════════════════════════════════════════════════════ */
function TabEvolucionUmbrales() {
  const [series, setSeries] = useState(new Set(['smi','minExento','art20Inf','art20Sup']));
  const [real, setReal] = useState(false);
  const toggle = s => setSeries(prev => { const next = new Set(prev); if (next.has(s)) { if (next.size > 1) next.delete(s); } else next.add(s); return next; });
  const data = real ? DATOS_UMBRALES_REAL : DATOS_UMBRALES;

  const labels = {
    smi:      { label:'SMI anual',            color: UMBRAL_COLORS.smi,      dash: '' },
    minExento:{ label:'Mín. exento retención', color: UMBRAL_COLORS.minExento, dash: '6 3' },
    art20Inf: { label:'Art.20 — umbral inf.',  color: UMBRAL_COLORS.art20Inf, dash: '4 2' },
    art20Sup: { label:'Art.20 — umbral sup.',  color: UMBRAL_COLORS.art20Sup, dash: '3 3' },
  };

  return (
    <div>
      <div className="info-card mb-5 text-[13px] text-[#94a3b8] leading-relaxed space-y-3">
        <div>
          <strong className="text-white font-semibold">📖 ¿Qué es esto?</strong>{' '}
          El sistema fiscal tiene 4 «líneas invisibles» que determinan cuánto IRPF pagas. Este gráfico muestra
          cómo han cambiado desde 2012.
        </div>
        <div>
          <strong className="text-white font-semibold">📊 ¿Qué representa cada línea?</strong>
          <ul className="mt-1.5 space-y-2 ml-1">
            <li className="flex items-start gap-2">
              <span className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ background: UMBRAL_COLORS.smi }} />
              <div><strong className="text-emerald-400">SMI anual</strong> — el salario mínimo legal. Si cobras esto, eres trabajador de salario mínimo.</div>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ background: UMBRAL_COLORS.minExento }} />
              <div><strong className="text-sky-400">Mínimo exento de retención</strong> — si tu sueldo bruto es menor que esta cifra, <strong className="text-white">NO te retienen IRPF</strong> en nómina. Tu sueldo neto = bruto − Seguridad Social.</div>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ background: UMBRAL_COLORS.art20Inf }} />
              <div><strong className="text-amber-400">Art.20 — umbral inferior</strong> — si tu rendimiento neto previo (bruto − SS) es menor que esto, tienes el <strong className="text-white">descuento máximo</strong> del Art. 20. Es el mejor trato fiscal posible.</div>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ background: UMBRAL_COLORS.art20Sup }} />
              <div><strong className="text-red-400">Art.20 — umbral superior</strong> — si ganas más que esto, <strong className="text-white">pierdes todo el descuento</strong> del Art. 20. Entre el umbral inferior (amarillo) y este (rojo) está la «zona cliff».</div>
            </li>
          </ul>
        </div>
        <div className="border-t border-[var(--border)] pt-3">
          <strong className="text-white font-semibold">🔍 ¿Qué buscar?</strong>{' '}
          Si el <span className="text-emerald-400 font-semibold">SMI</span> está por debajo del{' '}
          <span className="text-amber-400 font-semibold">umbral inferior</span>, los trabajadores de salario mínimo tienen el descuento máximo.
          Si el <span className="text-sky-400 font-semibold">mínimo exento</span> sube, más gente deja de pagar IRPF.
          La distancia entre <span className="text-amber-400">amarillo</span> y <span className="text-red-400">rojo</span> es la «zona cliff».
        </div>
      </div>

      <ToggleReal real={real} setReal={setReal} />

      {real && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-[12px] text-emerald-300/80 leading-relaxed">
          💡 <strong className="text-emerald-300">Vista en €2026:</strong> ahora ves el valor <em>real</em> de cada umbral, descontando la inflación.
          Si una línea sube, ha crecido más que los precios. Si baja, ha perdido poder adquisitivo.
          En nominal el SMI parece haber subido un ~90%, pero en real (€2026) ha subido ~52%.
        </div>
      )}

      <div className="flex gap-2 flex-wrap mb-4">
        {Object.entries(labels).map(([key, { label, color }]) => (
          <button key={key} onClick={() => toggle(key)}
            className={`year-btn ${series.has(key) ? 'active' : ''}`}
            style={series.has(key) ? { background: color, borderColor: color } : {}}>
            {label}
          </button>
        ))}
      </div>

      <p className="text-[10px] text-[#5a6b82] mb-2 font-medium">
        Eje X: <strong className="text-[#7a8baa]">año</strong> ·
        Eje Y: <strong className="text-[#7a8baa]">importe en {real ? '€ de 2026 (inflación descontada)' : '€ de cada año (nominales)'}</strong>
      </p>

      <div style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 5, right: 20, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2040" vertical={false} />
            <XAxis dataKey="anio" stroke="#1a2040" tick={{ fontSize:11, fill:'#4b5563' }} tickLine={false} />
            <YAxis stroke="#1a2040" tick={{ fontSize:11, fill:'#4b5563' }} tickFormatter={v => `${v/1000}k€`} width={50} tickLine={false} />
            <Tooltip content={<TooltipUmbrales real={real} />} />
            {Object.entries(labels).filter(([k]) => series.has(k)).map(([key, { label, color, dash }]) => (
              <Line key={key} type="monotone" dataKey={key}
                stroke={color} strokeWidth={2} strokeDasharray={dash}
                dot={{ r:3, fill:color, strokeWidth:0 }} activeDot={{ r:5, strokeWidth:0 }}
                name={label} isAnimationActive={false} connectNulls={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-4 mt-3">
        {Object.entries(labels).filter(([k]) => series.has(k)).map(([key, { label, color, dash }]) => (
          <span key={key} className="flex items-center gap-2 text-xs font-medium" style={{ color }}>
            <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke={color} strokeWidth="2" strokeDasharray={dash} /></svg>
            {label}
          </span>
        ))}
      </div>
      <p className="text-[10px] text-[#4b5563] mt-2.5 font-medium">
        Fuentes: LIRPF arts. 20, 57, 85-86 RIRPF; Órdenes anuales de cotización SS; RDs de SMI (BOE).
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
export default function GraficoMecanismos() {
  const [tab, setTab] = useState('art20');
  return (
    <div>
      <div className="flex gap-2.5 mb-6 flex-wrap">
        {[
          ['art20', '📉 Curva de reducción Art.20'],
          ['umbrales', '📊 Evolución de umbrales clave'],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${tab === id
              ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] border-transparent text-white shadow-lg shadow-sky-500/20'
              : 'border-[var(--border)] text-[#94a3b8] hover:border-[var(--accent)] hover:text-[var(--accent-light)] hover:bg-[var(--accent-dim)]'}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'art20'    && <TabCurvaArt20 />}
      {tab === 'umbrales' && <TabEvolucionUmbrales />}
    </div>
  );
}

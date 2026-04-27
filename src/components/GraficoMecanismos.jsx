import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { CURVA_ART20, CURVA_ART20_REAL, ANIOS_ART20_MUESTRA, DATOS_UMBRALES, DATOS_UMBRALES_REAL, ANIOS } from '../engine/irpf';
import { eur } from '../utils/format';
import { YEAR_COLORS as ART20_COLORS } from './GraficoComparativo';

const UMBRAL_COLORS = {
  smi: 'var(--green)', minExento: 'var(--accent)',
  art20Inf: 'var(--yellow)', art20Sup: 'var(--red)', art20Max: '#c9956b',
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
        } : { color: 'var(--text-soft)' }}>
        € nominales
      </button>
      <button onClick={() => setReal(true)}
        className="relative px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300"
        style={real ? {
          background: 'linear-gradient(135deg, #10b981, #14b8a6)',
          color: 'white',
          boxShadow: '0 2px 12px rgba(16,185,129,0.3)',
        } : { color: 'var(--text-soft)' }}>
        € reales 2026
      </button>
    </div>
  );
}

/* ── Tooltips ── */
function TooltipArt20({ active, payload, label, real }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass p-4 shadow-2xl text-xs min-w-[260px]" style={{ backdropFilter: 'blur(24px)' }}>
      <p className="text-[10px] text-[var(--text-soft)] mb-0.5">Tu sueldo bruto − SS {real ? '(€2026)' : '(€ nominales)'}</p>
      <p className="font-extrabold text-[var(--text-h)] mb-2 border-b border-[var(--border)] pb-2 text-[13px]">{eur(label)}</p>
      <p className="text-[9px] text-[var(--accent-light)] font-semibold uppercase tracking-wider mb-1.5">
        Descuento que se resta de tu base imponible:
      </p>
      {[...payload].sort((a, b) => b.value - a.value).map(p => {
        const anio = parseInt(p.dataKey.split('_')[1]);
        return (
          <div key={p.dataKey} className="flex justify-between gap-3 py-0.5">
            <span className="flex items-center gap-1.5" style={{ color: ART20_COLORS[anio] }}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: ART20_COLORS[anio], boxShadow: `0 0 6px ${ART20_COLORS[anio]}40` }} />
              {anio}
            </span>
            <span className="font-mono text-[var(--text-h)]">{p.value > 0 ? `−${eur(p.value)}` : '0 €'}</span>
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
      <p className="font-extrabold text-[var(--text-h)] mb-2.5 border-b border-[var(--border)] pb-2 text-[13px]">
        Año {label} {real && <span className="text-emerald-400 font-normal text-[10px]">(en €2026)</span>}
      </p>
      {payload.filter(p => p.value).map(p => (
        <div key={p.dataKey} className="py-1">
          <div className="flex justify-between gap-3">
            <span className="flex items-center gap-1.5 font-semibold" style={{ color: UMBRAL_COLORS[p.dataKey] }}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: UMBRAL_COLORS[p.dataKey] }} />
              <span className="text-[var(--text-h)]">{eur(p.value)}</span>
            </span>
          </div>
          <p className="text-[10px] text-[var(--text-soft)] ml-3.5 mt-0.5">{desc[p.dataKey]}</p>
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
      <div className="mb-5 space-y-2.5 text-[13px] text-[var(--text)] leading-relaxed">

        {/* Bloque 1: Qué muestra */}
        <div className="info-card space-y-1.5">
          <strong className="text-white font-semibold"> ¿Qué muestra este gráfico?</strong>
          <p>
            El Art. 20 te deja restar euros de tu renta <em>antes</em> de que Hacienda calcule tu IRPF.
            Es como si una parte de tu sueldo no existiera a efectos fiscales.{' '}
            <strong className="text-white">Cuanto mayor el descuento, menos pagas.</strong>
          </p>
          <p>
            El gráfico muestra ese descuento según tu sueldo. <strong className="text-white">Cada línea es un año</strong> — puedes ver cómo ha cambiado la generosidad del sistema desde 2012 hasta hoy.
          </p>
        </div>

        {/* Bloque 2: Cómo leer los ejes */}
        <div className="info-card space-y-2">
          <strong className="text-white font-semibold"> Cómo encontrarte en el gráfico</strong>
          <div className="flex gap-3 mt-1">
            <div className="flex-1 rounded-xl p-2.5 text-[12px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div className="text-[var(--accent-light)] font-bold mb-1">→ Eje horizontal</div>
              <div>Tu sueldo bruto anual <strong className="text-white">menos lo que cotizas a la SS</strong> (~6,35%).</div>
              <div className="mt-1 text-[var(--text-soft)] text-[11px]">Ejemplo: cobras 20.000€ brutos → pagas ~1.270€ de SS → eje X = 18.730€</div>
            </div>
            <div className="flex-1 rounded-xl p-2.5 text-[12px]" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div className="text-[var(--accent-light)] font-bold mb-1">↑ Eje vertical</div>
              <div>Euros que <strong className="text-white">Hacienda descuenta de tu renta</strong> antes de aplicarte el tipo impositivo.</div>
              <div className="mt-1 text-[var(--text-soft)] text-[11px]">Si vale 5.000€ → tributas como si ganaras 5.000€ menos de lo que realmente ganas.</div>
            </div>
          </div>
          <p className="text-[12px] text-[var(--text-soft)]">
            Localiza tu posición en el eje horizontal → sube hasta la línea del año que te interesa → el valor vertical es tu descuento.
          </p>
        </div>

        {/* Bloque 3: Las tres zonas */}
        <div className="info-card space-y-2">
          <strong className="text-white font-semibold"> Las tres zonas de la curva</strong>
          <div className="space-y-2 mt-1">
            <div className="flex items-start gap-3 p-2.5 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="shrink-0 mt-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">PLANA</div>
              <div className="text-[12px]">
                <strong className="text-emerald-400">Descuento máximo y constante</strong> — aunque ganes algo más, el descuento no baja.
                Es la zona de mejor trato fiscal. <em>Aquí una subida de sueldo se traduce directamente en más neto.</em>
              </div>
            </div>
            <div className="flex items-start gap-3 p-2.5 rounded-xl" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)' }}>
              <div className="shrink-0 mt-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400">CLIFF</div>
              <div className="text-[12px]">
                <strong className="text-orange-400">La línea cae en picado</strong> — cada euro que sube tu sueldo reduce el descuento.
                Tu base imponible crece <em>más rápido</em> que tu sueldo.{' '}
                <strong className="text-white">De €100 brutos pueden llegarte solo €40-60 netos.</strong>
              </div>
            </div>
            <div className="flex items-start gap-3 p-2.5 rounded-xl" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
              <div className="shrink-0 mt-0.5 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-red-500/20 text-red-400">CERO</div>
              <div className="text-[12px]">
                <strong className="text-red-400">Descuento agotado</strong> — ya no hay alivio fiscal del Art.20.
                A partir de aquí el IRPF se aplica sobre tu renta íntegra, sin ningún descuento adicional.
              </div>
            </div>
          </div>
        </div>

        {/* Bloque 4: Comparar líneas entre años */}
        <div className="info-card space-y-1.5">
          <strong className="text-white font-semibold"> ¿Qué significa que una línea esté más alta o más ancha?</strong>
          <ul className="mt-1 space-y-1.5 text-[12px]">
            <li className="flex items-start gap-2">
              <span className="text-white font-bold shrink-0">↑ Más alta</span>
              <span>el descuento máximo es mayor → pagas menos IRPF en esa zona.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white font-bold shrink-0">↔ Más ancha</span>
              <span>la zona plana llega a sueldos más altos → más gente disfruta del descuento máximo.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white font-bold shrink-0"> Cliff más a la derecha</span>
              <span>la zona de riesgo empieza más tarde → menos trabajadores quedan expuestos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 font-bold shrink-0"> Caída más pronunciada</span>
              <span>el efecto cliff es más severo → de €100 brutos te llegan menos netos dentro de esa bajada.</span>
            </li>
          </ul>
        </div>

      </div>

      <ToggleReal real={real} setReal={setReal} />

      {real && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-[12px] text-emerald-300/80 leading-relaxed">
          <strong className="text-emerald-300">Vista en €2026:</strong> ahora puedes comparar directamente entre años.
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

      <p className="text-[10px] text-[var(--text-soft)] mb-2 font-medium">
        Eje X: <strong className="text-[var(--text-soft)]">sueldo bruto − SS</strong>{real ? ' (€2026)' : ' (€ nominales)'} ·
        Eje Y: <strong className="text-[var(--text-soft)]">descuento Art.20</strong>{real ? ' (€2026)' : ' (€ nominales)'}
      </p>

      <div style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 5, right: 20, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="rn" stroke="var(--border)" tick={{ fontSize: 10, fill: 'var(--text-soft)' }} tickFormatter={v => `${v / 1000}k€`} tickLine={false} />
            <YAxis stroke="var(--border)" tick={{ fontSize: 11, fill: 'var(--text-soft)' }} tickFormatter={v => `${v / 1000}k€`} width={50} tickLine={false} />
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
        <p className="text-[11px] text-[var(--text-soft)] mb-3 font-medium leading-relaxed">
          <strong className="text-white">Tabla resumen:</strong> la última columna muestra el efecto real de cobrar €100 más en la zona cliff.
          Pierdes parte del descuento Art.20, lo que infla tu base imponible — y al final <strong className="text-orange-400">de €100 brutos
            solo te llegan unos pocos euros netos.</strong> Compara con fuera del cliff: sin ese efecto, €100 brutos → ~€81 netos (al 19% IRPF).
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
                <th>De €100 brutos de subida… ¿cuánto llega al bolsillo?</th>
              </tr>
            </thead>
            <tbody>
              {ANIOS_ART20_MUESTRA.map(a => {
                const d = DATOS_UMBRALES.find(x => x.anio === a);
                const zona = d && d.art20Inf && d.art20Sup ? d.art20Sup - d.art20Inf : null;
                const pendiente = d && d.art20Max && zona ? d.art20Max / zona : null;
                const descuentoPerdido = pendiente != null ? Math.round(pendiente * 100) : null;
                const baseExtra = descuentoPerdido != null ? 100 + descuentoPerdido : null;
                const netos = baseExtra != null ? Math.round(100 - baseExtra * 0.19) : null;
                const netosColor = netos == null ? '' : netos > 75 ? 'text-emerald-400' : netos > 60 ? 'text-amber-300' : netos > 45 ? 'text-orange-400' : 'text-red-400';
                return (
                  <tr key={a}>
                    <td className="font-bold" style={{ color: ART20_COLORS[a] }}>{a}</td>
                    <td className="font-mono text-[var(--text)]">{d?.art20Inf ? eur(d.art20Inf) : '—'}</td>
                    <td className="font-mono text-white font-bold">{d?.art20Max ? eur(d.art20Max) : '—'}</td>
                    <td className="font-mono text-[var(--text)]">{d?.art20Sup ? eur(d.art20Sup) : '—'}</td>
                    <td className="font-mono text-orange-400">{zona ? eur(zona) : '—'}</td>
                    <td className="font-mono">
                      {netos != null ? (
                        <div>
                          <span className={`text-[15px] font-extrabold ${netosColor}`}>
                            ~{netos}€ netos
                          </span>
                          <div className="text-[10px] text-[var(--text-soft)] mt-0.5 leading-tight">
                            base sube +{baseExtra}€ → {baseExtra}×19% = {Math.round(baseExtra * 0.19)}€ IRPF
                          </div>
                          <div className="text-[10px] text-[var(--text-soft)] leading-tight">
                            (pierdes {descuentoPerdido}€ de descuento Art.20)
                          </div>
                          {pendiente > 1 && (
                            <div className="text-[10px] text-red-400/80 font-semibold mt-0.5"> cliff muy severo</div>
                          )}
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 info-card text-[12px] text-[var(--text-soft)] leading-relaxed space-y-2">
          <div>
            <strong className="text-white font-semibold"> Fuera del cliff</strong>{' '}
            (sueldo normal, sin zona de riesgo): €100 brutos → base sube €100 → €19 de IRPF →{' '}
            <strong className="text-emerald-400">~€81 netos.</strong>
          </div>
          <div>
            <strong className="text-white font-semibold"> Dentro del cliff</strong>{' '}
            (ejemplo con descuento perdido de €175): €100 brutos → base sube €275 → €52 de IRPF →{' '}
            <strong className="text-red-400">~€48 netos.</strong>{' '}
            Perder €33 por el efecto cliff aunque te suban el sueldo.
          </div>
          <div className="text-[11px] text-[var(--text-soft)]/60 border-t border-[var(--border)] pt-2">
            Estimación con tipo marginal del 19% (1.er tramo IRPF, el habitual en esta franja salarial). Resultado orientativo; la cifra exacta depende de tu situación personal.
          </div>
        </div>
        <p className="text-[10px] text-[var(--text-soft)] mt-2 font-medium">Fuente: Art. 20 LIRPF; redacciones históricas — BOE</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════ */
/*  TAB 2 — Evolución de umbrales                            */
/* ══════════════════════════════════════════════════════════ */
function TabEvolucionUmbrales() {
  const [series, setSeries] = useState(new Set(['smi', 'minExento', 'art20Inf', 'art20Sup']));
  const [real, setReal] = useState(false);
  const toggle = s => setSeries(prev => { const next = new Set(prev); if (next.has(s)) { if (next.size > 1) next.delete(s); } else next.add(s); return next; });
  const data = real ? DATOS_UMBRALES_REAL : DATOS_UMBRALES;

  const labels = {
    smi: { label: 'SMI anual', color: UMBRAL_COLORS.smi, dash: '' },
    minExento: { label: 'Mín. exento retención', color: UMBRAL_COLORS.minExento, dash: '6 3' },
    art20Inf: { label: 'Art.20 — umbral inf.', color: UMBRAL_COLORS.art20Inf, dash: '4 2' },
    art20Sup: { label: 'Art.20 — umbral sup.', color: UMBRAL_COLORS.art20Sup, dash: '3 3' },
  };

  return (
    <div>
      <div className="info-card mb-5 text-[13px] text-[var(--text)] leading-relaxed space-y-3">
        <div>
          <strong className="text-white font-semibold"> ¿Qué es esto?</strong>{' '}
          El sistema fiscal tiene 4 «líneas invisibles» que determinan cuánto IRPF pagas. Este gráfico muestra
          cómo han cambiado desde 2012.
        </div>
        <div>
          <strong className="text-white font-semibold"> ¿Qué representa cada línea?</strong>
          <ul className="mt-1.5 space-y-2 ml-1">
            <li className="flex items-start gap-2">
              <span className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ background: UMBRAL_COLORS.smi }} />
              <div><strong className="text-emerald-400">SMI anual</strong> — el salario mínimo legal. Si cobras esto, eres trabajador de salario mínimo.</div>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-3 h-3 rounded-full shrink-0 mt-0.5" style={{ background: UMBRAL_COLORS.minExento }} />
              <div><strong className="text-[#d4a853]">Mínimo exento de retención</strong> — si tu sueldo bruto es menor que esta cifra, <strong className="text-white">NO te retienen IRPF</strong> en nómina. Tu sueldo neto = bruto − Seguridad Social.</div>
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
          <strong className="text-white font-semibold"> ¿Qué buscar?</strong>{' '}
          Si el <span className="text-emerald-400 font-semibold">SMI</span> está por debajo del{' '}
          <span className="text-amber-400 font-semibold">umbral inferior</span>, los trabajadores de salario mínimo tienen el descuento máximo.
          Si el <span className="text-[#d4a853] font-semibold">mínimo exento</span> sube, más gente deja de pagar IRPF.
          La distancia entre <span className="text-amber-400">amarillo</span> y <span className="text-red-400">rojo</span> es la «zona cliff».
        </div>
      </div>

      <ToggleReal real={real} setReal={setReal} />

      {real && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-[12px] text-emerald-300/80 leading-relaxed">
          <strong className="text-emerald-300">Vista en €2026:</strong> ahora ves el valor <em>real</em> de cada umbral, descontando la inflación.
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

      <p className="text-[10px] text-[var(--text-soft)] mb-2 font-medium">
        Eje X: <strong className="text-[var(--text-soft)]">año</strong> ·
        Eje Y: <strong className="text-[var(--text-soft)]">importe en {real ? '€ de 2026 (inflación descontada)' : '€ de cada año (nominales)'}</strong>
      </p>

      <div style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 5, right: 20, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="anio" stroke="var(--border)" tick={{ fontSize: 11, fill: 'var(--text-soft)' }} tickLine={false} />
            <YAxis stroke="var(--border)" tick={{ fontSize: 11, fill: 'var(--text-soft)' }} tickFormatter={v => `${v / 1000}k€`} width={50} tickLine={false} />
            <Tooltip content={<TooltipUmbrales real={real} />} />
            {Object.entries(labels).filter(([k]) => series.has(k)).map(([key, { label, color, dash }]) => (
              <Line key={key} type="monotone" dataKey={key}
                stroke={color} strokeWidth={2} strokeDasharray={dash}
                dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }}
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
      <p className="text-[10px] text-[var(--text-soft)] mt-2.5 font-medium">
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
          ['art20', ' Curva de reducción Art.20'],
          ['umbrales', ' Evolución de umbrales clave'],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${tab === id
              ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] border-transparent shadow-lg shadow-indigo-500/20'
              : 'border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent-light)] hover:bg-[var(--accent-dim)]'}`}
            style={tab === id ? { color: '#fff' } : {}}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'art20' && <TabCurvaArt20 />}
      {tab === 'umbrales' && <TabEvolucionUmbrales />}
    </div>
  );
}

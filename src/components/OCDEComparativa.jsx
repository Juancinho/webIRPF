import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import {
  CARGA_PERSONAL_OCDE_2025,
  CUNA_OCDE_2025,
  CUNA_OCDE_META,
  calcularNomina,
} from '../engine/irpf';
import { eur } from '../utils/format';

const ESPANA = CUNA_OCDE_2025.find(p => p.code === 'ES');
const MEDIA_OCDE = CUNA_OCDE_2025.find(p => p.code === 'OECD');
const PAISES_OCDE = CUNA_OCDE_2025.filter(p => !p.media);
const POSICION_ESPANA = [...PAISES_OCDE].sort((a, b) => b.total - a.total).findIndex(p => p.code === 'ES') + 1;
const DIFERENCIA_MEDIA = ESPANA.total - MEDIA_OCDE.total;
const COSTE_NORMALIZADO = 100;

const datos = CUNA_OCDE_2025.map(p => ({
  pais: p.pais,
  code: p.code,
  Neto: parseFloat((100 - p.total).toFixed(1)),
  'Impuesto renta': p.irpf,
  'Cot. trabajador': p.cotTrab,
  'Cot. empresa': p.cotEmp,
  total: p.total,
  esp: p.esp,
  media: p.media,
})).sort((a, b) => b.total - a.total);

const COLOR_NETO = '#34d399';
const COLOR_IRPF = '#fb7185';
const COLOR_TRAB = '#fbbf24';
const COLOR_EMP = '#818cf8';

function ComparativaTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const fila = datos.find(d => d.pais === label);
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <p className="font-bold text-[var(--text-h)] mb-1">
        {label}{fila?.esp ? ' 🇪🇸' : ''}{fila?.media ? ' (media)' : ''}
      </p>
      <p style={{ color: 'var(--red)' }}>Cuña total: <strong>{fila?.total}%</strong></p>
      {payload.map((item) => (
        <p key={item.dataKey} style={{ color: item.fill }}>{item.name}: {item.value.toFixed(1)}%</p>
      ))}
    </div>
  );
}

export default function OCDEComparativa({ bruto = 35000, anio = 2026, opts }) {
  const [paisRef, setPaisRef] = useState('DE');

  const referencia = CUNA_OCDE_2025.find(p => p.code === paisRef) || CUNA_OCDE_2025[1];

  const netoEspana = COSTE_NORMALIZADO - ESPANA.total;
  const netoRef = COSTE_NORMALIZADO - referencia.total;
  const diferencia = netoRef - netoEspana;

  const irpfTuyo = useMemo(() => calcularNomina(bruto, anio, opts), [bruto, anio, opts]);

  const miCuña = useMemo(() => {
    const r = irpfTuyo;
    const total = r.costeLab || 1;
    return {
      neto: r.salarioNeto,
      irpf: r.irpfFinal,
      ssTra: r.cotTra,
      ssEmp: r.cotEmp,
      costeLab: total,
      netoPct: ((r.salarioNeto / total) * 100).toFixed(1),
      irpfPct: ((r.irpfFinal / total) * 100).toFixed(1),
      ssTraPct: ((r.cotTra / total) * 100).toFixed(1),
      ssEmpPct: ((r.cotEmp / total) * 100).toFixed(1),
      totalPct: (((total - r.salarioNeto) / total) * 100).toFixed(1),
    };
  }, [irpfTuyo]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-h)] mb-1">Cuña fiscal OCDE — ¿cuánto de tu sueldo nunca llega a tu cuenta?</h2>
        <p className="text-[13px] text-[var(--text)] leading-relaxed max-w-3xl">
          La cuña fiscal compara el coste laboral con el neto del trabajador: impuesto personal sobre la renta + cotizaciones del trabajador + cotizaciones e impuestos sobre nóminas del empleador, menos las prestaciones monetarias aplicables.
          Para una persona soltera, sin hijos y al salario medio, España ocupa el <strong>{POSICION_ESPANA}.º puesto de 38</strong>, con un <strong style={{ color: 'var(--red)' }}>{ESPANA.total}%</strong>: {DIFERENCIA_MEDIA.toFixed(1).replace('.', ',')} puntos por encima de la media OCDE.
          <span className="source-inline">Fuente: OCDE, <span className="font-mono">{CUNA_OCDE_META.informe}, tabla {CUNA_OCDE_META.tabla} (datos de {CUNA_OCDE_META.ejercicio}).</span></span>
        </p>
      </div>

      {/* Métricas rápidas España */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Cuña total', `${ESPANA.total}%`, 'del coste laboral', 'var(--red)'],
          ['Impuesto renta', `${ESPANA.irpf}%`, 'del coste laboral', 'var(--yellow)'],
          ['Cot. trabajador', `${ESPANA.cotTrab}%`, 'del coste laboral', 'var(--accent)'],
          ['Cot. empresa', `${ESPANA.cotEmp}%`, 'incluye payroll taxes', 'var(--text-soft)'],
        ].map(([label, value, sub, color]) => (
          <div key={label} className="card p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-soft)] mb-1">{label}</div>
            <div className="text-2xl font-black font-mono" style={{ color }}>{value}</div>
            <div className="text-[11px] text-[var(--text)] mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Gráfico de barras apiladas */}
      <div className="card p-4 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-1">Comparativa internacional</p>
        <h3 className="text-base font-bold text-[var(--text-h)] mb-4">
          Los 38 países OCDE · desglose del coste laboral en 2025
        </h3>
        <ResponsiveContainer width="100%" height={Math.max(520, datos.length * 28)}>
          <BarChart
            data={datos}
            layout="vertical"
            margin={{ top: 4, right: 4, left: 0, bottom: 4 }}
            stackOffset="expand"
          >
            <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tickFormatter={v => `${(v * 100).toFixed(0)}%`}
              tick={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'monospace' }} domain={[0, 1]} />
            <YAxis type="category" dataKey="pais" width={120} interval={0} minTickGap={0}
              tick={({ x, y, payload }) => {
                const d = datos.find(dd => dd.pais === payload.value);
                return (
                  <text x={x} y={y} dy={4} textAnchor="end"
                    style={{ fontSize: 11, fontWeight: d?.esp ? 700 : 400, fill: d?.esp ? 'var(--red)' : d?.media ? 'var(--text-soft)' : 'var(--text)' }}>
                    {payload.value}{d?.esp ? ` · ${d.total.toFixed(1).replace('.', ',')}% 🇪🇸` : ''}
                  </text>
                );
              }}
            />
            <Tooltip content={<ComparativaTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="Neto" stackId="a" fill={COLOR_NETO} />
            <Bar dataKey="Impuesto renta" stackId="a" fill={COLOR_IRPF} />
            <Bar dataKey="Cot. trabajador" stackId="a" fill={COLOR_TRAB} />
            <Bar dataKey="Cot. empresa" stackId="a" fill={COLOR_EMP} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-[var(--text-soft)] mt-2">
          Cada barra representa el coste laboral total. Verde = neto; rosa = impuesto personal; amarillo = cotización del trabajador; violeta = cotización e impuestos sobre nóminas del empleador. Los componentes pueden diferir una décima del total por redondeo de la OCDE.
        </p>
        <p className="source-inline mt-2">
          Fuente exacta: <a href={CUNA_OCDE_META.fuente} target="_blank" rel="noreferrer">OCDE, tabla 1.2</a>. Unidad: porcentaje del coste laboral.
        </p>
      </div>

      {/* Tu cuña fiscal personal */}
      <div className="liquid-glass p-5 sm:p-6 relative">
        <div className="glass-reflection" />
        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--accent)] mb-1">Tu situación personal</p>
          <h3 className="text-base font-bold text-[var(--text-h)] mb-3">
            Tu cuña fiscal a {eur(bruto)} en {anio}
          </h3>
          <p className="text-[12px] text-[var(--text)] leading-relaxed mb-5 max-w-3xl">
            La <strong className="text-[var(--text-h)]">cuña fiscal</strong> es la diferencia entre lo que <strong className="text-[var(--text-h)]">cuestas a tu empresa</strong> ({eur(miCuña.costeLab)}) y lo que <strong className="text-[var(--text-h)]">recibes en neto</strong> ({eur(miCuña.neto)}). Incluye IRPF, tu cotización a la Seguridad Social y la cotización empresarial — este último componente es dinero que la empresa paga por ti pero que nunca pasa por tu cuenta.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              ['Neto que recibes', miCuña.netoPct, eur(miCuña.neto), 'var(--green)', 'De cada €100 de coste laboral'],
              ['IRPF estimado', miCuña.irpfPct, eur(miCuña.irpf), 'var(--red)', 'Impuesto sobre la renta'],
              ['SS trabajador', miCuña.ssTraPct, eur(miCuña.ssTra), 'var(--yellow)', 'Tu cotización obligatoria'],
              ['SS empresa', miCuña.ssEmpPct, eur(miCuña.ssEmp), 'var(--accent)', 'El componente oculto'],
            ].map(([label, pctVal, val, color, sub]) => (
              <div key={label} className="tone-card p-3.5 text-center" style={{ '--tone': color }}>
                <div className="relative z-10">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-soft)] mb-1">{label}</p>
                  <p className="text-xl font-black font-mono" style={{ color }}>{pctVal}%</p>
                  <p className="text-[11px] text-[var(--text)] mt-0.5">{val}</p>
                  <p className="text-[10px] text-[var(--text-soft)] mt-1 leading-tight">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="info-card p-4">
            <p className="text-[13px] font-medium text-[var(--text-h)] leading-relaxed relative z-10">
              Tu cuña fiscal total es del <strong className="font-mono" style={{ color: parseFloat(miCuña.totalPct) > parseFloat(ESPANA.total) ? 'var(--red)' : 'var(--green)' }}>{miCuña.totalPct}%</strong>
              {' '}— es decir, de cada {eur(10000)} que cuestas a tu empresa, solo recibes {eur(Math.round(miCuña.netoPct * 100))}.
              {parseFloat(miCuña.totalPct) > ESPANA.total
                ? ` Está por encima de la referencia OCDE para España (${ESPANA.total}%) y de la media OCDE (${MEDIA_OCDE?.total}%).`
                : ` Está por debajo de la referencia OCDE para España (${ESPANA.total}%) y de la media OCDE (${MEDIA_OCDE?.total}%).`}
            </p>
          </div>

          <p className="text-[11px] text-[var(--text-soft)] mt-3 leading-relaxed">
            <strong>Comparación orientativa:</strong> tu resultado usa el perfil fiscal seleccionado y parámetros españoles de {anio}; la referencia OCDE usa 2025, una persona soltera sin hijos y el salario medio español. No son el mismo ejercicio ni necesariamente el mismo supuesto familiar.
          </p>
        </div>
      </div>

      {/* Comparador normalizado */}
      <div className="card p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--accent)] mb-1">Comparador normalizado</p>
        <h3 className="text-base font-bold text-[var(--text-h)] mb-2">De cada 100 unidades de coste laboral, ¿qué parte queda neta?</h3>
        <p className="text-[12px] text-[var(--text)] leading-relaxed mb-5 max-w-3xl">
          Este índice permite comparar la composición de la cuña del trabajador medio. <strong className="text-[var(--text-h)]">No calcula cuánto cobrarías viviendo en otro país</strong>: cada porcentaje corresponde al salario medio y sistema fiscal propios de ese país.
        </p>

        <div className="max-w-md mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-2">Comparar España con</p>
            <select className="config-select"
              value={paisRef} onChange={e => setPaisRef(e.target.value)}>
              {CUNA_OCDE_2025.filter(p => p.code !== 'ES' && p.code !== 'OECD').map(p => (
                <option key={p.code} value={p.code}>{p.pais} · cuña {p.total}%</option>
              ))}
            </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="tone-card tone-card--danger p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--red)' }}>
              🇪🇸 España · cuña {ESPANA.total}%
            </p>
            <div className="text-3xl font-black font-mono" style={{ color: 'var(--red)' }}>{netoEspana.toFixed(1)}%</div>
            <div className="text-[12px] text-[var(--text)] mt-1">neto sobre el coste laboral</div>
          </div>
          <div className="tone-card tone-card--accent p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2 text-[var(--accent)]">
              {referencia.pais} · cuña {referencia.total}%
            </p>
            <div className="text-3xl font-black font-mono text-[var(--accent)]">{netoRef.toFixed(1)}%</div>
            <div className="text-[12px] text-[var(--text)] mt-1">neto sobre el coste laboral</div>
          </div>
        </div>

        {Math.abs(diferencia) >= 0.1 && (
          <div className="tone-card p-4" style={{
            '--tone': diferencia > 0 ? 'var(--green)' : 'var(--red)',
          }}>
            <p className="text-[13px] font-medium text-[var(--text-h)] leading-relaxed">
              {diferencia > 0
                ? <>En el supuesto normalizado de la OCDE, <strong>{referencia.pais}</strong> deja{' '}
                  <strong className="font-mono text-[var(--accent-light)]">{diferencia.toFixed(1)} puntos más</strong> de neto por cada 100 unidades de coste laboral que España.</>
                : <>En el supuesto normalizado de la OCDE, España deja{' '}
                  <strong className="font-mono text-[var(--accent-light)]">{Math.abs(diferencia).toFixed(1)} puntos más</strong> de neto que <strong>{referencia.pais}</strong>.</>
              }
            </p>
          </div>
        )}
      </div>

      {/* Alcance e interpretación */}
      <div className="card p-5">
        <h3 className="font-bold text-[var(--text-h)] mb-3">Qué mide —y qué no mide— la cuña fiscal</h3>
        <div className="space-y-3 text-[13px] text-[var(--text)] leading-relaxed">
          <p>
            La presión fiscal (recaudación/PIB) y la cuña fiscal responden a preguntas distintas. La primera mide recaudación agregada; la segunda modeliza la diferencia entre coste laboral y neto para hogares concretos. Una no invalida ni sustituye a la otra.
          </p>
          <p>
            En el supuesto comparable de la OCDE, España registra una cuña del <strong>{ESPANA.total}%</strong>, frente al <strong>{MEDIA_OCDE.total}%</strong> de media. La cotización e impuestos sobre nóminas del empleador representan el <strong>{ESPANA.cotEmp}% del coste laboral</strong>; el impuesto personal, el {ESPANA.irpf}%; y la cotización del trabajador, el {ESPANA.cotTrab}%.
          </p>
          <p>
            Si se usa como base el <strong>salario bruto</strong> —tabla 1.3—, la carga directa del trabajador español es del <strong>{CARGA_PERSONAL_OCDE_2025.espana.total}%</strong>: {CARGA_PERSONAL_OCDE_2025.espana.irpf}% de impuesto personal y {CARGA_PERSONAL_OCDE_2025.espana.cotTrab}% de cotización. Estos porcentajes no deben mezclarse con los calculados sobre coste laboral.
          </p>
        </div>
      </div>

      <div className="source-panel source-panel--roomy space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)]">Fuente y trazabilidad</p>
        <div className="text-[12px] text-[var(--text)] leading-relaxed space-y-2">
          <p><strong className="text-[var(--text-h)]">Serie internacional:</strong> OCDE, <em>{CUNA_OCDE_META.informe}</em>, tabla 1.2. Datos de {CUNA_OCDE_META.ejercicio}; {CUNA_OCDE_META.supuesto.toLowerCase()}; unidad: {CUNA_OCDE_META.unidad}. Se reproducen los 38 países y la media OCDE con una decimal.</p>
          <p><strong className="text-[var(--text-h)]">Porcentajes sobre bruto:</strong> tabla 1.3 del mismo informe. Las contribuciones del empleador de la tabla 1.2 incluyen impuestos sobre nóminas cuando corresponda. Las sumas pueden diferir 0,1 puntos por redondeo.</p>
          <p><strong className="text-[var(--text-h)]">Limitación:</strong> es un hogar tipo, no la carga media efectiva de toda la población. No incluye necesariamente todos los pagos obligatorios a fondos gestionados fuera de las administraciones públicas.</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px]">
          <a className="source-link" href={CUNA_OCDE_META.fuente} target="_blank" rel="noreferrer">Tabla 1.2 y tabla 1.3 · OCDE</a>
          <a className="source-link" href={CUNA_OCDE_META.doi} target="_blank" rel="noreferrer">DOI 10.1787/3a5169ef-en</a>
          <span className="text-[var(--text-soft)]">Verificado: {CUNA_OCDE_META.verificado}</span>
        </div>
      </div>
    </div>
  );
}

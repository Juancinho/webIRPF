import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { CUNA_OCDE_2025, calcularNomina } from '../engine/irpf';
import { eur, pct } from '../utils/format';

const ESPANA = CUNA_OCDE_2025.find(p => p.code === 'ES');
const MEDIA_OCDE = CUNA_OCDE_2025.find(p => p.code === 'OECD');

const datos = CUNA_OCDE_2025.map(p => ({
  pais: p.pais,
  code: p.code,
  Neto: parseFloat((100 - p.total).toFixed(1)),
  IRPF: p.irpf,
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

function CustomBar(props) {
  const { esp, media } = datos.find(d => d.code === props.code) || {};
  if (esp) return <rect {...props} fill={props.fill} stroke="rgba(251,113,133,0.6)" strokeWidth={2} />;
  if (media) return <rect {...props} fill={props.fill} opacity={0.7} strokeDasharray="3 2" stroke="var(--border-light)" strokeWidth={1} />;
  return <rect {...props} fill={props.fill} />;
}

export default function OCDEComparativa({ bruto = 35000, anio = 2026 }) {
  const [costeLab, setCosteLab] = useState(50000);
  const [paisRef, setPaisRef] = useState('DE');

  const referencia = CUNA_OCDE_2025.find(p => p.code === paisRef) || CUNA_OCDE_2025[1];

  const netoEspana = useMemo(() => costeLab * (1 - ESPANA.total / 100), [costeLab]);
  const netoRef = useMemo(() => costeLab * (1 - referencia.total / 100), [costeLab, referencia]);
  const diferencia = netoRef - netoEspana;

  const irpfTuyo = useMemo(() => calcularNomina(bruto, anio), [bruto, anio]);

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

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const fila = datos.find(d => d.pais === label);
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <p className="font-bold text-[var(--text-h)] mb-1">
          {label}{fila?.esp ? ' 🇪🇸' : ''}{fila?.media ? ' (media)' : ''}
        </p>
        <p style={{ color: 'var(--red)' }}>Cuña total: <strong>{fila?.total}%</strong></p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill }}>{p.name}: {p.value.toFixed(1)}%</p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-h)] mb-1">Cuña fiscal OCDE — ¿cuánto de tu sueldo nunca llega a tu cuenta?</h2>
        <p className="text-[13px] text-[var(--text)] leading-relaxed max-w-3xl">
          La cuña fiscal mide la diferencia entre lo que le cuestas a tu empresa y lo que recibes en neto: IRPF + cotizaciones trabajador + cotizaciones empresa.
          España está en el <strong>10.º puesto</strong> de la OCDE con un <strong style={{ color: 'var(--red)' }}>41,4%</strong> — 6,3 puntos por encima de la media.
          Fuente: <span className="font-mono text-[var(--text-soft)]">OCDE Taxing Wages 2026 (datos 2025).</span>
        </p>
      </div>

      {/* Métricas rápidas España */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Cuña total', `${ESPANA.total}%`, 'vs media OCDE +6,3pp', 'var(--red)'],
          ['IRPF sobre bruto', `${ESPANA.irpf}%`, 'moderado vs OCDE', 'var(--yellow)'],
          ['Cot. trabajador', `${ESPANA.cotTrab}%`, 'de tu bruto', 'var(--accent)'],
          ['Cot. empresa', `${ESPANA.cotEmp}%`, 'que nunca ves', 'var(--text-soft)'],
        ].map(([label, value, sub, color]) => (
          <div key={label} className="card p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-soft)] mb-1">{label}</div>
            <div className="text-2xl font-black font-mono" style={{ color }}>{value}</div>
            <div className="text-[11px] text-[var(--text)] mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Gráfico de barras apiladas */}
      <div className="card p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-1">Comparativa internacional</p>
        <h3 className="text-base font-bold text-[var(--text-h)] mb-4">
          Cómo se reparte el coste laboral en cada país (% del total)
        </h3>
        <ResponsiveContainer width="100%" height={Math.max(420, datos.length * 25)}>
          <BarChart
            data={datos}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 100, bottom: 4 }}
            stackOffset="expand"
          >
            <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tickFormatter={v => `${(v * 100).toFixed(0)}%`}
              tick={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'monospace' }} domain={[0, 1]} />
            <YAxis type="category" dataKey="pais" width={96}
              tick={({ x, y, payload }) => {
                const d = datos.find(dd => dd.pais === payload.value);
                return (
                  <text x={x} y={y} dy={4} textAnchor="end"
                    style={{ fontSize: 11, fontWeight: d?.esp ? 700 : 400, fill: d?.esp ? 'var(--red)' : d?.media ? 'var(--text-soft)' : 'var(--text)' }}>
                    {payload.value}{d?.esp ? ' 🇪🇸' : ''}
                  </text>
                );
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="Neto" stackId="a" fill={COLOR_NETO} />
            <Bar dataKey="IRPF" stackId="a" fill={COLOR_IRPF} />
            <Bar dataKey="Cot. trabajador" stackId="a" fill={COLOR_TRAB} />
            <Bar dataKey="Cot. empresa" stackId="a" fill={COLOR_EMP} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-[var(--text-soft)] mt-2">
          Cada barra es el 100% del coste laboral total (empresa). Verde = neto que llega al trabajador. España destaca por la alta cotización empresarial (23,4%) — el mayor componente oculto de la cuña.
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
              ['IRPF retenido', miCuña.irpfPct, eur(miCuña.irpf), 'var(--red)', 'Impuesto sobre la renta'],
              ['SS trabajador', miCuña.ssTraPct, eur(miCuña.ssTra), 'var(--yellow)', 'Tu cotización obligatoria'],
              ['SS empresa', miCuña.ssEmpPct, eur(miCuña.ssEmp), 'var(--accent)', 'El componente oculto'],
            ].map(([label, pctVal, val, color, sub]) => (
              <div key={label} className="dist-glass-panel p-3.5 text-center relative">
                <div className="glass-reflection" />
                <div className="relative z-10">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-soft)] mb-1">{label}</p>
                  <p className="text-xl font-black font-mono" style={{ color }}>{pctVal}%</p>
                  <p className="text-[11px] text-[var(--text)] mt-0.5">{val}</p>
                  <p className="text-[10px] text-[var(--text-soft)] mt-1 leading-tight">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl p-4 border relative overflow-hidden" style={{
            borderColor: parseFloat(miCuña.totalPct) > parseFloat(ESPANA.total) ? 'rgba(251,113,133,0.25)' : 'rgba(52,211,153,0.25)',
            background: parseFloat(miCuña.totalPct) > parseFloat(ESPANA.total) ? 'var(--glow-red)' : 'var(--glow-green)',
          }}>
            <p className="text-[13px] font-medium text-[var(--text-h)] leading-relaxed relative z-10">
              Tu cuña fiscal total es del <strong className="font-mono" style={{ color: parseFloat(miCuña.totalPct) > parseFloat(ESPANA.total) ? 'var(--red)' : 'var(--green)' }}>{miCuña.totalPct}%</strong>
              {' '}— es decir, de cada {eur(10000)} que cuestas a tu empresa, solo recibes {eur(Math.round(miCuña.netoPct * 100))}.
              {parseFloat(miCuña.totalPct) > parseFloat(ESPANA.total)
                ? ` Está por encima de la media española (${ESPANA.total}%) y de la media OCDE (${MEDIA_OCDE?.total}%).`
                : ` Está por debajo de la media española (${ESPANA.total}%) y de la media OCDE (${MEDIA_OCDE?.total}%).`}
            </p>
          </div>

          <p className="text-[11px] text-[var(--text-soft)] mt-3 leading-relaxed">
            <strong>Nota:</strong> los datos de la OCDE se calculan para un trabajador soltero sin hijos al <em>salario medio</em> de cada país. Tu cuña personal varía según tu nivel salarial y situación familiar. Si ganas menos de la media, tu IRPF será proporcionalmente menor; si ganas más, será mayor.
          </p>
        </div>
      </div>

      {/* Simulador "si viviera en..." */}
      <div className="card p-5" style={{ background: 'linear-gradient(135deg,var(--surface),var(--surface2))', borderColor: 'var(--border-light)' }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--accent)] mb-1">Simulador</p>
        <h3 className="text-base font-bold text-[var(--text-h)] mb-4">¿Cuánto cobrarías con el mismo coste laboral en otro país?</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-2">
              Coste laboral total anual · {eur(costeLab)}
            </p>
            <input type="range" min={20000} max={150000} step={1000}
              value={costeLab} onChange={e => setCosteLab(+e.target.value)} className="w-full" />
            <div className="flex justify-between text-[10px] text-[var(--text-soft)] mt-1">
              <span>20k €</span><span>85k €</span><span>150k €</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-2">Comparar España con</p>
            <select className="config-select"
              value={paisRef} onChange={e => setPaisRef(e.target.value)}>
              {CUNA_OCDE_2025.filter(p => p.code !== 'ES' && p.code !== 'OECD').map(p => (
                <option key={p.code} value={p.code}>{p.pais} · cuña {p.total}%</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl p-4 border" style={{ borderColor: 'rgba(251,113,133,0.25)', background: 'var(--glow-red)' }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--red)' }}>
              🇪🇸 España · cuña {ESPANA.total}%
            </p>
            <div className="text-3xl font-black font-mono" style={{ color: 'var(--red)' }}>{eur(netoEspana)}</div>
            <div className="text-[12px] text-[var(--text)] mt-1">{eur(netoEspana / 12)} / mes</div>
          </div>
          <div className="rounded-xl p-4 border" style={{ borderColor: 'rgba(99,102,241,0.25)', background: 'var(--accent-soft)' }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2 text-[var(--accent)]">
              {referencia.pais} · cuña {referencia.total}%
            </p>
            <div className="text-3xl font-black font-mono text-[var(--accent)]">{eur(netoRef)}</div>
            <div className="text-[12px] text-[var(--text)] mt-1">{eur(netoRef / 12)} / mes</div>
          </div>
        </div>

        {Math.abs(diferencia) > 200 && (
          <div className="rounded-xl p-4 border" style={{
            borderColor: diferencia > 0 ? 'rgba(52,211,153,0.25)' : 'rgba(251,113,133,0.20)',
            background: diferencia > 0 ? 'var(--glow-green)' : 'var(--glow-red)',
          }}>
            <p className="text-[13px] font-medium text-[var(--text-h)] leading-relaxed">
              {diferencia > 0
                ? <>Con el sistema de <strong>{referencia.pais}</strong> y el mismo coste laboral, cobrarías{' '}
                  <strong className="font-mono" style={{ color: 'var(--green)' }}>+{eur(diferencia)}</strong> al año —{' '}
                  {eur(diferencia / 12)} más al mes.</>
                : <>España resulta más generosa que <strong>{referencia.pais}</strong> en este caso:{' '}
                  cobras <strong className="font-mono" style={{ color: 'var(--red)' }}>{eur(Math.abs(diferencia))}</strong> más aquí al año.</>
              }
            </p>
          </div>
        )}
      </div>

      {/* Contexto editorial */}
      <div className="card p-5">
        <h3 className="font-bold text-[var(--text-h)] mb-3">El argumento de la «presión fiscal baja», desmontado</h3>
        <div className="space-y-3 text-[13px] text-[var(--text)] leading-relaxed">
          <p>
            El Gobierno suele argumentar que la <strong>presión fiscal española</strong> (recaudación/PIB) está por debajo de la media UE. Es cierto, pero engañoso: ese ratio mide cuánto recauda el Estado en relación a la economía total, no cuánto pesa sobre el trabajador. La cuña fiscal sí lo mide — y aquí España aparece como el <strong>décimo país más caro de la OCDE</strong>.
          </p>
          <p>
            La clave está en el desglose: España tiene un IRPF moderado (<strong>{ESPANA.irpf}%</strong> sobre el bruto), similar a la media OCDE ({MEDIA_OCDE?.irpf}%), pero unas <strong>cotizaciones empresariales muy elevadas</strong> ({ESPANA.cotEmp}%). Son 23 céntimos de cada euro de coste laboral que la empresa paga directamente al Estado sin pasar por tu cuenta.
          </p>
          <p className="text-[11px] text-[var(--text-soft)] pt-2 border-t border-[var(--border)]">
            Fuente: OCDE, <em>Taxing Wages 2026</em> (datos de 2025). Trabajador soltero sin hijos al salario medio nacional.
          </p>
        </div>
      </div>
    </div>
  );
}

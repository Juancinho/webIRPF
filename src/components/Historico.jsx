import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Area, AreaChart, BarChart, Bar
} from 'recharts';
import { comparativaInflacion, calcularRango, INFLACION_A_2026 } from '../engine/irpf';
import { eur, pct, sign, num } from '../utils/format';

const ANIOS = Array.from({ length: 15 }, (_, i) => 2012 + i);
const PALETTE = {
  neto: '#10b981',
  irpf: '#ef4444',
  ss: '#f59e0b',
  coste: '#6366f1',
};

function TooltipCustom({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 text-xs shadow-xl min-w-[180px]">
      <p className="font-semibold text-[var(--text-h)] mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono text-[var(--text-h)]">{eur(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Vista 1: evolución año a año para un salario fijo (en euros constantes 2026) ──
function EvolucionAnual({ bruto2026 }) {
  const data = useMemo(() => comparativaInflacion(bruto2026), [bruto2026]);
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text)]">
        Para un salario equivalente a <strong className="text-[var(--text-h)]">{eur(bruto2026)} brutos en 2026</strong>,
        ¿cuánto neto se cobraba en cada año (en euros constantes de 2026)?
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ left: 20, right: 10, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="gNeto" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={PALETTE.neto} stopOpacity={0.3} />
              <stop offset="95%" stopColor={PALETTE.neto} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="anio" stroke="var(--border)" tick={{ fontSize: 11, fill: 'var(--text-soft)' }} />
          <YAxis stroke="var(--border)" tick={{ fontSize: 11, fill: 'var(--text-soft)' }} tickFormatter={v => eur(v)} width={75} />
          <Tooltip content={<TooltipCustom />} />
          <Legend />
          <ReferenceLine y={data[data.length - 1]?.netoActual2026} stroke={PALETTE.neto} strokeDasharray="5 5" label={{ value: '2026', position: 'right', fill: PALETTE.neto, fontSize: 11 }} />
          <Area type="monotone" dataKey="netoReal" name="Neto real (€2026)" stroke={PALETTE.neto} fill="url(#gNeto)" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="irpfAj" name="IRPF (€2026)" stroke={PALETTE.irpf} strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="cotTraAj" name="SS Trabajador (€2026)" stroke={PALETTE.ss} strokeWidth={2} dot={{ r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>

      {/* Tabla resumen */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left border-b border-[var(--border)]">
              {['Año', 'Bruto nominal', 'SS Tra. (€2026)', 'IRPF (€2026)', 'Neto (€2026)', 'Tipo IRPF', 'Var. vs 2026'].map(h => (
                <th key={h} className="py-2 px-2 text-[var(--text)] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(d => (
              <tr key={d.anio} className="border-b border-[var(--border)] hover:bg-[var(--surface2)]">
                <td className="py-1.5 px-2 font-semibold text-[var(--text-h)]">{d.anio}</td>
                <td className="py-1.5 px-2 font-mono text-[var(--text)]">{eur(d.brutoNominal)}</td>
                <td className="py-1.5 px-2 font-mono text-yellow-400">{eur(d.cotTraAj)}</td>
                <td className="py-1.5 px-2 font-mono text-red-400">{eur(d.irpfAj)}</td>
                <td className="py-1.5 px-2 font-mono text-green-400 font-semibold">{eur(d.netoReal)}</td>
                <td className="py-1.5 px-2 font-mono text-[var(--text)]">{pct(d.tipoEfectivoIRPF)}</td>
                <td className={`py-1.5 px-2 font-mono font-semibold ${d.variacionAnual >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {sign(d.variacionAnual)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Vista 2: Curva de tipos efectivos por tramos de salario ──
function CurvaTipos({ anio }) {
  const data = useMemo(() => calcularRango(anio, 1000, 100000), [anio]);
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text)]">
        Tipo efectivo de IRPF y carga total según nivel salarial — {anio}
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ left: 20, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="bruto" stroke="var(--border)" tick={{ fontSize: 10, fill: 'var(--text-soft)' }} tickFormatter={v => `${v / 1000}k`} />
          <YAxis stroke="var(--border)" tick={{ fontSize: 11, fill: 'var(--text-soft)' }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} width={40} />
          <Tooltip
            formatter={(v, name) => [`${(v * 100).toFixed(2)}%`, name]}
            labelFormatter={v => `Bruto: ${eur(v)}`}
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
            labelStyle={{ color: 'var(--text-h)', fontWeight: 600 }}
          />
          <Legend />
          <Line type="monotone" dataKey="tipoEfectivoIRPF" name="Tipo efectivo IRPF" stroke={PALETTE.irpf} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="tipoEfectivoTotal" name="Carga total (IRPF+SS)" stroke={PALETTE.coste} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Vista 3: Comparativa entre dos años para un mismo salario ──
function ComparativaDosAnios({ bruto2026 }) {
  const [anioA, setAnioA] = useState(2012);
  const [anioB, setAnioB] = useState(2019);

  const dataTodos = useMemo(() => comparativaInflacion(bruto2026), [bruto2026]);
  const dA = dataTodos.find(d => d.anio === anioA);
  const dB = dataTodos.find(d => d.anio === anioB);
  const d2026 = dataTodos.find(d => d.anio === 2026);

  const barData = dA && dB && d2026 ? [
    { concepto: 'Neto real', [anioA]: dA.netoReal, [anioB]: dB.netoReal, '2026': d2026.netoReal },
    { concepto: 'IRPF pagado', [anioA]: dA.irpfAj, [anioB]: dB.irpfAj, '2026': d2026.irpfAj },
    { concepto: 'SS trabajador', [anioA]: dA.cotTraAj, [anioB]: dB.cotTraAj, '2026': d2026.cotTraAj },
  ] : [];

  return (
    <div className="space-y-5">
      <div className="flex gap-4 items-center flex-wrap">
        <div>
          <label className="text-xs text-[var(--text)] block mb-1">Año A</label>
          <select value={anioA} onChange={e => setAnioA(+e.target.value)}
            className="bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text-h)] text-sm">
            {ANIOS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-[var(--text)] block mb-1">Año B</label>
          <select value={anioB} onChange={e => setAnioB(+e.target.value)}
            className="bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--text-h)] text-sm">
            {ANIOS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <p className="text-xs text-[var(--text)] mt-4">Salario: <strong>{eur(bruto2026)}</strong> brutos (€2026)</p>
      </div>

      {dA && dB && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: `Neto ${anioA}`, val: dA.netoReal, ref: dB.netoReal },
              { label: `Neto ${anioB}`, val: dB.netoReal, ref: dA.netoReal },
              { label: 'Neto 2026', val: d2026.netoReal, ref: dA.netoReal },
            ].map(({ label, val, ref }) => (
              <div key={label} className="card p-3 text-center">
                <div className="text-xs text-[var(--text)] mb-1">{label}</div>
                <div className="text-lg font-bold font-mono text-green-400">{eur(val)}</div>
                <div className={`text-xs font-mono mt-0.5 ${val - ref >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {sign(val - ref)} vs otro año
                </div>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData} margin={{ left: 20, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="concepto" tick={{ fontSize: 11, fill: 'var(--text-soft)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-soft)' }} tickFormatter={v => eur(v)} width={75} />
              <Tooltip
                formatter={v => eur(v)}
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8 }}
              />
              <Legend />
              <Bar dataKey={String(anioA)} fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey={String(anioB)} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="2026" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}

export default function Historico() {
  const [vista, setVista] = useState('evolucion');
  const [bruto2026, setBruto2026] = useState(40000);
  const [anioGrafica, setAnioGrafica] = useState(2026);

  const VISTAS = [
    { id: 'evolucion', label: 'Evolución 2012–2026' },
    { id: 'tipos', label: 'Curva de tipos' },
    { id: 'comparar', label: 'Comparar dos años' },
  ];

  return (
    <div className="space-y-5">
      {/* Selector vista */}
      <div className="flex gap-2 flex-wrap">
        {VISTAS.map(v => (
          <button key={v.id} onClick={() => setVista(v.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${vista === v.id ? 'tab-active' : 'tab-inactive border border-[var(--border)]'}`}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Controles comunes */}
      {vista !== 'tipos' && (
        <div className="card p-4">
          <label className="text-sm text-[var(--text)] block mb-2">
            Salario equivalente en euros de 2026: <strong className="text-[var(--text-h)]">{num(bruto2026)} €</strong>
          </label>
          <input type="range" min="15000" max="100000" step="1000" value={bruto2026}
            onChange={e => setBruto2026(+e.target.value)} className="w-full" />
          <div className="flex justify-between text-xs text-[var(--text)] mt-1">
            <span>15.000 €</span><span>57.500 €</span><span>100.000 €</span>
          </div>
        </div>
      )}

      {vista === 'tipos' && (
        <div className="card p-4">
          <label className="text-sm text-[var(--text)] block mb-2">Año de referencia</label>
          <div className="flex gap-2 flex-wrap">
            {ANIOS.map(a => (
              <button key={a} onClick={() => setAnioGrafica(a)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${anioGrafica === a ? 'tab-active' : 'tab-inactive border border-[var(--border)]'}`}>
                {a}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contenido de la vista */}
      <div className="card p-5">
        {vista === 'evolucion' && <EvolucionAnual bruto2026={bruto2026} />}
        {vista === 'tipos' && <CurvaTipos anio={anioGrafica} />}
        {vista === 'comparar' && <ComparativaDosAnios bruto2026={bruto2026} />}
      </div>
    </div>
  );
}

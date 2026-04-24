import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { CURVA_ART20, ANIOS_ART20_MUESTRA, DATOS_UMBRALES, ANIOS } from '../engine/irpf';
import { eur } from '../utils/format';

const ART20_COLORS = {
  2012: '#f87171', 2015: '#facc15', 2019: '#2dd4bf',
  2023: '#a78bfa', 2024: '#c084fc', 2026: '#ffffff',
};

const UMBRAL_COLORS = {
  smi: '#4ade80',
  minExento: '#38bdf8',
  art20Inf: '#f59e0b',
  art20Sup: '#ef4444',
  art20Max: '#a78bfa',
};

function TooltipArt20({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1d27] border border-[#272b40] rounded-xl p-3 shadow-2xl text-xs min-w-[200px]">
      <p className="font-bold text-white mb-1.5 border-b border-[#272b40] pb-1.5">Rend. neto previo: {eur(label)}</p>
      {[...payload].sort((a, b) => b.value - a.value).map(p => {
        const anio = parseInt(p.dataKey.split('_')[1]);
        return (
          <div key={p.dataKey} className="flex justify-between gap-3 py-0.5">
            <span className="flex items-center gap-1.5" style={{ color: ART20_COLORS[anio] }}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: ART20_COLORS[anio] }} />
              {anio}
            </span>
            <span className="font-mono text-white">{eur(p.value)}</span>
          </div>
        );
      })}
    </div>
  );
}

function TooltipUmbrales({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const labels = { smi:'SMI anual', minExento:'Mín. exento retención', art20Inf:'Art.20 umbral inf.', art20Sup:'Art.20 umbral sup.', art20Max:'Art.20 reducción máx.' };
  return (
    <div className="bg-[#1a1d27] border border-[#272b40] rounded-xl p-3 shadow-2xl text-xs min-w-[220px]">
      <p className="font-bold text-white mb-1.5 border-b border-[#272b40] pb-1.5">{label}</p>
      {payload.filter(p => p.value).map(p => (
        <div key={p.dataKey} className="flex justify-between gap-3 py-0.5">
          <span style={{ color: UMBRAL_COLORS[p.dataKey] }}>{labels[p.dataKey]}</span>
          <span className="font-mono text-white">{eur(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function TabCurvaArt20() {
  const [aniosVis, setAniosVis] = useState(new Set(ANIOS_ART20_MUESTRA));
  const toggle = a => setAniosVis(prev => {
    const next = new Set(prev); if (next.has(a)) { if (next.size > 1) next.delete(a); } else next.add(a); return next;
  });

  return (
    <div>
      <div className="rounded-xl bg-[#21253a] border border-[#272b40] p-4 mb-4 text-sm text-[#94a3b8] leading-relaxed">
        <strong className="text-white">Qué muestra:</strong> el importe de la reducción por rendimientos del trabajo (Art. 20 LIRPF)
        en función del rendimiento neto previo (bruto − SS trabajador). El <strong className="text-white">área bajo la curva</strong> es
        impuesto que dejas de pagar. Cuando la curva cae en picado, estás en la <strong className="text-orange-400">zona "cliff"</strong>:
        ganar un euro más de bruto puede aumentar tu base imponible más de un euro porque pierdes parte de esta reducción.
      </div>

      {/* Toggles */}
      <div className="flex gap-2 flex-wrap mb-4">
        {ANIOS_ART20_MUESTRA.map(a => (
          <button key={a} onClick={() => toggle(a)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border-2 ${aniosVis.has(a) ? 'text-[#0f1117]' : 'border-[#272b40] text-[#94a3b8] opacity-40'}`}
            style={aniosVis.has(a) ? { background: ART20_COLORS[a], borderColor: ART20_COLORS[a] } : {}}>
            {a}
          </button>
        ))}
      </div>

      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={CURVA_ART20} margin={{ left: 5, right: 20, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#272b40" vertical={false} />
            <XAxis dataKey="rn" stroke="#374151" tick={{ fontSize:10, fill:'#64748b' }} tickFormatter={v => `${v/1000}k€`} tickLine={false} />
            <YAxis stroke="#374151" tick={{ fontSize:11, fill:'#64748b' }} tickFormatter={v => `${v/1000}k€`} width={50} tickLine={false} />
            <Tooltip content={<TooltipArt20 />} />
            {ANIOS_ART20_MUESTRA.filter(a => aniosVis.has(a)).map(a => (
              <Line key={a} type="monotone" dataKey={`red_${a}`}
                stroke={ART20_COLORS[a]} strokeWidth={a === 2026 ? 2.5 : 2}
                dot={false} activeDot={{ r: 4, strokeWidth: 0 }} isAnimationActive={false} name={String(a)} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-3 mt-2">
        {ANIOS_ART20_MUESTRA.filter(a => aniosVis.has(a)).map(a => (
          <span key={a} className="flex items-center gap-1.5 text-xs" style={{ color: ART20_COLORS[a] }}>
            <span className="w-5 h-0.5 inline-block rounded" style={{ background: ART20_COLORS[a] }} />
            {a}
          </span>
        ))}
      </div>

      {/* Tabla comparativa de umbrales */}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#272b40]">
              {['Año','Umbral inferior','Reducción máx.','Umbral superior','Zona cliff (€)','Pendiente'].map(h => (
                <th key={h} className="py-2 px-2 text-left text-[#64748b] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ANIOS_ART20_MUESTRA.map(a => {
              const d = DATOS_UMBRALES.find(x => x.anio === a);
              const zona = d && d.art20Inf && d.art20Sup ? d.art20Sup - d.art20Inf : null;
              const pendiente = d && d.art20Max && zona ? (d.art20Max / zona).toFixed(2) : '—';
              return (
                <tr key={a} className="border-b border-[#272b40] hover:bg-[#21253a]">
                  <td className="py-1.5 px-2 font-bold" style={{ color: ART20_COLORS[a] }}>{a}</td>
                  <td className="py-1.5 px-2 font-mono text-[#94a3b8]">{d?.art20Inf ? eur(d.art20Inf) : '—'}</td>
                  <td className="py-1.5 px-2 font-mono text-white font-bold">{d?.art20Max ? eur(d.art20Max) : '—'}</td>
                  <td className="py-1.5 px-2 font-mono text-[#94a3b8]">{d?.art20Sup ? eur(d.art20Sup) : '—'}</td>
                  <td className="py-1.5 px-2 font-mono text-orange-400">{zona ? eur(zona) : '—'}</td>
                  <td className="py-1.5 px-2 font-mono text-[#94a3b8]">{pendiente}€/€</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-[10px] text-[#64748b] mt-1.5">Fuente: Art. 20 LIRPF; redacciones históricas según año de reforma — BOE</p>
      </div>
    </div>
  );
}

function TabEvolucionUmbrales() {
  const [series, setSeries] = useState(new Set(['smi','minExento','art20Inf','art20Sup']));
  const toggle = s => setSeries(prev => { const next = new Set(prev); if (next.has(s)) { if (next.size > 1) next.delete(s); } else next.add(s); return next; });

  const labels = {
    smi:      { label:'SMI anual',            color: UMBRAL_COLORS.smi,      dash: '' },
    minExento:{ label:'Mín. exento retención', color: UMBRAL_COLORS.minExento, dash: '6 3' },
    art20Inf: { label:'Art.20 — umbral inf.',  color: UMBRAL_COLORS.art20Inf, dash: '4 2' },
    art20Sup: { label:'Art.20 — umbral sup.',  color: UMBRAL_COLORS.art20Sup, dash: '3 3' },
  };

  return (
    <div>
      <div className="rounded-xl bg-[#21253a] border border-[#272b40] p-4 mb-4 text-sm text-[#94a3b8] leading-relaxed">
        <strong className="text-white">Qué muestra:</strong> la evolución de los umbrales clave en <strong className="text-white">euros nominales</strong>.
        Cuando el SMI sube más rápido que el umbral inferior del Art.20, los trabajadores de salario mínimo pasan a estar mejor protegidos.
        Cuando el mínimo exento de retención sube, más gente deja de tener retención en nómina. La diferencia entre líneas explica
        los cambios en el poder adquisitivo real que no se ven en el sueldo nominal.
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {Object.entries(labels).map(([key, { label, color }]) => (
          <button key={key} onClick={() => toggle(key)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 transition-all ${series.has(key) ? 'text-[#0f1117]' : 'border-[#272b40] text-[#94a3b8] opacity-40'}`}
            style={series.has(key) ? { background: color, borderColor: color } : {}}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={DATOS_UMBRALES} margin={{ left: 5, right: 20, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#272b40" vertical={false} />
            <XAxis dataKey="anio" stroke="#374151" tick={{ fontSize:11, fill:'#64748b' }} tickLine={false} />
            <YAxis stroke="#374151" tick={{ fontSize:11, fill:'#64748b' }} tickFormatter={v => `${v/1000}k€`} width={50} tickLine={false} />
            <Tooltip content={<TooltipUmbrales />} />
            {Object.entries(labels).filter(([k]) => series.has(k)).map(([key, { label, color, dash }]) => (
              <Line key={key} type="monotone" dataKey={key}
                stroke={color} strokeWidth={2} strokeDasharray={dash}
                dot={{ r:3, fill:color, strokeWidth:0 }} activeDot={{ r:5, strokeWidth:0 }}
                name={label} isAnimationActive={false}
                connectNulls={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-4 mt-2">
        {Object.entries(labels).filter(([k]) => series.has(k)).map(([key, { label, color, dash }]) => (
          <span key={key} className="flex items-center gap-1.5 text-xs" style={{ color }}>
            <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke={color} strokeWidth="2" strokeDasharray={dash} /></svg>
            {label}
          </span>
        ))}
      </div>
      <p className="text-[10px] text-[#64748b] mt-2">
        Fuentes: LIRPF arts. 20, 57, 85-86 RIRPF; Órdenes anuales de cotización SS; RDs de SMI (BOE).
        Datos en euros nominales de cada año.
      </p>
    </div>
  );
}

export default function GraficoMecanismos() {
  const [tab, setTab] = useState('art20');
  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {[
          ['art20', 'Curva de reducción Art.20'],
          ['umbrales', 'Evolución de umbrales clave'],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${tab === id
              ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
              : 'border-[#272b40] text-[#94a3b8] hover:border-[var(--accent)] hover:text-[var(--accent-light)]'}`}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'art20'    && <TabCurvaArt20 />}
      {tab === 'umbrales' && <TabEvolucionUmbrales />}
    </div>
  );
}

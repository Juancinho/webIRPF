import { useState, useMemo, useDeferredValue } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { calcularNomina, inflacionAcumulada, ANIOS, REGIONES } from '../engine/irpf';
import { eur, pct } from '../utils/format';

const COLORES = {
  2012: '#c0392b', 2013: '#e67e22', 2014: '#d4ac0d', 2015: '#7d9a23',
  2016: '#27ae60', 2017: '#1abc9c', 2018: '#2980b9', 2019: '#2471a3',
  2020: '#8e44ad', 2021: '#7d3c98', 2022: '#a93226', 2023: '#cb4335',
  2024: '#d35400', 2025: '#a04000', 2026: '#f4f4f5',
};

function calcPunto(salarioEjeX, anio, opts, ajustarIPC) {
  const factor = ajustarIPC ? inflacionAcumulada(anio, 2026) : 1;
  const salarioNominal = ajustarIPC ? salarioEjeX / factor : salarioEjeX;
  const r = calcularNomina(salarioNominal, anio, opts);
  return {
    irpf: Math.round(r.irpfFinal * factor),
    irpfNominal: Math.round(r.irpfFinal),
    salarioNominal: Math.round(salarioNominal),
    factor,
    pct: r.bruto > 0 ? r.tipoEfectivoIRPF * 100 : 0,
    neto: r.salarioNeto * factor,
  };
}

export default function CurvaIRPF({ bruto, anio: anioRef, opts = {} }) {
  const [anioPrincipal, setAnioPrincipal] = useState(anioRef || 2026);
  const [aniosCompara, setAniosCompara] = useState([2012, 2018, 2021]);
  const [ajustarIPC, setAjustarIPC] = useState(true);
  const [modoVisual, setModoVisual] = useState('euros');
  const [maxSalario, setMaxSalario] = useState(100000);
  const [salarioRef, setSalarioRef] = useState(bruto || 35000);

  const salarioRefDef = useDeferredValue(salarioRef);

  const toggleCompara = (a) => {
    if (a === anioPrincipal) return;
    setAniosCompara(prev =>
      prev.includes(a)
        ? prev.filter(x => x !== a)
        : prev.length >= 4 ? [...prev.slice(1), a] : [...prev, a]
    );
  };

  const aniosVisibles = [anioPrincipal, ...aniosCompara].filter((v, i, arr) => arr.indexOf(v) === i);

  const datosCurva = useMemo(() => {
    const step = 1500;
    const data = [];
    for (let s = 0; s <= maxSalario; s += step) {
      const punto = { bruto: s };
      for (const a of aniosVisibles) {
        const calc = calcPunto(s, a, opts, ajustarIPC);
        punto[`irpf_${a}`] = calc.irpf;
        punto[`pct_${a}`] = parseFloat(calc.pct.toFixed(2));
      }
      data.push(punto);
    }
    return data;
  }, [aniosVisibles, opts, ajustarIPC, maxSalario]);

  const refPunto = useMemo(
    () => calcPunto(salarioRefDef, anioPrincipal, opts, ajustarIPC),
    [salarioRefDef, anioPrincipal, opts, ajustarIPC]
  );

  const deltasDetalle = useMemo(() => {
    const principal = calcPunto(salarioRefDef, anioPrincipal, opts, ajustarIPC);
    return aniosCompara.slice().sort((a, b) => a - b).map(a => {
      const v = calcPunto(salarioRefDef, a, opts, ajustarIPC);
      return { anio: a, irpf: v.irpf, irpfNominal: v.irpfNominal, salarioNominal: v.salarioNominal, factor: v.factor, delta: principal.irpf - v.irpf };
    });
  }, [salarioRefDef, anioPrincipal, aniosCompara, opts, ajustarIPC]);

  const sufijoEuros = ajustarIPC ? '€ de 2026' : '€ nominales';

  const fmtTick = v => modoVisual === 'euros' ? `${(v / 1000).toFixed(0)}k` : `${v.toFixed(0)}%`;
  const fmtTooltip = (v, n) => [
    modoVisual === 'euros' ? eur(v) : `${v}%`,
    String(n).split(' ')[0],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-h)] mb-1">Curva del IRPF — ¿cuánto se paga a cada nivel salarial?</h2>
        <p className="text-[13px] text-[var(--text)] leading-relaxed max-w-3xl">
          Compara el IRPF pagado en diferentes años. Con <strong>Ajustar por IPC activado</strong>, todos los importes están en euros constantes de 2026 — así ves la <em>progresividad en frío</em>: el IRPF que pagaba alguien con tu mismo poder adquisitivo antes.
        </p>
      </div>

      {/* Toggle IPC */}
      <button
        onClick={() => setAjustarIPC(!ajustarIPC)}
        className="ipc-toggle"
        data-active={ajustarIPC}
      >
        <div className="ipc-toggle-track" data-active={ajustarIPC}>
          <div className="ipc-toggle-thumb" data-active={ajustarIPC} />
        </div>
        <div className="ipc-toggle-label">
          <strong>Ajustar por IPC</strong> — {ajustarIPC
            ? `Importes en ${sufijoEuros}. Comparas poder adquisitivo equivalente.`
            : 'Importes nominales de cada año.'}
        </div>
        <span className="tag" style={ajustarIPC
          ? { background: 'var(--accent-dim)', color: 'var(--accent)', borderColor: 'var(--accent-dim)' }
          : { background: 'var(--surface2)', color: 'var(--text-soft)', borderColor: 'var(--border)' }}>
          {sufijoEuros.toUpperCase()}
        </span>
      </button>

      {/* Configuración */}
      <div className="card p-5 space-y-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-2">Año principal</p>
          <div className="flex flex-wrap gap-1.5">
            {ANIOS.map(a => (
              <button key={a} onClick={() => setAnioPrincipal(a)}
                className={`year-btn ${anioPrincipal === a ? 'active' : ''}`}
                style={anioPrincipal === a ? { background: 'linear-gradient(135deg,var(--accent),var(--accent2))', boxShadow: '0 2px 12px var(--glow-accent)' } : {}}>
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-2">
            Años para superponer (máx. 4) · <span style={{ color: 'var(--accent)' }}>{aniosCompara.length} seleccionados</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ANIOS.map(a => {
              const esPrincipal = a === anioPrincipal;
              const seleccionado = aniosCompara.includes(a);
              return (
                <button key={a} onClick={() => toggleCompara(a)} disabled={esPrincipal}
                  className="year-btn"
                  style={{
                    background: esPrincipal ? 'linear-gradient(135deg,var(--accent),var(--accent2))' : seleccionado ? COLORES[a] : undefined,
                    color: esPrincipal || seleccionado ? 'white' : undefined,
                    opacity: esPrincipal ? 0.4 : 1,
                    cursor: esPrincipal ? 'not-allowed' : 'pointer',
                    border: seleccionado ? `1px solid ${COLORES[a]}` : undefined,
                  }}>
                  {a}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-2">Visualización</p>
            <div className="flex rounded-xl border border-[var(--border)] overflow-hidden text-xs">
              {[['euros','€ pagados'],['porcentaje','% efectivo']].map(([v,l]) => (
                <button key={v} onClick={() => setModoVisual(v)}
                  className={`px-3 py-2 font-semibold transition-all ${modoVisual === v ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--accent2)] text-white' : 'text-[var(--text)] hover:bg-[var(--surface2)]'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-48">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-2">
              Tu salario · {eur(salarioRef)}
            </p>
            <input type="range" min={0} max={maxSalario} step={500}
              value={salarioRef} onChange={e => setSalarioRef(+e.target.value)}
              className="w-full" />
          </div>
          <div className="flex-1 min-w-40">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-2">
              Eje X máx · {eur(maxSalario)}
            </p>
            <input type="range" min={30000} max={300000} step={10000}
              value={maxSalario} onChange={e => setMaxSalario(+e.target.value)}
              className="w-full" />
          </div>
        </div>
      </div>

      {/* Métricas de referencia */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 col-span-2 sm:col-span-1"
          style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.06),rgba(99,102,241,0.02))', borderColor: 'rgba(99,102,241,0.2)' }}>
          <div className="text-[10px] text-[var(--text-soft)] uppercase tracking-wider font-bold mb-1">
            {anioPrincipal} · {eur(salarioRef)}
          </div>
          <div className="text-2xl font-black font-mono text-[var(--accent)]">{eur(refPunto.irpf)}</div>
          <div className="text-[11px] text-[var(--text)] mt-0.5">IRPF · {pct(refPunto.pct)} efectivo · {sufijoEuros}</div>
        </div>
        {[15000, 40000, 80000].map((s, i) => {
          const calc = calcPunto(s, anioPrincipal, opts, ajustarIPC);
          const colors = ['var(--green)', 'var(--yellow)', 'var(--red)'];
          return (
            <div key={s} className="card p-4">
              <div className="text-[10px] text-[var(--text-soft)] uppercase tracking-wider font-bold mb-1">{eur(s)}</div>
              <div className="text-xl font-black font-mono" style={{ color: colors[i] }}>{eur(calc.irpf)}</div>
              <div className="text-[11px] text-[var(--text)] mt-0.5">{pct(calc.pct)} efectivo</div>
            </div>
          );
        })}
      </div>

      {/* Gráfico principal */}
      <div className="card p-5">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)]">Curva del impuesto · {sufijoEuros}</p>
            <h3 className="text-base font-bold text-[var(--text-h)]">
              {modoVisual === 'euros' ? `IRPF pagado (${sufijoEuros})` : 'Tipo efectivo (%)'} por salario bruto
            </h3>
          </div>
          <span className="tag">{REGIONES[opts.ccaa || 'default']?.name} · {opts.regimen === 'autonomo' ? 'Autónomo' : 'Asalariado'}</span>
        </div>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={datosCurva} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" />
            <XAxis dataKey="bruto" tick={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'monospace' }}
              tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'monospace' }}
              tickFormatter={fmtTick} width={44} />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              formatter={fmtTooltip} labelFormatter={l => `Bruto: ${eur(l)}${ajustarIPC ? ' (€ 2026)' : ''}`} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            {salarioRef > 0 && salarioRef <= maxSalario && (
              <ReferenceLine x={salarioRef} stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="5 4"
                label={{ value: `▼ ${eur(salarioRef)}`, position: 'top', fill: 'var(--accent)', fontSize: 11 }} />
            )}
            {aniosVisibles.map(a => (
              <Line key={a} type="monotone"
                dataKey={modoVisual === 'euros' ? `irpf_${a}` : `pct_${a}`}
                name={`${a}${a === anioPrincipal ? ' ★' : ''}`}
                stroke={COLORES[a]}
                strokeWidth={a === anioPrincipal ? 2.5 : 1.5}
                dot={false}
                strokeDasharray={a === anioPrincipal ? '0' : '5 3'}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Callout dinámico */}
        {deltasDetalle.length > 0 && (
          <div className="mt-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface2)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--accent)] mb-2">
              Para {eur(salarioRef)} brutos{ajustarIPC ? ' (€ 2026)' : ''}
            </p>
            <p className="text-sm text-[var(--text-h)] font-medium mb-3">
              En <strong style={{ color: COLORES[anioPrincipal] }}>{anioPrincipal}</strong> pagas{' '}
              <span className="font-mono font-bold">{eur(refPunto.irpf)}</span> de IRPF
              <span className="text-[var(--text-soft)]"> ({pct(refPunto.pct)} efectivo)</span>.
            </p>
            <div className="flex flex-wrap gap-2">
              {deltasDetalle.map(d => (
                <div key={d.anio} className="flex-1 min-w-36 p-3 rounded-lg border"
                  style={{ borderColor: COLORES[d.anio] + '44', background: COLORES[d.anio] + '08' }}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[11px] font-bold font-mono" style={{ color: COLORES[d.anio] }}>{d.anio}</span>
                    <span className="text-sm font-bold font-mono text-[var(--text-h)]">{eur(d.irpf)}</span>
                  </div>
                  {ajustarIPC && (
                    <div className="text-[10px] text-[var(--text-soft)] font-mono mb-1">
                      {eur(d.salarioNominal)} nom. → IRPF {eur(d.irpfNominal)} × {d.factor.toFixed(3)}
                    </div>
                  )}
                  <div className="text-[11px] font-bold"
                    style={{ color: d.delta > 0 ? 'var(--red)' : d.delta < 0 ? 'var(--green)' : 'var(--text-soft)' }}>
                    {d.delta > 0 ? '+' : ''}{eur(d.delta)} {d.delta > 0 ? `más en ${anioPrincipal}` : d.delta < 0 ? `menos en ${anioPrincipal}` : '—'}
                  </div>
                </div>
              ))}
            </div>
            {ajustarIPC && (
              <p className="text-[11px] text-[var(--text-soft)] mt-3 leading-relaxed">
                <strong>Metodología:</strong> el salario en € de 2026 se divide por el IPC acumulado (dic-a-dic) para obtener el equivalente nominal de ese año. El IRPF se calcula con la normativa de ese ejercicio y se reflacta a € de 2026. La diferencia es la <em>progresividad en frío</em>.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import {
  ComposedChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { ANIOS, DEUDA_ESPANA, calcularNomina } from '../engine/irpf';
import { eur } from '../utils/format';

export default function DeudaPublica({ bruto = 35000, anio: anioRef = 2026 }) {
  const [salarioBruto, setSalarioBruto] = useState(bruto);
  const [anio, setAnio] = useState(anioRef);
  const [aniosProyeccion, setAniosProyeccion] = useState(20);

  const datos = DEUDA_ESPANA[anio];
  const irpfAnual = useMemo(() => calcularNomina(salarioBruto, anio).irpfFinal, [salarioBruto, anio]);
  const aniosParaPagar = irpfAnual > 0 ? datos.perCapita / irpfAnual : Infinity;

  const datosHistorico = ANIOS.map(a => ({
    anio: a,
    perCapita: DEUDA_ESPANA[a].perCapita,
    pctPIB: DEUDA_ESPANA[a].pctPIB,
    totalMM: DEUDA_ESPANA[a].totalMM,
  }));

  const proyeccion = useMemo(() => {
    const arr = [];
    let pendiente = datos.perCapita;
    for (let i = 0; i <= aniosProyeccion; i++) {
      arr.push({ anio: i, pendiente: Math.max(0, pendiente) });
      pendiente -= irpfAnual;
    }
    return arr;
  }, [datos.perCapita, irpfAnual, aniosProyeccion]);

  const crecTotal = ((datos.totalMM / DEUDA_ESPANA[2012].totalMM) - 1) * 100;
  const crecPerCap = ((datos.perCapita / DEUDA_ESPANA[2012].perCapita) - 1) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-h)] mb-1">Tu parte de la deuda pública</h2>
        <p className="text-[13px] text-[var(--text)] leading-relaxed max-w-3xl">
          Cada español carga proporcionalmente con la deuda pública. A finales de 2025, esa cifra superaba los <strong>34.000 € por habitante</strong>. Aquí calculamos cuántos años tendrías que destinar el <strong>total</strong> de tu IRPF — sin gastar un euro en sanidad, educación o pensiones — solo para amortizar tu cuota personal.
        </p>
      </div>

      {/* Controles */}
      <div className="card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-2">
              Tu salario bruto · {eur(salarioBruto)}
            </p>
            <input type="range" min={12000} max={120000} step={500}
              value={salarioBruto} onChange={e => setSalarioBruto(+e.target.value)} className="w-full" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-2">Año de referencia</p>
            <div className="flex flex-wrap gap-1.5">
              {ANIOS.map(a => (
                <button key={a} onClick={() => setAnio(a)}
                  className={`year-btn ${anio === a ? 'active' : ''}`}
                  style={anio === a ? { background: 'var(--red)', boxShadow: '0 2px 10px var(--glow-red)' } : {}}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* La frase demoledora */}
      <div className="card p-5" style={{ background: 'linear-gradient(135deg,var(--surface),rgba(251,113,133,0.04))', borderColor: 'rgba(251,113,133,0.2)' }}>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--red)] mb-2">El cálculo en una frase</p>
        <p className="text-[15px] leading-relaxed text-[var(--text-h)]">
          Pagas <strong className="font-mono text-[var(--yellow)]">{eur(irpfAnual)}</strong> de IRPF al año.
          Tu parte proporcional de la deuda pública española en {anio} es{' '}
          <strong className="font-mono text-[var(--red)]">{eur(datos.perCapita)}</strong>.
          Tendrías que destinar el <strong>100% de tu IRPF durante{' '}
          <span style={{ color: 'var(--red)' }}>{aniosParaPagar.toFixed(1)} años</span></strong>{' '}
          solo para pagar tu cuota personal — sin financiar sanidad, educación, pensiones ni infraestructuras.
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Deuda total', `${datos.totalMM.toLocaleString('es-ES')} mM €`, `${datos.pctPIB.toFixed(1)}% del PIB`, 'var(--text-h)'],
          ['Por habitante', eur(datos.perCapita), `${datos.poblacion.toFixed(1)}M habitantes`, 'var(--red)'],
          ['Crecimiento desde 2012', `+${crecTotal.toFixed(0)}%`, `per cápita +${crecPerCap.toFixed(0)}%`, 'var(--yellow)'],
          ['Años de tu IRPF', aniosParaPagar.toFixed(1), 'al 100% para amortizar', 'var(--red)'],
        ].map(([label, value, sub, color]) => (
          <div key={label} className="card p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-soft)] mb-1">{label}</div>
            <div className="text-xl font-black font-mono" style={{ color }}>{value}</div>
            <div className="text-[11px] text-[var(--text)] mt-1">{sub}</div>
          </div>
        ))}
      </div>

      {/* Evolución histórica */}
      <div className="card p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-1">Evolución 2012-2026</p>
        <h3 className="text-base font-bold text-[var(--text-h)] mb-4">Deuda pública española: per cápita y % PIB</h3>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={datosHistorico} margin={{ top: 8, right: 40, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" />
            <XAxis dataKey="anio" tick={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'monospace' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'monospace' }}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`} width={44} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'var(--accent)', fontFamily: 'monospace' }}
              tickFormatter={v => `${v}%`} width={38} />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              formatter={(v, n) => n === 'pctPIB' ? [`${v.toFixed(1)}%`, '% del PIB'] : [eur(v), n]} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar yAxisId="left" dataKey="perCapita" name="Deuda per cápita (€)" fill="var(--red)" fillOpacity={0.7} />
            <Line yAxisId="right" type="monotone" dataKey="pctPIB" name="% del PIB" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} />
            <ReferenceLine yAxisId="left" x={anio} stroke="var(--border-light)" strokeDasharray="3 2" />
          </ComposedChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-[var(--text-soft)] mt-2">
          La deuda per cápita ha crecido un {crecPerCap.toFixed(0)}% desde 2012.
          Fuente: Banco de España (PDE-Eurostat) + INE (ECP).
        </p>
      </div>

      {/* Simulación amortización */}
      <div className="card p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--text-soft)] mb-1">Escenario imposible</p>
        <h3 className="text-base font-bold text-[var(--text-h)] mb-1">Si destinaras el 100% de tu IRPF a tu deuda</h3>
        <p className="text-[12px] text-[var(--text)] mb-4">
          Cuántos años harían falta para amortizar {eur(datos.perCapita)}, aportando {eur(irpfAnual)}/año y asumiendo deuda congelada.
          <label className="ml-4 inline-flex items-center gap-2 text-[11px] text-[var(--text-soft)]">
            Horizonte: {aniosProyeccion} años
            <input type="range" min={5} max={40} step={1}
              value={aniosProyeccion} onChange={e => setAniosProyeccion(+e.target.value)}
              className="w-24 align-middle" />
          </label>
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={proyeccion} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" />
            <XAxis dataKey="anio" tick={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'monospace' }}
              label={{ value: 'Años destinando todo el IRPF', position: 'insideBottom', offset: -2, fontSize: 11, fill: 'var(--text-soft)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'monospace' }}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`} width={44} />
            <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
              formatter={v => [eur(v), 'Pendiente']} labelFormatter={l => `Año ${l}`} />
            <ReferenceLine y={0} stroke="var(--border)" />
            <Bar dataKey="pendiente" name="Deuda pendiente" fill="var(--red)" fillOpacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Nota metodológica */}
      <div className="card p-4 text-[12px] text-[var(--text)] leading-relaxed">
        <strong className="text-[var(--text-h)]">Metodología.</strong> Los datos de deuda total y % PIB proceden del Banco de España, criterio PDE (Protocolo de Déficit Excesivo), el estándar de Eurostat. La deuda per cápita resulta de dividir la deuda total entre la población residente del INE. Es un cálculo aritmético, no un compromiso individual real. El cálculo de «años de IRPF» es una <strong>ilustración divulgativa</strong> del orden de magnitud de la carga fiscal personal frente al endeudamiento del Estado.
      </div>
    </div>
  );
}

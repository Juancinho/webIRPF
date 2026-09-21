import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { ANIOS, INFLACION_A_2026, calcularNomina } from '../engine/irpf';
import Figure from '../figures/Figure';
import ChartFrame from '../figures/ChartFrame';
import YearComparator from '../figures/YearComparator';
import { Label } from '../figures/marks';
import { linear, round } from '../figures/scale';
import { dec, eur, pct } from '../utils/format';

const W = 880;
const H = 470;
const XA = 236;          // el eje del año de partida
const XB = W - 236;      // el eje del año de llegada
const Y0 = 52;
const Y1 = H - 74;
const MIN_SEP = 15;      // separación mínima entre rótulos de un mismo lado

/* Nueve alturas de la escala, en euros constantes de 2026: no son percentiles
   ni casos reales, son cortes fijos para poder comparar el mismo poder de
   compra en dos fiscalidades distintas. */
const NIVELES = [15000, 20000, 25000, 30000, 40000, 50000, 70000, 100000, 150000];

/** Coloca rótulos en su altura y luego los separa si se pisan. */
function separar(items) {
  const orden = [...items].sort((a, b) => a.y - b.y);
  const bajados = orden.reduce((acc, it) => {
    const previo = acc[acc.length - 1];
    acc.push({ ...it, y: previo ? Math.max(it.y, previo.y + MIN_SEP) : Math.max(it.y, Y0) });
    return acc;
  }, []);
  const exceso = bajados[bajados.length - 1].y - Y1;
  if (exceso > 0) {
    for (let i = bajados.length - 1; i >= 0; i--) {
      const sig = bajados[i + 1];
      bajados[i].y = sig ? Math.min(bajados[i].y, sig.y - MIN_SEP) : bajados[i].y - exceso;
    }
  }
  return Object.fromEntries(bajados.map(b => [b.nivel, b.y]));
}

/**
 * LA PENDIENTE DE QUINCE AÑOS.
 *
 * Dos columnas y una recta por cada altura de la escala salarial. A la
 * izquierda, lo que se llevaba el sistema en el año de partida; a la derecha,
 * lo que se lleva en el de llegada. **Con el mismo poder adquisitivo**: cada
 * nivel se reexpresa en euros de cada año, así que la recta no mide inflación,
 * mide fiscalidad.
 *
 * Es la pregunta que el mapa de calor deja ver pero no deja medir: no «cómo es
 * la superficie entera», sino «a quién le ha subido y cuánto». Una recta que
 * sube es más presión; una que baja, menos. La pendiente es el dato.
 */
export default function Pendiente({ anios, anioA, anioB, onAnioA, onAnioB }) {
  const { bruto, anio, opts } = useFiscal();
  const [hover, setHover] = useState(null);
  const [tip, setTip] = useState(null);

  const desde = anioA;
  const hasta = anioB;

  const bruto2026 = Math.round(bruto * (INFLACION_A_2026[anio] || 1));

  const lineas = useMemo(() => {
    const tipoEn = (nivel2026, a) => {
      const nominal = nivel2026 / (INFLACION_A_2026[a] || 1);
      const n = calcularNomina(nominal, a, opts);
      return { tipo: n.tipoEfectivoTotal * 100, nominal, neto: n.salarioNeto };
    };
    return NIVELES.map(nivel => {
      const a = tipoEn(nivel, desde);
      const b = tipoEn(nivel, hasta);
      return { nivel, a, b, delta: b.tipo - a.tipo };
    });
  }, [desde, hasta, opts]);

  const tipos = lineas.flatMap(l => [l.a.tipo, l.b.tipo]);
  const lo = Math.min(...tipos);
  const hi = Math.max(...tipos);
  const aire = Math.max(1.2, (hi - lo) * 0.12);
  const y = linear([lo - aire, hi + aire], [Y1, Y0]);

  const rotA = separar(lineas.map(l => ({ nivel: l.nivel, y: y(l.a.tipo) })));
  const rotB = separar(lineas.map(l => ({ nivel: l.nivel, y: y(l.b.tipo) })));

  /* Tu propio nivel, para no quedarte fuera de una figura sobre ti. */
  const miNivel = lineas.reduce(
    (best, l) => (Math.abs(l.nivel - bruto2026) < Math.abs(best.nivel - bruto2026) ? l : best),
    lineas[0]
  );

  const suben = lineas.filter(l => l.delta > 0.05);
  const mayor = lineas.reduce((m, l) => (l.delta > m.delta ? l : m), lineas[0]);
  const menor = lineas.reduce((m, l) => (l.delta < m.delta ? l : m), lineas[0]);

  const titular =
    suben.length === lineas.length
      ? `De ${desde} a ${hasta} sube la presión en los nueve niveles: hasta ${dec(mayor.delta, 1)} puntos más`
      : suben.length === 0
        ? `De ${desde} a ${hasta} baja la presión en los nueve niveles: hasta ${dec(Math.abs(menor.delta), 1)} puntos menos`
        : `De ${desde} a ${hasta} sube en ${suben.length} de los nueve niveles y baja en ${lineas.length - suben.length}`;

  return (
    <Figure
      id="16"
      title={titular}
      sub={`Mismo poder adquisitivo en los dos extremos · cada recta es una altura fija de la escala, en euros constantes de ${ANIOS[ANIOS.length - 1]} · la altura es el tipo efectivo total`}
      legend="Una recta que sube es más presión fiscal sobre el mismo poder de compra; una que baja, menos · la recta en petróleo es la altura más cercana a tu sueldo"
      source="Fuente · cálculo propio con los parámetros de cada año · IPC INE para reexpresar los niveles"
      note="El tipo efectivo total incluye IRPF y cotización del trabajador sobre el salario bruto, con el perfil que tengas seleccionado. Los nueve niveles son cortes fijos elegidos para cubrir la escala, no percentiles ni casos representativos, y por eso la figura compara fiscalidades, no personas."
      summary={lineas
        .map(l => `${eur(l.nivel)}: ${pct(l.a.tipo)} en ${desde} → ${pct(l.b.tipo)} en ${hasta}`)
        .join('. ')}
    >
      <YearComparator
        years={anios}
        yearA={desde}
        yearB={hasta}
        onYearA={onAnioA}
        onYearB={onAnioB}
        note="Los niveles mantienen el mismo poder adquisitivo en ambos extremos."
      />

      <ChartFrame viewBox={`0 0 ${W} ${H}`} tip={tip} scroll minWidth={700} label="La pendiente de quince años">
        <line x1={XA} y1={Y0 - 10} x2={XA} y2={Y1 + 10} stroke="var(--rule)" strokeWidth={0.9} />
        <line x1={XB} y1={Y0 - 10} x2={XB} y2={Y1 + 10} stroke="var(--rule)" strokeWidth={0.9} />
        <Label x={XA} y={Y0 - 22} size={12} weight={800} color="var(--counter)" anchor="middle" mono>
          {desde}
        </Label>
        <Label x={XB} y={Y0 - 22} size={12} weight={800} color="var(--signal)" anchor="middle" mono>
          {hasta}
        </Label>

        {lineas.map(l => {
          const on = hover === l.nivel;
          const mio = l === miNivel;
          const dim = hover !== null && !on;
          const color = mio ? 'var(--signal)' : l.delta > 0.05 ? 'var(--counter)' : 'var(--ink-3)';
          const ya = y(l.a.tipo);
          const yb = y(l.b.tipo);
          return (
            <g
              key={l.nivel}
              onMouseEnter={() => {
                setHover(l.nivel);
                setTip({
                  vx: (XA + XB) / 2,
                  vy: (ya + yb) / 2,
                  title: `${l.delta >= 0 ? '+' : '−'}${dec(Math.abs(l.delta), 1)} puntos`,
                  sub: `${eur(l.nivel)} de ${ANIOS[ANIOS.length - 1]}`,
                  rows: [
                    [`Tipo en ${desde}`, pct(l.a.tipo), 'var(--counter)'],
                    [`Tipo en ${hasta}`, pct(l.b.tipo), 'var(--signal)'],
                    [`Bruto equivalente en ${desde}`, eur(l.a.nominal)],
                    [`Neto en ${hasta}`, eur(l.b.neto)],
                  ],
                });
              }}
              onMouseLeave={() => { setHover(null); setTip(null); }}
              style={{ cursor: 'pointer' }}
              opacity={dim ? 0.22 : 1}
            >
              {/* guías del rótulo a su punto: los rótulos están separados, los
                  puntos no, y sin la guía se pierde la correspondencia */}
              <line x1={XA - 76} y1={round(rotA[l.nivel] - 3.5)} x2={XA - 4} y2={round(ya)} stroke="var(--ink-6)" strokeWidth={0.6} strokeDasharray="1.5 2" />
              <line x1={XB + 4} y1={round(yb)} x2={XB + 76} y2={round(rotB[l.nivel] - 3.5)} stroke="var(--ink-6)" strokeWidth={0.6} strokeDasharray="1.5 2" />

              <line
                x1={XA}
                y1={round(ya)}
                x2={XB}
                y2={round(yb)}
                stroke={color}
                strokeWidth={mio ? 2.6 : on ? 2.2 : 1.4}
              />
              <circle cx={XA} cy={round(ya)} r={mio ? 4.5 : 3.4} fill="var(--counter)" stroke={mio ? color : 'none'} strokeWidth={1.4} />
              <circle cx={XB} cy={round(yb)} r={mio ? 4.5 : 3.4} fill="var(--signal)" stroke={mio ? color : 'none'} strokeWidth={1.4} />

              <Label x={XA - 82} y={round(rotA[l.nivel])} size={10.5} weight={mio ? 800 : 600} color={mio ? 'var(--signal)' : 'var(--ink-2)'} anchor="end">
                {eur(l.nivel)}
              </Label>
              <Label x={XA - 78} y={round(rotA[l.nivel])} size={10} weight={600} color="var(--ink-4)" mono>
                {pct(l.a.tipo)}
              </Label>

              <Label x={XB + 82} y={round(rotB[l.nivel])} size={10.5} weight={mio ? 800 : 700} color={mio ? 'var(--signal)' : 'var(--ink)'} mono>
                {pct(l.b.tipo)}
              </Label>
              <Label
                x={W - 6}
                y={round(rotB[l.nivel])}
                size={10}
                weight={700}
                color={l.delta > 0.05 ? 'var(--counter)' : l.delta < -0.05 ? 'var(--ink-3)' : 'var(--ink-5)'}
                anchor="end"
                mono
              >
                {l.delta >= 0 ? '+' : '−'}{dec(Math.abs(l.delta), 1)}
              </Label>
            </g>
          );
        })}

        {miNivel && (
          <Label
            x={(XA + XB) / 2}
            y={round((y(miNivel.a.tipo) + y(miNivel.b.tipo)) / 2) - 10}
            size={9.5}
            weight={800}
            color="var(--signal)"
            anchor="middle"
            mono
          >
            TU ALTURA · {eur(miNivel.nivel)}
          </Label>
        )}

        <Label x={XA - 82} y={Y1 + 34} size={9} color="var(--ink-5)" anchor="end" mono>
          NIVEL · TIPO EFECTIVO
        </Label>
        <Label x={W - 6} y={Y1 + 34} size={9} color="var(--ink-5)" anchor="end" mono>
          PUNTOS DE DIFERENCIA
        </Label>
        <Label x={XA} y={Y1 + 34} size={9} color="var(--ink-5)" mono>
          ↑ MÁS PRESIÓN · ↓ MENOS PRESIÓN
        </Label>
      </ChartFrame>
    </Figure>
  );
}

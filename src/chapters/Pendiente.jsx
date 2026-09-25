import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { ANIOS, INFLACION_A_2026, calcularNomina } from '../engine/irpf';
import Figure from '../figures/Figure';
import ChartFrame from '../figures/ChartFrame';
import YearComparator from '../figures/YearComparator';
import { Label } from '../figures/marks';
import { linear, polyline, round } from '../figures/scale';
import { dec, eur, pct } from '../utils/format';
import { ANCHO_MOVIL, useNarrow } from '../hooks/useNarrow';

const H = 480;
const Y0 = 46;
const Y1 = H - 76;
const MIN_SEP = 15;      // separación mínima entre rótulos de la derecha

/* Nueve alturas de la escala, en euros constantes del último año: no son
   percentiles ni casos reales, son cortes fijos para poder seguir el mismo
   poder de compra a través de quince fiscalidades distintas. */
const NIVELES = [15000, 20000, 25000, 30000, 40000, 50000, 70000, 100000, 150000];
const ULTIMO = ANIOS[ANIOS.length - 1];

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
 * FIG. 16 — QUINCE AÑOS DE PRESIÓN FISCAL, ALTURA POR ALTURA.
 *
 * Una línea por cada altura de la escala salarial, recorriendo los quince
 * ejercicios. Cada nivel se reexpresa en euros de cada año, así que el poder
 * adquisitivo se mantiene constante y lo único que mueve la línea es la
 * fiscalidad: si sube, el sistema se lleva más de la misma capacidad de
 * compra; si baja, menos.
 *
 * El selector de años no recorta la serie —están siempre los quince— sino que
 * marca el par que se compara: las dos verticales y la columna de puntos de
 * diferencia de la derecha. Se ve el recorrido entero y se mide el tramo que
 * interesa.
 */
export default function Pendiente({ anios, anioA, anioB, onAnioA, onAnioB }) {
  const { bruto, anio, opts } = useFiscal();
  const [hover, setHover] = useState(null);
  const [tip, setTip] = useState(null);
  // A la derecha, el nombre de cada recta y su cambio. En móvil se quedan el
  // nivel y los puntos de diferencia; el tipo del año B va en el recuadro.
  const narrow = useNarrow();
  const W = narrow ? ANCHO_MOVIL : 880;
  const X0 = narrow ? 30 : 46;
  const X1 = W - (narrow ? 104 : 214);
  const XN = X1 + (narrow ? 16 : 30);

  const desde = Math.min(anioA, anioB);
  const hasta = Math.max(anioA, anioB);

  const bruto2026 = Math.round(bruto * (INFLACION_A_2026[anio] || 1));

  const lineas = useMemo(
    () =>
      NIVELES.map(nivel => {
        const puntos = ANIOS.map(a => {
          const nominal = nivel / (INFLACION_A_2026[a] || 1);
          const n = calcularNomina(nominal, a, opts);
          return { anio: a, tipo: n.tipoEfectivoTotal * 100, nominal, neto: n.salarioNeto };
        });
        const pa = puntos.find(p => p.anio === desde) || puntos[0];
        const pb = puntos.find(p => p.anio === hasta) || puntos[puntos.length - 1];
        return { nivel, puntos, a: pa, b: pb, delta: pb.tipo - pa.tipo };
      }),
    [desde, hasta, opts]
  );

  const tipos = lineas.flatMap(l => l.puntos.map(p => p.tipo));
  const lo = Math.min(...tipos);
  const hi = Math.max(...tipos);
  const aire = Math.max(1.2, (hi - lo) * 0.08);
  const y = linear([lo - aire, hi + aire], [Y1, Y0]);
  const x = linear([ANIOS[0], ULTIMO], [X0, X1]);

  const rotulos = separar(
    lineas.map(l => ({ nivel: l.nivel, y: y(l.puntos[l.puntos.length - 1].tipo) }))
  );

  /* Tu propia altura, para no quedarte fuera de una figura sobre ti. */
  const miNivel = lineas.reduce(
    (best, l) => (Math.abs(l.nivel - bruto2026) < Math.abs(best.nivel - bruto2026) ? l : best),
    lineas[0]
  );

  const suben = lineas.filter(l => l.delta > 0.05);
  const mayor = lineas.reduce((m, l) => (l.delta > m.delta ? l : m), lineas[0]);
  const menor = lineas.reduce((m, l) => (l.delta < m.delta ? l : m), lineas[0]);

  const titular =
    desde === hasta
      ? `Quince años de presión fiscal, de ${eur(NIVELES[0])} a ${eur(NIVELES[NIVELES.length - 1])}`
      : suben.length === lineas.length
        ? `De ${desde} a ${hasta} sube la presión en los nueve niveles: hasta ${dec(mayor.delta, 1)} puntos más`
        : suben.length === 0
          ? `De ${desde} a ${hasta} baja la presión en los nueve niveles: hasta ${dec(Math.abs(menor.delta), 1)} puntos menos`
          : `De ${desde} a ${hasta} sube en ${suben.length} de los nueve niveles y baja en ${lineas.length - suben.length}`;

  const marcas = ANIOS.filter((a, i) => i % 2 === 0 || a === ULTIMO);

  return (
    <Figure
      id="16"
      title={titular}
      sub={`Los quince ejercicios completos · cada línea es una altura fija de la escala, en euros constantes de ${ULTIMO} · la altura es el tipo efectivo total`}
      legend="Una línea que sube es más presión fiscal sobre el mismo poder de compra; una que baja, menos · las dos verticales son los años que has elegido comparar · la línea verde es la altura más cercana a tu sueldo"
      source="Fuente · cálculo propio con los parámetros de cada año · IPC INE para reexpresar los niveles"
      note="El tipo efectivo total incluye IRPF y cotización del trabajador sobre el salario bruto, con el perfil que tengas seleccionado. Los nueve niveles son cortes fijos elegidos para cubrir la escala, no percentiles ni casos representativos, y por eso la figura compara fiscalidades, no personas. El selector no recorta la serie: elige el tramo que se mide en la columna de la derecha."
      summary={lineas
        .map(l => `${eur(l.nivel)}: ${pct(l.a.tipo)} en ${desde} → ${pct(l.b.tipo)} en ${hasta}`)
        .join('. ')}
    >
      <YearComparator
        years={anios}
        yearA={anioA}
        yearB={anioB}
        onYearA={onAnioA}
        onYearB={onAnioB}
        note="Los quince años se dibujan siempre; el par elegido marca el tramo que se mide."
      />

      <div className="fs-readout" style={{ marginBottom: 16 }}>
        <span>
          <span className="fs-readout-k">Tu altura</span>
          <span className="fs-readout-v fs-signal">{eur(miNivel.nivel)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Tipo en {desde}</span>
          <span className="fs-readout-v">{pct(miNivel.a.tipo)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Tipo en {hasta}</span>
          <span className="fs-readout-v">{pct(miNivel.b.tipo)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Diferencia</span>
          <span className="fs-readout-v">
            {miNivel.delta >= 0 ? '+' : '−'}{dec(Math.abs(miNivel.delta), 1)} puntos
          </span>
        </span>
      </div>

      <ChartFrame viewBox={`0 0 ${W} ${H}`} tip={tip} label="Quince años de presión fiscal por nivel salarial">
        {/* la rejilla de tipos */}
        {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45]
          .filter(v => v >= y.domain[0] && v <= y.domain[1])
          .map(v => (
            <g key={v}>
              <line x1={X0} y1={round(y(v))} x2={X1} y2={round(y(v))} stroke="var(--ink-7)" strokeWidth={0.6} />
              <Label x={X0 - 6} y={round(y(v)) + 3} size={narrow ? 8.5 : 9} color="var(--ink-5)" anchor="end" mono>
                {pct(v, 0)}
              </Label>
            </g>
          ))}

        {/* los dos años elegidos: el tramo que se mide */}
        {[[desde, 'var(--counter)', 'A'], [hasta, 'var(--signal)', 'B']].map(([a, color, letra]) => (
          <g key={letra}>
            <line x1={round(x(a))} y1={Y0 - 14} x2={round(x(a))} y2={Y1} stroke={color} strokeWidth={1.1} strokeDasharray="3 3" />
            <Label
              x={round(x(a))}
              y={Y0 - 20}
              size={10}
              weight={800}
              color={color}
              anchor={a === ANIOS[0] ? 'start' : a === ULTIMO ? 'end' : 'middle'}
              mono
            >
              {letra} · {a}
            </Label>
          </g>
        ))}

        {lineas.map(l => {
          const on = hover === l.nivel;
          const mio = l === miNivel;
          const dim = hover !== null && !on;
          const color = mio ? 'var(--signal)' : on ? 'var(--ink)' : 'var(--ink-3)';
          const yR = rotulos[l.nivel];
          const yFin = y(l.puntos[l.puntos.length - 1].tipo);
          return (
            <g
              key={l.nivel}
              onMouseEnter={() => {
                setHover(l.nivel);
                setTip({
                  vx: (x(desde) + x(hasta)) / 2 || X1 / 2,
                  vy: (y(l.a.tipo) + y(l.b.tipo)) / 2,
                  title: `${l.delta >= 0 ? '+' : '−'}${dec(Math.abs(l.delta), 1)} puntos`,
                  sub: `${eur(l.nivel)} de ${ULTIMO} · de ${desde} a ${hasta}`,
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
              opacity={dim ? 0.24 : 1}
            >
              <path
                d={polyline(l.puntos.map(p => [x(p.anio), y(p.tipo)]))}
                fill="none"
                stroke={color}
                strokeWidth={mio ? 2.4 : on ? 2 : 1.1}
                strokeLinejoin="round"
              />

              {/* los dos años comparados, marcados sobre su propia línea */}
              <circle cx={round(x(desde))} cy={round(y(l.a.tipo))} r={mio || on ? 3.4 : 2.4} fill="var(--counter)" />
              <circle cx={round(x(hasta))} cy={round(y(l.b.tipo))} r={mio || on ? 3.4 : 2.4} fill={mio ? 'var(--signal)' : 'var(--signal)'} />

              {/* guía del final de la línea a su rótulo */}
              <line x1={X1 + 3} y1={round(yFin)} x2={XN - 4} y2={round(yR - 3.5)} stroke="var(--ink-6)" strokeWidth={0.6} strokeDasharray="1.5 2" />

              <Label x={XN} y={round(yR)} size={narrow ? 9.5 : 10.5} weight={mio ? 800 : 600} color={mio ? 'var(--signal)' : 'var(--ink-2)'}>
                {eur(l.nivel)}
              </Label>
              {!narrow && (
                <Label x={X1 + 106} y={round(yR)} size={10} weight={700} color="var(--ink)" mono>
                  {pct(l.b.tipo)}
                </Label>
              )}
              <Label
                x={W - (narrow ? 2 : 6)}
                y={round(yR)}
                size={narrow ? 9.5 : 10}
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

        {/* el eje de los años */}
        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="var(--rule)" strokeWidth={0.8} />
        {marcas.map(a => (
          <g key={a}>
            <line x1={round(x(a))} y1={Y1} x2={round(x(a))} y2={Y1 + 5} stroke="var(--ink-5)" strokeWidth={0.7} />
            <Label x={round(x(a))} y={Y1 + 19} size={narrow ? 8.5 : 9.5} color="var(--ink-4)" anchor="middle" mono>
              {narrow ? `’${String(a).slice(2)}` : a}
            </Label>
          </g>
        ))}

        <Label x={XN} y={Y1 + 19} size={narrow ? 8 : 9} color="var(--ink-5)" mono>
          NIVEL
        </Label>
        {!narrow && (
          <Label x={X1 + 106} y={Y1 + 19} size={9} color="var(--ink-5)" mono>
            TIPO {hasta}
          </Label>
        )}
        <Label x={W - (narrow ? 2 : 6)} y={Y1 + 19} size={narrow ? 8 : 9} color="var(--ink-5)" anchor="end" mono>
          {narrow ? 'PTOS.' : 'PUNTOS'}
        </Label>
        <Label x={X0} y={Y1 + 40} size={narrow ? 8 : 9} color="var(--ink-5)" mono>
          {narrow
            ? 'TIPO EFECTIVO TOTAL · ↑ MÁS PRESIÓN · ↓ MENOS'
            : 'TIPO EFECTIVO TOTAL · ↑ MÁS PRESIÓN SOBRE EL MISMO PODER DE COMPRA · ↓ MENOS'}
        </Label>
      </ChartFrame>
    </Figure>
  );
}

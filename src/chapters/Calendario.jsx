import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { GASTO_COFOG } from '../engine/irpf';
import Figure from '../figures/Figure';
import ChartFrame from '../figures/ChartFrame';
import { Label } from '../figures/marks';
import { round } from '../figures/scale';
import { eur, pct } from '../utils/format';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/* Los tres destinos del capítulo, con el mismo código de color que el río:
   las dos figuras cuentan lo mismo en dos unidades, y el lector tiene que
   poder saltar de una a otra sin volver a aprender la leyenda. */
const COLORES = {
  social: 'var(--signal)',
  servicios: 'var(--ink)',
  estado: 'var(--ink-4)',
  tuyo: 'transparent',
};

const CELDA = 13;
const HUECO = 3;
const PASO = CELDA + HUECO;
const X0 = 96;
const Y0 = 42;
const W = 96 + 31 * PASO + 16;
const H = Y0 + 12 * PASO + 30;

const bisiesto = a => (a % 4 === 0 && a % 100 !== 0) || a % 400 === 0;
const DIAS_MES = a => [31, bisiesto(a) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * FIG. 23 — EL CALENDARIO FISCAL.
 *
 * El río dice a dónde va el dinero; esta figura dice cuándo. Si la parte de tu
 * coste laboral que no llega a tu cuenta se repartiera a lo largo del año
 * natural, habría una fecha exacta en la que dejarías de trabajar para el
 * sistema y empezarías a cobrar para ti. Cada casilla es un día, y los días
 * que financian algo están pintados con el color de lo que financian.
 *
 * Es una convención de lectura —el método clásico del «día de liberación
 * fiscal»— y la nota lo dice: nadie cobra distinto en junio que en octubre.
 */
export default function Calendario() {
  const { anio, nomina, pagas } = useFiscal();
  const [tip, setTip] = useState(null);

  const cuna = Math.max(0, nomina.costeLab - nomina.salarioNeto);
  const parteCuna = nomina.costeLab > 0 ? cuna / nomina.costeLab : 0;

  const { dias, totalDias, diaLibre, fechaLibre, tramos } = useMemo(() => {
    const lens = DIAS_MES(anio);
    const total = lens.reduce((a, b) => a + b, 0);
    const paraElSistema = Math.round(parteCuna * total);

    /* Los días del sistema se reparten entre los tres destinos en la misma
       proporción en que se reparte el gasto público real. */
    const grupos = GASTO_COFOG.grupos.map(g => ({
      key: g.key,
      label: g.label,
      parte: g.partidas.reduce((a, p) => a + p.valor, 0) / GASTO_COFOG.total,
    }));

    /* El último grupo se queda con el resto para que la suma cuadre exacta:
       repartir por redondeo dejaría un día suelto sin dueño. */
    const cortes = grupos.reduce((acc, g, i) => {
      const repartidos = acc.reduce((a, c) => a + c.n, 0);
      const n = i === grupos.length - 1
        ? paraElSistema - repartidos
        : Math.round(g.parte * paraElSistema);
      acc.push({ ...g, n });
      return acc;
    }, []);

    const destinoDe = indice => {
      if (indice >= paraElSistema) return { key: 'tuyo', etiqueta: 'Para ti' };
      let acc = 0;
      for (const c of cortes) {
        acc += c.n;
        if (indice < acc) return { key: c.key, etiqueta: c.label };
      }
      return { key: 'tuyo', etiqueta: 'Para ti' };
    };

    const out = lens.flatMap((largo, m) =>
      Array.from({ length: largo }, (_, i) => ({ mes: m, dia: i + 1 }))
    ).map((d, indice) => ({ ...d, indice, ...destinoDe(indice) }));

    const libre = paraElSistema; // índice 0-based del primer día que es tuyo
    const fecha = out[Math.min(libre, out.length - 1)];

    return {
      dias: out,
      totalDias: total,
      diaLibre: libre,
      fechaLibre: fecha,
      tramos: cortes,
    };
  }, [anio, parteCuna]);

  const leyenda = [
    ...tramos.map(t => ({ key: t.key, label: t.label, n: t.n, color: COLORES[t.key] })),
    { key: 'tuyo', label: 'Para ti', n: totalDias - diaLibre, color: COLORES.tuyo },
  ];

  const mostrar = d =>
    setTip({
      vx: X0 + (d.dia - 1) * PASO + CELDA / 2,
      vy: Y0 + d.mes * PASO,
      title: `${d.dia} de ${MESES[d.mes].toLowerCase()}`,
      sub: `Día ${d.indice + 1} de ${totalDias}`,
      rows: [
        [d.key === 'tuyo' ? 'Ese día cobras' : 'Ese día financias', d.etiqueta,
          d.key === 'tuyo' ? 'var(--ink)' : COLORES[d.key]],
        ['Tu cuña fiscal', pct(parteCuna * 100)],
      ],
    });

  return (
    <Figure
      id="23"
      title={`Los primeros ${diaLibre} días del año los trabajas para el sistema: el ${fechaLibre.dia} de ${MESES[fechaLibre.mes].toLowerCase()} empiezas a cobrar para ti`}
      sub={`${anio} · ${totalDias} casillas, una por día · los ${diaLibre} primeros están pintados con el destino que financian`}
      legend={`Casilla llena = día que financia gasto público · casilla vacía = día que llega a tu cuenta · el reparto por destino sigue la clasificación funcional de ${GASTO_COFOG.anio}`}
      source={`Fuente · ${GASTO_COFOG.fuente} · cálculo propio`}
      note="Es una convención de lectura, no un calendario de cobros: tu nómina no cambia en junio. Reparte sobre el año natural la misma proporción que la cuña fiscal representa sobre el coste de tu puesto, que es el método clásico del «día de liberación fiscal»."
      summary={`De ${totalDias} días, ${diaLibre} financian gasto público y ${totalDias - diaLibre} llegan a tu renta neta. La fecha de corte es el ${fechaLibre.dia} de ${MESES[fechaLibre.mes].toLowerCase()}.`}
    >
      <div className="fs-readout" style={{ marginBottom: 18 }}>
        <span>
          <span className="fs-readout-k">Trabajas para el sistema</span>
          <span className="fs-readout-v">{diaLibre} días</span>
        </span>
        <span>
          <span className="fs-readout-k">Empiezas a cobrar para ti</span>
          <span className="fs-readout-v fs-signal">
            {fechaLibre.dia} de {MESES[fechaLibre.mes].toLowerCase()}
          </span>
        </span>
        <span>
          <span className="fs-readout-k">Equivale a</span>
          <span className="fs-readout-v">{eur(cuna)} · {eur(cuna / pagas)} por paga</span>
        </span>
      </div>

      <ChartFrame viewBox={`0 0 ${W} ${H}`} tip={tip} scroll minWidth={620} label="El calendario fiscal del año">
        {/* números de día, para poder localizar una fecha */}
        {[1, 5, 10, 15, 20, 25, 31].map(d => (
          <Label key={d} x={X0 + (d - 1) * PASO + CELDA / 2} y={Y0 - 12} size={8.5} color="var(--ink-5)" anchor="middle" mono>
            {d}
          </Label>
        ))}

        {MESES.map((mes, m) => (
          <Label key={mes} x={X0 - 12} y={Y0 + m * PASO + CELDA - 3} size={9.5} color="var(--ink-4)" anchor="end" mono>
            {mes.slice(0, 3).toUpperCase()}
          </Label>
        ))}

        {dias.map(d => {
          const tuyo = d.key === 'tuyo';
          return (
            <rect
              key={d.indice}
              x={round(X0 + (d.dia - 1) * PASO)}
              y={round(Y0 + d.mes * PASO)}
              width={CELDA}
              height={CELDA}
              rx={1.5}
              fill={tuyo ? 'none' : COLORES[d.key]}
              stroke={tuyo ? 'var(--ink-6)' : 'none'}
              strokeWidth={0.9}
              onMouseEnter={() => mostrar(d)}
              onMouseLeave={() => setTip(null)}
              style={{ cursor: 'pointer' }}
            >
              <title>{`${d.dia} de ${MESES[d.mes].toLowerCase()} — ${d.etiqueta}`}</title>
            </rect>
          );
        })}

        {/* la frontera: el día exacto en que cambia el destinatario */}
        {fechaLibre && (
          <g>
            <line
              x1={round(X0 + (fechaLibre.dia - 1) * PASO - HUECO / 2)}
              y1={round(Y0 + fechaLibre.mes * PASO - 2)}
              x2={round(X0 + (fechaLibre.dia - 1) * PASO - HUECO / 2)}
              y2={round(Y0 + (fechaLibre.mes + 1) * PASO - HUECO + 2)}
              stroke="var(--signal)"
              strokeWidth={2}
            />
            <Label
              x={round(X0 + (fechaLibre.dia - 1) * PASO + 7)}
              y={round(Y0 + fechaLibre.mes * PASO + CELDA - 3)}
              size={9.5}
              weight={700}
              color="var(--signal)"
              mono
            >
              {fechaLibre.dia} {MESES[fechaLibre.mes].slice(0, 3).toUpperCase()} · A PARTIR DE AQUÍ, PARA TI
            </Label>
          </g>
        )}

        <Label x={X0} y={H - 8} size={9} color="var(--ink-5)" mono>
          UNA CASILLA = UN DÍA · {totalDias} DÍAS DE {anio}
        </Label>
      </ChartFrame>

      <div className="fs-keys" style={{ marginTop: 14 }}>
        {leyenda.map(g => (
          <span key={g.key} className="fs-key" style={{ cursor: 'default' }}>
            <span
              className="fs-key-swatch"
              style={{
                background: g.color,
                boxShadow: g.key === 'tuyo' ? 'inset 0 0 0 1px var(--ink-5)' : undefined,
              }}
            />
            {g.label}
            <span className="fs-key-v">{g.n} días</span>
          </span>
        ))}
      </div>
    </Figure>
  );
}

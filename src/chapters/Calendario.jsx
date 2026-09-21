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

/* Los tres grupos COFOG conservan el código de color del río. La parte sin
   relleno no representa «tiempo libre»: es la proporción equivalente a renta
   neta cuando la cuña se proyecta, de forma puramente aritmética, sobre 365 o
   366 días. */
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
 * La figura no afirma que una parte real del año se trabaje para un destinatario
 * y otra para otro. Convierte una proporción —cuña / coste laboral— en días
 * equivalentes. La fecha de corte sólo ayuda a leer esa proporción; no describe
 * el calendario de cobros, devengo ni pago de los tributos.
 */
export default function Calendario() {
  const { anio, nomina, pagas } = useFiscal();
  const [tip, setTip] = useState(null);

  const cuna = Math.max(0, nomina.costeLab - nomina.salarioNeto);
  const parteCuna = nomina.costeLab > 0 ? cuna / nomina.costeLab : 0;

  const { dias, totalDias, diaLibre, fechaLibre, tramos } = useMemo(() => {
    const lens = DIAS_MES(anio);
    const total = lens.reduce((a, b) => a + b, 0);
    const diasEquivalentesCuna = Math.round(parteCuna * total);

    /* Los días equivalentes se distribuyen entre los tres grupos con las
       proporciones COFOG. Es una segunda transformación analítica, no una
       trazabilidad entre un ingreso concreto y una partida presupuestaria. */
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
        ? diasEquivalentesCuna - repartidos
        : Math.round(g.parte * diasEquivalentesCuna);
      acc.push({ ...g, n });
      return acc;
    }, []);

    const destinoDe = indice => {
      if (indice >= diasEquivalentesCuna) return { key: 'tuyo', etiqueta: 'Equivalente a renta neta' };
      let acc = 0;
      for (const c of cortes) {
        acc += c.n;
        if (indice < acc) return { key: c.key, etiqueta: c.label };
      }
      return { key: 'tuyo', etiqueta: 'Equivalente a renta neta' };
    };

    const out = lens.flatMap((largo, m) =>
      Array.from({ length: largo }, (_, i) => ({ mes: m, dia: i + 1 }))
    ).map((d, indice) => ({ ...d, indice, ...destinoDe(indice) }));

    const libre = diasEquivalentesCuna; // índice 0-based del corte convencional
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
    { key: 'tuyo', label: 'Equivalente a renta neta', n: totalDias - diaLibre, color: COLORES.tuyo },
  ];

  const mostrar = d =>
    setTip({
      vx: X0 + (d.dia - 1) * PASO + CELDA / 2,
      vy: Y0 + d.mes * PASO,
      title: `${d.dia} de ${MESES[d.mes].toLowerCase()}`,
      sub: `Día ${d.indice + 1} de ${totalDias}`,
      rows: [
        ['Clasificación analítica', d.etiqueta,
          d.key === 'tuyo' ? 'var(--ink)' : COLORES[d.key]],
        ['Tu cuña fiscal', pct(parteCuna * 100)],
      ],
    });

  return (
    <Figure
      id="27"
      title={`La cuña fiscal equivale a ${diaLibre} de los ${totalDias} días de ${anio}`}
      sub={`Conversión proporcional: cuña fiscal × días del año · la fecha de corte convencional es el ${fechaLibre.dia} de ${MESES[fechaLibre.mes].toLowerCase()}`}
      legend={`Casilla llena = un día equivalente a la cuña fiscal · casilla vacía = un día equivalente a renta neta · los colores aplican el reparto COFOG de ${GASTO_COFOG.anio}`}
      source={
        <>
          Fuente ·{' '}
          <a href="https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/Contabilidad/ContabilidadNacional/Publicaciones/paginas/iacogof.aspx" target="_blank" rel="noreferrer noopener">
            IGAE · gasto de las AAPP por funciones (COFOG)
          </a>
          {' · '}
          <a href="https://ec.europa.eu/eurostat/cache/metadata/en/gov_10a_exp_esms.htm" target="_blank" rel="noreferrer noopener">
            Eurostat · metodología COFOG/SEC 2010
          </a>
          {' · cálculo propio'}
        </>
      }
      note="Es una equivalencia temporal, no un calendario fiscal oficial. No indica cuándo se devengan o pagan los impuestos, cuándo se percibe el salario ni a qué partida se destina un ingreso concreto. La fecha depende únicamente de ordenar desde el 1 de enero una proporción que, en la realidad, se genera durante todo el año."
      summary={`La cuña representa ${diaLibre} días equivalentes y la renta neta ${totalDias - diaLibre}. El corte convencional cae el ${fechaLibre.dia} de ${MESES[fechaLibre.mes].toLowerCase()}.`}
    >
      <div className="fs-calendar-method" aria-label="Método de la equivalencia temporal">
        <p>
          <span>1 · Proporción</span>
          Se divide la suma de IRPF y cotizaciones entre el coste laboral total.
        </p>
        <p>
          <span>2 · Conversión</span>
          Esa proporción se multiplica por {totalDias}; el resultado son {diaLibre} días equivalentes.
        </p>
        <p>
          <span>3 · Clasificación</span>
          Los días llenos se distribuyen según el gasto agregado COFOG, sin atribuir impuestos concretos a partidas concretas.
        </p>
      </div>

      <div className="fs-readout" style={{ marginBottom: 18 }}>
        <span>
          <span className="fs-readout-k">Cuña expresada en días</span>
          <span className="fs-readout-v">{diaLibre} días</span>
        </span>
        <span>
          <span className="fs-readout-k">Corte convencional</span>
          <span className="fs-readout-v fs-signal">
            {fechaLibre.dia} de {MESES[fechaLibre.mes].toLowerCase()}
          </span>
        </span>
        <span>
          <span className="fs-readout-k">Importe de la cuña</span>
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
              {fechaLibre.dia} {MESES[fechaLibre.mes].slice(0, 3).toUpperCase()} · CORTE CONVENCIONAL
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

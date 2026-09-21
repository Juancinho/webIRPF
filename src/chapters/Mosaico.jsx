import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { DISTRIBUCION_SALARIAL, calcularNomina } from '../engine/irpf';
import { salarioEnPercentil } from './distribucionUtil';
import Figure from '../figures/Figure';
import ChartFrame from '../figures/ChartFrame';
import { Label } from '../figures/marks';
import { linear, round } from '../figures/scale';
import { eur, pct } from '../utils/format';

const W = 880;
const H = 476;
const X0 = 54;
const X1 = W - 18;
const Y0 = 34;
const Y1 = H - 98;
const BANDAS = 20;       // veinte tramos de cinco percentiles

/**
 * FIG. 20 — QUIÉN PAGA EL TOTAL.
 *
 * Un mosaico, no un gráfico de barras: el **ancho** de cada columna es la
 * parte de toda la masa salarial que cobra ese tramo de asalariados y la
 * **altura** es el tipo efectivo que soporta. Como recaudación = masa × tipo,
 * el **área de cada bloque es exactamente lo que ese tramo aporta al total**.
 *
 * Es la única forma de responder a la pregunta que todo el mundo discute sin
 * datos —¿quién sostiene la recaudación?— sin tener que elegir entre mirar
 * cuánta gente hay o cuánto paga cada uno: aquí se ven las dos cosas y su
 * producto a la vez.
 */
export default function Mosaico() {
  const { anio, opts, bruto, percentil } = useFiscal();
  const [hover, setHover] = useState(null);
  const [tip, setTip] = useState(null);

  const dist = DISTRIBUCION_SALARIAL[anio];

  const { bandas } = useMemo(() => {
    const paso = 100 / BANDAS;
    const crudas = Array.from({ length: BANDAS }, (_, i) => {
      const p0 = i * paso;
      const p1 = (i + 1) * paso;
      const salario = salarioEnPercentil(p0 + paso / 2, dist);
      const n = calcularNomina(salario, anio, opts);
      const pagado = n.irpfFinal + n.cotTra;
      return {
        i,
        p0,
        p1,
        salario,
        pagado,
        tipo: salario > 0 ? pagado / salario : 0,
        // cada banda tiene el mismo número de asalariados: una veinteava parte
        masaTramo: salario,
        recaudaTramo: pagado,
      };
    });
    const masaTotal = crudas.reduce((a, b) => a + b.masaTramo, 0);
    const recTotal = crudas.reduce((a, b) => a + b.recaudaTramo, 0);
    return {
      bandas: crudas.map(b => ({
        ...b,
        parteMasa: b.masaTramo / masaTotal,
        parteRec: b.recaudaTramo / recTotal,
      })),
    };
  }, [dist, anio, opts]);

  const maxTipo = Math.max(...bandas.map(b => b.tipo));
  const techo = Math.max(0.3, Math.ceil(maxTipo * 20) / 20);
  const y = linear([0, techo], [Y1, Y0]);

  /* Los anchos se acumulan: el eje horizontal es la masa salarial, no la
     gente, porque sólo así el área es recaudación. */
  const conX = bandas.reduce((acc, b) => {
    const x0 = acc.length ? acc[acc.length - 1].x1 : X0;
    const ancho = b.parteMasa * (X1 - X0);
    acc.push({ ...b, x0, x1: x0 + ancho });
    return acc;
  }, []);

  const miBanda = conX.find(b => percentil >= b.p0 && percentil < b.p1) || conX[conX.length - 1];

  /* ¿Cuánta recaudación sale de la mitad que más cobra? */
  const mitadAlta = conX.filter(b => b.p0 >= 50).reduce((a, b) => a + b.parteRec, 0);
  const mitadBaja = 1 - mitadAlta;
  const corte = (conX.find(b => b.p0 === 50) || conX[0]).x0;

  const activo = hover !== null ? conX[hover] : miBanda;

  return (
    <Figure
      id="25"
      title={`La mitad que más cobra aporta el ${pct(mitadAlta * 100, 0)} de todo lo que se recauda sobre las nóminas`}
      sub={`${anio} · ancho de cada columna = la parte de la masa salarial que cobra ese tramo · altura = su tipo efectivo · área = lo que aporta al total`}
      legend="Veinte tramos de cinco percentiles · como recaudación = masa salarial × tipo efectivo, el área de cada bloque es exactamente su aportación · tu tramo va en petróleo"
      source="Fuente · INE (EAES) para la distribución · cálculo propio para los tipos"
      note="Incluye IRPF y cotización del trabajador sobre el salario bruto, con el perfil estándar aplicado a todos los tramos: no modeliza hijos, comunidad ni situaciones particulares de cada asalariado. La masa salarial se aproxima con el salario mediano de cada tramo. El último tramo es el más frágil: el INE no publica P95 ni P99, así que su anchura descansa sobre la extrapolación de la cola alta."
      summary={conX.map(b => `Percentil ${Math.round(b.p0)}-${Math.round(b.p1)}: tipo ${pct(b.tipo * 100)}, aporta ${pct(b.parteRec * 100)}`).join('. ')}
    >
      <div className="fs-readout" style={{ marginBottom: 16 }}>
        <span>
          <span className="fs-readout-k">Tu tramo</span>
          <span className="fs-readout-v fs-signal">
            percentil {Math.round(miBanda.p0)}–{Math.round(miBanda.p1)}
          </span>
        </span>
        <span>
          <span className="fs-readout-k">Su tipo efectivo</span>
          <span className="fs-readout-v">{pct(miBanda.tipo * 100)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Aporta del total</span>
          <span className="fs-readout-v">{pct(miBanda.parteRec * 100)}</span>
        </span>
      </div>

      <ChartFrame viewBox={`0 0 ${W} ${H}`} tip={tip} scroll minWidth={700} label="Quién sostiene la recaudación">
        {/* rejilla de tipos */}
        {[0, 0.1, 0.2, 0.3, 0.4, 0.5].filter(v => v <= techo).map(v => (
          <g key={v}>
            <line x1={X0} y1={round(y(v))} x2={X1} y2={round(y(v))} stroke="var(--ink-7)" strokeWidth={0.6} />
            <Label x={X0 - 8} y={round(y(v)) + 3} size={9} color="var(--ink-5)" anchor="end" mono>
              {pct(v * 100, 0)}
            </Label>
          </g>
        ))}

        {conX.map((b, i) => {
          const esMio = b === miBanda;
          const on = hover === i;
          const dim = hover !== null && !on;
          return (
            <g
              key={b.i}
              onMouseEnter={() => {
                setHover(i);
                setTip({
                  vx: (b.x0 + b.x1) / 2,
                  vy: y(b.tipo),
                  title: pct(b.tipo * 100),
                  sub: `Percentil ${Math.round(b.p0)}–${Math.round(b.p1)}`,
                  rows: [
                    ['Salario del tramo', eur(b.salario), 'var(--signal)'],
                    ['Paga al año', eur(b.pagado)],
                    ['De la masa salarial', pct(b.parteMasa * 100)],
                    ['De la recaudación', pct(b.parteRec * 100)],
                  ],
                });
              }}
              onMouseLeave={() => { setHover(null); setTip(null); }}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={round(b.x0)}
                y={round(y(b.tipo))}
                width={round(Math.max(1, b.x1 - b.x0 - 1.5))}
                height={round(Y1 - y(b.tipo))}
                fill={esMio ? 'var(--signal)' : 'var(--ink-3)'}
                opacity={dim ? 0.3 : on ? 1 : esMio ? 1 : 0.82}
              />
              {/* la aportación, escrita sólo donde cabe */}
              {b.x1 - b.x0 > 26 && (
                <Label
                  x={round((b.x0 + b.x1) / 2)}
                  y={round(y(b.tipo)) - 6}
                  size={9}
                  weight={esMio ? 800 : 600}
                  color={esMio ? 'var(--signal)' : 'var(--ink-4)'}
                  anchor="middle"
                  mono
                >
                  {pct(b.parteRec * 100, 0)}
                </Label>
              )}
            </g>
          );
        })}

        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="var(--ink)" strokeWidth={1} />

        {/* eje: los percentiles, colocados donde caen sobre la masa salarial */}
        {conX.filter((_, i) => i % 4 === 0).concat([conX[conX.length - 1]]).map(b => (
          <g key={`e${b.i}`}>
            <line x1={round(b.x0)} y1={Y1} x2={round(b.x0)} y2={Y1 + 5} stroke="var(--ink-5)" strokeWidth={0.7} />
            <Label x={round(b.x0)} y={Y1 + 17} size={9} color="var(--ink-4)" anchor="middle" mono>
              P{Math.round(b.p0)}
            </Label>
          </g>
        ))}

        {[
          { x0: X0, x1: corte, parte: mitadBaja, texto: 'LA MITAD QUE MENOS COBRA' },
          { x0: corte, x1: X1, parte: mitadAlta, texto: 'LA MITAD QUE MÁS COBRA' },
        ].map(m => (
          <g key={m.texto}>
            <rect
              x={round(m.x0)}
              y={Y1 + 32}
              width={round(Math.max(2, m.x1 - m.x0 - 2))}
              height={7}
              fill={m.parte === mitadAlta ? 'var(--ink-2)' : 'var(--ink-5)'}
            />
            <Label
              x={round((m.x0 + m.x1) / 2)}
              y={Y1 + 54}
              size={9.5}
              weight={800}
              color="var(--ink-2)"
              anchor="middle"
              mono
            >
              {m.texto} · APORTA {pct(m.parte * 100, 0)}
            </Label>
          </g>
        ))}

        <Label x={X0} y={Y1 + 76} size={9} color="var(--ink-5)" mono>
          ← MENOS SUELDO · EL ANCHO ES LA PARTE DE LA MASA SALARIAL QUE COBRA CADA TRAMO · MÁS SUELDO →
        </Label>
        <Label x={X0 - 8} y={Y0 - 14} size={9} color="var(--ink-5)" mono>
          TIPO EFECTIVO
        </Label>

        {hover !== null && (
          <Label x={X1} y={Y0 - 14} size={10} weight={700} color="var(--ink)" anchor="end">
            Percentil {Math.round(activo.p0)}–{Math.round(activo.p1)} · {eur(activo.salario)} · aporta{' '}
            {pct(activo.parteRec * 100)}
          </Label>
        )}
      </ChartFrame>

      <p className="fs-note" style={{ marginTop: 14, maxWidth: '74ch' }}>
        Con tu sueldo de <strong>{eur(bruto)}</strong> estás en el percentil{' '}
        <strong>{Math.round(percentil)}</strong>. Los tramos altos tienen las columnas más anchas
        —cobran más masa salarial— y también las más altas, así que su área manda; pero la suma de
        la mitad baja no es despreciable: son columnas bajas repetidas veinte veces.
      </p>
    </Figure>
  );
}

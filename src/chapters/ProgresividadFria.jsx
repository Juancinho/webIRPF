import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { ANIOS, INFLACION_A_2026, calcularNomina, inflacionAcumulada } from '../engine/irpf';
import Figure from '../figures/Figure';
import ChartFrame from '../figures/ChartFrame';
import { Label } from '../figures/marks';
import { linear, polyline, round } from '../figures/scale';
import { eur, pct, sign } from '../utils/format';

const W = 880;
const H = 420;
const X0 = 26;
const X1 = W - 150;
const Y0 = 34;
const Y1 = 250;
const R0 = 300;
const R1 = 386;

/**
 * PROGRESIVIDAD EN FRÍO.
 * The premise is generous to the tax system: your salary rises every single
 * year by exactly the CPI, so purchasing power does not change. The figure
 * compares the enacted nominal parameters with a fully indexed benchmark.
 */
export default function ProgresividadFria() {
  const { bruto, anio, opts } = useFiscal();
  const [base, setBase] = useState(2012);
  const [hover, setHover] = useState(null);
  const [tip, setTip] = useState(null);

  const bruto2026 = Math.round(bruto * (INFLACION_A_2026[anio] || 1));
  const salarioBase = bruto2026 / INFLACION_A_2026[base];

  const serie = useMemo(() => {
    const years = ANIOS.filter(a => a >= base);
    const nBase = calcularNomina(salarioBase, base, opts);
    return years.map(a => {
      const f = inflacionAcumulada(base, a);
      const nominal = salarioBase * f;
      const n = calcularNomina(nominal, a, opts);
      return {
        anio: a,
        nominal,
        netoReal: n.salarioNeto / f,
        netoDeflactado: nBase.salarioNeto,
        efectivo: n.tipoEfectivoTotal * 100,
        efectivoBase: nBase.tipoEfectivoTotal * 100,
      };
    });
  }, [base, salarioBase, opts]);

  const ultimo = serie[serie.length - 1];
  const perdida = ultimo.netoReal - ultimo.netoDeflactado;
  const acumulada = serie.reduce((a, s) => a + (s.netoReal - s.netoDeflactado), 0);

  const netos = serie.flatMap(s => [s.netoReal, s.netoDeflactado]);
  const lo = Math.min(...netos);
  const hi = Math.max(...netos);
  const pad = Math.max(120, (hi - lo) * 0.45);
  const x = linear([base, 2026], [X0, X1]);
  const y = linear([lo - pad, hi + pad * 0.3], [Y1, Y0]);

  const tipos = serie.flatMap(s => [s.efectivo, s.efectivoBase]);
  const yr = linear([Math.min(...tipos) - 1.5, Math.max(...tipos) + 1.5], [R1, R0]);

  const activo = hover ? serie.find(s => s.anio === hover) : ultimo;

  const areaGap = [
    ...serie.map(s => [x(s.anio), y(s.netoDeflactado)]),
    ...[...serie].reverse().map(s => [x(s.anio), y(s.netoReal)]),
  ];

  return (
    <Figure
      id="14"
      title={
        perdida < -1
          ? `Sin indexación completa, el neto real queda ${eur(Math.abs(perdida))} por debajo del punto de partida de ${base}`
          : `Con el sueldo subiendo cada año exactamente con el IPC, tu neto real apenas se mueve desde ${base}`
      }
      sub={`Supuesto: tu salario crece cada año justo lo que el IPC, así que tu poder adquisitivo nunca cambia · euros constantes de ${base} · perfil seleccionado`}
      legend="Línea continua = resultado con las reglas aprobadas en cada ejercicio · línea discontinua = referencia con todos los umbrales monetarios indexados al IPC"
      source="Fuente · cálculo propio sobre parámetros BOE · IPC diciembre INE"
      note="La comparación mantiene constantes el poder adquisitivo y el perfil. No atribuye intención ni valora el resultado: cuantifica únicamente la diferencia entre las reglas vigentes y una referencia de indexación completa."
      summary={`Entre ${base} y 2026 el neto real pasa de ${eur(serie[0].netoReal)} a ${eur(ultimo.netoReal)} manteniendo el poder adquisitivo.`}
    >
      <div className="fs-deflation-note">
        <span className="fs-stamp">Concepto · qué significa «deflactar el IRPF»</span>
        <p className="fs-body">
          <strong>Deflactar una cifra</strong> significa expresarla en euros de un mismo año para
          eliminar el efecto de los precios. En política tributaria, <strong>deflactar o indexar la
          tarifa</strong> significa actualizar con la inflación los importes nominales que delimitan
          tramos, mínimos, reducciones y deducciones. No cambia los tipos legales: evita que una
          subida salarial que sólo compensa el IPC desplace por sí sola al contribuyente hacia
          umbrales fiscales más altos en términos reales.
        </p>
        <p className="fs-note">
          La línea de referencia conserva, en euros constantes de {base}, el resultado fiscal del
          año inicial. La distancia respecto a la línea observada mide el efecto conjunto de no
          indexar todos los parámetros y de las reformas aprobadas después; no permite asignar la
          diferencia a una única norma sin descomponerla.
        </p>
      </div>

      <div className="fs-readout">
        <span>
          <span className="fs-readout-k">Año {activo.anio}</span>
          <span className="fs-readout-v">{eur(activo.nominal)} brutos</span>
        </span>
        <span>
          <span className="fs-readout-k">Neto real</span>
          <span className="fs-readout-v">{eur(activo.netoReal)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Referencia indexada</span>
          <span className="fs-readout-v fs-muted">{eur(activo.netoDeflactado)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Diferencia</span>
          <span className="fs-readout-v fs-signal">{sign(activo.netoReal - activo.netoDeflactado)}</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <label className="fs-label" htmlFor="pf-base">Año de partida</label>
        <select id="pf-base" className="fs-select" value={base} onChange={e => setBase(+e.target.value)}>
          {ANIOS.filter(a => a <= 2024).map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <ChartFrame viewBox={`0 0 ${W} ${H}`} tip={tip} scroll label="Progresividad en frío">
        {/* the gap is the point of the figure */}
        <path d={polyline(areaGap) + ' Z'} fill="var(--signal)" opacity={0.1} />

        <path
          d={polyline(serie.map(s => [x(s.anio), y(s.netoDeflactado)]))}
          fill="none"
          stroke="var(--ink-4)"
          strokeWidth={1.2}
          strokeDasharray="4 3"
        />
        <path
          d={polyline(serie.map(s => [x(s.anio), y(s.netoReal)]))}
          fill="none"
          stroke="var(--ink)"
          strokeWidth={1.8}
          strokeLinejoin="round"
        />

        {serie.map(s => (
          <g key={s.anio}>
            <circle
              cx={round(x(s.anio))}
              cy={round(y(s.netoReal))}
              r={s.anio === activo.anio ? 4.4 : 2.4}
              fill={s.anio === activo.anio ? 'var(--signal)' : 'var(--ink)'}
            />
            <circle cx={round(x(s.anio))} cy={round(yr(s.efectivo))} r={s.anio === activo.anio ? 4 : 2.2} fill={s.anio === activo.anio ? 'var(--signal)' : 'var(--counter)'} />
            <rect
              className="fs-hit"
              x={round(x(s.anio)) - 12}
              y={Y0 - 14}
              width={24}
              height={R1 - Y0 + 20}
              onMouseEnter={() => {
                setHover(s.anio);
                setTip({
                  vx: x(s.anio),
                  vy: y(s.netoReal),
                  title: String(s.anio),
                  sub: 'Euros constantes de ' + base,
                  rows: [
                    ['Bruto equivalente', eur(s.nominal)],
                    ['Neto real', eur(s.netoReal), 'var(--ink)'],
                    ['Referencia indexada', eur(s.netoDeflactado), 'var(--ink-4)'],
                    ['Diferencia', sign(s.netoReal - s.netoDeflactado), 'var(--signal)'],
                    ['Carga total', pct(s.efectivo), 'var(--counter)'],
                  ],
                });
              }}
              onMouseLeave={() => { setHover(null); setTip(null); }}
            >
              <title>{`${s.anio} — neto real ${eur(s.netoReal)}, referencia indexada ${eur(s.netoDeflactado)}`}</title>
            </rect>
          </g>
        ))}

        <Label x={X1 + 10} y={round(y(ultimo.netoDeflactado)) + 3} size={9} color="var(--ink-4)" mono>
          REFERENCIA INDEXADA
        </Label>
        <Label x={X1 + 10} y={round(y(ultimo.netoDeflactado)) + 16} size={11} weight={700} color="var(--ink-4)">
          {eur(ultimo.netoDeflactado)}
        </Label>
        <Label x={X1 + 10} y={round(y(ultimo.netoReal)) + 3} size={9} color="var(--ink)" mono>
          LO QUE COBRAS
        </Label>
        <Label x={X1 + 10} y={round(y(ultimo.netoReal)) + 16} size={11} weight={800} color="var(--ink)">
          {eur(ultimo.netoReal)}
        </Label>

        <line x1={X0} y1={Y1} x2={X1} y2={Y1} stroke="var(--rule)" strokeWidth={0.8} />

        {/* second track: the effective rate creeping up */}
        <path
          d={polyline(serie.map(s => [x(s.anio), yr(s.efectivo)]))}
          fill="none"
          stroke="var(--counter)"
          strokeWidth={1.4}
        />
        <line x1={X0} y1={round(yr(serie[0].efectivoBase))} x2={X1} y2={round(yr(serie[0].efectivoBase))} stroke="var(--ink-5)" strokeWidth={0.9} strokeDasharray="4 3" />
        <Label x={X1 + 10} y={round(yr(ultimo.efectivo)) + 3} size={9} color="var(--counter)" mono>
          TIPO EFECTIVO
        </Label>
        <Label x={X1 + 10} y={round(yr(ultimo.efectivo)) + 16} size={11} weight={700} color="var(--counter)">
          {pct(ultimo.efectivo)}
        </Label>
        <Label x={X0} y={R0 - 12} size={9} color="var(--ink-5)" mono>
          CARGA TOTAL SOBRE EL BRUTO · {pct(serie[0].efectivoBase)} EN {base}
        </Label>

        {serie.map((s, i) => {
          const cada = Math.max(1, Math.round(serie.length / 8));
          if (i % cada !== 0 && i !== serie.length - 1) return null;
          return (
            <Label key={s.anio} x={round(x(s.anio))} y={R1 + 22} size={9.5} color="var(--ink-4)" anchor="middle" mono>
              {s.anio}
            </Label>
          );
        })}
      </ChartFrame>

      <p className="fs-body" style={{ marginTop: 18 }}>
        Sumando las diferencias anuales desde {base}, la separación acumulada es de{' '}
        <strong>{eur(Math.abs(acumulada))}</strong> en euros constantes de {base}. Es una magnitud
        contrafactual: compara el sistema aplicado cada año con una indexación integral, sin afirmar
        que ese importe constituya una deuda, una cuota adicional concreta o el efecto de una sola reforma.
      </p>
    </Figure>
  );
}

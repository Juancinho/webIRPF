import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { ANIOS, INFLACION_A_2026, calcularNomina } from '../engine/irpf';
import Figure from '../figures/Figure';
import ChartFrame from '../figures/ChartFrame';
import { Label } from '../figures/marks';
import { round } from '../figures/scale';
import { eur, sign } from '../utils/format';

const MONEDA = 250;      // euros de 2026 por ficha
const R = 4.2;
const PASO = 10.4;
const GRUPO = 5;         // las fichas se agrupan de cinco en cinco: así se cuentan
const HUECO_GRUPO = 5;
const W = 880;
const FILA = 26;
const X0 = 62;
const XC = 82;

/**
 * FIG. 11 — LO QUE PAGAS, CONTADO EN FICHAS.
 *
 * La figura anterior mide lo que te queda; esta mide lo que sale. Y lo mide
 * contando, que es la única forma de comparar dos años sin tener que fiarse de
 * la longitud de una barra: cada ficha son 250 € de 2026, las fichas se
 * agrupan de cinco en cinco y el color dice a qué caja va cada una.
 *
 * Sólo cuenta lo que sale de tu nómina —IRPF y cotización del trabajador—,
 * no la cotización de la empresa: es lo que el lector reconoce en su recibo.
 */
export default function Monedas({ bruto2026, elegirAnio }) {
  const { anio, opts } = useFiscal();
  const [hover, setHover] = useState(null);
  const [tip, setTip] = useState(null);

  const serie = useMemo(
    () =>
      ANIOS.map(a => {
        const inf = INFLACION_A_2026[a];
        const n = calcularNomina(bruto2026 / inf, a, opts);
        const irpf = n.irpfFinal * inf;
        const ss = n.cotTra * inf;
        return { anio: a, irpf, ss, total: irpf + ss };
      }),
    [bruto2026, opts]
  );

  const hoy = serie[serie.length - 1];
  const menor = serie.reduce((a, c) => (c.total < a.total ? c : a), serie[0]);
  const H = serie.length * FILA + 78;

  /* La posición de la ficha número i, con su hueco cada cinco. */
  const px = i => XC + i * PASO + Math.floor(i / GRUPO) * HUECO_GRUPO;

  return (
    <Figure
      id="11"
      title={
        hoy.total > menor.total
          ? `Con el mismo sueldo real, hoy pagas ${eur(hoy.total - menor.total)} más que en ${menor.anio}`
          : `Con el mismo sueldo real, hoy pagas menos que en ningún otro año`
      }
      sub={`${eur(bruto2026)} constantes de 2026 · una ficha = ${eur(MONEDA)} · sólo lo que sale de tu nómina: IRPF y cotización del trabajador`}
      legend={`Fichas oscuras = IRPF · fichas petróleo = cotización del trabajador · van de cinco en cinco para poder contarlas · cada ficha son ${eur(MONEDA)} de 2026`}
      source="Fuente · cálculo propio · IPC INE"
      note="No incluye la cotización que paga la empresa, que no aparece en tu recibo aunque forme parte del coste de tu puesto; esa parte se mide en el capítulo 05. El resto de una ficha se redondea, así que la fila puede quedarse a menos de 250 € del total exacto."
      summary={serie.map(s => `${s.anio}: ${eur(s.total)}`).join('; ')}
    >
      <ChartFrame viewBox={`0 0 ${W} ${H}`} tip={tip} scroll minWidth={700} label="Lo que pagas cada año, contado en fichas">
        <Label x={XC} y={22} size={9} color="var(--ink-5)" mono>
          UNA FICHA = {eur(MONEDA)} DE 2026
        </Label>
        <Label x={W - 96} y={22} size={8.5} color="var(--ink-5)" anchor="end" mono>
          TOTAL
        </Label>
        <Label x={W - 2} y={22} size={8.5} color="var(--ink-5)" anchor="end" mono>
          VS. HOY
        </Label>

        {serie.map((s, fila) => {
          const y = 44 + fila * FILA;
          const nIrpf = Math.round(s.irpf / MONEDA);
          const nSs = Math.round(s.ss / MONEDA);
          const esSel = s.anio === anio;
          const esHover = hover === s.anio;
          const apagado = hover && !esHover && !esSel;
          const dif = s.total - hoy.total;

          return (
            <g key={s.anio} className="fs-group" opacity={apagado ? 0.42 : 1}>
              <text
                x={X0}
                y={y + 3.5}
                fontSize={10.5}
                fontWeight={esSel ? 800 : 600}
                textAnchor="end"
                fill={esSel ? 'var(--signal)' : 'var(--ink-4)'}
                className="fs-t-stamp"
              >
                {s.anio}
              </text>

              {Array.from({ length: nIrpf + nSs }, (_, i) => (
                <circle
                  key={i}
                  cx={round(px(i))}
                  cy={y}
                  r={R}
                  fill={i < nIrpf ? 'var(--ink)' : 'var(--signal)'}
                  opacity={esSel || !hover ? 1 : 0.9}
                />
              ))}

              <text
                x={W - 96}
                y={y + 3.5}
                fontSize={11.5}
                fontWeight={esSel ? 800 : 600}
                textAnchor="end"
                fill={esSel ? 'var(--signal)' : 'var(--ink-2)'}
                className="num"
              >
                {eur(s.total)}
              </text>
              {fila < serie.length - 1 && (
                <text
                  x={W - 2}
                  y={y + 3.5}
                  fontSize={10.5}
                  fontWeight={600}
                  textAnchor="end"
                  fill={dif > 0 ? 'var(--counter)' : 'var(--ink-4)'}
                  className="num"
                >
                  {sign(dif)}
                </text>
              )}

              <rect
                className="fs-hit"
                x={0}
                y={y - FILA / 2}
                width={W}
                height={FILA}
                onMouseEnter={() => {
                  setHover(s.anio);
                  setTip({
                    vx: px(nIrpf + nSs),
                    vy: y,
                    title: eur(s.total),
                    sub: `Lo que salió de tu nómina en ${s.anio}`,
                    rows: [
                      ['IRPF', eur(s.irpf), 'var(--ink)'],
                      ['Cotización', eur(s.ss), 'var(--signal)'],
                      ['Fichas', `${nIrpf + nSs} × ${eur(MONEDA)}`],
                    ],
                  });
                }}
                onMouseLeave={() => { setHover(null); setTip(null); }}
                onClick={() => elegirAnio(s.anio)}
                style={{ cursor: 'pointer' }}
              >
                <title>{`${s.anio} — ${eur(s.total)} entre IRPF y cotización`}</title>
              </rect>
            </g>
          );
        })}

        <Label x={XC} y={H - 26} size={9} color="var(--ink-5)" mono>
          ← CADA HUECO SEPARA CINCO FICHAS · {eur(MONEDA * 5)}
        </Label>
      </ChartFrame>

      <div className="fs-keys" style={{ marginTop: 14 }}>
        <span className="fs-key" style={{ cursor: 'default' }}>
          <span className="fs-key-swatch" style={{ background: 'var(--ink)', borderRadius: '50%' }} />
          IRPF
          <span className="fs-key-v">{eur(hoy.irpf)}</span>
        </span>
        <span className="fs-key" style={{ cursor: 'default' }}>
          <span className="fs-key-swatch" style={{ background: 'var(--signal)', borderRadius: '50%' }} />
          Cotización del trabajador
          <span className="fs-key-v">{eur(hoy.ss)}</span>
        </span>
      </div>
    </Figure>
  );
}

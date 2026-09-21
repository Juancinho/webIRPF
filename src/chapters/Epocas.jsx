import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { ANIOS, INFLACION_A_2026, calcularNomina, calcularTipoMarginal } from '../engine/irpf';
import Figure from '../figures/Figure';
import ZoomSvg from '../figures/ZoomSvg';
import { Label, TickStrip } from '../figures/marks';
import { linear } from '../figures/scale';
import { eur, pct, sign } from '../utils/format';

/**
 * ¿En qué época estabas mejor?
 * The same purchasing power run through fifteen tax systems, ranked, plus a
 * head-to-head comparator for any two years. Clicking a year anywhere here
 * moves the whole publication to it.
 */
export default function Epocas({ bruto2026 }) {
  const { anio, opts, setAnio } = useFiscal();

  const serie = useMemo(
    () =>
      ANIOS.map(a => {
        const inf = INFLACION_A_2026[a];
        const nominal = bruto2026 / inf;
        const n = calcularNomina(nominal, a, opts);
        const m = calcularTipoMarginal(nominal, a, opts);
        return {
          anio: a,
          nominal,
          neto: n.salarioNeto * inf,
          efectivo: n.tipoEfectivoIRPF * 100,
          efectivoTotal: n.tipoEfectivoTotal * 100,
          cuna: n.cunaFiscal * 100,
          marginal: m.tipoMarginalTotal * 100,
          irpf: n.irpfFinal * inf,
          ss: n.cotTra * inf,
        };
      }),
    [bruto2026, opts]
  );

  const porNeto = [...serie].sort((a, b) => b.neto - a.neto);
  const mejor = porNeto[0];
  const peor = porNeto[porNeto.length - 1];

  return (
    <>
      <Ranking serie={serie} orden={porNeto} anio={anio} setAnio={setAnio} bruto2026={bruto2026} mejor={mejor} peor={peor} />
      <Comparador serie={serie} anioActual={anio} bruto2026={bruto2026} setAnio={setAnio} />
    </>
  );
}

/* ── ranked years ─────────────────────────────────────────────────────────── */
function Ranking({ serie, orden, anio, setAnio, bruto2026, mejor, peor }) {
  const [hover, setHover] = useState(null);

  const W = 880;
  const rowH = 30;
  const H = orden.length * rowH + 58;
  const X0 = 104;
  const X1 = W - 232;

  const lo = peor.neto;
  const hi = mejor.neto;
  const span = Math.max(1, hi - lo);
  const x = linear([lo - span * 0.35, hi + span * 0.08], [X0, X1]);

  const activo = serie.find(s => s.anio === (hover ?? anio)) || serie[serie.length - 1];

  return (
    <Figure
      id="11"
      title={`Con este poder adquisitivo, tu mejor año fue ${mejor.anio} y el peor ${peor.anio}`}
      sub={`${eur(bruto2026)} constantes de 2026 · años ordenados por lo que te habrían dejado neto en euros de hoy · pulsa un año para llevar toda la publicación a él`}
      legend="Una marca = 100 € reales de neto · el año en curso va en petróleo"
      source="Fuente · cálculo propio · IPC INE"
      summary={orden.map((s, i) => `${i + 1}. ${s.anio}: ${eur(s.neto)}`).join('; ')}
    >
      <div className="fs-readout">
        <span>
          <span className="fs-readout-k">Año {activo.anio}</span>
          <span className="fs-readout-v">{eur(activo.neto)} netos reales</span>
        </span>
        <span>
          <span className="fs-readout-k">IRPF efectivo</span>
          <span className="fs-readout-v">{pct(activo.efectivo)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Cuña fiscal</span>
          <span className="fs-readout-v">{pct(activo.cuna)}</span>
        </span>
        <span>
          <span className="fs-readout-k">Frente a {mejor.anio}</span>
          <span className="fs-readout-v fs-signal">{sign(activo.neto - mejor.neto)}</span>
        </span>
      </div>

      <ZoomSvg viewBox={`0 0 ${W} ${H}`} label="Años ordenados por neto real">
        {orden.map((s, i) => {
          const y = 22 + i * rowH;
          const esSel = s.anio === anio;
          const esHover = hover === s.anio;
          const ancho = Math.max(0, x(s.neto) - X0);
          const color = esSel ? 'var(--signal)' : esHover ? 'var(--ink)' : 'var(--ink-3)';
          return (
            <g key={s.anio} opacity={hover && !esHover && !esSel ? 0.45 : 1}>
              <Label x={X0 - 14} y={y + 4} size={11} weight={esSel ? 800 : 600} color={color} anchor="end" mono>
                {s.anio}
              </Label>
              <Label x={X0 - 62} y={y + 4} size={9} color="var(--ink-5)" anchor="end" mono>
                {i + 1}.º
              </Label>

              <TickStrip
                x={X0}
                y={y}
                width={ancho}
                count={Math.round((s.neto - (lo - span * 0.35)) / 100)}
                height={15}
                seed={i + 4}
                color={color}
                dot={false}
              />

              <Label x={x(s.neto) + 10} y={y + 4} size={11.5} weight={esSel ? 800 : 600} color={color}>
                {eur(s.neto)}
              </Label>
              <Label x={X1 + 96} y={y + 4} size={10} color="var(--ink-4)" anchor="end">
                {pct(s.efectivo)}
              </Label>
              <Label x={X1 + 152} y={y + 4} size={10} color="var(--ink-4)" anchor="end">
                {pct(s.cuna)}
              </Label>

              <rect
                className="fs-hit"
                x={0}
                y={y - rowH / 2}
                width={W}
                height={rowH}
                onMouseEnter={() => setHover(s.anio)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setAnio(s.anio)}
              >
                <title>{`${s.anio} — ${eur(s.neto)} netos reales, IRPF efectivo ${pct(s.efectivo)}, cuña ${pct(s.cuna)}`}</title>
              </rect>
            </g>
          );
        })}

        <Label x={X1 + 96} y={12} size={8.5} color="var(--ink-5)" anchor="end" mono>
          IRPF EF.
        </Label>
        <Label x={X1 + 152} y={12} size={8.5} color="var(--ink-5)" anchor="end" mono>
          CUÑA
        </Label>
        <Label x={X0} y={H - 16} size={9} color="var(--ink-5)" mono>
          MENOS NETO REAL
        </Label>
        <Label x={X1} y={H - 16} size={9} color="var(--ink-5)" anchor="end" mono>
          MÁS NETO REAL →
        </Label>
      </ZoomSvg>
    </Figure>
  );
}

/* ── head-to-head comparator ──────────────────────────────────────────────── */
function Comparador({ serie, anioActual, bruto2026, setAnio }) {
  const [a, setA] = useState(2016);
  const b = anioActual;

  const A = serie.find(s => s.anio === a) || serie[0];
  const B = serie.find(s => s.anio === b) || serie[serie.length - 1];

  const filas = [
    ['Bruto nominal equivalente', eur(A.nominal), eur(B.nominal), null],
    ['Neto real (€ de 2026)', eur(A.neto), eur(B.neto), B.neto - A.neto],
    ['IRPF pagado (€ de 2026)', eur(A.irpf), eur(B.irpf), -(B.irpf - A.irpf)],
    ['Cotizaciones (€ de 2026)', eur(A.ss), eur(B.ss), -(B.ss - A.ss)],
    ['Tipo efectivo IRPF', pct(A.efectivo), pct(B.efectivo), null],
    ['Tipo efectivo total', pct(A.efectivoTotal), pct(B.efectivoTotal), null],
    ['Tipo marginal total', pct(A.marginal), pct(B.marginal), null],
    ['Cuña fiscal', pct(A.cuna), pct(B.cuna), null],
  ];

  const dif = B.neto - A.neto;

  return (
    <Figure
      id="12"
      title={`${a} frente a ${b}, con el mismo poder adquisitivo`}
      sub={`${eur(bruto2026)} constantes de 2026 pasados por la fiscalidad de cada año · elige los dos años que quieras comparar`}
      legend="Todas las cifras monetarias están en euros de 2026 para que sean comparables"
      source="Fuente · cálculo propio · IPC INE"
      summary={`En ${a} el neto real era ${eur(A.neto)} y en ${b} ${eur(B.neto)}.`}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', marginBottom: 18 }}>
        <label className="fs-label" htmlFor="cmp-a">Año A</label>
        <select id="cmp-a" className="fs-select" value={a} onChange={e => setA(+e.target.value)}>
          {ANIOS.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <label className="fs-label" htmlFor="cmp-b">Año B</label>
        <select id="cmp-b" className="fs-select" value={b} onChange={e => setAnio(+e.target.value)}>
          {ANIOS.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <span className="fs-note">El año B es el de toda la publicación.</span>
      </div>

      <p className="fs-data-md num" style={{ color: dif >= 0 ? 'var(--signal)' : 'var(--ink)', margin: '0 0 6px' }}>
        {sign(dif)}
      </p>
      <p className="fs-note" style={{ marginBottom: 20 }}>
        es lo que {b} deja frente a {a}, en euros de 2026 y a igualdad de poder adquisitivo.
      </p>

      <div className="fs-table-scroll">
        <table className="fs-table">
          <thead>
            <tr>
              <th scope="col">Concepto</th>
              <th scope="col">{a}</th>
              <th scope="col">{b}</th>
              <th scope="col">Diferencia</th>
            </tr>
          </thead>
          <tbody>
            {filas.map(([k, va, vb, d]) => (
              <tr key={k} className={k.startsWith('Neto real') ? 'is-current' : undefined}>
                <th scope="row">{k}</th>
                <td>{va}</td>
                <td>{vb}</td>
                <td>{d === null ? '—' : sign(d)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Figure>
  );
}

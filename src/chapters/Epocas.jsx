import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { ANIOS, INFLACION_A_2026, calcularNomina, calcularTipoMarginal } from '../engine/irpf';
import Figure from '../figures/Figure';
import { eur, pct, sign } from '../utils/format';

/**
 * ¿En qué época estabas mejor?
 *
 * La clasificación de los quince años vive ahora en la FIG. 10, junto a la
 * serie cronológica y bajo el mismo interruptor de orden: eran los mismos
 * datos dibujados dos veces. Aquí queda lo que aquella figura no hacía —
 * comparar dos años concretos, línea a línea.
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

  return <Comparador serie={serie} anioActual={anio} bruto2026={bruto2026} setAnio={setAnio} />;
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
      id="11"
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
                <td className={d === null ? undefined : d < 0 ? 'is-neg' : 'is-pos'}>
                  {d === null ? '—' : sign(d)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Figure>
  );
}

import { useId } from 'react';

/**
 * Selector editorial compartido por las figuras que comparan dos ejercicios.
 * El color identifica el papel del año —A o B— y no una valoración del dato.
 */
export default function YearComparator({ years, yearA, yearB, onYearA, onYearB, note }) {
  const uid = useId().replace(/:/g, '');

  return (
    <div className="fs-year-compare" aria-label="Años de la comparación">
      <span className="fs-year-compare-title">Comparación común</span>
      <label className="is-a" htmlFor={`${uid}-a`}>
        <span>Año A</span>
        <select
          id={`${uid}-a`}
          className="fs-select"
          value={yearA}
          onChange={event => onYearA(+event.target.value)}
        >
          {years.map(year => <option key={year} value={year}>{year}</option>)}
        </select>
      </label>
      <span className="fs-year-compare-arrow" aria-hidden="true">→</span>
      <label className="is-b" htmlFor={`${uid}-b`}>
        <span>Año B</span>
        <select
          id={`${uid}-b`}
          className="fs-select"
          value={yearB}
          onChange={event => onYearB(+event.target.value)}
        >
          {years.map(year => <option key={year} value={year}>{year}</option>)}
        </select>
      </label>
      {note && <span className="fs-year-compare-note">{note}</span>}
    </div>
  );
}

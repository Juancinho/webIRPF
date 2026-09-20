import { eur } from '../utils/format';
import FigureZoom from './FigureZoom';

export default function BracketChart({ base, tramos, region, anio }) {
  const finiteMax = Math.max(base, ...tramos.filter(([limit]) => Number.isFinite(limit)).map(([limit]) => limit));
  const visible = tramos.map(([limit, rate], index) => {
    const start = index === 0 ? 0 : tramos[index - 1][0];
    const end = Number.isFinite(limit) ? limit : Math.max(base, start + finiteMax * 0.16);
    const used = Math.max(0, Math.min(base, end) - start);
    return { start, end, rate, used, tax: used * rate };
  }).filter(item => item.start <= Math.max(base, finiteMax));

  return (
    <figure className="bracket-chart" aria-labelledby="bracket-title">
      <div className="chart-kicker">PROGRESIVIDAD · BASE = {eur(base)}</div>
      <h3 id="bracket-title">Solo tributa al tipo superior la parte que entra en ese tramo</h3>
      <p className="chart-subtitle">Longitud = euros del tramo · tinta = parte utilizada · {region} · {anio}</p>
      <FigureZoom label="Regla progresiva del IRPF">
      <div className="bracket-ruler" role="list">
        {visible.map((item, index) => {
          const span = Math.max(1, item.end - item.start);
          const usedPct = Math.min(100, item.used / span * 100);
          const width = Math.max(9, span / (visible.at(-1).end || 1) * 100);
          const current = item.used > 0 && base > item.start && base <= item.end;
          return (
            <div
              className={`bracket-segment ${current ? 'is-current' : ''}`}
              style={{ '--segment-width': `${width}%`, '--used': `${usedPct}%` }}
              key={`${item.start}-${item.rate}`}
              role="listitem"
              tabIndex={0}
              aria-label={`${eur(item.start)} a ${eur(item.end)}, tipo ${(item.rate * 100).toFixed(1)}%, base utilizada ${eur(item.used)}, cuota ${eur(item.tax)}`}
            >
              <div className="bracket-segment__track">
                <span />
                {current && <i aria-hidden="true" title="Tu renta termina aquí" />}
              </div>
              <strong>{(item.rate * 100).toFixed(1)}%</strong>
              <span>{index === visible.length - 1 ? `Más de ${eur(item.start)}` : `${eur(item.start)}–${eur(item.end)}`}</span>
              <small>{item.used > 0 ? `${eur(item.tax)} de cuota` : 'sin usar'}</small>
            </div>
          );
        })}
      </div>
      </FigureZoom>
      <figcaption className="source-line">FUENTE · LIRPF / ESCALA ESTATAL Y AUTONÓMICA · EL MÍNIMO PERSONAL SE CALCULA POR SEPARADO</figcaption>
    </figure>
  );
}

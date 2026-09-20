import { eur } from '../utils/format';

const LABELS = {
  neto: 'Neto',
  irpf: 'IRPF',
  ssTra: 'SS trabajador',
  ssEmp: 'SS empresa',
};

export default function FiscalBreakdown({ segments, total, title = 'Cada bloque representa un 1%' }) {
  const usable = segments.filter(segment => segment.value > 0);
  const thresholds = usable.map((_, index) => usable.slice(0, index + 1).reduce((sum, item) => sum + item.value, 0));
  const blocks = Array.from({ length: 100 }, (_, index) => {
    const midpoint = (index + 0.5) / 100 * total;
    const segmentIndex = thresholds.findIndex(threshold => midpoint <= threshold);
    return usable[segmentIndex === -1 ? usable.length - 1 : segmentIndex]?.key || 'neto';
  });

  return (
    <figure className="fiscal-field" aria-label={title}>
      <div className="fiscal-field__blocks" aria-hidden="true">
        {blocks.map((key, index) => <span key={index} className={`fiscal-block fiscal-block--${key}`} />)}
      </div>
      <figcaption>
        <span className="fiscal-field__unit">{title}</span>
        <div className="fiscal-field__legend">
          {usable.map(segment => {
            const percent = total > 0 ? segment.value / total * 100 : 0;
            return (
              <div key={segment.key} className="fiscal-legend-item">
                <span className={`fiscal-legend-item__mark fiscal-block--${segment.key}`} />
                <span>{LABELS[segment.key] || segment.label}</span>
                <strong>{percent.toFixed(1)}%</strong>
                <small>{eur(segment.value)}</small>
              </div>
            );
          })}
        </div>
      </figcaption>
    </figure>
  );
}

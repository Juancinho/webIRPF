import { CAPITULOS } from './chapters';

/**
 * A running header, not a navbar: publication name, current chapter, year.
 * Visually secondary to the content (DESIGN.md §7).
 */
export default function RunningHeader({ active, progress, visible, anio, onIndice, onShare, shareState }) {
  const cap = CAPITULOS.find(c => c.id === active) || CAPITULOS[0];

  return (
    <header className={`fs-running ${visible ? 'is-on' : ''}`}>
      <div className="fs-running-inner">
        <span className="fs-running-name">FiscalScope</span>

        <span className="fs-running-chapter">
          {cap.n} / {cap.titulo}
        </span>

        <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button type="button" onClick={onShare}>
            {shareState === 'copied' ? 'Enlace copiado' : 'Compartir'}
          </button>
          <button type="button" onClick={onIndice} aria-haspopup="dialog">
            Índice
          </button>
          <span className="num" aria-hidden="true">{anio}</span>
        </span>
      </div>
      <div
        className="fs-progress"
        style={{ width: `${progress * 100}%` }}
        role="progressbar"
        aria-label="Progreso de lectura"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </header>
  );
}

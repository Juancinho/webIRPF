import { useId, useState } from 'react';

const LEVELS = [1, 1.25, 1.5, 2];

export default function FigureZoom({ children, label = 'Gráfico', className = '', minWidth = 0 }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const id = useId();
  const zoom = LEVELS[levelIndex];
  const canOut = levelIndex > 0;
  const canIn = levelIndex < LEVELS.length - 1;

  const change = next => setLevelIndex(Math.max(0, Math.min(LEVELS.length - 1, next)));

  const onKeyDown = event => {
    if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      change(levelIndex + 1);
    }
    if (event.key === '-') {
      event.preventDefault();
      change(levelIndex - 1);
    }
    if (event.key === '0') {
      event.preventDefault();
      change(0);
    }
  };

  const onWheel = event => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    change(levelIndex + (event.deltaY < 0 ? 1 : -1));
  };

  return (
    <section className={`figure-zoom ${className}`} aria-labelledby={`${id}-label`}>
      <div className="figure-zoom__toolbar">
        <span id={`${id}-label`} className="figure-zoom__label">{label}</span>
        <div className="figure-zoom__actions" role="group" aria-label={`Zoom de ${label}`}>
          <button type="button" onClick={() => change(levelIndex - 1)} disabled={!canOut} aria-label="Alejar gráfico">−</button>
          <output aria-live="polite">{Math.round(zoom * 100)}%</output>
          <button type="button" onClick={() => change(levelIndex + 1)} disabled={!canIn} aria-label="Ampliar gráfico">+</button>
          <button type="button" onClick={() => change(0)} disabled={!canOut} className="figure-zoom__reset">Restablecer</button>
        </div>
      </div>
      <div
        className="figure-zoom__viewport"
        tabIndex="0"
        onKeyDown={onKeyDown}
        onWheel={onWheel}
        aria-label={`${label}. Usa más y menos para ampliar o alejar; cero para restablecer. También puedes usar Control y la rueda.`}
      >
        <div
          className="figure-zoom__canvas"
          style={{ width: `${zoom * 100}%`, minWidth: minWidth ? `${minWidth}px` : undefined }}
        >
          {children}
        </div>
      </div>
    </section>
  );
}

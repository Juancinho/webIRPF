import { useEffect, useRef } from 'react';
import { CAPITULOS } from './chapters';

/** A full-screen index sheet — document navigation, opened on demand. */
export default function Indice({ onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    ref.current?.querySelector('a')?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fs-indice" role="dialog" aria-modal="true" aria-label="Índice" ref={ref}>
      <div className="fs-page">
        <div className="fs-indice-head">
          <div>
            <span className="fs-masthead-name">FiscalScope</span>
            <p className="fs-masthead-sub" style={{ marginBottom: 0 }}>
              Papel fiscal interactivo · España · 2012—2026
            </p>
          </div>
          <button type="button" className="fs-btn fs-btn-quiet" onClick={onClose}>
            Cerrar
          </button>
        </div>

        {CAPITULOS.map(c => (
          <a key={c.id} href={`#${c.id}`} onClick={onClose}>
            <span className="fs-indice-n">{c.n}</span>
            <span className="fs-indice-t">{c.titulo}</span>
            <span className="fs-indice-d">{c.desc}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

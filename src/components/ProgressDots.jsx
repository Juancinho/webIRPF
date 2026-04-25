import { useState, useEffect } from 'react';

const SECTIONS = [
  { id: 'calc',        label: 'Calculadora' },
  { id: 'desglose',    label: 'Paso a paso' },
  { id: 'simulador',   label: 'Simulador' },
  { id: 'comparativa', label: 'Comparativa' },
  { id: 'cuña',        label: 'Cuña fiscal' },
  { id: 'mecanismos',  label: 'Mecanismos' },
  { id: 'normativa',   label: 'Normativa' },
];

/**
 * Minimal dot-tracker fixed on the right edge of the viewport.
 * Shows current position in the page. Visible on lg+ screens.
 */
export default function ProgressDots() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const els = SECTIONS.map(s => document.getElementById(s.id)).filter(Boolean);
    if (!els.length) return;

    const obs = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length) {
          const idx = SECTIONS.findIndex(s => s.id === visible[0].target.id);
          if (idx >= 0) setActiveIdx(idx);
        }
      },
      { rootMargin: '-25% 0px -65% 0px', threshold: 0 }
    );

    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scroll = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="progress-dots" role="navigation" aria-label="Secciones">
      {SECTIONS.map((s, i) => (
        <button
          key={s.id}
          className={`progress-dot ${i === activeIdx ? 'active' : ''} ${i < activeIdx ? 'passed' : ''}`}
          onClick={() => scroll(s.id)}
          aria-label={s.label}
          title={s.label}
        />
      ))}
    </div>
  );
}

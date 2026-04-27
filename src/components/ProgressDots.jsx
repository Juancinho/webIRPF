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
  const [hoveredIdx, setHoveredIdx] = useState(null);

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
          onMouseEnter={() => setHoveredIdx(i)}
          onMouseLeave={() => setHoveredIdx(null)}
          aria-label={s.label}
          title={s.label}
        />
      ))}
      {/* Tooltip labels on hover */}
      {hoveredIdx !== null && (
        <div
          className="fixed z-30 pointer-events-none px-3.5 py-2 rounded-xl text-[11px] font-semibold"
          style={{
            right: '2.5rem',
            top: `calc(50% + ${(hoveredIdx - (SECTIONS.length - 1) / 2) * 22}px)`,
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--surface2) 80%, transparent))',
            color: 'var(--text-h)',
            border: '1px solid var(--border)',
            transform: 'translateY(-50%)',
            backdropFilter: 'blur(16px) saturate(140%)',
            WebkitBackdropFilter: 'blur(16px) saturate(140%)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(212,168,83,0.06) inset',
            transition: 'opacity 0.15s ease',
          }}
        >
          {SECTIONS[hoveredIdx].label}
        </div>
      )}
    </div>
  );
}

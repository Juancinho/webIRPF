import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * Wrapper that fades-in + slides-up children when they enter the viewport.
 * Only triggers once (no re-hide on scroll back up).
 */
export default function ScrollReveal({ children, delay = 0, className = '' }) {
  const [ref, isVisible] = useScrollReveal({ threshold: 0.08 });

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

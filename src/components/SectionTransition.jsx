import ScrollReveal from './ScrollReveal';

/**
 * Narrative bridge between sections — a short text that motivates
 * the user to keep scrolling by explaining why the next section matters.
 */
export default function SectionTransition({ children, text }) {
  return (
    <ScrollReveal>
      <div className="section-transition" aria-hidden="true">
        <div className="section-transition-line" />
        <p className="section-transition-text">{children || text}</p>
        <div className="section-transition-line" />
      </div>
    </ScrollReveal>
  );
}

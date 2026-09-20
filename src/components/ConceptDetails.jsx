export default function ConceptDetails({ label, children, defaultOpen = false, className = '' }) {
  return (
    <details className={`concept-details ${className}`.trim()} open={defaultOpen || undefined}>
      <summary>
        <span className="concept-details__icon" aria-hidden="true">i</span>
        <span>{label}</span>
        <svg className="concept-details__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="concept-details__body">{children}</div>
    </details>
  );
}

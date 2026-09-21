/**
 * The figure frame: FIG. nn · conclusion title · subtitle · field · unit
 * legend · source. No borders, no background, no rounded corners — the page
 * carries the figure (DESIGN.md §21).
 */
export default function Figure({
  id,
  title,
  sub,
  legend,
  source,
  note,
  summary,
  children,
  className = '',
}) {
  return (
    <figure className={`fs-figure ${className}`.trim()}>
      <div className="fs-figure-head">
        {id && <span className="fs-figure-id">FIG. {id}</span>}
        <figcaption className="fs-figure-title">{title}</figcaption>
        {sub && <p className="fs-figure-sub">{sub}</p>}
      </div>

      <div className="fs-figure-body">{children}</div>

      {summary && <p className="fs-sr">{summary}</p>}

      {legend && <p className="fs-figure-legend">{legend}</p>}

      {(source || note) && (
        <div className="fs-figure-foot">
          {note && <p className="fs-note" style={{ margin: 0, maxWidth: '62ch' }}>{note}</p>}
          {source && <p className="fs-source" style={{ margin: 0 }}>{source}</p>}
        </div>
      )}
    </figure>
  );
}

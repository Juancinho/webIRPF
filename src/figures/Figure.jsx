import { GUIAS } from './guias';

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
  const guia = id ? GUIAS[id] : null;

  return (
    <figure id={id ? `fig-${id}` : undefined} className={`fs-figure ${className}`.trim()}>
      <div className="fs-figure-head">
        {id && <span className="fs-figure-id">FIG. {id}</span>}
        <figcaption className="fs-figure-title">{title}</figcaption>
        {sub && <p className="fs-figure-sub">{sub}</p>}
      </div>

      {/* La misma guía que vive en el margen izquierdo, plegada aquí para
          cuando no hay margen: por debajo de 1200 px la columna lateral
          desaparece y la explicación no puede desaparecer con ella. */}
      {guia && (
        <details className="fs-guia-plegada">
          <summary>Cómo se lee esta figura</summary>
          <p className="fs-guia-p">{guia.que}</p>
          <p className="fs-guia-p is-lee">
            <span className="fs-guia-k">Los ejes</span>
            {guia.lee}
          </p>
          <p className="fs-guia-p is-ojo">
            <span className="fs-guia-k">Ojo</span>
            {guia.ojo}
          </p>
        </details>
      )}

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

import { useNarrow } from '../hooks/useNarrow';

/**
 * El marco común de todas las figuras.
 *
 * Aporta tres cosas que antes cada figura resolvía a su manera:
 *
 * 1. El lienzo SVG con su relación de aspecto.
 * 2. Un **recuadro de lectura** que sigue al cursor (`tip`), en HTML y no en
 *    SVG, para que la tipografía sea nítida y el recuadro pueda salirse del
 *    lienzo sin recortarse. Se coloca en coordenadas del viewBox y se voltea
 *    solo cuando se acerca a un borde.
 * 3. Los controles de zoom, cuando la figura tiene un eje continuo que
 *    reescalar (`zoom`, de `useDomainZoom`).
 *
 * Las figuras categóricas —filas de países, de años o de percentiles— no
 * llevan zoom: ahí no hay eje que reescalar, así que en pantallas estrechas
 * se desplazan lateralmente conservando el tamaño del texto.
 */
export default function ChartFrame({
  viewBox,
  children,
  tip = null,
  zoom = null,
  scroll = false,
  minWidth = 660,
  label = 'Figura',
  style,
  ...rest
}) {
  const narrow = useNarrow();
  const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number);

  const derecha = tip ? tip.vx / vbW > 0.62 : false;
  const abajo = tip ? tip.vy / vbH > 0.68 : false;

  const lienzo = (
    <div
      className={`fs-chart ${zoom ? 'fs-chart-zoom' : ''} ${zoom?.zoomed ? 'is-zoomed' : ''}`.trim()}
      style={scroll && narrow ? { minWidth } : undefined}
      ref={zoom ? zoom.ref : undefined}
      tabIndex={zoom ? 0 : undefined}
      role={zoom ? 'group' : undefined}
      aria-label={
        zoom
          ? `${label}. Rueda o pellizca para ampliar el eje, arrastra para desplazarte, 0 para reiniciar.`
          : undefined
      }
      {...(zoom ? zoom.bind : {})}
      {...rest}
    >
      <svg className="fs-svg" viewBox={viewBox} style={{ minWidth: scroll && narrow ? minWidth : undefined, ...style }}>
        {children}
      </svg>

      {tip && (
        <div
          className={`fs-tip ${derecha ? 'is-left' : ''} ${abajo ? 'is-up' : ''}`.trim()}
          style={{ left: `${(tip.vx / vbW) * 100}%`, top: `${(tip.vy / vbH) * 100}%` }}
          role="status"
        >
          {tip.title && <p className="fs-tip-t">{tip.title}</p>}
          {tip.sub && <p className="fs-tip-s">{tip.sub}</p>}
          <dl className="fs-tip-rows">
            {tip.rows.map(([k, v, color]) => (
              <div key={k} className="fs-tip-row">
                <dt>
                  {color && <span className="fs-tip-dot" style={{ background: color }} />}
                  {k}
                </dt>
                <dd style={color ? { color } : undefined}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {zoom && (
        <div className="fs-zoom-controls" onPointerDown={e => e.stopPropagation()}>
          <button type="button" onClick={zoom.zoomIn} disabled={!zoom.canZoomIn} aria-label="Ampliar el eje">
            +
          </button>
          <button type="button" onClick={zoom.zoomOut} disabled={!zoom.zoomed} aria-label="Reducir el eje">
            −
          </button>
          <button type="button" onClick={zoom.reset} disabled={!zoom.zoomed} aria-label="Reiniciar el eje">
            ⟲
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="fs-chart-wrap">
      {scroll && narrow ? <div className="fs-scrollx">{lienzo}</div> : lienzo}
      {zoom && (
        <p className="fs-zoom-hint">
          {zoom.zoomed
            ? `Eje ampliado ×${zoom.k.toFixed(1)} · arrastra para desplazarte · ⟲ para ver todo`
            : 'Rueda o pellizca sobre la figura para ampliar el eje'}
        </p>
      )}
      {scroll && narrow && <p className="fs-zoom-hint">Desliza la figura para verla entera</p>}
    </div>
  );
}

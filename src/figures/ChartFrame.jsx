import { useCallback, useState } from 'react';
import { useNarrow } from '../hooks/useNarrow';
import { useTactil } from './useTactil';

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
 * llevan zoom: ahí no hay eje que reescalar. En móvil cada figura se dibuja
 * con su propia composición vertical (`useNarrow`); `scroll` queda como red
 * para las pocas que conservan un lienzo más ancho que la pantalla.
 *
 * 4. La lectura táctil (`useTactil`): tocar fija un punto, mantener y
 *    arrastrar lo recorre, y en las figuras con eje, pellizcar amplía y el
 *    doble toque acerca. Con el dedo encima, el recuadro sube por encima del
 *    punto para que el dedo no lo tape.
 */
export default function ChartFrame({
  viewBox,
  children,
  tip,
  zoom = null,
  scroll = false,
  minWidth = 660,
  label = 'Figura',
  style,
  ...rest
}) {
  const narrow = useNarrow();
  const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number);
  const [nodo, setNodo] = useState(null);

  const attach = zoom?.attach;
  const unirRef = useCallback(
    el => {
      setNodo(el);
      attach?.(el);
    },
    [attach]
  );

  const tactil = useTactil(nodo, {
    horizontal: !!zoom,
    zoomed: !!zoom?.zoomed,
    onDoubleTap: zoom ? zoom.zoomAtClient : undefined,
  });

  const fx = tip ? tip.vx / vbW : 0;
  const derecha = tip ? fx > 0.62 : false;
  const abajo = tip ? tip.vy / vbH > 0.68 : false;
  // Con el dedo, el recuadro va encima del punto y se alinea al borde más cercano.
  const lado = fx < 0.3 ? 'is-tl' : fx > 0.7 ? 'is-tr' : 'is-tc';
  const claseTip = tactil ? `is-touch ${lado}` : `${derecha ? 'is-left' : ''} ${abajo ? 'is-up' : ''}`;

  const lienzo = (
    <div
      className={`fs-chart ${zoom ? 'fs-chart-zoom' : ''} ${zoom?.zoomed ? 'is-zoomed' : ''}`.trim()}
      style={scroll && narrow ? { minWidth } : undefined}
      ref={unirRef}
      tabIndex={zoom ? 0 : undefined}
      role={zoom ? 'group' : undefined}
      aria-label={
        zoom
          ? `${label}. Rueda o pellizca para ampliar el eje, arrastra para desplazarte, 0 para reiniciar. Con el dedo: toca un punto para leerlo, arrastra en horizontal para recorrerlo, doble toque para acercar.`
          : undefined
      }
      {...(zoom ? zoom.bind : {})}
      {...rest}
    >
      {/* El lienzo se nombra: sin esto llega sin identificar a un lector de
          pantalla y a cualquier rastreador que mire el documento sin pintarlo. */}
      <svg
        className="fs-svg"
        role="img"
        aria-label={label}
        viewBox={viewBox}
        style={{ minWidth: scroll && narrow ? minWidth : undefined, ...style }}
      >
        {children}
      </svg>

      {tip && (
        <div
          className={`fs-tip ${claseTip}`.trim()}
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
                {/* El valor va siempre en el color del texto: pintarlo con el de
                    la serie lo dejaba ilegible sobre el fondo oscuro del recuadro
                    (tinta sobre tinta, azul sobre casi negro). Quien identifica la
                    serie es el punto de color, no la cifra. */}
                <dd>{v}</dd>
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
          <span className="fs-hint-raton">
            {zoom.zoomed
              ? `Eje ampliado ×${zoom.k.toFixed(1)} · arrastra para desplazarte · ⟲ para ver todo`
              : 'Rueda o pellizca sobre la figura para ampliar el eje'}
          </span>
          <span className="fs-hint-dedo">
            {zoom.zoomed
              ? `Eje ×${zoom.k.toFixed(1)} · arrastra para moverte · ⟲ para ver todo`
              : 'Toca o desliza en horizontal para leer · pellizca para ampliar el eje'}
          </span>
        </p>
      )}
      {!zoom && tip !== undefined && (
        <p className="fs-zoom-hint fs-hint-dedo">
          {scroll && narrow
            ? 'Desliza la figura para verla entera · toca un punto para leerlo'
            : 'Toca un punto para leerlo · mantén y arrastra para recorrer la figura'}
        </p>
      )}
    </div>
  );
}

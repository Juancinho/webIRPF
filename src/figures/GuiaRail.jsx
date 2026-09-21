import { useEffect, useState } from 'react';
import { GUIAS, idDeFigura } from './guias';

/**
 * LA GUÍA DEL MARGEN.
 *
 * El margen izquierdo de los capítulos ya es fijo mientras se desplaza el
 * texto, así que es el sitio natural para explicar la figura que el lector
 * tiene delante: no interrumpe la lectura, no compite con el dibujo y está
 * siempre a la misma altura de los ojos.
 *
 * El componente no recibe la lista de figuras: la encuentra en el DOM de su
 * propia sección y escucha cuál ocupa más pantalla. Así una figura nueva
 * aparece en el margen sin tocar el capítulo, sólo escribiendo su guía en
 * `guias.js`.
 */
export default function GuiaRail({ seccion }) {
  const [id, setId] = useState(null);

  useEffect(() => {
    const raiz = document.getElementById(seccion);
    if (!raiz) return undefined;

    const vistas = new Map();
    let io = null;
    let firma = '';
    let pendiente = 0;

    /* Se elige la figura con más superficie visible, no la primera que entra:
       con dos figuras a la vez en pantalla, manda la que se está mirando. */
    const observar = () => {
      const nodos = [...raiz.querySelectorAll('figure.fs-figure')];
      /* Sólo se rehace el observador si ha cambiado *qué* figuras hay. Las
         figuras se redibujan en cada movimiento del salario, y reconstruirlo
         en cada redibujo costaba cerca de un centenar de observadores por
         arrastre: el coste se notaba en el deslizador, no aquí. */
      const nueva = nodos.map(n => n.id).join('|');
      if (nueva === firma) return;
      firma = nueva;
      io?.disconnect();
      vistas.clear();
      if (!nodos.length) return;
      /* Se parte de la primera figura del capítulo en vez de vacío: si no, el
         margen aparecía sin guía y la empujaba al entrar, moviendo el resto de
         notas hacia abajo a la vista del lector. */
      setId(actual => actual ?? idDeFigura(nodos[0]));
      io = new IntersectionObserver(
        entradas => {
          entradas.forEach(e => vistas.set(e.target, e.intersectionRatio));
          const mejor = [...vistas.entries()].reduce(
            (a, b) => (b[1] > a[1] ? b : a),
            [null, 0]
          );
          if (mejor[0] && mejor[1] > 0) {
            const n = idDeFigura(mejor[0]);
            if (n) setId(n);
          }
        },
        { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
      );
      nodos.forEach(n => io.observe(n));
    };

    observar();

    /* Alguna figura puede aparecer o desaparecer con el año o el perfil, así
       que se vigila la sección; la comprobación va agrupada en un fotograma
       para que una ráfaga de cambios no se revise veinte veces. */
    const mo = new MutationObserver(() => {
      if (pendiente) return;
      pendiente = requestAnimationFrame(() => { pendiente = 0; observar(); });
    });
    mo.observe(raiz, { childList: true, subtree: true });

    return () => {
      io?.disconnect();
      mo.disconnect();
      if (pendiente) cancelAnimationFrame(pendiente);
    };
  }, [seccion]);

  const g = id ? GUIAS[id] : null;
  if (!g) return null;

  return (
    <div className="fs-rail-item fs-guia" role="note">
      <span className="fs-stamp">Fig. {id} · Cómo se lee</span>
      <h4 className="fs-guia-t">{g.titulo}</h4>
      <p className="fs-guia-p">{g.que}</p>
      <p className="fs-guia-p is-lee">
        <span className="fs-guia-k">Los ejes</span>
        {g.lee}
      </p>
      <p className="fs-guia-p is-ojo">
        <span className="fs-guia-k">Ojo</span>
        {g.ojo}
      </p>
    </div>
  );
}

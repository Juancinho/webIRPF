import { Suspense, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { activar, estaVivo, prerenderDe, programar, retirar, suscribir } from './montajeDiferido';

/**
 * Un capítulo que arranca como HTML prerenderizado y se monta cuando hace
 * falta. La lógica y el porqué están en `montajeDiferido.js`.
 */
export default function Diferido({ id, children }) {
  // El objeto se crea una sola vez: si cambiara en cada render, React volvería
  // a escribir el innerHTML y el nodo observado dejaría de existir.
  const [html] = useState(() => {
    const h = prerenderDe(id);
    return h ? { __html: h } : null;
  });
  const estado = useSyncExternalStore(suscribir, () => estaVivo(id), () => true);
  const vivo = !html || estado;
  const ref = useRef(null);

  useEffect(() => {
    if (vivo || !ref.current) return undefined;
    programar(id);
    const nodo = ref.current.firstElementChild || ref.current;
    const io = new IntersectionObserver(
      entradas => {
        if (entradas.some(e => e.isIntersecting)) activar(id);
      },
      { rootMargin: '900px 0px 900px 0px' }
    );
    io.observe(nodo);
    return () => {
      io.disconnect();
      retirar(id);
    };
  }, [vivo, id]);

  const marcador = html ? <div ref={ref} className="fs-diferido" dangerouslySetInnerHTML={html} /> : null;
  if (!vivo) return marcador;
  // Mientras llega el código del capítulo, sigue a la vista su HTML.
  return <Suspense fallback={marcador}>{children}</Suspense>;
}

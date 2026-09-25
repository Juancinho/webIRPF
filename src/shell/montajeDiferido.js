import { useSyncExternalStore } from 'react';

/* ═══════════════════════════════════════════════════════════════════════════
   MONTAJE DIFERIDO DE LOS CAPÍTULOS
   El informe llega ya escrito en el HTML (scripts/prerender.mjs). Montar de
   golpe los once capítulos —veintinueve figuras, miles de nodos SVG— bloqueaba
   el hilo principal cerca de un segundo en un móvil medio: la página se veía
   pero no respondía. Ahora, al arrancar, cada capítulo que no está en pantalla
   conserva el HTML prerenderizado tal cual, y se convierte en el componente
   vivo cuando se acerca a la vista (900 px antes), cuando el lector cambia
   el sueldo, el año o el perfil, cuando salta a un ancla, o poco a poco en los
   ratos libres del navegador. El texto nunca desaparece: sólo cambia quién lo
   pinta.
   ═══════════════════════════════════════════════════════════════════════════ */

const prerender = new Map(); // id → outerHTML del capítulo prerenderizado
const vivos = new Set();
const oyentes = new Set();
let todo = false;
let version = 0;

const avisar = () => {
  version += 1;
  oyentes.forEach(f => f());
};

/** Guarda el HTML prerenderizado antes de que React lo sustituya. */
export function capturarPrerender(ids) {
  if (typeof document === 'undefined') return;
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) prerender.set(id, el.outerHTML);
  }
  // Si se llega con un ancla, todo se monta enseguida para que el destino
  // tenga cuanto antes su altura definitiva.
  if (window.location.hash) todo = true;
}

export function activarTodo() {
  if (todo) return;
  todo = true;
  avisar();
}

export function activar(id) {
  if (vivos.has(id)) return;
  vivos.add(id);
  avisar();
}

export const suscribir = f => {
  oyentes.add(f);
  return () => oyentes.delete(f);
};

/** Número que cambia cada vez que se monta un capítulo (para quien observa el DOM). */
export function useVersionDiferido() {
  return useSyncExternalStore(suscribir, () => version, () => 0);
}

/* Montaje en segundo plano: uno cada vez, cuando el navegador está libre y
   después de que la página haya terminado de cargar. */
let cola = [];

export function retirar(id) {
  cola = cola.filter(x => x !== id);
}
let programado = false;
export function programar(id) {
  if (id && !cola.includes(id)) cola.push(id);
  if (programado || typeof window === 'undefined') return;
  programado = true;
  const libre = window.requestIdleCallback || (f => setTimeout(() => f({ timeRemaining: () => 8 }), 250));
  const paso = () => {
    const siguiente = cola.find(id => !vivos.has(id));
    if (!siguiente || todo) return;
    activar(siguiente);
    libre(paso, { timeout: 2000 });
  };
  const empezar = () => setTimeout(() => libre(paso, { timeout: 2000 }), 12000);
  if (document.readyState === 'complete') empezar();
  else window.addEventListener('load', empezar, { once: true });
}


export const prerenderDe = id => prerender.get(id);
export const estaVivo = id => todo || vivos.has(id);

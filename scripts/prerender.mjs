/**
 * Inserta el informe ya renderizado dentro del index.html del build.
 *
 * Corre después de las dos compilaciones de Vite: la del navegador y la de
 * servidor. El cliente sigue montando con `createRoot`, que reemplaza lo que
 * encuentre, así que este HTML no se hidrata: sirve para que el buscador lo
 * lea sin ejecutar nada y para que la primera pintura no sea una página en
 * blanco. No hay riesgo de desajuste entre servidor y cliente.
 */
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const raiz = process.cwd();
const indice = resolve(raiz, 'dist/index.html');
const servidor = resolve(raiz, 'dist-ssr/entry-server.js');

if (!existsSync(servidor)) {
  console.error('prerender: falta dist-ssr/entry-server.js; ¿se ha saltado el build de servidor?');
  process.exit(1);
}

const { render } = await import(`file://${servidor}`);

/* Las figuras aportan su texto —título, subtítulo, leyenda, nota, fuente y el
   resumen accesible de cada una—, pero sus trazados no le dicen nada a un
   buscador: mil círculos del enjambre, las 365 casillas del calendario o las
   1.515 del mapa de calor pesan el 82 % del documento y no contienen una sola
   palabra. Se vacían los lienzos y se conserva todo lo demás; el navegador los
   vuelve a dibujar en cuanto monta la aplicación. */
const completo = render();
const cuerpo = completo.replace(/(<svg\b[^>]*>)[\s\S]*?<\/svg>/g, '$1</svg>');

const plantilla = readFileSync(indice, 'utf8');
const marca = '<div id="root"></div>';
if (!plantilla.includes(marca)) {
  console.error('prerender: no encuentro el contenedor de la aplicación en dist/index.html');
  process.exit(1);
}

writeFileSync(indice, plantilla.replace(marca, `<div id="root">${cuerpo}</div>`));
rmSync(resolve(raiz, 'dist-ssr'), { recursive: true, force: true });

const kb = n => `${Math.round(n / 1024)} kB`;
const palabras = cuerpo.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
console.log(
  `prerender: ${kb(cuerpo.length)} de HTML (${palabras.toLocaleString('es-ES')} palabras) ` +
  `dentro de dist/index.html · ${kb(completo.length - cuerpo.length)} de trazados omitidos`
);

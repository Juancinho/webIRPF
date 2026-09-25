/**
 * Inserta el informe ya renderizado dentro del index.html del build, y
 * escribe una copia por cada página de entrada (`src/paginas/contenido.js`).
 *
 * Corre después de las dos compilaciones de Vite: la del navegador y la de
 * servidor. El cliente sigue montando con `createRoot`, que reemplaza lo que
 * encuentre, así que este HTML no se hidrata: sirve para que el buscador lo
 * lea sin ejecutar nada y para que la primera pintura no sea una página en
 * blanco. No hay riesgo de desajuste entre servidor y cliente.
 *
 * La portada (`dist/index.html`) sale exactamente como antes. Cada página de
 * entrada es una carpeta con su `index.html` —`/sueldo-neto/30000/`—, así que
 * cualquier alojamiento estático la sirve sin configuración.
 */
import { readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const raiz = process.cwd();
const indice = resolve(raiz, 'dist/index.html');
const servidor = resolve(raiz, 'dist-ssr/entry-server.js');

if (!existsSync(servidor)) {
  console.error('prerender: falta dist-ssr/entry-server.js; ¿se ha saltado el build de servidor?');
  process.exit(1);
}

const { render } = await import(`file://${servidor}`);
// Los datos de las páginas son JavaScript puro: se leen directamente del código fuente.
const { RUTAS, paginaDeRuta, SITIO, REVISADO } = await import(`file://${resolve(raiz, 'src/paginas/contenido.js')}`);

/* Las figuras aportan su texto —título, subtítulo, leyenda, nota, fuente y el
   resumen accesible de cada una—, pero sus trazados no le dicen nada a un
   buscador: mil círculos del enjambre, las 365 casillas del calendario o las
   1.515 del mapa de calor pesan el 82 % del documento y no contienen una sola
   palabra. Se vacían los lienzos y se conserva todo lo demás; el navegador los
   vuelve a dibujar en cuanto monta la aplicación. */
const sinTrazados = html => html.replace(/(<svg\b[^>]*>)[\s\S]*?<\/svg>/g, '$1</svg>');

const plantilla = readFileSync(indice, 'utf8');
const marca = '<div id="root"></div>';
if (!plantilla.includes(marca)) {
  console.error('prerender: no encuentro el contenedor de la aplicación en dist/index.html');
  process.exit(1);
}

const kb = n => `${Math.round(n / 1024)} kB`;
const palabras = html => html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

/* ── la portada ─────────────────────────────────────────────────────────── */
const completo = await render();
const cuerpo = sinTrazados(completo);
writeFileSync(indice, plantilla.replace(marca, `<div id="root">${cuerpo}</div>`));
console.log(
  `prerender: ${kb(cuerpo.length)} de HTML (${palabras(cuerpo).toLocaleString('es-ES')} palabras) ` +
  `dentro de dist/index.html · ${kb(completo.length - cuerpo.length)} de trazados omitidos`
);

/* ── las páginas de entrada ─────────────────────────────────────────────── */
const attr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const texto = s => String(s).replace(/\*\*/g, '');

function datosEstructurados(p, url) {
  const grafo = [
    {
      '@type': 'WebPage',
      '@id': `${url}#pagina`,
      url,
      name: p.titulo,
      description: p.descripcion,
      inLanguage: 'es-ES',
      dateModified: REVISADO,
      isPartOf: { '@id': `${SITIO}/#sitio` },
      publisher: { '@id': `${SITIO}/#editor` },
      breadcrumb: { '@id': `${url}#miga` },
      primaryImageOfPage: `${SITIO}/og-image.png`,
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#miga`,
      itemListElement: p.miga.map((m, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: m.nombre,
        item: `${SITIO}${m.ruta}`,
      })),
    },
    { '@type': 'WebSite', '@id': `${SITIO}/#sitio`, url: `${SITIO}/`, name: 'FiscalScope', inLanguage: 'es-ES' },
    { '@type': 'Organization', '@id': `${SITIO}/#editor`, name: 'FiscalScope', url: `${SITIO}/`, logo: `${SITIO}/apple-touch-icon.png` },
  ];
  if (p.preguntas.length) {
    grafo.push({
      '@type': 'FAQPage',
      '@id': `${url}#preguntas`,
      mainEntity: p.preguntas.map(q => ({
        '@type': 'Question',
        name: texto(q.p),
        acceptedAnswer: { '@type': 'Answer', text: texto(q.r) },
      })),
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': grafo }, null, 1).replace(/</g, '\\u003c');
}

function cabecera(html, p) {
  const url = `${SITIO}${p.ruta}`;
  const t = attr(p.titulo);
  const d = attr(p.descripcion);
  const cambios = [
    [/<title>[\s\S]*?<\/title>/, `<title>${attr(p.titulo.length <= 52 ? `${p.titulo} · FiscalScope` : p.titulo)}</title>`],
    [/(<meta name="description" content=")[^"]*(")/, `$1${d}$2`],
    [/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`],
    [/(<link rel="alternate" hreflang="es-ES" href=")[^"]*(")/, `$1${url}$2`],
    [/(<link rel="alternate" hreflang="x-default" href=")[^"]*(")/, `$1${url}$2`],
    [/(<meta property="og:type"\s+content=")[^"]*(")/, `$1article$2`],
    [/(<meta property="og:url"\s+content=")[^"]*(")/, `$1${url}$2`],
    [/(<meta property="og:title"\s+content=")[^"]*(")/, `$1${t}$2`],
    [/(<meta property="og:description"\s+content=")[^"]*(")/, `$1${d}$2`],
    [/(<meta name="twitter:url"\s+content=")[^"]*(")/, `$1${url}$2`],
    [/(<meta name="twitter:title"\s+content=")[^"]*(")/, `$1${t}$2`],
    [/(<meta name="twitter:description"\s+content=")[^"]*(")/, `$1${d}$2`],
    [/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">\n${datosEstructurados(p, url)}\n    </script>`],
    // la portada usa rutas relativas («./assets/…»); una página en
    // /sueldo-neto/30000/ necesita rutas desde la raíz
    [/(href|src)="\.\//g, '$1="/'],
  ];
  return cambios.reduce((h, [re, sustituto]) => {
    if (!re.global && !re.test(h)) {
      console.error(`prerender: no encuentro ${re} en la plantilla`);
      process.exit(1);
    }
    return h.replace(re, sustituto);
  }, html);
}

let total = 0;
for (const ruta of RUTAS) {
  const p = paginaDeRuta(ruta);
  const html = cabecera(plantilla, p).replace(marca, `<div id="root">${sinTrazados(await render(p))}</div>`);
  const destino = resolve(raiz, 'dist', `.${ruta}`, 'index.html');
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, html);
  total += html.length;
}
console.log(`prerender: ${RUTAS.length} páginas de entrada · ${kb(total)} en total`);

/* ── sitemap ────────────────────────────────────────────────────────────── */
const urls = ['/', ...RUTAS]
  .map(
    r => `  <url>
    <loc>${SITIO}${r}</loc>
    <lastmod>${REVISADO}</lastmod>${
      r === '/'
        ? `
    <image:image>
      <image:loc>${SITIO}/og-image.png</image:loc>
      <image:title>Presión fiscal en España · de cada 100 € de coste laboral</image:title>
    </image:image>`
        : ''
    }
  </url>`
  )
  .join('\n');
writeFileSync(
  resolve(raiz, 'dist/sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`
);
console.log(`prerender: sitemap con ${RUTAS.length + 1} direcciones`);

rmSync(resolve(raiz, 'dist-ssr'), { recursive: true, force: true });

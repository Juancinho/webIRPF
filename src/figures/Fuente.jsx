import { Children, cloneElement, isValidElement } from 'react';

const URLS = {
  lirpf: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764',
  rirpf: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820',
  tgss: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537',
  aeat: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025.html',
  ipc: 'https://www.ine.es/varipc/',
  salarios: 'https://www.ine.es/jaxiT3/Tabla.htm?t=28191',
  ocde: 'https://doi.org/10.1787/3a5169ef-en',
  igae: 'https://www.igae.pap.hacienda.gob.es/sitios/igae/es-ES/Contabilidad/ContabilidadNacional/Publicaciones/paginas/iacogof.aspx',
  eurostat: 'https://ec.europa.eu/eurostat/en/web/products-manuals-and-guidelines/-/ks-gq-19-010',
  bde: 'https://datos.bde.es/datos/es/datasets/000/033.html',
  idealista: 'https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/',
};

const REFERENCIA_RE = /(ajuste log-normal propio|interpolaci[oó]n y c[aá]lculo(?:s)? propio(?:s)?|c[aá]lculo(?:s)? propio(?:s)?|LIRPF(?:\s+arts?\.?\s*[\d.,–—-]+(?:\s+y\s+[\d.,–—-]+)?)?|RIRPF(?:\s+art\.?\s*[\d.]+)?|EAES(?:,?\s*tabla)?\s*28191|Banco de Espa[nñ]a|Eurostat|idealista|TGSS|AEAT|OCDE|IGAE|INE|BOE)/gi;

function articuloUrl(base, texto) {
  const articulo = texto.match(/art(?:s)?\.?\s*(\d+)/i)?.[1];
  return articulo ? `${base}#a${articulo}` : base;
}

function destino(texto, contexto) {
  const t = texto.toLocaleLowerCase('es');
  const c = contexto.toLocaleLowerCase('es');

  if (t.includes('log-normal') || t.includes('interpolaci')) return '#metodo-distribucion';
  if (t.includes('cálculo') || t.includes('calculo')) return '#metodo-calculos';
  if (t.startsWith('lirpf')) return articuloUrl(URLS.lirpf, texto);
  if (t.startsWith('rirpf')) return articuloUrl(URLS.rirpf, texto);
  if (t === 'boe') return URLS.lirpf;
  if (t === 'tgss') return URLS.tgss;
  if (t === 'aeat') return URLS.aeat;
  if (t === 'ocde') return URLS.ocde;
  if (t === 'igae') return URLS.igae;
  if (t === 'eurostat') return URLS.eurostat;
  if (t === 'banco de españa') return URLS.bde;
  if (t === 'idealista') return URLS.idealista;
  if (t.startsWith('eaes')) return URLS.salarios;
  if (t === 'ine') return /eaes|salari|distribuci[oó]n|28191/.test(c) ? URLS.salarios : URLS.ipc;
  return null;
}

function enlazarTexto(texto, keyBase = 'ref') {
  const partes = texto.split(REFERENCIA_RE);
  return partes.map((parte, i) => {
    if (!parte) return null;
    const href = destino(parte, texto);
    if (!href) return parte;
    const externa = href.startsWith('http');
    return (
      <a
        key={`${keyBase}-${i}`}
        href={href}
        {...(externa ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
      >
        {parte}
      </a>
    );
  });
}

function recorrer(nodo, keyBase = 'nodo') {
  if (typeof nodo === 'string') return enlazarTexto(nodo, keyBase);
  if (!isValidElement(nodo)) return nodo;
  if (nodo.type === 'a') return nodo;

  const children = Children.map(nodo.props.children, (child, i) => recorrer(child, `${keyBase}-${i}`));
  return cloneElement(nodo, undefined, children);
}

/**
 * Convierte las menciones de una línea de fuente en enlaces trazables.
 * Conserva cualquier enlace escrito a mano y enlaza “cálculo propio” con el
 * libro de método interno, donde se puede reproducir la operación.
 */
export default function Fuente({ children }) {
  return Children.map(children, (child, i) => recorrer(child, `fuente-${i}`));
}


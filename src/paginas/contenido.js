/* ═══════════════════════════════════════════════════════════════════════════
   PÁGINAS DE ENTRADA
   Cada página responde a una búsqueda concreta —«30.000 € brutos cuánto es
   neto», «tramos del IRPF 2026», «cuña fiscal España»— con su propia cifra y
   su propio texto, calculados con el mismo motor que el informe. Debajo de la
   respuesta va el informe completo, ya cargado con ese caso.

   Todo aquí es dato puro: lo usa React para pintar la página y lo usa el
   prerenderizado para escribir su <head>. No hay texto de relleno: cada frase
   lleva una cifra que cambia de una página a otra.
   ═══════════════════════════════════════════════════════════════════════════ */
import {
  ANIOS,
  CUNA_OCDE_2025,
  CUNA_OCDE_META,
  DEFAULT_OPTS,
  DISTRIBUCION_SALARIAL,
  DISTRIBUCION_SALARIAL_OFICIAL,
  INFLACION_A_2026,
  REGIONES,
  SMI_ANUAL,
  ULTIMO_ANIO_SALARIAL_OFICIAL,
  calcularNomina,
  calcularTipoMarginal,
  conceptosCotizacion,
  getArt20Meta,
  getTramosIRPF,
  obtenerParametros,
  percentilDe,
} from '../engine/irpf.js';
import { dec, eur, num, pct } from '../utils/format.js';

export const SITIO = 'https://fiscalscope.info';
export const ANIO = 2026;
/** Fecha de la última revisión de los parámetros: va al sitemap y al JSON-LD. */
export const REVISADO = '2026-09-25';

/* De 14.000 a 100.000 € de mil en mil: desde justo por debajo del SMI hasta
   el entorno del P95. Por encima, la búsqueda es rara y el cálculo de la
   retención deja de ser representativo sin circunstancias personales. */
export const SUELDOS = Array.from({ length: 87 }, (_, i) => 14000 + i * 1000);

const opts = DEFAULT_OPTS;
const nomina = (b, a = ANIO, o = opts) => calcularNomina(b, a, o);
const rutaSueldo = b => `/sueldo-neto/${b}/`;
const ordinal = p => `${Math.round(p)}`;

/* Sueldos con enlace propio desde las páginas temáticas: los que más se buscan. */
const SUELDOS_DESTACADOS = [18000, 20000, 22000, 24000, 25000, 28000, 30000, 35000, 40000, 45000, 50000, 60000];

/* ── páginas por sueldo ─────────────────────────────────────────────────────── */

export function paginaSueldo(bruto) {
  const n = nomina(bruto);
  const subida = nomina(bruto + 1000);
  const llegaSubida = subida.salarioNeto - n.salarioNeto;
  const n25 = nomina(bruto, 2025);
  const dif25 = n.salarioNeto - n25.salarioNeto;
  const p = percentilDe(bruto, ANIO);
  const smi = SMI_ANUAL[ANIO];
  const mediana = DISTRIBUCION_SALARIAL[ANIO].p50;
  const mes12 = n.salarioNeto / 12;
  const mes14 = n.salarioNeto / 14;
  const deCien = (n.salarioNeto / n.costeLab) * 100;
  const B = eur(bruto);
  const N = eur(n.salarioNeto);

  const regiones = ['default', 'madrid', 'andalucia', 'cataluna', 'valencia'].map(k => {
    const r = nomina(bruto, ANIO, { ...opts, ccaa: k });
    return { k, nombre: REGIONES[k].name, neto: r.salarioNeto, irpf: r.irpfFinal };
  });
  const mejor = regiones.reduce((a, c) => (c.neto > a.neto ? c : a));
  const peor = regiones.reduce((a, c) => (c.neto < a.neto ? c : a));

  const i = SUELDOS.indexOf(bruto);
  const anterior = i > 0 ? SUELDOS[i - 1] : null;
  const siguiente = i < SUELDOS.length - 1 ? SUELDOS[i + 1] : null;

  const sinIrpf = n.irpfFinal < 1;

  const secciones = [
    {
      titulo: `De dónde salen los ${N}`,
      parrafos: [
        `El salario bruto de ${B} paga primero la **cotización del trabajador a la Seguridad Social**: ${eur(n.cotTra)} al año, el ${pct(obtenerParametros(ANIO).tipoTra * 100, 2)} de la base de cotización.`,
        sinIrpf
          ? `A este nivel de renta **no hay retención de IRPF**: el mínimo personal, la reducción por rendimientos del trabajo${n.deduccionSMI > 0 ? ' y la deducción para salarios cercanos al SMI' : ''} dejan la cuota en cero.`
          : `Después, la **retención de IRPF**: ${eur(n.irpfFinal)} al año. Sale de aplicar la escala a una base imponible de ${eur(n.baseImponible)} —el bruto menos la cotización, los 2.000 € de gastos deducibles${n.redTrabajo > 0 ? ` y ${eur(n.redTrabajo)} de reducción por rendimientos del trabajo` : ''}— y restar la cuota del mínimo personal (${eur(n.cuotaMinimo)}).`,
        `Lo que queda, **${N}**, es la renta neta: ${eur(mes12)} al mes en 12 pagas o ${eur(mes14)} en 14.`,
      ],
    },
    {
      titulo: 'Tipo efectivo y tipo marginal',
      parrafos: [
        sinIrpf
          ? `El tipo efectivo de IRPF es cero. Entre IRPF y cotización, la nómina retiene el ${pct(n.tipoEfectivoTotal * 100)} del bruto.`
          : `El IRPF se lleva el **${pct(n.tipoEfectivoIRPF * 100)}** de todo el bruto: es el tipo efectivo. Tu último euro, en cambio, está en el tramo del ${pct(n.tipoMargIRPF * 100, 0)}: ese tipo sólo se aplica a la parte de la base que cae dentro del tramo, nunca al sueldo entero.`,
        `Si te subieran 1.000 € brutos, te llegarían **${eur(llegaSubida)}** netos: el ${pct((1 - llegaSubida / 1000) * 100)} de la subida se iría en IRPF y cotización${1 - llegaSubida / 1000 > 0.4 && bruto < 25000 ? ', más que en sueldos mayores, porque a este nivel se está retirando la reducción del artículo 20' : ''}.`,
      ],
    },
    {
      titulo: 'Lo que cuestas a la empresa',
      parrafos: [
        `Además de tu bruto, la empresa cotiza ${eur(n.cotEmp)} por ti. El coste laboral total del puesto es **${eur(n.costeLab)}**, y de cada 100 € de ese coste llegan ${dec(deCien)} € a tu cuenta. La diferencia, el ${pct(n.cunaFiscal * 100)}, es la cuña fiscal.`,
      ],
    },
    {
      titulo: 'Dónde está este sueldo',
      parrafos: [
        ...(bruto < smi
          ? [`${B} está por debajo del salario mínimo a jornada completa (${eur(smi)} en ${ANIO}): corresponde a una jornada parcial o a un contrato de menos de un año.`]
          : []),
        `Con ${B} brutos se cobra más que el **${ordinal(p)} % de los asalariados** en España, según la distribución del INE proyectada a ${ANIO} (mediana estimada: ${eur(mediana)}). ${bruto >= smi ? `Equivale a ${dec(bruto / smi, 2)} veces el salario mínimo de ${ANIO} (${eur(smi)} al año).` : ''}`,
        Math.abs(dif25) >= 1
          ? `Con las reglas de 2025, el mismo bruto dejaba ${eur(n25.salarioNeto)} netos: ${dif25 > 0 ? `${eur(dif25)} menos que en ${ANIO}` : `${eur(-dif25)} más que en ${ANIO}`}, por los cambios en la cotización${n.deduccionSMI > 0 || n25.deduccionSMI > 0 ? ' y en la deducción para salarios bajos' : ''}.`
          : `Con las reglas de 2025, el neto habría sido prácticamente el mismo: ${eur(n25.salarioNeto)}.`,
      ],
    },
    {
      titulo: 'Según la comunidad autónoma',
      parrafos: [
        mejor.neto - peor.neto >= 1
          ? `Desde 2024 la parte autonómica de la escala cambia el resultado. Con ${B}, la diferencia entre la comunidad más favorable y la menos favorable de esta tabla es de **${eur(mejor.neto - peor.neto)}** netos al año.`
          : `A este nivel de renta la comunidad autónoma apenas cambia el resultado: la cuota es muy pequeña o nula en todas.`,
      ],
      tabla: {
        cabeceras: ['Comunidad', 'IRPF', 'Neto anual', 'Al mes (12)'],
        filas: regiones.map(r => [r.nombre, eur(r.irpf), eur(r.neto), eur(r.neto / 12)]),
        nota: 'País Vasco y Navarra tienen régimen foral propio y no se calculan aquí.',
      },
    },
  ];

  return {
    tipo: 'sueldo',
    ruta: rutaSueldo(bruto),
    bruto,
    estado: { bruto },
    titulo: `${B} brutos: ${N} netos en ${ANIO} (${eur(mes12)} al mes)`,
    descripcion: `Con ${B} brutos al año en ${ANIO} cobras ${N} netos: ${eur(mes12)} al mes en 12 pagas o ${eur(mes14)} en 14. IRPF ${eur(n.irpfFinal)} (${pct(n.tipoEfectivoIRPF * 100)}) y Seguridad Social ${eur(n.cotTra)}.`,
    miga: [
      { nombre: 'Inicio', ruta: '/' },
      { nombre: 'Sueldo neto', ruta: '/sueldo-neto/' },
      { nombre: `${B} brutos`, ruta: rutaSueldo(bruto) },
    ],
    sello: `Sueldo neto ${ANIO} · asalariado`,
    h1: `${B} brutos al año son ${N} netos en ${ANIO}`,
    entradilla: `Un asalariado con contrato indefinido, soltero, sin hijos y con la escala general del IRPF que cobra ${B} brutos al año recibe ${N} netos: **${eur(mes12)} al mes en 12 pagas** o **${eur(mes14)} en 14 pagas**.`,
    cifras: [
      { k: 'Neto al año', v: N, destacada: true },
      { k: 'Neto al mes · 12 pagas', v: eur(mes12) },
      { k: 'Neto al mes · 14 pagas', v: eur(mes14) },
      { k: 'Retención de IRPF', v: eur(n.irpfFinal), nota: `${pct(n.tipoEfectivoIRPF * 100)} del bruto` },
      { k: 'Seguridad Social', v: eur(n.cotTra), nota: 'cotización del trabajador' },
      { k: 'Tipo marginal', v: pct((1 - llegaSubida / 1000) * 100), nota: 'IRPF + cotización de los próximos 1.000 €' },
      { k: 'Coste para la empresa', v: eur(n.costeLab) },
      { k: 'Percentil salarial', v: ordinal(p), nota: `de 100 asalariados` },
    ],
    secciones,
    preguntas: [
      {
        p: `¿Cuánto es ${B} brutos en neto al mes?`,
        r: `En ${ANIO}, ${eur(mes12)} al mes en 12 pagas o ${eur(mes14)} en 14 pagas, para un asalariado soltero sin hijos con la escala general. Al año son ${N} netos.`,
      },
      {
        p: `¿Cuánto IRPF se paga con ${B} brutos?`,
        r: sinIrpf
          ? `Ninguno: a este nivel la retención de IRPF es cero. Sólo se descuenta la cotización a la Seguridad Social, ${eur(n.cotTra)} al año.`
          : `${eur(n.irpfFinal)} al año, un tipo efectivo del ${pct(n.tipoEfectivoIRPF * 100)} sobre el bruto. A eso se suman ${eur(n.cotTra)} de cotización a la Seguridad Social.`,
      },
      {
        p: `¿Cuánto le cuesta a la empresa un sueldo de ${B}?`,
        r: `${eur(n.costeLab)} al año: el bruto más ${eur(n.cotEmp)} de cotización empresarial a la Seguridad Social.`,
      },
    ],
    vecinos: {
      anterior: anterior && { ruta: rutaSueldo(anterior), texto: `${eur(anterior)} brutos` },
      siguiente: siguiente && { ruta: rutaSueldo(siguiente), texto: `${eur(siguiente)} brutos` },
    },
    enlaces: [
      { ruta: '/tramos-irpf-2026/', texto: 'Tramos del IRPF 2026' },
      { ruta: '/irpf-por-comunidades-2026/', texto: 'IRPF por comunidades' },
      { ruta: '/tipo-marginal-y-tipo-efectivo/', texto: 'Tipo marginal y efectivo' },
      { ruta: '/coste-empresa-trabajador/', texto: 'Coste para la empresa' },
    ],
    informe: { ancla: '#nomina', texto: `Ver el cálculo completo de ${B}, operación a operación` },
  };
}

/* ── índice de sueldos ──────────────────────────────────────────────────────── */

function paginaIndiceSueldos() {
  const filas = SUELDOS.map(b => {
    const n = nomina(b);
    return { b, n };
  });
  return {
    tipo: 'tema',
    ruta: '/sueldo-neto/',
    estado: { bruto: 35000 },
    titulo: `Sueldo neto ${ANIO}: tabla de bruto a neto de 14.000 a 100.000 €`,
    descripcion: `Tabla de salario bruto a neto en ${ANIO} para ${SUELDOS.length} sueldos, de 14.000 a 100.000 €: neto anual, mensual en 12 y 14 pagas, IRPF y cotización. Cada fila abre su desglose.`,
    miga: [
      { nombre: 'Inicio', ruta: '/' },
      { nombre: 'Sueldo neto', ruta: '/sueldo-neto/' },
    ],
    sello: `Sueldo neto ${ANIO}`,
    h1: `De bruto a neto en ${ANIO}: ${SUELDOS.length} sueldos, uno por fila`,
    entradilla: `Cuánto queda de cada salario bruto anual después de la cotización a la Seguridad Social y la retención de IRPF, con las reglas de ${ANIO}. Asalariado con contrato indefinido, soltero, sin hijos y escala general.`,
    cifras: [
      { k: 'Mediana salarial estimada', v: eur(DISTRIBUCION_SALARIAL[ANIO].p50), nota: `INE proyectado a ${ANIO}` },
      { k: 'Neto de la mediana', v: eur(nomina(DISTRIBUCION_SALARIAL[ANIO].p50).salarioNeto) },
      { k: 'Salario mínimo', v: eur(SMI_ANUAL[ANIO]), nota: '14 pagas' },
    ],
    secciones: [
      {
        titulo: 'La tabla completa',
        parrafos: ['Cada importe enlaza a su propia página, con el desglose, el tipo marginal, el coste para la empresa y la comparación por comunidades.'],
        tabla: {
          cabeceras: ['Bruto anual', 'Neto anual', 'Al mes (12)', 'Al mes (14)', 'IRPF'],
          filas: filas.map(({ b, n }) => [
            { texto: eur(b), ruta: rutaSueldo(b) },
            eur(n.salarioNeto),
            eur(n.salarioNeto / 12),
            eur(n.salarioNeto / 14),
            eur(n.irpfFinal),
          ]),
        },
      },
    ],
    preguntas: [],
    enlaces: TEMAS_ENLACES.filter(t => t.ruta !== '/sueldo-neto/'),
    informe: { ancla: '#portada', texto: 'Calcula cualquier otro sueldo en el informe' },
  };
}

/* ── páginas temáticas ──────────────────────────────────────────────────────── */

function paginaTramos() {
  const tramos = getTramosIRPF(ANIO);
  const bases = [15000, 25000, 35000, 50000, 80000];
  const cuota = base => {
    let q = 0;
    let prev = 0;
    for (const [lim, t] of tramos) {
      if (base > lim) { q += (lim - prev) * t; prev = lim; } else { q += (base - prev) * t; break; }
    }
    return q;
  };
  const ejemplo = nomina(35000);
  return {
    tipo: 'tema',
    ruta: '/tramos-irpf-2026/',
    estado: { bruto: 35000 },
    titulo: `Tramos del IRPF ${ANIO}: escala, tipos y ejemplos de cálculo`,
    descripcion: `Los seis tramos del IRPF en ${ANIO}, del 19 % al 47 %, con la cuota que genera cada base imponible y por qué el tipo del último tramo nunca se aplica al sueldo entero.`,
    miga: [{ nombre: 'Inicio', ruta: '/' }, { nombre: `Tramos del IRPF ${ANIO}`, ruta: '/tramos-irpf-2026/' }],
    sello: `IRPF ${ANIO} · escala general`,
    h1: `Los tramos del IRPF en ${ANIO}`,
    entradilla: `La escala general del IRPF —parte estatal más parte autonómica común— tiene seis tramos, del **19 %** al **47 %**. Cada tipo se aplica sólo a la porción de base imponible que cae dentro de su tramo.`,
    cifras: [
      { k: 'Tipo mínimo', v: pct(tramos[0][1] * 100, 0), nota: `hasta ${eur(tramos[0][0])}` },
      { k: 'Tipo máximo', v: pct(tramos[tramos.length - 1][1] * 100, 0), nota: `desde ${eur(tramos[tramos.length - 2][0])}` },
      { k: 'Mínimo personal', v: eur(obtenerParametros(ANIO).irpfMinimo), nota: 'tributa al 0 %' },
    ],
    secciones: [
      {
        titulo: `La escala de ${ANIO}`,
        parrafos: ['La escala no ha cambiado desde 2021, cuando se añadió el tramo del 47 % para bases de más de 300.000 €. Lo que sí cambia cada año son los mínimos, las reducciones y las deducciones que determinan a qué base se aplica.'],
        tabla: {
          cabeceras: ['Base imponible', 'Tipo del tramo'],
          filas: tramos.map(([lim, t], k) => [
            `${k === 0 ? '0 €' : eur(tramos[k - 1][0])} — ${Number.isFinite(lim) ? eur(lim) : 'en adelante'}`,
            pct(t * 100, 0),
          ]),
          nota: 'Escala combinada estatal y autonómica general. Desde 2024 varias comunidades aplican tipos autonómicos propios.',
        },
      },
      {
        titulo: 'Cuánto genera cada base',
        parrafos: [
          'La cuota íntegra suma lo que genera cada tramo. Una base de 35.000 € no paga el 30 % de 35.000 €: paga el 19 % de los primeros 12.450 €, el 24 % de los 7.750 siguientes y el 30 % de lo que queda.',
          `A esa cuota se le resta después la cuota del mínimo personal (${eur(cuota(5550))} para una persona sin cargas), que es la parte de la renta que la ley considera necesaria para vivir.`,
        ],
        tabla: {
          cabeceras: ['Base imponible', 'Cuota íntegra', 'Tipo medio sobre la base'],
          filas: bases.map(b => [eur(b), eur(cuota(b)), pct((cuota(b) / b) * 100)]),
        },
      },
      {
        titulo: 'De la base al sueldo',
        parrafos: [
          `La base imponible no es el sueldo bruto. Con 35.000 € brutos, la base queda en ${eur(ejemplo.baseImponible)} tras restar la cotización y los gastos deducibles, y el IRPF final es ${eur(ejemplo.irpfFinal)}: un **${pct(ejemplo.tipoEfectivoIRPF * 100)}** del bruto, aunque el último euro caiga en el tramo del ${pct(ejemplo.tipoMargIRPF * 100, 0)}.`,
        ],
      },
    ],
    preguntas: [
      { p: `¿Cuáles son los tramos del IRPF en ${ANIO}?`, r: tramos.map(([lim, t], k) => `${pct(t * 100, 0)} ${k === 0 ? `hasta ${eur(lim)}` : Number.isFinite(lim) ? `de ${eur(tramos[k - 1][0])} a ${eur(lim)}` : `desde ${eur(tramos[k - 1][0])}`}`).join('; ') + '.' },
      { p: '¿Si paso de tramo cobro menos?', r: 'No. Pasar de tramo sólo cambia el tipo de los euros que caen en el tramo nuevo; los anteriores siguen tributando igual. Una subida de sueldo siempre deja más neto que antes.' },
    ],
    enlaces: TEMAS_ENLACES.filter(t => t.ruta !== '/tramos-irpf-2026/'),
    informe: { ancla: '#irpf', texto: 'Ver la escalera de tramos aplicada a tu sueldo' },
  };
}

function paginaComunidades() {
  const sueldos = [20000, 30000, 45000, 70000];
  const claves = Object.keys(REGIONES).filter(k => !REGIONES[k].foral);
  const fila = k =>
    [REGIONES[k].name, ...sueldos.map(b => eur(nomina(b, ANIO, { ...opts, ccaa: k }).salarioNeto))];
  const base45 = nomina(45000).salarioNeto;
  const extremos = claves
    .map(k => ({ k, v: nomina(45000, ANIO, { ...opts, ccaa: k }).salarioNeto }))
    .sort((a, b) => b.v - a.v);
  return {
    tipo: 'tema',
    ruta: '/irpf-por-comunidades-2026/',
    estado: { bruto: 45000 },
    titulo: `IRPF por comunidades ${ANIO}: cuánto cambia tu sueldo neto`,
    descripcion: `Cuánto cambia el sueldo neto según la comunidad en ${ANIO}: tramos autonómicos de Madrid, Cataluña, Andalucía y la C. Valenciana frente a la escala general.`,
    miga: [{ nombre: 'Inicio', ruta: '/' }, { nombre: 'IRPF por comunidades', ruta: '/irpf-por-comunidades-2026/' }],
    sello: `IRPF ${ANIO} · comunidades autónomas`,
    h1: `El mismo sueldo, distinto neto según la comunidad`,
    entradilla: `El IRPF se reparte entre el Estado y las comunidades autónomas, y cada comunidad fija su parte de la escala. Con 45.000 € brutos, entre ${REGIONES[extremos[0].k].name} y ${REGIONES[extremos[extremos.length - 1].k].name} hay **${eur(extremos[0].v - extremos[extremos.length - 1].v)}** netos al año de diferencia.`,
    cifras: extremos.map(e => ({ k: REGIONES[e.k].name, v: eur(e.v), nota: e.v === base45 ? 'escala general' : `${e.v >= base45 ? '+' : '−'}${eur(Math.abs(e.v - base45))} frente a la general` })),
    secciones: [
      {
        titulo: 'Neto anual por comunidad y sueldo',
        parrafos: ['Asalariado soltero, sin hijos, con contrato indefinido. La columna es el salario bruto anual; cada celda, lo que llega a la cuenta en el año.'],
        tabla: {
          cabeceras: ['Comunidad', ...sueldos.map(b => `${num(b / 1000)}.000 €`)],
          filas: claves.map(fila),
          nota: 'La fila «Estándar» agrupa las comunidades cuya escala autonómica es cercana a la general. País Vasco y Navarra tienen régimen foral propio y no se incluyen.',
        },
      },
      {
        titulo: 'Por qué cambia',
        parrafos: claves.filter(k => k !== 'default').map(k => `**${REGIONES[k].name}.** ${REGIONES[k].desc}`),
      },
    ],
    preguntas: [
      { p: '¿En qué comunidad se paga menos IRPF?', r: `Entre las calculadas aquí, con 45.000 € brutos el neto más alto corresponde a ${REGIONES[extremos[0].k].name} (${eur(extremos[0].v)}) y el más bajo a ${REGIONES[extremos[extremos.length - 1].k].name} (${eur(extremos[extremos.length - 1].v)}).` },
    ],
    enlaces: TEMAS_ENLACES.filter(t => t.ruta !== '/irpf-por-comunidades-2026/'),
    informe: { ancla: '#portada', texto: 'Elige tu comunidad en el perfil y recalcula el informe' },
  };
}

function paginaCuna() {
  const paises = CUNA_OCDE_2025.filter(p => !p.media);
  const orden = [...paises].sort((a, b) => b.total - a.total);
  const es = paises.find(p => p.code === 'ES');
  const media = CUNA_OCDE_2025.find(p => p.media);
  const puesto = orden.findIndex(p => p.code === 'ES') + 1;
  const tuya = nomina(35000);
  return {
    tipo: 'tema',
    ruta: '/cuna-fiscal-espana-ocde/',
    estado: { bruto: 35000 },
    titulo: `Cuña fiscal en España: ${pct(es.total)} frente al ${pct(media.total)} de la OCDE`,
    descripcion: `La cuña fiscal de España es del ${pct(es.total)} del coste laboral, la ${puesto}.ª más alta de ${paises.length} países de la OCDE. Cuánto es IRPF y cuánto cotización.`,
    miga: [{ nombre: 'Inicio', ruta: '/' }, { nombre: 'Cuña fiscal', ruta: '/cuna-fiscal-espana-ocde/' }],
    sello: `Cuña fiscal · OCDE ${CUNA_OCDE_META.ejercicio}`,
    h1: `La cuña fiscal en España: ${pct(es.total)} del coste laboral`,
    entradilla: `La cuña fiscal es la parte del coste laboral que no llega al trabajador: IRPF más cotizaciones del trabajador y de la empresa. Para el caso estándar de la OCDE, en España es del **${pct(es.total)}**, la **${puesto}.ª más alta** de ${paises.length} países; la media es del ${pct(media.total)}.`,
    cifras: [
      { k: 'España', v: pct(es.total), destacada: true, nota: `puesto ${puesto} de ${paises.length}` },
      { k: 'Media OCDE', v: pct(media.total) },
      { k: 'IRPF en España', v: pct(es.irpf), nota: `media ${pct(media.irpf)}` },
      { k: 'Cotización de la empresa', v: pct(es.cotEmp), nota: `media ${pct(media.cotEmp)}` },
    ],
    secciones: [
      {
        titulo: 'Qué la hace distinta',
        parrafos: [
          `España no destaca por el IRPF (${pct(es.irpf)} del coste laboral frente al ${pct(media.irpf)} de media) ni por la cotización del trabajador (${pct(es.cotTrab)} frente a ${pct(media.cotTrab)}), sino por la **cotización empresarial**: ${pct(es.cotEmp)}, casi el doble de la media. Por eso la nómina muestra una carga menor que la que soporta el puesto de trabajo.`,
          `Con un bruto de 35.000 € en ${ANIO}, la cuña calculada con las reglas españolas es del ${pct(tuya.cunaFiscal * 100)}: de ${eur(tuya.costeLab)} de coste laboral, llegan ${eur(tuya.salarioNeto)}.`,
        ],
      },
      {
        titulo: 'Los países con más y menos cuña',
        parrafos: [`Persona soltera, sin hijos, con el salario medio de su país. Datos de ${CUNA_OCDE_META.ejercicio}, ${CUNA_OCDE_META.informe}, tabla ${CUNA_OCDE_META.tabla}.`],
        tabla: {
          cabeceras: ['País', 'Cuña total', 'IRPF', 'SS trabajador', 'SS empresa'],
          filas: [...orden.slice(0, 8), ...(puesto > 8 && puesto <= orden.length - 5 ? [es] : []), ...orden.slice(-5)].map(p => [
            p.pais, pct(p.total), pct(p.irpf), pct(p.cotTrab), pct(p.cotEmp),
          ]),
        },
      },
    ],
    preguntas: [
      { p: '¿Qué es la cuña fiscal?', r: 'La diferencia entre lo que cuesta un trabajador a la empresa y lo que ese trabajador recibe neto, expresada como porcentaje del coste laboral. Incluye el IRPF y las cotizaciones de trabajador y empresa; no incluye el IVA ni otros impuestos indirectos.' },
    ],
    enlaces: TEMAS_ENLACES.filter(t => t.ruta !== '/cuna-fiscal-espana-ocde/'),
    informe: { ancla: '#cuna', texto: 'Ver los 38 países de la OCDE, uno a uno' },
    fuente: { texto: `OCDE — ${CUNA_OCDE_META.informe}`, url: CUNA_OCDE_META.fuente },
  };
}

function paginaSalarioMedio() {
  const ofi = DISTRIBUCION_SALARIAL_OFICIAL[ULTIMO_ANIO_SALARIAL_OFICIAL];
  const d = DISTRIBUCION_SALARIAL[ANIO];
  const d12 = DISTRIBUCION_SALARIAL_OFICIAL[2012];
  const realMediana12 = d12.p50 * INFLACION_A_2026[2012];
  const realMediana24 = ofi.p50 * INFLACION_A_2026[ULTIMO_ANIO_SALARIAL_OFICIAL];
  return {
    tipo: 'tema',
    ruta: '/salario-medio-espana/',
    estado: { bruto: Math.round(d.p50 / 100) * 100 },
    titulo: `Salario medio y mediano en España: ${eur(ofi.media)} y ${eur(ofi.p50)} (INE ${ULTIMO_ANIO_SALARIAL_OFICIAL})`,
    descripcion: `El salario medio en España es de ${eur(ofi.media)} brutos al año y el mediano, ${eur(ofi.p50)} (INE, ${ULTIMO_ANIO_SALARIAL_OFICIAL}). Percentiles, evolución desde 2012 y cuánto queda en neto.`,
    miga: [{ nombre: 'Inicio', ruta: '/' }, { nombre: 'Salario medio', ruta: '/salario-medio-espana/' }],
    sello: `Distribución salarial · INE`,
    h1: 'Salario medio y salario mediano en España',
    entradilla: `Según la Encuesta Anual de Estructura Salarial del INE, en ${ULTIMO_ANIO_SALARIAL_OFICIAL} el salario **medio** fue de **${eur(ofi.media)}** brutos al año y el **mediano** —el que deja a la mitad por debajo— de **${eur(ofi.p50)}**. La media es más alta porque los sueldos altos tiran de ella.`,
    cifras: [
      { k: `Mediana ${ULTIMO_ANIO_SALARIAL_OFICIAL}`, v: eur(ofi.p50), destacada: true },
      { k: `Media ${ULTIMO_ANIO_SALARIAL_OFICIAL}`, v: eur(ofi.media) },
      { k: `Neto de la mediana en ${ANIO}`, v: eur(nomina(d.p50).salarioNeto), nota: `sobre ${eur(d.p50)} proyectados` },
      { k: 'Percentil 90', v: eur(ofi.p90), nota: 'cobra más que 9 de cada 10' },
    ],
    secciones: [
      {
        titulo: 'Los percentiles',
        parrafos: [`El INE publica cinco puntos de la distribución. Los de ${ANIO} son una proyección propia (+3,2 % anual sobre ${ULTIMO_ANIO_SALARIAL_OFICIAL}), no un dato publicado.`],
        tabla: {
          cabeceras: ['Punto', `${ULTIMO_ANIO_SALARIAL_OFICIAL} · INE`, `${ANIO} · proyección`, `Neto ${ANIO}`],
          filas: [['P10', 'p10'], ['P25', 'p25'], ['Mediana', 'p50'], ['Media', 'media'], ['P75', 'p75'], ['P90', 'p90']].map(([n, k]) => [
            n, eur(ofi[k]), eur(d[k]), eur(nomina(d[k]).salarioNeto),
          ]),
        },
      },
      {
        titulo: 'Desde 2012',
        parrafos: [
          `En euros corrientes la mediana pasó de ${eur(d12.p50)} en 2012 a ${eur(ofi.p50)} en ${ULTIMO_ANIO_SALARIAL_OFICIAL}. Descontada la inflación, en euros de ${ANIO}, pasó de ${eur(realMediana12)} a ${eur(realMediana24)}: ${realMediana24 >= realMediana12 ? `un ${pct(((realMediana24 / realMediana12) - 1) * 100)} más de poder adquisitivo` : `un ${pct((1 - realMediana24 / realMediana12) * 100)} menos de poder adquisitivo`}.`,
        ],
        tabla: {
          cabeceras: ['Año', 'Mediana', 'Media'],
          filas: Object.entries(DISTRIBUCION_SALARIAL_OFICIAL).map(([a, v]) => [a, eur(v.p50), eur(v.media)]),
        },
      },
    ],
    preguntas: [
      { p: '¿Cuál es el salario medio en España?', r: `${eur(ofi.media)} brutos al año en ${ULTIMO_ANIO_SALARIAL_OFICIAL}, último dato publicado por el INE (Encuesta Anual de Estructura Salarial). El salario mediano fue de ${eur(ofi.p50)}.` },
      { p: '¿Qué diferencia hay entre salario medio y mediano?', r: 'El medio es el promedio de todos los salarios; el mediano, el que deja a la mitad de los asalariados por encima y a la otra mitad por debajo. Como los salarios altos elevan el promedio, el mediano describe mejor el sueldo habitual.' },
    ],
    enlaces: TEMAS_ENLACES.filter(t => t.ruta !== '/salario-medio-espana/'),
    informe: { ancla: '#lugar', texto: 'Ver en qué percentil está tu sueldo' },
    fuente: { texto: 'INE — Encuesta Anual de Estructura Salarial, tabla 28191', url: 'https://www.ine.es/jaxiT3/Tabla.htm?t=28191' },
  };
}

function paginaSMI() {
  const smi = SMI_ANUAL[ANIO];
  const n = nomina(smi);
  const historia = ANIOS.map(a => {
    const s = SMI_ANUAL[a];
    const r = nomina(s, a);
    return [String(a), eur(s), eur(s / 14), eur(r.salarioNeto), eur(r.irpfFinal)];
  });
  return {
    tipo: 'tema',
    ruta: '/smi-2026-neto/',
    estado: { bruto: Math.round(smi) },
    titulo: `SMI ${ANIO} en neto: ${eur(n.salarioNeto)} al año, ${eur(n.salarioNeto / 14)} al mes en 14 pagas`,
    descripcion: `El salario mínimo de ${ANIO} es de ${eur(smi)} brutos al año (${eur(smi / 14)} en 14 pagas). En neto quedan ${eur(n.salarioNeto)}: no paga IRPF y cotiza ${eur(n.cotTra)} a la Seguridad Social.`,
    miga: [{ nombre: 'Inicio', ruta: '/' }, { nombre: `SMI ${ANIO}`, ruta: '/smi-2026-neto/' }],
    sello: `Salario mínimo ${ANIO}`,
    h1: `El salario mínimo de ${ANIO}, en neto`,
    entradilla: `El SMI de ${ANIO} es de **${eur(smi)} brutos al año**: ${eur(smi / 14)} al mes en 14 pagas. Quien lo cobra **no paga IRPF** y, tras la cotización a la Seguridad Social, recibe **${eur(n.salarioNeto)} netos**: ${eur(n.salarioNeto / 14)} por paga.`,
    cifras: [
      { k: 'SMI bruto anual', v: eur(smi) },
      { k: 'Neto anual', v: eur(n.salarioNeto), destacada: true },
      { k: 'Neto por paga · 14', v: eur(n.salarioNeto / 14) },
      { k: 'IRPF', v: eur(n.irpfFinal), nota: 'retención nula' },
    ],
    secciones: [
      {
        titulo: 'Por qué no paga IRPF',
        parrafos: [
          `El mínimo personal (5.550 €), la reducción por rendimientos del trabajo del artículo 20 y, desde 2025, una deducción específica para salarios cercanos al SMI (${eur(n.deduccionSMI)} en ${ANIO}) dejan la cuota en cero. La deducción se reduce a partir del SMI y desaparece en torno a los ${eur(smi + n.deduccionSMI / 0.2)} brutos.`,
          `La cotización del trabajador sí se paga: ${eur(n.cotTra)} al año. La empresa, además, cotiza ${eur(n.cotEmp)}, así que un puesto con el salario mínimo cuesta ${eur(n.costeLab)}.`,
        ],
      },
      {
        titulo: 'El SMI desde 2012',
        parrafos: ['Salario mínimo anual y neto de cada año con las reglas de ese año, en euros corrientes.'],
        tabla: { cabeceras: ['Año', 'SMI anual', 'Por paga (14)', 'Neto anual', 'IRPF'], filas: historia },
      },
    ],
    preguntas: [
      { p: `¿Cuánto es el SMI ${ANIO} en neto?`, r: `${eur(n.salarioNeto)} al año, ${eur(n.salarioNeto / 14)} por paga en 14 pagas o ${eur(n.salarioNeto / 12)} en 12.` },
      { p: '¿El salario mínimo paga IRPF?', r: `No. En ${ANIO} la retención de IRPF sobre el SMI es cero; sólo se descuenta la cotización a la Seguridad Social.` },
    ],
    enlaces: TEMAS_ENLACES.filter(t => t.ruta !== '/smi-2026-neto/'),
    informe: { ancla: '#nomina', texto: 'Ver la nómina del salario mínimo, paso a paso' },
  };
}

function paginaMarginal() {
  const sueldos = [15000, 18000, 20000, 25000, 30000, 35000, 40000, 50000, 60000, 80000, 100000];
  let pico = { b: 0, m: 0 };
  for (let b = 12000; b <= 30000; b += 100) {
    const m = calcularTipoMarginal(b, ANIO, opts).tipoMarginalTotal;
    if (m > pico.m) pico = { b, m };
  }
  return {
    tipo: 'tema',
    ruta: '/tipo-marginal-y-tipo-efectivo/',
    estado: { bruto: 35000 },
    titulo: `Tipo marginal y tipo efectivo del IRPF: qué diferencia hay (${ANIO})`,
    descripcion: `El marginal es lo que pagas por el siguiente euro; el efectivo, sobre todo el sueldo. Ambos de 15.000 a 100.000 € en ${ANIO}, y por qué el marginal llega al ${pct(pico.m * 100, 0)}.`,
    miga: [{ nombre: 'Inicio', ruta: '/' }, { nombre: 'Tipo marginal y efectivo', ruta: '/tipo-marginal-y-tipo-efectivo/' }],
    sello: `IRPF ${ANIO} · marginal y efectivo`,
    h1: 'Tipo marginal y tipo efectivo: dos preguntas distintas',
    entradilla: `El **tipo efectivo** es todo el IRPF dividido entre todo el bruto. El **tipo marginal** es lo que se llevan IRPF y cotización del siguiente euro que ganes. Con 35.000 € brutos en ${ANIO}, el efectivo del IRPF es del ${pct(nomina(35000).tipoEfectivoIRPF * 100)} y el marginal combinado, del ${pct(calcularTipoMarginal(35000, ANIO, opts).tipoMarginalTotal * 100)}.`,
    cifras: [
      { k: 'Marginal máximo por debajo de 30.000 €', v: pct(pico.m * 100, 0), nota: `en torno a ${eur(pico.b)}`, destacada: true },
      { k: 'Efectivo IRPF con 35.000 €', v: pct(nomina(35000).tipoEfectivoIRPF * 100) },
    ],
    secciones: [
      {
        titulo: 'Los dos tipos, sueldo a sueldo',
        parrafos: [`Asalariado soltero, sin hijos, escala general, ${ANIO}. El marginal incluye IRPF y cotización del trabajador.`],
        tabla: {
          cabeceras: ['Bruto anual', 'Efectivo IRPF', 'Efectivo total', 'Marginal total'],
          filas: sueldos.map(b => {
            const n = nomina(b);
            const m = calcularTipoMarginal(b, ANIO, opts);
            return [{ texto: eur(b), ruta: SUELDOS.includes(b) ? rutaSueldo(b) : null }, pct(n.tipoEfectivoIRPF * 100), pct(n.tipoEfectivoTotal * 100), pct(m.tipoMarginalTotal * 100)];
          }),
        },
      },
      {
        titulo: `Por qué el marginal llega al ${pct(pico.m * 100, 0)}`,
        parrafos: [
          `Entre unos ${eur(Math.round(getArt20Meta(ANIO).uInf / (1 - obtenerParametros(ANIO).tipoTra) / 100) * 100)} y ${eur(Math.round(getArt20Meta(ANIO).uSup / (1 - obtenerParametros(ANIO).tipoTra) / 100) * 100)} brutos se retira la reducción por rendimientos del trabajo del artículo 20. Cada euro más de sueldo aumenta la base imponible en más de un euro, porque además se pierde parte de la reducción. En torno a ${eur(pico.b)}, de cada 100 € de subida llegan ${num(100 - pico.m * 100)} €.`,
          'No hay un tramo del IRPF con ese tipo: es el efecto combinado del tramo y de la reducción que desaparece. Afecta sólo a los euros que caen en esa franja, nunca al sueldo entero.',
        ],
      },
    ],
    preguntas: [
      { p: '¿Qué es el tipo marginal?', r: 'El porcentaje de un euro adicional de sueldo que se va en impuestos y cotizaciones. Decide cuánto te llega de una subida o de una hora extra.' },
      { p: '¿Qué es el tipo efectivo?', r: 'El impuesto total dividido entre la renta total. Siempre es menor que el tipo del último tramo, porque los primeros euros tributan a tipos más bajos o a cero.' },
    ],
    enlaces: TEMAS_ENLACES.filter(t => t.ruta !== '/tipo-marginal-y-tipo-efectivo/'),
    informe: { ancla: '#fig-07', texto: 'Ver las tres curvas en toda la escala de sueldos' },
  };
}

function paginaArt20() {
  const meta = getArt20Meta(ANIO);
  const años = [2012, 2015, 2019, 2023, 2024, ANIO];
  return {
    tipo: 'tema',
    ruta: '/reduccion-rendimientos-trabajo-articulo-20/',
    estado: { bruto: 18000 },
    titulo: `Reducción del artículo 20 del IRPF en ${ANIO}: hasta ${eur(meta.rMax)}`,
    descripcion: `En ${ANIO} la reducción por rendimientos del trabajo resta hasta ${eur(meta.rMax)} de la base y desaparece desde ${eur(meta.uSup)} de rendimiento. Cómo se calcula y qué efecto tiene.`,
    miga: [{ nombre: 'Inicio', ruta: '/' }, { nombre: 'Reducción del art. 20', ruta: '/reduccion-rendimientos-trabajo-articulo-20/' }],
    sello: `LIRPF art. 20 · ${ANIO}`,
    h1: 'La reducción por rendimientos del trabajo del artículo 20',
    entradilla: `Los asalariados con rendimientos netos bajos restan una cantidad fija de su base imponible. En ${ANIO} es de **${eur(meta.rMax)}** hasta ${eur(meta.uInf)} de rendimiento neto, baja después y **desaparece a partir de ${eur(meta.uSup)}**.`,
    cifras: [
      { k: 'Reducción máxima', v: eur(meta.rMax), destacada: true },
      { k: 'Se aplica entera hasta', v: eur(meta.uInf), nota: 'de rendimiento neto' },
      { k: 'Desaparece desde', v: eur(meta.uSup) },
    ],
    secciones: [
      {
        titulo: 'Cómo ha cambiado',
        parrafos: ['Rendimiento neto previo: el bruto menos la cotización del trabajador. Euros nominales de cada año.'],
        tabla: {
          cabeceras: ['Año', 'Reducción máxima', 'Entera hasta', 'Llega a cero en'],
          filas: años.map(a => {
            const m = getArt20Meta(a);
            return [String(a), eur(m.rMax), eur(m.uInf), m.rMin > 0 ? `mínimo de ${eur(m.rMin)}` : eur(m.uSup)];
          }),
          nota: '2018 aplicó un régimen transitorio, media de los de 2017 y 2019.',
        },
      },
      {
        titulo: 'El acantilado',
        parrafos: [
          `Mientras la reducción se retira, cada euro de sueldo sube la base imponible en más de un euro. El resultado es un tipo marginal combinado muy superior al de los tramos: con un bruto en torno a ${eur(18000)} en ${ANIO}, de cada 1.000 € de subida llegan ${eur(nomina(19000).salarioNeto - nomina(18000).salarioNeto)}.`,
        ],
      },
    ],
    preguntas: [
      { p: '¿Quién tiene derecho a la reducción del artículo 20?', r: `Los contribuyentes con rendimientos del trabajo cuyo rendimiento neto no supere ${eur(meta.uSup)} en ${ANIO} y que no tengan otras rentas superiores a 6.500 €. Se aplica automáticamente en la retención.` },
    ],
    enlaces: TEMAS_ENLACES.filter(t => t.ruta !== '/reduccion-rendimientos-trabajo-articulo-20/'),
    informe: { ancla: '#fig-08', texto: 'Ver el acantilado del artículo 20 en la figura' },
    fuente: { texto: 'BOE — Ley 35/2006 del IRPF, artículo 20', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1#a20' },
  };
}

function paginaDeflactar() {
  const sueldos = [20000, 30000, 45000, 60000];
  const filas = sueldos.map(b => {
    const inf = INFLACION_A_2026[2012];
    const n12 = nomina(b / inf, 2012);
    const neto12 = n12.salarioNeto * inf;
    const n26 = nomina(b);
    return { b, neto12, neto26: n26.salarioNeto, ef12: n12.tipoEfectivoTotal, ef26: n26.tipoEfectivoTotal };
  });
  const f30 = filas[1];
  return {
    tipo: 'tema',
    ruta: '/deflactar-irpf-progresividad-en-frio/',
    estado: { bruto: 30000 },
    titulo: 'Deflactar el IRPF: cuánto cuesta la progresividad en frío (2012–2026)',
    descripcion: `Con el poder adquisitivo de 2012, un sueldo de 30.000 € de ${ANIO} deja ${eur(Math.abs(f30.neto26 - f30.neto12))} ${f30.neto26 < f30.neto12 ? 'menos' : 'más'} netos al año. Qué es la progresividad en frío.`,
    miga: [{ nombre: 'Inicio', ruta: '/' }, { nombre: 'Progresividad en frío', ruta: '/deflactar-irpf-progresividad-en-frio/' }],
    sello: 'Inflación y fiscalidad · 2012–2026',
    h1: 'Progresividad en frío: lo que la inflación hace con el IRPF',
    entradilla: `Si tu sueldo sube justo lo que suben los precios, tu poder adquisitivo no cambia; pero si los tramos, mínimos y reducciones del IRPF no suben con él, pagas un porcentaje mayor. Eso es la **progresividad en frío**, y **deflactar la tarifa** es actualizar esos umbrales con la inflación.`,
    cifras: [
      { k: 'Inflación acumulada 2012–2026', v: pct((INFLACION_A_2026[2012] - 1) * 100) },
      { k: 'Carga con 30.000 € de 2026', v: pct(f30.ef26 * 100), nota: `${pct(f30.ef12 * 100)} con las reglas de 2012` },
    ],
    secciones: [
      {
        titulo: 'Mismo poder adquisitivo, reglas de cada año',
        parrafos: [`Cada sueldo se expresa en euros de ${ANIO} y se lleva a 2012 con el IPC de diciembre del INE. Se calcula la nómina con las reglas de 2012, se devuelve a euros de ${ANIO} y se compara con la de ${ANIO}.`],
        tabla: {
          cabeceras: [`Bruto (€ de ${ANIO})`, 'Neto con reglas de 2012', `Neto con reglas de ${ANIO}`, 'Diferencia'],
          filas: filas.map(f => [eur(f.b), eur(f.neto12), eur(f.neto26), `${f.neto26 >= f.neto12 ? '+' : '−'}${eur(Math.abs(f.neto26 - f.neto12))}`]),
          nota: 'Asalariado soltero, sin hijos, escala general. Entre 2012 y 2026 hubo reformas (2015, 2019, 2023) que también mueven el resultado: la diferencia no es sólo inflación.',
        },
      },
    ],
    preguntas: [
      { p: '¿Qué significa deflactar el IRPF?', r: 'Actualizar con la inflación los importes que delimitan tramos, mínimos, reducciones y deducciones. No cambia los tipos: evita que una subida salarial que sólo compensa los precios lleve al contribuyente a pagar un porcentaje mayor.' },
    ],
    enlaces: TEMAS_ENLACES.filter(t => t.ruta !== '/deflactar-irpf-progresividad-en-frio/'),
    informe: { ancla: '#historia', texto: 'Ver quince años de fiscalidad con el mismo poder adquisitivo' },
  };
}

function paginaCotizaciones() {
  const p = obtenerParametros(ANIO);
  const c = conceptosCotizacion(ANIO);
  const ej = nomina(35000);
  return {
    tipo: 'tema',
    ruta: '/cotizaciones-seguridad-social-2026/',
    estado: { bruto: 35000 },
    titulo: `Cotizaciones a la Seguridad Social ${ANIO}: tipos, MEI y base máxima`,
    descripcion: `En ${ANIO} el trabajador cotiza el ${pct(p.tipoTra * 100, 2)} de su base y la empresa, el ${pct(p.tipoEmp * 100, 2)}. Base máxima de ${eur(p.baseMax)}, MEI y cotización de solidaridad, concepto a concepto.`,
    miga: [{ nombre: 'Inicio', ruta: '/' }, { nombre: `Cotizaciones ${ANIO}`, ruta: '/cotizaciones-seguridad-social-2026/' }],
    sello: `Seguridad Social ${ANIO} · régimen general`,
    h1: `Cotizaciones a la Seguridad Social en ${ANIO}`,
    entradilla: `En el régimen general, el trabajador cotiza el **${pct(p.tipoTra * 100, 2)}** de su base de cotización y la empresa el **${pct(p.tipoEmp * 100, 2)}**. La base es el sueldo bruto, con un tope de **${eur(p.baseMax)}** al año en ${ANIO}.`,
    cifras: [
      { k: 'Trabajador', v: pct(p.tipoTra * 100, 2), destacada: true },
      { k: 'Empresa', v: pct(p.tipoEmp * 100, 2) },
      { k: 'Base máxima anual', v: eur(p.baseMax) },
      { k: 'MEI total', v: pct((p.mei[0] + p.mei[1]) * 100, 2), nota: `${pct(p.mei[0] * 100, 2)} empresa · ${pct(p.mei[1] * 100, 2)} trabajador` },
    ],
    secciones: [
      {
        titulo: 'Concepto a concepto',
        parrafos: ['Contrato indefinido. Los tipos de desempleo son mayores en contratos temporales y el de accidentes de trabajo depende de la actividad de la empresa.'],
        tabla: {
          cabeceras: ['Concepto', 'Empresa', 'Trabajador'],
          filas: c.empresa.map(([nombre, t]) => {
            const tra = c.trabajador.find(x => x[0] === nombre);
            return [nombre, pct(t * 100, 2), tra ? pct(tra[1] * 100, 2) : '—'];
          }).concat([['Total', pct(c.tipoEmp * 100, 2), pct(c.tipoTra * 100, 2)]]),
        },
      },
      {
        titulo: 'Un ejemplo',
        parrafos: [
          `Con 35.000 € brutos, el trabajador cotiza ${eur(ej.cotTra)} al año y la empresa ${eur(ej.cotEmp)}. En total, ${eur(ej.cotTra + ej.cotEmp)}: más que el IRPF de ese sueldo (${eur(ej.irpfFinal)}).`,
          `Por encima de la base máxima, desde 2025 se paga además la **cotización de solidaridad** sobre la parte del sueldo que la supera, repartida entre empresa (cinco sextos) y trabajador (un sexto).`,
        ],
      },
    ],
    preguntas: [
      { p: `¿Cuánto cotiza un trabajador en ${ANIO}?`, r: `El ${pct(p.tipoTra * 100, 2)} de su base: 4,70 % por contingencias comunes, 1,55 % por desempleo, 0,10 % por formación profesional y ${pct(p.mei[1] * 100, 2)} de MEI.` },
      { p: '¿Qué es el MEI?', r: 'El Mecanismo de Equidad Intergeneracional: una cotización adicional, en vigor desde 2023, que refuerza el Fondo de Reserva de las pensiones. Sube cada año hasta 2029.' },
    ],
    enlaces: TEMAS_ENLACES.filter(t => t.ruta !== '/cotizaciones-seguridad-social-2026/'),
    informe: { ancla: '#fig-03', texto: 'Ver cada cotización aplicada a tu sueldo' },
    fuente: { texto: 'TGSS — Bases y tipos de cotización', url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537' },
  };
}

function paginaCoste() {
  const sueldos = [17094, 20000, 25000, 30000, 35000, 40000, 50000, 60000, 80000];
  const e = nomina(30000);
  return {
    tipo: 'tema',
    ruta: '/coste-empresa-trabajador/',
    estado: { bruto: 30000 },
    titulo: `Cuánto cuesta un trabajador a la empresa en ${ANIO}`,
    descripcion: `Un sueldo de 30.000 € brutos cuesta ${eur(e.costeLab)} a la empresa en ${ANIO}. Tabla de coste laboral, cotización empresarial y neto del trabajador para cada sueldo.`,
    miga: [{ nombre: 'Inicio', ruta: '/' }, { nombre: 'Coste para la empresa', ruta: '/coste-empresa-trabajador/' }],
    sello: `Coste laboral ${ANIO}`,
    h1: 'Lo que cuesta un trabajador y lo que le llega',
    entradilla: `El coste de un puesto de trabajo es el sueldo bruto más la cotización de la empresa a la Seguridad Social, el ${pct(obtenerParametros(ANIO).tipoEmp * 100, 2)} de la base en ${ANIO}. Con 30.000 € brutos, el puesto cuesta **${eur(e.costeLab)}** y al trabajador le llegan **${eur(e.salarioNeto)}**.`,
    cifras: [
      { k: 'Coste de 30.000 € brutos', v: eur(e.costeLab), destacada: true },
      { k: 'Llega al trabajador', v: eur(e.salarioNeto), nota: `${dec((e.salarioNeto / e.costeLab) * 100)} € de cada 100` },
    ],
    secciones: [
      {
        titulo: 'Coste, bruto y neto',
        parrafos: [`Asalariado con contrato indefinido, soltero, sin hijos, escala general, ${ANIO}.`],
        tabla: {
          cabeceras: ['Bruto anual', 'Cotización empresa', 'Coste laboral', 'Neto', 'Llega de cada 100 €'],
          filas: sueldos.map(b => {
            const n = nomina(b);
            return [{ texto: eur(b), ruta: SUELDOS.includes(b) ? rutaSueldo(b) : null }, eur(n.cotEmp), eur(n.costeLab), eur(n.salarioNeto), `${dec((n.salarioNeto / n.costeLab) * 100)} €`];
          }),
          nota: 'La primera fila es el salario mínimo de 2026.',
        },
      },
    ],
    preguntas: [
      { p: '¿Cuánto paga la empresa por un trabajador además del sueldo?', r: `La cotización empresarial a la Seguridad Social: el ${pct(obtenerParametros(ANIO).tipoEmp * 100, 2)} del bruto hasta la base máxima (${eur(obtenerParametros(ANIO).baseMax)}). Con 30.000 € brutos son ${eur(e.cotEmp)} al año.` },
    ],
    enlaces: TEMAS_ENLACES.filter(t => t.ruta !== '/coste-empresa-trabajador/'),
    informe: { ancla: '#viaje', texto: 'Seguir cada euro del coste laboral hasta la cuenta' },
  };
}

/* Los enlaces entre páginas temáticas: una red pequeña y completa. */
export const TEMAS_ENLACES = [
  { ruta: '/sueldo-neto/', texto: 'Tabla de sueldo neto' },
  { ruta: '/tramos-irpf-2026/', texto: `Tramos del IRPF ${ANIO}` },
  { ruta: '/irpf-por-comunidades-2026/', texto: 'IRPF por comunidades' },
  { ruta: '/tipo-marginal-y-tipo-efectivo/', texto: 'Tipo marginal y efectivo' },
  { ruta: '/reduccion-rendimientos-trabajo-articulo-20/', texto: 'Reducción del art. 20' },
  { ruta: '/cotizaciones-seguridad-social-2026/', texto: `Cotizaciones ${ANIO}` },
  { ruta: '/coste-empresa-trabajador/', texto: 'Coste para la empresa' },
  { ruta: '/smi-2026-neto/', texto: `SMI ${ANIO} en neto` },
  { ruta: '/salario-medio-espana/', texto: 'Salario medio en España' },
  { ruta: '/cuna-fiscal-espana-ocde/', texto: 'Cuña fiscal y OCDE' },
  { ruta: '/deflactar-irpf-progresividad-en-frio/', texto: 'Progresividad en frío' },
];

const CONSTRUCTORES = {
  '/sueldo-neto/': paginaIndiceSueldos,
  '/tramos-irpf-2026/': paginaTramos,
  '/irpf-por-comunidades-2026/': paginaComunidades,
  '/tipo-marginal-y-tipo-efectivo/': paginaMarginal,
  '/reduccion-rendimientos-trabajo-articulo-20/': paginaArt20,
  '/cotizaciones-seguridad-social-2026/': paginaCotizaciones,
  '/coste-empresa-trabajador/': paginaCoste,
  '/smi-2026-neto/': paginaSMI,
  '/salario-medio-espana/': paginaSalarioMedio,
  '/cuna-fiscal-espana-ocde/': paginaCuna,
  '/deflactar-irpf-progresividad-en-frio/': paginaDeflactar,
};

/** Todas las rutas que existen, en el orden en que van al sitemap. */
export const RUTAS = [...Object.keys(CONSTRUCTORES), ...SUELDOS.map(rutaSueldo)];

/** Sueldos que las páginas temáticas enlazan desde su pie. */
export const DESTACADOS = SUELDOS_DESTACADOS.map(b => ({ ruta: rutaSueldo(b), texto: `${eur(b)} brutos` }));

/**
 * La página que corresponde a una ruta, o `null` si es la portada o no existe.
 * Acepta la ruta con o sin barra final y con `index.html`.
 */
export function paginaDeRuta(pathname = '/') {
  const limpia = `/${pathname.replace(/index\.html$/, '').replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
  if (limpia === '/') return null;
  const m = limpia.match(/^\/sueldo-neto\/(\d+)\/$/);
  if (m) {
    const b = Number(m[1]);
    return SUELDOS.includes(b) ? paginaSueldo(b) : null;
  }
  const c = CONSTRUCTORES[limpia];
  return c ? c() : null;
}

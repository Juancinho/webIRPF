import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import { conceptosCotizacion } from '../engine/irpf';
import Figure from '../figures/Figure';
import { dec, eur, pct } from '../utils/format';

const BOE = 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1';
const TGSS = 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537';

/**
 * FIG. 03 — EL DESGLOSE COMPLETO, DIBUJADO COMO LO QUE ES: UNA CASCADA.
 *
 * Cada bloque tiene un único carril de medida que ocupa todo el ancho de la
 * figura, y cada fila dibuja su barra **donde le toca dentro de ese carril**:
 * los hitos arrancan en cero y llegan a su importe; las restas flotan sobre el
 * tramo que se llevan, entre el nivel nuevo y el anterior. Un hilo vertical une
 * el final de una barra con el principio de la siguiente, así que la resta se
 * lee como un descuento sobre lo que había, no como una barra suelta.
 */
export default function Desglose() {
  const { bruto, anio, pagas, nomina, params, opts } = useFiscal();
  const [abierto, setAbierto] = useState('all');

  const esAutonomo = nomina.regimen === 'autonomo';

  const tramos = useMemo(() => {
    let prev = 0;
    const out = [];
    for (const [lim, tipo] of nomina.tramos) {
      const dentro = Math.max(0, Math.min(nomina.baseImponible, lim) - prev);
      if (dentro > 0 || prev < nomina.baseImponible) {
        out.push({ desde: prev, hasta: lim, tipo, dentro, cuota: dentro * tipo });
      }
      prev = lim;
      if (prev >= nomina.baseImponible) break;
    }
    return out;
  }, [nomina.tramos, nomina.baseImponible]);

  const limiteActivo = nomina.limiteRetencion < nomina.cuotaSMI && nomina.cuotaSMI > 0;
  const escalaCuota = Math.max(nomina.cuotaIntegra, nomina.minimoPersonalYFamiliar, 1);

  /* ── la cotización, concepto a concepto ───────────────────────────────
     El tipo agregado (32,15 % la empresa, 6,45 % tú) no explica nada por sí
     solo: sale de sumar seis conceptos con nombre y norma propios. Aquí se
     reconstruyen uno a uno sobre tu base real, y lo que la suma no alcanza a
     explicar —la cuota de solidaridad del exceso sobre la base máxima— se
     declara como fila aparte en vez de disimularse en el total. */
  const cot = useMemo(() => {
    const c = conceptosCotizacion(anio);
    const baseCot = Math.min(bruto, params.baseMax);
    const exceso = Math.max(0, bruto - params.baseMax);
    const empBase = baseCot * params.tipoEmp;
    const traBase = baseCot * params.tipoTra;
    const filas = (lista, importeTotal, base) => {
      const cuerpo = lista.map(([label, tipo]) => [label, pct(tipo * 100, 2), eur(base * tipo)]);
      const suma = lista.reduce((a, [, t]) => a + t, 0);
      const solid = importeTotal - base * suma;
      if (solid > 0.5) {
        cuerpo.push(['Cuota de solidaridad sobre el exceso', '—', eur(solid)]);
      }
      return { cuerpo, suma, solid };
    };
    return {
      ...c,
      baseCot,
      exceso,
      empresa: filas(c.empresa, nomina.cotEmp, baseCot),
      trabajador: filas(c.trabajador, nomina.cotTra, baseCot),
      empBase,
      traBase,
    };
  }, [anio, bruto, params, nomina.cotEmp, nomina.cotTra]);

  const tablaCot = (lista, datos) => ({
    cabeceras: ['Concepto', 'Tipo', 'Sobre tu base'],
    filas: datos.cuerpo,
    total: [
      `Total${datos.solid > 0.5 ? ' (con solidaridad)' : ''}`,
      datos.solid > 0.5 ? '—' : pct(datos.suma * 100, 2),
      eur(lista === 'emp' ? nomina.cotEmp : nomina.cotTra),
    ],
  });

  const netoPor100 = (nomina.salarioNeto / Math.max(nomina.costeLab, 1)) * 100;
  const topeActivo = cot.exceso > 0;

  const bloques = [
    {
      titulo: 'Lo que cuesta tu puesto',
      intro: 'Antes de que exista una nómina ya hay un desembolso: lo que la empresa gasta por tenerte. De ahí sale todo lo demás.',
      escala: nomina.costeLab,
      escalaLabel: 'coste laboral',
      filas: [
        {
          flujo: 'total', tipo: 'hito', k: 'A', label: 'Coste laboral total', valor: nomina.costeLab,
          sub: 'Lo que tu empresa paga de verdad por ti',
          texto: esAutonomo
            ? 'En el régimen de autónomos no existe parte empresarial: el coste de tu actividad coincide con tu rendimiento íntegro, así que A y C son la misma cifra.'
            : 'Es el desembolso total de la empresa para tenerte contratado. Suma tu salario bruto (C) y la cotización que la empresa ingresa a la Seguridad Social por encima de tu sueldo (B). Tú nunca ves ese dinero en tu cuenta —no aparece en el recibo de nómina— pero forma parte del coste real de tu trabajo, y es el denominador que usa la OCDE para medir la cuña fiscal.',
          formulas: esAutonomo
            ? [['A = C', `${eur(bruto)}`]]
            : [
                ['A = C + B', 'salario bruto más cotización empresarial'],
                ['A', `${eur(bruto)} + ${eur(nomina.cotEmp)} = ${eur(nomina.costeLab)}`],
              ],
          remate: `De cada 100 € que le cuestas a la empresa, tú ves ${dec(netoPor100, 1)} € netos.`,
          fuente: ['TGSS — Bases y tipos de cotización', TGSS],
        },
        {
          flujo: 'resta', tipo: 'op', k: 'B', label: esAutonomo ? 'Sin cotización patronal' : 'Cotización de la empresa a la Seguridad Social',
          valor: -nomina.cotEmp,
          sub: esAutonomo ? 'No aplica en el RETA' : `${pct(params.tipoEmp * 100, 2)} de la base de cotización`,
          texto: esAutonomo
            ? 'Como autónomo asumes íntegramente tu cotización; no hay contraparte empresarial que ingrese nada por encima de tu rendimiento.'
            : `La empresa cotiza por ti sumando varios conceptos con nombre y norma propios: contingencias comunes, desempleo, FOGASA, formación profesional y accidentes de trabajo${params.mei[0] > 0 ? `, más el MEI —Mecanismo de Equidad Intergeneracional— que se añadió en 2023 como refuerzo del Fondo de Reserva de las pensiones` : ''}. Ninguno aparece en tu recibo. El tipo de desempleo corresponde a contrato indefinido (en temporal es mayor) y el de accidentes es el tipo medio: depende de la actividad de la empresa según la tarifa de primas.`,
          formulas: esAutonomo
            ? null
            : [
                ['B = base × tipo', `la base es el bruto topado en ${eur(params.baseMax)}`],
                ['B', `${eur(cot.baseCot)} × ${pct(params.tipoEmp * 100, 2)} = ${eur(cot.empBase)}`],
                ...(cot.empresa.solid > 0.5
                  ? [['B', `${eur(cot.empBase)} + ${eur(cot.empresa.solid)} de cuota de solidaridad = ${eur(nomina.cotEmp)}`]]
                  : []),
              ],
          tabla: esAutonomo ? null : tablaCot('emp', cot.empresa),
          remate: topeActivo && !esAutonomo
            ? `Tu bruto supera la base máxima de ${eur(params.baseMax)}: los ${eur(cot.exceso)} de exceso no cotizan al tipo ordinario, sólo soportan la cuota de solidaridad.`
            : null,
          fuente: ['TGSS — Bases y tipos de cotización', TGSS],
        },
        {
          flujo: 'total', tipo: 'hito', k: 'C', label: 'Salario bruto anual', valor: bruto,
          sub: 'La cifra que aparece en tu contrato',
          texto: 'Es la remuneración anual pactada, antes de practicar la cotización del trabajador y la retención de IRPF. Es la cifra de la que habla todo el mundo cuando dice «cuánto ganas», y la única de esta cascada que ya conocías al empezar.',
          formulas: [
            ...(esAutonomo ? [] : [['C = A − B', `${eur(nomina.costeLab)} − ${eur(nomina.cotEmp)} = ${eur(bruto)}`]]),
            ['En 12 pagas', `${eur(bruto)} ÷ 12 = ${eur(bruto / 12)} al mes`],
            ['En 14 pagas', `${eur(bruto)} ÷ 14 = ${eur(bruto / 14)} por paga`],
          ],
          remate: `Tu perfil está en ${pagas} pagas: ${eur(bruto / pagas)} brutos por paga.`,
        },
      ],
    },
    {
      titulo: 'Lo que se descuenta en la nómina',
      intro: 'La cotización del trabajador y la retención de IRPF son conceptos distintos, se calculan con bases distintas y se ingresan en organismos distintos.',
      escala: nomina.costeLab,
      escalaLabel: 'coste laboral',
      filas: [
        {
          flujo: 'resta', tipo: 'op', k: 'D', label: esAutonomo ? 'Cuota de autónomos' : 'Cotización del trabajador',
          valor: -nomina.cotTra,
          sub: esAutonomo ? 'Según el tramo de rendimientos netos' : `${pct(params.tipoTra * 100, 2)} de la base de cotización`,
          texto: esAutonomo
            ? 'Desde 2023 la cuota depende de los rendimientos netos previstos, repartidos en quince tramos (RDL 13/2022). No es un porcentaje del bruto, sino una cuota fija por tramo.'
            : `Es la primera línea de descuento de tu nómina, y la única que no es IRPF. Se calcula sobre la misma base que la de la empresa —el bruto topado en ${eur(params.baseMax)}— pero con tipos mucho menores, y se compone de estos conceptos:`,
          formulas: esAutonomo
            ? [['D', `base del tramo × 12 × tipo combinado = ${eur(nomina.cotTra)}`]]
            : [
                ['D = base × tipo', `la misma base que B`],
                ['D', `${eur(cot.baseCot)} × ${pct(params.tipoTra * 100, 2)} = ${eur(cot.traBase)}`],
                ...(cot.trabajador.solid > 0.5
                  ? [['D', `${eur(cot.traBase)} + ${eur(cot.trabajador.solid)} de cuota de solidaridad = ${eur(nomina.cotTra)}`]]
                  : []),
              ],
          tabla: esAutonomo ? null : tablaCot('tra', cot.trabajador),
          remate: esAutonomo
            ? null
            : `Por cada euro que cotizas tú, la empresa cotiza ${dec(params.tipoEmp / params.tipoTra, 1)}.`,
          fuente: ['TGSS — Bases y tipos de cotización', TGSS],
        },
        {
          flujo: 'total', tipo: 'hito', k: 'E', label: 'Rendimiento íntegro del trabajo', valor: nomina.rnPrevio,
          sub: 'El punto de partida del IRPF, no tu bruto',
          texto: 'Aquí empieza el impuesto. Las cotizaciones del trabajador se deducen antes de determinar el rendimiento sobre el que se calcula el IRPF, así que el impuesto nunca se aplica sobre tu bruto entero: se aplica sobre esta cifra, ya reducida.',
          formulas: [['E = C − D', `${eur(bruto)} − ${eur(nomina.cotTra)} = ${eur(nomina.rnPrevio)}`]],
          fuente: ['BOE — LIRPF art. 19', `${BOE}#a19`],
        },
      ],
    },
    {
      titulo: 'Cómo se obtiene la base imponible',
      intro: 'Estas partidas no son salidas adicionales de caja: reducen la magnitud sobre la que se calcula el impuesto.',
      escala: nomina.costeLab,
      escalaLabel: 'coste laboral',
      filas: [
        {
          flujo: 'resta', tipo: 'op', k: 'F', label: 'Gastos deducibles del art. 19.2.f', valor: -nomina.gastosFijos,
          sub: anio >= 2015 ? 'Los 2.000 € de «otros gastos»' : 'No existían antes de 2015',
          formulas: anio >= 2015
            ? [['F', `${eur(nomina.gastosFijos)} fijos, sin justificar gasto alguno`],
               ['E − F', `${eur(nomina.rnPrevio)} − ${eur(nomina.gastosFijos)} = ${eur(nomina.rendimientoNeto)}`]]
            : null,
          texto: anio >= 2015
            ? 'Cuantía general de otros gastos deducibles que se aplica sin acreditar gastos individuales. La Ley 26/2014 la introdujo con efectos desde 2015.'
            : 'No existía: la Ley 26/2014 la introdujo con efectos desde 2015.',
          fuente: ['BOE — LIRPF art. 19.2.f', `${BOE}#a19`],
        },
        {
          flujo: 'resta', tipo: 'op', k: 'G', label: 'Reducción por rendimientos del trabajo', valor: -nomina.redTrabajo,
          sub: nomina.redTrabajo > 0
            ? 'Art. 20 — reducción aplicable a determinados rendimientos bajos'
            : 'Art. 20 — agotada a tu nivel de renta',
          formulas: typeof params.art20Meta.uInf === 'number'
            ? [['Tramo plano', `${eur(params.art20Meta.rMax)} hasta ${eur(params.art20Meta.uInf)} de rendimiento`],
               ['Tramo de caída', `se retira hasta llegar a cero en ${eur(params.art20Meta.uSup)}`],
               ['G', `a tu nivel de renta, ${eur(nomina.redTrabajo)}`]]
            : [['Régimen transitorio', 'media entre la redacción de 2017 y la de 2019'],
               ['G', `a tu nivel de renta, ${eur(nomina.redTrabajo)}`]],
          texto: nomina.redTrabajo > 0
            ? `A tu nivel de renta la reducción es de ${eur(nomina.redTrabajo)}. Se retira progresivamente al subir el rendimiento, y esa retirada es el acantilado del capítulo 03.`
            : 'A tu nivel de renta esta reducción ya se ha agotado: sólo actúa por debajo del umbral superior del art. 20.',
          fuente: ['BOE — LIRPF art. 20', `${BOE}#a20`],
        },
        ...(nomina.reduccionConjunta > 0
          ? [{
              flujo: 'resta', tipo: 'op', k: 'G2', label: 'Reducción por tributación conjunta', valor: -nomina.reduccionConjunta,
              sub: 'Unidad familiar',
              formulas: [['G2', `${eur(nomina.reduccionConjunta)}, limitada al rendimiento neto disponible`]],
              texto: 'Reducción adicional por declarar de forma conjunta, limitada al rendimiento neto disponible.',
              fuente: ['BOE — LIRPF art. 84', `${BOE}#a84`],
            }]
          : []),
        {
          flujo: 'total', tipo: 'hito', k: 'H', label: 'Base imponible', valor: nomina.baseImponible, hueco: true,
          sub: 'No es dinero que se te descuente: es la cifra sobre la que se aplica la escala',
          formulas: [
            ['H = E − F − G' + (nomina.reduccionConjunta > 0 ? ' − G2' : ''), 'rendimiento íntegro menos gastos y reducciones'],
            ['H', `${eur(nomina.rnPrevio)} − ${eur(nomina.gastosFijos)} − ${eur(nomina.redTrabajo)}${nomina.reduccionConjunta > 0 ? ` − ${eur(nomina.reduccionConjunta)}` : ''} = ${eur(nomina.baseImponible)}`],
          ],
          texto: `Queda ${eur(bruto - nomina.baseImponible)} por debajo de tu bruto. Se dibuja hueca porque no es una salida de dinero, sino la magnitud que se grava.`,
        },
      ],
    },
    {
      titulo: 'Lo que sale de aplicar la escala',
      intro: 'Aquí está la progresividad: cada tramo grava sólo la parte de base que cae dentro de él.',
      // aquí las magnitudes son cuotas, un orden de magnitud menores: medirlas
      // contra el coste laboral las dejaría en hilos invisibles y engañosos
      escala: escalaCuota,
      escalaLabel: 'cuota íntegra y mínimo',
      filas: [
        {
          flujo: 'total', tipo: 'op', k: 'J', label: 'Cuota íntegra por tramos', valor: nomina.cuotaIntegra, suma: true,
          sub: `${tramos.length} tramo${tramos.length > 1 ? 's' : ''} aplicados sobre ${eur(nomina.baseImponible)}`,
          formulas: [
            ['J = Σ tramos', 'cada tipo, sólo sobre la parte de base que cae en su tramo'],
            ['J', tramos.map(t => `${eur(t.dentro)} × ${pct(t.tipo * 100)}`).join('  +  ') + ` = ${eur(nomina.cuotaIntegra)}`],
          ],
          texto: 'Ningún tipo se aplica nunca a todo tu sueldo: sólo al tramo de base que le corresponde.',
          fuente: ['BOE — LIRPF art. 63', `${BOE}#a63`],
          tabla: {
            cabeceras: ['Tramo de base', 'Tu base dentro', 'Tipo', 'Cuota que genera'],
            filas: tramos.map(t => [
              `${eur(t.desde)} — ${Number.isFinite(t.hasta) ? eur(t.hasta) : '∞'}`,
              eur(t.dentro),
              pct(t.tipo * 100),
              eur(t.cuota),
            ]),
            total: ['Cuota íntegra', '', '', eur(nomina.cuotaIntegra)],
          },
        },
        {
          flujo: 'ref', tipo: 'op', k: 'I', label: 'Mínimo personal y familiar', valor: nomina.minimoPersonalYFamiliar, hueco: true,
          sub: 'Magnitud legal que se convierte en cuota y se resta',
          formulas: [
            ['I', `${eur(nomina.minimoPersonal)} personal${nomina.minimoFamiliar > 0 ? ` + ${eur(nomina.minimoFamiliar)} familiar` : ''} = ${eur(nomina.minimoPersonalYFamiliar)}`],
          ],
          texto: `No se resta directamente de la base: se le aplica la escala y la cuota resultante se descuenta después, conforme al procedimiento de los arts. 56–61.${opts.nHijos > 0 ? ` Tus ${opts.nHijos} hijo${opts.nHijos > 1 ? 's' : ''} a cargo incorporan ${eur(nomina.minimoFamiliar)} al mínimo familiar.` : ''}`,
          fuente: ['BOE — LIRPF arts. 56-61', `${BOE}#a57`],
          tabla: nomina.minimoFamiliar > 0
            ? {
                cabeceras: ['Concepto', 'Importe'],
                filas: [
                  ['Mínimo del contribuyente', eur(nomina.minimoPersonal)],
                  ['Mínimo por descendientes y ascendientes', eur(nomina.minimoFamiliar)],
                ],
                total: ['Total', eur(nomina.minimoPersonalYFamiliar)],
              }
            : null,
        },
        {
          flujo: 'resta', tipo: 'op', k: 'K', label: 'Cuota del mínimo personal y familiar', valor: -nomina.cuotaMinimo,
          sub: 'Se resta de la cuota, no de la base',
          formulas: [
            ['K = escala(I)', `la misma escala aplicada a ${eur(nomina.minimoPersonalYFamiliar)} da ${eur(nomina.cuotaMinimo)}`],
            ['J − K', `${eur(nomina.cuotaIntegra)} − ${eur(nomina.cuotaMinimo)} = ${eur(nomina.cuotaTeorica)}`],
          ],
          texto: `La misma escala aplicada a ${eur(nomina.minimoPersonalYFamiliar)} produce ${eur(nomina.cuotaMinimo)}.`,
          fuente: ['BOE — LIRPF art. 63', `${BOE}#a63`],
        },
        ...(nomina.deduccionSMI > 0
          ? [{
              flujo: 'resta', tipo: 'op', k: 'L', label: 'Deducción por rendimientos del trabajo', valor: -nomina.deduccionSMI,
              sub: 'El descuento extra para salarios próximos al SMI',
              formulas: [['L', `${eur(nomina.cuotaTeorica)} − ${eur(nomina.deduccionSMI)} = ${eur(nomina.cuotaSMI)}`]],
              texto: 'Deducción directa en cuota que se retira progresivamente a medida que el salario se aleja del mínimo interprofesional.',
              fuente: [
                'AEAT — Deducción por obtención de rendimientos del trabajo',
                'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/deducciones-cuota-liquida-total/deduccion-obtencion-rendimientos-trabajo.html',
              ],
            }]
          : []),
        ...(limiteActivo
          ? [{
              flujo: 'ref', tipo: 'op', k: 'M', label: 'Límite del 43 % de retención', valor: nomina.limiteRetencion, hueco: true,
              sub: 'Un tope reglamentario que en tu caso manda sobre el cálculo',
              formulas: [['M', `(${eur(bruto)} − ${eur(params.minimoExento)}) × 43 % = ${eur(nomina.limiteRetencion)}`]],
              texto: 'La retención no puede superar el 43 % de la diferencia entre el bruto y el mínimo exento de retención. Ese tope es menor que la cuota calculada, así que es el que se aplica.',
              fuente: ['BOE — RIRPF art. 85.3', 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820'],
            }]
          : []),
        {
          flujo: 'total', tipo: 'hito', k: 'N', label: 'IRPF final', valor: nomina.irpfFinal,
          sub: `Tipo efectivo ${pct(nomina.tipoEfectivoIRPF * 100)} sobre el bruto`,
          formulas: [
            ['N = mín(L, M)', 'la cuota calculada, con el tope reglamentario de retención'],
            ['Tipo efectivo', `${eur(nomina.irpfFinal)} ÷ ${eur(bruto)} = ${pct(nomina.tipoEfectivoIRPF * 100)}`],
          ],
          texto: 'Retención anual estimada con los datos del perfil. La declaración puede regularizarla al incorporar el resto de circunstancias fiscales.',
        },
      ],
    },
    {
      titulo: 'Resultado neto estimado',
      intro: null,
      escala: nomina.costeLab,
      escalaLabel: 'coste laboral',
      filas: [
        {
          flujo: 'total', tipo: 'hito', k: 'O', label: 'Renta neta', valor: nomina.salarioNeto, total: true,
          sub: `${eur(nomina.salarioNeto / pagas)} al mes en ${pagas} pagas`,
          formulas: [
            ['O = C − D − N', 'bruto menos cotización menos IRPF'],
            ['O', `${eur(bruto)} − ${eur(nomina.cotTra)} − ${eur(nomina.irpfFinal)} = ${eur(nomina.salarioNeto)}`],
            ['Al mes', `${eur(nomina.salarioNeto)} ÷ ${pagas} = ${eur(nomina.salarioNeto / pagas)}`],
          ],
          texto: `De los ${eur(nomina.costeLab)} que costó tu trabajo llegan ${eur(nomina.salarioNeto)}: ${pct((nomina.salarioNeto / Math.max(nomina.costeLab, 1)) * 100)} del total.`,
        },
      ],
    },
  ];

  /* La geometría de la cascada: un nivel corriente que cada fila mueve.
     Los hitos van de cero a su importe; las restas flotan entre el nivel
     nuevo y el anterior; las referencias se dibujan huecas desde cero y no
     mueven el nivel. */
  let nivel = 0;
  const dibujo = bloques.map(bloque => {
    const filas = bloque.filas.map(f => {
      const esc = Math.max(bloque.escala, 1);
      const v = Math.abs(f.valor);
      let desde = 0;
      let hasta = v;
      if (f.flujo === 'resta') {
        hasta = nivel;
        desde = Math.max(0, nivel - v);
        nivel = desde;
      } else if (f.flujo === 'total') {
        nivel = v;
      }
      const x = Math.min(100, (desde / esc) * 100);
      const w = Math.max(0, Math.min(100 - x, ((hasta - desde) / esc) * 100));
      return { ...f, x, w, parte: v / esc };
    });
    return { ...bloque, filas };
  });
  const totalFilas = bloques.reduce((n, bloque) => n + bloque.filas.length, 0);

  return (
    <Figure
      id="03"
      title="El desglose completo, eslabón a eslabón"
      sub={`${anio} · ${esAutonomo ? 'régimen de autónomos' : 'asalariado'} · cada bloque usa una escala común y cada resta ocupa exactamente el intervalo que descuenta`}
      legend="Barra llena = dinero · barra rayada = lo que se descuenta del nivel anterior · barra de trazos = magnitud de cálculo, no una salida de dinero · el hilo vertical enlaza el final de una barra con el principio de la siguiente"
      source="Fuente · BOE (LIRPF y RIRPF) · TGSS · AEAT"
      summary={bloques
        .flatMap(b => b.filas)
        .map(f => `${f.label}: ${eur(f.valor)}`)
        .join('. ')}
    >
      <div className="fs-ledger-summary">
        <div>
          <span className="fs-stamp">Libro de cálculo · {totalFilas} operaciones</span>
          <p>
            De <strong>{eur(nomina.costeLab)}</strong> de coste laboral a{' '}
            <strong>{eur(nomina.salarioNeto)}</strong> de renta neta. Cada fila conserva su fórmula,
            explicación y fuente cuando existe.
          </p>
        </div>
        <button
          type="button"
          className="fs-btn fs-btn-quiet"
          onClick={() => setAbierto(actual => (actual === 'all' ? null : 'all'))}
        >
          {abierto === 'all' ? 'Contraer explicaciones' : 'Desplegar todo'}
        </button>
      </div>

      <div className="fs-desglose">
        {dibujo.map(bloque => (
          <section key={bloque.titulo} className="fs-dbloque">
            <header className="fs-dbloque-head">
              <h4 className="fs-dbloque-t">{bloque.titulo}</h4>
              {bloque.intro && <p className="fs-dbloque-i">{bloque.intro}</p>}
            </header>

            <div className="fs-descala" aria-hidden="true">
              <span className="fs-descala-0">0 €</span>
              <span className="fs-descala-linea" />
              <span className="fs-descala-max">
                {eur(bloque.escala)} <span className="fs-descala-q">· {bloque.escalaLabel}</span>
              </span>
            </div>

            <ol className="fs-dlista">
              {bloque.filas.map(f => {
                const open = abierto === 'all' || abierto === f.k;
                const hayBarra = f.w > 0.02;
                return (
                  <li
                    key={f.k}
                    className={[
                      'fs-dfila',
                      f.tipo === 'hito' ? 'is-hito' : 'is-op',
                      `is-f-${f.flujo}`,
                      f.total ? 'is-total' : '',
                      open ? 'is-open' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <button
                      type="button"
                      className="fs-dfila-head"
                      aria-expanded={open}
                      onClick={() => setAbierto(abierto === 'all' ? f.k : open ? null : f.k)}
                    >
                      <span className="fs-dfila-k">{f.k}</span>

                      <span className="fs-dfila-main">
                        <span className="fs-dfila-label">{f.label}</span>
                        <span className="fs-dfila-sub">{f.sub}</span>
                      </span>

                      <span className={`fs-dfila-v ${f.valor < 0 ? 'is-neg' : ''}`}>
                        {f.valor < 0
                          ? `− ${eur(Math.abs(f.valor))}`
                          : f.suma
                            ? `+ ${eur(f.valor)}`
                            : eur(Math.abs(f.valor))}
                      </span>

                      <span className="fs-dfila-track">
                        {hayBarra ? (
                          <span
                            className={`fs-dfila-bar ${f.hueco ? 'is-hueca' : ''}`}
                            style={{ '--x': `${f.x}%`, '--w': `${f.w}%` }}
                          />
                        ) : (
                          <span className="fs-dfila-cero">sin importe en este año</span>
                        )}
                      </span>
                    </button>

                    {open && (
                      <div className="fs-dfila-body">
                        <p className="fs-note" style={{ maxWidth: '68ch' }}>{f.texto}</p>
                        {f.formula && <p className="fs-formula">{f.formula}</p>}

                        {/* Las operaciones, escritas una por línea con su
                            nombre delante: quien quiera comprobar el cálculo
                            puede seguirlo sin reconstruirlo de memoria. */}
                        {f.formulas && (
                          <div className="fs-formulas">
                            {f.formulas.map(([clave, expr], i) => (
                              <p key={i} className="fs-formula fs-formula-fila">
                                <span className="fs-formula-k">{clave}</span>
                                <span className="fs-formula-v">{expr}</span>
                              </p>
                            ))}
                          </div>
                        )}

                        {f.tabla && (
                          <div className="fs-table-scroll" style={{ marginTop: 12 }}>
                            <table className="fs-table is-apilable">
                              <thead>
                                <tr>
                                  {f.tabla.cabeceras.map(c => (
                                    <th key={c} scope="col">{c}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {f.tabla.filas.map((fila, i) => (
                                  <tr key={i}>
                                    {fila.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j} data-label={f.tabla.cabeceras[j]}>{c}</td>))}
                                  </tr>
                                ))}
                                {f.tabla.total && (
                                  <tr className="is-current">
                                    {f.tabla.total.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j} data-label={f.tabla.cabeceras[j]}>{c}</td>))}
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {f.remate && <p className="fs-dfila-remate">{f.remate}</p>}

                        {f.fuente && (
                          <p className="fs-source">
                            Fuente ·{' '}
                            <a href={f.fuente[1]} target="_blank" rel="noreferrer noopener">
                              {f.fuente[0]}
                            </a>
                          </p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </Figure>
  );
}

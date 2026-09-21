import { useMemo, useState } from 'react';
import { useFiscal } from '../state/fiscalContext';
import Figure from '../figures/Figure';
import { eur, pct } from '../utils/format';

const BOE = 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764&p=20260321&tn=1';
const TGSS = 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/36537';

/**
 * FIG. 03 — EL DESGLOSE COMPLETO.
 *
 * The calculation is a chain, so the figure is drawn as one: a spine runs down
 * the whole ledger, the milestones (`hito`) sit on it as nodes, and every
 * operation hangs off the milestone it modifies. Each row carries a bar drawn
 * to the same scale — labour cost — so the size of every step is comparable at
 * a glance, and rows that are not cash (the taxable base, the personal
 * minimum) are drawn hollow so they can never be mistaken for a deduction.
 */
export default function Desglose() {
  const { bruto, anio, pagas, nomina, params, opts } = useFiscal();
  const [abierto, setAbierto] = useState('J');

  const esAutonomo = nomina.regimen === 'autonomo';
  const escala = Math.max(nomina.costeLab, 1);

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

  const bloques = [
    {
      titulo: 'Lo que cuesta tu puesto',
      intro: 'La nómina no empieza en tu bruto: empieza más arriba.',
      filas: [
        {
          tipo: 'hito', k: 'A', label: 'Coste laboral total', valor: nomina.costeLab,
          sub: 'Lo que tu empresa desembolsa por ti',
          formula: `${eur(bruto)} + ${eur(nomina.cotEmp)} = ${eur(nomina.costeLab)}`,
          texto: esAutonomo
            ? 'En el régimen de autónomos no existe parte empresarial: el coste de tu actividad coincide con tu rendimiento íntegro.'
            : 'Tu salario bruto más la cotización que la empresa ingresa a la Seguridad Social. Es el precio real de tu puesto de trabajo.',
          fuente: ['TGSS — Bases y tipos de cotización', TGSS],
        },
        {
          tipo: 'op', k: 'B', label: esAutonomo ? 'Sin cotización patronal' : 'Cotización de la empresa',
          valor: -nomina.cotEmp,
          sub: esAutonomo ? 'No aplica en el RETA' : `${pct(params.tipoEmp * 100, 2)} de la base de cotización`,
          formula: esAutonomo ? null : `mín(${eur(bruto)}, ${eur(params.baseMax)}) × ${pct(params.tipoEmp * 100, 2)} = ${eur(nomina.cotEmp)}`,
          texto: esAutonomo
            ? 'Como autónomo asumes íntegramente tu cotización; no hay contraparte empresarial.'
            : `Contingencias comunes (23,60 %), desempleo (5,50 %), FOGASA (0,20 %), formación profesional (0,60 %) y accidentes de trabajo (1,50 %)${params.mei[0] > 0 ? `, más el MEI (${pct(params.mei[0] * 100, 2)})` : ''}. No aparece en tu recibo de nómina.`,
          fuente: ['TGSS — Cotización', TGSS],
        },
        {
          tipo: 'hito', k: 'C', label: 'Salario bruto anual', valor: bruto,
          sub: 'La cifra de tu contrato',
          formula: `${eur(bruto)} ÷ 12 = ${eur(bruto / 12)} · ÷ 14 = ${eur(bruto / 14)}`,
          texto: 'Lo único que negocias y lo único que la mayoría llama «su sueldo». Todo lo que viene después se descuenta de aquí.',
        },
      ],
    },
    {
      titulo: 'Lo que se descuenta en la nómina',
      intro: 'La Seguridad Social se va antes que el IRPF.',
      filas: [
        {
          tipo: 'op', k: 'D', label: esAutonomo ? 'Cuota de autónomos' : 'Cotización del trabajador',
          valor: -nomina.cotTra,
          sub: esAutonomo ? 'Según el tramo de rendimientos netos' : `${pct(params.tipoTra * 100, 2)} de la base de cotización`,
          formula: esAutonomo
            ? `Base del tramo × 12 × tipo combinado = ${eur(nomina.cotTra)}`
            : `mín(${eur(bruto)}, ${eur(params.baseMax)}) × ${pct(params.tipoTra * 100, 2)} = ${eur(nomina.cotTra)}`,
          texto: esAutonomo
            ? 'Desde 2023 la cuota depende de los rendimientos netos previstos, repartidos en quince tramos (RDL 13/2022).'
            : `Contingencias comunes (4,70 %), desempleo (1,55 %), formación profesional (0,10 %)${params.mei[1] > 0 ? ` y MEI (${pct(params.mei[1] * 100, 2)})` : ''}. La base está topada en ${eur(params.baseMax)}: por encima de ese salario la cotización deja de crecer.`,
          fuente: ['TGSS — Bases y tipos de cotización', TGSS],
        },
        {
          tipo: 'hito', k: 'E', label: 'Rendimiento íntegro del trabajo', valor: nomina.rnPrevio,
          sub: 'El punto de partida del IRPF',
          formula: `${eur(bruto)} − ${eur(nomina.cotTra)} = ${eur(nomina.rnPrevio)}`,
          texto: 'Hacienda no grava lo que ya se ha ido en cotizaciones.',
          fuente: ['BOE — LIRPF art. 19', `${BOE}#a19`],
        },
      ],
    },
    {
      titulo: 'Lo que Hacienda acaba gravando',
      intro: 'Dos restas que no son dinero que se vaya: reducen la cifra sobre la que se calcula el impuesto.',
      filas: [
        {
          tipo: 'op', k: 'F', label: 'Gastos deducibles del art. 19.2.f', valor: -nomina.gastosFijos,
          sub: anio >= 2015 ? 'Los 2.000 € de «otros gastos»' : 'No existían antes de 2015',
          formula: anio >= 2015 ? `${eur(nomina.rnPrevio)} − ${eur(nomina.gastosFijos)}` : null,
          texto: anio >= 2015
            ? 'Cantidad fija que se resta sin justificarla, para compensar los gastos que conlleva trabajar. La creó la reforma de 2015.'
            : 'No existía: la Ley 26/2014 la introdujo con efectos desde 2015.',
          fuente: ['BOE — LIRPF art. 19.2.f', `${BOE}#a19`],
        },
        {
          tipo: 'op', k: 'G', label: 'Reducción por rendimientos del trabajo', valor: -nomina.redTrabajo,
          sub: 'Art. 20 — la palanca que protege a las rentas bajas',
          formula: typeof params.art20Meta.uInf === 'number'
            ? `Máxima ${eur(params.art20Meta.rMax)} hasta ${eur(params.art20Meta.uInf)} · cero desde ${eur(params.art20Meta.uSup)}`
            : 'Régimen transitorio: media entre la redacción de 2017 y la de 2019',
          texto: nomina.redTrabajo > 0
            ? `A tu nivel de renta la reducción es de ${eur(nomina.redTrabajo)}. Se retira progresivamente al subir el rendimiento, y esa retirada es el acantilado del capítulo 03.`
            : 'A tu nivel de renta esta reducción ya se ha agotado: sólo actúa por debajo del umbral superior del art. 20.',
          fuente: ['BOE — LIRPF art. 20', `${BOE}#a20`],
        },
        ...(nomina.reduccionConjunta > 0
          ? [{
              tipo: 'op', k: 'G2', label: 'Reducción por tributación conjunta', valor: -nomina.reduccionConjunta,
              sub: 'Unidad familiar',
              formula: `${eur(nomina.reduccionConjunta)}`,
              texto: 'Reducción adicional por declarar de forma conjunta, limitada al rendimiento neto disponible.',
              fuente: ['BOE — LIRPF art. 84', `${BOE}#a84`],
            }]
          : []),
        {
          tipo: 'hito', k: 'H', label: 'Base imponible', valor: nomina.baseImponible, hueco: true,
          sub: 'No es dinero que se te descuente: es la cifra sobre la que se aplica la escala',
          formula: `${eur(nomina.rnPrevio)} − ${eur(nomina.gastosFijos)} − ${eur(nomina.redTrabajo)}${nomina.reduccionConjunta > 0 ? ` − ${eur(nomina.reduccionConjunta)}` : ''} = ${eur(nomina.baseImponible)}`,
          texto: `Queda ${eur(bruto - nomina.baseImponible)} por debajo de tu bruto. Se dibuja hueca porque no es una salida de dinero, sino la magnitud que se grava.`,
        },
      ],
    },
    {
      titulo: 'Lo que sale de aplicar la escala',
      intro: 'Aquí está la progresividad: cada tramo grava sólo la parte de base que cae dentro de él.',
      filas: [
        {
          tipo: 'op', k: 'J', label: 'Cuota íntegra por tramos', valor: nomina.cuotaIntegra, suma: true,
          sub: `${tramos.length} tramo${tramos.length > 1 ? 's' : ''} aplicados sobre ${eur(nomina.baseImponible)}`,
          formula: tramos.map(t => `${eur(t.dentro)} × ${pct(t.tipo * 100)}`).join('  +  ') + ` = ${eur(nomina.cuotaIntegra)}`,
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
          tipo: 'op', k: 'I', label: 'Mínimo personal y familiar', valor: nomina.minimoPersonalYFamiliar, hueco: true,
          sub: 'La renta vital que no tributa — se convierte en cuota y se resta',
          formula: `${eur(nomina.minimoPersonal)} personal${nomina.minimoFamiliar > 0 ? ` + ${eur(nomina.minimoFamiliar)} familiar` : ''} = ${eur(nomina.minimoPersonalYFamiliar)}`,
          texto: `No se resta de la base: se le aplica la misma escala y la cuota resultante se descuenta después. Por eso todos se benefician de la misma cantidad, gane lo que gane cada uno.${opts.nHijos > 0 ? ` Tus ${opts.nHijos} hijo${opts.nHijos > 1 ? 's' : ''} a cargo aportan ${eur(nomina.minimoFamiliar)}.` : ''}`,
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
          tipo: 'op', k: 'K', label: 'Cuota del mínimo personal y familiar', valor: -nomina.cuotaMinimo,
          sub: 'Se resta de la cuota, no de la base',
          formula: `${eur(nomina.cuotaIntegra)} − ${eur(nomina.cuotaMinimo)} = ${eur(nomina.cuotaTeorica)}`,
          texto: `La misma escala aplicada a ${eur(nomina.minimoPersonalYFamiliar)} produce ${eur(nomina.cuotaMinimo)}.`,
          fuente: ['BOE — LIRPF art. 63', `${BOE}#a63`],
        },
        ...(nomina.deduccionSMI > 0
          ? [{
              tipo: 'op', k: 'L', label: 'Deducción por rendimientos del trabajo', valor: -nomina.deduccionSMI,
              sub: 'El descuento extra para salarios próximos al SMI',
              formula: `${eur(nomina.cuotaTeorica)} − ${eur(nomina.deduccionSMI)} = ${eur(nomina.cuotaSMI)}`,
              texto: 'Deducción directa en cuota que se retira progresivamente a medida que el salario se aleja del mínimo interprofesional.',
              fuente: [
                'AEAT — Deducción por obtención de rendimientos del trabajo',
                'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/c18-cuota-liquida-resultante-autoliquidacion/deducciones-cuota-liquida-total/deduccion-obtencion-rendimientos-trabajo.html',
              ],
            }]
          : []),
        ...(limiteActivo
          ? [{
              tipo: 'op', k: 'M', label: 'Límite del 43 % de retención', valor: nomina.limiteRetencion, hueco: true,
              sub: 'Un tope reglamentario que en tu caso manda sobre el cálculo',
              formula: `(${eur(bruto)} − ${eur(params.minimoExento)}) × 43 % = ${eur(nomina.limiteRetencion)}`,
              texto: 'La retención no puede superar el 43 % de la diferencia entre el bruto y el mínimo exento de retención. Ese tope es menor que la cuota calculada, así que es el que se aplica.',
              fuente: ['BOE — RIRPF art. 85.3', 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-6820'],
            }]
          : []),
        {
          tipo: 'hito', k: 'N', label: 'IRPF final', valor: nomina.irpfFinal,
          sub: `Tipo efectivo ${pct(nomina.tipoEfectivoIRPF * 100)} sobre el bruto`,
          formula: `${eur(nomina.irpfFinal)} ÷ ${eur(bruto)} = ${pct(nomina.tipoEfectivoIRPF * 100)}`,
          texto: 'Lo que Hacienda retiene a lo largo del año. La declaración ajusta después esta cifra con el resto de tu situación fiscal.',
        },
      ],
    },
    {
      titulo: 'Lo que queda',
      intro: null,
      filas: [
        {
          tipo: 'hito', k: 'O', label: 'Renta neta', valor: nomina.salarioNeto, total: true,
          sub: `${eur(nomina.salarioNeto / pagas)} al mes en ${pagas} pagas`,
          formula: `${eur(bruto)} − ${eur(nomina.cotTra)} − ${eur(nomina.irpfFinal)} = ${eur(nomina.salarioNeto)}`,
          texto: `De los ${eur(nomina.costeLab)} que costó tu trabajo llegan ${eur(nomina.salarioNeto)}: ${pct((nomina.salarioNeto / escala) * 100)} del total.`,
        },
      ],
    },
  ];

  return (
    <Figure
      id="03"
      title="El desglose completo, eslabón a eslabón"
      sub={`${anio} · ${esAutonomo ? 'régimen de autónomos' : 'asalariado'} · las barras están todas a la misma escala, la del coste laboral`}
      legend="Los hitos van sobre la línea · las operaciones cuelgan del hito al que afectan · barra llena = dinero · barra hueca = magnitud de cálculo, no una salida de dinero"
      source="Fuente · BOE (LIRPF y RIRPF) · TGSS · AEAT"
      summary={bloques
        .flatMap(b => b.filas)
        .map(f => `${f.label}: ${eur(f.valor)}`)
        .join('. ')}
    >
      <div className="fs-desglose">
        {bloques.map(bloque => (
          <section key={bloque.titulo} className="fs-dbloque">
            <header className="fs-dbloque-head">
              <h4 className="fs-dbloque-t">{bloque.titulo}</h4>
              {bloque.intro && <p className="fs-dbloque-i">{bloque.intro}</p>}
            </header>

            <ol className="fs-dlista">
              {bloque.filas.map(f => {
                const open = abierto === f.k;
                const ancho = Math.min(100, (Math.abs(f.valor) / escala) * 100);
                return (
                  <li
                    key={f.k}
                    className={[
                      'fs-dfila',
                      f.tipo === 'hito' ? 'is-hito' : 'is-op',
                      f.total ? 'is-total' : '',
                      open ? 'is-open' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <button
                      type="button"
                      className="fs-dfila-head"
                      aria-expanded={open}
                      onClick={() => setAbierto(open ? null : f.k)}
                    >
                      <span className="fs-dfila-k">{f.k}</span>

                      <span className="fs-dfila-main">
                        <span className="fs-dfila-label">{f.label}</span>
                        <span className="fs-dfila-sub">{f.sub}</span>
                        <span
                          className={`fs-dfila-bar ${f.hueco ? 'is-hueca' : ''} ${f.valor < 0 ? 'is-resta' : ''}`}
                          style={{ '--w': `${ancho}%` }}
                          aria-hidden="true"
                        />
                      </span>

                      <span className={`fs-dfila-v ${f.valor < 0 ? 'is-neg' : ''}`}>
                        {f.valor < 0 ? `− ${eur(Math.abs(f.valor))}` : f.suma ? `+ ${eur(f.valor)}` : eur(f.valor)}
                      </span>
                    </button>

                    {open && (
                      <div className="fs-dfila-body">
                        <p className="fs-note" style={{ maxWidth: '68ch' }}>{f.texto}</p>
                        {f.formula && <p className="fs-formula">{f.formula}</p>}

                        {f.tabla && (
                          <div className="fs-table-scroll" style={{ marginTop: 12 }}>
                            <table className="fs-table">
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
                                    {fila.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}
                                  </tr>
                                ))}
                                {f.tabla.total && (
                                  <tr className="is-current">
                                    {f.tabla.total.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

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
